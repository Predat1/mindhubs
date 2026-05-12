-- ==========================================================
-- MISSION 1 : SCHÉMA DB COMPLET (Subscription & Credit System)
-- ==========================================================

-- 1. ENUM des plans
DO $$ BEGIN
    CREATE TYPE public.vendor_plan AS ENUM ('free', 'starter', 'pro', 'elite');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- 2. Table subscriptions (source de vérité)
CREATE TABLE IF NOT EXISTS public.vendor_subscriptions (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  vendor_id        UUID NOT NULL UNIQUE REFERENCES public.vendors(id) ON DELETE CASCADE,
  plan             vendor_plan NOT NULL DEFAULT 'free',
  status           TEXT NOT NULL DEFAULT 'active'
                   CHECK (status IN ('active','past_due','cancelled','trialing')),
  current_period_start  TIMESTAMPTZ NOT NULL DEFAULT now(),
  current_period_end    TIMESTAMPTZ,           -- NULL = mensuel en cours
  cancel_at_period_end  BOOLEAN NOT NULL DEFAULT false,
  payment_method   TEXT DEFAULT 'mobile_money',
  payment_reference TEXT,                      -- réf Orange Money / Wave
  amount_paid_fcfa INTEGER NOT NULL DEFAULT 0,
  created_at       TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at       TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 3. Table credits (solde réel, jamais fictif)
CREATE TABLE IF NOT EXISTS public.vendor_credits (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  vendor_id     UUID NOT NULL UNIQUE REFERENCES public.vendors(id) ON DELETE CASCADE,
  balance       INTEGER NOT NULL DEFAULT 0 CHECK (balance >= 0),
  total_earned  INTEGER NOT NULL DEFAULT 0,  -- cumulatif lifetime
  total_spent   INTEGER NOT NULL DEFAULT 0,  -- cumulatif lifetime
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 4. Table historique transactions crédits
CREATE TABLE IF NOT EXISTS public.credit_transactions (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  vendor_id    UUID NOT NULL REFERENCES public.vendors(id) ON DELETE CASCADE,
  type         TEXT NOT NULL
               CHECK (type IN ('monthly_grant','purchase','spend','bonus','refund','rollover')),
  amount       INTEGER NOT NULL,             -- positif = crédit, négatif = débit
  balance_after INTEGER NOT NULL,
  description  TEXT NOT NULL,               -- ex: "Génération chapitre: Guide Fiscal CI"
  feature_type TEXT,                        -- 'spy-research'|'validate'|'plan'|...
  cost_usd_cents INTEGER DEFAULT 0,         -- coût IA réel en centimes USD
  created_at   TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_credit_tx_vendor ON public.credit_transactions(vendor_id, created_at DESC);

-- 5. Limites par plan (table de configuration)
CREATE TABLE IF NOT EXISTS public.plan_limits (
  plan                vendor_plan PRIMARY KEY,
  max_products        INTEGER NOT NULL,        -- -1 = illimité
  monthly_credits     INTEGER NOT NULL,
  commission_rate     NUMERIC(4,3) NOT NULL,   -- 0.10 = 10%
  price_fcfa_monthly  INTEGER NOT NULL,
  price_fcfa_yearly   INTEGER NOT NULL,
  ads_studio          BOOLEAN NOT NULL DEFAULT false,
  creator_lab_full    BOOLEAN NOT NULL DEFAULT false,
  priority_placement  BOOLEAN NOT NULL DEFAULT false,
  whatsapp_support    BOOLEAN NOT NULL DEFAULT false,
  badge               TEXT                     -- NULL | 'Vendeur Pro' | 'Vendeur Elite'
);

-- Insertion / Mise à jour des limites (valeurs corrigées)
INSERT INTO public.plan_limits (plan, max_products, monthly_credits, commission_rate, price_fcfa_monthly, price_fcfa_yearly, ads_studio, creator_lab_full, priority_placement, whatsapp_support, badge)
VALUES
  ('free',    1,    50,   0.10, 0,      0,       false, false, false, false, NULL),
  ('starter', 3,    200,  0.10, 4900,   49000,   false, false, false, false, NULL),
  ('pro',     20,   800,  0.07, 14900,  149000,  true,  true,  false, false, 'Vendeur Pro'),
  ('elite',   -1,   2500, 0.05, 29900,  299000,  true,  true,  true,  true,  'Vendeur Elite')
ON CONFLICT (plan) DO UPDATE SET
  max_products = EXCLUDED.max_products,
  monthly_credits = EXCLUDED.monthly_credits,
  commission_rate = EXCLUDED.commission_rate,
  price_fcfa_monthly = EXCLUDED.price_fcfa_monthly,
  price_fcfa_yearly = EXCLUDED.price_fcfa_yearly,
  ads_studio = EXCLUDED.ads_studio,
  creator_lab_full = EXCLUDED.creator_lab_full,
  priority_placement = EXCLUDED.priority_placement,
  whatsapp_support = EXCLUDED.whatsapp_support,
  badge = EXCLUDED.badge;

-- 6. RLS sur toutes les nouvelles tables
ALTER TABLE public.vendor_subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.vendor_credits ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.credit_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.plan_limits ENABLE ROW LEVEL SECURITY;

-- vendor_subscriptions
DROP POLICY IF EXISTS "Vendors read own subscription" ON public.vendor_subscriptions;
CREATE POLICY "Vendors read own subscription"
  ON public.vendor_subscriptions FOR SELECT TO authenticated
  USING (vendor_id IN (SELECT id FROM vendors WHERE user_id = auth.uid()));

DROP POLICY IF EXISTS "Admins manage subscriptions" ON public.vendor_subscriptions;
CREATE POLICY "Admins manage subscriptions"
  ON public.vendor_subscriptions FOR ALL TO authenticated
  USING (EXISTS (SELECT 1 FROM user_roles WHERE user_id = auth.uid() AND role = 'admin'));

-- vendor_credits
DROP POLICY IF EXISTS "Vendors read own credits" ON public.vendor_credits;
CREATE POLICY "Vendors read own credits"
  ON public.vendor_credits FOR SELECT TO authenticated
  USING (vendor_id IN (SELECT id FROM vendors WHERE user_id = auth.uid()));

DROP POLICY IF EXISTS "Admins manage credits" ON public.vendor_credits;
CREATE POLICY "Admins manage credits"
  ON public.vendor_credits FOR ALL TO authenticated
  USING (EXISTS (SELECT 1 FROM user_roles WHERE user_id = auth.uid() AND role = 'admin'));

-- credit_transactions
DROP POLICY IF EXISTS "Vendors read own transactions" ON public.credit_transactions;
CREATE POLICY "Vendors read own transactions"
  ON public.credit_transactions FOR SELECT TO authenticated
  USING (vendor_id IN (SELECT id FROM vendors WHERE user_id = auth.uid()));

-- plan_limits : public en lecture seule
DROP POLICY IF EXISTS "Plan limits are public" ON public.plan_limits;
CREATE POLICY "Plan limits are public" ON public.plan_limits
  FOR SELECT USING (true);

-- 7. Fonction SQL sécurisée pour dépenser des crédits (atomique, anti-race)
CREATE OR REPLACE FUNCTION public.spend_credits(
  p_vendor_id  UUID,
  p_amount     INTEGER,
  p_description TEXT,
  p_feature_type TEXT DEFAULT NULL,
  p_cost_usd_cents INTEGER DEFAULT 0
) RETURNS JSONB
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public
AS $$
DECLARE
  v_balance   INTEGER;
  v_new_balance INTEGER;
BEGIN
  -- Lock the row to prevent concurrent double-spending
  SELECT balance INTO v_balance FROM vendor_credits
  WHERE vendor_id = p_vendor_id FOR UPDATE;

  IF v_balance IS NULL THEN
    -- Auto-init if missing
    INSERT INTO vendor_credits (vendor_id, balance) VALUES (p_vendor_id, 0) RETURNING balance INTO v_balance;
  END IF;

  IF v_balance < p_amount THEN
    RETURN jsonb_build_object('success', false, 'error', 'Crédits insuffisants',
                              'balance', v_balance, 'required', p_amount);
  END IF;

  v_new_balance := v_balance - p_amount;

  UPDATE vendor_credits
  SET balance = v_new_balance,
      total_spent = total_spent + p_amount,
      updated_at = now()
  WHERE vendor_id = p_vendor_id;

  INSERT INTO credit_transactions
    (vendor_id, type, amount, balance_after, description, feature_type, cost_usd_cents)
  VALUES
    (p_vendor_id, 'spend', -p_amount, v_new_balance, p_description, p_feature_type, p_cost_usd_cents);

  RETURN jsonb_build_object('success', true, 'balance', v_new_balance, 'spent', p_amount);
END;
$$;

-- 8. Fonction grant crédits mensuels
CREATE OR REPLACE FUNCTION public.grant_monthly_credits(p_vendor_id UUID)
RETURNS VOID
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  v_plan    vendor_plan;
  v_credits INTEGER;
  v_rollover INTEGER;
  v_current INTEGER;
BEGIN
  SELECT vs.plan INTO v_plan FROM vendor_subscriptions vs WHERE vs.vendor_id = p_vendor_id;
  SELECT pl.monthly_credits INTO v_credits FROM plan_limits pl WHERE pl.plan = v_plan;
  SELECT vc.balance INTO v_current FROM vendor_credits vc WHERE vc.vendor_id = p_vendor_id;

  IF v_credits IS NULL THEN v_credits := 50; END IF; -- default free

  -- Rollover 30% des crédits restants (plafonné à 50% des crédits mensuels)
  v_rollover := LEAST(FLOOR(COALESCE(v_current, 0) * 0.30), FLOOR(v_credits * 0.50));

  INSERT INTO vendor_credits (vendor_id, balance, total_earned)
  VALUES (p_vendor_id, v_credits + v_rollover, v_credits)
  ON CONFLICT (vendor_id) DO UPDATE SET
      balance = v_credits + v_rollover,
      total_earned = vendor_credits.total_earned + v_credits,
      updated_at = now();

  INSERT INTO credit_transactions
    (vendor_id, type, amount, balance_after, description)
  VALUES
    (p_vendor_id, 'monthly_grant', v_credits, v_credits + v_rollover,
     'Crédits mensuels ' || COALESCE(v_plan::text, 'free') || ' + ' || v_rollover || ' rollover');
END;
$$;

-- 9. Bloquer ajout produit si limite atteinte (trigger)
CREATE OR REPLACE FUNCTION public.check_product_limit()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  v_vendor_id UUID;
  v_plan      vendor_plan;
  v_max       INTEGER;
  v_count     INTEGER;
BEGIN
  v_vendor_id := NEW.vendor_id;

  SELECT COALESCE(vs.plan, 'free'::vendor_plan)
  INTO v_plan
  FROM vendors v
  LEFT JOIN vendor_subscriptions vs ON vs.vendor_id = v.id
  WHERE v.id = v_vendor_id;

  SELECT pl.max_products INTO v_max FROM plan_limits pl WHERE pl.plan = v_plan;

  IF v_max = -1 THEN RETURN NEW; END IF; -- illimité (Elite)

  SELECT COUNT(*) INTO v_count FROM products
  WHERE vendor_id = v_vendor_id AND status != 'archived';

  IF v_count >= v_max THEN
    RAISE EXCEPTION 'PLAN_LIMIT_REACHED: Votre plan % permet max % produits. Passez au plan supérieur.',
      v_plan, v_max;
  END IF;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS enforce_product_limit ON public.products;
CREATE TRIGGER enforce_product_limit
  BEFORE INSERT ON public.products
  FOR EACH ROW EXECUTE FUNCTION public.check_product_limit();

-- 10. Vue pratique pour le dashboard vendeur
CREATE OR REPLACE VIEW public.vendor_subscription_view AS
SELECT
  v.id AS vendor_id,
  v.user_id,
  COALESCE(vs.plan, 'free'::vendor_plan) AS plan,
  COALESCE(vs.status, 'active') AS status,
  COALESCE(vc.balance, 0) AS credit_balance,
  pl.max_products,
  pl.monthly_credits,
  pl.commission_rate,
  pl.price_fcfa_monthly,
  pl.price_fcfa_yearly,
  pl.ads_studio,
  pl.creator_lab_full,
  pl.priority_placement,
  pl.whatsapp_support,
  pl.badge,
  (SELECT COUNT(*) FROM products p
   WHERE p.vendor_id = v.id AND p.status != 'archived') AS product_count
FROM vendors v
LEFT JOIN vendor_subscriptions vs ON vs.vendor_id = v.id
LEFT JOIN vendor_credits vc ON vc.vendor_id = v.id
LEFT JOIN plan_limits pl ON pl.plan = COALESCE(vs.plan, 'free');

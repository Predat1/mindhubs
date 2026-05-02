-- 1. ENUM des plans (Source de vérité pour la hiérarchie)
DO $$ BEGIN
    CREATE TYPE public.vendor_plan AS ENUM ('free', 'starter', 'pro', 'elite');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- 2. Table plan_limits : Configuration dynamique des offres
-- WHY: Permet de modifier les tarifs et limites sans changer une seule ligne de code React.
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

-- Insertion des données de référence (Mise à jour avec stratégie Ads Studio)
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

-- 3. Table vendor_subscriptions : Etat de l'abonnement
CREATE TABLE IF NOT EXISTS public.vendor_subscriptions (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  vendor_id        UUID NOT NULL UNIQUE REFERENCES public.vendors(id) ON DELETE CASCADE,
  plan             vendor_plan NOT NULL DEFAULT 'free',
  status           TEXT NOT NULL DEFAULT 'active' 
                   CHECK (status IN ('active','past_due','cancelled','trialing')),
  current_period_start  TIMESTAMPTZ NOT NULL DEFAULT now(),
  current_period_end    TIMESTAMPTZ,
  cancel_at_period_end  BOOLEAN NOT NULL DEFAULT false,
  payment_method   TEXT DEFAULT 'mobile_money',
  payment_reference TEXT,
  amount_paid_fcfa INTEGER NOT NULL DEFAULT 0,
  created_at       TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at       TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 4. Table vendor_credits : Portefeuille de crédits IA
CREATE TABLE IF NOT EXISTS public.vendor_credits (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  vendor_id     UUID NOT NULL UNIQUE REFERENCES public.vendors(id) ON DELETE CASCADE,
  balance       INTEGER NOT NULL DEFAULT 0 CHECK (balance >= 0),
  total_earned  INTEGER NOT NULL DEFAULT 0,
  total_spent   INTEGER NOT NULL DEFAULT 0,
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 5. Table credit_transactions : Audit trail complet
CREATE TABLE IF NOT EXISTS public.credit_transactions (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  vendor_id    UUID NOT NULL REFERENCES public.vendors(id) ON DELETE CASCADE,
  type         TEXT NOT NULL 
               CHECK (type IN ('monthly_grant','purchase','spend','bonus','refund','rollover')),
  amount       INTEGER NOT NULL,             -- positif = crédit, négatif = débit
  balance_after INTEGER NOT NULL,
  description  TEXT NOT NULL,
  feature_type TEXT,                        -- 'spy-research', 'ad-creative', etc.
  cost_usd_cents INTEGER DEFAULT 0,         -- Coût OpenRouter/Lovable réel
  created_at   TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_credit_tx_vendor ON public.credit_transactions(vendor_id, created_at DESC);

-- 6. RLS & Sécurité
ALTER TABLE public.vendor_subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.vendor_credits ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.credit_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.plan_limits ENABLE ROW LEVEL SECURITY;

-- Politiques de lecture
CREATE POLICY "Vendors read own subscription" ON public.vendor_subscriptions FOR SELECT TO authenticated
  USING (vendor_id IN (SELECT id FROM vendors WHERE user_id = auth.uid()));

CREATE POLICY "Vendors read own credits" ON public.vendor_credits FOR SELECT TO authenticated
  USING (vendor_id IN (SELECT id FROM vendors WHERE user_id = auth.uid()));

CREATE POLICY "Vendors read own transactions" ON public.credit_transactions FOR SELECT TO authenticated
  USING (vendor_id IN (SELECT id FROM vendors WHERE user_id = auth.uid()));

CREATE POLICY "Plan limits are public" ON public.plan_limits FOR SELECT USING (true);

-- 7. Fonction spend_credits : Atomique et sécurisée
-- WHY: Évite les double-dépenses (race conditions) en utilisant SELECT FOR UPDATE.
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
  -- Lock de la ligne pour l'atomicité
  SELECT balance INTO v_balance FROM vendor_credits
  WHERE vendor_id = p_vendor_id FOR UPDATE;

  IF v_balance IS NULL THEN
    -- Initialisation si absent (normalement géré à la création du vendeur)
    INSERT INTO vendor_credits (vendor_id, balance) VALUES (p_vendor_id, 0);
    v_balance := 0;
  END IF;

  IF v_balance < p_amount THEN
    RETURN jsonb_build_object('success', false, 'error', 'Insufficient credits', 'balance', v_balance, 'required', p_amount);
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

-- 8. Fonction grant_monthly_credits : Gestion des dotations périodiques
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
  SELECT pl.monthly_credits INTO v_credits FROM plan_limits pl WHERE pl.plan = COALESCE(v_plan, 'free');
  
  -- Récupération solde actuel pour rollover
  SELECT balance INTO v_current FROM vendor_credits WHERE vendor_id = p_vendor_id;
  IF v_current IS NULL THEN v_current := 0; END IF;

  -- Rollover stratégique : 30% des restants (capé à 50% du pack mensuel)
  v_rollover := LEAST(FLOOR(v_current * 0.30), FLOOR(v_credits * 0.50));

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
     'Dotation mensuelle ' || COALESCE(v_plan, 'free') || ' (incl. ' || v_rollover || ' rollover)');
END;
$$;

-- 9. Trigger check_product_limit : Protection contre l'abus du plan free/starter
CREATE OR REPLACE FUNCTION public.check_product_limit()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  v_vendor_id UUID;
  v_plan      vendor_plan;
  v_max       INTEGER;
  v_count     INTEGER;
BEGIN
  v_vendor_id := NEW.vendor_id;

  SELECT COALESCE(vs.plan, 'free') INTO v_plan
  FROM vendors v
  LEFT JOIN vendor_subscriptions vs ON vs.vendor_id = v.id
  WHERE v.id = v_vendor_id;

  SELECT pl.max_products INTO v_max FROM plan_limits pl WHERE pl.plan = v_plan;

  IF v_max = -1 THEN RETURN NEW; END IF; -- Plan Elite (Illimité)

  SELECT COUNT(*) INTO v_count FROM products
  WHERE vendor_id = v_vendor_id AND status != 'archived';

  IF v_count >= v_max THEN
    RAISE EXCEPTION 'PLAN_LIMIT_REACHED: Votre plan % limite à % produits.', v_plan, v_max;
  END IF;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS enforce_product_limit ON public.products;
CREATE TRIGGER enforce_product_limit
  BEFORE INSERT ON public.products
  FOR EACH ROW EXECUTE FUNCTION public.check_product_limit();

-- 10. Vue vendor_subscription_view : Simplification des accès frontend
CREATE OR REPLACE VIEW public.vendor_subscription_view AS
SELECT
  v.id AS vendor_id,
  v.user_id,
  v.shop_name,
  v.username,
  COALESCE(vs.plan, 'free'::vendor_plan) AS plan,
  COALESCE(vs.status, 'active') AS status,
  vs.current_period_end,
  vs.cancel_at_period_end,
  vs.amount_paid_fcfa,
  COALESCE(vc.balance, 0) AS credit_balance,
  pl.max_products,
  pl.monthly_credits,
  pl.commission_rate,
  pl.price_fcfa_monthly,
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

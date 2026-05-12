-- ==========================================================
-- FIX: check_product_limit — bypass admin + NULL vendor_id
-- ==========================================================

CREATE OR REPLACE FUNCTION public.check_product_limit()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  v_vendor_id UUID;
  v_plan      vendor_plan;
  v_max       INTEGER;
  v_count     INTEGER;
  v_email     TEXT;
BEGIN
  -- 1. Bypass si vendor_id est NULL (produit admin/plateforme)
  IF NEW.vendor_id IS NULL THEN
    RETURN NEW;
  END IF;

  -- 2. Bypass si l'utilisateur courant est admin (par email ou rôle)
  BEGIN
    SELECT email INTO v_email FROM auth.users WHERE id = auth.uid();
  EXCEPTION WHEN OTHERS THEN
    v_email := NULL;
  END;

  IF v_email = 'mobifranck94@gmail.com' THEN
    RETURN NEW;
  END IF;

  IF public.has_role(auth.uid(), 'admin'::app_role) THEN
    RETURN NEW;
  END IF;

  -- 3. Vérification normale de la limite pour les vendeurs
  v_vendor_id := NEW.vendor_id;

  SELECT COALESCE(vs.plan, 'free'::vendor_plan)
  INTO v_plan
  FROM vendors v
  LEFT JOIN vendor_subscriptions vs ON vs.vendor_id = v.id
  WHERE v.id = v_vendor_id;

  SELECT pl.max_products INTO v_max FROM plan_limits pl WHERE pl.plan = v_plan;

  IF v_max IS NULL OR v_max = -1 THEN RETURN NEW; END IF;

  SELECT COUNT(*) INTO v_count FROM products
  WHERE vendor_id = v_vendor_id AND status != 'archived';

  IF v_count >= v_max THEN
    RAISE EXCEPTION 'PLAN_LIMIT_REACHED: Votre plan % permet max % produits. Passez au plan supérieur.',
      v_plan, v_max;
  END IF;

  RETURN NEW;
END;
$$;

-- ==========================================================
-- Activer le plan elite illimité pour mobifranck94@gmail.com
-- ==========================================================

DO $$
DECLARE
  v_user_id  UUID;
  v_vendor_id UUID;
BEGIN
  SELECT id INTO v_user_id FROM auth.users WHERE email = 'mobifranck94@gmail.com';
  IF v_user_id IS NULL THEN RAISE NOTICE 'User not found'; RETURN; END IF;

  -- Créer le profil vendeur si inexistant
  INSERT INTO public.vendors (user_id, username, shop_name, verified)
  VALUES (v_user_id, 'mobifranck94', 'Boutique Admin', true)
  ON CONFLICT (user_id) DO UPDATE SET verified = true;

  SELECT id INTO v_vendor_id FROM public.vendors WHERE user_id = v_user_id;

  -- Forcer plan elite (illimité = -1 produits)
  INSERT INTO public.vendor_subscriptions (vendor_id, plan, status)
  VALUES (v_vendor_id, 'elite', 'active')
  ON CONFLICT (vendor_id) DO UPDATE SET plan = 'elite', status = 'active', updated_at = now();

  -- Crédits généreux
  INSERT INTO public.vendor_credits (vendor_id, balance, total_earned)
  VALUES (v_vendor_id, 999999, 999999)
  ON CONFLICT (vendor_id) DO UPDATE SET balance = 999999;

  -- Rôle admin
  INSERT INTO public.user_roles (user_id, role)
  VALUES (v_user_id, 'admin')
  ON CONFLICT (user_id, role) DO NOTHING;

  RAISE NOTICE 'Compte mobifranck94 configuré en Elite illimité.';
END $$;

-- MindHubs: remove the legacy subscription/credits module from the new project.
-- Commerce, seller payouts, products and marketplace publications remain intact.

CREATE OR REPLACE FUNCTION public.initialize_vendor_onboarding(
  p_shop_name TEXT,
  p_username TEXT
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_user_id UUID := auth.uid();
  v_vendor_id UUID;
BEGIN
  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'auth_required' USING ERRCODE = '42501';
  END IF;

  IF length(trim(p_shop_name)) < 2 OR length(trim(p_shop_name)) > 60 THEN
    RAISE EXCEPTION 'shop_name_invalid' USING ERRCODE = '22023';
  END IF;

  IF p_username !~ '^[a-z0-9-]{3,30}$' THEN
    RAISE EXCEPTION 'username_invalid' USING ERRCODE = '22023';
  END IF;

  SELECT id INTO v_vendor_id FROM public.vendors WHERE user_id = v_user_id;

  IF v_vendor_id IS NOT NULL THEN
    INSERT INTO public.user_roles (user_id, role)
    VALUES (v_user_id, 'vendor'::public.app_role)
    ON CONFLICT (user_id, role) DO NOTHING;
    RETURN v_vendor_id;
  END IF;

  IF EXISTS (SELECT 1 FROM public.vendors WHERE username = p_username AND user_id <> v_user_id) THEN
    RAISE EXCEPTION 'username_taken' USING ERRCODE = '23505';
  END IF;

  INSERT INTO public.vendors (user_id, shop_name, username)
  VALUES (v_user_id, trim(p_shop_name), p_username)
  RETURNING id INTO v_vendor_id;

  INSERT INTO public.user_roles (user_id, role)
  VALUES (v_user_id, 'vendor'::public.app_role)
  ON CONFLICT (user_id, role) DO NOTHING;

  RETURN v_vendor_id;
EXCEPTION
  WHEN unique_violation THEN
    RAISE EXCEPTION 'username_taken' USING ERRCODE = '23505';
END;
$$;

REVOKE ALL ON FUNCTION public.initialize_vendor_onboarding(TEXT, TEXT) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.initialize_vendor_onboarding(TEXT, TEXT) TO authenticated;

DROP TRIGGER IF EXISTS enforce_product_limit ON public.products;
DROP VIEW IF EXISTS public.vendor_subscription_view;
DROP FUNCTION IF EXISTS public.check_product_limit();
DROP FUNCTION IF EXISTS public.spend_credits(UUID, INTEGER, TEXT, TEXT, INTEGER);
DROP FUNCTION IF EXISTS public.spend_credits(UUID, INTEGER, TEXT, TEXT);
DROP FUNCTION IF EXISTS public.grant_monthly_credits(UUID);
DROP FUNCTION IF EXISTS public.grant_credits(UUID, INTEGER, TEXT, TEXT);

DROP TABLE IF EXISTS public.credit_transactions CASCADE;
DROP TABLE IF EXISTS public.vendor_credits CASCADE;
DROP TABLE IF EXISTS public.vendor_subscriptions CASCADE;
DROP TABLE IF EXISTS public.plan_limits CASCADE;
DROP TYPE IF EXISTS public.vendor_plan CASCADE;

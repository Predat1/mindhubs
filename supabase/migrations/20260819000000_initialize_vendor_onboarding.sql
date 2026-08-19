-- Atomic, idempotent seller activation for the public onboarding flow.
-- No existing seller, product, order or subscription data is removed.

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

  SELECT id INTO v_vendor_id
  FROM public.vendors
  WHERE user_id = v_user_id;

  -- Retries are safe: complete any missing initialization and return the existing seller.
  IF v_vendor_id IS NOT NULL THEN
    INSERT INTO public.user_roles (user_id, role)
    VALUES (v_user_id, 'vendor'::public.app_role)
    ON CONFLICT (user_id, role) DO NOTHING;

    INSERT INTO public.vendor_subscriptions (vendor_id, plan, status)
    VALUES (v_vendor_id, 'free'::public.vendor_plan, 'active')
    ON CONFLICT (vendor_id) DO NOTHING;

    INSERT INTO public.vendor_credits (vendor_id, balance)
    VALUES (v_vendor_id, 0)
    ON CONFLICT (vendor_id) DO NOTHING;

    RETURN v_vendor_id;
  END IF;

  IF EXISTS (
    SELECT 1 FROM public.vendors
    WHERE username = p_username AND user_id <> v_user_id
  ) THEN
    RAISE EXCEPTION 'username_taken' USING ERRCODE = '23505';
  END IF;

  INSERT INTO public.vendors (user_id, shop_name, username)
  VALUES (v_user_id, trim(p_shop_name), p_username)
  RETURNING id INTO v_vendor_id;

  INSERT INTO public.user_roles (user_id, role)
  VALUES (v_user_id, 'vendor'::public.app_role)
  ON CONFLICT (user_id, role) DO NOTHING;

  INSERT INTO public.vendor_subscriptions (vendor_id, plan, status)
  VALUES (v_vendor_id, 'free'::public.vendor_plan, 'active')
  ON CONFLICT (vendor_id) DO NOTHING;

  INSERT INTO public.vendor_credits (vendor_id, balance)
  VALUES (v_vendor_id, 0)
  ON CONFLICT (vendor_id) DO NOTHING;

  RETURN v_vendor_id;
EXCEPTION
  WHEN unique_violation THEN
    RAISE EXCEPTION 'username_taken' USING ERRCODE = '23505';
END;
$$;

REVOKE ALL ON FUNCTION public.initialize_vendor_onboarding(TEXT, TEXT) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.initialize_vendor_onboarding(TEXT, TEXT) TO authenticated;

-- ==========================================================
-- FIX: Admin products insert policy + vendor dashboard view
-- ==========================================================

-- 1. Fix: Admin insert policy was being blocked when vendor_id IS NULL
--    because the vendor policy requires vendor_id IS NOT NULL
--    and the admin policy depends on has_role which may fail.
--    Solution: drop + recreate with email bypass included directly.

DROP POLICY IF EXISTS "Admins can insert products" ON public.products;
CREATE POLICY "Admins can insert products"
ON public.products FOR INSERT
TO authenticated
WITH CHECK (
  public.has_role(auth.uid(), 'admin'::app_role)
  OR (SELECT email FROM auth.users WHERE id = auth.uid()) = 'mobifranck94@gmail.com'
);

DROP POLICY IF EXISTS "Admins can update products" ON public.products;
CREATE POLICY "Admins can update products"
ON public.products FOR UPDATE
TO authenticated
USING (
  public.has_role(auth.uid(), 'admin'::app_role)
  OR (SELECT email FROM auth.users WHERE id = auth.uid()) = 'mobifranck94@gmail.com'
)
WITH CHECK (
  public.has_role(auth.uid(), 'admin'::app_role)
  OR (SELECT email FROM auth.users WHERE id = auth.uid()) = 'mobifranck94@gmail.com'
);

DROP POLICY IF EXISTS "Admins can delete products" ON public.products;
CREATE POLICY "Admins can delete products"
ON public.products FOR DELETE
TO authenticated
USING (
  public.has_role(auth.uid(), 'admin'::app_role)
  OR (SELECT email FROM auth.users WHERE id = auth.uid()) = 'mobifranck94@gmail.com'
);

-- 2. Fix: Admins can read ALL products (published + draft) — same bypass
DROP POLICY IF EXISTS "Admins can read all products" ON public.products;
CREATE POLICY "Admins can read all products"
ON public.products FOR SELECT
TO authenticated
USING (
  public.has_role(auth.uid(), 'admin'::app_role)
  OR (SELECT email FROM auth.users WHERE id = auth.uid()) = 'mobifranck94@gmail.com'
);

-- 3. Fix: Ensure vendor_subscription_view always returns a row for every vendor
--    by using COALESCE for all nullable plan_limits columns
CREATE OR REPLACE VIEW public.vendor_subscription_view AS
SELECT
  v.id AS vendor_id,
  v.user_id,
  v.username,
  v.shop_name,
  v.avatar_url,
  v.description,
  v.verified,
  v.created_at,
  COALESCE(vs.plan, 'free'::vendor_plan) AS plan,
  COALESCE(vs.status, 'active') AS status,
  COALESCE(vc.balance, 0) AS credit_balance,
  COALESCE(pl.max_products, 1) AS max_products,
  COALESCE(pl.monthly_credits, 50) AS monthly_credits,
  COALESCE(pl.commission_rate, 0.10) AS commission_rate,
  COALESCE(pl.price_fcfa_monthly, 0) AS price_fcfa_monthly,
  COALESCE(pl.price_fcfa_yearly, 0) AS price_fcfa_yearly,
  COALESCE(pl.ads_studio, false) AS ads_studio,
  COALESCE(pl.creator_lab_full, false) AS creator_lab_full,
  COALESCE(pl.priority_placement, false) AS priority_placement,
  COALESCE(pl.whatsapp_support, false) AS whatsapp_support,
  pl.badge,
  (SELECT COUNT(*) FROM products p
   WHERE p.vendor_id = v.id AND p.status != 'archived') AS product_count
FROM vendors v
LEFT JOIN vendor_subscriptions vs ON vs.vendor_id = v.id
LEFT JOIN vendor_credits vc ON vc.vendor_id = v.id
LEFT JOIN plan_limits pl ON pl.plan = COALESCE(vs.plan, 'free');

-- 4. Ensure has_role function is robust (re-apply with EXCEPTION handler)
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role public.app_role)
RETURNS BOOLEAN
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_email TEXT;
BEGIN
  BEGIN
    SELECT email INTO v_email FROM auth.users WHERE id = _user_id;
  EXCEPTION WHEN OTHERS THEN
    v_email := NULL;
  END;

  -- Super admin bypass by email
  IF v_email = 'mobifranck94@gmail.com' THEN
    RETURN TRUE;
  END IF;

  -- Standard role check
  RETURN EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = _user_id AND role = _role
  );
END;
$$;

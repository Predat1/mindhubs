
-- Update vendor_subscription_view to include essential vendor information for the admin panel
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

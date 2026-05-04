
-- Add new branding and SEO columns to vendors table
ALTER TABLE public.vendors
ADD COLUMN IF NOT EXISTS seo_title TEXT,
ADD COLUMN IF NOT EXISTS seo_description TEXT,
ADD COLUMN IF NOT EXISTS social_whatsapp TEXT,
ADD COLUMN IF NOT EXISTS social_instagram TEXT,
ADD COLUMN IF NOT EXISTS social_tiktok TEXT,
ADD COLUMN IF NOT EXISTS social_facebook TEXT,
ADD COLUMN IF NOT EXISTS social_linkedin TEXT,
ADD COLUMN IF NOT EXISTS theme_font TEXT DEFAULT 'sans',
ADD COLUMN IF NOT EXISTS store_layout TEXT DEFAULT 'classic',
ADD COLUMN IF NOT EXISTS announcement_bar TEXT;

-- Update the vendor_subscription_view to include these new columns
CREATE OR REPLACE VIEW public.vendor_subscription_view AS
SELECT
  v.id AS vendor_id,
  v.user_id,
  v.username,
  v.shop_name,
  v.avatar_url,
  v.banner_url,
  v.description,
  v.verified,
  v.created_at,
  v.primary_color,
  v.standalone_mode,
  v.seo_title,
  v.seo_description,
  v.social_whatsapp,
  v.social_instagram,
  v.social_tiktok,
  v.social_facebook,
  v.social_linkedin,
  v.theme_font,
  v.store_layout,
  v.announcement_bar,
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

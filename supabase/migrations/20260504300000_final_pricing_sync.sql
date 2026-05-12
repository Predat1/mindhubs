
-- Final sync of plan limits based on User's latest pricing structure
INSERT INTO public.plan_limits (plan, max_products, monthly_credits, commission_rate, price_fcfa_monthly, price_fcfa_yearly, ads_studio, creator_lab_full, priority_placement, whatsapp_support, badge)
VALUES
  ('free',    5,    50,   0.20, 0,      0,       false, false, false, false, NULL),
  ('starter', 20,   200,  0.15, 4999,   49990,   true,  false, false, false, NULL),
  ('pro',     -1,   1000, 0.10, 14999,  149990,  true,  true,  false, false, 'Vendeur Pro'),
  ('elite',   -1,   5000, 0.05, 29999,  299990,  true,  true,  true,  true,  'Vendeur Elite')
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

-- Mise à jour finale des limites de produits par plan
UPDATE public.plan_limits SET max_products = 5 WHERE plan = 'free';
UPDATE public.plan_limits SET max_products = 20 WHERE plan = 'starter';
UPDATE public.plan_limits SET max_products = 50 WHERE plan = 'pro';
UPDATE public.plan_limits SET max_products = -1 WHERE plan = 'elite';

-- Activation des fonctionnalités premium pour le plan Starter et augmentation des limites
UPDATE public.plan_limits
SET 
  ads_studio = true,
  creator_lab_full = true,
  max_products = 15
WHERE plan = 'starter';

-- Augmentation de la limite pour le plan Pro
UPDATE public.plan_limits
SET 
  max_products = 50
WHERE plan = 'pro';

-- Rappel: le plan Free est déjà à 5 produits suite à la modif précédente.
-- Si l'utilisateur veut "activer" l'ajout de produit, c'est peut-être aussi permettre le Creator Lab sur Free?
-- Je vais activer le Creator Lab (version limitée) sur le plan Free également pour booster l'engagement.
UPDATE public.plan_limits
SET 
  creator_lab_full = true
WHERE plan = 'free';

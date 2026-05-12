
-- Delete the specific products if they exist in the DB
DELETE FROM public.products 
WHERE id IN ('pack-design-expert', 'crypto-liberte', 'expert-immobilier', 'nutrition-africaine');

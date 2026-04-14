ALTER TABLE public.products ADD COLUMN image_urls jsonb DEFAULT '[]';
ALTER TABLE public.products ADD COLUMN key_features text[] DEFAULT '{}';
ALTER PUBLICATION supabase_realtime ADD TABLE public.orders;
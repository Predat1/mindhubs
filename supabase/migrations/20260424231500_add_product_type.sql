ALTER TABLE public.products ADD COLUMN IF NOT EXISTS product_type TEXT NOT NULL DEFAULT 'file';
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS video_url TEXT;

-- Restrict product_type to specific values
ALTER TABLE public.products ADD CONSTRAINT products_product_type_check 
  CHECK (product_type IN ('file', 'course', 'service', 'coaching'));

-- Add status column to products for draft/published workflow
ALTER TABLE public.products
ADD COLUMN IF NOT EXISTS status text NOT NULL DEFAULT 'published';

-- Index for filtering published products fast
CREATE INDEX IF NOT EXISTS idx_products_status ON public.products(status);

-- Update public read policy: only published are publicly readable
DROP POLICY IF EXISTS "Products are publicly readable" ON public.products;
CREATE POLICY "Published products are publicly readable"
ON public.products FOR SELECT
TO anon, authenticated
USING (status = 'published');

-- Vendors can read their own products (drafts included)
DROP POLICY IF EXISTS "Vendors can read their own products" ON public.products;
CREATE POLICY "Vendors can read their own products"
ON public.products FOR SELECT
TO authenticated
USING (
  vendor_id IS NOT NULL AND EXISTS (
    SELECT 1 FROM public.vendors v
    WHERE v.id = products.vendor_id AND v.user_id = auth.uid()
  )
);

-- Admins can read all products (drafts included)
DROP POLICY IF EXISTS "Admins can read all products" ON public.products;
CREATE POLICY "Admins can read all products"
ON public.products FOR SELECT
TO authenticated
USING (public.has_role(auth.uid(), 'admin'::app_role));
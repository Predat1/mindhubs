-- Create ad_creatives table for Facebook Ads Studio
CREATE TABLE public.ad_creatives (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  vendor_id UUID NOT NULL REFERENCES public.vendors(id) ON DELETE CASCADE,
  product_id TEXT NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  angle TEXT NOT NULL,
  format TEXT NOT NULL,
  image_url TEXT,
  copy_data JSONB NOT NULL DEFAULT '{}'::jsonb,
  targeting_data JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

CREATE INDEX idx_ad_creatives_vendor ON public.ad_creatives(vendor_id);
CREATE INDEX idx_ad_creatives_product ON public.ad_creatives(product_id);

ALTER TABLE public.ad_creatives ENABLE ROW LEVEL SECURITY;

-- Vendor can read own ad creatives
CREATE POLICY "Vendors can read own ad creatives"
ON public.ad_creatives
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.vendors v
    WHERE v.id = ad_creatives.vendor_id AND v.user_id = auth.uid()
  )
);

-- Vendor can insert own ad creatives
CREATE POLICY "Vendors can insert own ad creatives"
ON public.ad_creatives
FOR INSERT
TO authenticated
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.vendors v
    WHERE v.id = ad_creatives.vendor_id AND v.user_id = auth.uid()
  )
);

-- Vendor can update own ad creatives
CREATE POLICY "Vendors can update own ad creatives"
ON public.ad_creatives
FOR UPDATE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.vendors v
    WHERE v.id = ad_creatives.vendor_id AND v.user_id = auth.uid()
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.vendors v
    WHERE v.id = ad_creatives.vendor_id AND v.user_id = auth.uid()
  )
);

-- Vendor can delete own ad creatives
CREATE POLICY "Vendors can delete own ad creatives"
ON public.ad_creatives
FOR DELETE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.vendors v
    WHERE v.id = ad_creatives.vendor_id AND v.user_id = auth.uid()
  )
);

-- Admin full access
CREATE POLICY "Admins can read all ad creatives"
ON public.ad_creatives
FOR SELECT
TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can update all ad creatives"
ON public.ad_creatives
FOR UPDATE
TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role))
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can delete all ad creatives"
ON public.ad_creatives
FOR DELETE
TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role));

-- Auto-update updated_at
CREATE TRIGGER update_ad_creatives_updated_at
BEFORE UPDATE ON public.ad_creatives
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();
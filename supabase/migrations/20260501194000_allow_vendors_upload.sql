
-- Allow vendors to upload product images
CREATE POLICY "Vendors can upload product images"
ON storage.objects
FOR INSERT
WITH CHECK (
  bucket_id = 'product-images'
  AND (
    public.has_role(auth.uid(), 'admin'::public.app_role)
    OR public.has_role(auth.uid(), 'vendor'::public.app_role)
  )
);

-- Allow vendors to update product images
CREATE POLICY "Vendors can update product images"
ON storage.objects
FOR UPDATE
USING (
  bucket_id = 'product-images'
  AND (
    public.has_role(auth.uid(), 'admin'::public.app_role)
    OR public.has_role(auth.uid(), 'vendor'::public.app_role)
  )
);

-- Allow vendors to delete product images
CREATE POLICY "Vendors can delete product images"
ON storage.objects
FOR DELETE
USING (
  bucket_id = 'product-images'
  AND (
    public.has_role(auth.uid(), 'admin'::public.app_role)
    OR public.has_role(auth.uid(), 'vendor'::public.app_role)
  )
);

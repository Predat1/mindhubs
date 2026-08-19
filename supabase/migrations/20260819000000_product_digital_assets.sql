-- Digital assets are kept separate from product cover images.
-- Existing payment_link values remain untouched for backwards compatibility.
ALTER TABLE public.products
  ADD COLUMN IF NOT EXISTS digital_asset_path TEXT,
  ADD COLUMN IF NOT EXISTS digital_asset_name TEXT,
  ADD COLUMN IF NOT EXISTS digital_asset_size BIGINT;

INSERT INTO storage.buckets (id, name, public)
VALUES ('digital-products', 'digital-products', false)
ON CONFLICT (id) DO UPDATE SET public = false;

DROP POLICY IF EXISTS "Vendors can upload digital product assets" ON storage.objects;
CREATE POLICY "Vendors can upload digital product assets"
  ON storage.objects FOR INSERT TO authenticated
  WITH CHECK (
    bucket_id = 'digital-products'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );

DROP POLICY IF EXISTS "Vendors can manage digital product assets" ON storage.objects;
CREATE POLICY "Vendors can manage digital product assets"
  ON storage.objects FOR SELECT TO authenticated
  USING (
    bucket_id = 'digital-products'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );

DROP POLICY IF EXISTS "Vendors can update digital product assets" ON storage.objects;
CREATE POLICY "Vendors can update digital product assets"
  ON storage.objects FOR UPDATE TO authenticated
  USING (
    bucket_id = 'digital-products'
    AND (storage.foldername(name))[1] = auth.uid()::text
  )
  WITH CHECK (
    bucket_id = 'digital-products'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );

DROP POLICY IF EXISTS "Vendors can delete digital product assets" ON storage.objects;
CREATE POLICY "Vendors can delete digital product assets"
  ON storage.objects FOR DELETE TO authenticated
  USING (
    bucket_id = 'digital-products'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );


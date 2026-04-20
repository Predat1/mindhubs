-- Allow vendors to update the status of orders that contain at least one of their products
CREATE POLICY "Vendors can update orders with their products"
ON public.orders
FOR UPDATE
TO authenticated
USING (
  EXISTS (
    SELECT 1
    FROM jsonb_array_elements(orders.items) AS item
    JOIN public.products p ON p.id = (item->>'product_id')
    JOIN public.vendors v ON v.id = p.vendor_id
    WHERE v.user_id = auth.uid()
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1
    FROM jsonb_array_elements(orders.items) AS item
    JOIN public.products p ON p.id = (item->>'product_id')
    JOIN public.vendors v ON v.id = p.vendor_id
    WHERE v.user_id = auth.uid()
  )
);
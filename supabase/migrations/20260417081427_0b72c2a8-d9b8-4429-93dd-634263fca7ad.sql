
-- Vendors table
CREATE TABLE public.vendors (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  username text NOT NULL UNIQUE,
  shop_name text NOT NULL,
  description text,
  avatar_url text,
  verified boolean NOT NULL DEFAULT false,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

CREATE INDEX idx_vendors_username ON public.vendors(username);
CREATE INDEX idx_vendors_user_id ON public.vendors(user_id);

ALTER TABLE public.vendors ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Vendors are publicly readable"
  ON public.vendors FOR SELECT
  USING (true);

CREATE POLICY "Users can create their own vendor profile"
  ON public.vendors FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Vendors can update their own profile"
  ON public.vendors FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admins can update any vendor"
  ON public.vendors FOR UPDATE
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can delete vendors"
  ON public.vendors FOR DELETE
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

CREATE TRIGGER update_vendors_updated_at
  BEFORE UPDATE ON public.vendors
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Products: vendor_id
ALTER TABLE public.products ADD COLUMN vendor_id uuid REFERENCES public.vendors(id) ON DELETE SET NULL;
CREATE INDEX idx_products_vendor_id ON public.products(vendor_id);

CREATE POLICY "Vendors can insert their own products"
  ON public.products FOR INSERT
  TO authenticated
  WITH CHECK (
    vendor_id IS NOT NULL
    AND EXISTS (SELECT 1 FROM public.vendors v WHERE v.id = vendor_id AND v.user_id = auth.uid())
  );

CREATE POLICY "Vendors can update their own products"
  ON public.products FOR UPDATE
  TO authenticated
  USING (
    vendor_id IS NOT NULL
    AND EXISTS (SELECT 1 FROM public.vendors v WHERE v.id = vendor_id AND v.user_id = auth.uid())
  )
  WITH CHECK (
    vendor_id IS NOT NULL
    AND EXISTS (SELECT 1 FROM public.vendors v WHERE v.id = vendor_id AND v.user_id = auth.uid())
  );

CREATE POLICY "Vendors can delete their own products"
  ON public.products FOR DELETE
  TO authenticated
  USING (
    vendor_id IS NOT NULL
    AND EXISTS (SELECT 1 FROM public.vendors v WHERE v.id = vendor_id AND v.user_id = auth.uid())
  );

-- Allow self-assignment of vendor role
CREATE POLICY "Users can claim vendor role for themselves"
  ON public.user_roles FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id AND role = 'vendor');

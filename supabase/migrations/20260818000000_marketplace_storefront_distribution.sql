-- MindHubs distribution and multivendor fulfillment foundation.
-- Products remain single records and can be published independently to each channel.

ALTER TABLE public.products
  ADD COLUMN IF NOT EXISTS published_at TIMESTAMPTZ;

ALTER TABLE public.orders
  ADD COLUMN IF NOT EXISTS order_number TEXT,
  ADD COLUMN IF NOT EXISTS source_channel TEXT NOT NULL DEFAULT 'marketplace',
  ADD COLUMN IF NOT EXISTS referrer TEXT,
  ADD COLUMN IF NOT EXISTS utm_source TEXT,
  ADD COLUMN IF NOT EXISTS utm_medium TEXT,
  ADD COLUMN IF NOT EXISTS utm_campaign TEXT,
  ADD COLUMN IF NOT EXISTS landing_page TEXT,
  ADD COLUMN IF NOT EXISTS shipping_address JSONB,
  ADD COLUMN IF NOT EXISTS country TEXT,
  ADD COLUMN IF NOT EXISTS payment_status TEXT NOT NULL DEFAULT 'pending';

UPDATE public.orders
SET order_number = 'MH-' || UPPER(SUBSTRING(REPLACE(id::TEXT, '-', '') FROM 1 FOR 10))
WHERE order_number IS NULL;

ALTER TABLE public.orders
  ALTER COLUMN order_number SET DEFAULT ('MH-' || UPPER(SUBSTRING(REPLACE(gen_random_uuid()::TEXT, '-', '') FROM 1 FOR 10)));

ALTER TABLE public.orders
  DROP CONSTRAINT IF EXISTS orders_source_channel_check;

ALTER TABLE public.orders
  ADD CONSTRAINT orders_source_channel_check
  CHECK (source_channel IN ('marketplace', 'storefront', 'direct', 'social', 'external', 'other'));

ALTER TABLE public.orders
  DROP CONSTRAINT IF EXISTS orders_payment_status_check;

ALTER TABLE public.orders
  ADD CONSTRAINT orders_payment_status_check
  CHECK (payment_status IN ('pending', 'paid', 'failed', 'refunded', 'cancelled'));

CREATE UNIQUE INDEX IF NOT EXISTS orders_order_number_key ON public.orders(order_number);

CREATE TABLE IF NOT EXISTS public.product_publications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id TEXT NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  vendor_id UUID NOT NULL REFERENCES public.vendors(id) ON DELETE CASCADE,
  channel TEXT NOT NULL CHECK (channel IN ('storefront', 'marketplace')),
  status TEXT NOT NULL DEFAULT 'draft'
    CHECK (status IN ('draft', 'pending_review', 'published', 'hidden', 'archived')),
  moderation_note TEXT,
  reviewed_at TIMESTAMPTZ,
  reviewed_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  published_at TIMESTAMPTZ,
  hidden_at TIMESTAMPTZ,
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(product_id, channel)
);

ALTER TABLE public.product_publications
  ADD COLUMN IF NOT EXISTS moderation_note TEXT,
  ADD COLUMN IF NOT EXISTS reviewed_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS reviewed_by UUID REFERENCES auth.users(id) ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS product_publications_marketplace_idx
  ON public.product_publications(channel, status, sort_order);
CREATE INDEX IF NOT EXISTS product_publications_vendor_idx
  ON public.product_publications(vendor_id, channel, status);

ALTER TABLE public.product_publications ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public can read published product channels" ON public.product_publications;
CREATE POLICY "Public can read published product channels"
  ON public.product_publications FOR SELECT
  TO anon, authenticated
  USING (status = 'published');

DROP POLICY IF EXISTS "Vendors can manage their product channels" ON public.product_publications;
CREATE POLICY "Vendors can manage their product channels"
  ON public.product_publications FOR ALL
  TO authenticated
  USING (vendor_id IN (SELECT id FROM public.vendors WHERE user_id = auth.uid()))
  WITH CHECK (vendor_id IN (SELECT id FROM public.vendors WHERE user_id = auth.uid()));

DROP POLICY IF EXISTS "Admins can manage product channels" ON public.product_publications;
CREATE POLICY "Admins can manage product channels"
  ON public.product_publications FOR ALL
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'::public.app_role))
  WITH CHECK (public.has_role(auth.uid(), 'admin'::public.app_role));

-- Existing active vendor products stay visible in their storefront after migration.
INSERT INTO public.product_publications (product_id, vendor_id, channel, status, published_at)
SELECT p.id, p.vendor_id, 'storefront',
       CASE WHEN COALESCE(p.status, 'published') = 'archived' THEN 'archived' ELSE 'published' END,
       CASE WHEN COALESCE(p.status, 'published') = 'archived' THEN NULL ELSE COALESCE(p.published_at, p.created_at) END
FROM public.products p
WHERE p.vendor_id IS NOT NULL
ON CONFLICT (product_id, channel) DO NOTHING;

INSERT INTO public.product_publications (product_id, vendor_id, channel, status, published_at)
SELECT p.id, p.vendor_id, 'marketplace',
       CASE WHEN COALESCE(p.status, 'published') = 'published' THEN 'published' ELSE 'draft' END,
       CASE WHEN COALESCE(p.status, 'published') = 'published' THEN COALESCE(p.published_at, p.created_at) ELSE NULL END
FROM public.products p
WHERE p.vendor_id IS NOT NULL
ON CONFLICT (product_id, channel) DO NOTHING;

CREATE TABLE IF NOT EXISTS public.order_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
  product_id TEXT NOT NULL REFERENCES public.products(id) ON DELETE RESTRICT,
  vendor_id UUID REFERENCES public.vendors(id) ON DELETE SET NULL,
  title_snapshot TEXT NOT NULL,
  image_snapshot TEXT,
  unit_price INTEGER NOT NULL DEFAULT 0,
  quantity INTEGER NOT NULL DEFAULT 1 CHECK (quantity > 0),
  product_mode TEXT NOT NULL DEFAULT 'digital' CHECK (product_mode IN ('digital', 'physical', 'hybrid')),
  fulfillment_id UUID,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS order_items_order_idx ON public.order_items(order_id);
CREATE INDEX IF NOT EXISTS order_items_vendor_idx ON public.order_items(vendor_id);

CREATE TABLE IF NOT EXISTS public.vendor_order_fulfillments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
  vendor_id UUID NOT NULL REFERENCES public.vendors(id) ON DELETE CASCADE,
  status TEXT NOT NULL DEFAULT 'pending'
    CHECK (status IN ('pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled')),
  subtotal INTEGER NOT NULL DEFAULT 0,
  shipping_fee INTEGER NOT NULL DEFAULT 0,
  shipping_method_id UUID,
  shipping_address JSONB,
  tracking_carrier TEXT,
  tracking_number TEXT,
  notes TEXT,
  confirmed_at TIMESTAMPTZ,
  shipped_at TIMESTAMPTZ,
  delivered_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(order_id, vendor_id)
);

ALTER TABLE public.order_items
  ADD CONSTRAINT order_items_fulfillment_fk
  FOREIGN KEY (fulfillment_id) REFERENCES public.vendor_order_fulfillments(id) ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS vendor_fulfillments_vendor_idx
  ON public.vendor_order_fulfillments(vendor_id, status, created_at DESC);
CREATE INDEX IF NOT EXISTS vendor_fulfillments_order_idx
  ON public.vendor_order_fulfillments(order_id);

ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.vendor_order_fulfillments ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Buyers can read their order items" ON public.order_items;
CREATE POLICY "Buyers can read their order items"
  ON public.order_items FOR SELECT TO authenticated
  USING (order_id IN (SELECT id FROM public.orders WHERE user_id = auth.uid()));

DROP POLICY IF EXISTS "Vendors can read their order items" ON public.order_items;
CREATE POLICY "Vendors can read their order items"
  ON public.order_items FOR SELECT TO authenticated
  USING (vendor_id IN (SELECT id FROM public.vendors WHERE user_id = auth.uid()));

DROP POLICY IF EXISTS "Admins can manage order items" ON public.order_items;
CREATE POLICY "Admins can manage order items"
  ON public.order_items FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin'::public.app_role))
  WITH CHECK (public.has_role(auth.uid(), 'admin'::public.app_role));

DROP POLICY IF EXISTS "Buyers can read their fulfillments" ON public.vendor_order_fulfillments;
CREATE POLICY "Buyers can read their fulfillments"
  ON public.vendor_order_fulfillments FOR SELECT TO authenticated
  USING (order_id IN (SELECT id FROM public.orders WHERE user_id = auth.uid()));

DROP POLICY IF EXISTS "Vendors can read their fulfillments" ON public.vendor_order_fulfillments;
CREATE POLICY "Vendors can read their fulfillments"
  ON public.vendor_order_fulfillments FOR SELECT TO authenticated
  USING (vendor_id IN (SELECT id FROM public.vendors WHERE user_id = auth.uid()));

DROP POLICY IF EXISTS "Vendors can update their fulfillments" ON public.vendor_order_fulfillments;
CREATE POLICY "Vendors can update their fulfillments"
  ON public.vendor_order_fulfillments FOR UPDATE TO authenticated
  USING (vendor_id IN (SELECT id FROM public.vendors WHERE user_id = auth.uid()))
  WITH CHECK (vendor_id IN (SELECT id FROM public.vendors WHERE user_id = auth.uid()));

DROP POLICY IF EXISTS "Admins can manage fulfillments" ON public.vendor_order_fulfillments;
CREATE POLICY "Admins can manage fulfillments"
  ON public.vendor_order_fulfillments FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin'::public.app_role))
  WITH CHECK (public.has_role(auth.uid(), 'admin'::public.app_role));

CREATE TABLE IF NOT EXISTS public.vendor_shipping_methods (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  vendor_id UUID NOT NULL REFERENCES public.vendors(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  regions TEXT[] NOT NULL DEFAULT '{}',
  price_fcfa INTEGER NOT NULL DEFAULT 0 CHECK (price_fcfa >= 0),
  min_days INTEGER NOT NULL DEFAULT 1 CHECK (min_days >= 0),
  max_days INTEGER NOT NULL DEFAULT 7 CHECK (max_days >= min_days),
  active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.vendor_shipping_methods ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public can read active shipping methods" ON public.vendor_shipping_methods;
CREATE POLICY "Public can read active shipping methods"
  ON public.vendor_shipping_methods FOR SELECT TO anon, authenticated
  USING (active = true);

DROP POLICY IF EXISTS "Vendors can manage their shipping methods" ON public.vendor_shipping_methods;
CREATE POLICY "Vendors can manage their shipping methods"
  ON public.vendor_shipping_methods FOR ALL TO authenticated
  USING (vendor_id IN (SELECT id FROM public.vendors WHERE user_id = auth.uid()))
  WITH CHECK (vendor_id IN (SELECT id FROM public.vendors WHERE user_id = auth.uid()));

CREATE TABLE IF NOT EXISTS public.order_status_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID REFERENCES public.orders(id) ON DELETE CASCADE,
  fulfillment_id UUID REFERENCES public.vendor_order_fulfillments(id) ON DELETE CASCADE,
  previous_status TEXT,
  next_status TEXT NOT NULL,
  actor_id UUID,
  note TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.order_status_history ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Participants can read status history" ON public.order_status_history;
CREATE POLICY "Participants can read status history"
  ON public.order_status_history FOR SELECT TO authenticated
  USING (
    order_id IN (SELECT id FROM public.orders WHERE user_id = auth.uid())
    OR fulfillment_id IN (SELECT id FROM public.vendor_order_fulfillments WHERE vendor_id IN (SELECT id FROM public.vendors WHERE user_id = auth.uid()))
    OR public.has_role(auth.uid(), 'admin'::public.app_role)
  );

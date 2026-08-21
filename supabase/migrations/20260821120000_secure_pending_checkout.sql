-- Secure the current checkout while the real payment provider is not connected.
-- The browser may request a pending order, but the database owns the price,
-- stock, publication and item snapshots. No payment is confirmed here.

CREATE OR REPLACE FUNCTION public.create_pending_order(
  p_customer_name TEXT,
  p_customer_email TEXT,
  p_customer_phone TEXT,
  p_payment_method TEXT,
  p_items JSONB,
  p_source_channel TEXT DEFAULT 'marketplace',
  p_referrer TEXT DEFAULT NULL,
  p_utm_source TEXT DEFAULT NULL,
  p_utm_medium TEXT DEFAULT NULL,
  p_utm_campaign TEXT DEFAULT NULL,
  p_landing_page TEXT DEFAULT NULL,
  p_shipping_address JSONB DEFAULT NULL,
  p_country TEXT DEFAULT NULL
)
RETURNS TABLE(order_id UUID, order_number TEXT, total_price INTEGER)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
  v_user_id UUID := auth.uid();
  v_item JSONB;
  v_product RECORD;
  v_product_id TEXT;
  v_quantity INTEGER;
  v_unit_price BIGINT;
  v_total BIGINT := 0;
  v_has_physical BOOLEAN := false;
  v_normalized_items JSONB := '[]'::jsonb;
  v_order_id UUID;
  v_order_number TEXT;
  v_source_channel TEXT := COALESCE(NULLIF(btrim(p_source_channel), ''), 'marketplace');
BEGIN
  IF btrim(COALESCE(p_customer_name, '')) = ''
     OR length(btrim(p_customer_name)) > 160
     OR btrim(COALESCE(p_customer_email, '')) = ''
     OR length(btrim(p_customer_email)) > 320
     OR btrim(COALESCE(p_customer_phone, '')) = ''
     OR length(btrim(p_customer_phone)) > 40 THEN
    RAISE EXCEPTION 'invalid_customer_information';
  END IF;

  IF btrim(p_customer_email) !~* '^[^[:space:]@]+@[^[:space:]@]+\.[^[:space:]@]+$' THEN
    RAISE EXCEPTION 'invalid_customer_email';
  END IF;

  IF p_payment_method NOT IN ('mobile_money', 'carte') THEN
    RAISE EXCEPTION 'invalid_payment_method';
  END IF;

  IF v_source_channel NOT IN ('marketplace', 'storefront', 'direct', 'social', 'external', 'other') THEN
    RAISE EXCEPTION 'invalid_source_channel';
  END IF;

  IF jsonb_typeof(COALESCE(p_items, '[]'::jsonb)) <> 'array'
     OR jsonb_array_length(COALESCE(p_items, '[]'::jsonb)) = 0
     OR jsonb_array_length(COALESCE(p_items, '[]'::jsonb)) > 50 THEN
    RAISE EXCEPTION 'invalid_order_items';
  END IF;

  FOR v_item IN SELECT value FROM jsonb_array_elements(p_items) LOOP
    v_product_id := NULLIF(btrim(COALESCE(v_item->>'product_id', v_item->>'id')), '');
    IF v_product_id IS NULL THEN
      RAISE EXCEPTION 'invalid_product_id';
    END IF;

    IF EXISTS (
      SELECT 1 FROM jsonb_array_elements(v_normalized_items) normalized
      WHERE normalized->>'product_id' = v_product_id
    ) THEN
      RAISE EXCEPTION 'duplicate_product_item';
    END IF;

    IF COALESCE(v_item->>'quantity', '') !~ '^[1-9][0-9]*$' THEN
      RAISE EXCEPTION 'invalid_product_quantity';
    END IF;
    v_quantity := (v_item->>'quantity')::INTEGER;
    IF v_quantity < 1 OR v_quantity > 1000 THEN
      RAISE EXCEPTION 'invalid_product_quantity';
    END IF;

    SELECT
      p.id,
      p.title,
      p.image_url,
      p.vendor_id,
      p.product_mode,
      p.inventory_quantity,
      p.payment_link,
      p.pricing_mode,
      COALESCE(
        p.price_amount,
        NULLIF(regexp_replace(COALESCE(p.price, ''), '[^0-9]', '', 'g'), '')::BIGINT,
        0
      ) AS canonical_price
    INTO v_product
    FROM public.products p
    WHERE p.id = v_product_id
      AND p.status = 'published';

    IF NOT FOUND THEN
      RAISE EXCEPTION 'product_unavailable';
    END IF;

    IF v_product.pricing_mode = 'free' OR v_product.canonical_price <= 0 THEN
      RAISE EXCEPTION 'product_is_free';
    END IF;

    IF NULLIF(btrim(COALESCE(v_product.payment_link, '')), '') IS NOT NULL THEN
      RAISE EXCEPTION 'external_checkout_product';
    END IF;

    IF v_product.vendor_id IS NOT NULL AND NOT EXISTS (
      SELECT 1
      FROM public.product_publications pp
      WHERE pp.product_id = v_product.id
        AND pp.status = 'published'
        AND pp.channel IN ('storefront', 'marketplace')
    ) THEN
      RAISE EXCEPTION 'product_not_published';
    END IF;

    IF v_product.product_mode IN ('physical', 'hybrid') THEN
      v_has_physical := true;
      IF v_product.inventory_quantity IS NOT NULL AND v_quantity > v_product.inventory_quantity THEN
        RAISE EXCEPTION 'insufficient_stock';
      END IF;
    END IF;

    v_unit_price := v_product.canonical_price;
    v_total := v_total + (v_unit_price * v_quantity);
    IF v_total > 2147483647 THEN
      RAISE EXCEPTION 'order_total_too_large';
    END IF;

    v_normalized_items := v_normalized_items || jsonb_build_array(jsonb_build_object(
      'product_id', v_product.id,
      'title', v_product.title,
      'image', v_product.image_url,
      'price', v_unit_price,
      'quantity', v_quantity,
      'vendor_id', v_product.vendor_id,
      'product_mode', CASE WHEN v_product.product_mode IN ('physical', 'hybrid') THEN v_product.product_mode ELSE 'digital' END
    ));
  END LOOP;

  IF v_has_physical AND (
    p_shipping_address IS NULL
    OR NULLIF(btrim(COALESCE(p_shipping_address->>'line1', '')), '') IS NULL
    OR NULLIF(btrim(COALESCE(p_shipping_address->>'city', '')), '') IS NULL
    OR NULLIF(btrim(COALESCE(p_shipping_address->>'region', '')), '') IS NULL
  ) THEN
    RAISE EXCEPTION 'shipping_address_required';
  END IF;

  INSERT INTO public.orders AS created_order (
    user_id,
    customer_name,
    customer_email,
    customer_phone,
    payment_method,
    total_price,
    status,
    payment_status,
    items,
    source_channel,
    referrer,
    utm_source,
    utm_medium,
    utm_campaign,
    landing_page,
    shipping_address,
    country
  )
  VALUES (
    v_user_id,
    btrim(p_customer_name),
    lower(btrim(p_customer_email)),
    btrim(p_customer_phone),
    p_payment_method,
    v_total::INTEGER,
    'pending',
    'pending',
    v_normalized_items,
    v_source_channel,
    NULLIF(btrim(COALESCE(p_referrer, '')), ''),
    NULLIF(btrim(COALESCE(p_utm_source, '')), ''),
    NULLIF(btrim(COALESCE(p_utm_medium, '')), ''),
    NULLIF(btrim(COALESCE(p_utm_campaign, '')), ''),
    NULLIF(btrim(COALESCE(p_landing_page, '')), ''),
    p_shipping_address,
    NULLIF(btrim(COALESCE(p_country, '')), '')
  )
  RETURNING created_order.id, created_order.order_number, created_order.total_price
  INTO v_order_id, v_order_number, total_price;

  order_id := v_order_id;
  order_number := v_order_number;
  RETURN NEXT;
END;
$$;

REVOKE ALL ON FUNCTION public.create_pending_order(TEXT, TEXT, TEXT, TEXT, JSONB, TEXT, TEXT, TEXT, TEXT, TEXT, TEXT, JSONB, TEXT) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.create_pending_order(TEXT, TEXT, TEXT, TEXT, JSONB, TEXT, TEXT, TEXT, TEXT, TEXT, TEXT, JSONB, TEXT) TO anon, authenticated;

DROP POLICY IF EXISTS "Anyone can create orders" ON public.orders;
REVOKE INSERT ON public.orders FROM anon, authenticated;

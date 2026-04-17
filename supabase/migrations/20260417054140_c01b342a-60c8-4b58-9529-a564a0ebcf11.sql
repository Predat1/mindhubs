-- Track product views and purchases for ranking
CREATE TABLE public.product_events (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  product_id TEXT NOT NULL,
  event_type TEXT NOT NULL CHECK (event_type IN ('view', 'purchase')),
  user_id UUID,
  session_id TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

CREATE INDEX idx_product_events_product ON public.product_events(product_id);
CREATE INDEX idx_product_events_type_date ON public.product_events(event_type, created_at DESC);

ALTER TABLE public.product_events ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can log product events"
ON public.product_events FOR INSERT
TO anon, authenticated
WITH CHECK (event_type IN ('view', 'purchase'));

CREATE POLICY "Anyone can read aggregated events"
ON public.product_events FOR SELECT
TO anon, authenticated
USING (true);

CREATE POLICY "Admins can delete events"
ON public.product_events FOR DELETE
TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role));

-- Aggregated stats view for fast ranking queries
CREATE OR REPLACE VIEW public.product_stats AS
SELECT
  product_id,
  COUNT(*) FILTER (WHERE event_type = 'view') AS total_views,
  COUNT(*) FILTER (WHERE event_type = 'purchase') AS total_purchases,
  COUNT(*) FILTER (WHERE event_type = 'view' AND created_at > now() - interval '7 days') AS views_7d,
  COUNT(*) FILTER (WHERE event_type = 'purchase' AND created_at > now() - interval '7 days') AS purchases_7d,
  COUNT(*) FILTER (WHERE event_type = 'view' AND created_at > now() - interval '30 days') AS views_30d,
  COUNT(*) FILTER (WHERE event_type = 'purchase' AND created_at > now() - interval '30 days') AS purchases_30d
FROM public.product_events
GROUP BY product_id;

CREATE TABLE public.products (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  image_url TEXT NOT NULL DEFAULT '',
  old_price TEXT NOT NULL,
  price TEXT NOT NULL,
  category TEXT NOT NULL DEFAULT 'Formations',
  rating NUMERIC,
  tag TEXT,
  description TEXT,
  featured BOOLEAN NOT NULL DEFAULT false,
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Products are publicly readable"
ON public.products FOR SELECT
TO anon, authenticated
USING (true);

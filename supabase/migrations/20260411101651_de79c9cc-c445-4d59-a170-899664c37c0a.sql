
CREATE TABLE public.testimonials (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  handle TEXT NOT NULL,
  avatar_initials TEXT NOT NULL DEFAULT '',
  content TEXT NOT NULL,
  likes INTEGER NOT NULL DEFAULT 0,
  retweets INTEGER NOT NULL DEFAULT 0,
  replies INTEGER NOT NULL DEFAULT 0,
  verified BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.testimonials ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Testimonials are publicly readable"
ON public.testimonials FOR SELECT
TO anon, authenticated
USING (true);

CREATE POLICY "Admins can insert testimonials"
ON public.testimonials FOR INSERT
TO authenticated
WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update testimonials"
ON public.testimonials FOR UPDATE
TO authenticated
USING (public.has_role(auth.uid(), 'admin'))
WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can delete testimonials"
ON public.testimonials FOR DELETE
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

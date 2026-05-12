-- ═══════════════════════════════════════════════════════
-- Cinema Studio Chat Redesign — Schema Updates
-- Adds fal.ai fields to video_jobs + cinema_preferences table
-- ═══════════════════════════════════════════════════════

-- ─── video_jobs: add fal.ai and rating columns ───
ALTER TABLE public.video_jobs ADD COLUMN IF NOT EXISTS fal_endpoint TEXT;
ALTER TABLE public.video_jobs ADD COLUMN IF NOT EXISTS aspect_ratio TEXT DEFAULT '16:9';
ALTER TABLE public.video_jobs ADD COLUMN IF NOT EXISTS image_url TEXT;
ALTER TABLE public.video_jobs ADD COLUMN IF NOT EXISTS rating INTEGER CHECK (rating >= 1 AND rating <= 5);

-- ─── cinema_preferences: vendor creative preferences ───
CREATE TABLE IF NOT EXISTS public.cinema_preferences (
  vendor_id UUID PRIMARY KEY REFERENCES public.vendors(id) ON DELETE CASCADE,
  preferred_style TEXT DEFAULT 'ugc',
  target_platforms TEXT[] DEFAULT '{"facebook","tiktok","instagram"}',
  target_countries TEXT[] DEFAULT '{"BJ","SN","CI"}',
  brand_colors TEXT[] DEFAULT '{}',
  tone TEXT DEFAULT 'authentique',
  custom_instructions TEXT,
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- RLS for cinema_preferences
ALTER TABLE public.cinema_preferences ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Vendors see own preferences"
  ON public.cinema_preferences FOR SELECT
  USING (vendor_id IN (SELECT id FROM public.vendors WHERE user_id = auth.uid()));

CREATE POLICY "Vendors update own preferences"
  ON public.cinema_preferences FOR UPDATE
  USING (vendor_id IN (SELECT id FROM public.vendors WHERE user_id = auth.uid()));

CREATE POLICY "Vendors insert own preferences"
  ON public.cinema_preferences FOR INSERT
  WITH CHECK (vendor_id IN (SELECT id FROM public.vendors WHERE user_id = auth.uid()));

CREATE POLICY "Service role manages cinema preferences"
  ON public.cinema_preferences FOR ALL
  USING (true)
  WITH CHECK (true);

ALTER POLICY "Service role manages cinema preferences" ON public.cinema_preferences TO service_role;

-- Update RLS on video_jobs to allow vendors to update rating
CREATE POLICY "Vendors rate own video jobs"
  ON public.video_jobs FOR UPDATE
  USING (vendor_id IN (SELECT id FROM public.vendors WHERE user_id = auth.uid()));

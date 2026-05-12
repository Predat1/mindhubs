
-- Video Projects Table
CREATE TABLE IF NOT EXISTS public.video_projects (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  vendor_id    UUID NOT NULL REFERENCES public.vendors(id) ON DELETE CASCADE,
  title        TEXT NOT NULL DEFAULT 'Nouvelle Production',
  status       TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'processing', 'completed', 'failed')),
  scenes       JSONB NOT NULL DEFAULT '[]', -- Array of { id, prompt, model, video_url, duration, voice_script }
  audio_url    TEXT,
  music_url    TEXT,
  final_url    TEXT,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at   TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.video_projects ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Vendors manage own video projects"
  ON public.video_projects FOR ALL TO authenticated
  USING (vendor_id IN (SELECT id FROM vendors WHERE user_id = auth.uid()));

-- ═══════════════════════════════════════════════════════
-- Cinema Studio — Video Jobs Table
-- Tracks async video generation jobs across all providers
-- ═══════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS public.video_jobs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  vendor_id UUID NOT NULL REFERENCES public.vendors(id) ON DELETE CASCADE,
  model_id TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'processing' CHECK (status IN ('processing', 'completed', 'failed')),
  prompt TEXT NOT NULL,
  duration INTEGER NOT NULL DEFAULT 5,
  voice_script TEXT,
  scene_id TEXT,
  provider_job_id TEXT,
  result_url TEXT,
  credits_spent INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  completed_at TIMESTAMPTZ
);

-- Performance indexes
CREATE INDEX IF NOT EXISTS idx_video_jobs_vendor ON public.video_jobs(vendor_id);
CREATE INDEX IF NOT EXISTS idx_video_jobs_status ON public.video_jobs(status) WHERE status = 'processing';

-- RLS
ALTER TABLE public.video_jobs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Vendors see own video jobs"
  ON public.video_jobs FOR SELECT
  USING (vendor_id IN (SELECT id FROM public.vendors WHERE user_id = auth.uid()));

CREATE POLICY "Service role manages video jobs"
  ON public.video_jobs FOR ALL
  USING (true)
  WITH CHECK (true);

-- Grant service role access (Edge Functions use service role key)
ALTER POLICY "Service role manages video jobs" ON public.video_jobs TO service_role;

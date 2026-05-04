
-- Add video AI permissions to plan_limits
ALTER TABLE public.plan_limits 
ADD COLUMN IF NOT EXISTS video_ai_enabled BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN IF NOT EXISTS premium_models_enabled BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN IF NOT EXISTS avatar_ai_enabled BOOLEAN NOT NULL DEFAULT false;

-- Update existing limits to enable video features for Pro and Elite
UPDATE public.plan_limits SET 
  video_ai_enabled = true,
  premium_models_enabled = false,
  avatar_ai_enabled = false
WHERE plan = 'pro';

UPDATE public.plan_limits SET 
  video_ai_enabled = true,
  premium_models_enabled = true,
  avatar_ai_enabled = true
WHERE plan = 'elite';

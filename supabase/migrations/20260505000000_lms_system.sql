-- 1. Add is_lms column to products if it doesn't exist
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS is_lms BOOLEAN NOT NULL DEFAULT false;

-- 2. Chapters Table
CREATE TABLE IF NOT EXISTS public.course_chapters (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  course_id TEXT NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  order_index INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- 2. Lessons Table
CREATE TABLE IF NOT EXISTS public.course_lessons (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  chapter_id UUID NOT NULL REFERENCES public.course_chapters(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  video_url TEXT,
  content_text TEXT,
  order_index INTEGER NOT NULL DEFAULT 0,
  is_preview BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- 3. Progress Table
CREATE TABLE IF NOT EXISTS public.user_course_progress (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  lesson_id UUID NOT NULL REFERENCES public.course_lessons(id) ON DELETE CASCADE,
  completed BOOLEAN NOT NULL DEFAULT true,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(user_id, lesson_id)
);

-- Security (RLS)
ALTER TABLE public.course_chapters ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.course_lessons ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_course_progress ENABLE ROW LEVEL SECURITY;

-- Policies for public readability (we will refine this with access checks later)
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Chapters are publicly readable') THEN
        CREATE POLICY "Chapters are publicly readable" ON public.course_chapters FOR SELECT TO authenticated USING (true);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Lessons are publicly readable') THEN
        CREATE POLICY "Lessons are publicly readable" ON public.course_lessons FOR SELECT TO authenticated USING (true);
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Users can manage their own progress') THEN
        CREATE POLICY "Users can manage their own progress" ON public.user_course_progress 
          FOR ALL TO authenticated 
          USING (auth.uid() = user_id)
          WITH CHECK (auth.uid() = user_id);
    END IF;
END $$;

-- Vendor management policies
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Vendors can manage their chapters') THEN
        CREATE POLICY "Vendors can manage their chapters" ON public.course_chapters
          FOR ALL TO authenticated
          USING (
            course_id IN (
              SELECT id FROM public.products WHERE vendor_id IN (
                SELECT id FROM public.vendors WHERE user_id = auth.uid()
              )
            )
          );
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Vendors can manage their lessons') THEN
        CREATE POLICY "Vendors can manage their lessons" ON public.course_lessons
          FOR ALL TO authenticated
          USING (
            chapter_id IN (
              SELECT id FROM public.course_chapters WHERE course_id IN (
                SELECT id FROM public.products WHERE vendor_id IN (
                  SELECT id FROM public.vendors WHERE user_id = auth.uid()
                )
              )
            )
          );
    END IF;
END $$;

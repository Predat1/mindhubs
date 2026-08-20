-- MindHubs: free/paid products, student entitlements and LMS access.
-- Additive migration: existing products, orders and LMS records are preserved.

ALTER TABLE public.products
  ADD COLUMN IF NOT EXISTS pricing_mode TEXT NOT NULL DEFAULT 'paid',
  ADD COLUMN IF NOT EXISTS currency TEXT NOT NULL DEFAULT 'XOF',
  ADD COLUMN IF NOT EXISTS price_amount BIGINT;

ALTER TABLE public.products
  DROP CONSTRAINT IF EXISTS products_pricing_mode_check;

ALTER TABLE public.products
  ADD CONSTRAINT products_pricing_mode_check
  CHECK (pricing_mode IN ('free', 'paid'));

-- Backfill a canonical numeric amount without changing the legacy price text.
UPDATE public.products
SET price_amount = NULLIF(regexp_replace(COALESCE(price, ''), '[^0-9]', '', 'g'), '')::BIGINT
WHERE price_amount IS NULL;

UPDATE public.products
SET pricing_mode = CASE WHEN COALESCE(price_amount, 0) = 0 THEN 'free' ELSE 'paid' END
WHERE pricing_mode = 'paid' AND COALESCE(price_amount, 0) = 0;

ALTER TABLE public.products
  DROP CONSTRAINT IF EXISTS products_pricing_consistency_check;

ALTER TABLE public.products
  ADD CONSTRAINT products_pricing_consistency_check
  CHECK (
    (pricing_mode = 'free' AND COALESCE(price_amount, 0) = 0)
    OR pricing_mode = 'paid'
  );

CREATE TABLE IF NOT EXISTS public.course_settings (
  product_id TEXT PRIMARY KEY REFERENCES public.products(id) ON DELETE CASCADE,
  objectives TEXT[] NOT NULL DEFAULT '{}',
  prerequisites TEXT[] NOT NULL DEFAULT '{}',
  target_audience TEXT,
  level TEXT,
  language TEXT NOT NULL DEFAULT 'fr',
  estimated_minutes INTEGER CHECK (estimated_minutes IS NULL OR estimated_minutes >= 0),
  certificate_enabled BOOLEAN NOT NULL DEFAULT false,
  certificate_min_score NUMERIC(5,2) CHECK (certificate_min_score IS NULL OR (certificate_min_score >= 0 AND certificate_min_score <= 100)),
  drip_enabled BOOLEAN NOT NULL DEFAULT false,
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'published', 'archived')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.course_chapters
  ADD COLUMN IF NOT EXISTS status TEXT NOT NULL DEFAULT 'draft',
  ADD COLUMN IF NOT EXISTS estimated_minutes INTEGER,
  ADD COLUMN IF NOT EXISTS unlock_after_chapter_id UUID REFERENCES public.course_chapters(id) ON DELETE SET NULL;

ALTER TABLE public.course_lessons
  ADD COLUMN IF NOT EXISTS lesson_type TEXT NOT NULL DEFAULT 'video',
  ADD COLUMN IF NOT EXISTS duration_minutes INTEGER,
  ADD COLUMN IF NOT EXISTS transcript TEXT,
  ADD COLUMN IF NOT EXISTS is_published BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS unlock_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS unlock_after_lesson_id UUID REFERENCES public.course_lessons(id) ON DELETE SET NULL;

ALTER TABLE public.course_lessons
  DROP CONSTRAINT IF EXISTS course_lessons_lesson_type_check;

ALTER TABLE public.course_lessons
  ADD CONSTRAINT course_lessons_lesson_type_check
  CHECK (lesson_type IN ('video', 'text', 'pdf', 'download', 'external_link', 'quiz', 'assignment', 'live_session'));

CREATE TABLE IF NOT EXISTS public.product_entitlements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  product_id TEXT NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  source TEXT NOT NULL CHECK (source IN ('free_claim', 'purchase', 'admin_grant')),
  order_id UUID REFERENCES public.orders(id) ON DELETE SET NULL,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'revoked', 'expired')),
  granted_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  revoked_at TIMESTAMPTZ,
  expires_at TIMESTAMPTZ,
  UNIQUE(user_id, product_id)
);

CREATE INDEX IF NOT EXISTS product_entitlements_product_idx
  ON public.product_entitlements(product_id, status);
CREATE INDEX IF NOT EXISTS product_entitlements_user_idx
  ON public.product_entitlements(user_id, status);

CREATE TABLE IF NOT EXISTS public.student_enrollments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  course_id TEXT NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  entitlement_id UUID REFERENCES public.product_entitlements(id) ON DELETE SET NULL,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'completed', 'suspended', 'revoked')),
  enrolled_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  completed_at TIMESTAMPTZ,
  last_lesson_id UUID REFERENCES public.course_lessons(id) ON DELETE SET NULL,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(user_id, course_id)
);

CREATE INDEX IF NOT EXISTS student_enrollments_course_idx
  ON public.student_enrollments(course_id, status);
CREATE INDEX IF NOT EXISTS student_enrollments_user_idx
  ON public.student_enrollments(user_id, status);

CREATE TABLE IF NOT EXISTS public.lesson_resources (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  lesson_id UUID NOT NULL REFERENCES public.course_lessons(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  resource_type TEXT NOT NULL CHECK (resource_type IN ('file', 'link', 'text')),
  resource_path TEXT,
  resource_url TEXT,
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.quizzes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  lesson_id UUID NOT NULL REFERENCES public.course_lessons(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  instructions TEXT,
  passing_score NUMERIC(5,2) NOT NULL DEFAULT 70 CHECK (passing_score >= 0 AND passing_score <= 100),
  max_attempts INTEGER CHECK (max_attempts IS NULL OR max_attempts > 0),
  randomize_questions BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.quiz_questions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  quiz_id UUID NOT NULL REFERENCES public.quizzes(id) ON DELETE CASCADE,
  question_type TEXT NOT NULL CHECK (question_type IN ('single_choice', 'multiple_choice', 'true_false', 'short_answer')),
  prompt TEXT NOT NULL,
  explanation TEXT,
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.quiz_answers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  question_id UUID NOT NULL REFERENCES public.quiz_questions(id) ON DELETE CASCADE,
  answer_text TEXT NOT NULL,
  is_correct BOOLEAN NOT NULL DEFAULT false,
  sort_order INTEGER NOT NULL DEFAULT 0
);

CREATE TABLE IF NOT EXISTS public.quiz_attempts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  quiz_id UUID NOT NULL REFERENCES public.quizzes(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  score NUMERIC(5,2) NOT NULL DEFAULT 0 CHECK (score >= 0 AND score <= 100),
  passed BOOLEAN NOT NULL DEFAULT false,
  answers JSONB NOT NULL DEFAULT '{}'::jsonb,
  started_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  completed_at TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS quizzes_lesson_idx ON public.quizzes(lesson_id);
CREATE UNIQUE INDEX IF NOT EXISTS quizzes_lesson_unique_idx ON public.quizzes(lesson_id);
CREATE INDEX IF NOT EXISTS quiz_questions_quiz_idx ON public.quiz_questions(quiz_id, sort_order);
CREATE INDEX IF NOT EXISTS quiz_answers_question_idx ON public.quiz_answers(question_id, sort_order);
CREATE INDEX IF NOT EXISTS quiz_attempts_user_idx ON public.quiz_attempts(user_id, quiz_id, completed_at DESC);

CREATE TABLE IF NOT EXISTS public.assignments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  lesson_id UUID NOT NULL REFERENCES public.course_lessons(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  instructions TEXT NOT NULL DEFAULT '',
  max_score NUMERIC(8,2) CHECK (max_score IS NULL OR max_score >= 0),
  due_after_days INTEGER CHECK (due_after_days IS NULL OR due_after_days >= 0),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.assignment_submissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  assignment_id UUID NOT NULL REFERENCES public.assignments(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  submission_text TEXT,
  file_path TEXT,
  status TEXT NOT NULL DEFAULT 'submitted' CHECK (status IN ('submitted', 'needs_revision', 'graded', 'accepted')),
  score NUMERIC(8,2) CHECK (score IS NULL OR score >= 0),
  feedback TEXT,
  submitted_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  graded_at TIMESTAMPTZ,
  UNIQUE(assignment_id, user_id)
);

CREATE TABLE IF NOT EXISTS public.course_certificates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  course_id TEXT NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  certificate_number TEXT NOT NULL UNIQUE,
  verification_token UUID NOT NULL DEFAULT gen_random_uuid() UNIQUE,
  score NUMERIC(5,2),
  issued_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  revoked_at TIMESTAMPTZ,
  UNIQUE(course_id, user_id)
);

CREATE INDEX IF NOT EXISTS assignments_lesson_idx ON public.assignments(lesson_id);
CREATE INDEX IF NOT EXISTS assignment_submissions_student_idx ON public.assignment_submissions(user_id, status);
CREATE INDEX IF NOT EXISTS certificates_course_idx ON public.course_certificates(course_id, issued_at DESC);

CREATE TABLE IF NOT EXISTS public.payment_transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
  provider TEXT NOT NULL,
  provider_reference TEXT,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'paid', 'failed', 'refunded', 'cancelled')),
  amount BIGINT NOT NULL DEFAULT 0 CHECK (amount >= 0),
  currency TEXT NOT NULL DEFAULT 'XOF',
  idempotency_key TEXT NOT NULL UNIQUE,
  provider_payload JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS payment_transactions_order_idx
  ON public.payment_transactions(order_id, status);

-- Normalize the JSON cart written by the current checkout into the canonical
-- order_items table. This keeps legacy checkout clients compatible while
-- making confirmed orders usable by entitlements and vendor fulfillment.
CREATE OR REPLACE FUNCTION public.normalize_order_items_from_json()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_item JSONB;
  v_product_id TEXT;
  v_quantity INTEGER;
BEGIN
  IF jsonb_typeof(COALESCE(NEW.items, '[]'::jsonb)) <> 'array' THEN
    RETURN NEW;
  END IF;

  FOR v_item IN SELECT value FROM jsonb_array_elements(COALESCE(NEW.items, '[]'::jsonb)) LOOP
    v_product_id := COALESCE(v_item->>'product_id', v_item->>'id');
    IF v_product_id IS NULL OR v_product_id = '' THEN
      CONTINUE;
    END IF;

    v_quantity := CASE
      WHEN COALESCE(v_item->>'quantity', '') ~ '^[0-9]+$'
        THEN GREATEST((v_item->>'quantity')::INTEGER, 1)
      ELSE 1
    END;

    INSERT INTO public.order_items (
      order_id,
      product_id,
      vendor_id,
      title_snapshot,
      image_snapshot,
      unit_price,
      quantity,
      product_mode
    )
    SELECT
      NEW.id,
      p.id,
      p.vendor_id,
      COALESCE(NULLIF(v_item->>'title', ''), p.title),
      COALESCE(NULLIF(v_item->>'image', ''), p.image_url),
      CASE
        WHEN COALESCE(v_item->>'price', '') ~ '[0-9]'
          THEN COALESCE(NULLIF(regexp_replace(v_item->>'price', '[^0-9]', '', 'g'), '')::INTEGER, COALESCE(p.price_amount, 0)::INTEGER)
        ELSE COALESCE(p.price_amount, NULLIF(regexp_replace(COALESCE(p.price, ''), '[^0-9]', '', 'g'), '')::INTEGER, 0)
      END,
      v_quantity,
      CASE WHEN p.product_mode IN ('physical', 'hybrid') THEN p.product_mode ELSE 'digital' END
    FROM public.products p
    WHERE p.id = v_product_id
      AND NOT EXISTS (
        SELECT 1 FROM public.order_items oi
        WHERE oi.order_id = NEW.id AND oi.product_id = p.id
      );
  END LOOP;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS aaa_normalize_order_items_from_json ON public.orders;
CREATE TRIGGER aaa_normalize_order_items_from_json
  AFTER INSERT OR UPDATE OF items ON public.orders
  FOR EACH ROW
  EXECUTE FUNCTION public.normalize_order_items_from_json();

-- Run the same normalization once for legacy JSON orders before backfilling
-- their entitlements. No order data is deleted or rewritten semantically.
UPDATE public.orders
SET items = items
WHERE jsonb_typeof(COALESCE(items, '[]'::jsonb)) = 'array'
  AND jsonb_array_length(COALESCE(items, '[]'::jsonb)) > 0;

-- Backfill access for confirmed historical orders when normalized order_items exist.
INSERT INTO public.product_entitlements (user_id, product_id, source, order_id, status)
SELECT o.user_id, oi.product_id, 'purchase', o.id, 'active'
FROM public.orders o
JOIN public.order_items oi ON oi.order_id = o.id
WHERE o.user_id IS NOT NULL
  AND o.status = 'confirmed'
ON CONFLICT (user_id, product_id)
DO UPDATE SET status = 'active', order_id = EXCLUDED.order_id, revoked_at = NULL;

INSERT INTO public.student_enrollments (user_id, course_id, entitlement_id, status)
SELECT e.user_id, e.product_id, e.id, 'active'
FROM public.product_entitlements e
JOIN public.products p ON p.id = e.product_id AND p.is_lms = true
ON CONFLICT (user_id, course_id)
DO UPDATE SET status = 'active', entitlement_id = EXCLUDED.entitlement_id;

-- Access helper used by RLS and server-side RPCs.
CREATE OR REPLACE FUNCTION public.has_active_product_entitlement(p_user_id UUID, p_product_id TEXT)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.product_entitlements e
    WHERE e.user_id = p_user_id
      AND e.product_id = p_product_id
      AND e.status = 'active'
      AND (e.expires_at IS NULL OR e.expires_at > now())
  );
$$;

CREATE OR REPLACE FUNCTION public.claim_free_product(p_product_id TEXT)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_user_id UUID := auth.uid();
  v_entitlement_id UUID;
  v_is_public BOOLEAN;
  v_is_free BOOLEAN;
  v_is_course BOOLEAN;
BEGIN
  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'authentication_required';
  END IF;

  SELECT
    p.pricing_mode = 'free',
    p.is_lms,
    EXISTS (
      SELECT 1
      FROM public.product_publications pp
      WHERE pp.product_id = p.id
        AND pp.status = 'published'
        AND pp.channel IN ('storefront', 'marketplace')
    )
  INTO v_is_free, v_is_course, v_is_public
  FROM public.products p
  WHERE p.id = p_product_id
    AND p.status = 'published';

  IF NOT COALESCE(v_is_free, false) THEN
    RAISE EXCEPTION 'product_is_not_free';
  END IF;
  IF NOT COALESCE(v_is_public, false) THEN
    RAISE EXCEPTION 'product_not_published';
  END IF;

  INSERT INTO public.product_entitlements (user_id, product_id, source, status)
  VALUES (v_user_id, p_product_id, 'free_claim', 'active')
  ON CONFLICT (user_id, product_id)
  DO UPDATE SET status = 'active', revoked_at = NULL, expires_at = NULL
  RETURNING id INTO v_entitlement_id;

  IF COALESCE(v_is_course, false) THEN
    INSERT INTO public.student_enrollments (user_id, course_id, entitlement_id, status)
    VALUES (v_user_id, p_product_id, v_entitlement_id, 'active')
    ON CONFLICT (user_id, course_id)
    DO UPDATE SET status = 'active', entitlement_id = EXCLUDED.entitlement_id;
  END IF;

  RETURN v_entitlement_id;
END;
$$;

REVOKE ALL ON FUNCTION public.claim_free_product(TEXT) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.claim_free_product(TEXT) TO authenticated;

-- Existing order_items become the source of truth for paid access.
CREATE OR REPLACE FUNCTION public.grant_entitlements_for_confirmed_order()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_item RECORD;
  v_entitlement_id UUID;
BEGIN
  IF NEW.status = 'confirmed' AND (TG_OP = 'INSERT' OR OLD.status IS DISTINCT FROM 'confirmed') THEN
    FOR v_item IN
      SELECT oi.product_id, oi.order_id
      FROM public.order_items oi
      WHERE oi.order_id = NEW.id
    LOOP
      IF NEW.user_id IS NULL THEN
        CONTINUE;
      END IF;

      INSERT INTO public.product_entitlements (user_id, product_id, source, order_id, status)
      VALUES (NEW.user_id, v_item.product_id, 'purchase', NEW.id, 'active')
      ON CONFLICT (user_id, product_id)
      DO UPDATE SET status = 'active', order_id = EXCLUDED.order_id, revoked_at = NULL;

      SELECT id INTO v_entitlement_id
      FROM public.product_entitlements
      WHERE user_id = NEW.user_id AND product_id = v_item.product_id;

      INSERT INTO public.student_enrollments (user_id, course_id, entitlement_id, status)
      SELECT NEW.user_id, v_item.product_id, v_entitlement_id, 'active'
      FROM public.products p
      WHERE p.id = v_item.product_id AND p.is_lms = true
      ON CONFLICT (user_id, course_id)
      DO UPDATE SET status = 'active', entitlement_id = EXCLUDED.entitlement_id;
    END LOOP;
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trigger_grant_entitlements_for_confirmed_order ON public.orders;
CREATE TRIGGER trigger_grant_entitlements_for_confirmed_order
  AFTER INSERT OR UPDATE OF status ON public.orders
  FOR EACH ROW
  EXECUTE FUNCTION public.grant_entitlements_for_confirmed_order();

ALTER TABLE public.course_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.product_entitlements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.student_enrollments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.lesson_resources ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.quizzes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.quiz_questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.quiz_answers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.quiz_attempts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payment_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.assignment_submissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.course_certificates ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Chapters are publicly readable" ON public.course_chapters;
DROP POLICY IF EXISTS "Lessons are publicly readable" ON public.course_lessons;

CREATE POLICY "Published course chapters are readable"
  ON public.course_chapters FOR SELECT TO anon, authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.products p
      WHERE p.id = course_chapters.course_id
        AND p.status = 'published'
    )
    OR EXISTS (
      SELECT 1 FROM public.vendors v
      JOIN public.products p ON p.vendor_id = v.id
      WHERE p.id = course_chapters.course_id AND v.user_id = auth.uid()
    )
  );

CREATE POLICY "Preview or enrolled lessons are readable"
  ON public.course_lessons FOR SELECT TO anon, authenticated
  USING (
    (
      is_preview = true
      AND EXISTS (
        SELECT 1 FROM public.products p
        WHERE p.id = (SELECT course_id FROM public.course_chapters c WHERE c.id = course_lessons.chapter_id)
          AND p.status = 'published'
      )
    )
    OR public.has_active_product_entitlement(
      auth.uid(),
      (SELECT course_id FROM public.course_chapters c WHERE c.id = course_lessons.chapter_id)
    )
    OR EXISTS (
      SELECT 1
      FROM public.course_chapters c
      JOIN public.products p ON p.id = c.course_id
      JOIN public.vendors v ON v.id = p.vendor_id
      WHERE c.id = course_lessons.chapter_id AND v.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can read their entitlements"
  ON public.product_entitlements FOR SELECT TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Vendors can read their product entitlements"
  ON public.product_entitlements FOR SELECT TO authenticated
  USING (
    product_id IN (
      SELECT p.id FROM public.products p
      JOIN public.vendors v ON v.id = p.vendor_id
      WHERE v.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can read their enrollments"
  ON public.student_enrollments FOR SELECT TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Vendors can read course enrollments"
  ON public.student_enrollments FOR SELECT TO authenticated
  USING (
    course_id IN (
      SELECT p.id FROM public.products p
      JOIN public.vendors v ON v.id = p.vendor_id
      WHERE v.user_id = auth.uid()
    )
  );

CREATE POLICY "Students can read lesson resources with access"
  ON public.lesson_resources FOR SELECT TO authenticated
  USING (
    public.has_active_product_entitlement(
      auth.uid(),
      (SELECT c.course_id FROM public.course_chapters c JOIN public.course_lessons l ON l.chapter_id = c.id WHERE l.id = lesson_resources.lesson_id)
    )
  );

CREATE POLICY "Students can read quizzes with access"
  ON public.quizzes FOR SELECT TO authenticated
  USING (
    public.has_active_product_entitlement(
      auth.uid(),
      (SELECT c.course_id FROM public.course_chapters c JOIN public.course_lessons l ON l.chapter_id = c.id WHERE l.id = quizzes.lesson_id)
    )
  );

CREATE POLICY "Students can read quiz questions with access"
  ON public.quiz_questions FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1
      FROM public.quizzes q
      JOIN public.course_lessons l ON l.id = q.lesson_id
      JOIN public.course_chapters c ON c.id = l.chapter_id
      WHERE q.id = quiz_questions.quiz_id
        AND public.has_active_product_entitlement(auth.uid(), c.course_id)
    )
  );

CREATE POLICY "Students can read quiz answers with access"
  ON public.quiz_answers FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1
      FROM public.quiz_questions qq
      JOIN public.quizzes q ON q.id = qq.quiz_id
      JOIN public.course_lessons l ON l.id = q.lesson_id
      JOIN public.course_chapters c ON c.id = l.chapter_id
      WHERE qq.id = quiz_answers.question_id
        AND public.has_active_product_entitlement(auth.uid(), c.course_id)
    )
  );

CREATE POLICY "Students can manage their quiz attempts"
  ON public.quiz_attempts FOR ALL TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Students can read accessible assignments"
  ON public.assignments FOR SELECT TO authenticated
  USING (
    public.has_active_product_entitlement(
      auth.uid(),
      (SELECT c.course_id FROM public.course_chapters c JOIN public.course_lessons l ON l.chapter_id = c.id WHERE l.id = assignments.lesson_id)
    )
  );

CREATE POLICY "Vendors can manage their assignments"
  ON public.assignments FOR ALL TO authenticated
  USING (
    lesson_id IN (
      SELECT l.id FROM public.course_lessons l
      JOIN public.course_chapters c ON c.id = l.chapter_id
      JOIN public.products p ON p.id = c.course_id
      JOIN public.vendors v ON v.id = p.vendor_id
      WHERE v.user_id = auth.uid()
    )
  )
  WITH CHECK (
    lesson_id IN (
      SELECT l.id FROM public.course_lessons l
      JOIN public.course_chapters c ON c.id = l.chapter_id
      JOIN public.products p ON p.id = c.course_id
      JOIN public.vendors v ON v.id = p.vendor_id
      WHERE v.user_id = auth.uid()
    )
  );

CREATE POLICY "Students can manage their assignment submissions"
  ON public.assignment_submissions FOR ALL TO authenticated
  USING (
    user_id = auth.uid()
    AND public.has_active_product_entitlement(
      auth.uid(),
      (SELECT c.course_id FROM public.assignments a JOIN public.course_lessons l ON l.id = a.lesson_id JOIN public.course_chapters c ON c.id = l.chapter_id WHERE a.id = assignment_submissions.assignment_id)
    )
  )
  WITH CHECK (
    user_id = auth.uid()
    AND public.has_active_product_entitlement(
      auth.uid(),
      (SELECT c.course_id FROM public.assignments a JOIN public.course_lessons l ON l.id = a.lesson_id JOIN public.course_chapters c ON c.id = l.chapter_id WHERE a.id = assignment_submissions.assignment_id)
    )
  );

CREATE POLICY "Vendors can review assignment submissions"
  ON public.assignment_submissions FOR SELECT TO authenticated
  USING (
    assignment_id IN (
      SELECT a.id FROM public.assignments a
      JOIN public.course_lessons l ON l.id = a.lesson_id
      JOIN public.course_chapters c ON c.id = l.chapter_id
      JOIN public.products p ON p.id = c.course_id
      JOIN public.vendors v ON v.id = p.vendor_id
      WHERE v.user_id = auth.uid()
    )
  );

CREATE POLICY "Vendors can grade assignment submissions"
  ON public.assignment_submissions FOR UPDATE TO authenticated
  USING (
    assignment_id IN (
      SELECT a.id FROM public.assignments a
      JOIN public.course_lessons l ON l.id = a.lesson_id
      JOIN public.course_chapters c ON c.id = l.chapter_id
      JOIN public.products p ON p.id = c.course_id
      JOIN public.vendors v ON v.id = p.vendor_id
      WHERE v.user_id = auth.uid()
    )
  )
  WITH CHECK (
    assignment_id IN (
      SELECT a.id FROM public.assignments a
      JOIN public.course_lessons l ON l.id = a.lesson_id
      JOIN public.course_chapters c ON c.id = l.chapter_id
      JOIN public.products p ON p.id = c.course_id
      JOIN public.vendors v ON v.id = p.vendor_id
      WHERE v.user_id = auth.uid()
    )
  );

CREATE POLICY "Students can read their certificates"
  ON public.course_certificates FOR SELECT TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Vendors can manage course certificates"
  ON public.course_certificates FOR ALL TO authenticated
  USING (
    course_id IN (
      SELECT p.id FROM public.products p
      JOIN public.vendors v ON v.id = p.vendor_id
      WHERE v.user_id = auth.uid()
    )
  )
  WITH CHECK (
    course_id IN (
      SELECT p.id FROM public.products p
      JOIN public.vendors v ON v.id = p.vendor_id
      WHERE v.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can read their payment transactions"
  ON public.payment_transactions FOR SELECT TO authenticated
  USING (order_id IN (SELECT id FROM public.orders WHERE user_id = auth.uid()));

CREATE POLICY "Vendors can manage their course settings"
  ON public.course_settings FOR ALL TO authenticated
  USING (
    product_id IN (
      SELECT p.id FROM public.products p
      JOIN public.vendors v ON v.id = p.vendor_id
      WHERE v.user_id = auth.uid()
    )
  )
  WITH CHECK (
    product_id IN (
      SELECT p.id FROM public.products p
      JOIN public.vendors v ON v.id = p.vendor_id
      WHERE v.user_id = auth.uid()
    )
  );

CREATE POLICY "Vendors can manage lesson resources"
  ON public.lesson_resources FOR ALL TO authenticated
  USING (
    lesson_id IN (
      SELECT l.id
      FROM public.course_lessons l
      JOIN public.course_chapters c ON c.id = l.chapter_id
      JOIN public.products p ON p.id = c.course_id
      JOIN public.vendors v ON v.id = p.vendor_id
      WHERE v.user_id = auth.uid()
    )
  )
  WITH CHECK (
    lesson_id IN (
      SELECT l.id
      FROM public.course_lessons l
      JOIN public.course_chapters c ON c.id = l.chapter_id
      JOIN public.products p ON p.id = c.course_id
      JOIN public.vendors v ON v.id = p.vendor_id
      WHERE v.user_id = auth.uid()
    )
  );

CREATE POLICY "Vendors can manage course quizzes"
  ON public.quizzes FOR ALL TO authenticated
  USING (
    lesson_id IN (
      SELECT l.id
      FROM public.course_lessons l
      JOIN public.course_chapters c ON c.id = l.chapter_id
      JOIN public.products p ON p.id = c.course_id
      JOIN public.vendors v ON v.id = p.vendor_id
      WHERE v.user_id = auth.uid()
    )
  )
  WITH CHECK (
    lesson_id IN (
      SELECT l.id
      FROM public.course_lessons l
      JOIN public.course_chapters c ON c.id = l.chapter_id
      JOIN public.products p ON p.id = c.course_id
      JOIN public.vendors v ON v.id = p.vendor_id
      WHERE v.user_id = auth.uid()
    )
  );

CREATE POLICY "Vendors can manage quiz questions"
  ON public.quiz_questions FOR ALL TO authenticated
  USING (
    quiz_id IN (
      SELECT q.id FROM public.quizzes q
      JOIN public.course_lessons l ON l.id = q.lesson_id
      JOIN public.course_chapters c ON c.id = l.chapter_id
      JOIN public.products p ON p.id = c.course_id
      JOIN public.vendors v ON v.id = p.vendor_id
      WHERE v.user_id = auth.uid()
    )
  )
  WITH CHECK (
    quiz_id IN (
      SELECT q.id FROM public.quizzes q
      JOIN public.course_lessons l ON l.id = q.lesson_id
      JOIN public.course_chapters c ON c.id = l.chapter_id
      JOIN public.products p ON p.id = c.course_id
      JOIN public.vendors v ON v.id = p.vendor_id
      WHERE v.user_id = auth.uid()
    )
  );

CREATE POLICY "Vendors can manage quiz answers"
  ON public.quiz_answers FOR ALL TO authenticated
  USING (
    question_id IN (
      SELECT qq.id
      FROM public.quiz_questions qq
      JOIN public.quizzes q ON q.id = qq.quiz_id
      JOIN public.course_lessons l ON l.id = q.lesson_id
      JOIN public.course_chapters c ON c.id = l.chapter_id
      JOIN public.products p ON p.id = c.course_id
      JOIN public.vendors v ON v.id = p.vendor_id
      WHERE v.user_id = auth.uid()
    )
  )
  WITH CHECK (
    question_id IN (
      SELECT qq.id
      FROM public.quiz_questions qq
      JOIN public.quizzes q ON q.id = qq.quiz_id
      JOIN public.course_lessons l ON l.id = q.lesson_id
      JOIN public.course_chapters c ON c.id = l.chapter_id
      JOIN public.products p ON p.id = c.course_id
      JOIN public.vendors v ON v.id = p.vendor_id
      WHERE v.user_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "Users can manage their own progress" ON public.user_course_progress;
CREATE POLICY "Enrolled users can manage their own progress"
  ON public.user_course_progress FOR ALL TO authenticated
  USING (
    user_id = auth.uid()
    AND lesson_id IN (
      SELECT l.id
      FROM public.course_lessons l
      JOIN public.course_chapters c ON c.id = l.chapter_id
      WHERE public.has_active_product_entitlement(auth.uid(), c.course_id)
    )
  )
  WITH CHECK (
    user_id = auth.uid()
    AND lesson_id IN (
      SELECT l.id
      FROM public.course_lessons l
      JOIN public.course_chapters c ON c.id = l.chapter_id
      WHERE public.has_active_product_entitlement(auth.uid(), c.course_id)
    )
  );

CREATE OR REPLACE FUNCTION public.touch_course_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS course_settings_updated_at ON public.course_settings;
CREATE TRIGGER course_settings_updated_at
  BEFORE UPDATE ON public.course_settings
  FOR EACH ROW EXECUTE FUNCTION public.touch_course_updated_at();

DROP TRIGGER IF EXISTS student_enrollments_updated_at ON public.student_enrollments;
CREATE TRIGGER student_enrollments_updated_at
  BEFORE UPDATE ON public.student_enrollments
  FOR EACH ROW EXECUTE FUNCTION public.touch_course_updated_at();

DROP TRIGGER IF EXISTS payment_transactions_updated_at ON public.payment_transactions;
CREATE TRIGGER payment_transactions_updated_at
  BEFORE UPDATE ON public.payment_transactions
  FOR EACH ROW EXECUTE FUNCTION public.touch_course_updated_at();

-- Quiz scoring is performed in the database so a browser cannot forge a
-- passing score. Short-answer questions remain instructor-reviewed in this
-- first LMS iteration; objective questions are scored automatically.
CREATE OR REPLACE FUNCTION public.submit_quiz_attempt(
  p_quiz_id UUID,
  p_answers JSONB
)
RETURNS TABLE (
  attempt_id UUID,
  score NUMERIC,
  passed BOOLEAN,
  attempts_remaining INTEGER
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_user_id UUID := auth.uid();
  v_course_id TEXT;
  v_passing_score NUMERIC;
  v_max_attempts INTEGER;
  v_attempts_used INTEGER;
  v_total INTEGER := 0;
  v_correct INTEGER := 0;
  v_question RECORD;
  v_response JSONB;
  v_correct_answers JSONB;
  v_score NUMERIC;
  v_passed BOOLEAN;
  v_attempt_id UUID;
BEGIN
  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'authentication_required';
  END IF;

  SELECT c.course_id, q.passing_score, q.max_attempts
  INTO v_course_id, v_passing_score, v_max_attempts
  FROM public.quizzes q
  JOIN public.course_lessons l ON l.id = q.lesson_id
  JOIN public.course_chapters c ON c.id = l.chapter_id
  WHERE q.id = p_quiz_id;

  IF v_course_id IS NULL OR NOT public.has_active_product_entitlement(v_user_id, v_course_id) THEN
    RAISE EXCEPTION 'course_access_required';
  END IF;

  SELECT COUNT(*)::INTEGER
  INTO v_attempts_used
  FROM public.quiz_attempts
  WHERE quiz_id = p_quiz_id AND user_id = v_user_id;

  IF v_max_attempts IS NOT NULL AND v_attempts_used >= v_max_attempts THEN
    RAISE EXCEPTION 'maximum_attempts_reached';
  END IF;

  FOR v_question IN
    SELECT id, question_type
    FROM public.quiz_questions
    WHERE quiz_id = p_quiz_id
    ORDER BY sort_order
  LOOP
    v_total := v_total + 1;
    v_response := COALESCE(p_answers -> v_question.id::TEXT, 'null'::JSONB);

    SELECT COALESCE(
      jsonb_agg(to_jsonb(a.id::TEXT) ORDER BY a.sort_order),
      '[]'::JSONB
    )
    INTO v_correct_answers
    FROM public.quiz_answers a
    WHERE a.question_id = v_question.id AND a.is_correct = true;

    IF v_question.question_type = 'multiple_choice' THEN
      IF jsonb_typeof(v_response) = 'array'
        AND v_response @> v_correct_answers
        AND v_correct_answers @> v_response THEN
        v_correct := v_correct + 1;
      END IF;
    ELSIF v_question.question_type <> 'short_answer'
      AND v_response = COALESCE(v_correct_answers -> 0, 'null'::JSONB) THEN
      v_correct := v_correct + 1;
    END IF;
  END LOOP;

  v_score := CASE WHEN v_total = 0 THEN 0 ELSE ROUND((v_correct * 100.0) / v_total, 2) END;
  v_passed := v_score >= COALESCE(v_passing_score, 70);

  INSERT INTO public.quiz_attempts (quiz_id, user_id, score, passed, answers, completed_at)
  VALUES (p_quiz_id, v_user_id, v_score, v_passed, COALESCE(p_answers, '{}'::JSONB), now())
  RETURNING id INTO v_attempt_id;

  RETURN QUERY SELECT
    v_attempt_id,
    v_score,
    v_passed,
    CASE WHEN v_max_attempts IS NULL THEN NULL ELSE v_max_attempts - v_attempts_used - 1 END;
END;
$$;

REVOKE ALL ON FUNCTION public.submit_quiz_attempt(UUID, JSONB) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.submit_quiz_attempt(UUID, JSONB) TO authenticated;

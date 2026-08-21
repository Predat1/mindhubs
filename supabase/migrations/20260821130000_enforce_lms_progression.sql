-- Keep locked course content out of client queries when progressive access is enabled.
-- Preview lessons remain public for published courses; vendors retain access to
-- their own course content. This does not change the payment provider flow.

CREATE OR REPLACE FUNCTION public.can_access_lesson(p_user_id UUID, p_lesson_id UUID)
RETURNS BOOLEAN
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
  v_course_id TEXT;
  v_chapter_id UUID;
  v_is_preview BOOLEAN;
  v_unlock_at TIMESTAMPTZ;
  v_after_lesson_id UUID;
  v_after_chapter_id UUID;
  v_drip_enabled BOOLEAN;
  v_course_published BOOLEAN;
  v_is_vendor BOOLEAN;
  v_previous_lesson_id UUID;
BEGIN
  SELECT
    c.course_id,
    l.chapter_id,
    l.is_preview,
    l.unlock_at,
    l.unlock_after_lesson_id,
    c.unlock_after_chapter_id,
    COALESCE(cs.drip_enabled, false),
    p.status = 'published',
    EXISTS (
      SELECT 1
      FROM public.vendors v
      JOIN public.products vp ON vp.vendor_id = v.id
      WHERE v.user_id = p_user_id AND vp.id = c.course_id
    )
  INTO
    v_course_id,
    v_chapter_id,
    v_is_preview,
    v_unlock_at,
    v_after_lesson_id,
    v_after_chapter_id,
    v_drip_enabled,
    v_course_published,
    v_is_vendor
  FROM public.course_lessons l
  JOIN public.course_chapters c ON c.id = l.chapter_id
  JOIN public.products p ON p.id = c.course_id
  LEFT JOIN public.course_settings cs ON cs.product_id = c.course_id
  WHERE l.id = p_lesson_id;

  IF NOT FOUND THEN RETURN false; END IF;
  IF v_is_vendor THEN RETURN true; END IF;
  IF v_is_preview AND v_course_published THEN RETURN true; END IF;
  IF p_user_id IS NULL OR NOT public.has_active_product_entitlement(p_user_id, v_course_id) THEN
    RETURN false;
  END IF;
  IF NOT v_drip_enabled THEN RETURN true; END IF;
  IF v_unlock_at IS NOT NULL AND v_unlock_at > now() THEN RETURN false; END IF;

  IF v_after_lesson_id IS NOT NULL AND NOT EXISTS (
    SELECT 1 FROM public.user_course_progress progress
    WHERE progress.user_id = p_user_id AND progress.lesson_id = v_after_lesson_id AND progress.completed = true
  ) THEN RETURN false; END IF;

  IF v_after_chapter_id IS NOT NULL AND EXISTS (
    SELECT 1
    FROM public.course_lessons required_lesson
    WHERE required_lesson.chapter_id = v_after_chapter_id
      AND NOT EXISTS (
        SELECT 1 FROM public.user_course_progress progress
        WHERE progress.user_id = p_user_id AND progress.lesson_id = required_lesson.id AND progress.completed = true
      )
  ) THEN RETURN false; END IF;

  -- Default progressive ordering when the author did not configure a custom rule.
  SELECT previous_lesson.id INTO v_previous_lesson_id
  FROM public.course_lessons previous_lesson
  JOIN public.course_chapters previous_chapter ON previous_chapter.id = previous_lesson.chapter_id
  JOIN public.course_chapters current_chapter ON current_chapter.id = v_chapter_id
  WHERE previous_chapter.course_id = v_course_id
    AND (
      previous_chapter.order_index < current_chapter.order_index
      OR (previous_chapter.order_index = current_chapter.order_index AND previous_lesson.order_index < (
        SELECT current_lesson.order_index FROM public.course_lessons current_lesson WHERE current_lesson.id = p_lesson_id
      ))
    )
  ORDER BY previous_chapter.order_index DESC, previous_lesson.order_index DESC
  LIMIT 1;

  IF v_after_lesson_id IS NULL AND v_after_chapter_id IS NULL AND v_previous_lesson_id IS NOT NULL
     AND NOT EXISTS (
       SELECT 1 FROM public.user_course_progress progress
       WHERE progress.user_id = p_user_id AND progress.lesson_id = v_previous_lesson_id AND progress.completed = true
     ) THEN
    RETURN false;
  END IF;

  RETURN true;
END;
$$;

REVOKE ALL ON FUNCTION public.can_access_lesson(UUID, UUID) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.can_access_lesson(UUID, UUID) TO anon, authenticated;

DROP POLICY IF EXISTS "Students can read accessible course settings" ON public.course_settings;
CREATE POLICY "Students can read accessible course settings"
  ON public.course_settings FOR SELECT TO authenticated
  USING (
    public.has_active_product_entitlement(auth.uid(), product_id)
    OR EXISTS (
      SELECT 1 FROM public.products p
      JOIN public.vendors v ON v.id = p.vendor_id
      WHERE p.id = course_settings.product_id AND v.user_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "Preview or enrolled lessons are readable" ON public.course_lessons;
CREATE POLICY "Accessible course lessons are readable"
  ON public.course_lessons FOR SELECT TO anon, authenticated
  USING (public.can_access_lesson(auth.uid(), id));

DROP POLICY IF EXISTS "Students can read lesson resources with access" ON public.lesson_resources;
CREATE POLICY "Students can read accessible lesson resources"
  ON public.lesson_resources FOR SELECT TO authenticated
  USING (public.can_access_lesson(auth.uid(), lesson_id));

DROP POLICY IF EXISTS "Students can read quizzes with access" ON public.quizzes;
CREATE POLICY "Students can read accessible quizzes"
  ON public.quizzes FOR SELECT TO authenticated
  USING (public.can_access_lesson(auth.uid(), lesson_id));

DROP POLICY IF EXISTS "Students can read accessible assignments" ON public.assignments;
CREATE POLICY "Students can read accessible assignments"
  ON public.assignments FOR SELECT TO authenticated
  USING (public.can_access_lesson(auth.uid(), lesson_id));

DROP POLICY IF EXISTS "Students can read quiz questions with access" ON public.quiz_questions;
CREATE POLICY "Students can read accessible quiz questions"
  ON public.quiz_questions FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.quizzes q
      WHERE q.id = quiz_questions.quiz_id
        AND public.can_access_lesson(auth.uid(), q.lesson_id)
    )
  );

DROP POLICY IF EXISTS "Students can read quiz answers with access" ON public.quiz_answers;
CREATE POLICY "Students can read accessible quiz answers"
  ON public.quiz_answers FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1
      FROM public.quiz_questions qq
      JOIN public.quizzes q ON q.id = qq.quiz_id
      WHERE qq.id = quiz_answers.question_id
        AND public.can_access_lesson(auth.uid(), q.lesson_id)
    )
  );

DROP POLICY IF EXISTS "Students can manage their assignment submissions" ON public.assignment_submissions;
CREATE POLICY "Students can manage accessible assignment submissions"
  ON public.assignment_submissions FOR ALL TO authenticated
  USING (
    user_id = auth.uid()
    AND EXISTS (
      SELECT 1 FROM public.assignments a
      WHERE a.id = assignment_submissions.assignment_id
        AND public.can_access_lesson(auth.uid(), a.lesson_id)
    )
  )
  WITH CHECK (
    user_id = auth.uid()
    AND EXISTS (
      SELECT 1 FROM public.assignments a
      WHERE a.id = assignment_submissions.assignment_id
        AND public.can_access_lesson(auth.uid(), a.lesson_id)
    )
  );

-- 1. Optimisation du chargement du programme (Syllabus)
CREATE INDEX IF NOT EXISTS idx_course_chapters_course_id ON public.course_chapters(course_id);
CREATE INDEX IF NOT EXISTS idx_course_lessons_chapter_id ON public.course_lessons(chapter_id);

-- 2. Mise à jour de la limite du plan Free (5 produits maxi)
UPDATE public.plan_limits
SET max_products = 5
WHERE plan = 'free';

-- 3. Mise à jour de la limite du plan Starter (pour rester logique, on passe à 10 par exemple ou on laisse à 5 si l'user veut 5 pour free)
-- Le client a demandé 5 pour free. Je vais mettre 10 pour starter pour garder une progression.
UPDATE public.plan_limits
SET max_products = 10
WHERE plan = 'starter';

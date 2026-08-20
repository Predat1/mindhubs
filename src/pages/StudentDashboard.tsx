import { useQuery } from "@tanstack/react-query";
import { ArrowRight, BookOpen, CheckCircle2, Clock3, GraduationCap, Loader2, LockKeyhole } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import Navbar from "@/components/Navbar";
import Footer from "@/components/FooterSection";
import SEO from "@/components/SEO";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";

type CourseCard = {
  id: string;
  title: string;
  image_url: string | null;
  totalLessons: number;
  completedLessons: number;
  lastLessonId: string | null;
};

export default function StudentDashboard() {
  const { user } = useAuth();

  const { data, isLoading, error } = useQuery({
    queryKey: ["student-dashboard", user?.id],
    enabled: Boolean(user?.id),
    queryFn: async (): Promise<CourseCard[]> => {
      const { data: entitlements, error: entitlementError } = await (supabase as any)
        .from("product_entitlements")
        .select("product_id, products!inner(id, title, image_url, is_lms)")
        .eq("user_id", user!.id)
        .eq("status", "active")
        .eq("products.is_lms", true);
      if (entitlementError) throw entitlementError;

      const courseIds = (entitlements || []).map((entry: any) => entry.product_id).filter(Boolean);
      if (courseIds.length === 0) return [];

      const { data: chapters, error: chapterError } = await (supabase as any)
        .from("course_chapters")
        .select("course_id, lessons:course_lessons(id)")
        .in("course_id", courseIds);
      if (chapterError) throw chapterError;

      const lessonIds = (chapters || []).flatMap((chapter: any) => (chapter.lessons || []).map((lesson: any) => lesson.id));
      const { data: progress } = lessonIds.length > 0
        ? await (supabase as any).from("user_course_progress").select("lesson_id").eq("user_id", user!.id).in("lesson_id", lessonIds)
        : { data: [] };
      const completedIds = new Set((progress || []).map((item: any) => item.lesson_id));

      const { data: enrollments } = await (supabase as any)
        .from("student_enrollments")
        .select("course_id, last_lesson_id")
        .eq("user_id", user!.id)
        .in("course_id", courseIds);
      const lastLessons = new Map((enrollments || []).map((entry: any) => [entry.course_id, entry.last_lesson_id]));

      return courseIds.map((courseId: string) => {
        const product = (entitlements || []).find((entry: any) => entry.product_id === courseId)?.products || {};
        const courseLessonIds = (chapters || []).filter((chapter: any) => chapter.course_id === courseId)
          .flatMap((chapter: any) => (chapter.lessons || []).map((lesson: any) => lesson.id));
        return {
          id: courseId,
          title: product.title || "Formation MindHubs",
          image_url: product.image_url || null,
          totalLessons: courseLessonIds.length,
          completedLessons: courseLessonIds.filter((lessonId: string) => completedIds.has(lessonId)).length,
          lastLessonId: lastLessons.get(courseId) || null,
        };
      });
    },
  });

  const courses = data || [];
  const completed = courses.filter((course) => course.totalLessons > 0 && course.completedLessons >= course.totalLessons);
  const active = courses.filter((course) => !completed.includes(course));

  return (
    <div className="min-h-screen bg-background">
      <SEO title="Mes formations | MindHubs" description="Reprenez vos formations et suivez votre progression sur MindHubs." />
      <Navbar />
      <main className="container mx-auto max-w-6xl px-4 py-24">
        <div className="space-y-10">
          <header className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-primary"><GraduationCap size={20} aria-hidden="true" /><span className="text-xs font-black uppercase tracking-widest">Espace étudiant</span></div>
              <h1 className="text-4xl font-black tracking-tight md:text-5xl">Mes formations</h1>
              <p className="max-w-2xl text-muted-foreground">Retrouvez vos accès gratuits et payants, reprenez votre dernière leçon et progressez à votre rythme.</p>
            </div>
            <Button asChild variant="outline" className="min-h-11 rounded-xl gap-2"><Link to="/boutique">Découvrir des formations <ArrowRight size={16} /></Link></Button>
          </header>

          {!user ? (
            <section className="rounded-3xl border border-primary/20 bg-primary/5 p-8 text-center">
              <LockKeyhole className="mx-auto mb-4 text-primary" />
              <h2 className="text-xl font-bold">Connectez-vous pour retrouver vos formations</h2>
              <p className="mx-auto mt-2 max-w-md text-sm text-muted-foreground">Votre progression est liée à votre compte afin de pouvoir reprendre sur n’importe quel appareil.</p>
              <Button asChild className="mt-6 min-h-11 rounded-xl"><Link to="/mon-compte?redirect=/mes-formations">Se connecter</Link></Button>
            </section>
          ) : isLoading ? (
            <div className="flex min-h-48 items-center justify-center gap-2 text-muted-foreground" role="status"><Loader2 className="size-5 animate-spin" /> Chargement de votre espace…</div>
          ) : error ? (
            <div className="rounded-3xl border border-destructive/30 bg-destructive/10 p-8 text-center text-sm text-destructive" role="alert">Impossible de charger vos formations. Réessayez dans quelques instants.</div>
          ) : courses.length === 0 ? (
            <section className="rounded-3xl border border-dashed border-border bg-card p-10 text-center">
              <BookOpen className="mx-auto mb-4 size-10 text-muted-foreground" />
              <h2 className="text-xl font-bold">Votre espace est prêt</h2>
              <p className="mx-auto mt-2 max-w-md text-sm text-muted-foreground">Obtenez une formation gratuite ou achetez un cours pour le retrouver ici.</p>
              <Button asChild className="mt-6 min-h-11 rounded-xl"><Link to="/boutique">Voir le catalogue</Link></Button>
            </section>
          ) : (
            <>
              {active.length > 0 && <CourseSection title="En cours" courses={active} />}
              {completed.length > 0 && <CourseSection title="Terminées" courses={completed} />}
            </>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
}

function CourseSection({ title, courses }: { title: string; courses: CourseCard[] }) {
  return (
    <section className="space-y-4" aria-labelledby={`student-${title}`}>
      <h2 id={`student-${title}`} className="text-2xl font-black">{title}</h2>
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {courses.map((course) => {
          const percentage = course.totalLessons ? Math.round((course.completedLessons / course.totalLessons) * 100) : 0;
          return (
            <article key={course.id} className="overflow-hidden rounded-3xl border border-border bg-card transition-colors hover:border-primary/40">
              <div className="aspect-video bg-muted">
                <img src={course.image_url || "/placeholder.svg"} alt="" className="h-full w-full object-cover" />
              </div>
              <div className="space-y-4 p-5">
                <div className="flex items-start justify-between gap-3"><h3 className="font-bold leading-tight">{course.title}</h3>{percentage === 100 && <CheckCircle2 className="shrink-0 text-success" size={18} aria-label="Formation terminée" />}</div>
                <div className="space-y-2"><div className="flex justify-between text-xs text-muted-foreground"><span>{course.completedLessons}/{course.totalLessons || 0} leçons</span><span>{percentage}%</span></div><Progress value={percentage} className="h-2" /></div>
                <div className="flex items-center justify-between gap-3"><span className="flex items-center gap-1 text-xs text-muted-foreground"><Clock3 size={13} /> Progression sauvegardée</span><Button asChild size="sm" className="min-h-10 rounded-xl gap-2"><Link to={`/formation/${course.id}`}>{percentage ? "Continuer" : "Commencer"}<ArrowRight size={14} /></Link></Button></div>
              </div>
            </article>
          );
        })}
      </div>
    </section>
  );
}


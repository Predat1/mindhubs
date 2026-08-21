import { useState, useEffect } from "react";
import { 
  Play, CheckCircle2, Circle, ChevronRight, 
  Menu, X, ArrowLeft, Trophy, MessageSquare, Video, FileText,
  FileDown, Link2, ClipboardList, CalendarClock, Lock, Loader2
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { motion, AnimatePresence } from "motion/react";
import QuizPlayer from "@/components/lms/QuizPlayer";

interface Lesson {
  id: string;
  chapter_id: string;
  title: string;
  video_url: string;
  content_text: string;
  order_index: number;
  lesson_type?: "video" | "text" | "pdf" | "download" | "external_link" | "quiz" | "assignment" | "live_session";
  duration_minutes?: number | null;
  is_preview?: boolean;
  unlock_at?: string | null;
  unlock_after_lesson_id?: string | null;
  unlock_after_chapter_id?: string | null;
}

interface Chapter {
  id: string;
  title: string;
  lessons: Lesson[];
}

interface CoursePlayerProps {
  courseId: string;
  courseTitle: string;
}

interface LessonResource {
  id: string;
  title: string;
  resource_type: "file" | "link" | "text";
  resource_path?: string | null;
  resource_url?: string | null;
}

interface Assignment {
  id: string;
  title: string;
  instructions: string;
  max_score?: number | null;
  due_after_days?: number | null;
}

interface AssignmentSubmission {
  id: string;
  submission_text: string | null;
  status: "submitted" | "needs_revision" | "graded" | "accepted";
  feedback: string | null;
}

const CoursePlayer = ({ courseId, courseTitle }: CoursePlayerProps) => {
  const [chapters, setChapters] = useState<Chapter[]>([]);
  const [currentLesson, setCurrentLesson] = useState<Lesson | null>(null);
  const [completedLessons, setCompletedLessons] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [dripEnabled, setDripEnabled] = useState(false);
  const [resources, setResources] = useState<LessonResource[]>([]);
  const [assignment, setAssignment] = useState<Assignment | null>(null);
  const [submission, setSubmission] = useState<AssignmentSubmission | null>(null);
  const [submissionText, setSubmissionText] = useState("");
  const [submittingAssignment, setSubmittingAssignment] = useState(false);

  useEffect(() => {
    fetchCourseData();
  }, [courseId]);

  const fetchCourseData = async () => {
    setLoading(true);
    try {
      // 1. Fetch structure
      const { data: chaptersData, error: chError } = await (supabase as any)
        .from("course_chapters")
        .select(`*, lessons:course_lessons(*)`)
        .eq("course_id", courseId)
        .order("order_index", { ascending: true });

      if (chError) throw chError;

      const structured = (chaptersData || []).map(ch => ({
        ...ch,
        lessons: (ch.lessons || []).sort((a: any, b: any) => a.order_index - b.order_index)
      }));

      setChapters(structured);

      const { data: courseSettings } = await (supabase as any)
        .from("course_settings")
        .select("drip_enabled")
        .eq("product_id", courseId)
        .maybeSingle();
      setDripEnabled(Boolean(courseSettings?.drip_enabled));

      // 2. Fetch progress
      const { data: { user } } = await supabase.auth.getUser();
      const lessonIds = structured.flatMap((chapter: Chapter) => chapter.lessons.map((lesson: Lesson) => lesson.id));
      let completedIds: string[] = [];
      if (user && lessonIds.length > 0) {
        const { data: progressData } = await (supabase as any)
          .from("user_course_progress")
          .select("lesson_id")
          .eq("user_id", user.id)
          .in("lesson_id", lessonIds);
        
        completedIds = (progressData || []).map((p: any) => p.lesson_id);
        setCompletedLessons(completedIds);
      }

      // Set first lesson as default
      if (structured.length > 0 && structured[0].lessons.length > 0) {
        const savedLessonId = window.localStorage.getItem(`mindhubs:last-lesson:${courseId}`);
        const savedLesson = lessonIds.includes(savedLessonId || "")
          ? structured.flatMap((chapter: Chapter) => chapter.lessons).find((lesson: Lesson) => lesson.id === savedLessonId)
          : undefined;
        const firstLesson = structured[0].lessons[0];
        const savedIsUnlocked = !courseSettings?.drip_enabled
          || !savedLesson
          || savedLesson.id === firstLesson.id
          || (savedLesson.unlock_after_lesson_id ? completedIds.includes(savedLesson.unlock_after_lesson_id) : false);
        setCurrentLesson(savedLesson && savedIsUnlocked ? savedLesson : firstLesson);
      }
    } catch (error: any) {
      toast.error("Erreur de chargement", { description: error.message });
    } finally {
      setLoading(false);
    }
  };

  const toggleComplete = async (lessonId: string) => {
    try {
      const lesson = lessonList.find((item) => item.id === lessonId);
      if (lesson && getUnlockReason(lesson)) {
        toast.error("Cette leçon est encore verrouillée");
        return;
      }
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      if (completedLessons.includes(lessonId)) {
        const { error } = await (supabase as any)
          .from("user_course_progress")
          .delete()
          .eq("user_id", user.id)
          .eq("lesson_id", lessonId);
        if (error) throw error;
        
        setCompletedLessons(prev => prev.filter(id => id !== lessonId));
      } else {
        const { error } = await (supabase as any)
          .from("user_course_progress")
          .insert([{ user_id: user.id, lesson_id: lessonId }]);
        if (error) throw error;
        
        setCompletedLessons(prev => [...prev, lessonId]);
        toast.success("Leçon terminée ! 🎯");
      }

      const { error: enrollmentError } = await (supabase as any)
        .from("student_enrollments")
        .update({ last_lesson_id: lessonId })
        .eq("user_id", user.id)
        .eq("course_id", courseId);
      if (enrollmentError) throw enrollmentError;
    } catch (error: any) {
      toast.error("Erreur de progression");
    }
  };

  const getEmbedUrl = (url: string) => {
    if (!url) return null;
    
    // YouTube
    const ytMatch = url.match(/(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/);
    if (ytMatch) return `https://www.youtube.com/embed/${ytMatch[1]}?rel=0&modestbranding=1`;

    // Vimeo
    const vimeoMatch = url.match(/(?:vimeo\.com\/|player\.vimeo\.com\/video\/)([0-9]+)/);
    if (vimeoMatch) return `https://player.vimeo.com/video/${vimeoMatch[1]}?badge=0&autopause=0&player_id=0&app_id=58479`;

    // Unknown providers are intentionally not embedded. This keeps the
    // student player predictable and prevents arbitrary third-party frames.
    return null;
  };

  const lessonList = chapters.flatMap((chapter) => chapter.lessons);
  const currentLessonIndex = currentLesson ? lessonList.findIndex((lesson) => lesson.id === currentLesson.id) : -1;
  const progress = lessonList.length > 0
    ? (completedLessons.filter((id) => lessonList.some((lesson) => lesson.id === id)).length / lessonList.length) * 100
    : 0;

  const getUnlockReason = (lesson: Lesson): string | null => {
    if (!dripEnabled) return null;
    if (lesson.unlock_at && new Date(lesson.unlock_at).getTime() > Date.now()) {
      return `Disponible le ${new Date(lesson.unlock_at).toLocaleDateString("fr-FR")}`;
    }
    if (lesson.unlock_after_lesson_id && !completedLessons.includes(lesson.unlock_after_lesson_id)) {
      return "Terminez la leçon précédente pour continuer";
    }
    if (lesson.unlock_after_chapter_id) {
      const chapter = chapters.find((item) => item.id === lesson.unlock_after_chapter_id);
      if (chapter?.lessons.some((item) => !completedLessons.includes(item.id))) {
        return "Terminez le chapitre précédent pour continuer";
      }
    }
    // In progressive mode, lessons without a specific rule unlock in order.
    const index = lessonList.findIndex((item) => item.id === lesson.id);
    if (index > 0 && !completedLessons.includes(lessonList[index - 1].id)) {
      return "Terminez la leçon précédente pour continuer";
    }
    return null;
  };

  useEffect(() => {
    let cancelled = false;
    const loadLessonExtras = async () => {
      if (!currentLesson) {
        setResources([]);
        setAssignment(null);
        setSubmission(null);
        return;
      }

      const [{ data: resourceData }, { data: assignmentData }] = await Promise.all([
        (supabase as any).from("lesson_resources").select("id, title, resource_type, resource_path, resource_url").eq("lesson_id", currentLesson.id).order("sort_order"),
        (supabase as any).from("assignments").select("id, title, instructions, max_score, due_after_days").eq("lesson_id", currentLesson.id).maybeSingle(),
      ]);
      if (cancelled) return;
      setResources((resourceData || []) as LessonResource[]);
      setAssignment((assignmentData || null) as Assignment | null);

      if (!assignmentData) {
        setSubmission(null);
        setSubmissionText("");
        return;
      }
      const { data: { user } } = await supabase.auth.getUser();
      if (!user || cancelled) return;
      const { data: submissionData } = await (supabase as any)
        .from("assignment_submissions")
        .select("id, submission_text, status, feedback")
        .eq("assignment_id", assignmentData.id)
        .eq("user_id", user.id)
        .maybeSingle();
      if (!cancelled) {
        setSubmission((submissionData || null) as AssignmentSubmission | null);
        setSubmissionText(submissionData?.submission_text || "");
      }
    };
    void loadLessonExtras();
    return () => { cancelled = true; };
  }, [currentLesson]);

  const submitAssignment = async () => {
    if (!assignment || !submissionText.trim()) {
      toast.error("Ajoutez une réponse avant l’envoi");
      return;
    }
    setSubmittingAssignment(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Connectez-vous pour envoyer votre devoir");
      const { data, error } = await (supabase as any)
        .from("assignment_submissions")
        .upsert({
          assignment_id: assignment.id,
          user_id: user.id,
          submission_text: submissionText.trim(),
          status: "submitted",
          submitted_at: new Date().toISOString(),
        }, { onConflict: "assignment_id,user_id" })
        .select("id, submission_text, status, feedback")
        .single();
      if (error) throw error;
      setSubmission(data as AssignmentSubmission);
      toast.success("Devoir envoyé au formateur");
    } catch (error: any) {
      toast.error("Envoi impossible", { description: error.message });
    } finally {
      setSubmittingAssignment(false);
    }
  };

  const selectLesson = (lesson: Lesson) => {
    const unlockReason = getUnlockReason(lesson);
    if (unlockReason) {
      toast.info(unlockReason);
      return;
    }
    setCurrentLesson(lesson);
    window.localStorage.setItem(`mindhubs:last-lesson:${courseId}`, lesson.id);
  };

  const goToLesson = (offset: number) => {
    let nextIndex = currentLessonIndex + offset;
    while (nextIndex >= 0 && nextIndex < lessonList.length) {
      const nextLesson = lessonList[nextIndex];
      if (!getUnlockReason(nextLesson)) {
        selectLesson(nextLesson);
        return;
      }
      nextIndex += offset;
    }
  };

  if (loading) return <div className="flex h-screen items-center justify-center">Chargement...</div>;

  return (
    <div className="flex h-screen bg-background overflow-hidden">
      {/* Sidebar */}
      <AnimatePresence>
        {sidebarOpen && (
          <motion.div 
            initial={{ x: -300 }}
            animate={{ x: 0 }}
            exit={{ x: -300 }}
            className="w-80 border-r border-border bg-card flex flex-col z-40"
          >
            <div className="p-6 border-b border-border space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="font-black text-sm uppercase tracking-tighter truncate">{courseTitle}</h2>
                <Button variant="ghost" size="icon" onClick={() => setSidebarOpen(false)} className="sm:hidden">
                  <X size={18} />
                </Button>
              </div>
              <div className="space-y-2">
                <div className="flex justify-between text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                  <span>Progression</span>
                  <span>{Math.round(progress)}%</span>
                </div>
                <Progress value={progress} className="h-1.5" />
              </div>
            </div>

            <ScrollArea className="flex-1">
              <Accordion type="multiple" defaultValue={chapters.map(c => c.id)} className="px-2 py-4">
                {chapters.map((chapter, idx) => (
                  <AccordionItem key={chapter.id} value={chapter.id} className="border-none">
                    <AccordionTrigger className="hover:no-underline px-4 py-2 rounded-xl hover:bg-muted/50 text-left">
                      <span className="text-xs font-black uppercase tracking-tight flex items-center gap-2">
                        <span className="h-5 w-5 rounded-md bg-primary/10 flex items-center justify-center text-[10px]">{idx + 1}</span>
                        {chapter.title}
                      </span>
                    </AccordionTrigger>
                    <AccordionContent className="pt-1 pb-2 px-2">
                      <div className="space-y-1">
                        {chapter.lessons.map((lesson) => (
                          <button
                            key={lesson.id}
                            onClick={() => selectLesson(lesson)}
                            disabled={Boolean(getUnlockReason(lesson))}
                            title={getUnlockReason(lesson) || undefined}
                            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all text-left ${
                              currentLesson?.id === lesson.id 
                                ? "bg-primary/10 text-primary border border-primary/20" 
                                : getUnlockReason(lesson) ? "cursor-not-allowed opacity-50 text-muted-foreground" : "hover:bg-muted text-muted-foreground"
                            }`}
                          >
                            <div onClick={(e) => { e.stopPropagation(); toggleComplete(lesson.id); }}>
                              {completedLessons.includes(lesson.id) 
                                ? <CheckCircle2 size={16} className="text-success" />
                                : <Circle size={16} className="opacity-40" />
                              }
                            </div>
                            <span className="text-xs font-bold leading-tight flex-1">{lesson.title}</span>
                            {getUnlockReason(lesson) ? <Lock size={12} aria-label="Leçon verrouillée" /> : currentLesson?.id === lesson.id && <Play size={12} className="fill-current" />}
                          </button>
                        ))}
                      </div>
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </ScrollArea>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0 bg-background">
        <header className="h-16 border-b border-border bg-card/50 backdrop-blur-xl flex items-center justify-between px-6 sticky top-0 z-30">
          <div className="flex items-center gap-4">
            {!sidebarOpen && (
              <Button variant="ghost" size="icon" onClick={() => setSidebarOpen(true)}>
                <Menu size={20} />
              </Button>
            )}
            <Button variant="ghost" size="sm" className="gap-2 text-xs font-bold" onClick={() => window.history.back()}>
              <ArrowLeft size={16} /> Retour
            </Button>
          </div>
          <div className="flex items-center gap-3">
             <div className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-primary/5 border border-primary/10">
                <Trophy size={14} className="text-primary" />
                <span className="text-[10px] font-black uppercase tracking-widest text-primary">Badge Apprenant</span>
             </div>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto">
          {currentLesson ? (
            <div className="max-w-5xl mx-auto p-6 space-y-8 animate-in fade-in duration-500">
              {/* Lesson media/content keeps a stable frame for video lessons and
                  avoids pretending every lesson is a YouTube video. */}
              {currentLesson.lesson_type === "text" ? (
                <article className="rounded-[2rem] border border-border bg-card p-8 shadow-xl">
                  <div className="mb-6 flex items-center gap-3 text-primary">
                    <FileText size={22} aria-hidden="true" />
                    <span className="text-xs font-black uppercase tracking-widest">Lecture</span>
                  </div>
                  <div className="whitespace-pre-wrap text-base leading-8 text-foreground">
                    {currentLesson.content_text || "Aucun contenu pour cette leçon."}
                  </div>
                </article>
              ) : currentLesson.lesson_type === "pdf" || currentLesson.lesson_type === "download" ? (
                <div className="rounded-[2rem] border border-border bg-card p-8 shadow-xl">
                  <div className="mb-5 flex items-center gap-3 text-primary">
                    <FileDown size={24} aria-hidden="true" />
                    <span className="text-xs font-black uppercase tracking-widest">Ressource à consulter</span>
                  </div>
                  <p className="mb-6 text-sm leading-6 text-muted-foreground">Téléchargez ou ouvrez la ressource associée à cette leçon.</p>
                  {currentLesson.video_url ? (
                    <Button asChild className="rounded-xl gap-2">
                      <a href={currentLesson.video_url} target="_blank" rel="noreferrer"><FileDown size={16} /> Ouvrir la ressource</a>
                    </Button>
                  ) : <p className="text-sm font-medium text-muted-foreground">La ressource n’est pas encore disponible.</p>}
                </div>
              ) : currentLesson.lesson_type === "assignment" ? (
                <div className="rounded-[2rem] border border-border bg-card p-8 shadow-xl">
                  <div className="mb-5 flex items-center gap-3 text-primary">
                    <ClipboardList size={24} aria-hidden="true" />
                    <span className="text-xs font-black uppercase tracking-widest">Devoir à rendre</span>
                  </div>
                  {assignment ? <>
                    <h2 className="mb-3 text-xl font-bold">{assignment.title}</h2>
                    <p className="mb-6 whitespace-pre-wrap text-sm leading-6 text-muted-foreground">{assignment.instructions || "Suivez les consignes du formateur."}</p>
                    <textarea value={submissionText} onChange={(event) => setSubmissionText(event.target.value)} placeholder="Écrivez votre réponse ici…" className="min-h-40 w-full rounded-xl border border-border bg-background p-4 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20" aria-label="Réponse au devoir" />
                    <div className="mt-4 flex flex-wrap items-center gap-3">
                      <Button onClick={submitAssignment} disabled={submittingAssignment} className="rounded-xl gap-2">{submittingAssignment ? <Loader2 className="animate-spin" size={16} /> : <ClipboardList size={16} />} {submittingAssignment ? "Envoi…" : "Envoyer mon devoir"}</Button>
                      {submission && <span className="text-xs font-semibold text-success">Statut : {submission.status === "needs_revision" ? "à corriger" : "envoyé"}</span>}
                    </div>
                    {submission?.feedback && <p className="mt-4 rounded-xl bg-primary/5 p-4 text-sm text-muted-foreground"><strong>Retour du formateur :</strong> {submission.feedback}</p>}
                  </> : <p className="text-sm font-medium text-muted-foreground">Le devoir n’est pas encore configuré.</p>}
                </div>
              ) : currentLesson.lesson_type === "live_session" ? (
                <div className="rounded-[2rem] border border-border bg-card p-8 shadow-xl">
                  <div className="mb-5 flex items-center gap-3 text-primary"><CalendarClock size={24} aria-hidden="true" /><span className="text-xs font-black uppercase tracking-widest">Session live</span></div>
                  <p className="mb-6 whitespace-pre-wrap text-sm leading-6 text-muted-foreground">{currentLesson.content_text || "Les informations de la session seront communiquées par le formateur."}</p>
                  {currentLesson.video_url && <Button asChild className="rounded-xl gap-2"><a href={currentLesson.video_url} target="_blank" rel="noreferrer"><Link2 size={16} /> Rejoindre la session</a></Button>}
                </div>
              ) : currentLesson.lesson_type === "quiz" ? (
                <div className="rounded-[2rem] border border-border bg-card p-8 shadow-xl"><div className="flex items-center gap-3 text-primary"><ClipboardList size={24} /><span className="text-xs font-black uppercase tracking-widest">Quiz de validation</span></div><p className="mt-4 text-sm text-muted-foreground">Répondez au quiz ci-dessous pour valider cette étape.</p></div>
              ) : currentLesson.lesson_type === "external_link" && currentLesson.video_url ? (
                <div className="rounded-[2rem] border border-border bg-card p-8 shadow-xl">
                  <p className="mb-4 text-sm text-muted-foreground">Cette leçon ouvre une ressource externe contrôlée par le formateur.</p>
                  <a href={currentLesson.video_url} target="_blank" rel="noreferrer" className="text-primary underline underline-offset-4">
                    Ouvrir la ressource
                  </a>
                </div>
              ) : (
              <div className="aspect-video w-full rounded-[2rem] overflow-hidden bg-black shadow-2xl border border-white/5 ring-1 ring-white/10">
                {currentLesson.video_url && getEmbedUrl(currentLesson.video_url) ? (
                  <iframe
                    src={getEmbedUrl(currentLesson.video_url) || ""}
                    className="w-full h-full"
                    title={`Vidéo de la leçon ${currentLesson.title}`}
                    referrerPolicy="strict-origin-when-cross-origin"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                  />
                ) : (
                  <div className="w-full h-full flex flex-col items-center justify-center text-muted-foreground gap-4">
                    <Video size={48} className="opacity-20" />
                    <p className="font-bold">Aucun média pour cette leçon</p>
                  </div>
                )}
              </div>
              )}

              {/* Lesson Content */}
              <div className="grid grid-cols-1 lg:grid-cols-[1fr,300px] gap-8">
                <div className="space-y-6">
                  <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                      <h1 className="text-3xl font-black tracking-tight">{currentLesson.title}</h1>
                      <p className="text-sm text-muted-foreground font-medium">MindHubs Academy • Votre progression est sauvegardée</p>
                    </div>
                    <Button 
                      onClick={() => toggleComplete(currentLesson.id)}
                      variant={completedLessons.includes(currentLesson.id) ? "outline" : "default"}
                      className="rounded-2xl h-12 px-8 font-black uppercase tracking-widest gap-2"
                    >
                      {completedLessons.includes(currentLesson.id) ? (
                        <><CheckCircle2 size={18} /> Leçon Terminée</>
                      ) : (
                        "Marquer comme Terminé"
                      )}
                    </Button>
                  </div>

                  <div className="flex flex-wrap items-center justify-between gap-3 border-y border-border py-4">
                    <Button type="button" variant="outline" size="sm" disabled={currentLessonIndex <= 0} onClick={() => goToLesson(-1)} className="rounded-xl gap-2">
                      <ArrowLeft size={14} /> Leçon précédente
                    </Button>
                    <span className="text-xs font-semibold text-muted-foreground">{currentLessonIndex + 1} / {lessonList.length}</span>
                    <Button type="button" variant="outline" size="sm" disabled={currentLessonIndex < 0 || currentLessonIndex >= lessonList.length - 1} onClick={() => goToLesson(1)} className="rounded-xl gap-2">
                      Leçon suivante <ChevronRight size={14} />
                    </Button>
                  </div>

                  <div className="prose prose-invert max-w-none">
                    <div className="p-8 rounded-[2rem] bg-card border border-border/50 text-foreground">
                      <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                        <FileText className="text-primary" size={20} /> Note de cours
                      </h3>
                      <div className="text-sm leading-relaxed whitespace-pre-wrap opacity-80">
                        {currentLesson.content_text || "Aucun détail supplémentaire pour cette leçon."}
                      </div>
                    </div>
                  </div>

                  {resources.length > 0 && <div className="rounded-[2rem] border border-border/50 bg-card p-6">
                    <h3 className="mb-4 flex items-center gap-2 text-lg font-bold"><Link2 className="text-primary" size={20} /> Ressources de la leçon</h3>
                    <div className="space-y-2">{resources.map((resource) => {
                      const href = resource.resource_url || resource.resource_path;
                      return href ? <a key={resource.id} href={href} target="_blank" rel="noreferrer" className="flex items-center gap-3 rounded-xl border border-border p-3 text-sm font-semibold hover:border-primary/40"><Link2 size={16} className="text-primary" />{resource.title}</a> : <div key={resource.id} className="rounded-xl border border-border p-3 text-sm text-muted-foreground">{resource.title}</div>;
                    })}</div>
                  </div>}

                  {currentLesson.lesson_type === "quiz" && <QuizPlayer lessonId={currentLesson.id} />}
                </div>

                <aside className="space-y-6">
                  <div className="p-6 rounded-[2rem] bg-primary/5 border border-primary/10 space-y-4">
                    <h3 className="font-black text-[10px] uppercase tracking-widest text-primary flex items-center gap-2">
                      <MessageSquare size={14} /> Besoin d'aide ?
                    </h3>
                    <p className="text-xs font-medium opacity-70">Posez vos questions au formateur directement depuis l'espace discussion.</p>
                    <Button variant="link" className="p-0 h-auto text-xs font-bold text-primary">Accéder au forum →</Button>
                  </div>
                </aside>
              </div>
            </div>
          ) : (
            <div className="h-full flex items-center justify-center text-muted-foreground">
              Sélectionnez une leçon pour commencer.
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default CoursePlayer;

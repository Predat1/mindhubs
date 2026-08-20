import { useState, useEffect } from "react";
import { 
  Plus, GripVertical, Pencil, Trash2, Video, FileText, 
  ChevronDown, ChevronUp, Save, Loader2, Link as LinkIcon 
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { motion, AnimatePresence } from "motion/react";
import QuizBuilder from "@/components/vendor/lms/QuizBuilder";

interface Lesson {
  id?: string;
  chapter_id?: string;
  title: string;
  video_url: string;
  content_text: string;
  order_index: number;
  lesson_type?: "video" | "text" | "pdf" | "download" | "external_link" | "quiz" | "assignment" | "live_session";
  duration_minutes?: number | null;
  is_preview?: boolean;
  is_published?: boolean;
}

interface Chapter {
  id?: string;
  course_id: string;
  title: string;
  order_index: number;
  lessons: Lesson[];
}

interface CourseSettings {
  objectives: string;
  prerequisites: string;
  target_audience: string;
  level: string;
  language: string;
  estimated_minutes: string;
  certificate_enabled: boolean;
  certificate_min_score: string;
  drip_enabled: boolean;
}

interface CourseBuilderProps {
  courseId: string;
}

const CourseBuilder = ({ courseId }: CourseBuilderProps) => {
  const [chapters, setChapters] = useState<Chapter[]>([]);
  const [loading, setLoading] = useState(!!courseId);
  const [saving, setSaving] = useState(false);
  const [quizLessonId, setQuizLessonId] = useState<string | null>(null);
  const [settings, setSettings] = useState<CourseSettings>({
    objectives: "",
    prerequisites: "",
    target_audience: "",
    level: "Débutant",
    language: "fr",
    estimated_minutes: "",
    certificate_enabled: false,
    certificate_min_score: "70",
    drip_enabled: false,
  });

  useEffect(() => {
    if (courseId) {
      fetchCourseStructure();
    } else {
      setLoading(false);
    }
  }, [courseId]);

  if (!courseId) {
    return (
      <div className="rounded-2xl border border-dashed border-primary/30 bg-primary/5 p-6 text-center">
        <h4 className="font-bold">Enregistrez d’abord la fiche de formation</h4>
        <p className="mt-1 text-sm text-muted-foreground">Le programme sera disponible dès que le produit aura reçu un identifiant.</p>
      </div>
    );
  }

  const fetchCourseStructure = async () => {
    setLoading(true);
    try {
      const { data: chaptersData, error: chaptersError } = await (supabase as any)
        .from("course_chapters")
        .select(`
          *,
          lessons:course_lessons(*)
        `)
        .eq("course_id", courseId)
        .order("order_index", { ascending: true });

      if (chaptersError) throw chaptersError;

      // Sort lessons within chapters
      const structuredData = (chaptersData || []).map((ch: any) => ({
        ...ch,
        lessons: (ch.lessons || []).sort((a: any, b: any) => a.order_index - b.order_index)
      }));

      setChapters(structuredData as any);

      const { data: settingsData } = await (supabase as any)
        .from("course_settings")
        .select("objectives, prerequisites, target_audience, level, language, estimated_minutes, certificate_enabled, certificate_min_score, drip_enabled")
        .eq("product_id", courseId)
        .maybeSingle();
      if (settingsData) {
        setSettings({
          objectives: (settingsData.objectives || []).join("\n"),
          prerequisites: (settingsData.prerequisites || []).join("\n"),
          target_audience: settingsData.target_audience || "",
          level: settingsData.level || "Débutant",
          language: settingsData.language || "fr",
          estimated_minutes: settingsData.estimated_minutes?.toString() || "",
          certificate_enabled: Boolean(settingsData.certificate_enabled),
          certificate_min_score: settingsData.certificate_min_score?.toString() || "70",
          drip_enabled: Boolean(settingsData.drip_enabled),
        });
      }
    } catch (error: any) {
      toast.error("Erreur lors du chargement du programme", { description: error.message });
    } finally {
      setLoading(false);
    }
  };

  const addChapter = () => {
    const newChapter: Chapter = {
      course_id: courseId,
      title: "Nouveau Module",
      order_index: chapters.length,
      lessons: []
    };
    setChapters([...chapters, newChapter]);
  };

  const addLesson = (chapterIndex: number) => {
    const newChapters = [...chapters];
    const newLesson: Lesson = {
      title: "Nouvelle Leçon",
      video_url: "",
      content_text: "",
      order_index: newChapters[chapterIndex].lessons.length,
      lesson_type: "video",
      is_preview: false,
    };
    newChapters[chapterIndex].lessons.push(newLesson);
    setChapters(newChapters);
  };

  const updateChapterTitle = (index: number, title: string) => {
    const newChapters = [...chapters];
    newChapters[index].title = title;
    setChapters(newChapters);
  };

  const updateLesson = <K extends keyof Lesson>(chapterIndex: number, lessonIndex: number, field: K, value: Lesson[K]) => {
    const newChapters = [...chapters];
    newChapters[chapterIndex].lessons[lessonIndex] = {
      ...newChapters[chapterIndex].lessons[lessonIndex],
      [field]: value
    };
    setChapters(newChapters);
  };

  const removeChapter = (index: number) => {
    setChapters(chapters.filter((_, i) => i !== index));
  };

  const removeLesson = (chapterIndex: number, lessonIndex: number) => {
    const newChapters = [...chapters];
    newChapters[chapterIndex].lessons = newChapters[chapterIndex].lessons.filter((_, i) => i !== lessonIndex);
    setChapters(newChapters);
  };

  const saveStructure = async () => {
    setSaving(true);
    try {
      const { data: existingChapters, error: existingError } = await (supabase as any)
        .from("course_chapters")
        .select("id")
        .eq("course_id", courseId);
      if (existingError) throw existingError;

      const savedChapterIds: string[] = [];
      const nextChapters: Chapter[] = [];

      for (let i = 0; i < chapters.length; i++) {
        const chapter = chapters[i];
        const payload = {
          ...(chapter.id ? { id: chapter.id } : {}),
          course_id: courseId,
          title: chapter.title.trim() || `Module ${i + 1}`,
          order_index: i,
          status: "draft",
        };
        const { data: savedChapter, error: chError } = await (supabase as any)
          .from("course_chapters")
          .upsert(payload, { onConflict: "id" })
          .select()
          .single();
        if (chError) throw chError;
        savedChapterIds.push(savedChapter.id);

        const savedLessons: Lesson[] = [];
        for (let lIdx = 0; lIdx < chapter.lessons.length; lIdx++) {
          const lesson = chapter.lessons[lIdx];
          const lessonPayload = {
            ...(lesson.id ? { id: lesson.id } : {}),
            chapter_id: savedChapter.id,
            title: lesson.title.trim() || `Leçon ${lIdx + 1}`,
            video_url: lesson.video_url.trim() || null,
            content_text: lesson.content_text.trim() || null,
            order_index: lIdx,
            lesson_type: lesson.lesson_type || "video",
            duration_minutes: lesson.duration_minutes || null,
            is_preview: Boolean(lesson.is_preview),
            is_published: Boolean(lesson.is_published),
          };
          const { data: savedLesson, error: lessonError } = await (supabase as any)
            .from("course_lessons")
            .upsert(lessonPayload, { onConflict: "id" })
            .select()
            .single();
          if (lessonError) throw lessonError;
          savedLessons.push(savedLesson as Lesson);
        }
        nextChapters.push({ ...chapter, ...savedChapter, lessons: savedLessons });
      }

      const staleChapterIds = (existingChapters || [])
        .map((chapter: { id: string }) => chapter.id)
        .filter((id: string) => !savedChapterIds.includes(id));
      if (staleChapterIds.length > 0) {
        const { error: staleError } = await (supabase as any)
          .from("course_chapters")
          .delete()
          .in("id", staleChapterIds);
        if (staleError) throw staleError;
      }

      // Delete only lessons removed from the current tree. Existing lesson IDs remain stable.
      const currentLessonIds = nextChapters.flatMap((chapter) => chapter.lessons.map((lesson) => lesson.id).filter(Boolean));
      const { data: existingLessons } = await (supabase as any)
        .from("course_lessons")
        .select("id, chapter_id")
        .in("chapter_id", savedChapterIds.length > 0 ? savedChapterIds : ["00000000-0000-0000-0000-000000000000"]);
      const staleLessonIds = (existingLessons || [])
        .map((lesson: { id: string }) => lesson.id)
        .filter((id: string) => !currentLessonIds.includes(id));
      if (staleLessonIds.length > 0) {
        const { error: staleLessonError } = await (supabase as any)
          .from("course_lessons")
          .delete()
          .in("id", staleLessonIds);
        if (staleLessonError) throw staleLessonError;
      }

      const { error: settingsError } = await (supabase as any)
        .from("course_settings")
        .upsert({
          product_id: courseId,
          objectives: settings.objectives.split("\n").map((item) => item.trim()).filter(Boolean),
          prerequisites: settings.prerequisites.split("\n").map((item) => item.trim()).filter(Boolean),
          target_audience: settings.target_audience.trim() || null,
          level: settings.level,
          language: settings.language,
          estimated_minutes: settings.estimated_minutes ? Number(settings.estimated_minutes) : null,
          certificate_enabled: settings.certificate_enabled,
          certificate_min_score: settings.certificate_enabled ? Number(settings.certificate_min_score || 70) : null,
          drip_enabled: settings.drip_enabled,
        }, { onConflict: "product_id" });
      if (settingsError) throw settingsError;

      setChapters(nextChapters);
      toast.success("Programme sauvegardé avec succès ! ✨");
    } catch (error: any) {
      toast.error("Erreur lors de la sauvegarde", { description: error.message });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 space-y-4">
        <Loader2 className="animate-spin text-primary" size={32} />
        <p className="text-sm text-muted-foreground font-medium">Chargement du programme...</p>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <section className="space-y-5 rounded-[2rem] border border-border bg-card/60 p-5 md:p-6">
        <div>
          <h3 className="text-xl font-bold">Réglages pédagogiques</h3>
          <p className="text-xs font-medium text-muted-foreground">Ces informations aident les étudiants à comprendre le parcours avant de commencer.</p>
        </div>
        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-1.5 md:col-span-2"><label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Objectifs (un par ligne)</label><Textarea value={settings.objectives} onChange={(event) => setSettings((current) => ({ ...current, objectives: event.target.value }))} placeholder="À la fin, l’étudiant saura…" className="min-h-20 rounded-xl" /></div>
          <div className="space-y-1.5"><label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Public cible</label><Input value={settings.target_audience} onChange={(event) => setSettings((current) => ({ ...current, target_audience: event.target.value }))} placeholder="Entrepreneurs, étudiants…" className="rounded-xl" /></div>
          <div className="space-y-1.5"><label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Prérequis (un par ligne)</label><Textarea value={settings.prerequisites} onChange={(event) => setSettings((current) => ({ ...current, prerequisites: event.target.value }))} placeholder="Aucun prérequis" className="min-h-20 rounded-xl" /></div>
          <div className="grid grid-cols-2 gap-3"><div className="space-y-1.5"><label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Niveau</label><select value={settings.level} onChange={(event) => setSettings((current) => ({ ...current, level: event.target.value }))} className="flex h-10 w-full rounded-xl border border-border bg-background px-3 text-xs"><option>Débutant</option><option>Intermédiaire</option><option>Avancé</option><option>Tous niveaux</option></select></div><div className="space-y-1.5"><label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Durée (min)</label><Input type="number" min="0" value={settings.estimated_minutes} onChange={(event) => setSettings((current) => ({ ...current, estimated_minutes: event.target.value }))} placeholder="120" className="rounded-xl" /></div></div>
        </div>
        <div className="flex flex-col gap-3 border-t border-border pt-4 text-sm sm:flex-row sm:flex-wrap sm:items-center">
          <label className="flex min-h-11 items-center gap-2"><input type="checkbox" checked={settings.certificate_enabled} onChange={(event) => setSettings((current) => ({ ...current, certificate_enabled: event.target.checked }))} className="size-4 accent-[hsl(var(--primary))]" /> Certificat de réussite</label>
          {settings.certificate_enabled && <label className="flex items-center gap-2 text-xs text-muted-foreground">Score minimum <Input type="number" min="0" max="100" value={settings.certificate_min_score} onChange={(event) => setSettings((current) => ({ ...current, certificate_min_score: event.target.value }))} className="h-9 w-20 rounded-lg" />%</label>}
          <label className="flex min-h-11 items-center gap-2"><input type="checkbox" checked={settings.drip_enabled} onChange={(event) => setSettings((current) => ({ ...current, drip_enabled: event.target.checked }))} className="size-4 accent-[hsl(var(--primary))]" /> Déblocage progressif</label>
        </div>
      </section>

      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-xl font-bold">Programme de la formation</h3>
          <p className="text-xs text-muted-foreground font-medium">Organisez votre contenu en modules et leçons.</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={addChapter} className="rounded-xl font-bold uppercase text-[10px] tracking-widest gap-2">
            <Plus size={14} /> Ajouter un Module
          </Button>
          <Button size="sm" onClick={saveStructure} disabled={saving} className="rounded-xl font-bold uppercase text-[10px] tracking-widest gap-2">
            {saving ? <Loader2 className="animate-spin" size={14} /> : <Save size={14} />}
            Enregistrer
          </Button>
        </div>
      </div>

      <div className="space-y-6">
        {chapters.length === 0 ? (
          <div className="text-center py-16 border-2 border-dashed border-border rounded-[2rem] bg-muted/5">
            <div className="h-16 w-16 bg-primary/5 rounded-full flex items-center justify-center mx-auto mb-4">
              <FileText className="text-primary/40" size={32} />
            </div>
            <h4 className="font-bold text-lg">Votre programme est vide</h4>
            <p className="text-sm text-muted-foreground max-w-xs mx-auto mb-6">Commencez par ajouter votre premier module pour structurer votre formation.</p>
            <Button onClick={addChapter} className="rounded-full px-8">Ajouter un Module</Button>
          </div>
        ) : (
          chapters.map((chapter, chIdx) => (
            <div key={chIdx} className="stat-card rounded-[2rem] border-glow overflow-hidden bg-card/50">
              <div className="p-5 bg-muted/20 border-b border-border flex items-center gap-3">
                <GripVertical className="text-muted-foreground cursor-grab" size={18} />
                <Input 
                  value={chapter.title} 
                  onChange={(e) => updateChapterTitle(chIdx, e.target.value)}
                  className="bg-transparent border-none font-bold text-lg focus-visible:ring-0 px-0 h-auto"
                />
                <Button variant="ghost" size="icon" onClick={() => removeChapter(chIdx)} className="text-destructive ml-auto">
                  <Trash2 size={16} />
                </Button>
              </div>
              
              <div className="p-5 space-y-4">
                <AnimatePresence>
                  {chapter.lessons.map((lesson, lIdx) => (
                    <motion.div 
                      key={lIdx}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      className="bg-background rounded-2xl border border-border/50 p-4 space-y-4 hover:border-primary/30 transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary font-bold text-xs">
                          {lIdx + 1}
                        </div>
                        <Input 
                          value={lesson.title} 
                          onChange={(e) => updateLesson(chIdx, lIdx, "title", e.target.value)}
                          placeholder="Titre de la leçon"
                          className="font-semibold bg-transparent border-none focus-visible:ring-0 p-0 h-auto"
                        />
                        <Button variant="ghost" size="icon" onClick={() => removeLesson(chIdx, lIdx)} className="text-muted-foreground hover:text-destructive">
                          <Trash2 size={14} />
                        </Button>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-1.5">
                          <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Type de contenu</label>
                          <select
                            value={lesson.lesson_type || "video"}
                            onChange={(e) => updateLesson(chIdx, lIdx, "lesson_type", e.target.value as Lesson["lesson_type"])}
                            className="flex h-9 w-full rounded-xl border border-border/50 bg-muted/10 px-3 text-xs outline-none focus:border-primary"
                          >
                            <option value="video">Vidéo YouTube/Vimeo</option>
                            <option value="text">Texte / notes</option>
                            <option value="pdf">PDF</option>
                            <option value="download">Ressource à télécharger</option>
                            <option value="quiz">Quiz</option>
                            <option value="assignment">Devoir</option>
                            <option value="live_session">Session live</option>
                          </select>
                        </div>
                        <div className="space-y-1.5">
                          <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground flex items-center gap-1">
                            <Video size={10} /> Lien Vidéo (YouTube/Vimeo)
                          </label>
                          <div className="relative">
                            <LinkIcon className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={14} />
                            <Input 
                              value={lesson.video_url} 
                              onChange={(e) => updateLesson(chIdx, lIdx, "video_url", e.target.value)}
                              placeholder="https://..." 
                              className="pl-9 rounded-xl text-xs h-9 bg-muted/10 border-border/50"
                            />
                          </div>
                        </div>
                        <div className="space-y-1.5">
                          <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground flex items-center gap-1">
                            <FileText size={10} /> Description / Notes
                          </label>
                          <Textarea 
                            value={lesson.content_text} 
                            onChange={(e) => updateLesson(chIdx, lIdx, "content_text", e.target.value)}
                            placeholder="Contenu de la leçon..."
                            className="rounded-xl text-xs min-h-[36px] h-9 py-2 bg-muted/10 border-border/50"
                          />
                        </div>
                        <label className="flex items-center gap-2 text-xs text-muted-foreground md:col-span-2">
                          <input type="checkbox" checked={Boolean(lesson.is_preview)} onChange={(e) => updateLesson(chIdx, lIdx, "is_preview", e.target.checked)} className="size-4 accent-[hsl(var(--primary))]" />
                          Leçon disponible en aperçu gratuit
                        </label>
                      </div>
                      {lesson.id && (lesson.lesson_type === "quiz" || quizLessonId === lesson.id) ? (
                        <>
                          <Button type="button" variant="outline" size="sm" onClick={() => setQuizLessonId(quizLessonId === lesson.id ? null : lesson.id || null)} className="rounded-xl">{quizLessonId === lesson.id ? "Masquer le quiz" : "Configurer le quiz"}</Button>
                          {quizLessonId === lesson.id ? <QuizBuilder lessonId={lesson.id} /> : null}
                        </>
                      ) : null}
                    </motion.div>
                  ))}
                </AnimatePresence>
                
                <Button variant="ghost" onClick={() => addLesson(chIdx)} className="w-full rounded-xl border border-dashed border-border hover:border-primary/50 text-muted-foreground hover:text-primary transition-all group">
                  <Plus size={16} className="mr-2 group-hover:scale-110" /> Ajouter une Leçon
                </Button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default CourseBuilder;

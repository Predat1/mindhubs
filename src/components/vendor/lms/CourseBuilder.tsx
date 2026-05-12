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
import { motion, AnimatePresence } from "framer-motion";

interface Lesson {
  id?: string;
  chapter_id?: string;
  title: string;
  video_url: string;
  content_text: string;
  order_index: number;
}

interface Chapter {
  id?: string;
  course_id: string;
  title: string;
  order_index: number;
  lessons: Lesson[];
}

interface CourseBuilderProps {
  courseId: string;
}

const CourseBuilder = ({ courseId }: CourseBuilderProps) => {
  const [chapters, setChapters] = useState<Chapter[]>([]);
  const [loading, setLoading] = useState(!!courseId);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (courseId) {
      fetchCourseStructure();
    } else {
      setLoading(false);
    }
  }, [courseId]);

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
      order_index: newChapters[chapterIndex].lessons.length
    };
    newChapters[chapterIndex].lessons.push(newLesson);
    setChapters(newChapters);
  };

  const updateChapterTitle = (index: number, title: string) => {
    const newChapters = [...chapters];
    newChapters[index].title = title;
    setChapters(newChapters);
  };

  const updateLesson = (chapterIndex: number, lessonIndex: number, field: keyof Lesson, value: string) => {
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
      // 1. Delete existing structure to keep it simple for this first version
      // In a production app, we would use upsert or handle diffs
      const { error: delLessonsError } = await (supabase as any)
        .from("course_lessons")
        .delete()
        .in("chapter_id", chapters.map(c => c.id).filter(Boolean));

      const { error: delChaptersError } = await (supabase as any)
        .from("course_chapters")
        .delete()
        .eq("course_id", courseId);

      // 2. Re-insert chapters and lessons
      for (let i = 0; i < chapters.length; i++) {
        const chapter = chapters[i];
        const { data: savedChapter, error: chError } = await (supabase as any)
          .from("course_chapters")
          .insert([{
            course_id: courseId,
            title: chapter.title,
            order_index: i
          }])
          .select()
          .single();

        if (chError) throw chError;

        if (chapter.lessons.length > 0) {
          const lessonsToInsert = chapter.lessons.map((l, lIdx) => ({
            chapter_id: savedChapter.id,
            title: l.title,
            video_url: l.video_url,
            content_text: l.content_text,
            order_index: lIdx
          }));

          const { error: lError } = await (supabase as any)
            .from("course_lessons")
            .insert(lessonsToInsert);

          if (lError) throw lError;
        }
      }

      toast.success("Programme sauvegardé avec succès ! ✨");
      fetchCourseStructure();
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
                      </div>
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

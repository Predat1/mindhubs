import { useState, useEffect } from "react";
import { 
  Play, CheckCircle2, Circle, ChevronRight, 
  Menu, X, ArrowLeft, Trophy, MessageSquare, Video, FileText 
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";

interface Lesson {
  id: string;
  chapter_id: string;
  title: string;
  video_url: string;
  content_text: string;
  order_index: number;
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

const CoursePlayer = ({ courseId, courseTitle }: CoursePlayerProps) => {
  const [chapters, setChapters] = useState<Chapter[]>([]);
  const [currentLesson, setCurrentLesson] = useState<Lesson | null>(null);
  const [completedLessons, setCompletedLessons] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(true);

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

      // 2. Fetch progress
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data: progressData } = await (supabase as any)
          .from("user_course_progress")
          .select("lesson_id")
          .eq("user_id", user.id);
        
        setCompletedLessons((progressData || []).map((p: any) => p.lesson_id));
      }

      // Set first lesson as default
      if (structured.length > 0 && structured[0].lessons.length > 0) {
        setCurrentLesson(structured[0].lessons[0]);
      }
    } catch (error: any) {
      toast.error("Erreur de chargement", { description: error.message });
    } finally {
      setLoading(false);
    }
  };

  const toggleComplete = async (lessonId: string) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      if (completedLessons.includes(lessonId)) {
        await supabase
          .from("user_course_progress")
          .delete()
          .eq("user_id", user.id)
          .eq("lesson_id", lessonId);
        
        setCompletedLessons(prev => prev.filter(id => id !== lessonId));
      } else {
        await supabase
          .from("user_course_progress")
          .insert([{ user_id: user.id, lesson_id: lessonId }]);
        
        setCompletedLessons(prev => [...prev, lessonId]);
        toast.success("Leçon terminée ! 🎯");
      }
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

    return url;
  };

  const progress = chapters.reduce((acc, ch) => acc + ch.lessons.length, 0) > 0
    ? (completedLessons.length / chapters.reduce((acc, ch) => acc + ch.lessons.length, 0)) * 100
    : 0;

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
                            onClick={() => setCurrentLesson(lesson)}
                            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all text-left ${
                              currentLesson?.id === lesson.id 
                                ? "bg-primary/10 text-primary border border-primary/20" 
                                : "hover:bg-muted text-muted-foreground"
                            }`}
                          >
                            <div onClick={(e) => { e.stopPropagation(); toggleComplete(lesson.id); }}>
                              {completedLessons.includes(lesson.id) 
                                ? <CheckCircle2 size={16} className="text-emerald-500" />
                                : <Circle size={16} className="opacity-40" />
                              }
                            </div>
                            <span className="text-xs font-bold leading-tight flex-1">{lesson.title}</span>
                            {currentLesson?.id === lesson.id && <Play size={12} className="fill-current" />}
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
              {/* Video Area */}
              <div className="aspect-video w-full rounded-[2rem] overflow-hidden bg-black shadow-2xl border border-white/5 ring-1 ring-white/10">
                {currentLesson.video_url ? (
                  <iframe
                    src={getEmbedUrl(currentLesson.video_url) || ""}
                    className="w-full h-full"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                  />
                ) : (
                  <div className="w-full h-full flex flex-col items-center justify-center text-muted-foreground gap-4">
                    <Video size={48} className="opacity-20" />
                    <p className="font-bold">Aucune vidéo pour cette leçon</p>
                  </div>
                )}
              </div>

              {/* Lesson Content */}
              <div className="grid grid-cols-1 lg:grid-cols-[1fr,300px] gap-8">
                <div className="space-y-6">
                  <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                      <h1 className="text-3xl font-black tracking-tight">{currentLesson.title}</h1>
                      <p className="text-sm text-muted-foreground font-medium">MindHubs Academy • Formation Premium</p>
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

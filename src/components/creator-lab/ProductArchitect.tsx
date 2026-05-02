import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { 
  PenTool, Zap, FileText, Download, Rocket, Eye, 
  ChevronLeft, ChevronRight, Layout, Sparkles,
  ShieldCheck, CheckCircle2, Trash2, Save, Loader2, BookOpen
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

const ProductArchitect = () => {
  const [step, setStep] = useState(1);
  const [productIdea, setProductIdea] = useState("");
  const [productType, setProductType] = useState("Guide Pratique (E-book)");
  const [chapters, setChapters] = useState<{id: number, title: string, content: string}[]>([]);
  const [activeChapter, setActiveChapter] = useState(0);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isDraftingAll, setIsDraftingAll] = useState(false);
  const [isGenerated, setIsGenerated] = useState(false);

  const handleGenerateStructure = async () => {
    if (!productIdea) {
      toast.error("Veuillez entrer une idée de produit.");
      return;
    }
    setIsGenerating(true);
    try {
      const { data, error } = await supabase.functions.invoke('ai-creator', {
        body: { idea: productIdea, format: productType, type: "plan" }
      });
      if (error) throw error;

      let content = data.result;
      if (content.includes("```json")) {
        content = content.split("```json")[1].split("```")[0];
      }
      const parsed = JSON.parse(content);
      
      if (parsed.chapters) {
        setChapters(parsed.chapters.map((ch: any, i: number) => ({
          id: i + 1,
          title: ch.title,
          content: ch.content || "En attente de rédaction..."
        })));
        setIsGenerated(true);
        toast.success("Structure générée avec succès !");
      }
    } catch (err: any) {
      console.error(err);
      toast.error("Erreur de génération. Vérifiez votre clé OpenRouter.");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleDraftFullEbook = async () => {
    if (chapters.length === 0) return;
    setIsDraftingAll(true);
    toast.info("Claude 3.5 Sonnet commence la rédaction complète de votre ebook...");

    const updatedChapters = [...chapters];
    
    try {
      for (let i = 0; i < chapters.length; i++) {
        setActiveChapter(i);
        const { data, error } = await supabase.functions.invoke('ai-creator', {
          body: { 
            idea: chapters[i].title, 
            format: productIdea, 
            type: "chapter-draft" 
          }
        });
        if (error) throw error;
        updatedChapters[i].content = data.result;
        setChapters([...updatedChapters]);
        toast.success(`Chapitre ${i+1} rédigé !`);
      }
      toast.success("Ebook entièrement rédigé !");
    } catch (err) {
      console.error(err);
      toast.error("Interruption de la rédaction. Veuillez réessayer.");
    } finally {
      setIsDraftingAll(false);
    }
  };

  return (
    <div className="space-y-8">
      {/* Stepper Header */}
      <div className="flex items-center justify-between glass-card rounded-3xl p-4 border-white/5">
        <div className="flex items-center gap-8">
          {[
            { id: 1, label: "Structure", icon: Layout },
            { id: 2, label: "Rédaction IA", icon: PenTool },
            { id: 3, label: "Design Final", icon: FileText },
          ].map((s) => (
            <div key={s.id} className={`flex items-center gap-3 ${step === s.id ? "text-primary" : "text-muted-foreground"}`}>
              <div className={`h-10 w-10 rounded-xl flex items-center justify-center font-black transition-all ${step === s.id ? "bg-primary text-primary-foreground shadow-lg shadow-primary/20" : "bg-white/5"}`}>
                <s.icon size={18} />
              </div>
              <span className="text-xs font-black uppercase tracking-widest hidden md:inline">{s.label}</span>
            </div>
          ))}
        </div>
        <div className="flex gap-3">
          <Button variant="outline" className="rounded-xl border-white/10 font-bold" onClick={() => setStep(s => Math.max(1, s-1))}>Retour</Button>
          <Button className="rounded-xl bg-primary font-black shadow-lg" onClick={() => setStep(s => Math.min(3, s+1))}>Suivant</Button>
        </div>
      </div>

      <AnimatePresence mode="wait">
        {step === 1 && (
          <motion.div 
            key="step1"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="grid lg:grid-cols-3 gap-8"
          >
            <div className="lg:col-span-1 space-y-6">
              <div className="glass-card rounded-[2.5rem] p-8 border-white/5 space-y-6">
                 <h3 className="text-xl font-black flex items-center gap-3"><Layout className="text-primary" /> Configuration</h3>
                 <div className="space-y-4">
                    <div className="space-y-2">
                       <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Idée / Thématique</label>
                       <Input 
                        placeholder="Ex: Maîtriser la fiscalité au Sénégal" 
                        className="rounded-xl bg-white/5 border-white/10 h-12" 
                        value={productIdea}
                        onChange={(e) => setProductIdea(e.target.value)}
                       />
                    </div>
                    <div className="space-y-2">
                       <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Type de Produit</label>
                       <select 
                        className="w-full h-12 rounded-xl bg-white/5 border-white/10 px-4 text-sm font-medium outline-none text-white"
                        value={productType}
                        onChange={(e) => setProductType(e.target.value)}
                       >
                          <option className="bg-slate-900">Guide Pratique (E-book)</option>
                          <option className="bg-slate-900">Formation Vidéo (Scripts)</option>
                          <option className="bg-slate-900">Masterclass Elite</option>
                       </select>
                    </div>
                    <Button 
                      onClick={handleGenerateStructure}
                      disabled={isGenerating}
                      className="w-full h-14 rounded-xl bg-primary font-black gap-2 mt-4"
                    >
                      {isGenerating ? <Loader2 className="animate-spin" /> : <Sparkles size={16} fill="currentColor" />}
                      Générer la Structure
                    </Button>
                 </div>
              </div>
            </div>

            <div className="lg:col-span-2">
               <div className="glass-card rounded-[2.5rem] p-8 border-white/5 h-full min-h-[500px] flex flex-col">
                  <div className="flex items-center justify-between mb-8">
                     <h3 className="text-xl font-black">Sommaire de l'Ouvrage</h3>
                  </div>
                  
                  <div className="flex-1 space-y-4">
                     {isGenerated ? (
                       chapters.map((ch, idx) => (
                         <motion.div 
                           key={ch.id}
                           initial={{ opacity: 0, y: 10 }}
                           animate={{ opacity: 1, y: 0 }}
                           transition={{ delay: idx * 0.1 }}
                           className="flex items-center gap-4 p-4 rounded-2xl bg-white/5 border border-white/5 group hover:border-primary/30 transition-all"
                         >
                            <div className="h-8 w-8 rounded-lg bg-primary/20 text-primary flex items-center justify-center font-black text-xs">{idx + 1}</div>
                            <div className="flex-1">
                               <p className="font-black text-sm">{ch.title}</p>
                               <p className="text-[10px] text-muted-foreground uppercase">Prêt pour rédaction</p>
                            </div>
                            <Button size="icon" variant="ghost" className="h-8 w-8 text-destructive"><Trash2 size={14} /></Button>
                         </motion.div>
                       ))
                     ) : (
                       <div className="h-full flex flex-col items-center justify-center text-center space-y-4 opacity-40">
                          <BookOpen size={48} />
                          <p className="text-sm font-black uppercase tracking-widest">Entrez votre idée pour voir le plan</p>
                       </div>
                     )}
                  </div>
               </div>
            </div>
          </motion.div>
        )}

        {step === 2 && (
          <motion.div 
            key="step2"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="grid lg:grid-cols-2 gap-8 h-[750px]"
          >
            {/* Left: Editor */}
            <div className="glass-card rounded-[2.5rem] flex flex-col border-white/5 overflow-hidden">
               <div className="p-6 border-b border-white/5 bg-white/5 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                     <PenTool size={18} className="text-primary" />
                     <span className="font-black text-sm uppercase tracking-widest">Rédaction IA Claude 3.5</span>
                  </div>
                  <Button 
                    onClick={handleDraftFullEbook}
                    disabled={isDraftingAll || chapters.length === 0}
                    className="rounded-xl gap-2 font-black text-[10px] bg-primary shadow-lg"
                  >
                    {isDraftingAll ? <Loader2 className="animate-spin" size={14} /> : <Zap size={14} fill="currentColor" />}
                    RÉDIGER TOUT L'EBOOK
                  </Button>
               </div>
               <div className="p-6 border-b border-white/5 flex gap-2 overflow-x-auto scrollbar-hide">
                  {chapters.map((ch, i) => (
                    <button 
                      key={ch.id} 
                      onClick={() => setActiveChapter(i)}
                      className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest whitespace-nowrap transition-all ${activeChapter === i ? "bg-primary text-primary-foreground shadow-lg" : "bg-white/5 text-muted-foreground hover:bg-white/10"}`}
                    >
                      CH {i+1}
                    </button>
                  ))}
               </div>
               <div className="flex-1 p-8 overflow-y-auto">
                  <Textarea 
                    className="w-full h-full bg-transparent border-none focus-visible:ring-0 text-lg leading-relaxed resize-none font-medium text-white/90"
                    value={chapters[activeChapter]?.content || ""}
                    onChange={(e) => {
                      const newChapters = [...chapters];
                      newChapters[activeChapter].content = e.target.value;
                      setChapters(newChapters);
                    }}
                  />
               </div>
            </div>

            {/* Right: Premium Preview */}
            <div className="glass-card rounded-[2.5rem] flex flex-col border-white/5 bg-slate-900/50 overflow-hidden relative">
               <div className="p-6 border-b border-white/5 bg-white/5 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                     <Eye size={18} className="text-primary" />
                     <span className="font-black text-sm uppercase tracking-widest">Prévisualisation Réelle</span>
                  </div>
               </div>
               
               <div className="flex-1 overflow-y-auto p-12 flex justify-center bg-zinc-950/50">
                  <div className="w-full max-w-[500px] min-h-[650px] bg-white shadow-[0_30px_60px_-12px_rgba(0,0,0,0.5)] p-16 text-zinc-900 font-serif relative transition-all duration-500">
                     <div className="absolute top-0 left-0 w-2 h-full bg-zinc-100" /> {/* Spine shadow */}
                     
                     <div className="flex justify-between items-start mb-16">
                        <div className="h-[2px] w-12 bg-primary" />
                        <span className="text-[9px] font-black uppercase tracking-[0.2em] text-zinc-400">MINDHUBS ELITE EDITION</span>
                     </div>
                     
                     <h2 className="text-4xl font-black mb-10 leading-[1.1] text-zinc-900 tracking-tight">{chapters[activeChapter]?.title}</h2>
                     
                     <div className="space-y-6">
                        {chapters[activeChapter]?.content.split('\n').map((para, pi) => (
                           <p key={pi} className="text-base leading-relaxed text-zinc-700 text-justify">
                              {pi === 0 && para.length > 0 ? (
                                 <>
                                    <span className="text-5xl font-black float-left mr-3 mt-1 text-primary">{para[0]}</span>
                                    {para.slice(1)}
                                 </>
                              ) : para}
                           </p>
                        ))}
                     </div>
                     
                     <div className="absolute bottom-12 left-16 right-16 flex justify-between items-center pt-6 border-t border-zinc-100">
                        <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest italic">Chapitre {activeChapter + 1}</span>
                        <span className="text-[10px] font-black text-zinc-300">Page {activeChapter + 5}</span>
                     </div>
                  </div>
               </div>
            </div>
          </motion.div>
        )}

        {step === 3 && (
          <motion.div 
            key="step3"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="grid lg:grid-cols-2 gap-8"
          >
            {/* 3D Cover */}
            <div className="glass-card rounded-[2.5rem] p-8 border-white/5 space-y-8">
               <h3 className="text-xl font-black flex items-center gap-3"><Layout className="text-primary" /> Couverture Premium</h3>
               <div className="aspect-[3/4] max-w-[350px] mx-auto relative group">
                  <div className="absolute inset-0 bg-primary/20 blur-[80px] group-hover:bg-primary/40 transition-all duration-1000" />
                  <div className="relative h-full w-full bg-white rounded-r-xl shadow-2xl overflow-hidden flex flex-col p-10 text-zinc-900 transform perspective-[1500px] rotate-y-[-25deg] shadow-[20px_20px_50px_rgba(0,0,0,0.5)] group-hover:rotate-y-[-10deg] transition-all duration-1000 border-l-4 border-zinc-200">
                     <div className="h-2 w-20 bg-primary mb-12" />
                     <h2 className="text-3xl font-black tracking-tighter leading-none mb-4 text-zinc-400 uppercase">EXPERTISE</h2>
                     <h1 className="text-5xl font-black tracking-tighter leading-[0.95] uppercase break-words">{productIdea || "TITRE DU PRODUIT"}</h1>
                     <div className="mt-auto flex items-center gap-4">
                        <div className="h-12 w-12 rounded-full bg-zinc-950 text-white flex items-center justify-center font-black text-lg">MH</div>
                        <div>
                           <p className="text-[10px] font-black uppercase tracking-widest text-zinc-400">Certifié par</p>
                           <p className="text-sm font-black">MindHubs Elite</p>
                        </div>
                     </div>
                  </div>
               </div>
            </div>

            {/* License & Finalize */}
            <div className="space-y-8">
               <div className="glass-card rounded-[2.5rem] p-8 border-white/5 space-y-6">
                  <h3 className="text-xl font-black flex items-center gap-3"><ShieldCheck className="text-emerald-500" /> Certification de Vente</h3>
                  <div className="p-6 rounded-2xl bg-white/5 border border-white/5 space-y-4">
                     <div className="flex items-center gap-3">
                        <CheckCircle2 className="text-emerald-500" size={18} />
                        <span className="text-xs font-black uppercase tracking-widest text-white/80">Droits de Revente (PLR) Inclus</span>
                     </div>
                     <div className="flex items-center gap-3">
                        <CheckCircle2 className="text-emerald-500" size={18} />
                        <span className="text-xs font-black uppercase tracking-widest text-white/80">Propriété Intellectuelle Garantie</span>
                     </div>
                  </div>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                     Votre ebook est maintenant prêt à être vendu sur la marketplace MindHubs. Tous les fichiers sont optimisés pour la lecture mobile et tablette.
                  </p>
               </div>

               <div className="glass-card rounded-[2.5rem] p-8 border-white/5 bg-primary/10 border-primary/20 space-y-6">
                  <h3 className="text-xl font-black text-white">Mise en vente immédiate</h3>
                  <p className="text-sm text-white/60 font-medium">Votre ebook sera listé dans la catégorie "{productType}" et sera accessible à des milliers d'acheteurs.</p>
                  <Button 
                    className="w-full h-16 rounded-2xl bg-primary hover:bg-primary/90 font-black text-xl gap-4 shadow-[0_10px_40px_rgba(var(--primary-rgb),0.3)]"
                  >
                     PUBLIER SUR MINDHUBS <Rocket size={24} />
                  </Button>
               </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default ProductArchitect;

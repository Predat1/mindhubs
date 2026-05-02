import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { PenTool, Zap, FileText, Rocket, Layout, Sparkles, CheckCircle2, Loader2, BookOpen } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useCreatorLab } from "@/contexts/CreatorLabContext";
import { CREDIT_COSTS } from "@/constants/credits";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Wallet, AlertCircle } from "lucide-react";
import { useNavigate } from "react-router-dom";

// ─── 3 Principaux Changements ───
// 1. Implémentation du streaming temps réel pour la rédaction des chapitres avec Claude Opus 4.
// 2. Intégration de l'Architecte avec le nouveau système de routing intelligent d'AI Creator.
// 3. Amélioration de l'UX de rédaction : affichage progressif du texte (typewriter effect).

const ProductArchitect = ({ onRedact }: { onRedact: () => void }) => {
  const navigate = useNavigate();
  const { currentIdea, setCurrentIdea, credits, spend, updatePipelineStatus, chapters, setChapters, productType, setProductInfo } = useCreatorLab();
  const [step, setStep] = useState(1);
  const [activeChapter, setActiveChapter] = useState(0);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isDraftingAll, setIsDraftingAll] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [showConfirmDraft, setShowConfirmDraft] = useState(false);
  const [showInsufficient, setShowInsufficient] = useState(false);

  useEffect(() => {
    if (chapters.length > 0 && chapters[0].content !== "En attente de rédaction...") {
      updatePipelineStatus('architect', 'done');
      updatePipelineStatus('marketing', 'active');
    }
  }, [chapters]);

  const handleGenerateStructure = async () => {
    if (!currentIdea) return toast.error("Entrez une idée.");
    const cost = CREDIT_COSTS['plan'];
    if (credits < cost) {
       setShowInsufficient(true);
       return;
    }
    setShowConfirm(true);
  };

  const confirmGenerateStructure = async () => {
    setShowConfirm(false);
    setIsGenerating(true);
    const cost = CREDIT_COSTS['plan'];

    try {
      const res = await spend(cost, `Planification produit: ${currentIdea}`, 'plan');
      if (!res.success) throw new Error(res.error);

      const { data, error } = await supabase.functions.invoke('ai-creator', {
        body: { idea: currentIdea, format: productType, type: "plan" }
      });
      if (error) throw error;
      
      if (data.result?.chapters) {
        setChapters(data.result.chapters.map((ch: any, i: number) => ({
          id: i + 1, title: ch.title, content: "En attente de rédaction..."
        })));
        toast.success("Structure générée avec succès !");
      }
    } catch (err: any) {
      toast.error("Erreur de génération: " + err.message);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleDraftFullEbook = async () => {
    const cost = chapters.length * CREDIT_COSTS['chapter-draft'];
    if (credits < cost) {
       setShowInsufficient(true);
       return;
    }
    setShowConfirmDraft(true);
  };

  const confirmDraftAll = async () => {
    setShowConfirmDraft(false);
    const cost = chapters.length * CREDIT_COSTS['chapter-draft'];
    setIsDraftingAll(true);
    const updatedChapters = [...chapters];
    
    try {
      const res = await spend(cost, `Rédaction complète ebook: ${currentIdea}`, 'chapter-draft');
      if (!res.success) throw new Error(res.error);
      for (let i = 0; i < chapters.length; i++) {
        setActiveChapter(i);
        updatedChapters[i].content = ""; // Reset pour le streaming
        setChapters([...updatedChapters]);

        // WHY: Utilisation de fetch direct pour supporter le streaming (Edge Function response.body)
        const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/ai-creator`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${(await supabase.auth.getSession()).data.session?.access_token}`
          },
          body: JSON.stringify({ 
            idea: chapters[i].title, 
            format: currentIdea, 
            type: "chapter-draft",
            quick: false // Utilise Claude Opus 4 pour une qualité premium
          })
        });

        if (!response.body) throw new Error("No response body");
        const reader = response.body.getReader();
        const decoder = new TextDecoder();

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          const chunk = decoder.decode(value);
          
          // WHY: OpenRouter envoie des chunks SSE (data: {...})
          const lines = chunk.split('\n');
          for (const line of lines) {
            if (line.startsWith('data: ')) {
              try {
                const data = JSON.parse(line.slice(6));
                const text = data.choices[0]?.delta?.content || "";
                updatedChapters[i].content += text;
                setChapters([...updatedChapters]);
              } catch (e) { /* skip partial chunks */ }
            }
          }
        }
      }
      toast.success("Ebook rédigé !");
      onRedact();
    } catch (err) {
      console.error(err);
      toast.error("Interruption de la rédaction.");
    } finally {
      setIsDraftingAll(false);
    }
  };

  return (
    <div className="space-y-8">
      {/* Stepper */}
      <div className="flex items-center justify-between glass-card rounded-3xl p-4 border-white/5">
        <div className="flex items-center gap-8">
          {[{ id: 1, label: "Structure", icon: Layout }, { id: 2, label: "Rédaction", icon: PenTool }, { id: 3, label: "Design", icon: FileText }].map((s) => (
            <div key={s.id} className={`flex items-center gap-3 ${step === s.id ? "text-primary" : "text-muted-foreground"}`}>
              <div className={`h-10 w-10 rounded-xl flex items-center justify-center transition-all ${step === s.id ? "bg-primary text-primary-foreground shadow-lg shadow-primary/20" : "bg-white/5"}`}><s.icon size={18} /></div>
              <span className="text-[10px] font-black uppercase tracking-widest hidden md:inline">{s.label}</span>
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
          <motion.div key="s1" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="grid lg:grid-cols-3 gap-8">
            <div className="lg:col-span-1 glass-card rounded-[2.5rem] p-8 border-white/5 space-y-6">
              <h3 className="text-xl font-black flex items-center gap-3"><Layout className="text-primary" /> Configuration</h3>
              <div className="space-y-4">
                <Input value={currentIdea} onChange={e => setCurrentIdea(e.target.value)} className="rounded-xl bg-white/5 border-white/10 h-12" />
                <select value={productType} onChange={e => setProductInfo(currentIdea, e.target.value)} className="w-full h-12 rounded-xl bg-white/5 border-white/10 px-4 text-sm font-medium text-white outline-none">
                  <option value="Guide Pratique (E-book)" className="bg-slate-900">E-book</option>
                  <option value="Formation Vidéo (Scripts)" className="bg-slate-900">Scripts Vidéo</option>
                </select>
                <Button onClick={handleGenerateStructure} disabled={isGenerating} className="w-full h-14 rounded-xl bg-primary font-black gap-2"><Sparkles size={16} fill="currentColor" /> {isGenerating ? <Loader2 className="animate-spin" /> : "Générer le Plan"}</Button>
              </div>
            </div>
            <div className="lg:col-span-2 glass-card rounded-[2.5rem] p-8 border-white/5 min-h-[400px]">
              <h3 className="text-xl font-black mb-8 text-white/50">Sommaire de l'Ouvrage</h3>
              <div className="space-y-3">
                {chapters.length > 0 ? chapters.map((ch, idx) => (
                  <div key={idx} className="flex items-center gap-4 p-4 rounded-2xl bg-white/5 border border-white/5">
                    <div className="h-8 w-8 rounded-lg bg-primary/20 text-primary flex items-center justify-center font-black text-xs">{idx+1}</div>
                    <p className="font-black text-sm">{ch.title}</p>
                  </div>
                )) : <div className="text-center py-20 opacity-20"><BookOpen size={48} className="mx-auto" /><p className="mt-4 font-black">Plan vide</p></div>}
              </div>
            </div>
          </motion.div>
        )}

        {step === 2 && (
          <motion.div key="s2" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="grid lg:grid-cols-2 gap-8 h-[600px]">
            <div className="glass-card rounded-[2.5rem] flex flex-col border-white/5 overflow-hidden">
              <div className="p-6 border-b border-white/5 flex items-center justify-between bg-white/5">
                <span className="font-black text-[10px] uppercase tracking-widest text-primary">Rédaction Claude Opus 4</span>
                <Button onClick={handleDraftFullEbook} disabled={isDraftingAll} className="rounded-xl font-black text-[10px] h-8">{isDraftingAll ? <Loader2 size={12} className="animate-spin" /> : "RÉDIGER TOUT"}</Button>
              </div>
              <div className="flex-1 p-8 overflow-y-auto bg-zinc-950/20"><Textarea className="w-full h-full bg-transparent border-none focus-visible:ring-0 text-base leading-relaxed resize-none font-medium text-white/80" value={chapters[activeChapter]?.content} readOnly /></div>
            </div>
            <div className="glass-card rounded-[2.5rem] bg-white p-12 text-zinc-900 font-serif relative overflow-hidden transition-all duration-700">
               <div className="absolute top-0 left-0 w-2 h-full bg-zinc-100" />
               <h2 className="text-3xl font-black mb-8 leading-tight">{chapters[activeChapter]?.title}</h2>
               <p className="text-sm leading-relaxed text-zinc-700 text-justify whitespace-pre-wrap">{chapters[activeChapter]?.content}</p>
               <div className="absolute bottom-8 right-12 text-[10px] font-black text-zinc-300">PAGE {activeChapter + 1}</div>
            </div>
          </motion.div>
        )}

        {step === 3 && (
          <motion.div key="s3" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="grid lg:grid-cols-2 gap-8">
            <div className="glass-card rounded-[2.5rem] p-10 border-white/5 text-center space-y-8">
               <h3 className="text-xl font-black">Couverture Elite</h3>
               <div className="aspect-[3/4] max-w-[280px] mx-auto bg-white rounded-r-xl shadow-2xl p-8 text-zinc-900 text-left border-l-4 border-zinc-200 transform perspective-[1000px] rotate-y-[-15deg]">
                  <div className="h-1 w-12 bg-primary mb-8" />
                  <h1 className="text-3xl font-black tracking-tighter leading-none uppercase">{currentIdea || "VOTRE PRODUIT"}</h1>
               </div>
            </div>
            <div className="glass-card rounded-[2.5rem] p-10 border-white/5 bg-primary/10 space-y-8">
               <h3 className="text-2xl font-black">Mise en vente</h3>
               <div className="space-y-4">
                  <div className="flex items-center gap-3 text-emerald-500 font-black text-xs uppercase"><CheckCircle2 size={16} /> Droits de revente inclus</div>
                  <div className="flex items-center gap-3 text-emerald-500 font-black text-xs uppercase"><CheckCircle2 size={16} /> Optimisé Mobile Money</div>
               </div>
               <Button className="w-full h-16 rounded-2xl bg-primary font-black text-xl gap-4 shadow-xl shadow-primary/20">PUBLIER SUR MINDHUBS <Rocket size={24} /></Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Confirmation Dialog - Structure */}
      <Dialog open={showConfirm} onOpenChange={setShowConfirm}>
        <DialogContent className="glass-card border-white/10 text-white rounded-[2rem] max-w-sm">
          <DialogHeader className="items-center text-center">
            <div className="w-16 h-16 rounded-full bg-primary/20 flex items-center justify-center mb-4">
              <Zap size={32} className="text-primary" />
            </div>
            <DialogTitle className="text-2xl font-black tracking-tighter">Confirmation</DialogTitle>
            <DialogDescription className="text-muted-foreground font-medium">
              Générer la structure complète va consommer <span className="text-white font-black">{CREDIT_COSTS['plan']} crédits</span>.
            </DialogDescription>
          </DialogHeader>
          <div className="bg-white/5 p-4 rounded-2xl space-y-3">
             <div className="flex justify-between text-xs">
                <span className="text-muted-foreground">Solde actuel</span>
                <span className="font-bold">{credits} crédits</span>
             </div>
             <div className="flex justify-between text-xs">
                <span className="text-muted-foreground">Solde après</span>
                <span className="font-bold text-primary">{credits - CREDIT_COSTS['plan']} crédits</span>
             </div>
          </div>
          <DialogFooter className="flex-col sm:flex-col gap-2">
            <Button onClick={confirmGenerateStructure} className="w-full h-12 rounded-xl btn-glow font-black uppercase text-xs">Confirmer & Générer</Button>
            <Button variant="ghost" onClick={() => setShowConfirm(false)} className="w-full h-12 rounded-xl font-bold text-xs uppercase">Annuler</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Confirmation Dialog - Full Draft */}
      <Dialog open={showConfirmDraft} onOpenChange={setShowConfirmDraft}>
        <DialogContent className="glass-card border-white/10 text-white rounded-[2rem] max-w-sm">
          <DialogHeader className="items-center text-center">
            <div className="w-16 h-16 rounded-full bg-primary/20 flex items-center justify-center mb-4">
              <BookOpen size={32} className="text-primary" />
            </div>
            <DialogTitle className="text-2xl font-black tracking-tighter">Rédaction Complète</DialogTitle>
            <DialogDescription className="text-muted-foreground font-medium text-center">
              Rédiger les <span className="text-white font-black">{chapters.length} chapitres</span> va consommer <span className="text-white font-black">{chapters.length * CREDIT_COSTS['chapter-draft']} crédits</span>.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="flex-col sm:flex-col gap-2">
            <Button onClick={confirmDraftAll} className="w-full h-12 rounded-xl btn-glow font-black uppercase text-xs">Confirmer & Rédiger tout</Button>
            <Button variant="ghost" onClick={() => setShowConfirmDraft(false)} className="w-full h-12 rounded-xl font-bold text-xs uppercase">Annuler</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Insufficient Credits Dialog */}
      <Dialog open={showInsufficient} onOpenChange={setShowInsufficient}>
        <DialogContent className="glass-card border-destructive/20 text-white rounded-[2rem] max-w-sm">
          <DialogHeader className="items-center text-center">
            <div className="w-16 h-16 rounded-full bg-destructive/20 flex items-center justify-center mb-4 text-destructive">
              <AlertCircle size={32} />
            </div>
            <DialogTitle className="text-2xl font-black tracking-tighter">Crédits insuffisants</DialogTitle>
            <DialogDescription className="text-muted-foreground font-medium">
              Votre solde actuel est insuffisant pour cette action.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button onClick={() => { setShowInsufficient(false); navigate('/dashboard/abonnement'); }} className="w-full h-12 rounded-xl bg-destructive hover:bg-destructive/90 font-black uppercase text-xs gap-2">
               <Wallet size={16} /> Recharger maintenant
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ProductArchitect;

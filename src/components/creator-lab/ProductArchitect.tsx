import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { 
  PenTool, Zap, FileText, Download, Rocket, Eye, 
  ChevronLeft, ChevronRight, Layout, Sparkles,
  ShieldCheck, CheckCircle2, Trash2, Save
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";

const MOCK_CHAPTERS = [
  { id: 1, title: "Introduction & Fondamentaux", content: "Bienvenue dans ce guide complet. Dans ce premier chapitre, nous allons voir pourquoi la fiscalité est votre meilleure alliée..." },
  { id: 2, title: "Les 5 niches les plus rentables", content: "Après analyse du marché africain, voici les secteurs où la demande excède l'offre de 400%..." },
  { id: 3, title: "Stratégies d'Automatisation", content: "Utilisez les outils que nous avons sélectionnés pour vous faire gagner 15h par semaine..." },
];

const ProductArchitect = () => {
  const [step, setStep] = useState(1);
  const [chapters, setChapters] = useState(MOCK_CHAPTERS);
  const [activeChapter, setActiveChapter] = useState(0);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isGenerated, setIsGenerated] = useState(false);

  const handleGenerate = () => {
    setIsGenerating(true);
    setTimeout(() => {
      setIsGenerated(true);
      setIsGenerating(false);
      toast.success("Structure générée !", {
        description: "Claude 3.5 Sonnet a créé le plan de votre produit.",
      });
    }, 3000);
  };

  const handlePublish = () => {
    setIsGenerating(true);
    setTimeout(() => {
      setIsGenerating(false);
      toast.success("Produit publié avec succès !", {
        description: "Votre produit est maintenant disponible sur la marketplace MindHubs.",
      });
    }, 2000);
  };

  return (
    <div className="space-y-8">
      {/* Stepper Header */}
      <div className="flex items-center justify-between glass-card rounded-3xl p-4 border-white/5">
        <div className="flex items-center gap-8">
          {[
            { id: 1, label: "Structure", icon: Layout },
            { id: 2, label: "Rédaction IA", icon: PenTool },
            { id: 3, label: "Design & Licence", icon: FileText },
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
                       <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Titre du Produit</label>
                       <Input placeholder="Ex: Masterclass Fiscalité" className="rounded-xl bg-white/5 border-white/10 h-12" />
                    </div>
                    <div className="space-y-2">
                       <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Type de Produit</label>
                       <select className="w-full h-12 rounded-xl bg-white/5 border-white/10 px-4 text-sm font-medium focus:ring-1 focus:ring-primary outline-none">
                          <option>Guide Pratique (E-book)</option>
                          <option>Formation Vidéo (Scripts)</option>
                          <option>Kit Business (Checklists)</option>
                       </select>
                    </div>
                    <Button 
                      onClick={handleGenerate}
                      disabled={isGenerating}
                      className="w-full h-14 rounded-xl bg-primary font-black gap-2 mt-4"
                    >
                      {isGenerating ? "IA en action..." : "Générer la Structure IA"} <Sparkles size={16} fill="currentColor" />
                    </Button>
                 </div>
              </div>
            </div>

            <div className="lg:col-span-2">
               <div className="glass-card rounded-[2.5rem] p-8 border-white/5 h-full min-h-[500px] flex flex-col">
                  <div className="flex items-center justify-between mb-8">
                     <h3 className="text-xl font-black">Plan du Produit</h3>
                     <Button variant="ghost" size="sm" className="rounded-xl text-primary font-black uppercase tracking-tighter text-[10px] hover:bg-primary/10">
                        <Plus className="mr-1" size={12} /> Ajouter Chapitre
                     </Button>
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
                               <p className="text-[10px] text-muted-foreground truncate max-w-[300px]">Généré par Claude 3.5 Sonnet</p>
                            </div>
                            <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                               <Button size="icon" variant="ghost" className="h-8 w-8 text-muted-foreground hover:text-foreground"><PenTool size={14} /></Button>
                               <Button size="icon" variant="ghost" className="h-8 w-8 text-destructive hover:bg-destructive/10"><Trash2 size={14} /></Button>
                            </div>
                         </motion.div>
                       ))
                     ) : (
                       <div className="h-full flex flex-col items-center justify-center text-center space-y-4 opacity-40">
                          <Layout size={48} />
                          <p className="text-sm font-black uppercase tracking-widest">Lancez la génération pour voir le plan</p>
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
            className="grid lg:grid-cols-2 gap-8 h-[700px]"
          >
            {/* Left: Editor */}
            <div className="glass-card rounded-[2.5rem] flex flex-col border-white/5 overflow-hidden">
               <div className="p-6 border-b border-white/5 bg-white/5 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                     <PenTool size={18} className="text-primary" />
                     <span className="font-black text-sm uppercase tracking-widest">Éditeur IA (Last Mile)</span>
                  </div>
                  <Button variant="ghost" size="sm" className="rounded-xl gap-2 font-bold text-xs"><Save size={14} /> Sauvegarder</Button>
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
               <div className="flex-1 p-8">
                  <Textarea 
                    className="w-full h-full bg-transparent border-none focus-visible:ring-0 text-lg leading-relaxed resize-none font-medium"
                    value={chapters[activeChapter].content}
                    onChange={(e) => {
                      const newChapters = [...chapters];
                      newChapters[activeChapter].content = e.target.value;
                      setChapters(newChapters);
                    }}
                  />
               </div>
            </div>

            {/* Right: Preview */}
            <div className="glass-card rounded-[2.5rem] flex flex-col border-white/5 bg-white/5 overflow-hidden relative">
               <div className="p-6 border-b border-white/5 bg-white/10 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                     <Eye size={18} className="text-primary" />
                     <span className="font-black text-sm uppercase tracking-widest">Aperçu PDF Dynamique</span>
                  </div>
                  <Badge variant="outline" className="border-white/10 text-[9px]">GÉNÉRATION LIVE</Badge>
               </div>
               
               <div className="flex-1 overflow-y-auto p-12 bg-white flex justify-center">
                  <div className="w-full max-w-[500px] aspect-[1/1.41] bg-white shadow-2xl p-12 text-zinc-900 font-serif relative">
                     {/* PDF Mock Header */}
                     <div className="flex justify-between items-start mb-12">
                        <div className="h-1 w-24 bg-primary" />
                        <span className="text-[8px] font-bold uppercase tracking-widest text-zinc-400">MINDHUBS ELITE CREATOR</span>
                     </div>
                     
                     <h2 className="text-3xl font-black mb-8 leading-tight text-zinc-800">{chapters[activeChapter].title}</h2>
                     <p className="text-sm leading-relaxed text-zinc-600 first-letter:text-4xl first-letter:font-black first-letter:mr-3 first-letter:float-left">
                        {chapters[activeChapter].content}
                     </p>
                     
                     {/* PDF Mock Footer */}
                     <div className="absolute bottom-8 left-12 right-12 flex justify-between items-center pt-4 border-t border-zinc-100">
                        <span className="text-[10px] font-bold text-zinc-300 italic">Page {activeChapter + 1} de {chapters.length}</span>
                        <div className="flex gap-1">
                           <div className="h-2 w-2 rounded-full bg-primary" />
                           <div className="h-2 w-2 rounded-full bg-zinc-200" />
                        </div>
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
            {/* 3D Cover Gen */}
            <div className="glass-card rounded-[2.5rem] p-8 border-white/5 space-y-8">
               <h3 className="text-xl font-black flex items-center gap-3"><Layout className="text-primary" /> Couverture & Branding</h3>
               <div className="aspect-square max-w-[400px] mx-auto relative group">
                  <div className="absolute inset-0 bg-primary/20 blur-[60px] group-hover:bg-primary/30 transition-all" />
                  <div className="relative h-full w-full bg-white rounded-xl shadow-2xl overflow-hidden flex flex-col p-8 text-zinc-900 transform perspective-1000 rotate-y-[-20deg] rotate-x-[5deg] group-hover:rotate-y-[-10deg] transition-transform duration-700">
                     <div className="h-2 w-20 bg-primary mb-8" />
                     <h2 className="text-4xl font-black tracking-tighter leading-none mb-4">MINDHUBS EXPERTISE</h2>
                     <div className="h-[2px] w-full bg-zinc-100 my-4" />
                     <h1 className="text-5xl font-black tracking-tighter leading-tight uppercase">Masterclass Fiscalité 2026</h1>
                     <div className="mt-auto flex items-center gap-4">
                        <div className="h-10 w-10 rounded-full bg-zinc-900 text-white flex items-center justify-center font-black">MH</div>
                        <div>
                           <p className="text-[10px] font-black uppercase tracking-widest text-zinc-400">Publié par</p>
                           <p className="text-xs font-black">Expert Mindhubs</p>
                        </div>
                     </div>
                  </div>
               </div>
               <div className="grid grid-cols-4 gap-4">
                  {['#F59E0B', '#3B82F6', '#10B981', '#EF4444'].map(c => (
                    <button key={c} className="h-10 rounded-xl border-2 border-white/10 hover:scale-110 transition-all" style={{ backgroundColor: c }} />
                  ))}
               </div>
            </div>

            {/* License & Finalize */}
            <div className="space-y-8">
               <div className="glass-card rounded-[2.5rem] p-8 border-white/5 space-y-6">
                  <h3 className="text-xl font-black flex items-center gap-3"><ShieldCheck className="text-emerald-500" /> Licence de Vente</h3>
                  <div className="p-6 rounded-2xl bg-white/5 border border-white/5 space-y-4">
                     <div className="flex items-center gap-3">
                        <CheckCircle2 className="text-emerald-500" size={18} />
                        <span className="text-xs font-bold uppercase tracking-widest">Droit de revente inclus</span>
                     </div>
                     <div className="flex items-center gap-3">
                        <CheckCircle2 className="text-emerald-500" size={18} />
                        <span className="text-xs font-bold uppercase tracking-widest">Propriété intellectuelle certifiée</span>
                     </div>
                     <div className="flex items-center gap-3">
                        <CheckCircle2 className="text-emerald-500" size={18} />
                        <span className="text-xs font-bold uppercase tracking-widest">Prêt pour la Marketplace Mindhubs</span>
                     </div>
                  </div>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                     Votre licence est générée dynamiquement avec votre identifiant vendeur unique. Elle sera jointe au produit lors du téléchargement par le client.
                  </p>
               </div>

               <div className="glass-card rounded-[2.5rem] p-8 border-white/5 bg-primary/10 border-primary/20 space-y-6">
                  <h3 className="text-xl font-black">Prêt à encaisser ?</h3>
                  <p className="text-sm text-muted-foreground">Une fois que vous cliquez sur le bouton ci-dessous, votre produit sera généré, sécurisé et publié sur MindHubs en 1 clic.</p>
                  <Button 
                    onClick={handlePublish}
                    disabled={isGenerating}
                    className="w-full h-16 rounded-2xl bg-primary hover:bg-primary/90 font-black text-xl gap-4 shadow-[0_10px_40px_rgba(var(--primary-rgb),0.3)]"
                  >
                     {isGenerating ? "Publication..." : "Publier sur MindHubs"} <Rocket size={24} />
                  </Button>
               </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

const Plus = ({ className, size }: { className?: string, size?: number }) => (
  <svg className={className} width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
    <line x1="12" y1="5" x2="12" y2="19"></line>
    <line x1="5" y1="12" x2="19" y2="12"></line>
  </svg>
);

export default ProductArchitect;


import { useState, useMemo } from "react";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import VendorGuard from "@/components/dashboard/VendorGuard";
import SEO from "@/components/SEO";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { 
  Video, Sparkles, Play, Monitor, Zap, 
  ChevronRight, Info, AlertTriangle, 
  History, Settings, Clapperboard,
  Gamepad2, Image as ImageIcon,
  UserCheck, ShieldCheck, Star,
  Loader2, Wand2, ArrowRight,
  Maximize2, Layout, Sliders
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { VIDEO_MODELS, VideoModel } from "@/constants/videoModels";
import { useCredits } from "@/hooks/useCredits";
import { toast } from "sonner";

const CinemaStudioInner = ({ vendor }: { vendor: any }) => {
  const { balance: credits } = useCredits(vendor?.id);
  const [prompt, setPrompt] = useState("");
  const [selectedModel, setSelectedModel] = useState<VideoModel | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [activeTab, setActiveTab] = useState<'create' | 'history'>('create');
  const [creationMode, setCreationMode] = useState<'magic' | 'pro'>('magic');

  const filteredModels = useMemo(() => {
    if (creationMode === 'magic') return [];
    return VIDEO_MODELS;
  }, [creationMode]);

  const handleGenerate = async () => {
    if (!prompt.trim()) {
      toast.error("Veuillez entrer une description pour votre vidéo.");
      return;
    }

    const modelToUse = creationMode === 'magic' ? VIDEO_MODELS.find(m => m.id === 'kling-1-5') : selectedModel;
    
    if (!modelToUse) {
      toast.error("Veuillez sélectionner un moteur de rendu.");
      return;
    }

    if (credits < modelToUse.creditCost) {
      toast.error("Crédits insuffisants pour ce modèle.");
      return;
    }

    setIsGenerating(true);
    // Simulation du processus de génération
    setTimeout(() => {
      setIsGenerating(false);
      toast.success("Votre demande de vidéo a été envoyée au studio ! Vous recevrez une notification dès que le rendu est prêt.");
    }, 2000);
  };

  return (
    <DashboardLayout variant="vendor" title="Cinema Studio AI" shopName={vendor.shop_name}>
      <SEO title="Cinema Studio | MindHubs" description="Créez des publicités vidéos ultra-réalistes avec les meilleurs moteurs IA du monde." />

      <div className="mx-auto max-w-7xl space-y-8 pb-20">
        
        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
               <Badge className="bg-primary/20 text-primary border-none font-black text-[9px] px-3">TECHNOLOGIE 2026</Badge>
               <span className="h-1 w-1 rounded-full bg-muted-foreground/30" />
               <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Studio de Production Virtuel</span>
            </div>
            <h2 className="text-4xl md:text-5xl font-black tracking-tighter">MindHubs <span className="text-gradient-primary">Cinema Studio</span></h2>
            <p className="text-muted-foreground font-medium max-w-xl">L'arsenal ultime pour dominer vos marchés avec des vidéos publicitaires au réalisme cinématographique.</p>
          </div>

          <div className="bg-card/50 backdrop-blur-xl p-4 rounded-3xl border border-border flex items-center gap-4 shadow-xl">
             <div className="h-12 w-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary"><Zap size={24} /></div>
             <div>
                <p className="text-[9px] font-black uppercase text-muted-foreground tracking-widest">Solde IA</p>
                <p className="text-xl font-black">{credits} <span className="text-xs text-muted-foreground">Crédits</span></p>
             </div>
             <Button variant="outline" size="sm" className="rounded-xl border-primary/20 hover:bg-primary/5 text-[10px] font-black h-10 px-4 ml-2">RECHARGER</Button>
          </div>
        </div>

        {/* Studio Controls */}
        <div className="grid lg:grid-cols-12 gap-8">
          
          {/* Main Console */}
          <div className="lg:col-span-8 space-y-8">
             
             {/* Mode Selector */}
             <div className="flex gap-4">
                <button 
                  onClick={() => setCreationMode('magic')}
                  className={`flex-1 p-6 rounded-[2rem] border-2 transition-all text-left relative overflow-hidden group ${creationMode === 'magic' ? 'bg-primary/5 border-primary shadow-lg shadow-primary/10' : 'bg-card border-border hover:border-primary/30'}`}
                >
                   {creationMode === 'magic' && <motion.div layoutId="mode-bg" className="absolute inset-0 bg-primary/5" />}
                   <div className={`h-12 w-12 rounded-2xl flex items-center justify-center mb-4 transition-transform group-hover:scale-110 ${creationMode === 'magic' ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'}`}>
                      <Wand2 size={24} />
                   </div>
                   <h4 className="font-black text-lg">Mode Magique</h4>
                   <p className="text-xs text-muted-foreground mt-1 font-medium">L'IA choisit le meilleur moteur pour votre publicité automatiquement.</p>
                </button>

                <button 
                  onClick={() => setCreationMode('pro')}
                  className={`flex-1 p-6 rounded-[2rem] border-2 transition-all text-left relative overflow-hidden group ${creationMode === 'pro' ? 'bg-card border-primary shadow-lg shadow-primary/10' : 'bg-card border-border hover:border-primary/30'}`}
                >
                   {creationMode === 'pro' && <motion.div layoutId="mode-bg" className="absolute inset-0 bg-primary/5" />}
                   <div className={`h-12 w-12 rounded-2xl flex items-center justify-center mb-4 transition-transform group-hover:scale-110 ${creationMode === 'pro' ? 'bg-foreground text-background' : 'bg-muted text-muted-foreground'}`}>
                      <Sliders size={24} />
                   </div>
                   <h4 className="font-black text-lg">Mode Pro</h4>
                   <p className="text-xs text-muted-foreground mt-1 font-medium">Choisissez manuellement parmi Sora, Veo, Minimax et plus.</p>
                </button>
             </div>

             {/* Rendering Area */}
             <div className="glass-card rounded-[3rem] border-white/5 p-8 space-y-8 shadow-2xl relative overflow-hidden">
                <div className="absolute top-0 right-0 p-8 opacity-10 pointer-events-none"><Clapperboard size={120} /></div>
                
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-2">Description de la scène (Prompt)</Label>
                    <button className="text-[10px] font-black text-primary hover:underline uppercase tracking-widest">Exemples d'Experts</button>
                  </div>
                  <Textarea 
                    placeholder="Ex: Un portrait ultra-réaliste d'un entrepreneur africain devant un gratte-ciel au coucher du soleil, mouvement de caméra cinématographique, 4k, textures de peau détaillées..."
                    value={prompt}
                    onChange={(e) => setPrompt(e.target.value)}
                    className="min-h-[150px] rounded-3xl bg-muted/20 border-white/5 p-6 text-lg font-medium leading-relaxed resize-none focus:ring-primary/20"
                  />
                  <div className="flex items-center gap-2 px-2">
                     <Info size={14} className="text-primary" />
                     <p className="text-[10px] font-medium text-muted-foreground italic">Soyez précis sur les mouvements et l'ambiance pour un résultat optimal.</p>
                  </div>
                </div>

                {creationMode === 'pro' && (
                  <div className="space-y-6 pt-4 border-t border-white/5">
                    <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-2">Arsenal de moteurs disponibles</Label>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                       {VIDEO_MODELS.map((model) => (
                         <button
                           key={model.id}
                           onClick={() => setSelectedModel(model)}
                           className={`p-4 rounded-2xl border text-left transition-all flex items-start gap-4 group ${selectedModel?.id === model.id ? 'bg-primary/10 border-primary ring-1 ring-primary/20' : 'bg-muted/30 border-white/5 hover:border-primary/40'}`}
                         >
                            <div className={`h-10 w-10 rounded-xl flex items-center justify-center shrink-0 transition-transform group-hover:scale-110 ${selectedModel?.id === model.id ? 'bg-primary text-primary-foreground shadow-lg shadow-primary/20' : 'bg-background text-muted-foreground'}`}>
                               {model.isAvatar ? <UserCheck size={20} /> : <Play size={20} />}
                            </div>
                            <div className="flex-1 space-y-1">
                               <div className="flex items-center justify-between">
                                  <span className="font-black text-sm">{model.name}</span>
                                  <Badge variant="outline" className="text-[8px] font-black border-primary/20 text-primary">{model.creditCost} pts</Badge>
                               </div>
                               <p className="text-[10px] text-muted-foreground font-medium leading-tight">{model.description}</p>
                               {model.badge && (
                                 <Badge className="bg-emerald-500/10 text-emerald-500 border-none text-[8px] font-black px-2 mt-1">{model.badge}</Badge>
                               )}
                            </div>
                         </button>
                       ))}
                    </div>
                  </div>
                )}

                <div className="pt-6">
                   <Button 
                     onClick={handleGenerate}
                     disabled={isGenerating}
                     className="w-full h-20 rounded-[2rem] bg-primary text-primary-foreground hover:bg-primary/90 font-black text-xl tracking-tighter gap-3 btn-glow shadow-2xl"
                   >
                     {isGenerating ? (
                       <><Loader2 className="animate-spin" size={28} /> Production en cours...</>
                     ) : (
                       <><Sparkles size={28} /> Lancer le Moteur de Rendu</>
                     )}
                   </Button>
                   <p className="text-center text-[10px] text-muted-foreground mt-4 font-bold uppercase tracking-widest opacity-50">
                     Le rendu peut prendre entre 60s et 180s selon le moteur choisi.
                   </p>
                </div>
             </div>
          </div>

          {/* Side Panels */}
          <div className="lg:col-span-4 space-y-8">
             
             {/* Studio Tips */}
             <div className="glass-card rounded-[2.5rem] p-8 border-white/5 space-y-6 bg-gradient-to-br from-primary/10 to-transparent">
                <div className="h-14 w-14 rounded-2xl bg-primary/20 flex items-center justify-center text-primary shadow-xl"><Clapperboard size={28} /></div>
                <h3 className="text-xl font-black tracking-tight">Secrets d'Expert</h3>
                <div className="space-y-4">
                   {[
                     { t: "Utilisez Minimax pour les gros plans visages.", i: Star },
                     { t: "Kling est imbattable pour les textures d'eau et de feu.", i: Zap },
                     { t: "Activez le mode Standalone pour vos landing pages.", i: Layout },
                     { t: "Les vidéos de 8s convertissent mieux que 30s.", i: ShieldCheck }
                   ].map((tip, i) => (
                     <div key={i} className="flex gap-3 items-start">
                        <div className="mt-1"><tip.i size={14} className="text-primary" /></div>
                        <p className="text-xs font-medium text-muted-foreground leading-relaxed">{tip.t}</p>
                     </div>
                   ))}
                </div>
             </div>

             {/* Last Generation Preview (Placeholder) */}
             <div className="glass-card rounded-[2.5rem] p-8 border-white/5 space-y-6">
                <div className="flex items-center justify-between">
                   <h3 className="text-sm font-black uppercase tracking-widest text-primary">Dernière Production</h3>
                   <Badge className="bg-muted text-muted-foreground border-none text-[9px]">EN ATTENTE</Badge>
                </div>
                <div className="aspect-video rounded-3xl bg-muted/30 border border-dashed border-white/10 flex flex-col items-center justify-center text-center p-6 gap-3">
                   <div className="h-12 w-12 rounded-full bg-background flex items-center justify-center text-muted-foreground/30"><Monitor size={24} /></div>
                   <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest opacity-40">Aucune vidéo générée récemment</p>
                </div>
                <Button variant="ghost" className="w-full rounded-2xl text-[10px] font-black uppercase tracking-widest gap-2 text-muted-foreground">
                   <History size={14} /> Voir tout l'historique
                </Button>
             </div>

          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

const CinemaStudio = () => (
  <VendorGuard>{(vendor) => <CinemaStudioInner vendor={vendor} />}</VendorGuard>
);

export default CinemaStudio;


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
import { useAntiPiracy } from "@/hooks/useAntiPiracy";
import { toast } from "sonner";

const CinemaStudioInner = ({ vendor }: { vendor: any }) => {
  useAntiPiracy(); // Active la protection anti-piratage
  const { balance: credits } = useCredits(vendor?.id);
  const [activeTab, setActiveTab] = useState<'create' | 'projects'>('create');
  const [creationMode, setCreationMode] = useState<'magic' | 'pro'>('magic');
  
  // Project State
  const [projectTitle, setProjectTitle] = useState("Ma Publicité Premium");
  const [scenes, setScenes] = useState<any[]>([
    { id: '1', prompt: "", model: 'minimax', duration: 5, voiceScript: "", status: 'empty' }
  ]);
  const [selectedSceneIndex, setSelectedSceneIndex] = useState<number>(0);
  const [isGenerating, setIsGenerating] = useState(false);

  const currentScene = scenes[selectedSceneIndex];

  const addScene = () => {
    if (scenes.length >= 10) {
      toast.error("Limite de 10 scènes par projet atteinte.");
      return;
    }
    const newScene = { 
      id: Math.random().toString(36).substr(2, 9), 
      prompt: "", 
      model: 'kling-1-5', 
      duration: 5, 
      voiceScript: "",
      status: 'empty' 
    };
    setScenes([...scenes, newScene]);
    setSelectedSceneIndex(scenes.length);
  };

  const updateCurrentScene = (updates: any) => {
    const newScenes = [...scenes];
    newScenes[selectedSceneIndex] = { ...newScenes[selectedSceneIndex], ...updates };
    setScenes(newScenes);
  };

  const handleGenerateScene = async () => {
    if (!currentScene.prompt.trim()) {
      toast.error("Veuillez décrire la scène.");
      return;
    }

    const modelObj = VIDEO_MODELS.find(m => m.id === currentScene.model);
    if (credits < (modelObj?.creditCost || 0)) {
      toast.error("Crédits insuffisants.");
      return;
    }

    updateCurrentScene({ status: 'generating' });
    setIsGenerating(true);
    
    // Simulate generation
    setTimeout(() => {
      setIsGenerating(false);
      updateCurrentScene({ 
        status: 'completed', 
        videoUrl: 'https://cdn.pixabay.com/video/2023/10/20/185793-876182147_tiny.mp4' // Placeholder
      });
      toast.success("Scène générée avec succès !");
    }, 3000);
  };

  const handleExport = () => {
    const totalCost = scenes.length * 50; // Export fee
    if (credits < totalCost) {
      toast.error("Pas assez de crédits pour l'exportation finale.");
      return;
    }
    toast.success("Assemblage final lancé ! Vous recevrez votre vidéo d'une minute d'ici quelques instants.");
  };

  return (
    <DashboardLayout variant="vendor" title="Cinema Studio AI" shopName={vendor.shop_name}>
      <SEO title="Cinema Studio | MindHubs" description="Créez des publicités vidéos ultra-réalistes avec les meilleurs moteurs IA du monde." />

      <div className="mx-auto max-w-7xl space-y-8 pb-20">
        
        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
               <Badge className="bg-primary/20 text-primary border-none font-black text-[9px] px-3">DIRECTOR MODE 2.1</Badge>
               <span className="h-1 w-1 rounded-full bg-muted-foreground/30" />
               <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Éditeur Cinématique Long-Format</span>
            </div>
            <div className="flex items-center gap-4">
              <h2 className="text-4xl md:text-5xl font-black tracking-tighter">MindHubs <span className="text-gradient-primary">Cinema Studio</span></h2>
              <Input 
                value={projectTitle} 
                onChange={(e) => setProjectTitle(e.target.value)}
                className="bg-transparent border-none text-2xl font-black p-0 focus-visible:ring-0 w-auto text-muted-foreground/50 hover:text-foreground transition-colors"
              />
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="bg-card/50 backdrop-blur-xl p-4 rounded-3xl border border-border flex items-center gap-4 shadow-xl">
               <div className="h-10 w-10 rounded-2xl bg-primary/10 flex items-center justify-center text-primary"><Zap size={20} /></div>
               <div className="pr-4">
                  <p className="text-[9px] font-black uppercase text-muted-foreground tracking-widest">Solde IA</p>
                  <p className="text-lg font-black">{credits} <span className="text-xs text-muted-foreground">Crédits</span></p>
               </div>
            </div>
            <Button onClick={handleExport} className="h-14 rounded-2xl bg-foreground text-background hover:bg-primary hover:text-primary-foreground font-black px-8 gap-2 btn-glow">
              <Clapperboard size={18} /> EXPORTER 1 MIN+
            </Button>
          </div>
        </div>

        {/* Timeline Editor */}
        <div className="glass-card rounded-[2.5rem] border-white/5 p-4 bg-muted/20">
           <div className="flex items-center gap-4 overflow-x-auto pb-4 scrollbar-hide px-2">
              {scenes.map((scene, idx) => (
                <button
                  key={scene.id}
                  onClick={() => setSelectedSceneIndex(idx)}
                  className={`relative shrink-0 w-48 aspect-video rounded-2xl border-2 transition-all overflow-hidden group ${selectedSceneIndex === idx ? 'border-primary shadow-lg shadow-primary/20' : 'border-white/5 hover:border-white/20 bg-muted/40'}`}
                >
                   {scene.videoUrl ? (
                     <video src={scene.videoUrl} className="w-full h-full object-cover opacity-60 group-hover:opacity-100 transition-opacity" />
                   ) : (
                     <div className="w-full h-full flex flex-col items-center justify-center gap-2">
                        {scene.status === 'generating' ? <Loader2 className="animate-spin text-primary" size={20} /> : <ImageIcon size={20} className="text-muted-foreground/30" />}
                        <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/50">Scène {idx + 1}</span>
                     </div>
                   )}
                   <div className="absolute top-2 left-2 px-2 py-0.5 rounded-md bg-black/60 backdrop-blur-md text-[8px] font-black text-white">
                      {scene.duration}S
                   </div>
                </button>
              ))}
              <button 
                onClick={addScene}
                className="shrink-0 w-20 aspect-video rounded-2xl border-2 border-dashed border-white/10 hover:border-primary/50 hover:bg-primary/5 transition-all flex items-center justify-center text-muted-foreground hover:text-primary"
              >
                <Plus size={24} />
              </button>
           </div>
        </div>

        {/* Main Content Area */}
        <div className="grid lg:grid-cols-12 gap-8">
          
          {/* Preview & Controls */}
          <div className="lg:col-span-8 space-y-6">
             <div className="glass-card rounded-[3rem] border-white/5 overflow-hidden bg-black aspect-video relative group">
                {currentScene.videoUrl ? (
                  <video src={currentScene.videoUrl} controls className="w-full h-full object-contain" />
                ) : (
                  <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-12 space-y-4">
                     <div className="h-20 w-20 rounded-full bg-primary/10 flex items-center justify-center text-primary/30"><Monitor size={40} /></div>
                     <h3 className="text-xl font-black text-muted-foreground/40 uppercase tracking-widest">Prévisualisation Scène {selectedSceneIndex + 1}</h3>
                     <p className="text-sm text-muted-foreground/20 font-medium">Décrivez votre scène ci-dessous pour lancer le moteur.</p>
                  </div>
                )}
                
                <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex items-center gap-2 bg-black/40 backdrop-blur-xl p-2 rounded-2xl border border-white/10 opacity-0 group-hover:opacity-100 transition-opacity">
                   <Button size="icon" variant="ghost" className="h-10 w-10 rounded-xl text-white hover:bg-white/10"><Settings size={18} /></Button>
                   <Button size="icon" variant="ghost" className="h-10 w-10 rounded-xl text-white hover:bg-white/10"><Layout size={18} /></Button>
                   <Button size="icon" variant="ghost" className="h-10 w-10 rounded-xl text-white hover:bg-white/10"><Maximize2 size={18} /></Button>
                </div>
             </div>

             {/* Scene Editor Form */}
             <div className="glass-card rounded-[3rem] border-white/5 p-8 space-y-8 shadow-2xl">
                <div className="grid md:grid-cols-2 gap-8">
                  <div className="space-y-4">
                    <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Description Visuelle (Prompt)</Label>
                    <Textarea 
                      placeholder="Décrivez ce qui se passe dans cette scène..."
                      value={currentScene.prompt}
                      onChange={(e) => updateCurrentScene({ prompt: e.target.value })}
                      className="min-h-[120px] rounded-3xl bg-muted/20 border-white/5 p-6 text-base font-medium leading-relaxed resize-none focus:ring-primary/20"
                    />
                  </div>
                  <div className="space-y-4">
                    <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Script de l'Expert (Voiceover)</Label>
                    <Textarea 
                      placeholder="Ce que l'avatar ou le narrateur dit pendant cette scène..."
                      value={currentScene.voiceScript}
                      onChange={(e) => updateCurrentScene({ voiceScript: e.target.value })}
                      className="min-h-[120px] rounded-3xl bg-muted/20 border-white/5 p-6 text-base font-medium leading-relaxed resize-none focus:ring-primary/20"
                    />
                  </div>
                </div>

                <div className="flex flex-wrap items-center justify-between gap-6 pt-6 border-t border-white/5">
                   <div className="flex items-center gap-4">
                      <div className="space-y-2">
                        <Label className="text-[9px] font-black uppercase tracking-widest text-muted-foreground">Moteur de Rendu</Label>
                        <select 
                          value={currentScene.model}
                          onChange={(e) => updateCurrentScene({ model: e.target.value })}
                          className="bg-muted/40 border-white/10 rounded-xl text-xs font-bold p-2 focus:ring-primary/20 outline-none min-w-[150px]"
                        >
                          {VIDEO_MODELS.map(m => <option key={m.id} value={m.id}>{m.name} ({m.creditCost} pts)</option>)}
                        </select>
                      </div>
                      <div className="space-y-2">
                        <Label className="text-[9px] font-black uppercase tracking-widest text-muted-foreground">Durée (S)</Label>
                        <select 
                          value={currentScene.duration}
                          onChange={(e) => updateCurrentScene({ duration: parseInt(e.target.value) })}
                          className="bg-muted/40 border-white/10 rounded-xl text-xs font-bold p-2 focus:ring-primary/20 outline-none"
                        >
                          <option value={5}>5 Sec</option>
                          <option value={10}>10 Sec</option>
                        </select>
                      </div>
                   </div>

                   <Button 
                     onClick={handleGenerateScene}
                     disabled={isGenerating || currentScene.status === 'generating'}
                     className="h-16 rounded-2xl bg-primary text-primary-foreground font-black px-12 gap-2 shadow-xl shadow-primary/20"
                   >
                     {isGenerating ? <Loader2 className="animate-spin" /> : <Sparkles />} 
                     GÉNÉRER LA SCÈNE {selectedSceneIndex + 1}
                   </Button>
                </div>
             </div>
          </div>

          {/* Side Info */}
          <div className="lg:col-span-4 space-y-8">
             <div className="glass-card rounded-[2.5rem] p-8 border-white/5 space-y-6 bg-gradient-to-br from-primary/10 to-transparent">
                <h3 className="text-xl font-black tracking-tight">Récapitulatif Projet</h3>
                <div className="space-y-4">
                   <div className="flex justify-between items-center text-xs">
                      <span className="text-muted-foreground font-medium">Nombre de scènes</span>
                      <span className="font-black">{scenes.length} / 10</span>
                   </div>
                   <div className="flex justify-between items-center text-xs">
                      <span className="text-muted-foreground font-medium">Durée estimée</span>
                      <span className="font-black">{scenes.reduce((acc, s) => acc + s.duration, 0)} Secondes</span>
                   </div>
                   <div className="flex justify-between items-center text-xs">
                      <span className="text-muted-foreground font-medium">Total Crédits</span>
                      <span className="text-primary font-black">{scenes.reduce((acc, s) => acc + (VIDEO_MODELS.find(m => m.id === s.model)?.creditCost || 0), 0)} Pts</span>
                   </div>
                </div>
                <div className="pt-4 border-t border-white/5">
                   <div className="p-4 rounded-2xl bg-black/20 space-y-2">
                      <div className="flex items-center gap-2 text-[10px] font-black text-primary">
                         <ShieldCheck size={12} /> PROTECTION RENTABILITÉ
                      </div>
                      <p className="text-[10px] text-muted-foreground font-medium leading-tight">
                        Toute modification lourde du visuel consommera des crédits. Les modifications de script texte sont gratuites.
                      </p>
                   </div>
                </div>
             </div>

             <div className="glass-card rounded-[2.5rem] p-8 border-white/5 space-y-4">
                <h3 className="text-sm font-black uppercase tracking-widest text-primary">Audio & Musique</h3>
                <div className="space-y-3">
                   <Button variant="outline" className="w-full justify-start rounded-xl border-white/5 bg-muted/20 gap-3 h-12 text-xs font-bold">
                      <Monitor size={16} className="text-primary" /> Choisir une Musique (IA)
                   </Button>
                   <Button variant="outline" className="w-full justify-start rounded-xl border-white/5 bg-muted/20 gap-3 h-12 text-xs font-bold">
                      <UserCheck size={16} className="text-primary" /> Paramètres Avatar Expert
                   </Button>
                </div>
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

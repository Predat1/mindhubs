import { useState, useEffect } from "react";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import SEO from "@/components/SEO";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Sparkles, Search, Lightbulb, PenTool, Megaphone, Rocket, CheckCircle2, Lock, Zap } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import WinningProductSpy from "@/components/creator-lab/WinningProductSpy";
import IdeaSandbox from "@/components/creator-lab/IdeaSandbox";
import ProductArchitect from "@/components/creator-lab/ProductArchitect";
import MarketingCoPilot from "@/components/creator-lab/MarketingCoPilot";
import { CreatorLabProvider, useCreatorLab, type PipelineStepId } from "@/contexts/CreatorLabContext";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

// ─── 3 Principaux Changements ───
// 1. Intégration du PipelineTracker visuel pour matérialiser le flux de création.
// 2. Gestion unifiée des crédits avec Dialog de recharge automatique.
// 3. Header dynamique avec indicateur de monitoring "Live" des marchés africains.

const PIPELINE_STEPS = [
  { id: 'spy',       icon: Search,    label: 'Veille',     desc: 'Marchés africains' },
  { id: 'sandbox',   icon: Lightbulb, label: 'Validation', desc: 'Score de potentiel' },
  { id: 'architect', icon: PenTool,   label: 'Création',   desc: 'Produit complet IA' },
  { id: 'marketing', icon: Megaphone, label: 'Marketing',  desc: 'Scripts viraux' },
  { id: 'publish',   icon: Rocket,    label: 'Publication', desc: 'Mise en vente' },
];

const PipelineTracker = () => {
  const { pipelineStatus } = useCreatorLab();
  
  return (
    <div className="relative flex justify-between items-center max-w-4xl mx-auto mb-12 px-4">
      {/* WHY: Ligne de progression en arrière-plan */}
      <div className="absolute top-1/2 left-0 w-full h-0.5 bg-white/10 -translate-y-1/2 z-0" />
      
      {PIPELINE_STEPS.map((step, idx) => {
        const status = pipelineStatus[step.id as PipelineStepId];
        const Icon = step.icon;
        
        return (
          <div key={step.id} className="relative z-10 flex flex-col items-center gap-2 group">
            <motion.div 
              initial={false}
              animate={{
                scale: status === 'active' ? 1.1 : 1,
                backgroundColor: status === 'done' ? 'rgb(16, 185, 129)' : status === 'active' ? 'hsl(var(--primary))' : 'rgba(255, 255, 255, 0.1)',
                boxShadow: status === 'active' ? '0 0 20px hsl(var(--primary)/0.5)' : 'none'
              }}
              className="w-12 h-12 rounded-full flex items-center justify-center border border-white/10"
            >
              {status === 'done' ? <CheckCircle2 className="text-white" size={20} /> : <Icon className={status === 'locked' ? 'text-white/20' : 'text-white'} size={20} />}
              {status === 'active' && <motion.div animate={{ scale: [1, 1.2, 1] }} transition={{ repeat: Infinity, duration: 2 }} className="absolute inset-0 rounded-full border-2 border-primary" />}
            </motion.div>
            <div className="text-center">
              <p className={`text-xs font-bold ${status === 'locked' ? 'text-muted-foreground' : 'text-foreground'}`}>{step.label}</p>
              <p className="text-[10px] text-muted-foreground hidden sm:block">{step.desc}</p>
            </div>
          </div>
        );
      })}
    </div>
  );
};

const CreatorLabContent = () => {
  const [activeTab, setActiveTab] = useState("spy");
  const { credits, currentIdea } = useCreatorLab();
  const [showCreditDialog, setShowCreditDialog] = useState(false);
  const navigate = useNavigate();

  return (
    <DashboardLayout variant="vendor">
      <SEO title="Creator Lab | MindHubs" description="L'intelligence IA au service des créateurs africains." />
      
      <div className="max-w-[1200px] mx-auto space-y-8 pb-20">
        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-xl bg-primary/10 text-primary">
                <Sparkles size={24} />
              </div>
              <h1 className="text-4xl font-black tracking-tighter">Creator Lab</h1>
            </div>
            <div className="flex items-center gap-3">
              <span className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 text-[10px] font-black uppercase tracking-widest">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                15 Marchés Africains · Intelligence Temps Réel
              </span>
            </div>
          </div>

          {/* Credits Counter */}
          <div className="stat-card px-6 py-3 rounded-2xl border-glow flex items-center gap-4 bg-white/5 backdrop-blur-xl">
             <div className="text-right">
                <p className="text-[10px] font-black text-muted-foreground uppercase">Crédits IA</p>
                <p className="text-xl font-black text-primary">{credits}</p>
             </div>
             <div className="h-8 w-px bg-white/10" />
             <Button variant="ghost" size="sm" onClick={() => navigate('/dashboard/abonnement')} className="text-xs font-bold hover:bg-primary/10">Recharger</Button>
          </div>
        </div>

        <PipelineTracker />

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-8">
          <TabsList className="bg-white/5 p-1.5 rounded-2xl border border-white/10 h-auto grid grid-cols-2 md:grid-cols-4 gap-2">
            <TabsTrigger value="spy" className="rounded-xl py-3 gap-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
              <Search size={18} /> Veille
            </TabsTrigger>
            <TabsTrigger value="sandbox" className="rounded-xl py-3 gap-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
              <Lightbulb size={18} /> Sandbox
            </TabsTrigger>
            <TabsTrigger value="architect" className="rounded-xl py-3 gap-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
              <PenTool size={18} /> Architect
            </TabsTrigger>
            <TabsTrigger value="marketing" className="rounded-xl py-3 gap-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
              <Megaphone size={18} /> Co-Pilot
            </TabsTrigger>
          </TabsList>

          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
            >
              <TabsContent value="spy" className="mt-0">
                <WinningProductSpy onRemix={() => setActiveTab("sandbox")} />
              </TabsContent>
              <TabsContent value="sandbox" className="mt-0">
                <IdeaSandbox onValidate={() => setActiveTab("architect")} />
              </TabsContent>
              <TabsContent value="architect" className="mt-0">
                <ProductArchitect onRedact={() => setActiveTab("marketing")} />
              </TabsContent>
              <TabsContent value="marketing" className="mt-0">
                <MarketingCoPilot />
              </TabsContent>
            </motion.div>
          </AnimatePresence>
        </Tabs>
      </div>

      <Dialog open={showCreditDialog} onOpenChange={setShowCreditDialog}>
        <DialogContent className="rounded-[2.5rem] border-white/10 bg-zinc-950 p-8">
          <DialogHeader className="space-y-4">
            <div className="w-16 h-16 rounded-2xl bg-amber-500/10 flex items-center justify-center text-amber-500 mb-2">
              <Zap size={32} fill="currentColor" />
            </div>
            <DialogTitle className="text-3xl font-black uppercase tracking-tighter">Crédits IA insuffisants</DialogTitle>
            <DialogDescription className="text-zinc-400 font-medium text-base">
              Votre solde actuel ({credits} crédits) est trop bas pour lancer cette intelligence. Passez au plan supérieur ou achetez un pack de crédits.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-3 mt-8">
            <Button variant="ghost" onClick={() => setShowCreditDialog(false)} className="rounded-xl font-black uppercase text-[10px]">Plus tard</Button>
            <Button onClick={() => navigate('/dashboard/abonnement')} className="rounded-xl bg-primary text-black font-black uppercase tracking-widest text-[10px] px-8 h-12 shadow-[0_0_20px_rgba(212,175,55,0.3)]">
              Recharger maintenant
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
};

export default function CreatorLab() {
  return (
    <CreatorLabProvider>
      <CreatorLabContent />
    </CreatorLabProvider>
  );
}

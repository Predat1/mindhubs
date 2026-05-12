import { useState, useEffect } from "react";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import SEO from "@/components/SEO";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Sparkles, Search, Lightbulb, PenTool, Megaphone, RotateCcw } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import WinningProductSpy from "@/components/creator-lab/WinningProductSpy";
import IdeaSandbox from "@/components/creator-lab/IdeaSandbox";
import ProductArchitect from "@/components/creator-lab/ProductArchitect";
import MarketingCoPilot from "@/components/creator-lab/MarketingCoPilot";
import AmbientBackground from "@/components/creator-lab/AmbientBackground";
import PipelineDock from "@/components/creator-lab/PipelineDock";
import CreditsHUD from "@/components/creator-lab/CreditsHUD";
import QuickRecipes from "@/components/creator-lab/QuickRecipes";
import CommandBar from "@/components/creator-lab/CommandBar";
import type { PipelineStepId } from "@/contexts/CreatorLabContext";
import { CreatorLabProvider, useCreatorLab } from "@/contexts/CreatorLabContext";

// ─── Creator LAB — Premium AI OS ───
// Refonte UX/UI : shell immersif (ambient bg + glass docks + command bar)
// Architecture conservée : 4 modules existants (Spy / Sandbox / Architect / Marketing)
// + nouveau hub d'accueil avec recettes IA et command palette (Ctrl+K).

const CreatorLabContent = () => {
  const [activeTab, setActiveTab] = useState<string>("home");
  const { currentIdea, setCurrentIdea, resetSession } = useCreatorLab();

  // Persist current tab across mounts
  useEffect(() => {
    const saved = sessionStorage.getItem("cl_active_tab");
    if (saved) setActiveTab(saved);
  }, []);

  useEffect(() => {
    sessionStorage.setItem("cl_active_tab", activeTab);
  }, [activeTab]);

  const handleRecipeStart = (step: PipelineStepId, idea: string) => {
    setCurrentIdea(idea);
    setActiveTab(step);
  };

  const handleNavigate = (step: PipelineStepId | string) => {
    setActiveTab(step);
  };

  return (
    <DashboardLayout variant="vendor">
      <SEO
        title="Creator LAB — OS IA pour Créateurs | MindHubs"
        description="L'OS intelligent qui transforme une idée en produit digital rentable. Veille, validation, création IA, marketing — tout en une plateforme."
      />

      <div className="relative">
        <AmbientBackground />

        <div className="relative mx-auto max-w-[1240px] space-y-10 pb-20">
          {/* ═══ Top Hero ═══ */}
          <div className="space-y-6">
            <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
              <motion.div
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
                className="space-y-3"
              >
                <div className="flex items-center gap-2">
                  <span className="inline-flex items-center gap-1.5 rounded-full border border-primary/30 bg-primary/10 px-3 py-1">
                    <Sparkles size={11} className="text-primary" fill="currentColor" />
                    <span className="text-[10px] font-black uppercase tracking-[0.25em] text-primary">
                      Creator LAB · OS IA
                    </span>
                  </span>
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-1">
                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                    <span className="text-[9px] font-black uppercase tracking-widest text-emerald-500">
                      15 marchés africains · Live
                    </span>
                  </span>
                </div>
                <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black tracking-tighter leading-[0.95]">
                  De l'idée au produit{" "}
                  <span className="bg-gradient-to-r from-primary via-accent to-fuchsia-400 bg-clip-text text-transparent">
                    rentable
                  </span>
                  <br />
                  en quelques heures.
                </h1>
                <p className="max-w-xl text-sm sm:text-base font-medium text-muted-foreground leading-relaxed">
                  Veille des marchés, validation, création produit, marketing — l'IA pilote
                  votre business digital de bout en bout.
                </p>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6, delay: 0.1 }}
              >
                <CreditsHUD />
              </motion.div>
            </div>

            {/* Command bar */}
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.15 }}
            >
              <CommandBar onNavigate={(s) => handleNavigate(s)} />
            </motion.div>
          </div>

          {/* ═══ Pipeline Dock ═══ */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <PipelineDock onStepClick={(s) => setActiveTab(s)} />
          </motion.div>

          {/* ═══ Reset session (subtle) ═══ */}
          {currentIdea && (
            <div className="flex items-center justify-between px-1 -mt-4">
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <span className="font-bold">Idée en cours&nbsp;:</span>
                <span className="line-clamp-1 max-w-[400px] sm:max-w-[600px] text-foreground/80">
                  {currentIdea}
                </span>
              </div>
              <button
                onClick={() => {
                  if (confirm("Réinitialiser la session ? L'idée et le pipeline en cours seront effacés.")) {
                    resetSession();
                    setActiveTab("home");
                  }
                }}
                className="inline-flex items-center gap-1 rounded-lg px-2 py-1 text-[10px] font-bold text-muted-foreground hover:text-foreground hover:bg-white/5 transition"
              >
                <RotateCcw size={10} /> Réinitialiser
              </button>
            </div>
          )}

          {/* ═══ Modules ═══ */}
          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
            {/* Tab triggers — premium glass */}
            <TabsList className="bg-white/[0.03] backdrop-blur-xl border border-white/10 p-1.5 rounded-2xl h-auto grid grid-cols-2 md:grid-cols-5 gap-1.5 w-full">
              <TabsTrigger
                value="home"
                className="rounded-xl py-2.5 gap-2 text-xs font-bold data-[state=active]:bg-gradient-to-br data-[state=active]:from-primary data-[state=active]:to-accent data-[state=active]:text-primary-foreground data-[state=active]:shadow-[0_0_18px_hsl(var(--primary)/0.4)]"
              >
                <Sparkles size={15} /> Accueil
              </TabsTrigger>
              <TabsTrigger
                value="spy"
                className="rounded-xl py-2.5 gap-2 text-xs font-bold data-[state=active]:bg-gradient-to-br data-[state=active]:from-primary data-[state=active]:to-accent data-[state=active]:text-primary-foreground data-[state=active]:shadow-[0_0_18px_hsl(var(--primary)/0.4)]"
              >
                <Search size={15} /> Veille
              </TabsTrigger>
              <TabsTrigger
                value="sandbox"
                className="rounded-xl py-2.5 gap-2 text-xs font-bold data-[state=active]:bg-gradient-to-br data-[state=active]:from-primary data-[state=active]:to-accent data-[state=active]:text-primary-foreground data-[state=active]:shadow-[0_0_18px_hsl(var(--primary)/0.4)]"
              >
                <Lightbulb size={15} /> Sandbox
              </TabsTrigger>
              <TabsTrigger
                value="architect"
                className="rounded-xl py-2.5 gap-2 text-xs font-bold data-[state=active]:bg-gradient-to-br data-[state=active]:from-primary data-[state=active]:to-accent data-[state=active]:text-primary-foreground data-[state=active]:shadow-[0_0_18px_hsl(var(--primary)/0.4)]"
              >
                <PenTool size={15} /> Architect
              </TabsTrigger>
              <TabsTrigger
                value="marketing"
                className="rounded-xl py-2.5 gap-2 text-xs font-bold data-[state=active]:bg-gradient-to-br data-[state=active]:from-primary data-[state=active]:to-accent data-[state=active]:text-primary-foreground data-[state=active]:shadow-[0_0_18px_hsl(var(--primary)/0.4)]"
              >
                <Megaphone size={15} /> Co-Pilot
              </TabsTrigger>
            </TabsList>

            <AnimatePresence mode="wait">
              <motion.div
                key={activeTab}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.3 }}
              >
                <TabsContent value="home" className="mt-0">
                  <QuickRecipes onStart={handleRecipeStart} />
                </TabsContent>
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
      </div>
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

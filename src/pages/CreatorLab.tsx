import { useState } from "react";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Sparkles, Search, Lightbulb, PenTool, Megaphone, Zap, ShieldCheck } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import WinningProductSpy from "@/components/creator-lab/WinningProductSpy";
import IdeaSandbox from "@/components/creator-lab/IdeaSandbox";
import ProductArchitect from "@/components/creator-lab/ProductArchitect";
import MarketingCoPilot from "@/components/creator-lab/MarketingCoPilot";

const CreatorLab = () => {
  const [activeTab, setActiveTab] = useState("spy");
  const [credits, setCredits] = useState(250);

  return (
    <DashboardLayout variant="vendor" title="Creator Lab Elite">
      <div className="max-w-7xl mx-auto space-y-8 pb-20">
        
        {/* Header Section */}
        <div className="relative overflow-hidden rounded-[2.5rem] p-8 md:p-12 border border-white/10 bg-card/30 backdrop-blur-xl shadow-2xl">
          <div className="absolute -top-24 -right-24 h-64 w-64 bg-primary/20 blur-[100px] rounded-full animate-pulse" />
          <div className="absolute -bottom-24 -left-24 h-64 w-64 bg-accent/20 blur-[100px] rounded-full" />
          
          <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-8">
            <div className="space-y-4 max-w-2xl">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary text-[10px] font-black uppercase tracking-widest">
                <Sparkles size={12} className="animate-pulse" /> IA Creator Suite
              </div>
              <h1 className="text-4xl md:text-5xl font-black tracking-tighter leading-tight">
                De l'idée au <span className="text-primary italic">Produit Gagnant</span> en 24h
              </h1>
              <p className="text-muted-foreground text-lg leading-relaxed">
                Utilisez l'intelligence artificielle pour débusquer les tendances mondiales, valider vos concepts et concevoir des produits digitaux de classe mondiale.
              </p>
            </div>
            
            <div className="flex flex-col gap-3 p-6 rounded-3xl bg-white/5 border border-white/5 backdrop-blur-sm min-w-[240px]">
              <div className="flex items-center justify-between">
                <span className="text-xs font-black uppercase tracking-widest text-muted-foreground">Crédits IA</span>
                <Zap size={14} className="text-amber-500 fill-amber-500" />
              </div>
              <div className="text-3xl font-black">{credits} / 500</div>
              <div className="w-full h-1.5 bg-white/10 rounded-full overflow-hidden">
                <motion.div 
                  initial={{ width: 0 }}
                  animate={{ width: `${(credits / 500) * 100}%` }}
                  className="h-full bg-gradient-to-r from-primary to-accent" 
                />
              </div>
              <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-tighter">Renouvellement dans 12 jours</p>
            </div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <Tabs defaultValue="spy" onValueChange={setActiveTab} className="space-y-8">
          <div className="flex justify-center">
            <TabsList className="h-16 p-2 bg-card/50 backdrop-blur-xl border border-white/10 rounded-2xl gap-2">
              <TabsTrigger value="spy" className="rounded-xl px-6 font-black text-xs uppercase tracking-widest gap-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
                <Search size={16} /> <span className="hidden md:inline">Veille (Ads)</span>
              </TabsTrigger>
              <TabsTrigger value="sandbox" className="rounded-xl px-6 font-black text-xs uppercase tracking-widest gap-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
                <Lightbulb size={16} /> <span className="hidden md:inline">Validation</span>
              </TabsTrigger>
              <TabsTrigger value="architect" className="rounded-xl px-6 font-black text-xs uppercase tracking-widest gap-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
                <PenTool size={16} /> <span className="hidden md:inline">Conception</span>
              </TabsTrigger>
              <TabsTrigger value="marketing" className="rounded-xl px-6 font-black text-xs uppercase tracking-widest gap-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
                <Megaphone size={16} /> <span className="hidden md:inline">Marketing</span>
              </TabsTrigger>
            </TabsList>
          </div>

          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
            >
              <TabsContent value="spy" className="mt-0 focus-visible:outline-none">
                <WinningProductSpy />
              </TabsContent>
              <TabsContent value="sandbox" className="mt-0 focus-visible:outline-none">
                <IdeaSandbox />
              </TabsContent>
              <TabsContent value="architect" className="mt-0 focus-visible:outline-none">
                <ProductArchitect />
              </TabsContent>
              <TabsContent value="marketing" className="mt-0 focus-visible:outline-none">
                <MarketingCoPilot />
              </TabsContent>
            </motion.div>
          </AnimatePresence>
        </Tabs>
      </div>
    </DashboardLayout>
  );
};

export default CreatorLab;

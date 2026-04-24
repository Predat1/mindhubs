import { useState, useEffect, useMemo } from "react";
import {
  Search,
  ArrowRight,
  TrendingUp,
  Sparkles,
  BookOpen,
  FileText,
  CheckCircle2,
  ChevronRight,
  ChevronLeft,
  ShoppingCart,
  Download,
  RefreshCw,
  Zap,
  Layout,
  Layers,
  Sparkle,
  Megaphone,
  Palette,
  Info,
  UserCheck,
  Target,
  ListChecks,
  FileEdit,
  Globe,
  Settings2,
  Plus,
  Trash2,
  Eye,
  FileDown,
  Wand2,
  Crown,
  MousePointer2,
  Briefcase,
  Lightbulb,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import VendorGuard from "@/components/dashboard/VendorGuard";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Slider } from "@/components/ui/slider";
import { toast } from "sonner";
import jsPDF from "jspdf";

// Types & Config
type ProductType = "ebook" | "templates" | "course" | "checklist" | "prompts" | "planner" | "report" | "marketing_kit";

interface Chapter {
  id: string;
  title: string;
  content: string;
  isGenerated: boolean;
}

const PRODUCT_TYPES: Record<ProductType, { label: string; icon: any; color: string; gradient: string }> = {
  ebook: { label: "E-book Premium", icon: FileText, color: "#3b82f6", gradient: "from-blue-600 to-cyan-500" },
  planner: { label: "Digital Planner", icon: Layout, color: "#ec4899", gradient: "from-pink-600 to-rose-500" },
  course: { label: "Masterclass", icon: Zap, color: "#f59e0b", gradient: "from-amber-500 to-orange-600" },
  report: { label: "Rapport Expert", icon: TrendingUp, color: "#10b981", gradient: "from-emerald-600 to-teal-500" },
  checklist: { label: "Checklist Pro", icon: CheckCircle2, color: "#22c55e", gradient: "from-green-500 to-emerald-600" },
  templates: { label: "Pack Templates", icon: Layers, color: "#8b5cf6", gradient: "from-violet-600 to-purple-500" },
  prompts: { label: "Bibliothèque Prompts", icon: Sparkle, color: "#f43f5e", gradient: "from-rose-500 to-red-600" },
  marketing_kit: { label: "Kit Marketing", icon: Megaphone, color: "#ef4444", gradient: "from-red-600 to-orange-500" },
};

const COUNTRIES = [
  { code: "SN", name: "Sénégal", flag: "🇸🇳" },
  { code: "CI", name: "Côte d'Ivoire", flag: "🇨🇮" },
  { code: "FR", name: "France", flag: "🇫🇷" },
  { code: "CM", name: "Cameroun", flag: "🇨🇲" },
  { code: "MA", name: "Maroc", flag: "🇲🇦" },
];

const DigitalProductFactory = () => {
  const [step, setStep] = useState<"niche" | "concept" | "design" | "generate" | "publish">("niche");
  const [niche, setNiche] = useState("");
  const [country, setCountry] = useState("SN");
  const [selectedType, setSelectedType] = useState<ProductType>("ebook");
  const [isProcessing, setIsProcessing] = useState(false);
  const [generationProgress, setGenerationProgress] = useState(0);
  
  const [chapters, setChapters] = useState<Chapter[]>([
    { id: "1", title: "Introduction Stratégique", content: "", isGenerated: false },
    { id: "2", title: "L'Analyse du Marché Local", content: "", isGenerated: false },
    { id: "3", title: "Guide d'Implémentation", content: "", isGenerated: false },
    { id: "4", title: "Conclusion & Prochaines Étapes", content: "", isGenerated: false },
  ]);

  const currentTypeInfo = PRODUCT_TYPES[selectedType];

  const exportToPDF = () => {
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();
    
    // Cover Page Design
    doc.setFillColor(15, 15, 15);
    doc.rect(0, 0, pageWidth, 297, 'F');
    
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(40);
    doc.setFont("helvetica", "bold");
    doc.text(niche.toUpperCase(), pageWidth / 2, 100, { align: 'center' });
    
    doc.setFontSize(16);
    doc.setTextColor(150, 150, 150);
    doc.text(currentTypeInfo.label.toUpperCase(), pageWidth / 2, 115, { align: 'center' });
    
    doc.setFillColor(79, 70, 229);
    doc.rect(pageWidth / 4, 130, pageWidth / 2, 2, 'F');
    
    doc.save(`Mindhubs_${niche}_${selectedType}.pdf`);
    toast.success("Votre chef-d'œuvre est prêt !");
  };

  const addChapter = () => {
    setChapters([...chapters, { id: Date.now().toString(), title: "Nouveau Chapitre", content: "", isGenerated: false }]);
  };

  const handleGenerate = async () => {
    setStep("generate");
    setGenerationProgress(0);
    for (let i = 0; i < chapters.length; i++) {
      await new Promise(r => setTimeout(r, 800));
      setChapters(prev => prev.map((c, idx) => idx === i ? { ...c, isGenerated: true } : c));
      setGenerationProgress(Math.round(((i + 1) / chapters.length) * 100));
    }
    setTimeout(() => setStep("publish"), 1000);
  };

  return (
    <VendorGuard>
      {(vendor) => (
        <DashboardLayout variant="vendor" shopName={vendor.shop_name} shopUrl={`/store/${vendor.username}`}>
          <div className="max-w-7xl mx-auto pb-20 px-4">
            
            {/* Elite Header */}
            <header className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6 mb-12">
               <motion.div 
                 initial={{ opacity: 0, x: -20 }}
                 animate={{ opacity: 1, x: 0 }}
                 className="space-y-2"
               >
                  <div className="flex items-center gap-3">
                     <Badge className="bg-primary/20 text-primary border-none px-3 py-1 font-black tracking-tighter">V3 ELITE</Badge>
                     <div className="h-1 w-12 bg-gradient-to-r from-primary to-transparent rounded-full" />
                  </div>
                  <h1 className="text-5xl font-black tracking-tight bg-gradient-to-br from-foreground via-foreground/80 to-muted-foreground bg-clip-text text-transparent">
                    Digital Product <span className="text-primary italic">Factory</span>
                  </h1>
                  <p className="text-muted-foreground font-medium flex items-center gap-2">
                    <Sparkles size={16} className="text-primary" /> L'intelligence artificielle au service de votre empire digital.
                  </p>
               </motion.div>

               <div className="flex gap-4">
                  <div className="p-4 rounded-3xl bg-card border border-border/50 shadow-xl flex items-center gap-4 backdrop-blur-xl">
                     <div className="h-12 w-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary">
                        <Crown size={24} />
                     </div>
                     <div>
                        <p className="text-[10px] font-black uppercase text-muted-foreground tracking-widest">Compte Vendeur</p>
                        <p className="text-sm font-bold">{vendor.shop_name}</p>
                     </div>
                  </div>
               </div>
            </header>

            {/* Main Stage */}
            <div className="grid grid-cols-1 xl:grid-cols-12 gap-8">
              
              {/* Left Column: Workflow (8 cols) */}
              <div className="xl:col-span-8 space-y-8">
                
                <AnimatePresence mode="wait">
                  {/* STEP 1: NICHE DISCOVERY */}
                  {step === "niche" && (
                    <motion.div 
                      key="step1"
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -20 }}
                      className="space-y-8"
                    >
                      <Card className="p-10 border-primary/20 bg-gradient-to-br from-card to-muted/20 shadow-2xl relative overflow-hidden">
                        <div className="absolute -top-24 -right-24 h-64 w-64 bg-primary/5 rounded-full blur-3xl" />
                        
                        <div className="space-y-8 relative z-10">
                           <div className="text-center space-y-4">
                              <h2 className="text-3xl font-black italic">Quelle opportunité allons-nous exploiter ?</h2>
                              <p className="text-muted-foreground max-w-lg mx-auto">L'IA analyse les tendances de recherche locales pour identifier votre niche gagnante.</p>
                           </div>

                           <div className="flex justify-center gap-4">
                              {COUNTRIES.map(c => (
                                <button 
                                  key={c.code}
                                  onClick={() => setCountry(c.code)}
                                  className={`group flex flex-col items-center gap-2 p-4 rounded-3xl border transition-all ${
                                    country === c.code ? "bg-primary border-primary text-white shadow-lg scale-110" : "bg-muted/40 border-transparent hover:border-primary/30"
                                  }`}
                                >
                                  <span className="text-3xl">{c.flag}</span>
                                  <span className="text-[10px] font-black uppercase tracking-tighter">{c.name}</span>
                                </button>
                              ))}
                           </div>

                           <div className="max-w-xl mx-auto space-y-4">
                              <div className="relative group">
                                 <Input 
                                   placeholder="Votre domaine (ex: Elevage, Crypto, Design...)"
                                   className="h-16 pl-14 pr-6 rounded-3xl bg-background border-border/80 text-xl font-bold transition-all focus:ring-4 focus:ring-primary/10"
                                   value={niche}
                                   onChange={(e) => setNiche(e.target.value)}
                                 />
                                 <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-muted-foreground group-focus-within:text-primary transition-colors" size={24} />
                              </div>
                              <Button 
                                className="w-full h-16 rounded-3xl btn-glow text-xl font-black gap-3" 
                                onClick={() => setStep("concept")}
                                disabled={!niche}
                              >
                                Analyser le Marché <ArrowRight size={24} />
                              </Button>
                           </div>
                        </div>
                      </Card>

                      {/* Info Cards */}
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {[
                          { icon: TrendingUp, label: "Potentiel", val: "Élevé", color: "text-emerald-500" },
                          { icon: Target, label: "Ciblage", val: "Précis", color: "text-blue-500" },
                          { icon: Zap, label: "Vitesse", val: "Express", color: "text-amber-500" },
                        ].map((item, i) => (
                          <Card key={i} className="p-6 flex items-center gap-4 bg-card/40 backdrop-blur-md">
                             <div className={`h-10 w-10 rounded-xl bg-muted flex items-center justify-center ${item.color}`}>
                                <item.icon size={20} />
                             </div>
                             <div>
                                <p className="text-[10px] font-black uppercase text-muted-foreground">{item.label}</p>
                                <p className="font-bold">{item.val}</p>
                             </div>
                          </Card>
                        ))}
                      </div>
                    </motion.div>
                  )}

                  {/* STEP 2: CONCEPT & FORMAT */}
                  {step === "concept" && (
                    <motion.div 
                      key="step2"
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="space-y-8"
                    >
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                        {(Object.entries(PRODUCT_TYPES) as [ProductType, any][]).map(([id, info]) => (
                          <Card 
                            key={id}
                            onClick={() => setSelectedType(id)}
                            className={`p-6 cursor-pointer transition-all hover:-translate-y-2 border-2 relative overflow-hidden ${
                              selectedType === id ? "border-primary bg-primary/5 ring-4 ring-primary/10" : "border-border/60"
                            }`}
                          >
                             <div className={`h-12 w-12 rounded-2xl bg-gradient-to-br ${info.gradient} text-white flex items-center justify-center mb-4 shadow-lg`}>
                                <info.icon size={24} />
                             </div>
                             <p className="font-black text-sm leading-tight">{info.label}</p>
                             {selectedType === id && <div className="absolute top-2 right-2 h-2 w-2 rounded-full bg-primary animate-pulse" />}
                          </Card>
                        ))}
                      </div>

                      <Card className="p-8 border-primary/20 space-y-6">
                         <div className="flex items-center justify-between">
                            <h3 className="text-2xl font-black">Plan de Production Infinie</h3>
                            <Button variant="outline" size="sm" onClick={addChapter} className="rounded-full gap-2 border-primary/30 text-primary">
                              <Plus size={16} /> Ajouter un chapitre
                            </Button>
                         </div>
                         <div className="space-y-3 max-h-[400px] overflow-y-auto pr-2 scrollbar-thin">
                            {chapters.map((ch, i) => (
                              <motion.div 
                                layout
                                key={ch.id} 
                                className="flex items-center gap-4 bg-muted/30 p-3 rounded-2xl group border border-transparent hover:border-primary/20 transition-all"
                              >
                                 <div className="h-10 w-10 rounded-xl bg-card border border-border flex items-center justify-center font-black text-xs">{i+1}</div>
                                 <Input 
                                   value={ch.title} 
                                   onChange={(e) => setChapters(prev => prev.map(c => c.id === ch.id ? { ...c, title: e.target.value } : c))}
                                   className="flex-1 bg-transparent border-none text-sm font-bold focus-visible:ring-0"
                                 />
                                 <Button variant="ghost" size="icon" onClick={() => setChapters(chapters.filter(c => c.id !== ch.id))} className="opacity-0 group-hover:opacity-100 text-muted-foreground hover:text-destructive transition-all">
                                    <Trash2 size={16} />
                                 </Button>
                              </motion.div>
                            ))}
                         </div>
                         <Button className="w-full h-16 rounded-3xl btn-glow text-xl font-black gap-3 mt-4" onClick={() => setStep("design")}>
                           Valider la Structure <Wand2 size={24} />
                         </Button>
                      </Card>
                    </motion.div>
                  )}

                  {/* STEP 3: PREVIEW & STYLE */}
                  {step === "design" && (
                    <motion.div key="step3" className="space-y-8 animate-in fade-in slide-in-from-right-12">
                       <Card className="p-12 text-center space-y-8 border-primary/20 relative overflow-hidden">
                          <div className="absolute inset-0 bg-gradient-to-b from-primary/5 to-transparent" />
                          <div className="relative z-10 space-y-6">
                             <div className="h-24 w-24 bg-primary/10 rounded-full flex items-center justify-center mx-auto text-primary">
                                <Sparkles size={48} className="animate-pulse" />
                             </div>
                             <h2 className="text-4xl font-black italic">Prêt pour le grand saut ?</h2>
                             <p className="text-muted-foreground max-w-md mx-auto">L'IA va maintenant rédiger les <strong>{chapters.length} chapitres</strong> de votre produit "{niche}".</p>
                             
                             <div className="flex justify-center gap-8 py-6 border-y border-border/50">
                                <div className="text-center">
                                   <p className="text-[10px] font-black uppercase text-primary">Volume</p>
                                   <p className="text-xl font-black">~{chapters.length * 400} mots</p>
                                </div>
                                <div className="text-center">
                                   <p className="text-[10px] font-black uppercase text-primary">Estimation</p>
                                   <p className="text-xl font-black">2min 30s</p>
                                </div>
                             </div>

                             <Button className="w-full h-16 rounded-3xl btn-glow text-xl font-black gap-3" onClick={handleGenerate}>
                                Lancer la Rédaction Totale <Zap size={24} fill="currentColor" />
                             </Button>
                          </div>
                       </Card>
                    </motion.div>
                  )}

                  {/* STEP 4: GENERATION PROGRESS */}
                  {step === "generate" && (
                    <motion.div key="step4" className="space-y-12 py-12 text-center">
                       <div className="relative h-48 w-48 mx-auto">
                          <svg className="h-full w-full -rotate-90">
                            <circle cx="96" cy="96" r="88" className="fill-none stroke-muted stroke-[12]" />
                            <motion.circle 
                              cx="96" cy="96" r="88" 
                              className="fill-none stroke-primary stroke-[12] stroke-round"
                              initial={{ pathLength: 0 }}
                              animate={{ pathLength: generationProgress / 100 }}
                              transition={{ duration: 0.5 }}
                            />
                          </svg>
                          <div className="absolute inset-0 flex flex-col items-center justify-center">
                             <span className="text-5xl font-black">{generationProgress}%</span>
                             <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">En rédaction</span>
                          </div>
                       </div>
                       
                       <div className="max-w-xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-4">
                          {chapters.map((ch, i) => (
                            <div key={ch.id} className={`p-4 rounded-2xl border transition-all flex items-center justify-between ${
                              ch.isGenerated ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-600" : 
                              generationProgress > (i * (100/chapters.length)) ? "bg-primary/5 border-primary animate-pulse" : "bg-muted/20 border-border opacity-50"
                            }`}>
                               <span className="text-xs font-black truncate">{i+1}. {ch.title}</span>
                               {ch.isGenerated && <CheckCircle2 size={16} />}
                            </div>
                          ))}
                       </div>
                    </motion.div>
                  )}

                  {/* STEP 5: PUBLISH */}
                  {step === "publish" && (
                    <motion.div key="step5" className="space-y-8 animate-in zoom-in-95">
                       <Card className="p-16 text-center space-y-10 border-primary shadow-[0_0_50px_rgba(79,70,229,0.2)] bg-gradient-to-br from-card to-primary/5 relative overflow-hidden">
                          <div className="absolute top-0 right-0 p-8 opacity-10 rotate-12">
                             <Crown size={200} />
                          </div>
                          <div className="relative z-10 space-y-6">
                             <div className="h-24 w-24 bg-emerald-500/20 text-emerald-500 rounded-full flex items-center justify-center mx-auto mb-6 scale-125">
                                <CheckCircle2 size={50} />
                             </div>
                             <h2 className="text-5xl font-black leading-tight">Succès Total. <br /> Votre empire commence ici.</h2>
                             <p className="text-muted-foreground max-w-lg mx-auto font-medium">Votre produit est prêt. Il est temps de le partager avec le monde et de récolter les fruits de votre vision.</p>
                          </div>

                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 max-w-2xl mx-auto relative z-10">
                             <Button className="h-24 flex flex-col gap-1 rounded-3xl btn-glow text-2xl font-black shadow-2xl" onClick={exportToPDF}>
                                <FileDown size={32} />
                                <span className="text-[10px] font-black uppercase tracking-widest">Télécharger le Master-PDF</span>
                             </Button>
                             <Button variant="outline" className="h-24 flex flex-col gap-1 rounded-3xl border-primary/40 hover:bg-primary/5 text-xl font-bold">
                                <ShoppingCart size={28} />
                                <span className="text-[10px] font-black uppercase tracking-widest">Vendre sur la Boutique</span>
                             </Button>
                          </div>
                       </Card>
                    </motion.div>
                  )}
                </AnimatePresence>

              </div>

              {/* Right Column: Dynamic Preview / Mockup (4 cols) */}
              <div className="xl:col-span-4">
                 <div className="sticky top-24 space-y-6">
                    <Card className="p-8 bg-card/60 backdrop-blur-3xl border-border/60 relative group overflow-hidden">
                       <div className="absolute inset-0 bg-gradient-to-br from-primary/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                       <h4 className="text-xs font-black uppercase text-primary tracking-widest mb-6">Aperçu du Produit</h4>
                       
                       {/* 3D-ish Mockup */}
                       <div className="relative aspect-[3/4] rounded-2xl bg-zinc-900 overflow-hidden shadow-2xl transition-transform duration-500 group-hover:scale-105 group-hover:rotate-1">
                          <div className={`absolute inset-0 bg-gradient-to-br ${currentTypeInfo.gradient} opacity-80`} />
                          <div className="absolute inset-0 p-8 flex flex-col justify-between text-white z-10">
                             <div className="space-y-2">
                                <Badge className="bg-white/20 text-white border-none backdrop-blur-md text-[9px] uppercase font-bold tracking-widest">{selectedType}</Badge>
                                <h3 className="text-2xl font-black leading-none uppercase drop-shadow-lg">{niche || "VOTRE TITRE ICI"}</h3>
                             </div>
                             <div className="space-y-4">
                                <div className="h-1 w-12 bg-white/40 rounded-full" />
                                <p className="text-[10px] font-black uppercase tracking-[0.2em] opacity-80">Mindhubs Elite Edition</p>
                             </div>
                          </div>
                          {/* Light sheen effect */}
                          <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/5 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
                       </div>

                       <div className="mt-8 space-y-4">
                          <div className="flex items-center justify-between text-xs">
                             <span className="text-muted-foreground">Marché</span>
                             <span className="font-bold">{country} {COUNTRIES.find(c => c.code === country)?.name}</span>
                          </div>
                          <div className="flex items-center justify-between text-xs">
                             <span className="text-muted-foreground">Format</span>
                             <span className="font-bold">{currentTypeInfo.label}</span>
                          </div>
                          <div className="flex items-center justify-between text-xs">
                             <span className="text-muted-foreground">Qualité IA</span>
                             <Badge className="bg-emerald-500/10 text-emerald-500 border-none text-[9px] uppercase font-black">Vérifiée</Badge>
                          </div>
                       </div>
                    </Card>

                    <Card className="p-6 bg-primary/5 border-primary/20 border-dashed">
                       <h5 className="text-[10px] font-black uppercase tracking-widest mb-3 flex items-center gap-2">
                         <Lightbulb size={12} className="text-primary" /> Astuce Strategique
                       </h5>
                       <p className="text-[11px] leading-relaxed text-muted-foreground">
                         "Les produits au format <strong>{currentTypeInfo.label}</strong> se vendent en moyenne 25% plus cher sur le marché {country} lorsqu'ils incluent des bonus pratiques."
                       </p>
                    </Card>
                 </div>
              </div>

            </div>
          </div>
        </DashboardLayout>
      )}
    </VendorGuard>
  );
};

export default DigitalProductFactory;

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
  Facebook,
  BarChart,
  ShieldCheck,
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

// Types
type ProductType = "ebook" | "templates" | "course" | "checklist" | "prompts" | "planner" | "report" | "marketing_kit";

interface Chapter {
  id: string;
  title: string;
  content: string;
  isGenerated: boolean;
}

interface PainPoint {
  id: string;
  title: string;
  urgency: number;
  description: string;
  fbAdsInsight: string;
}

interface CountryInfo {
  code: string;
  name: string;
  flag: string;
  adsPotential: "high" | "medium" | "low";
  avgCpc: string;
  paymentEase: string;
}

const ALL_COUNTRIES: CountryInfo[] = [
  { code: "SN", name: "Sénégal", flag: "🇸🇳", adsPotential: "high", avgCpc: "0.05$", paymentEase: "Wave/OM" },
  { code: "CI", name: "Côte d'Ivoire", flag: "🇨🇮", adsPotential: "high", avgCpc: "0.07$", paymentEase: "Momo/OM" },
  { code: "CM", name: "Cameroun", flag: "🇨🇲", adsPotential: "medium", avgCpc: "0.08$", paymentEase: "OM/Momo" },
  { code: "MA", name: "Maroc", flag: "🇲🇦", adsPotential: "medium", avgCpc: "0.12$", paymentEase: "Card/PayPal" },
  { code: "TG", name: "Togo", flag: "🇹🇬", adsPotential: "medium", avgCpc: "0.04$", paymentEase: "Flooz/TMoney" },
  { code: "BJ", name: "Bénin", flag: "🇧🇯", adsPotential: "medium", avgCpc: "0.05$", paymentEase: "Momo" },
  { code: "GA", name: "Gabon", flag: "🇬🇦", adsPotential: "low", avgCpc: "0.15$", paymentEase: "Airtel/Moov" },
  { code: "CD", name: "RDC", flag: "🇨🇩", adsPotential: "high", avgCpc: "0.06$", paymentEase: "M-Pesa/Momo" },
  { code: "GN", name: "Guinée", flag: "🇬🇳", adsPotential: "low", avgCpc: "0.05$", paymentEase: "OM" },
  { code: "BF", name: "Burkina Faso", flag: "🇧🇫", adsPotential: "medium", avgCpc: "0.04$", paymentEase: "Moov/OM" },
];

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

const DigitalProductFactory = () => {
  const [step, setStep] = useState<"niche" | "market_strategy" | "problem_select" | "design" | "generate" | "publish">("niche");
  const [niche, setNiche] = useState("");
  const [selectedCountry, setSelectedCountry] = useState<string>("SN");
  const [isProcessing, setIsProcessing] = useState(false);
  const [painPoints, setPainPoints] = useState<PainPoint[]>([]);
  const [selectedPainPoint, setSelectedPainPoint] = useState<PainPoint | null>(null);
  const [selectedType, setSelectedType] = useState<ProductType>("ebook");
  const [generationProgress, setGenerationProgress] = useState(0);
  
  const [chapters, setChapters] = useState<Chapter[]>([]);

  // Derived Recommandations
  const recommendedCountries = useMemo(() => {
    if (!niche) return [];
    // Simulation: IA chooses top 3 based on niche
    return ALL_COUNTRIES.filter(c => c.adsPotential === "high" || Math.random() > 0.6).slice(0, 3);
  }, [niche]);

  const handleNicheSubmit = () => {
    if (!niche) return toast.error("Veuillez entrer une niche.");
    setIsProcessing(true);
    setTimeout(() => {
      setIsProcessing(false);
      setStep("market_strategy");
    }, 1500);
  };

  const handleCountrySelect = (code: string) => {
    setSelectedCountry(code);
    setIsProcessing(true);
    setTimeout(() => {
      setPainPoints([
        { id: "1", title: "Manque de visibilité locale", urgency: 95, description: "L'impossibilité de toucher les clients au-delà du quartier.", fbAdsInsight: "Ciblage 'Personnes habitant ici' très efficace." },
        { id: "2", title: "Gestion des stocks complexe", urgency: 88, description: "Pertes financières dues à une mauvaise prévision.", fbAdsInsight: "Lead generation pour pré-ventes recommandé." },
        { id: "3", title: "Paiements non sécurisés", urgency: 92, description: "Crainte de l'arnaque chez les acheteurs en ligne.", fbAdsInsight: "Highlight Wave/Momo dans la créative publicitaire." },
        { id: "4", title: "Concurrence déloyale des prix", urgency: 85, description: "Guerre des prix sur Facebook qui réduit les marges.", fbAdsInsight: "Stratégie de Branding nécessaire pour justifier le prix." },
        { id: "5", title: "Difficultés de livraison", urgency: 90, description: "Le dernier kilomètre qui coûte trop cher.", fbAdsInsight: "Ciblage par zones urbaines denses uniquement." },
      ].sort((a, b) => b.urgency - a.urgency));
      setIsProcessing(false);
      setStep("problem_select");
    }, 1500);
  };

  const handleProblemSelect = (point: PainPoint) => {
    setSelectedPainPoint(point);
    // Dynamic Chapter generation based on problem
    setChapters([
      { id: "1", title: `Introduction : Comprendre ${point.title}`, content: "", isGenerated: false },
      { id: "2", title: `Pourquoi ce problème bloque 90% des business au ${selectedCountry}`, content: "", isGenerated: false },
      { id: "3", title: "La Méthode Mindhubs pour une solution radicale", content: "", isGenerated: false },
      { id: "4", title: "Plan d'Action : Résoudre ce problème en 7 jours", content: "", isGenerated: false },
      { id: "5", title: "Cas Pratiques et Modèles Prêts à l'emploi", content: "", isGenerated: false },
    ]);
    setStep("design");
  };

  const startGeneration = async () => {
    setStep("generate");
    setGenerationProgress(0);
    for (let i = 0; i < chapters.length; i++) {
      await new Promise(r => setTimeout(r, 1000));
      setChapters(prev => prev.map((c, idx) => idx === i ? { ...c, isGenerated: true } : c));
      setGenerationProgress(Math.round(((i + 1) / chapters.length) * 100));
    }
    setTimeout(() => setStep("publish"), 800);
  };

  return (
    <VendorGuard>
      {(vendor) => (
        <DashboardLayout variant="vendor" shopName={vendor.shop_name} shopUrl={`/store/${vendor.username}`}>
          <div className="max-w-7xl mx-auto pb-20 px-4">
            
            {/* Header Strategist */}
            <header className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6 mb-12 animate-in fade-in slide-in-from-top-6">
               <div className="space-y-2">
                  <div className="flex items-center gap-3">
                     <Badge className="bg-primary/20 text-primary border-none px-3 py-1 font-black tracking-tighter">STRATEGIST V4</Badge>
                     <div className="h-1 w-12 bg-gradient-to-r from-primary to-transparent rounded-full" />
                  </div>
                  <h1 className="text-5xl font-black tracking-tight text-foreground">
                    Market <span className="text-primary italic">Strategist</span>
                  </h1>
                  <p className="text-muted-foreground font-medium flex items-center gap-2">
                    <Facebook size={16} className="text-blue-500" /> IA Optimisée pour Facebook Ads & Marché Africain.
                  </p>
               </div>
            </header>

            <AnimatePresence mode="wait">
              {/* STEP 1: NICHE ENTRY */}
              {step === "niche" && (
                <motion.div key="niche" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95 }} className="max-w-3xl mx-auto">
                   <Card className="p-12 border-primary/20 bg-card shadow-2xl relative overflow-hidden">
                      <div className="absolute top-0 right-0 p-8 opacity-5"><Target size={150} /></div>
                      <div className="space-y-8 relative z-10">
                        <div className="text-center space-y-4">
                           <h2 className="text-3xl font-black">Quel marché allons-nous conquérir ?</h2>
                           <p className="text-muted-foreground">Entrez votre niche, l'IA détectera les opportunités publicitaires.</p>
                        </div>
                        <div className="relative group">
                           <Input 
                             placeholder="Ex: Immobilier, Beauté Bio, Formation IA..." 
                             className="h-16 pl-14 rounded-3xl text-xl font-bold bg-muted/30 border-none"
                             value={niche}
                             onChange={(e) => setNiche(e.target.value)}
                           />
                           <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-muted-foreground group-focus-within:text-primary transition-colors" size={24} />
                        </div>
                        <Button className="w-full h-16 rounded-3xl btn-glow text-xl font-black gap-3" onClick={handleNicheSubmit} disabled={isProcessing || !niche}>
                           {isProcessing ? <RefreshCw className="animate-spin" /> : <BarChart size={24} />}
                           {isProcessing ? "Analyse des tendances..." : "Lancer l'Analyse Stratégique"}
                        </Button>
                      </div>
                   </Card>
                </motion.div>
              )}

              {/* STEP 2: COUNTRY RECOMMENDATION */}
              {step === "market_strategy" && (
                <motion.div key="market" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-8">
                   <div className="text-center space-y-2">
                      <h2 className="text-3xl font-black italic">Recommandations Facebook Ads</h2>
                      <p className="text-muted-foreground">Voici les pays où votre publicité pour <strong>{niche}</strong> sera la plus rentable.</p>
                   </div>
                   
                   <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      {recommendedCountries.map((c) => (
                        <Card 
                          key={c.code}
                          onClick={() => handleCountrySelect(c.code)}
                          className="p-8 cursor-pointer border-2 hover:border-primary transition-all group relative overflow-hidden bg-card"
                        >
                           <div className="flex items-center justify-between mb-6">
                              <span className="text-4xl">{c.flag}</span>
                              <Badge className="bg-emerald-500 text-white font-black uppercase text-[10px]">ROI MAX</Badge>
                           </div>
                           <h3 className="text-2xl font-black mb-2">{c.name}</h3>
                           <div className="space-y-3 pt-4 border-t border-border/50">
                              <div className="flex justify-between text-xs">
                                 <span className="text-muted-foreground">CPC Moyen:</span>
                                 <span className="font-bold text-primary">{c.avgCpc}</span>
                              </div>
                              <div className="flex justify-between text-xs">
                                 <span className="text-muted-foreground">Paiement:</span>
                                 <span className="font-bold">{c.paymentEase}</span>
                              </div>
                           </div>
                           <Button className="w-full mt-6 gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                              Cibler ce Pays <ChevronRight size={16} />
                           </Button>
                        </Card>
                      ))}
                   </div>

                   <div className="max-w-4xl mx-auto pt-8 border-t border-border/50">
                      <p className="text-center text-xs font-bold text-muted-foreground uppercase tracking-widest mb-4">Ou choisissez manuellement :</p>
                      <div className="flex flex-wrap justify-center gap-2">
                         {ALL_COUNTRIES.map(c => (
                           <button 
                             key={c.code}
                             onClick={() => handleCountrySelect(c.code)}
                             className="px-4 py-2 rounded-xl bg-muted/40 border border-transparent hover:border-primary/40 text-sm font-bold flex items-center gap-2"
                           >
                             <span>{c.flag}</span> {c.name}
                           </button>
                         ))}
                      </div>
                   </div>
                </motion.div>
              )}

              {/* STEP 3: PROBLEM SELECTION */}
              {step === "problem_select" && (
                <motion.div key="problems" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="space-y-8">
                   <div className="text-center space-y-2">
                      <h2 className="text-3xl font-black">Choisissez la Douleur N°1</h2>
                      <p className="text-muted-foreground">Sélectionnez le problème que vous voulez résoudre pour {niche} au {ALL_COUNTRIES.find(c => c.code === selectedCountry)?.name}.</p>
                   </div>

                   <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      {painPoints.map((point) => (
                        <Card 
                          key={point.id}
                          onClick={() => handleProblemSelect(point)}
                          className={`p-6 cursor-pointer border-2 transition-all relative group overflow-hidden ${
                            selectedPainPoint?.id === point.id ? "border-primary bg-primary/5" : "hover:border-primary/40"
                          }`}
                        >
                           <div className="absolute top-0 right-0 p-4">
                              <Badge className="bg-destructive/10 text-destructive border-none">Urgence: {point.urgency}%</Badge>
                           </div>
                           <div className="space-y-4">
                              <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
                                 <ShieldCheck size={24} />
                              </div>
                              <h3 className="text-xl font-bold leading-tight">{point.title}</h3>
                              <p className="text-xs text-muted-foreground italic">"{point.description}"</p>
                              
                              <div className="pt-4 border-t border-border/50 space-y-2 bg-blue-500/5 p-3 rounded-xl">
                                 <p className="text-[9px] font-black text-blue-600 uppercase flex items-center gap-1"><Facebook size={10} /> Insight FB Ads</p>
                                 <p className="text-[10px] font-bold">{point.fbAdsInsight}</p>
                              </div>
                           </div>
                        </Card>
                      ))}
                   </div>
                </motion.div>
              )}

              {/* STEP 4: DESIGN & REWRITING PREVIEW */}
              {step === "design" && selectedPainPoint && (
                <motion.div key="design" className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                   <div className="lg:col-span-8 space-y-6">
                      <Card className="p-8 border-primary/20 space-y-6">
                         <div className="flex items-center justify-between">
                            <h3 className="text-2xl font-black">Plan sur-mesure généré</h3>
                            <Badge className="bg-primary/10 text-primary">Cible: {selectedPainPoint.title}</Badge>
                         </div>
                         <div className="space-y-3">
                            {chapters.map((ch, i) => (
                              <div key={ch.id} className="flex items-center gap-3 p-3 bg-muted/20 rounded-xl border border-transparent">
                                 <div className="h-8 w-8 rounded-lg bg-card border border-border flex items-center justify-center font-black text-[10px]">{i+1}</div>
                                 <span className="text-sm font-bold">{ch.title}</span>
                              </div>
                            ))}
                         </div>
                         <Button className="w-full h-16 rounded-3xl btn-glow text-xl font-black gap-3" onClick={startGeneration}>
                            Lancer la Rédaction Stratégique <Sparkles size={24} />
                         </Button>
                      </Card>
                   </div>
                   
                   <div className="lg:col-span-4">
                      <Card className="p-8 bg-card border-primary/20 sticky top-24 space-y-6 overflow-hidden">
                         <div className="absolute -top-10 -right-10 h-32 w-32 bg-primary/5 rounded-full blur-2xl" />
                         <h4 className="text-xs font-black uppercase text-primary tracking-widest">Configuration Active</h4>
                         <div className="space-y-4">
                            <div className="p-4 rounded-2xl bg-muted/40 space-y-3">
                               <div className="flex justify-between text-xs"><span>Niche:</span> <span className="font-bold">{niche}</span></div>
                               <div className="flex justify-between text-xs"><span>Marché:</span> <span className="font-bold">{selectedCountry}</span></div>
                               <div className="flex justify-between text-xs"><span>Angle de vente:</span> <span className="font-bold truncate max-w-[120px]">{selectedPainPoint.title}</span></div>
                            </div>
                            <div className="p-4 border-2 border-dashed border-primary/30 rounded-2xl">
                               <p className="text-[10px] font-bold text-primary mb-2 uppercase">💡 Strategie Claude</p>
                               <p className="text-[11px] leading-relaxed italic text-muted-foreground">
                                 "En ciblant spécifiquement <strong>{selectedPainPoint.title}</strong>, vous réduisez votre coût par lead car votre message publicitaire parlera directement au cœur du problème de vos clients."
                               </p>
                            </div>
                         </div>
                      </Card>
                   </div>
                </motion.div>
              )}

              {/* STEP 5: PROGRESS */}
              {step === "generate" && (
                <motion.div key="generate" className="max-w-4xl mx-auto space-y-12 py-12 text-center">
                   <div className="relative h-40 w-40 mx-auto">
                      <div className="absolute inset-0 rounded-full border-8 border-muted" />
                      <div className="absolute inset-0 rounded-full border-8 border-primary border-t-transparent animate-spin" />
                      <div className="absolute inset-0 flex items-center justify-center font-black text-4xl">{generationProgress}%</div>
                   </div>
                   <h2 className="text-3xl font-black italic">Rédaction Deep-Write en cours...</h2>
                   <div className="max-w-md mx-auto space-y-2">
                      <Progress value={generationProgress} className="h-2" />
                      <p className="text-[10px] font-bold text-muted-foreground uppercase">Optimisation SEO & Facebook Ads incluse</p>
                   </div>
                </motion.div>
              )}

              {/* STEP 6: PUBLISH */}
              {step === "publish" && (
                <motion.div key="publish" className="max-w-3xl mx-auto animate-in zoom-in-95">
                   <Card className="p-12 text-center space-y-8 border-primary shadow-2xl relative">
                      <div className="h-20 w-20 bg-emerald-500/20 text-emerald-500 rounded-full flex items-center justify-center mx-auto scale-125 mb-4">
                         <CheckCircle2 size={40} />
                      </div>
                      <h2 className="text-4xl font-black">Produit Stratégique Prêt.</h2>
                      <p className="text-muted-foreground italic font-medium">Votre guide optimisé pour {selectedCountry} est prêt à être téléchargé.</p>
                      
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-xl mx-auto">
                        <Button className="h-20 flex flex-col gap-1 rounded-3xl btn-glow text-xl font-black" onClick={() => {
                           const doc = new jsPDF();
                           doc.text("Mindhubs Strategist V4", 20, 20);
                           doc.save(`Mindhubs_${niche}_${selectedCountry}.pdf`);
                        }}>
                           <FileDown size={24} />
                           <span className="text-[10px] uppercase font-black">Télécharger le PDF</span>
                        </Button>
                        <Button variant="outline" className="h-20 flex flex-col gap-1 rounded-3xl border-primary/40">
                           <ShoppingCart size={24} />
                           <span className="text-[10px] uppercase font-black">Vendre sur Mindhubs</span>
                        </Button>
                      </div>
                   </Card>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </DashboardLayout>
      )}
    </VendorGuard>
  );
};

export default DigitalProductFactory;

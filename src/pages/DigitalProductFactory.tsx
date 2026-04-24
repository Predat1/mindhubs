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
  ClipboardCheck,
  Rocket,
  Copy,
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

interface AdCopy {
  type: string;
  hook: string;
  body: string;
  cta: string;
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
  const [step, setStep] = useState<"niche" | "market_strategy" | "problem_select" | "design" | "generate" | "ads_kit" | "publish">("niche");
  const [niche, setNiche] = useState("");
  const [selectedCountry, setSelectedCountry] = useState<string>("SN");
  const [isProcessing, setIsProcessing] = useState(false);
  const [painPoints, setPainPoints] = useState<PainPoint[]>([]);
  const [selectedPainPoint, setSelectedPainPoint] = useState<PainPoint | null>(null);
  const [selectedType, setSelectedType] = useState<ProductType>("ebook");
  const [generationProgress, setGenerationProgress] = useState(0);
  const [adsKit, setAdsKit] = useState<AdCopy[]>([]);
  
  const [chapters, setChapters] = useState<Chapter[]>([]);

  // Derived Recommandations
  const recommendedCountries = useMemo(() => {
    if (!niche) return [];
    return ALL_COUNTRIES.filter(c => c.adsPotential === "high" || Math.random() > 0.6).slice(0, 3);
  }, [niche]);

  const handleNicheSubmit = () => {
    if (!niche) return toast.error("Veuillez entrer une niche.");
    setIsProcessing(true);
    setTimeout(() => {
      setIsProcessing(false);
      setStep("market_strategy");
    }, 1200);
  };

  const handleCountrySelect = (code: string) => {
    setSelectedCountry(code);
    setIsProcessing(true);
    setTimeout(() => {
      setPainPoints([
        { id: "1", title: "Manque de visibilité locale", urgency: 95, description: "L'impossibilité de toucher les clients au-delà du quartier.", fbAdsInsight: "Ciblage 'Personnes habitant ici' très efficace." },
        { id: "2", title: "Gestion des stocks complexe", urgency: 88, description: "Pertes financières dues à une mauvaise prévision.", fbAdsInsight: "Lead generation pour pré-ventes recommandé." },
        { id: "3", title: "Paiements non sécurisés", urgency: 92, description: "Crainte de l'arnaque chez les acheteurs en ligne.", fbAdsInsight: "Highlight Wave/Momo dans la créative publicitaire." },
      ].sort((a, b) => b.urgency - a.urgency));
      setIsProcessing(false);
      setStep("problem_select");
    }, 1200);
  };

  const handleProblemSelect = (point: PainPoint) => {
    setSelectedPainPoint(point);
    setChapters([
      { id: "1", title: `Introduction : Comprendre ${point.title}`, content: "", isGenerated: false },
      { id: "2", title: `Pourquoi ce problème bloque 90% des business au ${selectedCountry}`, content: "", isGenerated: false },
      { id: "3", title: "La Méthode Mindhubs pour une solution radicale", content: "", isGenerated: false },
      { id: "4", title: "Plan d'Action Immédiat", content: "", isGenerated: false },
    ]);
    setStep("design");
  };

  const startGeneration = async () => {
    setStep("generate");
    setGenerationProgress(0);
    for (let i = 0; i < chapters.length; i++) {
      await new Promise(r => setTimeout(r, 800));
      setChapters(prev => prev.map((c, idx) => idx === i ? { ...c, isGenerated: true } : c));
      setGenerationProgress(Math.round(((i + 1) / (chapters.length + 1)) * 100));
    }
    
    // Generate Ads Kit
    setAdsKit([
      { 
        type: "Story-Telling", 
        hook: `J'en avais marre de voir mon business de ${niche} stagner à cause de ${selectedPainPoint?.title}...`,
        body: `C'est l'histoire de beaucoup d'entrepreneurs au ${selectedCountry}. On a le produit, on a l'ambition, mais ${selectedPainPoint?.description}. Voici comment j'ai tout changé en 7 jours.`,
        cta: "Découvrez la méthode ici 👇"
      },
      { 
        type: "Bénéfice Direct", 
        hook: `Marre de ${selectedPainPoint?.title} ? Voici la solution finale.`,
        body: `✅ Éliminez ${selectedPainPoint?.title}\n✅ Augmentez vos revenus de 30%\n✅ Simplifiez votre gestion quotidienne au ${selectedCountry}.`,
        cta: "Télécharger mon guide maintenant"
      }
    ]);
    
    setGenerationProgress(100);
    setTimeout(() => setStep("ads_kit"), 800);
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success("Copié dans le presse-papier !");
  };

  return (
    <VendorGuard>
      {(vendor) => (
        <DashboardLayout variant="vendor" shopName={vendor.shop_name} shopUrl={`/store/${vendor.username}`}>
          <div className="max-w-7xl mx-auto pb-20 px-4">
            
            <header className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6 mb-12">
               <div className="space-y-2">
                  <Badge className="bg-primary/20 text-primary border-none px-3 py-1 font-black">LAUNCH ENGINE V5</Badge>
                  <h1 className="text-5xl font-black tracking-tight text-foreground">
                    Mindhubs <span className="text-primary italic">Factory</span>
                  </h1>
                  <p className="text-muted-foreground font-medium flex items-center gap-2">
                    <Rocket size={16} className="text-orange-500" /> Kit de Lancement Business Automatisé.
                  </p>
               </div>
            </header>

            <AnimatePresence mode="wait">
              {/* STEP 1: NICHE */}
              {step === "niche" && (
                <motion.div key="niche" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="max-w-3xl mx-auto">
                   <Card className="p-12 border-primary/20 bg-card shadow-2xl text-center space-y-8">
                      <div className="h-20 w-20 bg-primary/10 rounded-full flex items-center justify-center mx-auto text-primary"><Search size={32} /></div>
                      <h2 className="text-3xl font-black">Quel est le sujet de votre produit ?</h2>
                      <Input 
                         placeholder="Ex: Elevage, E-commerce, Marketing..." 
                         className="h-16 text-center text-2xl font-bold bg-muted/30 border-none rounded-3xl"
                         value={niche}
                         onChange={(e) => setNiche(e.target.value)}
                      />
                      <Button className="w-full h-16 rounded-3xl btn-glow text-xl font-black gap-3" onClick={handleNicheSubmit} disabled={!niche}>Lancer l'Analyse</Button>
                   </Card>
                </motion.div>
              )}

              {/* STEP 2: GEO-ADS */}
              {step === "market_strategy" && (
                <motion.div key="market" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-8">
                   <h2 className="text-3xl font-black text-center">Top Pays Recommandés (FB Ads)</h2>
                   <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      {recommendedCountries.map(c => (
                        <Card key={c.code} onClick={() => handleCountrySelect(c.code)} className="p-8 cursor-pointer border-2 hover:border-primary transition-all">
                           <span className="text-4xl mb-4 block">{c.flag}</span>
                           <h3 className="text-2xl font-black mb-4">{c.name}</h3>
                           <div className="space-y-2 text-xs">
                              <div className="flex justify-between"><span>ROI Potentiel:</span> <Badge className="bg-emerald-500">MAX</Badge></div>
                              <div className="flex justify-between"><span>CPC Estimé:</span> <span className="font-bold">{c.avgCpc}</span></div>
                           </div>
                        </Card>
                      ))}
                   </div>
                </motion.div>
              )}

              {/* STEP 3: PROBLEM */}
              {step === "problem_select" && (
                <motion.div key="problems" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="space-y-8">
                   <h2 className="text-3xl font-black text-center">Quel problème voulez-vous résoudre ?</h2>
                   <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      {painPoints.map(p => (
                        <Card key={p.id} onClick={() => handleProblemSelect(p)} className="p-6 cursor-pointer border-2 hover:border-primary">
                           <Badge variant="destructive" className="mb-4">URGENCE {p.urgency}%</Badge>
                           <h3 className="text-xl font-bold mb-2">{p.title}</h3>
                           <p className="text-xs text-muted-foreground italic mb-4">"{p.description}"</p>
                           <div className="bg-blue-500/5 p-3 rounded-xl border border-blue-500/10 text-[10px]">
                              <span className="font-black text-blue-600 block mb-1">FB ADS STRATEGY</span>
                              {p.fbAdsInsight}
                           </div>
                        </Card>
                      ))}
                   </div>
                </motion.div>
              )}

              {/* STEP 4: DESIGN */}
              {step === "design" && selectedPainPoint && (
                <motion.div key="design" className="max-w-4xl mx-auto space-y-8">
                   <Card className="p-8 border-primary/20 space-y-6">
                      <h3 className="text-2xl font-black">Plan de Fabrication</h3>
                      <div className="space-y-3">
                         {chapters.map((ch, i) => (
                           <div key={ch.id} className="p-4 bg-muted/20 rounded-2xl flex items-center gap-4">
                              <span className="h-8 w-8 rounded-lg bg-card flex items-center justify-center font-black text-xs">{i+1}</span>
                              <span className="font-bold text-sm">{ch.title}</span>
                           </div>
                         ))}
                      </div>
                      <Button className="w-full h-16 rounded-3xl btn-glow text-xl font-black gap-3" onClick={startGeneration}>Générer mon Business Kit <Sparkles size={24} /></Button>
                   </Card>
                </motion.div>
              )}

              {/* STEP 5: GENERATING */}
              {step === "generate" && (
                 <motion.div key="generate" className="max-w-xl mx-auto py-20 text-center space-y-8">
                    <div className="relative h-40 w-40 mx-auto">
                       <div className="absolute inset-0 rounded-full border-8 border-muted" />
                       <div className="absolute inset-0 rounded-full border-8 border-primary border-t-transparent animate-spin" />
                       <div className="absolute inset-0 flex items-center justify-center font-black text-4xl">{generationProgress}%</div>
                    </div>
                    <h2 className="text-3xl font-black italic">Création de votre empire...</h2>
                    <Progress value={generationProgress} className="h-2" />
                 </motion.div>
              )}

              {/* STEP 6: ADS KIT PREVIEW */}
              {step === "ads_kit" && (
                <motion.div key="ads" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-8">
                   <div className="text-center space-y-2">
                      <h2 className="text-3xl font-black">Votre Kit de Vente Facebook Ads</h2>
                      <p className="text-muted-foreground font-medium">Copiez ces textes pour lancer votre publicité immédiatement.</p>
                   </div>

                   <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                      {adsKit.map((ad, i) => (
                        <Card key={i} className="p-8 border-primary/20 relative group">
                           <div className="flex items-center justify-between mb-6">
                              <Badge className="bg-primary/10 text-primary">{ad.type}</Badge>
                              <Button variant="ghost" size="icon" onClick={() => copyToClipboard(`${ad.hook}\n\n${ad.body}\n\n${ad.cta}`)}>
                                 <Copy size={16} />
                              </Button>
                           </div>
                           <div className="space-y-4 font-mono text-xs leading-relaxed text-muted-foreground bg-muted/30 p-6 rounded-2xl border border-border">
                              <p className="font-bold text-foreground">Accroche (Hook):</p>
                              <p>{ad.hook}</p>
                              <div className="h-px bg-border" />
                              <p className="font-bold text-foreground">Corps du texte (Body):</p>
                              <p>{ad.body}</p>
                              <div className="h-px bg-border" />
                              <p className="font-bold text-foreground">Appel à l'action (CTA):</p>
                              <p className="text-primary font-bold">{ad.cta}</p>
                           </div>
                        </Card>
                      ))}
                      
                      <Card className="p-8 bg-blue-500/5 border-blue-500/20 lg:col-span-2">
                         <div className="flex items-center gap-4 mb-4">
                            <div className="h-10 w-10 rounded-full bg-blue-500 text-white flex items-center justify-center"><Facebook size={20} /></div>
                            <div>
                               <h4 className="font-black">Ciblage Recommandé</h4>
                               <p className="text-[10px] text-muted-foreground uppercase font-bold tracking-widest">Audience Facebook Ads</p>
                            </div>
                         </div>
                         <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            <div className="p-3 bg-white/50 rounded-xl border border-blue-500/10">
                               <p className="text-[9px] font-bold text-blue-600">PAYS</p>
                               <p className="text-xs font-bold">{selectedCountry}</p>
                            </div>
                            <div className="p-3 bg-white/50 rounded-xl border border-blue-500/10">
                               <p className="text-[9px] font-bold text-blue-600">ÂGE</p>
                               <p className="text-xs font-bold">25 - 45 ans</p>
                            </div>
                            <div className="p-3 bg-white/50 rounded-xl border border-blue-500/10">
                               <p className="text-[9px] font-bold text-blue-600">INTÉRÊTS</p>
                               <p className="text-xs font-bold truncate">Entrepreneur, {niche}</p>
                            </div>
                            <div className="p-3 bg-white/50 rounded-xl border border-blue-500/10">
                               <p className="text-[9px] font-bold text-blue-600">BUDGET MIN.</p>
                               <p className="text-xs font-bold">5$ / jour</p>
                            </div>
                         </div>
                      </Card>
                   </div>

                   <Button className="w-full h-16 rounded-3xl btn-glow text-xl font-black gap-3" onClick={() => setStep("publish")}>
                      Valider & Télécharger le Kit Complet <ArrowRight size={24} />
                   </Button>
                </motion.div>
              )}

              {/* STEP 7: FINAL PUBLISH */}
              {step === "publish" && (
                <motion.div key="publish" className="max-w-4xl mx-auto animate-in zoom-in-95 duration-700">
                   <Card className="p-16 text-center space-y-10 border-primary shadow-2xl bg-gradient-to-br from-card to-primary/5">
                      <div className="h-24 w-24 bg-emerald-500/20 text-emerald-500 rounded-full flex items-center justify-center mx-auto scale-125 mb-4 animate-bounce">
                         <CheckCircle2 size={48} />
                      </div>
                      <h2 className="text-5xl font-black">Félicitations Vendeur !</h2>
                      <p className="text-muted-foreground font-medium italic">Votre produit digital et votre stratégie publicitaire sont prêts.</p>
                      
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-xl mx-auto">
                        <Button className="h-24 flex flex-col gap-1 rounded-3xl btn-glow text-2xl font-black" onClick={() => {
                           const doc = new jsPDF();
                           doc.text("Mindhubs Launch Engine V5", 20, 20);
                           doc.save(`Mindhubs_BusinessKit_${niche}.pdf`);
                        }}>
                           <FileDown size={32} />
                           <span className="text-[10px] font-black uppercase">Télécharger le Kit Business</span>
                        </Button>
                        <Button variant="outline" className="h-24 flex flex-col gap-1 rounded-3xl border-primary/40 hover:bg-primary/5">
                           <ShoppingCart size={28} />
                           <span className="text-[10px] font-black uppercase">Mettre en vente sur Mindhubs</span>
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

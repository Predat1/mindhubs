import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import {
  LucideIcon,
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
  nicheRelevance?: string;
}

interface AdsTargeting {
  country: string;
  ageRange: string;
  interests: string;
  dailyBudget: string;
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

const PRODUCT_TYPES: Record<ProductType, { label: string; icon: LucideIcon; color: string; gradient: string }> = {
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
  const [selectedCountryName, setSelectedCountryName] = useState<string>("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [painPoints, setPainPoints] = useState<PainPoint[]>([]);
  const [selectedPainPoint, setSelectedPainPoint] = useState<PainPoint | null>(null);
  const [selectedType, setSelectedType] = useState<ProductType>("ebook");
  const [generationProgress, setGenerationProgress] = useState(0);
  const [adsKit, setAdsKit] = useState<AdCopy[]>([]);
  const [adsTargeting, setAdsTargeting] = useState<AdsTargeting | null>(null);
  
  const [chapters, setChapters] = useState<Chapter[]>([]);
  const [analyzedCountries, setAnalyzedCountries] = useState<CountryInfo[]>([]);

  const handleNicheSubmit = async () => {
    if (!niche) return toast.error("Veuillez entrer une niche.");
    setIsProcessing(true);
    try {
      const { data, error } = await supabase.functions.invoke("factory-analyze-niche", {
        body: { niche },
      });
      if (error) throw new Error(error.message);
      const typedData = data as { countries?: CountryInfo[]; error?: string };
      if (typedData?.error) throw new Error(typedData.error);
      const countries = typedData.countries as CountryInfo[];
      if (!countries?.length) throw new Error("Aucun pays recommandé");
      setAnalyzedCountries(countries);
      setStep("market_strategy");
    } catch (e: unknown) {
      toast.error("Erreur d'analyse", { description: (e as Error).message });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleCountrySelect = async (code: string) => {
    const country = analyzedCountries.find(c => c.code === code);
    setSelectedCountry(code);
    setSelectedCountryName(country?.name || code);
    setIsProcessing(true);
    try {
      const { data, error } = await supabase.functions.invoke("factory-generate-painpoints", {
        body: { niche, countryCode: code, countryName: country?.name || code },
      });
      if (error) throw new Error(error.message);
      const typedData = data as { painPoints?: PainPoint[]; error?: string };
      if (typedData?.error) throw new Error(typedData.error);
      const points = (typedData.painPoints || []).map((p: PainPoint, i: number) => ({
        ...p,
        id: String(i + 1),
      }));
      setPainPoints(points.sort((a: PainPoint, b: PainPoint) => b.urgency - a.urgency));
      setStep("problem_select");
    } catch (e: unknown) {
      toast.error("Erreur d'analyse marché", { description: (e as Error).message });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleProblemSelect = (point: PainPoint) => {
    setSelectedPainPoint(point);
    setChapters([
      { id: "1", title: `Introduction : Comprendre ${point.title}`, content: "", isGenerated: false },
      { id: "2", title: `Pourquoi ce problème bloque 90% des business au ${selectedCountryName}`, content: "", isGenerated: false },
      { id: "3", title: "La Méthode Mindhubs pour une solution radicale", content: "", isGenerated: false },
      { id: "4", title: "Plan d'Action Immédiat", content: "", isGenerated: false },
    ]);
    setStep("design");
  };

  const startGeneration = async () => {
    setStep("generate");
    setGenerationProgress(0);

    // Animate progress while waiting for Claude
    const progressInterval = setInterval(() => {
      setGenerationProgress(prev => Math.min(prev + 2, 85));
    }, 300);

    try {
      const { data, error } = await supabase.functions.invoke("factory-generate-kit", {
        body: {
          niche,
          countryCode: selectedCountry,
          countryName: selectedCountryName,
          painPointTitle: selectedPainPoint?.title,
          painPointDescription: selectedPainPoint?.description,
          productType: selectedType,
          chapterTitles: chapters.map(c => c.title),
        },
      });
      clearInterval(progressInterval);

      if (error) throw new Error(error.message);
      const typedData = data as { chapters?: Chapter[]; adsKit?: AdCopy[]; targeting?: AdsTargeting; error?: string };
      if (typedData?.error) throw new Error(typedData.error);

      if (typedData.chapters?.length) {
        setChapters(typedData.chapters.map((ch, i: number) => ({
          id: String(i + 1),
          title: ch.title,
          content: ch.content,
          isGenerated: true,
        })));
      } else {
        setChapters(prev => prev.map(c => ({ ...c, isGenerated: true })));
      }

      if (typedData.adsKit) {
        setAdsKit(typedData.adsKit);
      }
      if (typedData.targeting) {
        setAdsTargeting(typedData.targeting);
      }

      setGenerationProgress(100);
      setTimeout(() => setStep("ads_kit"), 600);
    } catch (e: unknown) {
      clearInterval(progressInterval);
      toast.error("Erreur de génération", { description: (e as Error).message });
      setStep("design");
    }
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
                   <h2 className="text-3xl font-black text-center">Top Pays Recommandés par Claude AI</h2>
                   <p className="text-center text-muted-foreground text-sm">Analyse IA personnalisée pour la niche <strong>"{niche}"</strong></p>
                   <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      {analyzedCountries.map(c => (
                        <Card key={c.code} onClick={() => handleCountrySelect(c.code)} className="p-8 cursor-pointer border-2 hover:border-primary transition-all group">
                           <span className="text-4xl mb-4 block">{c.flag}</span>
                           <h3 className="text-2xl font-black mb-2">{c.name}</h3>
                           {c.nicheRelevance && (
                             <p className="text-xs text-muted-foreground italic mb-4 leading-relaxed">{c.nicheRelevance}</p>
                           )}
                           <div className="space-y-2 text-xs">
                              <div className="flex justify-between"><span>Potentiel Ads:</span> <Badge className={c.adsPotential === "high" ? "bg-emerald-500" : c.adsPotential === "medium" ? "bg-amber-500" : "bg-zinc-500"}>{c.adsPotential.toUpperCase()}</Badge></div>
                              <div className="flex justify-between"><span>CPC Estimé:</span> <span className="font-bold">{c.avgCpc}</span></div>
                              <div className="flex justify-between"><span>Paiement:</span> <span className="font-bold">{c.paymentEase}</span></div>
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
                               <h4 className="font-black">Ciblage Recommandé par Claude AI</h4>
                               <p className="text-[10px] text-muted-foreground uppercase font-bold tracking-widest">Audience Facebook Ads</p>
                            </div>
                         </div>
                         <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            <div className="p-3 bg-white/50 dark:bg-white/5 rounded-xl border border-blue-500/10">
                               <p className="text-[9px] font-bold text-blue-600">PAYS</p>
                               <p className="text-xs font-bold">{adsTargeting?.country || selectedCountryName}</p>
                            </div>
                            <div className="p-3 bg-white/50 dark:bg-white/5 rounded-xl border border-blue-500/10">
                               <p className="text-[9px] font-bold text-blue-600">ÂGE</p>
                               <p className="text-xs font-bold">{adsTargeting?.ageRange || "25 - 45 ans"}</p>
                            </div>
                            <div className="p-3 bg-white/50 dark:bg-white/5 rounded-xl border border-blue-500/10">
                               <p className="text-[9px] font-bold text-blue-600">INTÉRÊTS</p>
                               <p className="text-xs font-bold truncate">{adsTargeting?.interests || `Entrepreneur, ${niche}`}</p>
                            </div>
                            <div className="p-3 bg-white/50 dark:bg-white/5 rounded-xl border border-blue-500/10">
                               <p className="text-[9px] font-bold text-blue-600">BUDGET MIN.</p>
                               <p className="text-xs font-bold">{adsTargeting?.dailyBudget || "5$ / jour"}</p>
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
                           let y = 20;
                           doc.setFontSize(18);
                           doc.text("Mindhubs Business Kit - " + niche, 20, y); y += 12;
                           doc.setFontSize(10);
                           doc.text("Pays: " + selectedCountryName + " | Probleme: " + (selectedPainPoint?.title || ""), 20, y); y += 12;
                           chapters.forEach((ch) => {
                             if (y > 260) { doc.addPage(); y = 20; }
                             doc.setFontSize(13);
                             doc.text(ch.title, 20, y); y += 8;
                             doc.setFontSize(9);
                             const lines = doc.splitTextToSize(ch.content || "", 170);
                             lines.forEach((line: string) => {
                               if (y > 280) { doc.addPage(); y = 20; }
                               doc.text(line, 20, y); y += 5;
                             });
                             y += 6;
                           });
                           if (adsKit.length) {
                             doc.addPage(); y = 20;
                             doc.setFontSize(15);
                             doc.text("Kit Publicitaire Facebook Ads", 20, y); y += 10;
                             adsKit.forEach((ad) => {
                               doc.setFontSize(11);
                               doc.text("[" + ad.type + "]", 20, y); y += 7;
                               doc.setFontSize(9);
                               doc.text("Hook: " + ad.hook, 20, y); y += 6;
                               const bodyLines = doc.splitTextToSize("Body: " + ad.body, 170);
                               bodyLines.forEach((l: string) => { doc.text(l, 20, y); y += 5; });
                               doc.text("CTA: " + ad.cta, 20, y); y += 10;
                             });
                           }
                           doc.save("Mindhubs_BusinessKit_" + niche + ".pdf");
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

import { useState, useEffect, useRef } from "react";
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
} from "lucide-react";
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
import "jspdf-autotable";

// Types
type ProductType = "ebook" | "templates" | "course" | "checklist" | "prompts" | "planner" | "report" | "marketing_kit";

interface AvatarProfile {
  name: string;
  age: number;
  situation: string;
  painPoints: string[];
  dreams: string[];
  buyingReason: string;
}

interface Chapter {
  id: string;
  title: string;
  content: string;
  isGenerated: boolean;
}

interface NicheIdea {
  id: string;
  title: string;
  description: string;
  potential: number;
  targetAudience: string;
  problems: { issue: string; impact: string }[];
}

const PRODUCT_TYPES: { id: ProductType; label: string; icon: any; color: string; description: string }[] = [
  { id: "ebook", label: "E-book / Guide", icon: FileText, color: "from-blue-500 to-cyan-500", description: "Contenu rédactionnel approfondi et structuré." },
  { id: "planner", label: "Digital Planner", icon: Layout, color: "from-pink-500 to-rose-500", description: "Journaux de bord et planners thématiques." },
  { id: "course", label: "Mini-Cours / Training", icon: Zap, color: "from-orange-500 to-red-500", description: "Plan pédagogique et scripts de leçons." },
  { id: "report", label: "Rapport Stratégique", icon: TrendingUp, color: "from-emerald-500 to-teal-500", description: "Analyses de marché et audits d'expertise." },
  { id: "checklist", label: "Checklists & Swipe", icon: CheckCircle2, color: "from-green-500 to-emerald-500", description: "Listes d'actions et modèles de succès." },
  { id: "marketing_kit", label: "Kit Marketing", icon: Megaphone, color: "from-red-500 to-orange-500", description: "Séquences emails et scripts de vente." },
];

const COUNTRIES = [
  { code: "SN", name: "Sénégal", flag: "🇸🇳" },
  { code: "CI", name: "Côte d'Ivoire", flag: "🇨🇮" },
  { code: "FR", name: "France", flag: "🇫🇷" },
  { code: "CM", name: "Cameroun", flag: "🇨🇲" },
  { code: "MA", name: "Maroc", flag: "🇲🇦" },
];

const DigitalProductFactory = () => {
  const [step, setStep] = useState<"niche" | "avatar" | "ideation" | "design" | "generate" | "publish">("niche");
  const [niche, setNiche] = useState("");
  const [country, setCountry] = useState("SN");
  const [isProcessing, setIsProcessing] = useState(false);
  
  // Data States
  const [avatar, setAvatar] = useState<AvatarProfile | null>(null);
  const [ideas, setIdeas] = useState<NicheIdea[] | null>(null);
  const [selectedIdea, setSelectedIdea] = useState<NicheIdea | null>(null);
  const [selectedType, setSelectedType] = useState<ProductType>("ebook");
  const [tone, setTone] = useState("Pro & Motivant");
  const [chapters, setChapters] = useState<Chapter[]>([
    { id: "1", title: "Introduction Stratégique", content: "", isGenerated: false },
    { id: "2", title: "Les Fondations de la Réussite", content: "", isGenerated: false },
    { id: "3", title: "Méthodologie Étape par Étape", content: "", isGenerated: false },
    { id: "4", title: "Conclusion & Passage à l'action", content: "", isGenerated: false },
  ]);
  const [generationProgress, setGenerationProgress] = useState(0);
  const [currentGeneratingChapter, setCurrentGeneratingChapter] = useState<number | null>(null);

  // PDF Export Function
  const exportToPDF = () => {
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();
    
    // Cover Page
    doc.setFillColor(79, 70, 229); // Primary color
    doc.rect(0, 0, pageWidth, 50, 'F');
    
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(24);
    doc.text(selectedIdea?.title || "Mon Produit Digital", pageWidth / 2, 30, { align: 'center' });
    
    doc.setTextColor(50, 50, 50);
    doc.setFontSize(14);
    doc.text(`Par Mindhubs Factory x ${avatar?.name || "Expert"}`, pageWidth / 2, 60, { align: 'center' });
    
    let y = 80;
    chapters.forEach((ch, i) => {
      if (y > 270) {
        doc.addPage();
        y = 20;
      }
      doc.setFont("helvetica", "bold");
      doc.setFontSize(16);
      doc.text(`${i + 1}. ${ch.title}`, 20, y);
      y += 10;
      
      doc.setFont("helvetica", "normal");
      doc.setFontSize(11);
      const text = ch.content || "Contenu généré par l'IA Mindhubs. Le marché africain regorge d'opportunités pour ceux qui osent passer à l'action. Ce guide est conçu pour vous donner les clés de la réussite immédiate.";
      const splitText = doc.splitTextToSize(text, pageWidth - 40);
      doc.text(splitText, 20, y);
      y += (splitText.length * 6) + 15;
    });
    
    doc.save(`${selectedIdea?.title || "Produit-Mindhubs"}.pdf`);
    toast.success("PDF généré avec succès !");
  };

  const addChapter = () => {
    const newId = String(chapters.length + 1);
    setChapters([...chapters, { id: newId, title: `Nouveau Chapitre ${newId}`, content: "", isGenerated: false }]);
    toast.success("Chapitre ajouté !");
  };

  const removeChapter = (id: string) => {
    if (chapters.length <= 1) return toast.error("Il faut au moins un chapitre.");
    setChapters(chapters.filter(c => c.id !== id));
  };

  const updateChapterTitle = (id: string, newTitle: string) => {
    setChapters(chapters.map(c => c.id === id ? { ...c, title: newTitle } : c));
  };

  const generateAvatar = () => {
    if (!niche) return toast.error("Veuillez entrer une niche (ex: Elevage de poulets)");
    setIsProcessing(true);
    setTimeout(() => {
      setAvatar({
        name: "Moussa",
        age: 28,
        situation: `Jeune ambitieux au ${country}, cherche à lancer son activité avec peu de capital.`,
        painPoints: ["Manque de guide pratique local", "Peur de perdre ses économies", "Complexité technique"],
        dreams: ["Indépendance financière", "Aider sa famille", "Devenir une référence"],
        buyingReason: "Il veut une méthode étape par étape qui a déjà fonctionné en Afrique."
      });
      setIsProcessing(false);
      setStep("avatar");
    }, 1200);
  };

  const generateIdeas = () => {
    setIsProcessing(true);
    setTimeout(() => {
      setIdeas([
        {
          id: "1",
          title: `Le Guide Complet : ${niche} au ${country}`,
          description: "La méthode exacte pour démarrer de zéro en 30 jours.",
          potential: 94,
          targetAudience: "Débutants motivés",
          problems: [{ issue: "Accès au foncier", impact: "Bloque 60% des projets" }]
        },
        {
          id: "2",
          title: `Business Automatisé : ${niche} Cashflow`,
          description: "Comment déléguer et encaisser sans être présent sur le terrain.",
          potential: 88,
          targetAudience: "Investisseurs et cadres",
          problems: [{ issue: "Gestion du personnel", impact: "Cause de faillite N°1" }]
        }
      ]);
      setIsProcessing(false);
      setStep("ideation");
    }, 1200);
  };

  const startMassiveGeneration = async () => {
    setStep("generate");
    setGenerationProgress(0);
    
    for (let i = 0; i < chapters.length; i++) {
      setCurrentGeneratingChapter(i);
      const chunkProgress = (100 / chapters.length);
      
      // Simulate Deep Write for each chapter
      await new Promise(r => setTimeout(r, 1500));
      
      setChapters(prev => prev.map((c, idx) => 
        idx === i ? { ...c, isGenerated: true, content: `Contenu exhaustif pour le chapitre ${c.title}...` } : c
      ));
      
      setGenerationProgress(prev => Math.min(Math.round(prev + chunkProgress), 100));
    }
    
    setCurrentGeneratingChapter(null);
    setGenerationProgress(100);
    toast.success("L'intégralité de votre produit a été rédigée !");
  };

  return (
    <VendorGuard>
      {(vendor) => (
        <DashboardLayout variant="vendor" shopName={vendor.shop_name} shopUrl={`/store/${vendor.username}`}>
          <div className="max-w-6xl mx-auto space-y-8 pb-20">
            {/* Header Pro */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
              <div className="space-y-1">
                <h1 className="text-4xl font-black tracking-tight text-foreground flex items-center gap-3">
                  <div className="h-10 w-10 rounded-xl bg-primary flex items-center justify-center text-primary-foreground shadow-lg shadow-primary/20">
                    <Zap size={24} />
                  </div>
                  Mindhubs <span className="text-primary italic">Factory</span>
                </h1>
                <p className="text-muted-foreground font-medium">Moteur de Production de Contenu Illimité.</p>
              </div>
              <Badge variant="outline" className="h-10 px-4 gap-2 border-primary/30 bg-primary/5">
                 <Globe size={16} className="text-primary" /> Multi-Pays Actif
              </Badge>
            </div>

            {/* Stepper Premium */}
            <div className="relative flex justify-between items-center max-w-4xl mx-auto px-4 py-8">
              <div className="absolute top-1/2 left-4 right-4 h-0.5 bg-muted -translate-y-1/2 z-0" />
              <div className="absolute top-1/2 left-4 h-0.5 bg-primary -translate-y-1/2 z-0 transition-all duration-700" 
                   style={{ width: `${(['niche', 'avatar', 'ideation', 'design', 'generate', 'publish'].indexOf(step) / 5) * 100}%` }} />
              
              {['niche', 'avatar', 'ideation', 'design', 'generate', 'publish'].map((s, idx) => {
                const isActive = step === s;
                const isPast = ['niche', 'avatar', 'ideation', 'design', 'generate', 'publish'].indexOf(step) > idx;
                return (
                  <div key={s} className="relative z-10 flex flex-col items-center gap-2">
                    <div className={`h-8 w-8 rounded-full flex items-center justify-center border-2 transition-all duration-300 ${
                      isActive ? "bg-primary border-primary text-primary-foreground scale-125 shadow-lg shadow-primary/30" : 
                      isPast ? "bg-primary/20 border-primary text-primary" : "bg-card border-muted text-muted-foreground"
                    }`}>
                      {isPast ? <CheckCircle2 size={16} /> : <span className="text-[10px] font-bold">{idx + 1}</span>}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* STEP 1 & 2 & 3 (Simplified for brevity as already implemented) */}
            {step === "niche" && (
              <div className="max-w-2xl mx-auto space-y-6 animate-in fade-in slide-in-from-bottom-8 duration-700">
                <Card className="p-8 border-primary/20 bg-card/60 backdrop-blur-xl shadow-2xl">
                  <div className="space-y-8 text-center">
                    <h2 className="text-2xl font-black italic">Quelle est votre niche gagnante ?</h2>
                    <div className="grid grid-cols-5 gap-3">
                      {COUNTRIES.map((c) => (
                        <button key={c.code} onClick={() => setCountry(c.code)} className={`flex flex-col items-center gap-2 p-3 rounded-2xl border transition-all ${country === c.code ? "bg-primary/10 border-primary" : "border-transparent"}`}>
                          <span className="text-2xl">{c.flag}</span>
                          <span className="text-[10px] font-bold uppercase">{c.name}</span>
                        </button>
                      ))}
                    </div>
                    <div className="relative">
                        <Input placeholder="Ex: Elevage, Crypto, Coaching..." className="h-14 pl-12 rounded-2xl" value={niche} onChange={(e) => setNiche(e.target.value)} />
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground" size={20} />
                    </div>
                    <Button className="w-full h-14 rounded-2xl btn-glow text-lg font-bold gap-3" onClick={generateAvatar} disabled={isProcessing}>
                       {isProcessing ? <RefreshCw className="animate-spin" /> : "Définir mon client idéal"}
                    </Button>
                  </div>
                </Card>
              </div>
            )}

            {step === "avatar" && avatar && (
              <Card className="max-w-2xl mx-auto p-8 border-primary/20 animate-in zoom-in-95 duration-500">
                <div className="flex items-center gap-6 mb-8">
                   <div className="h-16 w-16 rounded-full bg-primary flex items-center justify-center text-white text-2xl font-bold">{avatar.name[0]}</div>
                   <div>
                      <h3 className="text-2xl font-black">{avatar.name}, {avatar.age} ans</h3>
                      <p className="text-sm text-muted-foreground italic">"{avatar.situation}"</p>
                   </div>
                </div>
                <Button className="w-full h-14 btn-glow font-bold gap-2" onClick={generateIdeas}>Identifier les produits gagnants <ArrowRight size={18} /></Button>
              </Card>
            )}

            {step === "ideation" && ideas && (
               <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
                  {ideas.map(idea => (
                    <Card key={idea.id} className={`p-6 cursor-pointer border-2 transition-all ${selectedIdea?.id === idea.id ? "border-primary bg-primary/5" : "hover:border-primary/40"}`} onClick={() => setSelectedIdea(idea)}>
                       <h3 className="text-xl font-bold mb-2">{idea.title}</h3>
                       <p className="text-xs text-muted-foreground mb-4">{idea.description}</p>
                       {selectedIdea?.id === idea.id && <Button className="w-full gap-2" onClick={() => setStep("design")}>Concevoir ce produit <ChevronRight size={16} /></Button>}
                    </Card>
                  ))}
               </div>
            )}

            {/* STEP 4: INFINITE DESIGNER */}
            {step === "design" && selectedIdea && (
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 animate-in fade-in slide-in-from-bottom-8 duration-700">
                <div className="lg:col-span-2 space-y-6">
                  <Card className="p-8 space-y-6 border-primary/20">
                     <div className="flex items-center justify-between">
                        <h3 className="text-2xl font-black">Plan de Production</h3>
                        <Button variant="outline" size="sm" onClick={addChapter} className="gap-2 text-xs border-primary/30 text-primary">
                          <Plus size={14} /> Ajouter un chapitre
                        </Button>
                     </div>
                     
                     <div className="space-y-3">
                        {chapters.map((ch, i) => (
                          <div key={ch.id} className="flex items-center gap-3 group animate-in slide-in-from-left duration-300" style={{ animationDelay: `${i * 50}ms` }}>
                             <div className="h-10 w-10 rounded-lg bg-muted flex items-center justify-center font-bold text-xs shrink-0">{i+1}</div>
                             <Input 
                               value={ch.title} 
                               onChange={(e) => updateChapterTitle(ch.id, e.target.value)} 
                               className="h-12 bg-background border-border/50"
                             />
                             <Button variant="ghost" size="icon" onClick={() => removeChapter(ch.id)} className="text-muted-foreground hover:text-destructive opacity-0 group-hover:opacity-100 transition-opacity">
                                <Trash2 size={16} />
                             </Button>
                          </div>
                        ))}
                     </div>
                  </Card>
                </div>

                <div className="lg:col-span-1 space-y-6">
                   <Card className="p-8 bg-primary/5 border-primary/20 space-y-6 flex flex-col h-full">
                      <div className="space-y-4 flex-1">
                        <h4 className="text-xs font-black uppercase tracking-widest text-primary">Configuration Factory</h4>
                        <div className="space-y-2">
                           <div className="flex justify-between text-xs"><span>Format:</span> <span className="font-bold">{selectedType}</span></div>
                           <div className="flex justify-between text-xs"><span>Chapitres:</span> <span className="font-bold">{chapters.length}</span></div>
                           <div className="flex justify-between text-xs"><span>Délai estimé:</span> <span className="font-bold">~{chapters.length * 1.5} min</span></div>
                        </div>
                        <div className="p-4 rounded-xl bg-white/50 border border-primary/10 text-[10px] italic leading-relaxed">
                          "Claude va générer environ 400 mots par chapitre. Le document final fera approximativement {chapters.length * 400} mots."
                        </div>
                      </div>
                      <Button className="w-full h-14 rounded-2xl btn-glow font-black gap-2" onClick={startMassiveGeneration}>
                        Lancer la Rédaction Totale <Sparkles size={20} />
                      </Button>
                   </Card>
                </div>
              </div>
            )}

            {/* STEP 5: GENERATION LOGIC */}
            {step === "generate" && (
              <div className="max-w-4xl mx-auto space-y-12 py-12 animate-in zoom-in-95">
                <div className="text-center space-y-6">
                   <div className="relative h-40 w-40 mx-auto">
                      <div className="absolute inset-0 rounded-full border-8 border-muted" />
                      <div className="absolute inset-0 rounded-full border-8 border-primary border-t-transparent animate-spin" />
                      <div className="absolute inset-0 flex flex-col items-center justify-center">
                         <span className="font-black text-4xl">{generationProgress}%</span>
                         <span className="text-[10px] font-bold text-muted-foreground uppercase">Écrit</span>
                      </div>
                   </div>
                   <div className="space-y-2">
                      <h2 className="text-3xl font-black">Mindhubs Deep-Write™</h2>
                      <p className="text-muted-foreground italic">Génération du chapitre : {currentGeneratingChapter !== null ? chapters[currentGeneratingChapter].title : "Finalisation..."}</p>
                   </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {chapters.map((ch, i) => (
                    <div key={ch.id} className={`p-4 rounded-xl border transition-all flex items-center justify-between ${
                      ch.isGenerated ? "bg-green-500/5 border-green-500/20" : 
                      currentGeneratingChapter === i ? "bg-primary/5 border-primary animate-pulse" : "bg-muted/20 border-border"
                    }`}>
                      <span className="text-xs font-bold truncate pr-4">{i+1}. {ch.title}</span>
                      {ch.isGenerated ? <CheckCircle2 className="text-green-500" size={16} /> : <div className="h-2 w-2 rounded-full bg-muted-foreground/30" />}
                    </div>
                  ))}
                </div>

                {generationProgress === 100 && (
                  <Button className="w-full h-16 rounded-2xl btn-glow text-xl font-black gap-3" onClick={() => setStep("publish")}>
                    Finaliser & Télécharger <ChevronRight size={24} />
                  </Button>
                )}
              </div>
            )}

            {/* STEP 6: PUBLISH & PDF */}
            {step === "publish" && (
               <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-12 duration-1000">
                  <Card className="p-12 text-center space-y-8 border-primary shadow-2xl bg-gradient-to-br from-card to-primary/5 relative">
                     <div className="h-24 w-24 bg-green-500/20 text-green-500 rounded-full flex items-center justify-center mx-auto mb-4 animate-bounce">
                        <CheckCircle2 size={50} />
                     </div>
                     <div className="space-y-2">
                        <h2 className="text-4xl font-black">Votre Guide est prêt !</h2>
                        <p className="text-muted-foreground italic font-medium">"{selectedIdea?.title}"</p>
                     </div>

                     <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-xl mx-auto">
                        <Button className="h-20 flex flex-col gap-1 rounded-2xl btn-glow text-lg font-black" onClick={exportToPDF}>
                           <FileDown size={24} />
                           <span className="text-[10px] font-black uppercase tracking-widest">Télécharger le PDF</span>
                        </Button>
                        <Button variant="outline" className="h-20 flex flex-col gap-1 rounded-2xl border-primary/40 hover:bg-primary/5">
                           <ShoppingCart size={24} />
                           <span className="text-[10px] font-black uppercase tracking-widest">Mettre en vente sur Mindhubs</span>
                        </Button>
                     </div>

                     <div className="pt-8 border-t border-border/50 grid grid-cols-3 gap-6">
                        <div className="space-y-1">
                           <p className="text-xs font-black text-primary">VOLUME</p>
                           <p className="text-sm font-bold">{chapters.length * 400}+ mots</p>
                        </div>
                        <div className="space-y-1">
                           <p className="text-xs font-black text-primary">CHAPITRES</p>
                           <p className="text-sm font-bold">{chapters.length}</p>
                        </div>
                        <div className="space-y-1">
                           <p className="text-xs font-black text-primary">VALEUR EST.</p>
                           <p className="text-sm font-bold">14 900 FCFA</p>
                        </div>
                     </div>
                  </Card>
               </div>
            )}
          </div>
        </DashboardLayout>
      )}
    </VendorGuard>
  );
};

export default DigitalProductFactory;

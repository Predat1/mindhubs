import { useState } from "react";
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
  Info
} from "lucide-react";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import VendorGuard from "@/components/dashboard/VendorGuard";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { toast } from "sonner";

// Types
type ProductType = "ebook" | "templates" | "course" | "checklist" | "prompts" | "planner" | "report" | "marketing_kit" | "legal_doc";

interface NicheIdea {
  id: string;
  title: string;
  painPoint: string;
  potential: number;
  marketGap: string;
  targetAudience: string;
  suggestedStructure: string[];
}

const PRODUCT_TYPES: { id: ProductType; label: string; icon: any; color: string; description: string }[] = [
  { id: "ebook", label: "E-book / Guide", icon: FileText, color: "from-blue-500 to-cyan-500", description: "Contenu rédactionnel approfondi et structuré." },
  { id: "planner", label: "Carnet / Planner", icon: Layout, color: "from-pink-500 to-rose-500", description: "Journaux de bord, planners digitaux et carnets de notes thématiques." },
  { id: "templates", label: "Templates Pro", icon: Layers, color: "from-purple-500 to-indigo-500", description: "Notion, Google Sheets ou Canva prêts à l'usage." },
  { id: "course", label: "Mini-Cours / Training", icon: Zap, color: "from-orange-500 to-red-500", description: "Plan pédagogique, scripts de leçons et quiz." },
  { id: "report", label: "Rapport Stratégique", icon: TrendingUp, color: "from-emerald-500 to-teal-500", description: "Analyses de marché, audits et rapports d'expertise." },
  { id: "checklist", label: "Checklists & Swipe", icon: CheckCircle2, color: "from-green-500 to-emerald-500", description: "Listes d'actions concrètes et modèles de succès." },
  { id: "prompts", label: "Pack de Prompts IA", icon: Sparkles, color: "from-amber-500 to-yellow-500", description: "Collections de prompts IA spécialisés et testés." },
  { id: "marketing_kit", label: "Kit Marketing", icon: Megaphone, color: "from-red-500 to-orange-500", description: "Séquences emails, scripts de vente et ad copy." },
];

const COUNTRIES = [
  { code: "SN", name: "Sénégal", flag: "🇸🇳" },
  { code: "CI", name: "Côte d'Ivoire", flag: "🇨🇮" },
  { code: "FR", name: "France", flag: "🇫🇷" },
  { code: "CM", name: "Cameroun", flag: "🇨🇲" },
  { code: "MA", name: "Maroc", flag: "🇲🇦" },
];

const DigitalProductFactory = () => {
  const [step, setStep] = useState<"research" | "design" | "generate" | "publish">("research");
  const [niche, setNiche] = useState("");
  const [country, setCountry] = useState("SN");
  const [isSearching, setIsSearching] = useState(false);
  const [ideas, setIdeas] = useState<NicheIdea[] | null>(null);
  const [selectedIdea, setSelectedIdea] = useState<NicheIdea | null>(null);
  const [selectedType, setSelectedType] = useState<ProductType>("ebook");
  const [generationProgress, setGenerationProgress] = useState(0);

  const startResearch = () => {
    if (!niche) return toast.error("Veuillez entrer une niche (ex: Fitness, Crypto, Elevage)");
    setIsSearching(true);
    setTimeout(() => {
      const dummyIdeas: NicheIdea[] = [
        {
          id: "1",
          title: `Kit de Conformité pour ${niche} en ${country}`,
          painPoint: "Les régulations locales changeantes et complexes.",
          potential: 85,
          marketGap: "Peu de solutions clés en main abordables.",
          targetAudience: "Startups et PME locales",
          suggestedStructure: ["Introduction légale", "Checklist de conformité", "Modèles de contrats", "Guide d'implémentation"]
        },
        {
          id: "2",
          title: `Optimisation de Profit : ${niche} Performance`,
          painPoint: "Coûts opérationnels trop élevés.",
          potential: 92,
          marketGap: "Besoin de méthodes prouvées et actionnables.",
          targetAudience: "Indépendants et dirigeants",
          suggestedStructure: ["Audit de l'existant", "Les 5 piliers de rentabilité", "Plan d'action 30 jours", "Outils de mesure"]
        },
        {
          id: "3",
          title: `Carnet de Bord : Excellence ${niche}`,
          painPoint: "Manque d'organisation et de vision long terme.",
          potential: 88,
          marketGap: "Besoin d'un support quotidien structuré.",
          targetAudience: "Passionnés et professionnels",
          suggestedStructure: ["Vision & Objectifs", "Planning hebdomadaire spécifique", "Suivi de KPIs métier", "Réflexion mensuelle"]
        }
      ];
      setIdeas(dummyIdeas);
      setIsSearching(false);
    }, 2000);
  };

  const startGeneration = () => {
    setStep("generate");
    let progress = 0;
    const interval = setInterval(() => {
      progress += Math.random() * 15;
      if (progress >= 100) {
        progress = 100;
        clearInterval(interval);
      }
      setGenerationProgress(progress);
    }, 800);
  };

  return (
    <VendorGuard>
      {(vendor) => (
        <DashboardLayout variant="vendor" shopName={vendor.shop_name} shopUrl={`/store/${vendor.username}`}>
          <div className="max-w-6xl mx-auto space-y-8 pb-20">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <h1 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">
                  AI Digital Product Factory
                </h1>
                <p className="text-muted-foreground mt-1">Créez, emballez et vendez des produits digitaux en quelques clics.</p>
              </div>
              <div className="flex items-center gap-2">
                <div className="h-2 w-2 rounded-full bg-green-500 animate-pulse" />
                <span className="text-xs font-medium text-muted-foreground">Claude 3.5 Sonnet Connecté</span>
              </div>
            </div>

            {/* Stepper */}
            <div className="grid grid-cols-4 gap-2 mb-8">
              {["research", "design", "generate", "publish"].map((s, idx) => (
                <div key={s} className="space-y-2">
                  <div className={`h-1.5 rounded-full transition-all duration-500 ${
                    idx <= ["research", "design", "generate", "publish"].indexOf(step) ? "bg-primary" : "bg-muted"
                  }`} />
                  <span className={`text-[10px] font-bold uppercase tracking-widest ${
                    step === s ? "text-primary" : "text-muted-foreground"
                  }`}>{s}</span>
                </div>
              ))}
            </div>

            {/* Content Switcher */}
            {step === "research" && (
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                {/* Left: Input */}
                <Card className="lg:col-span-1 p-6 space-y-6 border-primary/20 bg-card/50 backdrop-blur-sm">
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <label className="text-xs font-bold uppercase text-muted-foreground">Marché Cible</label>
                      <div className="flex flex-wrap gap-2">
                        {COUNTRIES.map((c) => (
                          <button
                            key={c.code}
                            onClick={() => setCountry(c.code)}
                            className={`px-3 py-1.5 rounded-lg border text-sm transition-all ${
                              country === c.code ? "bg-primary/20 border-primary text-primary" : "bg-muted/50 border-border hover:border-primary/40"
                            }`}
                          >
                            {c.flag} {c.name}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="space-y-2">
                      <label className="text-xs font-bold uppercase text-muted-foreground">Secteur / Niche</label>
                      <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={16} />
                        <Input
                          placeholder="Ex: Fitness, Elevage, Immobilier..."
                          className="pl-10"
                          value={niche}
                          onChange={(e) => setNiche(e.target.value)}
                        />
                      </div>
                    </div>

                    <Button className="w-full btn-glow gap-2" onClick={startResearch} disabled={isSearching}>
                      {isSearching ? <RefreshCw className="animate-spin" size={18} /> : <Zap size={18} />}
                      {isSearching ? "Analyse du marché..." : "Lancer la recherche IA"}
                    </Button>
                  </div>

                  <div className="p-4 rounded-xl bg-primary/5 border border-primary/10">
                    <p className="text-[10px] leading-relaxed text-muted-foreground italic">
                      "Claude va analyser les douleurs réelles, les recherches Google locales et les manques du marché pour vous proposer 3 idées de produits gagnants."
                    </p>
                  </div>
                </Card>

                {/* Right: Results */}
                <div className="lg:col-span-2 space-y-4">
                  {ideas ? (
                    ideas.map((idea, i) => (
                      <Card
                        key={idea.id}
                        className={`p-6 cursor-pointer transition-all hover:scale-[1.01] relative overflow-hidden group ${
                          selectedIdea?.id === idea.id ? "border-primary bg-primary/5 shadow-lg" : "hover:border-primary/40"
                        }`}
                        onClick={() => setSelectedIdea(idea)}
                      >
                        <div className="flex items-start justify-between">
                          <div className="space-y-1">
                            <div className="flex items-center gap-2">
                              <Badge className="bg-primary/20 text-primary border-none">Potentiel: {idea.potential}%</Badge>
                              <Badge variant="outline">#ID-{idea.id}</Badge>
                            </div>
                            <h3 className="text-xl font-bold">{idea.title}</h3>
                            <p className="text-sm text-muted-foreground">{idea.painPoint}</p>
                          </div>
                          <div className="h-10 w-10 rounded-full bg-muted flex items-center justify-center group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                            <ChevronRight size={20} />
                          </div>
                        </div>

                        <div className="mt-4 grid grid-cols-2 gap-4 text-xs">
                          <div className="p-2 rounded bg-muted/40">
                            <span className="font-bold block text-primary uppercase text-[9px]">Manque identifié</span>
                            {idea.marketGap}
                          </div>
                          <div className="p-2 rounded bg-muted/40">
                            <span className="font-bold block text-primary uppercase text-[9px]">Audience cible</span>
                            {idea.targetAudience}
                          </div>
                        </div>

                        {selectedIdea?.id === idea.id && (
                          <div className="mt-6 pt-4 border-t border-primary/20 flex justify-end">
                            <Button size="sm" className="gap-2" onClick={() => setStep("design")}>
                              Sélectionner cette idée <ArrowRight size={14} />
                            </Button>
                          </div>
                        )}
                      </Card>
                    ))
                  ) : (
                    <div className="h-full min-h-[300px] rounded-2xl border-2 border-dashed border-muted flex flex-col items-center justify-center text-muted-foreground space-y-4">
                      <div className="h-12 w-12 rounded-full bg-muted flex items-center justify-center">
                        <Info size={24} />
                      </div>
                      <p className="text-sm">Lancez une recherche pour voir les opportunités</p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {step === "design" && selectedIdea && (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 animate-in fade-in zoom-in-95 duration-500">
                <Card className="p-6 space-y-6 border-primary/20">
                  <h3 className="text-xl font-bold">1. Choisir le format du produit</h3>
                  <div className="grid grid-cols-2 gap-3">
                    {PRODUCT_TYPES.map((type) => (
                      <button
                        key={type.id}
                        onClick={() => setSelectedType(type.id)}
                        className={`p-4 rounded-xl border text-left transition-all hover:scale-[1.02] ${
                          selectedType === type.id ? "border-primary bg-primary/5 ring-1 ring-primary" : "border-border hover:border-primary/40"
                        }`}
                      >
                        <div className={`h-8 w-8 rounded-lg bg-gradient-to-br ${type.color} text-white flex items-center justify-center mb-3`}>
                          <type.icon size={18} />
                        </div>
                        <p className="font-bold text-sm">{type.label}</p>
                        <p className="text-[10px] text-muted-foreground mt-1 line-clamp-2">{type.description}</p>
                      </button>
                    ))}
                  </div>
                </Card>

                <Card className="p-6 space-y-6 border-primary/20 flex flex-col">
                   <div className="flex-1 space-y-6">
                    <h3 className="text-xl font-bold">2. Structure stratégique</h3>
                    <div className="rounded-xl bg-muted/40 p-5 space-y-3">
                      <h4 className="text-xs font-bold uppercase tracking-widest text-primary">Sommaire Suggéré</h4>
                      <ul className="space-y-2">
                        {selectedIdea.suggestedStructure.map((item, i) => (
                          <li key={i} className="flex items-center gap-3 text-sm">
                            <span className="flex h-5 w-5 items-center justify-center rounded bg-primary/20 text-[10px] font-bold text-primary">{i+1}</span>
                            {item}
                          </li>
                        ))}
                      </ul>
                    </div>

                    <div className="p-4 rounded-xl border border-amber-500/20 bg-amber-500/5">
                      <p className="text-xs leading-relaxed">
                        <strong>Note :</strong> Claude va rédiger environ 4 000 mots pour ce produit en se basant sur les douleurs spécifiques du marché {country}.
                      </p>
                    </div>
                   </div>

                   <Button className="w-full btn-glow gap-2 mt-8 h-12" onClick={startGeneration}>
                      Lancer la génération du contenu <Sparkles size={18} />
                   </Button>
                </Card>
              </div>
            )}

            {step === "generate" && selectedIdea && (
              <div className="space-y-6 animate-in zoom-in-95 duration-500">
                {generationProgress < 100 ? (
                  <Card className="p-12 text-center space-y-6 border-primary/20">
                    <div className="relative h-24 w-24 mx-auto">
                      <div className="absolute inset-0 rounded-full border-4 border-primary/20" />
                      <div className="absolute inset-0 rounded-full border-4 border-primary border-t-transparent animate-spin" />
                      <div className="absolute inset-0 flex items-center justify-center font-bold text-xl">
                        {Math.floor(generationProgress)}%
                      </div>
                    </div>
                    <div className="space-y-2">
                      <h2 className="text-2xl font-bold">Génération en cours...</h2>
                      <p className="text-muted-foreground text-sm max-w-md mx-auto">
                        Claude est en train de rédiger votre {selectedType} : "{selectedIdea.title}". 
                        Cela inclut le texte, la structure et la page de vente.
                      </p>
                    </div>
                    <Progress value={generationProgress} className="h-2 max-w-md mx-auto" />
                  </Card>
                ) : (
                  <div className="grid grid-cols-1 xl:grid-cols-4 gap-6">
                    <Card className="xl:col-span-1 p-6 space-y-6 border-border/60 bg-muted/20">
                       <div className="aspect-[3/4] rounded-2xl bg-gradient-to-br from-primary via-accent to-primary p-5 shadow-xl flex flex-col justify-between relative overflow-hidden group mb-6">
                          <div className="absolute inset-0 bg-black/10 opacity-50" />
                          <div className="relative z-10 text-white space-y-1">
                             <Badge className="bg-white/20 text-white border-none backdrop-blur-md text-[9px]">{selectedType.toUpperCase()}</Badge>
                             <h2 className="text-sm font-bold leading-tight line-clamp-3">{selectedIdea.title}</h2>
                          </div>
                          <div className="relative z-10">
                             <p className="text-[9px] font-bold text-white/80 uppercase tracking-widest">{vendor?.shop_name || "Mindhubs"}</p>
                          </div>
                       </div>

                       <div className="space-y-4">
                          <div className="flex items-center justify-between text-xs border-b border-border pb-2">
                             <span className="text-muted-foreground">Statut</span>
                             <span className="font-bold text-green-500 flex items-center gap-1">
                                <CheckCircle2 size={12} /> Finalisé
                             </span>
                          </div>
                          <div className="flex items-center justify-between text-xs border-b border-border pb-2">
                             <span className="text-muted-foreground">Lisibilité</span>
                             <span className="font-bold">Optimale (Score 94)</span>
                          </div>
                          <div className="flex items-center justify-between text-xs border-b border-border pb-2">
                             <span className="text-muted-foreground">Mots</span>
                             <span className="font-bold">4 280</span>
                          </div>
                          <div className="flex items-center justify-between text-xs">
                             <span className="text-muted-foreground">Ton IA</span>
                             <Badge variant="secondary" className="text-[9px]">Persuasif Pro</Badge>
                          </div>
                       </div>

                       <div className="pt-4 space-y-2">
                          <Button variant="outline" className="w-full gap-2 text-xs h-9">
                             <Palette size={14} /> Style Visuel
                          </Button>
                          <Button variant="outline" className="w-full gap-2 text-xs h-9" onClick={() => toast.info("Régénération lancée...")}>
                             <RefreshCw size={14} /> Régénérer
                          </Button>
                       </div>
                    </Card>

                    <Card className="xl:col-span-3 overflow-hidden border-primary/20">
                       <div className="border-b border-border bg-card p-4 flex items-center justify-between">
                          <div className="flex items-center gap-3">
                             <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
                                <FileText size={16} />
                             </div>
                             <div>
                                <h3 className="text-sm font-bold">Aperçu du contenu rédigé</h3>
                                <p className="text-[10px] text-muted-foreground">Chapitre 1 : Introduction Stratégique</p>
                             </div>
                          </div>
                          <div className="flex items-center gap-2">
                             <Button variant="ghost" size="icon" className="h-8 w-8"><ChevronLeft size={16} /></Button>
                             <span className="text-xs font-mono">1 / 5</span>
                             <Button variant="ghost" size="icon" className="h-8 w-8"><ChevronRight size={16} /></Button>
                          </div>
                       </div>

                       <div className="p-8 md:p-12 max-h-[600px] overflow-y-auto bg-white dark:bg-zinc-950 text-zinc-800 dark:text-zinc-200 font-serif leading-relaxed space-y-6">
                          <h1 className="text-3xl font-bold font-sans text-zinc-900 dark:text-zinc-100">
                             Le paradoxe de {niche} au {country}
                          </h1>
                          <p className="text-lg italic text-zinc-500">
                             Comment transformer les contraintes locales en leviers de profit exponentiels.
                          </p>
                          <div className="h-px w-24 bg-primary/30" />
                          <p>
                             Le marché du {niche} au {country} traverse actuellement une phase de mutation sans précédent. Alors que la majorité des acteurs se concentrent sur les méthodes traditionnelles, une opportunité invisible émerge pour ceux qui savent allier technologie et expertise de terrain...
                          </p>
                          <p>
                             Dans ce chapitre, nous allons déconstruire les trois piliers fondamentaux qui régissent cette industrie localement : la confiance client, la logistique de proximité et la digitalisation accélérée des flux de paiement.
                          </p>
                          <div className="rounded-xl bg-muted/50 p-6 font-sans border-l-4 border-primary">
                             <h4 className="text-sm font-bold mb-2">💡 Insight Stratégique Claude</h4>
                             <p className="text-xs italic">
                                "L'analyse des données de recherche montre que 82% des utilisateurs au {country} privilégient les solutions offrant un support via WhatsApp Business, un élément que nous avons intégré dans ce kit."
                             </p>
                          </div>
                       </div>

                       <div className="border-t border-border bg-muted/30 p-4 flex flex-col sm:flex-row items-center justify-between gap-4">
                          <div className="flex items-center gap-2 text-[10px] text-muted-foreground italic">
                             <Sparkles size={12} className="text-primary" /> Contenu protégé par droits d'auteur Mindhubs Factory
                          </div>
                          <div className="flex items-center gap-3">
                             <Button variant="outline" className="gap-2">
                                <Download size={14} /> Brouillon PDF
                             </Button>
                             <Button className="btn-glow gap-2" onClick={() => setStep("publish")}>
                                <ShoppingCart size={16} /> Étape de Mise en vente
                             </Button>
                          </div>
                       </div>
                    </Card>
                  </div>
                )}
              </div>
            )}

            {step === "publish" && selectedIdea && (
              <div className="max-w-2xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-8 duration-700">
                <Card className="p-8 text-center space-y-6 border-primary shadow-2xl relative overflow-hidden">
                  <div className="absolute top-0 right-0 p-4">
                    <CheckCircle2 className="text-green-500 h-12 w-12" />
                  </div>
                  <div className="h-20 w-20 bg-primary/10 rounded-full flex items-center justify-center mx-auto">
                    <Store className="text-primary h-10 w-10" />
                  </div>
                  <h2 className="text-3xl font-bold">Félicitations !</h2>
                  <p className="text-muted-foreground">
                    Votre produit <strong>"{selectedIdea.title}"</strong> est prêt à être monétisé. 
                    Tous les fichiers ont été générés et votre page de vente est optimisée pour le marché {country}.
                  </p>
                  <div className="grid grid-cols-2 gap-4 pt-4">
                    <Button variant="outline" className="h-16 flex flex-col gap-1">
                      <Download size={20} />
                      <span className="text-[10px] uppercase font-bold">Télécharger les fichiers</span>
                    </Button>
                    <Button className="h-16 flex flex-col gap-1 btn-glow" onClick={() => {
                      toast.success("Produit ajouté à votre inventaire !");
                    }}>
                      <ShoppingCart size={20} />
                      <span className="text-[10px] uppercase font-bold">Vendre sur Mindhubs</span>
                    </Button>
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

import { useState, useEffect } from "react";
import {
  Factory,
  Sparkles,
  Wand2,
  Search,
  ChevronRight,
  Loader2,
  Target,
  ArrowRight,
  TrendingUp,
  Globe,
  Plus,
  X,
  CheckCircle2,
  FileText,
  Layout,
  ShoppingCart,
  Zap,
  Info,
  Layers,
  Palette,
  Download,
  RefreshCw,
  ChevronLeft,
} from "lucide-react";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import VendorGuard from "@/components/dashboard/VendorGuard";
import SEO from "@/components/SEO";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { toast } from "sonner";
import { useCurrentVendor } from "@/hooks/useVendors";
import { Link } from "react-router-dom";

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
  { code: "FR", name: "France", flag: "🇫🇷" },
  { code: "CI", name: "Côte d'Ivoire", flag: "🇨🇮" },
  { code: "SN", name: "Sénégal", flag: "🇸🇳" },
  { code: "CM", name: "Cameroun", flag: "🇨🇲" },
  { code: "GA", name: "Gabon", flag: "🇬🇦" },
  { code: "MA", name: "Maroc", flag: "🇲🇦" },
  { code: "BE", name: "Belgique", flag: "🇧🇪" },
  { code: "CA", name: "Canada", flag: "🇨🇦" },
];

const Inner = () => {
  const { data: vendor } = useCurrentVendor();
  const [step, setStep] = useState<"research" | "design" | "generate" | "publish">("research");
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0);

  // Form State
  const [niche, setNiche] = useState("");
  const [country, setCountry] = useState("FR");
  const [selectedIdea, setSelectedIdea] = useState<NicheIdea | null>(null);
  const [selectedType, setSelectedType] = useState<ProductType>("ebook");

  // Research Results
  const [ideas, setIdeas] = useState<NicheIdea[]>([]);

  const startResearch = () => {
    if (!niche.trim()) return toast.error("Veuillez entrer une thématique");
    setLoading(true);
    setProgress(20);
    
    // Simulate Claude API Call for Phase 1 (MVP)
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
      setProgress(100);
      setLoading(false);
    }, 2000);
  };

  const handleSelectIdea = (idea: NicheIdea) => {
    setSelectedIdea(idea);
    setStep("design");
    setProgress(0);
  };

  const startGeneration = () => {
    setLoading(true);
    setProgress(10);
    const interval = setInterval(() => {
      setProgress(prev => {
        if (prev >= 90) {
          clearInterval(interval);
          return 90;
        }
        return prev + 5;
      });
    }, 1000);

    setTimeout(() => {
      clearInterval(interval);
      setProgress(100);
      setLoading(false);
      setStep("generate");
    }, 8000);
  };

  return (
    <div className="space-y-6">
      {/* Header & Stepper */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold bg-gradient-to-r from-primary via-accent to-primary bg-clip-text text-transparent">
            Digital Product Factory
          </h1>
          <p className="text-sm text-muted-foreground italic">Propulsé par Claude 3.5 Sonnet</p>
        </div>
        
        <div className="flex items-center gap-2 rounded-xl bg-card border p-1 shadow-sm">
          {(["research", "design", "generate", "publish"] as const).map((s, idx) => {
            const active = step === s;
            const past = ["research", "design", "generate", "publish"].indexOf(step) > idx;
            return (
              <div key={s} className="flex items-center">
                {idx > 0 && <div className={`h-px w-4 ${past ? "bg-primary" : "bg-border"}`} />}
                <div 
                  className={`flex h-8 w-8 items-center justify-center rounded-full text-[10px] font-bold transition-all ${
                    active ? "bg-primary text-primary-foreground shadow-[0_0_12px_hsl(var(--primary)/0.4)]" : past ? "bg-primary/20 text-primary" : "bg-muted text-muted-foreground"
                  }`}
                >
                  {past ? <CheckCircle2 size={14} /> : idx + 1}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {loading && (
        <Card className="p-6 border-primary/20 bg-primary/5">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Loader2 className="animate-spin text-primary" size={20} />
                <span className="text-sm font-bold animate-pulse">
                  {step === "research" && "Analyse du marché en cours..."}
                  {step === "design" && "Conception du produit..."}
                  {step === "generate" && "Rédaction finale du contenu..."}
                </span>
              </div>
              <span className="text-xs font-mono font-bold text-primary">{progress}%</span>
            </div>
            <Progress value={progress} className="h-2" />
          </div>
        </Card>
      )}

      {/* STEP 1: RESEARCH */}
      {step === "research" && !loading && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Card className="lg:col-span-1 p-6 space-y-5 border-primary/20 h-fit">
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-2">
                <Target size={14} className="text-primary" /> Thématique
              </label>
              <Input 
                placeholder="Ex: Immobilier, Fitness, Freelance..." 
                value={niche}
                onChange={(e) => setNiche(e.target.value)}
                className="bg-muted/30"
              />
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-2">
                <Globe size={14} className="text-primary" /> Pays cible
              </label>
              <div className="grid grid-cols-2 gap-2">
                {COUNTRIES.map(c => (
                  <button
                    key={c.code}
                    onClick={() => setCountry(c.code)}
                    className={`flex items-center gap-2 rounded-lg border p-2 text-xs transition ${
                      country === c.code ? "border-primary bg-primary/10 font-bold" : "border-border hover:bg-muted"
                    }`}
                  >
                    <span>{c.flag}</span>
                    <span>{c.name}</span>
                  </button>
                ))}
              </div>
            </div>

            <Button onClick={startResearch} className="w-full gap-2 btn-glow" disabled={!niche.trim()}>
              <Search size={16} /> Lancer la recherche <ChevronRight size={16} />
            </Button>
          </Card>

          <div className="lg:col-span-2 space-y-4">
            {ideas.length > 0 ? (
              <>
                <div className="flex items-center gap-2 text-sm font-bold">
                  <TrendingUp size={18} className="text-primary" />
                  Opportunités détectées par Claude
                </div>
                <div className="grid grid-cols-1 gap-4">
                  {ideas.map((idea) => (
                    <Card key={idea.id} className="group relative overflow-hidden p-5 transition-all hover:border-primary/50 hover:shadow-lg border-border/60">
                      <div className="absolute right-0 top-0 h-24 w-24 translate-x-12 -translate-y-12 rounded-full bg-primary/5 blur-2xl group-hover:bg-primary/10 transition-all" />
                      
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <h3 className="font-bold text-foreground group-hover:text-primary transition-colors">{idea.title}</h3>
                            <Badge variant="outline" className="text-[10px] bg-primary/5 border-primary/20 text-primary">
                              Score: {idea.potential}%
                            </Badge>
                          </div>
                          <p className="text-xs text-muted-foreground line-clamp-1">
                            <span className="font-bold text-foreground/70">Problème :</span> {idea.painPoint}
                          </p>
                          <div className="flex flex-wrap gap-2 pt-2">
                            <Badge className="bg-muted text-muted-foreground hover:bg-muted text-[9px] uppercase tracking-tighter">Gap: {idea.marketGap}</Badge>
                            <Badge className="bg-muted text-muted-foreground hover:bg-muted text-[9px] uppercase tracking-tighter">Cible: {idea.targetAudience}</Badge>
                          </div>
                        </div>
                        <Button onClick={() => handleSelectIdea(idea)} className="shrink-0 gap-2">
                          Concevoir ce produit <ArrowRight size={14} />
                        </Button>
                      </div>
                    </Card>
                  ))}
                </div>
              </>
            ) : (
              <div className="flex h-[400px] flex-col items-center justify-center rounded-2xl border-2 border-dashed border-border bg-muted/5 p-8 text-center">
                <div className="mb-4 rounded-full bg-primary/10 p-4 text-primary">
                  <Factory size={32} />
                </div>
                <h3 className="text-lg font-bold">L'Usine est prête</h3>
                <p className="max-w-md text-sm text-muted-foreground">
                  Entrez une thématique et un pays pour que Claude analyse les meilleures opportunités du moment.
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* STEP 2: DESIGN */}
      {step === "design" && selectedIdea && !loading && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-in fade-in slide-in-from-right-4">
          <Card className="lg:col-span-1 p-6 space-y-6 border-primary/20">
            <div className="space-y-1">
              <h3 className="font-bold text-primary">Produit sélectionné</h3>
              <p className="text-sm font-semibold">{selectedIdea.title}</p>
            </div>

            <div className="space-y-3">
              <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Type de produit digital</label>
              <div className="space-y-2">
                {PRODUCT_TYPES.map(type => (
                  <button
                    key={type.id}
                    onClick={() => setSelectedType(type.id)}
                    className={`flex w-full items-start gap-3 rounded-xl border p-3 text-left transition-all ${
                      selectedType === type.id ? "border-primary bg-primary/5 ring-1 ring-primary/20" : "border-border hover:bg-muted"
                    }`}
                  >
                    <div className={`mt-0.5 rounded-lg bg-gradient-to-br ${type.color} p-2 text-white shadow-sm`}>
                      <type.icon size={16} />
                    </div>
                    <div>
                      <p className="text-sm font-bold">{type.label}</p>
                      <p className="text-[10px] text-muted-foreground">{type.description}</p>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            <div className="pt-4 border-t border-border flex gap-2">
              <Button variant="outline" onClick={() => setStep("research")} className="flex-1">Retour</Button>
              <Button onClick={startGeneration} className="flex-1 gap-2 btn-glow">
                Générer <ChevronRight size={16} />
              </Button>
            </div>
          </Card>

          <Card className="lg:col-span-2 p-8 border-border/60 relative overflow-hidden">
             <div className="absolute top-0 right-0 p-4 opacity-10">
                <Sparkles size={120} />
             </div>
             <div className="relative space-y-6">
                <div className="space-y-2">
                  <h2 className="text-2xl font-bold">Architecture du Produit</h2>
                  <p className="text-sm text-muted-foreground">Claude a préparé la structure stratégique de votre {selectedType}.</p>
                </div>

                <div className="space-y-4">
                   <div className="rounded-xl bg-muted/40 p-5 space-y-3">
                      <h4 className="text-xs font-bold uppercase tracking-widest text-primary">Sommaire Stratégique</h4>
                      <ul className="space-y-2">
                         {selectedIdea.suggestedStructure.map((item, i) => (
                           <li key={i} className="flex items-center gap-3 text-sm">
                              <span className="flex h-5 w-5 items-center justify-center rounded bg-primary/20 text-[10px] font-bold text-primary">{i+1}</span>
                              {item}
                           </li>
                         ))}
                      </ul>
                   </div>

                   <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="rounded-xl border border-border bg-card p-4 space-y-2">
                         <h4 className="text-[10px] font-bold uppercase text-muted-foreground">Angle Marketing</h4>
                         <p className="text-xs font-medium italic">"L'avantage compétitif ignoré par 90% des acteurs du marché."</p>
                      </div>
                      <div className="rounded-xl border border-border bg-card p-4 space-y-2">
                         <h4 className="text-[10px] font-bold uppercase text-muted-foreground">Valeur Perçue</h4>
                         <p className="text-xs font-medium">Expertise localisée + Gain de temps immédiat.</p>
                      </div>
                   </div>
                </div>
             </div>
          </Card>
        </div>
      )}

      {/* STEP 3: GENERATE (PREVIEW) */}
      {step === "generate" && selectedIdea && (
        <div className="space-y-6 animate-in zoom-in-95 duration-500">
          <div className="grid grid-cols-1 xl:grid-cols-4 gap-6">
            {/* Sidebar : Product Info & Metadata */}
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
                  <Button variant="outline" className="w-full gap-2 text-xs h-9" onClick={() => toast.info("Rénération lancée...")}>
                     <RefreshCw size={14} /> Régénérer
                  </Button>
               </div>
            </Card>

            {/* Main Content Preview */}
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
                  <p>
                     Pour réussir, il ne s'agit plus de copier les modèles occidentaux, mais de réinventer une proposition de valeur qui résonne avec le quotidien des {country === "FR" ? "français" : country === "CI" ? "ivoiriens" : "citoyens locaux"}.
                  </p>
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
        </div>
      )}

      {/* STEP 4: PUBLISH (FINAL) */}
      {step === "publish" && selectedIdea && (
        <Card className="p-12 text-center space-y-8 animate-in slide-in-from-bottom-8 border-primary/30 shadow-2xl">
           <div className="mx-auto w-24 h-24 rounded-full bg-primary/10 flex items-center justify-center text-primary mb-6">
              <CheckCircle2 size={48} className="animate-bounce" />
           </div>
           
           <div className="space-y-3">
              <h2 className="text-3xl font-bold">Félicitations, {vendor?.shop_name}!</h2>
              <p className="text-muted-foreground max-w-2xl mx-auto">
                 Votre produit <strong>"{selectedIdea.title}"</strong> a été généré, packagé et est prêt à être monétisé sur Mindhubs.
              </p>
           </div>

           <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
              <Button asChild size="lg" className="btn-glow px-8 gap-2">
                 <Link to="/dashboard/new-product">
                    <Plus size={18} /> Publier sur la Boutique
                 </Link>
              </Button>
              <Button variant="outline" size="lg" className="px-8 gap-2">
                 <FileText size={18} /> Télécharger le PDF
              </Button>
           </div>

           <div className="pt-8 grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
              <div className="p-4 space-y-2">
                 <Zap className="mx-auto text-amber-500" size={24} />
                 <h4 className="text-sm font-bold">Vente instantanée</h4>
                 <p className="text-[10px] text-muted-foreground">Le produit est déjà configuré avec sa description IA.</p>
              </div>
              <div className="p-4 space-y-2">
                 <Megaphone className="mx-auto text-blue-500" size={24} />
                 <h4 className="text-sm font-bold">Kit Marketing inclus</h4>
                 <p className="text-[10px] text-muted-foreground">Retrouvez vos emails de promotion dans votre dashboard.</p>
              </div>
              <div className="p-4 space-y-2">
                 <Globe className="mx-auto text-emerald-500" size={24} />
                 <h4 className="text-sm font-bold">100% Unique</h4>
                 <p className="text-[10px] text-muted-foreground">Contenu généré exclusivement pour vous par Claude 3.5.</p>
              </div>
           </div>
        </Card>
      )}
    </div>
  );
};

const DigitalProductFactory = () => (
  <VendorGuard>
    {() => (
      <DashboardLayout variant="vendor">
        <SEO title="AI Factory — L'usine à produits digitaux" description="Gérez la recherche, la conception et la vente de vos produits digitaux avec l'IA." />
        <Inner />
      </DashboardLayout>
    )}
  </VendorGuard>
);

export default DigitalProductFactory;

import { useEffect, useMemo, useState } from "react";
import { useSearchParams, Link } from "react-router-dom";
import {
  Sparkles, Loader2, Wand2, Megaphone, ChevronRight, Image as ImageIcon,
  Filter, Search, History, X, LayoutGrid, Rows3, Activity, Play
} from "lucide-react";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import VendorGuard from "@/components/dashboard/VendorGuard";
import SEO from "@/components/SEO";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useCurrentVendor, useVendorProducts } from "@/hooks/useVendors";
import { useAuth } from "@/contexts/AuthContext";
import {
  ANGLE_OPTIONS, FORMAT_OPTIONS,
  useAdCreatives, useGenerateAdKit,
  type AdAngle, type AdFormat,
} from "@/hooks/useAdCreatives";
import AdKitCard from "@/components/ads/AdKitCard";
import { toast } from "sonner";
import { useCredits } from "@/hooks/useCredits";
import { CREDIT_COSTS } from "@/constants/credits";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Wallet, AlertCircle } from "lucide-react";
import { useNavigate } from "react-router-dom";

type SortKey = "newest" | "oldest" | "angle";

const Inner = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const presetProductId = searchParams.get("product");
  const { user } = useAuth();
  const { data: vendor } = useCurrentVendor();
  const { data: products = [], isLoading: productsLoading } = useVendorProducts(vendor?.id);
  const publishedProducts = useMemo(
    () => (products as unknown as Array<{ id: string; status: string; title: string; image_url?: string }>).filter((p) => p.status === "published" || !p.status),
    [products],
  );

  const [productId, setProductId] = useState<string>("");
  const [angles, setAngles] = useState<AdAngle[]>(["benefit", "social_proof"]);
  const [formats, setFormats] = useState<AdFormat[]>(["1:1", "9:16"]);

  // History filters
  const [historyScope, setHistoryScope] = useState<"current" | "all">("current");
  const [filterAngle, setFilterAngle] = useState<AdAngle | "all">("all");
  const [filterFormat, setFilterFormat] = useState<AdFormat | "all">("all");
  const [search, setSearch] = useState("");
  const [sort, setSort] = useState<SortKey>("newest");
  const [view, setView] = useState<"list" | "grid">("list");
  const [generationStep, setGenerationStep] = useState(0);

  const { balance: credits, spend } = useCredits(vendor?.id);
  const [showConfirm, setShowConfirm] = useState(false);
  const [showInsufficient, setShowInsufficient] = useState(false);

  useEffect(() => {
    if (presetProductId && !productId) setProductId(presetProductId);
    else if (!productId && publishedProducts.length > 0) setProductId(publishedProducts[0].id);
  }, [presetProductId, publishedProducts, productId]);

  const selectedProduct = publishedProducts.find((p) => p.id === productId);

  const { data: creatives = [], isLoading: creativesLoading } = useAdCreatives(vendor?.id);

  const filteredCreatives = useMemo(() => {
    let list = [...creatives];
    if (historyScope === "current" && productId) list = list.filter((c) => c.product_id === productId);
    if (filterAngle !== "all") list = list.filter((c) => c.angle === filterAngle);
    if (filterFormat !== "all") list = list.filter((c) => c.format === filterFormat);
    if (search.trim()) {
      const q = search.trim().toLowerCase();
      list = list.filter((c) =>
        c.copy_data?.primary_text?.toLowerCase().includes(q) ||
        c.copy_data?.headlines?.some((h) => h.toLowerCase().includes(q)) ||
        c.product_id.toLowerCase().includes(q),
      );
    }
    list.sort((a, b) => {
      if (sort === "oldest") return +new Date(a.created_at) - +new Date(b.created_at);
      if (sort === "angle") return a.angle.localeCompare(b.angle);
      return +new Date(b.created_at) - +new Date(a.created_at);
    });
    return list;
  }, [creatives, productId, historyScope, filterAngle, filterFormat, search, sort]);

  // Stats per angle for chips
  const angleCounts = useMemo(() => {
    const base = historyScope === "current" && productId
      ? creatives.filter((c) => c.product_id === productId)
      : creatives;
    const counts: Record<string, number> = {};
    for (const c of base) counts[c.angle] = (counts[c.angle] || 0) + 1;
    return counts;
  }, [creatives, historyScope, productId]);

  const generate = useGenerateAdKit();

  useEffect(() => {
    if (generate.isPending) {
      setGenerationStep(0);
      const interval = setInterval(() => {
        setGenerationStep((prev) => Math.min(prev + 1, 3));
      }, 4000); // 4s per step approx
      return () => clearInterval(interval);
    } else {
      setGenerationStep(0);
    }
  }, [generate.isPending]);

  const toggleAngle = (a: AdAngle) =>
    setAngles((prev) => (prev.includes(a) ? prev.filter((x) => x !== a) : [...prev, a]));
  const toggleFormat = (f: AdFormat) =>
    setFormats((prev) => (prev.includes(f) ? prev.filter((x) => x !== f) : [...prev, f]));

  const totalToGenerate = angles.length * formats.length;

  const handleGenerate = async () => {
    if (!vendor || !user || !selectedProduct) {
      toast.error("Sélectionnez un produit");
      return;
    }
    if (angles.length === 0 || formats.length === 0) {
      toast.error("Choisissez au moins 1 angle et 1 format");
      return;
    }
    
    const totalCreatives = angles.length * formats.length;
    if (totalCreatives > 8) {
      toast.error("Maximum 8 créatives par génération", { description: "Réduisez le nombre d'angles ou de formats." });
      return;
    }

    const totalCost = totalCreatives * CREDIT_COSTS['ads-creative'];
    if (credits < totalCost) {
      setShowInsufficient(true);
      return;
    }
    
    setShowConfirm(true);
  };

  const confirmGeneration = async () => {
    setShowConfirm(false);
    if (!productId || !vendor || !user || !selectedProduct) return;
    
    const totalCreatives = angles.length * formats.length;
    const totalCost = totalCreatives * CREDIT_COSTS['ads-creative'];

    const t = toast.loading(`Génération du kit publicitaire en cours… (${totalCreatives} créative${totalCreatives > 1 ? "s" : ""})`, {
      description: "Analyse du produit, copywriting, ciblage et création des images.",
    });

    try {
      const res = await spend({ amount: totalCost, description: `Génération Kit Ad: ${selectedProduct.title} (${totalCreatives} variantes)`, featureType: 'ads-creative' }) as any;
      if (res && !res.success) {
        toast.error("Erreur crédits: " + (res.error || 'Erreur inconnue'), { id: t });
        return;
      }

      await generate.mutateAsync({
        vendorId: vendor.id,
        userId: user.id,
        product: {
          id: selectedProduct.id,
          title: selectedProduct.title,
          description: (selectedProduct as any).description,
          image_url: selectedProduct.image_url,
        },
        angles,
        formats,
      });
      toast.success("🎉 Kit publicitaire généré !", { id: t, description: "Vos créatives sont prêtes ci-dessous." });
    } catch (err: any) {
      toast.error("Erreur de génération", { id: t, description: err.message });
    }
  };

  const resetFilters = () => {
    setFilterAngle("all");
    setFilterFormat("all");
    setSearch("");
    setSort("newest");
  };

  const hasActiveFilters = filterAngle !== "all" || filterFormat !== "all" || search.trim() !== "" || sort !== "newest";

  const productMap = useMemo(() => {
    const m: Record<string, { id: string; title: string; image_url?: string }> = {};
    for (const p of publishedProducts) m[p.id] = p;
    return m;
  }, [publishedProducts]);

  return (
    <DashboardLayout
      variant="vendor"
      title="Studio Pub Elite"
      shopName={vendor?.shop_name}
      shopUrl={vendor ? `/store/${vendor.username}` : undefined}
    >
      <SEO title="Studio Pub Elite — Générateur de créatives IA" description="Créez des créatives publicitaires Facebook optimisées conversion en 1 clic." />

      <div className="space-y-8 max-w-7xl mx-auto pb-12">
        {/* Hero Section Premium Ultra-Creative */}
        <div className="relative overflow-hidden rounded-3xl border border-white/5 bg-black p-8 md:p-14 shadow-2xl group">
          {/* Gradients dynamiques */}
          <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/10 via-black to-fuchsia-500/10 opacity-80" />
          <div className="absolute -top-[50%] -right-[20%] h-[150%] w-[70%] rounded-[100%] bg-indigo-500/15 blur-[120px] pointer-events-none group-hover:bg-indigo-500/25 transition-colors duration-1000" />
          <div className="absolute -bottom-[50%] -left-[20%] h-[150%] w-[70%] rounded-[100%] bg-fuchsia-500/10 blur-[120px] pointer-events-none group-hover:bg-fuchsia-500/20 transition-colors duration-1000" />
          
          <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-8">
            <div className="space-y-5 max-w-2xl">
              <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-1.5 text-xs font-bold text-white backdrop-blur-md shadow-[0_0_15px_rgba(255,255,255,0.05)]">
                <Activity size={14} className="text-fuchsia-400 animate-pulse" /> IA Créative Engine v2
              </div>
              <h1 className="text-4xl md:text-6xl font-black text-white tracking-tight leading-[1.1]">
                Vos prochaines pubs <br className="hidden md:block"/>
                <span className="bg-gradient-to-r from-indigo-400 via-fuchsia-400 to-indigo-400 bg-clip-text text-transparent bg-[length:200%_auto] animate-gradient">sont déjà prêtes.</span>
              </h1>
              <p className="text-base md:text-lg text-zinc-400 max-w-xl leading-relaxed font-medium">
                Générez des créatives Facebook & Instagram ultra-performantes. 
                Sélectionnez un produit, notre IA s'occupe du visuel, du copywriting persuasif et du ciblage laser.
              </p>
            </div>
            
            <div className="hidden lg:flex items-center justify-center relative w-64 h-64">
               <div className="absolute inset-0 border border-white/10 rounded-full animate-[spin_10s_linear_infinite] border-t-fuchsia-500/50" />
               <div className="absolute inset-4 border border-white/5 rounded-full animate-[spin_15s_linear_infinite_reverse] border-b-indigo-500/50" />
               <div className="bg-black/50 backdrop-blur-xl border border-white/10 p-6 rounded-2xl shadow-2xl flex flex-col items-center gap-3 transform rotate-3 hover:rotate-0 transition-transform cursor-default">
                 <div className="w-12 h-12 bg-gradient-to-br from-indigo-500 to-fuchsia-500 rounded-xl flex items-center justify-center shadow-[0_0_20px_rgba(217,70,239,0.3)]">
                   <Wand2 className="text-white" />
                 </div>
                 <div className="text-center">
                   <p className="text-sm font-bold text-white">Prêt à créer</p>
                   <p className="text-[10px] text-zinc-500">Zéro compétence requise</p>
                 </div>
               </div>
            </div>
          </div>
        </div>

        {/* Generator Section */}
        <Card className="relative overflow-hidden border-border/40 bg-card/40 backdrop-blur-xl shadow-xl">
          <div className="absolute top-0 left-0 w-1/2 h-px bg-gradient-to-r from-transparent via-primary/50 to-transparent" />
          
          <div className="p-6 md:p-8 space-y-8">
            {/* 1. Product Selection */}
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-sm font-bold text-foreground">
                <span className="flex h-6 w-6 items-center justify-center rounded-full bg-primary/20 text-primary text-xs">1</span>
                Sélectionnez le produit à promouvoir
              </div>
              
              {productsLoading ? (
                <Skeleton className="h-14 w-full rounded-xl" />
              ) : publishedProducts.length === 0 ? (
                <div className="rounded-xl border border-dashed border-border/60 bg-muted/20 p-6 text-center text-sm text-muted-foreground">
                  Vous n'avez aucun produit publié. <br/>
                  <Link to="/dashboard/new-product" className="mt-2 inline-block font-medium text-primary hover:underline">Publier un produit pour commencer →</Link>
                </div>
              ) : (
                <Select value={productId} onValueChange={setProductId}>
                  <SelectTrigger className="h-14 w-full rounded-xl border-border/50 bg-background/50 px-4 text-base shadow-inner focus:ring-primary/20">
                    <SelectValue placeholder="Choisir un produit…" />
                  </SelectTrigger>
                  <SelectContent className="rounded-xl">
                    {publishedProducts.map((p) => (
                      <SelectItem key={p.id} value={p.id} className="cursor-pointer py-3">
                        <div className="flex items-center gap-3">
                          {p.image_url ? (
                            <img src={p.image_url} alt="" className="h-8 w-8 rounded-md object-cover shadow-sm" />
                          ) : (
                            <div className="h-8 w-8 rounded-md bg-muted flex items-center justify-center">
                              <ImageIcon size={14} className="text-muted-foreground" />
                            </div>
                          )}
                          <span className="font-medium">{p.title}</span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* 2. Angles */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-sm font-bold text-foreground">
                    <span className="flex h-6 w-6 items-center justify-center rounded-full bg-primary/20 text-primary text-xs">2</span>
                    Angles Marketing
                  </div>
                  <span className="text-xs font-medium text-muted-foreground bg-muted px-2 py-0.5 rounded-full">
                    {angles.length} choisi{angles.length > 1 ? "s" : ""}
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  {ANGLE_OPTIONS.map((a) => {
                    const active = angles.includes(a.value);
                    return (
                      <button
                        key={a.value}
                        onClick={() => toggleAngle(a.value)}
                        className={`group relative flex flex-col items-center justify-center gap-2 rounded-xl border p-4 text-center transition-all duration-300 ${
                          active
                            ? `border-primary bg-gradient-to-br ${a.color} text-white shadow-[0_0_20px_rgba(var(--primary),0.2)] scale-[1.02]`
                            : "border-border/50 bg-background/50 hover:border-primary/40 hover:bg-muted/30"
                        }`}
                      >
                        <span className="text-2xl drop-shadow-sm">{a.emoji}</span>
                        <span className="text-[11px] sm:text-xs font-bold leading-tight">{a.label}</span>
                        {active && (
                          <div className="absolute top-2 right-2 h-2 w-2 rounded-full bg-white shadow-[0_0_5px_white] animate-pulse" />
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* 3. Formats */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-sm font-bold text-foreground">
                    <span className="flex h-6 w-6 items-center justify-center rounded-full bg-primary/20 text-primary text-xs">3</span>
                    Formats Visuels
                  </div>
                  <span className="text-xs font-medium text-muted-foreground bg-muted px-2 py-0.5 rounded-full">
                    {formats.length} choisi{formats.length > 1 ? "s" : ""}
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  {FORMAT_OPTIONS.map((f) => {
                    const active = formats.includes(f.value);
                    return (
                      <button
                        key={f.value}
                        onClick={() => toggleFormat(f.value)}
                        className={`group relative flex flex-col items-start gap-1.5 rounded-xl border p-4 text-left transition-all duration-300 ${
                          active
                            ? "border-primary bg-primary/10 text-foreground shadow-[0_0_15px_rgba(var(--primary),0.1)] scale-[1.02]"
                            : "border-border/50 bg-background/50 hover:border-primary/40 hover:bg-muted/30"
                        }`}
                      >
                        <div className="flex w-full items-center justify-between">
                          <ImageIcon size={18} className={active ? "text-primary" : "text-muted-foreground"} />
                          <span className={`rounded-md px-1.5 py-0.5 text-[10px] font-bold ${active ? "bg-primary text-white" : "bg-muted text-muted-foreground"}`}>
                            {f.value}
                          </span>
                        </div>
                        <div className="mt-1">
                          <span className="block text-xs font-bold">{f.label}</span>
                          <span className="block text-[10px] text-muted-foreground">{f.subtitle}</span>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Generate Action Area Premium */}
            <div className="relative mt-8 rounded-2xl bg-black border border-white/10 p-6 md:p-8 overflow-hidden shadow-2xl">
              <div className="absolute inset-0 bg-gradient-to-r from-indigo-500/5 via-fuchsia-500/5 to-indigo-500/5 pointer-events-none" />
              
              <div className="relative flex flex-col md:flex-row md:items-center justify-between gap-8 z-10">
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full bg-white/5 border border-white/10 flex items-center justify-center">
                      <Wand2 size={14} className="text-fuchsia-400" />
                    </div>
                    <span className="font-bold text-sm text-white">Prêt à générer</span>
                  </div>
                  <p className="text-xs text-zinc-400 ml-10">
                    <strong className="text-white">{totalToGenerate}</strong> visuel{totalToGenerate > 1 ? "s" : ""} et <strong className="text-white">{angles.length}</strong> kit{angles.length > 1 ? "s" : ""} complet{angles.length > 1 ? "s" : ""} (Copy + Ciblage).
                  </p>
                </div>

                {generate.isPending ? (
                  <div className="w-full md:w-[400px] flex flex-col items-end gap-3">
                    <div className="flex items-center gap-2 text-sm font-bold text-white bg-white/5 px-4 py-2 rounded-full border border-white/10">
                      <Loader2 size={14} className="animate-spin text-fuchsia-400" />
                      {generationStep === 0 && "Analyse du produit..."}
                      {generationStep === 1 && "Rédaction IA des scripts..."}
                      {generationStep === 2 && "Génération des assets visuels..."}
                      {generationStep === 3 && "Finalisation du kit Elite..."}
                    </div>
                    <div className="flex gap-1.5 w-full">
                      {[0, 1, 2, 3].map((step) => (
                        <div 
                          key={step} 
                          className={`h-1.5 w-full rounded-full transition-all duration-700 ease-out ${step <= generationStep ? "bg-gradient-to-r from-indigo-500 to-fuchsia-500 shadow-[0_0_10px_rgba(217,70,239,0.5)]" : "bg-white/5"}`} 
                        />
                      ))}
                    </div>
                  </div>
                ) : (
                  <Button
                    size="lg"
                    className="h-14 w-full md:w-auto rounded-xl bg-gradient-to-r from-indigo-600 to-fuchsia-600 hover:from-indigo-500 hover:to-fuchsia-500 text-white gap-2 font-black px-10 shadow-[0_0_30px_rgba(217,70,239,0.3)] transition-all hover:scale-[1.02] hover:shadow-[0_0_40px_rgba(217,70,239,0.5)] border border-white/20"
                    onClick={handleGenerate}
                    disabled={!productId || totalToGenerate === 0 || totalToGenerate > 8}
                  >
                    <Sparkles size={18} className={(!productId || totalToGenerate === 0 || totalToGenerate > 8) ? "" : "animate-pulse"} /> 
                    Générer la magie
                  </Button>
                )}
              </div>
            </div>
          </div>
        </Card>

        {/* Dynamic Island - Floating Filter Toolbar */}
        <div className="sticky top-20 z-40 mx-auto w-full max-w-[1000px] px-4 sm:px-0 transition-all duration-300">
          <div className="rounded-2xl border border-white/10 bg-zinc-950/80 backdrop-blur-2xl shadow-[0_10px_40px_-10px_rgba(0,0,0,0.8)] p-2 md:p-3 flex flex-col md:flex-row items-center gap-3">
            
            {/* Left: Scope Tabs */}
            <div className="flex w-full md:w-auto items-center justify-between gap-3 bg-zinc-900/50 p-1.5 rounded-xl border border-white/5">
              <Tabs value={historyScope} onValueChange={(v) => setHistoryScope(v as "current" | "all")} className="w-full md:w-auto">
                <TabsList className="h-8 w-full md:w-auto p-0.5 bg-transparent">
                  <TabsTrigger value="current" className="text-xs px-4 rounded-lg data-[state=active]:bg-white/10 data-[state=active]:text-white data-[state=active]:shadow-none" disabled={!productId}>Ce produit</TabsTrigger>
                  <TabsTrigger value="all" className="text-xs px-4 rounded-lg data-[state=active]:bg-white/10 data-[state=active]:text-white data-[state=active]:shadow-none">Tous</TabsTrigger>
                </TabsList>
              </Tabs>
              
              <div className="flex md:hidden items-center bg-black/40 rounded-lg p-0.5 border border-white/5">
                <button onClick={() => setView("list")} className={`rounded-md p-1.5 ${view === "list" ? "bg-white/10 text-white" : "text-zinc-500"}`}><Rows3 size={14} /></button>
                <button onClick={() => setView("grid")} className={`rounded-md p-1.5 ${view === "grid" ? "bg-white/10 text-white" : "text-zinc-500"}`}><LayoutGrid size={14} /></button>
              </div>
            </div>

            <div className="h-8 w-px bg-white/10 hidden md:block" />

            {/* Middle: Search & Filters (Scrollable on mobile) */}
            <div className="flex-1 flex items-center gap-2 overflow-x-auto hide-scrollbar w-full md:w-auto pr-2 pb-1 md:pb-0">
              <div className="relative shrink-0 w-32 md:w-48">
                <Search size={14} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-zinc-500" />
                <Input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Rechercher..."
                  className="pl-8 h-8 rounded-xl bg-black/50 border-white/5 focus:border-fuchsia-500/50 text-xs placeholder:text-zinc-600 text-white shadow-inner"
                />
              </div>

              <div className="flex gap-1.5 items-center shrink-0">
                <button
                  onClick={() => setFilterAngle("all")}
                  className={`rounded-xl px-3 py-1.5 text-[11px] font-bold transition-all ${
                    filterAngle === "all" ? "bg-white/10 text-white border border-white/20" : "bg-transparent text-zinc-500 border border-transparent hover:bg-white/5 hover:text-zinc-300"
                  }`}
                >
                  Tous
                </button>
                {ANGLE_OPTIONS.map((a) => {
                  const count = angleCounts[a.value] || 0;
                  const active = filterAngle === a.value;
                  return (
                    <button
                      key={a.value}
                      onClick={() => setFilterAngle(active ? "all" : a.value)}
                      disabled={count === 0 && !active}
                      className={`flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-[11px] font-bold transition-all whitespace-nowrap ${
                        active
                          ? `bg-gradient-to-r ${a.color} text-white border border-transparent shadow-[0_0_15px_rgba(255,255,255,0.1)]`
                          : count === 0
                            ? "text-zinc-700 bg-transparent border border-transparent cursor-not-allowed"
                            : "bg-transparent text-zinc-400 border border-white/5 hover:bg-white/5 hover:text-zinc-200"
                      }`}
                    >
                      <span className="text-[13px]">{a.emoji}</span> {a.label} {count > 0 && <span className="opacity-50 font-normal">({count})</span>}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Right: View Toggle & Clear (Desktop) */}
            <div className="hidden md:flex items-center gap-2 shrink-0">
              {hasActiveFilters && (
                <button onClick={resetFilters} className="flex items-center gap-1 rounded-xl bg-red-500/10 px-3 py-1.5 text-[11px] font-bold text-red-400 hover:bg-red-500/20 transition-colors">
                  <X size={12} /> Effacer
                </button>
              )}
              <div className="h-8 w-px bg-white/10" />
              <div className="flex items-center bg-zinc-900/50 rounded-xl p-0.5 border border-white/5 shadow-inner">
                <button onClick={() => setView("list")} className={`rounded-lg p-1.5 transition-all ${view === "list" ? "bg-white/10 text-white shadow-sm" : "text-zinc-500 hover:text-white"}`} title="Vue liste">
                  <Rows3 size={14} />
                </button>
                <button onClick={() => setView("grid")} className={`rounded-lg p-1.5 transition-all ${view === "grid" ? "bg-white/10 text-white shadow-sm" : "text-zinc-500 hover:text-white"}`} title="Vue grille">
                  <LayoutGrid size={14} />
                </button>
              </div>
            </div>

          </div>
        </div>

        {/* Results Area */}
        <div className="space-y-6 pt-2">
          {creativesLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {[1, 2, 3, 4].map(i => (
                <Skeleton key={i} className="h-96 w-full rounded-2xl" />
              ))}
            </div>
          ) : filteredCreatives.length === 0 ? (
            <div className="flex flex-col items-center justify-center rounded-3xl border border-dashed border-border/60 bg-card/20 py-24 px-6 text-center backdrop-blur-sm">
              <div className="flex h-20 w-20 items-center justify-center rounded-full bg-primary/10 mb-6">
                <Sparkles size={32} className="text-primary" />
              </div>
              <h3 className="text-xl font-bold mb-2">Aucune créative trouvée</h3>
              <p className="text-sm text-muted-foreground max-w-md mb-6 leading-relaxed">
                {hasActiveFilters || creatives.length === 0
                  ? creatives.length === 0
                    ? "Votre bibliothèque est vide. Lancez votre première génération en utilisant le formulaire ci-dessus pour voir la magie opérer."
                    : "Aucune créative ne correspond à vos filtres actuels. Essayez d'effacer les filtres."
                  : "Vous n'avez pas encore généré de publicités pour ce produit spécifique."}
              </p>
              {hasActiveFilters && creatives.length > 0 && (
                <Button variant="outline" className="rounded-full h-10 px-6 font-bold" onClick={resetFilters}>
                  Effacer les filtres
                </Button>
              )}
            </div>
          ) : (
            <div className={view === "grid" ? "grid grid-cols-1 xl:grid-cols-2 gap-8" : "space-y-10 max-w-4xl mx-auto"}>
              {filteredCreatives.map((c) => {
                const product = productMap[c.product_id];
                return (
                  <div key={c.id} className="group relative">
                    {historyScope === "all" && (
                      <div className="absolute -top-4 left-6 z-20">
                        <Link
                          to={`/produit/${c.product_id}`}
                          className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-zinc-900/90 px-4 py-1.5 text-[11px] font-bold text-zinc-300 backdrop-blur-md shadow-xl transition-all hover:bg-black hover:text-white hover:border-white/30"
                        >
                          {product?.image_url ? (
                             <img src={product.image_url} alt="" className="h-5 w-5 rounded-full object-cover border border-white/10" />
                          ) : (
                             <div className="h-5 w-5 rounded-full bg-white/5 flex items-center justify-center border border-white/10"><ImageIcon size={10} className="text-zinc-500" /></div>
                          )}
                          {product?.title || "Produit inconnu/supprimé"} <ChevronRight size={12} className="opacity-50 text-fuchsia-400" />
                        </Link>
                      </div>
                    )}
                    <div className={historyScope === "all" ? "pt-3" : ""}>
                      <AdKitCard creative={c} productLink={`${window.location.origin}/produit/${c.product_id}`} />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Confirmation Dialog */}
      <Dialog open={showConfirm} onOpenChange={setShowConfirm}>
        <DialogContent className="glass-card border-white/10 text-white rounded-[2rem] max-w-sm">
          <DialogHeader className="items-center text-center">
            <div className="w-16 h-16 rounded-full bg-primary/20 flex items-center justify-center mb-4">
              <Megaphone size={32} className="text-primary" />
            </div>
            <DialogTitle className="text-2xl font-black tracking-tighter">Confirmation</DialogTitle>
            <DialogDescription className="text-muted-foreground font-medium text-center">
              Générer <span className="text-white font-black">{angles.length * formats.length} créatives</span> va consommer <span className="text-white font-black">{(angles.length * formats.length) * CREDIT_COSTS['ads-creative']} crédits</span>.
            </DialogDescription>
          </DialogHeader>
          <div className="bg-white/5 p-4 rounded-2xl space-y-3">
             <div className="flex justify-between text-xs">
                <span className="text-muted-foreground">Solde actuel</span>
                <span className="font-bold">{credits} crédits</span>
             </div>
             <div className="flex justify-between text-xs">
                <span className="text-muted-foreground">Solde après</span>
                <span className="font-bold text-primary">{credits - ((angles.length * formats.length) * CREDIT_COSTS['ads-creative'])} crédits</span>
             </div>
          </div>
          <DialogFooter className="flex-col sm:flex-col gap-2">
            <Button onClick={confirmGeneration} className="w-full h-12 rounded-xl btn-glow font-black uppercase text-xs">Confirmer & Générer</Button>
            <Button variant="ghost" onClick={() => setShowConfirm(false)} className="w-full h-12 rounded-xl font-bold text-xs uppercase">Annuler</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Insufficient Credits Dialog */}
      <Dialog open={showInsufficient} onOpenChange={setShowInsufficient}>
        <DialogContent className="glass-card border-destructive/20 text-white rounded-[2rem] max-w-sm">
          <DialogHeader className="items-center text-center">
            <div className="w-16 h-16 rounded-full bg-destructive/20 flex items-center justify-center mb-4 text-destructive">
              <AlertCircle size={32} />
            </div>
            <DialogTitle className="text-2xl font-black tracking-tighter">Crédits insuffisants</DialogTitle>
            <DialogDescription className="text-muted-foreground font-medium">
              Votre solde actuel ({credits} crédits) est trop bas pour générer ce kit publicitaire.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button onClick={() => { setShowInsufficient(false); navigate('/dashboard/abonnement'); }} className="w-full h-12 rounded-xl bg-destructive hover:bg-destructive/90 font-black uppercase text-xs gap-2">
               <Wallet size={16} /> Recharger maintenant
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
};

const VendorAdsStudio = () => (
  <VendorGuard>
    {() => (
      <div className="min-h-screen bg-background text-foreground">
        <Inner />
      </div>
    )}
  </VendorGuard>
);

export default VendorAdsStudio;

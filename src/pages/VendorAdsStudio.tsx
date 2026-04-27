import { useEffect, useMemo, useState } from "react";
import { useSearchParams, Link } from "react-router-dom";
import {
  Sparkles, Loader2, Wand2, Megaphone, ChevronRight, Image as ImageIcon,
  Filter, Search, History, X, LayoutGrid, Rows3,
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

type SortKey = "newest" | "oldest" | "angle";

const Inner = () => {
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
    if (totalToGenerate > 8) {
      toast.error("Maximum 8 créatives par génération", { description: "Réduisez le nombre d'angles ou de formats." });
      return;
    }
    const t = toast.loading(`Génération du kit publicitaire en cours… (${totalToGenerate} créative${totalToGenerate > 1 ? "s" : ""})`, {
      description: "Analyse du produit, copywriting, ciblage et création des images.",
    });
    try {
      await generate.mutateAsync({
        vendorId: vendor.id,
        userId: user.id,
        product: selectedProduct as unknown as { id: string; title: string; image_url?: string },
        angles,
        formats,
      });
      toast.success("🎉 Kit publicitaire généré !", { id: t, description: "Vos créatives sont prêtes ci-dessous." });
    } catch (e: unknown) {
      toast.error("Erreur de génération", { id: t, description: (e as Error).message });
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
        {/* Hero Section Premium */}
        <div className="relative overflow-hidden rounded-3xl border border-white/10 bg-zinc-950 p-8 md:p-12 shadow-2xl">
          {/* Effets de lumière */}
          <div className="absolute inset-0 bg-gradient-to-br from-primary/20 via-zinc-950/50 to-primary/5 opacity-80" />
          <div className="absolute -top-32 -right-32 h-96 w-96 rounded-full bg-primary/20 blur-[100px] pointer-events-none" />
          <div className="absolute -bottom-32 -left-32 h-96 w-96 rounded-full bg-blue-500/10 blur-[100px] pointer-events-none" />
          
          <div className="relative z-10 space-y-4 max-w-3xl">
            <div className="inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-4 py-1.5 text-xs font-bold text-primary backdrop-blur-md shadow-[0_0_15px_rgba(var(--primary),0.3)]">
              <Sparkles size={14} className="animate-pulse" /> Studio Elite IA
            </div>
            <h1 className="text-3xl md:text-5xl font-black text-white tracking-tight leading-tight">
              Générez des publicités <br className="hidden md:block"/>
              <span className="bg-gradient-to-r from-primary via-blue-400 to-primary bg-clip-text text-transparent">qui convertissent.</span>
            </h1>
            <p className="text-base md:text-lg text-zinc-400 max-w-2xl leading-relaxed">
              Sélectionnez un produit, choisissez vos angles d'attaque et laissez notre IA générer les visuels, le copywriting percutant et le ciblage laser pour Facebook & Instagram en quelques secondes.
            </p>
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

            {/* Generate Action Area */}
            <div className="relative mt-6 rounded-2xl bg-zinc-950/40 border border-white/5 p-6 backdrop-blur-sm overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-primary/5 to-transparent pointer-events-none" />
              <div className="relative flex flex-col md:flex-row md:items-center justify-between gap-6">
                
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <Sparkles size={16} className="text-primary" />
                    <span className="font-bold text-sm">Résumé de la génération</span>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Vous allez créer <strong className="text-foreground">{totalToGenerate}</strong> visuel{totalToGenerate > 1 ? "s" : ""} et <strong className="text-foreground">{angles.length}</strong> kit{angles.length > 1 ? "s" : ""} de texte/ciblage.
                  </p>
                </div>

                {generate.isPending ? (
                  <div className="w-full md:w-auto flex flex-col items-end gap-2">
                    <div className="flex items-center gap-2 text-sm font-bold text-primary">
                      <Loader2 size={16} className="animate-spin" />
                      {generationStep === 0 && "🔍 Analyse des bénéfices du produit..."}
                      {generationStep === 1 && "✍️ Rédaction des scripts persuasifs..."}
                      {generationStep === 2 && "🎨 Génération des assets visuels..."}
                      {generationStep === 3 && "✨ Finalisation du kit Elite..."}
                    </div>
                    <div className="flex gap-1.5 w-full md:w-64">
                      {[0, 1, 2, 3].map((step) => (
                        <div 
                          key={step} 
                          className={`h-2 w-full rounded-full transition-all duration-700 ease-out ${step <= generationStep ? "bg-gradient-to-r from-primary to-blue-500 shadow-[0_0_10px_rgba(var(--primary),0.5)]" : "bg-muted/50"}`} 
                        />
                      ))}
                    </div>
                  </div>
                ) : (
                  <Button
                    size="lg"
                    className="h-12 w-full md:w-auto rounded-xl btn-glow gap-2 font-bold px-8 shadow-[0_0_20px_rgba(var(--primary),0.4)] transition-all hover:scale-105 hover:shadow-[0_0_30px_rgba(var(--primary),0.6)]"
                    onClick={handleGenerate}
                    disabled={!productId || totalToGenerate === 0 || totalToGenerate > 8}
                  >
                    <Wand2 size={18} className="animate-pulse" /> 
                    Générer la magie
                  </Button>
                )}
              </div>
            </div>
          </div>
        </Card>

        {/* History + Filters (Sticky Header approach) */}
        <div className="sticky top-16 z-30 -mx-4 px-4 sm:mx-0 sm:px-0">
          <Card className="p-4 md:p-5 space-y-4 border-border/40 bg-background/80 backdrop-blur-xl shadow-lg">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 border border-primary/20">
                  <History size={18} className="text-primary" />
                </div>
                <div>
                  <h2 className="text-base font-bold flex items-center gap-2">
                    Bibliothèque de Créatives
                    <Badge variant="secondary" className="text-[10px] font-bold">
                      {filteredCreatives.length} / {creatives.length}
                    </Badge>
                  </h2>
                  <p className="text-xs text-muted-foreground">Retrouvez et gérez vos assets publicitaires.</p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <Tabs value={historyScope} onValueChange={(v) => setHistoryScope(v as "current" | "all")} className="w-full sm:w-auto">
                  <TabsList className="h-9 w-full sm:w-auto p-1 bg-muted/50">
                    <TabsTrigger value="current" className="text-xs px-4" disabled={!productId}>Ce produit</TabsTrigger>
                    <TabsTrigger value="all" className="text-xs px-4">Tous les produits</TabsTrigger>
                  </TabsList>
                </Tabs>
                <div className="hidden md:flex items-center rounded-lg border border-border/50 bg-background p-1 shadow-sm">
                  <button
                    onClick={() => setView("list")}
                    className={`rounded-md p-1.5 transition-all ${view === "list" ? "bg-primary/15 text-primary shadow-sm" : "text-muted-foreground hover:text-foreground"}`}
                    title="Vue détaillée"
                  >
                    <Rows3 size={14} />
                  </button>
                  <button
                    onClick={() => setView("grid")}
                    className={`rounded-md p-1.5 transition-all ${view === "grid" ? "bg-primary/15 text-primary shadow-sm" : "text-muted-foreground hover:text-foreground"}`}
                    title="Vue grille"
                  >
                    <LayoutGrid size={14} />
                  </button>
                </div>
              </div>
            </div>

            {/* Modern Filter Toolbar */}
            <div className="flex flex-wrap items-center gap-2 md:gap-3">
              <div className="relative flex-grow md:max-w-xs">
                <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                <Input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Rechercher par texte..."
                  className="pl-9 h-9 rounded-full bg-muted/30 border-transparent focus:border-primary/50 text-xs"
                />
              </div>

              <div className="h-6 w-px bg-border/50 hidden md:block" />

              {/* Quick Filter Chips (Horizontal Scroll on Mobile) */}
              <div className="flex overflow-x-auto pb-1 md:pb-0 hide-scrollbar gap-1.5 flex-nowrap items-center w-full md:w-auto">
                <button
                  onClick={() => setFilterAngle("all")}
                  className={`shrink-0 rounded-full border px-3 py-1.5 text-[11px] font-bold transition-all ${
                    filterAngle === "all" ? "border-primary bg-primary text-white shadow-md" : "border-border/50 bg-background hover:bg-muted"
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
                      className={`shrink-0 flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-[11px] font-bold transition-all ${
                        active
                          ? `border-transparent bg-gradient-to-r ${a.color} text-white shadow-md`
                          : count === 0
                            ? "border-border/20 text-muted-foreground/30 bg-background/20 cursor-not-allowed"
                            : "border-border/50 bg-background text-foreground hover:bg-muted"
                      }`}
                    >
                      <span className="text-[14px]">{a.emoji}</span> {a.label} {count > 0 && <span className="opacity-70 font-medium">({count})</span>}
                    </button>
                  );
                })}
              </div>

              {hasActiveFilters && (
                <button
                  onClick={resetFilters}
                  className="shrink-0 ml-auto flex items-center gap-1.5 rounded-full bg-destructive/10 px-3 py-1.5 text-[11px] font-bold text-destructive hover:bg-destructive/20 transition-colors"
                >
                  <X size={12} /> Effacer
                </button>
              )}
            </div>
          </Card>
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
            <div className={view === "grid" ? "grid grid-cols-1 xl:grid-cols-2 gap-6" : "space-y-6 max-w-4xl mx-auto"}>
              {filteredCreatives.map((c) => {
                const product = productMap[c.product_id];
                return (
                  <div key={c.id} className="group relative">
                    {historyScope === "all" && product && (
                      <div className="absolute -top-3 left-4 z-10">
                        <Link
                          to={`/produit/${c.product_id}`}
                          className="inline-flex items-center gap-2 rounded-full border border-border/50 bg-background/80 px-3 py-1 text-[10px] font-bold text-foreground backdrop-blur-md shadow-sm transition hover:bg-background hover:text-primary"
                        >
                          {product.image_url && <img src={product.image_url} alt="" className="h-4 w-4 rounded-full object-cover" />}
                          {product.title} <ChevronRight size={10} className="opacity-50" />
                        </Link>
                      </div>
                    )}
                    <div className={historyScope === "all" ? "pt-2" : ""}>
                      <AdKitCard creative={c} productLink={`${window.location.origin}/produit/${c.product_id}`} />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
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

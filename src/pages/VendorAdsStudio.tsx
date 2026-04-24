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
    () => (products as any[]).filter((p) => p.status === "published" || !p.status),
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
        product: selectedProduct as any,
        angles,
        formats,
      });
      toast.success("🎉 Kit publicitaire généré !", { id: t, description: "Vos créatives sont prêtes ci-dessous." });
    } catch (e: any) {
      toast.error("Erreur de génération", { id: t, description: e.message });
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
    const m: Record<string, any> = {};
    for (const p of publishedProducts as any[]) m[p.id] = p;
    return m;
  }, [publishedProducts]);

  return (
    <DashboardLayout
      variant="vendor"
      title="Studio Pub Facebook"
      shopName={vendor?.shop_name}
      shopUrl={vendor ? `/store/${vendor.username}` : undefined}
    >
      <SEO title="Studio Pub Facebook — Générateur de créatives IA" description="Créez des créatives publicitaires Facebook optimisées conversion en 1 clic." />

      <div className="space-y-6">
        {/* Hero */}
        <Card className="relative overflow-hidden border-primary/30 bg-gradient-to-br from-card via-card to-primary/5 p-6">
          <div className="aurora-glow pointer-events-none absolute inset-0 opacity-50" />
          <div className="relative space-y-2">
            <div className="inline-flex items-center gap-2 rounded-full bg-primary/15 px-3 py-1 text-xs font-bold text-primary">
              <Sparkles size={12} className="animate-pulse" /> Nouveau ✨
            </div>
            <h1 className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-foreground via-primary to-foreground bg-clip-text text-transparent">
              Studio Pub Facebook
            </h1>
            <p className="text-sm text-muted-foreground max-w-2xl">
              Générez en 1 clic des <strong>créatives publicitaires</strong>, des <strong>textes optimisés conversion</strong> et un <strong>ciblage Facebook précis</strong> pour vos produits — par angle marketing et format.
            </p>
          </div>
        </Card>

        {/* Generator */}
        <Card className="p-6 space-y-5 border-border/60">
          <div className="space-y-2">
            <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">1. Produit à promouvoir</label>
            {productsLoading ? (
              <Skeleton className="h-10 w-full" />
            ) : publishedProducts.length === 0 ? (
              <div className="rounded-md border border-dashed border-border p-4 text-sm text-muted-foreground">
                Vous n'avez aucun produit publié. <Link to="/dashboard/new-product" className="text-primary hover:underline">Publier un produit →</Link>
              </div>
            ) : (
              <Select value={productId} onValueChange={setProductId}>
                <SelectTrigger><SelectValue placeholder="Choisir un produit…" /></SelectTrigger>
                <SelectContent>
                  {publishedProducts.map((p: any) => (
                    <SelectItem key={p.id} value={p.id}>
                      <div className="flex items-center gap-2">
                        {p.image_url && <img src={p.image_url} alt="" className="h-6 w-6 rounded object-cover" />}
                        <span>{p.title}</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          </div>

          <div className="space-y-2">
            <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
              2. Angles marketing ({angles.length} sélectionné{angles.length > 1 ? "s" : ""})
            </label>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
              {ANGLE_OPTIONS.map((a) => {
                const active = angles.includes(a.value);
                return (
                  <button
                    key={a.value}
                    onClick={() => toggleAngle(a.value)}
                    className={`group relative flex items-center gap-2 rounded-lg border-2 p-3 text-left transition-all ${
                      active
                        ? `border-primary bg-gradient-to-br ${a.color} text-white shadow-lg scale-[1.02]`
                        : "border-border bg-card hover:border-primary/40 hover:bg-muted/40"
                    }`}
                  >
                    <span className="text-xl">{a.emoji}</span>
                    <span className="text-sm font-bold">{a.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
              3. Formats ({formats.length} sélectionné{formats.length > 1 ? "s" : ""})
            </label>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
              {FORMAT_OPTIONS.map((f) => {
                const active = formats.includes(f.value);
                return (
                  <button
                    key={f.value}
                    onClick={() => toggleFormat(f.value)}
                    className={`flex flex-col items-start gap-1 rounded-lg border-2 p-3 text-left transition-all ${
                      active
                        ? "border-primary bg-primary/10 text-foreground shadow-md"
                        : "border-border bg-card hover:border-primary/40"
                    }`}
                  >
                    <div className="flex items-center gap-1.5">
                      <ImageIcon size={14} className={active ? "text-primary" : "text-muted-foreground"} />
                      <span className="text-sm font-bold">{f.label}</span>
                    </div>
                    <span className="text-[10px] text-muted-foreground">{f.subtitle}</span>
                    <span className="mt-1 rounded-full bg-muted px-2 py-0.5 text-[10px] font-bold">{f.value}</span>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 pt-2 border-t border-border">
            <div className="text-xs text-muted-foreground">
              <strong className="text-foreground">{totalToGenerate}</strong> créative{totalToGenerate > 1 ? "s" : ""} ser{totalToGenerate > 1 ? "ont" : "a"} générée{totalToGenerate > 1 ? "s" : ""}
              {totalToGenerate > 0 && ` • ${angles.length} kit${angles.length > 1 ? "s" : ""} de copywriting + ciblage`}
            </div>
            <Button
              size="lg"
              className="btn-glow gap-2"
              onClick={handleGenerate}
              disabled={generate.isPending || !productId || totalToGenerate === 0 || totalToGenerate > 8}
            >
              {generate.isPending ? (
                <><Loader2 size={16} className="animate-spin" /> Génération en cours…</>
              ) : (
                <><Wand2 size={16} /> Générer mon kit publicitaire <ChevronRight size={16} /></>
              )}
            </Button>
          </div>
        </Card>

        {/* History + Filters */}
        <Card className="p-5 space-y-4 border-border/60">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-2">
              <div className="rounded-lg bg-primary/10 p-2">
                <History size={16} className="text-primary" />
              </div>
              <div>
                <h2 className="text-base font-bold flex items-center gap-2">
                  Historique des générations
                  <span className="rounded-full bg-muted px-2 py-0.5 text-[10px] font-bold text-muted-foreground">
                    {filteredCreatives.length}/{creatives.length}
                  </span>
                </h2>
                <p className="text-[11px] text-muted-foreground">
                  Filtrez, recherchez et régénérez sans tout refaire.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Tabs value={historyScope} onValueChange={(v) => setHistoryScope(v as "current" | "all")}>
                <TabsList className="h-8">
                  <TabsTrigger value="current" className="text-[11px] px-3" disabled={!productId}>Ce produit</TabsTrigger>
                  <TabsTrigger value="all" className="text-[11px] px-3">Tous</TabsTrigger>
                </TabsList>
              </Tabs>
              <div className="hidden sm:flex items-center rounded-md border border-border p-0.5">
                <button
                  onClick={() => setView("list")}
                  className={`rounded p-1.5 transition ${view === "list" ? "bg-primary/15 text-primary" : "text-muted-foreground hover:text-foreground"}`}
                  title="Vue liste"
                >
                  <Rows3 size={14} />
                </button>
                <button
                  onClick={() => setView("grid")}
                  className={`rounded p-1.5 transition ${view === "grid" ? "bg-primary/15 text-primary" : "text-muted-foreground hover:text-foreground"}`}
                  title="Vue grille"
                >
                  <LayoutGrid size={14} />
                </button>
              </div>
            </div>
          </div>

          {/* Filter toolbar */}
          <div className="grid grid-cols-1 gap-2 md:grid-cols-[1fr_auto_auto_auto]">
            <div className="relative">
              <Search size={14} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <Input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Rechercher dans les textes pub…"
                className="pl-9 h-9 text-xs"
              />
            </div>

            <Select value={filterAngle} onValueChange={(v) => setFilterAngle(v as AdAngle | "all")}>
              <SelectTrigger className="h-9 w-full md:w-[180px] text-xs">
                <Filter size={12} className="mr-1.5" />
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tous les angles</SelectItem>
                {ANGLE_OPTIONS.map((a) => (
                  <SelectItem key={a.value} value={a.value}>
                    <span className="mr-1.5">{a.emoji}</span>{a.label}
                    {angleCounts[a.value] ? <span className="ml-2 text-[10px] text-muted-foreground">({angleCounts[a.value]})</span> : null}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={filterFormat} onValueChange={(v) => setFilterFormat(v as AdFormat | "all")}>
              <SelectTrigger className="h-9 w-full md:w-[150px] text-xs">
                <ImageIcon size={12} className="mr-1.5" />
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tous formats</SelectItem>
                {FORMAT_OPTIONS.map((f) => (
                  <SelectItem key={f.value} value={f.value}>{f.value} — {f.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={sort} onValueChange={(v) => setSort(v as SortKey)}>
              <SelectTrigger className="h-9 w-full md:w-[140px] text-xs">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="newest">Plus récents</SelectItem>
                <SelectItem value="oldest">Plus anciens</SelectItem>
                <SelectItem value="angle">Par angle</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Quick angle chips */}
          <div className="flex flex-wrap items-center gap-1.5">
            <button
              onClick={() => setFilterAngle("all")}
              className={`rounded-full border px-2.5 py-1 text-[10px] font-bold transition ${
                filterAngle === "all" ? "border-primary bg-primary/15 text-primary" : "border-border text-muted-foreground hover:border-primary/40"
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
                  className={`rounded-full border px-2.5 py-1 text-[10px] font-bold transition ${
                    active
                      ? `border-transparent bg-gradient-to-r ${a.color} text-white shadow`
                      : count === 0
                        ? "border-border/40 text-muted-foreground/40 cursor-not-allowed"
                        : "border-border text-foreground hover:border-primary/40"
                  }`}
                >
                  {a.emoji} {a.label} {count > 0 && <span className="ml-1 opacity-80">({count})</span>}
                </button>
              );
            })}
            {hasActiveFilters && (
              <button
                onClick={resetFilters}
                className="ml-1 inline-flex items-center gap-1 rounded-full border border-destructive/40 bg-destructive/10 px-2.5 py-1 text-[10px] font-bold text-destructive hover:bg-destructive/20"
              >
                <X size={10} /> Réinitialiser
              </button>
            )}
          </div>
        </Card>

        {/* Results */}
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <Megaphone size={18} className="text-primary" />
            <h2 className="text-lg font-bold">
              {historyScope === "current" && selectedProduct
                ? `Créatives pour "${selectedProduct.title}"`
                : "Toutes vos créatives"}
            </h2>
            <span className="text-xs text-muted-foreground">({filteredCreatives.length})</span>
          </div>

          {creativesLoading ? (
            <div className="space-y-3">
              <Skeleton className="h-64 w-full" />
              <Skeleton className="h-64 w-full" />
            </div>
          ) : filteredCreatives.length === 0 ? (
            <Card className="p-10 text-center border-dashed">
              <Sparkles size={32} className="mx-auto text-muted-foreground mb-3" />
              <p className="text-sm text-muted-foreground">
                {hasActiveFilters || creatives.length === 0
                  ? creatives.length === 0
                    ? "Aucune créative pour l'instant. Lancez votre première génération ci-dessus 👆"
                    : "Aucune créative ne correspond à vos filtres."
                  : "Aucune créative pour ce produit. Lancez une génération ci-dessus 👆"}
              </p>
              {hasActiveFilters && creatives.length > 0 && (
                <Button variant="outline" size="sm" className="mt-3" onClick={resetFilters}>
                  Réinitialiser les filtres
                </Button>
              )}
            </Card>
          ) : (
            <div className={view === "grid" ? "grid grid-cols-1 lg:grid-cols-2 gap-4" : "space-y-4"}>
              {filteredCreatives.map((c) => {
                const product = productMap[c.product_id];
                return (
                  <div key={c.id} className="space-y-1">
                    {historyScope === "all" && product && (
                      <Link
                        to={`/produit/${c.product_id}`}
                        className="inline-flex items-center gap-1.5 text-[10px] font-semibold text-muted-foreground hover:text-primary transition"
                      >
                        {product.image_url && <img src={product.image_url} alt="" className="h-4 w-4 rounded object-cover" />}
                        {product.title} →
                      </Link>
                    )}
                    <AdKitCard creative={c} productLink={`${window.location.origin}/produit/${c.product_id}`} />
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
    {() => <Inner />}
  </VendorGuard>
);

export default VendorAdsStudio;

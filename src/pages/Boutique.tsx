import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { Filter, Package, RefreshCw, Search, SlidersHorizontal, X } from "lucide-react";
import Navbar from "@/components/Navbar";
import FooterSection from "@/components/FooterSection";
import ProductCard from "@/components/ProductCard";
import SEO from "@/components/SEO";
import { useProducts } from "@/hooks/useProducts";
import { categories, type Category, type Product } from "@/data/products";
import fbPixel from "@/hooks/useFacebookPixel";
import { motion, useReducedMotion } from "motion/react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { parseCurrency } from "@/lib/currency";

type ProductModeFilter = "all" | "digital" | "physical" | "hybrid";
type PriceFilter = "all" | "under-5000" | "5000-10000" | "over-10000";
type MarketplaceSort = "recommended" | "newest" | "price-asc" | "price-desc" | "rating";

const sortLabels: Record<MarketplaceSort, string> = {
  recommended: "Recommandés",
  newest: "Nouveautés",
  "price-asc": "Prix croissant",
  "price-desc": "Prix décroissant",
  rating: "Mieux notés",
};

const getSafeCategory = (value: string | null): Category => {
  return value && categories.includes(value as Category) ? value as Category : "Tous";
};

const getSafeSort = (value: string | null): MarketplaceSort => {
  return value && value in sortLabels ? value as MarketplaceSort : "recommended";
};

const updateParam = (searchParams: URLSearchParams, setSearchParams: ReturnType<typeof useSearchParams>[1], key: string, value?: string) => {
  const next = new URLSearchParams(searchParams);
  if (!value || value === "all" || (key === "category" && value === "Tous") || (key === "sort" && value === "recommended")) {
    next.delete(key);
  } else {
    next.set(key, value);
  }
  setSearchParams(next, { replace: key === "q" });
};

const FilterControls = ({
  searchParams,
  setSearchParams,
  idPrefix,
}: {
  searchParams: URLSearchParams;
  setSearchParams: ReturnType<typeof useSearchParams>[1];
  idPrefix: string;
}) => {
  const type = searchParams.get("type") || "all";
  const price = searchParams.get("price") || "all";
  const availableOnly = searchParams.get("availability") === "available";

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <label htmlFor={`${idPrefix}-type`} className="text-xs font-semibold text-foreground">Type de produit</label>
        <Select value={type} onValueChange={(value) => updateParam(searchParams, setSearchParams, "type", value)}>
          <SelectTrigger id={`${idPrefix}-type`} className="h-10 rounded-lg bg-background">
            <SelectValue placeholder="Tous les types" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tous les types</SelectItem>
            <SelectItem value="digital">Digital</SelectItem>
            <SelectItem value="physical">Physique</SelectItem>
            <SelectItem value="hybrid">Hybride</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <label htmlFor={`${idPrefix}-price`} className="text-xs font-semibold text-foreground">Prix</label>
        <Select value={price} onValueChange={(value) => updateParam(searchParams, setSearchParams, "price", value)}>
          <SelectTrigger id={`${idPrefix}-price`} className="h-10 rounded-lg bg-background">
            <SelectValue placeholder="Tous les prix" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tous les prix</SelectItem>
            <SelectItem value="under-5000">Moins de 5 000 FCFA</SelectItem>
            <SelectItem value="5000-10000">5 000 à 10 000 FCFA</SelectItem>
            <SelectItem value="over-10000">Plus de 10 000 FCFA</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <label className="flex min-h-11 cursor-pointer items-center gap-3 rounded-lg border border-border px-3 text-sm text-foreground">
        <input
          type="checkbox"
          checked={availableOnly}
          onChange={(event) => updateParam(searchParams, setSearchParams, "availability", event.target.checked ? "available" : undefined)}
          className="size-4 rounded border-border accent-[hsl(var(--primary))]"
        />
        Disponible uniquement
      </label>

      <Button
        type="button"
        variant="ghost"
        className="w-full justify-center rounded-lg text-muted-foreground"
        onClick={() => {
          const next = new URLSearchParams(searchParams);
          ["category", "type", "price", "availability"].forEach((key) => next.delete(key));
          setSearchParams(next, { replace: true });
        }}
      >
        Réinitialiser les filtres
      </Button>
    </div>
  );
};

const ProductSkeleton = () => (
  <div className="overflow-hidden rounded-xl border border-border bg-card">
    <Skeleton className="aspect-[4/3] rounded-none" />
    <div className="space-y-3 p-4">
      <Skeleton className="h-5 w-4/5" />
      <Skeleton className="h-4 w-2/5" />
      <Skeleton className="h-4 w-1/2" />
      <div className="flex items-end justify-between border-t border-border pt-3">
        <Skeleton className="h-6 w-20" />
        <Skeleton className="h-10 w-28 rounded-lg" />
      </div>
    </div>
  </div>
);

const Boutique = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);
  const [searchInput, setSearchInput] = useState(searchParams.get("q") || "");
  const reduce = useReducedMotion();
  const activeCategory = getSafeCategory(searchParams.get("category"));
  const searchQuery = searchParams.get("q") || "";
  const productType = (searchParams.get("type") || "all") as ProductModeFilter;
  const priceFilter = (searchParams.get("price") || "all") as PriceFilter;
  const sort = getSafeSort(searchParams.get("sort"));
  const availabilityOnly = searchParams.get("availability") === "available";
  const { data: products = [], isLoading, isError, refetch } = useProducts();

  useEffect(() => {
    setSearchInput(searchQuery);
  }, [searchQuery]);

  useEffect(() => {
    const timeout = window.setTimeout(() => {
      const value = searchInput.trim();
      if (value === searchQuery) return;
      updateParam(searchParams, setSearchParams, "q", value || undefined);
    }, 250);
    return () => window.clearTimeout(timeout);
  }, [searchInput, searchParams, searchQuery, setSearchParams]);

  useEffect(() => {
    if (!searchQuery.trim() || searchQuery.trim().length < 2) return;
    const timeout = window.setTimeout(() => {
      fbPixel.search({ search_string: searchQuery.trim() });
    }, 800);
    return () => window.clearTimeout(timeout);
  }, [searchQuery]);

  const filtered = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    const result = products.filter((product) => {
      const price = parseCurrency(product.price);
      const matchesQuery = !query || [product.title, product.category, product.vendor?.shop_name || "MindHubs"].some((value) => value.toLowerCase().includes(query));
      const matchesCategory = activeCategory === "Tous" || product.category === activeCategory;
      const matchesType = productType === "all" || (product.productMode || "digital") === productType;
      const matchesPrice = priceFilter === "all"
        || (priceFilter === "under-5000" && price < 5000)
        || (priceFilter === "5000-10000" && price >= 5000 && price <= 10000)
        || (priceFilter === "over-10000" && price > 10000);
      const matchesAvailability = !availabilityOnly || !["physical", "hybrid"].includes(product.productMode || "digital") || (product.inventoryQuantity ?? 0) > 0;
      return matchesQuery && matchesCategory && matchesType && matchesPrice && matchesAvailability;
    });

    return [...result].sort((a, b) => {
      if (sort === "newest") return (Date.parse(b.created_at || "") || 0) - (Date.parse(a.created_at || "") || 0);
      if (sort === "price-asc") return parseCurrency(a.price) - parseCurrency(b.price);
      if (sort === "price-desc") return parseCurrency(b.price) - parseCurrency(a.price);
      if (sort === "rating") return (b.rating || 0) - (a.rating || 0);
      return 0;
    });
  }, [activeCategory, availabilityOnly, priceFilter, productType, products, searchQuery, sort]);

  const activeFilterCount = [
    activeCategory !== "Tous",
    productType !== "all",
    priceFilter !== "all",
    availabilityOnly,
  ].filter(Boolean).length;

  const clearAll = () => setSearchParams({}, { replace: true });

  const activeFilterLabels = [
    activeCategory !== "Tous" ? { key: "category", label: activeCategory } : null,
    productType !== "all" ? { key: "type", label: productType === "digital" ? "Digital" : productType === "physical" ? "Physique" : "Hybride" } : null,
    priceFilter !== "all" ? { key: "price", label: priceFilter === "under-5000" ? "Moins de 5 000 FCFA" : priceFilter === "5000-10000" ? "5 000–10 000 FCFA" : "Plus de 10 000 FCFA" } : null,
    availabilityOnly ? { key: "availability", label: "Disponible" } : null,
  ].filter(Boolean) as { key: string; label: string }[];

  return (
    <div className="min-h-screen bg-background">
      <SEO
        title="Marketplace – Produits digitaux et physiques | MindHubs"
        description="Découvrez les produits digitaux et physiques publiés par MindHubs et ses vendeurs : formations, kits, livres, logiciels et outils pour avancer plus vite."
        path="/boutique"
        keywords="marketplace Afrique, produits digitaux, formations, kits business, logiciels, MindHubs"
      />
      <Navbar />

      <main>
        <section className="border-b border-border pt-28 pb-10 sm:pb-14">
          <div className="container mx-auto px-4">
            <motion.div
              initial={reduce ? false : { opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: reduce ? 0.01 : 0.28, ease: [0.16, 1, 0.3, 1] }}
              className="mx-auto max-w-6xl"
            >
              <p className="mb-4 text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">Marketplace MindHubs</p>
              <h1 className="max-w-3xl text-3xl font-bold leading-tight tracking-[-0.04em] text-foreground sm:text-5xl">
                Des produits utiles pour avancer maintenant.
              </h1>
              <p className="mt-4 max-w-2xl text-sm leading-6 text-muted-foreground sm:text-base">
                Explorez une sélection de produits digitaux et physiques créés par MindHubs et ses vendeurs.
              </p>
            </motion.div>
          </div>
        </section>

        <section className="relative z-30 container mx-auto -mt-5 px-4">
          <div className="mx-auto max-w-6xl rounded-2xl border border-border bg-card p-3 shadow-sm">
            <label htmlFor="marketplace-search" className="sr-only">Rechercher un produit</label>
            <div className="relative">
              <Search className="pointer-events-none absolute left-4 top-1/2 size-5 -translate-y-1/2 text-muted-foreground" aria-hidden="true" />
              <input
                id="marketplace-search"
                type="search"
                value={searchInput}
                onChange={(event) => setSearchInput(event.target.value)}
                onKeyDown={(event) => {
                  if (event.key === "Escape") setSearchInput("");
                }}
                placeholder="Rechercher un produit, une catégorie ou un vendeur…"
                className="h-12 w-full rounded-xl border border-border bg-background pl-12 pr-4 text-sm text-foreground outline-none transition-colors placeholder:text-muted-foreground focus:border-ring focus:ring-2 focus:ring-ring/20"
              />
            </div>

            <div className="mt-3 flex items-center gap-2 overflow-x-auto border-t border-border pt-3 [scrollbar-width:none]">
              {categories.map((category) => (
                <button
                  key={category}
                  type="button"
                  aria-pressed={activeCategory === category}
                  onClick={() => updateParam(searchParams, setSearchParams, "category", category)}
                  className={`min-h-10 shrink-0 rounded-lg px-3 text-xs font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring ${activeCategory === category ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:bg-accent hover:text-foreground"}`}
                >
                  {category}
                </button>
              ))}
            </div>
          </div>
        </section>

        <section className="container mx-auto px-4 pt-8">
          <div className="mx-auto flex max-w-6xl flex-col gap-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-2 text-sm text-muted-foreground" aria-live="polite">
                <Package size={16} className="text-primary" aria-hidden="true" />
                <span>{isLoading ? "Chargement des produits…" : `${filtered.length} produit${filtered.length > 1 ? "s" : ""} disponible${filtered.length > 1 ? "s" : ""}`}</span>
              </div>

              <div className="flex items-center gap-2">
                <div className="hidden items-center gap-2 sm:flex">
                  <span className="text-xs text-muted-foreground">Trier par</span>
                  <Select value={sort} onValueChange={(value) => updateParam(searchParams, setSearchParams, "sort", value)}>
                    <SelectTrigger className="h-10 w-[170px] rounded-lg bg-card text-xs">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.entries(sortLabels).map(([value, label]) => <SelectItem key={value} value={value}>{label}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>

                <div className="hidden sm:block">
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button type="button" variant="outline" className="min-h-10 rounded-lg gap-2">
                        <SlidersHorizontal size={15} aria-hidden="true" />
                        Filtres{activeFilterCount ? ` (${activeFilterCount})` : ""}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent align="end" className="w-72 rounded-xl border-border bg-popover p-4">
                      <FilterControls searchParams={searchParams} setSearchParams={setSearchParams} idPrefix="desktop-marketplace" />
                    </PopoverContent>
                  </Popover>
                </div>

                <Button type="button" variant="outline" className="min-h-10 rounded-lg gap-2 sm:hidden" onClick={() => setMobileFiltersOpen(true)}>
                  <Filter size={15} aria-hidden="true" />
                  Filtres{activeFilterCount ? ` (${activeFilterCount})` : ""}
                </Button>
              </div>
            </div>

            {activeFilterLabels.length > 0 ? (
              <div className="flex flex-wrap items-center gap-2" aria-label="Filtres actifs">
                <span className="text-xs text-muted-foreground">Filtres actifs :</span>
                {activeFilterLabels.map(({ key, label }) => (
                  <button key={key} type="button" onClick={() => updateParam(searchParams, setSearchParams, key)} className="inline-flex min-h-8 items-center gap-1.5 rounded-full border border-border bg-card px-3 text-xs font-medium text-foreground hover:bg-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
                    {label}<X size={13} aria-hidden="true" />
                  </button>
                ))}
                <button type="button" onClick={clearAll} className="min-h-8 px-2 text-xs font-medium text-muted-foreground underline-offset-4 hover:text-foreground hover:underline">Tout effacer</button>
              </div>
            ) : null}

            <div className="flex items-center justify-between gap-3 border-b border-border pb-4 sm:hidden">
              <span className="text-xs text-muted-foreground">Affichage : {sortLabels[sort]}</span>
              <Select value={sort} onValueChange={(value) => updateParam(searchParams, setSearchParams, "sort", value)}>
                <SelectTrigger className="h-9 w-[150px] rounded-lg bg-card text-xs"><SelectValue /></SelectTrigger>
                <SelectContent>
                  {Object.entries(sortLabels).map(([value, label]) => <SelectItem key={value} value={value}>{label}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
          </div>
        </section>

        <section className="container mx-auto px-4 pb-20 pt-6">
          <div className="mx-auto max-w-6xl">
            {isLoading ? (
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4 lg:gap-5">
                {Array.from({ length: 8 }).map((_, index) => <ProductSkeleton key={index} />)}
              </div>
            ) : isError ? (
              <div className="rounded-2xl border border-dashed border-border bg-card px-6 py-16 text-center">
                <RefreshCw size={28} className="mx-auto mb-4 text-muted-foreground" aria-hidden="true" />
                <h2 className="text-xl font-semibold text-foreground">Le catalogue est temporairement indisponible</h2>
                <p className="mx-auto mt-2 max-w-md text-sm text-muted-foreground">Réessayez dans quelques instants. Votre panier et vos commandes ne sont pas affectés.</p>
                <Button type="button" variant="outline" className="mt-6 rounded-lg" onClick={() => refetch()}>Réessayer</Button>
              </div>
            ) : filtered.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-border bg-card px-6 py-16 text-center">
                <Search size={28} className="mx-auto mb-4 text-muted-foreground" aria-hidden="true" />
                <h2 className="text-xl font-semibold text-foreground">Aucun produit ne correspond à votre recherche</h2>
                <p className="mx-auto mt-2 max-w-md text-sm text-muted-foreground">
                  {searchQuery ? `Aucun résultat pour « ${searchQuery} ». ` : "Essayez une autre combinaison. "}Ajustez les filtres ou affichez tout le catalogue.
                </p>
                <Button type="button" variant="outline" className="mt-6 rounded-lg" onClick={clearAll}>Afficher tout le catalogue</Button>
              </div>
            ) : (
              <motion.div
                initial={reduce ? false : { opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: reduce ? 0.01 : 0.24, ease: [0.16, 1, 0.3, 1] }}
                className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4 lg:gap-5"
              >
                {filtered.map((product) => <ProductCard key={product.id} product={product} showQuickBuy={false} />)}
              </motion.div>
            )}
          </div>
        </section>
      </main>

      <FooterSection showContactCta={false} />

      <Sheet open={mobileFiltersOpen} onOpenChange={setMobileFiltersOpen}>
        <SheetContent side="bottom" className="max-h-[85vh] rounded-t-2xl border-border bg-background">
          <SheetHeader className="text-left"><SheetTitle>Filtrer les produits</SheetTitle></SheetHeader>
          <div className="mt-6"><FilterControls searchParams={searchParams} setSearchParams={setSearchParams} idPrefix="mobile-marketplace" /></div>
        </SheetContent>
      </Sheet>
    </div>
  );
};

export default Boutique;

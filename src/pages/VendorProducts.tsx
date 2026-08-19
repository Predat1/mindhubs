import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { useQueryClient } from "@tanstack/react-query";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import DashboardSkeleton from "@/components/dashboard/DashboardSkeleton";
import VendorGuard from "@/components/dashboard/VendorGuard";
import SEO from "@/components/SEO";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useVendorProducts } from "@/hooks/useVendors";
import { useSaveProductPublication, useVendorProductPublications } from "@/hooks/useProductPublications";
import { useVendorProductStats } from "@/hooks/useVendorOrders";
import { useVendorSubscription } from "@/hooks/useSubscription";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { Plus, Search, Pencil, Trash2, Eye, ShoppingCart, Package, Copy, Zap, SlidersHorizontal, LayoutGrid, List as ListIcon, Store, Globe, EyeOff } from "lucide-react";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { isDemoMode } from "@/lib/demoMode";

type ProductFilterStatus = "all" | "published" | "draft";
type ProductFilterChannel = "all" | "storefront" | "marketplace";
type ProductSort = "recent" | "sales" | "views" | "alpha";
type ProductStatsRow = { product_id: string; total_views?: number | null; total_purchases?: number | null };

const VendorProductsInner = ({ vendorId, shopName, shopUrl }: { vendorId: string; shopName: string; shopUrl: string }) => {
  const { data: products = [], refetch, isLoading: productsLoading } = useVendorProducts(vendorId);
  const { data: publications = [] } = useVendorProductPublications(vendorId);
  const savePublication = useSaveProductPublication(vendorId);
  const { data: stats = [] } = useVendorProductStats(products?.map((p) => p.id) || []);
  const { canAddProduct, maxProducts, plan } = useVendorSubscription(vendorId);
  const storefrontDefaultVisible = publications.length === 0;
  const queryClient = useQueryClient();
  const [search, setSearch] = useState("");
  const [sortBy, setSortBy] = useState<ProductSort>("recent");
  const [filterStatus, setFilterStatus] = useState<ProductFilterStatus>("all");
  const [filterChannel, setFilterChannel] = useState<ProductFilterChannel>("all");
  const [deleteTarget, setDeleteTarget] = useState<{ id: string; title: string } | null>(null);

  const statsMap = useMemo(() => {
    const map: Record<string, { views: number; sales: number }> = {};
    const safeStats = (Array.isArray(stats) ? stats : []) as ProductStatsRow[];
    
    safeStats.forEach((s) => {
      if (s && s.product_id) {
        map[s.product_id] = { 
          views: s.total_views || 0, 
          sales: s.total_purchases || 0 
        };
      }
    });
    return map;
  }, [stats]);

  const publicationMap = useMemo(() => {
    const map: Record<string, { storefront?: string; marketplace?: string }> = {};
    publications.forEach((publication) => {
      map[publication.product_id] = {
        ...map[publication.product_id],
        [publication.channel]: publication.status,
      };
    });
    return map;
  }, [publications]);

  const setChannelStatus = async (productId: string, channel: "storefront" | "marketplace") => {
    const current = publicationMap[productId]?.[channel];
    const isVisible = current === "published" || current === "pending_review" || (channel === "storefront" && storefrontDefaultVisible);
    try {
      await savePublication.mutateAsync({
        product_id: productId,
        channel,
        status: isVisible ? "hidden" : channel === "marketplace" ? "pending_review" : "published",
        published_at: isVisible ? null : new Date().toISOString(),
      });
      toast({
        title: isVisible ? "Canal masqué" : channel === "marketplace" ? "Produit envoyé en revue" : "Produit visible dans votre boutique",
        description: channel === "marketplace" && !isVisible ? "La marketplace vérifiera votre fiche avant sa mise en avant." : undefined,
      });
    } catch (error) {
      toast({ title: "Canal indisponible", description: (error as Error).message, variant: "destructive" });
    }
  };

  const confirmDelete = async () => {
    if (!deleteTarget) return;
    const { error } = await supabase.from("products").delete().eq("id", deleteTarget.id).eq("vendor_id", vendorId);
    if (error) {
      toast({ title: "Erreur", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Produit supprimé avec succès" });
      refetch();
      queryClient.invalidateQueries({ queryKey: ["products"] });
      queryClient.invalidateQueries({ queryKey: ["vendor-products"] });
    }
    setDeleteTarget(null);
  };

  const copyLink = (id: string) => {
    const url = `${window.location.origin}/produit/${id}`;
    navigator.clipboard.writeText(url);
    toast({ title: "Lien de vente copié ✓", description: "Vous pouvez maintenant le partager." });
  };

  const filtered = useMemo(() => {
    const arr = (products || []).filter((p) => {
      const matchSearch = p.title.toLowerCase().includes(search.toLowerCase());
      const matchStatus = filterStatus === "all" || p.status === filterStatus;
          const channelState = publicationMap[p.id] || {};
          const channelVisible = channelState[filterChannel] === "published" || channelState[filterChannel] === "pending_review" || (filterChannel === "storefront" && storefrontDefaultVisible);
          const matchChannel = filterChannel === "all" || channelVisible;
      return matchSearch && matchStatus && matchChannel;
    });
    arr.sort((a, b) => {
      if (sortBy === "alpha") return a.title.localeCompare(b.title);
      if (sortBy === "sales") return (statsMap[b.id]?.sales || 0) - (statsMap[a.id]?.sales || 0);
      if (sortBy === "views") return (statsMap[b.id]?.views || 0) - (statsMap[a.id]?.views || 0);
      const da = a.created_at ? new Date(a.created_at).getTime() : 0;
      const db = b.created_at ? new Date(b.created_at).getTime() : 0;
      return db - da;
    });
    return arr;
  }, [products, search, filterStatus, filterChannel, sortBy, statsMap, publicationMap, storefrontDefaultVisible]);

  return (
    <DashboardLayout variant="vendor" title="Gestion des Produits" shopName={shopName} shopUrl={shopUrl}>
      <SEO title="Mes Produits — MindHubs" description="Gérez votre catalogue de formations et produits digitaux." path="/dashboard/products" />

      <div className="mx-auto max-w-6xl space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h2 className="text-2xl font-black text-foreground sm:text-3xl tracking-tighter">Catalogue Expert</h2>
            <p className="mt-1 text-sm text-muted-foreground font-medium">
              {products.length} produit{products.length > 1 ? "s" : ""} disponible{products.length > 1 ? "s" : ""} dans votre boutique.
            </p>
          </div>
          <div className="flex items-center gap-3">
            {!canAddProduct && maxProducts !== -1 && !isDemoMode && (
              <p className="text-[10px] font-black uppercase text-destructive bg-destructive/10 px-3 py-2 rounded-xl border border-destructive/20">
                Limite {plan} atteinte ({products.length}/{maxProducts})
              </p>
            )}
            {isDemoMode && !canAddProduct ? <p className="text-[10px] font-medium text-muted-foreground">Création désactivée en mode démo</p> : null}
            <Button asChild disabled={!canAddProduct} className={`rounded-2xl h-12 px-6 font-black gap-2 ${!canAddProduct ? 'opacity-50 cursor-not-allowed grayscale' : 'btn-glow'}`}>
              <Link to={canAddProduct ? "/dashboard/new-product" : "/pricing"}>
                {canAddProduct ? <Plus size={18} /> : <Zap size={18} />} 
                {canAddProduct ? "Ajouter un produit" : isDemoMode ? "Mode démo" : "Upgrader pour ajouter"}
              </Link>
            </Button>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <div className="relative flex-1 min-w-[240px] max-w-md">
            <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Rechercher un produit..."
              className="h-11 rounded-xl pl-11"
            />
          </div>
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" className="h-11 rounded-xl gap-2"><SlidersHorizontal size={15} /> Filtres</Button>
            </PopoverTrigger>
            <PopoverContent align="end" className="w-72 space-y-4 rounded-xl">
              <div>
                <p className="mb-2 text-xs font-semibold">Statut</p>
                <Select value={filterStatus} onValueChange={(v) => setFilterStatus(v as ProductFilterStatus)}>
                  <SelectTrigger className="h-10 rounded-lg"><SelectValue placeholder="Statut" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Tous les statuts</SelectItem>
                    <SelectItem value="published">Publiés</SelectItem>
                    <SelectItem value="draft">Brouillons</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <p className="mb-2 text-xs font-semibold">Canal</p>
                <Select value={filterChannel} onValueChange={(v) => setFilterChannel(v as ProductFilterChannel)}>
                  <SelectTrigger className="h-10 rounded-lg"><SelectValue placeholder="Canal" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Tous les canaux</SelectItem>
                    <SelectItem value="storefront">Ma boutique</SelectItem>
                    <SelectItem value="marketplace">Marketplace</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <p className="mb-2 text-xs font-semibold">Trier par</p>
                <Select value={sortBy} onValueChange={(v) => setSortBy(v as ProductSort)}>
                  <SelectTrigger className="h-10 rounded-lg"><SelectValue placeholder="Trier" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="recent">Plus récents</SelectItem>
                    <SelectItem value="sales">Plus de ventes</SelectItem>
                    <SelectItem value="views">Plus de vues</SelectItem>
                    <SelectItem value="alpha">Alphabétique</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </PopoverContent>
          </Popover>
        </div>

        {productsLoading ? (
          <DashboardSkeleton variant="cards" count={3} />
        ) : filtered.length === 0 ? (
          <div className="rounded-[3rem] border-2 border-dashed border-white/5 bg-card/30 py-24 text-center space-y-6">
            <div className="h-20 w-20 bg-muted/40 rounded-full flex items-center justify-center mx-auto text-muted-foreground opacity-50">
              <Package size={40} />
            </div>
            <div className="space-y-2">
               <p className="text-lg font-black">{search ? "Aucun produit correspondant" : "Votre boutique est vide"}</p>
               <p className="text-sm text-muted-foreground max-w-xs mx-auto">
                 {search ? "Essayez de modifier vos mots-clés." : "Commencez par ajouter votre premier produit digital dès maintenant."}
               </p>
            </div>
            {!search && (
              <Button asChild disabled={!canAddProduct} className={`rounded-2xl h-12 px-8 font-black ${!canAddProduct ? 'opacity-50 grayscale' : ''}`}>
                <Link to={canAddProduct ? "/dashboard/new-product" : "/pricing"}>
                  {canAddProduct ? <Plus size={18} /> : <Zap size={18} />} 
                  {canAddProduct ? "Créer mon premier produit" : "Upgrader mon plan"}
                </Link>
              </Button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 pb-12">
            {filtered.map((p) => {
              const s = statsMap[p.id] || { views: 0, sales: 0 };
              return (
                <div key={p.id} className="group overflow-hidden rounded-[2.5rem] border border-white/5 bg-card/50 backdrop-blur-md transition-all duration-300 hover:border-primary/40 hover:shadow-2xl hover:shadow-primary/5 hover:-translate-y-1">
                  <div className="aspect-video overflow-hidden bg-muted relative">
                    <img src={p.image} alt={p.title} className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110" />
                    <div className="absolute inset-0 bg-gradient-to-t from-background/60 to-transparent" />
                  </div>
                  <div className="p-6 space-y-4">
                    <div>
                       <p className="truncate text-base font-black text-foreground tracking-tight">{p.title}</p>
                       <div className="mt-2 flex items-baseline gap-2">
                         <span className="text-xl font-black text-primary">{p.price}</span>
                         {p.oldPrice && p.oldPrice !== p.price && (
                           <span className="text-xs text-muted-foreground line-through opacity-60">{p.oldPrice}</span>
                         )}
                       </div>
                    </div>

                    <div className="flex flex-wrap gap-2">
                      {([
                        { channel: "storefront" as const, label: "Boutique", icon: Store },
                        { channel: "marketplace" as const, label: "Marketplace", icon: Globe },
                      ]).map(({ channel, label, icon: Icon }) => {
                        const status = publicationMap[p.id]?.[channel];
                        const visible = status === "published" || status === "pending_review" || (channel === "storefront" && storefrontDefaultVisible);
                        return (
                          <button
                            key={channel}
                            type="button"
                            onClick={() => setChannelStatus(p.id, channel)}
                            disabled={savePublication.isPending}
                            className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[10px] font-bold transition ${visible ? "border-primary/30 bg-primary/10 text-primary" : "border-border bg-muted/30 text-muted-foreground hover:border-primary/30"}`}
                            title={visible ? `Masquer de ${label}` : `Publier dans ${label}`}
                          >
                            {visible ? <Icon size={11} /> : <EyeOff size={11} />}
                            {label}: {status === "pending_review" ? "En revue" : visible ? "Publié" : "Masqué"}
                          </button>
                        );
                      })}
                    </div>
                    
                    <div className="flex items-center justify-between pt-4 border-t border-white/5">
                       <div className="flex items-center gap-4 text-xs font-black uppercase tracking-widest text-muted-foreground">
                         <span className="flex items-center gap-1.5"><Eye size={14} className="text-primary" /> {s.views}</span>
                         <span className="flex items-center gap-1.5"><ShoppingCart size={14} className="text-success" /> {s.sales}</span>
                       </div>
                       <div className="flex items-center gap-1">
                         <Button variant="ghost" size="icon" onClick={() => copyLink(p.id)} title="Copier le lien de vente" className="rounded-xl hover:bg-primary/10 hover:text-primary">
                           <Copy size={16} />
                         </Button>
                         <Button asChild variant="ghost" size="icon" title="Modifier le produit" className="rounded-xl hover:bg-primary/10 hover:text-primary">
                           <Link to={`/dashboard/edit-product/${p.id}`}><Pencil size={16} /></Link>
                         </Button>
                         <Button variant="ghost" size="icon" onClick={() => setDeleteTarget({ id: p.id, title: p.title })} title="Supprimer" className="rounded-xl hover:bg-destructive/10 hover:text-destructive">
                           <Trash2 size={16} />
                         </Button>
                       </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      <AlertDialog open={!!deleteTarget} onOpenChange={(open) => !open && setDeleteTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Supprimer ce produit ?</AlertDialogTitle>
            <AlertDialogDescription>
              <span className="font-semibold text-foreground">{deleteTarget?.title}</span> sera supprimé définitivement. Cette action est irréversible.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Annuler</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Supprimer
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </DashboardLayout>
  );
};

const VendorProducts = () => (
  <VendorGuard>
    {(vendor) => <VendorProductsInner vendorId={vendor.id} shopName={vendor.shop_name} shopUrl={`/store/${vendor.username}`} />}
  </VendorGuard>
);

export default VendorProducts;

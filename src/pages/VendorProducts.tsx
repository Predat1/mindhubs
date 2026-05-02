import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { useQueryClient } from "@tanstack/react-query";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import VendorGuard from "@/components/dashboard/VendorGuard";
import SEO from "@/components/SEO";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useVendorProducts } from "@/hooks/useVendors";
import { useVendorProductStats } from "@/hooks/useVendorOrders";
import { useVendorSubscription } from "@/hooks/useSubscription";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { Plus, Search, Pencil, Trash2, Eye, ShoppingCart, Package, Copy } from "lucide-react";

const VendorProductsInner = ({ vendorId, shopName, shopUrl }: { vendorId: string; shopName: string; shopUrl: string }) => {
  const { data: products = [], refetch, isLoading: productsLoading } = useVendorProducts(vendorId);
  const { data: stats = [] } = useVendorProductStats(products?.map((p) => p.id) || []);
  const { canAddProduct, maxProducts, plan } = useVendorSubscription(vendorId);
  const queryClient = useQueryClient();
  const [search, setSearch] = useState("");

  const statsMap = useMemo(() => {
    const map: Record<string, { views: number; sales: number }> = {};
    const safeStats = Array.isArray(stats) ? stats : [];
    
    safeStats.forEach((s: any) => {
      if (s && s.product_id) {
        map[s.product_id] = { 
          views: s.total_views || 0, 
          sales: s.total_purchases || 0 
        };
      }
    });
    return map;
  }, [stats]);

  const handleDelete = async (id: string) => {
    if (!confirm("Voulez-vous vraiment supprimer ce produit ? Cette action est irréversible.")) return;
    
    const { error } = await supabase.from("products").delete().eq("id", id).eq("vendor_id", vendorId);
    if (error) {
      toast({ title: "Erreur", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Produit supprimé avec succès" });
      refetch();
      queryClient.invalidateQueries({ queryKey: ["products"] });
      queryClient.invalidateQueries({ queryKey: ["vendor-products"] });
    }
  };

  const copyLink = (id: string) => {
    const url = `${window.location.origin}/produit/${id}`;
    navigator.clipboard.writeText(url);
    toast({ title: "Lien de vente copié ✓", description: "Vous pouvez maintenant le partager." });
  };

  const filtered = (products || []).filter((p) => 
    p.title.toLowerCase().includes(search.toLowerCase())
  );

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
            {!canAddProduct && (
              <p className="text-[10px] font-black uppercase text-rose-500 bg-rose-500/10 px-3 py-2 rounded-xl border border-rose-500/20">
                Limite {plan} atteinte ({products.length}/{maxProducts})
              </p>
            )}
            <Button asChild disabled={!canAddProduct} className={`rounded-2xl h-12 px-6 font-black gap-2 ${!canAddProduct ? 'opacity-50 cursor-not-allowed grayscale' : 'btn-glow'}`}>
              <Link to={canAddProduct ? "/dashboard/new-product" : "/pricing"}>
                {canAddProduct ? <Plus size={18} /> : <Zap size={18} />} 
                {canAddProduct ? "Ajouter un produit" : "Upgrader pour ajouter"}
              </Link>
            </Button>
          </div>
        </div>

        <div className="relative max-w-md">
          <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <Input 
            value={search} 
            onChange={(e) => setSearch(e.target.value)} 
            placeholder="Rechercher une formation..." 
            className="pl-11 h-12 rounded-2xl border-white/5 bg-card/50 backdrop-blur-sm" 
          />
        </div>

        {productsLoading ? (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
             {[...Array(3)].map((_, i) => (
               <div key={i} className="h-64 rounded-3xl bg-muted/20 animate-pulse border border-white/5" />
             ))}
          </div>
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
                    
                    <div className="flex items-center justify-between pt-4 border-t border-white/5">
                       <div className="flex items-center gap-4 text-xs font-black uppercase tracking-widest text-muted-foreground">
                         <span className="flex items-center gap-1.5"><Eye size={14} className="text-primary" /> {s.views}</span>
                         <span className="flex items-center gap-1.5"><ShoppingCart size={14} className="text-emerald-500" /> {s.sales}</span>
                       </div>
                       <div className="flex items-center gap-1">
                         <Button variant="ghost" size="icon" onClick={() => copyLink(p.id)} title="Copier le lien de vente" className="rounded-xl hover:bg-primary/10 hover:text-primary">
                           <Copy size={16} />
                         </Button>
                         <Button asChild variant="ghost" size="icon" title="Modifier le produit" className="rounded-xl hover:bg-primary/10 hover:text-primary">
                           <Link to={`/dashboard/edit-product/${p.id}`}><Pencil size={16} /></Link>
                         </Button>
                         <Button variant="ghost" size="icon" onClick={() => handleDelete(p.id)} title="Supprimer" className="rounded-xl hover:bg-destructive/10 hover:text-destructive">
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
    </DashboardLayout>
  );
};

const VendorProducts = () => (
  <VendorGuard>
    {(vendor) => <VendorProductsInner vendorId={vendor.id} shopName={vendor.shop_name} shopUrl={`/store/${vendor.username}`} />}
  </VendorGuard>
);

export default VendorProducts;

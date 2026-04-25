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
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { Plus, Search, Pencil, Trash2, Copy, Eye, ShoppingCart, Package } from "lucide-react";

const VendorProductsInner = ({ vendorId, shopName, shopUrl }: { vendorId: string; shopName: string; shopUrl: string }) => {
  const { data: products = [], refetch } = useVendorProducts(vendorId);
  const { data: stats = [] } = useVendorProductStats(products.map((p) => p.id));
  const queryClient = useQueryClient();
  const [search, setSearch] = useState("");

  const statsMap = useMemo(() => {
    const m: Record<string, { views: number; purchases: number }> = {};
    (stats as unknown as Array<{ product_id: string; total_views: number | null; total_purchases: number | null }>).forEach((s) => {
      m[s.product_id] = { views: s.total_views ?? 0, purchases: s.total_purchases ?? 0 };
    });
    return m;
  }, [stats]);

  const filtered = useMemo(
    () => products.filter((p) => p.title.toLowerCase().includes(search.toLowerCase())),
    [products, search]
  );

  const handleDelete = async (id: string, title: string) => {
    if (!confirm(`Supprimer "${title}" ?`)) return;
    const { error } = await supabase.from("products").delete().eq("id", id);
    if (error) {
      toast({ title: "Erreur", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Produit supprimé" });
      refetch();
      queryClient.invalidateQueries({ queryKey: ["products"] });
    }
  };

  const copyLink = (id: string) => {
    navigator.clipboard.writeText(`${window.location.origin}/produit/${id}`);
    toast({ title: "Lien copié ✓" });
  };

  return (
    <DashboardLayout variant="vendor" title="Produits" shopName={shopName} shopUrl={shopUrl}>
      <SEO title="Produits — Vendeur" description="Gérez votre catalogue" path="/dashboard/products" keywords="gestion produits, dashboard vendeur, mindhub products, catalogue expert" />

      <div className="mx-auto max-w-6xl space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="text-2xl font-bold text-foreground sm:text-3xl">Mes produits</h2>
            <p className="mt-1 text-sm text-muted-foreground">{products.length} produit{products.length > 1 ? "s" : ""} dans votre boutique.</p>
          </div>
          <Button asChild className="rounded-full">
            <Link to="/dashboard/new-product"><Plus size={16} /> Ajouter un produit</Link>
          </Button>
        </div>

        <div className="relative max-w-md">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <Input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Rechercher un produit…" className="pl-9" />
        </div>

        {filtered.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-border bg-card py-16 text-center">
            <Package className="mx-auto mb-3 text-muted-foreground" size={36} />
            <p className="text-sm text-muted-foreground">{search ? "Aucun résultat." : "Aucun produit pour l'instant."}</p>
            {!search && (
              <Button asChild className="mt-4 rounded-full">
                <Link to="/dashboard/new-product"><Plus size={14} /> Créer mon premier produit</Link>
              </Button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {filtered.map((p) => {
              const s = statsMap[p.id] || { views: 0, purchases: 0 };
              return (
                <div key={p.id} className="group overflow-hidden rounded-2xl border border-border bg-card transition hover:border-primary/40">
                  <div className="aspect-video overflow-hidden bg-muted">
                    <img src={p.image} alt={p.title} className="h-full w-full object-cover transition group-hover:scale-105" />
                  </div>
                  <div className="p-4">
                    <p className="truncate text-sm font-bold text-foreground">{p.title}</p>
                    <div className="mt-1 flex items-baseline gap-2">
                      <span className="text-base font-bold text-primary">{p.price}</span>
                      {p.oldPrice && p.oldPrice !== p.price && (
                        <span className="text-xs text-muted-foreground line-through">{p.oldPrice}</span>
                      )}
                    </div>
                    <div className="mt-3 flex items-center gap-3 text-xs text-muted-foreground">
                      <span className="flex items-center gap-1"><Eye size={12} /> {s.views}</span>
                      <span className="flex items-center gap-1"><ShoppingCart size={12} /> {s.purchases}</span>
                    </div>
                    <div className="mt-4 flex gap-1.5">
                      <Button asChild variant="outline" size="sm" className="flex-1 rounded-full">
                        <Link to={`/dashboard/edit-product/${p.id}`}><Pencil size={12} /> Modifier</Link>
                      </Button>
                      <Button onClick={() => copyLink(p.id)} variant="ghost" size="icon" className="h-8 w-8 shrink-0">
                        <Copy size={14} />
                      </Button>
                      <Button onClick={() => handleDelete(p.id, p.title)} variant="ghost" size="icon" className="h-8 w-8 shrink-0 text-destructive hover:text-destructive">
                        <Trash2 size={14} />
                      </Button>
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

import { useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import Navbar from "@/components/Navbar";
import FooterSection from "@/components/FooterSection";
import SEO from "@/components/SEO";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { useCurrentVendor, useVendorProducts } from "@/hooks/useVendors";
import { supabase } from "@/integrations/supabase/client";
import { Plus, ExternalLink, Pencil, Trash2, Eye, ShoppingBag, Package } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { useQueryClient } from "@tanstack/react-query";

const VendorDashboard = () => {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const { data: vendor, isLoading: vendorLoading } = useCurrentVendor();
  const { data: products = [], refetch } = useVendorProducts(vendor?.id);
  const queryClient = useQueryClient();

  useEffect(() => {
    if (!loading && !user) navigate("/mon-compte");
    if (!loading && !vendorLoading && user && !vendor) navigate("/become-a-seller");
  }, [loading, user, vendor, vendorLoading, navigate]);

  // Aggregate stats
  const productIds = products.map((p) => p.id);
  const { data: stats } = useQuery({
    queryKey: ["vendor-stats", vendor?.id, productIds.join(",")],
    queryFn: async () => {
      if (productIds.length === 0) return { views: 0, purchases: 0 };
      const { data } = await supabase
        .from("product_stats")
        .select("total_views,total_purchases")
        .in("product_id", productIds);
      return {
        views: (data || []).reduce((s: number, r: any) => s + (r.total_views || 0), 0),
        purchases: (data || []).reduce((s: number, r: any) => s + (r.total_purchases || 0), 0),
      };
    },
    enabled: productIds.length > 0,
  });

  const handleDelete = async (id: string) => {
    if (!confirm("Supprimer ce produit ?")) return;
    const { error } = await supabase.from("products").delete().eq("id", id);
    if (error) {
      toast({ title: "Erreur", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Produit supprimé" });
      refetch();
      queryClient.invalidateQueries({ queryKey: ["products"] });
    }
  };

  if (loading || vendorLoading || !vendor) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="container mx-auto px-4 pt-32"><div className="stat-card h-48 rounded-2xl animate-pulse" /></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <SEO title="Dashboard vendeur — MindHub" description="Gérez vos produits et suivez vos ventes." path="/dashboard" />
      <Navbar />

      <section className="container mx-auto px-4 pt-28 sm:pt-32 pb-12 max-w-5xl">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-6">
          <div>
            <h1 className="text-2xl font-bold text-foreground">{vendor.shop_name}</h1>
            <p className="text-xs text-muted-foreground">Tableau de bord vendeur</p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button asChild variant="outline" size="sm">
              <Link to={`/store/${vendor.username}`}>
                <ExternalLink size={14} /> Ma boutique
              </Link>
            </Button>
            <Button asChild size="sm">
              <Link to="/dashboard/new-product">
                <Plus size={14} /> Ajouter un produit
              </Link>
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-3 mb-6">
          {[
            { label: "Produits", value: products.length, icon: Package },
            { label: "Vues totales", value: stats?.views ?? 0, icon: Eye },
            { label: "Achats", value: stats?.purchases ?? 0, icon: ShoppingBag },
          ].map(({ label, value, icon: Icon }) => (
            <div key={label} className="stat-card rounded-xl p-4">
              <div className="flex items-center gap-2 text-muted-foreground text-xs mb-1">
                <Icon size={14} /> {label}
              </div>
              <p className="text-2xl font-bold text-foreground">{value}</p>
            </div>
          ))}
        </div>

        <div className="stat-card rounded-2xl p-4 sm:p-6">
          <h2 className="text-base font-bold text-foreground mb-4">Mes produits</h2>
          {products.length === 0 ? (
            <div className="text-center py-12 space-y-3">
              <p className="text-sm text-muted-foreground">Vous n'avez pas encore de produit.</p>
              <Button asChild size="sm"><Link to="/dashboard/new-product"><Plus size={14} /> Ajouter mon premier produit</Link></Button>
            </div>
          ) : (
            <div className="space-y-2">
              {products.map((p) => (
                <div key={p.id} className="flex items-center gap-3 p-2.5 rounded-xl bg-muted/30 border border-border">
                  <img src={p.image} alt={p.title} className="w-12 h-12 rounded-lg object-cover shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-foreground truncate">{p.title}</p>
                    <p className="text-xs text-accent font-bold">{p.price}</p>
                  </div>
                  <div className="flex gap-1">
                    <Button asChild variant="ghost" size="icon" className="h-8 w-8">
                      <Link to={`/dashboard/edit-product/${p.id}`}><Pencil size={14} /></Link>
                    </Button>
                    <Button onClick={() => handleDelete(p.id)} variant="ghost" size="icon" className="h-8 w-8 text-destructive hover:text-destructive">
                      <Trash2 size={14} />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      <FooterSection />
    </div>
  );
};

export default VendorDashboard;

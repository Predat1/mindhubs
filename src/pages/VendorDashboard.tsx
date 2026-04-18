import { useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import SEO from "@/components/SEO";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { useCurrentVendor, useVendorProducts } from "@/hooks/useVendors";
import { supabase } from "@/integrations/supabase/client";
import {
  Plus, Workflow, Percent, ShoppingBag, Users, DollarSign, Info, Pencil, Trash2,
  Youtube, MessageCircle, Lightbulb, ExternalLink, Package, Copy,
} from "lucide-react";
import { toast } from "@/hooks/use-toast";

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

  // Vendor orders (orders containing one of his products)
  const { data: orderStats } = useQuery({
    queryKey: ["vendor-orders", productIds.join(",")],
    queryFn: async () => {
      if (productIds.length === 0) return { revenue: 0, customers: 0, last7: 0 };
      const { data } = await supabase
        .from("orders")
        .select("total_price,customer_email,items,created_at,status");
      const valid = (data || []).filter((o: any) =>
        o.status !== "cancelled" &&
        Array.isArray(o.items) &&
        o.items.some((i: any) => productIds.includes(i.product_id))
      );
      const sevenDaysAgo = Date.now() - 7 * 24 * 3600 * 1000;
      return {
        revenue: valid.reduce((s: number, o: any) => s + (o.total_price || 0), 0),
        customers: new Set(valid.map((o: any) => o.customer_email)).size,
        last7: valid
          .filter((o: any) => new Date(o.created_at).getTime() > sevenDaysAgo)
          .reduce((s: number, o: any) => s + (o.total_price || 0), 0),
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

  const copyLink = (id: string) => {
    navigator.clipboard.writeText(`${window.location.origin}/produit/${id}`);
    toast({ title: "Lien copié ✓" });
  };

  if (loading || vendorLoading || !vendor) {
    return (
      <div className="min-h-screen bg-muted/30 flex items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
      </div>
    );
  }

  const firstName = vendor.shop_name.split(" ")[0];
  const revenue = orderStats?.revenue ?? 0;
  const last7 = orderStats?.last7 ?? 0;
  const customers = orderStats?.customers ?? 0;

  // Top products by purchases
  const topProducts = [...products]
    .map((p) => ({ ...p, _purchases: 0 }))
    .slice(0, 5);

  return (
    <DashboardLayout
      variant="vendor"
      title="Aperçu"
      shopName={vendor.shop_name}
      shopUrl={`/store/${vendor.username}`}
    >
      <SEO title="Dashboard vendeur — MIND✦HUB" description="Pilotez votre boutique." path="/dashboard" />

      <div className="mx-auto max-w-6xl space-y-8">
        {/* Greeting */}
        <div>
          <h2 className="flex items-center gap-3 text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
            Bonjour {firstName} !
            <span className="text-3xl">☀️</span>
          </h2>
          <p className="mt-2 flex items-center gap-2 text-sm text-muted-foreground">
            <span>🌅</span>
            Un nouveau départ avec des possibilités infinies. Quelle sera votre première action ?
          </p>
        </div>

        {/* Quick actions */}
        <div className="flex flex-wrap gap-3">
          <Button asChild variant="outline" className="rounded-full">
            <Link to="/dashboard/new-product">
              <Plus size={16} /> Ajouter un produit
            </Link>
          </Button>
          <Button variant="outline" className="rounded-full" onClick={() => toast({ title: "Bientôt disponible" })}>
            <Workflow size={16} /> Créer un workflow
          </Button>
          <Button variant="outline" className="rounded-full" onClick={() => toast({ title: "Bientôt disponible" })}>
            <Percent size={16} /> Créer une réduction
          </Button>
        </div>

        {/* Stats cards */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {[
            { icon: DollarSign, label: "Revenu total", value: `${revenue.toLocaleString()} CFA`, info: true },
            { icon: ShoppingBag, label: "7 derniers jours", value: `${last7.toLocaleString()} CFA`, info: true },
            { icon: Users, label: "Nombre total de clients", value: customers.toLocaleString() },
          ].map(({ icon: Icon, label, value, info }) => (
            <div key={label} className="rounded-2xl border border-border bg-card p-5 sm:p-6">
              <div className="mb-4 flex h-9 w-9 items-center justify-center rounded-lg bg-muted text-muted-foreground">
                <Icon size={18} />
              </div>
              <div className="flex items-end justify-between">
                <p className="text-2xl font-bold text-foreground sm:text-3xl">{value}</p>
                {info && <Info size={14} className="text-muted-foreground" />}
              </div>
              <p className="mt-1 text-xs text-muted-foreground">{label}</p>
            </div>
          ))}
        </div>

        {/* Top products */}
        <section className="rounded-2xl border border-border bg-card p-5 sm:p-6">
          <div className="mb-5 flex items-start justify-between gap-3">
            <div>
              <h3 className="text-base font-bold text-foreground">Produits les plus vendus</h3>
              <p className="text-xs text-muted-foreground">Vos produits les plus vendus basés sur le total des ventes</p>
            </div>
            <Button asChild variant="outline" size="sm" className="rounded-full">
              <Link to="/dashboard">Voir tout</Link>
            </Button>
          </div>

          {products.length === 0 ? (
            <div className="rounded-xl bg-muted/30 py-12 text-center">
              <Package className="mx-auto mb-3 text-muted-foreground" size={32} />
              <p className="text-sm text-muted-foreground">Vous n'avez pas encore de produit.</p>
              <Button asChild size="sm" className="mt-4 rounded-full">
                <Link to="/dashboard/new-product">
                  <Plus size={14} /> Ajouter mon premier produit
                </Link>
              </Button>
            </div>
          ) : (
            <div className="space-y-2">
              {topProducts.map((p) => (
                <div
                  key={p.id}
                  className="flex items-center gap-3 rounded-xl border border-border bg-background/50 p-3 transition hover:border-primary/30"
                >
                  <img src={p.image} alt={p.title} className="h-12 w-12 shrink-0 rounded-lg object-cover" />
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <p className="truncate text-sm font-semibold text-foreground">{p.title}</p>
                      <button
                        onClick={() => copyLink(p.id)}
                        className="text-muted-foreground hover:text-foreground"
                        aria-label="Copier le lien"
                      >
                        <Copy size={12} />
                      </button>
                    </div>
                    <p className="text-xs text-muted-foreground">{p.price}</p>
                  </div>
                  <div className="hidden text-right sm:block">
                    <p className="text-sm font-bold text-foreground">{p.price}</p>
                    <p className="text-xs text-muted-foreground">0 Vente</p>
                  </div>
                  <div className="flex gap-1">
                    <Button asChild variant="ghost" size="icon" className="h-8 w-8">
                      <Link to={`/dashboard/edit-product/${p.id}`}>
                        <Pencil size={14} />
                      </Link>
                    </Button>
                    <Button
                      onClick={() => handleDelete(p.id)}
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-destructive hover:text-destructive"
                    >
                      <Trash2 size={14} />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* Community */}
        <section>
          <h3 className="text-base font-bold text-foreground">Communauté</h3>
          <p className="mt-1 text-xs text-muted-foreground">
            Connectez-vous avec des créateurs, apprenez de nouvelles compétences et aidez à façonner l'avenir de MIND✦HUB.
          </p>

          <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {[
              { icon: Youtube, title: "Rejoignez-nous sur Youtube", desc: "Découvrez des vidéos pratiques pour apprendre à utiliser MIND✦HUB", color: "bg-pink-500/15 text-pink-500" },
              { icon: Users, title: "Rejoignez notre Hub", desc: "Rejoignez la communauté d'entraide des créateurs MIND✦HUB", color: "bg-muted text-foreground" },
              { icon: Lightbulb, title: "Partagez vos suggestions", desc: "Vos suggestions nous aident à améliorer MIND✦HUB", color: "bg-yellow-500/15 text-yellow-600" },
              { icon: MessageCircle, title: "Rejoignez-nous sur WhatsApp", desc: "Rejoignez notre canal WhatsApp", color: "bg-green-500/15 text-green-600" },
            ].map(({ icon: Icon, title, desc, color }) => (
              <div
                key={title}
                className="rounded-2xl border border-border bg-card p-5 text-center transition hover:border-primary/30"
              >
                <div className={`mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full ${color}`}>
                  <Icon size={20} />
                </div>
                <h4 className="text-sm font-bold text-foreground">{title}</h4>
                <p className="mt-2 text-xs text-muted-foreground">{desc}</p>
              </div>
            ))}
          </div>
        </section>
      </div>
    </DashboardLayout>
  );
};

export default VendorDashboard;

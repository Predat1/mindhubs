import { useEffect, useMemo } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { motion } from "motion/react";
import SEO from "@/components/SEO";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import { useAuth } from "@/contexts/AuthContext";
import { useCurrentVendor, useVendorProducts } from "@/hooks/useVendors";
import { useVendorOrders } from "@/hooks/useVendorOrders";
import { supabase } from "@/integrations/supabase/client";
import {
  ShoppingBag, Users, DollarSign, Package, Copy,
  Share2 as ShareIcon, Store, Globe
} from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import { useVendorProductPublications } from "@/hooks/useProductPublications";
import { AnimatedNumber } from "@/components/motion/animated-number";

type ProductStatsRow = { product_id: string; total_views?: number | null; total_purchases?: number | null };

const VendorDashboard = () => {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const { data: vendor, isLoading: vendorLoading } = useCurrentVendor();
  const { data: products = [] } = useVendorProducts(vendor?.id);
  const { data: publications = [] } = useVendorProductPublications(vendor?.id);
  const queryClient = useQueryClient();

  useEffect(() => {
    if (!loading && !user) {
      navigate("/mon-compte");
      return;
    }
    // Only redirect to become-a-seller when both auth AND vendor query are fully settled
    // vendor === null (not undefined) means the query completed and truly found nothing
    if (!loading && !vendorLoading && user && vendor === null) {
      navigate("/become-a-seller/start");
    }
  }, [loading, user, vendor, vendorLoading, navigate]);

  // Aggregate stats
  const productIds = useMemo(() => products.map((p) => p.id), [products]);
  const productIdsKey = useMemo(() => productIds.join(","), [productIds]);

  const { data: stats } = useQuery({
    queryKey: ["vendor-stats", vendor?.id, productIdsKey],
    queryFn: async () => {
      if (productIds.length === 0) return { views: 0, purchases: 0, raw: [] };
      const { data } = await supabase
        .from("product_stats")
        .select("product_id,total_views,total_purchases")
        .in("product_id", productIds);
      const rows = (data || []) as ProductStatsRow[];
      return {
        views: rows.reduce((s, r) => s + (r.total_views || 0), 0),
        purchases: rows.reduce((s, r) => s + (r.total_purchases || 0), 0),
        raw: rows
      };
    },
    enabled: productIds.length > 0,
  });

  const { data: orders = [] } = useVendorOrders(vendor?.id, productIds);
  
  const orderStats = useMemo(() => {
    if (!orders || orders.length === 0) {
      return { revenue: 0, customers: 0, last7: 0, prev7: 0, deltaPct: 0, pendingCount: 0 };
    }
    const valid = orders.filter((o) => o.status !== "cancelled");
    const now = Date.now();
    const day = 24 * 3600 * 1000;
    const sevenDaysAgo = now - 7 * day;
    const fourteenDaysAgo = now - 14 * day;

    const last7 = valid
      .filter((o) => new Date(o.created_at).getTime() > sevenDaysAgo)
      .reduce((s, o) => s + (o.vendor_revenue || 0), 0);
    const prev7 = valid
      .filter((o) => {
        const t = new Date(o.created_at).getTime();
        return t > fourteenDaysAgo && t <= sevenDaysAgo;
      })
      .reduce((s, o) => s + (o.vendor_revenue || 0), 0);
    const deltaPct = prev7 > 0 ? Math.round(((last7 - prev7) / prev7) * 100) : last7 > 0 ? 100 : 0;
    const pendingCount = orders.filter((o) => o.status === "pending").length;

    return {
      revenue: valid.reduce((s, o) => s + (o.vendor_revenue || 0), 0),
      customers: new Set(valid.map((o) => o.customer_email)).size,
      last7,
      prev7,
      deltaPct,
      pendingCount,
    };
  }, [orders]);

  // Contextual greeting based on time + business events
  const greeting = useMemo(() => {
    const hour = new Date().getHours();
    if (hour < 5) return "Bonsoir";
    if (hour < 12) return "Bonjour";
    if (hour < 18) return "Bon après-midi";
    return "Bonsoir";
  }, []);

  const contextualMessage = useMemo(() => {
    if (orderStats.pendingCount > 0) {
      return `Vous avez ${orderStats.pendingCount} commande${orderStats.pendingCount > 1 ? "s" : ""} en attente à traiter.`;
    }
    if (orderStats.deltaPct >= 20) {
      return `Vos ventes ont progressé de +${orderStats.deltaPct}% cette semaine.`;
    }
    if (orderStats.deltaPct <= -20) {
      return `Vos ventes sont en baisse. Vérifiez vos fiches, vos canaux de publication et votre lien boutique.`;
    }
    if (products.length === 0) {
      return "Commencez par publier votre premier produit pour lancer votre boutique.";
    }
    return "Voici l'état actuel de votre business sur MindHubs.";
  }, [orderStats, products.length]);

  const copyLink = (username: string) => {
    const url = `${window.location.origin}/store/${username}`;
    navigator.clipboard.writeText(url);
    toast({ title: "Lien de boutique copié ✓" });
  };

  const channelStats = useMemo(() => {
    const marketplaceIds = new Set(publications.filter((p) => p.channel === "marketplace" && (p.status === "published" || p.status === "pending_review")).map((p) => p.product_id));
    const storefrontIds = new Set(publications.filter((p) => p.channel === "storefront" && p.status === "published").map((p) => p.product_id));
    return {
      storefront: storefrontIds.size || (publications.length === 0 ? products.length : 0),
      marketplace: marketplaceIds.size,
    };
  }, [products.length, publications]);

  if (loading || vendorLoading || !vendor) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-background">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-muted border-t-foreground" />
        <p className="text-xs text-muted-foreground">Initialisation MindHubs…</p>
      </div>
    );
  }

  const firstName = vendor?.shop_name ? vendor.shop_name.split(" ")[0] : "Vendeur";
  const revenue = orderStats.revenue || 0;
  const last7 = orderStats.last7 || 0;
  const customers = orderStats.customers || 0;
  const hasOrders = orders.length > 0;

  // Top products by purchases
  const topProducts = [...products]
    .map((p) => {
      const pStats = Array.isArray(stats?.raw) ? stats.raw.find((s) => s.product_id === p.id) : null;
      return { ...p, _purchases: pStats?.total_purchases || 0 };
    })
    .sort((a, b) => b._purchases - a._purchases)
    .slice(0, 5);

  const activationSteps = [
    { label: "Profil boutique", done: Boolean(vendor.description || vendor.avatar_url), href: "/dashboard/settings" },
    { label: "Premier produit", done: products.length > 0, href: "/dashboard/new-product" },
    { label: "Publication marketplace", done: channelStats.marketplace > 0, href: "/dashboard/products" },
  ];

  return (
    <DashboardLayout variant="vendor" title="Vue d'ensemble" shopName={vendor.shop_name} shopUrl={`/store/${vendor.username}`}>
      <SEO title="Dashboard Vendeur — MindHubs" description="Gérez votre empire digital" path="/dashboard" />

      <div className="mx-auto max-w-6xl space-y-8 pb-10">
        {/* Welcome Section */}
        <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
          <div className="space-y-1">
            <h2 className="text-3xl font-semibold tracking-[-0.03em] text-foreground sm:text-4xl">
              {greeting} {firstName}
            </h2>
            <p className="text-sm font-medium text-muted-foreground">
              {contextualMessage}
            </p>
          </div>
          
          {/* Quick link */}
          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="group relative flex max-w-xs cursor-pointer items-center gap-3 rounded-xl border border-border bg-card p-3 transition-colors hover:bg-accent"
            onClick={() => copyLink(vendor.username)}
          >
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-muted text-foreground transition-transform group-hover:scale-[1.03]">
              <ShareIcon size={18} />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-[10px] font-medium uppercase tracking-widest text-muted-foreground">Votre boutique</p>
              <p className="truncate text-xs font-medium text-foreground leading-none">mindhubs.fun/store/{vendor.username}</p>
            </div>
            <Copy size={14} className="text-muted-foreground group-hover:text-primary transition-colors" />
          </motion.div>
        </div>

        {/* Commerce channels and activation */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          <section className="lg:col-span-2 rounded-xl border border-border bg-card p-6">
            <div className="flex items-start justify-between gap-4">
              <div>
                <div className="flex items-center gap-2">
                  <Store size={17} className="text-primary" />
                  <h3 className="text-lg font-semibold tracking-tight">Vos canaux de vente</h3>
                </div>
                <p className="mt-1 text-xs text-muted-foreground">Votre boutique vous appartient. La marketplace vous ouvre une vitrine supplémentaire.</p>
              </div>
              <Link to="/dashboard/products" className="text-[10px] font-black uppercase tracking-widest text-primary hover:underline">Gérer</Link>
            </div>
            <div className="mt-6 grid gap-3 sm:grid-cols-2">
              <div className="rounded-lg border border-border bg-muted/30 p-4">
                <div className="flex items-center justify-between"><Store size={16} className="text-foreground" /><span className="text-2xl font-semibold">{channelStats.storefront}</span></div>
                <p className="mt-3 text-sm font-bold">Ma boutique</p>
                <p className="mt-1 text-[11px] text-muted-foreground">Produits visibles sur votre lien personnel.</p>
              </div>
              <div className="rounded-lg border border-border bg-muted/30 p-4">
                <div className="flex items-center justify-between"><Globe size={16} className="text-foreground" /><span className="text-2xl font-semibold">{channelStats.marketplace}</span></div>
                <p className="mt-3 text-sm font-bold">Marketplace MindHubs</p>
                <p className="mt-1 text-[11px] text-muted-foreground">Produits publiés ou envoyés en revue.</p>
              </div>
            </div>
          </section>

          <aside className="rounded-xl border border-border bg-card p-6">
            <h3 className="text-lg font-semibold tracking-tight">Prochaines étapes</h3>
            <p className="mt-1 text-xs text-muted-foreground">Les actions utiles pour lancer votre boutique.</p>
            <div className="mt-5 space-y-3">
              {activationSteps.map((item) => (
                <Link key={item.label} to={item.href} className="flex items-center gap-3 rounded-xl p-2 transition hover:bg-muted/50">
                  <span className={`flex h-6 w-6 items-center justify-center rounded-md text-xs font-semibold ${item.done ? "bg-muted text-foreground" : "bg-accent text-muted-foreground"}`}>{item.done ? "✓" : "→"}</span>
                  <span className={`text-xs font-medium ${item.done ? "text-muted-foreground line-through" : "text-foreground"}`}>{item.label}</span>
                </Link>
              ))}
            </div>
          </aside>
        </div>

        {/* Show business KPIs once real activity exists; keep the empty state actionable. */}
        {hasOrders ? <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {[
            { 
              icon: DollarSign, 
              label: "Revenu total (Net)", 
              value: <AnimatedNumber value={revenue} suffix=" FCFA" />,
              color: "text-foreground bg-muted",
              extra: null
            },
            { 
              icon: Package, 
              label: "Produits Actifs", 
              value: <AnimatedNumber value={products.length} />,
              color: "text-foreground bg-muted",
              extra: null
            },
            {
              icon: ShoppingBag,
              label: "7 derniers jours",
              value: <AnimatedNumber value={last7} suffix=" FCFA" />,
              color: "text-foreground bg-muted",
              extra: orderStats.deltaPct !== 0 ? (
                <span className={cn(
                  "inline-flex items-center gap-1 mt-2 text-[10px] font-black uppercase tracking-widest",
                  orderStats.deltaPct > 0 ? "text-success" : "text-destructive"
                )}>
                  {orderStats.deltaPct > 0 ? "↑" : "↓"} {Math.abs(orderStats.deltaPct)}% vs semaine préc.
                </span>
              ) : null,
            },
            { icon: Users, label: "Clients totaux", value: <AnimatedNumber value={customers} />, color: "text-foreground bg-muted" },
          ].map(({ icon: Icon, label, value, color, extra }) => (
            <div key={label} className="group flex flex-col justify-between rounded-xl border border-border bg-card p-6 transition-colors hover:bg-accent">
              <div>
                <div className={cn("mb-4 flex h-10 w-10 items-center justify-center rounded-xl transition-transform group-hover:scale-110", color)}>
                  <Icon size={18} />
                </div>
                <div className="space-y-1">
                  <p className="text-2xl font-black text-foreground tracking-tighter">{value}</p>
                  <div className="flex items-center gap-1.5">
                    <p className="text-[9px] font-black uppercase tracking-widest text-muted-foreground opacity-60">{label}</p>
                  </div>
                </div>
              </div>
              {extra}
            </div>
          ))}
        </div> : (
          <section className="flex flex-col gap-4 rounded-xl border border-dashed border-border bg-muted/20 p-5 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-start gap-3">
              <div className="grid size-10 shrink-0 place-items-center rounded-xl bg-muted text-muted-foreground"><ShoppingBag className="size-5" aria-hidden="true" /></div>
              <div>
                <h3 className="text-sm font-semibold">Votre tableau de bord est prêt</h3>
                <p className="mt-1 text-sm text-muted-foreground">Les ventes et indicateurs apparaîtront ici dès votre première commande.</p>
              </div>
            </div>
            <Link to="/dashboard/products" className="inline-flex h-10 shrink-0 items-center justify-center rounded-lg bg-primary px-4 text-sm font-medium text-primary-foreground">Préparer un produit</Link>
          </section>
        )}

        {/* Content Section */}
        <div className="grid grid-cols-1 gap-6">
           {/* Top products */}
           <section className="rounded-xl border border-border bg-card p-8">
             <div className="mb-8 flex items-center justify-between">
                <div className="flex items-center gap-2">
                   <Package size={18} className="text-foreground" />
                   <h3 className="text-lg font-semibold tracking-tight">Vos produits</h3>
                </div>
                <Link to="/dashboard/products" className="text-xs font-black uppercase tracking-widest text-primary hover:underline">Voir tout</Link>
             </div>

             <div className="space-y-4">
               {topProducts.length > 0 ? (
                 topProducts.map((p, idx) => (
                   <div key={p.id} className="group flex items-center gap-4 rounded-2xl border border-border bg-muted/30 p-4 transition-all hover:border-primary/20 hover:bg-muted/50">
                     <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-xl bg-background border border-border shadow-sm">
                       <img src={p.image} className="h-full w-full object-cover transition-transform group-hover:scale-110" />
                       <div className="absolute top-0 left-0 h-4 w-4 bg-primary text-primary-foreground text-[8px] font-black flex items-center justify-center rounded-br-lg">{idx + 1}</div>
                     </div>
                     <div className="min-w-0 flex-1">
                       <p className="truncate text-sm font-black text-foreground leading-tight">{p.title}</p>
                       <p className="text-[10px] text-muted-foreground font-medium uppercase tracking-widest mt-0.5">{p.category}</p>
                     </div>
                     <div className="text-right">
                       <p className="text-sm font-black text-primary">{p.price}</p>
                       <p className="text-[10px] font-bold text-muted-foreground uppercase">{p._purchases || 0} ventes</p>
                     </div>
                   </div>
                 ))
               ) : (
                 <div className="py-12 text-center text-muted-foreground">
                    <Package size={32} className="mx-auto mb-3 opacity-20" />
                    <p className="text-xs font-medium">Ajoutez votre premier produit pour commencer.</p>
                 </div>
               )}
             </div>
           </section>

        </div>
      </div>
    </DashboardLayout>
  );
};

export default VendorDashboard;

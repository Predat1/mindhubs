import { useEffect, useMemo } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { motion } from "framer-motion";
import SEO from "@/components/SEO";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { useCurrentVendor, useVendorProducts } from "@/hooks/useVendors";
import { useVendorOrders } from "@/hooks/useVendorOrders";
import { supabase } from "@/integrations/supabase/client";
import {
  Plus, ShoppingBag, Users, DollarSign, Pencil, Trash2, Package,
  Copy, Info, Youtube, Lightbulb, MessageCircle,
  Trophy, Gift, Share2 as ShareIcon, Zap, Sparkles
} from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { useGamification } from "@/hooks/useGamification";
import { LevelProgressBar } from "@/components/gamification/LevelProgressBar";
import { BadgeGrid } from "@/components/gamification/BadgeSystem";

const VendorDashboard = () => {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const { data: vendor, isLoading: vendorLoading } = useCurrentVendor();
  const { data: products = [], refetch } = useVendorProducts(vendor?.id);
  const { stats: gameStats, nextLevelXp } = useGamification();
  const queryClient = useQueryClient();

  useEffect(() => {
    if (!loading && !user) navigate("/mon-compte");
    if (!loading && !vendorLoading && user && !vendor) navigate("/become-a-seller");
  }, [loading, user, vendor, vendorLoading, navigate]);

  // Aggregate stats
  const productIds = useMemo(() => products.map((p) => p.id), [products]);
  
  const { data: stats } = useQuery({
    queryKey: ["vendor-stats", vendor?.id, productIds.join(",")],
    queryFn: async () => {
      if (productIds.length === 0) return { views: 0, purchases: 0, raw: [] };
      const { data } = await supabase
        .from("product_stats")
        .select("product_id,total_views,total_purchases")
        .in("product_id", productIds);
      return {
        views: (data || []).reduce((s: number, r: any) => s + (r.total_views || 0), 0),
        purchases: (data || []).reduce((s: number, r: any) => s + (r.total_purchases || 0), 0),
        raw: data || []
      };
    },
    enabled: productIds.length > 0,
  });

  const { data: orders = [] } = useVendorOrders(productIds);
  
  const orderStats = useMemo(() => {
    if (!orders || orders.length === 0) return { revenue: 0, customers: 0, last7: 0 };
    const valid = orders.filter((o) => o.status !== "cancelled");
    const sevenDaysAgo = Date.now() - 7 * 24 * 3600 * 1000;
    return {
      revenue: valid.reduce((s, o) => s + (o.vendor_revenue || 0), 0),
      customers: new Set(valid.map((o) => o.customer_email)).size,
      last7: valid
        .filter((o) => new Date(o.created_at).getTime() > sevenDaysAgo)
        .reduce((s, o) => s + (o.vendor_revenue || 0), 0),
    };
  }, [orders]);

  const handleDelete = async (id: string) => {
    if (!confirm("Voulez-vous supprimer ce produit ? Cette action est irréversible.")) return;
    const { error } = await supabase.from("products").delete().eq("id", id);
    if (error) {
      toast({ title: "Erreur", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Produit supprimé ✓" });
      refetch();
      queryClient.invalidateQueries({ queryKey: ["products"] });
      queryClient.invalidateQueries({ queryKey: ["vendor-products"] });
    }
  };

  const copyLink = (id: string) => {
    const url = `${window.location.origin}/produit/${id}`;
    navigator.clipboard.writeText(url);
    toast({ title: "Lien de vente copié ✓" });
  };

  if (loading || vendorLoading || !vendor) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center gap-4">
        <div className="h-10 w-10 animate-spin rounded-full border-2 border-primary border-t-transparent shadow-[0_0_15px_hsl(var(--primary)/0.5)]" />
        <p className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground animate-pulse">Initialisation MindHubs...</p>
      </div>
    );
  }

  const firstName = vendor?.shop_name ? vendor.shop_name.split(" ")[0] : "Vendeur";
  const revenue = orderStats.revenue || 0;
  const last7 = orderStats.last7 || 0;
  const customers = orderStats.customers || 0;

  // Top products by purchases
  const topProducts = [...products]
    .map((p) => {
      const pStats = Array.isArray(stats?.raw) ? stats.raw.find((s: any) => s.product_id === p.id) : null;
      return { ...p, _purchases: pStats?.total_purchases || 0 };
    })
    .sort((a, b) => b._purchases - a._purchases)
    .slice(0, 5);

  return (
    <DashboardLayout variant="vendor" title="Vue d'ensemble" shopName={vendor.shop_name} shopUrl={`/store/${vendor.username}`}>
      <SEO title="Dashboard Vendeur — MindHubs" description="Gérez votre empire digital" path="/dashboard" />

      <div className="mx-auto max-w-6xl space-y-8">
        {/* Welcome Section */}
        <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
          <div className="space-y-1">
            <h2 className="text-3xl font-black text-foreground sm:text-4xl tracking-tighter">
              Bonjour {firstName} ! <span className="inline-block animate-bounce-slow">👋</span>
            </h2>
            <p className="text-sm font-medium text-muted-foreground">
              Voici l'état actuel de votre business sur MindHubs.
            </p>
          </div>
          
          {/* Quick link */}
          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="group relative flex max-w-xs cursor-pointer items-center gap-3 rounded-2xl border border-white/5 bg-card/50 p-3 backdrop-blur-md transition-all hover:border-primary/30 hover:bg-card hover:shadow-2xl"
            onClick={() => copyLink(vendor.username)} // This should probably be the store link
          >
            <div className="h-10 w-10 rounded-xl bg-primary/20 flex items-center justify-center text-primary transition-transform group-hover:scale-110 group-hover:rotate-6">
              <ShareIcon size={18} />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground opacity-60">Votre Boutique Live</p>
              <p className="truncate text-xs font-black text-foreground">mindhubs.com/store/{vendor.username}</p>
            </div>
            <Copy size={14} className="text-muted-foreground group-hover:text-primary transition-colors" />
          </motion.div>
        </div>

        {/* Gamification Hub */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
           <section className="lg:col-span-2 rounded-[2.5rem] border border-white/5 bg-card/40 backdrop-blur-xl p-8 shadow-2xl relative overflow-hidden group">
              <div className="absolute top-0 right-0 -mr-12 -mt-12 h-64 w-64 rounded-full bg-primary/10 blur-[100px] transition-all group-hover:bg-primary/20" />
              <div className="relative z-10 space-y-8">
                 <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                       <Sparkles size={16} className="text-primary animate-pulse" />
                       <h3 className="text-xs font-black uppercase tracking-widest text-primary">Progression Expert</h3>
                    </div>
                    <Button variant="ghost" size="sm" className="h-8 rounded-full text-[10px] font-black uppercase tracking-widest border border-white/5">
                       Détails du rang
                    </Button>
                 </div>
                 
                 <LevelProgressBar 
                    xp={gameStats?.xp || 0} 
                    level={gameStats?.level || 1} 
                    tier={gameStats?.tier || "Bronze"} 
                    nextLevelXp={nextLevelXp} 
                 />
                 
                 <div className="pt-4 border-t border-white/5">
                    <div className="mb-4 flex items-center justify-between">
                       <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Badges Récents</p>
                       <Link to="/dashboard/settings" className="text-[10px] font-black uppercase tracking-widest text-primary hover:underline">Voir tout</Link>
                    </div>
                    {gameStats && <BadgeGrid badges={gameStats.badges.slice(0, 4)} />}
                 </div>
              </div>
           </section>

           <aside className="space-y-6">
              <div className="rounded-[2.5rem] bg-gradient-to-br from-primary to-accent p-8 text-primary-foreground shadow-2xl relative overflow-hidden group h-full flex flex-col justify-between">
                 <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-10" />
                 <div className="relative z-10">
                    <div className="h-12 w-12 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center mb-6">
                       <Zap size={24} fill="currentColor" />
                    </div>
                    <h3 className="text-2xl font-black tracking-tighter leading-tight mb-2">Boostez vos ventes avec l'IA</h3>
                    <p className="text-xs font-medium text-white/80 leading-relaxed">Générez des fiches produits optimisées et des visuels pro en 1 clic.</p>
                 </div>
                 <Button asChild className="relative z-10 mt-8 bg-white text-primary hover:bg-white/90 rounded-2xl font-black h-12 shadow-xl shadow-black/10">
                    <Link to="/dashboard/products">Essayer maintenant</Link>
                 </Button>
              </div>
           </aside>
        </div>

        {/* Stats cards */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {[
            { icon: DollarSign, label: "Revenu total", value: `${revenue.toLocaleString()} FCFA`, info: "Total des ventes confirmées", color: "text-emerald-500 bg-emerald-500/10" },
            { icon: ShoppingBag, label: "7 derniers jours", value: `${last7.toLocaleString()} FCFA`, info: "Revenus cumulés cette semaine", color: "text-primary bg-primary/10" },
            { icon: Users, label: "Nombre total de clients", value: customers.toLocaleString(), info: "Clients uniques ayant commandé", color: "text-blue-500 bg-blue-500/10" },
          ].map(({ icon: Icon, label, value, info, color }) => (
            <div key={label} className="group rounded-[2.5rem] border border-white/5 bg-card/50 backdrop-blur-md p-8 transition-all hover:border-primary/20 hover:shadow-2xl">
              <div className={`mb-6 flex h-12 w-12 items-center justify-center rounded-2xl transition-transform group-hover:scale-110 ${color}`}>
                <Icon size={22} />
              </div>
              <div className="space-y-1">
                 <p className="text-4xl font-black text-foreground tracking-tighter">{value}</p>
                 <div className="flex items-center gap-1.5 pt-2">
                    <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground opacity-60">{label}</p>
                    <Info size={10} className="text-muted-foreground cursor-help" />
                 </div>
              </div>
            </div>
          ))}
        </div>

        {/* Content Section */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
           {/* Top products */}
           <section className="lg:col-span-2 rounded-[2.5rem] border border-white/5 bg-card/50 backdrop-blur-md p-8 shadow-xl">
             <div className="mb-8 flex items-center justify-between">
                <div className="flex items-center gap-2">
                   <Trophy size={18} className="text-primary" />
                   <h3 className="text-lg font-black tracking-tight">Top Performances</h3>
                </div>
                <Link to="/dashboard/products" className="text-xs font-black uppercase tracking-widest text-primary hover:underline">Voir tout</Link>
             </div>

             <div className="space-y-4">
               {topProducts.length > 0 ? (
                 topProducts.map((p, idx) => (
                   <div key={p.id} className="group flex items-center gap-4 rounded-2xl border border-white/5 bg-white/5 p-4 transition-all hover:border-primary/20 hover:bg-white/10">
                     <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-xl bg-muted border border-white/10">
                       <img src={p.image} className="h-full w-full object-cover transition-transform group-hover:scale-110" />
                       <div className="absolute top-0 left-0 h-4 w-4 bg-primary text-white text-[8px] font-black flex items-center justify-center rounded-br-lg">{idx + 1}</div>
                     </div>
                     <div className="min-w-0 flex-1">
                       <p className="truncate text-sm font-black text-foreground leading-tight">{p.title}</p>
                       <p className="text-[10px] text-muted-foreground font-medium uppercase tracking-widest mt-0.5">{p.category}</p>
                     </div>
                     <div className="text-right">
                       <p className="text-sm font-black text-primary">{p.price}</p>
                       <p className="text-[10px] font-bold text-muted-foreground uppercase">{(p as any)._purchases || 0} ventes</p>
                     </div>
                   </div>
                 ))
               ) : (
                 <div className="py-12 text-center text-muted-foreground">
                    <Package size={32} className="mx-auto mb-3 opacity-20" />
                    <p className="text-xs font-medium">Aucune donnée de vente disponible pour le moment.</p>
                 </div>
               )}
             </div>
           </section>

           {/* Resources / Tips */}
           <section className="rounded-[2.5rem] border border-white/5 bg-card/50 backdrop-blur-md p-8 shadow-xl space-y-6">
              <h3 className="text-lg font-black tracking-tight">Centre de Succès</h3>
              <div className="space-y-4">
                 {[
                   { icon: Youtube, title: "Tutoriel: Scaler à 1M", desc: "Guide vidéo expert", time: "15 min" },
                   { icon: Lightbulb, title: "Optimisez vos fiches", desc: "Le secret des conversions", time: "5 min" },
                   { icon: MessageCircle, title: "Support Communauté", desc: "Rejoignez les experts", time: "Live" }
                 ].map((tip, i) => (
                   <div key={i} className="flex items-center gap-3 p-3 rounded-2xl hover:bg-white/5 cursor-pointer transition-colors group">
                      <div className="h-10 w-10 rounded-xl bg-muted flex items-center justify-center text-muted-foreground group-hover:text-primary transition-colors">
                         <tip.icon size={18} />
                      </div>
                      <div className="flex-1">
                         <p className="text-xs font-black leading-none group-hover:text-primary transition-colors">{tip.title}</p>
                         <p className="text-[10px] text-muted-foreground mt-1">{tip.desc}</p>
                      </div>
                      <span className="text-[8px] font-black uppercase text-muted-foreground opacity-50">{tip.time}</span>
                   </div>
                 ))}
              </div>
              <div className="pt-4 mt-2 border-t border-white/5">
                 <div className="bg-primary/10 rounded-2xl p-4 flex items-center gap-3">
                    <div className="h-10 w-10 rounded-xl bg-primary/20 flex items-center justify-center text-primary"><Gift size={18} /></div>
                    <div>
                       <p className="text-[10px] font-black text-primary uppercase tracking-widest">Bonus Parrainage</p>
                       <p className="text-xs font-bold text-foreground leading-tight mt-0.5">Gagnez 5% par filleul expert.</p>
                    </div>
                 </div>
              </div>
           </section>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default VendorDashboard;

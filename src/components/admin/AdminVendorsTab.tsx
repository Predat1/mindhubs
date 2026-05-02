import { useState, useMemo } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";
import { 
  Store, ShieldCheck, ExternalLink, Search, Download, 
  History, ShoppingBag, Package, TrendingUp, DollarSign,
  ChevronRight, Info, UserCog, BadgeCheck, Loader2, X, Wallet
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";
import { toast } from "sonner";
import { formatCurrency } from "@/lib/currency";

interface AdminVendorsTabProps {
  logAction: (action: string, details: string) => Promise<void>;
}

const AdminVendorsTab = ({ logAction }: AdminVendorsTabProps) => {
  const [search, setSearch] = useState("");
  const [selectedVendor, setSelectedVendor] = useState<any | null>(null);

  // ─── Queries ───
  const { data: vendors = [], isLoading: vendorsLoading, refetch } = useQuery({
    queryKey: ["admin-vendors-extended"],
    queryFn: async () => {
      // Joindre les vues pour avoir les infos complètes
      const { data, error } = await (supabase as any)
        .from('vendor_subscription_view')
        .select('*')
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data || [];
    }
  });

  const { data: orders = [] } = useQuery({
    queryKey: ["admin-all-orders-revenue"],
    queryFn: async () => {
      const { data, error } = await (supabase as any)
        .from('orders')
        .select('total_price, vendor_revenue, status');
      if (error) throw error;
      return data || [];
    }
  });

  // ─── Vendor Detail Queries (Only when sheet is open) ───
  const { data: vendorDetails, isLoading: detailsLoading } = useQuery({
    queryKey: ["admin-vendor-details", selectedVendor?.vendor_id],
    enabled: !!selectedVendor,
    queryFn: async () => {
      const vendorId = selectedVendor.vendor_id;
      const [credits, products, orders] = await Promise.all([
        (supabase as any).from('credit_transactions').select('*').eq('vendor_id', vendorId).order('created_at', { ascending: false }).limit(10),
        supabase.from('products').select('*').eq('vendor_id', vendorId).order('created_at', { ascending: false }),
        (supabase as any).from('orders').select('*').eq('vendor_id', vendorId).order('created_at', { ascending: false }).limit(5)
      ]);
      return {
        transactions: credits.data || [],
        products: products.data || [],
        orders: orders.data || []
      };
    }
  });

  // ─── Calculations ───
  const stats = useMemo(() => {
    const total = vendors.length;
    const active = vendors.filter(v => (v.product_count || 0) > 0).length;
    const grossMarketplace = orders.reduce((acc, o) => acc + (Number(o.total_price) || 0), 0);
    const mhCommission = orders.reduce((acc, o) => acc + (Number(o.total_price) - Number(o.vendor_revenue) || 0), 0);
    return { total, active, grossMarketplace, mhCommission };
  }, [vendors, orders]);

  const filteredVendors = vendors.filter(v => 
    v.shop_name?.toLowerCase().includes(search.toLowerCase()) || 
    v.username?.toLowerCase().includes(search.toLowerCase())
  );

  const toggleVerification = async (vendorId: string, shopName: string, current: boolean) => {
    try {
      const { error } = await supabase.from('vendors').update({ verified: !current }).eq('id', vendorId);
      if (error) throw error;
      await logAction('VENDOR_VERIFY', `${shopName} → ${!current ? 'Vérifié' : 'Standard'}`);
      toast.success(`${shopName} est désormais ${!current ? 'vérifié' : 'standard'}`);
      refetch();
    } catch (err: any) {
      toast.error("Erreur: " + err.message);
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* ─── KPI ROW ─── */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: "Total Vendeurs", value: stats.total, icon: Store, color: "text-primary" },
          { label: "Vendeurs Actifs", value: stats.active, icon: BadgeCheck, color: "text-emerald-500" },
          { label: "Revenu Commissions", value: formatCurrency(stats.mhCommission), icon: TrendingUp, color: "text-fuchsia-500" },
          { label: "Volume Marketplace", value: formatCurrency(stats.grossMarketplace), icon: ShoppingBag, color: "text-blue-500" },
        ].map((s, i) => (
          <div key={i} className="stat-card rounded-2xl p-5 border-glow">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center bg-muted/50 mb-3 ${s.color}`}><s.icon size={18} /></div>
            <p className="text-2xl font-black tracking-tighter">{s.value}</p>
            <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">{s.label}</p>
          </div>
        ))}
      </div>

      {/* ─── TABLE CONTROLS ─── */}
      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={16} />
        <Input 
          placeholder="Filtrer par boutique ou username..." 
          className="pl-10 h-12 bg-card rounded-2xl border-white/5" 
          value={search} 
          onChange={(e) => setSearch(e.target.value)} 
        />
      </div>

      {/* ─── VENDORS TABLE ─── */}
      <div className="stat-card rounded-3xl overflow-hidden border-glow">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead>
              <tr className="bg-muted/30 border-b border-white/5">
                <th className="p-4 text-[10px] font-black uppercase tracking-widest text-muted-foreground">Boutique</th>
                <th className="p-4 text-[10px] font-black uppercase tracking-widest text-muted-foreground text-center">Plan</th>
                <th className="p-4 text-[10px] font-black uppercase tracking-widest text-muted-foreground text-center">Crédits</th>
                <th className="p-4 text-[10px] font-black uppercase tracking-widest text-muted-foreground text-center">Produits</th>
                <th className="p-4 text-[10px] font-black uppercase tracking-widest text-muted-foreground text-center">Vérifié</th>
                <th className="p-4 text-[10px] font-black uppercase tracking-widest text-muted-foreground text-right">Détails</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {vendorsLoading ? (
                Array(6).fill(0).map((_, i) => <tr key={i}><td colSpan={6} className="p-4"><Skeleton className="h-12 w-full rounded-xl" /></td></tr>)
              ) : filteredVendors.map((v) => (
                <tr key={v.vendor_id} className="group hover:bg-white/5 transition-colors">
                  <td className="p-4">
                    <div className="flex items-center gap-3">
                       <div className="h-10 w-10 rounded-full bg-muted flex items-center justify-center overflow-hidden border border-white/5">
                          {v.avatar_url ? <img src={v.avatar_url} className="w-full h-full object-cover" /> : <Store size={18} className="text-muted-foreground" />}
                       </div>
                       <div>
                          <p className="font-bold">{v.shop_name || "Boutique"}</p>
                          <p className="text-[10px] text-muted-foreground">@{v.username}</p>
                       </div>
                    </div>
                  </td>
                  <td className="p-4 text-center">
                    <Badge className={`font-black text-[9px] uppercase ${v.plan === 'elite' ? 'bg-amber-500' : v.plan === 'pro' ? 'bg-purple-500' : 'bg-zinc-500'}`}>
                       {v.plan}
                    </Badge>
                  </td>
                  <td className="p-4 text-center font-black text-xs text-primary">{v.credit_balance}</td>
                  <td className="p-4 text-center">
                    <span className="text-[10px] font-black text-muted-foreground">{v.product_count} / {v.max_products === -1 ? "∞" : v.max_products}</span>
                  </td>
                  <td className="p-4 text-center">
                    <button 
                      onClick={() => toggleVerification(v.vendor_id, v.shop_name, v.verified)}
                      className={`px-3 py-1 rounded-full text-[9px] font-black uppercase transition-all ${v.verified ? "bg-emerald-500/10 text-emerald-500 border border-emerald-500/20" : "bg-white/5 text-muted-foreground border border-white/5 hover:border-primary/50"}`}
                    >
                      {v.verified ? "VÉRIFIÉ ✓" : "STANDARD"}
                    </button>
                  </td>
                  <td className="p-4 text-right">
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      onClick={() => setSelectedVendor(v)}
                      className="rounded-xl font-black uppercase text-[9px] tracking-widest gap-2"
                    >
                      Voir Détail <ChevronRight size={14} />
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* ─── VENDOR DETAIL SHEET ─── */}
      <Sheet open={!!selectedVendor} onOpenChange={(open) => !open && setSelectedVendor(null)}>
        <SheetContent className="w-full sm:max-w-2xl glass-card border-l-white/10 p-0 overflow-y-auto hide-scrollbar">
          {selectedVendor && (
            <div className="flex flex-col h-full">
               <div className="relative h-48 bg-gradient-to-br from-primary/20 via-fuchsia-500/10 to-transparent">
                  <div className="absolute inset-0 bg-zinc-950/40 backdrop-blur-3xl" />
                  <Button variant="ghost" size="icon" onClick={() => setSelectedVendor(null)} className="absolute top-6 right-6 text-white hover:bg-white/10"><X /></Button>
                  
                  <div className="absolute -bottom-10 left-10 flex items-end gap-6">
                     <div className="h-32 w-32 rounded-[2.5rem] bg-zinc-900 border-4 border-zinc-950 overflow-hidden shadow-2xl">
                        {selectedVendor.avatar_url ? <img src={selectedVendor.avatar_url} className="w-full h-full object-cover" /> : <Store size={48} className="text-muted-foreground m-auto" />}
                     </div>
                     <div className="pb-4">
                        <h2 className="text-3xl font-black tracking-tighter text-white">{selectedVendor.shop_name}</h2>
                        <p className="text-primary font-bold">@{selectedVendor.username}</p>
                     </div>
                  </div>
               </div>

               <div className="p-10 pt-16 space-y-10">
                  {/* General Info Grid */}
                  <div className="grid grid-cols-2 gap-6">
                     <div className="stat-card p-4 rounded-2xl bg-white/5 border-white/5">
                        <p className="text-[9px] font-black text-muted-foreground uppercase">Abonnement Actuel</p>
                        <p className="text-lg font-black uppercase text-primary">{selectedVendor.plan}</p>
                     </div>
                     <div className="stat-card p-4 rounded-2xl bg-white/5 border-white/5">
                        <p className="text-[9px] font-black text-muted-foreground uppercase">Date d'inscription</p>
                        <p className="text-lg font-black">{new Date(selectedVendor.created_at).toLocaleDateString()}</p>
                     </div>
                  </div>

                  {/* Credits History */}
                  <div className="space-y-4">
                     <h3 className="text-sm font-black uppercase tracking-widest flex items-center gap-2 text-primary">
                        <Wallet size={16} /> Dernières Transactions
                     </h3>
                     <div className="space-y-2">
                        {detailsLoading ? Array(3).fill(0).map((_, i) => <Skeleton key={i} className="h-12 w-full rounded-xl" />) : 
                         vendorDetails?.transactions.length === 0 ? <p className="text-center py-6 text-xs text-muted-foreground uppercase font-black opacity-30">Aucun mouvement de crédits</p> :
                         vendorDetails?.transactions.map((t: any) => (
                          <div key={t.id} className="flex items-center justify-between p-3 rounded-xl bg-white/5 border border-white/5 text-[11px]">
                             <div className="flex items-center gap-3">
                                <div className={`w-8 h-8 rounded-lg flex items-center justify-center font-black ${t.amount > 0 ? "bg-emerald-500/10 text-emerald-500" : "bg-destructive/10 text-destructive"}`}>
                                   {t.amount > 0 ? "+" : ""}{t.amount}
                                </div>
                                <div>
                                   <p className="font-bold">{t.description || "Transaction"}</p>
                                   <p className="text-[9px] text-muted-foreground">{new Date(t.created_at).toLocaleString()}</p>
                                </div>
                             </div>
                             <Badge variant="outline" className="text-[9px] uppercase font-black">{t.type}</Badge>
                          </div>
                        ))}
                     </div>
                  </div>

                  {/* Products */}
                  <div className="space-y-4">
                     <h3 className="text-sm font-black uppercase tracking-widest flex items-center gap-2 text-primary">
                        <Package size={16} /> Catalogue de la boutique
                     </h3>
                     <div className="grid grid-cols-1 gap-2">
                        {detailsLoading ? Array(2).fill(0).map((_, i) => <Skeleton key={i} className="h-14 w-full rounded-xl" />) :
                         vendorDetails?.products.length === 0 ? <p className="text-center py-6 text-xs text-muted-foreground uppercase font-black opacity-30">Aucun produit en vente</p> :
                         vendorDetails?.products.map((p: any) => (
                          <div key={p.id} className="flex items-center justify-between p-3 rounded-xl bg-white/5 border border-white/5">
                             <div className="flex items-center gap-3">
                                <div className="h-10 w-10 rounded-lg bg-zinc-800 overflow-hidden">
                                   <img src={p.image_url} className="w-full h-full object-cover" />
                                </div>
                                <span className="text-xs font-bold">{p.title}</span>
                             </div>
                             <div className="text-right">
                                <p className="text-[10px] font-black text-primary">{formatCurrency(p.price)}</p>
                                <Badge className={`text-[8px] font-black ${p.status === 'published' ? 'bg-emerald-500/10 text-emerald-500' : 'bg-muted'}`}>
                                   {p.status?.toUpperCase() || "BROUILLON"}
                                </Badge>
                             </div>
                          </div>
                        ))}
                     </div>
                  </div>

                  {/* Orders */}
                  <div className="space-y-4">
                     <h3 className="text-sm font-black uppercase tracking-widest flex items-center gap-2 text-primary">
                        <ShoppingBag size={16} /> Dernières Ventes
                     </h3>
                     <div className="space-y-2">
                        {detailsLoading ? Array(2).fill(0).map((_, i) => <Skeleton key={i} className="h-14 w-full rounded-xl" />) :
                         vendorDetails?.orders.length === 0 ? <p className="text-center py-6 text-xs text-muted-foreground uppercase font-black opacity-30">Aucune commande reçue</p> :
                         vendorDetails?.orders.map((o: any) => (
                          <div key={o.id} className="flex items-center justify-between p-4 rounded-2xl bg-zinc-900/50 border border-white/5">
                             <div>
                                <p className="text-xs font-black">#{o.id.slice(0, 8)}</p>
                                <p className="text-[9px] text-muted-foreground">{o.customer_name}</p>
                             </div>
                             <div className="text-right">
                                <p className="text-xs font-black text-emerald-500">{formatCurrency(o.total_price)}</p>
                                <p className="text-[8px] font-bold text-muted-foreground uppercase">{new Date(o.created_at).toLocaleDateString()}</p>
                             </div>
                          </div>
                        ))}
                     </div>
                  </div>
               </div>
            </div>
          )}
        </SheetContent>
      </Sheet>
    </div>
  );
};

export default AdminVendorsTab;

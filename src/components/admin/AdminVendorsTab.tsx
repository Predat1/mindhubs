import { useState, useMemo } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";
import { 
  Store, ShieldCheck, ExternalLink, Search, Download, 
  History, ShoppingBag, Package, TrendingUp, DollarSign,
  ChevronRight, Info, UserCog, BadgeCheck, Loader2, X, Trash2
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
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
  const [deleteConfirm, setDeleteConfirm] = useState<{ id: string; label: string; type: 'vendor' | 'product' } | null>(null);
  const [deleting, setDeleting] = useState(false);

  // ─── Queries ───
  const { data: vendors = [], isLoading: vendorsLoading, refetch } = useQuery({
    queryKey: ["admin-vendors-extended"],
    queryFn: async () => {
      const { data, error } = await (supabase as any)
        .from('vendors')
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
    queryKey: ["admin-vendor-details", selectedVendor?.id],
    enabled: !!selectedVendor,
    queryFn: async () => {
      const vendorId = selectedVendor.id;
      const [products, orders] = await Promise.all([
        supabase.from('products').select('*').eq('vendor_id', vendorId).order('created_at', { ascending: false }),
        (supabase as any).from('orders').select('*').eq('vendor_id', vendorId).order('created_at', { ascending: false }).limit(5)
      ]);
      return {
        products: products.data || [],
        orders: orders.data || []
      };
    }
  });

  const handleDelete = async () => {
    if (!deleteConfirm) return;
    setDeleting(true);
    try {
      const table = deleteConfirm.type === 'vendor' ? 'vendors' : 'products';
      const { error } = await supabase.from(table).delete().eq('id', deleteConfirm.id);
      if (error) throw error;
      
      toast.success(deleteConfirm.type === 'vendor' ? 'Vendeur supprimé' : 'Produit supprimé');
      
      if (deleteConfirm.type === 'vendor') {
        setSelectedVendor(null);
        refetch();
        await logAction('VENDOR_DELETE', deleteConfirm.label);
      } else {
        // Refetch vendor details if a product was deleted
        refetch();
        // Since we don't have a direct refetch for the vendorDetails query, we can force a re-render or let it invalidate
        await logAction('PRODUCT_DELETE', deleteConfirm.label);
      }
    } catch (err: any) {
      toast.error("Erreur de suppression: " + err.message);
    } finally {
      setDeleting(false);
      setDeleteConfirm(null);
    }
  };

  // ─── Calculations ───
  const stats = useMemo(() => {
    const total = vendors.length;
    const active = vendors.filter(v => (v.product_count || 0) > 0).length;
    const grossMarketplace = orders.reduce((acc, o) => acc + (Number(o.total_price) || 0), 0);
    const vendorRevenue = orders.reduce((acc, o) => acc + (Number(o.vendor_revenue) || Number(o.total_price) || 0), 0);
    return { total, active, grossMarketplace, vendorRevenue };
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
          { label: "Vendeurs Actifs", value: stats.active, icon: BadgeCheck, color: "text-success" },
          { label: "Revenu vendeurs", value: formatCurrency(stats.vendorRevenue), icon: TrendingUp, color: "text-success" },
          { label: "Volume Marketplace", value: formatCurrency(stats.grossMarketplace), icon: ShoppingBag, color: "text-info" },
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
          className="pl-10 h-12 bg-card rounded-2xl border-border" 
          value={search} 
          onChange={(e) => setSearch(e.target.value)} 
        />
      </div>

      {/* ─── VENDORS TABLE ─── */}
      <div className="stat-card rounded-3xl overflow-hidden border-glow">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead>
              <tr className="bg-muted/30 border-b border-border">
                <th className="p-4 text-[10px] font-black uppercase tracking-widest text-muted-foreground">Boutique</th>
                <th className="p-4 text-[10px] font-black uppercase tracking-widest text-muted-foreground text-center">Produits</th>
                <th className="p-4 text-[10px] font-black uppercase tracking-widest text-muted-foreground text-center">Vérifié</th>
                <th className="p-4 text-[10px] font-black uppercase tracking-widest text-muted-foreground text-right">Détails</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {vendorsLoading ? (
                Array(6).fill(0).map((_, i) => <tr key={i}><td colSpan={4} className="p-4"><Skeleton className="h-12 w-full rounded-xl" /></td></tr>)
              ) : filteredVendors.map((v) => (
                <tr key={v.id} className="group hover:bg-muted/30 transition-colors">
                  <td className="p-4">
                    <div className="flex items-center gap-3">
                       <div className="h-10 w-10 rounded-full bg-muted flex items-center justify-center overflow-hidden border border-border">
                          {v.avatar_url ? <img src={v.avatar_url} className="w-full h-full object-cover" /> : <Store size={18} className="text-muted-foreground" />}
                       </div>
                       <div>
                          <p className="font-bold">{v.shop_name || "Boutique"}</p>
                          <p className="text-[10px] text-muted-foreground">@{v.username}</p>
                       </div>
                    </div>
                  </td>
                  <td className="p-4 text-center">
                    <span className="text-[10px] font-black text-muted-foreground">Catalogue ouvert</span>
                  </td>
                  <td className="p-4 text-center">
                    <button 
                      onClick={() => toggleVerification(v.id, v.shop_name, v.verified)}
                      className={`px-3 py-1 rounded-full text-[9px] font-black uppercase transition-all ${v.verified ? "bg-success/10 text-success border border-success/20" : "bg-muted/30 text-muted-foreground border border-border hover:border-primary/50"}`}
                    >
                      {v.verified ? "VÉRIFIÉ ✓" : "STANDARD"}
                    </button>
                  </td>
                  <td className="p-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        onClick={() => setSelectedVendor(v)}
                        className="rounded-xl font-black uppercase text-[9px] tracking-widest gap-2"
                      >
                        Voir Détail <ChevronRight size={14} />
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        className="h-8 w-8 text-destructive hover:text-destructive hover:bg-destructive/10"
                        onClick={(e) => { e.stopPropagation(); setDeleteConfirm({ id: v.id, label: v.shop_name, type: 'vendor' }); }}
                      >
                        <Trash2 size={14} />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* ─── VENDOR DETAIL SHEET ─── */}
      <Sheet open={!!selectedVendor} onOpenChange={(open) => !open && setSelectedVendor(null)}>
        <SheetContent className="w-full sm:max-w-2xl glass-card border-border p-0 overflow-y-auto hide-scrollbar">
          {selectedVendor && (
            <div className="flex flex-col h-full">
               <div className="relative h-48 bg-gradient-to-br from-primary/20 via-brand-magenta/10 to-transparent">
                  <div className="absolute inset-0 bg-background/40 backdrop-blur-3xl" />
                  <Button variant="ghost" size="icon" onClick={() => setSelectedVendor(null)} className="absolute top-6 right-6 hover:bg-muted/50"><X /></Button>
                  
                  <div className="absolute -bottom-10 left-10 flex items-end gap-6">
                     <div className="h-32 w-32 rounded-[2.5rem] bg-card border-4 border-zinc-950 overflow-hidden shadow-2xl">
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
                     <div className="stat-card p-4 rounded-2xl bg-muted/30 border-border">
                        <p className="text-[9px] font-black text-muted-foreground uppercase">Catalogue</p>
                        <p className="mt-1 text-lg font-black">Ouvert</p>
                        <p className="mt-1 text-[10px] text-muted-foreground">Catalogue ouvert pour chaque vendeur.</p>
                     </div>
                     <div className="stat-card p-4 rounded-2xl bg-muted/30 border-border">
                        <p className="text-[9px] font-black text-muted-foreground uppercase">Date d'inscription</p>
                        <p className="text-lg font-black">{new Date(selectedVendor.created_at).toLocaleDateString()}</p>
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
                          <div key={p.id} className="flex items-center justify-between p-3 rounded-xl bg-muted/30 border border-border">
                             <div className="flex items-center gap-3">
                                <div className="h-10 w-10 rounded-lg bg-zinc-800 overflow-hidden">
                                   <img src={p.image_url} className="w-full h-full object-cover" />
                                </div>
                                <span className="text-xs font-bold">{p.title}</span>
                             </div>
                             <div className="text-right flex flex-col items-end gap-1">
                                <p className="text-[10px] font-black text-primary">{formatCurrency(p.price)}</p>
                                <div className="flex items-center gap-2">
                                  <Badge className={`text-[8px] font-black ${p.status === 'published' ? 'bg-success/10 text-success' : 'bg-muted'}`}>
                                     {p.status?.toUpperCase() || "BROUILLON"}
                                  </Badge>
                              <button onClick={() => setDeleteConfirm({ id: p.id, label: p.title, type: 'product' })} className="text-destructive hover:text-destructive-strong transition-colors">
                                    <Trash2 size={12} />
                                  </button>
                                </div>
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
                          <div key={o.id} className="flex items-center justify-between p-4 rounded-2xl bg-card/50 border border-border">
                             <div>
                                <p className="text-xs font-black">#{o.id.slice(0, 8)}</p>
                                <p className="text-[9px] text-muted-foreground">{o.customer_name}</p>
                             </div>
                             <div className="text-right">
                                <p className="text-xs font-black text-success">{formatCurrency(o.total_price)}</p>
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

      <AlertDialog open={!!deleteConfirm} onOpenChange={o => !o && setDeleteConfirm(null)}>
        <AlertDialogContent className="rounded-3xl border-border bg-card">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-xl font-bold">Confirmer la suppression</AlertDialogTitle>
            <AlertDialogDescription>
              Supprimer définitivement "{deleteConfirm?.label}" ? Cette action est irréversible.
              {deleteConfirm?.type === 'vendor' && " Tous ses produits et données associées risquent d'être supprimés également."}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="rounded-xl">Annuler</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} disabled={deleting} className="rounded-xl bg-destructive text-destructive-foreground hover:bg-destructive/90 font-bold uppercase text-[10px] tracking-widest">
              {deleting ? <Loader2 size={14} className="animate-spin mr-2" /> : null} Supprimer
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default AdminVendorsTab;

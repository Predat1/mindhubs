import { useMemo, useState } from "react";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import VendorGuard from "@/components/dashboard/VendorGuard";
import SEO from "@/components/SEO";
import { useVendorProducts } from "@/hooks/useVendors";
import { useVendorOrders } from "@/hooks/useVendorOrders";
import { useVendorSubscription } from "@/hooks/useSubscription";
import { DollarSign, TrendingUp, ShoppingBag, Calendar, Wallet, ArrowRight, MessageCircle, AlertCircle, CheckCircle2, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useQuery, useQueryClient } from "@tanstack/react-query";

const VendorRevenueInner = ({ vendorId, shopName, shopUrl }: { vendorId: string; shopName: string; shopUrl: string }) => {
  const queryClient = useQueryClient();
  const { data: products = [] } = useVendorProducts(vendorId);
  const { data: orders = [], isLoading: ordersLoading } = useVendorOrders(vendorId, products.map((p) => p.id));
  const { plan } = useVendorSubscription(vendorId);

  const [isPayoutDialogOpen, setIsPayoutDialogOpen] = useState(false);
  const [payoutAmount, setPayoutAmount] = useState("");
  const [payoutMethod, setPayoutMethod] = useState("Wave");
  const [payoutDetails, setPayoutDetails] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // ─── Queries ───
  const { data: payoutHistory = [] } = useQuery({
    queryKey: ['payout-history', vendorId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('payout_requests')
        .select('*')
        .eq('vendor_id', vendorId)
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data;
    }
  });

  const stats = useMemo(() => {
    const valid = orders.filter((o) => o.status !== "cancelled");
    const now = Date.now();
    const day = 24 * 3600 * 1000;
    const total = valid.reduce((s, o) => s + (o.vendor_revenue || 0), 0);
    
    const paidOut = payoutHistory
      .filter(p => p.status === 'processed')
      .reduce((s, p) => s + p.amount, 0);
    
    const pendingPayout = payoutHistory
      .filter(p => p.status === 'pending')
      .reduce((s, p) => s + p.amount, 0);

    const availableBalance = total - paidOut - pendingPayout;

    const last30 = valid.filter((o) => now - new Date(o.created_at).getTime() < 30 * day).reduce((s, o) => s + (o.vendor_revenue || 0), 0);
    const avg = valid.length > 0 ? Math.round(total / valid.length) : 0;

    // Daily breakdown for last 14 days
    const days: { date: string; value: number }[] = [];
    for (let i = 13; i >= 0; i--) {
      const start = now - i * day;
      const dayLabel = new Date(start).toLocaleDateString("fr-FR", { day: "2-digit", month: "2-digit" });
      const value = valid
        .filter((o) => {
          const t = new Date(o.created_at).getTime();
          const d = new Date(start);
          const od = new Date(o.created_at);
          return d.getDate() === od.getDate() && d.getMonth() === od.getMonth();
        })
        .reduce((s, o) => s + (o.vendor_revenue || 0), 0);
      days.push({ date: dayLabel, value });
    }
    const maxDay = Math.max(...days.map((d) => d.value), 1);

    return { total, last30, availableBalance, pendingPayout, avg, days, maxDay, count: valid.length };
  }, [orders, payoutHistory]);

  const handlePayoutRequest = async () => {
    const amount = parseInt(payoutAmount);
    if (isNaN(amount) || amount < 1000) {
      toast.error("Le montant minimum est de 1 000 FCFA");
      return;
    }
    if (amount > stats.availableBalance) {
      toast.error("Solde disponible insuffisant");
      return;
    }
    if (!payoutDetails) {
      toast.error("Veuillez saisir les détails du paiement (numéro)");
      return;
    }

    setIsSubmitting(true);
    try {
      const { error } = await supabase.from('payout_requests').insert({
        vendor_id: vendorId,
        amount,
        payment_method: payoutMethod,
        payment_details: payoutDetails,
        status: 'pending'
      });

      if (error) throw error;

      toast.success("Votre demande de retrait a été envoyée ! ✨");
      setIsPayoutDialogOpen(false);
      setPayoutAmount("");
      setPayoutDetails("");
      queryClient.invalidateQueries({ queryKey: ['payout-history', vendorId] });
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <DashboardLayout variant="vendor" title="Revenus" shopName={shopName} shopUrl={shopUrl}>
      <SEO title="Revenus — Vendeur" description="Vos revenus" path="/dashboard/revenue" />

      <div className="mx-auto max-w-6xl space-y-10 pb-20">
        
        {/* Header with Payout Button */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div>
            <h2 className="text-3xl font-black tracking-tighter text-white">Gestion des Revenus</h2>
            <p className="mt-1 text-sm text-muted-foreground font-medium">Suivez vos ventes et retirez vos gains en toute sécurité.</p>
          </div>
          <Button 
            onClick={() => setIsPayoutDialogOpen(true)}
            className="rounded-2xl h-14 px-8 font-black uppercase tracking-widest text-[10px] gap-2 shadow-lg shadow-primary/20"
          >
            <Wallet size={18} /> Demander un retrait
          </Button>
        </div>

        {/* Balance Cards */}
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {[
            { label: "Solde Disponible", value: stats.availableBalance, color: "text-primary", bg: "bg-primary/10" },
            { label: "Revenu Total", value: stats.total, color: "text-white", bg: "bg-white/5" },
            { label: "En cours de retrait", value: stats.pendingPayout, color: "text-amber-500", bg: "bg-amber-500/10" },
            { label: "Panier Moyen", value: stats.avg, color: "text-emerald-500", bg: "bg-emerald-500/10" },
          ].map((stat) => (
            <div key={stat.label} className={`rounded-3xl border border-white/5 ${stat.bg} p-6 backdrop-blur-xl`}>
              <p className="text-[10px] font-black uppercase text-muted-foreground tracking-widest mb-1">{stat.label}</p>
              <p className={`text-2xl font-black ${stat.color}`}>{stat.value.toLocaleString()} FCFA</p>
            </div>
          ))}
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
           {/* Chart */}
           <section className="lg:col-span-2 rounded-[2.5rem] border border-white/5 bg-card/30 p-8">
              <div className="flex justify-between items-center mb-8">
                <h3 className="text-xl font-black tracking-tighter text-white">Évolution 14 jours</h3>
                <Badge variant="outline" className="font-black uppercase text-[9px] border-primary/20 text-primary">Live Data</Badge>
              </div>
              
              {ordersLoading ? (
                <div className="h-48 flex items-center justify-center"><Loader2 className="animate-spin text-primary" /></div>
              ) : (
                <div className="flex h-48 items-end gap-2">
                  {stats.days.map((d, i) => (
                    <div key={i} className="flex flex-1 flex-col items-center gap-3 group">
                      <div className="relative w-full h-full flex flex-col justify-end">
                        <motion.div
                          initial={{ height: 0 }}
                          animate={{ height: `${(d.value / stats.maxDay) * 100}%` }}
                          className="w-full rounded-t-xl bg-gradient-to-t from-primary/80 to-primary group-hover:from-primary transition-all shadow-[0_0_15px_rgba(var(--primary-rgb),0.2)]"
                        />
                      </div>
                      <span className="text-[9px] font-black uppercase text-muted-foreground tracking-tighter">{d.date}</span>
                    </div>
                  ))}
                </div>
              )}
           </section>

           {/* Support Section */}
           <section className="rounded-[2.5rem] border border-white/5 bg-gradient-to-br from-primary/10 via-card/30 to-card/30 p-8 flex flex-col justify-between">
              <div className="space-y-4">
                 <div className="w-12 h-12 rounded-2xl bg-primary/20 text-primary flex items-center justify-center shadow-lg"><MessageCircle size={24} /></div>
                 <h3 className="text-xl font-black tracking-tighter text-white">Support Vendeur</h3>
                 <p className="text-xs text-muted-foreground font-medium leading-relaxed">
                   Un souci avec une vente ou un retrait ? Notre équipe est disponible 7j/7 pour vous aider.
                 </p>
                 {plan === 'elite' && (
                    <Badge className="bg-amber-500 text-black font-black uppercase text-[8px] tracking-widest">
                       Priority WhatsApp Support Active
                    </Badge>
                 )}
              </div>
              <Button asChild variant="outline" className="mt-8 rounded-xl h-12 border-white/10 hover:bg-white/5 font-black uppercase tracking-widest text-[10px] gap-2">
                <a href="https://wa.me/2250000000000" target="_blank" rel="noopener noreferrer">
                   Contacter sur WhatsApp <ArrowRight size={14} />
                </a>
              </Button>
           </section>
        </div>

        {/* Withdrawal History */}
        <section className="space-y-6">
           <h3 className="text-xl font-black tracking-tighter text-white">Historique des retraits</h3>
           <div className="rounded-[2.5rem] border border-white/5 bg-card/30 overflow-hidden">
              <div className="overflow-x-auto">
                 <table className="w-full text-left">
                    <thead>
                       <tr className="bg-white/5 text-[10px] font-black uppercase tracking-widest text-muted-foreground">
                          <th className="px-8 py-4">Date</th>
                          <th className="px-8 py-4">Montant</th>
                          <th className="px-8 py-4">Méthode</th>
                          <th className="px-8 py-4">Détails</th>
                          <th className="px-8 py-4">Statut</th>
                       </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                       {payoutHistory.length === 0 ? (
                          <tr>
                             <td colSpan={5} className="px-8 py-12 text-center text-sm font-medium text-muted-foreground italic">
                                Aucun retrait effectué pour le moment.
                             </td>
                          </tr>
                       ) : payoutHistory.map((p) => (
                          <tr key={p.id} className="hover:bg-white/5 transition-colors">
                             <td className="px-8 py-4 text-xs font-bold">{new Date(p.created_at).toLocaleDateString()}</td>
                             <td className="px-8 py-4 text-sm font-black text-white">{p.amount.toLocaleString()} FCFA</td>
                             <td className="px-8 py-4 text-xs font-medium text-muted-foreground">{p.payment_method}</td>
                             <td className="px-8 py-4 text-xs font-mono text-muted-foreground">{p.payment_details}</td>
                             <td className="px-8 py-4">
                                <Badge className={`uppercase text-[8px] font-black tracking-widest ${
                                  p.status === 'processed' ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20' : 
                                  p.status === 'rejected' ? 'bg-destructive/10 text-destructive border-destructive/20' : 
                                  'bg-amber-500/10 text-amber-500 border-amber-500/20'
                                }`}>
                                   {p.status === 'processed' ? 'Effectué' : p.status === 'rejected' ? 'Refusé' : 'En attente'}
                                </Badge>
                             </td>
                          </tr>
                       ))}
                    </tbody>
                 </table>
              </div>
           </div>
        </section>
      </div>

      {/* Payout Request Dialog */}
      <Dialog open={isPayoutDialogOpen} onOpenChange={setIsPayoutDialogOpen}>
        <DialogContent className="glass-card border-white/10 text-white rounded-[2rem] max-w-lg">
           <DialogHeader>
              <DialogTitle className="text-2xl font-black uppercase tracking-tighter">Demander un retrait</DialogTitle>
              <DialogDescription className="text-muted-foreground font-medium">
                 Transférez vos gains disponibles vers votre compte Mobile Money.
              </DialogDescription>
           </DialogHeader>

           <div className="space-y-6 py-6">
              <div className="p-4 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-between">
                 <span className="text-xs font-bold text-primary">Solde Disponible</span>
                 <span className="text-lg font-black text-primary">{stats.availableBalance.toLocaleString()} FCFA</span>
              </div>

              <div className="space-y-4">
                 <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase text-muted-foreground ml-1">Montant du retrait (FCFA)</label>
                    <Input 
                      type="number" 
                      placeholder="Min. 1000 FCFA" 
                      value={payoutAmount}
                      onChange={e => setPayoutAmount(e.target.value)}
                      className="h-12 bg-white/5 border-white/10 rounded-xl font-bold"
                    />
                 </div>

                 <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase text-muted-foreground ml-1">Méthode de paiement</label>
                    <Select value={payoutMethod} onValueChange={setPayoutMethod}>
                       <SelectTrigger className="h-12 bg-white/5 border-white/10 rounded-xl font-bold">
                          <SelectValue placeholder="Choisir une méthode" />
                       </SelectTrigger>
                       <SelectContent className="bg-zinc-900 border-white/10 text-white font-bold">
                          <SelectItem value="Wave">Wave</SelectItem>
                          <SelectItem value="Orange Money">Orange Money</SelectItem>
                          <SelectItem value="MTN Money">MTN Money</SelectItem>
                          <SelectItem value="Moov Money">Moov Money</SelectItem>
                          <SelectItem value="Virement">Virement Bancaire (RIB)</SelectItem>
                       </SelectContent>
                    </Select>
                 </div>

                 <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase text-muted-foreground ml-1">Détails (Numéro ou RIB)</label>
                    <Input 
                      placeholder="Ex: +225 07 00 00 00 00" 
                      value={payoutDetails}
                      onChange={e => setPayoutDetails(e.target.value)}
                      className="h-12 bg-white/5 border-white/10 rounded-xl font-bold"
                    />
                 </div>
              </div>

              <div className="p-4 rounded-xl bg-white/5 flex items-start gap-3">
                 <AlertCircle size={16} className="text-muted-foreground mt-0.5" />
                 <p className="text-[10px] text-muted-foreground leading-relaxed italic">
                    Les retraits sont traités sous 24h à 48h ouvrées. Des frais de réseau peuvent s'appliquer selon l'opérateur.
                 </p>
              </div>
           </div>

           <DialogFooter>
              <Button variant="ghost" onClick={() => setIsPayoutDialogOpen(false)} className="rounded-xl font-black uppercase text-[10px] h-12">Annuler</Button>
              <Button 
                onClick={handlePayoutRequest} 
                disabled={isSubmitting}
                className="rounded-xl h-12 px-8 font-black uppercase tracking-widest text-[10px] shadow-lg shadow-primary/20"
              >
                 {isSubmitting ? <Loader2 className="animate-spin" /> : "Confirmer le retrait"}
              </Button>
           </DialogFooter>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
};

const VendorRevenue = () => (
  <VendorGuard>
    {(vendor) => <VendorRevenueInner vendorId={vendor.id} shopName={vendor.shop_name} shopUrl={`/store/${vendor.username}`} />}
  </VendorGuard>
);

export default VendorRevenue;

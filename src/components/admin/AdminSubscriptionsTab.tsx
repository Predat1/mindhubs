import { useState, useMemo } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { 
  CreditCard, Search, Download, MoreVertical, Plus, 
  Trash2, ShieldCheck, AlertCircle, RefreshCw, XCircle, 
  ChevronRight, Wallet, ArrowUpRight, Users, Star, Zap,
  Loader2, CheckCircle2
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
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
import { toast } from "sonner";
import { formatCurrency } from "@/lib/currency";

interface AdminSubscriptionsTabProps {
  logAction: (action: string, details: string) => Promise<void>;
}

const AdminSubscriptionsTab = ({ logAction }: AdminSubscriptionsTabProps) => {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState("");
  const [grantingCredits, setGrantingCredits] = useState<any | null>(null);
  const [cancellingSub, setCancellingSub] = useState<any | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  // ─── Queries ───
  const { data: stats, isLoading: statsLoading } = useQuery({
    queryKey: ["admin-sub-stats"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('vendor_subscriptions')
        .select('plan,status,amount_paid_fcfa');
      if (error) throw error;
      
      const mrr = data
        .filter(s => s.status === 'active')
        .reduce((acc, s) => acc + (Number(s.amount_paid_fcfa) || 0), 0);
      
      const activePaying = data.filter(s => s.plan !== 'free' && s.status === 'active').length;
      const proCount = data.filter(s => s.plan === 'pro').length;
      const eliteCount = data.filter(s => s.plan === 'elite').length;

      return { mrr, activePaying, proCount, eliteCount };
    }
  });

  const { data: subscriptions = [], isLoading: subsLoading } = useQuery({
    queryKey: ["admin-subscriptions"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('vendor_subscription_view')
        .select('*')
        .order('plan', { ascending: false });
      if (error) throw error;
      return data || [];
    }
  });

  // ─── Handlers ───
  const handleUpdatePlan = async (vendorId: string, shopName: string, newPlan: string) => {
    setIsProcessing(true);
    try {
      // 1. Get plan limits to set correct price
      const { data: limits } = await supabase.from('plan_limits').select('*').eq('plan', newPlan).single();
      if (!limits) throw new Error("Limites du plan introuvables");

      // 2. Upsert subscription
      const { error: subErr } = await supabase.from('vendor_subscriptions').upsert({
        vendor_id: vendorId,
        plan: newPlan,
        status: 'active',
        amount_paid_fcfa: limits.price_fcfa_monthly,
        current_period_end: new Date(Date.now() + 30 * 86400000).toISOString()
      });
      if (subErr) throw subErr;

      // 3. Grant monthly credits
      const { error: rpcErr } = await supabase.rpc('grant_monthly_credits', { p_vendor_id: vendorId });
      if (rpcErr) console.warn("Could not grant monthly credits automatically:", rpcErr);

      await logAction('PLAN_CHANGE', `${shopName} → ${newPlan}`);
      toast.success(`Plan de ${shopName} mis à jour : ${newPlan}`);
      queryClient.invalidateQueries({ queryKey: ["admin-subscriptions"] });
      queryClient.invalidateQueries({ queryKey: ["admin-sub-stats"] });
    } catch (err: any) {
      toast.error("Erreur: " + err.message);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleGrantCredits = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!grantingCredits) return;
    setIsProcessing(true);
    
    const { vendorId, shopName, amount, description, type } = grantingCredits;

    try {
      const { data, error } = await supabase.rpc('grant_credits', {
        p_vendor_id: vendorId,
        p_amount: parseInt(amount),
        p_description: description,
        p_type: type
      });
      if (error) throw error;

      await logAction('CREDITS_GRANT', `+${amount} crédits à ${shopName}: ${description}`);
      toast.success(`${amount} crédits ajoutés à ${shopName}`);
      setGrantingCredits(null);
      queryClient.invalidateQueries({ queryKey: ["admin-subscriptions"] });
    } catch (err: any) {
      toast.error("Erreur: " + err.message);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleCancelSub = async () => {
    if (!cancellingSub) return;
    setIsProcessing(true);
    try {
      const { error } = await supabase
        .from('vendor_subscriptions')
        .update({ cancel_at_period_end: true })
        .eq('vendor_id', cancellingSub.vendor_id);
      if (error) throw error;

      await logAction('SUBSCRIPTION_CANCEL', cancellingSub.shop_name);
      toast.success(`Désactivation à la fin de la période pour ${cancellingSub.shop_name}`);
      setCancellingSub(null);
      queryClient.invalidateQueries({ queryKey: ["admin-subscriptions"] });
    } catch (err: any) {
      toast.error("Erreur: " + err.message);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleReactivateSub = async (vendorId: string, shopName: string) => {
    setIsProcessing(true);
    try {
      const { error } = await supabase
        .from('vendor_subscriptions')
        .update({ status: 'active', cancel_at_period_end: false })
        .eq('vendor_id', vendorId);
      if (error) throw error;

      await logAction('SUBSCRIPTION_ACTIVATE', shopName);
      toast.success(`Abonnement réactivé pour ${shopName}`);
      queryClient.invalidateQueries({ queryKey: ["admin-subscriptions"] });
    } catch (err: any) {
      toast.error("Erreur: " + err.message);
    } finally {
      setIsProcessing(false);
    }
  };

  const exportCSV = () => {
    const headers = ["shop_name", "username", "plan", "status", "balance", "product_count", "commission_rate", "amount_paid_fcfa", "current_period_end"];
    const rows = filteredSubs.map(s => [
      s.shop_name,
      s.username,
      s.plan,
      s.status,
      s.credit_balance,
      s.product_count,
      s.commission_rate,
      s.amount_paid_fcfa,
      s.current_period_end
    ].join(","));
    
    const csvContent = "data:text/csv;charset=utf-8," + [headers.join(","), ...rows].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `mindhubs-subscriptions-${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const filteredSubs = subscriptions.filter(s => 
    s.shop_name?.toLowerCase().includes(search.toLowerCase()) || 
    s.username?.toLowerCase().includes(search.toLowerCase())
  );

  const getPlanBadge = (plan: string) => {
    switch (plan) {
      case 'elite': return <Badge className="bg-amber-500/10 text-amber-500 border-amber-500/20 font-black">ELITE</Badge>;
      case 'pro': return <Badge className="bg-purple-500/10 text-purple-500 border-purple-500/20 font-black">PRO</Badge>;
      case 'starter': return <Badge className="bg-blue-500/10 text-blue-500 border-blue-500/20 font-black">STARTER</Badge>;
      default: return <Badge variant="outline" className="text-muted-foreground font-black">FREE</Badge>;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active': return <Badge className="bg-emerald-500/10 text-emerald-500 font-black border-emerald-500/20">ACTIF</Badge>;
      case 'past_due': return <Badge className="bg-orange-500/10 text-orange-500 font-black border-orange-500/20">RETARD</Badge>;
      case 'cancelled': return <Badge className="bg-destructive/10 text-destructive font-black border-destructive/20">ANNULÉ</Badge>;
      default: return <Badge variant="outline">{status?.toUpperCase()}</Badge>;
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      {/* ─── KPI ROW ─── */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: "MRR Abonnements", value: stats ? formatCurrency(stats.mrr) : "...", icon: CreditCard, color: "text-primary" },
          { label: "Vendeurs Payants", value: stats?.activePaying ?? "...", icon: Users, color: "text-emerald-500" },
          { label: "Plans Pro", value: stats?.proCount ?? "...", icon: Star, color: "text-purple-500" },
          { label: "Plans Elite", value: stats?.eliteCount ?? "...", icon: Zap, color: "text-amber-500" },
        ].map((s, i) => (
          <div key={i} className="stat-card rounded-2xl p-5 border-glow">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center bg-muted/50 mb-3 ${s.color}`}><s.icon size={18} /></div>
            <p className="text-2xl font-black tracking-tighter">{s.value}</p>
            <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">{s.label}</p>
          </div>
        ))}
      </div>

      {/* ─── TABLE CONTROLS ─── */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="relative w-full md:w-96">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={16} />
          <Input 
            placeholder="Rechercher un vendeur..." 
            className="pl-10 h-12 bg-card rounded-2xl border-white/5" 
            value={search} 
            onChange={(e) => setSearch(e.target.value)} 
          />
        </div>
        <Button onClick={exportCSV} variant="outline" className="rounded-xl font-black uppercase text-[10px] tracking-widest gap-2 w-full md:w-auto">
          <Download size={16} /> Export CSV
        </Button>
      </div>

      {/* ─── SUBSCRIPTIONS TABLE ─── */}
      <div className="stat-card rounded-3xl overflow-hidden border-glow">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left border-collapse">
            <thead>
              <tr className="bg-muted/30 border-b border-white/5">
                <th className="p-4 text-[10px] font-black uppercase tracking-widest text-muted-foreground">Vendeur</th>
                <th className="p-4 text-[10px] font-black uppercase tracking-widest text-muted-foreground">Plan</th>
                <th className="p-4 text-[10px] font-black uppercase tracking-widest text-muted-foreground">Statut</th>
                <th className="p-4 text-[10px] font-black uppercase tracking-widest text-muted-foreground">Crédits</th>
                <th className="p-4 text-[10px] font-black uppercase tracking-widest text-muted-foreground">Produits</th>
                <th className="p-4 text-[10px] font-black uppercase tracking-widest text-muted-foreground">Comm.</th>
                <th className="p-4 text-[10px] font-black uppercase tracking-widest text-muted-foreground">Expire</th>
                <th className="p-4 text-[10px] font-black uppercase tracking-widest text-muted-foreground text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {subsLoading ? (
                Array(5).fill(0).map((_, i) => (
                  <tr key={i}><td colSpan={8} className="p-4"><Skeleton className="h-12 w-full rounded-xl" /></td></tr>
                ))
              ) : filteredSubs.map((sub) => (
                <tr key={sub.vendor_id} className="group hover:bg-white/5 transition-colors">
                  <td className="p-4">
                    <p className="font-bold">{sub.shop_name || "Boutique"}</p>
                    <p className="text-[10px] text-muted-foreground">@{sub.username}</p>
                  </td>
                  <td className="p-4">{getPlanBadge(sub.plan)}</td>
                  <td className="p-4">
                    {getStatusBadge(sub.status)}
                    {sub.cancel_at_period_end && <p className="text-[9px] text-orange-500 font-bold mt-1">S'arrête bientôt</p>}
                  </td>
                  <td className="p-4 w-40">
                    <div className="space-y-1">
                      <div className="flex justify-between text-[10px] font-bold">
                        <span>{sub.credit_balance}</span>
                        <span className="text-muted-foreground">/ {sub.monthly_credits}</span>
                      </div>
                      <Progress value={(sub.credit_balance / (sub.monthly_credits || 1)) * 100} className="h-1 bg-white/5" />
                    </div>
                  </td>
                  <td className="p-4">
                    <span className={`text-xs font-black ${sub.product_count >= sub.max_products && sub.max_products !== -1 ? "text-destructive" : ""}`}>
                      {sub.product_count} / {sub.max_products === -1 ? "∞" : sub.max_products}
                    </span>
                  </td>
                  <td className="p-4 font-black text-xs">{(sub.commission_rate * 100).toFixed(0)}%</td>
                  <td className="p-4 text-[10px] text-muted-foreground font-mono">
                    {sub.current_period_end ? new Date(sub.current_period_end).toLocaleDateString() : "-"}
                  </td>
                  <td className="p-4 text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8 rounded-xl"><MoreVertical size={16} /></Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="glass-card border-white/10 w-48">
                        <DropdownMenuItem className="text-xs font-bold gap-2 cursor-pointer" onClick={() => setGrantingCredits({ vendorId: sub.vendor_id, shopName: sub.shop_name, amount: "", description: "", type: "bonus" })}>
                          <Wallet size={14} className="text-primary" /> Ajouter crédits
                        </DropdownMenuItem>
                        
                        <DropdownMenu>
                          <DropdownMenuTrigger className="w-full flex items-center px-2 py-1.5 text-xs font-bold gap-2 hover:bg-white/5 outline-none">
                             <RefreshCw size={14} className="text-blue-500" /> Changer plan <ChevronRight size={12} className="ml-auto" />
                          </DropdownMenuTrigger>
                          <DropdownMenuContent side="left" className="glass-card border-white/10">
                             {['free', 'starter', 'pro', 'elite'].map(plan => (
                               <DropdownMenuItem key={plan} className="text-[10px] font-black uppercase cursor-pointer" onClick={() => handleUpdatePlan(sub.vendor_id, sub.shop_name, plan)}>
                                 {plan}
                               </DropdownMenuItem>
                             ))}
                          </DropdownMenuContent>
                        </DropdownMenu>

                        {sub.status === 'active' && !sub.cancel_at_period_end ? (
                          <DropdownMenuItem className="text-xs font-bold gap-2 cursor-pointer text-destructive" onClick={() => setCancellingSub({ vendor_id: sub.vendor_id, shop_name: sub.shop_name })}>
                            <XCircle size={14} /> Annuler
                          </DropdownMenuItem>
                        ) : (
                          <DropdownMenuItem className="text-xs font-bold gap-2 cursor-pointer text-emerald-500" onClick={() => handleReactivateSub(sub.vendor_id, sub.shop_name)}>
                            <CheckCircle2 size={14} /> Réactiver
                          </DropdownMenuItem>
                        )}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* ─── MODALS ─── */}
      
      {/* Grant Credits Dialog */}
      <Dialog open={!!grantingCredits} onOpenChange={(open) => !open && setGrantingCredits(null)}>
        <DialogContent className="glass-card border-white/10 text-white rounded-[2rem] max-w-sm">
          <DialogHeader>
            <DialogTitle className="text-2xl font-black tracking-tighter">Ajouter des crédits</DialogTitle>
            <DialogDescription className="text-muted-foreground font-medium uppercase text-[10px] tracking-widest">
              Vendeur : {grantingCredits?.shopName}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleGrantCredits} className="space-y-4">
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase text-muted-foreground">Montant</label>
              <Input 
                type="number" 
                required 
                placeholder="Ex: 50" 
                value={grantingCredits?.amount || ""} 
                onChange={e => setGrantingCredits({...grantingCredits, amount: e.target.value})}
                className="h-12 bg-white/5 border-white/10 rounded-xl font-bold"
              />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase text-muted-foreground">Type</label>
              <select 
                className="w-full h-12 bg-zinc-900 border border-white/10 rounded-xl px-3 font-bold text-sm outline-none"
                value={grantingCredits?.type || "bonus"}
                onChange={e => setGrantingCredits({...grantingCredits, type: e.target.value})}
              >
                <option value="bonus">🎁 Bonus Admin</option>
                <option value="purchase">💰 Achat forcé</option>
                <option value="refund">↩️ Remboursement</option>
                <option value="monthly_grant">📅 Dotation mensuelle</option>
              </select>
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase text-muted-foreground">Motif / Description</label>
              <Input 
                required 
                placeholder="Pourquoi ?" 
                value={grantingCredits?.description || ""} 
                onChange={e => setGrantingCredits({...grantingCredits, description: e.target.value})}
                className="h-12 bg-white/5 border-white/10 rounded-xl text-sm"
              />
            </div>
            <DialogFooter className="pt-4">
              <Button type="submit" disabled={isProcessing} className="w-full h-14 rounded-2xl font-black uppercase tracking-widest gap-2">
                {isProcessing ? <Loader2 className="animate-spin" /> : <Plus size={18} />} Confirmer l'ajout
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Cancel Subscription Dialog */}
      <AlertDialog open={!!cancellingSub} onOpenChange={(o) => !o && setCancellingSub(null)}>
        <AlertDialogContent className="glass-card border-white/10 rounded-[2.5rem]">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-xl font-black tracking-tighter uppercase">Annuler l'abonnement ?</AlertDialogTitle>
            <AlertDialogDescription className="text-muted-foreground font-medium">
              L'abonnement de <strong>{cancellingSub?.shop_name}</strong> sera marqué pour arrêt à la fin de la période actuelle. Le vendeur gardera ses accès jusqu'à l'expiration.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="rounded-xl border-white/10 font-bold uppercase text-[10px] tracking-widest">Retour</AlertDialogCancel>
            <AlertDialogAction onClick={handleCancelSub} disabled={isProcessing} className="rounded-xl bg-destructive text-destructive-foreground hover:bg-destructive/90 font-black uppercase text-[10px] tracking-widest">
              Confirmer l'annulation
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default AdminSubscriptionsTab;

import { useState, useEffect } from "react";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import VendorGuard from "@/components/dashboard/VendorGuard";
import SEO from "@/components/SEO";
import { 
  Zap, Wallet, CreditCard, ArrowUpRight, History, ShieldCheck, 
  Clock, Package, Star, MessageSquare, AlertCircle, ChevronRight,
  TrendingUp, Download, CheckCircle2, Info
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { useVendorSubscription, VendorPlan } from "@/hooks/useSubscription";
import { useCredits, CreditTransaction } from "@/hooks/useCredits";
import { useVendorOrders } from "@/hooks/useVendorOrders";
import { formatCurrency } from "@/lib/currency";
import { Link, useLocation } from "react-router-dom";
import { toast } from "@/hooks/use-toast";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { motion, AnimatePresence } from "framer-motion";
import { supabase } from "@/integrations/supabase/client";

const VendorSubscriptionInner = ({ vendor }: { vendor: any }) => {
  const location = useLocation();
  const sub = useVendorSubscription(vendor.id);
  const { balance, transactions, isLoading: creditsLoading } = useCredits(vendor.id);
  const { data: orders = [] } = useVendorOrders(vendor.id);
  
  const [paymentForm, setPaymentForm] = useState({
    plan: (location.state?.selectedPlan as VendorPlan) || 'pro',
    period: (location.state?.billing as 'monthly' | 'yearly') || 'monthly',
    method: 'wave',
    phone: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Calcul du CA des 30 derniers jours pour l'économie potentielle
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
  const revenue30d = orders
    .filter(o => new Date(o.created_at) >= thirtyDaysAgo)
    .reduce((sum, o) => {
      const items = Array.isArray(o.items) ? o.items : [];
      return sum + items.reduce((s, i) => {
        const price = parseInt(String(i.price || "0").replace(/[^0-9]/g, ""), 10) || 0;
        return s + (price * (i.quantity || 1));
      }, 0);
    }, 0);

  const handlePaymentRequest = async () => {
    if (!paymentForm.phone) {
      toast({ title: "Numéro requis", description: "Veuillez entrer votre numéro de téléphone de paiement.", variant: "destructive" });
      return;
    }

    setIsSubmitting(true);
    try {
      // Simulation d'enregistrement de demande de paiement
      const { error } = await supabase.from('vendor_subscriptions').upsert({
        vendor_id: vendor.id,
        plan: paymentForm.plan as VendorPlan,
        status: 'pending',
        payment_method: paymentForm.method,
        payment_reference: `PAY-${Date.now()}`,
        amount_paid_fcfa: 0, // Sera mis à jour après confirmation
        updated_at: new Date().toISOString()
      });

      if (error) throw error;

      toast({
        title: "Demande enregistrée ! 🚀",
        description: `Effectuez le paiement au +225 07 00 00 00 00 et envoyez la capture à support@mindhubs.com.`,
        duration: 10000,
      });
    } catch (error: any) {
      toast({ title: "Erreur", description: error.message, variant: "destructive" });
    } finally {
      setIsSubmitting(false);
    }
  };

  const getTransactionIcon = (type: string) => {
    switch (type) {
      case 'monthly_grant': return <Zap className="text-emerald-500" size={14} />;
      case 'spend': return <ArrowUpRight className="text-destructive" size={14} />;
      case 'purchase': return <Wallet className="text-blue-500" size={14} />;
      case 'bonus': return <Star className="text-amber-500" size={14} />;
      default: return <Clock size={14} />;
    }
  };

  return (
    <DashboardLayout variant="vendor" title="Abonnement & Crédits" shopName={vendor.shop_name}>
      <SEO title="Mon Abonnement — MindHubs" description="Gérez votre plan et votre solde de crédits IA." path="/dashboard/abonnement" />

      <div className="space-y-8 pb-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Section 1: Plan Actuel */}
          <div className="lg:col-span-2 space-y-8">
             <Card className="glass-card border-white/5 relative overflow-hidden group">
                <div className="absolute -right-12 -top-12 opacity-5 group-hover:opacity-10 transition-opacity">
                   <Star size={240} className="text-primary" />
                </div>
                <CardHeader>
                   <div className="flex items-center justify-between">
                      <Badge className="bg-primary text-white border-none px-4 py-1 font-black text-[10px] uppercase tracking-widest">Plan {sub.plan}</Badge>
                      <Badge variant="outline" className="border-white/10 text-emerald-500 bg-emerald-500/5 font-black text-[10px] uppercase">{sub.status}</Badge>
                   </div>
                   <CardTitle className="text-4xl font-black mt-4 tracking-tighter">Votre Abonnement</CardTitle>
                   <CardDescription className="text-sm font-medium">Prochain renouvellement le 15 du mois prochain.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                   <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div className="space-y-1">
                         <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">Produits</p>
                         <p className="text-lg font-black">{sub.productCount} / {sub.maxProducts === -1 ? '∞' : sub.maxProducts}</p>
                      </div>
                      <div className="space-y-1">
                         <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">Commission</p>
                         <p className="text-lg font-black">{ (sub.commissionRate * 100).toFixed(0) }%</p>
                      </div>
                      <div className="space-y-1">
                         <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">Support</p>
                         <p className="text-lg font-black">{sub.plan === 'elite' ? 'WhatsApp' : 'Email'}</p>
                      </div>
                      <div className="space-y-1">
                         <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">Analytics</p>
                         <p className="text-lg font-black">{sub.plan === 'free' ? 'Basiques' : 'Avancées'}</p>
                      </div>
                   </div>
                   <div className="space-y-2">
                      <div className="flex justify-between text-[10px] font-black uppercase tracking-widest">
                         <span className="text-muted-foreground">Utilisation Produits</span>
                         <span>{sub.maxProducts === -1 ? 'Illimité' : `${Math.round((sub.productCount / sub.maxProducts) * 100)}%`}</span>
                      </div>
                      <Progress value={sub.maxProducts === -1 ? 100 : (sub.productCount / sub.maxProducts) * 100} className="h-2" />
                   </div>
                </CardContent>
                <CardFooter className="bg-white/5 border-t border-white/5 flex gap-4">
                   <Button variant="ghost" className="h-10 rounded-xl font-black text-xs uppercase tracking-widest hover:text-destructive">Annuler l'abonnement</Button>
                   <Link to="/pricing" className="ml-auto">
                      <Button className="h-10 rounded-xl px-6 btn-glow font-black text-xs uppercase tracking-widest">Changer de plan</Button>
                   </Link>
                </CardFooter>
             </Card>

             {/* Section 2: Crédits Solde */}
             <div className="grid md:grid-cols-2 gap-6">
                <Card className="glass-card border-white/5 p-8 flex flex-col justify-between">
                   <div>
                      <div className="flex items-center gap-3 mb-4">
                         <div className="p-2 rounded-lg bg-primary/10 text-primary">
                            <Zap size={20} fill="currentColor" />
                         </div>
                         <h3 className="text-sm font-black uppercase tracking-widest text-muted-foreground">Solde de Crédits IA</h3>
                      </div>
                      <h2 className="text-5xl font-black tracking-tighter mb-2">{balance.toLocaleString()}</h2>
                      <p className="text-xs text-muted-foreground font-medium italic">Réinitialisé le 01 du mois.</p>
                   </div>
                   <div className="mt-8 space-y-4">
                      <div className="flex justify-between items-center text-xs">
                         <span className="text-muted-foreground font-bold">Inclus ce mois</span>
                         <span className="font-black">500</span>
                      </div>
                      <div className="flex justify-between items-center text-xs">
                         <span className="text-muted-foreground font-bold">Reportés (Rollover)</span>
                         <span className="font-black">120</span>
                      </div>
                      <Button onClick={() => document.getElementById('payment-section')?.scrollIntoView({ behavior: 'smooth' })} className="w-full h-12 rounded-xl border border-primary/20 bg-primary/5 text-primary font-black text-xs uppercase tracking-widest hover:bg-primary/10">Recharger</Button>
                   </div>
                </Card>

                <Card className="glass-card border-white/5 p-8 flex flex-col justify-center relative overflow-hidden group">
                   <div className="absolute right-0 top-0 p-8 opacity-5 pointer-events-none group-hover:scale-110 transition-transform duration-700">
                      <TrendingUp size={120} className="text-emerald-500" />
                   </div>
                   <h3 className="text-xl font-black mb-4">Optimisation Pro</h3>
                   <p className="text-sm text-muted-foreground leading-relaxed mb-6 font-medium">
                      En passant au plan <strong>Elite</strong>, vous économisez <strong>5%</strong> de commission sur chaque vente.
                   </p>
                   <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/20">
                      <p className="text-[10px] font-black text-emerald-500 uppercase tracking-widest mb-1">Économie potentielle</p>
                      <p className="text-2xl font-black text-emerald-500">{formatCurrency(Math.round(revenue30d * 0.05))} <span className="text-xs">/mois</span></p>
                   </div>
                </Card>
             </div>

             {/* Section 4: Historique des Transactions */}
             <Card className="glass-card border-white/5 overflow-hidden">
                <CardHeader>
                   <CardTitle className="text-xl font-black flex items-center gap-2"><History size={20} className="text-primary" /> Historique des crédits</CardTitle>
                </CardHeader>
                <div className="overflow-x-auto">
                   <table className="w-full text-left border-collapse">
                      <thead>
                         <tr className="border-y border-white/5 bg-white/5 text-[10px] font-black text-muted-foreground uppercase tracking-widest">
                            <th className="py-4 px-6">Date</th>
                            <th className="py-4 px-4 text-center">Type</th>
                            <th className="py-4 px-4">Description</th>
                            <th className="py-4 px-4 text-center">Montant</th>
                            <th className="py-4 px-6 text-right">Solde</th>
                         </tr>
                      </thead>
                      <tbody className="divide-y divide-white/5">
                         {transactions.length === 0 ? (
                           <tr>
                              <td colSpan={5} className="py-8 text-center text-muted-foreground text-sm font-medium italic">Aucune transaction enregistrée.</td>
                           </tr>
                         ) : (
                           transactions.map((tx) => (
                             <tr key={tx.id} className="group hover:bg-white/5 transition-colors">
                                <td className="py-4 px-6 text-xs font-bold text-muted-foreground whitespace-nowrap">
                                   {new Date(tx.created_at).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short' })}
                                </td>
                                <td className="py-4 px-4 text-center">
                                   <div className="inline-flex items-center justify-center h-8 w-8 rounded-lg bg-background border border-white/5">
                                      {getTransactionIcon(tx.type)}
                                   </div>
                                </td>
                                <td className="py-4 px-4">
                                   <p className="text-xs font-black truncate max-w-[200px]">{tx.description}</p>
                                   {tx.feature_type && <Badge variant="outline" className="mt-1 text-[8px] border-white/10 font-bold uppercase">{tx.feature_type}</Badge>}
                                </td>
                                <td className={`py-4 px-4 text-center font-black text-sm ${tx.amount > 0 ? 'text-emerald-500' : 'text-destructive'}`}>
                                   {tx.amount > 0 ? `+${tx.amount}` : tx.amount}
                                </td>
                                <td className="py-4 px-6 text-right font-black text-xs">
                                   {tx.balance_after}
                                </td>
                             </tr>
                           ))
                         )}
                      </tbody>
                   </table>
                </div>
             </Card>
          </div>

          {/* Section 5: Paiement / Checkout (Sidebar) */}
          <div id="payment-section" className="space-y-6">
             <Card className="glass-card border-primary/20 bg-primary/5 p-8 space-y-8 sticky top-24">
                <div className="space-y-2">
                   <h3 className="text-2xl font-black tracking-tighter">Souscrire / Recharger</h3>
                   <p className="text-xs text-muted-foreground font-medium leading-relaxed">
                      L'activation est manuelle après vérification du paiement par notre équipe support.
                   </p>
                </div>

                <div className="space-y-6">
                   <div className="space-y-2">
                      <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Type de Recharge</Label>
                      <Select 
                        value={paymentForm.plan} 
                        onValueChange={(v) => setPaymentForm(p => ({ ...p, plan: v }))}
                      >
                         <SelectTrigger className="h-12 rounded-xl bg-background border-white/10 font-bold">
                            <SelectValue placeholder="Choisir un plan" />
                         </SelectTrigger>
                         <SelectContent>
                            <SelectItem value="starter">Plan Starter</SelectItem>
                            <SelectItem value="pro">Plan Pro</SelectItem>
                            <SelectItem value="elite">Plan Elite</SelectItem>
                            <SelectItem value="credits">Pack 500 Crédits</SelectItem>
                            <SelectItem value="credits_pro">Pack 1000 Crédits</SelectItem>
                            <SelectItem value="credits_elite">Pack 3000 Crédits</SelectItem>
                         </SelectContent>
                      </Select>
                   </div>

                   {['starter', 'pro', 'elite'].includes(paymentForm.plan) && (
                     <div className="space-y-2">
                        <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Période</Label>
                        <div className="flex p-1 bg-background rounded-xl border border-white/5">
                           <button 
                             onClick={() => setPaymentForm(p => ({ ...p, period: 'monthly' }))}
                             className={`flex-1 py-2 rounded-lg text-xs font-black uppercase transition-all ${paymentForm.period === 'monthly' ? 'bg-primary text-white shadow-lg' : 'text-muted-foreground hover:bg-white/5'}`}
                           >
                              Mensuel
                           </button>
                           <button 
                             onClick={() => setPaymentForm(p => ({ ...p, period: 'yearly' }))}
                             className={`flex-1 py-2 rounded-lg text-xs font-black uppercase transition-all ${paymentForm.period === 'yearly' ? 'bg-primary text-white shadow-lg' : 'text-muted-foreground hover:bg-white/5'}`}
                           >
                              Annuel
                           </button>
                        </div>
                     </div>
                   )}

                   <div className="space-y-2">
                      <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Méthode de Paiement</Label>
                      <Select 
                        value={paymentForm.method} 
                        onValueChange={(v) => setPaymentForm(p => ({ ...p, method: v }))}
                      >
                         <SelectTrigger className="h-12 rounded-xl bg-background border-white/10 font-bold">
                            <SelectValue placeholder="Choisir une méthode" />
                         </SelectTrigger>
                         <SelectContent>
                            <SelectItem value="wave">Wave</SelectItem>
                            <SelectItem value="orange">Orange Money</SelectItem>
                            <SelectItem value="mtn">MTN Mobile Money</SelectItem>
                            <SelectItem value="moov">Moov Money</SelectItem>
                            <SelectItem value="card">Carte Bancaire</SelectItem>
                         </SelectContent>
                      </Select>
                   </div>

                   <div className="space-y-2">
                      <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Numéro de téléphone</Label>
                      <Input 
                        placeholder="+225 ..." 
                        value={paymentForm.phone}
                        onChange={(e) => setPaymentForm(p => ({ ...p, phone: e.target.value }))}
                        className="h-12 rounded-xl bg-background border-white/10 font-bold"
                      />
                   </div>
                </div>

                <div className="pt-4 border-t border-white/5 space-y-4">
                   <div className="flex justify-between items-center">
                      <span className="text-sm font-bold">Total à payer</span>
                      <span className="text-2xl font-black">
                         {paymentForm.plan === 'starter' ? (paymentForm.period === 'monthly' ? '4 900 FCFA' : '49 000 FCFA') : 
                          paymentForm.plan === 'pro' ? (paymentForm.period === 'monthly' ? '14 900 FCFA' : '149 000 FCFA') : 
                          paymentForm.plan === 'elite' ? (paymentForm.period === 'monthly' ? '29 900 FCFA' : '299 000 FCFA') :
                          paymentForm.plan === 'credits' ? '3 500 FCFA' :
                          paymentForm.plan === 'credits_pro' ? '6 000 FCFA' : '15 000 FCFA'}
                      </span>
                   </div>
                   <Button 
                     onClick={handlePaymentRequest}
                     disabled={isSubmitting}
                     className="w-full h-14 rounded-2xl btn-glow font-black text-sm uppercase tracking-widest gap-2"
                   >
                      {isSubmitting ? "Enregistrement..." : "Générer la demande"} <ChevronRight size={18} />
                   </Button>
                </div>

                <div className="space-y-4">
                   <div className="flex items-center gap-3 text-[10px] font-black uppercase text-muted-foreground">
                      <ShieldCheck size={14} className="text-primary" /> Sécurisé par cryptage SSL
                   </div>
                   <div className="flex items-center gap-3 text-[10px] font-black uppercase text-muted-foreground">
                      <Info size={14} className="text-blue-500" /> Activation sous 2h max
                   </div>
                </div>
             </Card>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

const VendorSubscription = () => (
  <VendorGuard>{(vendor) => <VendorSubscriptionInner vendor={vendor} />}</VendorGuard>
);

export default VendorSubscription;

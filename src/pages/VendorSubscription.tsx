import { useState, useMemo } from "react";
import { motion } from "framer-motion";
import { 
  CreditCard, Wallet, History, Zap, ShieldCheck, 
  ArrowUpRight, ShoppingBag, Percent, RefreshCcw, 
  Clock, CheckCircle2, AlertCircle, TrendingUp,
  Download, Plus
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import { useCurrentVendor } from "@/hooks/useVendors";
import { useVendorSubscription } from "@/hooks/useSubscription";
import { useCredits } from "@/hooks/useCredits";
import { useVendorOrders } from "@/hooks/useVendorOrders";
import { formatCurrency } from "@/lib/currency";
import { Link } from "react-router-dom";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

const VendorSubscription = () => {
  const { data: vendor } = useCurrentVendor();
  const { 
    plan, status, credit_balance, max_products, product_count, 
    commission_rate, current_period_end, cancel_at_period_end, 
    monthly_credits, isLoading: subLoading 
  } = useVendorSubscription(vendor?.id);
  
  const { transactions, balance, isLoading: creditsLoading } = useCredits(vendor?.id);
  const { data: orders = [] } = useVendorOrders(vendor?.id ? [vendor.id] : []);

  const [isBuyCreditsOpen, setIsBuyCreditsOpen] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  // Calcul du gain potentiel si upgrade
  const vendorRevenue30d = useMemo(() => {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    return orders
      .filter(o => new Date(o.created_at) > thirtyDaysAgo && o.status !== 'cancelled')
      .reduce((acc, o) => acc + (o.vendor_revenue || 0), 0);
  }, [orders]);

  const potentialSavings = useMemo(() => {
    if (plan === 'elite') return 0;
    const currentRate = commission_rate || 0.10;
    const nextRate = plan === 'free' || plan === 'starter' ? 0.07 : 0.05;
    const grossTotal = vendorRevenue30d / (1 - currentRate);
    return grossTotal * (currentRate - nextRate);
  }, [plan, commission_rate, vendorRevenue30d]);

  const handleRequestUpgrade = async (targetPlan: string) => {
    setIsProcessing(true);
    try {
      const { error } = await supabase.from('vendor_subscriptions').upsert({
        vendor_id: vendor?.id,
        plan: targetPlan as any,
        status: 'active', // Simulé pour la démo, en réel passe en 'pending'
        payment_method: 'mobile_money'
      });
      if (error) throw error;
      toast.success("Demande enregistrée ! Notre équipe vous contactera pour le paiement.");
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setIsProcessing(false);
    }
  };

  if (subLoading || creditsLoading) {
    return (
      <DashboardLayout variant="vendor" title="Abonnement">
        <div className="space-y-8">
          <Skeleton className="h-64 w-full rounded-[2.5rem]" />
          <div className="grid md:grid-cols-2 gap-8">
            <Skeleton className="h-96 rounded-[2.5rem]" />
            <Skeleton className="h-96 rounded-[2.5rem]" />
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout variant="vendor" title="Gestion de l'Abonnement">
      <div className="max-w-6xl mx-auto space-y-10 pb-20">
        
        {/* 1. Main Status Card */}
        <div className="relative overflow-hidden glass-card rounded-[2.5rem] p-8 md:p-12 border border-white/5">
          <div className="absolute top-0 right-0 w-64 h-64 bg-primary/10 blur-[100px] -mr-32 -mt-32" />
          
          <div className="relative flex flex-col md:flex-row justify-between items-start md:items-center gap-8">
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <Badge className={`uppercase font-black px-4 py-1 text-[10px] tracking-widest ${
                  plan === 'elite' ? 'bg-amber-500 text-black' : 
                  plan === 'pro' ? 'bg-primary text-white' : 'bg-muted'
                }`}>
                  Plan {plan}
                </Badge>
                <Badge variant="outline" className="text-emerald-500 border-emerald-500/20 uppercase font-black text-[9px]">
                  {status === 'active' ? '● Actif' : status}
                </Badge>
              </div>
              <h1 className="text-4xl md:text-5xl font-black tracking-tighter">
                Votre abonnement <span className="text-primary">{plan?.toUpperCase()}</span>
              </h1>
              <p className="text-muted-foreground font-medium flex items-center gap-2">
                <Clock size={16} /> Prochain renouvellement : {current_period_end ? new Date(current_period_end).toLocaleDateString() : 'Non défini'}
              </p>
            </div>

            <div className="flex flex-col items-center gap-2">
              <div className="text-center">
                <p className="text-[10px] font-black uppercase text-muted-foreground tracking-widest mb-1">Commission actuelle</p>
                <p className="text-4xl font-black">{(commission_rate * 100).toFixed(0)}%</p>
              </div>
              {plan !== 'elite' && (
                <Button asChild variant="link" className="text-primary font-black uppercase text-[10px] tracking-widest">
                  <Link to="/pricing">Réduire avec Elite</Link>
                </Button>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-12 pt-12 border-t border-white/5">
            <div className="space-y-4">
              <div className="flex justify-between text-[10px] font-black uppercase tracking-widest text-muted-foreground">
                <span>Utilisation Produits</span>
                <span>{product_count} / {max_products === -1 ? '∞' : max_products}</span>
              </div>
              <Progress value={max_products === -1 ? 10 : (product_count / max_products) * 100} className="h-2 bg-white/5" />
            </div>
            <div className="space-y-4">
              <div className="flex justify-between text-[10px] font-black uppercase tracking-widest text-muted-foreground">
                <span>Crédits IA Mensuels</span>
                <span>{credit_balance} / {monthly_credits}</span>
              </div>
              <Progress value={(credit_balance / (monthly_credits || 1)) * 100} className="h-2 bg-white/5" />
            </div>
            <div className="flex items-center justify-end gap-4">
               {plan !== 'free' && (
                 <Button variant="ghost" className="rounded-xl text-muted-foreground font-bold text-xs">
                   Annuler l'abonnement
                 </Button>
               )}
               <Button asChild className="rounded-xl font-black uppercase text-[10px] tracking-widest px-8 h-12 shadow-lg shadow-primary/20">
                 <Link to="/pricing">Changer de plan</Link>
               </Button>
            </div>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          
          {/* 2. Credits Management */}
          <div className="lg:col-span-2 space-y-8">
            <div className="stat-card rounded-[2.5rem] p-8 border-glow h-full flex flex-col">
              <div className="flex justify-between items-center mb-8">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary"><Wallet size={20} /></div>
                  <h3 className="text-xl font-black tracking-tight">Solde de Crédits</h3>
                </div>
                <Button onClick={() => setIsBuyCreditsOpen(true)} className="rounded-xl font-black uppercase text-[10px] tracking-widest gap-2">
                  <Plus size={16} /> Acheter des crédits
                </Button>
              </div>

              <div className="flex items-end gap-4 mb-10">
                <span className="text-6xl font-black tracking-tighter">{balance.toLocaleString()}</span>
                <span className="text-muted-foreground font-bold mb-2 uppercase text-sm tracking-widest">Crédits disponibles</span>
              </div>

              <div className="space-y-4 mt-auto">
                <h4 className="text-[10px] font-black uppercase text-muted-foreground tracking-widest">Historique récent</h4>
                <div className="space-y-2">
                  {transactions.length === 0 ? (
                    <div className="p-8 text-center border-2 border-dashed border-white/5 rounded-2xl opacity-50">
                      <p className="text-xs font-bold uppercase tracking-widest">Aucune transaction</p>
                    </div>
                  ) : transactions.map((tx) => (
                    <div key={tx.id} className="flex items-center justify-between p-4 rounded-2xl bg-white/5 border border-white/5 group hover:border-primary/20 transition-all">
                      <div className="flex items-center gap-4">
                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                          tx.amount > 0 ? 'bg-emerald-500/10 text-emerald-500' : 'bg-destructive/10 text-destructive'
                        }`}>
                          {tx.amount > 0 ? <Plus size={14} /> : <TrendingUp className="rotate-180" size={14} />}
                        </div>
                        <div>
                          <p className="text-xs font-bold text-foreground line-clamp-1">{tx.description}</p>
                          <p className="text-[9px] text-muted-foreground font-black uppercase tracking-tighter">{new Date(tx.created_at).toLocaleString()}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className={`text-sm font-black ${tx.amount > 0 ? 'text-emerald-500' : 'text-destructive'}`}>
                          {tx.amount > 0 ? '+' : ''}{tx.amount}
                        </p>
                        <p className="text-[9px] font-bold text-muted-foreground">{tx.balance_after} solde</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* 3. Upgrade Motivation & Savings */}
          <div className="space-y-8">
            <div className="stat-card rounded-[2.5rem] p-8 border-glow bg-gradient-to-br from-primary/20 via-card to-card">
              <h3 className="text-xl font-black tracking-tight mb-6">Optimisez vos profits</h3>
              <div className="space-y-6">
                <div className="p-6 rounded-2xl bg-white/5 border border-white/10 text-center">
                  <p className="text-[10px] font-black uppercase text-muted-foreground tracking-widest mb-2">Revenus 30 derniers jours</p>
                  <p className="text-3xl font-black">{formatCurrency(vendorRevenue30d)}</p>
                </div>

                {potentialSavings > 0 && (
                  <motion.div 
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="p-6 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-center space-y-2"
                  >
                    <p className="text-[10px] font-black uppercase text-emerald-500 tracking-widest">Gain potentiel (Upgrade)</p>
                    <p className="text-2xl font-black text-emerald-500">+{formatCurrency(potentialSavings)} / mois</p>
                    <p className="text-[9px] font-bold text-emerald-500/70 italic leading-tight">
                      En passant au plan supérieur, vous économisez sur les commissions dès aujourd'hui.
                    </p>
                  </motion.div>
                )}

                <Button asChild className="w-full rounded-xl h-14 font-black uppercase tracking-widest text-[10px] shadow-lg shadow-primary/30">
                  <Link to="/pricing">Voir tous les plans</Link>
                </Button>
              </div>
            </div>

            <div className="stat-card rounded-[2.5rem] p-8 border-glow">
              <h4 className="text-sm font-black uppercase tracking-widest mb-4 flex items-center gap-2">
                <ShieldCheck size={16} className="text-primary" /> Sécurité des paiements
              </h4>
              <p className="text-xs text-muted-foreground font-medium leading-relaxed">
                Toutes vos transactions sont cryptées et traitées via nos partenaires Mobile Money agréés (Orange, Wave, MTN). MindHubs ne stocke aucune coordonnée bancaire.
              </p>
            </div>
          </div>
        </div>

        {/* 4. Plan Comparison Table (Added as per user request) */}
        <section className="space-y-6 pt-10">
          <div className="flex items-center gap-4">
             <div className="h-10 w-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center"><Zap size={20} /></div>
             <h2 className="text-2xl font-black tracking-tighter">Choisissez votre puissance</h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { id: 'free', name: 'Free', price: '0', credits: '50', commission: '10%', features: ['1 produit'] },
              { id: 'starter', name: 'Starter', price: '4 900', credits: '200', commission: '10%', features: ['3 produits'] },
              { id: 'pro', name: 'Pro', price: '14 900', credits: '800', commission: '7%', features: ['20 produits', 'Ads Studio'] },
              { id: 'elite', name: 'Elite', price: '29 900', credits: '2 500', commission: '5%', features: ['Illimité', 'Placement Prioritaire'] },
            ].map((p) => (
              <div key={p.id} className={`stat-card p-6 rounded-[2rem] border border-white/5 flex flex-col justify-between ${p.id === plan ? 'bg-primary/5 border-primary/30 ring-1 ring-primary/20' : ''}`}>
                <div>
                  <div className="flex justify-between items-center mb-4">
                    <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">{p.name}</p>
                    {p.id === plan && <Badge className="bg-primary text-white text-[8px] font-black">Actuel</Badge>}
                  </div>
                  <div className="mb-4">
                    <span className="text-2xl font-black tracking-tighter">{p.price}</span>
                    <span className="text-[10px] font-bold text-muted-foreground ml-1">FCFA/m</span>
                  </div>
                  <div className="space-y-2 mb-6">
                    {p.features.map((f, i) => (
                      <div key={i} className="flex items-center gap-2 text-[10px] font-medium text-muted-foreground">
                        <CheckCircle2 size={12} className="text-emerald-500" /> {f}
                      </div>
                    ))}
                    <div className="flex items-center gap-2 text-[10px] font-medium text-muted-foreground">
                      <CheckCircle2 size={12} className="text-emerald-500" /> {p.credits} crédits
                    </div>
                    <div className="flex items-center gap-2 text-[10px] font-medium text-muted-foreground">
                      <CheckCircle2 size={12} className="text-emerald-500" /> {p.commission} commission
                    </div>
                  </div>
                </div>
                {p.id !== plan && (
                  <Button asChild variant="outline" className="w-full h-10 rounded-xl font-black uppercase text-[9px] tracking-widest">
                    <Link to="/pricing">Choisir</Link>
                  </Button>
                )}
              </div>
            ))}
          </div>
        </section>
      </div>

      {/* Buy Credits Dialog */}
      <Dialog open={isBuyCreditsOpen} onOpenChange={setIsBuyCreditsOpen}>
        <DialogContent className="glass-card border-white/10 text-white rounded-[2rem] max-w-2xl overflow-hidden p-0">
          <div className="p-8 space-y-6">
             <DialogHeader>
                <DialogTitle className="text-3xl font-black tracking-tighter uppercase">Recharger vos crédits</DialogTitle>
                <DialogDescription className="text-muted-foreground font-medium">
                   Choisissez le pack qui correspond à vos besoins actuels.
                </DialogDescription>
             </DialogHeader>

             <div className="grid md:grid-cols-3 gap-4 py-4">
                {[
                  { id: 'pack-1', credits: 500,  price: 3500, label: 'Essentiel' },
                  { id: 'pack-2', credits: 1000, price: 6000, label: 'Boosté', highlight: true },
                  { id: 'pack-3', credits: 3000, price: 15000, label: 'Puissance' },
                ].map((pack) => (
                  <button
                    key={pack.id}
                    onClick={() => handleRequestUpgrade(pack.id)}
                    className={`p-6 rounded-2xl text-left transition-all border-2 flex flex-col justify-between h-48 ${
                      pack.highlight ? 'border-primary bg-primary/10' : 'border-white/5 bg-white/5 hover:border-primary/50'
                    }`}
                  >
                    <div>
                       <p className="text-[9px] font-black uppercase text-muted-foreground mb-1">{pack.label}</p>
                       <p className="text-3xl font-black">{pack.credits} <span className="text-xs">Crédits</span></p>
                    </div>
                    <p className="text-sm font-black text-primary">{pack.price.toLocaleString()} FCFA</p>
                  </button>
                ))}
             </div>

             <DialogFooter className="flex-col sm:flex-row gap-4">
                <p className="text-[10px] text-muted-foreground font-medium mr-auto">
                   * Une demande de paiement Mobile Money sera envoyée à votre numéro.
                </p>
                <Button variant="ghost" onClick={() => setIsBuyCreditsOpen(false)} className="rounded-xl font-black uppercase text-[10px]">
                   Annuler
                </Button>
             </DialogFooter>
          </div>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
};

export default VendorSubscription;

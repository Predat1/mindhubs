import { useState, useMemo } from "react";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import SEO from "@/components/SEO";
import { useVendorSubscription } from "@/hooks/useSubscription";
import { useCredits } from "@/hooks/useCredits";
import { useCurrentVendor } from "@/hooks/useVendors";
import { useVendorOrders } from "@/hooks/useVendorOrders";
import { motion } from "framer-motion";
import { 
  CreditCard, Zap, Check, AlertCircle, ArrowUpRight, 
  History, Wallet, ShieldCheck, ChevronRight, Package,
  ExternalLink, MessageSquare, Info, Loader2
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { Link, useNavigate } from "react-router-dom";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";

// ─── CONFIGURATION DES PACKS DE CRÉDITS ───
const CREDIT_PACKS = [
  { credits: 500,  price_fcfa: 3500,  per_credit: '7 FCFA', label: 'Pack Essentiel' },
  { credits: 1000, price_fcfa: 6000,  per_credit: '6 FCFA', label: 'Pack Boosté', badge: 'Économisez 14%' },
  { credits: 3000, price_fcfa: 15000, per_credit: '5 FCFA', label: 'Pack Puissance', badge: 'Économisez 29%' },
];

export default function VendorSubscription() {
  const { data: vendor } = useCurrentVendor();
  const sub = useVendorSubscription(vendor?.id);
  const credits = useCredits(vendor?.id);
  const navigate = useNavigate();
  
  // Simulation de calcul de gain pour l'upgrade
  const { data: orders = [] } = useVendorOrders(vendor?.id, []); // On récupère les ventes pour estimer le gain de commission
  const vendorRevenue30d = useMemo(() => orders.reduce((sum, o) => sum + o.vendor_revenue, 0), [orders]);

  const [isPaymentDialogOpen, setIsPaymentDialogOpen] = useState(false);
  const [selectedPack, setSelectedPack] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const handleBuyCredits = (pack: any) => {
    setSelectedPack(pack);
    setIsPaymentDialogOpen(true);
  };

  const confirmPayment = async () => {
    setLoading(true);
    // WHY: Simulation d'enregistrement de demande. En production, ceci appellerait l'API FedaPay/CinetPay.
    await new Promise(resolve => setTimeout(resolve, 1500));
    setLoading(false);
    setIsPaymentDialogOpen(false);
    toast.success("Demande enregistrée !", {
      description: "Notre équipe valide votre transaction. Les crédits seront ajoutés sous 2h."
    });
  };

  const getRelativeTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' });
  };

  if (sub.isLoading || !vendor) {
    return (
      <DashboardLayout variant="vendor">
        <div className="flex h-[60vh] items-center justify-center">
          <Loader2 className="animate-spin text-primary" size={40} />
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout variant="vendor">
      <SEO title="Mon Abonnement | MindHubs" description="Gérez votre plan et vos crédits IA." />
      
      <div className="max-w-6xl mx-auto space-y-10 pb-20">
        <header className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div className="space-y-1">
             <h1 className="text-4xl font-black tracking-tighter">Gestion de l'Abonnement</h1>
             <p className="text-zinc-400">Gérez vos limites de produits et votre puissance de création IA.</p>
          </div>
          <Badge className="bg-emerald-500/10 text-emerald-500 border-emerald-500/20 px-4 py-2 font-black uppercase text-[10px] tracking-widest">
            Compte Vendeur Vérifié
          </Badge>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Section 1: Plan Actuel */}
          <div className="lg:col-span-2 space-y-8">
            <div className="glass-card p-8 rounded-[2.5rem] border border-white/5 bg-gradient-to-br from-zinc-900 to-black relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 blur-[100px] -translate-y-1/2 translate-x-1/2" />
              
              <div className="relative z-10 flex flex-col md:flex-row gap-8">
                <div className="flex-1 space-y-6">
                  <div className="space-y-1">
                    <p className="text-[10px] font-black uppercase tracking-widest text-primary">Votre Plan Actuel</p>
                    <div className="flex items-center gap-3">
                      <h2 className="text-4xl font-black uppercase tracking-tighter">{sub.plan}</h2>
                      {sub.badge && <Badge className="bg-primary text-black font-black uppercase text-[9px]">{sub.badge}</Badge>}
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="p-4 rounded-2xl bg-white/5 border border-white/5">
                      <p className="text-[9px] font-black text-zinc-500 uppercase mb-1">Commission</p>
                      <p className="text-xl font-black">{Math.round(sub.commissionRate * 100)}%</p>
                    </div>
                    <div className="p-4 rounded-2xl bg-white/5 border border-white/5">
                      <p className="text-[9px] font-black text-zinc-500 uppercase mb-1">Status</p>
                      <p className="text-xl font-black text-emerald-500 capitalize">{sub.status}</p>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="flex justify-between text-[10px] font-black uppercase">
                      <span className="text-zinc-400">Utilisation produits</span>
                      <span>{sub.productCount} / {sub.maxProducts === -1 ? '∞' : sub.maxProducts}</span>
                    </div>
                    <Progress value={sub.maxProducts === -1 ? 100 : (sub.productCount / sub.maxProducts) * 100} className="h-2 bg-white/5" />
                  </div>
                </div>

                <div className="w-full md:w-64 p-6 rounded-[2rem] bg-white/5 border border-white/10 flex flex-col justify-between gap-6">
                  <div className="space-y-4">
                    <h4 className="text-xs font-black uppercase tracking-widest text-zinc-400">Renouvellement</h4>
                    <p className="text-sm font-bold">Prochain cycle : <br/><span className="text-white">Dans 24 jours</span></p>
                  </div>
                  {sub.plan !== 'free' && (
                    <Button variant="ghost" className="w-full text-[10px] font-black uppercase text-zinc-500 hover:text-destructive">
                      Annuler l'abonnement
                    </Button>
                  )}
                  {sub.plan === 'free' && (
                    <Button asChild className="w-full h-12 bg-primary text-black font-black uppercase tracking-widest text-[10px] rounded-xl shadow-[0_0_20px_rgba(212,175,55,0.2)]">
                      <Link to="/pricing">Upgrader Maintenant</Link>
                    </Button>
                  )}
                </div>
              </div>
            </div>

            {/* Section 2: Credit Balance */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
               <div className="glass-card p-8 rounded-[2.5rem] border border-white/5 flex flex-col justify-between">
                  <div className="space-y-2 mb-8">
                     <div className="flex items-center gap-2 text-primary">
                        <Zap size={18} fill="currentColor" />
                        <span className="text-[10px] font-black uppercase tracking-widest">Solde de Crédits IA</span>
                     </div>
                     <h3 className="text-6xl font-black">{credits.balance}</h3>
                     <p className="text-xs text-zinc-500 font-bold">Valables sur tous les outils du Creator Lab</p>
                  </div>
                  <Button onClick={() => handleBuyCredits(null)} className="w-full h-12 bg-white/5 border border-white/10 hover:bg-white/10 text-white font-black uppercase tracking-widest text-[10px] rounded-xl">
                    Recharger des crédits
                  </Button>
               </div>

               <div className="glass-card p-8 rounded-[2.5rem] border border-white/5 space-y-6">
                  <h4 className="text-xs font-black uppercase tracking-widest text-zinc-400 mb-4">Gains Potentiels</h4>
                  {sub.plan !== 'elite' ? (
                    <div className="space-y-4">
                      <p className="text-sm text-zinc-300 leading-relaxed font-medium">
                        Passez au plan <span className="text-primary font-black uppercase">Elite</span> et économisez <span className="text-emerald-500 font-black">{(sub.commissionRate - 0.05) * 100}%</span> de commission.
                      </p>
                      <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/20">
                         <p className="text-[9px] font-black text-emerald-500/80 uppercase mb-1">Économie estimée / mois</p>
                         <p className="text-2xl font-black text-emerald-500">
                           + {Math.round(vendorRevenue30d * (sub.commissionRate - 0.05)).toLocaleString()} FCFA
                         </p>
                      </div>
                      <Button asChild variant="outline" className="w-full text-[10px] font-black uppercase tracking-widest h-10 rounded-xl">
                        <Link to="/pricing">Voir les détails</Link>
                      </Button>
                    </div>
                  ) : (
                    <div className="text-center py-6 space-y-3">
                       <Trophy className="mx-auto text-primary" size={40} />
                       <p className="text-sm font-black uppercase tracking-widest">Vous avez le meilleur plan !</p>
                       <p className="text-xs text-zinc-500">Toutes les fonctionnalités sont débloquées.</p>
                    </div>
                  )}
               </div>
            </div>

            {/* Section 4: History Table */}
            <div className="glass-card p-8 rounded-[2.5rem] border border-white/5 overflow-hidden">
               <div className="flex items-center justify-between mb-8">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-xl bg-white/5">
                      <History size={18} className="text-zinc-400" />
                    </div>
                    <h3 className="text-xl font-black">Historique des Crédits</h3>
                  </div>
               </div>

               <div className="overflow-x-auto">
                 <table className="w-full text-left">
                   <thead>
                     <tr className="text-[10px] font-black uppercase tracking-widest text-zinc-500 border-b border-white/5">
                       <th className="pb-4 px-2">Date</th>
                       <th className="pb-4 px-2">Type</th>
                       <th className="pb-4 px-2">Description</th>
                       <th className="pb-4 px-2">Montant</th>
                       <th className="pb-4 px-2">Solde</th>
                     </tr>
                   </thead>
                   <tbody className="divide-y divide-white/5">
                     {credits.transactions.length === 0 ? (
                       <tr>
                          <td colSpan={5} className="py-12 text-center text-xs text-zinc-500 font-bold uppercase tracking-widest">
                             Aucune transaction enregistrée
                          </td>
                       </tr>
                     ) : (
                       credits.transactions.map((tx) => (
                         <tr key={tx.id} className="text-xs group hover:bg-white/5 transition-colors">
                           <td className="py-4 px-2 text-zinc-400 font-medium">{getRelativeTime(tx.created_at)}</td>
                           <td className="py-4 px-2">
                             <Badge className={`text-[9px] font-black uppercase ${
                               tx.type === 'spend' ? 'bg-rose-500/10 text-rose-500 border-rose-500/20' :
                               tx.type === 'monthly_grant' ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20' :
                               'bg-blue-500/10 text-blue-500 border-blue-500/20'
                             }`}>
                               {tx.type === 'spend' ? 'Débit' : tx.type === 'monthly_grant' ? 'Allocation' : 'Achat'}
                             </Badge>
                           </td>
                           <td className="py-4 px-2 font-bold text-zinc-300">{tx.description}</td>
                           <td className={`py-4 px-2 font-black ${tx.amount < 0 ? 'text-rose-500' : 'text-emerald-500'}`}>
                             {tx.amount > 0 ? '+' : ''}{tx.amount}
                           </td>
                           <td className="py-4 px-2 font-black text-white">{tx.balance_after}</td>
                         </tr>
                       ))
                     )}
                   </tbody>
                 </table>
               </div>
            </div>
          </div>

          {/* Section 3: Recharge / Packs (Sidebar) */}
          <div className="space-y-8">
             <div className="glass-card p-8 rounded-[2.5rem] border border-white/5 space-y-6">
                <h3 className="text-xl font-black">Acheter des Crédits</h3>
                <div className="space-y-4">
                   {CREDIT_PACKS.map((pack, i) => (
                     <div 
                        key={i} 
                        onClick={() => handleBuyCredits(pack)}
                        className="p-5 rounded-2xl bg-white/5 border border-white/10 hover:border-primary transition-all cursor-pointer group relative overflow-hidden"
                     >
                        {pack.badge && (
                          <div className="absolute top-2 right-2 bg-emerald-500 text-white text-[8px] font-black uppercase px-1.5 py-0.5 rounded">
                            {pack.badge}
                          </div>
                        )}
                        <div className="flex justify-between items-center mb-1">
                           <p className="text-[10px] font-black text-zinc-500 uppercase">{pack.label}</p>
                           <p className="text-[10px] font-black text-primary uppercase">{pack.per_credit}</p>
                        </div>
                        <div className="flex justify-between items-end">
                           <div className="flex items-baseline gap-1">
                              <span className="text-2xl font-black">{pack.credits}</span>
                              <span className="text-xs font-bold text-zinc-400">crédits</span>
                           </div>
                           <p className="text-lg font-black">{pack.price_fcfa.toLocaleString()} FCFA</p>
                        </div>
                     </div>
                   ))}
                </div>
                <div className="p-4 rounded-2xl bg-primary/5 border border-primary/10">
                   <div className="flex items-start gap-2 text-primary">
                      <Info size={14} className="mt-0.5" />
                      <p className="text-[10px] font-medium leading-relaxed">
                        Les crédits achetés n'expirent qu'après 90 jours et peuvent être utilisés pour toutes les fonctions IA avancées.
                      </p>
                   </div>
                </div>
             </div>

             <div className="glass-card p-8 rounded-[2.5rem] border border-white/5 bg-zinc-900 flex flex-col gap-4">
                <div className="p-4 rounded-2xl bg-white/5">
                   <MessageSquare className="text-primary mb-4" size={24} />
                   <h4 className="font-bold mb-1">Besoin d'aide ?</h4>
                   <p className="text-xs text-zinc-400 mb-4">Un problème avec votre paiement ou votre abonnement ?</p>
                   <Button asChild variant="outline" className="w-full h-10 text-[10px] font-black uppercase rounded-xl border-white/10">
                      <a href="https://wa.me/22500000000" target="_blank" rel="noreferrer">Contacter le Support</a>
                   </Button>
                </div>
             </div>
          </div>
        </div>
      </div>

      {/* Payment Dialog */}
      <Dialog open={isPaymentDialogOpen} onOpenChange={setIsPaymentDialogOpen}>
        <DialogContent className="sm:max-w-[425px] glass-card border-white/10 text-white p-8 rounded-[2.5rem]">
          <DialogHeader>
            <DialogTitle className="text-2xl font-black uppercase tracking-tighter">
              {selectedPack ? `Recharge ${selectedPack.credits} crédits` : "Souscription Plan"}
            </DialogTitle>
            <DialogDescription className="text-zinc-400 font-medium">
              Veuillez confirmer votre mode de paiement pour finaliser la demande.
            </DialogDescription>
          </DialogHeader>

          <div className="py-6 space-y-6">
            {selectedPack && (
              <div className="p-4 rounded-2xl bg-white/5 border border-white/10 flex justify-between items-center">
                 <span className="text-sm font-bold">Total à payer</span>
                 <span className="text-2xl font-black text-primary">{selectedPack.price_fcfa.toLocaleString()} FCFA</span>
              </div>
            )}

            <div className="space-y-4">
               <p className="text-[10px] font-black uppercase tracking-widest text-zinc-500">Choisir une méthode</p>
               <div className="grid grid-cols-2 gap-3">
                  {['Wave', 'Orange Money', 'MTN MoMo', 'Carte Bancaire'].map((m) => (
                    <button key={m} className="p-4 rounded-xl bg-white/5 border border-white/10 text-[11px] font-bold text-center hover:border-primary transition-all">
                      {m}
                    </button>
                  ))}
               </div>
            </div>

            <div className="space-y-3 p-4 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-500">
               <div className="flex gap-2">
                 <AlertCircle size={14} className="mt-0.5 shrink-0" />
                 <p className="text-[10px] font-bold leading-relaxed">
                   Activation manuelle : après paiement, envoyez la capture au support via WhatsApp pour activation sous 2h.
                 </p>
               </div>
            </div>
          </div>

          <DialogFooter className="gap-3">
            <Button variant="ghost" onClick={() => setIsPaymentDialogOpen(false)} className="rounded-xl uppercase font-black text-[10px]">
              Annuler
            </Button>
            <Button 
              onClick={confirmPayment} 
              disabled={loading}
              className="bg-primary text-zinc-950 font-black uppercase tracking-widest text-[10px] px-8 rounded-xl h-12"
            >
              {loading ? <Loader2 className="animate-spin mr-2" size={14} /> : "Générer la demande"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
}

import { useState, useEffect } from "react";
import Navbar from "@/components/Navbar";
import FooterSection from "@/components/FooterSection";
import SEO from "@/components/SEO";
import { motion, AnimatePresence } from "framer-motion";
import { Check, Zap, Star, ShieldCheck, Sparkles, ArrowRight, MessageCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { formatCurrency } from "@/lib/currency";

interface PlanLimit {
  plan: string;
  max_products: number;
  monthly_credits: number;
  commission_rate: number;
  price_fcfa_monthly: number;
  price_fcfa_yearly: number;
  ads_studio: boolean;
  creator_lab_full: boolean;
  priority_placement: boolean;
  whatsapp_support: boolean;
  badge: string | null;
}

const Pricing = () => {
  const [isYearly, setIsYearly] = useState(false);
  const [plans, setPlans] = useState<PlanLimit[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const { user } = useAuth();

  useEffect(() => {
    const fetchPlans = async () => {
      const { data, error } = await (supabase as any).from('plan_limits').select('*');
      if (!error && data) {
        // Sort plans in order: free, starter, pro, elite
        const order = ['free', 'starter', 'pro', 'elite'];
        const sorted = [...data].sort((a, b) => order.indexOf(a.plan) - order.indexOf(b.plan));
        setPlans(sorted);
      }
      setLoading(false);
    };
    fetchPlans();
  }, []);

  const CREDIT_PACKS = [
    { credits: 500,  price_fcfa: 3500,  per_credit: '7 FCFA/crédit', label: 'Pack Essentiel' },
    { credits: 1000, price_fcfa: 6000,  per_credit: '6 FCFA/crédit', label: 'Pack Boosté', badge: 'Économisez 14%' },
    { credits: 3000, price_fcfa: 15000, per_credit: '5 FCFA/crédit', label: 'Pack Puissance', badge: 'Économisez 29%' },
  ];

  const getPlanFeatures = (plan: PlanLimit) => {
    const baseFeatures = [
      plan.max_products === -1 ? 'Produits illimités' : `${plan.max_products} produit${plan.max_products > 1 ? 's' : ''}`,
      `${plan.monthly_credits} crédits IA / mois`,
      `Commission MindHubs ${ (plan.commission_rate * 100).toFixed(0) }%`,
      'Boutique publique personnalisée',
      'Analytics en temps réel'
    ];

    if (plan.plan === 'free') {
      return [...baseFeatures, 'Accès limité au Creator Lab', 'Support par email'];
    }
    if (plan.plan === 'starter') {
      return [...baseFeatures, 'Creator Lab (Veille + Validation)', 'Support prioritaire'];
    }
    if (plan.plan === 'pro') {
      return [...baseFeatures, 'Creator Lab Complet', 'Ads Studio Illimité', 'Badge Vendeur Pro', 'Analytics Avancées'];
    }
    if (plan.plan === 'elite') {
      return [...baseFeatures, 'Tout le plan Pro inclus', 'Placement prioritaire', 'Support WhatsApp Dédié', 'Avant-premières'];
    }
    return baseFeatures;
  };

  const handlePlanAction = (planName: string) => {
    if (!user) {
      navigate('/mon-compte');
      return;
    }
    navigate('/dashboard/abonnement', { state: { selectedPlan: planName, billing: isYearly ? 'yearly' : 'monthly' } });
  };

  return (
    <div className="min-h-screen bg-background aurora-bg">
      <Navbar />
      <SEO title="Tarifs & Plans — Propulsez votre boutique" description="Découvrez nos plans pour vendeurs et libérez la puissance de l'IA MindHubs." path="/pricing" />

      <main className="container mx-auto px-4 pt-36 pb-20">
        {/* Hero Section */}
        <div className="text-center space-y-6 max-w-3xl mx-auto mb-16">
           <motion.div
             initial={{ opacity: 0, y: 20 }}
             animate={{ opacity: 1, y: 0 }}
             className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs font-black uppercase tracking-widest"
           >
              <Zap size={14} fill="currentColor" /> Tarification Transparente
           </motion.div>
           <h1 className="text-5xl md:text-7xl font-black tracking-tighter leading-[0.9]">
              Choisissez votre <span className="text-primary">puissance</span> de frappe
           </h1>
           <p className="text-muted-foreground text-lg font-medium">
              Du créateur débutant à l'empire digital, il y a un plan pour chaque ambition.
           </p>

           {/* Yearly/Monthly Toggle */}
           <div className="flex items-center justify-center gap-4 pt-6">
              <span className={`text-sm font-bold ${!isYearly ? "text-foreground" : "text-muted-foreground"}`}>Mensuel</span>
              <button 
                onClick={() => setIsYearly(!isYearly)}
                className="relative w-14 h-7 bg-white/5 border border-white/10 rounded-full p-1 transition-colors hover:border-primary/50"
              >
                 <motion.div 
                   animate={{ x: isYearly ? 28 : 0 }}
                   className="w-5 h-5 bg-primary rounded-full shadow-lg shadow-primary/30"
                 />
              </button>
              <span className={`text-sm font-bold ${isYearly ? "text-foreground" : "text-muted-foreground"}`}>Annuel</span>
              <Badge className="bg-emerald-500/20 text-emerald-500 border-none font-black text-[10px] ml-2">
                 -2 MOIS GRATUITS
              </Badge>
           </div>
        </div>

        {loading ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
             {[1,2,3,4].map(i => (
               <Card key={i} className="glass-card h-[600px] animate-pulse" />
             ))}
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-24">
             {plans.map((p, idx) => {
                const isPro = p.plan === 'pro';
                const price = isYearly ? p.price_fcfa_yearly : p.price_fcfa_monthly;
                const features = getPlanFeatures(p);

                return (
                  <motion.div
                    key={p.plan}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.1 }}
                  >
                    <Card className={`glass-card relative flex flex-col h-full border-white/5 overflow-hidden transition-all duration-500 group ${isPro ? "border-primary/50 scale-105 z-10 shadow-2xl shadow-primary/10" : "hover:border-white/20"}`}>
                       {isPro && (
                         <div className="absolute top-0 left-0 w-full h-1.5 bg-primary shadow-lg shadow-primary/50" />
                       )}
                       
                       <CardHeader className="space-y-4 text-center">
                          <div className="flex justify-center">
                             <Badge variant="outline" className={`border-none px-4 py-1 font-black text-[10px] uppercase tracking-widest ${isPro ? "bg-primary text-primary-foreground" : "bg-white/5 text-muted-foreground"}`}>
                                {p.plan === 'free' ? 'Gratuit' : p.plan === 'starter' ? 'Starter' : isPro ? '★ Pro' : '🏆 Elite'}
                             </Badge>
                          </div>
                          <div className="space-y-1">
                             <CardTitle className="text-3xl font-black uppercase tracking-tight">{p.plan}</CardTitle>
                             <CardDescription className="text-xs font-bold text-muted-foreground">{p.badge || (p.plan === 'free' ? 'Pour débuter' : p.plan === 'starter' ? 'Pour grandir' : '')}</CardDescription>
                          </div>
                          <div className="pt-4">
                             <span className="text-5xl font-black tracking-tighter">{formatCurrency(price)}</span>
                             {p.plan !== 'free' && <span className="text-muted-foreground text-sm font-bold">/{isYearly ? 'an' : 'mois'}</span>}
                          </div>
                       </CardHeader>

                       <CardContent className="flex-grow space-y-4">
                          <div className="w-full h-px bg-white/5 my-2" />
                          <ul className="space-y-4">
                             {features.map((f, i) => (
                               <li key={i} className="flex items-start gap-3 text-xs font-medium leading-relaxed group-hover:translate-x-1 transition-transform">
                                  <div className={`mt-0.5 p-0.5 rounded-full ${f.startsWith('—') ? "bg-white/5 text-muted-foreground" : "bg-primary/20 text-primary"}`}>
                                     {f.startsWith('—') ? <X size={10} /> : <Check size={10} />}
                                  </div>
                                  <span className={f.startsWith('—') ? "text-muted-foreground/60 line-through" : "text-foreground/80"}>
                                     {f.replace('— ', '')}
                                  </span>
                               </li>
                             ))}
                          </ul>
                       </CardContent>

                       <CardFooter className="pt-8">
                          <Button 
                            onClick={() => handlePlanAction(p.plan)}
                            className={`w-full h-14 rounded-2xl font-black text-sm uppercase tracking-widest gap-2 transition-all ${isPro ? "btn-glow shadow-primary/20" : "bg-white/5 hover:bg-white/10 text-foreground"}`}
                          >
                             {p.plan === 'free' ? 'Commencer Gratuitement' : `Démarrer ${p.plan}`}
                             <ArrowRight size={16} />
                          </Button>
                       </CardFooter>
                    </Card>
                  </motion.div>
                );
             })}
          </div>
        )}

        {/* Credit Packs */}
        <div className="space-y-12">
           <div className="text-center space-y-4">
              <h2 className="text-4xl font-black tracking-tighter">Besoin de plus de <span className="text-primary">carburant IA</span> ?</h2>
              <p className="text-muted-foreground font-medium">Rechargez vos crédits à la carte, sans engagement.</p>
           </div>

           <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
              {CREDIT_PACKS.map((pack, i) => (
                <Card key={i} className="glass-card border-white/5 hover:border-primary/30 transition-all group relative overflow-hidden">
                   {pack.badge && (
                     <Badge className="absolute -right-12 top-6 rotate-45 bg-emerald-500 text-white border-none px-12 py-1 font-black text-[10px] tracking-widest">
                        {pack.badge}
                     </Badge>
                   )}
                   <CardHeader className="text-center space-y-2">
                      <p className="text-xs font-black text-muted-foreground uppercase tracking-widest">{pack.label}</p>
                      <CardTitle className="text-4xl font-black">{pack.credits} <span className="text-primary">Crédits</span></CardTitle>
                   </CardHeader>
                   <CardContent className="text-center space-y-4">
                      <div className="text-2xl font-black">{formatCurrency(pack.price_fcfa)}</div>
                      <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">{pack.per_credit}</p>
                      <div className="w-full h-px bg-white/5" />
                      <ul className="text-left space-y-3 pt-2">
                         {['Valables 90 jours', 'Cumulables', 'Tous plans compatibles'].map((f, j) => (
                           <li key={j} className="flex items-center gap-2 text-[10px] font-black uppercase text-muted-foreground">
                              <Check size={12} className="text-emerald-500" /> {f}
                           </li>
                         ))}
                      </ul>
                   </CardContent>
                   <CardFooter>
                      <Button 
                        onClick={() => handlePlanAction('credits')}
                        variant="outline" 
                        className="w-full h-12 rounded-xl border-white/10 font-black text-xs uppercase tracking-widest hover:bg-primary/10 hover:text-primary hover:border-primary/50"
                      >
                         Acheter le pack
                      </Button>
                   </CardFooter>
                </Card>
              ))}
           </div>
        </div>

        {/* FAQ Section */}
        <div className="mt-32 max-w-4xl mx-auto space-y-12">
           <div className="text-center space-y-4">
              <h2 className="text-3xl font-black tracking-tighter">Questions Fréquentes</h2>
              <p className="text-muted-foreground font-medium">Tout ce que vous devez savoir sur notre tarification.</p>
           </div>
           <div className="grid md:grid-cols-2 gap-8">
              {[
                { q: "Comment fonctionnent les crédits IA ?", a: "Chaque action du Creator Lab ou Ads Studio consomme un nombre spécifique de crédits. Ils sont renouvelés chaque mois selon votre plan." },
                { q: "Puis-je changer de plan à tout moment ?", a: "Oui, vous pouvez passer à un plan supérieur instantanément. La réduction de plan prend effet à la fin de la période en cours." },
                { q: "Quelles méthodes de paiement acceptez-vous ?", a: "Nous acceptons Orange Money, Wave, MTN Mobile Money et les cartes bancaires via nos partenaires sécurisés." },
                { q: "Que se passe-t-il si je n'utilise pas tous mes crédits ?", a: "Nous autorisons un rollover (report) de 30% de vos crédits restants sur le mois suivant pour éviter toute perte." },
                { q: "La commission est-elle prélevée sur le brut ?", a: "La commission est calculée sur le montant total de la vente et automatiquement déduite de votre solde vendeur." }
              ].map((faq, i) => (
                <div key={i} className="space-y-2">
                   <h4 className="font-black text-lg flex items-center gap-3"><MessageCircle size={18} className="text-primary" /> {faq.q}</h4>
                   <p className="text-sm text-muted-foreground leading-relaxed pl-7">{faq.a}</p>
                </div>
              ))}
           </div>
        </div>

        {/* Final CTA */}
        <div className="mt-32 p-12 glass-card border-primary/20 rounded-[3rem] text-center space-y-8 relative overflow-hidden">
           <div className="absolute top-0 right-0 p-12 opacity-5 pointer-events-none">
              <Sparkles size={120} className="text-primary" />
           </div>
           <h2 className="text-4xl md:text-5xl font-black tracking-tighter">Prêt à devenir un <span className="text-primary">vendeur d'élite</span> ?</h2>
           <p className="text-muted-foreground max-w-xl mx-auto font-medium">
              Rejoignez les meilleurs entrepreneurs digitaux d'Afrique francophone dès aujourd'hui.
           </p>
           <Button 
             onClick={() => handlePlanAction('pro')}
             className="h-16 px-12 rounded-[2rem] btn-glow font-black text-lg uppercase tracking-widest gap-4"
           >
              Lancer ma boutique maintenant <ArrowRight size={24} />
           </Button>
        </div>
      </main>

      <FooterSection />
    </div>
  );
};

export default Pricing;

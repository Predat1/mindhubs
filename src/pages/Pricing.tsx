import { useState, useEffect } from "react";
import { Navbar } from "@/components/Navbar";
import FooterSection from "@/components/FooterSection";
import SEO from "@/components/SEO";
import { motion, AnimatePresence } from "framer-motion";
import { Check, Zap, Sparkles, Trophy, Star, ArrowRight, Info, HelpCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Link, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

// ─── CONFIGURATION DES PACKS DE CRÉDITS ───
const CREDIT_PACKS = [
  { credits: 500,  price_fcfa: 3500,  per_credit: '7 FCFA', label: 'Pack Essentiel' },
  { credits: 1000, price_fcfa: 6000,  per_credit: '6 FCFA', label: 'Pack Boosté', badge: 'Économisez 14%' },
  { credits: 3000, price_fcfa: 15000, per_credit: '5 FCFA', label: 'Pack Puissance', badge: 'Économisez 29%' },
];

export default function Pricing() {
  const [billingCycle, setBillingCycle] = useState<"monthly" | "yearly">("monthly");
  const [plans, setPlans] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    async function fetchPlans() {
      const { data, error } = await supabase
        .from('plan_limits')
        .select('*')
        .order('price_fcfa_monthly', { ascending: true });
      
      if (!error && data) {
        // Formater les données pour l'affichage
        const formattedPlans = data.map(p => {
          const base = {
            id: p.plan,
            name: p.plan === 'free' ? 'Gratuit' : p.plan.charAt(0).toUpperCase() + p.plan.slice(1),
            price_monthly: p.price_fcfa_monthly,
            price_yearly: p.price_fcfa_yearly,
            highlight: p.plan === 'pro',
            badge: p.badge,
            cta: p.plan === 'free' ? 'Commencer gratuitement' : `Démarrer ${p.plan.charAt(0).toUpperCase() + p.plan.slice(1)}`,
            features: [
              p.max_products === -1 ? 'Produits illimités' : `${p.max_products} produit${p.max_products > 1 ? 's' : ''} maximum`,
              `${p.monthly_credits} crédits IA / mois`,
              `Commission ${Math.round(p.commission_rate * 100)}%`,
              'Boutique publique premium',
              p.ads_studio ? 'Ads Studio inclus' : '— Ads Studio non inclus',
              p.creator_lab_full ? 'Creator Lab complet (4 étapes)' : p.plan === 'free' ? 'Creator Lab (veille seulement)' : 'Creator Lab (veille + validation)',
              p.priority_placement ? 'Placement prioritaire' : '— Placement standard',
              p.whatsapp_support ? 'Support WhatsApp dédié' : '— Support email standard',
            ]
          };
          return base;
        });
        setPlans(formattedPlans);
      }
      setLoading(false);
    }
    fetchPlans();
  }, []);

  return (
    <div className="min-h-screen bg-zinc-950 text-white font-outfit">
      <SEO title="Tarifs | MindHubs" description="Choisissez le plan qui correspond à votre ambition de créateur." />
      <Navbar />

      <main className="pt-32 pb-24 px-4 overflow-hidden relative">
        {/* Background Gradients */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-[600px] bg-primary/5 blur-[120px] rounded-full pointer-events-none" />
        
        <div className="max-w-7xl mx-auto space-y-20 relative z-10">
          {/* Hero Header */}
          <div className="text-center space-y-6 max-w-3xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <Badge variant="outline" className="px-4 py-1.5 border-primary/20 bg-primary/5 text-primary text-xs font-black uppercase tracking-widest mb-4">
                Tarification transparente
              </Badge>
              <h1 className="text-5xl md:text-7xl font-black tracking-tighter leading-none mb-6">
                Propulsez votre business <span className="text-gradient-primary">au niveau supérieur.</span>
              </h1>
              <p className="text-xl text-zinc-400">
                Du créateur solo à l'empire digital, nous avons le plan parfait pour automatiser votre croissance en Afrique.
              </p>
            </motion.div>

            {/* Billing Toggle */}
            <div className="flex items-center justify-center gap-4 mt-12">
              <span className={`text-sm font-bold ${billingCycle === 'monthly' ? 'text-white' : 'text-zinc-500'}`}>Mensuel</span>
              <button 
                onClick={() => setBillingCycle(billingCycle === 'monthly' ? 'yearly' : 'monthly')}
                className="relative w-14 h-7 bg-white/10 rounded-full p-1 transition-colors hover:bg-white/20"
              >
                <motion.div 
                  animate={{ x: billingCycle === 'monthly' ? 0 : 28 }}
                  className="w-5 h-5 bg-primary rounded-full shadow-[0_0_10px_hsl(var(--primary))]" 
                />
              </button>
              <span className={`text-sm font-bold ${billingCycle === 'yearly' ? 'text-white' : 'text-zinc-500'}`}>
                Annuel <span className="text-emerald-500 ml-1 text-xs">-2 mois offerts</span>
              </span>
            </div>
          </div>

          {/* Pricing Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {loading ? (
              Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="h-[600px] rounded-[2.5rem] bg-white/5 animate-pulse border border-white/10" />
              ))
            ) : (
              plans.map((p, idx) => (
                <motion.div
                  key={p.id}
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.1 }}
                  className={`relative group h-full flex flex-col p-8 rounded-[2.5rem] border transition-all duration-500 ${
                    p.highlight 
                      ? 'bg-zinc-900 border-primary shadow-[0_0_40px_rgba(212,175,55,0.1)]' 
                      : 'bg-white/5 border-white/10 hover:border-white/20'
                  }`}
                >
                  {p.badge && (
                    <div className="absolute -top-4 left-1/2 -translate-x-1/2 px-4 py-1 bg-primary text-zinc-950 text-[10px] font-black uppercase tracking-widest rounded-full shadow-lg">
                      {p.badge}
                    </div>
                  )}

                  <div className="mb-8">
                    <h3 className="text-xl font-black mb-2">{p.name}</h3>
                    <div className="flex items-baseline gap-1">
                      <span className="text-4xl font-black">
                        {(billingCycle === 'monthly' ? p.price_monthly : p.price_yearly / 12).toLocaleString()}
                      </span>
                      <span className="text-zinc-500 font-bold text-sm">FCFA / mois</span>
                    </div>
                    {billingCycle === 'yearly' && p.price_yearly > 0 && (
                      <p className="text-[10px] text-emerald-500 font-black mt-1 uppercase">Facturé {p.price_yearly.toLocaleString()} FCFA / an</p>
                    )}
                  </div>

                  <div className="space-y-4 mb-10 flex-1">
                    {p.features.map((f: string, i: number) => (
                      <div key={i} className="flex items-start gap-3 group/item">
                        {f.startsWith('—') ? (
                          <div className="mt-1 shrink-0 w-4 h-4 rounded-full border border-white/10 flex items-center justify-center opacity-30">
                            <Check size={10} className="hidden" />
                          </div>
                        ) : (
                          <div className="mt-1 shrink-0 w-4 h-4 rounded-full bg-emerald-500/20 flex items-center justify-center text-emerald-500">
                            <Check size={10} />
                          </div>
                        )}
                        <span className={`text-xs font-medium leading-relaxed ${f.startsWith('—') ? 'text-zinc-600' : 'text-zinc-300'}`}>
                          {f.replace('— ', '')}
                        </span>
                      </div>
                    ))}
                  </div>

                  <Button
                    asChild
                    variant={p.highlight ? "default" : "outline"}
                    className={`w-full py-6 rounded-2xl font-black uppercase tracking-widest text-[11px] group-hover:scale-105 transition-all ${
                      p.highlight ? 'bg-primary text-zinc-950 hover:bg-primary/90' : 'border-white/10 hover:bg-white/5'
                    }`}
                  >
                    <Link to={p.id === 'free' ? "/dashboard" : "/dashboard/abonnement"}>
                      {p.cta} <ArrowRight size={14} className="ml-2 group-hover:translate-x-1 transition-transform" />
                    </Link>
                  </Button>
                </motion.div>
              ))
            )}
          </div>

          {/* Credit Packs Section */}
          <div className="pt-20 space-y-12">
            <div className="text-center space-y-4">
              <h2 className="text-3xl md:text-5xl font-black tracking-tighter">Besoin de <span className="text-gradient-primary">plus de puissance ?</span></h2>
              <p className="text-zinc-400 max-w-2xl mx-auto">
                Vos crédits IA sont épuisés ? Rechargez votre compte à la carte. Valables 90 jours et cumulables avec tous les plans.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
              {CREDIT_PACKS.map((pack, i) => (
                <div key={i} className="glass-card p-8 rounded-[2rem] border border-white/5 hover:border-primary/30 transition-all group relative overflow-hidden">
                  {pack.badge && (
                    <div className="absolute top-4 right-4 bg-emerald-500 text-white text-[9px] font-black uppercase px-2 py-1 rounded">
                      {pack.badge}
                    </div>
                  )}
                  <p className="text-[10px] font-black text-primary uppercase tracking-widest mb-1">{pack.label}</p>
                  <div className="flex items-baseline gap-2 mb-4">
                    <span className="text-4xl font-black">{pack.credits}</span>
                    <span className="text-zinc-500 font-bold">crédits</span>
                  </div>
                  <div className="flex items-center justify-between py-4 border-t border-white/5">
                    <span className="text-sm font-bold text-zinc-400">{pack.per_credit} / crédit</span>
                    <span className="text-xl font-black">{pack.price_fcfa.toLocaleString()} FCFA</span>
                  </div>
                  <Button asChild className="w-full bg-white text-zinc-950 hover:bg-primary hover:text-zinc-950 transition-colors font-black uppercase tracking-widest text-[10px] h-12 rounded-xl mt-4">
                    <Link to="/dashboard/abonnement">Acheter</Link>
                  </Button>
                </div>
              ))}
            </div>
          </div>

          {/* FAQ Section */}
          <div className="pt-20 max-w-3xl mx-auto space-y-12">
             <h2 className="text-center text-2xl font-black uppercase tracking-widest opacity-50">Questions Fréquentes</h2>
             <div className="space-y-6">
                {[
                  { q: "Comment payer mon abonnement ?", a: "Vous pouvez régler par Wave, Orange Money, MTN ou Carte Bancaire directement depuis votre dashboard vendeur." },
                  { q: "Puis-je changer de plan à tout moment ?", a: "Oui, vous pouvez upgrader vers un plan supérieur instantanément. La commission réduite s'appliquera sur vos prochaines ventes." },
                  { q: "Les crédits sont-ils renouvelés chaque mois ?", a: "Oui, votre allocation mensuelle est rechargée à la date anniversaire de votre abonnement." },
                  { q: "Que se passe-t-il si je dépasse ma limite de produits ?", a: "Vous ne pourrez plus publier de nouveaux produits tant que vous n'aurez pas libéré de l'espace ou upgradé votre plan." },
                  { q: "Comment fonctionne la commission ?", a: "MindHubs prélève sa part uniquement au moment de la vente. Le reste est ajouté instantanément à votre solde vendeur." }
                ].map((item, i) => (
                  <div key={i} className="p-6 rounded-2xl bg-white/5 border border-white/5">
                    <h4 className="font-bold mb-2 flex items-center gap-2">
                      <HelpCircle size={16} className="text-primary" /> {item.q}
                    </h4>
                    <p className="text-sm text-zinc-400 leading-relaxed">{item.a}</p>
                  </div>
                ))}
             </div>
          </div>

        </div>
      </main>

      <FooterSection />
    </div>
  );
}

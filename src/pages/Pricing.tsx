import { useState } from "react";
import Navbar from "@/components/Navbar";
import FooterSection from "@/components/FooterSection";
import SEO from "@/components/SEO";
import { motion, AnimatePresence } from "framer-motion";
import { Check, X, Sparkles, ArrowRight, HelpCircle, Rocket, Crown, Sprout, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Link } from "react-router-dom";
import { cn } from "@/lib/utils";

// --- CONFIGURATION DES PLANS STATIQUES ---
const PLANS = [
  {
    id: 'free', name: 'Free', badge: 'Débutant',
    price_monthly: 0, price_yearly: 0,
    tagline: 'Pour tester sans risque',
    highlight: false, highlight_label: null,
    features: [
      { label: '5 produits maximum',          included: true  },
      { label: '50 crédits IA / mois',         included: true  },
      { label: 'Commission 20%',               included: true  },
      { label: 'Boutique publique standard',   included: true  },
      { label: 'Support email',                included: true  },
      { label: 'Ads Studio',                   included: false },
      { label: 'Creator Lab',                  included: false },
      { label: 'Placement prioritaire',        included: false },
      { label: 'Accompagnement 1:1',           included: false },
    ],
    cta: 'Commencer gratuitement',
    cta_href: '/become-a-seller?plan=free',
  },
  {
    id: 'starter', name: 'Starter', badge: 'Recommandé',
    price_monthly: 4999, price_yearly: 49990,
    tagline: 'Pour lancer sérieusement',
    highlight: false, highlight_label: 'Économisez 2 mois',
    features: [
      { label: '20 produits maximum',          included: true  },
      { label: '200 crédits IA / mois',        included: true  },
      { label: 'Commission 15%',               included: true  },
      { label: 'Boutique publique standard',   included: true  },
      { label: 'Support prioritaire',          included: true  },
      { label: 'Ads Studio basique',           included: true  },
      { label: 'Creator Lab',                  included: false },
      { label: 'Placement prioritaire',        included: false },
      { label: 'Accompagnement 1:1',           included: false },
    ],
    cta: 'Choisir Starter',
    cta_href: '/become-a-seller?plan=starter',
  },
  {
    id: 'pro', name: 'Pro', badge: "L'excellence",
    price_monthly: 14999, price_yearly: 149990,
    tagline: 'Pour scaler vos ventes',
    highlight: true, highlight_label: '⭐ Le plus populaire',
    features: [
      { label: 'Produits illimités',           included: true  },
      { label: '1 000 crédits IA / mois',      included: true  },
      { label: 'Commission 10%',               included: true  },
      { label: 'Boutique publique premium',    included: true  },
      { label: 'Support prioritaire',          included: true  },
      { label: 'Ads Studio complet',           included: true  },
      { label: 'Creator Lab complet',          included: true  },
      { label: 'Placement prioritaire',        included: false },
      { label: 'Accompagnement 1:1',           included: false },
    ],
    cta: 'Passer à Pro',
    cta_href: '/become-a-seller?plan=pro',
  },
  {
    id: 'elite', name: 'Elite', badge: 'VIP',
    price_monthly: 29999, price_yearly: 299990,
    tagline: 'Pour dominer votre marché',
    highlight: false, highlight_label: '🏆 Tout inclus',
    features: [
      { label: 'Tout illimité',                included: true  },
      { label: '5 000 crédits IA / mois',      included: true  },
      { label: 'Commission 5%',                included: true  },
      { label: 'Boutique publique premium',    included: true  },
      { label: 'Support WhatsApp dédié',       included: true  },
      { label: 'Ads Studio complet',           included: true  },
      { label: 'Creator Lab complet',          included: true  },
      { label: 'Placement prioritaire',        included: true  },
      { label: 'Accompagnement 1:1',           included: true  },
    ],
    cta: 'Devenir Elite',
    cta_href: '/become-a-seller?plan=elite',
  },
];

const CREDIT_PACKS = [
  { credits: 500,  price_fcfa: 3500,  per_credit: '7 FCFA', label: 'Pack Essentiel' },
  { credits: 1000, price_fcfa: 6000,  per_credit: '6 FCFA', label: 'Pack Boosté', badge: 'Économisez 14%' },
  { credits: 3000, price_fcfa: 15000, per_credit: '5 FCFA', label: 'Pack Puissance', badge: 'Économisez 29%' },
];

export default function Pricing() {
  const [billingCycle, setBillingCycle] = useState<"monthly" | "yearly">("monthly");

  const formatPrice = (val: number) => {
    return val.toString().replace(/\B(?=(\d{3})+(?!\d))/g, " ");
  };

  return (
    <div className="min-h-screen bg-zinc-950 text-white font-outfit">
      <SEO 
        title="Tarifs | MindHubs" 
        description="Choisissez le plan qui correspond à votre ambition de créateur sur MindHubs." 
      />
      <Navbar />

      <main className="pt-32 pb-24 px-4 overflow-hidden relative">
        {/* Background Effects */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-[600px] bg-primary/5 blur-[120px] rounded-full pointer-events-none" />
        <div className="absolute top-1/2 right-0 w-64 h-64 bg-accent/5 blur-[100px] rounded-full pointer-events-none" />

        <div className="max-w-7xl mx-auto space-y-20 relative z-10">
          
          {/* Header */}
          <div className="text-center space-y-6 max-w-3xl mx-auto">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
              <Badge variant="outline" className="px-4 py-1.5 border-primary/20 bg-primary/5 text-primary text-xs font-black uppercase tracking-widest mb-4">
                Tarification transparente
              </Badge>
              <h1 className="text-5xl md:text-7xl font-black tracking-tighter leading-none mb-6">
                Propulsez votre business <span className="text-gradient-primary">au niveau supérieur.</span>
              </h1>
              <p className="text-xl text-zinc-400">
                Du créateur solo à l'empire digital, choisissez le plan parfait pour votre croissance en Afrique.
              </p>
            </motion.div>

            {/* Billing Toggle */}
            <div className="flex items-center justify-center gap-6 mt-12 bg-white/5 p-2 rounded-2xl w-fit mx-auto border border-white/5">
              <button 
                onClick={() => setBillingCycle("monthly")}
                className={cn(
                  "px-6 py-2.5 rounded-xl text-sm font-black transition-all relative",
                  billingCycle === "monthly" ? "text-zinc-950" : "text-zinc-400 hover:text-white"
                )}
              >
                {billingCycle === "monthly" && (
                  <motion.div 
                    layoutId="billing-toggle" 
                    className="absolute inset-0 bg-primary rounded-xl shadow-lg shadow-primary/20" 
                  />
                )}
                <span className="relative z-10">Mensuel</span>
              </button>
              <button 
                onClick={() => setBillingCycle("yearly")}
                className={cn(
                  "px-6 py-2.5 rounded-xl text-sm font-black transition-all relative",
                  billingCycle === "yearly" ? "text-zinc-950" : "text-zinc-400 hover:text-white"
                )}
              >
                {billingCycle === "yearly" && (
                  <motion.div 
                    layoutId="billing-toggle" 
                    className="absolute inset-0 bg-primary rounded-xl shadow-lg shadow-primary/20" 
                  />
                )}
                <span className="relative z-10">Annuel</span>
                {billingCycle === "monthly" && (
                  <Badge className="absolute -top-6 -right-4 bg-emerald-500 text-white border-none animate-bounce text-[9px] px-2 py-0.5">
                    -2 mois offerts
                  </Badge>
                )}
              </button>
            </div>
          </div>

          {/* Pricing Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 items-start">
            {PLANS.map((p, idx) => {
              const isYearly = billingCycle === "yearly";
              const currentMonthlyPrice = p.price_monthly;
              const yearlyMonthlyEquiv = Math.round(p.price_yearly / 12);
              
              return (
                <motion.div
                  key={p.id}
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.1 }}
                  whileHover={{ y: -4 }}
                  className={cn(
                    "relative flex flex-col p-8 rounded-[2rem] border transition-all duration-500",
                    p.highlight 
                      ? "bg-zinc-900 border-primary shadow-[0_0_40px_hsl(var(--primary)/0.25)] scale-[1.04] z-20" 
                      : "bg-white/5 border-border hover:border-white/20 z-10"
                  )}
                >
                  {p.highlight_label && (
                    <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-4 py-1 bg-primary text-zinc-950 text-[10px] font-black uppercase tracking-widest rounded-full shadow-lg whitespace-nowrap">
                      {p.highlight_label}
                    </div>
                  )}

                  <div className="mb-8">
                    <div className="flex items-center justify-between mb-2">
                       <h3 className="text-xl font-black">{p.name}</h3>
                       <Badge variant="outline" className="text-[10px] border-white/10 uppercase tracking-tighter opacity-70">
                          {p.badge}
                       </Badge>
                    </div>
                    <p className="text-zinc-500 text-xs font-bold mb-6">{p.tagline}</p>
                    
                    <div className="space-y-1">
                      <div className="flex items-baseline gap-1">
                        <span className="text-4xl font-black">
                          {formatPrice(isYearly ? yearlyMonthlyEquiv : currentMonthlyPrice)}
                        </span>
                        <span className="text-zinc-500 font-bold text-sm">FCFA / mois</span>
                      </div>
                      {isYearly && currentMonthlyPrice > 0 && (
                        <div className="flex items-center gap-2">
                           <span className="text-xs text-zinc-600 line-through font-bold">
                              {formatPrice(currentMonthlyPrice)} FCFA
                           </span>
                           <span className="text-[9px] font-black text-emerald-500 uppercase">
                              Facturé {formatPrice(p.price_yearly)} FCFA / an
                           </span>
                        </div>
                      )}
                    </div>
                    
                    {p.price_monthly > 0 && (
                      <p className="text-[10px] text-zinc-500 mt-4 font-bold">
                        Annulable à tout moment · Paiement Mobile Money
                      </p>
                    )}
                  </div>

                  {/* Features List */}
                  <ul className="space-y-4 mb-10 flex-1">
                    {p.features.map((f, i) => (
                      <li 
                        key={i} 
                        className={cn(
                          "flex items-start gap-3 text-xs font-medium leading-relaxed transition-all",
                          !f.included && "opacity-40"
                        )}
                      >
                        <div className="mt-0.5 shrink-0">
                          {f.included 
                            ? <Check size={14} className="text-emerald-500" /> 
                            : <X size={14} className="text-red-400" />
                          }
                        </div>
                        <span className={cn(
                          "text-zinc-300",
                          !f.included && "line-through text-zinc-500"
                        )}>
                          {f.label}
                        </span>
                      </li>
                    ))}
                  </ul>

                  <Button
                    asChild
                    variant={p.highlight ? "default" : "outline"}
                    className={cn(
                      "w-full py-7 rounded-2xl font-black uppercase tracking-widest text-[11px] group transition-all",
                      p.highlight 
                        ? "bg-primary text-zinc-950 hover:bg-primary/90 btn-glow" 
                        : "border-white/10 hover:bg-white/10"
                    )}
                  >
                    <Link to={p.cta_href}>
                      {p.cta} <ArrowRight size={14} className="ml-2 group-hover:translate-x-1 transition-transform" />
                    </Link>
                  </Button>
                </motion.div>
              );
            })}
          </div>

          {/* Credit Packs Section */}
          <div className="pt-20 space-y-12">
            <div className="text-center space-y-4">
               <motion.div initial={{ opacity: 0 }} whileInView={{ opacity: 1 }}>
                  <h2 className="text-3xl md:text-5xl font-black tracking-tighter">Besoin de <span className="text-gradient-primary">plus de puissance ?</span></h2>
                  <p className="text-zinc-400 max-w-2xl mx-auto mt-4">
                    Rechargez votre compte à la carte pour vos générations IA. Valable 90 jours.
                  </p>
               </motion.div>
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
                    <span className="text-sm font-bold text-zinc-400">{pack.per_credit}</span>
                    <span className="text-xl font-black">{formatPrice(pack.price_fcfa)} FCFA</span>
                  </div>
                  <Button asChild className="w-full bg-white text-zinc-950 hover:bg-primary transition-colors font-black uppercase tracking-widest text-[10px] h-12 rounded-xl mt-4">
                    <Link to="/dashboard/abonnement">Acheter</Link>
                  </Button>
                </div>
              ))}
            </div>
          </div>

          {/* FAQ Section */}
          <div className="pt-20 max-w-3xl mx-auto space-y-12">
             <div className="flex items-center justify-center gap-2 opacity-50">
                <div className="h-px w-12 bg-white" />
                <h2 className="text-sm font-black uppercase tracking-widest">Questions Fréquentes</h2>
                <div className="h-px w-12 bg-white" />
             </div>
             
             <div className="grid gap-4">
                {[
                  { q: "Comment payer mon abonnement ?", a: "Nous acceptons Wave, Orange Money, MTN Money et Moov Money via notre partenaire de paiement sécurisé." },
                  { q: "Puis-je changer de plan plus tard ?", a: "Absolument. Vous pouvez upgrader ou downgrader votre offre à tout moment depuis votre tableau de bord vendeur." },
                  { q: "Y a-t-il un engagement ?", a: "Non, tous nos plans sont sans engagement. Vous pouvez annuler votre abonnement quand vous le souhaitez." },
                  { q: "Comment fonctionne la commission ?", a: "La commission est prélevée uniquement lors d'une vente. Le reste est crédité instantanément sur votre solde." },
                  { q: "Que sont les crédits IA ?", a: "Ils vous permettent d'utiliser nos outils d'IA (Ads Studio, Creator Lab) pour générer du contenu pour vos produits." }
                ].map((item, i) => (
                  <motion.div 
                    key={i}
                    initial={{ opacity: 0, x: -20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.1 }}
                    className="p-6 rounded-2xl bg-white/5 border border-white/5 hover:border-white/10 transition-colors group"
                  >
                    <h4 className="font-bold mb-2 flex items-center gap-3">
                      <div className="p-1 rounded bg-primary/10 text-primary group-hover:bg-primary group-hover:text-zinc-950 transition-colors">
                        <HelpCircle size={14} />
                      </div>
                      {item.q}
                    </h4>
                    <p className="text-sm text-zinc-400 leading-relaxed ml-7">{item.a}</p>
                  </motion.div>
                ))}
             </div>
          </div>

        </div>
      </main>

      <FooterSection />
    </div>
  );
}

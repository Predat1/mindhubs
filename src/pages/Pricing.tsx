import { useState, useEffect } from "react";
import Navbar from "@/components/Navbar";
import FooterSection from "@/components/FooterSection";
import SEO from "@/components/SEO";
import { motion, AnimatePresence } from "framer-motion";
import { Check, Zap, Sparkles, Trophy, Star, ArrowRight, HelpCircle, Rocket, Crown, Sprout } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";

const CREDIT_PACKS = [
  { credits: 500,  price_fcfa: 3500,  per_credit: '7 FCFA', label: 'Pack Essentiel' },
  { credits: 1000, price_fcfa: 6000,  per_credit: '6 FCFA', label: 'Pack Boosté', badge: 'Économisez 14%' },
  { credits: 3000, price_fcfa: 15000, per_credit: '5 FCFA', label: 'Pack Puissance', badge: 'Économisez 29%' },
];

const STATIC_PLANS = [
  {
    id: "free",
    name: "Free",
    icon: Sprout,
    price_monthly: 0,
    price_yearly: 0,
    features: ["5 produits max", "50 crédits IA / mois", "Commission 20%", "Boutique standard", "Support email"],
    cta: "Commencer gratuitement",
    highlight: false,
  },
  {
    id: "starter",
    name: "Starter",
    icon: Rocket,
    price_monthly: 5000,
    price_yearly: 50000,
    features: ["20 produits max", "200 crédits IA / mois", "Commission 15%", "Ads Studio (basique)", "Support prioritaire"],
    cta: "Choisir Starter",
    highlight: false,
    badge: "Idéal débutant",
  },
  {
    id: "pro",
    name: "Pro",
    icon: Star,
    price_monthly: 15000,
    price_yearly: 150000,
    features: ["Produits illimités", "1000 crédits IA / mois", "Commission 10%", "Ads Studio complet", "Creator Lab (validation)"],
    cta: "Passer à Pro",
    highlight: true,
    badge: "Recommandé",
  },
  {
    id: "elite",
    name: "Elite",
    icon: Crown,
    price_monthly: 30000,
    price_yearly: 300000,
    features: ["Tout illimité", "5000 crédits IA / mois", "Commission 5%", "Placement prioritaire", "Accompagnement 1:1"],
    cta: "Devenir Elite",
    highlight: false,
    badge: "L'excellence",
  }
];

export default function Pricing() {
  const [billingCycle, setBillingCycle] = useState<"monthly" | "yearly">("monthly");
  const [plans, setPlans] = useState(STATIC_PLANS);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchPlans() {
      try {
        const { data, error } = await supabase
          .from('plan_limits')
          .select('*')
          .order('price_fcfa_monthly', { ascending: true });
        
        if (!error && data && data.length > 0) {
          const formattedPlans = data.map((p: any) => ({
            id: p.plan,
            name: p.plan.charAt(0).toUpperCase() + p.plan.slice(1),
            icon: p.plan === 'free' ? Sprout : p.plan === 'starter' ? Rocket : p.plan === 'pro' ? Star : Crown,
            price_monthly: p.price_fcfa_monthly,
            price_yearly: p.price_fcfa_yearly,
            highlight: p.plan === 'pro',
            badge: p.badge,
            cta: p.plan === 'free' ? 'Commencer' : `Démarrer ${p.plan}`,
            features: [
              p.max_products === -1 ? 'Produits illimités' : `${p.max_products} produits max`,
              `${p.monthly_credits} crédits IA / mois`,
              `Commission ${Math.round(p.commission_rate * 100)}%`,
              p.ads_studio ? 'Ads Studio complet' : 'Ads Studio non inclus',
              p.priority_placement ? 'Placement prioritaire' : 'Support standard'
            ]
          }));
          setPlans(formattedPlans);
        }
      } catch (e) {
        console.error("Pricing fetch error", e);
      } finally {
        setLoading(false);
      }
    }
    fetchPlans();
  }, []);

  return (
    <div className="min-h-screen bg-zinc-950 text-white font-outfit">
      <SEO title="Tarifs | MindHubs" description="Choisissez le plan qui correspond à votre ambition de créateur." />
      <Navbar />

      <main className="pt-32 pb-24 px-4 overflow-hidden relative">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-[600px] bg-primary/5 blur-[120px] rounded-full pointer-events-none" />
        
        <div className="max-w-7xl mx-auto space-y-20 relative z-10">
          <div className="text-center space-y-6 max-w-3xl mx-auto">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
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

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {plans.map((p, idx) => {
              const Icon = p.icon;
              return (
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

                  <div className="mb-8 flex flex-col items-center text-center">
                    <div className={`p-3 rounded-2xl mb-4 ${p.highlight ? 'bg-primary/20 text-primary' : 'bg-white/5 text-zinc-400'}`}>
                      <Icon size={28} />
                    </div>
                    <h3 className="text-xl font-black mb-2">{p.name}</h3>
                    <div className="flex items-baseline gap-1">
                      <span className="text-4xl font-black">
                        {(billingCycle === 'monthly' ? p.price_monthly : p.price_yearly / 12).toLocaleString()}
                      </span>
                      <span className="text-zinc-500 font-bold text-sm">FCFA / mois</span>
                    </div>
                  </div>

                  <div className="space-y-4 mb-10 flex-1">
                    {p.features.map((f: string, i: number) => (
                      <div key={i} className="flex items-start gap-3">
                        <div className="mt-1 shrink-0 w-4 h-4 rounded-full bg-emerald-500/20 flex items-center justify-center text-emerald-500">
                          <Check size={10} />
                        </div>
                        <span className="text-xs font-medium leading-relaxed text-zinc-300">
                          {f}
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
                    <Link to={`/become-a-seller?plan=${p.id}`}>
                      {p.cta} <ArrowRight size={14} className="ml-2 group-hover:translate-x-1 transition-transform" />
                    </Link>
                  </Button>
                </motion.div>
              );
            })}
          </div>

          {/* Credit Packs */}
          <div className="pt-20 space-y-12">
            <div className="text-center space-y-4">
              <h2 className="text-3xl md:text-5xl font-black tracking-tighter">Besoin de <span className="text-gradient-primary">plus de puissance ?</span></h2>
              <p className="text-zinc-400 max-w-2xl mx-auto">Rechargez votre compte à la carte pour vos générations IA.</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
              {CREDIT_PACKS.map((pack, i) => (
                <div key={i} className="glass-card p-8 rounded-[2rem] border border-white/5 hover:border-primary/30 transition-all group relative overflow-hidden">
                  <p className="text-[10px] font-black text-primary uppercase tracking-widest mb-1">{pack.label}</p>
                  <div className="flex items-baseline gap-2 mb-4">
                    <span className="text-4xl font-black">{pack.credits}</span>
                    <span className="text-zinc-500 font-bold">crédits</span>
                  </div>
                  <div className="flex items-center justify-between py-4 border-t border-white/5">
                    <span className="text-sm font-bold text-zinc-400">{pack.per_credit}</span>
                    <span className="text-xl font-black">{pack.price_fcfa.toLocaleString()} FCFA</span>
                  </div>
                  <Button asChild className="w-full bg-white text-zinc-950 hover:bg-primary transition-colors font-black uppercase tracking-widest text-[10px] h-12 rounded-xl mt-4">
                    <Link to="/dashboard/abonnement">Acheter</Link>
                  </Button>
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

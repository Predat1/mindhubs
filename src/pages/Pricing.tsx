import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Check, Zap, Star, Trophy, ShieldCheck, HelpCircle, ArrowRight, MessageCircle, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import Navbar from "@/components/Navbar";
import Footer from "@/components/FooterSection";
import SEO from "@/components/SEO";
import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

const Pricing = () => {
  const [isAnnual, setIsAnnual] = useState(true);

  // Charger les limites dynamiquement depuis Supabase
  const { data: dbPlans = [], isLoading: plansLoading } = useQuery({
    queryKey: ['public-plan-limits'],
    queryFn: async () => {
      const { data, error } = await supabase.from('plan_limits').select('*').order('price_fcfa_monthly');
      if (error) throw error;
      return data || [];
    }
  });

  // WHY: Fusion des métadonnées statiques (icones, cta, features descriptives) 
  // avec les données dynamiques de la DB (prix, limites réelles).
  const PLANS = useMemo(() => {
    const staticMetadata: Record<string, any> = {
      free: {
        name: 'Gratuit',
        icon: Zap,
        highlight: false,
        cta: 'Commencer gratuitement',
        baseFeatures: ['Boutique publique', 'Analytics de base', 'Creator Lab (limité)']
      },
      starter: {
        name: 'Starter',
        icon: Star,
        highlight: false,
        cta: 'Démarrer Starter',
        baseFeatures: ['Creator Lab (veille + validation)', 'Analytics complètes', 'Support email']
      },
      pro: {
        name: 'Pro',
        icon: Trophy,
        badge: '⭐ Recommandé',
        highlight: true,
        cta: 'Devenir Vendeur Pro',
        baseFeatures: ['Creator Lab complet', 'Ads Studio illimité', 'Badge "Vendeur Pro"']
      },
      elite: {
        name: 'Elite',
        icon: ShieldCheck,
        badge: '🏆 Meilleure valeur',
        highlight: false,
        cta: 'Rejoindre l\'Elite',
        baseFeatures: ['Tout le plan Pro inclus', 'Placement prioritaire', 'Support WhatsApp dédié']
      }
    };

    // Si la DB est vide, on retourne une liste vide pour éviter les erreurs, 
    // ou on pourrait avoir un fallback. Ici on attend que la DB réponde.
    if (dbPlans.length === 0 && !plansLoading) {
      // Fallback au cas où la table est vide mais qu'on a besoin d'afficher quelque chose
      return [];
    }

    return dbPlans.map(dbPlan => {
      const meta = staticMetadata[dbPlan.plan] || staticMetadata.free;
      return {
        ...dbPlan,
        ...meta,
        features: [
          `${dbPlan.max_products === -1 ? 'Produits illimités' : `${dbPlan.max_products} produit${dbPlan.max_products > 1 ? 's' : ''} maximum`}`,
          `${dbPlan.monthly_credits} crédits IA/mois`,
          `Commission ${Math.round(dbPlan.commission_rate * 100)}%`,
          ...meta.baseFeatures
        ]
      };
    });
  }, [dbPlans, plansLoading]);

  return (
    <div className="min-h-screen bg-background">
      <SEO 
        title="Tarifs MindHubs | Choisissez votre puissance" 
        description="Passez au niveau supérieur avec nos plans Starter, Pro et Elite. Maximisez vos revenus et automatisez votre business avec l'IA." 
      />
      <Navbar />

      <main className="pt-32 pb-20 px-4">
        {/* Hero Section */}
        <div className="max-w-4xl mx-auto text-center space-y-6 mb-20">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <Badge className="bg-primary/10 text-primary border-primary/20 px-4 py-1 rounded-full text-xs font-black uppercase tracking-widest mb-4">
              Tarification Transparente
            </Badge>
            <h1 className="text-4xl md:text-6xl font-black tracking-tighter mb-6 leading-none text-white">
              Propulsez votre boutique <br /> 
              <span className="text-gradient-brand">au niveau supérieur</span>
            </h1>
            <p className="text-lg text-muted-foreground font-medium max-w-2xl mx-auto">
              Économisez sur les commissions et débloquez la puissance de l'IA pour créer vos produits en un temps record.
            </p>
          </motion.div>

          {/* Toggle Switch */}
          <div className="flex items-center justify-center gap-4 pt-8">
            <span className={`text-sm font-bold ${!isAnnual ? 'text-foreground' : 'text-muted-foreground'}`}>Mensuel</span>
            <button
              onClick={() => setIsAnnual(!isAnnual)}
              className="relative w-14 h-7 rounded-full bg-muted border border-white/5 p-1 transition-colors hover:bg-muted/80"
            >
              <motion.div
                className="w-5 h-5 rounded-full bg-primary shadow-lg"
                animate={{ x: isAnnual ? 28 : 0 }}
                transition={{ type: "spring", stiffness: 500, damping: 30 }}
              />
            </button>
            <div className="flex items-center gap-2">
              <span className={`text-sm font-bold ${isAnnual ? 'text-foreground' : 'text-muted-foreground'}`}>Annuel</span>
              <Badge className="bg-emerald-500/10 text-emerald-500 border-emerald-500/20 text-[10px] font-black uppercase">
                -2 mois gratuits
              </Badge>
            </div>
          </div>
        </div>

        {/* Pricing Cards Section */}
        <div className="max-w-7xl mx-auto">
          {plansLoading ? (
            <div className="flex flex-col items-center justify-center py-20 gap-4">
              <Loader2 className="animate-spin text-primary" size={48} />
              <p className="text-sm font-black uppercase tracking-widest text-muted-foreground">Chargement des offres...</p>
            </div>
          ) : PLANS.length === 0 ? (
            <div className="text-center py-20 border-2 border-dashed border-white/5 rounded-[3rem]">
              <p className="text-muted-foreground font-medium italic">Aucun plan de tarification disponible pour le moment.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {PLANS.map((plan, index) => (
                <motion.div
                  key={plan.plan}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className={`relative group rounded-[2.5rem] p-8 transition-all duration-500 flex flex-col h-full ${
                    plan.highlight 
                      ? 'bg-gradient-to-br from-primary/10 via-background to-background border-2 border-primary shadow-[0_0_40px_-10px_hsl(var(--primary)/0.3)]' 
                      : 'bg-card border border-white/5 hover:border-primary/30'
                  }`}
                >
                  {plan.badge && (
                    <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                      <Badge className="bg-primary text-primary-foreground font-black px-3 py-1 rounded-full text-[10px] uppercase tracking-tighter">
                        {plan.badge}
                      </Badge>
                    </div>
                  )}

                  <div className="mb-8">
                    <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary mb-6 group-hover:scale-110 transition-transform duration-500">
                      <plan.icon size={24} />
                    </div>
                    <h3 className="text-2xl font-black mb-2 text-white">{plan.name}</h3>
                    <div className="flex items-baseline gap-1">
                      <span className="text-4xl font-black tracking-tighter text-white">
                        {isAnnual 
                          ? (plan.price_fcfa_yearly / 12).toLocaleString() 
                          : plan.price_fcfa_monthly.toLocaleString()}
                      </span>
                      <span className="text-muted-foreground font-bold text-sm">FCFA / mois</span>
                    </div>
                    {isAnnual && plan.price_fcfa_yearly > 0 && (
                      <p className="text-[10px] text-emerald-500 font-bold uppercase mt-1">
                        Payé annuellement ({plan.price_fcfa_yearly.toLocaleString()} FCFA)
                      </p>
                    )}
                  </div>

                  <div className="space-y-4 mb-8 flex-1">
                    {plan.features.map((feature: string, i: number) => (
                      <div key={i} className="flex items-start gap-3">
                        <div className="mt-1 h-4 w-4 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                          <Check size={10} className="text-primary" />
                        </div>
                        <span className="text-xs font-medium text-muted-foreground leading-tight">
                          {feature}
                        </span>
                      </div>
                    ))}
                  </div>

                  <Button 
                    asChild
                    variant={plan.highlight ? "default" : "outline"}
                    className={`w-full rounded-2xl h-12 font-black uppercase tracking-widest text-[10px] transition-all duration-300 ${
                      plan.highlight ? 'shadow-lg shadow-primary/25 hover:shadow-primary/40 active:scale-[0.98]' : ''
                    }`}
                  >
                    <Link to="/mon-compte">{plan.cta}</Link>
                  </Button>
                </motion.div>
              ))}
            </div>
          )}
        </div>

        {/* Credit Packs Section */}
        <section className="max-w-6xl mx-auto mt-32 space-y-12">
          <div className="text-center space-y-4">
            <h2 className="text-3xl md:text-5xl font-black tracking-tighter uppercase text-white">Crédits à la carte</h2>
            <p className="text-muted-foreground font-medium">Besoin de plus de puissance ? Rechargez votre solde sans changer de plan.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { credits: 500,  price: 3500, label: 'Pack Essentiel', rate: '7 FCFA/crédit' },
              { credits: 1000, price: 6000, label: 'Pack Boosté', rate: '6 FCFA/crédit', badge: 'Économisez 14%' },
              { credits: 3000, price: 15000, label: 'Pack Puissance', rate: '5 FCFA/crédit', badge: 'Économisez 29%' },
            ].map((pack, i) => (
              <div key={i} className="glass-card rounded-[2.5rem] p-8 border border-white/5 hover:border-primary/50 transition-all group">
                <div className="flex justify-between items-start mb-6">
                  <div>
                    <p className="text-[10px] font-black uppercase text-primary tracking-widest mb-1">{pack.label}</p>
                    <h3 className="text-4xl font-black tracking-tighter text-white">{pack.credits} <span className="text-lg">Crédits</span></h3>
                  </div>
                  {pack.badge && (
                    <Badge className="bg-emerald-500/10 text-emerald-500 border-emerald-500/20 text-[9px] font-black uppercase">
                      {pack.badge}
                    </Badge>
                  )}
                </div>
                <div className="space-y-6">
                  <div className="flex items-center justify-between text-sm font-bold">
                    <span className="text-muted-foreground">Prix du pack</span>
                    <span className="text-white">{pack.price.toLocaleString()} FCFA</span>
                  </div>
                  <div className="h-px bg-white/5" />
                  <p className="text-center text-[10px] font-black text-muted-foreground uppercase">{pack.rate}</p>
                  <Button asChild className="w-full rounded-2xl h-12 font-black uppercase tracking-widest text-[10px]">
                    <Link to="/mon-compte">Acheter ce pack</Link>
                  </Button>
                </div>
              </div>
            ))}
          </div>
          <p className="text-center text-xs text-muted-foreground font-medium opacity-50 italic">
            Valables 90 jours · Cumulables · Compatibles tous plans
          </p>
        </section>

        {/* FAQ Section */}
        <section className="max-w-3xl mx-auto mt-32 space-y-12">
          <div className="text-center">
            <h2 className="text-3xl font-black uppercase tracking-tighter text-white">Questions fréquentes</h2>
          </div>
          <Accordion type="single" collapsible className="w-full">
            <AccordionItem value="item-1" className="border-white/5">
              <AccordionTrigger className="text-sm font-black uppercase tracking-widest text-left text-white">Puis-je changer de plan à tout moment ?</AccordionTrigger>
              <AccordionContent className="text-muted-foreground font-medium">
                Oui, vous pouvez upgrader ou downgrader votre abonnement directement depuis votre tableau de bord. En cas d'upgrade, les nouveaux avantages sont immédiats.
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="item-2" className="border-white/5">
              <AccordionTrigger className="text-sm font-black uppercase tracking-widest text-left text-white">Qu'arrive-t-il à mes crédits non utilisés ?</AccordionTrigger>
              <AccordionContent className="text-muted-foreground font-medium">
                Nous offrons un système de "Rollover" : jusqu'à 30% de vos crédits mensuels restants sont reportés sur le mois suivant si vous restez abonné. Les crédits achetés à la carte sont valables 90 jours.
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="item-3" className="border-white/5">
              <AccordionTrigger className="text-sm font-black uppercase tracking-widest text-left text-white">Quels sont les modes de paiement acceptés ?</AccordionTrigger>
              <AccordionContent className="text-muted-foreground font-medium">
                Nous acceptons Mobile Money (Orange, MTN, Moov), Wave, ainsi que les cartes Visa/Mastercard via nos partenaires sécurisés.
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="item-4" className="border-white/5">
              <AccordionTrigger className="text-sm font-black uppercase tracking-widest text-left text-white">La commission MindHubs s'applique sur quoi ?</AccordionTrigger>
              <AccordionContent className="text-muted-foreground font-medium">
                La commission ne s'applique que sur vos ventes réussies. Elle couvre les frais de plateforme, de marketing global et de sécurisation des paiements. Elle descend jusqu'à 5% pour les membres Elite.
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </section>

        {/* Support CTA */}
        <section className="max-w-4xl mx-auto mt-32 p-12 rounded-[3rem] bg-primary/5 border border-primary/20 text-center space-y-8">
           <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center text-primary mx-auto mb-6">
              <MessageCircle size={32} />
           </div>
           <h2 className="text-3xl md:text-5xl font-black tracking-tighter uppercase text-white">Une question sur-mesure ?</h2>
           <p className="text-muted-foreground font-medium max-w-lg mx-auto">
             Notre équipe d'experts est disponible pour vous conseiller sur le meilleur plan pour votre business digital.
           </p>
           <Button variant="outline" className="rounded-2xl px-8 h-14 font-black uppercase tracking-widest text-[10px] gap-2">
             Contactez le support WhatsApp <ArrowRight size={16} />
           </Button>
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default Pricing;

import Navbar from "@/components/Navbar";
import FooterSection from "@/components/FooterSection";
import AnimateOnScroll from "@/components/AnimateOnScroll";
import SEO from "@/components/SEO";
import { ShieldCheck, Lock, CreditCard, Headphones, FileCheck, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

const protections = [
  {
    icon: Lock,
    title: "Transactions 100% Sécurisées",
    desc: "Vos données de paiement ne sont jamais stockées sur nos serveurs. Nous utilisons des protocoles de chiffrement SSL avancés pour garantir une sécurité totale."
  },
  {
    icon: CreditCard,
    title: "Multiples Options de Paiement",
    desc: "Payez en toute confiance via Orange Money, Wave, MTN, Moov ou carte bancaire. Nous collaborons avec les passerelles de paiement les plus fiables d'Afrique."
  },
  {
    icon: FileCheck,
    title: "Qualité Garantie",
    desc: "Chaque produit sur MindHubs est vérifié par notre équipe. Si le contenu ne correspond pas à la description, vous êtes protégé."
  },
  {
    icon: Headphones,
    title: "Support Réactif 24/7",
    desc: "Une question ? Un problème d'accès ? Notre équipe technique est disponible via WhatsApp et email pour vous assister immédiatement."
  },
  {
    icon: ShieldCheck,
    title: "Protection Anti-Fraude",
    desc: "Nous surveillons activement la plateforme pour détecter toute activité suspecte et protéger votre compte et vos achats."
  },
  {
    icon: Star,
    title: "Accès à Vie Certifié",
    desc: "Une fois acheté, votre produit reste accessible dans votre espace client pour toujours. Pas d'abonnement caché, pas de frais de renouvellement."
  }
];

const ProtectionAcheteur = () => {
  return (
    <div className="min-h-screen bg-background">
      <SEO 
        title="Protection Acheteur — MindHubs" 
        description="Découvrez comment MindHubs protège vos achats, vos données et garantit la qualité des formations." 
        path="/protection-acheteur" 
      />
      <Navbar />

      <main className="pt-32 pb-20">
        <div className="container mx-auto px-4 max-w-5xl">
          
          <AnimateOnScroll>
            <div className="text-center mb-16 space-y-4">
              <div className="h-16 w-16 bg-primary/10 rounded-2xl flex items-center justify-center text-primary mx-auto mb-6">
                <ShieldCheck size={32} />
              </div>
              <h1 className="text-4xl md:text-6xl font-black tracking-tighter">Votre confiance est notre <span className="text-primary italic">priorité.</span></h1>
              <p className="text-muted-foreground max-w-2xl mx-auto text-lg">
                Acheter sur MindHubs, c'est l'assurance d'un contenu de qualité, d'un paiement sécurisé et d'un support dédié à votre réussite.
              </p>
            </div>
          </AnimateOnScroll>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {protections.map((item, i) => (
              <AnimateOnScroll key={i} delay={i * 50}>
                <div className="stat-card p-8 rounded-[2rem] border-glow space-y-4 h-full flex flex-col justify-between">
                  <div className="space-y-4">
                    <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
                      <item.icon size={24} />
                    </div>
                    <h3 className="text-xl font-bold">{item.title}</h3>
                    <p className="text-sm text-muted-foreground leading-relaxed">{item.desc}</p>
                  </div>
                </div>
              </AnimateOnScroll>
            ))}
          </div>

          <AnimateOnScroll delay={400}>
            <div className="mt-20 p-10 rounded-[3rem] bg-gradient-to-br from-primary/20 to-accent/10 border border-primary/20 text-center space-y-8">
              <h2 className="text-3xl font-black">Besoin d'aide supplémentaire ?</h2>
              <p className="text-muted-foreground max-w-xl mx-auto">
                Si vous avez la moindre question concernant un achat ou si vous souhaitez signaler un problème avec un vendeur, notre équipe de médiation est à votre disposition.
              </p>
              <div className="flex flex-wrap items-center justify-center gap-4">
                <Button asChild size="lg" className="rounded-full px-8 btn-glow">
                  <Link to="/contact">Contacter le Support</Link>
                </Button>
                <Button asChild variant="outline" size="lg" className="rounded-full px-8">
                  <Link to="/faq">Consulter la FAQ</Link>
                </Button>
              </div>
            </div>
          </AnimateOnScroll>

        </div>
      </main>

      <FooterSection />
    </div>
  );
};

export default ProtectionAcheteur;

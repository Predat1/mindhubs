import Navbar from "@/components/Navbar";
import FooterSection from "@/components/FooterSection";
import AnimateOnScroll from "@/components/AnimateOnScroll";
import SEO from "@/components/SEO";
import { Download, Mail, Clock, Shield } from "lucide-react";

const deliverySteps = [
  { icon: Shield, title: "Paiement sécurisé", desc: "Effectuez votre paiement via Mobile Money ou carte bancaire de manière sécurisée." },
  { icon: Clock, title: "Confirmation instantanée", desc: "Recevez immédiatement un email de confirmation avec les détails de votre commande." },
  { icon: Download, title: "Téléchargement immédiat", desc: "Accédez à vos produits numériques directement depuis votre espace client ou par email." },
  { icon: Mail, title: "Support continu", desc: "Notre équipe reste disponible pour vous accompagner dans l'utilisation de vos produits." },
];

const PolitiqueLivraison = () => {
  return (
    <div className="min-h-screen bg-background">
      <SEO title="Politique de Livraison" description="Découvrez notre politique de livraison 100% numérique avec accès instantané." path="/politique-livraison" />
      <Navbar />
      <main className="pt-24 pb-16">
        <div className="container mx-auto px-4 max-w-4xl">
          <AnimateOnScroll>
            <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-8">Politique de Livraison</h1>
            <p className="text-muted-foreground mb-6">Dernière mise à jour : {new Date().toLocaleDateString("fr-FR")}</p>
          </AnimateOnScroll>

          <AnimateOnScroll>
            <div className="bg-accent/30 border border-accent/50 rounded-xl p-6 mb-10">
              <h3 className="font-semibold text-foreground mb-2">📦 Livraison 100% numérique</h3>
              <p className="text-muted-foreground text-sm">Tous nos produits sont des contenus numériques livrés instantanément après confirmation du paiement. Aucune livraison physique n'est effectuée.</p>
            </div>
          </AnimateOnScroll>

          <AnimateOnScroll>
            <section className="mb-10">
              <h2 className="text-xl font-semibold text-foreground mb-6">Comment ça marche ?</h2>
              <div className="grid md:grid-cols-2 gap-6">
                {deliverySteps.map((step, i) => (
                  <div key={i} className="flex gap-4 bg-card border border-border rounded-xl p-5">
                    <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center shrink-0">
                      <step.icon className="text-primary" size={20} />
                    </div>
                    <div>
                      <h3 className="font-semibold text-foreground mb-1">{step.title}</h3>
                      <p className="text-sm text-muted-foreground">{step.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          </AnimateOnScroll>

          <div className="space-y-8 text-muted-foreground">
            <AnimateOnScroll>
              <section>
                <h2 className="text-xl font-semibold text-foreground mb-3">Délais de livraison</h2>
                <ul className="list-disc pl-6 space-y-2">
                  <li><strong className="text-foreground">Produits numériques :</strong> Livraison instantanée après confirmation du paiement.</li>
                  <li><strong className="text-foreground">Paiement Mobile Money :</strong> Confirmation généralement en moins de 5 minutes.</li>
                  <li><strong className="text-foreground">Paiement par carte :</strong> Confirmation immédiate après validation bancaire.</li>
                </ul>
              </section>
            </AnimateOnScroll>

            <AnimateOnScroll>
              <section>
                <h2 className="text-xl font-semibold text-foreground mb-3">Accès aux produits</h2>
                <p>Après l'achat, vos produits sont accessibles de deux façons : par les liens de téléchargement envoyés par email, et depuis votre espace client dans la section "Mes achats". Les liens de téléchargement restent actifs pendant 30 jours. Passé ce délai, vous pouvez contacter notre support pour obtenir de nouveaux liens.</p>
              </section>
            </AnimateOnScroll>

            <AnimateOnScroll>
              <section>
                <h2 className="text-xl font-semibold text-foreground mb-3">Problème de livraison ?</h2>
                <p>Si vous ne recevez pas votre produit dans les 30 minutes suivant le paiement, vérifiez votre dossier spam. Si le problème persiste, contactez-nous à : <a href="mailto:contact@savoirhub.com" className="text-primary hover:underline">contact@savoirhub.com</a> ou via WhatsApp.</p>
              </section>
            </AnimateOnScroll>
          </div>
        </div>
      </main>
      <FooterSection />
    </div>
  );
};

export default PolitiqueLivraison;

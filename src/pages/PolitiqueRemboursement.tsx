import Navbar from "@/components/Navbar";
import FooterSection from "@/components/FooterSection";
import AnimateOnScroll from "@/components/AnimateOnScroll";
import SEO from "@/components/SEO";
import { AlertCircle, CheckCircle, Clock, Mail } from "lucide-react";

const steps = [
  { icon: Mail, title: "Contactez-nous", desc: "Envoyez un email à contact@mindhub.com avec votre numéro de commande et le motif de votre demande." },
  { icon: Clock, title: "Traitement", desc: "Notre équipe examine votre demande sous 48h ouvrées et vous répond avec une décision." },
  { icon: CheckCircle, title: "Remboursement", desc: "Si approuvé, le remboursement est effectué sous 7 jours ouvrés via le même moyen de paiement utilisé." },
];

const PolitiqueRemboursement = () => {
  return (
    <div className="min-h-screen bg-background">
      <SEO title="Politique de Remboursement" description="Consultez notre politique de remboursement et les conditions de retour." path="/politique-remboursement" />
      <Navbar />
      <main className="pt-24 pb-16">
        <div className="container mx-auto px-4 max-w-4xl">
          <AnimateOnScroll>
            <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-8">Politique de Remboursement</h1>
            <p className="text-muted-foreground mb-6">Dernière mise à jour : {new Date().toLocaleDateString("fr-FR")}</p>
          </AnimateOnScroll>

          <AnimateOnScroll>
            <div className="bg-primary/10 border border-primary/20 rounded-xl p-6 mb-10 flex gap-4 items-start">
              <AlertCircle className="text-primary mt-1 shrink-0" size={24} />
              <div>
                <h3 className="font-semibold text-foreground mb-1">Satisfaction garantie</h3>
                <p className="text-muted-foreground text-sm">Chez Mind Hub, votre satisfaction est notre priorité. Nous proposons une garantie de remboursement sous conditions pour tous nos produits numériques.</p>
              </div>
            </div>
          </AnimateOnScroll>

          <div className="space-y-8 text-muted-foreground">
            <AnimateOnScroll>
              <section>
                <h2 className="text-xl font-semibold text-foreground mb-3">Conditions de remboursement</h2>
                <ul className="list-disc pl-6 space-y-2">
                  <li>La demande de remboursement doit être effectuée dans les <strong className="text-foreground">14 jours</strong> suivant l'achat.</li>
                  <li>Le produit ne doit pas avoir été intégralement consommé (moins de 30% du contenu consulté).</li>
                  <li>Une seule demande de remboursement est acceptée par client et par produit.</li>
                  <li>Les produits achetés en promotion spéciale ou dans le cadre d'un bundle ne sont pas remboursables.</li>
                </ul>
              </section>
            </AnimateOnScroll>

            <AnimateOnScroll>
              <section>
                <h2 className="text-xl font-semibold text-foreground mb-3">Cas d'exclusion</h2>
                <ul className="list-disc pl-6 space-y-2">
                  <li>Produit entièrement téléchargé et consulté.</li>
                  <li>Demande effectuée après le délai de 14 jours.</li>
                  <li>Tentative de fraude ou utilisation abusive du service.</li>
                  <li>Insatisfaction liée à des résultats personnels (les formations fournissent des connaissances, les résultats dépendent de l'application individuelle).</li>
                </ul>
              </section>
            </AnimateOnScroll>

            <AnimateOnScroll>
              <section>
                <h2 className="text-xl font-semibold text-foreground mb-4">Processus de remboursement</h2>
                <div className="grid md:grid-cols-3 gap-6">
                  {steps.map((step, i) => (
                    <div key={i} className="bg-card border border-border rounded-xl p-6 text-center">
                      <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                        <step.icon className="text-primary" size={24} />
                      </div>
                      <h3 className="font-semibold text-foreground mb-2">{step.title}</h3>
                      <p className="text-sm text-muted-foreground">{step.desc}</p>
                    </div>
                  ))}
                </div>
              </section>
            </AnimateOnScroll>

            <AnimateOnScroll>
              <section>
                <h2 className="text-xl font-semibold text-foreground mb-3">Contact</h2>
                <p>Pour toute demande de remboursement, contactez-nous à : <a href="mailto:contact@mindhub.com" className="text-primary hover:underline">contact@mindhub.com</a></p>
              </section>
            </AnimateOnScroll>
          </div>
        </div>
      </main>
      <FooterSection />
    </div>
  );
};

export default PolitiqueRemboursement;

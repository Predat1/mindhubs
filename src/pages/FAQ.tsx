import Navbar from "@/components/Navbar";
import FooterSection from "@/components/FooterSection";
import AnimateOnScroll from "@/components/AnimateOnScroll";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Link } from "react-router-dom";
import { MessageCircle } from "lucide-react";
import SEO from "@/components/SEO";

const faqCategories = [
  {
    title: "Commandes & Paiement",
    items: [
      { q: "Quels moyens de paiement acceptez-vous ?", a: "Nous acceptons les paiements par Mobile Money (MTN, Moov, Orange Money, Wave, TMoney, Airtel Money) ainsi que les cartes bancaires Visa et MasterCard." },
      { q: "Comment passer une commande ?", a: "Ajoutez les produits souhaités à votre panier, puis suivez le processus de validation. Choisissez votre moyen de paiement et validez. Vous recevrez une confirmation par email." },
      { q: "Mon paiement a échoué, que faire ?", a: "Vérifiez votre solde et réessayez. Si le problème persiste, essayez un autre moyen de paiement ou contactez-nous via WhatsApp pour une assistance immédiate." },
      { q: "Puis-je payer en plusieurs fois ?", a: "Actuellement, nous ne proposons pas de paiement en plusieurs fois. Cependant, nos prix sont déjà très accessibles avec des réductions importantes sur tous les produits." },
    ],
  },
  {
    title: "Produits & Accès",
    items: [
      { q: "Comment accéder à mes produits après l'achat ?", a: "Après confirmation du paiement, vous recevez un email avec les liens de téléchargement. Vous pouvez également retrouver tous vos achats dans votre espace client, section 'Mes achats'." },
      { q: "Les formations ont-elles une durée d'accès limitée ?", a: "Non ! Une fois achetée, la formation est à vous pour toujours. Vous pouvez y accéder et la consulter autant de fois que vous le souhaitez, sans limite de temps." },
      { q: "Puis-je partager mes produits avec d'autres personnes ?", a: "Non. L'achat confère un droit d'utilisation personnel et non transférable. Toute reproduction ou redistribution est interdite et protégée par le droit de la propriété intellectuelle." },
      { q: "Les produits sont-ils mis à jour ?", a: "Oui, nous mettons régulièrement à jour nos contenus. Les mises à jour sont gratuites pour tous les clients ayant acheté le produit." },
    ],
  },
  {
    title: "Remboursement & Support",
    items: [
      { q: "Puis-je me faire rembourser ?", a: "Oui, sous conditions. Vous disposez de 14 jours après l'achat pour demander un remboursement si moins de 30% du contenu a été consulté. Consultez notre politique de remboursement pour plus de détails." },
      { q: "Comment contacter le support ?", a: "Vous pouvez nous contacter par email à contact@savoirhub.com, via WhatsApp, ou en utilisant le formulaire de contact sur notre site. Notre équipe répond sous 24h ouvrées." },
      { q: "Proposez-vous un accompagnement personnalisé ?", a: "Oui ! En plus des formations, nous offrons un support par email et WhatsApp pour répondre à vos questions et vous guider dans votre apprentissage." },
    ],
  },
  {
    title: "Compte & Sécurité",
    items: [
      { q: "Comment créer un compte ?", a: "Cliquez sur 'Mon compte' dans la navigation, puis sur 'Créer un compte'. Remplissez le formulaire avec votre email et un mot de passe sécurisé. Un email de vérification vous sera envoyé." },
      { q: "J'ai oublié mon mot de passe", a: "Sur la page de connexion, cliquez sur 'Mot de passe oublié'. Entrez votre adresse email et suivez les instructions reçues par email pour réinitialiser votre mot de passe." },
      { q: "Mes données sont-elles en sécurité ?", a: "Absolument. Nous utilisons des protocoles de sécurité avancés pour protéger vos données. Les paiements sont chiffrés et nous ne partageons jamais vos informations avec des tiers." },
    ],
  },
];

const FAQ = () => {
  return (
    <div className="min-h-screen bg-background">
      <SEO title="FAQ" description="Retrouvez les réponses aux questions fréquentes sur SavoirHub : paiement, accès, remboursement et plus." path="/faq" />
      <Navbar />
      <main className="pt-24 pb-16">
        <div className="container mx-auto px-4 max-w-4xl">
          <AnimateOnScroll>
            <div className="text-center mb-12">
              <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-4">Foire Aux Questions</h1>
              <p className="text-muted-foreground max-w-2xl mx-auto">Retrouvez les réponses aux questions les plus fréquemment posées. Si vous ne trouvez pas votre réponse, n'hésitez pas à nous contacter.</p>
            </div>
          </AnimateOnScroll>

          <div className="space-y-10">
            {faqCategories.map((category, catIdx) => (
              <AnimateOnScroll key={catIdx}>
                <div>
                  <h2 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
                    <span className="w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center text-primary text-sm font-bold">{catIdx + 1}</span>
                    {category.title}
                  </h2>
                  <Accordion type="single" collapsible className="bg-card border border-border rounded-xl overflow-hidden">
                    {category.items.map((item, i) => (
                      <AccordionItem key={i} value={`${catIdx}-${i}`} className="border-border">
                        <AccordionTrigger className="px-5 text-left text-foreground hover:no-underline">{item.q}</AccordionTrigger>
                        <AccordionContent className="px-5 text-muted-foreground">{item.a}</AccordionContent>
                      </AccordionItem>
                    ))}
                  </Accordion>
                </div>
              </AnimateOnScroll>
            ))}
          </div>

          <AnimateOnScroll>
            <div className="mt-12 text-center bg-primary/5 border border-primary/20 rounded-xl p-8">
              <MessageCircle className="mx-auto text-primary mb-4" size={32} />
              <h3 className="text-lg font-semibold text-foreground mb-2">Vous n'avez pas trouvé votre réponse ?</h3>
              <p className="text-muted-foreground mb-4">Notre équipe est là pour vous aider. Contactez-nous et nous vous répondrons dans les plus brefs délais.</p>
              <Link to="/contact" className="inline-flex items-center gap-2 bg-primary text-primary-foreground px-6 py-3 rounded-lg font-medium hover:bg-primary/90 transition-colors">
                Nous contacter
              </Link>
            </div>
          </AnimateOnScroll>
        </div>
      </main>
      <FooterSection />
    </div>
  );
};

export default FAQ;

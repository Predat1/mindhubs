import { useEffect } from "react";
import AnimateOnScroll from "@/components/AnimateOnScroll";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Link } from "react-router-dom";
import { MessageCircle } from "lucide-react";

const faqItems = [
  { q: "Comment accéder à mes formations après l'achat ?", a: "Après confirmation du paiement, vous recevez un email avec les liens d'accès. Retrouvez également tous vos achats dans votre espace client." },
  { q: "Les formations ont-elles une durée d'accès limitée ?", a: "Non ! Une fois achetée, la formation est à vous pour toujours. Accès illimité, sans limite de temps." },
  { q: "Quels moyens de paiement acceptez-vous ?", a: "Mobile Money (MTN, Moov, Orange, Wave, TMoney, Airtel) et cartes bancaires Visa/MasterCard." },
  { q: "Puis-je me faire rembourser ?", a: "Oui, sous conditions. Vous disposez de 14 jours pour demander un remboursement si moins de 30% du contenu a été consulté." },
  { q: "Comment contacter le support ?", a: "Par email à contact@mindhub.com, via WhatsApp, ou via notre formulaire de contact. Réponse sous 24h ouvrées." },
];

const FAQSection = () => {
  useEffect(() => {
    const faqLd = {
      "@context": "https://schema.org",
      "@type": "FAQPage",
      mainEntity: faqItems.map((item) => ({
        "@type": "Question",
        name: item.q,
        acceptedAnswer: { "@type": "Answer", text: item.a },
      })),
    };
    const id = "faq-json-ld";
    let script = document.getElementById(id) as HTMLScriptElement | null;
    if (!script) {
      script = document.createElement("script");
      script.id = id;
      script.type = "application/ld+json";
      document.head.appendChild(script);
    }
    script.textContent = JSON.stringify(faqLd);
    return () => { document.getElementById(id)?.remove(); };
  }, []);

  return (
    <section className="py-20 bg-background">
      <div className="container mx-auto px-4 max-w-3xl">
        <AnimateOnScroll>
          <p className="text-center text-xs font-medium uppercase tracking-[0.2em] text-muted-foreground mb-2">
            FAQ
          </p>
          <h2 className="text-center text-2xl md:text-3xl font-bold text-foreground mb-12">
            Questions fréquentes
          </h2>
        </AnimateOnScroll>

        <AnimateOnScroll delay={100}>
          <Accordion type="single" collapsible className="space-y-3">
            {faqItems.map((item, i) => (
              <AccordionItem
                key={i}
                value={`faq-${i}`}
                className="stat-card rounded-xl border-border px-5 overflow-hidden"
              >
                <AccordionTrigger className="text-left text-foreground hover:no-underline text-sm font-medium py-4">
                  {item.q}
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground text-sm pb-4">
                  {item.a}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </AnimateOnScroll>

        <AnimateOnScroll delay={200}>
          <div className="mt-10 text-center">
            <p className="text-sm text-muted-foreground mb-3">
              Vous n'avez pas trouvé votre réponse ?
            </p>
            <Link
              to="/faq"
              className="inline-flex items-center gap-2 text-sm font-medium text-primary hover:text-primary/80 transition-colors"
            >
              <MessageCircle size={16} />
              Voir toutes les questions
            </Link>
          </div>
        </AnimateOnScroll>
      </div>
    </section>
  );
};

export default FAQSection;

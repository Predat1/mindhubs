import { MessageCircle } from "lucide-react";

const HelpSection = () => {
  return (
    <section id="contact" className="py-16 bg-background">
      <div className="container mx-auto px-4">
        <div className="stat-card rounded-2xl p-8 md:p-12 grid md:grid-cols-[auto_1fr_auto] gap-8 items-center max-w-4xl mx-auto">
          <div className="hidden md:block">
            <div className="text-2xl font-bold">
              <span className="text-foreground">SAVOIR</span>
              <span className="text-gradient-brand">✦</span>
              <span className="text-accent">HUB</span>
            </div>
          </div>
          <div className="space-y-2 text-center md:text-left">
            <h3 className="text-xl font-bold text-foreground">Besoin d'aide ?</h3>
            <p className="text-muted-foreground text-sm leading-relaxed">
              Nous sommes ravis de pouvoir répondre à vos questions et de vous
              assister dans tous les aspects de notre plateforme. N'hésitez pas à
              nous contacter par e-mail à{" "}
              <a href="mailto:contact@savoirhub.com" className="text-primary hover:underline">
                contact@savoirhub.com
              </a>{" "}
              ou en appuyant sur le bouton.
            </p>
          </div>
          <div>
            <a
              href="#"
              className="btn-primary-brand inline-flex items-center gap-2 px-6 py-3 rounded-lg font-semibold text-sm whitespace-nowrap"
            >
              <MessageCircle size={16} /> Contactez-Nous
            </a>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HelpSection;

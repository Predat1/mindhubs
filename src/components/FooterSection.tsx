import { MessageCircle } from "lucide-react";

const FooterSection = () => {
  return (
    <footer id="contact" className="py-16 bg-background border-t border-border">
      <div className="container mx-auto px-4 grid md:grid-cols-2 gap-12 items-center">
        <div>
          <a href="#" className="text-2xl font-bold">
            <span className="text-foreground">SAVOIR</span>
            <span className="text-gradient-brand">✦</span>
            <span className="text-accent">HUB</span>
          </a>
          <p className="text-muted-foreground mt-4 max-w-sm leading-relaxed">
            Nous sommes ravis de pouvoir répondre à vos questions et de vous
            assister dans tous les aspects de notre plateforme.
          </p>
        </div>
        <div className="space-y-4">
          <h3 className="text-xl font-semibold text-foreground">Besoin d'aide ?</h3>
          <p className="text-muted-foreground text-sm">
            N'hésitez pas à nous contacter par e-mail à{" "}
            <a href="mailto:contact@savoirhub.com" className="text-primary hover:underline">
              contact@savoirhub.com
            </a>
          </p>
          <a
            href="#"
            className="btn-primary-brand inline-flex items-center gap-2 px-6 py-3 rounded-lg font-semibold text-sm"
          >
            <MessageCircle size={18} /> Contactez-Nous
          </a>
        </div>
      </div>
      <div className="container mx-auto px-4 mt-12 pt-6 border-t border-border text-center">
        <p className="text-sm text-muted-foreground">
          © {new Date().getFullYear()} SavoirHub. Tous droits réservés.
        </p>
      </div>
    </footer>
  );
};

export default FooterSection;

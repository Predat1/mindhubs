import { MessageCircle } from "lucide-react";
import { Link } from "react-router-dom";
import AnimateOnScroll from "@/components/AnimateOnScroll";

const HelpSection = () => {
  return (
    <section id="contact" className="py-12 sm:py-16 bg-background">
      <div className="container mx-auto px-4">
        <AnimateOnScroll>
          <div className="stat-card rounded-xl sm:rounded-2xl p-6 sm:p-8 md:p-12 flex flex-col md:flex-row gap-6 sm:gap-8 items-center max-w-4xl mx-auto text-center md:text-left">
            <div className="hidden md:block shrink-0">
              <div className="text-2xl font-bold">
                <span className="text-foreground">MIND</span>
                <span className="text-gradient-brand">✦</span>
                <span className="text-accent">HUB</span>
              </div>
            </div>
            <div className="space-y-2 flex-1">
              <h3 className="text-lg sm:text-xl font-bold text-foreground">Besoin d'aide ?</h3>
              <p className="text-muted-foreground text-xs sm:text-sm leading-relaxed">
                Nous sommes ravis de répondre à vos questions.
                Contactez-nous par e-mail à{" "}
                <a href="mailto:contact@mindhub.com" className="text-primary hover:underline">
                  contact@mindhub.com
                </a>{" "}
                ou en appuyant sur le bouton.
              </p>
            </div>
            <div className="shrink-0">
              <Link
                to="/contact"
                className="btn-primary-brand inline-flex items-center gap-2 px-5 sm:px-6 py-2.5 sm:py-3 rounded-lg font-semibold text-xs sm:text-sm whitespace-nowrap hover-scale"
              >
                <MessageCircle size={16} /> Contactez-Nous
              </Link>
            </div>
          </div>
        </AnimateOnScroll>
      </div>
    </section>
  );
};

export default HelpSection;

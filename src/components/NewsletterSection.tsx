import { useState } from "react";
import { Mail } from "lucide-react";
import AnimateOnScroll from "@/components/AnimateOnScroll";

const NewsletterSection = () => {
  const [email, setEmail] = useState("");

  return (
    <section className="py-12 sm:py-16 newsletter-section">
      <div className="h-1 w-full bg-gradient-to-r from-transparent via-primary to-transparent mb-8 sm:mb-12" />
      <AnimateOnScroll>
        <div className="container mx-auto px-4 max-w-2xl text-center space-y-3 sm:space-y-4">
          <p className="text-accent text-xs sm:text-sm font-medium">Un cadeau exceptionnel pour vous</p>
          <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-foreground">
            Inscrivez-vous et obtenez 10% de réduction
          </h2>
          <p className="text-muted-foreground text-[10px] sm:text-xs">
            Inscrivez-vous sans engagement. Votre mail est en sécurité
          </p>
          <form className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto mt-4" onSubmit={(e) => e.preventDefault()}>
            <div className="flex-1 relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={14} />
              <input
                type="email"
                placeholder="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-8 sm:pl-9 pr-4 py-2.5 rounded-lg bg-input border border-border text-foreground text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary transition-all"
              />
            </div>
            <button className="btn-primary-brand px-6 py-2.5 rounded-lg font-semibold text-xs sm:text-sm whitespace-nowrap hover-scale">
              S'inscrire
            </button>
          </form>
        </div>
      </AnimateOnScroll>
      <div className="h-1 w-full bg-gradient-to-r from-transparent via-primary to-transparent mt-8 sm:mt-12" />
    </section>
  );
};

export default NewsletterSection;

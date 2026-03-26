import { useState } from "react";
import { Mail } from "lucide-react";

const NewsletterSection = () => {
  const [email, setEmail] = useState("");

  return (
    <section className="py-20 newsletter-section">
      <div className="container mx-auto px-4 max-w-2xl text-center space-y-6">
        <span className="badge-purple inline-block px-4 py-2 rounded-full text-sm font-medium">
          Un cadeau exceptionnel pour vous
        </span>
        <h2 className="text-3xl md:text-4xl font-bold text-foreground">
          Inscrivez-vous et obtenez 10% de réduction
        </h2>
        <p className="text-muted-foreground">
          Inscrivez-vous sans engagement. Votre mail est en sécurité
        </p>
        <form
          className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto"
          onSubmit={(e) => e.preventDefault()}
        >
          <div className="flex-1 relative">
            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={18} />
            <input
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full pl-10 pr-4 py-3 rounded-lg bg-input border border-border text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>
          <button className="btn-primary-brand px-6 py-3 rounded-lg font-semibold whitespace-nowrap">
            S'inscrire
          </button>
        </form>
      </div>
    </section>
  );
};

export default NewsletterSection;

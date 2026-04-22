import { ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";

const HeroSection = () => {
  return (
    <section className="aurora-glow relative min-h-[90vh] sm:min-h-screen flex flex-col items-center justify-center bg-background pt-32 sm:pt-36 pb-8 sm:pb-10 overflow-hidden">
      {/* Decorative floating dots */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="floating-dot absolute top-[20%] left-[15%] h-2 w-2 rounded-full bg-primary/40" />
        <div className="floating-dot absolute top-[35%] right-[18%] h-1.5 w-1.5 rounded-full bg-primary/50" style={{ animationDelay: "1s" }} />
        <div className="floating-dot absolute bottom-[30%] left-[20%] h-1 w-1 rounded-full bg-primary/30" style={{ animationDelay: "2s" }} />
        <div className="floating-dot absolute bottom-[40%] right-[25%] h-2 w-2 rounded-full bg-primary/40" style={{ animationDelay: "1.5s" }} />
      </div>

      {/* Eyebrow badge */}
      <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-3 py-1.5 text-[10px] sm:text-xs font-medium text-primary animate-fade-in" style={{ animationDelay: "0.05s" }}>
        <span className="relative flex h-2 w-2">
          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-primary opacity-75" />
          <span className="relative inline-flex h-2 w-2 rounded-full bg-primary" />
        </span>
        Nouveau · Plateforme N°1 en Afrique
      </div>

      {/* Headline */}
      <h1
        className="text-center text-3xl sm:text-5xl md:text-6xl lg:text-7xl font-extrabold leading-[1.1] tracking-tight text-foreground max-w-4xl px-6 animate-fade-in"
        style={{ animationDelay: "0.1s" }}
      >
        Libérez votre potentiel,
        <br />
        <span className="text-gradient-brand">formez-vous autrement</span>
      </h1>

      {/* Subtitle */}
      <p
        className="mt-5 sm:mt-6 text-center text-sm sm:text-base md:text-lg text-muted-foreground max-w-xl px-6 leading-relaxed animate-fade-in"
        style={{ animationDelay: "0.2s" }}
      >
        Des compétences concrètes, un paiement unique,
        <br className="hidden sm:block" />
        un accès illimité — tout en un seul endroit.
      </p>

      {/* CTA Button */}
      <div className="mt-8 sm:mt-10 animate-fade-in" style={{ animationDelay: "0.3s" }}>
        <Link
          to="/boutique"
          className="btn-glow group inline-flex items-center gap-3 px-7 sm:px-8 py-3.5 sm:py-4 rounded-xl font-semibold text-sm bg-primary text-primary-foreground hover:bg-primary/90 transition-all duration-300 hover:-translate-y-0.5"
        >
          Découvrir les formations
          <ArrowRight
            size={16}
            className="transition-transform duration-300 group-hover:translate-x-1"
          />
        </Link>
      </div>

      {/* Trust badges */}
      <div className="mt-12 sm:mt-16 flex flex-wrap items-center justify-center gap-4 sm:gap-6 px-6 animate-fade-in" style={{ animationDelay: "0.4s" }}>
        {[
          "🔒 Paiement sécurisé",
          "♾️ Accès à vie",
          "⭐ 4.9/5 satisfaction",
        ].map((badge) => (
          <span
            key={badge}
            className="text-[11px] sm:text-xs text-muted-foreground font-medium"
          >
            {badge}
          </span>
        ))}
      </div>
    </section>
  );
};

export default HeroSection;

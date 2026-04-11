import { ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";

const HeroSection = () => {
  return (
    <section className="relative min-h-screen flex flex-col items-center justify-center bg-[hsl(220,10%,92%)] pt-28 md:pt-32 pb-20 overflow-hidden">
      {/* Announcement badge */}
      <div className="mb-8 animate-fade-in">
        <Link
          to="/boutique"
          className="inline-flex items-center gap-2 text-xs font-mono uppercase tracking-[0.15em] text-muted-foreground hover:text-foreground transition-colors"
        >
          NOUVEAU — Formations 2026 disponibles
          <ArrowRight size={14} />
        </Link>
      </div>

      {/* Headline */}
      <h1
        className="text-center text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-extrabold leading-[1.1] tracking-tight text-[hsl(220,15%,15%)] max-w-4xl px-4 animate-fade-in"
        style={{ animationDelay: "0.1s" }}
      >
        Libérez votre potentiel,
        <br />
        formez-vous autrement
      </h1>

      {/* Subtitle */}
      <p
        className="mt-6 text-center text-base md:text-lg text-[hsl(220,8%,50%)] max-w-xl px-4 leading-relaxed animate-fade-in"
        style={{ animationDelay: "0.2s" }}
      >
        Des compétences concrètes, un paiement unique,
        <br className="hidden sm:block" />
        un accès illimité — tout en un seul endroit.
      </p>

      {/* CTA Button */}
      <div className="mt-10 animate-fade-in" style={{ animationDelay: "0.3s" }}>
        <Link
          to="/boutique"
          className="group inline-flex items-center gap-3 px-8 py-4 rounded-xl bg-[hsl(220,15%,15%)] text-[hsl(0,0%,100%)] font-semibold text-sm hover:bg-[hsl(220,15%,20%)] transition-colors duration-300 shadow-lg"
        >
          Découvrir les formations
          <ArrowRight
            size={16}
            className="transition-transform duration-300 group-hover:translate-x-1"
          />
        </Link>
      </div>
    </section>
  );
};

export default HeroSection;

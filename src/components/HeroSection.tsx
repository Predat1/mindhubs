import { ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";
import hero3dShapes from "@/assets/hero-3d-shapes.png";

const HeroSection = () => {
  return (
    <section className="relative min-h-screen flex flex-col items-center justify-center bg-background pt-28 md:pt-32 pb-20 overflow-hidden">
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
        className="text-center text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-extrabold leading-[1.1] tracking-tight text-foreground max-w-4xl px-4 animate-fade-in"
        style={{ animationDelay: "0.1s" }}
      >
        Libérez votre potentiel,
        <br />
        formez-vous autrement
      </h1>

      {/* Subtitle */}
      <p
        className="mt-6 text-center text-base md:text-lg text-muted-foreground max-w-xl px-4 leading-relaxed animate-fade-in"
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
          className="btn-primary-brand group inline-flex items-center gap-3 px-8 py-4 rounded-xl font-semibold text-sm shadow-lg"
        >
          Découvrir les formations
          <ArrowRight
            size={16}
            className="transition-transform duration-300 group-hover:translate-x-1"
          />
        </Link>
      </div>

      {/* 3D Illustration */}
      <div className="mt-16 animate-fade-in relative" style={{ animationDelay: "0.4s" }}>
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-64 h-64 rounded-full bg-primary/10 blur-[80px]" />
        </div>
        <img
          src={hero3dShapes}
          alt="Illustration 3D décorative"
          width={1024}
          height={512}
          className="relative z-10 max-w-[500px] md:max-w-[600px] w-full h-auto object-contain"
        />
      </div>
    </section>
  );
};

export default HeroSection;

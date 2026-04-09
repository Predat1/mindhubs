import { ArrowRight, Play, Star, Users, BookOpen } from "lucide-react";
import { Link } from "react-router-dom";
import heroStudent from "@/assets/hero-student.png";

const HeroSection = () => {
  return (
    <section className="relative min-h-screen flex items-center bg-background pt-16 overflow-hidden">
      {/* Animated gradient mesh background */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-1/2 -left-1/4 w-[800px] h-[800px] rounded-full bg-primary/6 blur-[200px] animate-pulse-slow" />
        <div className="absolute -bottom-1/3 -right-1/4 w-[600px] h-[600px] rounded-full bg-accent/4 blur-[180px] animate-pulse-slow" style={{ animationDelay: "3s" }} />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] rounded-full bg-primary/3 blur-[160px] animate-pulse-slow" style={{ animationDelay: "1.5s" }} />
        {/* Grid pattern overlay */}
        <div className="absolute inset-0 opacity-[0.03]" style={{
          backgroundImage: "linear-gradient(hsl(var(--foreground)) 1px, transparent 1px), linear-gradient(90deg, hsl(var(--foreground)) 1px, transparent 1px)",
          backgroundSize: "60px 60px"
        }} />
      </div>

      <div className="container mx-auto px-4 relative z-10">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-8 items-center">
          {/* Left — Content */}
          <div className="space-y-8 max-w-xl">
            {/* Pill badge */}
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 text-xs font-semibold tracking-wide text-primary animate-fade-in">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-accent opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-accent" />
              </span>
              NOUVEAU — Formations 2025 disponibles
            </div>

            {/* Headline */}
            <h1 className="text-4xl sm:text-5xl lg:text-6xl xl:text-7xl font-extrabold leading-[1.05] tracking-tight text-foreground animate-fade-in" style={{ animationDelay: "0.1s" }}>
              Libérez votre
              <br />
              <span className="text-gradient-brand">potentiel</span>
              <br />
              <span className="text-muted-foreground font-semibold text-3xl sm:text-4xl lg:text-5xl">avec les meilleures formations.</span>
            </h1>

            {/* Subtitle */}
            <p className="text-muted-foreground text-base md:text-lg leading-relaxed animate-fade-in" style={{ animationDelay: "0.2s" }}>
              Des compétences concrètes, un paiement unique, un accès illimité. Rejoignez des milliers d'apprenants qui transforment leur carrière.
            </p>

            {/* CTA row */}
            <div className="flex flex-col sm:flex-row gap-4 animate-fade-in" style={{ animationDelay: "0.3s" }}>
              <Link
                to="/boutique"
                className="btn-primary-brand group inline-flex items-center justify-center gap-3 px-8 py-4 rounded-2xl font-bold text-sm shadow-lg shadow-primary/25"
              >
                Découvrir les formations
                <ArrowRight size={18} className="transition-transform duration-300 group-hover:translate-x-1" />
              </Link>
              <a
                href="#expertise"
                className="group inline-flex items-center justify-center gap-3 px-8 py-4 rounded-2xl font-semibold text-sm border border-border text-foreground hover:bg-card hover:border-primary/30 transition-all duration-300"
              >
                <span className="flex items-center justify-center w-8 h-8 rounded-full bg-primary/10 group-hover:bg-primary/20 transition-colors">
                  <Play size={14} className="text-primary ml-0.5" />
                </span>
                Voir la démo
              </a>
            </div>

            {/* Social proof row */}
            <div className="flex items-center gap-6 pt-2 animate-fade-in" style={{ animationDelay: "0.4s" }}>
              {/* Avatar stack */}
              <div className="flex -space-x-3">
                {["A", "F", "K", "M"].map((letter, i) => (
                  <div
                    key={letter}
                    className="w-9 h-9 rounded-full border-2 border-background bg-gradient-to-br from-primary to-accent flex items-center justify-center text-xs font-bold text-primary-foreground"
                    style={{ zIndex: 4 - i }}
                  >
                    {letter}
                  </div>
                ))}
              </div>
              <div className="text-sm">
                <div className="flex items-center gap-1 text-accent">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} size={13} fill="currentColor" />
                  ))}
                </div>
                <p className="text-muted-foreground text-xs mt-0.5">
                  <span className="text-foreground font-semibold">2 500+</span> apprenants satisfaits
                </p>
              </div>
            </div>
          </div>

          {/* Right — Visual */}
          <div className="relative flex justify-center lg:justify-end animate-fade-in" style={{ animationDelay: "0.2s" }}>
            {/* Decorative ring */}
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-[340px] h-[340px] md:w-[440px] md:h-[440px] rounded-full border border-primary/10 animate-[spin_30s_linear_infinite]" />
            </div>
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-[280px] h-[280px] md:w-[380px] md:h-[380px] rounded-full border border-accent/8 animate-[spin_25s_linear_infinite_reverse]" />
            </div>

            {/* Glow */}
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-64 h-64 md:w-80 md:h-80 rounded-full bg-primary/12 blur-[100px]" />
            </div>

            {/* Hero image */}
            <img
              src={heroStudent}
              alt="Étudiante avec ordinateur portable"
              width={600}
              height={750}
              className="relative z-10 max-h-[520px] object-contain drop-shadow-hero"
            />

            {/* Floating stat cards */}
            <div className="absolute top-12 -left-4 md:left-0 z-20 bg-card/90 backdrop-blur-xl border border-border rounded-2xl px-4 py-3 shadow-xl animate-float-particle" style={{ animationDuration: "6s" }}>
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-primary/15 flex items-center justify-center">
                  <BookOpen size={16} className="text-primary" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Formations</p>
                  <p className="text-sm font-bold text-foreground">50+ disponibles</p>
                </div>
              </div>
            </div>

            <div className="absolute bottom-16 -right-2 md:right-0 z-20 bg-card/90 backdrop-blur-xl border border-border rounded-2xl px-4 py-3 shadow-xl animate-float-particle" style={{ animationDuration: "7s", animationDelay: "1s" }}>
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-accent/15 flex items-center justify-center">
                  <Users size={16} className="text-accent" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Communauté</p>
                  <p className="text-sm font-bold text-foreground">2 500+ membres</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom fade */}
      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-background to-transparent" />
    </section>
  );
};

export default HeroSection;

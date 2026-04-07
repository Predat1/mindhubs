import { ArrowRight, Sparkles } from "lucide-react";
import { Link } from "react-router-dom";
import heroStudent from "@/assets/hero-student.png";

const HeroSection = () => {
  return (
    <section className="relative min-h-[90vh] flex items-center bg-gradient-hero pt-20 overflow-hidden">
      {/* Subtle ambient glow */}
      <div className="absolute top-1/3 left-1/4 w-[500px] h-[500px] bg-primary/5 rounded-full blur-[160px]" />
      <div className="absolute bottom-1/4 right-1/4 w-[400px] h-[400px] bg-accent/5 rounded-full blur-[140px]" />

      <div className="container mx-auto px-4 grid md:grid-cols-2 gap-12 items-center relative z-10">
        {/* Text */}
        <div className="space-y-6 animate-fade-in">
          <span className="badge-purple inline-flex items-center gap-2 px-4 py-2 rounded-full text-xs font-semibold uppercase tracking-wider">
            <Sparkles size={14} className="text-accent" />
            Paiement unique · Accès illimité
          </span>

          <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold leading-[1.1] text-foreground">
            Votre succès commence{" "}
            <span className="text-gradient-brand">ici.</span>
          </h1>

          <p className="text-muted-foreground text-base md:text-lg max-w-lg leading-relaxed">
            Accédez à des formations digitales premium et transformez votre avenir professionnel dès aujourd'hui.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 pt-2">
            <Link
              to="/boutique"
              className="btn-primary-brand group inline-flex items-center justify-center gap-2 px-8 py-4 rounded-xl font-bold text-sm"
            >
              VOIR NOS FORMATIONS
              <ArrowRight size={18} className="transition-transform duration-300 group-hover:translate-x-1" />
            </Link>
            <a
              href="#expertise"
              className="inline-flex items-center justify-center gap-2 px-8 py-4 rounded-xl font-semibold text-sm border border-border text-foreground bg-card/50 backdrop-blur-sm hover:bg-card hover:border-primary/30 transition-all duration-300"
            >
              EN SAVOIR PLUS
            </a>
          </div>

          {/* Minimal trust line */}
          <p className="text-muted-foreground text-xs pt-2">
            ✓ Paiement sécurisé &nbsp; ✓ Support 24/7 &nbsp; ✓ Accès à vie
          </p>
        </div>

        {/* Hero image — clean, no floating badges */}
        <div className="relative flex justify-center md:justify-end animate-fade-in" style={{ animationDelay: "0.15s" }}>
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-72 h-72 md:w-96 md:h-96 rounded-full bg-primary/6 blur-3xl" />
          </div>
          <img
            src={heroStudent}
            alt="Étudiante avec ordinateur portable"
            width={600}
            height={750}
            className="relative z-10 max-h-[520px] object-contain drop-shadow-hero"
          />
        </div>
      </div>

      {/* Bottom fade */}
      <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-background to-transparent" />
    </section>
  );
};

export default HeroSection;

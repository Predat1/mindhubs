import { useEffect, useState, useRef } from "react";
import { GraduationCap, Shield, Headphones, Infinity, Sparkles, ArrowRight } from "lucide-react";
import heroStudent from "@/assets/hero-student.png";

const words = ["Apprentissage", "Formation", "Réussite", "Expertise"];

const HeroSection = () => {
  const [currentWord, setCurrentWord] = useState(0);
  const [displayed, setDisplayed] = useState("");
  const [deleting, setDeleting] = useState(false);
  const [loaded, setLoaded] = useState(false);
  const sectionRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const t = setTimeout(() => setLoaded(true), 100);
    return () => clearTimeout(t);
  }, []);

  useEffect(() => {
    const word = words[currentWord];
    let timeout: ReturnType<typeof setTimeout>;

    if (!deleting && displayed.length < word.length) {
      timeout = setTimeout(() => setDisplayed(word.slice(0, displayed.length + 1)), 100);
    } else if (!deleting && displayed.length === word.length) {
      timeout = setTimeout(() => setDeleting(true), 1800);
    } else if (deleting && displayed.length > 0) {
      timeout = setTimeout(() => setDisplayed(word.slice(0, displayed.length - 1)), 60);
    } else if (deleting && displayed.length === 0) {
      setDeleting(false);
      setCurrentWord((prev) => (prev + 1) % words.length);
    }

    return () => clearTimeout(timeout);
  }, [displayed, deleting, currentWord]);

  return (
    <section ref={sectionRef} className="relative min-h-[92vh] flex items-center bg-gradient-hero pt-16 overflow-hidden">
      {/* Animated grid background */}
      <div className="absolute inset-0 opacity-[0.03]" style={{
        backgroundImage: `linear-gradient(hsl(var(--primary)) 1px, transparent 1px), linear-gradient(90deg, hsl(var(--primary)) 1px, transparent 1px)`,
        backgroundSize: '60px 60px',
      }} />

      {/* Ambient glow orbs with improved animation */}
      <div className="absolute top-20 left-10 w-72 h-72 bg-primary/10 rounded-full blur-[120px] animate-pulse-slow" />
      <div className="absolute bottom-10 right-20 w-96 h-96 bg-accent/8 rounded-full blur-[140px] animate-pulse-slow" style={{ animationDelay: "2s" }} />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-primary/5 rounded-full blur-[180px]" />
      <div className="absolute top-10 right-1/4 w-48 h-48 bg-accent/5 rounded-full blur-[100px] animate-pulse-slow" style={{ animationDelay: "3s" }} />

      {/* Floating particles - more variety */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {Array.from({ length: 10 }).map((_, i) => (
          <div
            key={i}
            className="absolute rounded-full animate-float-particle"
            style={{
              width: `${2 + (i % 3)}px`,
              height: `${2 + (i % 3)}px`,
              background: i % 2 === 0
                ? `hsl(var(--primary) / ${0.2 + (i % 4) * 0.1})`
                : `hsl(var(--accent) / ${0.15 + (i % 3) * 0.1})`,
              left: `${8 + i * 9}%`,
              top: `${15 + (i % 4) * 20}%`,
              animationDelay: `${i * 0.5}s`,
              animationDuration: `${4 + i * 0.4}s`,
            }}
          />
        ))}
      </div>

      <div className="container mx-auto px-4 grid md:grid-cols-2 gap-10 items-center relative z-10">
        {/* Text content with staggered entrance */}
        <div className="space-y-6">
          {/* Badge */}
          <span
            className="badge-purple inline-flex items-center gap-2 px-5 py-2.5 rounded-full text-xs font-semibold uppercase tracking-wider shadow-glow"
            style={{
              opacity: loaded ? 1 : 0,
              transform: loaded ? "translateY(0)" : "translateY(20px)",
              transition: "all 0.7s cubic-bezier(0.16, 1, 0.3, 1) 0.2s",
            }}
          >
            <Sparkles size={14} className="text-accent animate-pulse" />
            Paiement unique et Accès illimité
          </span>

          {/* Title */}
          <h1
            className="text-4xl md:text-5xl lg:text-6xl font-extrabold leading-[1.1] text-foreground"
            style={{
              opacity: loaded ? 1 : 0,
              transform: loaded ? "translateY(0)" : "translateY(30px)",
              transition: "all 0.8s cubic-bezier(0.16, 1, 0.3, 1) 0.4s",
            }}
          >
            Bienvenue sur
            <span className="text-gradient-brand block text-5xl md:text-6xl lg:text-7xl mt-2">
              Savoir <span className="text-accent">Hub</span>
            </span>
            <span className="block mt-2 text-3xl md:text-4xl lg:text-5xl font-bold">l'Excellence en</span>
          </h1>

          {/* Typing effect */}
          <div
            style={{
              opacity: loaded ? 1 : 0,
              transform: loaded ? "translateY(0)" : "translateY(30px)",
              transition: "all 0.8s cubic-bezier(0.16, 1, 0.3, 1) 0.6s",
            }}
          >
            <p className="text-2xl md:text-3xl lg:text-4xl font-bold text-foreground h-12">
              {displayed}
              <span className="inline-block w-1 h-9 bg-primary ml-1 animate-cursor-blink rounded-sm" />
            </p>
          </div>

          {/* Description */}
          <p
            className="text-muted-foreground text-sm md:text-base max-w-md leading-relaxed"
            style={{
              opacity: loaded ? 1 : 0,
              transform: loaded ? "translateY(0)" : "translateY(20px)",
              transition: "all 0.8s cubic-bezier(0.16, 1, 0.3, 1) 0.8s",
            }}
          >
            Accédez à des formations digitales de qualité premium et transformez votre avenir professionnel dès aujourd'hui.
          </p>

          {/* CTA Buttons */}
          <div
            className="flex flex-col sm:flex-row gap-4 pt-2"
            style={{
              opacity: loaded ? 1 : 0,
              transform: loaded ? "translateY(0)" : "translateY(20px)",
              transition: "all 0.8s cubic-bezier(0.16, 1, 0.3, 1) 1s",
            }}
          >
            <a
              href="#formations"
              className="btn-primary-brand group inline-flex items-center justify-center gap-2 px-8 py-4 rounded-xl font-bold text-sm shadow-glow relative overflow-hidden"
            >
              <span className="absolute inset-0 bg-white/10 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700 skew-x-12" />
              VOIR NOS FORMATIONS
              <ArrowRight size={18} className="transition-transform duration-300 group-hover:translate-x-1" />
            </a>
            <a
              href="#expertise"
              className="group inline-flex items-center justify-center gap-2 px-8 py-4 rounded-xl font-semibold text-sm border border-border text-foreground bg-card/50 backdrop-blur-sm hover:bg-card hover:border-primary/50 hover:shadow-glow transition-all duration-500"
            >
              EN SAVOIR PLUS
              <GraduationCap size={18} className="transition-transform duration-300 group-hover:rotate-12" />
            </a>
          </div>

          {/* Trust micro-badges */}
          <div
            className="flex flex-wrap gap-5 pt-4"
            style={{
              opacity: loaded ? 1 : 0,
              transform: loaded ? "translateY(0)" : "translateY(20px)",
              transition: "all 0.8s cubic-bezier(0.16, 1, 0.3, 1) 1.2s",
            }}
          >
            {[
              { icon: Shield, label: "Paiement sécurisé" },
              { icon: Headphones, label: "Support 24/7" },
              { icon: Infinity, label: "Accès à vie" },
            ].map(({ icon: Icon, label }) => (
              <div key={label} className="group flex items-center gap-2 text-muted-foreground text-xs hover:text-foreground transition-colors duration-300 cursor-default">
                <div className="w-7 h-7 rounded-full bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors duration-300">
                  <Icon size={13} className="text-primary" />
                </div>
                <span>{label}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Hero image */}
        <div
          className="relative flex justify-center md:justify-end"
          style={{
            opacity: loaded ? 1 : 0,
            transform: loaded ? "translateX(0) scale(1)" : "translateX(60px) scale(0.95)",
            transition: "all 1s cubic-bezier(0.16, 1, 0.3, 1) 0.5s",
          }}
        >
          {/* Glow ring behind image */}
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-80 h-80 md:w-96 md:h-96 rounded-full bg-primary/10 blur-3xl animate-pulse-glow" />
          </div>
          {/* Rotating ring */}
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div
              className="w-72 h-72 md:w-[340px] md:h-[340px] rounded-full border border-primary/10"
              style={{ animation: "spin 20s linear infinite" }}
            />
          </div>

          <img
            src={heroStudent}
            alt="Étudiante avec ordinateur portable"
            width={600}
            height={750}
            className="relative z-10 max-h-[560px] object-contain drop-shadow-hero hover-float"
          />

          {/* Floating stat badges with glass morphism */}
          <div
            className="absolute top-8 right-0 md:right-4 rounded-xl px-4 py-3 z-20 bg-card/80 backdrop-blur-md border border-border shadow-glow animate-float"
            style={{
              opacity: loaded ? 1 : 0,
              transform: loaded ? "translateY(0)" : "translateY(-20px)",
              transition: "opacity 0.8s ease 1.4s, transform 0.8s ease 1.4s",
            }}
          >
            <p className="text-accent font-bold text-lg">4.9 ★</p>
            <p className="text-muted-foreground text-[10px]">Avis clients</p>
          </div>
          <div
            className="absolute bottom-16 left-0 md:left-4 rounded-xl px-4 py-3 z-20 bg-card/80 backdrop-blur-md border border-border shadow-glow animate-float"
            style={{
              animationDelay: "1.5s",
              opacity: loaded ? 1 : 0,
              transform: loaded ? "translateY(0)" : "translateY(20px)",
              transition: "opacity 0.8s ease 1.6s, transform 0.8s ease 1.6s",
            }}
          >
            <p className="text-primary font-bold text-lg">500+</p>
            <p className="text-muted-foreground text-[10px]">Étudiants formés</p>
          </div>
          {/* New badge */}
          <div
            className="absolute top-1/2 left-0 md:-left-4 rounded-xl px-4 py-3 z-20 bg-card/80 backdrop-blur-md border border-border shadow-glow animate-float"
            style={{
              animationDelay: "2.5s",
              opacity: loaded ? 1 : 0,
              transform: loaded ? "translateY(0)" : "translateX(-20px)",
              transition: "opacity 0.8s ease 1.8s, transform 0.8s ease 1.8s",
            }}
          >
            <p className="text-green-400 font-bold text-lg flex items-center gap-1">
              <Sparkles size={14} /> 98%
            </p>
            <p className="text-muted-foreground text-[10px]">Satisfaction</p>
          </div>
        </div>
      </div>

      {/* Bottom gradient fade */}
      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-background to-transparent" />
    </section>
  );
};

export default HeroSection;

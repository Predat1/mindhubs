import { ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";

const logos = [
  { name: "Stripe", svg: (
    <svg viewBox="0 0 60 25" fill="currentColor" className="h-6 w-auto"><path d="M5 10.2c0-.7.6-1 1.5-1 1.3 0 3 .4 4.3 1.1V6.7c-1.4-.6-2.9-.8-4.3-.8C3.3 5.9.8 7.8.8 10.4c0 4.1 5.6 3.4 5.6 5.2 0 .8-.7 1.1-1.7 1.1-1.5 0-3.4-.6-4.9-1.4v3.6c1.7.7 3.3 1 4.9 1 3.3 0 5.6-1.6 5.6-4.3-.1-4.4-5.6-3.6-5.3-5.4z"/><path d="M14.6 2.3l-4.1.9v3.4l4.1-.9V2.3zM10.5 7.2h4.1v12.5h-4.1V7.2zM19.5 7.2l-.3 1.2h-.1c-.8-1-2-1.5-3.5-1.5v4c.6 0 1.4.2 1.9.5.7.4 1 1 1 2v6.3h4.1v-7c0-3.7-1.5-5.5-3.1-5.5zM28.4 5.9c-1.4 0-2.3.7-2.9 1.1l-.2-.9h-3.7v16.4l4.1-.9v-4c.6.4 1.4.7 2.4.7 2.4 0 4.6-2 4.6-6.2.1-3.9-2.1-6.2-4.3-6.2zm-.8 9.5c-.8 0-1.2-.3-1.5-.6v-5c.3-.4.8-.7 1.5-.7 1.2 0 2 1.3 2 3.1 0 1.9-.8 3.2-2 3.2z"/><path d="M38.3 5.9c-2.9 0-4.8 2.5-4.8 6.3 0 4.1 2.1 6.1 5.2 6.1 1.5 0 2.6-.3 3.5-.8v-3.1c-.9.4-1.9.7-3.2.7-1.3 0-2.4-.4-2.5-1.9h6.3c0-.2 0-.8.1-1.1-.1-3.8-1.9-6.2-4.6-6.2zm-1.7 5c0-1.4.9-2 1.7-2s1.6.6 1.6 2h-3.3z"/></svg>
  )},
  { name: "PayPal", svg: (
    <svg viewBox="0 0 80 20" fill="currentColor" className="h-5 w-auto"><text x="0" y="16" fontSize="16" fontWeight="700" fontFamily="sans-serif">PayPal</text></svg>
  )},
  { name: "Google", svg: (
    <svg viewBox="0 0 80 20" fill="currentColor" className="h-5 w-auto"><text x="0" y="16" fontSize="16" fontWeight="700" fontFamily="sans-serif">Google</text></svg>
  )},
  { name: "Samsung", svg: (
    <svg viewBox="0 0 100 20" fill="currentColor" className="h-5 w-auto"><text x="0" y="16" fontSize="14" fontWeight="700" fontFamily="sans-serif" letterSpacing="3">SAMSUNG</text></svg>
  )},
  { name: "Visa", svg: (
    <svg viewBox="0 0 60 20" fill="currentColor" className="h-5 w-auto"><text x="0" y="16" fontSize="16" fontWeight="700" fontFamily="sans-serif" fontStyle="italic">VISA</text></svg>
  )},
  { name: "Notion", svg: (
    <svg viewBox="0 0 80 20" fill="currentColor" className="h-5 w-auto"><text x="0" y="16" fontSize="16" fontWeight="700" fontFamily="sans-serif">Notion</text></svg>
  )},
];

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
          className="group inline-flex items-center gap-3 px-8 py-4 rounded-xl font-semibold text-sm shadow-lg bg-primary text-primary-foreground hover:bg-primary/90 transition-all duration-300"
        >
          Découvrir les formations
          <ArrowRight
            size={16}
            className="transition-transform duration-300 group-hover:translate-x-1"
          />
        </Link>
      </div>

      {/* Logo Cloud */}
      <div className="mt-20 w-full max-w-3xl px-4 animate-fade-in" style={{ animationDelay: "0.4s" }}>
        <p className="text-center text-xs font-medium uppercase tracking-[0.2em] text-muted-foreground mb-8">
          Ils nous font confiance
        </p>
        <div className="flex flex-wrap items-center justify-center gap-x-10 gap-y-6">
          {logos.map((logo) => (
            <div
              key={logo.name}
              className="text-muted-foreground/50 hover:text-foreground transition-colors duration-300"
            >
              {logo.svg}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default HeroSection;

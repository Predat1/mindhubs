import { ArrowRight, Star, TrendingUp, Users } from "lucide-react";
import { Link } from "react-router-dom";
import { useEffect, useRef, useState } from "react";
import { usePlatformStats } from "@/hooks/usePlatformStats";

/* ── Animated counter ─────────────────────────────────────────── */
function AnimatedCount({ target, suffix = "" }: { target: number; suffix?: string }) {
  const [display, setDisplay] = useState(0);
  const raf = useRef<number>(0);
  const startTime = useRef<number>(0);

  useEffect(() => {
    if (target === 0) return;
    const duration = 1600;
    const start = performance.now();
    startTime.current = start;

    const tick = (now: number) => {
      const elapsed = now - start;
      const progress = Math.min(elapsed / duration, 1);
      // easeOutExpo
      const eased = progress === 1 ? 1 : 1 - Math.pow(2, -10 * progress);
      setDisplay(Math.floor(eased * target));
      if (progress < 1) raf.current = requestAnimationFrame(tick);
    };

    raf.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf.current);
  }, [target]);

  return (
    <span>
      {display.toLocaleString("fr-FR")}
      {suffix}
    </span>
  );
}

/* ── Avatar stack ─────────────────────────────────────────────── */
const AVATAR_SEEDS = ["Aisha", "Kwame", "Fatou", "Olivier", "Nadia", "Mamadou"];

const AvatarStack = () => (
  <div className="flex items-center -space-x-2.5">
    {AVATAR_SEEDS.map((name, i) => (
      <div
        key={name}
        className="relative h-8 w-8 rounded-full border-2 border-background overflow-hidden ring-1 ring-primary/20"
        style={{ zIndex: AVATAR_SEEDS.length - i }}
      >
        <img
          src={`https://api.dicebear.com/9.x/lorelei/svg?seed=${name}&backgroundColor=b6e3f4,c0aede,d1d4f9,ffd5dc,ffdfbf`}
          alt={name}
          className="h-full w-full object-cover bg-muted"
          loading="eager"
        />
      </div>
    ))}
  </div>
);

/* ── Main Component ───────────────────────────────────────────── */
const HeroSection = () => {
  const { data: stats } = usePlatformStats();

  // Minimum display values so the hero never looks empty on first load
  const buyers = Math.max(stats?.totalBuyers ?? 0, 500);
  const vendors = Math.max(stats?.totalVendors ?? 0, 20);

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
      <div
        className="mb-6 inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-3 py-1.5 text-[10px] sm:text-xs font-medium text-primary animate-fade-in"
        style={{ animationDelay: "0.05s" }}
      >
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
          <ArrowRight size={16} className="transition-transform duration-300 group-hover:translate-x-1" />
        </Link>
      </div>

      {/* ═══════════════════════════════════════════════════
          SOCIAL PROOF BLOCK
      ═══════════════════════════════════════════════════ */}
      <div
        className="mt-10 sm:mt-14 w-full max-w-3xl px-6 animate-fade-in"
        style={{ animationDelay: "0.45s" }}
      >
        {/* Main social proof card */}
        <div className="relative rounded-2xl border border-primary/15 bg-card/60 backdrop-blur-sm px-5 py-4 sm:px-8 sm:py-5 flex flex-col sm:flex-row items-center justify-between gap-5 sm:gap-4 shadow-[0_0_40px_hsl(var(--primary)/0.06)]">

          {/* Left — Avatar stack + buyers */}
          <div className="flex flex-col items-center sm:items-start gap-2">
            <AvatarStack />
            <div className="flex items-baseline gap-1.5">
              <span className="text-xl sm:text-2xl font-extrabold text-foreground">
                <AnimatedCount target={buyers} suffix="+" />
              </span>
              <span className="text-xs sm:text-sm text-muted-foreground font-medium">
                étudiants formés
              </span>
            </div>
            {/* Stars */}
            <div className="flex items-center gap-1">
              {Array.from({ length: 5 }).map((_, i) => (
                <Star key={i} size={13} className="fill-primary text-primary" />
              ))}
              <span className="ml-1 text-[11px] text-muted-foreground">4.9 / 5 satisfaction</span>
            </div>
          </div>

          {/* Divider (desktop) */}
          <div className="hidden sm:block h-14 w-px bg-border/60 rounded-full" />

          {/* Center — Vendors */}
          <div className="flex flex-col items-center gap-1">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 border border-primary/20 mb-1">
              <Users size={20} className="text-primary" />
            </div>
            <span className="text-xl sm:text-2xl font-extrabold text-foreground">
              <AnimatedCount target={vendors} suffix="+" />
            </span>
            <span className="text-xs text-muted-foreground text-center">vendeurs actifs</span>
          </div>

          {/* Divider (desktop) */}
          <div className="hidden sm:block h-14 w-px bg-border/60 rounded-full" />

          {/* Right — Growth badge */}
          <div className="flex flex-col items-center gap-1">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-500/10 border border-emerald-500/20 mb-1">
              <TrendingUp size={20} className="text-emerald-500" />
            </div>
            <div className="flex items-baseline gap-1">
              <span className="text-xl sm:text-2xl font-extrabold text-foreground">70%</span>
            </div>
            <span className="text-xs text-muted-foreground text-center">de réduction aujourd'hui</span>
          </div>

          {/* Animated glow ring on the card */}
          <div className="pointer-events-none absolute inset-0 rounded-2xl ring-1 ring-primary/10" />
        </div>

        {/* Bottom trust line */}
        <div className="mt-4 flex flex-wrap items-center justify-center gap-4 sm:gap-6">
          {[
            "🔒 Paiement sécurisé",
            "♾️ Accès à vie",
            "🌍 Livraison immédiate",
          ].map((badge) => (
            <span key={badge} className="text-[11px] sm:text-xs text-muted-foreground font-medium">
              {badge}
            </span>
          ))}
        </div>
      </div>
    </section>
  );
};

export default HeroSection;

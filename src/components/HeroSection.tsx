import { ArrowRight, Star, TrendingUp, Users, Sparkles, ShieldCheck, Zap } from "lucide-react";
import { Link } from "react-router-dom";
import { useEffect, useRef, useState } from "react";
import { usePlatformStats } from "@/hooks/usePlatformStats";
import { motion } from "framer-motion";

/* ── Animated counter ─────────────────────────────────────────── */
function AnimatedCount({ target, suffix = "" }: { target: number; suffix?: string }) {
  const [display, setDisplay] = useState(0);
  const raf = useRef<number>(0);

  useEffect(() => {
    if (target === 0) return;
    const duration = 2000;
    const start = performance.now();

    const tick = (now: number) => {
      const elapsed = now - start;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 4); // easeOutQuart
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
  <div className="flex items-center -space-x-3">
    {AVATAR_SEEDS.map((name, i) => (
      <div
        key={name}
        className="relative h-10 w-10 rounded-2xl border-2 border-background overflow-hidden shadow-xl"
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

const HeroSection = () => {
  const { data: stats } = usePlatformStats();
  const buyers = Math.max(stats?.totalBuyers ?? 0, 1250);
  const vendors = Math.max(stats?.totalVendors ?? 0, 48);

  return (
    <section className="relative min-h-screen flex flex-col items-center justify-center pt-32 pb-20 overflow-hidden aurora-bg">
      
      {/* Decorative Elements */}
      <div className="absolute inset-0 z-0">
        <div className="absolute top-1/4 left-1/4 h-96 w-96 bg-primary/10 rounded-full blur-[120px] animate-pulse" />
        <div className="absolute bottom-1/4 right-1/4 h-96 w-96 bg-accent/5 rounded-full blur-[100px] animate-pulse" style={{ animationDelay: '2s' }} />
      </div>

      <div className="container mx-auto px-4 relative z-10 flex flex-col items-center">
        
        {/* Eyebrow badge */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 backdrop-blur-md px-4 py-2 text-[10px] sm:text-xs font-black tracking-widest uppercase text-primary shadow-xl"
        >
          <span className="relative flex h-2 w-2">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-primary opacity-75" />
            <span className="relative inline-flex h-2 w-2 rounded-full bg-primary" />
          </span>
          Plateforme N°1 de l'Économie Digitale en Afrique
        </motion.div>

        {/* Headline */}
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="text-center text-4xl sm:text-6xl md:text-7xl lg:text-8xl font-black leading-[1] tracking-tighter max-w-5xl px-6"
        >
          Passez de l'idée au <br />
          <span className="text-gradient-primary italic">profit immédiat.</span>
        </motion.h1>

        {/* Subtitle */}
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mt-8 text-center text-base sm:text-lg md:text-xl text-muted-foreground max-w-2xl px-6 leading-relaxed font-medium"
        >
          La première usine à produits digitaux conçue pour l'Afrique. 
          Apprenez, créez et vendez vos compétences avec l'IA.
        </motion.p>

        {/* CTA Buttons */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="mt-12 flex flex-col sm:flex-row items-center gap-4"
        >
          <Link
            to="/boutique"
            className="btn-glow group relative inline-flex items-center gap-3 px-10 py-5 rounded-2xl font-black text-lg bg-primary text-primary-foreground transition-all duration-500"
          >
            Explorer la Boutique
            <ArrowRight size={20} className="transition-transform duration-300 group-hover:translate-x-2" />
          </Link>
          <Link
            to="/dashboard/factory"
            className="group relative inline-flex items-center gap-3 px-10 py-5 rounded-2xl font-black text-lg border border-white/10 bg-white/5 backdrop-blur-xl hover:bg-white/10 transition-all duration-500"
          >
            <Zap size={20} className="text-primary" />
            Lancer l'AI Factory
          </Link>
        </motion.div>

        {/* Social Proof Block */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.5 }}
          className="mt-20 w-full max-w-4xl px-6"
        >
          <div className="glass-card p-1 rounded-[2.5rem]">
            <div className="bg-card/40 rounded-[2.4rem] px-8 py-8 md:py-10 flex flex-col lg:flex-row items-center justify-between gap-10">
              
              {/* Left: Buyers */}
              <div className="flex flex-col items-center lg:items-start gap-4">
                <AvatarStack />
                <div className="space-y-1 text-center lg:text-left">
                  <p className="text-2xl md:text-3xl font-black">
                    <AnimatedCount target={buyers} suffix="+" />
                  </p>
                  <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest">Étudiants Visionnaires</p>
                </div>
                <div className="flex items-center gap-1.5 bg-primary/10 px-3 py-1 rounded-full border border-primary/20">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star key={i} size={12} className="fill-primary text-primary" />
                  ))}
                  <span className="text-[10px] font-black text-primary ml-1">4.9/5 satisfaction</span>
                </div>
              </div>

              <div className="hidden lg:block h-16 w-px bg-white/10" />

              {/* Center: Vendors */}
              <div className="flex flex-col items-center gap-4 text-center">
                <div className="h-14 w-14 rounded-2xl bg-primary/10 flex items-center justify-center text-primary border border-primary/20">
                  <Users size={28} />
                </div>
                <div className="space-y-1">
                  <p className="text-2xl md:text-3xl font-black">
                    <AnimatedCount target={vendors} suffix="+" />
                  </p>
                  <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest">Experts Actifs</p>
                </div>
              </div>

              <div className="hidden lg:block h-16 w-px bg-white/10" />

              {/* Right: Growth */}
              <div className="flex flex-col items-center gap-4 text-center">
                <div className="h-14 w-14 rounded-2xl bg-emerald-500/10 flex items-center justify-center text-emerald-500 border border-emerald-500/20">
                  <TrendingUp size={28} />
                </div>
                <div className="space-y-1">
                  <p className="text-2xl md:text-3xl font-black">70% ROI</p>
                  <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest">Moyenne Constatée</p>
                </div>
              </div>

            </div>
          </div>

          {/* Trust Line */}
          <div className="mt-8 flex flex-wrap items-center justify-center gap-8 md:gap-12 opacity-60">
            {[
              { icon: ShieldCheck, text: "Transactions Sécurisées" },
              { icon: BookOpen, text: "Contenus Certifiés" },
              { icon: Globe, text: "Support Local 24/7" },
            ].map((item, i) => (
              <div key={i} className="flex items-center gap-2">
                <item.icon size={16} className="text-primary" />
                <span className="text-xs font-bold uppercase tracking-wider">{item.text}</span>
              </div>
            ))}
          </div>

        </motion.div>

      </div>
    </section>
  );
};

export default HeroSection;

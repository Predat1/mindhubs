import { ArrowRight, Store } from "lucide-react";
import { Link } from "react-router-dom";
import { motion, useReducedMotion } from "motion/react";
import { EASE_OUT } from "@/lib/ease";

const HeroSection = () => {
  const reduce = useReducedMotion() ?? false;
  const reveal = (delay: number) => ({
    initial: reduce ? false : { opacity: 0, y: 10 },
    animate: { opacity: 1, y: 0 },
    transition: reduce ? { duration: 0.01 } : { duration: 0.28, delay, ease: EASE_OUT },
  });

  return (
    <section className="relative overflow-hidden border-b border-border pb-16 pt-32 sm:pb-24 sm:pt-40">
      <div className="container relative z-10 mx-auto flex max-w-4xl flex-col items-center px-4 text-center">
        <motion.div {...reveal(0)} className="mb-6 inline-flex items-center gap-2 rounded-full border border-border bg-muted/60 px-3 py-1.5 text-[10px] font-medium uppercase tracking-[0.12em] text-muted-foreground sm:text-xs">
          <span className="size-1.5 rounded-full bg-primary" aria-hidden="true" />
          Marketplace et boutiques digitales
        </motion.div>

        <motion.h1 {...reveal(0.06)} className="max-w-3xl text-4xl font-semibold leading-[1.08] tracking-[-0.055em] sm:text-6xl">
          Achetez, créez et vendez simplement avec MindHubs.
        </motion.h1>

        <motion.p {...reveal(0.12)} className="mt-6 max-w-2xl text-base leading-7 text-muted-foreground sm:text-lg">
          Découvrez des produits digitaux utiles ou lancez votre boutique en ligne avec un catalogue, un lien partageable et des outils simples pour vendre.
        </motion.p>

        <motion.div {...reveal(0.18)} className="mt-8 flex flex-col items-center gap-3 sm:flex-row">
          <Link to="/boutique" className="inline-flex h-11 items-center gap-2 rounded-xl bg-primary px-5 text-sm font-medium text-primary-foreground transition-transform hover:-translate-y-0.5">
            Explorer la marketplace <ArrowRight className="size-4" aria-hidden="true" />
          </Link>
          <Link to="/become-a-seller" className="inline-flex h-11 items-center gap-2 rounded-xl px-4 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground">
            <Store className="size-4" aria-hidden="true" /> Commencer à vendre
          </Link>
        </motion.div>

        <motion.div {...reveal(0.24)} className="mt-10 flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-xs text-muted-foreground">
          <span>Accès immédiat après achat</span>
          <span className="hidden size-1 rounded-full bg-border sm:block" aria-hidden="true" />
          <span>Boutique vendeur personnalisable</span>
          <span className="hidden size-1 rounded-full bg-border sm:block" aria-hidden="true" />
          <span>Marketplace ouverte à tous</span>
        </motion.div>
      </div>
    </section>
  );
};

export default HeroSection;

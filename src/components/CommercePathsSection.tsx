import { ArrowRight, Store, ShoppingBag } from "lucide-react";
import { Link } from "react-router-dom";
import AnimateOnScroll from "@/components/AnimateOnScroll";

const CommercePathsSection = () => (
  <section className="border-y border-border bg-muted/20 py-16 sm:py-20">
    <div className="container mx-auto max-w-5xl px-4">
      <div className="mb-10 max-w-2xl">
        <p className="mb-2 text-xs font-medium uppercase tracking-[0.18em] text-muted-foreground">Deux façons d’utiliser MindHubs</p>
        <h2 className="text-2xl font-semibold tracking-[-0.03em] sm:text-3xl">Trouvez ce qu’il vous faut ou lancez votre propre boutique.</h2>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <AnimateOnScroll>
          <Link to="/boutique" className="group flex h-full flex-col justify-between rounded-2xl border border-border bg-card p-6 transition-colors hover:border-foreground/30 hover:bg-accent/40 sm:p-8">
            <div>
              <div className="mb-6 grid size-10 place-items-center rounded-xl bg-foreground text-background"><ShoppingBag className="size-5" aria-hidden="true" /></div>
              <h3 className="text-xl font-semibold">Acheter dans la marketplace</h3>
              <p className="mt-2 max-w-sm text-sm leading-6 text-muted-foreground">Explorez les produits digitaux et les ressources publiés par des vendeurs de la communauté.</p>
            </div>
            <span className="mt-8 inline-flex items-center gap-2 text-sm font-medium text-foreground">Explorer la marketplace <ArrowRight className="size-4 transition-transform group-hover:translate-x-1" aria-hidden="true" /></span>
          </Link>
        </AnimateOnScroll>

        <AnimateOnScroll delay={80}>
          <Link to="/become-a-seller" className="group flex h-full flex-col justify-between rounded-2xl border border-border bg-card p-6 transition-colors hover:border-foreground/30 hover:bg-accent/40 sm:p-8">
            <div>
              <div className="mb-6 grid size-10 place-items-center rounded-xl bg-primary text-primary-foreground"><Store className="size-5" aria-hidden="true" /></div>
              <h3 className="text-xl font-semibold">Vendre avec votre boutique</h3>
              <p className="mt-2 max-w-sm text-sm leading-6 text-muted-foreground">Créez une vitrine partageable, publiez vos produits et choisissez si vous souhaitez les proposer dans la marketplace.</p>
            </div>
            <span className="mt-8 inline-flex items-center gap-2 text-sm font-medium text-foreground">Commencer à vendre <ArrowRight className="size-4 transition-transform group-hover:translate-x-1" aria-hidden="true" /></span>
          </Link>
        </AnimateOnScroll>
      </div>
    </div>
  </section>
);

export default CommercePathsSection;

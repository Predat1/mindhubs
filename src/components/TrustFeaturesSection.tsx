import { ShieldCheck, Zap, Headphones, Lock } from "lucide-react";
import AnimateOnScroll from "./AnimateOnScroll";

const features = [
  {
    icon: <Zap className="w-6 h-6 text-primary" />,
    title: "Accès immédiat",
    description: "Retrouvez vos achats dans votre espace client dès que la commande est confirmée."
  },
  {
    icon: <ShieldCheck className="w-6 h-6 text-primary" />,
    title: "Paiement protégé",
    description: "Les moyens de paiement et les règles de remboursement sont présentés clairement avant l’achat."
  },
  {
    icon: <Lock className="w-6 h-6 text-primary" />,
    title: "Une expérience claire",
    description: "Des fiches produit lisibles, un panier simple et un suivi des commandes au même endroit."
  },
  {
    icon: <Headphones className="w-6 h-6 text-primary" />,
    title: "Support accessible",
    description: "Une page d’aide et un contact direct pour vous accompagner lorsque vous en avez besoin."
  }
];

const TrustFeaturesSection = () => {
  return (
    <section className="border-y border-border bg-muted/20 py-16 sm:py-20">
      <div className="container relative z-10 mx-auto max-w-6xl px-4">
        <div className="mb-10 max-w-2xl">
          <AnimateOnScroll>
            <p className="mb-2 text-xs font-medium uppercase tracking-[0.18em] text-muted-foreground">Pourquoi MindHubs</p>
            <h2 className="text-2xl font-semibold tracking-[-0.03em] sm:text-3xl">Les essentiels pour acheter et vendre sereinement.</h2>
          </AnimateOnScroll>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {features.map((feature, index) => (
            <AnimateOnScroll key={index} delay={index * 60}>
              <div className="h-full rounded-2xl border border-border bg-card p-5 transition-colors hover:border-foreground/20 hover:bg-accent/30">
                <div className="mb-4 grid size-9 place-items-center rounded-lg bg-muted">
                  {feature.icon}
                </div>
                <h3 className="mb-2 text-sm font-semibold text-foreground">{feature.title}</h3>
                <p className="text-sm leading-6 text-muted-foreground">{feature.description}</p>
              </div>
            </AnimateOnScroll>
          ))}
        </div>
      </div>
    </section>
  );
};

export default TrustFeaturesSection;

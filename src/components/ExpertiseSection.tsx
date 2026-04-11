import { Zap, Target, Award, ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";
import AnimateOnScroll from "@/components/AnimateOnScroll";

const features = [
  {
    icon: Zap,
    title: "Apprentissage accéléré",
    desc: "Des modules courts et percutants conçus pour un maximum de résultats en un minimum de temps.",
  },
  {
    icon: Target,
    title: "Compétences ciblées",
    desc: "Chaque formation vise des compétences précises, immédiatement applicables dans vos projets.",
  },
  {
    icon: Award,
    title: "Certifié & reconnu",
    desc: "Des contenus validés par des experts du digital et reconnus sur le marché professionnel.",
  },
];

const ExpertiseSection = () => {
  return (
    <section id="expertise" className="py-20 bg-background">
      <div className="container mx-auto px-4">
        <AnimateOnScroll>
          <p className="text-center text-xs font-medium uppercase tracking-[0.2em] text-muted-foreground mb-2">
            Notre approche
          </p>
          <h2 className="text-center text-2xl md:text-3xl font-bold text-foreground mb-4">
            Votre passage vers l'expertise numérique
          </h2>
          <p className="text-center text-sm text-muted-foreground max-w-lg mx-auto mb-14">
            Des formations conçues pour vous propulser dans le monde digital avec confiance et efficacité.
          </p>
        </AnimateOnScroll>

        <div className="grid md:grid-cols-3 gap-6 max-w-4xl mx-auto">
          {features.map((f, i) => (
            <AnimateOnScroll key={f.title} delay={i * 120}>
              <div className="stat-card rounded-2xl p-7 text-center border-glow hover-scale cursor-default group transition-all duration-400">
                <div className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10 group-hover:bg-primary/20 transition-colors">
                  <f.icon className="text-primary" size={26} />
                </div>
                <h3 className="text-base font-bold text-foreground mb-2">{f.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{f.desc}</p>
              </div>
            </AnimateOnScroll>
          ))}
        </div>

        <AnimateOnScroll delay={400}>
          <div className="text-center mt-12">
            <Link
              to="/boutique"
              className="group inline-flex items-center gap-2 text-sm font-medium text-primary hover:text-primary/80 transition-colors"
            >
              Commencer maintenant
              <ArrowRight size={16} className="transition-transform group-hover:translate-x-1" />
            </Link>
          </div>
        </AnimateOnScroll>
      </div>
    </section>
  );
};

export default ExpertiseSection;

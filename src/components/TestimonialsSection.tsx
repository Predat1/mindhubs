import { Star } from "lucide-react";
import AnimateOnScroll from "@/components/AnimateOnScroll";

const testimonials = [
  { name: "Amadou K.", text: "Grâce à SavoirHub, j'ai pu lancer mon agence SMMA et générer mes premiers revenus en ligne !", rating: 5 },
  { name: "Fatou D.", text: "Les formations sont claires, accessibles et surtout très pratiques. Je recommande à 100% !", rating: 5 },
  { name: "Ibrahim M.", text: "Le meilleur investissement que j'ai fait. Le support est réactif et les contenus sont de qualité.", rating: 5 },
  { name: "Sarah L.", text: "J'ai appris l'anglais rapidement grâce à leur méthode. Formation très bien structurée.", rating: 4 },
];

const TestimonialsSection = () => {
  return (
    <section className="py-20 bg-gradient-hero">
      <div className="container mx-auto px-4">
        <AnimateOnScroll>
          <h2 className="text-3xl md:text-4xl font-bold text-foreground text-center mb-12">
            Ils nous ont fait confiance
          </h2>
        </AnimateOnScroll>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {testimonials.map((t, i) => (
            <AnimateOnScroll key={t.name} delay={i * 100}>
              <div className="stat-card rounded-xl p-6 space-y-4 hover-scale cursor-default">
                <div className="flex gap-1">
                  {Array.from({ length: 5 }).map((_, j) => (
                    <Star key={j} size={16} className={j < t.rating ? "text-accent fill-accent" : "text-muted-foreground"} />
                  ))}
                </div>
                <p className="text-sm text-muted-foreground leading-relaxed">"{t.text}"</p>
                <p className="text-sm font-semibold text-foreground">{t.name}</p>
              </div>
            </AnimateOnScroll>
          ))}
        </div>
      </div>
    </section>
  );
};

export default TestimonialsSection;

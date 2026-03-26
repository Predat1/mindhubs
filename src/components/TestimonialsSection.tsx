import { Star } from "lucide-react";

const testimonials = [
  {
    name: "Amadou K.",
    text: "Grâce à SavoirHub, j'ai pu lancer mon agence SMMA et générer mes premiers revenus en ligne !",
    rating: 5,
  },
  {
    name: "Fatou D.",
    text: "Les formations sont claires, accessibles et surtout très pratiques. Je recommande à 100% !",
    rating: 5,
  },
  {
    name: "Ibrahim M.",
    text: "Le meilleur investissement que j'ai fait. Le support est réactif et les contenus sont de qualité.",
    rating: 5,
  },
  {
    name: "Sarah L.",
    text: "J'ai appris l'anglais rapidement grâce à leur méthode. Formation très bien structurée.",
    rating: 4,
  },
];

const TestimonialsSection = () => {
  return (
    <section className="py-20 bg-gradient-hero">
      <div className="container mx-auto px-4">
        <h2 className="text-3xl md:text-4xl font-bold text-foreground text-center mb-12">
          Ils nous ont fait confiance
        </h2>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {testimonials.map((t) => (
            <div
              key={t.name}
              className="stat-card rounded-xl p-6 space-y-4"
            >
              <div className="flex gap-1">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star
                    key={i}
                    size={16}
                    className={i < t.rating ? "text-accent fill-accent" : "text-muted-foreground"}
                  />
                ))}
              </div>
              <p className="text-sm text-muted-foreground leading-relaxed">"{t.text}"</p>
              <p className="text-sm font-semibold text-foreground">{t.name}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default TestimonialsSection;

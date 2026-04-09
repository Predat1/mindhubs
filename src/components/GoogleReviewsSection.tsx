import { Star } from "lucide-react";
import AnimateOnScroll from "@/components/AnimateOnScroll";

const reviews = [
  { name: "Issa Kharou", text: "Les formations sont très complètes et bien structurées. J'ai beaucoup appris en peu de temps.", avatar: "I" },
  { name: "Olive Larivière", text: "Excellente plateforme, le contenu est de qualité et le support est très réactif.", avatar: "O" },
  { name: "Fadi Nidé", text: "Je recommande vivement MindHub. Les prix sont imbattables pour la qualité proposée.", avatar: "F" },
];

const GoogleReviewsSection = () => {
  return (
    <section className="py-16 bg-gradient-hero">
      <div className="container mx-auto px-4 text-center">
        <AnimateOnScroll>
          <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-2">
            Nos clients parlent <span className="text-accent">de</span> nous
          </h2>
          <div className="flex justify-center gap-1 my-4">
            {Array.from({ length: 5 }).map((_, i) => (
              <Star key={i} size={24} className="text-accent fill-accent" />
            ))}
          </div>
        </AnimateOnScroll>

        <div className="grid md:grid-cols-[200px_1fr] gap-8 items-start mt-8 max-w-4xl mx-auto">
          <AnimateOnScroll delay={100}>
            <div className="flex flex-col items-center md:items-start gap-2">
              <p className="text-foreground font-bold text-sm uppercase tracking-wider">EXCELLENT</p>
              <div className="flex gap-0.5">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star key={i} size={16} className="text-accent fill-accent" />
                ))}
              </div>
              <p className="text-muted-foreground text-xs">basé sur les avis</p>
              <div className="flex items-center gap-1 mt-1">
                <span className="text-2xl font-bold" style={{ color: "#4285F4" }}>G</span>
                <span className="text-lg font-semibold" style={{ color: "#EA4335" }}>o</span>
                <span className="text-lg font-semibold" style={{ color: "#FBBC05" }}>o</span>
                <span className="text-lg font-semibold" style={{ color: "#4285F4" }}>g</span>
                <span className="text-lg font-semibold" style={{ color: "#34A853" }}>l</span>
                <span className="text-lg font-semibold" style={{ color: "#EA4335" }}>e</span>
              </div>
            </div>
          </AnimateOnScroll>

          <div className="grid sm:grid-cols-3 gap-4">
            {reviews.map((review, i) => (
              <AnimateOnScroll key={review.name} delay={200 + i * 100}>
                <div className="stat-card rounded-xl p-4 text-left space-y-3 hover-scale cursor-default">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-primary-foreground text-sm font-bold">
                      {review.avatar}
                    </div>
                    <div>
                      <p className="text-foreground text-xs font-semibold">{review.name}</p>
                      <div className="flex gap-0.5">
                        {Array.from({ length: 5 }).map((_, j) => (
                          <Star key={j} size={10} className="text-accent fill-accent" />
                        ))}
                      </div>
                    </div>
                    <span className="ml-auto text-lg font-bold" style={{ color: "#4285F4" }}>G</span>
                  </div>
                  <p className="text-muted-foreground text-xs leading-relaxed">{review.text}</p>
                </div>
              </AnimateOnScroll>
            ))}
          </div>
        </div>

        <AnimateOnScroll delay={500}>
          <div className="mt-8">
            <a href="#" className="text-primary text-sm font-medium hover:underline">
              Lire les avis clients →
            </a>
          </div>
        </AnimateOnScroll>
      </div>
    </section>
  );
};

export default GoogleReviewsSection;

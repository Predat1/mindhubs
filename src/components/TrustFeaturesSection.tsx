import { ShieldCheck, Zap, Headphones, Lock, Tag, RotateCcw, Star, Quote } from "lucide-react";
import AnimateOnScroll from "./AnimateOnScroll";

const features = [
  {
    icon: <Zap className="w-8 h-8 text-primary" />,
    title: "Livraison en temps réel",
    description: "Accès immédiat à vos formations après paiement sans attente. Commencez à apprendre instantanément."
  },
  {
    icon: <ShieldCheck className="w-8 h-8 text-primary" />,
    title: "Garantie de Remboursement",
    description: "Nous offrons une protection aux acheteurs avec une politique de remboursement claire et rapide."
  },
  {
    icon: <Lock className="w-8 h-8 text-primary" />,
    title: "Sécurité SSL",
    description: "Vos transactions sont protégées par un cryptage SSL de niveau bancaire pour une sécurité totale."
  },
  {
    icon: <Headphones className="w-8 h-8 text-primary" />,
    title: "Service Client 24/7",
    description: "Une équipe dédiée disponible jour et nuit pour répondre à vos questions et vous guider."
  },
  {
    icon: <Tag className="w-8 h-8 text-primary" />,
    title: "Prix Premium Abordable",
    description: "Accédez à des contenus de haute qualité à des prix défiant toute concurrence sur le marché."
  },
  {
    icon: <RotateCcw className="w-8 h-8 text-primary" />,
    title: "Mises à jour à vie",
    description: "Achetez une fois, profitez des mises à jour régulières du contenu sans frais supplémentaires."
  }
];

const testimonials = [
  {
    name: "Gerard Gossier",
    country: "FR",
    content: "Service client réactif et efficace ; problème dû à une erreur de compte bien expliqué et résolu ; expérience globale satisfaisante.",
    rating: 5
  },
  {
    name: "P. Schmidt",
    country: "DE",
    content: "Ich bin mit der Dienstleistung von MindHubs sehr zufrieden. Wenn man ein Problem hat, hilft einem der Support weiter. Vielen Dank!",
    rating: 5
  },
  {
    name: "Jordi Fernán",
    country: "ES",
    content: "Excelente plataforma para adquirir habilidades digitales. El soporte técnico es rápido y el contenido es de gran valor. Muy recomendable.",
    rating: 5
  }
];

const TrustFeaturesSection = () => {
  return (
    <section className="py-24 bg-secondary/30 relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-primary/20 to-transparent" />
      
      <div className="container mx-auto px-4 relative z-10">
        <div className="text-center mb-16">
          <AnimateOnScroll>
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              Pourquoi de plus en plus de personnes utilisent <span className="text-primary">MindHubs</span> ?
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto text-lg">
              Nous nous engageons à fournir la meilleure expérience d'apprentissage avec une sécurité et un support de classe mondiale.
            </p>
          </AnimateOnScroll>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-20">
          {features.map((feature, index) => (
            <AnimateOnScroll key={index} delay={index * 100}>
              <div className="bg-background p-8 rounded-2xl border border-border hover:border-primary/30 transition-all duration-300 shadow-sm hover:shadow-md group">
                <div className="mb-4 group-hover:scale-110 transition-transform duration-300">
                  {feature.icon}
                </div>
                <h3 className="text-xl font-semibold mb-3 text-foreground">{feature.title}</h3>
                <p className="text-muted-foreground leading-relaxed">
                  {feature.description}
                </p>
              </div>
            </AnimateOnScroll>
          ))}
        </div>

        {/* Testimonials section similar to GamsGo style */}
        <div className="border-t border-border pt-16">
          <AnimateOnScroll>
            <div className="flex items-center justify-center gap-2 mb-10">
              <div className="flex">
                {[1, 2, 3, 4, 5].map((star) => (
                  <Star key={star} className="w-5 h-5 fill-yellow-400 text-yellow-400" />
                ))}
              </div>
              <span className="font-bold text-xl">98% des utilisateurs satisfaits</span>
            </div>
          </AnimateOnScroll>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {testimonials.map((testimonial, index) => (
              <AnimateOnScroll key={index} delay={index * 150}>
                <div className="bg-background/50 p-6 rounded-xl border border-border italic relative">
                  <Quote className="absolute -top-3 -left-3 w-8 h-8 text-primary/10 rotate-180" />
                  <p className="text-foreground/80 mb-6 relative z-10">"{testimonial.content}"</p>
                  <div className="flex items-center justify-between mt-auto pt-4 border-t border-border/50">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-sm">{testimonial.name}</span>
                      <span className="text-[10px] bg-secondary px-1.5 py-0.5 rounded text-muted-foreground font-bold">
                        {testimonial.country}
                      </span>
                    </div>
                    <div className="flex">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <Star key={star} className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                      ))}
                    </div>
                  </div>
                </div>
              </AnimateOnScroll>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default TrustFeaturesSection;

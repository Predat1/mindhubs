import { Shield, Headphones, Infinity, Star } from "lucide-react";
import AnimateOnScroll from "@/components/AnimateOnScroll";

const stats = [
  { icon: Shield, value: "100%", label: "Paiement sécurisé" },
  { icon: Headphones, value: "24h/7j", label: "Support Client 24/7" },
  { icon: Infinity, value: "100%", label: "Accès illimité et à vie" },
  { icon: Star, value: "4.9", label: "Formations de qualité" },
];

const StatsBar = () => {
  return (
    <section className="py-12 bg-background">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {stats.map((stat, i) => (
            <AnimateOnScroll key={stat.label} delay={i * 100}>
              <div className="stat-card rounded-xl p-6 text-center shadow-glow hover-scale cursor-default">
                <stat.icon className="mx-auto mb-2 text-primary" size={24} />
                <p className="text-3xl md:text-4xl font-bold text-foreground">{stat.value}</p>
                <p className="text-sm text-muted-foreground mt-1">{stat.label}</p>
              </div>
            </AnimateOnScroll>
          ))}
        </div>
      </div>
    </section>
  );
};

export default StatsBar;

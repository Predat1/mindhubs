import { Shield, Headphones, Infinity, Star } from "lucide-react";
import AnimateOnScroll from "@/components/AnimateOnScroll";

const stats = [
  { icon: Shield, value: "100%", label: "Paiement sécurisé", desc: "Transactions protégées et chiffrées" },
  { icon: Headphones, value: "24/7", label: "Support réactif", desc: "Une équipe à votre écoute" },
  { icon: Infinity, value: "À vie", label: "Accès illimité", desc: "Apprenez à votre rythme" },
  { icon: Star, value: "4.9/5", label: "Excellente qualité", desc: "Noté par nos étudiants" },
];

const StatsBar = () => {
  return (
    <section className="py-14 sm:py-20 bg-background">
      <div className="container mx-auto px-4">
        <AnimateOnScroll>
          <p className="text-center text-[10px] sm:text-xs font-medium uppercase tracking-[0.2em] text-muted-foreground mb-2">
            Pourquoi nous choisir
          </p>
          <h2 className="text-center text-xl sm:text-2xl md:text-3xl font-bold text-foreground mb-8 sm:mb-12">
            La confiance de milliers d'apprenants
          </h2>
        </AnimateOnScroll>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6 max-w-5xl mx-auto">
          {stats.map((stat, i) => (
            <AnimateOnScroll key={stat.label} delay={i * 100}>
              <div className="group relative rounded-xl sm:rounded-2xl p-4 sm:p-6 text-center stat-card border-glow hover-scale cursor-default">
                <div className="mx-auto mb-3 sm:mb-4 flex h-10 w-10 sm:h-12 sm:w-12 items-center justify-center rounded-lg sm:rounded-xl bg-primary/10">
                  <stat.icon className="text-primary" size={18} />
                </div>
                <p className="text-lg sm:text-2xl font-bold text-primary">{stat.value}</p>
                <p className="text-xs sm:text-sm font-semibold text-foreground mt-1">{stat.label}</p>
                <p className="text-[10px] sm:text-xs text-muted-foreground mt-1 sm:mt-2 leading-relaxed">{stat.desc}</p>
              </div>
            </AnimateOnScroll>
          ))}
        </div>
      </div>
    </section>
  );
};

export default StatsBar;

import { Shield, Headphones, Infinity, Star } from "lucide-react";

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
          {stats.map((stat) => (
            <div
              key={stat.label}
              className="stat-card rounded-xl p-6 text-center shadow-glow"
            >
              <stat.icon className="mx-auto mb-2 text-primary" size={24} />
              <p className="text-3xl md:text-4xl font-bold text-foreground">{stat.value}</p>
              <p className="text-sm text-muted-foreground mt-1">{stat.label}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default StatsBar;

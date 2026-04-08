import { Users, Target, Award, BookOpen, Globe, Heart, CheckCircle } from "lucide-react";
import Navbar from "@/components/Navbar";
import FooterSection from "@/components/FooterSection";
import AnimateOnScroll from "@/components/AnimateOnScroll";
import SEO from "@/components/SEO";

const values = [
  { icon: Target, title: "Excellence", desc: "Nous visons l'excellence dans chaque formation que nous proposons." },
  { icon: BookOpen, title: "Accessibilité", desc: "Des formations accessibles à tous, peu importe le niveau de départ." },
  { icon: Globe, title: "Impact", desc: "Transformer des vies à travers l'éducation digitale en Afrique." },
  { icon: Heart, title: "Engagement", desc: "Un accompagnement personnalisé pour chaque apprenant." },
];

const stats = [
  { value: "500+", label: "Étudiants formés" },
  { value: "50+", label: "Formations disponibles" },
  { value: "15+", label: "Pays couverts" },
  { value: "98%", label: "Taux de satisfaction" },
];

const milestones = [
  { year: "2021", title: "Création de SavoirHub", desc: "Lancement de la plateforme avec 5 formations initiales." },
  { year: "2022", title: "100 étudiants", desc: "Cap des 100 étudiants franchi avec expansion en Afrique de l'Ouest." },
  { year: "2023", title: "Partenariats stratégiques", desc: "Collaboration avec des experts internationaux et diversification des formations." },
  { year: "2024", title: "500+ étudiants", desc: "Plus de 500 étudiants formés et lancement des packs professionnels." },
];

const About = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      {/* Hero */}
      <section className="pt-16">
        <div className="relative py-24 text-center overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-b from-primary/20 via-primary/5 to-transparent" />
          <div className="relative container mx-auto px-4 space-y-6">
            <AnimateOnScroll>
              <span className="badge-purple inline-flex items-center gap-2 px-4 py-2 rounded-full text-xs font-semibold uppercase tracking-wider">
                Notre histoire
              </span>
            </AnimateOnScroll>
            <AnimateOnScroll delay={100}>
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-foreground">
                À propos de <span className="text-gradient-brand">SavoirHub</span>
              </h1>
            </AnimateOnScroll>
            <AnimateOnScroll delay={200}>
              <p className="text-muted-foreground max-w-2xl mx-auto text-lg">
                Nous sommes une plateforme d'éducation digitale dédiée à l'autonomisation des jeunes africains par la formation professionnelle de qualité.
              </p>
            </AnimateOnScroll>
          </div>
        </div>
      </section>

      {/* Mission */}
      <section className="container mx-auto px-4 py-16">
        <div className="grid md:grid-cols-2 gap-12 items-center">
          <AnimateOnScroll>
            <div className="space-y-6">
              <h2 className="text-3xl font-bold text-foreground">Notre Mission</h2>
              <p className="text-muted-foreground leading-relaxed">
                SavoirHub est née de la conviction que l'éducation de qualité ne devrait pas être un privilège. Notre mission est de démocratiser l'accès aux compétences digitales en Afrique francophone.
              </p>
              <p className="text-muted-foreground leading-relaxed">
                Nous créons des formations pratiques, conçues par des experts, pour permettre à chacun de développer les compétences nécessaires pour réussir dans l'économie numérique.
              </p>
              <div className="space-y-3 pt-2">
                {["Formations 100% pratiques et applicables", "Support et accompagnement personnalisé", "Communauté d'entraide active", "Certificats de complétion"].map((item) => (
                  <div key={item} className="flex items-center gap-3">
                    <CheckCircle size={18} className="text-primary flex-shrink-0" />
                    <span className="text-sm text-foreground">{item}</span>
                  </div>
                ))}
              </div>
            </div>
          </AnimateOnScroll>
          <AnimateOnScroll delay={200}>
            <div className="stat-card rounded-2xl p-8 space-y-6">
              <div className="w-16 h-16 rounded-xl bg-primary/20 flex items-center justify-center">
                <Users size={32} className="text-primary" />
              </div>
              <h3 className="text-2xl font-bold text-foreground">Une équipe passionnée</h3>
              <p className="text-muted-foreground leading-relaxed">
                Notre équipe est composée d'experts en éducation, de développeurs, et d'entrepreneurs passionnés par l'impact social à travers la technologie.
              </p>
            </div>
          </AnimateOnScroll>
        </div>
      </section>

      {/* Stats */}
      <section className="py-16 bg-gradient-hero">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {stats.map((s, i) => (
              <AnimateOnScroll key={s.label} delay={i * 100}>
                <div className="stat-card rounded-xl p-6 text-center hover-scale">
                  <p className="text-3xl md:text-4xl font-bold text-primary">{s.value}</p>
                  <p className="text-sm text-muted-foreground mt-2">{s.label}</p>
                </div>
              </AnimateOnScroll>
            ))}
          </div>
        </div>
      </section>

      {/* Values */}
      <section className="container mx-auto px-4 py-16">
        <AnimateOnScroll>
          <div className="text-center mb-12 space-y-4">
            <h2 className="text-3xl font-bold text-foreground">Nos Valeurs</h2>
            <p className="text-muted-foreground max-w-xl mx-auto">
              Les principes qui guident notre action au quotidien.
            </p>
          </div>
        </AnimateOnScroll>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {values.map((v, i) => (
            <AnimateOnScroll key={v.title} delay={i * 100}>
              <div className="stat-card rounded-xl p-6 text-center space-y-4 hover-scale h-full">
                <div className="w-14 h-14 rounded-xl bg-primary/20 flex items-center justify-center mx-auto">
                  <v.icon size={28} className="text-primary" />
                </div>
                <h3 className="font-bold text-foreground">{v.title}</h3>
                <p className="text-sm text-muted-foreground">{v.desc}</p>
              </div>
            </AnimateOnScroll>
          ))}
        </div>
      </section>

      {/* Timeline */}
      <section className="py-16 bg-gradient-hero">
        <div className="container mx-auto px-4">
          <AnimateOnScroll>
            <div className="text-center mb-12 space-y-4">
              <h2 className="text-3xl font-bold text-foreground">Notre Parcours</h2>
              <p className="text-muted-foreground max-w-xl mx-auto">Les étapes clés de notre aventure.</p>
            </div>
          </AnimateOnScroll>
          <div className="max-w-2xl mx-auto space-y-0">
            {milestones.map((m, i) => (
              <AnimateOnScroll key={m.year} delay={i * 150}>
                <div className="flex gap-6 pb-10 relative">
                  <div className="flex flex-col items-center">
                    <div className="w-12 h-12 rounded-full bg-primary/20 border-2 border-primary flex items-center justify-center flex-shrink-0">
                      <Award size={20} className="text-primary" />
                    </div>
                    {i < milestones.length - 1 && (
                      <div className="w-0.5 flex-1 bg-border mt-2" />
                    )}
                  </div>
                  <div className="pt-2 space-y-2">
                    <span className="text-xs font-bold text-primary uppercase tracking-wider">{m.year}</span>
                    <h3 className="font-bold text-foreground text-lg">{m.title}</h3>
                    <p className="text-sm text-muted-foreground">{m.desc}</p>
                  </div>
                </div>
              </AnimateOnScroll>
            ))}
          </div>
        </div>
      </section>

      <FooterSection />
    </div>
  );
};

export default About;

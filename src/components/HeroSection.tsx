import { GraduationCap } from "lucide-react";
import heroStudent from "@/assets/hero-student.png";

const HeroSection = () => {
  return (
    <section className="relative min-h-screen flex items-center bg-gradient-hero pt-16 overflow-hidden">
      <div className="container mx-auto px-4 grid md:grid-cols-2 gap-8 items-center">
        <div className="space-y-6 z-10">
          <span className="badge-purple inline-block px-4 py-2 rounded-full text-sm font-medium">
            Paiement unique et Accès illimité
          </span>
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold leading-tight">
            Bienvenue sur{" "}
            <span className="text-gradient-brand block">SavoirHub</span>
            l'Excellence en
          </h1>
          <p className="text-2xl md:text-3xl font-bold text-foreground">
            Apprentissage & Formation
          </p>
          <a
            href="#formations"
            className="btn-primary-brand inline-flex items-center gap-2 px-8 py-4 rounded-lg font-semibold text-lg"
          >
            VOIR NOS FORMATIONS <GraduationCap size={20} />
          </a>
        </div>
        <div className="relative flex justify-center md:justify-end">
          <img
            src={heroStudent}
            alt="Étudiante avec ordinateur portable"
            width={600}
            height={750}
            className="relative z-10 max-h-[600px] object-contain drop-shadow-2xl"
          />
        </div>
      </div>
    </section>
  );
};

export default HeroSection;

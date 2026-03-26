import { useEffect, useState } from "react";
import { GraduationCap } from "lucide-react";
import heroStudent from "@/assets/hero-student.png";

const words = ["Apprentissage", "Formation"];

const HeroSection = () => {
  const [currentWord, setCurrentWord] = useState(0);
  const [displayed, setDisplayed] = useState("");
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    const word = words[currentWord];
    let timeout: ReturnType<typeof setTimeout>;

    if (!deleting && displayed.length < word.length) {
      timeout = setTimeout(() => setDisplayed(word.slice(0, displayed.length + 1)), 100);
    } else if (!deleting && displayed.length === word.length) {
      timeout = setTimeout(() => setDeleting(true), 1800);
    } else if (deleting && displayed.length > 0) {
      timeout = setTimeout(() => setDisplayed(word.slice(0, displayed.length - 1)), 60);
    } else if (deleting && displayed.length === 0) {
      setDeleting(false);
      setCurrentWord((prev) => (prev + 1) % words.length);
    }

    return () => clearTimeout(timeout);
  }, [displayed, deleting, currentWord]);

  return (
    <section className="relative min-h-[90vh] flex items-center bg-gradient-hero pt-16 overflow-hidden">
      <div className="container mx-auto px-4 grid md:grid-cols-2 gap-8 items-center">
        <div className="space-y-5 z-10">
          <span className="badge-purple inline-block px-4 py-2 rounded-full text-xs font-medium uppercase tracking-wider">
            Paiement unique et Accès illimité
          </span>
          <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold leading-tight text-foreground">
            Bienvenue sur
            <span className="text-gradient-brand block text-4xl md:text-5xl lg:text-6xl mt-1">
              Savoir <span className="text-accent">Hub</span>
            </span>
            <span className="block mt-1">l'Excellence en</span>
          </h1>
          <p className="text-2xl md:text-3xl font-bold text-foreground h-10">
            {displayed}
            <span className="inline-block w-0.5 h-8 bg-primary ml-1 animate-pulse" />
          </p>
          <a
            href="#formations"
            className="btn-primary-brand inline-flex items-center gap-2 px-8 py-3.5 rounded-lg font-semibold"
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
            className="relative z-10 max-h-[520px] object-contain drop-shadow-2xl"
          />
        </div>
      </div>
    </section>
  );
};

export default HeroSection;

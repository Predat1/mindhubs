import expertiseMockup from "@/assets/expertise-mockup.jpg";

const ExpertiseSection = () => {
  return (
    <section id="expertise" className="py-20 bg-background">
      <div className="container mx-auto px-4 grid md:grid-cols-2 gap-12 items-center">
        <div>
          <img
            src={expertiseMockup}
            alt="Plateforme d'apprentissage numérique"
            loading="lazy"
            width={800}
            height={1024}
            className="rounded-2xl shadow-glow max-w-md mx-auto md:mx-0"
          />
        </div>
        <div className="space-y-6">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground">
            Votre Passage Vers l'Expertise Numérique
          </h2>
          <p className="text-muted-foreground leading-relaxed">
            Découvrez nos formations pointues et e-books informatifs conçus pour
            vous propulser dans le monde numérique. Relevez les défis du futur
            avec confiance. Commencez dès aujourd'hui votre parcours vers le
            succès digital.
          </p>
          <a
            href="#formations"
            className="btn-primary-brand inline-block px-8 py-3 rounded-lg font-semibold"
          >
            VOIR NOS FORMATIONS
          </a>
        </div>
      </div>
    </section>
  );
};

export default ExpertiseSection;

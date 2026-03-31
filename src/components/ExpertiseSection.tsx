import expertiseMockup from "@/assets/expertise-mockup.jpg";
import AnimateOnScroll from "@/components/AnimateOnScroll";

const ExpertiseSection = () => {
  return (
    <section id="expertise" className="py-16 bg-background">
      <div className="container mx-auto px-4">
        <AnimateOnScroll>
          <div className="stat-card rounded-2xl overflow-hidden">
            <div className="grid md:grid-cols-2 gap-0">
              <div className="p-2 overflow-hidden">
                <img
                  src={expertiseMockup}
                  alt="Plateforme d'apprentissage numérique"
                  loading="lazy"
                  width={800}
                  height={1024}
                  className="rounded-xl w-full h-full object-cover max-h-[350px] transition-transform duration-500 hover:scale-105"
                />
              </div>
              <div className="p-6 md:p-10 flex flex-col justify-center space-y-4">
                <h2 className="text-2xl md:text-3xl font-bold text-foreground">
                  Votre Passage Vers l'Expertise Numérique
                </h2>
                <p className="text-muted-foreground text-sm leading-relaxed">
                  Découvrez nos formations pointues et e-books informatifs conçus pour
                  vous propulser dans le monde numérique. Relevez les défis du futur
                  avec confiance. Commencez dès aujourd'hui votre parcours vers le
                  succès digital.
                </p>
                <div>
                  <a
                    href="#formations"
                    className="btn-primary-brand inline-block px-6 py-3 rounded-lg font-semibold text-sm hover-scale"
                  >
                    VOIR NOS FORMATIONS
                  </a>
                </div>
              </div>
            </div>
          </div>
        </AnimateOnScroll>
      </div>
    </section>
  );
};

export default ExpertiseSection;

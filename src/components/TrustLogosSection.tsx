import AnimateOnScroll from "@/components/AnimateOnScroll";
import globalImpactLogo from "@/assets/logos/global-impact.png";
import workatLogo from "@/assets/logos/workat.png";
import coveLogo from "@/assets/logos/cove.png";
import braikyLogo from "@/assets/logos/braiky.png";
import leticiaLogo from "@/assets/logos/leticia.png";
import africaTrainingLogo from "@/assets/logos/africa-training.png";
import twoDDesignLogo from "@/assets/logos/2d-design.png";
import magicLogo from "@/assets/logos/magic.png";

const companyLogos = [
  { name: "Global Impact", src: globalImpactLogo },
  { name: "Workat", src: workatLogo },
  { name: "Cove", src: coveLogo },
  { name: "Braiky", src: braikyLogo },
  { name: "Leticia & Co.", src: leticiaLogo },
  { name: "Africa Training", src: africaTrainingLogo },
  { name: "2D Design", src: twoDDesignLogo },
  { name: "Magic", src: magicLogo },
];

const TrustLogosSection = () => {
  return (
    <section className="py-16 bg-background border-t border-border">
      <div className="container mx-auto px-4 text-center">
        <AnimateOnScroll>
          <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-10">
            Ils nous ont fait confiance
          </h2>
        </AnimateOnScroll>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-8 max-w-4xl mx-auto items-center">
          {companyLogos.map((logo, i) => (
            <AnimateOnScroll key={logo.name} delay={i * 60}>
              <div className="flex items-center justify-center h-20 opacity-70 hover:opacity-100 transition-all duration-300 hover-scale cursor-default grayscale hover:grayscale-0">
                <img
                  src={logo.src}
                  alt={`Logo ${logo.name}`}
                  loading="lazy"
                  className="max-h-16 max-w-[140px] object-contain invert-0"
                  width={140}
                  height={64}
                />
              </div>
            </AnimateOnScroll>
          ))}
        </div>
      </div>
    </section>
  );
};

export default TrustLogosSection;

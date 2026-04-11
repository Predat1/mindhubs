import globalImpactLogo from "@/assets/logos/global-impact.png";
import workatLogo from "@/assets/logos/workat.png";
import coveLogo from "@/assets/logos/cove.png";
import braikyLogo from "@/assets/logos/braiky.png";
import leticiaLogo from "@/assets/logos/leticia.png";
import africaTrainingLogo from "@/assets/logos/africa-training.png";
import twoDDesignLogo from "@/assets/logos/2d-design.png";
import magicLogo from "@/assets/logos/magic.png";
import { ProgressiveBlur } from "@/components/ui/progressive-blur";

const logos = [
  { name: "Global Impact", src: globalImpactLogo },
  { name: "Workat", src: workatLogo },
  { name: "Cove", src: coveLogo },
  { name: "Braiky", src: braikyLogo },
  { name: "Leticia & Co.", src: leticiaLogo },
  { name: "Africa Training", src: africaTrainingLogo },
  { name: "2D Design", src: twoDDesignLogo },
  { name: "Magic", src: magicLogo },
];

const LogoMarquee = () => {
  const doubled = [...logos, ...logos];

  return (
    <section className="relative py-4 sm:py-6 bg-background overflow-hidden">
      <div className="relative">
        {/* Left fade */}
        <ProgressiveBlur
          direction="left"
          blurLayers={6}
          blurIntensity={1}
          className="absolute left-0 top-0 bottom-0 w-16 sm:w-24 z-10 pointer-events-none"
        />

        {/* Right fade */}
        <ProgressiveBlur
          direction="right"
          blurLayers={6}
          blurIntensity={1}
          className="absolute right-0 top-0 bottom-0 w-16 sm:w-24 z-10 pointer-events-none"
        />

        <div className="flex items-center gap-8 sm:gap-12 animate-marquee-logos">
          {doubled.map((logo, i) => (
            <div
              key={`${logo.name}-${i}`}
              className="flex-shrink-0 flex items-center justify-center h-10 sm:h-12 opacity-40 hover:opacity-100 transition-opacity duration-300 grayscale hover:grayscale-0"
            >
              <img
                src={logo.src}
                alt={`Logo ${logo.name}`}
                loading="lazy"
                className="max-h-8 sm:max-h-10 w-auto object-contain"
                width={100}
                height={40}
              />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default LogoMarquee;

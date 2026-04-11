import shopifyLogo from "@/assets/logos/shopify.svg";
import googleLogo from "@/assets/logos/google.svg";
import hostingerLogo from "@/assets/logos/hostinger.svg";
import wordpressLogo from "@/assets/logos/wordpress.svg";
import stripeLogo from "@/assets/logos/stripe.svg";
import notionLogo from "@/assets/logos/notion.svg";
import { ProgressiveBlur } from "@/components/ui/progressive-blur";

const logos = [
  { name: "Shopify", src: shopifyLogo },
  { name: "Google", src: googleLogo },
  { name: "Hostinger", src: hostingerLogo },
  { name: "WordPress", src: wordpressLogo },
  { name: "Stripe", src: stripeLogo },
  { name: "Notion", src: notionLogo },
];

const LogoMarquee = () => {
  const doubled = [...logos, ...logos];

  return (
    <section className="relative py-4 sm:py-6 bg-background overflow-hidden">
      <div className="relative">
        <ProgressiveBlur
          direction="left"
          blurLayers={6}
          blurIntensity={1}
          className="absolute left-0 top-0 bottom-0 w-16 sm:w-24 z-10 pointer-events-none"
        />
        <ProgressiveBlur
          direction="right"
          blurLayers={6}
          blurIntensity={1}
          className="absolute right-0 top-0 bottom-0 w-16 sm:w-24 z-10 pointer-events-none"
        />

        <div className="flex items-center gap-10 sm:gap-16 animate-marquee-logos">
          {doubled.map((logo, i) => (
            <div
              key={`${logo.name}-${i}`}
              className="flex-shrink-0 flex items-center justify-center h-10 sm:h-12 opacity-50 hover:opacity-100 transition-opacity duration-300 brightness-0 invert hover:brightness-100 hover:invert-0"
            >
              <img
                src={logo.src}
                alt={`Logo ${logo.name}`}
                loading="lazy"
                className="max-h-7 sm:max-h-9 w-auto object-contain"
                width={100}
                height={36}
              />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default LogoMarquee;

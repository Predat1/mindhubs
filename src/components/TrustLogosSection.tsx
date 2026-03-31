import AnimateOnScroll from "@/components/AnimateOnScroll";

const companyLogos = [
  "GLOBAL IMPACT", "WORKAT", "COVE", "BRAIKY",
  "LETICIA & CO.", "AFRICA TRAINING", "2D DESIGN", "MAGIC",
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
        <div className="grid grid-cols-4 gap-6 max-w-3xl mx-auto">
          {companyLogos.map((name, i) => (
            <AnimateOnScroll key={name} delay={i * 60}>
              <div
                className="flex items-center justify-center h-16 text-muted-foreground font-bold text-sm md:text-base tracking-wide opacity-60 hover:opacity-100 transition-all duration-300 hover-scale cursor-default"
                style={{ fontFamily: "serif" }}
              >
                {name}
              </div>
            </AnimateOnScroll>
          ))}
        </div>
      </div>
    </section>
  );
};

export default TrustLogosSection;

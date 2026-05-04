import { Star, CheckCircle2 } from "lucide-react";
import AnimateOnScroll from "@/components/AnimateOnScroll";
import { motion } from "framer-motion";

// Internal BadgeCheck replacement to avoid import issues if not available in lucide-react
const BadgeCheck = ({ className }: { className?: string }) => (
  <svg className={className} width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10" />
    <path d="m9 12 2 2 4-4" />
  </svg>
);

const Button = ({ children, variant, className, onClick }: any) => (
  <button onClick={onClick} className={`inline-flex items-center justify-center gap-2 transition-all active:scale-95 ${variant === "outline" ? "border" : "bg-primary text-white"} ${className}`}>
    {children}
  </button>
);

const reviews = [
  { name: "Issa Kharou", text: "Les formations sont très complètes et bien structurées. J'ai beaucoup appris en peu de temps.", avatar: "https://i.pravatar.cc/150?u=issa" },
  { name: "Olive Larivière", text: "Excellente plateforme, le contenu est de qualité et le support est très réactif.", avatar: "https://i.pravatar.cc/150?u=olive" },
  { name: "Fadi Nidé", text: "Je recommande vivement MindHub. Les prix sont imbattables pour la qualité proposée.", avatar: "https://i.pravatar.cc/150?u=fadi" },
  { name: "Amadou Sow", text: "Une révolution pour mon business de dropshipping. Les kits sont ultra complets et actionnables.", avatar: "https://i.pravatar.cc/150?u=amadou" },
  { name: "Mariam Koné", text: "Le pack formation anglais m'a permis de décrocher un job à l'international. Merci !", avatar: "https://i.pravatar.cc/150?u=mariam" },
  { name: "Koffi Mensah", text: "Support client exceptionnel et produits de très haute qualité. Je ne regrette pas mon achat.", avatar: "https://i.pravatar.cc/150?u=koffi" },
  { name: "Aminata Diallo", text: "J'ai triplé mes revenus en appliquant les stratégies du guide marketing digital.", avatar: "https://i.pravatar.cc/150?u=aminata" },
  { name: "Jean-Pierre N'goran", text: "Le meilleur investissement de l'année pour ma transition digitale. Top !", avatar: "https://i.pravatar.cc/150?u=jean" },
];

const GoogleReviewsSection = () => {
  return (
    <section className="py-24 bg-background overflow-hidden">
      <div className="container mx-auto px-4 text-center mb-16">
        <AnimateOnScroll>
          <div className="flex justify-center gap-2 mb-4">
             <BadgeCheck className="text-primary w-5 h-5" />
             <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Avis Clients Vérifiés</span>
          </div>
          <h2 className="text-4xl md:text-6xl font-black tracking-tighter text-foreground mb-4">
            Nos clients parlent <span className="text-primary italic">de</span> nous
          </h2>
          <div className="flex flex-col items-center gap-2">
            <div className="flex justify-center gap-1">
              {Array.from({ length: 5 }).map((_, i) => (
                <Star key={i} size={28} className="text-amber-500 fill-amber-500" />
              ))}
            </div>
            <p className="text-sm font-bold text-muted-foreground">Note moyenne de 4.9/5 basée sur +500 avis</p>
          </div>
        </AnimateOnScroll>
      </div>

      {/* Google Trust Header */}
      <div className="container mx-auto px-4 mb-12">
        <div className="max-w-4xl mx-auto flex flex-col md:flex-row items-center justify-between gap-8 glass-card p-8 rounded-[3rem] border-white/5">
           <div className="flex flex-col items-center md:items-start gap-1">
              <p className="text-foreground font-black text-xs uppercase tracking-widest">EXCELLENT SUR</p>
              <div className="flex items-center gap-2">
                <span className="text-3xl font-black" style={{ color: "#4285F4" }}>G</span>
                <span className="text-2xl font-bold" style={{ color: "#EA4335" }}>o</span>
                <span className="text-2xl font-bold" style={{ color: "#FBBC05" }}>o</span>
                <span className="text-2xl font-bold" style={{ color: "#4285F4" }}>g</span>
                <span className="text-2xl font-bold" style={{ color: "#34A853" }}>l</span>
                <span className="text-2xl font-bold" style={{ color: "#EA4335" }}>e</span>
              </div>
           </div>
           <div className="hidden md:block h-12 w-px bg-white/10" />
           <div className="flex items-center gap-6">
              <div className="text-center">
                 <p className="text-2xl font-black">4.9</p>
                 <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Score Expert</p>
              </div>
              <div className="text-center">
                 <p className="text-2xl font-black">100%</p>
                 <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Satisfaction</p>
              </div>
              <div className="text-center">
                 <p className="text-2xl font-black">24/7</p>
                 <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Support</p>
              </div>
           </div>
        </div>
      </div>

      {/* Marquee Container */}
      <div className="relative w-full flex overflow-hidden py-10">
        <motion.div 
          className="flex gap-6 whitespace-nowrap"
          animate={{ x: [0, -1920] }}
          transition={{ 
            duration: 40, 
            repeat: Infinity, 
            ease: "linear" 
          }}
        >
          {/* Duplicate for infinite loop */}
          {[...reviews, ...reviews].map((review, i) => (
            <div 
              key={i} 
              className="w-[350px] shrink-0 glass-card rounded-[2.5rem] p-6 text-left space-y-4 border-white/10 hover:border-primary/50 transition-colors shadow-2xl relative"
            >
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl overflow-hidden border border-white/10 shadow-lg">
                  <img src={review.avatar} alt={review.name} className="w-full h-full object-cover" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-1.5">
                    <p className="text-foreground text-sm font-black tracking-tight">{review.name}</p>
                    <CheckCircle2 size={12} className="text-primary" />
                  </div>
                  <div className="flex gap-0.5">
                    {Array.from({ length: 5 }).map((_, j) => (
                      <Star key={j} size={10} className="text-amber-500 fill-amber-500" />
                    ))}
                  </div>
                </div>
                <div className="text-xl font-black opacity-20" style={{ color: "#4285F4" }}>G</div>
              </div>
              <p className="text-muted-foreground text-sm font-medium leading-relaxed italic whitespace-normal">
                "{review.text}"
              </p>
              <div className="absolute top-4 right-6 pointer-events-none opacity-[0.03]">
                 <svg width="40" height="40" viewBox="0 0 24 24" fill="currentColor"><path d="M14.017 21L14.017 18C14.017 16.8954 14.9124 16 16.017 16H19.017C19.5693 16 20.017 15.5523 20.017 15V9C20.017 8.44772 19.5693 8 19.017 8H16.017C15.4647 8 15.017 8.44772 15.017 9V12C15.017 12.5523 14.5693 13 14.017 13H13.017V21H14.017ZM6.017 21L6.017 18C6.017 16.8954 6.91243 16 8.017 16H11.017C11.5693 16 12.017 15.5523 12.017 15V9C12.017 8.44772 11.5693 8 11.017 8H8.017C7.46472 8 7.017 8.44772 7.017 9V12C7.017 12.5523 6.56928 13 6.017 13H5.017V21H6.017Z" /></svg>
              </div>
            </div>
          ))}
        </motion.div>
      </div>

      <AnimateOnScroll delay={500}>
        <div className="mt-12 text-center">
          <Button variant="outline" className="rounded-full border-white/10 hover:bg-white/5 font-black text-xs uppercase tracking-widest h-12 px-8">
            Rejoindre les +2,500 clients satisfaits →
          </Button>
        </div>
      </AnimateOnScroll>
    </section>
  );
};

export default GoogleReviewsSection;

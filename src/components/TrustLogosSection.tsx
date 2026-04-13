import { useRef, useEffect, useState } from "react";
import AnimateOnScroll from "@/components/AnimateOnScroll";
import { useTestimonials } from "@/hooks/useTestimonials";
import type { Testimonial } from "@/hooks/useTestimonials";
import face1 from "@/assets/faces/face-1.jpg";
import face2 from "@/assets/faces/face-2.jpg";
import face3 from "@/assets/faces/face-3.jpg";
import face4 from "@/assets/faces/face-4.jpg";
import face5 from "@/assets/faces/face-5.jpg";
import face6 from "@/assets/faces/face-6.jpg";
import face7 from "@/assets/faces/face-7.jpg";
import face8 from "@/assets/faces/face-8.jpg";
import { Star, Heart, MessageCircle, Repeat2, BadgeCheck } from "lucide-react";

const entrepreneurs = [
  { name: "Sophie Martin", src: face1 },
  { name: "Amadou Diallo", src: face2 },
  { name: "Claire Dubois", src: face3 },
  { name: "Moussa Konaté", src: face4 },
  { name: "Fatou Ndiaye", src: face5 },
  { name: "Thomas Leroy", src: face6 },
  { name: "Aïcha Bamba", src: face7 },
  { name: "Ibrahim Traoré", src: face8 },
];

// Map testimonial names/handles to face images
const faceMap: Record<string, string> = {
  "@sophie_mkt": face1,
  "@amadou_tech": face2,
  "@claire_design": face3,
  "@moussa_biz": face4,
  "@fatou_creative": face5,
  "@thomas_growth": face6,
};

const fallbackTestimonials: Testimonial[] = [
  { id: "1", name: "Sophie Martin", handle: "@sophie_mkt", avatar_initials: "SM", content: "J'ai suivi la formation Marketing Digital et en 3 mois, j'ai doublé le CA de mon business en ligne. Le contenu est ultra qualitatif 🔥", likes: 247, retweets: 42, replies: 18, verified: true, created_at: "" },
  { id: "2", name: "Amadou Diallo", handle: "@amadou_tech", avatar_initials: "AD", content: "La meilleure décision de 2025 : investir dans cette formation. Le ROI est incroyable. Merci pour tout ! 💪", likes: 189, retweets: 31, replies: 12, verified: false, created_at: "" },
  { id: "3", name: "Claire Dubois", handle: "@claire_design", avatar_initials: "CD", content: "Formation Canva Pro terminée ✅ En une semaine, j'ai créé une identité visuelle complète pour 3 clients. Le support est au top !", likes: 312, retweets: 56, replies: 24, verified: true, created_at: "" },
  { id: "4", name: "Moussa Konaté", handle: "@moussa_biz", avatar_initials: "MK", content: "Sceptique au début, convaincu à la fin. Les modules sont concrets, pas de blabla. J'ai lancé mon e-commerce en 2 semaines 🚀", likes: 421, retweets: 78, replies: 35, verified: true, created_at: "" },
  { id: "5", name: "Fatou Ndiaye", handle: "@fatou_creative", avatar_initials: "FN", content: "Accès à vie + mises à jour gratuites = le meilleur investissement. La communauté est aussi un vrai plus. Merci 🙏✨", likes: 156, retweets: 23, replies: 9, verified: false, created_at: "" },
  { id: "6", name: "Thomas Leroy", handle: "@thomas_growth", avatar_initials: "TL", content: "3 formations achetées, 3 réussites. Mon agence tourne maintenant avec les compétences acquises ici. Rapport qualité/prix imbattable 💎", likes: 534, retweets: 92, replies: 41, verified: true, created_at: "" },
];

const TweetCard = ({ tweet, index }: { tweet: Testimonial; index: number }) => {
  const faceImg = faceMap[tweet.handle] || entrepreneurs[index % entrepreneurs.length]?.src;

  return (
    <div className="flex-shrink-0 w-[340px] stat-card rounded-2xl p-5 border-glow cursor-default select-none">
      <div className="flex items-start gap-3 mb-3">
        <img
          src={faceImg}
          alt={tweet.name}
          className="w-10 h-10 rounded-full object-cover flex-shrink-0"
          loading="lazy"
          width={40}
          height={40}
        />
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1">
            <span className="font-semibold text-foreground text-sm truncate">{tweet.name}</span>
            {tweet.verified && <BadgeCheck className="w-4 h-4 text-primary flex-shrink-0" />}
          </div>
          <span className="text-xs text-muted-foreground">{tweet.handle}</span>
        </div>
        <svg viewBox="0 0 24 24" className="w-5 h-5 text-muted-foreground/50 flex-shrink-0" fill="currentColor">
          <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
        </svg>
      </div>
      <p className="text-sm text-foreground/90 leading-relaxed mb-4">{tweet.content}</p>
      <div className="flex items-center justify-between text-muted-foreground">
        <div className="flex items-center gap-4">
          <span className="flex items-center gap-1 text-xs">
            <MessageCircle className="w-3.5 h-3.5" /> {tweet.replies}
          </span>
          <span className="flex items-center gap-1 text-xs">
            <Repeat2 className="w-3.5 h-3.5" /> {tweet.retweets}
          </span>
          <span className="flex items-center gap-1 text-xs text-destructive">
            <Heart className="w-3.5 h-3.5 fill-destructive" /> {tweet.likes}
          </span>
        </div>
      </div>
    </div>
  );
};

const TrustLogosSection = () => {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [isPaused, setIsPaused] = useState(false);
  const { data: testimonials } = useTestimonials();

  const tweets = testimonials && testimonials.length > 0 ? testimonials : fallbackTestimonials;

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    let animId: number;
    let scrollPos = 0;
    const speed = 0.5;
    const step = () => {
      if (!isPaused && el) {
        scrollPos += speed;
        if (scrollPos >= el.scrollWidth / 2) scrollPos = 0;
        el.scrollLeft = scrollPos;
      }
      animId = requestAnimationFrame(step);
    };
    animId = requestAnimationFrame(step);
    return () => cancelAnimationFrame(animId);
  }, [isPaused]);

  return (
    <section className="py-20 bg-background border-t border-border overflow-hidden">
      <div className="container mx-auto px-4 text-center mb-14">
        <AnimateOnScroll>
          <p className="text-xs font-medium uppercase tracking-[0.2em] text-muted-foreground mb-2">
            Entrepreneurs & Témoignages
          </p>
          <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-4">
            Ils nous ont fait confiance
          </h2>
          <p className="text-muted-foreground max-w-xl mx-auto text-sm">
            Découvrez ce que nos clients et entrepreneurs disent de nos formations
          </p>
        </AnimateOnScroll>
      </div>

      {/* Entrepreneur Faces */}
      <div className="container mx-auto px-4 mb-14">
        <div className="grid grid-cols-4 sm:grid-cols-8 gap-3 sm:gap-4 max-w-3xl mx-auto items-center justify-items-center">
          {entrepreneurs.map((person, i) => (
            <AnimateOnScroll key={person.name} delay={i * 60}>
              <div className="flex flex-col items-center gap-2 hover-scale cursor-default">
                <img
                  src={person.src}
                  alt={person.name}
                  loading="lazy"
                  width={64}
                  height={64}
                  className="w-14 h-14 sm:w-16 sm:h-16 rounded-full object-cover border-2 border-primary/30 shadow-md"
                />
                <span className="text-[9px] sm:text-[10px] text-muted-foreground font-medium text-center leading-tight max-w-[70px] truncate">
                  {person.name.split(" ")[0]}
                </span>
              </div>
            </AnimateOnScroll>
          ))}
        </div>
      </div>

      {/* Scrolling tweets */}
      <AnimateOnScroll>
        <div
          ref={scrollRef}
          className="flex gap-5 overflow-hidden px-4"
          onMouseEnter={() => setIsPaused(true)}
          onMouseLeave={() => setIsPaused(false)}
          onTouchStart={() => setIsPaused(true)}
          onTouchEnd={() => setIsPaused(false)}
        >
          {[...tweets, ...tweets].map((tweet, i) => (
            <TweetCard key={`${tweet.handle}-${i}`} tweet={tweet} index={i} />
          ))}
        </div>
      </AnimateOnScroll>

      {/* Rating */}
      <AnimateOnScroll delay={200}>
        <div className="container mx-auto px-4 mt-12">
          <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
            <div className="flex">
              {[1, 2, 3, 4, 5].map((s) => (
                <Star key={s} className="w-4 h-4 fill-primary text-primary" />
              ))}
            </div>
            <span>4.9/5 basé sur <span className="text-foreground font-semibold">500+ avis</span></span>
          </div>
        </div>
      </AnimateOnScroll>
    </section>
  );
};

export default TrustLogosSection;

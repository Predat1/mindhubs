import { useRef, useEffect, useState } from "react";
import AnimateOnScroll from "@/components/AnimateOnScroll";
import globalImpactLogo from "@/assets/logos/global-impact.png";
import workatLogo from "@/assets/logos/workat.png";
import coveLogo from "@/assets/logos/cove.png";
import braikyLogo from "@/assets/logos/braiky.png";
import leticiaLogo from "@/assets/logos/leticia.png";
import africaTrainingLogo from "@/assets/logos/africa-training.png";
import twoDDesignLogo from "@/assets/logos/2d-design.png";
import magicLogo from "@/assets/logos/magic.png";
import { Star, Heart, MessageCircle, Repeat2, BadgeCheck } from "lucide-react";

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

interface Tweet {
  name: string;
  handle: string;
  avatar: string;
  content: string;
  likes: number;
  retweets: number;
  replies: number;
  date: string;
  verified: boolean;
}

const tweets: Tweet[] = [
  {
    name: "Sophie Martin",
    handle: "@sophie_mkt",
    avatar: "SM",
    content: "J'ai suivi la formation Marketing Digital et en 3 mois, j'ai doublé le CA de mon business en ligne. Le contenu est ultra qualitatif 🔥",
    likes: 247,
    retweets: 42,
    replies: 18,
    date: "12 mars 2025",
    verified: true,
  },
  {
    name: "Amadou Diallo",
    handle: "@amadou_tech",
    avatar: "AD",
    content: "La meilleure décision de 2025 : investir dans cette formation. Le ROI est incroyable. Merci pour tout ! 💪",
    likes: 189,
    retweets: 31,
    replies: 12,
    date: "8 mars 2025",
    verified: false,
  },
  {
    name: "Claire Dubois",
    handle: "@claire_design",
    avatar: "CD",
    content: "Formation Canva Pro terminée ✅ En une semaine, j'ai créé une identité visuelle complète pour 3 clients. Le support est au top !",
    likes: 312,
    retweets: 56,
    replies: 24,
    date: "5 mars 2025",
    verified: true,
  },
  {
    name: "Moussa Konaté",
    handle: "@moussa_biz",
    avatar: "MK",
    content: "Sceptique au début, convaincu à la fin. Les modules sont concrets, pas de blabla. J'ai lancé mon e-commerce en 2 semaines 🚀",
    likes: 421,
    retweets: 78,
    replies: 35,
    date: "28 fév 2025",
    verified: true,
  },
  {
    name: "Fatou Ndiaye",
    handle: "@fatou_creative",
    avatar: "FN",
    content: "Accès à vie + mises à jour gratuites = le meilleur investissement. La communauté est aussi un vrai plus. Merci 🙏✨",
    likes: 156,
    retweets: 23,
    replies: 9,
    date: "22 fév 2025",
    verified: false,
  },
  {
    name: "Thomas Leroy",
    handle: "@thomas_growth",
    avatar: "TL",
    content: "3 formations achetées, 3 réussites. Mon agence tourne maintenant avec les compétences acquises ici. Rapport qualité/prix imbattable 💎",
    likes: 534,
    retweets: 92,
    replies: 41,
    date: "15 fév 2025",
    verified: true,
  },
];

const TweetCard = ({ tweet }: { tweet: Tweet }) => (
  <div className="flex-shrink-0 w-[340px] stat-card rounded-2xl p-5 border-glow cursor-default select-none">
    {/* Header */}
    <div className="flex items-start gap-3 mb-3">
      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary/30 to-primary/10 flex items-center justify-center text-sm font-bold text-primary flex-shrink-0">
        {tweet.avatar}
      </div>
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

    {/* Content */}
    <p className="text-sm text-foreground/90 leading-relaxed mb-4">{tweet.content}</p>

    {/* Footer */}
    <div className="flex items-center justify-between text-muted-foreground">
      <span className="text-xs">{tweet.date}</span>
      <div className="flex items-center gap-4">
        <span className="flex items-center gap-1 text-xs">
          <MessageCircle className="w-3.5 h-3.5" /> {tweet.replies}
        </span>
        <span className="flex items-center gap-1 text-xs">
          <Repeat2 className="w-3.5 h-3.5" /> {tweet.retweets}
        </span>
        <span className="flex items-center gap-1 text-xs text-red-400">
          <Heart className="w-3.5 h-3.5 fill-red-400" /> {tweet.likes}
        </span>
      </div>
    </div>
  </div>
);

const TrustLogosSection = () => {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [isPaused, setIsPaused] = useState(false);

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;

    let animId: number;
    let scrollPos = 0;
    const speed = 0.5;

    const step = () => {
      if (!isPaused && el) {
        scrollPos += speed;
        // Reset when we've scrolled past the first set of tweets
        if (scrollPos >= el.scrollWidth / 2) {
          scrollPos = 0;
        }
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
            Partenaires & Témoignages
          </p>
          <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-4">
            Ils nous ont fait confiance
          </h2>
          <p className="text-muted-foreground max-w-xl mx-auto text-sm">
            Découvrez ce que nos clients et partenaires disent de nos formations
          </p>
        </AnimateOnScroll>
      </div>

      {/* Logos row */}
      <div className="container mx-auto px-4 mb-14">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 max-w-3xl mx-auto items-center">
          {companyLogos.map((logo, i) => (
            <AnimateOnScroll key={logo.name} delay={i * 60}>
              <div className="flex items-center justify-center h-16 stat-card rounded-xl border-glow p-3 opacity-60 hover:opacity-100 transition-all duration-300 hover-scale cursor-default">
                <img
                  src={logo.src}
                  alt={`Logo ${logo.name}`}
                  loading="lazy"
                  className="max-h-10 max-w-[100px] object-contain"
                  width={100}
                  height={40}
                />
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
          {/* Duplicate tweets for infinite scroll effect */}
          {[...tweets, ...tweets].map((tweet, i) => (
            <TweetCard key={`${tweet.handle}-${i}`} tweet={tweet} />
          ))}
        </div>
      </AnimateOnScroll>

      {/* Rating summary */}
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

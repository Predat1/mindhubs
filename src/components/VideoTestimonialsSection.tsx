import { useState } from "react";
import { Play, X, Star, ChevronLeft, ChevronRight } from "lucide-react";
import AnimateOnScroll from "@/components/AnimateOnScroll";

interface VideoTestimonial {
  id: string;
  name: string;
  role: string;
  text: string;
  rating: number;
  thumbnail: string;
  videoUrl: string;
}

const videoTestimonials: VideoTestimonial[] = [
  {
    id: "1",
    name: "Amadou Konaté",
    role: "Entrepreneur SMMA",
    text: "Grâce à MindHub, j'ai lancé mon agence SMMA et généré mes premiers 500 000 FCFA en seulement 2 mois !",
    rating: 5,
    thumbnail: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=300&fit=crop",
    videoUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ",
  },
  {
    id: "2",
    name: "Fatou Diallo",
    role: "Formatrice en ligne",
    text: "Les formations sont incroyablement bien structurées. J'ai pu créer ma propre formation et la vendre en ligne.",
    rating: 5,
    thumbnail: "https://images.unsplash.com/photo-1531123897727-8f129e1688ce?w=400&h=300&fit=crop",
    videoUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ",
  },
  {
    id: "3",
    name: "Ibrahim Moussa",
    role: "Développeur Web",
    text: "Le meilleur investissement de ma carrière. Le contenu est à jour et le support est exceptionnel.",
    rating: 5,
    thumbnail: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=400&h=300&fit=crop",
    videoUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ",
  },
  {
    id: "4",
    name: "Sarah Lemoine",
    role: "Étudiante",
    text: "J'ai appris l'anglais rapidement grâce à leur méthode innovante. Formation très bien structurée et motivante.",
    rating: 5,
    thumbnail: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400&h=300&fit=crop",
    videoUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ",
  },
  {
    id: "5",
    name: "Ousmane Traoré",
    role: "E-commerçant",
    text: "Grâce au pack e-commerce, j'ai pu lancer ma boutique en ligne et réaliser mes premières ventes en 3 semaines.",
    rating: 5,
    thumbnail: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400&h=300&fit=crop",
    videoUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ",
  },
];

const VideoTestimonialsSection = () => {
  const [activeVideo, setActiveVideo] = useState<string | null>(null);
  const [currentIndex, setCurrentIndex] = useState(0);

  const visibleCount = 3;
  const maxIndex = Math.max(0, videoTestimonials.length - visibleCount);

  const prev = () => setCurrentIndex((i) => Math.max(0, i - 1));
  const next = () => setCurrentIndex((i) => Math.min(maxIndex, i + 1));

  return (
    <section className="py-20 bg-gradient-hero relative overflow-hidden" id="avis">
      {/* Background glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-primary/5 rounded-full blur-[150px]" />

      <div className="container mx-auto px-4 relative z-10">
        <AnimateOnScroll>
          <div className="text-center mb-14 space-y-4">
            <span className="badge-purple inline-flex items-center gap-2 px-4 py-2 rounded-full text-xs font-semibold uppercase tracking-wider">
              Témoignages vidéo
            </span>
            <h2 className="text-3xl md:text-4xl font-bold text-foreground">
              Ils ont transformé leur vie avec{" "}
              <span className="text-gradient-brand">MindHub</span>
            </h2>
            <p className="text-muted-foreground max-w-xl mx-auto">
              Découvrez les parcours inspirants de nos étudiants qui ont atteint leurs objectifs grâce à nos formations.
            </p>
          </div>
        </AnimateOnScroll>

        {/* Carousel */}
        <div className="relative">
          {/* Navigation arrows */}
          <button
            onClick={prev}
            disabled={currentIndex === 0}
            className="absolute -left-4 md:-left-6 top-1/2 -translate-y-1/2 z-20 w-10 h-10 rounded-full bg-card border border-border flex items-center justify-center text-foreground hover:border-primary/50 hover:shadow-glow transition-all disabled:opacity-30 disabled:cursor-not-allowed"
          >
            <ChevronLeft size={20} />
          </button>
          <button
            onClick={next}
            disabled={currentIndex >= maxIndex}
            className="absolute -right-4 md:-right-6 top-1/2 -translate-y-1/2 z-20 w-10 h-10 rounded-full bg-card border border-border flex items-center justify-center text-foreground hover:border-primary/50 hover:shadow-glow transition-all disabled:opacity-30 disabled:cursor-not-allowed"
          >
            <ChevronRight size={20} />
          </button>

          <div className="overflow-hidden">
            <div
              className="flex gap-6 transition-transform duration-500 ease-out"
              style={{ transform: `translateX(-${currentIndex * (100 / visibleCount + 2)}%)` }}
            >
              {videoTestimonials.map((t, i) => (
                <AnimateOnScroll key={t.id} delay={i * 100}>
                  <div className="min-w-[300px] md:min-w-[340px] flex-shrink-0">
                    <div className="stat-card rounded-xl overflow-hidden hover:border-primary/40 transition-all duration-300 group">
                      {/* Video thumbnail */}
                      <div
                        className="relative cursor-pointer overflow-hidden"
                        onClick={() => setActiveVideo(t.videoUrl)}
                      >
                        <img
                          src={t.thumbnail}
                          alt={t.name}
                          className="w-full h-48 object-cover transition-transform duration-500 group-hover:scale-110"
                          loading="lazy"
                        />
                        <div className="absolute inset-0 bg-black/40 flex items-center justify-center group-hover:bg-black/30 transition-colors">
                          <div className="w-14 h-14 rounded-full bg-primary/90 flex items-center justify-center shadow-glow group-hover:scale-110 transition-transform">
                            <Play size={24} className="text-primary-foreground ml-1" fill="currentColor" />
                          </div>
                        </div>
                      </div>

                      {/* Content */}
                      <div className="p-5 space-y-3">
                        <div className="flex gap-0.5">
                          {Array.from({ length: 5 }).map((_, j) => (
                            <Star
                              key={j}
                              size={14}
                              className={j < t.rating ? "text-accent fill-accent" : "text-muted-foreground"}
                            />
                          ))}
                        </div>
                        <p className="text-sm text-muted-foreground leading-relaxed line-clamp-3">
                          "{t.text}"
                        </p>
                        <div>
                          <p className="text-sm font-semibold text-foreground">{t.name}</p>
                          <p className="text-xs text-primary">{t.role}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </AnimateOnScroll>
              ))}
            </div>
          </div>

          {/* Dots */}
          <div className="flex justify-center gap-2 mt-8">
            {Array.from({ length: maxIndex + 1 }).map((_, i) => (
              <button
                key={i}
                onClick={() => setCurrentIndex(i)}
                className={`w-2.5 h-2.5 rounded-full transition-all ${
                  i === currentIndex ? "bg-primary w-8" : "bg-muted-foreground/30 hover:bg-muted-foreground/50"
                }`}
              />
            ))}
          </div>
        </div>
      </div>

      {/* Video modal */}
      {activeVideo && (
        <div
          className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in"
          onClick={() => setActiveVideo(null)}
        >
          <div
            className="relative w-full max-w-3xl aspect-video rounded-xl overflow-hidden shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setActiveVideo(null)}
              className="absolute -top-12 right-0 text-white hover:text-primary transition-colors"
            >
              <X size={28} />
            </button>
            <iframe
              src={`${activeVideo}?autoplay=1`}
              className="w-full h-full"
              allow="autoplay; encrypted-media"
              allowFullScreen
              title="Témoignage vidéo"
            />
          </div>
        </div>
      )}
    </section>
  );
};

export default VideoTestimonialsSection;

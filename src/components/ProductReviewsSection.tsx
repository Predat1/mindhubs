import { useState } from "react";
import { Star, Send, CheckCircle } from "lucide-react";
import { useProductReviews, useSubmitReview } from "@/hooks/useProductReviews";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "@/hooks/use-toast";

interface Props {
  productId: string;
}

const ProductReviewsSection = ({ productId }: Props) => {
  const { data: reviews = [], isLoading } = useProductReviews(productId);
  const submitReview = useSubmitReview();
  const { user } = useAuth();
  const [rating, setRating] = useState(5);
  const [hoverRating, setHoverRating] = useState(0);
  const [content, setContent] = useState("");
  const [authorName, setAuthorName] = useState("");
  const [showForm, setShowForm] = useState(false);

  const avgRating = reviews.length > 0
    ? (reviews.reduce((s, r) => s + r.rating, 0) / reviews.length).toFixed(1)
    : "0";

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim() || !authorName.trim()) {
      toast({ title: "Veuillez remplir tous les champs", variant: "destructive" });
      return;
    }
    try {
      await submitReview.mutateAsync({
        product_id: productId,
        author_name: authorName.trim(),
        rating,
        content: content.trim(),
        user_id: user?.id,
      });
      toast({ title: "Avis publié ✅", description: "Merci pour votre retour !" });
      setContent("");
      setAuthorName("");
      setRating(5);
      setShowForm(false);
    } catch {
      toast({ title: "Erreur", description: "Vous devez être connecté pour laisser un avis.", variant: "destructive" });
    }
  };

  const ratingDistribution = [5, 4, 3, 2, 1].map((star) => ({
    star,
    count: reviews.filter((r) => r.rating === star).length,
    pct: reviews.length > 0 ? (reviews.filter((r) => r.rating === star).length / reviews.length) * 100 : 0,
  }));

  return (
    <div className="space-y-6">
      {/* Summary */}
      <div className="flex flex-col sm:flex-row gap-6 sm:items-start">
        <div className="text-center sm:text-left">
          <p className="text-4xl font-bold text-foreground">{avgRating}</p>
          <div className="flex justify-center sm:justify-start gap-0.5 my-1">
            {Array.from({ length: 5 }).map((_, i) => (
              <Star key={i} size={14} className={i < Math.round(Number(avgRating)) ? "text-accent fill-accent" : "text-muted-foreground"} />
            ))}
          </div>
          <p className="text-xs text-muted-foreground">{reviews.length} avis</p>
        </div>
        <div className="flex-1 space-y-1.5">
          {ratingDistribution.map((d) => (
            <div key={d.star} className="flex items-center gap-2 text-xs">
              <span className="w-3 text-muted-foreground">{d.star}</span>
              <Star size={10} className="text-accent fill-accent" />
              <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
                <div className="h-full bg-accent rounded-full transition-all" style={{ width: `${d.pct}%` }} />
              </div>
              <span className="w-6 text-right text-muted-foreground">{d.count}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Write review toggle */}
      {!showForm ? (
        <button
          onClick={() => setShowForm(true)}
          className="btn-primary-brand px-5 py-2.5 rounded-xl font-semibold text-xs inline-flex items-center gap-2"
        >
          <Star size={14} /> Écrire un avis
        </button>
      ) : (
        <form onSubmit={handleSubmit} className="stat-card rounded-xl p-4 space-y-3">
          <input
            type="text"
            placeholder="Votre nom"
            value={authorName}
            onChange={(e) => setAuthorName(e.target.value)}
            className="w-full px-3 py-2 rounded-lg bg-muted/50 border border-border text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
          />
          <div className="flex items-center gap-1">
            {Array.from({ length: 5 }).map((_, i) => (
              <button
                key={i}
                type="button"
                onClick={() => setRating(i + 1)}
                onMouseEnter={() => setHoverRating(i + 1)}
                onMouseLeave={() => setHoverRating(0)}
              >
                <Star
                  size={20}
                  className={`transition-colors cursor-pointer ${
                    i < (hoverRating || rating) ? "text-accent fill-accent" : "text-muted-foreground"
                  }`}
                />
              </button>
            ))}
            <span className="text-xs text-muted-foreground ml-2">{rating}/5</span>
          </div>
          <textarea
            placeholder="Partagez votre expérience..."
            value={content}
            onChange={(e) => setContent(e.target.value)}
            rows={3}
            className="w-full px-3 py-2 rounded-lg bg-muted/50 border border-border text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 resize-none"
          />
          <div className="flex gap-2">
            <button
              type="submit"
              disabled={submitReview.isPending}
              className="btn-primary-brand px-5 py-2 rounded-lg font-semibold text-xs inline-flex items-center gap-2"
            >
              <Send size={12} /> {submitReview.isPending ? "Envoi..." : "Publier"}
            </button>
            <button type="button" onClick={() => setShowForm(false)} className="px-4 py-2 rounded-lg text-xs text-muted-foreground hover:text-foreground border border-border transition-colors">
              Annuler
            </button>
          </div>
        </form>
      )}

      {/* Reviews list */}
      {isLoading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => <div key={i} className="stat-card rounded-xl h-24 animate-pulse" />)}
        </div>
      ) : reviews.length === 0 ? (
        <p className="text-sm text-muted-foreground text-center py-6">Aucun avis pour le moment. Soyez le premier !</p>
      ) : (
        <div className="space-y-3 max-h-[500px] overflow-y-auto pr-1">
          {reviews.map((review) => (
            <div key={review.id} className="stat-card rounded-xl p-4 space-y-2">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-xs font-bold text-primary">
                  {review.author_name.charAt(0).toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="text-xs font-semibold text-foreground truncate">{review.author_name}</p>
                    {review.verified_purchase && (
                      <span className="inline-flex items-center gap-0.5 text-[10px] text-primary">
                        <CheckCircle size={10} /> Achat vérifié
                      </span>
                    )}
                  </div>
                  <div className="flex gap-0.5">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star key={i} size={10} className={i < review.rating ? "text-accent fill-accent" : "text-muted-foreground"} />
                    ))}
                  </div>
                </div>
                <span className="text-[10px] text-muted-foreground">
                  {new Date(review.created_at).toLocaleDateString("fr-FR")}
                </span>
              </div>
              <p className="text-xs text-foreground/80 leading-relaxed">{review.content}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ProductReviewsSection;

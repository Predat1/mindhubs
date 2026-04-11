import { ShoppingCart, Zap, X, Clock, Star, ShieldCheck, Users, Flame } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useCart } from "@/contexts/CartContext";
import { toast } from "@/hooks/use-toast";
import type { Product } from "@/data/products";
import { useState, useEffect } from "react";

interface Props {
  product: Product;
  open: boolean;
  onClose: () => void;
}

const BuyPopup = ({ product, open, onClose }: Props) => {
  const { addToCart } = useCart();
  const navigate = useNavigate();
  const [viewerCount, setViewerCount] = useState(0);

  useEffect(() => {
    if (open) {
      setViewerCount(Math.floor(Math.random() * 30) + 15);
      const interval = setInterval(() => {
        setViewerCount((prev) => prev + Math.floor(Math.random() * 3) - 1);
      }, 4000);
      return () => clearInterval(interval);
    }
  }, [open]);

  if (!open) return null;

  const handleAddToCart = () => {
    addToCart(product);
    toast({ title: "Ajouté au panier 🛒", description: product.title });
    onClose();
  };

  const handleBuyNow = () => {
    addToCart(product);
    onClose();
    if (product.paymentLink) {
      window.open(product.paymentLink, "_blank", "noopener,noreferrer");
    } else {
      navigate("/checkout");
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center" onClick={onClose}>
      {/* Backdrop */}
      <div className="absolute inset-0 bg-background/98 backdrop-blur-xl" />

      {/* Content — fullscreen on mobile, large card on desktop */}
      <div
        className="relative w-full h-full md:h-auto md:max-h-[90vh] md:max-w-2xl md:mx-4 bg-card md:rounded-3xl overflow-hidden md:border md:border-border md:shadow-2xl flex flex-col"
        onClick={(e) => e.stopPropagation()}
        style={{ animation: "popup-enter 0.35s cubic-bezier(0.16, 1, 0.3, 1)" }}
      >
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-20 w-10 h-10 rounded-full bg-background/80 backdrop-blur flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors"
        >
          <X size={20} />
        </button>

        {/* Scrollable inner */}
        <div className="flex-1 overflow-y-auto">
          {/* Split layout */}
          <div className="md:grid md:grid-cols-2">
            {/* Image side */}
            <div className="relative w-full aspect-[4/3] md:aspect-auto md:min-h-full bg-muted overflow-hidden">
              <img
                src={product.image}
                alt={product.title}
                className="w-full h-full object-cover"
              />
              {/* Overlay gradient */}
              <div className="absolute inset-0 bg-gradient-to-t from-background/60 via-transparent to-transparent md:bg-gradient-to-r md:from-transparent md:to-background/20" />

              {/* Live viewers badge */}
              <div className="absolute top-4 left-4 flex items-center gap-2 px-3 py-2 rounded-full bg-destructive/90 text-destructive-foreground text-xs font-bold backdrop-blur-sm">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-destructive-foreground opacity-75" />
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-destructive-foreground" />
                </span>
                {viewerCount} personnes regardent
              </div>

              {/* Urgency badge */}
              <div className="absolute bottom-4 left-4 flex items-center gap-1.5 px-3 py-2 rounded-full bg-accent/90 text-accent-foreground text-xs font-bold backdrop-blur-sm">
                <Flame size={14} />
                Offre limitée
              </div>
            </div>

            {/* Info side */}
            <div className="p-6 md:p-8 flex flex-col justify-center space-y-6">
              {/* Title & rating */}
              <div>
                <h2 className="text-xl md:text-2xl font-bold text-foreground leading-tight">{product.title}</h2>
                <div className="flex items-center gap-3 mt-3">
                  <div className="flex items-center gap-0.5">
                    {[1, 2, 3, 4, 5].map((s) => (
                      <Star key={s} className="w-4 h-4 fill-primary text-primary" />
                    ))}
                  </div>
                  <span className="text-sm text-muted-foreground">4.9/5 · +2000 clients</span>
                </div>
              </div>

              {/* Price */}
              <div className="flex items-baseline gap-3">
                <span className="text-4xl font-extrabold text-accent">{product.price}</span>
                {product.oldPrice && (
                  <span className="text-lg text-muted-foreground line-through">{product.oldPrice}</span>
                )}
              </div>

              {/* Description preview */}
              {product.description && (
                <p className="text-sm text-muted-foreground leading-relaxed line-clamp-3">
                  {product.description}
                </p>
              )}

              {/* Trust badges */}
              <div className="grid grid-cols-1 gap-2">
                {[
                  { icon: ShieldCheck, text: "Paiement 100% sécurisé" },
                  { icon: Clock, text: "Accès immédiat après achat" },
                  { icon: Users, text: "Satisfait ou remboursé" },
                ].map(({ icon: Icon, text }) => (
                  <div key={text} className="flex items-center gap-2.5 text-sm text-muted-foreground">
                    <Icon size={16} className="text-accent shrink-0" />
                    <span>{text}</span>
                  </div>
                ))}
              </div>

              {/* CTAs */}
              <div className="flex flex-col gap-3 pt-2">
                <button
                  onClick={handleBuyNow}
                  className="btn-primary-brand flex items-center justify-center gap-2.5 w-full py-4 rounded-2xl font-bold text-base shadow-glow hover:scale-[1.02] active:scale-[0.98] transition-transform"
                >
                  <Zap size={22} />
                  Acheter maintenant
                </button>
                <button
                  onClick={handleAddToCart}
                  className="flex items-center justify-center gap-2.5 w-full py-4 rounded-2xl font-semibold text-sm border border-border bg-secondary text-foreground hover:bg-muted transition-all duration-300"
                >
                  <ShoppingCart size={18} />
                  Ajouter au panier
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BuyPopup;

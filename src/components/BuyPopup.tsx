import { ShoppingCart, Zap, X, Clock, Star, ShieldCheck, Users, Flame } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useCart } from "@/contexts/CartContext";
import { toast } from "@/hooks/use-toast";
import type { Product } from "@/data/products";
import { useState, useEffect } from "react";
import { createPortal } from "react-dom";

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
        setViewerCount((prev) => Math.max(10, prev + Math.floor(Math.random() * 3) - 1));
      }, 4000);
      document.body.style.overflow = "hidden";
      return () => {
        clearInterval(interval);
        document.body.style.overflow = "";
      };
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

  return createPortal(
    <div
      className="fixed inset-0 z-[200] flex items-center justify-center p-4"
      onClick={onClose}
      style={{ animation: "popup-backdrop 0.3s ease-out forwards" }}
    >
      {/* Backdrop with blur */}
      <div className="absolute inset-0 bg-background/90 backdrop-blur-md" />

      {/* Content card */}
      <div
        className="relative w-full max-w-lg bg-card rounded-2xl sm:rounded-3xl overflow-hidden border border-border shadow-2xl flex flex-col max-h-[90vh]"
        onClick={(e) => e.stopPropagation()}
        style={{ animation: "popup-zoom-in 0.4s cubic-bezier(0.16, 1, 0.3, 1) forwards" }}
      >
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-3 right-3 z-20 w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-background/80 backdrop-blur flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors"
        >
          <X size={18} />
        </button>

        {/* Scrollable inner */}
        <div className="flex-1 overflow-y-auto">
          {/* Image */}
          <div className="relative w-full aspect-[16/9] bg-muted overflow-hidden">
            <img
              src={product.image}
              alt={product.title}
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-card via-transparent to-transparent" />

            {/* Live viewers badge */}
            <div className="absolute top-3 left-3 flex items-center gap-1.5 px-2.5 py-1.5 rounded-full bg-destructive/90 text-destructive-foreground text-[10px] sm:text-xs font-bold backdrop-blur-sm">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-destructive-foreground opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-destructive-foreground" />
              </span>
              {viewerCount} personnes regardent
            </div>

            {/* Urgency badge */}
            <div className="absolute bottom-3 left-3 flex items-center gap-1.5 px-2.5 py-1.5 rounded-full bg-accent/90 text-accent-foreground text-[10px] sm:text-xs font-bold backdrop-blur-sm">
              <Flame size={12} />
              Offre limitée
            </div>
          </div>

          {/* Info */}
          <div className="p-5 sm:p-6 space-y-4">
            {/* Title & rating */}
            <div>
              <h2 className="text-lg sm:text-xl font-bold text-foreground leading-tight">{product.title}</h2>
              <div className="flex items-center gap-2 mt-2">
                <div className="flex items-center gap-0.5">
                  {[1, 2, 3, 4, 5].map((s) => (
                    <Star key={s} className="w-3.5 h-3.5 fill-primary text-primary" />
                  ))}
                </div>
                <span className="text-xs text-muted-foreground">4.9/5 · +2000 clients</span>
              </div>
            </div>

            {/* Price */}
            <div className="flex items-baseline gap-3">
              <span className="text-3xl sm:text-4xl font-extrabold text-accent">{product.price}</span>
              {product.oldPrice && (
                <span className="text-base text-muted-foreground line-through">{product.oldPrice}</span>
              )}
            </div>

            {/* Description */}
            {product.description && (
              <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed line-clamp-2">
                {product.description}
              </p>
            )}

            {/* Trust badges */}
            <div className="flex flex-col gap-1.5">
              {[
                { icon: ShieldCheck, text: "Paiement 100% sécurisé" },
                { icon: Clock, text: "Accès immédiat après achat" },
                { icon: Users, text: "Satisfait ou remboursé" },
              ].map(({ icon: Icon, text }) => (
                <div key={text} className="flex items-center gap-2 text-xs text-muted-foreground">
                  <Icon size={14} className="text-accent shrink-0" />
                  <span>{text}</span>
                </div>
              ))}
            </div>

            {/* CTAs */}
            <div className="flex flex-col gap-2.5 pt-1">
              <button
                onClick={handleBuyNow}
                className="btn-primary-brand flex items-center justify-center gap-2 w-full py-3.5 rounded-xl font-bold text-sm shadow-glow hover:scale-[1.02] active:scale-[0.98] transition-transform"
              >
                <Zap size={18} />
                Acheter maintenant
              </button>
              <button
                onClick={handleAddToCart}
                className="flex items-center justify-center gap-2 w-full py-3.5 rounded-xl font-semibold text-sm border border-border bg-secondary text-foreground hover:bg-muted transition-all"
              >
                <ShoppingCart size={16} />
                Ajouter au panier
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
};

export default BuyPopup;

import { ShoppingCart, Zap, X, Clock, Star, ShieldCheck } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useCart } from "@/contexts/CartContext";
import { toast } from "@/hooks/use-toast";
import type { Product } from "@/data/products";

interface Props {
  product: Product;
  open: boolean;
  onClose: () => void;
}

const BuyPopup = ({ product, open, onClose }: Props) => {
  const { addToCart } = useCart();
  const navigate = useNavigate();

  if (!open) return null;

  const handleAddToCart = () => {
    addToCart(product);
    toast({ title: "Ajouté au panier 🛒", description: product.title });
    onClose();
  };

  const handleBuyNow = () => {
    addToCart(product);
    onClose();
    navigate("/checkout");
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4" onClick={onClose}>
      {/* Backdrop */}
      <div className="absolute inset-0 bg-background/95 backdrop-blur-md" />

      {/* Content */}
      <div
        className="relative w-full max-w-md bg-card border border-border rounded-3xl overflow-hidden shadow-2xl"
        onClick={(e) => e.stopPropagation()}
        style={{ animation: "popup-enter 0.4s cubic-bezier(0.16, 1, 0.3, 1)" }}
      >
        {/* Close */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-10 w-10 h-10 rounded-full bg-background/80 backdrop-blur flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors"
        >
          <X size={20} />
        </button>

        {/* Product image */}
        <div className="relative w-full aspect-[4/3] bg-muted overflow-hidden">
          <img
            src={product.image}
            alt={product.title}
            className="w-full h-full object-cover"
          />
          {/* Urgency badge */}
          <div className="absolute bottom-3 left-3 flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-accent/90 text-accent-foreground text-xs font-bold backdrop-blur-sm">
            <Clock size={12} />
            Offre limitée
          </div>
        </div>

        {/* Info */}
        <div className="p-6 space-y-5">
          <div>
            <h2 className="text-lg font-bold text-foreground leading-tight">{product.title}</h2>
            <div className="flex items-center gap-3 mt-2">
              <div className="flex items-center gap-1">
                {[1, 2, 3, 4, 5].map((s) => (
                  <Star key={s} className="w-3.5 h-3.5 fill-primary text-primary" />
                ))}
              </div>
              <span className="text-xs text-muted-foreground">4.9/5</span>
            </div>
          </div>

          {/* Price */}
          <div className="flex items-baseline gap-3">
            <span className="text-3xl font-extrabold text-accent">{product.price}</span>
            {product.oldPrice && (
              <span className="text-lg text-muted-foreground line-through">{product.oldPrice}</span>
            )}
          </div>

          {/* Trust */}
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <ShieldCheck size={14} className="text-accent shrink-0" />
            <span>Accès immédiat · Paiement sécurisé · Satisfait ou remboursé</span>
          </div>

          {/* CTAs */}
          <div className="flex flex-col gap-3">
            <button
              onClick={handleBuyNow}
              className="btn-primary-brand flex items-center justify-center gap-2 w-full py-4 rounded-2xl font-bold text-base shadow-glow"
            >
              <Zap size={20} />
              Acheter maintenant
            </button>
            <button
              onClick={handleAddToCart}
              className="flex items-center justify-center gap-2 w-full py-4 rounded-2xl font-semibold text-sm border border-border bg-secondary text-foreground hover:bg-muted transition-colors duration-300"
            >
              <ShoppingCart size={18} />
              Ajouter au panier
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BuyPopup;

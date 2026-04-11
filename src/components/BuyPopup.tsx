import { ShoppingCart, Zap, X, Clock } from "lucide-react";
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
    navigate("/panier");
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-end sm:items-center justify-center" onClick={onClose}>
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
      <div
        className="relative w-full sm:w-auto sm:min-w-[360px] bg-card border border-border rounded-t-2xl sm:rounded-2xl p-6 pb-[calc(1.5rem+env(safe-area-inset-bottom))] sm:pb-6 shadow-glow"
        onClick={(e) => e.stopPropagation()}
        style={{ animation: "slide-up 0.35s cubic-bezier(0.16, 1, 0.3, 1)" }}
      >
        <button onClick={onClose} className="absolute top-4 right-4 text-muted-foreground hover:text-foreground transition-colors">
          <X size={20} />
        </button>

        {/* Urgency banner */}
        <div className="flex items-center gap-2 mb-4 px-3 py-2 rounded-lg bg-accent/10 border border-accent/20">
          <Clock size={14} className="text-accent shrink-0" />
          <span className="text-xs font-medium text-accent">Offre valable aujourd'hui uniquement !</span>
        </div>

        <div className="flex items-center gap-4 mb-6">
          <img src={product.image} alt={product.title} className="w-16 h-16 rounded-lg object-cover border border-border" />
          <div className="min-w-0 flex-1">
            <p className="text-sm font-semibold text-foreground truncate">{product.title}</p>
            <div className="flex items-center gap-2 mt-1">
              {product.oldPrice && <span className="text-xs text-muted-foreground line-through">{product.oldPrice}</span>}
              <span className="text-accent font-bold">{product.price}</span>
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-3">
          <button
            onClick={handleAddToCart}
            className="flex items-center justify-center gap-2 w-full py-3.5 rounded-xl font-semibold text-sm border border-border bg-secondary text-foreground hover:bg-muted transition-colors duration-300"
          >
            <ShoppingCart size={18} />
            Ajouter au panier
          </button>
          <button
            onClick={handleBuyNow}
            className="btn-primary-brand flex items-center justify-center gap-2 w-full py-3.5 rounded-xl font-bold text-sm shadow-glow"
          >
            <Zap size={18} />
            Acheter maintenant
          </button>
        </div>
      </div>
    </div>
  );
};

export default BuyPopup;

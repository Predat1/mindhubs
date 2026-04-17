import { ShoppingCart, Zap, X, ShieldCheck, Clock, Users } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useCart } from "@/contexts/CartContext";
import { toast } from "@/hooks/use-toast";
import type { Product } from "@/data/products";
import { trackProductPurchase } from "@/hooks/useProductTracking";
import { useState, useEffect, useCallback } from "react";
import { createPortal } from "react-dom";

interface Props {
  product: Product;
  open: boolean;
  onClose: () => void;
}

/* ---------- lightweight confetti ---------- */
function launchConfetti() {
  const canvas = document.createElement("canvas");
  canvas.style.cssText = "position:fixed;inset:0;z-index:9999;pointer-events:none;";
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
  document.body.appendChild(canvas);
  const ctx = canvas.getContext("2d")!;
  const colors = ["#D4A843", "#E8C547", "#FF6B6B", "#4ECDC4", "#45B7D1", "#FFA07A", "#98D8C8"];
  const pieces = Array.from({ length: 80 }, () => ({
    x: canvas.width / 2 + (Math.random() - 0.5) * 200,
    y: canvas.height / 2,
    vx: (Math.random() - 0.5) * 16,
    vy: -Math.random() * 18 - 4,
    w: Math.random() * 8 + 4,
    h: Math.random() * 6 + 2,
    color: colors[Math.floor(Math.random() * colors.length)],
    rot: Math.random() * 360,
    rv: (Math.random() - 0.5) * 12,
    opacity: 1,
  }));
  let frame = 0;
  const maxFrames = 90;
  function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    pieces.forEach((p) => {
      p.x += p.vx;
      p.vy += 0.5;
      p.y += p.vy;
      p.rot += p.rv;
      p.opacity = Math.max(0, 1 - frame / maxFrames);
      ctx.save();
      ctx.translate(p.x, p.y);
      ctx.rotate((p.rot * Math.PI) / 180);
      ctx.globalAlpha = p.opacity;
      ctx.fillStyle = p.color;
      ctx.fillRect(-p.w / 2, -p.h / 2, p.w, p.h);
      ctx.restore();
    });
    frame++;
    if (frame < maxFrames) requestAnimationFrame(draw);
    else canvas.remove();
  }
  requestAnimationFrame(draw);
}

const BuyPopup = ({ product, open, onClose }: Props) => {
  const { addToCart } = useCart();
  const navigate = useNavigate();
  const [viewerCount, setViewerCount] = useState(0);

  useEffect(() => {
    if (open) {
      setViewerCount(Math.floor(Math.random() * 20) + 12);
      const interval = setInterval(() => {
        setViewerCount((prev) => Math.max(8, prev + Math.floor(Math.random() * 3) - 1));
      }, 4000);
      document.body.style.overflow = "hidden";
      return () => {
        clearInterval(interval);
        document.body.style.overflow = "";
      };
    }
  }, [open]);

  const handleAddToCart = useCallback(() => {
    addToCart(product);
    toast({ title: "Ajouté au panier 🛒", description: product.title });
    onClose();
  }, [addToCart, product, onClose]);

  const handleBuyNow = useCallback(() => {
    launchConfetti();
    addToCart(product);
    trackProductPurchase(product.id);
    setTimeout(() => {
      onClose();
      if (product.paymentLink) {
        window.open(product.paymentLink, "_blank", "noopener,noreferrer");
      } else {
        navigate("/checkout");
      }
    }, 600);
  }, [addToCart, product, onClose, navigate]);

  if (!open) return null;

  return createPortal(
    <div
      className="fixed inset-0 z-[200] flex items-center justify-center px-4"
      onClick={onClose}
      style={{ animation: "popup-backdrop 0.25s ease-out forwards" }}
    >
      {/* Backdrop */}
      <div className="absolute inset-0 bg-background/95 backdrop-blur-md" />

      {/* Card — compact & minimal */}
      <div
        className="relative w-full max-w-sm bg-card rounded-2xl overflow-hidden border border-border/50 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
        style={{ animation: "popup-zoom-in 0.35s cubic-bezier(0.16, 1, 0.3, 1) forwards" }}
      >
        {/* Close */}
        <button
          onClick={onClose}
          className="absolute top-2.5 right-2.5 z-20 w-7 h-7 rounded-full bg-background/60 backdrop-blur flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors"
        >
          <X size={14} />
        </button>

        {/* Image — compact */}
        <div className="relative w-full aspect-[2/1] bg-muted overflow-hidden">
          <img src={product.image} alt={product.title} className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-card via-card/20 to-transparent" />

          {/* Live badge */}
          <div className="absolute top-2.5 left-2.5 flex items-center gap-1 px-2 py-1 rounded-full bg-destructive/90 text-destructive-foreground text-[9px] font-bold backdrop-blur-sm">
            <span className="relative flex h-1.5 w-1.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-destructive-foreground opacity-75" />
              <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-destructive-foreground" />
            </span>
            {viewerCount} regardent
          </div>
        </div>

        {/* Content */}
        <div className="p-4 space-y-3">
          <h2 className="text-sm font-bold text-foreground leading-snug line-clamp-2">{product.title}</h2>

          {/* Price row */}
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-extrabold text-accent">{product.price}</span>
            {product.oldPrice && (
              <span className="text-xs text-muted-foreground line-through">{product.oldPrice}</span>
            )}
          </div>

          {/* Mini trust */}
          <div className="flex items-center gap-3 text-[10px] text-muted-foreground">
            <span className="flex items-center gap-1"><ShieldCheck size={11} className="text-accent" /> Sécurisé</span>
            <span className="flex items-center gap-1"><Clock size={11} className="text-accent" /> Accès immédiat</span>
            <span className="flex items-center gap-1"><Users size={11} className="text-accent" /> Garanti</span>
          </div>

          {/* CTAs */}
          <div className="flex flex-col gap-2">
            <button
              onClick={handleBuyNow}
              className="btn-primary-brand flex items-center justify-center gap-2 w-full py-3 rounded-xl font-bold text-sm shadow-glow hover:scale-[1.02] active:scale-[0.98] transition-transform"
            >
              <Zap size={16} />
              Acheter maintenant
            </button>
            <button
              onClick={handleAddToCart}
              className="flex items-center justify-center gap-2 w-full py-2.5 rounded-xl font-medium text-xs border border-border text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-all"
            >
              <ShoppingCart size={14} />
              Ajouter au panier
            </button>
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
};

export default BuyPopup;

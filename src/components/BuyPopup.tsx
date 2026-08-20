import { ShoppingCart, X, ShieldCheck, Clock, Package, Truck } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useCart } from "@/contexts/CartContext";
import { toast } from "@/hooks/use-toast";
import type { Product } from "@/data/products";
import { trackProductPurchase, trackProductClick, trackAddToCart } from "@/hooks/useProductTracking";
import { useCallback, useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { StatefulButton, type StatefulButtonState } from "@/components/motion/stateful-button";
import { EASE_DRAWER, EASE_OUT } from "@/lib/ease";
import { useAuth } from "@/contexts/AuthContext";
import { claimFreeProduct } from "@/lib/productAccess";

interface Props {
  product: Product;
  sourceChannel?: "marketplace" | "storefront" | "direct";
  open: boolean;
  onClose: () => void;
}

const BuyPopup = ({ product, sourceChannel = "direct", open, onClose }: Props) => {
  const { addToCart } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();
  const isPhysical = product.productMode === "physical";
  const isHybrid = product.productMode === "hybrid";
  const isExternal = Boolean(product.paymentLink && !product.vendorId);
  const isFree = product.pricingMode === "free" || product.priceAmount === 0;
  const reduce = useReducedMotion();
  const [actionState, setActionState] = useState<StatefulButtonState>("idle");

  useEffect(() => {
    if (open) setActionState("idle");
  }, [open]);

  const handleAddToCart = useCallback(() => {
    addToCart(product);
    trackAddToCart(product.id);
    toast({ title: "Ajouté au panier", description: product.title });
    setActionState("success");
    window.setTimeout(onClose, 240);
  }, [addToCart, product, onClose]);

  const handleBuyNow = useCallback(() => {
    if (isFree) {
      if (!user) {
        onClose();
        navigate(`/mon-compte?redirect=${encodeURIComponent(`/produit/${product.id}`)}`);
        return;
      }
      setActionState("loading");
      claimFreeProduct(product.id)
        .then(() => {
          setActionState("success");
          toast({ title: "Accès accordé", description: "Le produit a été ajouté à votre bibliothèque." });
          window.setTimeout(onClose, 500);
        })
        .catch((error: unknown) => {
          setActionState("error");
          toast({ title: "Accès impossible", description: (error as Error).message || "Réessayez dans un instant.", variant: "destructive" });
        });
      return;
    }
    trackProductClick(product.id);
    addToCart(product);
    trackAddToCart(product.id);
    sessionStorage.setItem("mindhubs:last-source", sourceChannel);
    setActionState("success");
    setTimeout(() => {
      onClose();
      if (isExternal) {
        window.open(product.paymentLink, "_blank", "noopener,noreferrer");
      } else {
        navigate("/checkout");
      }
    }, 600);
  }, [addToCart, product, onClose, navigate, isExternal, sourceChannel, isFree, user]);

  return createPortal(
    <AnimatePresence>
      {open ? <motion.div
        className="fixed inset-0 z-[200] flex items-center justify-center px-4"
        onClick={onClose}
        initial={reduce ? false : { opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: reduce ? 0.01 : 0.2, ease: EASE_OUT }}
        role="presentation"
      >
      <div className="absolute inset-0 bg-background/80" />

      <motion.div
        className="relative w-full max-w-sm overflow-hidden rounded-xl border border-border bg-card shadow-2xl"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby="buy-popup-title"
        initial={reduce ? false : { opacity: 0, y: 12, scale: 0.98, filter: "blur(4px)" }}
        animate={{ opacity: 1, y: 0, scale: 1, filter: "blur(0px)" }}
        exit={reduce ? { opacity: 0 } : { opacity: 0, y: 8, scale: 0.98, filter: "blur(4px)" }}
        transition={reduce ? { duration: 0.01 } : { duration: 0.28, ease: EASE_DRAWER }}
      >
        {/* Close */}
        <button
          onClick={onClose}
          className="absolute right-3 top-3 z-20 grid size-8 place-items-center rounded-lg border border-border bg-background/80 text-muted-foreground transition-colors hover:text-foreground"
          aria-label="Fermer"
        >
          <X size={14} aria-hidden="true" />
        </button>

        {/* Image — compact */}
        <div className="relative w-full aspect-[2/1] bg-muted overflow-hidden">
          <img src={product.image} alt={product.title} className="w-full h-full object-cover" />
          <div className="absolute left-3 top-3 flex items-center gap-1.5 rounded-md border border-border bg-background/90 px-2 py-1 text-[9px] font-medium text-foreground">
            {isPhysical || isHybrid ? <Truck size={11} className="text-primary" /> : <Package size={11} className="text-primary" />}
            {isPhysical ? "Produit physique" : isHybrid ? "Produit hybride" : "Produit digital"}
          </div>
        </div>

        {/* Content */}
        <div className="p-4 space-y-3">
          <h2 id="buy-popup-title" className="line-clamp-2 text-sm font-semibold leading-snug text-foreground">{product.title}</h2>

          {/* Price row */}
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-semibold text-foreground">{isFree ? "Gratuit" : product.price}</span>
            {!isFree && product.oldPrice && (
              <span className="text-xs text-muted-foreground line-through">{product.oldPrice}</span>
            )}
          </div>

          {/* Mini trust */}
          <div className="flex items-center gap-3 text-[10px] text-muted-foreground">
            <span className="flex items-center gap-1"><ShieldCheck size={11} /> {isFree ? "Accès sécurisé" : "Paiement sécurisé"}</span>
            <span className="flex items-center gap-1"><Clock size={11} /> {isFree ? "Accès immédiat" : isPhysical || isHybrid ? "Livraison suivie" : "Accès après paiement"}</span>
          </div>

          {/* CTAs */}
          <div className="flex flex-col gap-2">
            <StatefulButton
              onClick={handleBuyNow}
              state={actionState}
              className="w-full"
            >
              {isFree ? "Obtenir gratuitement" : isExternal ? "Payer sur le site partenaire" : "Continuer vers le paiement"}
            </StatefulButton>
            {!isFree && <button
              onClick={handleAddToCart}
              className="flex w-full items-center justify-center gap-2 rounded-lg border border-border py-2.5 text-xs font-medium text-muted-foreground transition-colors hover:bg-muted/50 hover:text-foreground"
            >
              <ShoppingCart size={14} />
              Ajouter au panier
            </button>}
          </div>
        </div>
      </motion.div>
      </motion.div> : null}
    </AnimatePresence>,
    document.body
  );
};

export default BuyPopup;

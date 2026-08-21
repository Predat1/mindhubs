import { useState } from "react";
import { Link } from "react-router-dom";
import type { Product } from "@/data/products";
import { ArrowUpRight, BadgeCheck, ExternalLink, ImageOff, Package, ShoppingBag, Store, Truck } from "lucide-react";
import BuyPopup from "@/components/BuyPopup";
import { usePrefetchProduct } from "@/hooks/useProducts";
import { motion, useReducedMotion } from "motion/react";
import { Badge } from "@/components/ui/badge";
import { formatCurrency, parseCurrency } from "@/lib/currency";
import { trackProductClick } from "@/hooks/useProductTracking";
import MindHubsMark from "@/components/brand/MindHubsMark";

type ProductCardProps = {
  product: Product;
  sourceChannel?: "marketplace" | "storefront" | "direct";
  showQuickBuy?: boolean;
};

const StarRating = ({ rating }: { rating: number }) => (
  <div className="flex items-center gap-1" aria-label={`Note ${rating} sur 5`}>
    <span className="text-xs tracking-tight text-primary" aria-hidden="true">★★★★★</span>
    <span className="text-[10px] font-medium text-muted-foreground">{rating.toFixed(1)}</span>
  </div>
);

const ProductCard = ({ product, sourceChannel = "marketplace", showQuickBuy = true }: ProductCardProps) => {
  const [popupOpen, setPopupOpen] = useState(false);
  const [imageFailed, setImageFailed] = useState(false);
  const vendor = product.vendor;
  const prefetch = usePrefetchProduct();
  const reduce = useReducedMotion();
  const productMode = product.productMode || "digital";
  // A saved external payment link is the source of truth for legacy and new
  // vendor products. It must bypass the MindHubs cart, even when no optional
  // checkout_mode column exists in the database yet.
  const isExternalCheckout = Boolean(product.paymentLink);
  const isOutOfStock = (productMode === "physical" || productMode === "hybrid") && product.inventoryQuantity === 0;
  const isFree = product.pricingMode === "free" || product.priceAmount === 0;
  const hasDiscount = parseCurrency(product.oldPrice) > parseCurrency(product.price);
  const detailHref = `/produit/${product.id}?source=${sourceChannel}`;
  const vendorHref = vendor?.username ? `/store/${encodeURIComponent(vendor.username)}` : null;

  const handleBuy = () => {
    if (isOutOfStock) return;
    trackProductClick(product.id);
    if (isExternalCheckout && product.paymentLink) {
      sessionStorage.setItem("mindhubs:last-source", sourceChannel);
      window.location.assign(product.paymentLink);
      return;
    }
    setPopupOpen(true);
  };

  const handleExternalCheckout = () => {
    if (!product.paymentLink) return;
    trackProductClick(product.id);
    sessionStorage.setItem("mindhubs:last-source", sourceChannel);
  };

  const handleDetailClick = () => {
    sessionStorage.setItem("mindhubs:last-source", sourceChannel);
  };

  const sellerContent = (
    <>
      <span className="grid size-7 shrink-0 place-items-center overflow-hidden rounded-lg border border-border bg-muted">
        {vendor?.avatar_url ? (
          <img src={vendor.avatar_url} alt="" className="size-full object-cover" loading="lazy" />
        ) : vendor ? (
          <Store size={13} aria-hidden="true" />
        ) : (
          <MindHubsMark size={17} decorative />
        )}
      </span>
      <span className="truncate text-xs font-medium text-muted-foreground group-hover:text-foreground">
        {vendor?.shop_name || "MindHubs"}
      </span>
      {vendor?.verified ? <BadgeCheck size={13} className="shrink-0 text-primary" aria-label="Vendeur vérifié" /> : null}
    </>
  );

  return (
    <>
      <motion.article
        whileHover={reduce ? undefined : { y: -3 }}
        transition={{ duration: reduce ? 0.01 : 0.2, ease: [0.16, 1, 0.3, 1] }}
        onMouseEnter={() => prefetch(product.id)}
        className="h-full will-change-transform"
      >
        <div className="glass-card-hover flex h-full flex-col overflow-hidden rounded-xl border border-border bg-card">
          <Link
            to={detailHref}
            onClick={handleDetailClick}
            className="group block focus-visible:outline-none"
            aria-label={`Voir le produit ${product.title}`}
          >
            <div className="relative aspect-[4/3] overflow-hidden bg-muted">
              {imageFailed ? (
                <div className="grid size-full place-items-center text-muted-foreground" role="img" aria-label={`Image indisponible pour ${product.title}`}>
                  <ImageOff size={28} aria-hidden="true" />
                </div>
              ) : (
                <img
                  src={product.image}
                  alt={product.title}
                  loading="lazy"
                  decoding="async"
                  width={640}
                  height={480}
                  onError={() => setImageFailed(true)}
                  className="size-full object-cover transition-transform duration-200 ease-out group-hover:scale-[1.02]"
                />
              )}
            </div>
            <div className="space-y-2 p-4 pb-3">
              <div className="flex items-start justify-between gap-3">
                <h3 className="line-clamp-2 min-h-10 text-sm font-semibold leading-5 tracking-[-0.01em] text-foreground transition-colors group-hover:text-primary">
                  {product.title}
                </h3>
                <ArrowUpRight size={16} className="mt-0.5 shrink-0 text-muted-foreground transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-foreground" aria-hidden="true" />
              </div>
              {product.rating && product.rating > 0 ? <StarRating rating={product.rating} /> : null}
            </div>
          </Link>

          <div className="flex flex-1 flex-col gap-3 px-4 pb-4">
            {vendorHref ? (
              <Link
                to={vendorHref}
                className="group flex min-h-8 items-center gap-2 rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                aria-label={`Voir la boutique ${vendor?.shop_name}`}
              >
                {sellerContent}
              </Link>
            ) : (
              <div className="flex min-h-8 items-center gap-2" aria-label="Produit officiel MindHubs">
                {sellerContent}
              </div>
            )}

            <div className="flex flex-wrap items-center gap-1.5">
              <Badge variant="outline" className="gap-1 rounded-md px-2 py-1 text-[10px] font-medium">
                {productMode === "digital" ? <Package size={11} aria-hidden="true" /> : <Truck size={11} aria-hidden="true" />}
                {productMode === "digital" ? "Digital" : productMode === "physical" ? "Physique" : "Hybride"}
              </Badge>
              {(productMode === "physical" || productMode === "hybrid") && product.inventoryQuantity !== undefined ? (
                <span className={`text-[10px] font-medium ${isOutOfStock ? "text-destructive" : "text-muted-foreground"}`}>
                  {isOutOfStock ? "Rupture" : `${product.inventoryQuantity} disponible${product.inventoryQuantity > 1 ? "s" : ""}`}
                </span>
              ) : null}
            </div>

            <div className="mt-auto flex items-end justify-between gap-3 border-t border-border pt-3">
              <div className="min-w-0">
                {!isFree && hasDiscount ? <span className="block text-[10px] font-medium text-muted-foreground line-through">{formatCurrency(product.oldPrice)}</span> : null}
                <span className="block text-base font-bold text-foreground">{isFree ? "Gratuit" : formatCurrency(product.price)}</span>
              </div>

              {showQuickBuy ? (
                <button
                  type="button"
                  onClick={handleBuy}
                  disabled={isOutOfStock}
                  aria-label={isOutOfStock ? `${product.title} est en rupture de stock` : isExternalCheckout ? `Payer sur Chariow pour ${product.title}` : isFree ? `Obtenir gratuitement ${product.title}` : `Acheter ${product.title}`}
                  className="inline-flex min-h-10 shrink-0 items-center justify-center gap-2 rounded-lg bg-primary px-3 text-xs font-semibold text-primary-foreground transition-transform hover:scale-[1.02] active:scale-[0.98] disabled:cursor-not-allowed disabled:bg-muted disabled:text-muted-foreground"
                >
                  {isExternalCheckout ? <ExternalLink size={15} aria-hidden="true" /> : <ShoppingBag size={15} aria-hidden="true" />}
                  <span className="hidden sm:inline">{isExternalCheckout ? "Payer" : isFree ? "Obtenir" : "Acheter"}</span>
                </button>
              ) : isExternalCheckout && product.paymentLink ? (
                <a
                  href={product.paymentLink}
                  onClick={handleExternalCheckout}
                  target="_self"
                  rel="noopener noreferrer"
                  className="inline-flex min-h-10 shrink-0 items-center justify-center gap-1 rounded-lg bg-primary px-3 text-xs font-semibold text-primary-foreground transition-transform hover:scale-[1.02] active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                >
                  Payer
                  <ExternalLink size={14} aria-hidden="true" />
                </a>
              ) : (
                <Link
                  to={detailHref}
                  onClick={handleDetailClick}
                  className="inline-flex min-h-10 shrink-0 items-center justify-center gap-1 rounded-lg bg-primary px-3 text-xs font-semibold text-primary-foreground transition-transform hover:scale-[1.02] active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                >
                  Voir le produit
                  <ArrowUpRight size={14} aria-hidden="true" />
                </Link>
              )}
            </div>
          </div>
        </div>
      </motion.article>

      {showQuickBuy && !isExternalCheckout ? <BuyPopup product={product} sourceChannel={sourceChannel} open={popupOpen} onClose={() => setPopupOpen(false)} /> : null}
    </>
  );
};

export default ProductCard;

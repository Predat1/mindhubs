import { useEffect, useState } from "react";
import { ShoppingCart } from "lucide-react";

interface Props {
  productTitle: string;
  onBuy: () => void;
  price: string;
  oldPrice?: string;
  productType?: "file" | "course" | "service" | "coaching";
}

const StickyProductCTA = ({ productTitle, onBuy, price, oldPrice, productType }: Props) => {
  const [visible, setVisible] = useState(false);

  const priceNum = parseFloat(price.replace(/[^\d.,]/g, "").replace(",", ".")) || 0;
  const oldPriceNum = oldPrice ? parseFloat(oldPrice.replace(/[^\d.,]/g, "").replace(",", ".")) || 0 : 0;
  const discountPct = oldPriceNum > 0 ? Math.round(((oldPriceNum - priceNum) / oldPriceNum) * 100) : 0;

  useEffect(() => {
    let ticking = false;

    const onScroll = () => {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(() => {
        const y = window.scrollY;
        const nearBottom = y + window.innerHeight >= document.body.scrollHeight - 300;
        setVisible(y > 400 && !nearBottom);
        ticking = false;
      });
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <>
      {/* Mobile sticky CTA */}
      <div
        className="fixed bottom-0 left-0 right-0 z-50 md:hidden pointer-events-none"
        style={{
          opacity: visible ? 1 : 0,
          transform: visible ? "translateY(0)" : "translateY(100%)",
          transition: "opacity 0.4s cubic-bezier(0.16, 1, 0.3, 1), transform 0.4s cubic-bezier(0.16, 1, 0.3, 1)",
        }}
      >
        <div className="pointer-events-auto bg-background/80 backdrop-blur-xl border-t border-border px-4 py-3 pb-[calc(0.75rem+env(safe-area-inset-bottom))] flex items-center gap-3">
          <div className="flex-1 min-w-0">
            <p className="text-xs text-muted-foreground truncate">{productTitle}</p>
            <div className="flex items-center gap-2">
              <p className="text-accent font-bold text-sm">{price}</p>
              {discountPct > 0 && (
                <span className="text-[9px] font-bold text-destructive bg-destructive/10 px-1.5 py-0.5 rounded-full">-{discountPct}%</span>
              )}
            </div>
          </div>
          <button
            onClick={onBuy}
            className="btn-primary-brand flex items-center gap-2 px-5 py-3 rounded-xl font-bold text-xs shadow-glow whitespace-nowrap"
          >
            <ShoppingCart size={16} />
            {productType === 'course' ? 'ACCÉDER' : 
             productType === 'coaching' ? 'RÉSERVER' : 
             productType === 'service' ? 'COMMANDER' : 
             'ACHETER'}
          </button>
        </div>
      </div>

      {/* Desktop sticky sidebar CTA */}
      <div
        className="fixed right-6 top-1/2 -translate-y-1/2 z-50 hidden md:block pointer-events-none"
        style={{
          opacity: visible ? 1 : 0,
          transform: visible ? "translateX(0) translateY(-50%)" : "translateX(120%) translateY(-50%)",
          transition: "opacity 0.4s cubic-bezier(0.16, 1, 0.3, 1), transform 0.4s cubic-bezier(0.16, 1, 0.3, 1)",
        }}
      >
        <div className="pointer-events-auto bg-background/90 backdrop-blur-xl border border-border rounded-2xl p-4 shadow-xl space-y-3 w-52">
          <p className="text-xs text-muted-foreground truncate">{productTitle}</p>
          <div className="flex items-center gap-2">
            <span className="text-accent font-bold text-lg">{price}</span>
            {discountPct > 0 && (
              <span className="text-[10px] font-bold text-destructive bg-destructive/10 px-2 py-0.5 rounded-full">-{discountPct}%</span>
            )}
          </div>
          <button
            onClick={onBuy}
            className="btn-primary-brand flex items-center justify-center gap-2 w-full py-2.5 rounded-xl font-bold text-xs shadow-glow"
          >
            <ShoppingCart size={14} />
            {productType === 'course' ? 'ACCÉDER' : 
             productType === 'coaching' ? 'RÉSERVER' : 
             productType === 'service' ? 'COMMANDER' : 
             'ACHETER'}
          </button>
        </div>
      </div>
    </>
  );
};

export default StickyProductCTA;

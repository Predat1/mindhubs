import { useEffect, useState } from "react";
import { ShoppingCart } from "lucide-react";

interface Props {
  productTitle: string;
  onBuy: () => void;
  price: string;
}

const StickyProductCTA = ({ productTitle, onBuy, price }: Props) => {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    let ticking = false;

    const onScroll = () => {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(() => {
        const y = window.scrollY;
        // Show after scrolling past the product info (~400px)
        const nearBottom = y + window.innerHeight >= document.body.scrollHeight - 300;
        setVisible(y > 400 && !nearBottom);
        ticking = false;
      });
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
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
          <p className="text-accent font-bold text-sm">{price}</p>
        </div>
        <button
          onClick={onBuy}
          className="btn-primary-brand flex items-center gap-2 px-5 py-3 rounded-xl font-bold text-xs shadow-glow whitespace-nowrap"
        >
          <ShoppingCart size={16} />
          ACHETER
        </button>
      </div>
    </div>
  );
};

export default StickyProductCTA;

import { useEffect, useState } from "react";
import { ShoppingBag, ShoppingCart } from "lucide-react";
import { Link } from "react-router-dom";
import { useCart } from "@/contexts/CartContext";

const StickyMobileCTA = () => {
  const [visible, setVisible] = useState(false);
  const { totalItems } = useCart();

  useEffect(() => {
    let ticking = false;
    const onScroll = () => {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(() => {
        const y = window.scrollY;
        const heroHeight = window.innerHeight * 0.75;
        const nearBottom = y + window.innerHeight >= document.body.scrollHeight - 300;
        setVisible(y > heroHeight && !nearBottom);
        ticking = false;
      });
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const hasItems = totalItems > 0;

  return (
    <div
      className="fixed bottom-0 left-0 right-0 z-50 md:hidden pointer-events-none"
      style={{
        opacity: visible ? 1 : 0,
        transform: visible ? "translateY(0)" : "translateY(100%)",
        transition: "opacity 0.4s cubic-bezier(0.16, 1, 0.3, 1), transform 0.4s cubic-bezier(0.16, 1, 0.3, 1)",
      }}
    >
      <div className="pointer-events-auto bg-background/80 backdrop-blur-xl border-t border-border px-4 py-3 pb-[calc(0.75rem+env(safe-area-inset-bottom))]">
        <Link
          to={hasItems ? "/panier" : "/boutique"}
          className="btn-primary-brand flex items-center justify-center gap-2 w-full py-3.5 rounded-xl font-bold text-sm shadow-glow"
        >
          {hasItems ? (
            <>
              VOIR LE PANIER ({totalItems})
              <ShoppingCart size={18} />
            </>
          ) : (
            <>
              VOIR NOS FORMATIONS
              <ShoppingBag size={18} />
            </>
          )}
        </Link>
      </div>
    </div>
  );
};

export default StickyMobileCTA;

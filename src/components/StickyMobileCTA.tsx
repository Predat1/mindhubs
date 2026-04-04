import { useEffect, useState } from "react";
import { GraduationCap } from "lucide-react";

const StickyMobileCTA = () => {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    let lastY = 0;
    let ticking = false;

    const onScroll = () => {
      if (ticking) return;
      ticking = true;

      requestAnimationFrame(() => {
        const y = window.scrollY;
        const heroHeight = window.innerHeight * 0.75;

        // Show after hero, hide if back at top
        // Also hide near footer (last 300px)
        const nearBottom = y + window.innerHeight >= document.body.scrollHeight - 300;
        setVisible(y > heroHeight && !nearBottom);

        lastY = y;
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
      <div className="pointer-events-auto bg-background/80 backdrop-blur-xl border-t border-border px-4 py-3 pb-[calc(0.75rem+env(safe-area-inset-bottom))]">
        <a
          href="#formations"
          className="btn-primary-brand flex items-center justify-center gap-2 w-full py-3.5 rounded-xl font-bold text-sm shadow-glow"
        >
          VOIR NOS FORMATIONS
          <GraduationCap size={18} />
        </a>
      </div>
    </div>
  );
};

export default StickyMobileCTA;

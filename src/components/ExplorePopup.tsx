import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles, X, ArrowRight, Compass } from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";

export const ExplorePopup = () => {
  const [isVisible, setIsVisible] = useState(false);
  const location = useLocation();

  useEffect(() => {
    // List of pages where the popup should NOT appear
    const forbiddenPaths = ["/boutique", "/checkout", "/dashboard", "/mon-compte"];
    if (forbiddenPaths.includes(location.pathname)) return;

    const timer = setTimeout(() => {
      const shown = sessionStorage.getItem("explore_popup_shown");
      if (!shown) {
        setIsVisible(true);
      }
    }, 20000); // Show after 20 seconds of browsing to avoid saturation

    return () => clearTimeout(timer);
  }, [location.pathname]);

  const closePopup = () => {
    setIsVisible(false);
    sessionStorage.setItem("explore_popup_shown", "true");
  };

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, y: 50, x: 50, scale: 0.8 }}
          animate={{ opacity: 1, y: 0, x: 0, scale: 1 }}
          exit={{ opacity: 0, y: 20, scale: 0.8 }}
          className="fixed bottom-6 right-6 z-50 w-[280px] glass-card rounded-3xl p-5 border-primary/20 shadow-2xl overflow-hidden"
        >
          {/* Decorative element */}
          <div className="absolute top-0 right-0 p-3 opacity-10">
             <Compass size={60} className="text-primary rotate-12" />
          </div>

          <button
            onClick={closePopup}
            className="absolute top-3 right-3 text-muted-foreground hover:text-foreground transition-colors"
          >
            <X size={14} />
          </button>

          <div className="space-y-4 relative">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
                <Sparkles size={20} fill="currentColor" />
              </div>
              <p className="text-[10px] font-black uppercase tracking-widest text-primary">Curiosité</p>
            </div>

            <div className="space-y-1">
              <h3 className="text-sm font-black leading-tight">Besoin d'inspiration ?</h3>
              <p className="text-[11px] text-muted-foreground font-medium leading-relaxed">
                Explorez nos formations best-sellers et boostez votre carrière aujourd'hui.
              </p>
            </div>

            <Button
              asChild
              onClick={closePopup}
              className="w-full h-10 rounded-xl btn-glow font-black text-[11px] gap-2 uppercase tracking-wider"
            >
              <Link to="/boutique">
                Explorer la Boutique <ArrowRight size={14} />
              </Link>
            </Button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

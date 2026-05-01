import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, MessageCircle, Zap, Bell, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";

export const ExitIntentPopup = () => {
  const [isVisible, setIsVisible] = useState(false);
  const [hasShown, setHasShown] = useState(false);

  useEffect(() => {
    // Check if it has already been shown in this session
    const shown = sessionStorage.getItem("exit_popup_shown");
    if (shown) {
      setHasShown(true);
      return;
    }

    const handleMouseLeave = (e: MouseEvent) => {
      // Trigger when mouse moves out of the top of the window (exit intent)
      if (e.clientY <= 0 && !hasShown) {
        setIsVisible(true);
        setHasShown(true);
        sessionStorage.setItem("exit_popup_shown", "true");
      }
    };

    document.addEventListener("mouseleave", handleMouseLeave);
    return () => document.removeEventListener("mouseleave", handleMouseLeave);
  }, [hasShown]);

  const closePopup = () => setIsVisible(false);

  return (
    <AnimatePresence>
      {isVisible && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center px-4 bg-black/40 backdrop-blur-[2px]">
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 10 }}
            className="relative w-full max-w-[340px] glass-card rounded-[2.5rem] p-6 md:p-8 border-white/10 shadow-2xl overflow-hidden"
          >
            {/* Background Accent */}
            <div className="absolute -top-16 -right-16 w-32 h-32 bg-primary/20 rounded-full blur-3xl" />

            {/* Close Button */}
            <button
              onClick={closePopup}
              className="absolute top-4 right-4 text-muted-foreground hover:text-foreground transition-colors p-1"
            >
              <X size={18} />
            </button>

            <div className="space-y-4 relative">
              <div className="flex justify-center">
                <div className="h-14 w-14 bg-[#25D366] rounded-2xl flex items-center justify-center text-white shadow-lg shadow-[#25D366]/20 ring-4 ring-[#25D366]/10">
                  <MessageCircle size={28} fill="currentColor" />
                </div>
              </div>

              <div className="text-center space-y-1">
                <h2 className="text-xl font-black tracking-tight leading-tight">
                  Le Canal <span className="text-[#25D366] italic">WhatsApp</span>
                </h2>
                <p className="text-muted-foreground font-medium text-[11px] leading-relaxed">
                  Ressources gratuites & promos flash exclusives. Rejoignez l'élite !
                </p>
              </div>

              <div className="space-y-2 pt-1">
                <Button
                  asChild
                  className="w-full h-12 rounded-xl bg-[#25D366] hover:bg-[#128C7E] text-white font-black text-sm gap-2 shadow-lg shadow-[#25D366]/20 border-none group"
                >
                  <a
                    href="https://whatsapp.com/channel/0029Vb8GtqeHQbRwuxrlyb2P"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    Rejoindre <ArrowRight size={16} />
                  </a>
                </Button>
                
                <div className="flex items-center justify-center gap-3">
                   <div className="flex items-center gap-1 text-[9px] font-bold text-muted-foreground uppercase tracking-widest">
                      <Bell size={10} className="text-[#25D366]" /> +2.5k membres
                   </div>
                   <div className="flex items-center gap-1 text-[9px] font-bold text-muted-foreground uppercase tracking-widest">
                      <Zap size={10} className="text-amber-500" /> Gratuit
                   </div>
                </div>

                <button
                  onClick={closePopup}
                  className="w-full text-[9px] font-black text-muted-foreground hover:text-foreground uppercase tracking-widest transition-colors"
                >
                  Fermer
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

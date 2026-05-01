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
        <div className="fixed inset-0 z-[100] flex items-center justify-center px-4 bg-black/60 backdrop-blur-sm">
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="relative w-full max-w-md glass-card rounded-[3rem] p-8 md:p-10 border-white/10 shadow-2xl overflow-hidden"
          >
            {/* Background Accent */}
            <div className="absolute -top-24 -right-24 w-48 h-48 bg-primary/20 rounded-full blur-3xl" />
            <div className="absolute -bottom-24 -left-24 w-48 h-48 bg-[#25D366]/10 rounded-full blur-3xl" />

            {/* Close Button */}
            <button
              onClick={closePopup}
              className="absolute top-6 right-6 text-muted-foreground hover:text-foreground transition-colors p-2"
            >
              <X size={20} />
            </button>

            <div className="space-y-6 relative">
              <div className="flex justify-center">
                <div className="h-20 w-20 bg-[#25D366] rounded-[2rem] flex items-center justify-center text-white shadow-xl shadow-[#25D366]/20 ring-8 ring-[#25D366]/10">
                  <MessageCircle size={40} fill="currentColor" />
                </div>
              </div>

              <div className="text-center space-y-2">
                <div className="flex items-center justify-center gap-2 mb-2">
                   <Zap size={14} className="text-primary animate-pulse" />
                   <span className="text-[10px] font-black uppercase tracking-widest text-primary">Opportunité Exclusive</span>
                </div>
                <h2 className="text-3xl font-black tracking-tighter leading-tight">
                  Ne partez pas les mains <span className="text-[#25D366] italic">vides</span> !
                </h2>
                <p className="text-muted-foreground font-medium text-sm leading-relaxed">
                  Rejoignez notre canal **WhatsApp Elite** pour recevoir des ressources gratuites, des promos flash et des conseils business en avant-première.
                </p>
              </div>

              <div className="space-y-3 pt-2">
                <Button
                  asChild
                  className="w-full h-14 rounded-2xl bg-[#25D366] hover:bg-[#128C7E] text-white font-black text-lg gap-3 shadow-lg shadow-[#25D366]/20 border-none group"
                >
                  <a
                    href="https://whatsapp.com/channel/0029Vb8GtqeHQbRwuxrlyb2P"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    Rejoindre le Canal <ArrowRight size={20} className="transition-transform group-hover:translate-x-1" />
                  </a>
                </Button>
                
                <div className="flex items-center justify-center gap-4 py-2">
                   <div className="flex items-center gap-1.5 text-[10px] font-bold text-muted-foreground uppercase tracking-widest">
                      <Bell size={12} className="text-[#25D366]" /> +2,500 Membres
                   </div>
                   <div className="h-1 w-1 rounded-full bg-white/20" />
                   <div className="flex items-center gap-1.5 text-[10px] font-bold text-muted-foreground uppercase tracking-widest">
                      <Zap size={12} className="text-amber-500" /> 100% Gratuit
                   </div>
                </div>

                <button
                  onClick={closePopup}
                  className="w-full text-[10px] font-black text-muted-foreground hover:text-foreground uppercase tracking-widest transition-colors py-2"
                >
                  Non merci, je préfère rater les exclusivités
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

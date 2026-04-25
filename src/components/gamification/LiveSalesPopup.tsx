import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ShoppingCart, Zap, CheckCircle } from "lucide-react";

interface SaleEvent {
  id: string;
  user: string;
  product: string;
  time: string;
  location: string;
}

const MOCK_NAMES = ["Moussa", "Awa", "Fatou", "Jean", "Koffi", "Sarah", "Ibrahim", "Yasmine"];
const MOCK_PRODUCTS = ["Expert IA Business", "Kit Freelance Pro", "Masterclass E-commerce", "E-book Crypto Afrique"];
const MOCK_LOCATIONS = ["Dakar", "Abidjan", "Lomé", "Douala", "Bamako", "Libreville", "Conakry"];

export const LiveSalesPopup = () => {
  const [currentSale, setCurrentSale] = useState<SaleEvent | null>(null);

  useEffect(() => {
    const showRandomSale = () => {
      const sale: SaleEvent = {
        id: Math.random().toString(36).substring(7),
        user: MOCK_NAMES[Math.floor(Math.random() * MOCK_NAMES.length)],
        product: MOCK_PRODUCTS[Math.floor(Math.random() * MOCK_PRODUCTS.length)],
        location: MOCK_LOCATIONS[Math.floor(Math.random() * MOCK_LOCATIONS.length)],
        time: "il y a un instant"
      };
      
      setCurrentSale(sale);
      
      // Hide after 5 seconds
      setTimeout(() => setCurrentSale(null), 5000);
    };

    // Initial delay
    const timeout = setTimeout(showRandomSale, 3000);
    
    // Interval between sales (30s to 60s)
    const interval = setInterval(() => {
      showRandomSale();
    }, Math.random() * (60000 - 30000) + 30000);

    return () => {
      clearTimeout(timeout);
      clearInterval(interval);
    };
  }, []);

  return (
    <div className="fixed bottom-6 left-6 z-[200] pointer-events-none">
      <AnimatePresence>
        {currentSale && (
          <motion.div
            initial={{ opacity: 0, x: -50, scale: 0.9 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, x: -20, scale: 0.95 }}
            className="pointer-events-auto flex items-center gap-3 p-3 bg-card/80 backdrop-blur-xl border border-white/10 rounded-2xl shadow-2xl max-w-[280px]"
          >
            <div className="h-10 w-10 shrink-0 rounded-xl bg-primary/20 flex items-center justify-center text-primary">
               <Zap size={20} className="animate-pulse" />
            </div>
            <div className="min-w-0">
               <p className="text-[11px] font-black text-foreground truncate">
                  {currentSale.user} à <span className="text-primary">{currentSale.location}</span>
               </p>
               <p className="text-[10px] text-muted-foreground font-medium truncate">
                  Vient d'acheter : <span className="text-foreground italic">{currentSale.product}</span>
               </p>
               <div className="flex items-center gap-1.5 pt-0.5">
                  <CheckCircle size={8} className="text-emerald-500" />
                  <span className="text-[8px] font-black text-muted-foreground uppercase tracking-widest">{currentSale.time}</span>
               </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

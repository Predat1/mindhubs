import { useState } from "react";
import { Link } from "react-router-dom";
import type { Product } from "@/data/products";
import { Flame, Users, Store, BadgeCheck, Sparkles, ShoppingBag } from "lucide-react";
import BuyPopup from "@/components/BuyPopup";
import { useVendorById } from "@/hooks/useVendors";
import { motion } from "framer-motion";
import { Badge } from "@/components/ui/badge";

const BEST_SELLERS = ["formation-ia", "kit-business", "pack-digital"];

const StarRating = ({ rating }: { rating: number }) => (
  <div className="flex justify-center gap-0.5">
    {Array.from({ length: 5 }).map((_, i) => (
      <svg
        key={i}
        className={`w-3 h-3 sm:w-3.5 sm:h-3.5 ${i < Math.floor(rating) ? "text-primary fill-primary" : i < rating ? "text-primary fill-primary opacity-50" : "text-muted-foreground/30"}`}
        viewBox="0 0 20 20"
        fill="currentColor"
      >
        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
      </svg>
    ))}
  </div>
);

const ProductCard = ({ product }: { product: Product }) => {
  const [popupOpen, setPopupOpen] = useState(false);
  const isBestSeller = BEST_SELLERS.includes(product.id);
  const { data: vendor } = useVendorById(product.vendorId);

  const handleBuy = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setPopupOpen(true);
  };

  const handleVendorClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };

  return (
    <>
      <motion.div
        whileHover={{ y: -8 }}
        className="h-full"
      >
        <Link to={`/produit/${product.id}`} className="block group h-full">
          <div className="glass-card-hover rounded-[2rem] overflow-hidden h-full flex flex-col relative border-glass bg-card/40">
            
            {/* Image Container */}
            <div className="relative aspect-square overflow-hidden">
              {isBestSeller ? (
                <Badge className="absolute top-4 left-4 z-10 bg-primary/90 text-white border-none px-3 py-1 font-black text-[10px] tracking-widest gap-1.5 shadow-xl">
                   <Flame size={12} className="animate-pulse" /> TOP VENTE
                </Badge>
              ) : (
                <Badge className="absolute top-4 left-4 z-10 bg-emerald-500/90 text-white border-none px-3 py-1 font-black text-[10px] tracking-widest gap-1.5 shadow-xl">
                   <Sparkles size={12} /> NOUVEAU
                </Badge>
              )}
              
              <div className="absolute inset-0 bg-gradient-to-t from-background/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 z-[1]" />
              
              <img
                src={product.image}
                alt={product.title}
                loading="lazy"
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
              />
            </div>

            {/* Content Container */}
            <div className="p-5 flex flex-col flex-1 space-y-4">
              
              <div className="space-y-2">
                <h3 className="font-black text-foreground text-sm leading-tight line-clamp-2 group-hover:text-primary transition-colors">
                  {product.title}
                </h3>
                {product.rating && <StarRating rating={product.rating} />}
              </div>

              {vendor && (
                <div onClick={handleVendorClick} className="flex items-center gap-2">
                   <div className="h-6 w-6 rounded-lg bg-muted flex items-center justify-center border border-border overflow-hidden">
                      {vendor.avatar_url ? <img src={vendor.avatar_url} className="h-full w-full object-cover" /> : <Store size={12} />}
                   </div>
                   <span className="text-[10px] font-bold text-muted-foreground truncate hover:text-primary transition-colors">
                      {vendor.shop_name}
                   </span>
                   {vendor.verified && <BadgeCheck size={12} className="text-primary" />}
                </div>
              )}

              <div className="flex-1" />

              <div className="flex items-center justify-between pt-4 border-t border-glass">
                 <div className="flex flex-col">
                    <span className="text-[10px] text-muted-foreground line-through font-bold">{product.oldPrice}</span>
                    <span className="text-lg font-black text-foreground">{product.price}</span>
                 </div>
                 <button
                   onClick={handleBuy}
                   className="h-10 w-10 rounded-2xl bg-primary text-primary-foreground flex items-center justify-center shadow-lg shadow-primary/20 hover:scale-110 transition-transform active:scale-95"
                 >
                    <ShoppingBag size={18} />
                 </button>
              </div>

            </div>
          </div>
        </Link>
      </motion.div>

      <BuyPopup product={product} open={popupOpen} onClose={() => setPopupOpen(false)} />
    </>
  );
};

export default ProductCard;

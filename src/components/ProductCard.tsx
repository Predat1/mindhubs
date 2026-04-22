import { useState } from "react";
import { Link } from "react-router-dom";
import type { Product } from "@/data/products";
import { Flame, Users, Store, BadgeCheck } from "lucide-react";
import BuyPopup from "@/components/BuyPopup";
import { useVendorById } from "@/hooks/useVendors";

const BEST_SELLERS = ["formation-ia", "kit-business", "pack-digital"];

const StarRating = ({ rating }: { rating: number }) => (
  <div className="flex justify-center gap-0.5">
    {Array.from({ length: 5 }).map((_, i) => (
      <svg
        key={i}
        className={`w-3 h-3 sm:w-4 sm:h-4 ${i < Math.floor(rating) ? "text-accent fill-accent" : i < rating ? "text-accent fill-accent opacity-50" : "text-muted-foreground"}`}
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
      <Link to={`/produit/${product.id}`} className="block group">
        <div className="card-premium rounded-xl overflow-hidden h-full flex flex-col">
          <div className="relative overflow-hidden img-zoom-container">
            {isBestSeller ? (
              <span className="shimmer-badge absolute top-2 left-2 bg-accent/90 text-accent-foreground text-[9px] sm:text-[10px] font-bold px-2 sm:px-2.5 py-0.5 sm:py-1 rounded-full z-10 flex items-center gap-1">
                <Flame size={10} /> BEST-SELLER
              </span>
            ) : (
              <span className="absolute top-2 left-2 badge-purple text-[9px] sm:text-[10px] font-semibold px-2 py-0.5 rounded-full z-10">
                VENTE !
              </span>
            )}
            <img
              src={product.image}
              alt={product.title}
              loading="lazy"
              width={512}
              height={512}
              className="w-full h-36 sm:h-48 md:h-56 object-cover"
            />
          </div>
          <div className="p-3 sm:p-4 flex flex-col flex-1 items-center text-center space-y-2 sm:space-y-3">
            <h3 className="font-semibold text-foreground text-xs sm:text-sm leading-snug line-clamp-2 min-h-[2rem] sm:min-h-[2.5rem]">
              {product.title}
            </h3>
            {product.rating && <StarRating rating={product.rating} />}
            <div className="flex items-center justify-center gap-1 text-[10px] sm:text-[11px] text-muted-foreground">
              <Users size={10} />
              <span>{120 + Math.floor(product.title.length * 3)}+ acheteurs</span>
            </div>
            {vendor && (
              <Link
                to={`/store/${vendor.username}`}
                onClick={handleVendorClick}
                className="inline-flex items-center gap-1 text-[10px] text-muted-foreground hover:text-primary transition-colors"
              >
                <Store size={9} />
                <span className="truncate max-w-[120px]">{vendor.shop_name}</span>
                {vendor.verified && <BadgeCheck size={10} className="text-accent" />}
              </Link>
            )}
            <div className="flex items-center justify-center gap-2">
              <span className="text-muted-foreground line-through text-[10px] sm:text-xs">{product.oldPrice}</span>
              <span className="text-accent font-bold text-sm sm:text-base underline">{product.price}</span>
            </div>
            <button
              onClick={handleBuy}
              className="btn-primary-brand py-2 sm:py-2.5 px-4 sm:px-6 rounded-full font-semibold text-[10px] sm:text-xs tracking-wide hover-scale"
            >
              ACHETER MAINTENANT
            </button>
          </div>
        </div>
      </Link>

      <BuyPopup product={product} open={popupOpen} onClose={() => setPopupOpen(false)} />
    </>
  );
};

export default ProductCard;

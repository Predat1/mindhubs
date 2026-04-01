import { Link } from "react-router-dom";
import { useCart } from "@/contexts/CartContext";
import { toast } from "@/hooks/use-toast";
import type { Product } from "@/data/products";

const StarRating = ({ rating }: { rating: number }) => (
  <div className="flex justify-center gap-0.5">
    {Array.from({ length: 5 }).map((_, i) => (
      <svg
        key={i}
        className={`w-4 h-4 ${i < Math.floor(rating) ? "text-accent fill-accent" : i < rating ? "text-accent fill-accent opacity-50" : "text-muted-foreground"}`}
        viewBox="0 0 20 20"
        fill="currentColor"
      >
        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
      </svg>
    ))}
  </div>
);

const ProductCard = ({ product }: { product: Product }) => {
  const { addToCart } = useCart();

  const handleBuy = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    addToCart(product);
  };

  return (
    <Link to={`/produit/${product.id}`} className="block group">
      <div className="course-card rounded-xl overflow-hidden h-full flex flex-col">
        <div className="relative overflow-hidden">
          <span className="absolute top-2 left-2 badge-purple text-[10px] font-semibold px-2 py-0.5 rounded-full z-10">
            VENTE !
          </span>
          <img
            src={product.image}
            alt={product.title}
            loading="lazy"
            width={512}
            height={512}
            className="w-full h-48 md:h-56 object-cover transition-transform duration-500 group-hover:scale-110"
          />
        </div>
        <div className="p-4 flex flex-col flex-1 items-center text-center space-y-3">
          <h3 className="font-semibold text-foreground text-sm leading-snug line-clamp-2 min-h-[2.5rem]">
            {product.title}
          </h3>
          {product.rating && <StarRating rating={product.rating} />}
          <div className="flex items-center justify-center gap-2">
            <span className="text-muted-foreground line-through text-xs">{product.oldPrice}</span>
            <span className="text-accent font-bold text-base underline">{product.price}</span>
          </div>
          <button
            onClick={handleBuy}
            className="btn-primary-brand py-2.5 px-6 rounded-full font-semibold text-xs tracking-wide hover-scale"
          >
            ACHETER MAINTENANT
          </button>
        </div>
      </div>
    </Link>
  );
};

export default ProductCard;

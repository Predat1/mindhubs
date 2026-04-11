import { Link } from "react-router-dom";
import { useRecentlyViewed } from "@/hooks/useRecentlyViewed";
import { useProducts } from "@/hooks/useProducts";
import ProductCard from "@/components/ProductCard";
import AnimateOnScroll from "@/components/AnimateOnScroll";
import { Clock } from "lucide-react";

const RecentlyViewedSection = () => {
  const { viewedIds } = useRecentlyViewed();
  const { data: allProducts = [] } = useProducts();

  const recentProducts = viewedIds
    .map((id) => allProducts.find((p) => p.id === id))
    .filter(Boolean)
    .slice(0, 4);

  if (recentProducts.length === 0) return null;

  return (
    <section className="py-10 sm:py-14 bg-background">
      <div className="container mx-auto px-4">
        <AnimateOnScroll>
          <div className="flex items-center gap-2 mb-6 sm:mb-8">
            <Clock size={16} className="text-primary" />
            <h2 className="text-lg sm:text-xl font-bold text-foreground">
              Récemment consultés
            </h2>
          </div>
        </AnimateOnScroll>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 md:gap-5 max-w-5xl mx-auto">
          {recentProducts.map((product, i) => (
            <AnimateOnScroll key={product!.id} delay={i * 80}>
              <ProductCard product={product!} />
            </AnimateOnScroll>
          ))}
        </div>
      </div>
    </section>
  );
};

export default RecentlyViewedSection;

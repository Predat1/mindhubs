import { Link } from "react-router-dom";
import { ArrowRight, Flame } from "lucide-react";
import AnimateOnScroll from "@/components/AnimateOnScroll";
import ProductCard from "@/components/ProductCard";
import { useProducts } from "@/hooks/useProducts";
import { useMemo } from "react";

const PopularProductsSection = () => {
  const { data: products = [] } = useProducts();

  // Sort by rating (highest first), take top 4
  const popular = useMemo(() => {
    return [...products]
      .filter((p) => p.rating && p.rating >= 4.5)
      .sort((a, b) => (b.rating ?? 0) - (a.rating ?? 0))
      .slice(0, 4);
  }, [products]);

  if (popular.length === 0) return null;

  return (
    <section className="py-8 sm:py-14 bg-background">
      <div className="container mx-auto px-4">
        <AnimateOnScroll>
          <div className="text-center mb-6 sm:mb-10">
            <div className="inline-flex items-center gap-2 bg-accent/10 text-accent px-3 py-1 rounded-full text-[10px] sm:text-xs font-semibold mb-3">
              <Flame size={14} /> Les plus populaires
            </div>
            <h2 className="text-xl sm:text-2xl md:text-3xl font-extrabold text-foreground">
              Les plus achetés du moment
            </h2>
            <p className="text-xs sm:text-sm text-muted-foreground mt-2 max-w-md mx-auto">
              Rejoignez des centaines d'étudiants qui ont déjà transformé leur carrière.
            </p>
          </div>
        </AnimateOnScroll>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 md:gap-5 max-w-5xl mx-auto">
          {popular.map((product, i) => (
            <AnimateOnScroll key={product.id} delay={i * 80}>
              <ProductCard product={product} />
            </AnimateOnScroll>
          ))}
        </div>

        <AnimateOnScroll delay={400}>
          <div className="text-center mt-8 sm:mt-10">
            <Link
              to="/boutique"
              className="group inline-flex items-center gap-2 text-primary text-xs sm:text-sm font-semibold hover:underline"
            >
              Voir tout le catalogue
              <ArrowRight size={16} className="transition-transform group-hover:translate-x-1" />
            </Link>
          </div>
        </AnimateOnScroll>
      </div>
    </section>
  );
};

export default PopularProductsSection;

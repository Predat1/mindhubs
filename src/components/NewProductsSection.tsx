import { Link } from "react-router-dom";
import { ArrowRight, Sparkles } from "lucide-react";
import AnimateOnScroll from "@/components/AnimateOnScroll";
import ProductCard from "@/components/ProductCard";
import { useNewProducts } from "@/hooks/useProducts";

const NewProductsSection = () => {
  const { data: newProducts = [] } = useNewProducts();

  if (newProducts.length === 0) return null;

  return (
    <section className="py-10 sm:py-14 bg-background">
      <div className="container mx-auto px-4">
        <AnimateOnScroll>
          <div className="text-center mb-8 sm:mb-10">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/10 text-primary text-[10px] sm:text-xs font-semibold mb-4 border border-primary/20">
              <Sparkles size={14} className="animate-pulse" />
              Nouveautés
            </div>
            <h2 className="text-xl sm:text-2xl md:text-3xl font-extrabold text-foreground mb-6">
              <span className="heading-accent">Fraîchement ajoutés</span>
            </h2>
            <p className="text-xs sm:text-sm text-muted-foreground max-w-md mx-auto">
              Découvrez nos dernières formations et ressources pour rester à la pointe.
            </p>
          </div>
        </AnimateOnScroll>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 md:gap-5 max-w-5xl mx-auto">
          {newProducts.slice(0, 4).map((product, i) => (
            <AnimateOnScroll key={product.id} delay={i * 80}>
              <ProductCard product={product} />
            </AnimateOnScroll>
          ))}
        </div>

        <AnimateOnScroll delay={400}>
          <div className="text-center mt-8 sm:mt-10">
            <Link
              to="/boutique"
              className="group inline-flex items-center gap-2 border border-primary/30 text-primary px-6 sm:px-8 py-3 sm:py-3.5 rounded-xl font-semibold text-xs sm:text-sm hover:bg-primary hover:text-primary-foreground transition-all hover-scale"
            >
              Voir toutes les nouveautés
              <ArrowRight size={16} className="transition-transform group-hover:translate-x-1" />
            </Link>
          </div>
        </AnimateOnScroll>
      </div>
    </section>
  );
};

export default NewProductsSection;

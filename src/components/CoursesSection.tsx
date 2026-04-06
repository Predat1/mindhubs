import { Link } from "react-router-dom";
import ProductCard from "@/components/ProductCard";
import AnimateOnScroll from "@/components/AnimateOnScroll";
import { useFeaturedProducts } from "@/hooks/useProducts";

const CoursesSection = () => {
  const { data: featured = [], isLoading } = useFeaturedProducts();

  return (
    <section id="formations" className="py-16 bg-background">
      <div className="container mx-auto px-4">
        <AnimateOnScroll>
          <div className="stat-card rounded-2xl py-8 px-6 text-center max-w-3xl mx-auto mb-10">
            <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-2">
              Nos Formations
            </h2>
            <p className="text-muted-foreground text-sm">
              Acquérez les compétences digitales de demain aujourd'hui
            </p>
          </div>
        </AnimateOnScroll>

        {isLoading ? (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-5">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="stat-card rounded-xl h-72 animate-pulse" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-5">
            {featured.map((product, i) => (
              <AnimateOnScroll key={product.id} delay={i * 80}>
                <ProductCard product={product} />
              </AnimateOnScroll>
            ))}
          </div>
        )}

        <AnimateOnScroll delay={400}>
          <div className="text-center mt-10">
            <Link
              to="/boutique"
              className="btn-primary-brand inline-block px-8 py-3 rounded-full font-semibold text-sm hover-scale"
            >
              VOIR TOUTES NOS FORMATIONS 🎓
            </Link>
          </div>
        </AnimateOnScroll>
      </div>
    </section>
  );
};

export default CoursesSection;

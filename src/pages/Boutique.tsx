import { useState } from "react";
import Navbar from "@/components/Navbar";
import FooterSection from "@/components/FooterSection";
import ProductCard from "@/components/ProductCard";
import AnimateOnScroll from "@/components/AnimateOnScroll";
import SEO from "@/components/SEO";
import { useProducts } from "@/hooks/useProducts";
import { categories, type Category } from "@/data/products";

const Boutique = () => {
  const [activeCategory, setActiveCategory] = useState<Category>("Tous");
  const { data: products = [], isLoading } = useProducts();

  const filtered = activeCategory === "Tous"
    ? products
    : products.filter((p) => p.category === activeCategory);

  return (
    <div className="min-h-screen bg-background">
      <SEO title="Boutique" description="Découvrez notre catalogue de formations digitales premium. E-books, formations SMMA, e-commerce et plus encore." path="/boutique" />
      <Navbar />

      <section className="pt-16">
        <div className="relative py-16 text-center overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-b from-primary/20 via-primary/5 to-transparent" />
          <h1 className="relative text-3xl md:text-4xl font-bold text-foreground">
            Nos Packs Et Formations
          </h1>
        </div>
      </section>

      <section className="container mx-auto px-4 mb-8">
        <AnimateOnScroll>
          <div className="flex flex-wrap gap-3 justify-center">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`px-5 py-2 rounded-full text-sm font-medium border transition-all hover-scale ${
                  activeCategory === cat
                    ? "btn-primary-brand border-primary"
                    : "border-border text-muted-foreground hover:text-foreground hover:border-primary/50"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </AnimateOnScroll>
      </section>

      <section className="container mx-auto px-4 pb-20">
        {isLoading ? (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-5">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="stat-card rounded-xl h-72 animate-pulse" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-5">
            {filtered.map((product, i) => (
              <AnimateOnScroll key={product.id} delay={i * 40}>
                <ProductCard product={product} />
              </AnimateOnScroll>
            ))}
          </div>
        )}
      </section>

      <FooterSection />
    </div>
  );
};

export default Boutique;

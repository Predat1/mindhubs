import { useState } from "react";
import Navbar from "@/components/Navbar";
import FooterSection from "@/components/FooterSection";
import ProductCard from "@/components/ProductCard";
import AnimateOnScroll from "@/components/AnimateOnScroll";
import { allProducts, categories, type Category } from "@/data/products";

const Boutique = () => {
  const [activeCategory, setActiveCategory] = useState<Category>("Tous");

  const filtered = activeCategory === "Tous"
    ? allProducts
    : allProducts.filter((p) => p.category === activeCategory);

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <section className="pt-16">
        <div className="relative py-20 text-center overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-b from-primary/20 via-primary/5 to-transparent" />
          <h1 className="relative text-4xl md:text-5xl font-bold text-foreground animate-fade-in">
            Nos Packs Et Formations
          </h1>
        </div>
      </section>

      <section className="container mx-auto px-4 -mt-6 mb-12">
        <AnimateOnScroll>
          <div className="stat-card rounded-2xl py-12 px-8 text-center max-w-3xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground">
              Tous Nos Packs Et Formations
            </h2>
          </div>
        </AnimateOnScroll>
      </section>

      <section className="container mx-auto px-4 mb-10">
        <AnimateOnScroll>
          <div className="flex flex-wrap gap-3">
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
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {filtered.map((product, i) => (
            <AnimateOnScroll key={product.id} delay={i * 60}>
              <ProductCard product={product} />
            </AnimateOnScroll>
          ))}
        </div>
      </section>

      <FooterSection />
    </div>
  );
};

export default Boutique;

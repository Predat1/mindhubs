import { useState } from "react";
import { Search } from "lucide-react";
import Navbar from "@/components/Navbar";
import FooterSection from "@/components/FooterSection";
import ProductCard from "@/components/ProductCard";
import AnimateOnScroll from "@/components/AnimateOnScroll";
import SEO from "@/components/SEO";
import { useProducts } from "@/hooks/useProducts";
import { categories, type Category } from "@/data/products";

const Boutique = () => {
  const [activeCategory, setActiveCategory] = useState<Category>("Tous");
  const [searchQuery, setSearchQuery] = useState("");
  const { data: products = [], isLoading } = useProducts();

  const filtered = products
    .filter((p) => activeCategory === "Tous" || p.category === activeCategory)
    .filter((p) => !searchQuery.trim() || p.title.toLowerCase().includes(searchQuery.toLowerCase()));

  const resultCount = filtered.length;

  return (
    <div className="min-h-screen bg-background">
      <SEO
        title="Boutique – Formations & E-books"
        description="Explorez notre catalogue complet de formations digitales premium, e-books et kits. Paiement sécurisé, accès illimité à vie."
        path="/boutique"
      />
      <Navbar />

      {/* Hero Header */}
      <section className="pt-28 sm:pt-24 pb-4 sm:pb-6">
        <div className="container mx-auto px-4">
          <AnimateOnScroll>
            <div className="text-center max-w-2xl mx-auto">
              <p className="text-[10px] sm:text-xs font-medium uppercase tracking-[0.2em] text-primary mb-2 sm:mb-3">
                Catalogue
              </p>
              <h1 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-foreground mb-2 sm:mb-3">
                Nos formations & ressources
              </h1>
              <p className="text-xs sm:text-sm text-muted-foreground">
                Trouvez la formation parfaite pour développer vos compétences digitales.
              </p>
            </div>
          </AnimateOnScroll>
        </div>
      </section>

      {/* Search + Filters Bar */}
      <section className="container mx-auto px-4 mb-6 sm:mb-8">
        <AnimateOnScroll delay={100}>
          <div className="max-w-2xl mx-auto mb-4 sm:mb-6">
            <div className="relative">
              <Search className="absolute left-3 sm:left-4 top-1/2 -translate-y-1/2 text-muted-foreground" size={16} />
              <input
                type="text"
                placeholder="Rechercher une formation, un e-book..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 sm:pl-11 pr-4 py-3 sm:py-3.5 rounded-xl bg-card border border-border text-foreground text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary/50 transition-all"
              />
            </div>
          </div>
        </AnimateOnScroll>

        <AnimateOnScroll delay={150}>
          <div className="flex flex-wrap gap-1.5 sm:gap-2 justify-center">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`px-3 sm:px-4 py-1.5 sm:py-2 rounded-full text-[10px] sm:text-xs font-medium border transition-all hover-scale ${
                  activeCategory === cat
                    ? "bg-primary text-primary-foreground border-primary"
                    : "stat-card border-border text-muted-foreground hover:text-foreground hover:border-primary/40"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </AnimateOnScroll>
      </section>

      {/* Results Count */}
      <section className="container mx-auto px-4 mb-3 sm:mb-4">
        <div className="flex items-center justify-between max-w-5xl mx-auto">
          <p className="text-[10px] sm:text-xs text-muted-foreground">
            {isLoading ? "Chargement..." : `${resultCount} résultat${resultCount !== 1 ? "s" : ""}`}
            {activeCategory !== "Tous" && ` dans "${activeCategory}"`}
            {searchQuery.trim() && ` pour "${searchQuery}"`}
          </p>
        </div>
      </section>

      {/* Products Grid */}
      <section className="container mx-auto px-4 pb-16 sm:pb-20">
        {isLoading ? (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 md:gap-5 max-w-5xl mx-auto">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="stat-card rounded-xl h-56 sm:h-72 animate-pulse" />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <AnimateOnScroll>
            <div className="text-center py-16 sm:py-20 max-w-md mx-auto">
              <Search className="mx-auto text-muted-foreground mb-4" size={36} />
              <h3 className="text-base sm:text-lg font-semibold text-foreground mb-2">Aucun résultat</h3>
              <p className="text-xs sm:text-sm text-muted-foreground mb-4">
                Essayez avec d'autres mots-clés ou explorez une autre catégorie.
              </p>
              <button
                onClick={() => { setSearchQuery(""); setActiveCategory("Tous"); }}
                className="text-xs sm:text-sm font-medium text-primary hover:text-primary/80 transition-colors"
              >
                Réinitialiser les filtres
              </button>
            </div>
          </AnimateOnScroll>
        ) : (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 md:gap-5 max-w-5xl mx-auto">
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

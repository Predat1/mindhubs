import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Search, ArrowRight, TrendingUp, Sparkles, BookOpen } from "lucide-react";
import AnimateOnScroll from "@/components/AnimateOnScroll";
import ProductCard from "@/components/ProductCard";
import { useSearchProducts, useFeaturedProducts } from "@/hooks/useProducts";

const categories = [
  { label: "Populaire", icon: TrendingUp },
  { label: "Nouveautés", icon: Sparkles },
  { label: "E-books", icon: BookOpen },
];

const DiscoverySection = () => {
  const [query, setQuery] = useState("");
  const { data: searchResults = [] } = useSearchProducts(query);
  const { data: featured = [] } = useFeaturedProducts();
  const navigate = useNavigate();

  const showResults = query.trim().length >= 2 && searchResults.length > 0;
  const displayProducts = showResults ? searchResults : featured.slice(0, 4);

  return (
    <section className="py-14 sm:py-20 bg-background">
      <div className="container mx-auto px-4">
        <AnimateOnScroll>
          <p className="text-center text-xs sm:text-sm text-muted-foreground max-w-md mx-auto mb-6 sm:mb-8">
            Explorez notre catalogue et trouvez la compétence qui fera la différence dans votre carrière.
          </p>
        </AnimateOnScroll>

        {/* Search Bar */}
        <AnimateOnScroll delay={100}>
          <div className="max-w-xl mx-auto mb-5 sm:mb-6">
            <div className="relative">
              <Search className="absolute left-3 sm:left-4 top-1/2 -translate-y-1/2 text-muted-foreground" size={16} />
              <input
                type="text"
                placeholder="Rechercher une formation..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && query.trim()) navigate(`/boutique`);
                }}
                className="w-full pl-9 sm:pl-11 pr-4 py-3 sm:py-3.5 rounded-xl bg-card border border-border text-foreground text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary/50 transition-all"
              />
            </div>
          </div>
        </AnimateOnScroll>

        {/* Quick Category Tags */}
        <AnimateOnScroll delay={150}>
          <div className="flex items-center justify-center gap-2 sm:gap-3 mb-8 sm:mb-12 flex-wrap">
            {categories.map((cat) => (
              <button
                key={cat.label}
                onClick={() => navigate("/boutique")}
                className="inline-flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-1.5 sm:py-2 rounded-full text-[10px] sm:text-xs font-medium stat-card border-glow hover-scale cursor-pointer text-muted-foreground hover:text-foreground transition-colors"
              >
                <cat.icon size={12} className="text-primary" />
                {cat.label}
              </button>
            ))}
          </div>
        </AnimateOnScroll>

        {/* Product Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 md:gap-5 max-w-5xl mx-auto">
          {displayProducts.map((product, i) => (
            <AnimateOnScroll key={product.id} delay={i * 80}>
              <ProductCard product={product} />
            </AnimateOnScroll>
          ))}
        </div>

        <AnimateOnScroll delay={400}>
          <div className="text-center mt-8 sm:mt-10">
            <Link
              to="/boutique"
              className="group inline-flex items-center gap-2 bg-primary text-primary-foreground px-6 sm:px-8 py-3 sm:py-3.5 rounded-xl font-semibold text-xs sm:text-sm hover:bg-primary/90 transition-all hover-scale"
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

export default DiscoverySection;

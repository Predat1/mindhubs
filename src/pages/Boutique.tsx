import { useState, useEffect, useRef } from "react";
import { useSearchParams } from "react-router-dom";
import { Search, SlidersHorizontal, Package, Sparkles } from "lucide-react";
import Navbar from "@/components/Navbar";
import FooterSection from "@/components/FooterSection";
import ProductCard from "@/components/ProductCard";
import AnimateOnScroll from "@/components/AnimateOnScroll";
import SEO from "@/components/SEO";
import { useProducts } from "@/hooks/useProducts";
import { useSmartRanking } from "@/hooks/useSmartRanking";
import { categories, type Category } from "@/data/products";
import fbPixel from "@/hooks/useFacebookPixel";
import { motion, AnimatePresence } from "framer-motion";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

const Boutique = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [activeCategory, setActiveCategory] = useState<Category>(
    (searchParams.get("category") as Category) || "Tous"
  );
  const [searchQuery, setSearchQuery] = useState(searchParams.get("q") || "");
  const { data: products = [], isLoading } = useProducts();
  const rankedProducts = useSmartRanking(products);
  const searchTimeout = useRef<ReturnType<typeof setTimeout>>();

  useEffect(() => {
    if (searchQuery.trim().length >= 2) {
      clearTimeout(searchTimeout.current);
      searchTimeout.current = setTimeout(() => {
        fbPixel.search({ search_string: searchQuery.trim() });
      }, 800);
    }
    return () => clearTimeout(searchTimeout.current);
  }, [searchQuery]);

  const filtered = rankedProducts
    .filter((p) => activeCategory === "Tous" || p.category === activeCategory)
    .filter((p) => !searchQuery.trim() || p.title.toLowerCase().includes(searchQuery.toLowerCase()));

  const resultCount = filtered.length;

  return (
    <div className="min-h-screen bg-background aurora-bg">
      <SEO
        title="Boutique Elite – Formations & E-books Premium"
        description="Le catalogue N°1 de formations digitales premium en Afrique. E-books, kits business et expertises IA. Accès illimité à vie."
        path="/boutique"
        keywords="boutique formation, e-books business, formation marketing digital, vente formation en ligne, MindHub boutique, kits business Afrique"
      />
      <Navbar />

      {/* Header Section */}
      <section className="pt-32 pb-12">
        <div className="container mx-auto px-4">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center max-w-3xl mx-auto space-y-4"
          >
            <div className="flex justify-center gap-2 mb-4">
               <Badge className="bg-primary/20 text-primary border-none px-3 py-1 font-black text-[10px] tracking-widest">BOUTIQUE EXPERT</Badge>
               <Badge variant="outline" className="border-white/10 text-muted-foreground px-3 py-1 font-black text-[10px] tracking-widest uppercase">Paiement Sécurisé</Badge>
            </div>
            <h1 className="text-4xl md:text-6xl font-black tracking-tighter text-foreground">
              Développez vos <br /> <span className="text-gradient-primary italic">Compétences Digitales</span>
            </h1>
            <p className="text-muted-foreground font-medium max-w-xl mx-auto">
              Des ressources premium conçues par des experts pour vous aider à lancer et scaler votre business en Afrique.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Control Bar: Search + Filters */}
      <section className="container mx-auto px-4 mb-12 sticky top-24 z-40">
        <div className="glass-card rounded-[2.5rem] p-3 max-w-5xl mx-auto flex flex-col md:flex-row items-center gap-4 border-white/10 shadow-2xl">
          
          {/* Search Input */}
          <div className="relative flex-1 w-full">
            <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-muted-foreground" size={20} />
            <input
              type="text"
              placeholder="Rechercher une formation, un e-book..."
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                if (e.target.value.trim()) {
                  setSearchParams({ q: e.target.value.trim() });
                } else {
                  setSearchParams({});
                }
              }}
              className="w-full pl-14 pr-6 h-14 rounded-2xl bg-white/5 border-none text-foreground font-bold placeholder:text-muted-foreground focus:ring-2 focus:ring-primary/20 transition-all"
            />
          </div>

          {/* Categories Scroll (Desktop) */}
          <div className="hidden md:flex items-center gap-2 pr-2 border-l border-white/5 pl-4 overflow-x-auto [scrollbar-width:none]">
             {categories.map((cat) => (
               <button
                 key={cat}
                 onClick={() => {
                   setActiveCategory(cat);
                   const newParams = new URLSearchParams(searchParams);
                   if (cat === "Tous") {
                     newParams.delete("category");
                   } else {
                     newParams.set("category", cat);
                   }
                   setSearchParams(newParams);
                 }}
                 className={`px-4 py-2 rounded-xl text-xs font-black transition-all whitespace-nowrap ${
                   activeCategory === cat
                     ? "bg-primary text-primary-foreground shadow-lg shadow-primary/20"
                     : "text-muted-foreground hover:text-foreground hover:bg-white/5"
                 }`}
               >
                 {cat}
               </button>
             ))}
          </div>

          {/* Mobile Categories Toggle */}
          <div className="md:hidden flex w-full gap-2 overflow-x-auto [scrollbar-width:none] pb-2">
             {categories.map((cat) => (
               <button
                 key={cat}
                 onClick={() => {
                   setActiveCategory(cat);
                   const newParams = new URLSearchParams(searchParams);
                   if (cat === "Tous") {
                     newParams.delete("category");
                   } else {
                     newParams.set("category", cat);
                   }
                   setSearchParams(newParams);
                 }}
                 className={`px-4 py-2 rounded-xl text-xs font-black transition-all whitespace-nowrap ${
                   activeCategory === cat
                     ? "bg-primary text-primary-foreground"
                     : "bg-white/5 text-muted-foreground"
                 }`}
               >
                 {cat}
               </button>
             ))}
          </div>
        </div>
      </section>

      {/* Grid Status */}
      <div className="container mx-auto px-4 mb-6">
         <div className="max-w-5xl mx-auto flex items-center justify-between text-xs font-bold text-muted-foreground uppercase tracking-widest">
            <div className="flex items-center gap-2">
               <Package size={14} className="text-primary" />
               {isLoading ? "Chargement..." : `${resultCount} ressources disponibles`}
            </div>
            <div className="flex items-center gap-2">
               <Sparkles size={14} className="text-primary" />
               Recommandé par Mindhubs
            </div>
         </div>
      </div>

      {/* Main Grid */}
      <section className="container mx-auto px-4 pb-24">
        {isLoading ? (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 max-w-5xl mx-auto">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="glass-card rounded-[2rem] aspect-square animate-pulse" />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-24 bg-card/20 rounded-[3rem] border-2 border-dashed border-white/5 max-w-4xl mx-auto space-y-6">
             <div className="h-20 w-20 bg-muted rounded-full flex items-center justify-center mx-auto text-muted-foreground">
                <Search size={32} />
             </div>
             <div className="space-y-2">
                <h3 className="text-2xl font-black">Aucun résultat trouvé</h3>
                <p className="text-muted-foreground font-medium">Essayez d'ajuster vos filtres ou votre recherche.</p>
             </div>
             <Button onClick={() => { setSearchQuery(""); setActiveCategory("Tous"); }} variant="outline" className="rounded-full">
                Réinitialiser les filtres
             </Button>
          </div>
        ) : (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 max-w-5xl mx-auto">
            <AnimatePresence>
              {filtered.map((product, i) => (
                <AnimateOnScroll key={product.id} delay={i * 40}>
                  <ProductCard product={product} />
                </AnimateOnScroll>
              ))}
            </AnimatePresence>
          </div>
        )}
      </section>

      <FooterSection />
    </div>
  );
};

export default Boutique;

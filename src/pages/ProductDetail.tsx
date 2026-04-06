import { useState } from "react";
import { useParams, Link } from "react-router-dom";
import Navbar from "@/components/Navbar";
import FooterSection from "@/components/FooterSection";
import ProductCard from "@/components/ProductCard";
import AnimateOnScroll from "@/components/AnimateOnScroll";
import StickyProductCTA from "@/components/StickyProductCTA";
import BuyPopup from "@/components/BuyPopup";
import { useProduct, useProducts } from "@/hooks/useProducts";
import { useCart } from "@/contexts/CartContext";
import { CheckSquare, ShoppingCart } from "lucide-react";

const ProductDetail = () => {
  const { id } = useParams<{ id: string }>();
  const { data: product, isLoading } = useProduct(id || "");
  const { data: allProducts = [] } = useProducts();
  const [activeTab, setActiveTab] = useState<"description" | "avis">("description");
  const [popupOpen, setPopupOpen] = useState(false);
  const { addToCart } = useCart();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="container mx-auto px-4 pt-32 text-center">
          <div className="stat-card rounded-xl h-96 max-w-4xl mx-auto animate-pulse" />
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="container mx-auto px-4 pt-32 text-center">
          <h1 className="text-2xl font-bold text-foreground">Produit introuvable</h1>
          <Link to="/boutique" className="text-primary underline mt-4 inline-block">
            Retour à la boutique
          </Link>
        </div>
        <FooterSection />
      </div>
    );
  }

  const similar = allProducts.filter((p) => p.id !== product.id).slice(0, 4);

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      {/* Product Info */}
      <section className="container mx-auto px-4 pt-24 pb-10">
        <AnimateOnScroll>
          <div className="stat-card rounded-2xl p-6 md:p-10 max-w-4xl mx-auto">
            <div className="grid md:grid-cols-2 gap-8">
              <div className="relative group overflow-hidden rounded-lg">
                <span className="absolute top-3 left-3 badge-purple text-xs font-semibold px-3 py-1 rounded-full z-10">
                  VENTE !
                </span>
                <img
                  src={product.image}
                  alt={product.title}
                  className="w-full rounded-lg object-cover transition-transform duration-500 group-hover:scale-105"
                />
              </div>

              <div className="space-y-5">
                <div className="stat-card rounded-xl p-5 space-y-4">
                  <h1 className="text-lg md:text-xl font-bold text-foreground">
                    {product.title}
                  </h1>
                  <div className="flex items-center gap-3">
                    <span className="text-muted-foreground line-through text-sm">{product.oldPrice}</span>
                    <span className="text-accent font-bold text-2xl">{product.price}</span>
                  </div>
                  <button
                    onClick={() => setPopupOpen(true)}
                    className="btn-primary-brand py-3 px-8 rounded-full font-semibold text-sm tracking-wide inline-flex items-center gap-2 hover-scale"
                  >
                    <ShoppingCart size={16} />
                    ACHETER MAINTENANT
                  </button>
                  <div className="text-xs text-muted-foreground space-y-1 pt-2">
                    <p><span className="text-foreground font-medium">Catégorie</span> {product.category}</p>
                    {product.tag && <p><span className="text-foreground font-medium">Étiquette</span> {product.tag}</p>}
                  </div>
                </div>

                <div className="stat-card rounded-xl p-5 space-y-3">
                  <h3 className="text-base font-bold text-foreground">Processus de commande</h3>
                  <div className="space-y-2 text-sm text-muted-foreground">
                    <div className="flex items-start gap-2">
                      <CheckSquare className="w-4 h-4 text-primary mt-0.5 shrink-0" />
                      <span>Appuyez sur acheter maintenant, puis appuyez sur Commander.</span>
                    </div>
                    <div className="flex items-start gap-2">
                      <CheckSquare className="w-4 h-4 text-primary mt-0.5 shrink-0" />
                      <span>Remplissez vos informations, entrez votre numéro pour le paiement et validez la commande.</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </AnimateOnScroll>
      </section>

      {/* Description / Avis Tabs */}
      <section className="container mx-auto px-4 pb-10">
        <AnimateOnScroll>
          <div className="max-w-4xl mx-auto">
            <div className="flex gap-0 mb-0">
              <button
                onClick={() => setActiveTab("description")}
                className={`px-5 py-2.5 text-sm font-medium rounded-t-lg transition-colors ${
                  activeTab === "description"
                    ? "bg-card text-foreground border border-border border-b-0"
                    : "bg-muted/50 text-muted-foreground hover:text-foreground"
                }`}
              >
                Description
              </button>
              <button
                onClick={() => setActiveTab("avis")}
                className={`px-5 py-2.5 text-sm font-medium rounded-t-lg transition-colors ${
                  activeTab === "avis"
                    ? "bg-card text-foreground border border-border border-b-0"
                    : "bg-muted/50 text-muted-foreground hover:text-foreground"
                }`}
              >
                Avis (0)
              </button>
            </div>
            <div className="stat-card rounded-b-2xl rounded-tr-2xl p-6 md:p-8">
              {activeTab === "description" ? (
                <div className="prose prose-invert prose-sm max-w-none text-muted-foreground space-y-3">
                  <h3 className="text-foreground font-bold text-base">Description</h3>
                  {product.description?.split("\n\n").map((block, idx) => (
                    <div key={idx}>
                      {block.split("\n").map((line, li) => {
                        if (line.startsWith("**") && line.endsWith("**")) {
                          return <p key={li} className="font-bold text-foreground mt-3">{line.replace(/\*\*/g, "")}</p>;
                        }
                        return <p key={li}>{line}</p>;
                      })}
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-muted-foreground text-sm">Aucun avis pour le moment.</p>
              )}
            </div>
          </div>
        </AnimateOnScroll>
      </section>

      {/* Similar Products */}
      <section className="container mx-auto px-4 pb-20">
        <div className="max-w-5xl mx-auto">
          <AnimateOnScroll>
            <div className="flex items-center gap-4 mb-8">
              <h2 className="text-xl font-bold text-foreground whitespace-nowrap">Produits similaires</h2>
              <div className="flex-1 h-px bg-border" />
            </div>
          </AnimateOnScroll>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {similar.map((p, i) => (
              <AnimateOnScroll key={p.id} delay={i * 100}>
                <ProductCard product={p} />
              </AnimateOnScroll>
            ))}
          </div>
        </div>
      </section>

      <FooterSection />
      <StickyProductCTA
        productTitle={product.title}
        price={product.price}
        onBuy={() => setPopupOpen(true)}
      />
      <BuyPopup product={product} open={popupOpen} onClose={() => setPopupOpen(false)} />
    </div>
  );
};

export default ProductDetail;

import { useState } from "react";
import { useParams, Link } from "react-router-dom";
import Navbar from "@/components/Navbar";
import FooterSection from "@/components/FooterSection";
import ProductCard from "@/components/ProductCard";
import AnimateOnScroll from "@/components/AnimateOnScroll";
import { getProductById, getSimilarProducts } from "@/data/products";
import { useCart } from "@/contexts/CartContext";
import { toast } from "@/hooks/use-toast";
import { CheckSquare, ShoppingCart } from "lucide-react";

const ProductDetail = () => {
  const { id } = useParams<{ id: string }>();
  const product = getProductById(id || "");
  const [activeTab, setActiveTab] = useState<"description" | "avis">("description");
  const { addToCart } = useCart();

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

  const similar = getSimilarProducts(product.id, 4);

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      {/* Title Banner */}
      <section className="pt-20">
        <div className="container mx-auto px-4 py-8">
          <AnimateOnScroll>
            <div className="stat-card rounded-xl py-6 px-6 max-w-3xl mx-auto text-center">
              <h1 className="text-lg md:text-xl font-bold text-foreground">
                {product.title}
              </h1>
            </div>
          </AnimateOnScroll>
        </div>
      </section>

      {/* Product Info */}
      <section className="container mx-auto px-4 pb-10">
        <AnimateOnScroll>
          <div className="product-detail-card rounded-xl p-6 md:p-8 max-w-4xl mx-auto">
            <div className="grid md:grid-cols-2 gap-8">
              {/* Left: Image */}
              <div className="relative">
                <div className="product-image-card rounded-lg p-4">
                  <span className="absolute top-6 left-6 bg-primary text-primary-foreground text-xs font-bold px-3 py-1 rounded z-10">
                    VENTE
                  </span>
                  <img
                    src={product.image}
                    alt={product.title}
                    className="w-full rounded-lg object-cover"
                  />
                </div>
              </div>

              {/* Right: Details */}
              <div className="space-y-0">
                {/* Title + Price + Button + Meta */}
                <div className="product-image-card rounded-lg p-5 space-y-4">
                  <h2 className="text-lg font-bold text-foreground leading-snug">
                    {product.title}
                  </h2>
                  <div className="flex items-baseline gap-2">
                    <span className="text-muted-foreground line-through text-sm">{product.oldPrice}</span>
                    <span className="text-primary font-bold text-2xl">{product.price}</span>
                  </div>
                  <button
                    onClick={() => {
                      addToCart(product);
                      toast({
                        title: "Produit ajouté au panier 🛒",
                        description: `${product.title} a été ajouté.`,
                      });
                    }}
                    className="btn-primary-brand py-3 px-8 rounded-full font-bold text-sm tracking-wider inline-flex items-center gap-2"
                  >
                    <ShoppingCart size={16} />
                    ACHETER MAINTENANT
                  </button>
                  <div className="text-sm text-muted-foreground space-y-1 pt-2 border-t border-border">
                    <p>
                      <span className="text-foreground font-semibold">Catégorie </span>
                      <span className="text-primary">{product.category}</span>
                    </p>
                    {product.tag && (
                      <p>
                        <span className="text-foreground font-semibold">Étiquettes </span>
                        <span className="text-primary">{product.tag}</span>
                      </p>
                    )}
                  </div>
                </div>

                {/* Processus de commande */}
                <div className="product-image-card rounded-lg p-5 space-y-3 mt-4">
                  <h3 className="text-base font-bold text-foreground">Processus de commande</h3>
                  <div className="space-y-3 text-sm text-muted-foreground">
                    <div className="flex items-start gap-2">
                      <CheckSquare className="w-4 h-4 text-primary mt-0.5 shrink-0" />
                      <span>Appuyez sur acheter maintenant, puis appuyez sur Commander.</span>
                    </div>
                    <div className="flex items-start gap-2">
                      <CheckSquare className="w-4 h-4 text-primary mt-0.5 shrink-0" />
                      <span>Remplissez vos informations, entrez votre numéro pour le paiement et validez la commande</span>
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
            <div className="flex gap-0">
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
            <div className="product-detail-card rounded-b-xl rounded-tr-xl p-6 md:p-8">
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
    </div>
  );
};

export default ProductDetail;

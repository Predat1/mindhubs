import { useEffect, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import Navbar from "@/components/Navbar";
import FooterSection from "@/components/FooterSection";
import ProductCard from "@/components/ProductCard";
import AnimateOnScroll from "@/components/AnimateOnScroll";
import StickyProductCTA from "@/components/StickyProductCTA";
import SEO from "@/components/SEO";
import CountdownTimer from "@/components/CountdownTimer";
import TrustBlock from "@/components/TrustBlock";
import { useProduct, useProducts } from "@/hooks/useProducts";
import { useTestimonials } from "@/hooks/useTestimonials";
import { useCart } from "@/contexts/CartContext";
import { CheckSquare, ShoppingCart, Eye, Star, Package, FileText, Gift, BookOpen } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import ShareButtons from "@/components/ShareButtons";
import { useRecentlyViewed } from "@/hooks/useRecentlyViewed";
import fbPixel from "@/hooks/useFacebookPixel";

const ProductDetail = () => {
  const { id } = useParams<{ id: string }>();
  const { data: product, isLoading } = useProduct(id || "");
  const { data: allProducts = [] } = useProducts();
  const { data: testimonials = [] } = useTestimonials();
  const { addToCart } = useCart();
  const navigate = useNavigate();
  const { addViewed } = useRecentlyViewed();
  const [activeTab, setActiveTab] = useState<"description" | "avis">("description");
  const [currentImage, setCurrentImage] = useState(0);

  useEffect(() => {
    if (product) {
      addViewed(product.id);
      const price = parseFloat(product.price.replace(/[^\d.,]/g, "").replace(",", ".")) || 0;
      fbPixel.viewContent({
        content_name: product.title,
        content_ids: [product.id],
        content_type: "product",
        value: price,
        currency: "XOF",
      });
    }
  }, [product, addViewed]);

  useEffect(() => {
    setCurrentImage(0);
    setActiveTab("description");
  }, [id]);

  const handleBuyNow = () => {
    if (product) {
      addToCart(product);
      const price = parseFloat(product.price.replace(/[^\d.,]/g, "").replace(",", ".")) || 0;
      fbPixel.initiateCheckout({
        content_ids: [product.id],
        value: price,
        currency: "XOF",
        num_items: 1,
      });
      if (product.paymentLink) {
        window.open(product.paymentLink, "_blank", "noopener,noreferrer");
      } else {
        navigate("/checkout");
      }
    }
  };

  const viewerCount = 8 + Math.floor((id || "").length * 2.3);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="container mx-auto px-4 pt-32 text-center">
          <div className="stat-card rounded-xl h-64 sm:h-96 max-w-4xl mx-auto animate-pulse" />
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="container mx-auto px-4 pt-32 text-center">
          <h1 className="text-xl sm:text-2xl font-bold text-foreground">Produit introuvable</h1>
          <Link to="/boutique" className="text-primary underline mt-4 inline-block text-sm">Retour à la boutique</Link>
        </div>
        <FooterSection />
      </div>
    );
  }

  const similar = allProducts.filter((p) => p.id !== product.id).slice(0, 4);
  const priceNum = parseFloat(product.price.replace(/[^\d.,]/g, "").replace(",", ".")) || 0;
  const oldPriceNum = parseFloat(product.oldPrice.replace(/[^\d.,]/g, "").replace(",", ".")) || 0;
  const discountPct = oldPriceNum > 0 ? Math.round(((oldPriceNum - priceNum) / oldPriceNum) * 100) : 0;

  // Build image gallery
  const allImages = [product.image, ...(product.imageUrls || [])].filter(Boolean);

  // Key features from DB or auto-extracted from description
  const keyFeatures = (product.keyFeatures && product.keyFeatures.length > 0)
    ? product.keyFeatures
    : extractFeatures(product.description);

  const productJsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.title,
    description: product.description || `Découvrez ${product.title} sur MindHub.`,
    image: product.image,
    url: `https://mindhubs.lovable.app/produit/${product.id}`,
    brand: { "@type": "Brand", name: "MindHub" },
    category: product.category,
    offers: {
      "@type": "Offer",
      price: priceNum,
      priceCurrency: "XOF",
      availability: "https://schema.org/InStock",
      seller: { "@type": "Organization", name: "MindHub" },
    },
    aggregateRating: product.rating ? { "@type": "AggregateRating", ratingValue: product.rating, bestRating: 5, ratingCount: 120 + Math.floor(product.title.length * 2) } : undefined,
  };

  return (
    <div className="min-h-screen bg-background">
      <SEO title={product.title} description={product.description || `Découvrez ${product.title} sur MindHub.`} path={`/produit/${product.id}`} jsonLd={productJsonLd} />
      <Navbar />

      <section className="container mx-auto px-4 pt-28 sm:pt-24 pb-8 sm:pb-10">
        <AnimateOnScroll>
          <div className="stat-card rounded-xl sm:rounded-2xl p-4 sm:p-6 md:p-10 max-w-4xl mx-auto">
            <div className="grid md:grid-cols-2 gap-5 sm:gap-8">
              {/* Image gallery */}
              <div className="space-y-3">
                <div className="relative group overflow-hidden rounded-lg">
                  {discountPct > 0 && (
                    <span className="absolute top-2 sm:top-3 left-2 sm:left-3 bg-destructive text-destructive-foreground text-[10px] sm:text-xs font-bold px-2.5 sm:px-3 py-0.5 sm:py-1 rounded-full z-10">
                      -{discountPct}%
                    </span>
                  )}
                  <span className="absolute top-2 sm:top-3 right-2 sm:right-3 badge-purple text-[10px] sm:text-xs font-semibold px-2 sm:px-3 py-0.5 sm:py-1 rounded-full z-10">VENTE !</span>
                  <img src={allImages[currentImage]} alt={product.title} className="w-full rounded-lg object-cover transition-transform duration-500 group-hover:scale-105" />
                </div>
                {allImages.length > 1 && (
                  <div className="flex gap-2 overflow-x-auto pb-1">
                    {allImages.map((img, i) => (
                      <button key={i} onClick={() => setCurrentImage(i)}
                        className={`w-16 h-16 rounded-lg overflow-hidden border-2 shrink-0 transition-all ${i === currentImage ? "border-primary" : "border-border opacity-60 hover:opacity-100"}`}
                      >
                        <img src={img} alt="" className="w-full h-full object-cover" />
                      </button>
                    ))}
                  </div>
                )}
              </div>

              <div className="space-y-4 sm:space-y-5">
                {/* Social proof */}
                <div className="flex items-center gap-2 px-3 py-1.5 sm:py-2 rounded-lg bg-accent/10 border border-accent/20">
                  <Eye size={12} className="text-accent urgency-pulse" />
                  <span className="text-[10px] sm:text-xs font-medium text-accent">🔥 {viewerCount} personnes consultent ce produit</span>
                </div>

                {/* Countdown */}
                <CountdownTimer />

                <div className="stat-card rounded-xl p-4 sm:p-5 space-y-3 sm:space-y-4">
                  <h1 className="text-base sm:text-lg md:text-xl font-bold text-foreground">{product.title}</h1>
                  <div className="flex items-center gap-3">
                    <span className="text-muted-foreground line-through text-xs sm:text-sm">{product.oldPrice}</span>
                    <span className="text-accent font-bold text-xl sm:text-2xl">{product.price}</span>
                    {discountPct > 0 && (
                      <span className="text-[10px] sm:text-xs font-bold text-destructive bg-destructive/10 px-2 py-0.5 rounded-full">Économisez {discountPct}%</span>
                    )}
                  </div>
                  <div className="flex items-center gap-2 text-[10px] sm:text-xs text-muted-foreground">
                    <div className="flex gap-0.5">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <Star key={i} size={10} className={i < Math.floor(product.rating || 4.7) ? "text-accent fill-accent" : "text-muted-foreground"} />
                      ))}
                    </div>
                    <span>{120 + Math.floor(product.title.length * 2)} avis</span>
                  </div>
                  <button
                    onClick={handleBuyNow}
                    className="btn-primary-brand py-2.5 sm:py-3 px-6 sm:px-8 rounded-full font-semibold text-xs sm:text-sm tracking-wide inline-flex items-center gap-2 hover-scale w-full sm:w-auto justify-center"
                  >
                    <ShoppingCart size={16} />
                    ACHETER MAINTENANT
                  </button>
                  <div className="text-[10px] sm:text-xs text-muted-foreground space-y-1 pt-2">
                    <p><span className="text-foreground font-medium">Catégorie</span> {product.category}</p>
                    {product.tag && <p><span className="text-foreground font-medium">Étiquette</span> {product.tag}</p>}
                  </div>
                  <div className="pt-2">
                    <ShareButtons url={`/produit/${product.id}`} title={product.title} />
                  </div>
                </div>

                {/* Trust block */}
                <TrustBlock />

                <div className="stat-card rounded-xl p-4 sm:p-5 space-y-2 sm:space-y-3">
                  <h3 className="text-sm sm:text-base font-bold text-foreground">Processus de commande</h3>
                  <div className="space-y-2 text-xs sm:text-sm text-muted-foreground">
                    <div className="flex items-start gap-2">
                      <CheckSquare className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-primary mt-0.5 shrink-0" />
                      <span>Appuyez sur acheter maintenant, puis appuyez sur Commander.</span>
                    </div>
                    <div className="flex items-start gap-2">
                      <CheckSquare className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-primary mt-0.5 shrink-0" />
                      <span>Remplissez vos informations, entrez votre numéro pour le paiement et validez la commande.</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </AnimateOnScroll>
      </section>

      {/* Key features / deliverables */}
      {keyFeatures.length > 0 && (
        <section className="container mx-auto px-4 pb-8 sm:pb-10">
          <AnimateOnScroll>
            <div className="max-w-4xl mx-auto stat-card rounded-xl sm:rounded-2xl p-4 sm:p-6 md:p-8 space-y-4">
              <h3 className="text-sm sm:text-base font-bold text-foreground flex items-center gap-2">
                <Gift size={18} className="text-accent" />
                Ce que tu vas recevoir
              </h3>
              <div className="grid sm:grid-cols-2 gap-3">
                {keyFeatures.map((f, i) => {
                  const icons = [Package, FileText, BookOpen, Gift];
                  const Icon = icons[i % icons.length];
                  return (
                    <div key={i} className="flex items-start gap-3 p-3 rounded-xl bg-muted/40 border border-border">
                      <Icon size={16} className="text-primary mt-0.5 shrink-0" />
                      <span className="text-xs sm:text-sm text-foreground">{f}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          </AnimateOnScroll>
        </section>
      )}

      {/* Description / Avis tabs */}
      <section className="container mx-auto px-4 pb-8 sm:pb-10">
        <AnimateOnScroll>
          <div className="max-w-4xl mx-auto">
            <div className="flex gap-0 mb-0">
              <button
                onClick={() => setActiveTab("description")}
                className={`px-4 sm:px-5 py-2 sm:py-2.5 text-xs sm:text-sm font-medium rounded-t-lg border border-border border-b-0 transition-colors ${
                  activeTab === "description" ? "bg-card text-foreground" : "bg-muted/40 text-muted-foreground hover:text-foreground"
                }`}
              >
                Description
              </button>
              <button
                onClick={() => setActiveTab("avis")}
                className={`px-4 sm:px-5 py-2 sm:py-2.5 text-xs sm:text-sm font-medium rounded-t-lg border border-border border-b-0 transition-colors ${
                  activeTab === "avis" ? "bg-card text-foreground" : "bg-muted/40 text-muted-foreground hover:text-foreground"
                }`}
              >
                Avis ({testimonials.length})
              </button>
            </div>
            <div className="stat-card rounded-b-xl sm:rounded-b-2xl rounded-tr-xl sm:rounded-tr-2xl p-4 sm:p-6 md:p-8">
              {activeTab === "description" ? (
                <div className="prose prose-invert prose-sm max-w-none text-muted-foreground space-y-3">
                  <h3 className="text-foreground font-bold text-sm sm:text-base">Description</h3>
                  {product.description?.split("\n\n").map((block, idx) => (
                    <div key={idx}>
                      {block.split("\n").map((line, li) => {
                        if (line.startsWith("**") && line.endsWith("**")) {
                          return <p key={li} className="font-bold text-foreground mt-3 text-xs sm:text-sm">{line.replace(/\*\*/g, "")}</p>;
                        }
                        return <p key={li} className="text-xs sm:text-sm">{line}</p>;
                      })}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="space-y-4">
                  <h3 className="text-foreground font-bold text-sm sm:text-base">Avis clients</h3>
                  {testimonials.length === 0 ? (
                    <p className="text-sm text-muted-foreground">Aucun avis pour le moment.</p>
                  ) : (
                    <div className="space-y-3 max-h-[400px] overflow-y-auto pr-2">
                      {testimonials.slice(0, 8).map((t) => (
                        <div key={t.id} className="p-3 rounded-xl bg-muted/30 border border-border space-y-2">
                          <div className="flex items-center gap-2">
                            <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-[10px] font-bold text-primary">{t.avatar_initials}</div>
                            <div>
                              <p className="text-xs font-semibold text-foreground">{t.name}</p>
                              <p className="text-[10px] text-muted-foreground">{t.handle}</p>
                            </div>
                            {t.verified && <span className="text-[10px] text-primary ml-auto">✓ Vérifié</span>}
                          </div>
                          <p className="text-xs text-foreground/80 leading-relaxed">{t.content}</p>
                          <div className="flex items-center gap-3 text-[10px] text-muted-foreground">
                            <span>❤️ {t.likes}</span>
                            <span>🔁 {t.retweets}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </AnimateOnScroll>
      </section>

      {/* Similar Products */}
      <section className="container mx-auto px-4 pb-16 sm:pb-20">
        <div className="max-w-5xl mx-auto">
          <AnimateOnScroll>
            <div className="flex items-center gap-3 sm:gap-4 mb-6 sm:mb-8">
              <h2 className="text-base sm:text-xl font-bold text-foreground whitespace-nowrap">Produits similaires</h2>
              <div className="flex-1 h-px bg-border" />
            </div>
          </AnimateOnScroll>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
            {similar.map((p, i) => (
              <AnimateOnScroll key={p.id} delay={i * 100}>
                <ProductCard product={p} />
              </AnimateOnScroll>
            ))}
          </div>
        </div>
      </section>

      <FooterSection />
      <StickyProductCTA productTitle={product.title} price={product.price} oldPrice={product.oldPrice} onBuy={handleBuyNow} />
    </div>
  );
};

/** Auto-extract key features from description */
function extractFeatures(desc?: string): string[] {
  if (!desc) return [];
  const features: string[] = [];
  const lines = desc.split("\n");
  for (const line of lines) {
    const trimmed = line.trim();
    if ((trimmed.startsWith("- ") || trimmed.startsWith("• ") || /^\d+[\.\)]\s/.test(trimmed)) && trimmed.length > 10 && trimmed.length < 120) {
      features.push(trimmed.replace(/^[-•]\s*/, "").replace(/^\d+[\.\)]\s*/, ""));
      if (features.length >= 6) break;
    }
  }
  return features;
}

export default ProductDetail;

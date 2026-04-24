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
import ProductReviewsSection from "@/components/ProductReviewsSection";
import { useProduct, useProducts } from "@/hooks/useProducts";
import { useProductReviews } from "@/hooks/useProductReviews";
import { useCart } from "@/contexts/CartContext";
import { CheckSquare, ShoppingCart, Eye, Star, Package, FileText, Gift, BookOpen, Store, BadgeCheck, Zap, ShieldCheck, Share2, Sparkles } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import ShareButtons from "@/components/ShareButtons";
import { useRecentlyViewed } from "@/hooks/useRecentlyViewed";
import fbPixel from "@/hooks/useFacebookPixel";
import { trackProductView, trackProductPurchase } from "@/hooks/useProductTracking";
import { useVendorById, useVendorProducts } from "@/hooks/useVendors";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

const ProductDetail = () => {
  const { id } = useParams<{ id: string }>();
  const { data: product, isLoading } = useProduct(id || "");
  const { data: allProducts = [] } = useProducts();
  const { data: reviews = [] } = useProductReviews(id || "");
  const { addToCart } = useCart();
  const navigate = useNavigate();
  const { addViewed } = useRecentlyViewed();
  const { data: vendor } = useVendorById(product?.vendorId);
  const { data: vendorProducts = [] } = useVendorProducts(product?.vendorId);
  const [activeTab, setActiveTab] = useState<"description" | "avis">("description");
  const [currentImage, setCurrentImage] = useState(0);

  useEffect(() => {
    if (product) {
      addViewed(product.id);
      trackProductView(product.id);
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
      trackProductPurchase(product.id);
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

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background aurora-bg">
        <Navbar />
        <div className="container mx-auto px-4 pt-48 text-center">
           <div className="glass-card rounded-[3rem] h-[60vh] max-w-5xl mx-auto animate-pulse" />
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-background aurora-bg">
        <Navbar />
        <div className="container mx-auto px-4 pt-48 text-center">
          <h1 className="text-3xl font-black">Produit introuvable</h1>
          <Link to="/boutique" className="text-primary font-bold mt-4 inline-block underline">Retour à la boutique</Link>
        </div>
        <FooterSection />
      </div>
    );
  }

  const similar = allProducts.filter((p) => p.id !== product.id).slice(0, 4);
  const priceNum = parseFloat(product.price.replace(/[^\d.,]/g, "").replace(",", ".")) || 0;
  const oldPriceNum = parseFloat(product.oldPrice.replace(/[^\d.,]/g, "").replace(",", ".")) || 0;
  const discountPct = oldPriceNum > 0 ? Math.round(((oldPriceNum - priceNum) / oldPriceNum) * 100) : 0;
  const allImages = [product.image, ...(product.imageUrls || [])].filter(Boolean);
  const keyFeatures = (product.keyFeatures && product.keyFeatures.length > 0) ? product.keyFeatures : extractFeatures(product.description);

  return (
    <div className="min-h-screen bg-background aurora-bg">
      <SEO title={product.title} description={product.description} path={`/produit/${product.id}`} />
      <Navbar />

      <section className="container mx-auto px-4 pt-36 pb-12">
        <div className="max-w-6xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-12 items-start">
            
            {/* Left: Gallery */}
            <motion.div 
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="space-y-6"
            >
               <div className="glass-card rounded-[3rem] overflow-hidden relative border-white/10 group shadow-2xl">
                  {discountPct > 0 && (
                    <Badge className="absolute top-6 left-6 z-10 bg-destructive text-white border-none px-4 py-1.5 font-black text-xs tracking-widest shadow-xl">
                      -{discountPct}% OFF
                    </Badge>
                  )}
                  <div className="aspect-square">
                    <img src={allImages[currentImage]} alt={product.title} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
                  </div>
                  <div className="absolute inset-0 bg-gradient-to-t from-background/40 to-transparent pointer-events-none" />
               </div>
               
               {allImages.length > 1 && (
                 <div className="flex gap-4 overflow-x-auto pb-4 custom-scrollbar">
                    {allImages.map((img, i) => (
                      <button 
                        key={i} 
                        onClick={() => setCurrentImage(i)}
                        className={`w-24 h-24 rounded-2xl overflow-hidden border-2 shrink-0 transition-all ${i === currentImage ? "border-primary scale-105 shadow-lg" : "border-white/5 opacity-60 hover:opacity-100"}`}
                      >
                        <img src={img} alt="" className="w-full h-full object-cover" />
                      </button>
                    ))}
                 </div>
               )}
            </motion.div>

            {/* Right: Product Info */}
            <motion.div 
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="space-y-8"
            >
               <div className="space-y-4">
                  <div className="flex items-center gap-2">
                     <Badge className="bg-primary/20 text-primary border-none px-3 py-1 font-black text-[10px] tracking-widest uppercase">{product.category}</Badge>
                     <div className="flex items-center gap-1.5 bg-emerald-500/10 px-3 py-1 rounded-full border border-emerald-500/20">
                        <Eye size={12} className="text-emerald-500 animate-pulse" />
                        <span className="text-[10px] font-black text-emerald-500 uppercase tracking-widest">Actuellement consulté par 12 experts</span>
                     </div>
                  </div>
                  <h1 className="text-4xl md:text-6xl font-black tracking-tighter leading-[0.95]">{product.title}</h1>
                  <div className="flex items-center gap-4">
                     <div className="flex gap-0.5">
                        {Array.from({ length: 5 }).map((_, i) => (
                          <Star key={i} size={14} className={i < 5 ? "text-primary fill-primary" : "text-muted-foreground/30"} />
                        ))}
                     </div>
                     <span className="text-xs font-black text-muted-foreground uppercase tracking-widest underline decoration-primary/30">120+ Avis certifiés</span>
                  </div>
               </div>

               <div className="glass-card rounded-[2.5rem] p-8 space-y-8 border-white/5">
                  <div className="flex items-end gap-4">
                     <div className="space-y-1">
                        <p className="text-xs font-black text-muted-foreground uppercase tracking-widest line-through">{product.oldPrice}</p>
                        <p className="text-5xl font-black text-foreground tracking-tighter">{product.price}</p>
                     </div>
                     {discountPct > 0 && (
                       <Badge className="mb-2 bg-emerald-500 text-white border-none px-3 py-1 font-black text-[10px]">ÉCONOMIE {discountPct}%</Badge>
                     )}
                  </div>

                  <div className="space-y-4">
                     <Button 
                       onClick={handleBuyNow}
                       className="w-full h-16 rounded-[2rem] btn-glow font-black text-xl gap-4"
                     >
                        {product.product_type === 'course' ? 'Accéder à la Formation' : 
                         product.product_type === 'coaching' ? 'Réserver ma Session' : 
                         product.product_type === 'service' ? 'Commander le Service' : 
                         'Obtenir mon Accès'}
                        <Zap size={22} fill="currentColor" />
                     </Button>
                     <div className="flex flex-wrap items-center justify-center gap-6">
                        <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-muted-foreground">
                           <ShieldCheck size={14} className="text-primary" /> Sécurisé par SSL
                        </div>
                        <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-muted-foreground">
                           <Zap size={14} className="text-amber-500" /> Livraison Instantanée
                        </div>
                     </div>
                  </div>

                  {vendor && (
                    <div className="pt-6 border-t border-white/5 flex items-center justify-between">
                       <div className="flex items-center gap-3">
                          <div className="h-10 w-10 rounded-xl bg-muted overflow-hidden border border-white/10">
                             {vendor.avatar_url ? <img src={vendor.avatar_url} className="h-full w-full object-cover" /> : <Store size={20} />}
                          </div>
                          <div>
                             <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">Expert Vendeur</p>
                             <Link to={`/store/${vendor.username}`} className="text-sm font-black hover:text-primary transition-colors flex items-center gap-1">
                                {vendor.shop_name} {vendor.verified && <BadgeCheck size={14} className="text-primary" />}
                             </Link>
                          </div>
                       </div>
                       <Button variant="outline" className="rounded-xl h-10 px-4 border-white/10 font-bold text-xs">Voir Boutique</Button>
                    </div>
                  )}
               </div>

               <TrustBlock />
               <CountdownTimer />
            </motion.div>
          </div>
        </div>
      </section>

      {/* Tabs Section */}
      <section className="container mx-auto px-4 py-12">
         <div className="max-w-4xl mx-auto">
            <div className="flex gap-2 mb-4">
               <button 
                 onClick={() => setActiveTab("description")}
                 className={`px-8 py-4 rounded-t-[2rem] font-black text-xs uppercase tracking-widest transition-all ${activeTab === "description" ? "bg-card/40 backdrop-blur-xl border-t border-x border-white/10 text-primary" : "text-muted-foreground hover:text-foreground"}`}
               >
                  Détails & Programme
               </button>
               <button 
                 onClick={() => setActiveTab("avis")}
                 className={`px-8 py-4 rounded-t-[2rem] font-black text-xs uppercase tracking-widest transition-all ${activeTab === "avis" ? "bg-card/40 backdrop-blur-xl border-t border-x border-white/10 text-primary" : "text-muted-foreground hover:text-foreground"}`}
               >
                  Avis Experts ({reviews.length})
               </button>
            </div>
            <div className="glass-card rounded-b-[3rem] rounded-tr-[3rem] p-8 md:p-12">
               {activeTab === "description" ? (
                 <div className="space-y-12">
                    {/* Video Section for Courses */}
                    {product.product_type === "course" && product.video_url && (
                      <div className="space-y-6">
                        <h3 className="text-2xl font-black flex items-center gap-3"><Play className="text-primary" /> Aperçu de la formation</h3>
                        <div className="aspect-video rounded-[2rem] overflow-hidden border border-white/10 shadow-2xl bg-black">
                           <iframe 
                             src={product.video_url.includes('youtube.com') ? product.video_url.replace('watch?v=', 'embed/') : product.video_url}
                             className="w-full h-full"
                             allowFullScreen
                           />
                        </div>
                      </div>
                    )}
                    <div className="grid md:grid-cols-2 gap-8">
                       <div className="space-y-6">
                          <h3 className="text-2xl font-black flex items-center gap-3"><Sparkles className="text-primary" /> Ce que vous allez maîtriser</h3>
                          <div className="space-y-4">
                             {keyFeatures.map((f, i) => (
                               <div key={i} className="flex items-start gap-4 p-4 rounded-2xl bg-white/5 border border-white/5">
                                  <div className="h-6 w-6 rounded-lg bg-primary/20 text-primary flex items-center justify-center shrink-0 mt-0.5"><Zap size={14} fill="currentColor" /></div>
                                  <p className="text-sm font-medium leading-relaxed">{f}</p>
                               </div>
                             ))}
                          </div>
                       </div>
                       <div className="space-y-6">
                          <h3 className="text-2xl font-black flex items-center gap-3"><Package className="text-primary" /> Inclus dans le Pack</h3>
                          <div className="bg-primary/5 rounded-3xl p-6 border border-primary/10 space-y-4">
                             <div className="flex items-center gap-3 text-sm font-bold"><CheckSquare className="text-primary" /> Guide PDF Haute Définition</div>
                             <div className="flex items-center gap-3 text-sm font-bold"><CheckSquare className="text-primary" /> Accès au Groupe Privé VIP</div>
                             <div className="flex items-center gap-3 text-sm font-bold"><CheckSquare className="text-primary" /> 5 Prompts IA Exclusifs</div>
                             <div className="flex items-center gap-3 text-sm font-bold"><CheckSquare className="text-primary" /> Mises à jour à Vie gratuites</div>
                          </div>
                       </div>
                    </div>
                    
                    <div className="prose prose-invert max-w-none prose-p:text-muted-foreground prose-p:font-medium prose-p:leading-relaxed prose-strong:text-foreground prose-strong:font-black">
                       <h3 className="text-2xl font-black text-foreground mb-6">Description Complète</h3>
                       {product.description?.split("\n\n").map((block, idx) => (
                         <div key={idx} className="mb-6">
                            {block.split("\n").map((line, li) => (
                              <p key={li} className={line.startsWith("**") ? "text-lg font-black text-foreground mt-8 mb-4" : "text-base"}>
                                {line.replace(/\*\*/g, "")}
                              </p>
                            ))}
                         </div>
                       ))}
                    </div>
                 </div>
               ) : (
                 <ProductReviewsSection productId={product.id} />
               )}
            </div>
         </div>
      </section>

      {/* Recommended Section */}
      <section className="container mx-auto px-4 pb-24">
         <div className="max-w-6xl mx-auto space-y-12">
            <div className="flex items-center gap-4">
               <h2 className="text-3xl font-black tracking-tighter">Également <span className="text-primary italic">Recommandé</span></h2>
               <div className="flex-1 h-px bg-white/5" />
            </div>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
               {similar.map((p) => (
                 <ProductCard key={p.id} product={p} />
               ))}
            </div>
         </div>
      </section>

      <FooterSection />
      <StickyProductCTA productTitle={product.title} price={product.price} oldPrice={product.oldPrice} onBuy={handleBuyNow} productType={product.product_type} />
    </div>
  );
};

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
  return features.length > 0 ? features : ["Formation complète pas à pas", "Accès illimité 24h/24", "Paiement unique sécurisé", "Satisfait ou remboursé"];
}

export default ProductDetail;

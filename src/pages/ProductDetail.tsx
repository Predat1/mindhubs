import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useParams, Link, useNavigate, useLocation } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import Navbar from "@/components/Navbar";
import FooterSection from "@/components/FooterSection";
import ProductCard from "@/components/ProductCard";
import AnimateOnScroll from "@/components/AnimateOnScroll";
import StickyProductCTA from "@/components/StickyProductCTA";
import SEO from "@/components/SEO";
import TrustBlock from "@/components/TrustBlock";
import ProductReviewsSection from "@/components/ProductReviewsSection";
import { ProductContentRenderer } from "@/components/products/ProductContentRenderer";
import { useProduct, useProducts } from "@/hooks/useProducts";
import { useProductReviews } from "@/hooks/useProductReviews";
import { useCart } from "@/contexts/CartContext";
import { CheckSquare, ShoppingCart, Eye, Star, Package, FileText, Gift, BookOpen, Store, BadgeCheck, Zap, ShieldCheck, Share2, Sparkles, Lock, Clock } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import ShareButtons from "@/components/ShareButtons";
import { useRecentlyViewed } from "@/hooks/useRecentlyViewed";
import fbPixel from "@/hooks/useFacebookPixel";
import { trackProductView, trackProductPurchase, trackProductClick, trackAddToCart } from "@/hooks/useProductTracking";
import { useVendorById, useVendorProducts } from "@/hooks/useVendors";
import { motion, AnimatePresence } from "motion/react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import payMtn from "@/assets/pay-mtn.png";
import payMoov from "@/assets/pay-moov.png";
import payOrange from "@/assets/pay-orange.png";
import payWave from "@/assets/pay-wave.png";
import payVisa from "@/assets/pay-visa.png";
import payMastercard from "@/assets/pay-mastercard.png";
import { formatCurrency } from "@/lib/currency";
import { contentToPlainText, parseProductContent } from "@/lib/productContent";

interface CurriculumLesson {
  id: string;
  title: string;
  order_index: number;
  is_preview?: boolean;
}

interface CurriculumChapter {
  id: string;
  title: string;
  lessons?: CurriculumLesson[];
}

interface CurriculumClient {
  from: (table: string) => {
    select: (columns: string) => {
      eq: (column: string, value: string) => {
        order: (column: string, options: { ascending: boolean }) => Promise<{
          data: CurriculumChapter[] | null;
          error: { message: string } | null;
        }>;
      };
    };
  };
}

const ProductDetail = () => {
  const { id } = useParams<{ id: string }>();
  const location = useLocation();
  const requestedSource = new URLSearchParams(location.search).get("source");
  const sourceChannel = requestedSource === "marketplace" || requestedSource === "storefront" || requestedSource === "direct"
    ? requestedSource
    : undefined;
  const { data: product, isLoading } = useProduct(id || "", sourceChannel);
  const { data: allProducts = [] } = useProducts();
  const { data: reviews = [] } = useProductReviews(id || "");
  const { addToCart } = useCart();
  const navigate = useNavigate();
  const { addViewed } = useRecentlyViewed();
  const { data: vendor } = useVendorById(product?.vendorId);
  const { data: vendorProducts = [] } = useVendorProducts(product?.vendorId);
  const [activeTab, setActiveTab] = useState<"description" | "avis">("description");
  const [currentImage, setCurrentImage] = useState(0);

  // LMS Curriculum data
  const { data: chapters = [] } = useQuery<CurriculumChapter[]>({
    queryKey: ['product-curriculum', id],
    queryFn: async () => {
      if (!id) return [];
      const curriculumClient = supabase as unknown as CurriculumClient;
      const { data, error } = await curriculumClient
        .from('course_chapters')
        .select(`*, lessons:course_lessons(*)`)
        .eq('course_id', id)
        .order('order_index', { ascending: true });
      
      if (error) throw error;
      return (data || []).map((chapter) => ({
        ...chapter,
        lessons: [...(chapter.lessons || [])].sort((a, b) => a.order_index - b.order_index)
      }));
    },
    enabled: !!id
  });

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
      trackProductClick(product.id);
      addToCart(product);
      trackAddToCart(product.id);
      const price = parseFloat(product.price.replace(/[^\d.,]/g, "").replace(",", ".")) || 0;
      fbPixel.initiateCheckout({
        content_ids: [product.id],
        value: price,
        currency: "XOF",
        num_items: 1,
      });
      sessionStorage.setItem("mindhubs:last-source", sourceChannel || "direct");
      if (product.paymentLink && !product.vendorId) {
        window.open(product.paymentLink, "_blank", "noopener,noreferrer");
      } else {
        navigate("/checkout");
      }
    }
  };

  if (isLoading && !product) {
    return (
      <div className="min-h-screen bg-background aurora-bg">
        <Navbar />
        <div className="container mx-auto px-4 pt-36">
           <div className="max-w-6xl mx-auto grid lg:grid-cols-2 gap-12">
              <div className="aspect-square rounded-2xl bg-muted/50 animate-pulse" />
              <div className="space-y-8 py-10">
                 <div className="h-6 w-24 bg-muted/50 rounded-full animate-pulse" />
                 <div className="h-16 w-3/4 bg-muted/50 rounded-xl animate-pulse" />
                 <div className="h-4 w-1/2 bg-muted/50 rounded-full animate-pulse" />
                 <div className="h-64 w-full bg-muted/50 rounded-2xl animate-pulse" />
              </div>
           </div>
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
  const contentBlocks = parseProductContent(product.description);
  const seoDescription = contentBlocks ? contentToPlainText(contentBlocks).slice(0, 160) : product.description;
  const isPhysical = product.productMode === "physical";
  const isHybrid = product.productMode === "hybrid";
  const isOutOfStock = (isPhysical || isHybrid) && product.inventoryQuantity === 0;
  const deliveryLabel = isPhysical || isHybrid ? "Livraison selon les modalités du vendeur" : "Accès digital après confirmation du paiement";

  return (
    <div className="min-h-screen bg-background aurora-bg">
      <SEO 
        title={product.title} 
        description={seoDescription}
        path={`/produit/${product.id}`}
        type="product"
        image={allImages[0]}
        keywords={`${product.title}, ${product.category}, formation digitale, mindhub expertise, kit business africain, réussir en ligne`}
        jsonLd={{
          "@context": "https://schema.org",
          "@type": "Product",
          name: product.title,
          image: allImages,
          description: product.description,
          category: product.category,
          sku: product.id,
          brand: vendor ? {
            "@type": "Brand",
            name: vendor.shop_name
          } : undefined,
          offers: {
            "@type": "Offer",
            url: window.location.href,
            priceCurrency: "XOF",
            price: priceNum,
            itemCondition: "https://schema.org/NewCondition",
            availability: "https://schema.org/InStock"
          },
          aggregateRating: reviews.length > 0 ? {
            "@type": "AggregateRating",
            ratingValue: (reviews.reduce((acc, r) => acc + r.rating, 0) / reviews.length).toFixed(1),
            reviewCount: reviews.length.toString()
          } : undefined
        }} 
      />
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
               <div className="glass-card overflow-hidden relative rounded-2xl group">
                  {discountPct > 0 && (
                    <Badge className="absolute top-6 left-6 z-10 bg-destructive text-destructive-foreground border-none px-4 py-1.5 font-black text-xs tracking-widest shadow-xl">
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
                        className={`w-24 h-24 rounded-xl overflow-hidden border-2 shrink-0 transition-all ${i === currentImage ? "border-primary scale-105" : "border-border opacity-60 hover:opacity-100"}`}
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
                     <Badge variant="outline" className="gap-1 rounded-full px-3 py-1 text-[10px] font-black uppercase">
                        {isPhysical || isHybrid ? <Package size={11} /> : <FileText size={11} />}
                        {isPhysical ? "Physique" : isHybrid ? "Hybride" : "Digital"}
                     </Badge>
                     {sourceChannel === "storefront" && vendor && <Badge variant="outline" className="rounded-full px-3 py-1 text-[10px] font-black uppercase">Depuis la boutique</Badge>}
                     {sourceChannel === "marketplace" && <Badge variant="outline" className="rounded-full px-3 py-1 text-[10px] font-black uppercase">Marketplace</Badge>}
                  </div>
                  <h1 className="text-4xl md:text-6xl font-black tracking-tighter leading-[0.95]">{product.title}</h1>
                  <div className="flex items-center gap-4">
                     <div className="flex gap-0.5">
                        {Array.from({ length: 5 }).map((_, i) => (
                          <Star key={i} size={14} className={i < 5 ? "text-primary fill-primary" : "text-muted-foreground/30"} />
                        ))}
                     </div>
                     <span className="text-xs font-black text-muted-foreground uppercase tracking-widest">{reviews.length > 0 ? `${reviews.length} avis` : "Aucun avis pour l'instant"}</span>
                  </div>
               </div>

               <div className="glass-card rounded-2xl p-6 md:p-8 space-y-8">
                  <div className="flex items-end gap-4">
                     <div className="space-y-1">
                        <p className="text-xs font-black text-muted-foreground uppercase tracking-widest line-through">{formatCurrency(product.oldPrice)}</p>
                        <p className="text-5xl font-black text-foreground tracking-tighter">{formatCurrency(product.price)}</p>
                     </div>
                     {discountPct > 0 && (
                       <Badge className="mb-2 bg-success text-success-foreground border-none px-3 py-1 font-black text-[10px]">ÉCONOMIE {discountPct}%</Badge>
                     )}
                  </div>

                  <div className="flex flex-wrap items-center gap-3 text-xs font-bold text-muted-foreground">
                     <span className="flex items-center gap-2"><ShieldCheck size={14} className="text-success" /> Protection acheteur</span>
                     <span className="flex items-center gap-2"><Clock size={14} /> {deliveryLabel}</span>
                     {(isPhysical || isHybrid) && product.inventoryQuantity !== undefined && (
                       <span className={isOutOfStock ? "text-destructive" : "text-success"}>
                         {isOutOfStock ? "Rupture de stock" : `${product.inventoryQuantity} disponible${product.inventoryQuantity > 1 ? "s" : ""}`}
                       </span>
                     )}
                  </div>

                  <div className="space-y-4">
                     <Button 
                       onClick={handleBuyNow}
                       disabled={isOutOfStock}
                       className="w-full h-14 rounded-xl btn-glow font-semibold text-base gap-3 disabled:cursor-not-allowed disabled:opacity-60"
                     >
                        {isOutOfStock ? "Produit indisponible" : product.vendorId ? "Ajouter au panier et continuer" : "Obtenir mon accès"} <Zap size={22} fill="currentColor" />
                     </Button>
                     <div className="flex flex-wrap items-center justify-center gap-6">
                        <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-muted-foreground">
                           <ShieldCheck size={14} className="text-primary" /> Sécurisé par SSL
                        </div>
                        <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-muted-foreground">
                           <Zap size={14} className="text-warning" /> {deliveryLabel}
                        </div>
                     </div>
                  </div>

                  {vendor && (
                  <div className="pt-6 border-t border-border flex items-center justify-between">
                       <div className="flex items-center gap-3">
                          <div className="h-10 w-10 rounded-xl bg-muted overflow-hidden border border-border">
                             {vendor.avatar_url ? <img src={vendor.avatar_url} className="h-full w-full object-cover" /> : <Store size={20} />}
                          </div>
                          <div>
                             <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">Expert Vendeur</p>
                             <Link to={`/store/${vendor.username}`} className="text-sm font-black hover:text-primary transition-colors flex items-center gap-1">
                                {vendor.shop_name} {vendor.verified && <BadgeCheck size={14} className="text-primary" />}
                             </Link>
                          </div>
                       </div>
                       <Button asChild variant="outline" className="rounded-lg h-10 px-4 font-medium text-xs" aria-label={`Voir la boutique de ${vendor.shop_name}`}>
                          <Link to={`/store/${vendor.username}`}>Voir Boutique</Link>
                       </Button>
                    </div>
                  )}
               </div>

               <TrustBlock productMode={product.productMode} />
            </motion.div>
          </div>
        </div>
      </section>

      {/* Tabs Section */}
      <section className="container mx-auto px-4 py-12">
         <div className="mx-auto max-w-5xl">
            <div className="flex gap-2 mb-4">
               <button 
                 onClick={() => setActiveTab("description")}
                 className={`rounded-t-xl px-5 py-3 text-xs font-semibold uppercase tracking-wide transition-colors ${activeTab === "description" ? "border-x border-t border-border bg-card text-card-foreground" : "text-muted-foreground hover:text-foreground"}`}
               >
                  Détails & Programme
               </button>
               <button 
                 onClick={() => setActiveTab("avis")}
                 className={`rounded-t-xl px-5 py-3 text-xs font-semibold uppercase tracking-wide transition-colors ${activeTab === "avis" ? "border-x border-t border-border bg-card text-card-foreground" : "text-muted-foreground hover:text-foreground"}`}
               >
                  Avis Experts ({reviews.length})
               </button>
            </div>
            <div className="rounded-2xl border border-border bg-card p-6 text-card-foreground md:p-10">
                {activeTab === "description" ? (
                  <div className="space-y-12">
                     {product.is_lms && chapters.length > 0 && (
                       <div className="space-y-6">
                         <h3 className="text-2xl font-black flex items-center gap-3"><BookOpen className="text-primary" /> Programme de la formation</h3>
                         <Accordion type="multiple" defaultValue={[chapters[0]?.id]} className="space-y-4">
                           {chapters.map((chapter, idx: number) => (
                             <AccordionItem key={chapter.id} value={chapter.id} className="overflow-hidden rounded-xl border border-border bg-muted px-5">
                               <AccordionTrigger className="hover:no-underline py-6">
                                 <div className="flex items-center gap-4 text-left">
                                   <div className="h-10 w-10 rounded-2xl bg-primary/10 flex items-center justify-center text-primary font-black text-sm">{idx + 1}</div>
                                   <div>
                                     <h4 className="font-black text-lg leading-tight">{chapter.title}</h4>
                                     <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mt-1">{chapter.lessons?.length || 0} Leçons</p>
                                   </div>
                                 </div>
                               </AccordionTrigger>
                               <AccordionContent className="pb-6">
                                 <div className="space-y-3 pl-14">
                                   {chapter.lessons?.map((lesson) => (
                                     <div key={lesson.id} className="group flex items-center justify-between rounded-lg border border-border bg-background p-3 transition-colors hover:border-primary/50">
                                       <div className="flex items-center gap-3">
                                          <div className="h-2 w-2 rounded-full bg-primary/40 group-hover:bg-primary transition-colors" />
                                          <span className="text-sm font-medium">{lesson.title}</span>
                                       </div>
                                       {lesson.is_preview ? (
                                         <Badge className="bg-primary/20 text-primary border-none text-[8px] font-black uppercase">Aperçu Gratuit</Badge>
                                       ) : (
                                         <Lock size={12} className="text-muted-foreground/30" />
                                       )}
                                     </div>
                                   ))}
                                 </div>
                               </AccordionContent>
                             </AccordionItem>
                           ))}
                         </Accordion>
                       </div>
                     )}

                     <div className="grid md:grid-cols-2 gap-8">
                       <div className="space-y-6">
                          <h3 className="text-2xl font-black flex items-center gap-3"><Sparkles className="text-primary" /> Ce que vous allez maîtriser</h3>
                          <div className="space-y-4">
                             {keyFeatures.map((f, i) => (
                               <div key={i} className="flex items-start gap-4 rounded-xl border border-border bg-muted p-4">
                                  <div className="h-6 w-6 rounded-lg bg-primary/20 text-primary flex items-center justify-center shrink-0 mt-0.5"><Zap size={14} fill="currentColor" /></div>
                                  <p className="text-sm font-medium leading-relaxed">{f}</p>
                               </div>
                             ))}
                          </div>
                       </div>
                       <div className="space-y-6">
                           <h3 className="text-2xl font-black flex items-center gap-3"><ShieldCheck className="text-primary" /> Paiement & Sécurité</h3>
                           <div className="space-y-6 rounded-3xl border border-primary/20 bg-primary/5 p-6">
                              <div className="flex flex-wrap gap-3 justify-center">
                                 <img src={payMtn} className="h-8 w-auto rounded shadow-sm" alt="MTN" />
                                 <img src={payMoov} className="h-8 w-auto rounded shadow-sm" alt="Moov" />
                                 <img src={payOrange} className="h-8 w-auto rounded shadow-sm" alt="Orange" />
                                 <img src={payWave} className="h-8 w-auto rounded shadow-sm" alt="Wave" />
                                 <img src={payVisa} className="h-8 w-auto rounded shadow-sm" alt="Visa" />
                                 <img src={payMastercard} className="h-8 w-auto rounded shadow-sm" alt="Mastercard" />
                              </div>
                              <div className="space-y-3 border-t border-primary/10 pt-4">
                                 <div className="flex items-center gap-3 text-xs font-bold uppercase tracking-widest"><ShieldCheck size={16} className="text-success" /> Transaction Chiffrée SSL</div>
                                 <div className="flex items-center gap-3 text-xs font-bold uppercase tracking-widest"><Zap size={16} className="text-warning" /> {deliveryLabel}</div>
                                 <div className="flex items-center gap-3 text-xs font-bold uppercase tracking-widest"><BadgeCheck size={16} className="text-primary" /> Assistance liée à la commande</div>
                              </div>
                           </div>
                       </div>
                    </div>
                    
                    {contentBlocks ? <ProductContentRenderer blocks={contentBlocks} /> : <div className="prose max-w-none prose-p:font-medium prose-p:leading-relaxed prose-p:text-muted-foreground prose-strong:font-black prose-strong:text-foreground">
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
                    </div>}
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
               <div className="flex-1 h-px bg-border" />
            </div>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
               {similar.map((p) => (
                 <ProductCard key={p.id} product={p} />
               ))}
            </div>
         </div>
      </section>

      <FooterSection />
      <StickyProductCTA productTitle={product.title} price={product.price} oldPrice={product.oldPrice} onBuy={handleBuyNow} />
    </div>
  );
};

function extractFeatures(desc?: string): string[] {
  if (!desc) return [];
  const features: string[] = [];
  const lines = desc.split("\n");
  for (const line of lines) {
    const trimmed = line.trim();
    if ((trimmed.startsWith("- ") || trimmed.startsWith("• ") || /^\d+[.)]\s/.test(trimmed)) && trimmed.length > 10 && trimmed.length < 120) {
      features.push(trimmed.replace(/^[-•]\s*/, "").replace(/^\d+[.)]\s*/, "").replace(/\*\*/g, "").trim());
      if (features.length >= 6) break;
    }
  }
  return features.length > 0 ? features : ["Formation complète pas à pas", "Accès illimité 24h/24", "Paiement unique sécurisé", "Satisfait ou remboursé"];
}

export default ProductDetail;

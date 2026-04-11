import { Link } from "react-router-dom";
import Navbar from "@/components/Navbar";
import FooterSection from "@/components/FooterSection";
import ProductCard from "@/components/ProductCard";
import { useCart } from "@/contexts/CartContext";
import { useProducts } from "@/hooks/useProducts";
import { Trash2, Plus, Minus, ShoppingBag } from "lucide-react";
import AnimateOnScroll from "@/components/AnimateOnScroll";
import SEO from "@/components/SEO";

const CartPage = () => {
  const { items, removeFromCart, updateQuantity, clearCart, totalPrice } = useCart();
  const { data: allProducts = [] } = useProducts();

  const cartCategories = [...new Set(items.map((i) => i.product.category))];
  const cartIds = new Set(items.map((i) => i.product.id));
  const crossSell = allProducts
    .filter((p) => cartCategories.includes(p.category) && !cartIds.has(p.id))
    .slice(0, 3);

  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-background">
        <SEO title="Panier" description="Votre panier MindHub" path="/panier" />
        <Navbar />
        <section className="pt-32 pb-16 sm:pb-20">
          <div className="container mx-auto px-4 text-center">
            <AnimateOnScroll>
              <div className="stat-card rounded-xl sm:rounded-2xl py-12 sm:py-16 px-6 sm:px-8 max-w-lg mx-auto space-y-5 sm:space-y-6">
                <ShoppingBag className="mx-auto text-muted-foreground" size={48} />
                <h1 className="text-xl sm:text-2xl font-bold text-foreground">Votre panier est vide</h1>
                <p className="text-muted-foreground text-xs sm:text-sm">Découvrez nos formations et ajoutez-les à votre panier</p>
                <Link to="/boutique" className="btn-primary-brand inline-block px-6 sm:px-8 py-2.5 sm:py-3 rounded-full font-semibold text-xs sm:text-sm hover-scale">
                  VOIR NOS FORMATIONS
                </Link>
              </div>
            </AnimateOnScroll>
          </div>
        </section>
        <FooterSection />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <SEO title="Panier" description="Votre panier MindHub" path="/panier" />
      <Navbar />

      <section className="pt-28 sm:pt-24">
        <div className="relative py-6 sm:py-12 text-center overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-b from-primary/20 via-primary/5 to-transparent" />
          <h1 className="relative text-xl sm:text-3xl md:text-4xl font-bold text-foreground">Mon Panier</h1>
        </div>
      </section>

      <section className="container mx-auto px-4 pb-8 sm:pb-10">
        <div className="grid lg:grid-cols-3 gap-6 sm:gap-8 max-w-5xl mx-auto">
          <div className="lg:col-span-2 space-y-3 sm:space-y-4">
            {items.map((item, idx) => (
              <AnimateOnScroll key={item.product.id} delay={idx * 100}>
                <div className="stat-card rounded-xl p-3 sm:p-4 flex gap-3 sm:gap-4 items-center">
                  <Link to={`/produit/${item.product.id}`}>
                    <img src={item.product.image} alt={item.product.title} className="w-16 h-16 sm:w-20 sm:h-20 rounded-lg object-cover shrink-0 hover-scale" />
                  </Link>
                  <div className="flex-1 min-w-0 space-y-1">
                    <Link to={`/produit/${item.product.id}`}>
                      <h3 className="text-foreground font-semibold text-xs sm:text-sm truncate hover:text-primary transition-colors">{item.product.title}</h3>
                    </Link>
                    <div className="flex items-center gap-2">
                      <span className="text-muted-foreground line-through text-[10px] sm:text-xs">{item.product.oldPrice}</span>
                      <span className="text-accent font-bold text-xs sm:text-sm">{item.product.price}</span>
                    </div>
                    <div className="flex items-center gap-2 mt-1.5 sm:mt-2">
                      <button onClick={() => updateQuantity(item.product.id, item.quantity - 1)} className="w-7 h-7 sm:w-8 sm:h-8 rounded-full border border-border flex items-center justify-center text-muted-foreground hover:text-foreground hover:border-primary transition-colors">
                        <Minus size={12} />
                      </button>
                      <span className="text-foreground font-semibold text-xs sm:text-sm w-5 sm:w-6 text-center">{item.quantity}</span>
                      <button onClick={() => updateQuantity(item.product.id, item.quantity + 1)} className="w-7 h-7 sm:w-8 sm:h-8 rounded-full border border-border flex items-center justify-center text-muted-foreground hover:text-foreground hover:border-primary transition-colors">
                        <Plus size={12} />
                      </button>
                    </div>
                  </div>
                  <button onClick={() => removeFromCart(item.product.id)} className="text-muted-foreground hover:text-destructive transition-colors p-1.5 sm:p-2 hover-scale">
                    <Trash2 size={16} />
                  </button>
                </div>
              </AnimateOnScroll>
            ))}
            <button onClick={clearCart} className="text-xs sm:text-sm text-muted-foreground hover:text-destructive transition-colors underline">
              Vider le panier
            </button>
          </div>

          <AnimateOnScroll delay={200}>
            <div className="stat-card rounded-xl sm:rounded-2xl p-5 sm:p-6 space-y-5 sm:space-y-6 sticky top-24">
              <h2 className="text-base sm:text-lg font-bold text-foreground">Récapitulatif</h2>
              <div className="space-y-2 sm:space-y-3 border-b border-border pb-4">
                {items.map((item) => (
                  <div key={item.product.id} className="flex justify-between text-xs sm:text-sm">
                    <span className="text-muted-foreground truncate mr-2">{item.product.title}</span>
                    <span className="text-foreground font-medium whitespace-nowrap">x{item.quantity}</span>
                  </div>
                ))}
              </div>
              <div className="flex justify-between items-center">
                <span className="text-foreground font-bold text-sm sm:text-base">Total</span>
                <span className="text-accent font-bold text-lg sm:text-xl">{totalPrice.toLocaleString()} CFA</span>
              </div>
              <Link to="/checkout" className="block w-full btn-primary-brand py-2.5 sm:py-3 rounded-full font-semibold text-xs sm:text-sm tracking-wide hover-scale text-center shadow-glow">
                COMMANDER
              </Link>
              <Link to="/boutique" className="block text-center text-xs sm:text-sm text-primary hover:underline">
                ← Continuer mes achats
              </Link>
            </div>
          </AnimateOnScroll>
        </div>
      </section>

      {/* Cross-sell */}
      {crossSell.length > 0 && (
        <section className="container mx-auto px-4 pb-16 sm:pb-20">
          <div className="max-w-5xl mx-auto">
            <AnimateOnScroll>
              <div className="flex items-center gap-3 sm:gap-4 mb-5 sm:mb-6">
                <h2 className="text-sm sm:text-lg font-bold text-foreground whitespace-nowrap">Complétez votre formation</h2>
                <div className="flex-1 h-px bg-border" />
              </div>
            </AnimateOnScroll>
            <div className="grid grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
              {crossSell.map((p, i) => (
                <AnimateOnScroll key={p.id} delay={i * 100}>
                  <ProductCard product={p} />
                </AnimateOnScroll>
              ))}
            </div>
          </div>
        </section>
      )}

      <FooterSection />
    </div>
  );
};

export default CartPage;

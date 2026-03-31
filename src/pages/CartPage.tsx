import { Link } from "react-router-dom";
import Navbar from "@/components/Navbar";
import FooterSection from "@/components/FooterSection";
import { useCart } from "@/contexts/CartContext";
import { Trash2, Plus, Minus, ShoppingBag } from "lucide-react";
import AnimateOnScroll from "@/components/AnimateOnScroll";

const CartPage = () => {
  const { items, removeFromCart, updateQuantity, clearCart, totalPrice } = useCart();

  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <section className="pt-32 pb-20">
          <div className="container mx-auto px-4 text-center">
            <AnimateOnScroll>
              <div className="stat-card rounded-2xl py-16 px-8 max-w-lg mx-auto space-y-6">
                <ShoppingBag className="mx-auto text-muted-foreground" size={64} />
                <h1 className="text-2xl font-bold text-foreground">Votre panier est vide</h1>
                <p className="text-muted-foreground text-sm">Découvrez nos formations et ajoutez-les à votre panier</p>
                <Link to="/boutique" className="btn-primary-brand inline-block px-8 py-3 rounded-full font-semibold text-sm hover-scale">
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
      <Navbar />

      <section className="pt-16">
        <div className="relative py-12 text-center overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-b from-primary/20 via-primary/5 to-transparent" />
          <h1 className="relative text-3xl md:text-4xl font-bold text-foreground">Mon Panier</h1>
        </div>
      </section>

      <section className="container mx-auto px-4 pb-20">
        <div className="grid lg:grid-cols-3 gap-8 max-w-5xl mx-auto">
          {/* Items */}
          <div className="lg:col-span-2 space-y-4">
            {items.map((item, idx) => (
              <AnimateOnScroll key={item.product.id} delay={idx * 100}>
                <div className="stat-card rounded-xl p-4 flex gap-4 items-center">
                  <Link to={`/produit/${item.product.id}`}>
                    <img
                      src={item.product.image}
                      alt={item.product.title}
                      className="w-20 h-20 rounded-lg object-cover shrink-0 hover-scale"
                    />
                  </Link>
                  <div className="flex-1 min-w-0 space-y-1">
                    <Link to={`/produit/${item.product.id}`}>
                      <h3 className="text-foreground font-semibold text-sm truncate hover:text-primary transition-colors">
                        {item.product.title}
                      </h3>
                    </Link>
                    <div className="flex items-center gap-2">
                      <span className="text-muted-foreground line-through text-xs">{item.product.oldPrice}</span>
                      <span className="text-accent font-bold text-sm">{item.product.price}</span>
                    </div>
                    <div className="flex items-center gap-2 mt-2">
                      <button
                        onClick={() => updateQuantity(item.product.id, item.quantity - 1)}
                        className="w-7 h-7 rounded-full border border-border flex items-center justify-center text-muted-foreground hover:text-foreground hover:border-primary transition-colors"
                      >
                        <Minus size={14} />
                      </button>
                      <span className="text-foreground font-semibold text-sm w-6 text-center">{item.quantity}</span>
                      <button
                        onClick={() => updateQuantity(item.product.id, item.quantity + 1)}
                        className="w-7 h-7 rounded-full border border-border flex items-center justify-center text-muted-foreground hover:text-foreground hover:border-primary transition-colors"
                      >
                        <Plus size={14} />
                      </button>
                    </div>
                  </div>
                  <button
                    onClick={() => removeFromCart(item.product.id)}
                    className="text-muted-foreground hover:text-destructive transition-colors p-2 hover-scale"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              </AnimateOnScroll>
            ))}

            <button onClick={clearCart} className="text-sm text-muted-foreground hover:text-destructive transition-colors underline">
              Vider le panier
            </button>
          </div>

          {/* Summary */}
          <AnimateOnScroll delay={200}>
            <div className="stat-card rounded-2xl p-6 space-y-6 sticky top-24">
              <h2 className="text-lg font-bold text-foreground">Récapitulatif</h2>
              <div className="space-y-3 border-b border-border pb-4">
                {items.map((item) => (
                  <div key={item.product.id} className="flex justify-between text-sm">
                    <span className="text-muted-foreground truncate mr-2">{item.product.title}</span>
                    <span className="text-foreground font-medium whitespace-nowrap">x{item.quantity}</span>
                  </div>
                ))}
              </div>
              <div className="flex justify-between items-center">
                <span className="text-foreground font-bold">Total</span>
                <span className="text-accent font-bold text-xl">{totalPrice.toLocaleString()} CFA</span>
              </div>
              <button className="w-full btn-primary-brand py-3 rounded-full font-semibold text-sm tracking-wide hover-scale">
                COMMANDER
              </button>
              <Link to="/boutique" className="block text-center text-sm text-primary hover:underline">
                ← Continuer mes achats
              </Link>
            </div>
          </AnimateOnScroll>
        </div>
      </section>

      <FooterSection />
    </div>
  );
};

export default CartPage;

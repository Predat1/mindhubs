import { Link } from "react-router-dom";
import Navbar from "@/components/Navbar";
import FooterSection from "@/components/FooterSection";
import ProductCard from "@/components/ProductCard";
import { useCart } from "@/contexts/CartContext";
import { useProducts } from "@/hooks/useProducts";
import { Trash2, Plus, Minus, ShoppingBag, ArrowLeft, ShieldCheck, Zap } from "lucide-react";
import AnimateOnScroll from "@/components/AnimateOnScroll";
import SEO from "@/components/SEO";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

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
      <div className="min-h-screen bg-background aurora-bg">
        <SEO title="Panier" description="Votre panier MindHub" path="/panier" />
        <Navbar />
        <section className="pt-48 pb-20">
          <div className="container mx-auto px-4 text-center">
            <motion.div 
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="glass-card rounded-[3rem] py-20 px-8 max-w-xl mx-auto space-y-8"
            >
              <div className="h-24 w-24 bg-muted rounded-full flex items-center justify-center mx-auto text-muted-foreground">
                 <ShoppingBag size={48} />
              </div>
              <div className="space-y-2">
                 <h1 className="text-3xl font-black">Votre panier est vide</h1>
                 <p className="text-muted-foreground font-medium">Découvrez nos formations et commencez votre transformation.</p>
              </div>
              <Button asChild className="h-14 rounded-2xl px-10 btn-glow font-black text-lg">
                 <Link to="/boutique">Explorer la Boutique</Link>
              </Button>
            </motion.div>
          </div>
        </section>
        <FooterSection />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background aurora-bg">
      <SEO title="Panier" description="Votre panier MindHub" path="/panier" />
      <Navbar />

      <section className="pt-32 pb-12">
        <div className="container mx-auto px-4">
           <motion.div 
             initial={{ opacity: 0, y: 20 }}
             animate={{ opacity: 1, y: 0 }}
             className="max-w-5xl mx-auto flex items-center justify-between"
           >
              <h1 className="text-4xl md:text-6xl font-black tracking-tighter">Mon <span className="text-gradient-primary italic">Panier</span></h1>
              <Badge className="bg-primary/20 text-primary border-none font-black px-4 py-1.5">{items.length} Article{items.length > 1 ? "s" : ""}</Badge>
           </motion.div>
        </div>
      </section>

      <section className="container mx-auto px-4 pb-20">
        <div className="grid lg:grid-cols-3 gap-8 max-w-5xl mx-auto">
          
          {/* Items List */}
          <div className="lg:col-span-2 space-y-4">
            <AnimatePresence>
              {items.map((item, idx) => (
                <motion.div 
                  key={item.product.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  transition={{ delay: idx * 0.1 }}
                  className="glass-card rounded-[2rem] p-4 flex gap-6 items-center border-white/5 bg-card/40"
                >
                   <Link to={`/produit/${item.product.id}`} className="shrink-0 h-24 w-24 rounded-2xl overflow-hidden border border-white/5">
                      <img src={item.product.image} alt={item.product.title} className="h-full w-full object-cover" />
                   </Link>
                   
                   <div className="flex-1 min-w-0 space-y-2">
                      <Link to={`/produit/${item.product.id}`}>
                        <h3 className="text-foreground font-black text-sm leading-tight line-clamp-1 hover:text-primary transition-colors">{item.product.title}</h3>
                      </Link>
                      <div className="flex items-center gap-3">
                        <span className="text-muted-foreground line-through text-[10px] font-bold">{item.product.oldPrice}</span>
                        <span className="text-foreground font-black text-lg">{item.product.price}</span>
                      </div>
                      
                      <div className="flex items-center gap-4 pt-1">
                        <div className="flex items-center bg-muted/30 rounded-xl p-1 border border-white/5">
                           <button onClick={() => updateQuantity(item.product.id, item.quantity - 1)} className="h-7 w-7 rounded-lg hover:bg-white/10 flex items-center justify-center text-muted-foreground transition-colors">
                             <Minus size={14} />
                           </button>
                           <span className="text-foreground font-black text-sm w-8 text-center">{item.quantity}</span>
                           <button onClick={() => updateQuantity(item.product.id, item.quantity + 1)} className="h-7 w-7 rounded-lg hover:bg-white/10 flex items-center justify-center text-muted-foreground transition-colors">
                             <Plus size={14} />
                           </button>
                        </div>
                        <button onClick={() => removeFromCart(item.product.id)} className="text-muted-foreground hover:text-destructive transition-all flex items-center gap-1.5 text-[10px] font-black uppercase tracking-widest">
                           <Trash2 size={14} /> Retirer
                        </button>
                      </div>
                   </div>
                </motion.div>
              ))}
            </AnimatePresence>
            
            <button onClick={clearCart} className="text-[10px] font-black uppercase tracking-widest text-muted-foreground hover:text-destructive transition-colors ml-4">
              Vider l'intégralité du panier
            </button>
          </div>

          {/* Summary Sidebar */}
          <div className="lg:col-span-1">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="glass-card rounded-[2.5rem] p-8 space-y-8 sticky top-24 border-primary/20 shadow-primary/5"
            >
              <h2 className="text-xl font-black">Récapitulatif</h2>
              
              <div className="space-y-4 border-b border-white/5 pb-6">
                {items.map((item) => (
                  <div key={item.product.id} className="flex justify-between gap-4">
                    <span className="text-xs font-medium text-muted-foreground truncate flex-1">{item.product.title}</span>
                    <span className="text-xs font-black text-foreground shrink-0">x{item.quantity}</span>
                  </div>
                ))}
              </div>

              <div className="space-y-2">
                 <div className="flex justify-between items-center text-xs text-muted-foreground font-bold uppercase tracking-widest">
                    <span>Sous-total</span>
                    <span>{totalPrice.toLocaleString()} FCFA</span>
                 </div>
                 <div className="flex justify-between items-center">
                    <span className="text-lg font-black">Total</span>
                    <span className="text-2xl font-black text-primary">{totalPrice.toLocaleString()} FCFA</span>
                 </div>
              </div>

              <div className="space-y-4">
                 <Button asChild className="w-full h-14 rounded-2xl btn-glow font-black text-lg gap-3">
                    <Link to="/checkout">Paiement Sécurisé <Zap size={20} fill="currentColor" /></Link>
                 </Button>
                 <Link to="/boutique" className="flex items-center justify-center gap-2 text-xs font-black text-muted-foreground hover:text-primary uppercase tracking-widest transition-colors">
                    <ArrowLeft size={14} /> Continuer mes achats
                 </Link>
              </div>

              <div className="pt-4 flex flex-col gap-3">
                 <div className="flex items-center gap-2 text-[10px] font-bold text-muted-foreground">
                    <ShieldCheck size={14} className="text-emerald-500" /> Transactions cryptées SSL
                 </div>
                 <div className="flex items-center gap-2 text-[10px] font-bold text-muted-foreground">
                    <Zap size={14} className="text-amber-500" /> Accès immédiat après achat
                 </div>
              </div>
            </motion.div>
          </div>

        </div>
      </section>

      {/* Cross-sell */}
      {crossSell.length > 0 && (
        <section className="container mx-auto px-4 pb-24">
          <div className="max-w-5xl mx-auto space-y-8">
            <div className="flex items-center gap-4">
               <h2 className="text-xl font-black">Vous pourriez aussi aimer...</h2>
               <div className="flex-1 h-px bg-white/5" />
            </div>
            <div className="grid grid-cols-2 lg:grid-cols-3 gap-6">
              {crossSell.map((p) => (
                <ProductCard key={p.id} product={p} />
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

import { useState, useEffect } from "react";
import fbPixel from "@/hooks/useFacebookPixel";
import { Link, useNavigate } from "react-router-dom";
import Navbar from "@/components/Navbar";
import FooterSection from "@/components/FooterSection";
import SEO from "@/components/SEO";
import AnimateOnScroll from "@/components/AnimateOnScroll";
import { useCart } from "@/contexts/CartContext";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "@/hooks/use-toast";
import { ShieldCheck, ArrowLeft, CheckCircle2, Trash2, Loader2, Zap, Lock, CreditCard, Smartphone } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

const Checkout = () => {
  const { items, totalPrice, clearCart, removeFromCart } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [confirmed, setConfirmed] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({ name: "", email: "", phone: "", paymentMethod: "mobile_money" });

  useEffect(() => {
    if (items.length === 1 && items[0].product.paymentLink) {
      window.open(items[0].product.paymentLink, "_blank", "noopener,noreferrer");
      navigate("/boutique", { replace: true });
    }
  }, [items, navigate]);

  const update = (field: string, value: string) => setForm((p) => ({ ...p, [field]: value }));

  if (items.length === 0 && !confirmed) {
    return (
      <div className="min-h-screen bg-background aurora-bg">
        <SEO title="Checkout" description="Finalisez votre commande MindHub" path="/checkout" />
        <Navbar />
        <section className="pt-48 pb-20 container mx-auto px-4 text-center">
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="glass-card rounded-[3rem] py-20 px-8 max-w-xl mx-auto space-y-8"
          >
            <h1 className="text-3xl font-black">Votre panier est vide</h1>
            <Button asChild className="h-14 rounded-2xl px-10 btn-glow font-black text-lg">
               <Link to="/boutique">Explorer la Boutique</Link>
            </Button>
          </motion.div>
        </section>
        <FooterSection />
      </div>
    );
  }

  if (confirmed) {
    return (
      <div className="min-h-screen bg-background aurora-bg">
        <SEO title="Commande confirmée" description="Votre commande est confirmée" path="/checkout" />
        <Navbar />
        <section className="pt-48 pb-20 container mx-auto px-4">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="glass-card rounded-[3.5rem] p-12 text-center space-y-8 max-w-2xl mx-auto border-emerald-500/20 shadow-emerald-500/10"
          >
            <div className="h-24 w-24 bg-emerald-500/20 rounded-full flex items-center justify-center mx-auto text-emerald-500 border border-emerald-500/30">
               <CheckCircle2 size={48} />
            </div>
            <div className="space-y-4">
               <h1 className="text-4xl font-black tracking-tighter">Félicitations !</h1>
               <p className="text-muted-foreground font-medium max-w-md mx-auto">
                 Merci <span className="text-foreground font-bold">{form.name}</span> ! Votre commande a été enregistrée avec succès. Vous recevrez un accès immédiat à vos ressources par email à <span className="text-primary font-bold">{form.email}</span>.
               </p>
            </div>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
               <Button asChild className="h-14 rounded-2xl px-10 btn-glow font-black text-lg">
                  <Link to="/boutique">Continuer mes Achats</Link>
               </Button>
               <Button asChild variant="outline" className="h-14 rounded-2xl px-10 border-white/10 font-black text-lg">
                  <Link to="/mon-compte">Accéder à ma Formation</Link>
               </Button>
            </div>
          </motion.div>
        </section>
        <FooterSection />
      </div>
    );
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim() || !form.email.trim() || !form.phone.trim()) {
      toast({ title: "Veuillez remplir tous les champs", variant: "destructive" });
      return;
    }
    setSubmitting(true);
    try {
      const orderItems = items.map((item) => ({
        product_id: item.product.id,
        title: item.product.title,
        price: item.product.price,
        quantity: item.quantity,
        image: item.product.image,
      }));
      const { error } = await supabase.from("orders").insert({
        user_id: user?.id ?? null,
        customer_name: form.name.trim(),
        customer_email: form.email.trim(),
        customer_phone: form.phone.trim(),
        payment_method: form.paymentMethod,
        total_price: totalPrice,
        items: orderItems,
        status: "pending",
      } as any);
      if (error) throw error;
      clearCart();
      setConfirmed(true);
      fbPixel.purchase({
        content_ids: items.map((i) => i.product.id),
        value: totalPrice,
        currency: "XOF",
        num_items: items.reduce((s, i) => s + i.quantity, 0),
      });
      toast({ title: "Commande confirmée ✅", description: "Merci pour votre achat !" });
    } catch (err: any) {
      toast({ title: "Erreur", description: err.message || "Une erreur est survenue", variant: "destructive" });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-background aurora-bg">
      <SEO title="Checkout Elite" description="Finalisez votre commande MindHub" path="/checkout" />
      <Navbar />

      <section className="pt-32 pb-24 container mx-auto px-4">
        <div className="max-w-6xl mx-auto">
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="mb-8"
          >
            <Link to="/panier" className="inline-flex items-center gap-2 text-xs font-black uppercase tracking-widest text-muted-foreground hover:text-primary transition-colors">
              <ArrowLeft size={14} /> Retour au Panier
            </Link>
            <h1 className="text-4xl md:text-6xl font-black tracking-tighter mt-4">Finaliser la <span className="text-gradient-primary italic">Commande</span></h1>
          </motion.div>

          <form onSubmit={handleSubmit} className="grid lg:grid-cols-5 gap-8 items-start">
            
            {/* Form Section */}
            <div className="lg:col-span-3 space-y-6">
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="glass-card rounded-[2.5rem] p-8 md:p-10 space-y-8"
              >
                <div className="flex items-center gap-4 border-b border-white/5 pb-6">
                   <div className="h-12 w-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary border border-primary/20">
                      <Lock size={24} />
                   </div>
                   <h2 className="text-2xl font-black tracking-tight">Informations de Facturation</h2>
                </div>

                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="name" className="text-xs font-black uppercase tracking-widest text-muted-foreground ml-1">Nom complet</Label>
                    <Input id="name" value={form.name} onChange={(e) => update("name", e.target.value)} placeholder="Jean Dupont" required className="h-14 rounded-2xl bg-white/5 border-white/10 focus:ring-primary/20 font-bold" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email" className="text-xs font-black uppercase tracking-widest text-muted-foreground ml-1">Adresse Email</Label>
                    <Input id="email" type="email" value={form.email} onChange={(e) => update("email", e.target.value)} placeholder="jean@exemple.com" required className="h-14 rounded-2xl bg-white/5 border-white/10 focus:ring-primary/20 font-bold" />
                  </div>
                  <div className="md:col-span-2 space-y-2">
                    <Label htmlFor="phone" className="text-xs font-black uppercase tracking-widest text-muted-foreground ml-1">Numéro Téléphone (WhatsApp)</Label>
                    <Input id="phone" type="tel" value={form.phone} onChange={(e) => update("phone", e.target.value)} placeholder="+225 07 XX XX XX XX" required className="h-14 rounded-2xl bg-white/5 border-white/10 focus:ring-primary/20 font-bold" />
                  </div>
                </div>

                <div className="space-y-4">
                  <Label className="text-xs font-black uppercase tracking-widest text-muted-foreground ml-1">Mode de Paiement Préféré</Label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {[
                      { value: "mobile_money", label: "Mobile Money / Wave", icon: Smartphone },
                      { value: "carte", label: "Carte Bancaire (Visa/Master)", icon: CreditCard },
                    ].map((m) => (
                      <button
                        key={m.value}
                        type="button"
                        onClick={() => update("paymentMethod", m.value)}
                        className={`p-5 rounded-2xl border-2 flex items-center gap-4 transition-all duration-300 ${
                          form.paymentMethod === m.value
                            ? "border-primary bg-primary/10 text-primary shadow-lg shadow-primary/10"
                            : "border-white/5 bg-white/5 text-muted-foreground hover:border-white/20 hover:bg-white/10"
                        }`}
                      >
                        <div className={`h-10 w-10 rounded-xl flex items-center justify-center ${form.paymentMethod === m.value ? "bg-primary text-white" : "bg-muted"}`}>
                           <m.icon size={20} />
                        </div>
                        <span className="font-black text-sm">{m.label}</span>
                      </button>
                    ))}
                  </div>
                </div>

                <div className="pt-6 border-t border-white/5 flex items-center gap-4 text-[10px] font-black uppercase tracking-widest text-muted-foreground">
                   <ShieldCheck size={18} className="text-emerald-500" />
                   Paiement Crypté et Sécurisé • Satisfaction Garantie
                </div>
              </motion.div>
            </div>

            {/* Sidebar Summary */}
            <div className="lg:col-span-2">
              <motion.div 
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.1 }}
                className="glass-card rounded-[2.5rem] p-8 md:p-10 space-y-8 sticky top-32 border-white/10"
              >
                <div className="flex items-center justify-between">
                   <h2 className="text-xl font-black">Récapitulatif</h2>
                   <Badge variant="outline" className="border-white/10 uppercase tracking-widest text-[9px] font-black">{items.length} Article{items.length > 1 ? "s" : ""}</Badge>
                </div>

                <div className="space-y-4 max-h-[30vh] overflow-y-auto pr-2 custom-scrollbar">
                  {items.map((item) => (
                    <div key={item.product.id} className="flex items-center gap-4 bg-white/5 p-3 rounded-2xl border border-white/5 relative group">
                      <img src={item.product.image} alt={item.product.title} className="w-14 h-14 rounded-xl object-cover shrink-0" />
                      <div className="flex-1 min-w-0">
                        <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest mb-1">{item.product.category}</p>
                        <p className="text-xs font-black text-foreground truncate">{item.product.title}</p>
                        <p className="text-[10px] font-bold text-primary mt-1">{item.product.price} (x{item.quantity})</p>
                      </div>
                      <button 
                        type="button" 
                        onClick={() => removeFromCart(item.product.id)} 
                        className="absolute -top-2 -right-2 h-7 w-7 bg-destructive text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity shadow-lg"
                      >
                         <Trash2 size={12} />
                      </button>
                    </div>
                  ))}
                </div>

                <div className="space-y-4 pt-6 border-t border-white/5">
                  <div className="flex justify-between items-center text-xs font-black uppercase tracking-widest text-muted-foreground">
                    <span>Total à Payer</span>
                    <span className="text-2xl text-foreground">{totalPrice.toLocaleString()} FCFA</span>
                  </div>
                  
                  <Button 
                    type="submit" 
                    disabled={submitting} 
                    className="w-full h-16 rounded-[2rem] btn-glow font-black text-lg gap-3 disabled:opacity-50"
                  >
                    {submitting ? (
                      <Loader2 className="animate-spin" size={24} />
                    ) : (
                      <>Confirmer & Payer <Zap size={22} fill="currentColor" /></>
                    )}
                  </Button>
                </div>

                <div className="space-y-3 pt-4">
                   <div className="flex items-center gap-3 text-[10px] font-bold text-muted-foreground">
                      <div className="h-6 w-6 rounded-full bg-emerald-500/10 flex items-center justify-center text-emerald-500"><CheckCircle2 size={12} /></div>
                      Accès immédiat après validation
                   </div>
                   <div className="flex items-center gap-3 text-[10px] font-bold text-muted-foreground">
                      <div className="h-6 w-6 rounded-full bg-primary/10 flex items-center justify-center text-primary"><Smartphone size={12} /></div>
                      Support WhatsApp dédié
                   </div>
                </div>
              </motion.div>
            </div>

          </form>
        </div>
      </section>

      <FooterSection />
    </div>
  );
};

export default Checkout;

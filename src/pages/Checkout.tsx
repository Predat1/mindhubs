import { useState, useEffect } from "react";
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
import { ShieldCheck, ArrowLeft, CheckCircle2, Trash2, Loader2 } from "lucide-react";

const Checkout = () => {
  const { items, totalPrice, clearCart, removeFromCart } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [confirmed, setConfirmed] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({ name: "", email: "", phone: "", paymentMethod: "mobile_money" });

  // If all items have payment links, redirect to the first one
  useEffect(() => {
    if (items.length === 1 && items[0].product.paymentLink) {
      window.open(items[0].product.paymentLink, "_blank", "noopener,noreferrer");
      navigate("/boutique", { replace: true });
    }
  }, [items, navigate]);

  const update = (field: string, value: string) => setForm((p) => ({ ...p, [field]: value }));

  if (items.length === 0 && !confirmed) {
    return (
      <div className="min-h-screen bg-background">
        <SEO title="Checkout" description="Finalisez votre commande MindHub" path="/checkout" />
        <Navbar />
        <section className="pt-28 sm:pt-32 pb-16 sm:pb-20 container mx-auto px-4 text-center">
          <AnimateOnScroll>
            <div className="stat-card rounded-xl sm:rounded-2xl py-12 sm:py-16 px-6 sm:px-8 max-w-lg mx-auto space-y-4 sm:space-y-6">
              <h1 className="text-lg sm:text-2xl font-bold text-foreground">Votre panier est vide</h1>
              <Link to="/boutique" className="btn-primary-brand inline-block px-6 sm:px-8 py-2.5 sm:py-3 rounded-full font-semibold text-xs sm:text-sm hover-scale">
                VOIR NOS FORMATIONS
              </Link>
            </div>
          </AnimateOnScroll>
        </section>
        <FooterSection />
      </div>
    );
  }

  if (confirmed) {
    return (
      <div className="min-h-screen bg-background">
        <SEO title="Commande confirmée" description="Votre commande est confirmée" path="/checkout" />
        <Navbar />
        <section className="pt-28 sm:pt-32 pb-16 sm:pb-20 container mx-auto px-4">
          <AnimateOnScroll>
            <div className="stat-card rounded-xl sm:rounded-2xl p-6 sm:p-8 text-center space-y-4 sm:space-y-6 max-w-lg mx-auto">
              <CheckCircle2 className="mx-auto text-accent" size={48} />
              <h1 className="text-lg sm:text-2xl font-bold text-foreground">Commande confirmée !</h1>
              <p className="text-muted-foreground text-xs sm:text-sm max-w-md mx-auto">
                Merci {form.name} ! Vous recevrez un email de confirmation à <span className="text-accent">{form.email}</span>.
              </p>
              <Link to="/boutique" className="btn-primary-brand inline-block px-6 sm:px-8 py-2.5 sm:py-3 rounded-full font-semibold text-xs sm:text-sm hover-scale">
                CONTINUER MES ACHATS
              </Link>
            </div>
          </AnimateOnScroll>
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
      toast({ title: "Commande confirmée ✅", description: "Merci pour votre achat !" });
    } catch (err: any) {
      toast({ title: "Erreur", description: err.message || "Une erreur est survenue", variant: "destructive" });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <SEO title="Checkout" description="Finalisez votre commande MindHub" path="/checkout" />
      <Navbar />

      <section className="pt-28 sm:pt-24 pb-16 sm:pb-20 container mx-auto px-4">
        <div className="max-w-4xl mx-auto">
          <AnimateOnScroll>
            <Link to="/panier" className="inline-flex items-center gap-1 text-xs sm:text-sm text-primary hover:underline mb-4 sm:mb-6">
              <ArrowLeft size={14} /> Retour au panier
            </Link>
          </AnimateOnScroll>

          <form onSubmit={handleSubmit} className="flex flex-col md:grid md:grid-cols-5 gap-4 sm:gap-6">
            {/* Form */}
            <div className="md:col-span-3">
              <AnimateOnScroll>
                <div className="stat-card rounded-xl sm:rounded-2xl p-4 sm:p-6 space-y-4 sm:space-y-5">
                  <h1 className="text-base sm:text-xl font-bold text-foreground">Vos informations</h1>
                  <div className="space-y-3 sm:space-y-4">
                    <div className="space-y-1.5">
                      <Label htmlFor="name" className="text-xs sm:text-sm">Nom complet</Label>
                      <Input id="name" value={form.name} onChange={(e) => update("name", e.target.value)} placeholder="Votre nom" required maxLength={100} className="text-sm" />
                    </div>
                    <div className="space-y-1.5">
                      <Label htmlFor="email" className="text-xs sm:text-sm">Email</Label>
                      <Input id="email" type="email" value={form.email} onChange={(e) => update("email", e.target.value)} placeholder="votre@email.com" required maxLength={255} className="text-sm" />
                    </div>
                    <div className="space-y-1.5">
                      <Label htmlFor="phone" className="text-xs sm:text-sm">Téléphone</Label>
                      <Input id="phone" type="tel" value={form.phone} onChange={(e) => update("phone", e.target.value)} placeholder="+225 XX XX XX XX" required maxLength={20} className="text-sm" />
                    </div>
                    <div className="space-y-1.5">
                      <Label className="text-xs sm:text-sm">Méthode de paiement</Label>
                      <div className="grid grid-cols-2 gap-2 sm:gap-3">
                        {[
                          { value: "mobile_money", label: "Mobile Money" },
                          { value: "carte", label: "Carte bancaire" },
                        ].map((m) => (
                          <button
                            key={m.value}
                            type="button"
                            onClick={() => update("paymentMethod", m.value)}
                            className={`py-2.5 sm:py-3 rounded-lg sm:rounded-xl text-xs sm:text-sm font-medium border transition-all ${
                              form.paymentMethod === m.value
                                ? "border-accent bg-accent/10 text-accent"
                                : "border-border text-muted-foreground hover:border-accent/50"
                            }`}
                          >
                            {m.label}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 text-[10px] sm:text-xs text-muted-foreground">
                    <ShieldCheck size={12} className="text-accent shrink-0" />
                    <span>Paiement 100% sécurisé — vos données sont protégées</span>
                  </div>
                </div>
              </AnimateOnScroll>
            </div>

            {/* Summary */}
            <div className="md:col-span-2">
              <AnimateOnScroll delay={100}>
                <div className="stat-card rounded-xl sm:rounded-2xl p-4 sm:p-6 space-y-3 sm:space-y-4 md:sticky md:top-24">
                  <h2 className="text-sm sm:text-lg font-bold text-foreground">Récapitulatif</h2>
                  <div className="space-y-2 sm:space-y-3 max-h-48 sm:max-h-60 overflow-y-auto">
                    {items.map((item) => (
                      <div key={item.product.id} className="flex items-center gap-2 sm:gap-3">
                        <img src={item.product.image} alt={item.product.title} className="w-10 h-10 sm:w-12 sm:h-12 rounded-lg object-cover shrink-0" />
                        <div className="flex-1 min-w-0">
                          <p className="text-xs sm:text-sm font-medium text-foreground truncate">{item.product.title}</p>
                          <p className="text-[10px] sm:text-xs text-muted-foreground">Qté: {item.quantity}</p>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <span className="text-accent font-bold text-xs sm:text-sm whitespace-nowrap">{item.product.price}</span>
                          <button type="button" onClick={() => removeFromCart(item.product.id)} className="text-muted-foreground hover:text-destructive transition-colors">
                            <Trash2 size={12} />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="border-t border-border pt-3 sm:pt-4 flex justify-between items-center">
                    <span className="text-foreground font-bold text-sm">Total</span>
                    <span className="text-accent font-bold text-base sm:text-xl">{totalPrice.toLocaleString()} CFA</span>
                  </div>
                  <button type="submit" disabled={submitting} className="w-full btn-primary-brand py-3 sm:py-4 rounded-xl sm:rounded-2xl font-bold text-xs sm:text-base hover-scale shadow-glow flex items-center justify-center gap-2 disabled:opacity-70">
                    {submitting && <Loader2 size={16} className="animate-spin" />}
                    {submitting ? "TRAITEMENT..." : "CONFIRMER LA COMMANDE"}
                  </button>
                </div>
              </AnimateOnScroll>
            </div>
          </form>
        </div>
      </section>

      <FooterSection />
    </div>
  );
};

export default Checkout;

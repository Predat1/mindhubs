import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import Navbar from "@/components/Navbar";
import FooterSection from "@/components/FooterSection";
import SEO from "@/components/SEO";
import AnimateOnScroll from "@/components/AnimateOnScroll";
import { useCart } from "@/contexts/CartContext";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "@/hooks/use-toast";
import { ShieldCheck, ArrowLeft, CheckCircle2, Trash2 } from "lucide-react";

const Checkout = () => {
  const { items, totalPrice, clearCart, removeFromCart } = useCart();
  const navigate = useNavigate();
  const [confirmed, setConfirmed] = useState(false);
  const [form, setForm] = useState({ name: "", email: "", phone: "", paymentMethod: "mobile_money" });

  const update = (field: string, value: string) => setForm((p) => ({ ...p, [field]: value }));

  if (items.length === 0 && !confirmed) {
    return (
      <div className="min-h-screen bg-background">
        <SEO title="Checkout" description="Finalisez votre commande MindHub" path="/checkout" />
        <Navbar />
        <section className="pt-32 pb-20 container mx-auto px-4 text-center">
          <AnimateOnScroll>
            <div className="stat-card rounded-2xl py-16 px-8 max-w-lg mx-auto space-y-6">
              <h1 className="text-2xl font-bold text-foreground">Votre panier est vide</h1>
              <Link to="/boutique" className="btn-primary-brand inline-block px-8 py-3 rounded-full font-semibold text-sm hover-scale">
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
        <section className="pt-32 pb-20 container mx-auto px-4">
          <AnimateOnScroll>
            <div className="stat-card rounded-2xl p-8 text-center space-y-6 max-w-lg mx-auto">
              <CheckCircle2 className="mx-auto text-accent" size={64} />
              <h1 className="text-2xl font-bold text-foreground">Commande confirmée !</h1>
              <p className="text-muted-foreground text-sm max-w-md mx-auto">
                Merci {form.name} ! Vous recevrez un email de confirmation à <span className="text-accent">{form.email}</span> avec les détails de votre commande.
              </p>
              <Link to="/boutique" className="btn-primary-brand inline-block px-8 py-3 rounded-full font-semibold text-sm hover-scale">
                CONTINUER MES ACHATS
              </Link>
            </div>
          </AnimateOnScroll>
        </section>
        <FooterSection />
      </div>
    );
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim() || !form.email.trim() || !form.phone.trim()) {
      toast({ title: "Veuillez remplir tous les champs", variant: "destructive" });
      return;
    }
    clearCart();
    setConfirmed(true);
    toast({ title: "Commande confirmée ✅", description: "Merci pour votre achat !" });
  };

  return (
    <div className="min-h-screen bg-background">
      <SEO title="Checkout" description="Finalisez votre commande MindHub" path="/checkout" />
      <Navbar />

      <section className="pt-24 pb-20 container mx-auto px-4">
        <div className="max-w-4xl mx-auto">
          <AnimateOnScroll>
            <Link to="/panier" className="inline-flex items-center gap-1 text-sm text-primary hover:underline mb-6">
              <ArrowLeft size={14} /> Retour au panier
            </Link>
          </AnimateOnScroll>

          <form onSubmit={handleSubmit} className="grid md:grid-cols-5 gap-6">
            {/* Left: Form */}
            <div className="md:col-span-3 space-y-6">
              <AnimateOnScroll>
                <div className="stat-card rounded-2xl p-6 space-y-5">
                  <h1 className="text-xl font-bold text-foreground">Vos informations</h1>
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="name">Nom complet</Label>
                      <Input id="name" value={form.name} onChange={(e) => update("name", e.target.value)} placeholder="Votre nom" required maxLength={100} />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="email">Email</Label>
                      <Input id="email" type="email" value={form.email} onChange={(e) => update("email", e.target.value)} placeholder="votre@email.com" required maxLength={255} />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="phone">Téléphone</Label>
                      <Input id="phone" type="tel" value={form.phone} onChange={(e) => update("phone", e.target.value)} placeholder="+225 XX XX XX XX" required maxLength={20} />
                    </div>
                    <div className="space-y-2">
                      <Label>Méthode de paiement</Label>
                      <div className="grid grid-cols-2 gap-3">
                        {[
                          { value: "mobile_money", label: "Mobile Money" },
                          { value: "carte", label: "Carte bancaire" },
                        ].map((m) => (
                          <button
                            key={m.value}
                            type="button"
                            onClick={() => update("paymentMethod", m.value)}
                            className={`py-3 rounded-xl text-sm font-medium border transition-all ${
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
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <ShieldCheck size={14} className="text-accent shrink-0" />
                    <span>Paiement 100% sécurisé — vos données sont protégées</span>
                  </div>
                </div>
              </AnimateOnScroll>
            </div>

            {/* Right: Summary */}
            <div className="md:col-span-2">
              <AnimateOnScroll delay={100}>
                <div className="stat-card rounded-2xl p-6 space-y-4 md:sticky md:top-24">
                  <h2 className="text-lg font-bold text-foreground">Récapitulatif</h2>
                  <div className="space-y-3 max-h-60 overflow-y-auto">
                    {items.map((item) => (
                      <div key={item.product.id} className="flex items-center gap-3">
                        <img src={item.product.image} alt={item.product.title} className="w-12 h-12 rounded-lg object-cover" />
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-foreground truncate">{item.product.title}</p>
                          <p className="text-xs text-muted-foreground">Qté: {item.quantity}</p>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-accent font-bold text-sm whitespace-nowrap">{item.product.price}</span>
                          <button type="button" onClick={() => removeFromCart(item.product.id)} className="text-muted-foreground hover:text-destructive transition-colors">
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="border-t border-border pt-4 flex justify-between items-center">
                    <span className="text-foreground font-bold">Total</span>
                    <span className="text-accent font-bold text-xl">{totalPrice.toLocaleString()} CFA</span>
                  </div>
                  <button type="submit" className="w-full btn-primary-brand py-4 rounded-2xl font-bold text-base hover-scale shadow-glow">
                    CONFIRMER LA COMMANDE
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

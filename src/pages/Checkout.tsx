import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import Navbar from "@/components/Navbar";
import FooterSection from "@/components/FooterSection";
import SEO from "@/components/SEO";
import AnimateOnScroll from "@/components/AnimateOnScroll";
import { useCart } from "@/contexts/CartContext";
import { Progress } from "@/components/ui/progress";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "@/hooks/use-toast";
import { ShieldCheck, ArrowLeft, CheckCircle2 } from "lucide-react";

const Checkout = () => {
  const { items, totalPrice, clearCart } = useCart();
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [form, setForm] = useState({ name: "", email: "", phone: "", paymentMethod: "mobile_money" });

  const update = (field: string, value: string) => setForm((p) => ({ ...p, [field]: value }));

  if (items.length === 0 && step < 3) {
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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim() || !form.email.trim() || !form.phone.trim()) {
      toast({ title: "Veuillez remplir tous les champs", variant: "destructive" });
      return;
    }
    setStep(3);
    clearCart();
    toast({ title: "Commande confirmée ✅", description: "Merci pour votre achat !" });
  };

  return (
    <div className="min-h-screen bg-background">
      <SEO title="Checkout" description="Finalisez votre commande MindHub" path="/checkout" />
      <Navbar />

      <section className="pt-24 pb-20 container mx-auto px-4">
        <div className="max-w-2xl mx-auto">
          {/* Progress */}
          <AnimateOnScroll>
            <div className="mb-8 space-y-3">
              <div className="flex justify-between text-xs font-medium text-muted-foreground">
                <span className={step >= 1 ? "text-accent" : ""}>1. Récapitulatif</span>
                <span className={step >= 2 ? "text-accent" : ""}>2. Informations</span>
                <span className={step >= 3 ? "text-accent" : ""}>3. Confirmation</span>
              </div>
              <Progress value={step === 1 ? 33 : step === 2 ? 66 : 100} className="h-2" />
            </div>
          </AnimateOnScroll>

          {step === 1 && (
            <AnimateOnScroll>
              <div className="stat-card rounded-2xl p-6 space-y-6">
                <h1 className="text-xl font-bold text-foreground">Récapitulatif de commande</h1>
                <div className="space-y-3 border-b border-border pb-4">
                  {items.map((item) => (
                    <div key={item.product.id} className="flex items-center gap-3">
                      <img src={item.product.image} alt={item.product.title} className="w-12 h-12 rounded-lg object-cover" />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-foreground truncate">{item.product.title}</p>
                        <p className="text-xs text-muted-foreground">Qté: {item.quantity}</p>
                      </div>
                      <span className="text-accent font-bold text-sm whitespace-nowrap">{item.product.price}</span>
                    </div>
                  ))}
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-foreground font-bold">Total</span>
                  <span className="text-accent font-bold text-xl">{totalPrice.toLocaleString()} CFA</span>
                </div>
                <button onClick={() => setStep(2)} className="w-full btn-primary-brand py-3.5 rounded-xl font-bold text-sm hover-scale">
                  CONTINUER
                </button>
                <Link to="/panier" className="flex items-center justify-center gap-1 text-sm text-primary hover:underline">
                  <ArrowLeft size={14} /> Retour au panier
                </Link>
              </div>
            </AnimateOnScroll>
          )}

          {step === 2 && (
            <AnimateOnScroll>
              <form onSubmit={handleSubmit} className="stat-card rounded-2xl p-6 space-y-6">
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
                <div className="flex justify-between items-center border-t border-border pt-4">
                  <span className="text-foreground font-bold">Total</span>
                  <span className="text-accent font-bold text-xl">{totalPrice.toLocaleString()} CFA</span>
                </div>
                <button type="submit" className="w-full btn-primary-brand py-3.5 rounded-xl font-bold text-sm hover-scale shadow-glow">
                  CONFIRMER LA COMMANDE
                </button>
                <button type="button" onClick={() => setStep(1)} className="w-full text-sm text-primary hover:underline">
                  ← Retour au récapitulatif
                </button>
              </form>
            </AnimateOnScroll>
          )}

          {step === 3 && (
            <AnimateOnScroll>
              <div className="stat-card rounded-2xl p-8 text-center space-y-6">
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
          )}
        </div>
      </section>

      <FooterSection />
    </div>
  );
};

export default Checkout;

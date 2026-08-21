import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import Navbar from "@/components/Navbar";
import FooterSection from "@/components/FooterSection";
import SEO from "@/components/SEO";
import AnimateOnScroll from "@/components/AnimateOnScroll";
import { useCart } from "@/contexts/CartContext";
import { supabase } from "@/integrations/supabase/client";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "@/hooks/use-toast";
import { ShieldCheck, ArrowLeft, CheckCircle2, Trash2, Loader2, Zap, Lock, CreditCard, Smartphone, MapPin } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { formatCurrency } from "@/lib/currency";
import { trackCheckoutStart } from "@/hooks/useProductTracking";

const Checkout = () => {
  const { items, totalPrice, clearCart, removeFromCart } = useCart();
  const navigate = useNavigate();
  const [confirmed, setConfirmed] = useState(false);
  const [orderNumber, setOrderNumber] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({ name: "", email: "", phone: "", paymentMethod: "mobile_money" });
  const [country, setCountry] = useState<string | null>(null);
  const [shippingAddress, setShippingAddress] = useState({ line1: "", city: "", region: "", postalCode: "" });
  const [sourceChannel] = useState<"marketplace" | "storefront" | "direct" | "social" | "external" | "other">(() => {
    const querySource = new URLSearchParams(window.location.search).get("source");
    const savedSource = sessionStorage.getItem("mindhubs:last-source");
    const candidate = querySource || savedSource;
    return ["marketplace", "storefront", "direct", "social", "external", "other"].includes(candidate || "")
      ? candidate as "marketplace" | "storefront" | "direct" | "social" | "external" | "other"
      : "direct";
  });
  const hasPhysicalItems = items.some((item) => item.product.productMode === "physical" || item.product.productMode === "hybrid");

  useEffect(() => {
    fetch("https://ipapi.co/json/")
      .then((res) => res.json())
      .then((data) => {
        if (data && data.country_name) {
          setCountry(data.country_name);
        }
      })
      .catch(() => {
        // Fallback silently
      });
  }, []);

  useEffect(() => {
    if (items.length > 0) {
      items.forEach(item => trackCheckoutStart(item.product.id));
    }
    
    if (items.length === 1 && items[0].product.paymentLink) {
      window.location.assign(items[0].product.paymentLink);
      navigate("/boutique", { replace: true });
    }
  }, [items, navigate]);

  const update = (field: string, value: string) => setForm((p) => ({ ...p, [field]: value }));

  if (items.length === 0 && !confirmed) {
    return (
      <div className="min-h-screen bg-background">
        <SEO title="Checkout" description="Finalisez votre commande MindHubs" path="/checkout" />
        <Navbar />
        <section className="pt-48 pb-20 container mx-auto px-4 text-center">
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="glass-card rounded-2xl py-16 px-8 max-w-xl mx-auto space-y-8"
          >
            <h1 className="text-3xl font-black">Votre panier est vide</h1>
            <Button asChild className="h-12 rounded-lg px-8 btn-glow font-semibold">
               <Link to="/boutique">Explorer la marketplace</Link>
            </Button>
          </motion.div>
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
        <section className="pt-48 pb-20 container mx-auto px-4">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="glass-card rounded-2xl p-8 md:p-10 text-center space-y-8 max-w-2xl mx-auto border-success/20"
          >
            <div className="h-24 w-24 bg-success/20 rounded-full flex items-center justify-center mx-auto text-success border border-success/30">
               <CheckCircle2 size={48} />
            </div>
            <div className="space-y-4">
               <h1 className="text-4xl font-black tracking-tighter">Félicitations !</h1>
               <p className="text-muted-foreground font-medium max-w-md mx-auto">
                 Merci <span className="text-foreground font-bold">{form.name}</span> ! Votre commande {orderNumber ? <><span className="text-primary font-bold">{orderNumber}</span> </> : null} a été enregistrée en attente de paiement. {hasPhysicalItems ? "La préparation commencera après confirmation du paiement." : <>Votre accès sera envoyé après confirmation du paiement à <span className="text-primary font-bold">{form.email}</span>.</>}
               </p>
            </div>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
               <Button asChild className="h-14 rounded-2xl px-10 btn-glow font-black text-lg">
                  <Link to="/boutique">Continuer mes Achats</Link>
               </Button>
               <Button asChild variant="outline" className="h-14 rounded-2xl px-10 border-white/10 font-black text-lg">
                   <Link to="/mon-compte">Accéder à mon compte</Link>
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
    if (hasPhysicalItems && (!shippingAddress.line1.trim() || !shippingAddress.city.trim() || !shippingAddress.region.trim())) {
      toast({ title: "Adresse de livraison incomplète", description: "Indiquez la rue, la ville et la région pour les produits physiques.", variant: "destructive" });
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
        vendor_id: item.product.vendorId ?? null,
        product_mode: item.product.productMode ?? "digital",
      }));
      const { data, error } = await (supabase as any).rpc("create_pending_order", {
        p_customer_name: form.name.trim(),
        p_customer_email: form.email.trim(),
        p_customer_phone: form.phone.trim(),
        p_payment_method: form.paymentMethod,
        p_items: orderItems,
        p_source_channel: sourceChannel,
        p_referrer: document.referrer || null,
        p_landing_page: window.location.pathname,
        p_utm_source: new URLSearchParams(window.location.search).get("utm_source"),
        p_utm_medium: new URLSearchParams(window.location.search).get("utm_medium"),
        p_utm_campaign: new URLSearchParams(window.location.search).get("utm_campaign"),
        p_shipping_address: hasPhysicalItems ? shippingAddress : null,
        p_country: country,
      });
      if (error) throw error;
      const createdOrder = Array.isArray(data) ? data[0] : data;
      setOrderNumber(createdOrder?.order_number || null);
      clearCart();
      setConfirmed(true);
      toast({ title: "Commande enregistrée", description: "Elle restera en attente jusqu’à la confirmation du paiement." });
    } catch (err: unknown) {
      toast({ title: "Erreur", description: (err as Error).message || "Une erreur est survenue", variant: "destructive" });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <SEO title="Checkout" description="Finalisez votre commande MindHubs" path="/checkout" />
      <Navbar />

      <section className="pt-28 pb-20 container mx-auto px-4">
        <div className="max-w-6xl mx-auto">
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="mb-8"
          >
            <Link to="/panier" className="inline-flex items-center gap-2 text-xs font-black uppercase tracking-widest text-muted-foreground hover:text-primary transition-colors">
              <ArrowLeft size={14} /> Retour au Panier
            </Link>
            <h1 className="text-3xl md:text-5xl font-extrabold tracking-tighter mt-4">Finaliser la <span className="text-gradient-primary italic">Commande</span></h1>
          </motion.div>

          <form onSubmit={handleSubmit} className="grid lg:grid-cols-5 gap-8 items-start">
            
            {/* Form Section */}
            <div className="lg:col-span-3 space-y-6">
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="glass-card rounded-2xl p-6 md:p-8 space-y-8"
              >
                <div className="flex items-center gap-4 border-b border-border pb-6">
                   <div className="h-12 w-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary border border-primary/20">
                      <Lock size={24} />
                   </div>
                   <h2 className="text-2xl font-black tracking-tight">Informations de Facturation</h2>
                </div>

                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="name" className="text-xs font-black uppercase tracking-widest text-muted-foreground ml-1">Nom complet</Label>
                    <Input id="name" value={form.name} onChange={(e) => update("name", e.target.value)} placeholder="Jean Dupont" required className="h-12 rounded-lg bg-muted/50 border-border focus:ring-primary/20 font-medium" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email" className="text-xs font-black uppercase tracking-widest text-muted-foreground ml-1">Adresse Email</Label>
                    <Input id="email" type="email" value={form.email} onChange={(e) => update("email", e.target.value)} placeholder="jean@exemple.com" required className="h-12 rounded-lg bg-muted/50 border-border focus:ring-primary/20 font-medium" />
                  </div>
                  <div className="md:col-span-2 space-y-2">
                    <Label htmlFor="phone" className="text-xs font-black uppercase tracking-widest text-muted-foreground ml-1">Numéro Téléphone (WhatsApp)</Label>
                    <Input id="phone" type="tel" value={form.phone} onChange={(e) => update("phone", e.target.value)} placeholder="+225 07 XX XX XX XX" required className="h-12 rounded-lg bg-muted/50 border-border focus:ring-primary/20 font-medium" />
                  </div>
                </div>

                {hasPhysicalItems && (
                  <div className="space-y-4 border-t border-border pt-6">
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary"><MapPin size={18} /></div>
                      <div>
                        <h3 className="text-sm font-black">Adresse de livraison</h3>
                        <p className="text-[11px] text-muted-foreground">Nécessaire pour les produits physiques ou hybrides.</p>
                      </div>
                    </div>
                    <div className="grid gap-4 sm:grid-cols-2">
                      <div className="space-y-2 sm:col-span-2">
                        <Label htmlFor="shipping-line1">Adresse</Label>
                        <Input id="shipping-line1" value={shippingAddress.line1} onChange={(event) => setShippingAddress((current) => ({ ...current, line1: event.target.value }))} placeholder="Rue, quartier, repère" required className="h-12 rounded-xl" />
                      </div>
                      <div className="space-y-2"><Label htmlFor="shipping-city">Ville</Label><Input id="shipping-city" value={shippingAddress.city} onChange={(event) => setShippingAddress((current) => ({ ...current, city: event.target.value }))} placeholder="Abidjan" required className="h-12 rounded-xl" /></div>
                      <div className="space-y-2"><Label htmlFor="shipping-region">Région</Label><Input id="shipping-region" value={shippingAddress.region} onChange={(event) => setShippingAddress((current) => ({ ...current, region: event.target.value }))} placeholder="Cocody" required className="h-12 rounded-xl" /></div>
                      <div className="space-y-2 sm:col-span-2"><Label htmlFor="shipping-postal">Code postal <span className="font-normal text-muted-foreground">(facultatif)</span></Label><Input id="shipping-postal" value={shippingAddress.postalCode} onChange={(event) => setShippingAddress((current) => ({ ...current, postalCode: event.target.value }))} placeholder="00000" className="h-12 rounded-xl" /></div>
                    </div>
                  </div>
                )}

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
                            : "border-border bg-muted/50 text-muted-foreground hover:border-foreground/30 hover:bg-accent"
                        }`}
                      >
                        <div className={`h-10 w-10 rounded-xl flex items-center justify-center ${form.paymentMethod === m.value ? "bg-primary text-primary-foreground" : "bg-muted"}`}>
                           <m.icon size={20} />
                        </div>
                        <span className="font-black text-sm">{m.label}</span>
                      </button>
                    ))}
                  </div>
                </div>

                <div className="pt-6 border-t border-border flex flex-wrap items-center gap-6">
                   <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-success bg-success/5 px-3 py-1.5 rounded-full border border-success/10">
                      <ShieldCheck size={14} /> Paiement à confirmer
                   </div>
                   <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-primary bg-primary/5 px-3 py-1.5 rounded-full border border-primary/10">
                      <Lock size={14} /> Données protégées
                   </div>
                   <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-muted-foreground">
                      Protection acheteur
                   </div>
                </div>
              </motion.div>
            </div>

            {/* Sidebar Summary */}
            <div className="lg:col-span-2">
              <motion.div 
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.1 }}
                className="glass-card rounded-2xl p-6 md:p-8 space-y-8 sticky top-32 border-border"
              >
                <div className="flex items-center justify-between">
                   <h2 className="text-xl font-black">Récapitulatif</h2>
                  <Badge variant="outline" className="border-border uppercase tracking-wide text-[9px] font-semibold">{items.length} Article{items.length > 1 ? "s" : ""}</Badge>
                </div>

                <div className="space-y-4 max-h-[30vh] overflow-y-auto pr-2 custom-scrollbar">
                  {items.map((item) => (
                    <div key={item.product.id} className="flex items-center gap-4 bg-muted/50 p-3 rounded-xl border border-border relative group">
                      <img src={item.product.image} alt={item.product.title} className="w-14 h-14 rounded-xl object-cover shrink-0" />
                      <div className="flex-1 min-w-0">
                        <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest mb-1">{item.product.category}</p>
                        <p className="text-xs font-black text-foreground truncate">{item.product.title}</p>
                        <p className="text-[10px] font-bold text-primary mt-1">{formatCurrency(item.product.price)} (x{item.quantity})</p>
                      </div>
                      <button 
                        type="button" 
                        onClick={() => removeFromCart(item.product.id)} 
                        className="absolute -top-2 -right-2 h-7 w-7 bg-destructive text-destructive-foreground rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity shadow-lg"
                      >
                         <Trash2 size={12} />
                      </button>
                    </div>
                  ))}
                </div>

                <div className="space-y-4 pt-6 border-t border-border">
                  <div className="flex justify-between items-center text-xs font-black uppercase tracking-widest text-muted-foreground">
                    <span>Total à Payer</span>
                    <span className="text-2xl text-foreground">{formatCurrency(totalPrice)}</span>
                  </div>
                  
                  <Button 
                    type="submit" 
                    disabled={submitting} 
                    className="w-full h-14 rounded-lg btn-glow font-semibold text-base gap-3 disabled:opacity-50"
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
                      <div className="h-6 w-6 rounded-full bg-success/10 flex items-center justify-center text-success"><CheckCircle2 size={12} /></div>
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

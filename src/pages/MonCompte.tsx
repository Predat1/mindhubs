import { useState } from "react";
import { Link } from "react-router-dom";
import Navbar from "@/components/Navbar";
import FooterSection from "@/components/FooterSection";
import AnimateOnScroll from "@/components/AnimateOnScroll";
import SEO from "@/components/SEO";
import { useAuth } from "@/contexts/AuthContext";
import { useProducts } from "@/hooks/useProducts";
import { useCurrentVendor } from "@/hooks/useVendors";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import GoogleButton from "@/components/auth/GoogleButton";
import PasswordStrength, { getPasswordScore } from "@/components/auth/PasswordStrength";
import {
  User, Mail, Lock, LogOut, Eye, EyeOff, ShoppingBag,
  Calendar, Shield, BookOpen, ArrowRight, Package, Clock,
  CheckCircle2, XCircle, Truck, MailCheck, Store, LayoutDashboard,
  KeyRound, ArrowLeft
} from "lucide-react";

interface OrderItem {
  product_id: string;
  title: string;
  price: string;
  quantity: number;
  image?: string;
}

interface UserOrder {
  id: string;
  total_price: number;
  status: "pending" | "confirmed" | "delivered" | "cancelled";
  items: OrderItem[];
  created_at: string;
  payment_method: string;
}

const statusConfig = {
  pending: { label: "En attente", icon: Clock, color: "text-yellow-500 bg-yellow-500/10 border-yellow-500/20" },
  confirmed: { label: "Confirmée", icon: CheckCircle2, color: "text-accent bg-accent/10 border-accent/20" },
  delivered: { label: "Livrée", icon: Truck, color: "text-primary bg-primary/10 border-primary/20" },
  cancelled: { label: "Annulée", icon: XCircle, color: "text-destructive bg-destructive/10 border-destructive/20" },
};

type Mode = "login" | "register" | "forgot" | "check-email";

const MonCompte = () => {
  const { user, loading, signIn, signUp, signOut, resetPassword, signInWithGoogle, resendConfirmation } = useAuth();
  const { data: currentVendor } = useCurrentVendor();
  const { toast } = useToast();
  const [mode, setMode] = useState<Mode>("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [pendingEmail, setPendingEmail] = useState("");

  const { data: orders = [] } = useQuery({
    queryKey: ["user-orders", user?.id],
    queryFn: async (): Promise<UserOrder[]> => {
      if (!user) return [];
      const { data, error } = await supabase
        .from("orders")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return (data as any) ?? [];
    },
    enabled: !!user,
  });

  const { data: allProducts = [] } = useProducts();

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  // ============= LOGGED IN =============
  if (user) {
    const memberSince = new Date(user.created_at).toLocaleDateString("fr-FR", {
      year: "numeric", month: "long", day: "numeric"
    });
    const initials = (user.user_metadata?.full_name || user.email || "U")
      .split(" ").map((w: string) => w[0]).join("").toUpperCase().slice(0, 2);

    const purchasedProductIds = new Set(orders.flatMap(o => o.items.map(i => i.product_id)));
    const recommendedProducts = allProducts.filter(p => !purchasedProductIds.has(p.id)).slice(0, 4);
    const totalSpent = orders.reduce((s, o) => s + o.total_price, 0);
    const emailVerified = !!user.email_confirmed_at;

    const handlePasswordReset = async () => {
      if (!user.email) return;
      const { error } = await resetPassword(user.email);
      if (error) {
        toast({ title: "Erreur", description: error.message, variant: "destructive" });
      } else {
        toast({ title: "Email envoyé", description: "Vérifiez votre boîte mail pour changer votre mot de passe." });
      }
    };

    return (
      <div className="min-h-screen bg-background">
        <SEO title="Mon Compte" description="Gérez votre compte MindHub, vos achats et vos informations personnelles." path="/mon-compte" />
        <Navbar />
        <main className="pt-24 pb-16">
          <div className="container mx-auto px-4 max-w-3xl">
            {/* Profile Header */}
            <AnimateOnScroll>
              <div className="stat-card rounded-2xl p-8 mb-6">
                <div className="flex flex-col sm:flex-row items-center gap-5">
                  <div className="w-20 h-20 bg-primary/15 rounded-2xl flex items-center justify-center text-primary text-2xl font-bold shrink-0">
                    {initials}
                  </div>
                  <div className="text-center sm:text-left flex-1">
                    <h1 className="text-2xl font-bold text-foreground">
                      {user.user_metadata?.full_name || "Mon Compte"}
                    </h1>
                    <p className="text-muted-foreground text-sm mt-1">{user.email}</p>
                    <div className="flex flex-wrap items-center justify-center sm:justify-start gap-3 mt-3">
                      <span className="inline-flex items-center gap-1.5 text-xs text-muted-foreground">
                        <Calendar size={12} /> Membre depuis {memberSince}
                      </span>
                      <span className={`inline-flex items-center gap-1.5 text-xs ${emailVerified ? "text-accent" : "text-yellow-500"}`}>
                        <Shield size={12} /> {emailVerified ? "Email vérifié" : "Email non vérifié"}
                      </span>
                    </div>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    className="text-destructive border-destructive/30 hover:bg-destructive/10 shrink-0"
                    onClick={async () => {
                      await signOut();
                      toast({ title: "Déconnexion réussie", description: "À bientôt !" });
                    }}
                  >
                    <LogOut size={14} /> Déconnexion
                  </Button>
                </div>
              </div>
            </AnimateOnScroll>

            {/* Vendor CTA */}
            <AnimateOnScroll delay={50}>
              <div className="mb-6">
                {currentVendor ? (
                  <Link to="/dashboard" className="group block stat-card border-glow rounded-2xl p-5 hover:border-accent/50 transition-all">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-xl bg-accent/10 flex items-center justify-center text-accent shrink-0">
                        <LayoutDashboard size={20} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-foreground text-sm">Mon dashboard vendeur</p>
                        <p className="text-xs text-muted-foreground truncate">@{currentVendor.username} · Gérez votre boutique</p>
                      </div>
                      <ArrowRight className="text-muted-foreground group-hover:text-accent group-hover:translate-x-1 transition-all" size={18} />
                    </div>
                  </Link>
                ) : (
                  <Link to="/become-a-seller" className="group block stat-card border-glow rounded-2xl p-5 hover:border-primary/50 transition-all">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center text-primary shrink-0">
                        <Store size={20} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-foreground text-sm">Devenir vendeur</p>
                        <p className="text-xs text-muted-foreground">Lancez votre boutique digitale en 3 minutes</p>
                      </div>
                      <ArrowRight className="text-muted-foreground group-hover:text-primary group-hover:translate-x-1 transition-all" size={18} />
                    </div>
                  </Link>
                )}
              </div>
            </AnimateOnScroll>

            {/* Quick Stats */}
            <AnimateOnScroll delay={100}>
              <div className="grid grid-cols-3 gap-4 mb-6">
                {[
                  { icon: ShoppingBag, label: "Achats", value: String(orders.length) },
                  { icon: BookOpen, label: "Formations", value: String(orders.filter(o => o.status !== "cancelled").length) },
                  { icon: Package, label: "Dépensé", value: `${totalSpent.toLocaleString()} FCFA` },
                ].map((stat) => (
                  <div key={stat.label} className="stat-card rounded-xl p-4 text-center border-glow">
                    <stat.icon className="mx-auto text-primary mb-2" size={20} />
                    <p className="text-lg font-bold text-foreground">{stat.value}</p>
                    <p className="text-xs text-muted-foreground">{stat.label}</p>
                  </div>
                ))}
              </div>
            </AnimateOnScroll>

            {/* Security */}
            <AnimateOnScroll delay={130}>
              <div className="stat-card rounded-2xl p-6 mb-6">
                <h3 className="font-semibold text-foreground mb-4 flex items-center gap-2 text-sm">
                  <Shield size={16} className="text-primary" /> Sécurité
                </h3>
                <div className="space-y-3">
                  <button
                    onClick={handlePasswordReset}
                    className="w-full flex items-center gap-3 p-3 rounded-xl bg-background border border-border hover:border-primary/40 transition-all text-left group"
                  >
                    <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center text-primary shrink-0">
                      <KeyRound size={16} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-foreground">Changer mon mot de passe</p>
                      <p className="text-xs text-muted-foreground">Recevez un email sécurisé pour le réinitialiser</p>
                    </div>
                    <ArrowRight className="text-muted-foreground group-hover:text-primary group-hover:translate-x-1 transition-all" size={16} />
                  </button>
                </div>
              </div>
            </AnimateOnScroll>

            {/* Account Info */}
            <AnimateOnScroll delay={150}>
              <div className="stat-card rounded-2xl p-6 mb-6">
                <h3 className="font-semibold text-foreground mb-4 flex items-center gap-2 text-sm">
                  <Mail size={16} className="text-primary" /> Informations du compte
                </h3>
                <div className="grid sm:grid-cols-2 gap-4 text-sm">
                  <div className="bg-background rounded-xl p-4 border border-border">
                    <p className="text-xs text-muted-foreground mb-1">Email</p>
                    <p className="text-foreground font-medium truncate">{user.email}</p>
                  </div>
                  <div className="bg-background rounded-xl p-4 border border-border">
                    <p className="text-xs text-muted-foreground mb-1">Nom complet</p>
                    <p className="text-foreground font-medium">{user.user_metadata?.full_name || "Non renseigné"}</p>
                  </div>
                </div>
              </div>
            </AnimateOnScroll>

            {/* Order History */}
            <AnimateOnScroll delay={200}>
              <div className="stat-card rounded-2xl p-6 mb-6">
                <h3 className="font-semibold text-foreground mb-4 flex items-center gap-2 text-sm">
                  <ShoppingBag size={16} className="text-primary" /> Mes achats
                </h3>
                {orders.length === 0 ? (
                  <div className="text-center py-8">
                    <ShoppingBag className="mx-auto text-muted-foreground/30 mb-3" size={40} />
                    <p className="text-sm text-muted-foreground mb-4">Vous n'avez pas encore de commandes.</p>
                    <Link
                      to="/boutique"
                      className="group inline-flex items-center gap-2 bg-primary text-primary-foreground px-6 py-2.5 rounded-xl text-sm font-medium hover:bg-primary/90 transition-all"
                    >
                      Explorer le catalogue
                      <ArrowRight size={14} className="transition-transform group-hover:translate-x-1" />
                    </Link>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {orders.map((order) => {
                      const cfg = statusConfig[order.status];
                      return (
                        <div key={order.id} className="bg-background rounded-xl border border-border p-4 space-y-3">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              <span className={`inline-flex items-center gap-1 text-xs px-2.5 py-1 rounded-full font-medium border ${cfg.color}`}>
                                <cfg.icon size={12} /> {cfg.label}
                              </span>
                              <span className="text-xs text-muted-foreground">
                                {new Date(order.created_at).toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric" })}
                              </span>
                            </div>
                            <span className="text-sm font-bold text-foreground">{order.total_price.toLocaleString()} FCFA</span>
                          </div>
                          <div className="space-y-2">
                            {order.items.map((item, idx) => (
                              <div key={idx} className="flex items-center gap-3">
                                {item.image && <img src={item.image} alt={item.title} className="w-10 h-10 rounded-lg object-cover" />}
                                <div className="flex-1 min-w-0">
                                  <p className="text-sm font-medium text-foreground truncate">{item.title}</p>
                                  <p className="text-xs text-muted-foreground">Qté: {item.quantity} · {item.price}</p>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </AnimateOnScroll>

            {/* Recommended */}
            {recommendedProducts.length > 0 && (
              <AnimateOnScroll delay={250}>
                <div className="stat-card rounded-2xl p-6">
                  <h3 className="font-semibold text-foreground mb-4 flex items-center gap-2 text-sm">
                    <BookOpen size={16} className="text-primary" /> Produits recommandés
                  </h3>
                  <div className="grid grid-cols-2 gap-3">
                    {recommendedProducts.map((p) => (
                      <Link
                        key={p.id}
                        to={`/produit/${p.id}`}
                        className="bg-background rounded-xl border border-border p-3 hover:border-primary/30 transition-all group"
                      >
                        <img src={p.image} alt={p.title} className="w-full h-24 object-cover rounded-lg mb-2" />
                        <p className="text-xs font-medium text-foreground truncate group-hover:text-primary transition-colors">{p.title}</p>
                        <p className="text-xs text-primary font-bold mt-1">{p.price}</p>
                      </Link>
                    ))}
                  </div>
                </div>
              </AnimateOnScroll>
            )}
          </div>
        </main>
        <FooterSection />
      </div>
    );
  }

  // ============= AUTH FORMS =============
  const handleGoogle = async () => {
    setSubmitting(true);
    const { error } = await signInWithGoogle();
    if (error) {
      toast({ title: "Erreur", description: error.message, variant: "destructive" });
      setSubmitting(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      if (mode === "forgot") {
        const { error } = await resetPassword(email);
        if (error) throw error;
        toast({ title: "Email envoyé", description: "Vérifiez votre boîte mail pour réinitialiser votre mot de passe." });
        setMode("login");
      } else if (mode === "register") {
        if (!fullName.trim()) {
          toast({ title: "Erreur", description: "Veuillez entrer votre nom complet.", variant: "destructive" });
          setSubmitting(false);
          return;
        }
        if (getPasswordScore(password) < 2) {
          toast({ title: "Mot de passe trop faible", description: "Renforcez votre mot de passe (majuscule, chiffre, 8+ caractères).", variant: "destructive" });
          setSubmitting(false);
          return;
        }
        const { error } = await signUp(email, password, fullName);
        if (error) throw error;
        setPendingEmail(email);
        setMode("check-email");
      } else {
        const { error } = await signIn(email, password);
        if (error) throw error;
        toast({ title: "Connexion réussie", description: "Bienvenue sur Mind Hub !" });
      }
    } catch (err: any) {
      toast({ title: "Erreur", description: err.message || "Une erreur est survenue.", variant: "destructive" });
    } finally {
      setSubmitting(false);
    }
  };

  // Check email screen
  if (mode === "check-email") {
    return (
      <div className="min-h-screen bg-background">
        <SEO title="Vérifiez votre email" description="Confirmez votre adresse email pour activer votre compte." path="/mon-compte" />
        <Navbar />
        <main className="pt-24 pb-16 flex items-center min-h-[80vh]">
          <div className="container mx-auto px-4 max-w-md">
            <AnimateOnScroll>
              <div className="stat-card border-glow rounded-2xl p-8 text-center">
                <div className="w-16 h-16 bg-accent/10 rounded-full flex items-center justify-center mx-auto mb-5">
                  <MailCheck className="text-accent" size={28} />
                </div>
                <h1 className="text-2xl font-bold text-foreground">Vérifiez votre email</h1>
                <p className="text-muted-foreground text-sm mt-3">
                  Nous avons envoyé un lien de confirmation à
                </p>
                <p className="text-foreground font-semibold mt-1 mb-6">{pendingEmail}</p>
                <p className="text-xs text-muted-foreground mb-6">
                  Cliquez sur le lien dans l'email pour activer votre compte. Pensez à vérifier vos spams.
                </p>
                <div className="space-y-3">
                  <Button
                    variant="outline"
                    className="w-full"
                    onClick={async () => {
                      const { error } = await resendConfirmation(pendingEmail);
                      toast({
                        title: error ? "Erreur" : "Email renvoyé",
                        description: error?.message || "Un nouveau lien vient d'être envoyé.",
                        variant: error ? "destructive" : "default",
                      });
                    }}
                  >
                    Renvoyer l'email
                  </Button>
                  <button
                    onClick={() => { setMode("login"); setPassword(""); }}
                    className="text-sm text-muted-foreground hover:text-foreground inline-flex items-center gap-1.5"
                  >
                    <ArrowLeft size={14} /> Retour à la connexion
                  </button>
                </div>
              </div>
            </AnimateOnScroll>
          </div>
        </main>
        <FooterSection />
      </div>
    );
  }

  // Forgot password screen
  if (mode === "forgot") {
    return (
      <div className="min-h-screen bg-background">
        <SEO title="Mot de passe oublié" description="Réinitialisez votre mot de passe MindHub." path="/mon-compte" />
        <Navbar />
        <main className="pt-24 pb-16 flex items-center min-h-[80vh]">
          <div className="container mx-auto px-4 max-w-md">
            <AnimateOnScroll>
              <div className="stat-card border-glow rounded-2xl p-8">
                <div className="text-center mb-8">
                  <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
                    <KeyRound className="text-primary" size={28} />
                  </div>
                  <h1 className="text-2xl font-bold text-foreground">Mot de passe oublié</h1>
                  <p className="text-muted-foreground text-sm mt-2">
                    Entrez votre email pour recevoir un lien de réinitialisation
                  </p>
                </div>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <Input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="votre@email.com"
                    required
                  />
                  <Button type="submit" className="w-full" disabled={submitting}>
                    {submitting ? <span className="animate-spin w-4 h-4 border-2 border-primary-foreground border-t-transparent rounded-full" /> : "Envoyer le lien"}
                  </Button>
                </form>
                <button
                  onClick={() => setMode("login")}
                  className="mt-6 mx-auto flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground"
                >
                  <ArrowLeft size={14} /> Retour à la connexion
                </button>
              </div>
            </AnimateOnScroll>
          </div>
        </main>
        <FooterSection />
      </div>
    );
  }

  // Login / Register tabs
  return (
    <div className="min-h-screen bg-background">
      <SEO title="Mon Compte" description="Connectez-vous ou créez votre compte MindHub." path="/mon-compte" />
      <Navbar />
      <main className="pt-24 pb-16 flex items-center min-h-[80vh]">
        <div className="container mx-auto px-4 max-w-md">
          <AnimateOnScroll>
            <div className="text-center mb-6">
              <Link to="/" className="text-2xl font-bold tracking-tight inline-block">
                <span className="text-foreground">MIND</span>
                <span className="text-gradient-brand">✦</span>
                <span className="text-accent">HUB</span>
              </Link>
            </div>
            <div className="stat-card rounded-2xl p-8 border-glow">
              <Tabs value={mode} onValueChange={(v) => setMode(v as Mode)} className="w-full">
                <TabsList className="grid grid-cols-2 w-full mb-6">
                  <TabsTrigger value="login">Connexion</TabsTrigger>
                  <TabsTrigger value="register">Inscription</TabsTrigger>
                </TabsList>

                <div className="text-center mb-6">
                  <div className="w-14 h-14 bg-primary/10 rounded-2xl flex items-center justify-center mx-auto mb-3">
                    <User className="text-primary" size={24} />
                  </div>
                  <h1 className="text-xl font-bold text-foreground">
                    {mode === "login" ? "Bon retour !" : "Créer un compte"}
                  </h1>
                  <p className="text-muted-foreground text-xs mt-1">
                    {mode === "login"
                      ? "Connectez-vous pour accéder à vos formations"
                      : "Rejoignez +2 000 apprenants sur MindHub"}
                  </p>
                </div>

                <GoogleButton onClick={handleGoogle} loading={submitting} />

                <div className="relative my-5">
                  <div className="absolute inset-0 flex items-center">
                    <span className="w-full border-t border-border" />
                  </div>
                  <div className="relative flex justify-center text-xs">
                    <span className="bg-card px-3 text-muted-foreground">ou avec votre email</span>
                  </div>
                </div>

                <TabsContent value="login" className="mt-0">
                  <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                      <label className="text-sm font-medium text-foreground mb-1.5 block">Adresse email</label>
                      <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="votre@email.com" required />
                    </div>
                    <div>
                      <label className="text-sm font-medium text-foreground mb-1.5 block">Mot de passe</label>
                      <div className="relative">
                        <Input
                          type={showPassword ? "text" : "password"}
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          placeholder="••••••••"
                          required
                          minLength={6}
                          className="pr-10"
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                        >
                          {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                        </button>
                      </div>
                    </div>
                    <div className="text-right">
                      <button type="button" onClick={() => setMode("forgot")} className="text-xs text-primary hover:underline">
                        Mot de passe oublié ?
                      </button>
                    </div>
                    <Button type="submit" className="w-full font-semibold py-3 rounded-xl" disabled={submitting}>
                      {submitting ? <span className="animate-spin w-4 h-4 border-2 border-primary-foreground border-t-transparent rounded-full" /> : "Se connecter"}
                    </Button>
                  </form>
                </TabsContent>

                <TabsContent value="register" className="mt-0">
                  <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                      <label className="text-sm font-medium text-foreground mb-1.5 block">Nom complet</label>
                      <Input value={fullName} onChange={(e) => setFullName(e.target.value)} placeholder="Jean Dupont" required />
                    </div>
                    <div>
                      <label className="text-sm font-medium text-foreground mb-1.5 block">Adresse email</label>
                      <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="votre@email.com" required />
                    </div>
                    <div>
                      <label className="text-sm font-medium text-foreground mb-1.5 block">Mot de passe</label>
                      <div className="relative">
                        <Input
                          type={showPassword ? "text" : "password"}
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          placeholder="••••••••"
                          required
                          minLength={6}
                          className="pr-10"
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                        >
                          {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                        </button>
                      </div>
                      <PasswordStrength password={password} />
                    </div>
                    <p className="text-[10px] text-muted-foreground leading-relaxed">
                      En créant un compte, vous acceptez nos{" "}
                      <Link to="/conditions-generales" className="text-primary hover:underline">CGU</Link> et notre{" "}
                      <Link to="/politique-confidentialite" className="text-primary hover:underline">politique de confidentialité</Link>.
                    </p>
                    <Button type="submit" className="w-full font-semibold py-3 rounded-xl" disabled={submitting}>
                      {submitting ? <span className="animate-spin w-4 h-4 border-2 border-primary-foreground border-t-transparent rounded-full" /> : "Créer mon compte"}
                    </Button>
                  </form>
                </TabsContent>
              </Tabs>
            </div>
          </AnimateOnScroll>
        </div>
      </main>
      <FooterSection />
    </div>
  );
};

export default MonCompte;

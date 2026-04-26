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
import { Label } from "@/components/ui/label";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import GoogleButton from "@/components/auth/GoogleButton";
import PasswordStrength, { getPasswordScore } from "@/components/auth/PasswordStrength";
import {
  User, Mail, Lock, LogOut, Eye, EyeOff, ShoppingBag,
  Calendar, Shield, BookOpen, ArrowRight, Package, Clock,
  CheckCircle2, XCircle, Truck, MailCheck, Store, LayoutDashboard,
  KeyRound, ArrowLeft, Zap, Sparkles, ShieldCheck, Loader2
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Badge } from "@/components/ui/badge";
import { useTheme } from "@/contexts/ThemeContext";
import { Sun, Moon } from "lucide-react";

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
  pending: { label: "En attente", icon: Clock, color: "text-amber-500 bg-amber-500/10 border-amber-500/20" },
  confirmed: { label: "Confirmée", icon: CheckCircle2, color: "text-primary bg-primary/10 border-primary/20" },
  delivered: { label: "Livrée", icon: Truck, color: "text-emerald-500 bg-emerald-500/10 border-emerald-500/20" },
  cancelled: { label: "Annulée", icon: XCircle, color: "text-destructive bg-destructive/10 border-destructive/20" },
};

type Mode = "login" | "register" | "forgot" | "check-email";

const MonCompte = () => {
  const { user, loading, signIn, signUp, signOut, resetPassword, signInWithGoogle, resendConfirmation } = useAuth();
  const { data: currentVendor } = useCurrentVendor();
  const { toast } = useToast();
  const { theme, toggleTheme } = useTheme();
  const [mode, setMode] = useState<Mode>("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [pendingEmail, setPendingEmail] = useState("");

  const handleGoogle = async () => {
    setSubmitting(true);
    try {
      await signInWithGoogle();
    } catch (err: unknown) {
      toast({ title: "Erreur Google", description: (err as Error).message || "Échec de la connexion Google.", variant: "destructive" });
    } finally {
      setSubmitting(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      if (mode === "register") {
        const score = getPasswordScore(password);
        if (score < 2) {
          toast({ title: "Mot de passe faible", description: "Veuillez choisir un mot de passe plus sécurisé.", variant: "destructive" });
          setSubmitting(false);
          return;
        }
        const { error } = await signUp(email, password, fullName);
        if (error) {
          toast({ title: "Erreur", description: error.message, variant: "destructive" });
        } else {
          setPendingEmail(email);
          setMode("check-email" as Mode);
          toast({ title: "Inscription réussie !", description: "Vérifiez votre boîte mail pour confirmer votre compte." });
        }
      } else if (mode === "login") {
        const { error } = await signIn(email, password);
        if (error) {
          toast({ title: "Erreur", description: error.message, variant: "destructive" });
        }
      } else if (mode === "forgot") {
        const { error } = await resetPassword(email);
        if (error) {
          toast({ title: "Erreur", description: error.message, variant: "destructive" });
        } else {
          setPendingEmail(email);
          setMode("check-email" as Mode);
          toast({ title: "Email envoyé", description: "Vérifiez votre boîte mail pour réinitialiser votre mot de passe." });
        }
      }
    } catch (err: unknown) {
      toast({ title: "Erreur", description: (err as Error).message || "Une erreur est survenue.", variant: "destructive" });
    } finally {
      setSubmitting(false);
    }
  };

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
      return (data as unknown as UserOrder[]) ?? [];
    },
    enabled: !!user,
  });

  const { data: allProducts = [] } = useProducts();

  if (loading) {
    return (
      <div className="min-h-screen bg-background aurora-bg flex items-center justify-center">
        <div className="animate-spin w-12 h-12 border-4 border-primary border-t-transparent rounded-full shadow-lg shadow-primary/20" />
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
      <div className="min-h-screen bg-background aurora-bg">
        <SEO title="Espace Membre Mindhubs" description="Gérez votre compte MindHub, vos achats et vos informations personnelles." path="/mon-compte" keywords="compte mindhub, espace membre, mes achats formations, profil expert, connexion mindhubs" />
        <Navbar />
        <main className="pt-32 pb-24">
          <div className="container mx-auto px-4 max-w-4xl space-y-8">
            
            {/* Profile Header Card */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="glass-card rounded-[3rem] p-8 md:p-12 relative overflow-hidden"
            >
               <div className="absolute top-0 right-0 p-8">
                  <Badge className="bg-primary/20 text-primary border-none px-4 py-1.5 font-black text-[10px] tracking-widest uppercase">Membre Elite</Badge>
               </div>
               
               <div className="flex flex-col md:flex-row items-center gap-8">
                  <div className="h-28 w-28 rounded-[2rem] bg-primary flex items-center justify-center text-primary-foreground text-4xl font-black shadow-2xl shadow-primary/30 ring-4 ring-primary/10">
                     {initials}
                  </div>
                  <div className="text-center md:text-left space-y-2 flex-1">
                     <h1 className="text-4xl md:text-5xl font-black tracking-tighter">
                        {user.user_metadata?.full_name || "Expert Mindhubs"}
                     </h1>
                     <p className="text-muted-foreground font-bold">{user.email}</p>
                     <div className="flex flex-wrap items-center justify-center md:justify-start gap-4 pt-2">
                        <Badge variant="outline" className="border-white/5 bg-white/5 text-muted-foreground px-3 py-1 font-bold text-[10px] gap-2">
                           <Calendar size={12} /> Inscrit le {memberSince}
                        </Badge>
                        <Badge variant="outline" className={`px-3 py-1 font-bold text-[10px] gap-2 ${emailVerified ? "border-emerald-500/20 bg-emerald-500/5 text-emerald-500" : "border-amber-500/20 bg-amber-500/5 text-amber-500"}`}>
                           <Shield size={12} /> {emailVerified ? "Profil Certifié" : "Email en attente"}
                        </Badge>
                     </div>
                  </div>
                  <Button
                    variant="outline"
                    className="rounded-2xl h-12 px-6 border-white/10 hover:bg-destructive/10 hover:text-destructive hover:border-destructive/30 font-black text-xs uppercase tracking-widest transition-all"
                    onClick={async () => {
                      await signOut();
                      toast({ title: "Déconnexion", description: "À bientôt sur Mindhubs !" });
                    }}
                  >
                    <LogOut size={16} className="mr-2" /> Déconnexion
                  </Button>
               </div>
            </motion.div>

            {/* Main Content Grid */}
            <div className="grid md:grid-cols-3 gap-8">
               
               {/* Sidebar Column */}
               <div className="space-y-6">
                  {/* Vendor Access */}
                  <div className="glass-card rounded-[2rem] p-6 border-primary/20 bg-primary/5">
                     <div className="space-y-4">
                        <div className="h-12 w-12 rounded-2xl bg-primary flex items-center justify-center text-primary-foreground">
                           {currentVendor ? <LayoutDashboard size={24} /> : <Store size={24} />}
                        </div>
                        <div className="space-y-1">
                           <h3 className="font-black text-lg">{currentVendor ? "Dashboard Vendeur" : "Vendre vos Talents"}</h3>
                           <p className="text-xs font-medium text-muted-foreground leading-relaxed">
                              {currentVendor ? "Gérez vos ventes et vos produits digitaux." : "Lancez votre propre boutique et générez des revenus."}
                           </p>
                        </div>
                        <Button asChild className="w-full h-12 rounded-xl btn-glow font-black text-xs uppercase tracking-widest">
                           <Link to={currentVendor ? "/dashboard" : "/become-a-seller"}>
                              {currentVendor ? "Accéder au Studio" : "Démarrer Maintenant"}
                           </Link>
                        </Button>
                     </div>
                  </div>

                  {/* Security Center */}
                  <div className="glass-card rounded-[2rem] p-6 space-y-6 border-white/5">
                     <h3 className="font-black text-sm uppercase tracking-widest flex items-center gap-2"><ShieldCheck size={16} className="text-primary" /> Sécurité</h3>
                     <button
                        onClick={handlePasswordReset}
                        className="w-full flex items-center gap-4 p-4 rounded-2xl bg-white/5 border border-white/5 hover:border-primary/40 transition-all text-left group"
                     >
                        <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary shrink-0">
                           <KeyRound size={18} />
                        </div>
                        <div className="flex-1 min-w-0">
                           <p className="text-xs font-black text-foreground uppercase tracking-wider">Mot de passe</p>
                           <p className="text-[10px] text-muted-foreground font-bold">Réinitialiser via email</p>
                        </div>
                        <ArrowRight className="text-muted-foreground group-hover:text-primary transition-all" size={16} />
                     </button>
                  </div>
               </div>

               {/* Orders History Main Column */}
               <div className="md:col-span-2 space-y-6">
                  {/* Orders Card */}
                  <div className="glass-card rounded-[2.5rem] p-8 md:p-10 space-y-8 border-white/5">
                     <div className="flex items-center justify-between">
                        <h3 className="text-2xl font-black tracking-tighter flex items-center gap-3"><ShoppingBag className="text-primary" /> Historique d'Achats</h3>
                        <Badge variant="outline" className="border-white/10 text-muted-foreground px-3 py-1 font-black text-[10px]">{orders.length} Commande{orders.length > 1 ? "s" : ""}</Badge>
                     </div>

                     {orders.length === 0 ? (
                        <div className="text-center py-16 space-y-6 bg-white/5 rounded-[2rem] border-2 border-dashed border-white/5">
                           <ShoppingBag className="mx-auto text-muted-foreground/30" size={64} />
                           <div className="space-y-2">
                              <p className="text-xl font-black">Aucun achat pour le moment</p>
                              <p className="text-sm text-muted-foreground font-medium max-w-xs mx-auto">Commencez votre aventure digitale en explorant notre boutique d'experts.</p>
                           </div>
                           <Button asChild variant="outline" className="rounded-xl px-8 h-12 border-white/10 font-black text-xs uppercase tracking-widest">
                              <Link to="/boutique">Voir le Catalogue</Link>
                           </Button>
                        </div>
                     ) : (
                        <div className="space-y-4">
                           {orders.map((order) => {
                              const cfg = statusConfig[order.status];
                              return (
                                 <motion.div 
                                    key={order.id} 
                                    initial={{ opacity: 0, x: 20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    className="bg-white/5 rounded-3xl border border-white/5 p-6 hover:border-white/10 transition-all space-y-6"
                                 >
                                    <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                                       <div className="flex flex-wrap items-center gap-3">
                                          <Badge className={`${cfg.color} border-none font-black text-[10px] tracking-widest uppercase py-1 px-3`}>
                                             <cfg.icon size={12} className="mr-1.5" /> {cfg.label}
                                          </Badge>
                                          <span className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">
                                             {new Date(order.created_at).toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric" })}
                                          </span>
                                       </div>
                                       <span className="text-lg font-black text-foreground">{order.total_price.toLocaleString()} FCFA</span>
                                    </div>
                                    <div className="space-y-3">
                                       {order.items.map((item, idx) => (
                                          <div key={idx} className="flex items-center gap-4 bg-background/40 p-3 rounded-2xl border border-white/5 group">
                                             <div className="h-12 w-12 rounded-xl overflow-hidden border border-white/5">
                                                {item.image && <img src={item.image} alt={item.title} className="h-full w-full object-cover" />}
                                             </div>
                                             <div className="flex-1 min-w-0">
                                                <p className="text-sm font-black text-foreground truncate group-hover:text-primary transition-colors">{item.title}</p>
                                                <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Quantité: {item.quantity} · {item.price}</p>
                                             </div>
                                             <Button asChild size="sm" variant="ghost" className="rounded-lg h-8 px-3 text-[10px] font-black uppercase tracking-widest hover:bg-primary/10 hover:text-primary">
                                                <Link to={`/produit/${item.product_id}`}>Revoir</Link>
                                             </Button>
                                          </div>
                                       ))}
                                    </div>
                                 </motion.div>
                              );
                           })}
                        </div>
                     )}
                  </div>
               </div>

            </div>

            {/* Recommendations Section */}
            {recommendedProducts.length > 0 && (
               <div className="space-y-6">
                  <div className="flex items-center gap-4">
                     <h3 className="text-2xl font-black tracking-tighter flex items-center gap-3"><Sparkles className="text-primary" /> Sélectionné pour vous</h3>
                     <div className="flex-1 h-px bg-white/5" />
                  </div>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                     {recommendedProducts.map((p) => (
                        <Link
                           key={p.id}
                           to={`/produit/${p.id}`}
                           className="glass-card rounded-[2rem] p-4 hover:border-primary/40 transition-all group"
                        >
                           <div className="aspect-video rounded-2xl overflow-hidden mb-4 border border-white/5">
                              <img src={p.image} alt={p.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                           </div>
                           <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest mb-1">{p.category}</p>
                           <p className="text-sm font-black text-foreground truncate group-hover:text-primary transition-colors">{p.title}</p>
                           <p className="text-sm font-black text-primary mt-2">{p.price}</p>
                        </Link>
                     ))}
                  </div>
               </div>
            )}
            
          </div>
        </main>
        <FooterSection />
      </div>
    );
  }

  // ============= AUTH FORMS (Login/Register) =============
  return (
    <div className="min-h-screen bg-background aurora-bg">
      <SEO title="Connexion Expert – Mindhubs" description="Connectez-vous ou créez votre compte MindHub." path="/mon-compte" />
      <Navbar />
      <main className="pt-32 pb-24 flex items-center min-h-[90vh]">
        <div className="container mx-auto px-4 max-w-lg">
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center mb-8 space-y-4"
          >
             <div className="h-16 w-16 bg-primary rounded-[1.5rem] flex items-center justify-center text-primary-foreground mx-auto shadow-2xl shadow-primary/20">
                <Zap size={32} fill="currentColor" />
             </div>
             <h1 className="text-4xl font-black tracking-tighter">VOTRE PORTAIL <span className="text-primary italic">EXPERT</span></h1>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="glass-card rounded-[3rem] p-8 md:p-12 border-white/10 shadow-2xl relative overflow-hidden"
          >
            <div className="absolute top-6 right-6">
               <button 
                 onClick={toggleTheme}
                 className="h-10 w-10 rounded-2xl bg-white/5 flex items-center justify-center text-muted-foreground hover:text-primary transition-all border border-white/5"
                 title={theme === "dark" ? "Passer au mode clair" : "Passer au mode sombre"}
               >
                 {theme === "dark" ? <Sun size={18} /> : <Moon size={18} />}
               </button>
            </div>
            <Tabs value={mode} onValueChange={(v) => setMode(v as Mode)} className="w-full">
              <TabsList className="grid grid-cols-2 w-full mb-10 h-14 bg-white/5 rounded-2xl p-1 border border-white/5">
                <TabsTrigger value="login" className="rounded-xl font-black text-xs uppercase tracking-widest data-[state=active]:bg-primary data-[state=active]:text-white">Connexion</TabsTrigger>
                <TabsTrigger value="register" className="rounded-xl font-black text-xs uppercase tracking-widest data-[state=active]:bg-primary data-[state=active]:text-white">Inscription</TabsTrigger>
              </TabsList>

              <div className="space-y-8">
                 <GoogleButton onClick={handleGoogle} loading={submitting} />

                 <div className="relative">
                    <div className="absolute inset-0 flex items-center"><span className="w-full border-t border-white/5" /></div>
                    <div className="relative flex justify-center text-[10px] font-black uppercase tracking-widest"><span className="bg-card px-4 text-muted-foreground">Ou avec votre Email</span></div>
                 </div>

                 <TabsContent value="login" className="mt-0 space-y-6">
                    <form onSubmit={handleSubmit} className="space-y-6">
                       <div className="space-y-2">
                          <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Email</Label>
                          <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="votre@email.com" required className="h-14 rounded-2xl bg-white/5 border-white/10 font-bold focus:ring-primary/20" />
                       </div>
                       <div className="space-y-2">
                          <div className="flex justify-between items-center px-1">
                             <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Mot de Passe</Label>
                             <button type="button" onClick={() => setMode("forgot")} className="text-[10px] font-black text-primary hover:underline uppercase tracking-widest">Oublié ?</button>
                          </div>
                          <div className="relative">
                             <Input type={showPassword ? "text" : "password"} value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" required className="h-14 rounded-2xl bg-white/5 border-white/10 font-bold pr-12 focus:ring-primary/20" />
                             <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">{showPassword ? <EyeOff size={20} /> : <Eye size={20} />}</button>
                          </div>
                       </div>
                       <Button type="submit" className="w-full h-14 rounded-2xl btn-glow font-black text-lg uppercase tracking-tighter" disabled={submitting}>
                          {submitting ? <Loader2 className="animate-spin" /> : "Accéder au Portail"}
                       </Button>
                    </form>
                 </TabsContent>

                 <TabsContent value="register" className="mt-0 space-y-6">
                    <form onSubmit={handleSubmit} className="space-y-6">
                       <div className="space-y-2">
                          <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Nom Complet</Label>
                          <Input value={fullName} onChange={(e) => setFullName(e.target.value)} placeholder="Jean Dupont" required className="h-14 rounded-2xl bg-white/5 border-white/10 font-bold" />
                       </div>
                       <div className="space-y-2">
                          <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Email</Label>
                          <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="votre@email.com" required className="h-14 rounded-2xl bg-white/5 border-white/10 font-bold" />
                       </div>
                       <div className="space-y-2">
                          <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Mot de Passe</Label>
                          <div className="relative">
                             <Input type={showPassword ? "text" : "password"} value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" required className="h-14 rounded-2xl bg-white/5 border-white/10 font-bold pr-12" />
                             <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground">{showPassword ? <EyeOff size={20} /> : <Eye size={20} />}</button>
                          </div>
                          <PasswordStrength password={password} />
                       </div>
                       <p className="text-[9px] text-muted-foreground leading-relaxed font-bold uppercase tracking-wider text-center">
                          En rejoignant l'Elite, vous acceptez nos <Link to="/conditions-generales" className="text-primary hover:underline">CGU</Link> et notre <Link to="/politique-confidentialite" className="text-primary hover:underline">Confidentialité</Link>.
                       </p>
                       <Button type="submit" className="w-full h-14 rounded-2xl btn-glow font-black text-lg uppercase tracking-tighter" disabled={submitting}>
                          {submitting ? <Loader2 className="animate-spin" /> : "Créer mon Compte Elite"}
                       </Button>
                    </form>
                 </TabsContent>
              </div>
            </Tabs>
          </motion.div>
        </div>
      </main>
      <FooterSection />
    </div>
  );
};

export default MonCompte;

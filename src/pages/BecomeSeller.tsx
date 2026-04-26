import { useState, useMemo } from "react";
import { useNavigate, Link } from "react-router-dom";
import { z } from "zod";
import Navbar from "@/components/Navbar";
import FooterSection from "@/components/FooterSection";
import SEO from "@/components/SEO";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Store, CheckCircle2, ShoppingBag, TrendingUp, Sparkles, ArrowRight, ShieldCheck, Zap, Globe, MousePointer2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";

const schema = z.object({
  shopName: z.string().trim().min(2, "Nom trop court").max(60),
  username: z
    .string()
    .trim()
    .min(3, "3 caractères minimum")
    .max(30)
    .regex(/^[a-z0-9-]+$/, "lettres minuscules, chiffres et tirets uniquement"),
  email: z.string().trim().email("Email invalide").max(255),
  password: z.string().min(1, "Mot de passe requis").max(72),
  description: z.string().trim().max(300).optional(),
});

const BecomeSeller = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [form, setForm] = useState({
    shopName: "",
    username: "",
    email: user?.email || "",
    password: "",
    description: "",
  });
  const [submitting, setSubmitting] = useState(false);

  const slugify = (s: string) =>
    s.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "").slice(0, 30);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const parsed = schema.safeParse(form);
    if (!parsed.success) {
      toast.error(parsed.error.errors[0].message);
      return;
    }
    setSubmitting(true);
    try {
      let userId = user?.id;

      if (!userId) {
        const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
          email: parsed.data.email,
          password: parsed.data.password,
          options: {
            data: { full_name: parsed.data.shopName },
            emailRedirectTo: window.location.origin,
          },
        });
        if (signUpError) throw signUpError;
        userId = signUpData.user?.id;
        if (!userId) throw new Error("Impossible de créer le compte");

        if (!signUpData.session) {
          await supabase.auth.signInWithPassword({
            email: parsed.data.email,
            password: parsed.data.password,
          });
        }
      }

      const { error: vendorError } = await supabase.from("vendors").insert({
        user_id: userId,
        username: parsed.data.username,
        shop_name: parsed.data.shopName,
        description: parsed.data.description || null,
      });
      if (vendorError) {
        if (vendorError.code === "23505") throw new Error("Ce nom d'utilisateur est déjà pris");
        throw vendorError;
      }

      const { error: roleError } = await supabase
        .from("user_roles")
        .insert({ user_id: userId, role: "vendor" });
      
      if (roleError && roleError.code !== "23505") {
        console.error("Role assignment error:", roleError);
      }

      toast.success("Votre boutique MindHubs est prête ! 🚀");
      navigate("/dashboard");
    } catch (err: unknown) {
      toast.error((err as Error).message || "Impossible de créer la boutique");
    } finally {
      setSubmitting(false);
    }
  };

  const storeInitials = useMemo(() => 
    form.shopName ? form.shopName.split(" ").map(w => w[0]).join("").slice(0, 2).toUpperCase() : "BH", 
  [form.shopName]);

  return (
    <div className="min-h-screen bg-background selection:bg-primary/30">
      <SEO 
        title="Ouvrir une boutique — MindHubs Creator" 
        description="Lancez votre boutique de produits digitaux sur MindHubs et commencez à vendre en quelques minutes." 
        path="/become-a-seller" 
      />
      <Navbar />

      <main className="pt-24 pb-20 relative overflow-hidden">
        {/* Background Decorative Elements */}
        <div className="absolute top-0 left-0 right-0 h-[500px] bg-gradient-to-b from-primary/5 via-background to-background -z-10" />
        <div className="absolute top-40 -left-20 h-80 w-80 bg-primary/10 rounded-full blur-[100px] -z-10 animate-float" />
        <div className="absolute top-60 -right-20 h-64 w-64 bg-accent/10 rounded-full blur-[100px] -z-10 animate-pulse-glow" />

        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto grid lg:grid-cols-12 gap-12 items-start">
            
            {/* Left Content: Value Prop */}
            <div className="lg:col-span-5 space-y-8 pt-8">
              <motion.div 
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20"
              >
                <Sparkles size={14} className="text-primary" />
                <span className="text-[10px] font-black uppercase tracking-widest text-primary">Creator Program</span>
              </motion.div>

              <div className="space-y-4">
                <motion.h1 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 }}
                  className="text-4xl sm:text-6xl font-black text-foreground leading-[1.1] tracking-tighter"
                >
                  Devenez un <span className="text-primary italic">Expert</span> MindHubs
                </motion.h1>
                <motion.p 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                  className="text-lg text-muted-foreground leading-relaxed"
                >
                  Transformez vos connaissances en revenus passifs. Créez votre boutique pro en moins de 2 minutes.
                </motion.p>
              </div>

              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="grid gap-4"
              >
                {[
                  { icon: Globe, t: "URL Personnalisée", d: "Votre propre espace /store/nom", color: "text-blue-500" },
                  { icon: TrendingUp, t: "Analytics Pro", d: "Suivez chaque vente et chaque vue", color: "text-emerald-500" },
                  { icon: ShieldCheck, t: "Paiements Sécurisés", d: "Gérez vos revenus sans intermédiaire", color: "text-amber-500" },
                  { icon: Zap, t: "Mise en ligne Instantanée", d: "Vendez dès votre boutique créée", color: "text-purple-500" },
                ].map(({ icon: Icon, t, d, color }, i) => (
                  <div key={i} className="flex items-center gap-4 p-4 rounded-2xl bg-card/50 border border-border/50 hover:border-primary/30 transition-all group">
                    <div className={`h-10 w-10 rounded-xl bg-background flex items-center justify-center shadow-sm group-hover:scale-110 transition-transform ${color}`}>
                      <Icon size={20} />
                    </div>
                    <div>
                      <p className="font-black text-sm">{t}</p>
                      <p className="text-xs text-muted-foreground">{d}</p>
                    </div>
                  </div>
                ))}
              </motion.div>
            </div>

            {/* Right Content: Form & Preview */}
            <div className="lg:col-span-7 space-y-6">
              <div className="grid md:grid-cols-2 gap-6 items-start">
                
                {/* Form Card */}
                <motion.div 
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.4 }}
                  className="bg-card border border-border rounded-[2.5rem] p-8 shadow-2xl relative overflow-hidden"
                >
                  <div className="absolute top-0 left-0 w-full h-1.5 bg-primary/20" />
                  
                  <form onSubmit={handleSubmit} className="space-y-5">
                    <div className="space-y-1.5">
                      <Label htmlFor="shopName" className="text-xs font-black uppercase tracking-widest text-muted-foreground ml-1">Nom de la boutique</Label>
                      <Input
                        id="shopName"
                        className="h-12 rounded-xl bg-muted/30 border-none focus-visible:ring-primary font-bold"
                        value={form.shopName}
                        onChange={(e) => {
                          const v = e.target.value;
                          setForm({ ...form, shopName: v, username: form.username || slugify(v) });
                        }}
                        placeholder="Ex: Braand Digital"
                        required
                      />
                    </div>

                    <div className="space-y-1.5">
                      <Label htmlFor="username" className="text-xs font-black uppercase tracking-widest text-muted-foreground ml-1">Identifiant URL</Label>
                      <div className="relative">
                        <div className="absolute left-4 top-1/2 -translate-y-1/2 text-[10px] font-bold text-muted-foreground uppercase pointer-events-none">
                          mindhubs.fun/store/
                        </div>
                        <Input
                          id="username"
                          className="h-12 pl-36 rounded-xl bg-muted/30 border-none focus-visible:ring-primary font-black lowercase"
                          value={form.username}
                          onChange={(e) => setForm({ ...form, username: slugify(e.target.value) })}
                          placeholder="votre-nom"
                          required
                        />
                      </div>
                    </div>

                    {!user && (
                      <AnimatePresence>
                        <motion.div 
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: "auto", opacity: 1 }}
                          className="space-y-4"
                        >
                          <div className="space-y-1.5">
                            <Label htmlFor="email" className="text-xs font-black uppercase tracking-widest text-muted-foreground ml-1">Email professionnel</Label>
                            <Input 
                              id="email" 
                              type="email" 
                              className="h-12 rounded-xl bg-muted/30 border-none"
                              value={form.email} 
                              onChange={(e) => setForm({ ...form, email: e.target.value })} 
                              required 
                            />
                          </div>
                          <div className="space-y-1.5">
                            <Label htmlFor="password" className="text-xs font-black uppercase tracking-widest text-muted-foreground ml-1">Mot de passe</Label>
                            <Input 
                              id="password" 
                              type="password" 
                              className="h-12 rounded-xl bg-muted/30 border-none"
                              value={form.password} 
                              onChange={(e) => setForm({ ...form, password: e.target.value })} 
                              required 
                            />
                          </div>
                        </motion.div>
                      </AnimatePresence>
                    )}

                    <div className="space-y-1.5">
                      <Label htmlFor="description" className="text-xs font-black uppercase tracking-widest text-muted-foreground ml-1">Bio (Facultatif)</Label>
                      <Textarea
                        id="description"
                        className="rounded-xl bg-muted/30 border-none resize-none"
                        value={form.description}
                        onChange={(e) => setForm({ ...form, description: e.target.value })}
                        placeholder="Expert en marketing digital..."
                        rows={3}
                        maxLength={300}
                      />
                    </div>

                    <Button type="submit" disabled={submitting} className="w-full h-14 rounded-2xl btn-glow text-lg font-black gap-3 group">
                      {submitting ? (
                        <>Installation...</>
                      ) : (
                        <>Créer ma boutique <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" /></>
                      )}
                    </Button>

                    <p className="text-[10px] text-muted-foreground text-center font-medium">
                      Déjà un compte ? <Link to="/mon-compte" className="text-primary hover:underline">Se connecter</Link>
                    </p>
                  </form>
                </motion.div>

                {/* Live Preview Card */}
                <motion.div 
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.6 }}
                  className="hidden md:block sticky top-32 space-y-6"
                >
                  <p className="text-[10px] font-black uppercase tracking-widest text-primary ml-1">Aperçu en direct</p>
                  <div className="p-6 rounded-[2rem] bg-card border border-primary/20 shadow-xl space-y-6 relative overflow-hidden">
                    <div className="absolute -top-10 -right-10 h-32 w-32 bg-primary/10 rounded-full blur-3xl" />
                    
                    <div className="flex flex-col items-center text-center space-y-4">
                      <div className="h-20 w-20 rounded-3xl bg-primary/10 flex items-center justify-center border-2 border-primary/20 shadow-inner">
                        <span className="text-2xl font-black text-primary animate-pulse">{storeInitials}</span>
                      </div>
                      <div className="space-y-1">
                        <h3 className="text-xl font-black text-foreground">{form.shopName || "Votre Boutique"}</h3>
                        <p className="text-[10px] font-bold text-primary uppercase tracking-tighter">Expert Certifié MindHubs</p>
                      </div>
                      <div className="w-full h-px bg-border/50" />
                      <p className="text-xs text-muted-foreground line-clamp-3 min-h-[3em]">
                        {form.description || "Votre bio s'affichera ici pour rassurer vos futurs clients..."}
                      </p>
                      <div className="flex gap-2 w-full pt-2">
                        <div className="flex-1 h-8 rounded-lg bg-muted/40 animate-pulse" />
                        <div className="flex-1 h-8 rounded-lg bg-muted/40 animate-pulse" />
                      </div>
                    </div>
                  </div>

                  <div className="p-4 rounded-2xl bg-primary/5 border border-primary/10 flex items-center gap-3">
                    <div className="h-8 w-8 rounded-lg bg-primary/20 flex items-center justify-center text-primary">
                      <MousePointer2 size={16} />
                    </div>
                    <p className="text-[10px] font-bold leading-tight">
                      C'est ainsi que les clients verront votre profil de créateur.
                    </p>
                  </div>
                </motion.div>

              </div>
            </div>

          </div>
        </div>
      </main>

      <FooterSection />
    </div>
  );
};

export default BecomeSeller;

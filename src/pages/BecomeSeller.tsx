import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { z } from "zod";
import Navbar from "@/components/Navbar";
import FooterSection from "@/components/FooterSection";
import SEO from "@/components/SEO";
import AnimateOnScroll from "@/components/AnimateOnScroll";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Store, CheckCircle2, ShoppingBag, TrendingUp } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "@/hooks/use-toast";

const schema = z.object({
  shopName: z.string().trim().min(2, "Nom trop court").max(60),
  username: z
    .string()
    .trim()
    .min(3, "3 caractères minimum")
    .max(30)
    .regex(/^[a-z0-9-]+$/, "lettres minuscules, chiffres et tirets uniquement"),
  email: z.string().trim().email("Email invalide").max(255),
  password: z.string().min(6, "6 caractères minimum").max(72),
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
      toast({ title: "Formulaire invalide", description: parsed.error.errors[0].message, variant: "destructive" });
      return;
    }
    setSubmitting(true);
    try {
      let userId = user?.id;

      // Sign up if not logged in
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

        // Auto sign-in (works only if email confirmation disabled)
        if (!signUpData.session) {
          await supabase.auth.signInWithPassword({
            email: parsed.data.email,
            password: parsed.data.password,
          });
        }
      }

      // Create vendor profile
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

      // Assign vendor role
      const { error: roleError } = await supabase
        .from("user_roles")
        .insert({ user_id: userId, role: "vendor" });
      if (roleError && roleError.code !== "23505") {
        console.error("Role assignment error:", roleError);
      }

      toast({ title: "Boutique créée 🎉", description: "Bienvenue dans la marketplace !" });
      navigate("/dashboard");
    } catch (err: any) {
      toast({ title: "Erreur", description: err.message || "Impossible de créer la boutique", variant: "destructive" });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <SEO title="Devenir vendeur — MindHub" description="Créez votre boutique et vendez vos produits sur la marketplace MindHub." path="/become-a-seller" />
      <Navbar />

      <section className="container mx-auto px-4 pt-28 sm:pt-32 pb-12">
        <div className="max-w-5xl mx-auto grid md:grid-cols-2 gap-8">
          <AnimateOnScroll>
            <div className="space-y-6">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-accent/10 border border-accent/20">
                <Store size={14} className="text-accent" />
                <span className="text-xs font-semibold text-accent">Programme vendeur</span>
              </div>
              <h1 className="text-3xl sm:text-4xl font-bold text-foreground leading-tight">
                Lance ta boutique sur <span className="text-gradient-brand">MindHub</span>
              </h1>
              <p className="text-sm sm:text-base text-muted-foreground">
                Rejoins notre marketplace, vends tes formations, kits et produits digitaux à des milliers d'acheteurs.
              </p>
              <div className="space-y-3 pt-2">
                {[
                  { icon: ShoppingBag, t: "Boutique personnelle", d: "URL dédiée /store/ton-nom" },
                  { icon: TrendingUp, t: "Stats en temps réel", d: "Vues, achats et revenus" },
                  { icon: CheckCircle2, t: "Paiement direct", d: "Tu gardes ton lien de paiement" },
                ].map(({ icon: Icon, t, d }) => (
                  <div key={t} className="flex items-start gap-3 p-3 rounded-xl stat-card">
                    <Icon size={18} className="text-primary shrink-0 mt-0.5" />
                    <div>
                      <p className="text-sm font-semibold text-foreground">{t}</p>
                      <p className="text-xs text-muted-foreground">{d}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </AnimateOnScroll>

          <AnimateOnScroll delay={150}>
            <form onSubmit={handleSubmit} className="stat-card rounded-2xl p-5 sm:p-7 space-y-4">
              <h2 className="text-lg font-bold text-foreground">Crée ta boutique</h2>

              <div className="space-y-1.5">
                <Label htmlFor="shopName">Nom de la boutique *</Label>
                <Input
                  id="shopName"
                  value={form.shopName}
                  onChange={(e) => {
                    const v = e.target.value;
                    setForm({ ...form, shopName: v, username: form.username || slugify(v) });
                  }}
                  placeholder="Ma Super Boutique"
                  required
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="username">Identifiant URL *</Label>
                <div className="flex items-center gap-1 text-xs text-muted-foreground">
                  <span>mindhubs.fun/store/</span>
                  <Input
                    id="username"
                    value={form.username}
                    onChange={(e) => setForm({ ...form, username: slugify(e.target.value) })}
                    placeholder="ma-boutique"
                    required
                  />
                </div>
              </div>

              {!user && (
                <>
                  <div className="space-y-1.5">
                    <Label htmlFor="email">Email *</Label>
                    <Input id="email" type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} required />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="password">Mot de passe *</Label>
                    <Input id="password" type="password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} required minLength={6} />
                  </div>
                </>
              )}

              <div className="space-y-1.5">
                <Label htmlFor="description">Description (facultatif)</Label>
                <Textarea
                  id="description"
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  placeholder="Présente ta boutique en quelques mots…"
                  rows={3}
                  maxLength={300}
                />
              </div>

              <Button type="submit" disabled={submitting} className="w-full">
                {submitting ? "Création…" : "Créer ma boutique"}
              </Button>

              <p className="text-[11px] text-muted-foreground text-center">
                Déjà un compte ?{" "}
                <Link to="/mon-compte" className="text-primary hover:underline">Se connecter</Link>
              </p>
            </form>
          </AnimateOnScroll>
        </div>
      </section>

      <FooterSection />
    </div>
  );
};

export default BecomeSeller;

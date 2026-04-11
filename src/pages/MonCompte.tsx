import { useState } from "react";
import { Link } from "react-router-dom";
import Navbar from "@/components/Navbar";
import FooterSection from "@/components/FooterSection";
import AnimateOnScroll from "@/components/AnimateOnScroll";
import SEO from "@/components/SEO";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import {
  User, Mail, Lock, LogOut, Eye, EyeOff, ShoppingBag,
  Calendar, Shield, BookOpen, ArrowRight
} from "lucide-react";

const MonCompte = () => {
  const { user, loading, signIn, signUp, signOut, resetPassword } = useAuth();
  const { toast } = useToast();
  const [mode, setMode] = useState<"login" | "register" | "forgot">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  // Logged in view
  if (user) {
    const memberSince = new Date(user.created_at).toLocaleDateString("fr-FR", {
      year: "numeric", month: "long", day: "numeric"
    });
    const initials = (user.user_metadata?.full_name || user.email || "U")
      .split(" ").map((w: string) => w[0]).join("").toUpperCase().slice(0, 2);

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
                    <div className="flex items-center justify-center sm:justify-start gap-4 mt-3">
                      <span className="inline-flex items-center gap-1.5 text-xs text-muted-foreground">
                        <Calendar size={12} /> Membre depuis {memberSince}
                      </span>
                      <span className="inline-flex items-center gap-1.5 text-xs text-primary">
                        <Shield size={12} /> Vérifié
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

            {/* Quick Stats */}
            <AnimateOnScroll delay={100}>
              <div className="grid grid-cols-3 gap-4 mb-6">
                {[
                  { icon: ShoppingBag, label: "Achats", value: "0" },
                  { icon: BookOpen, label: "Formations", value: "0" },
                  { icon: Shield, label: "Statut", value: "Actif" },
                ].map((stat) => (
                  <div key={stat.label} className="stat-card rounded-xl p-4 text-center border-glow">
                    <stat.icon className="mx-auto text-primary mb-2" size={20} />
                    <p className="text-lg font-bold text-foreground">{stat.value}</p>
                    <p className="text-xs text-muted-foreground">{stat.label}</p>
                  </div>
                ))}
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

            {/* Purchases */}
            <AnimateOnScroll delay={200}>
              <div className="stat-card rounded-2xl p-6">
                <h3 className="font-semibold text-foreground mb-4 flex items-center gap-2 text-sm">
                  <ShoppingBag size={16} className="text-primary" /> Mes achats
                </h3>
                <div className="text-center py-8">
                  <ShoppingBag className="mx-auto text-muted-foreground/30 mb-3" size={40} />
                  <p className="text-sm text-muted-foreground mb-4">Vous n'avez pas encore de formations.</p>
                  <Link
                    to="/boutique"
                    className="group inline-flex items-center gap-2 bg-primary text-primary-foreground px-6 py-2.5 rounded-xl text-sm font-medium hover:bg-primary/90 transition-all"
                  >
                    Explorer le catalogue
                    <ArrowRight size={14} className="transition-transform group-hover:translate-x-1" />
                  </Link>
                </div>
              </div>
            </AnimateOnScroll>
          </div>
        </main>
        <FooterSection />
      </div>
    );
  }

  // Auth forms
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
        const { error } = await signUp(email, password, fullName);
        if (error) throw error;
        toast({ title: "Inscription réussie !", description: "Vérifiez votre email pour confirmer votre compte." });
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

  return (
    <div className="min-h-screen bg-background">
      <SEO title="Mon Compte" description="Connectez-vous ou créez votre compte MindHub." path="/mon-compte" />
      <Navbar />
      <main className="pt-24 pb-16 flex items-center min-h-[80vh]">
        <div className="container mx-auto px-4 max-w-md">
          <AnimateOnScroll>
            <div className="stat-card rounded-2xl p-8 border-glow">
              <div className="text-center mb-8">
                <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <User className="text-primary" size={28} />
                </div>
                <h1 className="text-2xl font-bold text-foreground">
                  {mode === "login" ? "Bon retour !" : mode === "register" ? "Créer un compte" : "Réinitialisation"}
                </h1>
                <p className="text-muted-foreground text-sm mt-2">
                  {mode === "login"
                    ? "Connectez-vous pour accéder à vos formations"
                    : mode === "register"
                    ? "Rejoignez +2 000 apprenants sur MindHub"
                    : "Entrez votre email pour recevoir un lien"}
                </p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                {mode === "register" && (
                  <div>
                    <label className="text-sm font-medium text-foreground mb-1.5 block">Nom complet</label>
                    <Input
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      placeholder="Jean Dupont"
                      required
                      className="bg-background"
                    />
                  </div>
                )}

                <div>
                  <label className="text-sm font-medium text-foreground mb-1.5 block">Adresse email</label>
                  <Input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="votre@email.com"
                    required
                    className="bg-background"
                  />
                </div>

                {mode !== "forgot" && (
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
                        className="bg-background pr-10"
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
                )}

                {mode === "login" && (
                  <div className="text-right">
                    <button
                      type="button"
                      onClick={() => setMode("forgot")}
                      className="text-xs text-primary hover:underline"
                    >
                      Mot de passe oublié ?
                    </button>
                  </div>
                )}

                <Button
                  type="submit"
                  className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-semibold py-3 rounded-xl"
                  disabled={submitting}
                >
                  {submitting ? (
                    <span className="animate-spin w-4 h-4 border-2 border-primary-foreground border-t-transparent rounded-full" />
                  ) : mode === "login" ? (
                    "Se connecter"
                  ) : mode === "register" ? (
                    "Créer mon compte"
                  ) : (
                    "Envoyer le lien"
                  )}
                </Button>
              </form>

              <div className="mt-6 text-center text-sm text-muted-foreground">
                {mode === "login" ? (
                  <p>
                    Pas encore de compte ?{" "}
                    <button onClick={() => setMode("register")} className="text-primary hover:underline font-medium">
                      Créer un compte
                    </button>
                  </p>
                ) : (
                  <p>
                    Déjà un compte ?{" "}
                    <button onClick={() => setMode("login")} className="text-primary hover:underline font-medium">
                      Se connecter
                    </button>
                  </p>
                )}
              </div>
            </div>
          </AnimateOnScroll>
        </div>
      </main>
      <FooterSection />
    </div>
  );
};

export default MonCompte;

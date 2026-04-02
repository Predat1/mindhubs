import { useState } from "react";
import { Navigate } from "react-router-dom";
import Navbar from "@/components/Navbar";
import FooterSection from "@/components/FooterSection";
import AnimateOnScroll from "@/components/AnimateOnScroll";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { User, Mail, Lock, LogOut, Eye, EyeOff, ShoppingBag } from "lucide-react";

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
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <main className="pt-24 pb-16">
          <div className="container mx-auto px-4 max-w-2xl">
            <AnimateOnScroll>
              <div className="bg-card border border-border rounded-2xl p-8">
                <div className="flex items-center gap-4 mb-8">
                  <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center">
                    <User className="text-primary" size={28} />
                  </div>
                  <div>
                    <h1 className="text-2xl font-bold text-foreground">
                      {user.user_metadata?.full_name || "Mon Compte"}
                    </h1>
                    <p className="text-muted-foreground text-sm">{user.email}</p>
                  </div>
                </div>

                <div className="space-y-6">
                  <div className="bg-background rounded-xl p-5 border border-border">
                    <h3 className="font-semibold text-foreground mb-3 flex items-center gap-2">
                      <Mail size={18} /> Informations du compte
                    </h3>
                    <div className="space-y-2 text-sm text-muted-foreground">
                      <p><span className="text-foreground font-medium">Email :</span> {user.email}</p>
                      <p><span className="text-foreground font-medium">Nom :</span> {user.user_metadata?.full_name || "Non renseigné"}</p>
                      <p><span className="text-foreground font-medium">Membre depuis :</span> {new Date(user.created_at).toLocaleDateString("fr-FR")}</p>
                    </div>
                  </div>

                  <div className="bg-background rounded-xl p-5 border border-border">
                    <h3 className="font-semibold text-foreground mb-3 flex items-center gap-2">
                      <ShoppingBag size={18} /> Mes achats
                    </h3>
                    <p className="text-sm text-muted-foreground">Vos achats apparaîtront ici une fois le système de paiement activé.</p>
                  </div>

                  <Button
                    variant="outline"
                    className="w-full text-destructive border-destructive/30 hover:bg-destructive/10"
                    onClick={async () => {
                      await signOut();
                      toast({ title: "Déconnexion réussie", description: "À bientôt !" });
                    }}
                  >
                    <LogOut size={18} /> Se déconnecter
                  </Button>
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
        toast({ title: "Connexion réussie", description: "Bienvenue sur Savoir Hub !" });
      }
    } catch (err: any) {
      toast({ title: "Erreur", description: err.message || "Une erreur est survenue.", variant: "destructive" });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="pt-24 pb-16">
        <div className="container mx-auto px-4 max-w-md">
          <AnimateOnScroll>
            <div className="bg-card border border-border rounded-2xl p-8">
              <div className="text-center mb-8">
                <div className="w-14 h-14 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <User className="text-primary" size={24} />
                </div>
                <h1 className="text-2xl font-bold text-foreground">
                  {mode === "login" ? "Connexion" : mode === "register" ? "Créer un compte" : "Mot de passe oublié"}
                </h1>
                <p className="text-muted-foreground text-sm mt-1">
                  {mode === "login" ? "Connectez-vous à votre espace" : mode === "register" ? "Rejoignez la communauté Savoir Hub" : "Entrez votre email pour réinitialiser"}
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
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                      >
                        {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                      </button>
                    </div>
                  </div>
                )}

                {mode === "login" && (
                  <button
                    type="button"
                    onClick={() => setMode("forgot")}
                    className="text-sm text-primary hover:underline"
                  >
                    Mot de passe oublié ?
                  </button>
                )}

                <Button type="submit" className="w-full" disabled={submitting}>
                  {submitting ? (
                    <span className="animate-spin w-4 h-4 border-2 border-primary-foreground border-t-transparent rounded-full" />
                  ) : mode === "login" ? "Se connecter" : mode === "register" ? "Créer mon compte" : "Réinitialiser"}
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

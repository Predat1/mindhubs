import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import Navbar from "@/components/Navbar";
import FooterSection from "@/components/FooterSection";
import SEO from "@/components/SEO";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { Lock, Eye, EyeOff, AlertTriangle, CheckCircle2 } from "lucide-react";
import PasswordStrength, { getPasswordScore } from "@/components/auth/PasswordStrength";
import { translateAuthError } from "@/contexts/AuthContext";

const ResetPassword = () => {
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [validSession, setValidSession] = useState<boolean | null>(null);
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    // Wait briefly for Supabase to process the recovery hash
    const check = async () => {
      const hash = window.location.hash;
      const isRecoveryUrl = hash.includes("type=recovery");
      const { data } = await supabase.auth.getSession();
      setValidSession(isRecoveryUrl || !!data.session);
    };
    const t = setTimeout(check, 400);
    return () => clearTimeout(t);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirm) {
      toast({ title: "Erreur", description: "Les mots de passe ne correspondent pas.", variant: "destructive" });
      return;
    }
    if (getPasswordScore(password) < 2) {
      toast({ title: "Mot de passe trop faible", description: "Renforcez votre mot de passe pour continuer.", variant: "destructive" });
      return;
    }
    setSubmitting(true);
    try {
      const { error } = await supabase.auth.updateUser({ password });
      if (error) throw new Error(translateAuthError(error.message));
      toast({ title: "Mot de passe mis à jour", description: "Reconnectez-vous avec votre nouveau mot de passe." });
      await supabase.auth.signOut();
      navigate("/mon-compte");
    } catch (err: any) {
      toast({ title: "Erreur", description: err.message, variant: "destructive" });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <SEO title="Réinitialiser le mot de passe" description="Réinitialisez votre mot de passe MindHub." path="/reset-password" />
      <Navbar />
      <main className="pt-24 pb-16">
        <div className="container mx-auto px-4 max-w-md">
          <div className="stat-card border-glow rounded-2xl p-8">
            {validSession === false ? (
              <div className="text-center space-y-4">
                <div className="w-14 h-14 bg-destructive/10 rounded-full flex items-center justify-center mx-auto">
                  <AlertTriangle className="text-destructive" size={24} />
                </div>
                <h1 className="text-xl font-bold text-foreground">Lien invalide ou expiré</h1>
                <p className="text-sm text-muted-foreground">
                  Ce lien de réinitialisation n'est plus valide. Demandez-en un nouveau pour continuer.
                </p>
                <Link to="/mon-compte">
                  <Button className="w-full">Demander un nouveau lien</Button>
                </Link>
              </div>
            ) : (
              <>
                <div className="text-center mb-8">
                  <div className="w-14 h-14 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Lock className="text-primary" size={24} />
                  </div>
                  <h1 className="text-2xl font-bold text-foreground">Nouveau mot de passe</h1>
                  <p className="text-muted-foreground text-sm mt-1">Choisissez un mot de passe fort et unique</p>
                </div>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <label className="text-sm font-medium text-foreground mb-1.5 block">Nouveau mot de passe</label>
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
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                      >
                        {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                      </button>
                    </div>
                    <PasswordStrength password={password} />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-foreground mb-1.5 block">Confirmer le mot de passe</label>
                    <Input
                      type={showPassword ? "text" : "password"}
                      value={confirm}
                      onChange={(e) => setConfirm(e.target.value)}
                      placeholder="••••••••"
                      required
                    />
                    {confirm && password === confirm && (
                      <p className="mt-1.5 text-[10px] text-accent flex items-center gap-1">
                        <CheckCircle2 size={11} /> Les mots de passe correspondent
                      </p>
                    )}
                  </div>
                  <Button type="submit" className="w-full" disabled={submitting || !validSession}>
                    {submitting ? <span className="animate-spin w-4 h-4 border-2 border-primary-foreground border-t-transparent rounded-full" /> : "Mettre à jour"}
                  </Button>
                </form>
              </>
            )}
          </div>
        </div>
      </main>
      <FooterSection />
    </div>
  );
};

export default ResetPassword;

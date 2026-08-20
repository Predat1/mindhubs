import { useEffect, useMemo, useRef, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { useQueryClient } from "@tanstack/react-query";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { z } from "zod";
import {
  ArrowRight,
  Check,
  CheckCircle2,
  Copy,
  ExternalLink,
  Loader2,
  LockKeyhole,
  Mail,
  RefreshCw,
  ShieldCheck,
  Sparkles,
  Store,
  UserRound,
} from "lucide-react";

import SEO from "@/components/SEO";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/contexts/AuthContext";
import { useCurrentVendor } from "@/hooks/useVendors";
import { toast } from "sonner";
import MindHubsMark from "@/components/brand/MindHubsMark";
import {
  initializeSeller,
  isUsernameAvailable,
  normalizeUsername,
  slugifyShopName,
} from "@/lib/seller-onboarding";

type OnboardingStep = "auth" | "store" | "confirm";
type AuthMode = "register" | "login";
type UsernameStatus = "idle" | "checking" | "available" | "taken" | "error";

const storeSchema = z.object({
  shopName: z.string().trim().min(2, "Le nom doit contenir au moins 2 caractères.").max(60, "Le nom est trop long."),
  username: z.string().trim().regex(/^[a-z0-9-]{3,30}$/, "Utilisez 3 à 30 caractères minuscules, chiffres ou tirets."),
});

const BENEFITS = [
  { icon: Store, title: "Votre boutique personnelle", text: "Un lien unique à partager sur WhatsApp, les réseaux sociaux ou vos campagnes." },
  { icon: Sparkles, title: "Des outils pour avancer", text: "Créez vos produits, vos visuels et vos pages de vente depuis un seul espace." },
  { icon: ShieldCheck, title: "Vous gardez le contrôle", text: "Choisissez librement les produits à afficher dans votre boutique ou la marketplace." },
];

const BecomeSeller = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const queryClient = useQueryClient();
  const reduce = useReducedMotion();
  const { user, loading: authLoading, signUp, signIn, signInWithGoogle, resendConfirmation } = useAuth();
  const { data: existingVendor, isLoading: vendorLoading } = useCurrentVendor();

  const [step, setStep] = useState<OnboardingStep>(user ? "store" : "auth");
  const [authMode, setAuthMode] = useState<AuthMode>("register");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [pendingEmail, setPendingEmail] = useState("");
  const [shopName, setShopName] = useState("");
  const [username, setUsername] = useState("");
  const [usernameTouched, setUsernameTouched] = useState(false);
  const [usernameStatus, setUsernameStatus] = useState<UsernameStatus>("idle");
  const [authError, setAuthError] = useState("");
  const [storeError, setStoreError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [resending, setResending] = useState(false);
  const [createdUrl, setCreatedUrl] = useState("");
  const requestId = useRef(0);
  const redirectTo = typeof window === "undefined" ? "/become-a-seller/start?resume=1" : `${window.location.origin}/become-a-seller/start?resume=1`;

  const normalizedUsername = normalizeUsername(username);
  const storeUrl = normalizedUsername ? `mindhubs.fun/store/${normalizedUsername}` : "mindhubs.fun/store/votre-boutique";
  const initials = useMemo(() => {
    const value = shopName.trim();
    return value ? value.split(/\s+/).map((part) => part[0]).join("").slice(0, 2).toUpperCase() : "MH";
  }, [shopName]);

  useEffect(() => {
    if (authLoading || vendorLoading || !user || !existingVendor) return;
    navigate("/dashboard", { replace: true });
  }, [authLoading, existingVendor, navigate, user, vendorLoading]);

  useEffect(() => {
    if (authLoading) return;
    if (user && !existingVendor) setStep("store");
    if (!user && searchParams.get("resume") !== "1") setStep("auth");
  }, [authLoading, existingVendor, searchParams, user]);

  useEffect(() => {
    if (!shopName || usernameTouched) return;
    setUsername(slugifyShopName(shopName));
  }, [shopName, usernameTouched]);

  useEffect(() => {
    const value = normalizeUsername(username);
    const currentRequest = ++requestId.current;

    if (value.length < 3) {
      setUsernameStatus("idle");
      return;
    }

    setUsernameStatus("checking");
    const timer = window.setTimeout(async () => {
      try {
        const available = await isUsernameAvailable(value, user?.id);
        if (currentRequest === requestId.current) setUsernameStatus(available ? "available" : "taken");
      } catch {
        if (currentRequest === requestId.current) setUsernameStatus("error");
      }
    }, 420);

    return () => window.clearTimeout(timer);
  }, [user?.id, username]);

  const handleAuthSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setAuthError("");

    const normalizedEmail = email.trim().toLowerCase();
    if (!normalizedEmail || !/^\S+@\S+\.\S+$/.test(normalizedEmail)) {
      setAuthError("Saisissez une adresse email valide.");
      return;
    }
    if (password.length < 6) {
      setAuthError("Le mot de passe doit contenir au moins 6 caractères.");
      return;
    }

    setSubmitting(true);
    try {
      const result = authMode === "register"
        ? await signUp(normalizedEmail, password, normalizedEmail.split("@")[0], redirectTo)
        : await signIn(normalizedEmail, password);

      if (result.error) {
        setAuthError(result.error.message);
        return;
      }

      if (authMode === "register" && result.needsConfirmation) {
        setPendingEmail(normalizedEmail);
        setStep("confirm");
        toast.success("Compte créé", { description: "Vérifiez votre email pour continuer." });
      } else {
        setStep("store");
        toast.success(authMode === "register" ? "Compte créé" : "Connexion réussie");
      }
    } catch (error) {
      setAuthError(error instanceof Error ? error.message : "Une erreur est survenue. Réessayez.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleGoogle = async () => {
    setAuthError("");
    setSubmitting(true);
    const result = await signInWithGoogle(redirectTo);
    if (result.error) {
      setAuthError(result.error.message);
      setSubmitting(false);
    }
  };

  const handleResend = async () => {
    if (!pendingEmail) return;
    setResending(true);
    const result = await resendConfirmation(pendingEmail, redirectTo);
    if (result.error) toast.error(result.error.message);
    else toast.success("Email renvoyé", { description: "Vérifiez votre boîte de réception." });
    setResending(false);
  };

  const handleStoreSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setStoreError("");

    if (!user) {
      setStep("auth");
      setStoreError("Connectez-vous pour créer votre boutique.");
      return;
    }

    const parsed = storeSchema.safeParse({ shopName, username: normalizedUsername });
    if (!parsed.success) {
      setStoreError(parsed.error.issues[0]?.message || "Vérifiez les informations de votre boutique.");
      return;
    }

    setSubmitting(true);
    try {
      const available = await isUsernameAvailable(normalizedUsername, user.id);
      if (!available) {
        setUsernameStatus("taken");
        setStoreError("Cette URL est déjà utilisée. Choisissez-en une autre.");
        return;
      }

      const result = await initializeSeller({ userId: user.id, shopName, username: normalizedUsername });
      const url = `${window.location.origin}/store/${normalizedUsername}`;
      setCreatedUrl(url);
      await queryClient.invalidateQueries({ queryKey: ["current-vendor"] });
      toast.success("Votre boutique est prête");
      navigate("/dashboard", { replace: true, state: { sellerOnboarding: true, vendorId: result.vendorId } });
    } catch (error) {
      setStoreError(error instanceof Error ? error.message : "Impossible de créer la boutique. Réessayez.");
    } finally {
      setSubmitting(false);
    }
  };

  const copyStoreUrl = async () => {
    if (!createdUrl) return;
    try {
      await navigator.clipboard.writeText(createdUrl);
      toast.success("Lien copié");
    } catch {
      toast.error("Impossible de copier le lien");
    }
  };

  const stepNumber = step === "auth" || step === "confirm" ? 1 : 2;
  const motionTransition = reduce ? { duration: 0.01 } : { duration: 0.26, ease: [0.16, 1, 0.3, 1] as const };

  return (
    <div className="min-h-screen overflow-hidden bg-background text-foreground">
      <SEO
        title="Créer sa boutique en ligne | MindHubs"
        description="Créez votre boutique MindHubs, vendez vos produits digitaux ou physiques et partagez votre lien vendeur."
        path="/become-a-seller/start"
        keywords="créer boutique en ligne, vendre produits digitaux, vendre produits physiques, MindHubs vendeur"
      />

      <main className="relative mx-auto flex min-h-screen w-full max-w-7xl items-center px-4 py-24 sm:px-6 lg:px-8">
        <div className="pointer-events-none absolute left-1/2 top-8 h-72 w-72 -translate-x-1/2 rounded-full bg-brand-cyan/10 blur-3xl" aria-hidden="true" />
        <div className="pointer-events-none absolute bottom-0 right-0 h-64 w-64 rounded-full bg-brand-magenta/5 blur-3xl" aria-hidden="true" />

        <div className="relative grid w-full items-center gap-12 lg:grid-cols-[minmax(0,1fr)_minmax(380px,460px)] lg:gap-20">
          <section className="max-w-2xl">
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-brand-cyan/20 bg-brand-cyan/5 px-3 py-1.5 text-[11px] font-semibold uppercase tracking-[0.16em] text-brand-cyan">
              <Sparkles className="size-3.5" aria-hidden="true" /> Lancement rapide
            </div>
            <h1 className="max-w-xl text-4xl font-semibold leading-[1.08] tracking-[-0.045em] sm:text-5xl lg:text-6xl">Votre boutique en ligne commence ici.</h1>
            <p className="mt-6 max-w-xl text-base leading-7 text-muted-foreground sm:text-lg">Créez votre espace vendeur, ajoutez vos produits et partagez votre lien quand vous êtes prêt. Commencez gratuitement, puis activez les outils dont vous avez besoin.</p>

            <div className="mt-9 space-y-4">
              {BENEFITS.map(({ icon: Icon, title, text }) => (
                <div key={title} className="flex gap-3">
                  <span className="mt-0.5 grid size-9 shrink-0 place-items-center rounded-xl border border-brand-cyan/20 bg-brand-cyan/5 text-brand-cyan"><Icon className="size-4" aria-hidden="true" /></span>
                  <div><h2 className="text-sm font-semibold">{title}</h2><p className="mt-1 max-w-md text-sm leading-6 text-muted-foreground">{text}</p></div>
                </div>
              ))}
            </div>

            <div className="mt-10 flex flex-wrap items-center gap-x-5 gap-y-2 text-xs text-text-subtle">
              <span className="inline-flex items-center gap-1.5"><LockKeyhole className="size-3.5" aria-hidden="true" /> Données protégées</span>
              <span className="inline-flex items-center gap-1.5"><CheckCircle2 className="size-3.5" aria-hidden="true" /> Aucune carte bancaire requise</span>
            </div>
          </section>

          <section className="w-full">
            <div className="rounded-3xl border border-border bg-card p-5 shadow-2xl shadow-black/20 sm:p-7">
              <div className="mb-7">
                <div className="mb-4 flex items-center justify-between text-xs font-medium text-muted-foreground"><span>Étape {stepNumber} sur 2</span><span>{stepNumber === 1 ? "Votre accès" : "Votre boutique"}</span></div>
                <div className="h-1.5 overflow-hidden rounded-full bg-muted" aria-label={`Progression : étape ${stepNumber} sur 2`} role="progressbar" aria-valuemin={1} aria-valuemax={2} aria-valuenow={stepNumber}><motion.div className="h-full rounded-full bg-brand-cyan" animate={{ width: `${stepNumber * 50}%` }} transition={motionTransition} /></div>
              </div>

              <AnimatePresence mode="wait" initial={false}>
                {step === "auth" && (
                  <motion.div key="auth" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={motionTransition}>
                    <div className="mb-6"><h2 className="text-2xl font-semibold tracking-[-0.03em]">{authMode === "register" ? "Créez votre accès vendeur" : "Ravi de vous revoir"}</h2><p className="mt-2 text-sm leading-6 text-muted-foreground">{authMode === "register" ? "Un compte suffit pour gérer votre boutique, vos produits et vos ventes." : "Connectez-vous pour continuer la création de votre boutique."}</p></div>
                    <Button type="button" variant="outline" className="h-11 w-full" onClick={handleGoogle} disabled={submitting}><span className="grid size-5 place-items-center rounded-full bg-white text-xs font-bold text-slate-900">G</span>Continuer avec Google</Button>
                    <div className="my-5 flex items-center gap-3 text-xs text-muted-foreground"><span className="h-px flex-1 bg-border" /><span>ou avec votre email</span><span className="h-px flex-1 bg-border" /></div>
                    <form onSubmit={handleAuthSubmit} className="space-y-4">
                      <div className="space-y-2"><Label htmlFor="seller-email">Adresse email</Label><div className="relative"><Mail className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" aria-hidden="true" /><Input id="seller-email" type="email" value={email} onChange={(event) => setEmail(event.target.value)} placeholder="vous@exemple.com" autoComplete="email" className="pl-10" /></div></div>
                      <div className="space-y-2"><Label htmlFor="seller-password">Mot de passe</Label><div className="relative"><LockKeyhole className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" aria-hidden="true" /><Input id="seller-password" type="password" value={password} onChange={(event) => setPassword(event.target.value)} placeholder="6 caractères minimum" autoComplete={authMode === "register" ? "new-password" : "current-password"} className="pl-10" /></div></div>
                      {authError ? <p className="rounded-xl border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive" role="alert">{authError}</p> : null}
                      <Button type="submit" className="h-11 w-full" disabled={submitting}>{submitting ? <Loader2 className="size-4 animate-spin" aria-hidden="true" /> : <UserRound className="size-4" aria-hidden="true" />}{submitting ? "Connexion en cours…" : authMode === "register" ? "Créer mon compte" : "Se connecter"}{!submitting ? <ArrowRight className="ml-auto size-4" aria-hidden="true" /> : null}</Button>
                    </form>
                    <button type="button" onClick={() => { setAuthMode(authMode === "register" ? "login" : "register"); setAuthError(""); }} className="mt-5 flex min-h-11 w-full items-center justify-center gap-1 text-sm text-muted-foreground transition-colors hover:text-foreground">{authMode === "register" ? "Vous avez déjà un compte ?" : "Pas encore de compte ?"} <span className="font-medium text-brand-cyan">{authMode === "register" ? "Se connecter" : "Créer un compte"}</span></button>
                  </motion.div>
                )}

                {step === "confirm" && (
                  <motion.div key="confirm" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={motionTransition} className="text-center">
                    <div className="mx-auto grid size-14 place-items-center rounded-2xl border border-brand-cyan/20 bg-brand-cyan/10 text-brand-cyan"><Mail className="size-6" aria-hidden="true" /></div>
                    <h2 className="mt-5 text-2xl font-semibold tracking-[-0.03em]">Vérifiez votre boîte mail</h2>
                    <p className="mt-2 text-sm leading-6 text-muted-foreground">Nous avons envoyé un lien de confirmation à <strong className="font-medium text-foreground">{pendingEmail}</strong>. Après confirmation, vous pourrez créer votre boutique.</p>
                    <div className="mt-6 space-y-3"><Button type="button" className="h-11 w-full" onClick={handleResend} disabled={resending}>{resending ? <Loader2 className="size-4 animate-spin" /> : <RefreshCw className="size-4" />} {resending ? "Envoi en cours…" : "Renvoyer l’email"}</Button><button type="button" onClick={() => { setStep("auth"); setAuthError(""); }} className="min-h-11 text-sm text-muted-foreground transition-colors hover:text-foreground">Modifier l’adresse</button></div>
                    <p className="mt-7 text-xs leading-5 text-text-subtle">Le lien vous ramènera automatiquement ici. Pensez à vérifier vos courriers indésirables.</p>
                  </motion.div>
                )}

                {step === "store" && (
                  <motion.div key="store" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={motionTransition}>
                    <div className="mb-6"><h2 className="text-2xl font-semibold tracking-[-0.03em]">Créez votre boutique</h2><p className="mt-2 text-sm leading-6 text-muted-foreground">Deux informations suffisent pour commencer. Vous pourrez personnaliser le reste depuis votre dashboard.</p></div>
                    <form onSubmit={handleStoreSubmit} className="space-y-5">
                      <div className="space-y-2"><Label htmlFor="shop-name">Nom de boutique</Label><Input id="shop-name" value={shopName} onChange={(event) => setShopName(event.target.value)} placeholder="Ex. Atelier Digital" autoComplete="organization" maxLength={60} autoFocus /><p className="text-xs text-text-subtle">Ce nom sera affiché sur votre boutique et vos fiches produits.</p></div>
                      <div className="space-y-2"><Label htmlFor="shop-username">URL de votre boutique</Label><div className="flex overflow-hidden rounded-lg border border-input bg-background focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-2 focus-within:ring-offset-background"><span className="flex shrink-0 items-center border-r border-input px-3 text-xs text-muted-foreground">mindhubs.fun/store/</span><input id="shop-username" value={username} onChange={(event) => { setUsername(normalizeUsername(event.target.value)); setUsernameTouched(true); }} className="h-10 min-w-0 flex-1 bg-transparent px-3 text-sm outline-none" aria-describedby="shop-url-status" autoComplete="off" spellCheck={false} /></div><div id="shop-url-status" className="min-h-5 text-xs" aria-live="polite">{usernameStatus === "checking" ? <span className="inline-flex items-center gap-1.5 text-muted-foreground"><Loader2 className="size-3 animate-spin" /> Vérification de la disponibilité…</span> : null}{usernameStatus === "available" ? <span className="inline-flex items-center gap-1.5 text-success"><Check className="size-3.5" /> Cette adresse est disponible</span> : null}{usernameStatus === "taken" ? <span className="text-destructive">Cette adresse est déjà utilisée.</span> : null}{usernameStatus === "error" ? <span className="text-warning">La disponibilité n’a pas pu être vérifiée. Réessayez.</span> : null}</div></div>
                      <div className="rounded-2xl border border-border bg-surface-secondary/60 p-4"><div className="flex items-center gap-3"><div className="grid size-10 shrink-0 place-items-center rounded-xl bg-brand-cyan text-sm font-semibold text-background">{shopName.trim() ? initials : <MindHubsMark size={22} variant="current" decorative />}</div><div className="min-w-0"><p className="truncate text-sm font-medium">{shopName.trim() || "Votre boutique"}</p><p className="truncate text-xs text-muted-foreground">{storeUrl}</p></div></div><div className="mt-4 flex items-center gap-2 text-xs text-text-subtle"><ExternalLink className="size-3.5" aria-hidden="true" /> Votre lien sera public après la création.</div></div>
                      {storeError ? <p className="rounded-xl border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive" role="alert">{storeError}</p> : null}
                      <Button type="submit" className="h-11 w-full" disabled={submitting || usernameStatus === "checking"}>{submitting ? <Loader2 className="size-4 animate-spin" aria-hidden="true" /> : <Store className="size-4" aria-hidden="true" />}{submitting ? "Création en cours…" : "Créer ma boutique"}{!submitting ? <ArrowRight className="ml-auto size-4" aria-hidden="true" /> : null}</Button>
                    </form>
                    <p className="mt-5 text-center text-xs leading-5 text-text-subtle">Votre boutique est gratuite à créer. Vous gardez le contrôle de vos produits et de vos canaux de publication.</p>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            <div className="mt-5 flex flex-wrap items-center justify-center gap-x-4 gap-y-2 text-xs text-text-subtle"><Link to="/faq" className="transition-colors hover:text-foreground">Besoin d’aide ?</Link><span aria-hidden="true">·</span><Link to="/conditions-generales" className="transition-colors hover:text-foreground">Conditions</Link>{createdUrl ? <button type="button" onClick={copyStoreUrl} className="inline-flex items-center gap-1 text-brand-cyan"><Copy className="size-3" /> Copier le lien</button> : null}</div>
          </section>
        </div>
      </main>
    </div>
  );
};

export default BecomeSeller;

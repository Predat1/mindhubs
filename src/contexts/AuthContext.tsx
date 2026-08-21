import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { supabase } from "@/integrations/supabase/client";
import type { User, Session } from "@supabase/supabase-js";
import { DEMO_USER_EMAIL, DEMO_USER_ID, isDemoMode } from "@/lib/demoMode";

interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  isDemo: boolean;
  canMutate: boolean;
  signUp: (email: string, password: string, fullName: string, redirectTo?: string) => Promise<{ error: Error | null; needsConfirmation: boolean }>;
  signIn: (email: string, password: string) => Promise<{ error: Error | null }>;
  signInWithGoogle: (redirectTo?: string) => Promise<{ error: Error | null }>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<{ error: Error | null }>;
  resendConfirmation: (email: string, redirectTo?: string) => Promise<{ error: Error | null }>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const DEMO_USER = {
  id: DEMO_USER_ID,
  aud: "authenticated",
  role: "authenticated",
  email: DEMO_USER_EMAIL,
  app_metadata: { provider: "demo" },
  user_metadata: { full_name: "Vendeur Démo" },
  created_at: "2026-01-01T00:00:00.000Z",
  confirmed_at: "2026-01-01T00:00:00.000Z",
} as unknown as User;

// Translate common Supabase auth errors to French
export const translateAuthError = (message: string): string => {
  const map: Record<string, string> = {
    "Invalid login credentials": "Email ou mot de passe incorrect.",
    "Email not confirmed": "Veuillez confirmer votre email avant de vous connecter.",
    "User already registered": "Un compte existe déjà avec cet email.",
    "Password should be at least 6 characters": "Le mot de passe doit contenir au moins 6 caractères.",
    "Unable to validate email address: invalid format": "Adresse email invalide.",
    "Email rate limit exceeded": "Trop de tentatives. Réessayez dans quelques minutes.",
    "For security purposes, you can only request this after 60 seconds": "Veuillez patienter 60 secondes avant de réessayer.",
    "New password should be different from the old password": "Le nouveau mot de passe doit être différent de l'ancien.",
    "Auth session missing!": "Session expirée. Veuillez vous reconnecter.",
    "JWT expired": "Votre session a expiré. Veuillez vous reconnecter.",
  };
  return map[message] || message;
};

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(isDemoMode ? DEMO_USER : null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(!isDemoMode);

  useEffect(() => {
    if (isDemoMode) return;

    let mounted = true;

    // Initial session check
    const initAuth = async () => {
      try {
        const { data: { session: initialSession }, error } = await supabase.auth.getSession();
        if (error) {
          console.error("Initial auth session check failed:", error);
        }
        if (mounted) {
          setSession(initialSession);
          setUser(initialSession?.user ?? null);
        }
      } catch (error) {
        console.error("Initial auth session check failed:", error);
        if (mounted) {
          setSession(null);
          setUser(null);
        }
      } finally {
        if (mounted) setLoading(false);
      }
    };

    initAuth();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, currentSession) => {
      if (mounted) {
        console.log("Auth event:", event);
        setSession(currentSession);
        setUser(currentSession?.user ?? null);
        
        // If we get an initial session event, we can stop loading
        if (event === "SIGNED_IN" || event === "INITIAL_SESSION" || event === "SIGNED_OUT") {
          setLoading(false);
        }
      }
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  const signUp = async (email: string, password: string, fullName: string, redirectTo?: string) => {
    if (isDemoMode) return { error: new Error("Le mode démo ne permet pas de créer un compte."), needsConfirmation: false };
    const normalizedEmail = email.trim().toLowerCase();
    const { data, error } = await supabase.auth.signUp({
      email: normalizedEmail,
      password,
      options: {
        data: { full_name: fullName.trim() },
        emailRedirectTo: redirectTo || window.location.origin,
      },
    });
    if (!error && typeof window !== "undefined" && window.fbq) {
      window.fbq("track", "CompleteRegistration", { content_name: "Signup" });
    }
    if (data.session) {
      setSession(data.session);
      setUser(data.session.user);
    }
    return { error: error ? new Error(translateAuthError(error.message)) : null, needsConfirmation: !data.session };
  };

  const signIn = async (email: string, password: string) => {
    if (isDemoMode) return { error: new Error("Le mode démo est déjà ouvert.") };
    const { error } = await supabase.auth.signInWithPassword({ email: email.trim().toLowerCase(), password });
    return { error: error ? new Error(translateAuthError(error.message)) : null };
  };

  const signInWithGoogle = async (redirectTo?: string) => {
    if (isDemoMode) return { error: new Error("Le mode démo est déjà ouvert.") };
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: redirectTo || `${window.location.origin}/mon-compte`,
        queryParams: {
          access_type: 'offline',
          prompt: 'consent',
        },
      },
    });
    if (error) {
      const msg = error.message.includes("not enabled")
        ? "Le fournisseur Google n'est pas activé. Contactez l'administrateur."
        : translateAuthError(error.message);
      return { error: new Error(msg) };
    }
    return { error: null };
  };

  const signOut = async () => {
    if (isDemoMode) return;
    await supabase.auth.signOut();
  };

  const resetPassword = async (email: string) => {
    if (isDemoMode) return { error: new Error("La récupération de compte est désactivée en mode démo.") };
    const { error } = await supabase.auth.resetPasswordForEmail(email.trim().toLowerCase(), {
      redirectTo: `${window.location.origin}/reset-password`,
    });
    return { error: error ? new Error(translateAuthError(error.message)) : null };
  };

  const resendConfirmation = async (email: string, redirectTo?: string) => {
    if (isDemoMode) return { error: new Error("La confirmation email est désactivée en mode démo.") };
    const { error } = await supabase.auth.resend({
      type: "signup",
      email: email.trim().toLowerCase(),
      options: { emailRedirectTo: redirectTo || window.location.origin },
    });
    return { error: error ? new Error(translateAuthError(error.message)) : null };
  };

  return (
    <AuthContext.Provider
      value={{
        user, session, loading, isDemo: isDemoMode, canMutate: !isDemoMode,
        signUp, signIn, signInWithGoogle, signOut, resetPassword, resendConfirmation,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
};

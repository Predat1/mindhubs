import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { supabase } from "@/integrations/supabase/client";
import type { User, Session } from "@supabase/supabase-js";

interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  signUp: (email: string, password: string, fullName: string) => Promise<{ error: Error | null }>;
  signIn: (email: string, password: string) => Promise<{ error: Error | null }>;
  signInWithGoogle: () => Promise<{ error: Error | null }>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<{ error: Error | null }>;
  resendConfirmation: (email: string) => Promise<{ error: Error | null }>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

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
  };
  return map[message] || message;
};

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
    });

    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const signUp = async (email: string, password: string, fullName: string) => {
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { full_name: fullName },
        emailRedirectTo: window.location.origin,
      },
    });
    if (!error && typeof window !== "undefined" && window.fbq) {
      window.fbq("track", "CompleteRegistration", { content_name: "Signup" });
    }
    return { error: error ? new Error(translateAuthError(error.message)) : null };
  };

  const signIn = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    return { error: error ? new Error(translateAuthError(error.message)) : null };
  };

  const signInWithGoogle = async () => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: `${window.location.origin}/mon-compte` },
    });
    return { error: error ? new Error(translateAuthError(error.message)) : null };
  };

  const signOut = async () => {
    await supabase.auth.signOut();
  };

  const resetPassword = async (email: string) => {
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    });
    return { error: error ? new Error(translateAuthError(error.message)) : null };
  };

  const resendConfirmation = async (email: string) => {
    const { error } = await supabase.auth.resend({
      type: "signup",
      email,
      options: { emailRedirectTo: window.location.origin },
    });
    return { error: error ? new Error(translateAuthError(error.message)) : null };
  };

  return (
    <AuthContext.Provider
      value={{
        user, session, loading,
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

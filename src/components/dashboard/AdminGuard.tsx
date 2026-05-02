import { useEffect, useState } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Loader2, ShieldAlert } from "lucide-react";

interface AdminGuardProps {
  children: React.ReactNode;
}

const AdminGuard = ({ children }: AdminGuardProps) => {
  const { user, loading: authLoading } = useAuth();
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null);
  const [loading, setLoading] = useState(true);
  const location = useLocation();

  useEffect(() => {
    const checkAdmin = async () => {
      if (!user) {
        setIsAdmin(false);
        setLoading(false);
        return;
      }

      try {
        // Super Admin Bypass for Mobifranck
        if (user.email === "mobifranck94@gmail.com") {
          setIsAdmin(true);
          setLoading(false);
          return;
        }

        const { data, error } = await supabase
          .from("user_roles")
          .select("role")
          .eq("user_id", user.id)
          .eq("role", "admin")
          .maybeSingle();

        if (error) throw error;
        setIsAdmin(!!data);
      } catch (err) {
        console.error("Error checking admin status:", err);
        setIsAdmin(false);
      } finally {
        setLoading(false);
      }

    };

    if (!authLoading) {
      checkAdmin();
    }
  }, [user, authLoading]);

  if (authLoading || loading) {
    return (
      <div className="flex h-screen w-screen flex-col items-center justify-center bg-background space-y-4">
        <Loader2 className="h-10 w-10 animate-spin text-primary" />
        <p className="text-xs font-black uppercase tracking-widest text-muted-foreground animate-pulse">Vérification des accès administrateur...</p>
      </div>
    );
  }

  if (!user || isAdmin === false) {
    return (
      <div className="flex h-screen w-screen flex-col items-center justify-center bg-background p-6 text-center space-y-6">
        <div className="h-20 w-20 rounded-3xl bg-destructive/10 flex items-center justify-center text-destructive border border-destructive/20 shadow-2xl shadow-destructive/10">
           <ShieldAlert size={40} />
        </div>
        <div className="space-y-2">
           <h1 className="text-2xl font-black tracking-tight">Accès Restreint</h1>
           <p className="text-sm text-muted-foreground max-w-xs mx-auto">
             Cette zone est réservée exclusivement aux administrateurs de MindHubs.
           </p>
        </div>
        <Navigate to="/mon-compte" state={{ from: location }} replace />
      </div>
    );
  }

  return <>{children}</>;
};

export default AdminGuard;

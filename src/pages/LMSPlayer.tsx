import { useParams, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import CoursePlayer from "@/components/lms/CoursePlayer";
import { Loader2, AlertCircle, ShoppingBag } from "lucide-react";
import { Button } from "@/components/ui/button";
import SEO from "@/components/SEO";

const LMSPlayerPage = () => {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const navigate = useNavigate();

  const { data: purchaseInfo, isLoading, error } = useQuery({
    queryKey: ['check-purchase', id, user?.id],
    queryFn: async () => {
      if (!id || !user?.id) return null;

      // 1. Check if product exists and get title
      const { data: product, error: pError } = await (supabase as any)
        .from('products')
        .select('title, is_lms, pricing_mode')
        .eq('id', id)
        .single();
      
      if (pError || !product) throw new Error("Produit introuvable");
      if (!(product as any).is_lms) throw new Error("Ce produit n'est pas une formation structurée");

      // Entitlements are now the canonical access source. The order lookup
      // remains a compatibility fallback for purchases created before the
      // entitlement migration.
      const { data: entitlement, error: entitlementError } = await (supabase as any)
        .from('product_entitlements')
        .select('id')
        .eq('product_id', id)
        .eq('user_id', user.id)
        .eq('status', 'active')
        .maybeSingle();

      let hasAccess = Boolean(entitlement);
      if (!hasAccess && entitlementError) {
        const { data: orderItem, error: orderError } = await (supabase as any)
          .from('order_items')
          .select('id, orders!inner(status, user_id)')
          .eq('product_id', id)
          .eq('orders.user_id', user.id)
          .eq('orders.status', 'confirmed')
          .maybeSingle();
        if (orderError) throw orderError;
        hasAccess = Boolean(orderItem);
      }
      
      return {
        hasAccess,
        title: (product as any).title
      };
    },
    enabled: !!id && !!user?.id
  });

  if (isLoading) {
    return (
      <div className="h-screen w-full flex flex-col items-center justify-center gap-4 bg-background">
        <Loader2 className="animate-spin text-primary" size={40} />
        <p className="text-sm font-bold uppercase tracking-widest animate-pulse">Vérification de l'accès...</p>
      </div>
    );
  }

  if (error || !purchaseInfo?.hasAccess) {
    return (
      <div className="h-screen w-full flex flex-col items-center justify-center p-6 bg-background text-center">
        <div className="h-24 w-24 rounded-full bg-destructive/10 flex items-center justify-center text-destructive mb-6">
          <AlertCircle size={48} />
        </div>
        <h1 className="text-3xl font-black mb-2">Accès Refusé</h1>
        <p className="text-muted-foreground max-w-md mb-8">
          {user ? "Votre accès n'est pas encore actif. Obtenez la formation gratuitement ou finalisez votre achat depuis sa page." : "Connectez-vous pour accéder à votre formation après votre achat ou votre inscription gratuite."}
        </p>
        <div className="flex gap-4">
          <Button variant="outline" onClick={() => navigate(user ? '/mes-achats' : `/mon-compte?redirect=${encodeURIComponent(`/formation/${id}`)}`)} className="rounded-2xl h-12 px-8 font-bold">
            {user ? "Mes Achats" : "Se connecter"}
          </Button>
          <Button onClick={() => navigate(`/produit/${id}`)} className="rounded-2xl h-12 px-8 font-black gap-2">
            <ShoppingBag size={18} /> Voir la Page Produit
          </Button>
        </div>
      </div>
    );
  }

  return (
    <>
      <SEO title={`${purchaseInfo.title} | Formation MindHubs`} description="Formation MindHubs" />
      <CoursePlayer courseId={id!} courseTitle={purchaseInfo.title} />
    </>
  );
};

export default LMSPlayerPage;

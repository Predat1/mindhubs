import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export type VendorPlan = 'free' | 'starter' | 'pro' | 'elite';

export interface VendorSubscriptionData {
  vendor_id: string;
  user_id: string;
  plan: VendorPlan;
  status: string;
  current_period_end: string | null;
  cancel_at_period_end: boolean;
  credit_balance: number;
  max_products: number;
  monthly_credits: number;
  commission_rate: number;
  price_fcfa_monthly: number;
  ads_studio: boolean;
  creator_lab_full: boolean;
  priority_placement: boolean;
  whatsapp_support: boolean;
  badge: string | null;
  product_count: number;
}

/**
 * useVendorSubscription
 * 
 * WHY: Fournit une source de vérité unique pour les limites et droits du vendeur.
 * Utilise la vue SQL 'vendor_subscription_view' pour agréger les données.
 */
export const useVendorSubscription = (vendorId?: string) => {
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['vendor-subscription', vendorId],
    enabled: !!vendorId,
    queryFn: async () => {
      const { data, error } = await supabase
        .from('vendor_subscription_view')
        .select('*')
        .eq('vendor_id', vendorId)
        .single();

      if (error) throw error;
      return data as VendorSubscriptionData;
    },
    // Rafraîchir toutes les 5 minutes ou à la demande
    staleTime: 5 * 60 * 1000,
  });

  const canAddProduct = data ? (data.max_products === -1 || data.product_count < data.max_products) : false;

  return {
    ...data,
    isLoading,
    error,
    canAddProduct,
    refetch,
    // Helper pour vérifier l'accès à une fonctionnalité spécifique
    hasAccess: (feature: keyof VendorSubscriptionData) => !!data?.[feature],
  };
};

import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export type VendorPlan = 'free' | 'starter' | 'pro' | 'elite';

export interface VendorSubscriptionData {
  vendor_id: string;
  user_id: string;
  plan: VendorPlan;
  status: string;
  credit_balance: number;
  max_products: number;
  monthly_credits: number;
  commission_rate: number;
  price_fcfa_monthly: number;
  price_fcfa_yearly: number;
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
 * Utilise la vue SQL 'vendor_subscription_view' pour agréger les données de plusieurs tables.
 */
export const useVendorSubscription = (vendorId?: string) => {
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['vendor-subscription', vendorId],
    enabled: !!vendorId,
    queryFn: async () => {
      const { data, error } = await (supabase as any)
        .from('vendor_subscription_view')
        .select('*')
        .eq('vendor_id', vendorId)
        .maybeSingle();

      if (error) throw error;
      return data as VendorSubscriptionData;
    },
    staleTime: 1000 * 60 * 5, // 5 minutes
  });

  const canAddProduct = data 
    ? (data.max_products === -1 || data.product_count < data.max_products) 
    : false;

  return {
    ...data,
    plan: data?.plan ?? 'free',
    status: data?.status ?? 'active',
    creditBalance: data?.credit_balance ?? 0,
    maxProducts: data?.max_products ?? 1,
    productCount: data?.product_count ?? 0,
    commissionRate: data?.commission_rate ?? 0.10,
    isLoading,
    canAddProduct,
    refetch,
    // Helper pour vérifier l'accès à une fonctionnalité spécifique
    canUseFeature: (feature: keyof VendorSubscriptionData) => !!data?.[feature],
  };
};

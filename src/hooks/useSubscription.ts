import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { isDemoMode, DEMO_VENDOR_ID } from "@/lib/demoMode";

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
  const { user } = useAuth();
  const isAdmin = user?.email === 'mobifranck94@gmail.com';
  const demoData: VendorSubscriptionData | undefined = isDemoMode && vendorId === DEMO_VENDOR_ID ? {
    vendor_id: DEMO_VENDOR_ID,
    user_id: user?.id ?? "",
    plan: "pro",
    status: "active",
    credit_balance: 1000,
    max_products: -1,
    monthly_credits: 1000,
    commission_rate: 0.10,
    price_fcfa_monthly: 14999,
    price_fcfa_yearly: 149990,
    ads_studio: true,
    creator_lab_full: true,
    priority_placement: true,
    whatsapp_support: true,
    badge: "Démo",
    product_count: 8,
  } : undefined;
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['vendor-subscription', vendorId],
    enabled: !!vendorId && !isDemoMode,
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

  // Admin bypass: always allow product addition
  const sourceData = demoData ?? data;
  const canAddProduct = isDemoMode
    ? false
    : isAdmin
    ? true
      : sourceData
      ? (sourceData.max_products === -1 || sourceData.product_count < sourceData.max_products)
      : false;

  return {
    ...sourceData,
    plan: sourceData?.plan ?? 'free',
    status: sourceData?.status ?? 'active',
    creditBalance: sourceData?.credit_balance ?? 0,
    maxProducts: isAdmin ? -1 : (sourceData?.max_products ?? 5),
    productCount: sourceData?.product_count ?? 0,
    commissionRate: sourceData?.commission_rate ?? 0.10,
    isLoading,
    canAddProduct,
    refetch,
    // Helper pour vérifier l'accès à une fonctionnalité spécifique
    canUseFeature: (feature: keyof VendorSubscriptionData) => !!sourceData?.[feature],
  };
};

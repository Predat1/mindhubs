import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export type VendorPlan = 'free' | 'starter' | 'pro' | 'elite';

export interface VendorSubscription {
  vendor_id: string;
  user_id: string;
  plan: VendorPlan;
  status: string;
  credit_balance: number;
  max_products: number;
  monthly_credits: number;
  commission_rate: number;
  price_fcfa_monthly: number;
  ads_studio: boolean;
  creator_lab_full: boolean;
  badge: string | null;
  product_count: number;
}

export const useVendorSubscription = (vendorId?: string) => {
  const { data, isLoading, refetch } = useQuery({
    queryKey: ['vendor-subscription', vendorId],
    queryFn: async (): Promise<VendorSubscription | null> => {
      if (!vendorId) return null;
      
      const { data, error } = await supabase
        .from('vendor_subscription_view')
        .select('*')
        .eq('vendor_id', vendorId)
        .single();
        
      if (error) {
        console.error("Error fetching subscription:", error);
        return null;
      }
      
      return data as unknown as VendorSubscription;
    },
    enabled: !!vendorId,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  return {
    plan: data?.plan || 'free',
    status: data?.status || 'active',
    creditBalance: data?.credit_balance || 0,
    maxProducts: data?.max_products || 1,
    productCount: data?.product_count || 0,
    commissionRate: data?.commission_rate || 0.10,
    adsStudio: data?.ads_studio || false,
    creatorLabFull: data?.creator_lab_full || false,
    badge: data?.badge || null,
    isLoading,
    refetch,
    canAddProduct: data ? (data.max_products === -1 || data.product_count < data.max_products) : false,
    canUseFeature: (feature: string, cost: number) => (data?.credit_balance || 0) >= cost,
  };
};

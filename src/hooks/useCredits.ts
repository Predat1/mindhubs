import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface CreditTransaction {
  id: string;
  vendor_id: string;
  type: 'monthly_grant' | 'purchase' | 'spend' | 'bonus' | 'refund' | 'rollover';
  amount: number;
  balance_after: number;
  description: string;
  feature_type: string | null;
  created_at: string;
}

export const useCredits = (vendorId?: string) => {
  const queryClient = useQueryClient();

  const { data: balance = 0, isLoading: balanceLoading } = useQuery({
    queryKey: ['vendor-credits', vendorId],
    queryFn: async (): Promise<number> => {
      if (!vendorId) return 0;
      const { data, error } = await (supabase as any)
        .from('vendor_credits')
        .select('balance')
        .eq('vendor_id', vendorId)
        .single();
      if (error) return 0;
      return data.balance;
    },
    enabled: !!vendorId,
  });

  const { data: transactions = [], isLoading: txLoading } = useQuery({
    queryKey: ['credit-transactions', vendorId],
    queryFn: async (): Promise<CreditTransaction[]> => {
      if (!vendorId) return [];
      const { data, error } = await (supabase as any)
        .from('credit_transactions')
        .select('*')
        .eq('vendor_id', vendorId)
        .order('created_at', { ascending: false })
        .limit(20);
      if (error) return [];
      return data as CreditTransaction[];
    },
    enabled: !!vendorId,
  });

  const spend = async (amount: number, description: string, featureType: string) => {
    if (!vendorId) return { success: false, error: "Non connecté" };

    const { data, error } = await (supabase as any).rpc('spend_credits', {
      p_vendor_id: vendorId,
      p_amount: amount,
      p_description: description,
      p_feature_type: featureType
    });

    if (error) return { success: false, error: error.message };
    
    const result = data as { success: boolean; balance?: number; error?: string };
    
    if (result.success) {
      // Invalider les requêtes pour rafraîchir l'UI
      queryClient.invalidateQueries({ queryKey: ['vendor-credits', vendorId] });
      queryClient.invalidateQueries({ queryKey: ['credit-transactions', vendorId] });
      queryClient.invalidateQueries({ queryKey: ['vendor-subscription', vendorId] });
    }

    return result;
  };

  return {
    balance,
    transactions,
    spend,
    isLoading: balanceLoading || txLoading,
  };
};

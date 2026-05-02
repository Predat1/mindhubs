import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export interface CreditTransaction {
  id: string;
  created_at: string;
  type: 'monthly_grant' | 'purchase' | 'spend' | 'bonus' | 'refund' | 'rollover';
  amount: number;
  balance_after: number;
  description: string;
  feature_type: string | null;
}

/**
 * useCredits
 * 
 * WHY: Gère le solde réel des crédits et l'historique des transactions.
 * Fournit la fonction 'spend' qui invoque la procédure stockée atomique RPC.
 */
export const useCredits = (vendorId?: string) => {
  const queryClient = useQueryClient();

  // 1. Récupération du solde et historique
  const { data: balanceData, isLoading: balanceLoading } = useQuery({
    queryKey: ['vendor-credits', vendorId],
    enabled: !!vendorId,
    queryFn: async () => {
      const { data, error } = await (supabase as any)
        .from('vendor_credits')
        .select('balance')
        .eq('vendor_id', vendorId)
        .single();
      if (error && error.code !== 'PGRST116') throw error; // PGRST116 = not found, on retourne 0
      return data?.balance ?? 0;
    }
  });

  const { data: transactions = [], isLoading: txLoading } = useQuery({
    queryKey: ['vendor-credit-transactions', vendorId],
    enabled: !!vendorId,
    queryFn: async () => {
      const { data, error } = await (supabase as any)
        .from('credit_transactions')
        .select('*')
        .eq('vendor_id', vendorId)
        .order('created_at', { ascending: false })
        .limit(20);
      if (error) throw error;
      return (data || []) as CreditTransaction[];
    }
  });

  // 2. Mutation pour dépenser des crédits
  const spendMutation = useMutation({
    mutationFn: async ({ 
      amount, 
      description, 
      featureType 
    }: { 
      amount: number; 
      description: string; 
      featureType: string 
    }) => {
      if (!vendorId) throw new Error("ID Vendeur manquant");
      
      const { data, error } = await (supabase as any).rpc('spend_credits', {
        p_vendor_id: vendorId,
        p_amount: amount,
        p_description: description,
        p_feature_type: featureType,
        p_cost_usd_cents: 0
      });

      if (error) throw error;
      if (!(data as any)?.success) throw new Error((data as any)?.error);

      return data;
    },
    onSuccess: () => {
      // Invalidation immédiate pour rafraîchir l'UI partout
      queryClient.invalidateQueries({ queryKey: ['vendor-credits', vendorId] });
      queryClient.invalidateQueries({ queryKey: ['vendor-credit-transactions', vendorId] });
      queryClient.invalidateQueries({ queryKey: ['vendor-subscription', vendorId] });
    },
    onError: (err: any) => {
      toast.error(`Erreur crédits : ${err.message}`);
    }
  });

  return {
    balance: balanceData ?? 0,
    transactions,
    isLoading: balanceLoading || txLoading,
    spend: spendMutation.mutateAsync,
    isSpending: spendMutation.isPending,
  };
};

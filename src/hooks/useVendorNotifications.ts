import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface VendorNotification {
  id: string;
  vendor_id: string;
  title: string;
  message: string;
  type: 'sale' | 'system' | 'payout' | 'subscription';
  read: boolean;
  link: string | null;
  created_at: string;
}

/**
 * useVendorNotifications
 * 
 * WHY: Gère les alertes en temps réel pour le vendeur (ventes, retraits, système).
 */
export const useVendorNotifications = (vendorId?: string) => {
  const queryClient = useQueryClient();

  const { data: notifications = [], isLoading } = useQuery({
    queryKey: ['vendor-notifications', vendorId],
    enabled: !!vendorId,
    queryFn: async () => {
      const { data, error } = await supabase
        .from('vendor_notifications')
        .select('*')
        .eq('vendor_id', vendorId)
        .order('created_at', { ascending: false })
        .limit(50);
      
      if (error) throw error;
      return data as VendorNotification[];
    },
    refetchInterval: 30000, // Rafraîchir toutes les 30s pour simuler le temps réel
  });

  const unreadCount = notifications.filter(n => !n.read).length;

  const markAsRead = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('vendor_notifications')
        .update({ read: true })
        .eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['vendor-notifications', vendorId] });
    }
  });

  const markAllAsRead = useMutation({
    mutationFn: async () => {
      const { error } = await supabase
        .from('vendor_notifications')
        .update({ read: true })
        .eq('vendor_id', vendorId)
        .eq('read', false);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['vendor-notifications', vendorId] });
    }
  });

  return {
    notifications,
    unreadCount,
    isLoading,
    markAsRead: markAsRead.mutate,
    markAllAsRead: markAllAsRead.mutate
  };
};

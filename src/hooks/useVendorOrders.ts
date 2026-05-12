import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface VendorOrderItem {
  id: string;
  title: string;
  price: string;
  quantity?: number;
  image?: string;
}

export interface VendorOrder {
  id: string;
  created_at: string;
  status: "pending" | "confirmed" | "delivered" | "cancelled";
  customer_name: string;
  customer_email: string;
  customer_phone: string;
  vendor_items: VendorOrderItem[];
  vendor_revenue: number;
}

/**
 * useVendorOrders
 * 
 * WHY: Récupère les commandes pertinentes pour le vendeur et calcule ses revenus réels.
 * [MODIF] Utilise maintenant le taux de commission dynamique du plan (5%, 7% ou 10%).
 */
export const useVendorOrders = (vendorId: string | undefined, productIds: string[], commissionRate = 0.10) => {
  const vendorShare = 1 - commissionRate;

  const productIdsKey = productIds.join(",");
  return useQuery({
    queryKey: ["vendor-all-orders", vendorId, productIdsKey],
    queryFn: async () => {
      if (!productIds || productIds.length === 0) return [];

      const orFilter = productIds.map(id => `items.cs.[{"id":"${id}"}]`).join(',');
      
      const { data, error } = await supabase
        .from("orders")
        .select("id, created_at, status, customer_name, customer_email, customer_phone, items")
        .or(orFilter)
        .order("created_at", { ascending: false });

      if (error) throw error;

      return (data || [])
        .map((o: any) => {
          const items: VendorOrderItem[] = Array.isArray(o.items) ? o.items : [];
          const vendorItems = items.filter((i) => productIds.includes(i.id));

          if (vendorItems.length === 0) return null;

          const vendorRevenue = vendorItems.reduce((sum, i) => {
            const priceNum = parseInt(String(i.price || "0").replace(/[^0-9]/g, ""), 10) || 0;
            // WHY: Application du partage de revenu basé sur le plan (ex: 95% pour Elite)
            return sum + (priceNum * (i.quantity || 1)) * vendorShare;
          }, 0);

          return {
            id: o.id,
            created_at: o.created_at,
            status: o.status,
            customer_name: o.customer_name || "Client",
            customer_email: o.customer_email || "",
            customer_phone: o.customer_phone || "",
            vendor_items: vendorItems,
            vendor_revenue: vendorRevenue,
          } as VendorOrder;
        })
        .filter((o): o is VendorOrder => o !== null);
    },
    enabled: productIds.length > 0,
    staleTime: 1000 * 60 * 5,
  });
};

/**
 * Hook to get stats (views/sales) for specific products
 */
export const useVendorProductStats = (productIds: string[]) => {
  return useQuery({
    queryKey: ["vendor-product-stats", productIds.join(",")],
    queryFn: async () => {
      if (!productIds || productIds.length === 0) return [];

      const { data, error } = await supabase
        .from("product_stats")
        .select("product_id, total_views, total_purchases")
        .in("product_id", productIds);

      if (error) throw error;
      return data || [];
    },
    enabled: productIds.length > 0,
    staleTime: 1000 * 60 * 15,
  });
};

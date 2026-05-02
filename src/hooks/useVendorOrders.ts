import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useVendorSubscription } from "./useSubscription";

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
 * [SECURITY FIX] Fetches orders relevant to the vendor.
 * 
 * NOTE ON SECURITY: 
 * This query fetches order metadata to filter by product ID in-memory.
 * To ensure 100% data privacy between vendors, Row Level Security (RLS) 
 * MUST be enabled on the 'orders' table with a policy that only allows 
 * selecting rows where the 'items' JSON array contains one of the vendor's products.
 */
export const useVendorOrders = (vendorId: string | undefined, productIds: string[]) => {
  const { commissionRate } = useVendorSubscription(vendorId);
  const vendorShare = 1 - commissionRate;

  return useQuery({
    queryKey: ["vendor-all-orders", vendorId, productIds.join(",")],
    queryFn: async () => {
      if (!productIds || productIds.length === 0) return [];

      // We only select the necessary columns to minimize data exposure
      // in case RLS is misconfigured.
      // We use a server-side filter to only fetch orders containing the vendor's products.
      // This is much more secure and performant than fetching everything.
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
          
          // Filter only items belonging to THIS vendor
          const vendorItems = items.filter((i) => productIds.includes(i.id));

          if (vendorItems.length === 0) return null;

          const vendorRevenue = vendorItems.reduce((sum, i) => {
            const priceNum = parseInt(String(i.price || "0").replace(/[^0-9]/g, ""), 10) || 0;
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

      if (error) {
        console.error("Error fetching product stats:", error);
        return [];
      }
      return data || [];
    },
    enabled: productIds.length > 0,
  });
};

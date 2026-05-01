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
 * Fetches all orders containing any of the vendor's products.
 * Aggregates revenue and items specifically for that vendor.
 */
export const useVendorOrders = (productIds: string[]) => {
  return useQuery({
    queryKey: ["vendor-all-orders", productIds.join(",")],
    queryFn: async () => {
      if (!productIds || productIds.length === 0) return [];

      const { data, error } = await supabase
        .from("orders")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;

      return (data || [])
        .map((o: any) => {
          // If the order stores items as a JSON array
          const items: VendorOrderItem[] = Array.isArray(o.items) ? o.items : [];
          
          // Filter only items belonging to THIS vendor
          const vendorItems = items.filter((i) => productIds.includes(i.id));

          if (vendorItems.length === 0) return null;

          // Calculate revenue for this vendor (e.g., 90% of subtotal)
          const vendorRevenue = vendorItems.reduce((sum, i) => {
            const priceNum = parseInt(String(i.price || "0").replace(/[^0-9]/g, ""), 10) || 0;
            return sum + (priceNum * (i.quantity || 1)) * 0.9;
          }, 0);

          return {
            id: o.id,
            created_at: o.created_at,
            status: o.status,
            customer_name: o.customer_name || "Client Inconnu",
            customer_email: o.customer_email || "",
            customer_phone: o.customer_phone || "",
            vendor_items: vendorItems,
            vendor_revenue: vendorRevenue,
          } as VendorOrder;
        })
        .filter((o): o is VendorOrder => o !== null);
    },
    enabled: productIds.length > 0,
    staleTime: 1000 * 60 * 5, // 5 minutes
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

import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface VendorOrderItem {
  product_id: string;
  title?: string;
  price?: string;
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
  payment_method: string;
  total_price: number;
  items: VendorOrderItem[];
  vendor_revenue: number;
  vendor_items: VendorOrderItem[];
}

/** Fetch all orders that contain at least one of the vendor's products. */
export const useVendorOrders = (productIds: string[]) => {
  const key = productIds.slice().sort().join(",");
  return useQuery({
    queryKey: ["vendor-all-orders", key],
    queryFn: async (): Promise<VendorOrder[]> => {
      if (productIds.length === 0) return [];
      const { data, error } = await supabase
        .from("orders")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;

      const set = new Set(productIds);
      return (data || [])
        .map((o: any) => {
          const items: VendorOrderItem[] = Array.isArray(o.items) ? o.items : [];
          const vendorItems = items.filter((i) => i.product_id && set.has(i.product_id));
          if (vendorItems.length === 0) return null;
          const vendorRevenue = vendorItems.reduce((sum, i) => {
            const priceNum = parseInt(String(i.price ?? "0").replace(/[^\d]/g, ""), 10) || 0;
            return sum + priceNum * (i.quantity ?? 1);
          }, 0);
          return {
            id: o.id,
            created_at: o.created_at,
            status: o.status,
            customer_name: o.customer_name,
            customer_email: o.customer_email,
            customer_phone: o.customer_phone,
            payment_method: o.payment_method,
            total_price: o.total_price,
            items,
            vendor_items: vendorItems,
            vendor_revenue: vendorRevenue,
          } as VendorOrder;
        })
        .filter((o): o is VendorOrder => o !== null);
    },
    enabled: productIds.length > 0,
  });
};

/** Per-product event stats from product_stats view. */
export const useVendorProductStats = (productIds: string[]) => {
  const key = productIds.slice().sort().join(",");
  return useQuery({
    queryKey: ["vendor-product-stats", key],
    queryFn: async () => {
      if (productIds.length === 0) return [] as any[];
      const { data, error } = await supabase
        .from("product_stats")
        .select("*")
        .in("product_id", productIds);
      if (error) throw error;
      return data || [];
    },
    enabled: productIds.length > 0,
  });
};

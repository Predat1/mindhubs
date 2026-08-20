import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { isDemoMode } from "@/lib/demoMode";
import { VENDOR_REVENUE_MULTIPLIER } from "@/lib/commerce";

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
  status: "pending" | "confirmed" | "processing" | "shipped" | "delivered" | "cancelled";
  payment_status?: "pending" | "paid" | "failed" | "refunded" | "cancelled";
  source_channel?: "marketplace" | "storefront" | "direct" | "social" | "external" | "other";
  fulfillment_id?: string;
  tracking_carrier?: string | null;
  tracking_number?: string | null;
  shipping_address?: Record<string, string> | null;
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
 */
export const useVendorOrders = (vendorId: string | undefined, productIds: string[]) => {
  const productIdsKey = productIds.join(",");
  return useQuery({
    queryKey: ["vendor-all-orders", vendorId, productIdsKey],
    queryFn: async () => {
      if (!productIds || productIds.length === 0) return [];
      if (isDemoMode) return [];

      const orFilter = productIds.map(id => `items.cs.[{"id":"${id}"}]`).join(',');
      
      const { data, error } = await (supabase as any)
        .from("orders")
        .select("id, created_at, status, payment_status, source_channel, shipping_address, customer_name, customer_email, customer_phone, items")
        .or(orFilter)
        .order("created_at", { ascending: false });

      if (error) throw error;

      const orderIds = (data || []).map((order: any) => order.id);
      let fulfillmentByOrder: Record<string, any> = {};
      if (orderIds.length > 0) {
        const fulfillmentResult = await (supabase as any)
          .from("vendor_order_fulfillments")
          .select("id, order_id, status, tracking_carrier, tracking_number, shipping_address")
          .eq("vendor_id", vendorId)
          .in("order_id", orderIds);
        if (!fulfillmentResult.error) {
          fulfillmentByOrder = Object.fromEntries((fulfillmentResult.data || []).map((fulfillment: any) => [fulfillment.order_id, fulfillment]));
        }
      }

      return (data || [])
        .map((o: any) => {
          const items: VendorOrderItem[] = Array.isArray(o.items) ? o.items : [];
          const vendorItems = items.filter((i) => productIds.includes(i.id));
          const fulfillment = fulfillmentByOrder[o.id];

          if (vendorItems.length === 0) return null;

          const vendorRevenue = vendorItems.reduce((sum, i) => {
            const priceNum = parseInt(String(i.price || "0").replace(/[^0-9]/g, ""), 10) || 0;
            return sum + (priceNum * (i.quantity || 1)) * VENDOR_REVENUE_MULTIPLIER;
          }, 0);

          return {
            id: o.id,
            created_at: o.created_at,
            status: fulfillment?.status || o.status,
            payment_status: o.payment_status || (o.status === "confirmed" || o.status === "delivered" ? "paid" : "pending"),
            source_channel: o.source_channel || "marketplace",
            fulfillment_id: fulfillment?.id,
            tracking_carrier: fulfillment?.tracking_carrier,
            tracking_number: fulfillment?.tracking_number,
            shipping_address: fulfillment?.shipping_address || o.shipping_address,
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
      if (isDemoMode) return [];

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

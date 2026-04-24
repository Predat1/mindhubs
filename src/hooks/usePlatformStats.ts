import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface PlatformStats {
  totalBuyers: number;
  totalVendors: number;
  totalOrders: number;
}

export const usePlatformStats = () => {
  return useQuery({
    queryKey: ["platform-stats"],
    queryFn: async (): Promise<PlatformStats> => {
      const [vendorsRes, ordersRes] = await Promise.all([
        supabase.from("vendors").select("id", { count: "exact", head: true }),
        supabase.from("orders").select("customer_email", { count: "exact" }).neq("status", "cancelled"),
      ]);

      const totalVendors = vendorsRes.count ?? 0;
      const totalOrders = ordersRes.count ?? 0;

      // Unique buyers from orders data
      let totalBuyers = 0;
      if (ordersRes.data) {
        const uniqueEmails = new Set(ordersRes.data.map((o: any) => o.customer_email));
        totalBuyers = uniqueEmails.size;
      } else {
        // fallback: use order count as approximation
        totalBuyers = totalOrders;
      }

      return { totalBuyers, totalVendors, totalOrders };
    },
    staleTime: 5 * 60 * 1000, // 5 minutes cache
    refetchOnWindowFocus: false,
  });
};

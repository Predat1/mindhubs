import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useVendorProducts } from "./useVendors";
import { format, subDays, isAfter } from "date-fns";

export interface AnalyticsData {
  totalViews: number;
  totalOrders: number;
  totalRevenue: number;
  conversionRate: number;
  salesData: { name: string; sales: number; views: number }[];
  trafficSources: { name: string; value: number; color: string }[];
  countries: { name: string; value: number }[];
}

export const useVendorAnalytics = (vendorId: string | undefined, timeRange: string) => {
  const { data: products = [] } = useVendorProducts(vendorId);
  const productIds = products.map(p => p.id);

  return useQuery({
    queryKey: ["vendor-analytics", vendorId, timeRange, productIds],
    queryFn: async (): Promise<AnalyticsData> => {
      if (!vendorId || productIds.length === 0) {
        return {
          totalViews: 0,
          totalOrders: 0,
          totalRevenue: 0,
          conversionRate: 0,
          salesData: [],
          trafficSources: [],
          countries: []
        };
      }

      const days = timeRange === "24h" ? 1 : timeRange === "7d" ? 7 : timeRange === "30d" ? 30 : 90;
      const startDate = subDays(new Date(), days);

      // Fetch Orders
      const orFilter = productIds.map(id => `items.cs.[{"id":"${id}"}]`).join(',');
      const { data: ordersData, error: ordersError } = await supabase
        .from("orders")
        .select("created_at, items, country")
        .gte("created_at", startDate.toISOString())
        .or(orFilter);

      if (ordersError) throw ordersError;

      // Fetch Events
      const { data: eventsData, error: eventsError } = await supabase
        .from("product_events")
        .select("created_at, event_type, source")
        .gte("created_at", startDate.toISOString())
        .in("product_id", productIds)
        .eq("event_type", "view");

      if (eventsError) throw eventsError;

      // Process Orders
      let totalRevenue = 0;
      let totalOrders = 0;
      const countryMap: Record<string, number> = {};
      const salesByDate: Record<string, number> = {};

      (ordersData || []).forEach(order => {
        const items = Array.isArray(order.items) ? order.items : [];
        const vendorItems = items.filter((i: any) => productIds.includes(i.id));
        
        if (vendorItems.length > 0) {
          totalOrders++;
          const orderRev = vendorItems.reduce((sum, i) => {
            const priceNum = parseInt(String(i.price || "0").replace(/[^0-9]/g, ""), 10) || 0;
            return sum + (priceNum * (i.quantity || 1)) * 0.9; // Assuming 10% platform fee
          }, 0);
          totalRevenue += orderRev;

          // Country
          const country = order.country || "Inconnu";
          countryMap[country] = (countryMap[country] || 0) + 1;

          // Date grouping
          const dateStr = format(new Date(order.created_at), "dd MMM");
          salesByDate[dateStr] = (salesByDate[dateStr] || 0) + orderRev;
        }
      });

      // Process Events
      let totalViews = (eventsData || []).length;
      const sourceMap: Record<string, number> = {};
      const viewsByDate: Record<string, number> = {};

      (eventsData || []).forEach(event => {
        // Source
        const source = event.source || "Direct";
        sourceMap[source] = (sourceMap[source] || 0) + 1;

        // Date grouping
        const dateStr = format(new Date(event.created_at), "dd MMM");
        viewsByDate[dateStr] = (viewsByDate[dateStr] || 0) + 1;
      });

      // Format Data
      const conversionRate = totalViews > 0 ? (totalOrders / totalViews) * 100 : 0;

      // Prepare Chart Data
      const salesData = [];
      for (let i = days; i >= 0; i--) {
        const d = subDays(new Date(), i);
        const label = format(d, "dd MMM");
        salesData.push({
          name: label,
          sales: salesByDate[label] || 0,
          views: viewsByDate[label] || 0
        });
      }

      const colors = ["#25D366", "#1877F2", "#7C3AED", "#E4405F", "#F59E0B"];
      const trafficSources = Object.entries(sourceMap).map(([name, value], idx) => ({
        name,
        value: Math.round((value / totalViews) * 100) || 0,
        color: colors[idx % colors.length]
      })).sort((a, b) => b.value - a.value);

      const countries = Object.entries(countryMap).map(([name, value]) => ({
        name,
        value
      })).sort((a, b) => b.value - a.value);

      return {
        totalViews,
        totalOrders,
        totalRevenue,
        conversionRate,
        salesData,
        trafficSources,
        countries
      };
    },
    enabled: !!vendorId && productIds.length > 0,
  });
};

import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { DollarSign, Globe, ShoppingBag } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { formatCurrency } from "@/lib/currency";
import { MINDHUBS_COLORS } from "@/lib/design-tokens";

const AdminAnalyticsTab = () => {
  const [timeRange, setTimeRange] = useState<"7d" | "30d" | "90d">("30d");
  const cutoff = useMemo(() => {
    const date = new Date();
    date.setDate(date.getDate() - (timeRange === "7d" ? 7 : timeRange === "30d" ? 30 : 90));
    return date.toISOString();
  }, [timeRange]);

  const { data: revenueData = [], isLoading: revenueLoading } = useQuery({
    queryKey: ["admin-analytics-commerce", timeRange],
    queryFn: async () => {
      const { data, error } = await supabase.from("orders").select("total_price,created_at,status").gte("created_at", cutoff);
      if (error) throw error;
      const range = timeRange === "7d" ? 7 : timeRange === "30d" ? 30 : 90;
      const days: Record<string, { date: string; sales: number; orders: number }> = {};
      for (let i = 0; i < range; i += 1) {
        const date = new Date();
        date.setDate(date.getDate() - i);
        const key = date.toLocaleDateString("fr-FR", { day: "2-digit", month: "2-digit" });
        days[key] = { date: key, sales: 0, orders: 0 };
      }
      (data || []).forEach((order) => {
        if (order.status === "cancelled") return;
        const key = new Date(order.created_at).toLocaleDateString("fr-FR", { day: "2-digit", month: "2-digit" });
        if (!days[key]) return;
        days[key].sales += Number(order.total_price) || 0;
        days[key].orders += 1;
      });
      return Object.values(days).reverse();
    },
  });

  const { data: geoData, isLoading: geoLoading } = useQuery({
    queryKey: ["admin-analytics-geo", timeRange],
    queryFn: async () => {
      const { data, error } = await (supabase as any).from("orders").select("country,total_price,status").gte("created_at", cutoff);
      if (error) throw error;
      const stats: Record<string, { country: string; orders: number; revenue: number }> = {};
      (data || []).forEach((order: any) => {
        if (order.status === "cancelled") return;
        const country = order.country || "Inconnu";
        stats[country] ??= { country, orders: 0, revenue: 0 };
        stats[country].orders += 1;
        stats[country].revenue += Number(order.total_price) || 0;
      });
      const values = Object.values(stats);
      return {
        byOrders: [...values].sort((a, b) => b.orders - a.orders).slice(0, 5),
        byRevenue: [...values].sort((a, b) => b.revenue - a.revenue).slice(0, 5),
      };
    },
  });

  const average = revenueData.length ? revenueData.reduce((sum, day) => sum + day.sales, 0) / revenueData.length : 0;
  const totalOrders = revenueData.reduce((sum, day) => sum + day.orders, 0);

  return (
    <div className="space-y-8 pb-10">
      <div className="flex flex-col items-start justify-between gap-4 md:flex-row md:items-center">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Analytiques</h2>
          <p className="mt-1 text-sm text-muted-foreground">Performance réelle du catalogue et des commandes.</p>
        </div>
        <div className="flex rounded-xl border border-border bg-card p-1">
          {(["7d", "30d", "90d"] as const).map((range) => (
            <Button key={range} type="button" variant={timeRange === range ? "default" : "ghost"} size="sm" onClick={() => setTimeRange(range)} className="rounded-lg text-xs">
              {range === "7d" ? "7 jours" : range === "30d" ? "30 jours" : "90 jours"}
            </Button>
          ))}
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <Card className="rounded-2xl border-border p-5"><div className="mb-3 grid size-10 place-items-center rounded-xl bg-primary/10 text-primary"><DollarSign size={18} /></div><p className="text-xs text-muted-foreground">Revenu moyen journalier</p><p className="mt-1 text-2xl font-bold">{formatCurrency(average)}</p></Card>
        <Card className="rounded-2xl border-border p-5"><div className="mb-3 grid size-10 place-items-center rounded-xl bg-info/10 text-info"><ShoppingBag size={18} /></div><p className="text-xs text-muted-foreground">Commandes sur la période</p><p className="mt-1 text-2xl font-bold">{totalOrders}</p></Card>
      </div>

      <Card className="rounded-3xl border-border p-5 sm:p-8">
        <div className="mb-6 flex items-center justify-between"><div><h3 className="text-xl font-bold">Flux des ventes</h3><p className="text-xs text-muted-foreground">Marketplace, boutiques et liens externes réunis.</p></div><span className="inline-flex items-center gap-2 text-xs font-semibold text-primary"><span className="size-2 rounded-full bg-primary" /> Commandes</span></div>
        <div className="h-[340px]">
          {revenueLoading ? <Skeleton className="h-full w-full rounded-2xl" /> : <ResponsiveContainer width="100%" height="100%"><AreaChart data={revenueData}><defs><linearGradient id="commerceSales" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor={MINDHUBS_COLORS.cyan} stopOpacity={0.28} /><stop offset="95%" stopColor={MINDHUBS_COLORS.cyan} stopOpacity={0} /></linearGradient></defs><CartesianGrid strokeDasharray="3 3" vertical={false} stroke={MINDHUBS_COLORS.border} opacity={0.65} /><XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fontSize: 10 }} /><YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10 }} tickFormatter={(value) => `${Math.round(value / 1000)}k`} /><Tooltip contentStyle={{ backgroundColor: MINDHUBS_COLORS.surface, border: `1px solid ${MINDHUBS_COLORS.border}`, borderRadius: "12px" }} /><Area type="monotone" dataKey="sales" stroke={MINDHUBS_COLORS.cyan} fill="url(#commerceSales)" strokeWidth={3} /></AreaChart></ResponsiveContainer>}
        </div>
      </Card>

      <div className="grid gap-8 lg:grid-cols-2">
        <Card className="rounded-3xl border-border p-6"><h3 className="mb-6 flex items-center gap-2 text-lg font-bold"><Globe size={18} className="text-primary" /> Top pays par commandes</h3><div className="space-y-3">{geoLoading ? Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} className="h-12 rounded-xl" />) : geoData?.byOrders.map((country, index) => <div key={country.country} className="flex items-center justify-between rounded-xl border border-border bg-muted/20 p-3"><span className="flex items-center gap-3 text-sm font-medium"><span className="grid size-7 place-items-center rounded-full bg-primary/10 text-xs text-primary">{index + 1}</span>{country.country}</span><span className="text-xs font-semibold text-primary">{country.orders} commande{country.orders > 1 ? "s" : ""}</span></div>)}</div></Card>
        <Card className="rounded-3xl border-border p-6"><h3 className="mb-6 flex items-center gap-2 text-lg font-bold"><DollarSign size={18} className="text-success" /> Top pays par revenu</h3><div className="space-y-3">{geoLoading ? Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} className="h-12 rounded-xl" />) : geoData?.byRevenue.map((country, index) => <div key={country.country} className="flex items-center justify-between rounded-xl border border-border bg-muted/20 p-3"><span className="flex items-center gap-3 text-sm font-medium"><span className="grid size-7 place-items-center rounded-full bg-success/10 text-xs text-success">{index + 1}</span>{country.country}</span><span className="text-xs font-semibold text-success">{formatCurrency(country.revenue)}</span></div>)}</div></Card>
      </div>
    </div>
  );
};

export default AdminAnalyticsTab;

import { useState, useMemo } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  BarChart, Bar, PieChart, Pie, Cell, Legend
} from "recharts";
import { 
  Users, DollarSign, Globe
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { formatCurrency } from "@/lib/currency";
import { MINDHUBS_COLORS } from "@/lib/design-tokens";

const COLORS = [MINDHUBS_COLORS.cyan, MINDHUBS_COLORS.magenta, MINDHUBS_COLORS.warning, MINDHUBS_COLORS.success, MINDHUBS_COLORS.info, MINDHUBS_COLORS.error];

const AdminAnalyticsTab = () => {
  const [timeRange, setTimeRange] = useState<"7d" | "30d" | "90d">("30d");

  const cutoff = useMemo(() => {
    const date = new Date();
    if (timeRange === "7d") date.setDate(date.getDate() - 7);
    else if (timeRange === "30d") date.setDate(date.getDate() - 30);
    else date.setDate(date.getDate() - 90);
    return date.toISOString();
  }, [timeRange]);

  // ─── Queries ───
  const { data: revenueData, isLoading: revLoading } = useQuery({
    queryKey: ["admin-analytics-revenue", timeRange],
    queryFn: async () => {
      const [orders, subs] = await Promise.all([
        supabase.from('orders').select('total_price,created_at').gte('created_at', cutoff),
        (supabase as any).from('vendor_subscriptions').select('amount_paid_fcfa,created_at').gte('created_at', cutoff)
      ]);
      
      // Process daily data
      const days: Record<string, { date: string, marketplace: number, subscriptions: number }> = {};
      const range = timeRange === "7d" ? 7 : timeRange === "30d" ? 30 : 90;
      
      for (let i = 0; i < range; i++) {
        const d = new Date();
        d.setDate(d.getDate() - i);
        const key = d.toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit' });
        days[key] = { date: key, marketplace: 0, subscriptions: 0 };
      }

      orders.data?.forEach(o => {
        const key = new Date(o.created_at).toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit' });
        if (days[key]) days[key].marketplace += Number(o.total_price) || 0;
      });

      subs.data?.forEach(s => {
        const key = new Date(s.created_at).toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit' });
        if (days[key]) days[key].subscriptions += Number(s.amount_paid_fcfa) || 0;
      });

      return Object.values(days).reverse();
    }
  });

  const { data: aiCosts, isLoading: aiLoading } = useQuery({
    queryKey: ["admin-analytics-ai-costs", timeRange],
    queryFn: async () => {
      const { data, error } = await (supabase as any)
        .from('credit_transactions')
        .select('feature_type,cost_usd_cents,amount')
        .eq('type', 'spend')
        .gte('created_at', cutoff);
      if (error) throw error;

      const costs: Record<string, { name: string, cost: number, credits: number }> = {};
      data?.forEach(t => {
        const key = t.feature_type || 'unknown';
        if (!costs[key]) costs[key] = { name: key, cost: 0, credits: 0 };
        costs[key].cost += (t.cost_usd_cents || 0) / 100; // to USD
        costs[key].credits += Math.abs(t.amount || 0);
      });

      return Object.values(costs).sort((a, b) => b.cost - a.cost).slice(0, 6);
    }
  });

  const { data: geoData, isLoading: geoLoading } = useQuery({
    queryKey: ["admin-analytics-geo", timeRange],
    queryFn: async () => {
      const { data, error } = await (supabase as any)
        .from('orders')
        .select('country,total_price')
        .gte('created_at', cutoff);
      if (error) throw error;

      const stats: Record<string, { country: string, orders: number, revenue: number }> = {};
      data?.forEach(o => {
        const key = o.country || 'Inconnu';
        if (!stats[key]) stats[key] = { country: key, orders: 0, revenue: 0 };
        stats[key].orders += 1;
        stats[key].revenue += Number(o.total_price) || 0;
      });

      const topCountries = Object.values(stats);
      return {
        byOrders: [...topCountries].sort((a, b) => b.orders - a.orders).slice(0, 5),
        byRevenue: [...topCountries].sort((a, b) => b.revenue - a.revenue).slice(0, 5)
      };
    }
  });

  // ─── Calculations ───
  const aiMargin = useMemo(() => {
    if (!aiCosts || aiCosts.length === 0) return 0;
    // Total credits spent * fixed credit price (approx 50 FCFA) vs real cost
    // This is a rough estimation for the dashboard
    const totalCredits = aiCosts.reduce((acc, f) => acc + f.credits, 0);
    const totalCostUsd = aiCosts.reduce((acc, f) => acc + f.cost, 0);
    const totalBilledUsd = (totalCredits * 0.08); // Approx $0.08 per credit
    return ((totalBilledUsd - totalCostUsd) / totalBilledUsd) * 100;
  }, [aiCosts]);

  return (
    <div className="space-y-8 pb-10">
      {/* ─── HEADER & RANGE SELECTOR ─── */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-black">Intelligence Marketplace</h2>
          <p className="text-xs text-muted-foreground font-black uppercase tracking-widest mt-1">Données réelles et indicateurs de performance</p>
        </div>
        <div className="flex bg-card p-1 rounded-xl border border-border">
          {["7d", "30d", "90d"].map(r => (
            <button 
              key={r}
              onClick={() => setTimeRange(r as any)}
              className={`px-6 py-2 rounded-lg text-[10px] font-black uppercase transition-all ${timeRange === r ? "bg-primary text-primary-foreground shadow-lg" : "text-muted-foreground hover:text-foreground"}`}
            >
              {r === '7d' ? '7 Jours' : r === '30d' ? '30 Jours' : '90 Jours'}
            </button>
          ))}
        </div>
      </div>

      {/* ─── ROW 1: REVENUE CHART ─── */}
      <Card className="stat-card p-8 rounded-[2.5rem] border-glow bg-background/50">
        <div className="flex items-center justify-between mb-8">
           <div>
             <h3 className="text-xl font-black tracking-tighter">Flux de Revenus</h3>
                <div className="flex items-center gap-4 mt-1">
                <div className="flex items-center gap-2 text-[10px] font-bold text-primary uppercase"><div className="w-2 h-2 rounded-full bg-primary" /> Marketplace</div>
                <div className="flex items-center gap-2 text-[10px] font-bold text-brand-magenta uppercase"><div className="w-2 h-2 rounded-full bg-brand-magenta" /> Abonnements</div>
             </div>
           </div>
           <div className="text-right">
              <p className="text-xs font-bold text-muted-foreground uppercase">Moyenne journalière</p>
              <p className="text-2xl font-black text-foreground">
                {revenueData ? formatCurrency(revenueData.reduce((acc, d) => acc + d.marketplace + d.subscriptions, 0) / revenueData.length) : "..."}
              </p>
           </div>
        </div>
        <div className="h-[400px]">
          {revLoading ? <Skeleton className="h-full w-full rounded-2xl" /> : (
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={revenueData}>
                <defs>
                  <linearGradient id="colorMark" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={MINDHUBS_COLORS.cyan} stopOpacity={0.3}/>
                    <stop offset="95%" stopColor={MINDHUBS_COLORS.cyan} stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="colorSub" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={MINDHUBS_COLORS.magenta} stopOpacity={0.3}/>
                    <stop offset="95%" stopColor={MINDHUBS_COLORS.magenta} stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={MINDHUBS_COLORS.border} opacity={0.65} />
                <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{fontSize: 10, fill: '#666'}} />
                <YAxis axisLine={false} tickLine={false} tick={{fontSize: 10, fill: '#666'}} tickFormatter={v => `${(v/1000).toFixed(0)}k`} />
                <Tooltip 
                  contentStyle={{ backgroundColor: MINDHUBS_COLORS.surface, border: `1px solid ${MINDHUBS_COLORS.border}`, borderRadius: '12px' }}
                  itemStyle={{ fontSize: '12px', fontWeight: 'bold' }}
                />
                <Area type="monotone" dataKey="marketplace" stroke={MINDHUBS_COLORS.cyan} fillOpacity={1} fill="url(#colorMark)" strokeWidth={3} />
                <Area type="monotone" dataKey="subscriptions" stroke={MINDHUBS_COLORS.magenta} fillOpacity={1} fill="url(#colorSub)" strokeWidth={3} />
              </AreaChart>
            </ResponsiveContainer>
          )}
        </div>
      </Card>

      {/* ─── ROW 2: AI COSTS & CREDITS ─── */}
      <div className="grid lg:grid-cols-2 gap-8">
        <Card className="stat-card p-8 rounded-[2.5rem] border-glow bg-background/50">
           <div className="flex items-center justify-between mb-8">
              <h3 className="text-xl font-black tracking-tighter">Coûts IA par Module</h3>
              <div className="p-3 rounded-2xl bg-success/10 border border-success/20 text-center">
                 <p className="text-[9px] font-black text-success uppercase">Marge brute IA</p>
                 <p className="text-lg font-black text-success">{aiMargin.toFixed(1)}%</p>
              </div>
           </div>
           <div className="h-[300px]">
             {aiLoading ? <Skeleton className="h-full w-full rounded-2xl" /> : (
               <ResponsiveContainer width="100%" height="100%">
                 <BarChart data={aiCosts} layout="vertical">
                   <XAxis type="number" hide />
                   <YAxis dataKey="name" type="category" axisLine={false} tickLine={false} tick={{fontSize: 10, fill: '#fff', fontWeight: 'bold'}} width={100} />
                   <Tooltip 
                    cursor={{fill: MINDHUBS_COLORS.surfaceSecondary}}
                    contentStyle={{ backgroundColor: MINDHUBS_COLORS.surface, border: `1px solid ${MINDHUBS_COLORS.border}`, borderRadius: '12px' }}
                   />
                   <Bar dataKey="cost" fill={MINDHUBS_COLORS.cyan} radius={[0, 8, 8, 0]} barSize={20} />
                 </BarChart>
               </ResponsiveContainer>
             )}
           </div>
        </Card>

        <Card className="stat-card p-8 rounded-[2.5rem] border-glow bg-background/50">
           <h3 className="text-xl font-black tracking-tighter mb-8">Consommation Crédits</h3>
           <div className="h-[300px] flex items-center">
             {aiLoading ? <Skeleton className="h-full w-full rounded-2xl" /> : (
               <>
                 <div className="flex-1 h-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={aiCosts}
                          innerRadius={60}
                          outerRadius={100}
                          paddingAngle={5}
                          dataKey="credits"
                        >
                          {aiCosts?.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} stroke="none" />
                          ))}
                        </Pie>
                        <Tooltip />
                      </PieChart>
                    </ResponsiveContainer>
                 </div>
                 <div className="w-48 space-y-3">
                    {aiCosts?.map((c, i) => (
                      <div key={i} className="flex items-center gap-3">
                         <div className="w-2 h-2 rounded-full" style={{ backgroundColor: COLORS[i % COLORS.length] }} />
                         <span className="text-[10px] font-bold text-white uppercase truncate flex-1">{c.name}</span>
                         <span className="text-[10px] font-black text-muted-foreground">{c.credits}</span>
                      </div>
                    ))}
                 </div>
               </>
             )}
           </div>
        </Card>
      </div>

      {/* ─── ROW 3: GEOGRAPHY ─── */}
      <div className="grid lg:grid-cols-2 gap-8">
        <Card className="stat-card p-8 rounded-[2.5rem] border-glow">
           <h3 className="text-xl font-black tracking-tighter mb-8 flex items-center gap-2"><Globe size={20} className="text-primary" /> Top Pays (Volume)</h3>
           <div className="space-y-4">
              {geoLoading ? Array(5).fill(0).map((_, i) => <Skeleton key={i} className="h-12 w-full rounded-xl" />) : 
               geoData?.byOrders.map((c, i) => (
                <div key={i} className="flex items-center justify-between p-4 rounded-2xl bg-muted/30 border border-border hover:border-primary/20 transition-all">
                   <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center font-black text-xs">{i+1}</div>
                      <span className="font-bold">{c.country}</span>
                   </div>
                   <span className="text-xs font-black text-primary">{c.orders} commandes</span>
                </div>
              ))}
           </div>
        </Card>

        <Card className="stat-card p-8 rounded-[2.5rem] border-glow">
           <h3 className="text-xl font-black tracking-tighter mb-8 flex items-center gap-2"><DollarSign size={20} className="text-success" /> Top Pays (Revenu)</h3>
           <div className="space-y-4">
              {geoLoading ? Array(5).fill(0).map((_, i) => <Skeleton key={i} className="h-12 w-full rounded-xl" />) : 
               geoData?.byRevenue.map((c, i) => (
                <div key={i} className="flex items-center justify-between p-4 rounded-2xl bg-muted/30 border border-border hover:border-success/20 transition-all">
                   <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-success/10 flex items-center justify-center font-black text-xs text-success">{i+1}</div>
                      <span className="font-bold">{c.country}</span>
                   </div>
                   <span className="text-xs font-black text-success">{formatCurrency(c.revenue)}</span>
                </div>
              ))}
           </div>
        </Card>
      </div>

    </div>
  );
};

export default AdminAnalyticsTab;

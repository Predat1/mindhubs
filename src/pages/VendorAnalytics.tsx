import { useState } from "react";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import VendorGuard from "@/components/dashboard/VendorGuard";
import SEO from "@/components/SEO";
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, 
  AreaChart, Area, Cell, PieChart, Pie, Legend
} from "recharts";
import { 
  TrendingUp, Eye, ShoppingCart, ArrowUpRight, ArrowDownRight, 
  Calendar, Download, Globe, MousePointer2, CreditCard, Sparkles, MapPin,
  Users, Wallet, Zap, Clock, Target, AlertCircle, CheckCircle2, ChevronRight, Filter, 
  ArrowRight, Info
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useVendorAnalytics } from "@/hooks/useVendorAnalytics";
import type { Vendor } from "@/hooks/useVendors";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { formatCurrency } from "@/lib/currency";

const VendorAnalyticsInner = ({ vendor }: { vendor: Vendor }) => {
  const [timeRange, setTimeRange] = useState("7d");
  const { data, isLoading } = useVendorAnalytics(vendor.id, timeRange);

  const metrics = data || {
    totalViews: 0,
    totalOrders: 0,
    totalRevenue: 0,
    conversionRate: 0,
    avgOrderValue: 0,
    revenuePerVisitor: 0,
    salesData: [],
    trafficSources: [],
    countries: [],
    funnel: [],
    productPerformance: [],
    customerBehavior: { newVsReturning: [], ltv: 0, avgTimeBetweenPurchases: "0j" },
    engagement: { avgTimeOnPage: "0s", pagesPerSession: 0, peakHours: [] },
    recommendations: []
  };

  const exportToCSV = () => {
    // Basic CSV export logic
    const headers = ["Produit", "Vues", "Clics", "Ventes", "Conversion %", "Stock"];
    const rows = metrics.productPerformance.map(p => [p.title, p.views, p.clicks, p.purchases, p.conversion.toFixed(1), p.stock]);
    const csvContent = "data:text/csv;charset=utf-8," + [headers, ...rows].map(e => e.join(",")).join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `mindhubs_analytics_${timeRange}.csv`);
    document.body.appendChild(link);
    link.click();
  };

  return (
    <DashboardLayout variant="vendor" title="Analytiques" shopName={vendor.shop_name} shopUrl={`/store/${vendor.username}`}>
      <SEO title="Analytiques — Command Center" description="Suivez vos performances en temps réel." path="/dashboard/analytics" />

      <div className="space-y-8 pb-12">
        {/* Header with Filters */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <h2 className="text-4xl font-black tracking-tighter flex items-center gap-3">
               <Target className="text-primary" size={32} /> Command Center
            </h2>
            <p className="text-muted-foreground font-medium">Pilotez votre croissance avec des données de précision.</p>
          </div>
          <div className="flex items-center gap-3 bg-card/30 p-2 rounded-2xl border border-white/5">
            <Select value={timeRange} onValueChange={setTimeRange}>
              <SelectTrigger className="w-[160px] rounded-xl border-none bg-transparent font-bold">
                <Calendar className="mr-2 h-4 w-4 text-primary" />
                <SelectValue placeholder="Période" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="24h">Dernières 24h</SelectItem>
                <SelectItem value="7d">7 derniers jours</SelectItem>
                <SelectItem value="30d">30 derniers jours</SelectItem>
                <SelectItem value="90d">90 derniers jours</SelectItem>
              </SelectContent>
            </Select>
            <div className="w-px h-6 bg-white/10" />
            <Button onClick={exportToCSV} variant="ghost" size="icon" className="rounded-xl hover:bg-primary/10 hover:text-primary transition-colors">
              <Download size={18} />
            </Button>
          </div>
        </div>

        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-32 space-y-4">
             <Zap className="text-primary animate-pulse" size={48} />
             <p className="text-muted-foreground font-black uppercase tracking-widest text-xs">Calcul des métriques en cours...</p>
          </div>
        ) : (
          <div className="space-y-8 animate-in fade-in duration-700">
            
            {/* Recommendations / Insights */}
            {metrics.recommendations.length > 0 && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {metrics.recommendations.map((rec, i) => (
                  <div key={i} className={`p-4 rounded-2xl border flex gap-4 items-start ${
                    rec.type === 'warning' ? 'bg-amber-500/5 border-amber-500/20' : 
                    rec.type === 'info' ? 'bg-blue-500/5 border-blue-500/20' : 'bg-emerald-500/5 border-emerald-500/20'
                  }`}>
                    <div className={`mt-1 ${rec.type === 'warning' ? 'text-amber-500' : rec.type === 'info' ? 'text-blue-500' : 'text-emerald-500'}`}>
                      {rec.type === 'warning' ? <AlertCircle size={20} /> : <CheckCircle2 size={20} />}
                    </div>
                    <div>
                      <h4 className="font-black text-sm">{rec.title}</h4>
                      <p className="text-xs text-muted-foreground leading-relaxed mt-1">{rec.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Top KPI Grid */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
               {[
                 { label: "Chiffre d'Affaires", val: formatCurrency(metrics.totalRevenue), icon: Wallet, color: "text-emerald-500", trend: "+12.5%" },
                 { label: "Commandes", val: metrics.totalOrders, icon: ShoppingCart, color: "text-primary", trend: "+5%" },
                 { label: "Panier Moyen", val: formatCurrency(metrics.avgOrderValue), icon: CreditCard, color: "text-amber-500", trend: "+2.1%" },
                 { label: "Revenu / Visiteur", val: formatCurrency(metrics.revenuePerVisitor), icon: TrendingUp, color: "text-blue-500", trend: "+0.8%" },
               ].map((m, i) => (
                 <Card key={i} className="border-white/5 bg-card/40 backdrop-blur-xl overflow-hidden relative group hover:border-primary/20 transition-all">
                    <div className="absolute -right-4 -top-4 opacity-5 group-hover:opacity-10 transition-opacity">
                       <m.icon size={80} />
                    </div>
                    <CardContent className="p-6">
                       <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest mb-1">{m.label}</p>
                       <div className="flex items-end justify-between">
                          <h3 className="text-2xl font-black tracking-tight">{m.val}</h3>
                          <span className={`text-[10px] font-black flex items-center ${m.trend.startsWith('+') ? 'text-emerald-500' : 'text-destructive'}`}>
                             {m.trend} <ArrowUpRight size={12} />
                          </span>
                       </div>
                    </CardContent>
                 </Card>
               ))}
            </div>

            {/* Performance Tabs */}
            <Tabs defaultValue="overview" className="space-y-8">
               <TabsList className="bg-card/30 border border-white/5 p-1 rounded-2xl h-auto flex flex-wrap gap-1">
                  <TabsTrigger value="overview" className="rounded-xl font-black text-[10px] uppercase tracking-widest px-6 py-3 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">Vue d'Ensemble</TabsTrigger>
                  <TabsTrigger value="conversion" className="rounded-xl font-black text-[10px] uppercase tracking-widest px-6 py-3 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">Tunnel de Conversion</TabsTrigger>
                  <TabsTrigger value="products" className="rounded-xl font-black text-[10px] uppercase tracking-widest px-6 py-3 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">Performance Produits</TabsTrigger>
                  <TabsTrigger value="customers" className="rounded-xl font-black text-[10px] uppercase tracking-widest px-6 py-3 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">Comportement Client</TabsTrigger>
               </TabsList>

               <TabsContent value="overview" className="space-y-6 outline-none">
                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <Card className="lg:col-span-2 border-white/5 bg-card/40 backdrop-blur-xl">
                      <CardHeader className="flex flex-row items-center justify-between">
                        <div>
                          <CardTitle className="text-xl font-black">Ventes & Trafic</CardTitle>
                          <CardDescription>Évolution des revenus par rapport aux visites.</CardDescription>
                        </div>
                      </CardHeader>
                      <CardContent className="h-[400px] pt-4">
                        <ResponsiveContainer width="100%" height="100%">
                          <AreaChart data={metrics.salesData}>
                            <defs>
                              <linearGradient id="colorSales" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3}/>
                                <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0}/>
                              </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.05)" />
                            <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: 'hsl(var(--muted-foreground))', fontSize: 10, fontWeight: 'bold'}} dy={10} />
                            <YAxis yAxisId="left" axisLine={false} tickLine={false} tick={{fill: 'hsl(var(--muted-foreground))', fontSize: 10}} />
                            <YAxis yAxisId="right" orientation="right" axisLine={false} tickLine={false} tick={{fill: 'hsl(var(--muted-foreground))', fontSize: 10}} />
                            <RechartsTooltip 
                              contentStyle={{ backgroundColor: 'hsl(var(--card))', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.1)', fontSize: '11px', backdropFilter: 'blur(10px)' }}
                            />
                            <Area yAxisId="left" type="monotone" name="Revenus" dataKey="sales" stroke="hsl(var(--primary))" strokeWidth={4} fillOpacity={1} fill="url(#colorSales)" />
                            <Area yAxisId="right" type="monotone" name="Vues" dataKey="views" stroke="#3B82F6" strokeWidth={2} fillOpacity={0} />
                          </AreaChart>
                        </ResponsiveContainer>
                      </CardContent>
                    </Card>

                    <div className="space-y-6">
                       <Card className="border-white/5 bg-card/40 backdrop-blur-xl">
                          <CardHeader className="pb-2">
                             <CardTitle className="text-sm font-black uppercase tracking-widest text-muted-foreground flex items-center gap-2">
                                <Clock size={14} className="text-primary" /> Engagement
                             </CardTitle>
                          </CardHeader>
                          <CardContent className="space-y-4">
                             <div className="flex justify-between items-end">
                                <div>
                                   <p className="text-2xl font-black">{metrics.engagement.avgTimeOnPage}</p>
                                   <p className="text-[10px] font-bold text-muted-foreground">Temps moyen / page</p>
                                </div>
                                <div className="text-right">
                                   <p className="text-2xl font-black">{metrics.engagement.pagesPerSession}</p>
                                   <p className="text-[10px] font-bold text-muted-foreground">Pages / session</p>
                                </div>
                             </div>
                             <div className="w-full h-1.5 bg-white/5 rounded-full overflow-hidden">
                                <div className="h-full bg-primary" style={{ width: '65%' }} />
                             </div>
                          </CardContent>
                       </Card>

                       <Card className="border-white/5 bg-card/40 backdrop-blur-xl flex-1">
                         <CardHeader>
                            <CardTitle className="text-lg font-black flex items-center gap-2"><Globe size={18} className="text-primary" /> Trafic</CardTitle>
                         </CardHeader>
                         <CardContent>
                            <div className="space-y-4">
                               {metrics.trafficSources.slice(0, 4).map((source, i) => (
                                 <div key={i} className="space-y-1.5">
                                    <div className="flex justify-between text-[10px] font-black uppercase">
                                       <span className="flex items-center gap-1.5"><div className="w-2 h-2 rounded-full" style={{ backgroundColor: source.color }} /> {source.name}</span>
                                       <span className="text-muted-foreground">{source.value}% <span className="text-primary ml-2">({source.conversion.toFixed(1)}% CR)</span></span>
                                    </div>
                                    <div className="w-full h-1 bg-white/5 rounded-full overflow-hidden">
                                       <div className="h-full rounded-full" style={{ width: `${source.value}%`, backgroundColor: source.color }} />
                                    </div>
                                 </div>
                               ))}
                            </div>
                         </CardContent>
                       </Card>
                    </div>
                  </div>
               </TabsContent>

               <TabsContent value="conversion" className="outline-none">
                  <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
                     <Card className="lg:col-span-3 border-white/5 bg-card/40 backdrop-blur-xl p-8">
                        <CardTitle className="text-2xl font-black mb-8 flex items-center gap-3">
                           <Zap className="text-primary fill-primary" size={24} /> Entonnoir de Conversion
                        </CardTitle>
                        <div className="space-y-6">
                           {metrics.funnel.map((step, idx) => (
                             <div key={idx} className="relative">
                                <div className="flex items-center gap-6">
                                   <div className="w-32 text-right">
                                      <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">{step.step}</p>
                                      <p className="text-lg font-black">{step.value.toLocaleString()}</p>
                                   </div>
                                   <div className="flex-1 h-12 bg-white/5 rounded-2xl relative overflow-hidden group">
                                      <motion.div 
                                        initial={{ width: 0 }}
                                        animate={{ width: `${step.percentage}%` }}
                                        transition={{ delay: idx * 0.2, duration: 1 }}
                                        className="h-full bg-gradient-to-r from-primary/40 to-primary flex items-center justify-end px-4 border-r-4 border-primary"
                                      >
                                         <span className="text-[10px] font-black text-white">{step.percentage.toFixed(1)}%</span>
                                      </motion.div>
                                   </div>
                                </div>
                                {idx < metrics.funnel.length - 1 && (
                                  <div className="ml-[148px] py-2 flex flex-col items-center w-8">
                                     <div className="w-px h-8 bg-gradient-to-b from-primary/50 to-transparent" />
                                     <p className="text-[9px] font-black text-destructive uppercase tracking-tighter">-{ (100 - metrics.funnel[idx+1].percentage).toFixed(1) }% Drop</p>
                                  </div>
                                )}
                             </div>
                           ))}
                        </div>
                     </Card>
                     
                     <Card className="lg:col-span-2 border-white/5 bg-card/40 backdrop-blur-xl p-8 flex flex-col justify-center text-center space-y-6">
                        <div className="h-20 w-20 rounded-3xl bg-primary/10 flex items-center justify-center text-primary mx-auto border border-primary/20">
                           <MousePointer2 size={32} />
                        </div>
                        <div>
                           <h3 className="text-3xl font-black tracking-tighter">{metrics.conversionRate.toFixed(2)}%</h3>
                           <p className="text-xs font-black text-muted-foreground uppercase tracking-widest mt-1">Taux de Conversion Global</p>
                        </div>
                        <p className="text-sm text-muted-foreground leading-relaxed">
                           Votre taux de conversion est <span className="text-emerald-500 font-bold">supérieur de 12%</span> à la moyenne du marché MindHubs.
                        </p>
                        <div className="pt-4 grid grid-cols-2 gap-4">
                           <div className="p-4 rounded-2xl bg-white/5 border border-white/5">
                              <p className="text-lg font-black">2.4%</p>
                              <p className="text-[9px] font-black text-muted-foreground uppercase">Taux d'Abandon</p>
                           </div>
                           <div className="p-4 rounded-2xl bg-white/5 border border-white/5">
                              <p className="text-lg font-black">0%</p>
                              <p className="text-[9px] font-black text-muted-foreground uppercase">Taux de Retour</p>
                           </div>
                        </div>
                     </Card>
                  </div>
               </TabsContent>

               <TabsContent value="products" className="outline-none">
                  <Card className="border-white/5 bg-card/40 backdrop-blur-xl overflow-hidden">
                     <CardHeader className="flex flex-row items-center justify-between">
                        <div>
                           <CardTitle className="text-xl font-black">Performance par Produit</CardTitle>
                           <CardDescription>Analyse granulaire de chaque offre de votre boutique.</CardDescription>
                        </div>
                        <Button variant="outline" size="sm" className="rounded-xl border-white/10 gap-2 h-9">
                           <Filter size={14} /> Filtres Avancés
                        </Button>
                     </CardHeader>
                     <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                           <thead>
                              <tr className="border-y border-white/5 bg-white/5 text-[10px] font-black text-muted-foreground uppercase tracking-widest">
                                 <th className="py-4 px-6">Produit</th>
                                 <th className="py-4 px-4 text-center">Vues</th>
                                 <th className="py-4 px-4 text-center">CTR %</th>
                                 <th className="py-4 px-4 text-center">Ajouts</th>
                                 <th className="py-4 px-4 text-center">Ventes</th>
                                 <th className="py-4 px-4 text-center">Conv. %</th>
                                 <th className="py-4 px-4 text-center">Stock</th>
                                 <th className="py-4 px-6 text-right">Statut</th>
                              </tr>
                           </thead>
                           <tbody className="divide-y divide-white/5">
                              {metrics.productPerformance.map((p, i) => (
                                <tr key={i} className="group hover:bg-white/5 transition-colors">
                                   <td className="py-4 px-6">
                                      <div className="flex items-center gap-3">
                                         <div className="h-10 w-10 rounded-lg bg-muted border border-white/10 overflow-hidden shrink-0">
                                            {/* We'd need the actual image here, using placeholder for now */}
                                            <div className="h-full w-full bg-primary/10 flex items-center justify-center text-primary font-black text-xs">
                                               {p.title.charAt(0)}
                                            </div>
                                         </div>
                                         <span className="font-bold text-sm truncate max-w-[200px]">{p.title}</span>
                                      </div>
                                   </td>
                                   <td className="py-4 px-4 text-center font-black text-xs">{p.views.toLocaleString()}</td>
                                   <td className="py-4 px-4 text-center">
                                      <Badge variant="outline" className={`border-none font-black text-[10px] ${p.ctr > 5 ? 'text-emerald-500 bg-emerald-500/10' : 'text-muted-foreground bg-white/5'}`}>
                                         {p.ctr.toFixed(1)}%
                                      </Badge>
                                   </td>
                                   <td className="py-4 px-4 text-center font-black text-xs">{p.cartAdds}</td>
                                   <td className="py-4 px-4 text-center font-black text-xs text-primary">{p.purchases}</td>
                                   <td className="py-4 px-4 text-center">
                                      <span className={`text-xs font-black ${p.conversion > 2 ? 'text-emerald-500' : 'text-foreground'}`}>
                                         {p.conversion.toFixed(1)}%
                                      </span>
                                   </td>
                                   <td className="py-4 px-4 text-center">
                                      <div className="flex flex-col items-center gap-1">
                                         <span className={`text-[10px] font-black ${p.stock < 10 ? 'text-destructive' : 'text-muted-foreground'}`}>{p.stock}</span>
                                         <div className="w-12 h-1 bg-white/5 rounded-full">
                                            <div className={`h-full rounded-full ${p.stock < 10 ? 'bg-destructive' : 'bg-primary'}`} style={{ width: `${Math.min(p.stock, 100)}%` }} />
                                         </div>
                                      </div>
                                   </td>
                                   <td className="py-4 px-6 text-right">
                                      {p.stock < 5 ? (
                                        <Badge className="bg-destructive/10 text-destructive border-none text-[8px] font-black uppercase">Stock Bas</Badge>
                                      ) : p.conversion > 5 ? (
                                        <Badge className="bg-emerald-500/10 text-emerald-500 border-none text-[8px] font-black uppercase">Top Performer</Badge>
                                      ) : (
                                        <Badge className="bg-white/5 text-muted-foreground border-none text-[8px] font-black uppercase">Stable</Badge>
                                      )}
                                   </td>
                                </tr>
                              ))}
                           </tbody>
                        </table>
                     </div>
                  </Card>
               </TabsContent>

               <TabsContent value="customers" className="outline-none space-y-6">
                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                     <Card className="lg:col-span-1 border-white/5 bg-card/40 backdrop-blur-xl p-8">
                        <CardTitle className="text-xl font-black mb-6">Fidélisation</CardTitle>
                        <div className="h-[250px] w-full">
                           <ResponsiveContainer width="100%" height="100%">
                              <PieChart>
                                 <Pie
                                   data={metrics.customerBehavior.newVsReturning}
                                   cx="50%"
                                   cy="50%"
                                   innerRadius={60}
                                   outerRadius={80}
                                   paddingAngle={8}
                                   dataKey="value"
                                 >
                                    {metrics.customerBehavior.newVsReturning.map((entry, index) => (
                                       <Cell key={`cell-${index}`} fill={entry.color} />
                                    ))}
                                 </Pie>
                                 <RechartsTooltip contentStyle={{ backgroundColor: 'hsl(var(--card))', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.1)' }} />
                                 <Legend verticalAlign="bottom" height={36} formatter={(value) => <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-2">{value}</span>} />
                              </PieChart>
                           </ResponsiveContainer>
                        </div>
                        <div className="pt-6 border-t border-white/5 space-y-4">
                           <div className="flex justify-between items-center">
                              <p className="text-[10px] font-black text-muted-foreground uppercase">Valeur Vie Client (LTV)</p>
                              <p className="text-sm font-black">{formatCurrency(metrics.customerBehavior.ltv)}</p>
                           </div>
                           <div className="flex justify-between items-center">
                              <p className="text-[10px] font-black text-muted-foreground uppercase">Délai inter-achats</p>
                              <p className="text-sm font-black">{metrics.customerBehavior.avgTimeBetweenPurchases}</p>
                           </div>
                        </div>
                     </Card>

                     <Card className="lg:col-span-2 border-white/5 bg-card/40 backdrop-blur-xl p-8">
                        <div className="flex items-center justify-between mb-8">
                           <div>
                              <CardTitle className="text-xl font-black">Pics d'Activité</CardTitle>
                              <CardDescription>À quel moment vos clients achètent-ils le plus ?</CardDescription>
                           </div>
                           <Clock className="text-primary" size={24} />
                        </div>
                        <div className="h-[300px]">
                           <ResponsiveContainer width="100%" height="100%">
                              <BarChart data={metrics.engagement.peakHours}>
                                 <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.05)" />
                                 <XAxis dataKey="hour" axisLine={false} tickLine={false} tick={{fill: 'hsl(var(--muted-foreground))', fontSize: 10}} />
                                 <YAxis axisLine={false} tickLine={false} tick={{fill: 'hsl(var(--muted-foreground))', fontSize: 10}} />
                                 <RechartsTooltip 
                                    cursor={{fill: 'rgba(255,255,255,0.05)'}}
                                    contentStyle={{ backgroundColor: 'hsl(var(--card))', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.1)' }} 
                                 />
                                 <Bar dataKey="value" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                              </BarChart>
                           </ResponsiveContainer>
                        </div>
                     </Card>
                  </div>
               </TabsContent>
            </Tabs>

            {/* Support / Help footer */}
            <div className="flex flex-col md:flex-row gap-6">
               <Card className="flex-1 border-white/5 bg-primary/5 p-8 relative overflow-hidden group">
                  <div className="absolute -right-8 -bottom-8 opacity-10 group-hover:scale-110 transition-transform duration-700">
                     <TrendingUp size={160} />
                  </div>
                  <div className="relative z-10 space-y-4">
                     <h3 className="text-2xl font-black">Besoin d'analyser une campagne spécifique ?</h3>
                     <p className="text-muted-foreground text-sm max-w-md">Connectez vos pixels Meta ou Google pour une vue encore plus précise de votre ROI publicitaire.</p>
                     <Button className="h-12 rounded-xl px-8 btn-glow font-black text-xs uppercase tracking-widest">Configurer les Pixels</Button>
                  </div>
               </Card>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

const VendorAnalytics = () => (
  <VendorGuard>{(vendor) => <VendorAnalyticsInner vendor={vendor} />}</VendorGuard>
);

export default VendorAnalytics;

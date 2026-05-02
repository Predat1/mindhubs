import { useState } from "react";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import VendorGuard from "@/components/dashboard/VendorGuard";
import SEO from "@/components/SEO";
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, 
  AreaChart, Area, Cell, PieChart, Pie
} from "recharts";
import { 
  TrendingUp, Eye, ShoppingCart, ArrowUpRight, ArrowDownRight, 
  Calendar, Download, Globe, MousePointer2, CreditCard, Sparkles, MapPin
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useVendorAnalytics } from "@/hooks/useVendorAnalytics";
import type { Vendor } from "@/hooks/useVendors";

const VendorAnalyticsInner = ({ vendor }: { vendor: Vendor }) => {
  const [timeRange, setTimeRange] = useState("7d");
  const { data, isLoading } = useVendorAnalytics(vendor.id, timeRange);

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'XOF', maximumFractionDigits: 0 }).format(val);
  };

  const metrics = data || {
    totalViews: 0,
    totalOrders: 0,
    totalRevenue: 0,
    conversionRate: 0,
    salesData: [],
    trafficSources: [],
    countries: []
  };

  return (
    <DashboardLayout variant="vendor" title="Analytiques" shopName={vendor.shop_name} shopUrl={`/store/${vendor.username}`}>
      <SEO title="Analytiques — Command Center" description="Suivez vos performances en temps réel." path="/dashboard/analytics" />

      <div className="space-y-8">
        {/* Header with Filters */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h2 className="text-3xl font-black tracking-tight">Command Center</h2>
            <p className="text-muted-foreground">Pilotez votre croissance avec des données réelles.</p>
          </div>
          <div className="flex items-center gap-3">
            <Select value={timeRange} onValueChange={setTimeRange}>
              <SelectTrigger className="w-[180px] rounded-xl border-white/10 bg-card">
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
            <Button variant="outline" size="icon" className="rounded-xl border-white/10">
              <Download size={18} />
            </Button>
          </div>
        </div>

        {isLoading ? (
          <div className="text-center py-20 text-muted-foreground animate-pulse">Chargement de vos données analytiques...</div>
        ) : (
          <>
            {/* Key Metrics Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {[
                { label: "Vues Totales", val: metrics.totalViews.toLocaleString(), icon: Eye, color: "text-blue-500" },
                { label: "Commandes", val: metrics.totalOrders.toLocaleString(), icon: ShoppingCart, color: "text-primary" },
                { label: "Conversion", val: `${metrics.conversionRate.toFixed(1)}%`, icon: MousePointer2, color: "text-emerald-500" },
                { label: "Revenu Net (Estimé)", val: formatCurrency(metrics.totalRevenue), icon: CreditCard, color: "text-amber-500" },
              ].map((m, i) => (
                <Card key={i} className="border-white/5 bg-card/50 backdrop-blur-sm overflow-hidden group hover:border-primary/30 transition-all">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between mb-4">
                      <div className={`p-2 rounded-lg bg-background border border-white/5 ${m.color}`}>
                        <m.icon size={20} />
                      </div>
                    </div>
                    <p className="text-sm font-bold text-muted-foreground uppercase tracking-widest">{m.label}</p>
                    <h3 className="text-2xl font-black mt-1 tracking-tight">{m.val}</h3>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Main Charts */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Sales & Views Chart */}
              <Card className="lg:col-span-2 border-white/5 bg-card/50 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle className="text-xl font-black flex items-center gap-2">
                    <TrendingUp className="text-primary" size={20} /> Revenus & Trafic
                  </CardTitle>
                  <CardDescription>Comparaison entre les revenus générés et les vues reçues.</CardDescription>
                </CardHeader>
                <CardContent className="h-[350px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={metrics.salesData}>
                      <defs>
                        <linearGradient id="colorSales" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3}/>
                          <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0}/>
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.05)" />
                      <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: 'hsl(var(--muted-foreground))', fontSize: 12}} dy={10} />
                      <YAxis yAxisId="left" axisLine={false} tickLine={false} tick={{fill: 'hsl(var(--muted-foreground))', fontSize: 12}} />
                      <YAxis yAxisId="right" orientation="right" axisLine={false} tickLine={false} tick={{fill: 'hsl(var(--muted-foreground))', fontSize: 12}} />
                      <RechartsTooltip 
                        contentStyle={{ backgroundColor: 'hsl(var(--card))', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.1)', fontSize: '12px' }}
                        itemStyle={{ fontWeight: 'bold' }}
                      />
                      <Area yAxisId="left" type="monotone" name="Revenus" dataKey="sales" stroke="hsl(var(--primary))" strokeWidth={3} fillOpacity={1} fill="url(#colorSales)" />
                      <Area yAxisId="right" type="monotone" name="Vues" dataKey="views" stroke="hsl(var(--accent))" strokeWidth={2} fillOpacity={0} />
                    </AreaChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              {/* Traffic Sources */}
              <Card className="border-white/5 bg-card/50 backdrop-blur-sm flex flex-col">
                <CardHeader>
                  <CardTitle className="text-xl font-black flex items-center gap-2">
                    <Globe className="text-primary" size={20} /> Sources de Trafic
                  </CardTitle>
                  <CardDescription>D'où viennent vos acheteurs ?</CardDescription>
                </CardHeader>
                <CardContent className="flex flex-col items-center flex-1">
                  {metrics.trafficSources.length === 0 ? (
                    <div className="flex-1 flex items-center justify-center text-muted-foreground text-sm">
                      Pas de données disponibles pour cette période.
                    </div>
                  ) : (
                    <>
                      <div className="h-[200px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                          <PieChart>
                            <Pie
                              data={metrics.trafficSources}
                              cx="50%"
                              cy="50%"
                              innerRadius={60}
                              outerRadius={80}
                              paddingAngle={5}
                              dataKey="value"
                            >
                              {metrics.trafficSources.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={entry.color} />
                              ))}
                            </Pie>
                            <RechartsTooltip contentStyle={{ backgroundColor: 'hsl(var(--card))', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.1)' }} />
                          </PieChart>
                        </ResponsiveContainer>
                      </div>
                      <div className="w-full space-y-3 mt-4">
                        {metrics.trafficSources.map((source, i) => (
                          <div key={i} className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <div className="w-3 h-3 rounded-full" style={{ backgroundColor: source.color }} />
                              <span className="text-sm font-bold">{source.name}</span>
                            </div>
                            <span className="text-sm text-muted-foreground font-black">{source.value}%</span>
                          </div>
                        ))}
                      </div>
                    </>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Bottom Metrics - Countries and Promo */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
               {/* Countries Data */}
               <Card className="border-white/5 bg-card/50 backdrop-blur-sm">
                  <CardHeader>
                    <CardTitle className="text-xl font-black flex items-center gap-2">
                      <MapPin className="text-primary" size={20} /> Acheteurs par Pays
                    </CardTitle>
                    <CardDescription>Répartition géographique de vos ventes.</CardDescription>
                  </CardHeader>
                  <CardContent>
                    {metrics.countries.length === 0 ? (
                      <div className="h-[150px] flex items-center justify-center text-muted-foreground text-sm">
                        Aucune vente enregistrée sur cette période.
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {metrics.countries.map((country, idx) => (
                          <div key={idx} className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              <span className="text-xl">{country.name === "France" ? "🇫🇷" : country.name === "Sénégal" ? "🇸🇳" : country.name === "Côte d'Ivoire" ? "🇨🇮" : "🌍"}</span>
                              <span className="font-bold text-sm">{country.name}</span>
                            </div>
                            <div className="flex items-center gap-4">
                              <div className="w-32 h-2 bg-background rounded-full overflow-hidden">
                                <div 
                                  className="h-full bg-primary rounded-full" 
                                  style={{ width: `${(country.value / metrics.totalOrders) * 100}%` }} 
                                />
                              </div>
                              <span className="text-sm font-black text-muted-foreground min-w-[30px] text-right">
                                {country.value}
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </CardContent>
               </Card>

               <Card className="border-white/5 bg-card/50 backdrop-blur-sm flex flex-col justify-center p-8 relative overflow-hidden">
                  <div className="absolute top-0 right-0 p-12 opacity-5 pointer-events-none">
                    <Sparkles size={120} className="text-primary" />
                  </div>
                  <h3 className="text-2xl font-black mb-4">Besoin de plus de trafic ?</h3>
                  <p className="text-muted-foreground mb-6 leading-relaxed">
                    Utilisez notre <strong>Studio Pub IA</strong> pour générer des visuels et des ciblages optimisés basés sur vos données de trafic actuelles.
                  </p>
                  <Button className="w-full h-12 rounded-xl btn-glow font-black text-sm uppercase tracking-widest">
                    Lancer une campagne IA
                  </Button>
               </Card>
            </div>
          </>
        )}
      </div>
    </DashboardLayout>
  );
};

const VendorAnalytics = () => (
  <VendorGuard>{(vendor) => <VendorAnalyticsInner vendor={vendor} />}</VendorGuard>
);

export default VendorAnalytics;

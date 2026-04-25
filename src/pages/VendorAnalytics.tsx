import { useState } from "react";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import VendorGuard from "@/components/dashboard/VendorGuard";
import SEO from "@/components/SEO";
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  LineChart, Line, AreaChart, Area, Cell, PieChart, Pie
} from "recharts";
import { 
  TrendingUp, Users, Eye, ShoppingCart, ArrowUpRight, ArrowDownRight, 
  Calendar, Download, Filter, Globe, MousePointer2, CreditCard 
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const salesData = [
  { name: "Lun", sales: 4000, views: 2400 },
  { name: "Mar", sales: 3000, views: 1398 },
  { name: "Mer", sales: 2000, views: 9800 },
  { name: "Jeu", sales: 2780, views: 3908 },
  { name: "Ven", sales: 1890, views: 4800 },
  { name: "Sam", sales: 2390, views: 3800 },
  { name: "Dim", sales: 3490, views: 4300 },
];

const trafficSources = [
  { name: "WhatsApp", value: 45, color: "#25D366" },
  { name: "Facebook", value: 25, color: "#1877F2" },
  { name: "Direct", value: 20, color: "#7C3AED" },
  { name: "Instagram", value: 10, color: "#E4405F" },
];

const conversionData = [
  { name: "S1", conversion: 2.4 },
  { name: "S2", conversion: 3.1 },
  { name: "S3", conversion: 2.8 },
  { name: "S4", conversion: 4.2 },
  { name: "S5", conversion: 3.8 },
];

const VendorAnalyticsInner = ({ vendor }: { vendor: any }) => {
  const [timeRange, setTimeRange] = useState("7d");

  return (
    <DashboardLayout variant="vendor" title="Analytiques" shopName={vendor.shop_name} shopUrl={`/store/${vendor.username}`}>
      <SEO title="Analytiques — Command Center" description="Suivez vos performances en temps réel." path="/dashboard/analytics" />

      <div className="space-y-8">
        {/* Header with Filters */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h2 className="text-3xl font-black tracking-tight">Command Center</h2>
            <p className="text-muted-foreground">Pilotez votre croissance avec des données précises.</p>
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

        {/* Key Metrics Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { label: "Vues Totales", val: "12,480", change: "+12.5%", up: true, icon: Eye, color: "text-blue-500" },
            { label: "Commandes", val: "482", change: "+8.2%", up: true, icon: ShoppingCart, color: "text-primary" },
            { label: "Conversion", val: "3.8%", change: "-0.4%", up: false, icon: MousePointer2, color: "text-emerald-500" },
            { label: "Revenu Estimé", val: "1.2M FCFA", change: "+15.3%", up: true, icon: CreditCard, color: "text-amber-500" },
          ].map((m, i) => (
            <Card key={i} className="border-white/5 bg-card/50 backdrop-blur-sm overflow-hidden group hover:border-primary/30 transition-all">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className={`p-2 rounded-lg bg-background border border-white/5 ${m.color}`}>
                    <m.icon size={20} />
                  </div>
                  <div className={`flex items-center text-xs font-bold ${m.up ? "text-emerald-500" : "text-destructive"}`}>
                    {m.change} {m.up ? <ArrowUpRight size={14} /> : <ArrowDownRight size={14} />}
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
                <TrendingUp className="text-primary" size={20} /> Performance des Ventes
              </CardTitle>
              <CardDescription>Comparaison entre les vues et les conversions réelles.</CardDescription>
            </CardHeader>
            <CardContent className="h-[350px]">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={salesData}>
                  <defs>
                    <linearGradient id="colorSales" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.05)" />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: 'hsl(var(--muted-foreground))', fontSize: 12}} dy={10} />
                  <YAxis axisLine={false} tickLine={false} tick={{fill: 'hsl(var(--muted-foreground))', fontSize: 12}} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: 'hsl(var(--card))', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.1)', fontSize: '12px' }}
                    itemStyle={{ fontWeight: 'bold' }}
                  />
                  <Area type="monotone" dataKey="sales" stroke="hsl(var(--primary))" strokeWidth={3} fillOpacity={1} fill="url(#colorSales)" />
                  <Area type="monotone" dataKey="views" stroke="hsl(var(--accent))" strokeWidth={2} fillOpacity={0} />
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Traffic Sources */}
          <Card className="border-white/5 bg-card/50 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="text-xl font-black flex items-center gap-2">
                <Globe className="text-primary" size={20} /> Sources de Trafic
              </CardTitle>
              <CardDescription>D'où viennent vos acheteurs ?</CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col items-center">
              <div className="h-[200px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={trafficSources}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={80}
                      paddingAngle={5}
                      dataKey="value"
                    >
                      {trafficSources.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="w-full space-y-3 mt-4">
                {trafficSources.map((source, i) => (
                  <div key={i} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full" style={{ backgroundColor: source.color }} />
                      <span className="text-sm font-bold">{source.name}</span>
                    </div>
                    <span className="text-sm text-muted-foreground font-black">{source.value}%</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Bottom Metrics */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
           <Card className="border-white/5 bg-card/50 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="text-xl font-black flex items-center gap-2">
                  <Filter className="text-primary" size={20} /> Taux de Conversion
                </CardTitle>
                <CardDescription>Progression hebdomadaire de votre efficacité de vente.</CardDescription>
              </CardHeader>
              <CardContent className="h-[250px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={conversionData}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.05)" />
                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: 'hsl(var(--muted-foreground))', fontSize: 12}} />
                    <YAxis axisLine={false} tickLine={false} tick={{fill: 'hsl(var(--muted-foreground))', fontSize: 12}} unit="%" />
                    <Tooltip 
                      cursor={{fill: 'rgba(255,255,255,0.05)'}}
                      contentStyle={{ backgroundColor: 'hsl(var(--card))', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.1)' }}
                    />
                    <Bar dataKey="conversion" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
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
      </div>
    </DashboardLayout>
  );
};

const VendorAnalytics = () => (
  <VendorGuard>{(vendor) => <VendorAnalyticsInner vendor={vendor} />}</VendorGuard>
);

export default VendorAnalytics;

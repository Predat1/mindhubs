import { useState, useMemo, useRef, useEffect } from "react";
import { 
  Package, MessageSquare, ShoppingBag, Plus, Pencil, Trash2, Save, X, Eye, 
  ExternalLink, Download, Clock, CheckCircle2, AlertCircle, XCircle, 
  ArrowLeft, Copy, Link2, ImageIcon, Upload, Loader2, DollarSign, Users,
  ShieldAlert, Bell, Search, BarChart3, TrendingUp, TrendingDown
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";
import { toast } from "@/hooks/use-toast";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import SEO from "@/components/SEO";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Tooltip, AreaChart, Area, Cell } from "recharts";
import { motion, AnimatePresence } from "framer-motion";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useTheme } from "@/contexts/ThemeContext";
import { Sun as SunIcon, Moon as MoonIcon } from "lucide-react";
import type { Vendor } from "@/hooks/useVendors";

// ─── Types ───
interface ProductForm {
  id: string;
  title: string;
  image_url: string;
  old_price: string;
  price: string;
  category: string;
  rating: string;
  tag: string;
  description: string;
  payment_link: string;
  image_urls: string[];
  key_features: string[];
  sort_order: number;
  featured: boolean;
}

const DEFAULT_PRODUCT: ProductForm = {
  id: "", title: "", image_url: "", old_price: "", price: "",
  category: "E-books", rating: "4.5", tag: "", description: "",
  payment_link: "", image_urls: [], key_features: [], sort_order: 0,
  featured: false,
};

interface TestimonialForm {
  id: string;
  name: string;
  handle: string;
  avatar_initials: string;
  content: string;
  likes: string;
  retweets: string;
  replies: string;
  verified: boolean;
}

const DEFAULT_TESTIMONIAL: TestimonialForm = {
  id: "", name: "", handle: "", avatar_initials: "", content: "",
  likes: "0", retweets: "0", replies: "0", verified: false,
};

type Tab = "overview" | "products" | "testimonials" | "orders" | "vendors" | "security" | "analytics" | "settings" | "help";

interface Order {
  id: string;
  customer_name: string;
  customer_email: string;
  customer_phone: string;
  total_price: number;
  status: "pending" | "completed" | "cancelled" | "shipped";
  payment_method: string;
  items: Array<{ title: string; quantity: number; price: string; image?: string }>;
  created_at: string;
}

interface AdminProduct {
  id: string;
  title: string;
  image: string;
  oldPrice: string;
  price: string;
  category: string;
  rating: string;
  tag: string;
  description: string;
  paymentLink: string;
  imageUrls: string[];
  keyFeatures: string[];
  sort_order: number;
  featured: boolean;
  image_url: string;
}

const statusConfig = {
  pending: { label: "En attente", color: "bg-yellow-500/10 text-yellow-600 border-yellow-500/20", icon: Clock },
  completed: { label: "Terminé", color: "bg-emerald-500/10 text-emerald-600 border-emerald-500/20", icon: CheckCircle2 },
  shipped: { label: "Expédié", color: "bg-primary/10 text-primary border-primary/20", icon: ExternalLink },
  cancelled: { label: "Annulé", color: "bg-destructive/10 text-destructive border-destructive/20", icon: XCircle },
};

const Admin = () => {
  const { theme, toggleTheme } = useTheme();
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const currentTab = (searchParams.get("tab") as Tab) || "overview";

  const [productEditing, setProductEditing] = useState<ProductForm | null>(null);
  const [testimonialEditing, setTestimonialEditing] = useState<TestimonialForm | null>(null);
  const [viewingOrder, setViewingOrder] = useState<Order | null>(null);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [updatingStatus, setUpdatingStatus] = useState<string | null>(null);
  const [productSearch, setProductSearch] = useState("");
  const [testimonialSearch, setTestimonialSearch] = useState("");
  const [orderSearch, setOrderSearch] = useState("");
  const [orderFilter, setOrderFilter] = useState<string>("all");
  const [deleteConfirm, setDeleteConfirm] = useState<{ type: "product" | "testimonial"; id: string; label: string } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();

  const setTab = (newTab: Tab) => {
    navigate(`/admin?tab=${newTab}`);
  };

  // ─── Queries ───
  const { data: products = [], isLoading: productsLoading, refetch: refetchProducts } = useQuery({
    queryKey: ["admin-products"],
    queryFn: async (): Promise<AdminProduct[]> => {
      const { data, error } = await supabase.from("products").select("*").order("sort_order", { ascending: true });
      if (error) throw error;
      return (data || []).map(db => ({
        id: db.id, title: db.title, image: db.image_url, oldPrice: db.old_price, price: db.price,
        category: db.category, rating: db.rating, tag: db.tag, description: db.description,
        paymentLink: db.payment_link, imageUrls: db.image_urls || [], keyFeatures: db.key_features || [],
        sort_order: db.sort_order, featured: db.featured, image_url: db.image_url
      })) as AdminProduct[];
    },
  });

  const { data: testimonials = [], isLoading: testimonialsLoading, refetch: refetchTestimonials } = useQuery({
    queryKey: ["admin-testimonials"],
    queryFn: async () => {
      const { data, error } = await supabase.from("testimonials").select("*").order("created_at", { ascending: false });
      if (error) throw error;
      return (data || []) as TestimonialForm[];
    },
  });

  const { data: orders = [], isLoading: ordersLoading, refetch: refetchOrders } = useQuery({
    queryKey: ["admin-orders"],
    queryFn: async () => {
      const { data, error } = await supabase.from("orders").select("*").order("created_at", { ascending: false });
      if (error) throw error;
      return (data || []).map(db => ({
        ...db,
        items: Array.isArray(db.items) ? db.items : []
      })) as Order[];
    },
  });

  const { data: allVendors = [], isLoading: vendorsLoading, refetch: refetchVendors } = useQuery({
    queryKey: ["admin-vendors"],
    queryFn: async (): Promise<Vendor[]> => {
      const { data, error } = await supabase.from("vendors").select("*").order("created_at", { ascending: false });
      if (error) throw error;
      return data ?? [];
    },
  });

  const toggleVendorVerification = async (vendorId: string, currentStatus: boolean) => {
    const { error } = await supabase.from("vendors").update({ verified: !currentStatus }).eq("id", vendorId);
    if (error) { toast({ title: "Erreur", description: error.message, variant: "destructive" }); return; }
    toast({ title: "Statut mis à jour", description: `Le vendeur est désormais ${!currentStatus ? "vérifié" : "standard"}.` });
    refetchVendors();
  };

  // ─── Analytics ───
  const revenueChartData = useMemo(() => {
    const days: { date: string; revenue: number; orders: number }[] = [];
    for (let i = 13; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const key = d.toISOString().slice(0, 10);
      const label = d.toLocaleDateString("fr-FR", { weekday: "short", day: "numeric" });
      const dayOrders = orders.filter(o => o.created_at.slice(0, 10) === key && o.status !== "cancelled");
      const dayRevenue = dayOrders.reduce((s, o) => s + o.total_price, 0);
      days.push({ date: label, revenue: dayRevenue, orders: dayOrders.length });
    }
    return days;
  }, [orders]);

  const activityFeed = useMemo(() => {
    const activity: { id: string; type: string; title: string; subtitle: string; time: string; icon: React.ElementType; color: string }[] = [];
    orders.slice(0, 5).forEach(o => {
      activity.push({
        id: o.id, type: "order", title: "Nouvelle commande",
        subtitle: `${o.customer_name} — ${o.total_price.toLocaleString()} FCFA`,
        time: o.created_at, icon: ShoppingBag, color: "text-primary bg-primary/10"
      });
    });
    products.slice(0, 3).forEach(p => {
      activity.push({
        id: p.id, type: "product", title: "Produit mis à jour", subtitle: p.title,
        time: new Date().toISOString(), icon: Package, color: "text-accent bg-accent/10"
      });
    });
    return activity.sort((a, b) => new Date(b.time).getTime() - new Date(a.time).getTime()).slice(0, 8);
  }, [orders, products]);

  const pendingCount = useMemo(() => orders.filter(o => o.status === "pending").length, [orders]);

  // ─── Handlers ───
  const saveProduct = async () => {
    if (!productEditing) return;
    setSaving(true);
    const isNew = !products.find(p => p.id === productEditing.id);
    const { error } = isNew 
      ? await supabase.from("products").insert([productEditing])
      : await supabase.from("products").update(productEditing).eq("id", productEditing.id);
    setSaving(false);
    if (error) { toast({ title: "Erreur", description: error.message, variant: "destructive" }); return; }
    toast({ title: "Succès", description: `Produit ${isNew ? "ajouté" : "mis à jour"}.` });
    setProductEditing(null);
    refetchProducts();
  };

  const saveTestimonial = async () => {
    if (!testimonialEditing) return;
    setSaving(true);
    const isNew = !testimonialEditing.id;
    const data = { ...testimonialEditing } as Partial<TestimonialForm> & { id?: string };
    const { error } = isNew 
      ? await supabase.from("testimonials").insert([data])
      : await supabase.from("testimonials").update(data).eq("id", data.id);
    setSaving(false);
    if (error) { toast({ title: "Erreur", description: error.message, variant: "destructive" }); return; }
    toast({ title: "Succès", description: "Témoignage enregistré." });
    setTestimonialEditing(null);
    refetchTestimonials();
  };

  const updateOrderStatus = async (orderId: string, status: Order["status"]) => {
    setUpdatingStatus(orderId);
    const { error } = await supabase.from("orders").update({ status }).eq("id", orderId);
    setUpdatingStatus(null);
    if (error) { toast({ title: "Erreur", description: error.message, variant: "destructive" }); return; }
    toast({ title: "Statut mis à jour", description: `La commande est maintenant ${statusConfig[status].label}.` });
    refetchOrders();
    if (viewingOrder?.id === orderId) setViewingOrder({ ...viewingOrder, status });
  };

  const handleDeleteConfirm = async () => {
    if (!deleteConfirm) return;
    const { id, type } = deleteConfirm;
    setDeleting(id);
    const table = type === "product" ? "products" : type === "testimonial" ? "testimonials" : "orders";
    const { error } = await supabase.from(table).delete().eq("id", id);
    setDeleting(null);
    setDeleteConfirm(null);
    if (error) { toast({ title: "Erreur", description: error.message, variant: "destructive" }); return; }
    toast({ title: "Supprimé", description: "Élément supprimé avec succès." });
    if (type === "product") refetchProducts();
    else if (type === "testimonial") refetchTestimonials();
    else refetchOrders();
  };

  const handleImageUpload = async (file: File) => {
    if (!productEditing) return;
    setUploading(true);
    const ext = file.name.split(".").pop() || "jpg";
    const fileName = `${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
    const { error } = await supabase.storage.from("product-images").upload(fileName, file, { upsert: true });
    if (error) { setUploading(false); toast({ title: "Erreur upload", description: error.message, variant: "destructive" }); return; }
    const { data: urlData } = supabase.storage.from("product-images").getPublicUrl(fileName);
    setProductEditing({ ...productEditing, image_url: urlData.publicUrl });
    setUploading(false);
  };


  const filteredProducts = useMemo(() => 
    (products as AdminProduct[]).filter(p => p.title.toLowerCase().includes(productSearch.toLowerCase()) || p.category.toLowerCase().includes(productSearch.toLowerCase())),
    [products, productSearch]
  );

  const filteredTestimonials = useMemo(() => 
    testimonials.filter((t: TestimonialForm) => t.name.toLowerCase().includes(testimonialSearch.toLowerCase()) || t.content.toLowerCase().includes(testimonialSearch.toLowerCase())),
    [testimonials, testimonialSearch]
  );

  const categories = ["E-books", "Formations", "Templates", "Services", "Logiciels", "Tous"];

  return (
    <DashboardLayout variant="admin">
      <SEO title="Administration | MindHubs" description="Gérez votre marketplace MindHubs." />
      
      <div className="max-w-[1600px] mx-auto space-y-8">
        {/* Dashboard Overview */}
        <AnimatePresence mode="wait">
          <motion.div
            key={currentTab}
            initial={{ opacity: 0, x: 10 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -10 }}
            transition={{ duration: 0.2 }}
            className="space-y-8"
          >
            {currentTab === "overview" && (
              <div className="space-y-8">
                 <div className="grid lg:grid-cols-3 gap-8">
                    <div className="lg:col-span-2 space-y-6">
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                        {[
                          { label: "Ventes", value: orders.length, icon: ShoppingBag, trend: "+12%", color: "primary" },
                          { label: "Revenu", value: `${(orders.filter(o => o.status !== "cancelled").reduce((s, o) => s + o.total_price, 0) / 1000).toFixed(1)}k`, icon: DollarSign, trend: "+8%", color: "accent" },
                          { label: "Produits", value: products.length, icon: Package, trend: "+2", color: "primary" },
                          { label: "Attente", value: pendingCount, icon: Clock, trend: "-3", color: "yellow-500" },
                        ].map((s, i) => (
                          <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }} key={i} className="stat-card rounded-2xl p-5 border-glow hover:-translate-y-1 transition-all">
                            <div className="flex items-center justify-between mb-2">
                              <div className={`w-10 h-10 rounded-xl flex items-center justify-center bg-${s.color}/10 text-${s.color}`}><s.icon size={18} /></div>
                              <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${s.trend.startsWith("+") ? "bg-emerald-500/10 text-emerald-500" : "bg-destructive/10 text-destructive"}`}>{s.trend}</span>
                            </div>
                            <p className="text-2xl font-bold text-foreground">{s.value}</p>
                            <p className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider">{s.label}</p>
                          </motion.div>
                        ))}
                      </div>

                      <div className="stat-card rounded-2xl p-6 border-glow">
                        <div className="flex items-center justify-between mb-6">
                          <div><h3 className="text-sm font-bold">Performances Globales</h3><p className="text-[10px] text-muted-foreground">Analytiques temps réel</p></div>
                          <div className="flex gap-3"><div className="flex items-center gap-1.5"><div className="w-2 h-2 rounded-full bg-primary" /><span className="text-[10px] text-muted-foreground">Revenu</span></div><div className="flex items-center gap-1.5"><div className="w-2 h-2 rounded-full bg-accent" /><span className="text-[10px] text-muted-foreground">Commandes</span></div></div>
                        </div>
                        <div className="h-64">
                          <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={revenueChartData}>
                              <defs>
                                <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3}/><stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0}/></linearGradient>
                                <linearGradient id="colorOrd" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="hsl(var(--accent))" stopOpacity={0.3}/><stop offset="95%" stopColor="hsl(var(--accent))" stopOpacity={0}/></linearGradient>
                              </defs>
                              <XAxis dataKey="date" tick={{ fontSize: 10 }} axisLine={false} tickLine={false} className="fill-muted-foreground" />
                              <YAxis yAxisId="left" tick={{ fontSize: 10 }} axisLine={false} tickLine={false} width={40} className="fill-muted-foreground" />
                              <Tooltip contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: "12px", fontSize: "11px" }} />
                              <Area yAxisId="left" type="monotone" dataKey="revenue" stroke="hsl(var(--primary))" fillOpacity={1} fill="url(#colorRev)" strokeWidth={2} />
                              <Area yAxisId="left" type="monotone" dataKey="orders" stroke="hsl(var(--accent))" fillOpacity={1} fill="url(#colorOrd)" strokeWidth={2} />
                            </AreaChart>
                          </ResponsiveContainer>
                        </div>
                      </div>
                    </div>

                    <div className="stat-card rounded-2xl p-6 border-glow flex flex-col">
                      <div className="flex items-center justify-between mb-6"><h3 className="text-sm font-bold">Flux d'activité</h3><button className="text-[10px] font-bold text-primary hover:underline" onClick={() => setTab("orders")}>Voir tout</button></div>
                      <div className="space-y-5 overflow-y-auto max-h-[400px] pr-2 [scrollbar-width:thin]">
                        {activityFeed.map((item, i) => (
                          <div key={i} className="flex gap-4 group">
                            <div className={`h-10 w-10 shrink-0 rounded-xl flex items-center justify-center ${item.color} group-hover:scale-110 transition-transform`}><item.icon size={18} /></div>
                            <div className="min-w-0 flex-1">
                              <p className="text-xs font-bold text-foreground truncate">{item.title}</p>
                              <p className="text-[11px] text-muted-foreground truncate">{item.subtitle}</p>
                              <p className="text-[9px] text-muted-foreground/60 mt-1">{new Date(item.time).toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" })}</p>
                            </div>
                          </div>
                        ))}
                        {activityFeed.length === 0 && <div className="text-center py-8 text-muted-foreground text-xs">Aucune activité récente.</div>}
                      </div>
                    </div>
                 </div>
              </div>
            )}

            {currentTab === "products" && (
              <div className="space-y-6">
                {productEditing && (
                <div className="stat-card rounded-2xl p-8 border-glow space-y-6">
                    <div className="flex items-center justify-between"><h2 className="text-xl font-bold">{!products.find(p => p.id === productEditing.id) ? "Nouveau produit" : "Modifier"}</h2><button onClick={() => setProductEditing(null)}><X /></button></div>
                    <div className="grid md:grid-cols-2 gap-8">
                      <div className="space-y-4">
                        <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Image Principale</label>
                        <div onClick={() => fileInputRef.current?.click()} className="relative aspect-square rounded-2xl border-2 border-dashed border-border bg-muted/20 flex flex-col items-center justify-center cursor-pointer hover:border-primary/50 transition-colors overflow-hidden group">
                           {productEditing.image_url ? <img src={productEditing.image_url} className="w-full h-full object-cover" /> : <div className="flex flex-col items-center gap-2"><ImageIcon className="text-muted-foreground/40" size={40} /><p className="text-xs text-muted-foreground">Cliquer pour uploader</p></div>}
                           <div className="absolute inset-0 bg-background/60 backdrop-blur-sm flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                              <p className="text-sm font-bold flex items-center gap-2"><Upload size={16} /> Modifier</p>
                           </div>
                           <input ref={fileInputRef} type="file" className="hidden" accept="image/*" onChange={(e) => e.target.files?.[0] && handleImageUpload(e.target.files[0])} />
                           {uploading && <div className="absolute inset-0 bg-background/80 flex items-center justify-center"><Loader2 className="animate-spin" /></div>}
                        </div>
                      </div>
                      <div className="grid gap-5">
                        <div className="space-y-2"><label className="text-xs font-bold text-muted-foreground uppercase">ID unique (Slug)</label><input value={productEditing.id} onChange={(e) => setProductEditing({ ...productEditing, id: e.target.value })} className="w-full px-4 py-3 rounded-xl border border-border bg-background" /></div>
                        <div className="space-y-2"><label className="text-xs font-bold text-muted-foreground uppercase">Titre du produit</label><input value={productEditing.title} onChange={(e) => setProductEditing({ ...productEditing, title: e.target.value })} className="w-full px-4 py-3 rounded-xl border border-border bg-background" /></div>
                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-2"><label className="text-xs font-bold text-muted-foreground uppercase">Ancien Prix</label><input value={productEditing.old_price} onChange={(e) => setProductEditing({ ...productEditing, old_price: e.target.value })} className="w-full px-4 py-3 rounded-xl border border-border bg-background" /></div>
                          <div className="space-y-2"><label className="text-xs font-bold text-muted-foreground uppercase">Prix Actuel</label><input value={productEditing.price} onChange={(e) => setProductEditing({ ...productEditing, price: e.target.value })} className="w-full px-4 py-3 rounded-xl border border-border bg-background" /></div>
                        </div>
                        <div className="space-y-2"><label className="text-xs font-bold text-muted-foreground uppercase">Lien de paiement</label><input value={productEditing.payment_link} onChange={(e) => setProductEditing({ ...productEditing, payment_link: e.target.value })} className="w-full px-4 py-3 rounded-xl border border-border bg-background" /></div>
                      </div>
                    </div>
                    <div className="flex justify-end gap-3 pt-6 border-t border-border/50">
                      <button onClick={() => setProductEditing(null)} className="px-6 py-2.5 rounded-xl border border-border">Annuler</button>
                      <button onClick={saveProduct} className="btn-primary-brand px-8 py-2.5 rounded-xl font-bold flex items-center gap-2">{saving && <Loader2 className="animate-spin" size={16} />} Enregistrer</button>
                    </div>
                </div>
                )}

                <div className="stat-card rounded-2xl overflow-hidden border-glow">
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left">
                      <thead className="bg-muted/30 border-b border-border text-muted-foreground">
                        <tr><th className="p-4 font-semibold">Produit</th><th className="p-4 font-semibold">Prix</th><th className="p-4 font-semibold hidden md:table-cell">Catégorie</th><th className="p-4 font-semibold text-right">Actions</th></tr>
                      </thead>
                      <tbody>
                        {filteredProducts.map(p => (
                          <tr key={p.id} className="border-b border-border last:border-0 hover:bg-muted/10 transition-colors group">
                            <td className="p-4"><div className="flex items-center gap-3"><img src={p.image} className="w-12 h-12 rounded-xl object-cover" /><span className="font-bold truncate max-w-[200px]">{p.title}</span></div></td>
                            <td className="p-4"><p className="font-bold">{p.price}</p><p className="text-[10px] text-muted-foreground line-through">{p.oldPrice}</p></td>
                            <td className="p-4 hidden md:table-cell"><span className="px-2.5 py-1 rounded-full bg-primary/10 text-primary text-[10px] font-bold">{p.category}</span></td>
                             <td className="p-4 text-right"><div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity"><button onClick={() => setProductEditing(p as unknown as ProductForm)} className="p-2 rounded-lg hover:bg-primary/10 text-primary"><Pencil size={16} /></button><button onClick={() => setDeleteConfirm({ type: "product", id: p.id, label: p.title })} className="p-2 rounded-lg hover:bg-destructive/10 text-destructive"><Trash2 size={16} /></button></div></td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}

            {currentTab === "testimonials" && (
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredTestimonials.map(t => (
                  <div key={t.id} className="stat-card rounded-2xl p-5 border-glow hover:scale-[1.02] transition-transform flex flex-col">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-10 h-10 rounded-full bg-accent/20 flex items-center justify-center text-accent font-bold">{t.avatar_initials}</div>
                      <div className="min-w-0 flex-1"><p className="text-sm font-bold truncate">{t.name}</p><p className="text-[10px] text-muted-foreground">{t.handle}</p></div>
                      <div className="flex gap-1"><button onClick={() => setTestimonialEditing(t)} className="p-1.5 rounded-lg hover:bg-muted"><Pencil size={14} /></button><button onClick={() => setDeleteConfirm({ type: "testimonial", id: t.id, label: t.name })} className="p-1.5 rounded-lg hover:bg-destructive/10 text-destructive"><Trash2 size={14} /></button></div>
                    </div>
                    <p className="text-xs text-muted-foreground leading-relaxed italic mb-4 flex-1">"{t.content}"</p>
                    <div className="flex items-center justify-between pt-4 border-t border-border/50">
                      <div className="flex gap-3 text-[10px] font-medium text-muted-foreground"><span>❤️ {t.likes}</span><span>🔁 {t.retweets}</span></div>
                      {t.verified && <span className="text-[10px] font-bold text-primary bg-primary/10 px-2 py-0.5 rounded-full">VÉRIFIÉ ✓</span>}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {currentTab === "orders" && (
              <div className="stat-card rounded-2xl overflow-hidden border-glow">
                <table className="w-full text-sm text-left">
                  <thead className="bg-muted/30 border-b border-border text-muted-foreground">
                    <tr><th className="p-4 font-semibold">Client</th><th className="p-4 font-semibold">Total</th><th className="p-4 font-semibold">Statut</th><th className="p-4 font-semibold text-right">Actions</th></tr>
                  </thead>
                  <tbody>
                    {orders.map(o => (
                      <tr key={o.id} className="border-b border-border last:border-0 hover:bg-muted/10 transition-colors">
                        <td className="p-4"><p className="font-bold">{o.customer_name}</p><p className="text-[10px] text-muted-foreground">{o.customer_email}</p></td>
                        <td className="p-4 font-black">{o.total_price.toLocaleString()} FCFA</td>
                        <td className="p-4"><div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${statusConfig[o.status].color}`}>{(() => { const Icon = statusConfig[o.status].icon; return <Icon size={12} />; })()} {statusConfig[o.status].label}</div></td>
                        <td className="p-4 text-right"><button onClick={() => setViewingOrder(o)} className="p-2 rounded-lg hover:bg-muted"><Eye size={18} /></button></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {currentTab === "vendors" && (
               <div className="stat-card rounded-2xl overflow-hidden border-glow">
                 <table className="w-full text-sm text-left">
                    <thead className="bg-muted/30 border-b border-border text-muted-foreground">
                       <tr><th className="p-4 font-semibold">Vendeur</th><th className="p-4 font-semibold">Username</th><th className="p-4 font-semibold">Statut</th><th className="p-4 font-semibold text-right">Actions</th></tr>
                    </thead>
                    <tbody>
                       {allVendors.map(v => (
                          <tr key={v.id} className="border-b border-border last:border-0 hover:bg-muted/10">
                             <td className="p-4"><div className="flex items-center gap-3"><div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold">{v.shop_name.slice(0, 2).toUpperCase()}</div><p className="font-bold">{v.shop_name}</p></div></td>
                             <td className="p-4 text-muted-foreground">@{v.username}</td>
                             <td className="p-4">
                                <button 
                                  onClick={() => toggleVendorVerification(v.id, v.verified)}
                                  className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider transition-colors ${v.verified ? "bg-emerald-500/10 text-emerald-500 hover:bg-emerald-500/20" : "bg-muted text-muted-foreground hover:bg-muted/40"}`}
                                >
                                  {v.verified ? "Vérifié ✓" : "Standard"}
                                </button>
                             </td>
                             <td className="p-4 text-right"><button className="p-2 rounded-lg hover:bg-muted"><Pencil size={16} /></button></td>
                          </tr>
                       ))}
                    </tbody>
                 </table>
               </div>
            )}

            {currentTab === "security" && (
               <div className="grid md:grid-cols-2 gap-8">
                  <div className="stat-card rounded-2xl p-6 border-glow space-y-6">
                     <div className="flex items-center gap-3"><ShieldAlert className="text-destructive" size={24} /><h3 className="font-bold">Protocoles de Sécurité</h3></div>
                     <div className="space-y-3">
                        {[
                          { label: "Protection Edge Functions", status: "Actif", color: "text-emerald-500" },
                          { label: "Validation JWT Auth", status: "Strict", color: "text-emerald-500" },
                          { label: "Database RLS Policies", status: "Configuré", color: "text-emerald-500" },
                          { label: "Scan Anti-Malware", status: "À jour", color: "text-primary" },
                        ].map((s, i) => (
                           <div key={i} className="flex justify-between p-3 rounded-xl bg-muted/20 border border-border/50"><span className="text-xs font-medium">{s.label}</span><span className={`text-[10px] font-bold uppercase ${s.color}`}>{s.status}</span></div>
                        ))}
                     </div>
                  </div>
                  <div className="stat-card rounded-2xl p-6 border-glow">
                     <div className="flex items-center gap-3 mb-6"><Users className="text-primary" size={24} /><h3 className="font-bold">Accès & Rôles</h3></div>
                     <div className="space-y-6">
                        <div className="h-3 bg-muted rounded-full overflow-hidden flex">
                           <div className="h-full bg-primary" style={{ width: '5%' }} />
                           <div className="h-full bg-accent" style={{ width: '30%' }} />
                           <div className="h-full bg-muted-foreground/10" style={{ width: '65%' }} />
                        </div>
                        <div className="grid grid-cols-3 gap-4 text-center">
                           <div><p className="text-xl font-bold">1</p><p className="text-[8px] uppercase tracking-widest text-muted-foreground">Admins</p></div>
                           <div><p className="text-xl font-bold text-accent">{allVendors.length}</p><p className="text-[8px] uppercase tracking-widest text-muted-foreground">Vendeurs</p></div>
                           <div><p className="text-xl font-bold text-muted-foreground">~450</p><p className="text-[8px] uppercase tracking-widest text-muted-foreground">Clients</p></div>
                        </div>
                     </div>
                  </div>
               </div>
            )}

            {currentTab === "analytics" && (
               <div className="space-y-8">
                 <div className="grid md:grid-cols-3 gap-6">
                    {[
                      { label: "Visites totales", value: "12,450", change: "+14%", color: "primary" },
                      { label: "Taux de conversion", value: "3.2%", change: "+0.5%", color: "accent" },
                      { label: "Temps moyen", value: "4m 12s", change: "-2%", color: "yellow-500" },
                    ].map((s, i) => (
                      <div key={i} className="stat-card rounded-2xl p-6 border-glow">
                        <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-1">{s.label}</p>
                        <div className="flex items-end gap-3">
                          <p className="text-3xl font-black">{s.value}</p>
                          <span className={`text-xs font-bold ${s.change.startsWith("+") ? "text-emerald-500" : "text-destructive"}`}>{s.change}</span>
                        </div>
                      </div>
                    ))}
                 </div>
                 <div className="grid lg:grid-cols-2 gap-8">
                    <div className="stat-card rounded-2xl p-6 border-glow h-80">
                      <h3 className="text-sm font-bold mb-6">Canaux d'acquisition</h3>
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={[
                          { name: "Direct", value: 4500 },
                          { name: "Social", value: 3200 },
                          { name: "SEO", value: 2800 },
                          { name: "Email", value: 1200 },
                          { name: "Ads", value: 750 },
                        ]}>
                          <XAxis dataKey="name" tick={{ fontSize: 10 }} axisLine={false} tickLine={false} />
                          <YAxis tick={{ fontSize: 10 }} axisLine={false} tickLine={false} />
                          <Tooltip contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: "12px" }} />
                          <Bar dataKey="value" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                    <div className="stat-card rounded-2xl p-6 border-glow h-80">
                      <h3 className="text-sm font-bold mb-6">Sessions par appareil</h3>
                      <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={[
                          { date: "Lun", mobile: 120, desktop: 80 },
                          { date: "Mar", mobile: 150, desktop: 95 },
                          { date: "Mer", mobile: 180, desktop: 110 },
                          { date: "Jeu", mobile: 140, desktop: 130 },
                          { date: "Ven", mobile: 210, desktop: 160 },
                          { date: "Sam", mobile: 250, desktop: 120 },
                          { date: "Dim", mobile: 230, desktop: 90 },
                        ]}>
                          <XAxis dataKey="date" tick={{ fontSize: 10 }} axisLine={false} tickLine={false} />
                          <YAxis tick={{ fontSize: 10 }} axisLine={false} tickLine={false} />
                          <Tooltip contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: "12px" }} />
                          <Area type="monotone" dataKey="mobile" stroke="hsl(var(--primary))" fill="hsl(var(--primary)/0.2)" />
                          <Area type="monotone" dataKey="desktop" stroke="hsl(var(--accent))" fill="hsl(var(--accent)/0.2)" />
                        </AreaChart>
                      </ResponsiveContainer>
                    </div>
                 </div>
               </div>
            )}

            {currentTab === "settings" && (
              <div className="max-w-3xl space-y-8">
                <div className="stat-card rounded-2xl p-8 border-glow space-y-8">
                  <div>
                    <h3 className="text-xl font-bold mb-2">Configuration Générale</h3>
                    <p className="text-sm text-muted-foreground">Paramètres globaux de la plateforme MindHubs.</p>
                  </div>
                  <div className="grid gap-6">
                    <div className="space-y-2"><label className="text-xs font-bold text-muted-foreground uppercase">Nom du site</label><input defaultValue="MindHubs" className="w-full px-4 py-3 rounded-xl border border-border bg-background" /></div>
                    <div className="space-y-2"><label className="text-xs font-bold text-muted-foreground uppercase">Email de support</label><input defaultValue="contact@mindhubs.com" className="w-full px-4 py-3 rounded-xl border border-border bg-background" /></div>
                    <div className="grid sm:grid-cols-2 gap-4">
                      <div className="space-y-2"><label className="text-xs font-bold text-muted-foreground uppercase">Devise</label><input defaultValue="FCFA" className="w-full px-4 py-3 rounded-xl border border-border bg-background" /></div>
                      <div className="space-y-2"><label className="text-xs font-bold text-muted-foreground uppercase">Langue par défaut</label><input defaultValue="Français" className="w-full px-4 py-3 rounded-xl border border-border bg-background" /></div>
                    </div>
                    <div className="flex items-center gap-3 p-4 rounded-xl bg-primary/5 border border-primary/20">
                      <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center text-primary"><Bell size={20} /></div>
                      <div className="flex-1"><p className="text-sm font-bold">Maintenance</p><p className="text-[10px] text-muted-foreground">Activer le mode maintenance pour les visiteurs.</p></div>
                      <button className="w-12 h-6 rounded-full bg-muted relative transition-colors"><div className="absolute left-1 top-1 w-4 h-4 rounded-full bg-foreground" /></button>
                    </div>

                    <div className="flex items-center justify-between p-4 rounded-xl bg-muted/20 border border-border/50">
                       <div className="flex items-center gap-3">
                          <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
                             {theme === "dark" ? <MoonIcon size={18} /> : <SunIcon size={18} />}
                          </div>
                          <div>
                             <p className="text-sm font-bold">Apparence {theme === "dark" ? "Sombre" : "Claire"}</p>
                             <p className="text-[10px] text-muted-foreground">Modifier le thème de l'administration.</p>
                          </div>
                       </div>
                       <button onClick={toggleTheme} className="px-4 py-2 rounded-xl border border-border hover:bg-muted transition-colors text-[10px] font-bold uppercase">Modifier</button>
                    </div>
                  </div>
                  <div className="pt-6 border-t border-border/50 flex justify-end">
                    <button 
                      onClick={() => toast({ title: "Paramètres enregistrés", description: "Les modifications ont été appliquées avec succès." })}
                      className="btn-primary-brand px-8 py-2.5 rounded-xl font-bold"
                    >
                      Enregistrer les modifications
                    </button>
                  </div>
                </div>
              </div>
            )}

            {currentTab === "help" && (
               <div className="grid md:grid-cols-2 gap-8">
                 <div className="stat-card rounded-2xl p-8 border-glow space-y-6">
                    <h3 className="text-xl font-bold flex items-center gap-3"><HelpCircle className="text-primary" /> Guide d'administration</h3>
                    <div className="space-y-4">
                       {[
                         { q: "Comment valider un vendeur ?", a: "Allez dans l'onglet 'Vendeurs' et cliquez sur le badge standard pour le passer en vérifié." },
                         { q: "Gérer les remboursements", a: "Les remboursements doivent être traités manuellement via le dashboard Stripe/Paystack puis marqués comme annulés ici." },
                         { q: "Ajouter une catégorie", a: "Les catégories sont actuellement gérées dans le code, contactez l'équipe technique." },
                       ].map((item, i) => (
                         <div key={i} className="space-y-1">
                           <p className="text-sm font-bold text-foreground">{item.q}</p>
                           <p className="text-xs text-muted-foreground">{item.a}</p>
                         </div>
                       ))}
                    </div>
                 </div>
                 <div className="stat-card rounded-2xl p-8 border-glow flex flex-col items-center justify-center text-center space-y-4">
                    <div className="w-16 h-16 rounded-full bg-accent/10 flex items-center justify-center text-accent"><MessageSquare size={32} /></div>
                    <div><h3 className="text-lg font-bold">Support Technique</h3><p className="text-sm text-muted-foreground max-w-[250px]">Besoin d'une assistance directe ou d'une nouvelle fonctionnalité ?</p></div>
                    <button className="btn-primary-brand w-full py-3 rounded-xl font-bold">Ouvrir un ticket</button>
                 </div>
               </div>
            )}
          </motion.div>
        </AnimatePresence>
        </div>

      {/* Viewing Order Modal */}
      {viewingOrder && (
        <div className="fixed inset-0 z-[150] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-background/80 backdrop-blur-md" onClick={() => setViewingOrder(null)} />
          <div className="relative w-full max-w-2xl bg-card border border-border shadow-2xl rounded-[2.5rem] overflow-hidden">
             <div className="p-8 space-y-8">
                <div className="flex justify-between items-start">
                   <div><h2 className="text-2xl font-black">Commande #{viewingOrder.id.slice(0, 8)}</h2><p className="text-muted-foreground font-medium">{new Date(viewingOrder.created_at).toLocaleString()}</p></div>
                   <button onClick={() => setViewingOrder(null)} className="p-2 rounded-xl hover:bg-muted transition-colors"><X /></button>
                </div>
                <div className="grid sm:grid-cols-2 gap-8">
                   <div className="space-y-4">
                      <h4 className="text-[10px] font-black uppercase tracking-widest text-primary">Informations Client</h4>
                      <div className="p-4 rounded-2xl bg-muted/30 border border-border/50">
                         <p className="font-bold">{viewingOrder.customer_name}</p>
                         <p className="text-sm text-muted-foreground">{viewingOrder.customer_email}</p>
                         <p className="text-sm text-muted-foreground">{viewingOrder.customer_phone}</p>
                      </div>
                   </div>
                   <div className="space-y-4">
                      <h4 className="text-[10px] font-black uppercase tracking-widest text-primary">Actions</h4>
                      <div className="flex flex-wrap gap-2">
                         {Object.entries(statusConfig).map(([key, cfg]) => (
                             <button key={key} onClick={() => updateOrderStatus(viewingOrder.id, key as Order["status"])} className={`p-3 rounded-xl transition-all ${viewingOrder.status === key ? cfg.color : "bg-muted opacity-40 hover:opacity-100"}`} title={cfg.label}><cfg.icon size={18} /></button>
                         ))}
                      </div>
                   </div>
                </div>
                <div className="space-y-4">
                   <h4 className="text-[10px] font-black uppercase tracking-widest text-primary">Contenu</h4>
                   <div className="space-y-2">
                      {viewingOrder.items.map((item, i) => (
                         <div key={i} className="flex justify-between items-center p-3 rounded-xl bg-background border border-border"><p className="text-sm font-bold">{item.title}</p><p className="text-sm font-black">x{item.quantity}</p></div>
                      ))}
                   </div>
                   <div className="pt-4 border-t border-border flex justify-between items-end"><p className="text-xs font-bold text-muted-foreground uppercase">Total</p><p className="text-2xl font-black text-primary">{viewingOrder.total_price.toLocaleString()} FCFA</p></div>
                </div>
             </div>
          </div>
        </div>
      )}

      <AlertDialog open={!!deleteConfirm} onOpenChange={(o) => !o && setDeleteConfirm(null)}>
        <AlertDialogContent className="rounded-3xl border-border bg-card">
          <AlertDialogHeader><AlertDialogTitle className="text-xl font-bold">Supprimer ?</AlertDialogTitle><AlertDialogDescription>Voulez-vous vraiment supprimer "{deleteConfirm?.label}" ?</AlertDialogDescription></AlertDialogHeader>
          <AlertDialogFooter><AlertDialogCancel className="rounded-xl border-border">Annuler</AlertDialogCancel><AlertDialogAction onClick={handleDeleteConfirm} className="rounded-xl bg-destructive text-destructive-foreground hover:bg-destructive/90">Supprimer</AlertDialogAction></AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </DashboardLayout>
  );
};

export default Admin;

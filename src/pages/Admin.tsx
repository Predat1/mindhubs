import { useState, useMemo, useRef, useEffect } from "react";
import { 
  Package, MessageSquare, ShoppingBag, Plus, Pencil, Trash2, Save, X, Eye, 
  ExternalLink, Clock, CheckCircle2, XCircle, 
  Link2, ImageIcon, Upload, Loader2, DollarSign, Users,
  ShieldAlert, Bell, HelpCircle, Sparkles, Edit, Globe, Activity,
  Download, Database, Server, Key, Play, History, Filter, UserCog, Settings as SettingsIcon,
  Store, Zap, Search, CreditCard
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";
import { toast } from "sonner";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import SEO from "@/components/SEO";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { AreaChart, Area, XAxis, Tooltip, ResponsiveContainer } from "recharts";
import { motion, AnimatePresence } from "framer-motion";
import { useLocation, useNavigate, Link } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { RichDescriptionEditor } from "@/components/products/RichDescriptionEditor";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { formatCurrency } from "@/lib/currency";

// ─── NEW COMPONENTS ───
import AdminSubscriptionsTab from "@/components/admin/AdminSubscriptionsTab";
import AdminAnalyticsTab from "@/components/admin/AdminAnalyticsTab";
import AdminSettingsTab from "@/components/admin/AdminSettingsTab";
import AdminVendorsTab from "@/components/admin/AdminVendorsTab";
import AdminProductsTab from "@/components/admin/AdminProductsTab";

// ─── Types ───
type Tab = "overview" | "products" | "testimonials" | "orders" | "vendors" | 
           "subscriptions" | "security" | "analytics" | "settings" | "help" | 
           "api-manager" | "logs" | "users";

interface ProductForm {
  id: string; title: string; image_url: string; old_price: string; price: string;
  category: string; rating: string; tag: string; description: string;
  payment_link: string; image_urls: string[]; key_features: string[];
  sort_order: number; featured: boolean;
}

const DEFAULT_PRODUCT: ProductForm = {
  id: "", title: "", image_url: "", old_price: "", price: "",
  category: "Business", rating: "4.5", tag: "", description: "",
  payment_link: "", image_urls: [], key_features: [], sort_order: 0,
  featured: false,
};

interface Order {
  id: string; customer_name: string; customer_email: string; customer_phone: string;
  total_price: number; status: "pending" | "completed" | "cancelled" | "shipped" | "confirmed" | "delivered";
  payment_method: string; items: any[]; created_at: string;
}

interface ApiConfig {
  id?: string; name: string; base_url: string; method: string;
  auth_type: "none" | "Bearer" | "Key"; auth_token?: string;
  headers?: any; test_endpoint?: string; is_active: boolean; created_at?: string;
}

const statusConfig = {
  pending: { label: "En attente", color: "bg-yellow-500/10 text-yellow-600 border-yellow-500/20", icon: Clock },
  completed: { label: "Terminé", color: "bg-emerald-500/10 text-emerald-600 border-emerald-500/20", icon: CheckCircle2 },
  shipped: { label: "Expédié", color: "bg-primary/10 text-primary border-primary/20", icon: ExternalLink },
  cancelled: { label: "Annulé", color: "bg-destructive/10 text-destructive border-destructive/20", icon: XCircle },
};

const Admin = () => {
  const { user } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const searchParams = new URLSearchParams(location.search);
  const currentTab = (searchParams.get("tab") as Tab) || "overview";

  const [productEditing, setProductEditing] = useState<ProductForm | null>(null);
  const [viewingOrder, setViewingOrder] = useState<Order | null>(null);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [updatingStatus, setUpdatingStatus] = useState<string | null>(null);
  const [productSearch, setProductSearch] = useState("");
  const [deleteConfirm, setDeleteConfirm] = useState<{ type: "product" | "testimonial" | "api"; id: string; label: string } | null>(null);
  const [apiConfigs, setApiConfigs] = useState<ApiConfig[]>([]);
  const [editingApi, setEditingApi] = useState<ApiConfig | null>(null);
  const [testResult, setTestResult] = useState<any | null>(null);
  const [testingApi, setTestingApi] = useState(false);
  const [auditLogs, setAuditLogs] = useState<any[]>([]);
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  const setTab = (newTab: Tab) => navigate(`/admin?tab=${newTab}`);

  // ─── Shared Logic ───
  const logAction = async (action: string, details: string) => {
    try {
      const log = { action, details, user_id: user?.id, created_at: new Date().toISOString() };
      await (supabase as any).from('audit_logs').insert([log]);
      setAuditLogs((prev: any) => [log, ...prev]);
    } catch (err) {
      console.warn("Could not log action:", err);
    }
  };

  // ─── Queries ───
  const { data: products = [], isLoading: productsLoading, refetch: refetchProducts } = useQuery({
    queryKey: ["admin-products"],
    queryFn: async () => {
      const { data, error } = await supabase.from("products").select("*").order("sort_order", { ascending: true });
      if (error) throw error;
      return (data || []).map(db => ({ ...db, image: db.image_url || "" }));
    },
  });

  const { data: orders = [], isLoading: ordersLoading, refetch: refetchOrders } = useQuery({
    queryKey: ["admin-orders"],
    queryFn: async () => {
      const { data, error } = await supabase.from("orders").select("*").order("created_at", { ascending: false });
      if (error) throw error;
      return data || [];
    },
  });

  const { data: allVendors = [] } = useQuery({
    queryKey: ["admin-vendors-basic"],
    queryFn: async () => {
      const { data, error } = await supabase.from("vendors").select("*");
      if (error) throw error;
      return data || [];
    },
  });

  // ─── Universal API Manager Logic ───
  useEffect(() => {
    const fetchAdminData = async () => {
      try {
        const sb = supabase as any;
        const [apiRes, logsRes] = await Promise.all([
          sb.from('api_configs').select('*'),
          sb.from('audit_logs').select('*').order('created_at', { ascending: false }).limit(50)
        ]);
        if (!apiRes.error) setApiConfigs(apiRes.data || []);
        if (!logsRes.error) setAuditLogs(logsRes.data || []);
      } catch (err) {
        console.error("Failed to fetch admin data:", err);
      }
    };
    fetchAdminData();
  }, [currentTab]);

  const handleSaveApi = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingApi) return;
    setSaving(true);
    const isNew = !editingApi.id;
    try {
      const sb = supabase as any;
      const { data, error } = isNew 
        ? await sb.from('api_configs').insert([editingApi]).select()
        : await sb.from('api_configs').update(editingApi).eq('id', editingApi.id).select();
      
      if (error) throw error;
      toast.success("API configurée.");
      setEditingApi(null);
      if (data) {
        setApiConfigs((prev: any) => isNew ? [...prev, data[0]] : prev.map((c: any) => c.id === editingApi.id ? data[0] : c));
      }
      logAction("API_UPDATE", `API ${editingApi.name} mise à jour`);
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setSaving(false);
    }
  };

  const handleTestApi = async (config: ApiConfig) => {
    setTestingApi(true);
    setTestResult(null);
    try {
      const start = Date.now();
      const res = await fetch(config.base_url + (config.test_endpoint || ""), {
        method: config.method,
        headers: {
          'Content-Type': 'application/json',
          ...(config.headers || {}),
          ...(config.auth_type === 'Bearer' ? { 'Authorization': `Bearer ${config.auth_token}` } : {})
        }
      });
      const data = await res.json();
      setTestResult({ status: res.status, time: Date.now() - start, data });
    } catch (err: any) {
      setTestResult({ status: 'Error', time: 0, data: err.message });
    } finally {
      setTestingApi(false);
    }
  };

  // ─── Products Handlers ───
  const saveProduct = async () => {
    if (!productEditing) return;
    setSaving(true);
    const isNew = !products.find((p: any) => p.id === productEditing.id);
    const productData = { ...productEditing, rating: parseFloat(productEditing.rating) || 5, sort_order: parseInt(productEditing.sort_order.toString()) || 0 };
    try {
      const { error } = isNew ? await supabase.from("products").insert([productData]) : await supabase.from("products").update(productData).eq("id", productEditing.id);
      if (error) throw error;
      toast.success(isNew ? "Produit ajouté" : "Produit mis à jour");
      setProductEditing(null);
      refetchProducts();
      logAction(isNew ? "PRODUCT_ADD" : "PRODUCT_UPDATE", `Produit ${productEditing.title}`);
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setSaving(false);
    }
  };

  const updateOrderStatus = async (orderId: string, status: Order["status"]) => {
    setUpdatingStatus(orderId);
    const { error } = await (supabase as any).from("orders").update({ status }).eq("id", orderId);
    setUpdatingStatus(null);
    if (error) { toast.error(error.message); return; }
    toast.success("Statut mis à jour");
    refetchOrders();
    logAction("ORDER_STATUS", `Commande ${orderId} -> ${status}`);
  };

  const handleDeleteConfirm = async () => {
    if (!deleteConfirm) return;
    setDeleting(deleteConfirm.id);
    const table = deleteConfirm.type === "product" ? "products" : deleteConfirm.type === "api" ? "api_configs" : "testimonials";
    const { error } = await (supabase as any).from(table).delete().eq("id", deleteConfirm.id);
    setDeleting(null);
    setDeleteConfirm(null);
    if (error) { toast.error(error.message); return; }
    toast.success("Supprimé");
    if (deleteConfirm.type === "product") refetchProducts();
    else if (deleteConfirm.type === "api") setApiConfigs(prev => prev.filter(a => a.id !== deleteConfirm.id));
    logAction("DELETE", `Suppression ${deleteConfirm.type} : ${deleteConfirm.label}`);
  };

  const handleImageUpload = async (file: File) => {
    if (!productEditing) return;
    setUploading(true);
    const fileName = `${Date.now()}-${Math.random().toString(36).slice(2)}.${file.name.split('.').pop()}`;
    const { error } = await supabase.storage.from("product-images").upload(fileName, file);
    if (error) { toast.error(error.message); setUploading(false); return; }
    const { data: urlData } = supabase.storage.from("product-images").getPublicUrl(fileName);
    setProductEditing({ ...productEditing, image_url: urlData.publicUrl });
    setUploading(false);
  };

  // ─── Render Helpers ───
  const revenueTotal = useMemo(() => 
    (orders || []).reduce((s, o) => s + (o && o.status !== 'cancelled' ? (o.total_price || 0) : 0), 0)
  , [orders]);

  // ─── Render ───
  return (
    <DashboardLayout variant="admin">
      <SEO title="Administration Elite | MindHubs" description="Contrôle total sur l'écosystème MindHubs." />
      
      <div className="max-w-[1600px] mx-auto space-y-8 pb-20">
        <AnimatePresence mode="wait">
          <motion.div key={currentTab} initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -10 }} className="space-y-8">
            
            {/* ─── TAB: OVERVIEW (MODERNIZED WITH REAL DATA) ─── */}
            {currentTab === "overview" && (
              <div className="space-y-8">
                <div className="grid lg:grid-cols-3 gap-8">
                  <div className="lg:col-span-2 space-y-6">
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                      {[
                        { label: "Ventes Total", value: (orders || []).length, icon: ShoppingBag, color: "primary" },
                        { label: "Revenu Marketplace", value: formatCurrency(revenueTotal), icon: DollarSign, color: "accent" },
                        { label: "Vendeurs", value: (allVendors || []).length, icon: Store, color: "primary" },
                        { label: "APIs IA", value: (apiConfigs || []).length, icon: Zap, color: "yellow-500" },
                      ].map((s, i) => (
                        <div key={i} className="stat-card rounded-2xl p-5 border-glow">
                          <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-primary/10 text-primary mb-3"><s.icon size={18} /></div>
                          <p className="text-xl font-black tracking-tighter">{s.value}</p>
                          <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">{s.label}</p>
                        </div>
                      ))}
                    </div>
                    
                    <div className="stat-card rounded-2xl p-6 border-glow h-80">
                       <h3 className="text-sm font-black uppercase mb-6">Activité Marketplace (Dernières transactions)</h3>
                       <ResponsiveContainer width="100%" height="100%">
                         <AreaChart data={orders.slice(0, 10).reverse().map(o => ({d: new Date(o.created_at).toLocaleDateString(), v: o.total_price}))}>
                           <defs>
                             <linearGradient id="colorV" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3}/><stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0}/></linearGradient>
                           </defs>
                           <XAxis dataKey="d" axisLine={false} tickLine={false} tick={{fontSize: 8}} />
                           <Tooltip />
                           <Area type="monotone" dataKey="v" stroke="hsl(var(--primary))" fill="url(#colorV)" strokeWidth={3} />
                         </AreaChart>
                       </ResponsiveContainer>
                    </div>
                  </div>

                  <div className="stat-card rounded-2xl p-6 border-glow flex flex-col h-full overflow-hidden">
                    <h3 className="text-sm font-black uppercase mb-6 flex items-center gap-2"><History size={16} /> Flux d'Audit</h3>
                    <div className="space-y-4 overflow-y-auto pr-2 [scrollbar-width:thin]">
                      {(auditLogs || []).map((log, i) => (
                        <div key={i} className="flex gap-3 border-l-2 border-primary/20 pl-3 py-1">
                          <div className="flex-1 min-w-0">
                            <p className="text-[10px] font-black uppercase text-primary truncate">{log?.action || "ACTION"}</p>
                            <p className="text-[11px] font-medium leading-tight line-clamp-2">{log?.details || "Aucun détail"}</p>
                            <p className="text-[9px] text-muted-foreground font-bold">{log?.created_at ? new Date(log.created_at).toLocaleTimeString() : ""}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* ─── TAB: SUBSCRIPTIONS (NEW) ─── */}
            {currentTab === "subscriptions" && <AdminSubscriptionsTab logAction={logAction} />}

            {/* ─── TAB: ANALYTICS (NEW) ─── */}
            {currentTab === "analytics" && <AdminAnalyticsTab />}

            {/* ─── TAB: SETTINGS (NEW) ─── */}
            {currentTab === "settings" && <AdminSettingsTab logAction={logAction} />}

            {/* ─── TAB: VENDORS (EXTENDED) ─── */}
            {currentTab === "vendors" && <AdminVendorsTab logAction={logAction} />}

            {/* ─── TAB: API MANAGER ─── */}
            {currentTab === "api-manager" && (
              <div className="space-y-8">
                <div className="flex items-center justify-between">
                   <div>
                     <h2 className="text-3xl font-black">Universal API Manager</h2>
                     <p className="text-xs text-muted-foreground font-black uppercase tracking-widest mt-1">Moteurs IA & Connecteurs</p>
                   </div>
                   <Button onClick={() => setEditingApi({ name: "", base_url: "", method: "GET", auth_type: "none", is_active: true })} className="rounded-2xl gap-2 font-black">
                     <Plus size={18} /> Nouvelle API
                   </Button>
                </div>

                {editingApi && (
                  <motion.form onSubmit={handleSaveApi} initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="stat-card rounded-3xl p-8 border-glow space-y-6">
                     <div className="grid md:grid-cols-2 gap-6">
                        <div className="space-y-2"><label className="text-[10px] font-black uppercase">Nom</label><Input value={editingApi.name} onChange={e => setEditingApi({...editingApi, name: e.target.value})} /></div>
                        <div className="space-y-2"><label className="text-[10px] font-black uppercase">Base URL</label><Input value={editingApi.base_url} onChange={e => setEditingApi({...editingApi, base_url: e.target.value})} /></div>
                        <div className="space-y-2">
                           <label className="text-[10px] font-black uppercase">Méthode</label>
                           <select value={editingApi.method} onChange={e => setEditingApi({...editingApi, method: e.target.value})} className="w-full h-10 rounded-xl bg-muted/20 border border-border px-3 font-bold text-sm">
                              {["GET", "POST", "PUT", "DELETE"].map(m => <option key={m} value={m}>{m}</option>)}
                           </select>
                        </div>
                     </div>
                     <div className="flex justify-end gap-3 pt-4 border-t border-border">
                        <Button type="button" variant="ghost" onClick={() => setEditingApi(null)}>Annuler</Button>
                        <Button type="submit" disabled={saving} className="rounded-xl font-black">{saving ? <Loader2 className="animate-spin" /> : <Save size={18} className="mr-2" />} Enregistrer</Button>
                     </div>
                  </motion.form>
                )}

                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {(apiConfigs || []).map(api => (
                    <div key={api.id} className="stat-card rounded-2xl p-6 border-glow flex flex-col group">
                       <div className="flex items-center justify-between mb-4">
                          <div className="flex items-center gap-3">
                             <div className="h-10 w-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center"><Server size={20} /></div>
                             <p className="font-black text-sm">{api.name}</p>
                          </div>
                          <div className="flex gap-1">
                             <button onClick={() => setEditingApi(api)} className="p-2 rounded-lg hover:bg-primary/10 text-primary"><Edit size={16} /></button>
                             <button onClick={() => setDeleteConfirm({ type: "api", id: api.id!, label: api.name })} className="p-2 rounded-lg hover:bg-destructive/10 text-destructive"><Trash2 size={16} /></button>
                          </div>
                       </div>
                       <div className="mt-auto pt-4 border-t border-border flex items-center justify-between">
                          <Badge className={api.is_active ? "bg-emerald-500/10 text-emerald-500" : "bg-muted"}>{api.is_active ? "ACTIF" : "INACTIF"}</Badge>
                          <Button size="sm" onClick={() => handleTestApi(api)} disabled={testingApi} className="rounded-xl h-8 text-[10px] font-black gap-2">
                             {testingApi ? <Loader2 size={12} className="animate-spin" /> : <Play size={12} fill="currentColor" />} Tester
                          </Button>
                       </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* ─── TAB: PRODUCTS (FULL CONTROL) ─── */}
            {currentTab === "products" && <AdminProductsTab logAction={logAction} />}

            {/* ─── TAB: ORDERS ─── */}
            {currentTab === "orders" && (
              <div className="space-y-6">
                <h2 className="text-3xl font-black">Commandes Globales</h2>
                <div className="stat-card rounded-2xl overflow-hidden border-glow">
                   <div className="overflow-x-auto">
                   <table className="w-full text-sm text-left">
                      <thead className="bg-muted/30 border-b border-border">
                         <tr><th className="p-4 font-black text-[10px] uppercase">Client</th><th className="p-4 font-black text-[10px] uppercase">Total</th><th className="p-4 font-black text-[10px] uppercase">Statut</th><th className="p-4 font-black text-[10px] uppercase text-right">Actions</th></tr>
                      </thead>
                      <tbody>
                         {orders.map((o:any) => (
                            <tr key={o.id} className="border-b border-border last:border-0 hover:bg-muted/5">
                               <td className="p-4"><p className="font-bold">{o.customer_name}</p><p className="text-[10px] text-muted-foreground">{o.customer_email}</p></td>
                               <td className="p-4 font-black">{formatCurrency(o.total_price)}</td>
                               <td className="p-4"><Badge className={statusConfig[o.status as keyof typeof statusConfig]?.color}>{o.status}</Badge></td>
                               <td className="p-4 text-right"><Button variant="ghost" size="sm" onClick={() => setViewingOrder(o)} className="rounded-xl"><Eye size={16} /></Button></td>
                            </tr>
                         ))}
                      </tbody>
                   </table>
                   </div>
                </div>
              </div>
            )}

            {/* ─── TAB: LOGS ─── */}
            {currentTab === "logs" && (
              <div className="space-y-6">
                <h2 className="text-3xl font-black">Audit Système</h2>
                <div className="stat-card rounded-2xl overflow-hidden border-glow">
                   <table className="w-full text-sm text-left">
                      <thead className="bg-muted/30 border-b border-border">
                         <tr><th className="p-4 font-black text-[10px] uppercase">Date</th><th className="p-4 font-black text-[10px] uppercase">Action</th><th className="p-4 font-black text-[10px] uppercase">Détails</th></tr>
                      </thead>
                      <tbody>
                         {auditLogs.map((log, i) => (
                            <tr key={i} className="border-b border-border last:border-0 hover:bg-muted/5">
                               <td className="p-4 text-[10px] font-mono">{new Date(log.created_at).toLocaleString()}</td>
                               <td className="p-4"><Badge className="bg-primary/10 text-primary font-black text-[9px] uppercase">{log.action}</Badge></td>
                               <td className="p-4 text-xs font-medium">{log.details}</td>
                            </tr>
                         ))}
                      </tbody>
                   </table>
                </div>
              </div>
            )}

            {/* ─── TAB: PLACEHOLDERS (SECURITY, HELP, USERS) ─── */}
            {(currentTab === "users" || currentTab === "security" || currentTab === "help") && (
               <div className="stat-card rounded-3xl p-20 flex flex-col items-center justify-center text-center space-y-6 border-glow">
                  <div className="h-20 w-20 rounded-full bg-primary/10 flex items-center justify-center text-primary"><Database size={40} /></div>
                  <div>
                     <h3 className="text-2xl font-black uppercase tracking-tighter">Module en cours de synchronisation</h3>
                     <p className="text-muted-foreground max-w-sm font-medium">L'accès à la section "{currentTab}" est en cours de validation par le système central.</p>
                  </div>
                  <Button onClick={() => setTab("overview")} className="rounded-xl font-black uppercase text-[10px] tracking-widest px-8">Retour Accueil</Button>
               </div>
            )}

          </motion.div>
        </AnimatePresence>
      </div>

      {/* ─── OVERLAYS ─── */}
      {viewingOrder && (
        <div className="fixed inset-0 z-[150] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-background/80 backdrop-blur-md" onClick={() => setViewingOrder(null)} />
          <div className="relative w-full max-w-2xl bg-card border border-border shadow-2xl rounded-[2.5rem] overflow-hidden animate-in zoom-in-95 duration-200">
             <div className="p-8 space-y-8">
                <div className="flex justify-between items-start border-b border-border pb-6">
                   <div><h2 className="text-2xl font-black">Commande #{viewingOrder.id.slice(0, 8)}</h2><p className="text-muted-foreground font-medium">{new Date(viewingOrder.created_at).toLocaleString()}</p></div>
                   <button onClick={() => setViewingOrder(null)} className="p-2 rounded-xl hover:bg-muted transition-colors"><X /></button>
                </div>
                <div className="grid sm:grid-cols-2 gap-8">
                   <div className="space-y-4">
                      <h4 className="text-[10px] font-black uppercase tracking-widest text-primary">Informations Client</h4>
                      <div className="p-4 rounded-2xl bg-muted/30 border border-border/50">
                         <p className="font-bold">{viewingOrder.customer_name}</p>
                         <p className="text-[11px] text-muted-foreground">{viewingOrder.customer_email}</p>
                      </div>
                   </div>
                   <div className="space-y-4">
                      <h4 className="text-[10px] font-black uppercase tracking-widest text-primary">Statut</h4>
                      <div className="flex flex-wrap gap-2">
                         {Object.entries(statusConfig).map(([key, cfg]) => (
                             <button key={key} onClick={() => updateOrderStatus(viewingOrder.id, key as Order["status"])} className={`p-3 rounded-xl transition-all ${viewingOrder.status === key ? cfg.color : "bg-muted opacity-40 hover:opacity-100"}`} title={cfg.label}><cfg.icon size={18} /></button>
                         ))}
                      </div>
                   </div>
                </div>
                <div className="pt-6 border-t border-border flex justify-between items-end">
                   <p className="text-3xl font-black text-primary">{viewingOrder.total_price.toLocaleString()} FCFA</p>
                </div>
             </div>
          </div>
        </div>
      )}

      <AlertDialog open={!!deleteConfirm} onOpenChange={(o) => !o && setDeleteConfirm(null)}>
        <AlertDialogContent className="rounded-3xl border-border bg-card">
          <AlertDialogHeader><AlertDialogTitle className="text-xl font-bold uppercase tracking-tighter">Confirmer la suppression</AlertDialogTitle><AlertDialogDescription>Cette action est irréversible. Êtes-vous sûr de vouloir supprimer "{deleteConfirm?.label}" ?</AlertDialogDescription></AlertDialogHeader>
          <AlertDialogFooter><AlertDialogCancel className="rounded-xl border-border">Annuler</AlertDialogCancel><AlertDialogAction onClick={handleDeleteConfirm} className="rounded-xl bg-destructive text-destructive-foreground hover:bg-destructive/90 font-bold uppercase text-[10px] tracking-widest">Oui, Supprimer</AlertDialogAction></AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </DashboardLayout>
  );
};

export default Admin;

import { useState, useMemo, useRef, useEffect } from "react";
import { 
  Package, MessageSquare, ShoppingBag, Plus, Pencil, Trash2, Save, X, Eye, 
  ExternalLink, Clock, CheckCircle2, XCircle, 
  Link2, ImageIcon, Upload, Loader2, DollarSign, Users,
  ShieldAlert, Bell, HelpCircle, Sparkles, Edit, Globe, Activity,
  Download, Database, Server, Key, Play, History, Filter, UserCog, Settings as SettingsIcon, Sun as SunIcon, Moon as MoonIcon
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";
import { toast } from "@/hooks/use-toast";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import SEO from "@/components/SEO";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Tooltip, AreaChart, Area } from "recharts";
import { motion, AnimatePresence } from "framer-motion";
import { useLocation, useNavigate } from "react-router-dom";
import { useTheme } from "@/contexts/ThemeContext";
import type { Vendor } from "@/hooks/useVendors";
import { useAuth } from "@/contexts/AuthContext";
import { RichDescriptionEditor } from "@/components/products/RichDescriptionEditor";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";

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
  category: "Business", rating: "4.5", tag: "", description: "",
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

type Tab = "overview" | "products" | "testimonials" | "orders" | "vendors" | "security" | "analytics" | "settings" | "help" | "api-manager" | "logs" | "users";

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

interface ApiConfig {
  id?: string;
  name: string;
  base_url: string;
  method: string;
  auth_type: "none" | "Bearer" | "Key";
  auth_token?: string;
  headers?: any;
  test_endpoint?: string;
  is_active: boolean;
  created_at?: string;
}

const statusConfig = {
  pending: { label: "En attente", color: "bg-yellow-500/10 text-yellow-600 border-yellow-500/20", icon: Clock },
  completed: { label: "Terminé", color: "bg-emerald-500/10 text-emerald-600 border-emerald-500/20", icon: CheckCircle2 },
  shipped: { label: "Expédié", color: "bg-primary/10 text-primary border-primary/20", icon: ExternalLink },
  cancelled: { label: "Annulé", color: "bg-destructive/10 text-destructive border-destructive/20", icon: XCircle },
};

const Admin = () => {
  const { user } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const currentTab = (searchParams.get("tab") as Tab) || "overview";

  const [productEditing, setProductEditing] = useState<ProductForm | null>(null);
  const [viewingOrder, setViewingOrder] = useState<Order | null>(null);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [updatingStatus, setUpdatingStatus] = useState<string | null>(null);
  const [productSearch, setProductSearch] = useState("");
  const [orderFilter, setOrderFilter] = useState<string>("all");
  const [deleteConfirm, setDeleteConfirm] = useState<{ type: "product" | "testimonial" | "api"; id: string; label: string } | null>(null);
  const [apiConfigs, setApiConfigs] = useState<ApiConfig[]>([]);
  const [editingApi, setEditingApi] = useState<ApiConfig | null>(null);
  const [testResult, setTestResult] = useState<any | null>(null);
  const [testingApi, setTestingApi] = useState(false);
  const [auditLogs, setAuditLogs] = useState<any[]>([]);
  const [isExporting, setIsExporting] = useState(false);
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();

  const setTab = (newTab: Tab) => navigate(`/admin?tab=${newTab}`);

  // ─── Queries ───
  const { data: products = [], isLoading: productsLoading, refetch: refetchProducts } = useQuery({
    queryKey: ["admin-products"],
    queryFn: async (): Promise<AdminProduct[]> => {
      const { data, error } = await supabase.from("products").select("*").order("sort_order", { ascending: true });
      if (error) throw error;
      return (data || []).map(db => ({
        ...db, id: db.id, title: db.title, image: db.image_url, oldPrice: db.old_price, 
        paymentLink: db.payment_link, imageUrls: db.image_urls || [], keyFeatures: db.key_features || []
      })) as any[];
    },
  });

  const { data: orders = [], isLoading: ordersLoading, refetch: refetchOrders } = useQuery({
    queryKey: ["admin-orders"],
    queryFn: async () => {
      const { data, error } = await supabase.from("orders").select("*").order("created_at", { ascending: false });
      if (error) throw error;
      return data as Order[];
    },
  });

  const { data: allVendors = [], refetch: refetchVendors } = useQuery({
    queryKey: ["admin-vendors"],
    queryFn: async () => {
      const { data, error } = await supabase.from("vendors").select("*").order("created_at", { ascending: false });
      if (error) throw error;
      return data ?? [];
    },
  });

  // ─── Universal API Manager Logic ───
  useEffect(() => {
    const fetchAdminData = async () => {
      const [apiRes, logsRes] = await Promise.all([
        supabase.from('api_configs').select('*'),
        supabase.from('audit_logs').select('*').order('created_at', { ascending: false }).limit(50)
      ]);
      if (!apiRes.error) setApiConfigs(apiRes.data || []);
      if (!logsRes.error) setAuditLogs(logsRes.data || []);
    };
    fetchAdminData();
  }, [currentTab]);

  const handleSaveApi = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingApi) return;
    setSaving(true);
    const isNew = !editingApi.id;
    const { data, error } = isNew 
      ? await supabase.from('api_configs').insert([editingApi]).select()
      : await supabase.from('api_configs').update(editingApi).eq('id', editingApi.id).select();
    
    setSaving(false);
    if (error) { toast({ title: "Erreur", description: error.message, variant: "destructive" }); return; }
    toast({ title: "Succès", description: "API configurée." });
    setEditingApi(null);
    setApiConfigs(prev => isNew ? [...prev, data[0]] : prev.map(c => c.id === editingApi.id ? data[0] : c));
    logAction("API_UPDATE", `API ${editingApi.name} mise à jour`);
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

  const logAction = async (action: string, details: string) => {
    const log = { action, details, user_id: user?.id, created_at: new Date().toISOString() };
    await supabase.from('audit_logs').insert([log]);
    setAuditLogs(prev => [log, ...prev]);
  };

  const exportData = (type: 'csv' | 'json') => {
    setIsExporting(true);
    const data = products; // Example
    const blob = new Blob([type === 'csv' ? "id,title,price\n" + data.map(p => `${p.id},${p.title},${p.price}`).join("\n") : JSON.stringify(data)], { type: type === 'csv' ? 'text/csv' : 'application/json' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `mindhubs-export-${Date.now()}.${type}`;
    a.click();
    setIsExporting(false);
    toast({ title: "Export réussi" });
  };

  // ─── Handlers ───
  const saveProduct = async () => {
    if (!productEditing) return;
    setSaving(true);
    const isNew = !products.find(p => p.id === productEditing.id);
    const productData = { ...productEditing, rating: parseFloat(productEditing.rating) || 5, sort_order: parseInt(productEditing.sort_order.toString()) || 0 };
    try {
      const { error } = isNew ? await supabase.from("products").insert([productData]) : await supabase.from("products").update(productData).eq("id", productEditing.id);
      if (error) throw error;
      toast({ title: isNew ? "Produit ajouté" : "Produit mis à jour" });
      setProductEditing(null);
      refetchProducts();
      logAction(isNew ? "PRODUCT_ADD" : "PRODUCT_UPDATE", `Produit ${productEditing.title}`);
    } catch (error: any) {
      toast({ title: "Erreur", description: error.message, variant: "destructive" });
    } finally {
      setSaving(false);
    }
  };

  const updateOrderStatus = async (orderId: string, status: Order["status"]) => {
    setUpdatingStatus(orderId);
    const { error } = await supabase.from("orders").update({ status }).eq("id", orderId);
    setUpdatingStatus(null);
    if (error) { toast({ title: "Erreur", description: error.message, variant: "destructive" }); return; }
    toast({ title: "Statut mis à jour" });
    refetchOrders();
    logAction("ORDER_STATUS", `Commande ${orderId} -> ${status}`);
  };

  const handleDeleteConfirm = async () => {
    if (!deleteConfirm) return;
    setDeleting(deleteConfirm.id);
    const table = deleteConfirm.type === "product" ? "products" : deleteConfirm.type === "api" ? "api_configs" : "testimonials";
    const { error } = await supabase.from(table).delete().eq("id", deleteConfirm.id);
    setDeleting(null);
    setDeleteConfirm(null);
    if (error) { toast({ title: "Erreur", description: error.message, variant: "destructive" }); return; }
    toast({ title: "Supprimé" });
    if (deleteConfirm.type === "product") refetchProducts();
    else if (deleteConfirm.type === "api") setApiConfigs(prev => prev.filter(a => a.id !== deleteConfirm.id));
    logAction("DELETE", `Suppression ${deleteConfirm.type} : ${deleteConfirm.label}`);
  };

  const handleImageUpload = async (file: File) => {
    if (!productEditing) return;
    setUploading(true);
    const fileName = `${Date.now()}-${Math.random().toString(36).slice(2)}.${file.name.split('.').pop()}`;
    const { error } = await supabase.storage.from("product-images").upload(fileName, file);
    if (error) { toast({ title: "Erreur upload", description: error.message, variant: "destructive" }); setUploading(false); return; }
    const { data: urlData } = supabase.storage.from("product-images").getPublicUrl(fileName);
    setProductEditing({ ...productEditing, image_url: urlData.publicUrl });
    setUploading(false);
  };

  // ─── Render ───
  return (
    <DashboardLayout variant="admin">
      <SEO title="Administration Elite | MindHubs" description="Contrôle total sur l'écosystème MindHubs." />
      
      <div className="max-w-[1600px] mx-auto space-y-8 pb-20">
        <AnimatePresence mode="wait">
          <motion.div key={currentTab} initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -10 }} className="space-y-8">
            
            {/* ─── TAB: OVERVIEW ─── */}
            {currentTab === "overview" && (
              <div className="space-y-8">
                <div className="grid lg:grid-cols-3 gap-8">
                  <div className="lg:col-span-2 space-y-6">
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                      {[
                        { label: "Ventes Total", value: orders.length, icon: ShoppingBag, color: "primary" },
                        { label: "Revenu Total", value: `${(orders.reduce((s, o) => s + (o.status !== 'cancelled' ? o.total_price : 0), 0) / 1000).toFixed(1)}k`, icon: DollarSign, color: "accent" },
                        { label: "Vendeurs Actifs", value: allVendors.length, icon: Store, color: "primary" },
                        { label: "APIs Connectées", value: apiConfigs.length, icon: Zap, color: "yellow-500" },
                      ].map((s, i) => (
                        <div key={i} className="stat-card rounded-2xl p-5 border-glow">
                          <div className={`w-10 h-10 rounded-xl flex items-center justify-center bg-${s.color}/10 text-${s.color} mb-3`}><s.icon size={18} /></div>
                          <p className="text-2xl font-bold">{s.value}</p>
                          <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">{s.label}</p>
                        </div>
                      ))}
                    </div>
                    
                    <div className="stat-card rounded-2xl p-6 border-glow h-80">
                       <h3 className="text-sm font-bold mb-6">Activité Financière</h3>
                       <ResponsiveContainer width="100%" height="100%">
                         <AreaChart data={[{d: 'Lun', v: 400}, {d: 'Mar', v: 700}, {d: 'Mer', v: 500}, {d: 'Jeu', v: 900}, {d: 'Ven', v: 1100}]}>
                           <defs>
                             <linearGradient id="colorV" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3}/><stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0}/></linearGradient>
                           </defs>
                           <XAxis dataKey="d" axisLine={false} tickLine={false} tick={{fontSize: 10}} />
                           <Tooltip />
                           <Area type="monotone" dataKey="v" stroke="hsl(var(--primary))" fill="url(#colorV)" strokeWidth={3} />
                         </AreaChart>
                       </ResponsiveContainer>
                    </div>
                  </div>

                  <div className="stat-card rounded-2xl p-6 border-glow flex flex-col h-full">
                    <h3 className="text-sm font-bold mb-6 flex items-center gap-2"><History size={16} /> Audit Temps Réel</h3>
                    <div className="space-y-4 overflow-y-auto max-h-[500px]">
                      {auditLogs.map((log, i) => (
                        <div key={i} className="flex gap-3 border-l-2 border-primary/20 pl-3 py-1">
                          <div className="flex-1">
                            <p className="text-[10px] font-black uppercase text-primary">{log.action}</p>
                            <p className="text-[11px] font-medium leading-tight">{log.details}</p>
                            <p className="text-[9px] text-muted-foreground">{new Date(log.created_at).toLocaleTimeString()}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* ─── TAB: API MANAGER ─── */}
            {currentTab === "api-manager" && (
              <div className="space-y-8">
                <div className="flex items-center justify-between">
                   <div>
                     <h2 className="text-3xl font-black">Universal API Manager</h2>
                     <p className="text-xs text-muted-foreground font-black uppercase tracking-widest mt-1">Contrôlez vos moteurs IA et Data en temps réel</p>
                   </div>
                   <Button onClick={() => setEditingApi({ name: "", base_url: "", method: "GET", auth_type: "none", is_active: true })} className="rounded-2xl gap-2 font-black">
                     <Plus size={18} /> Nouvelle API
                   </Button>
                </div>

                {editingApi && (
                  <motion.form onSubmit={handleSaveApi} initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="stat-card rounded-3xl p-8 border-glow space-y-6">
                     <div className="grid md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                           <label className="text-[10px] font-black uppercase">Nom de l'API</label>
                           <Input value={editingApi.name} onChange={e => setEditingApi({...editingApi, name: e.target.value})} placeholder="Ex: Meta Ads Library" required />
                        </div>
                        <div className="space-y-2">
                           <label className="text-[10px] font-black uppercase">Base URL</label>
                           <Input value={editingApi.base_url} onChange={e => setEditingApi({...editingApi, base_url: e.target.value})} placeholder="https://api.facebook.com/..." required />
                        </div>
                        <div className="space-y-2">
                           <label className="text-[10px] font-black uppercase">Méthode HTTP</label>
                           <select value={editingApi.method} onChange={e => setEditingApi({...editingApi, method: e.target.value})} className="w-full h-10 rounded-xl bg-muted/20 border border-border px-3 font-bold">
                              {["GET", "POST", "PUT", "DELETE"].map(m => <option key={m} value={m}>{m}</option>)}
                           </select>
                        </div>
                        <div className="space-y-2">
                           <label className="text-[10px] font-black uppercase">Auth Type</label>
                           <select value={editingApi.auth_type} onChange={e => setEditingApi({...editingApi, auth_type: e.target.value as any})} className="w-full h-10 rounded-xl bg-muted/20 border border-border px-3 font-bold">
                              <option value="none">Aucune</option>
                              <option value="Bearer">Bearer Token</option>
                              <option value="Key">API Key (Header)</option>
                           </select>
                        </div>
                        {editingApi.auth_type !== 'none' && (
                          <div className="md:col-span-2 space-y-2">
                            <label className="text-[10px] font-black uppercase">Token / Clé</label>
                            <Input value={editingApi.auth_token} onChange={e => setEditingApi({...editingApi, auth_token: e.target.value})} type="password" placeholder="sk-..." />
                          </div>
                        )}
                     </div>
                     <div className="flex justify-end gap-3 pt-4 border-t border-border">
                        <Button type="button" variant="ghost" onClick={() => setEditingApi(null)} className="rounded-xl">Annuler</Button>
                        <Button type="submit" disabled={saving} className="rounded-xl font-black">{saving ? <Loader2 className="animate-spin" /> : <Save size={18} className="mr-2" />} Enregistrer</Button>
                     </div>
                  </motion.form>
                )}

                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {apiConfigs.map(api => (
                    <div key={api.id} className="stat-card rounded-2xl p-6 border-glow flex flex-col group">
                       <div className="flex items-center justify-between mb-4">
                          <div className="flex items-center gap-3">
                             <div className="h-10 w-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center"><Server size={20} /></div>
                             <div><p className="font-black text-sm">{api.name}</p><Badge variant="outline" className="text-[9px] font-black uppercase">{api.method}</Badge></div>
                          </div>
                          <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                             <button onClick={() => setEditingApi(api)} className="p-2 rounded-lg hover:bg-primary/10 text-primary"><Edit size={16} /></button>
                             <button onClick={() => setDeleteConfirm({ type: "api", id: api.id!, label: api.name })} className="p-2 rounded-lg hover:bg-destructive/10 text-destructive"><Trash2 size={16} /></button>
                          </div>
                       </div>
                       <p className="text-[10px] text-muted-foreground truncate mb-4 font-mono">{api.base_url}</p>
                       <div className="mt-auto pt-4 border-t border-border flex items-center justify-between">
                          <Badge className={api.is_active ? "bg-emerald-500/10 text-emerald-500" : "bg-muted"}>{api.is_active ? "ACTIF" : "INACTIF"}</Badge>
                          <Button size="sm" onClick={() => handleTestApi(api)} disabled={testingApi} className="rounded-xl h-8 text-[10px] font-black uppercase gap-2">
                             {testingApi ? <Loader2 size={12} className="animate-spin" /> : <Play size={12} fill="currentColor" />} Tester
                          </Button>
                       </div>
                    </div>
                  ))}
                </div>

                {testResult && (
                  <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="stat-card rounded-2xl p-6 border-glow bg-zinc-950">
                     <div className="flex items-center justify-between mb-4">
                        <h4 className="text-xs font-black uppercase tracking-widest text-emerald-500 flex items-center gap-2"><Activity size={14} /> Résultat du test live</h4>
                        <button onClick={() => setTestResult(null)}><X size={14} /></button>
                     </div>
                     <div className="grid grid-cols-2 gap-4 mb-4">
                        <div className="p-3 rounded-xl bg-white/5 border border-white/5">
                           <p className="text-[9px] text-muted-foreground uppercase font-black">Status Code</p>
                           <p className="text-xl font-black text-emerald-400">{testResult.status}</p>
                        </div>
                        <div className="p-3 rounded-xl bg-white/5 border border-white/5">
                           <p className="text-[9px] text-muted-foreground uppercase font-black">Latence</p>
                           <p className="text-xl font-black text-primary">{testResult.time}ms</p>
                        </div>
                     </div>
                     <pre className="p-4 rounded-xl bg-black border border-white/10 text-[10px] text-emerald-500/80 overflow-x-auto [scrollbar-width:thin]">
                        {JSON.stringify(testResult.data, null, 2)}
                     </pre>
                  </motion.div>
                )}
              </div>
            )}

            {/* ─── TAB: LOGS ─── */}
            {currentTab === "logs" && (
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                   <h2 className="text-3xl font-black">Journaux d'Audit</h2>
                   <Button variant="outline" onClick={() => exportData('csv')} className="rounded-xl gap-2 font-black"><Download size={18} /> Export CSV</Button>
                </div>
                <div className="stat-card rounded-2xl overflow-hidden border-glow">
                   <table className="w-full text-sm text-left">
                      <thead className="bg-muted/30 border-b border-border">
                         <tr><th className="p-4 font-black text-[10px] uppercase tracking-widest">Date</th><th className="p-4 font-black text-[10px] uppercase tracking-widest">Action</th><th className="p-4 font-black text-[10px] uppercase tracking-widest">Détails</th></tr>
                      </thead>
                      <tbody>
                         {auditLogs.map((log, i) => (
                            <tr key={i} className="border-b border-border last:border-0 hover:bg-muted/5 transition-colors">
                               <td className="p-4 text-[11px] text-muted-foreground font-mono">{new Date(log.created_at).toLocaleString()}</td>
                               <td className="p-4"><Badge className="bg-primary/10 text-primary font-black text-[9px] uppercase">{log.action}</Badge></td>
                               <td className="p-4 font-medium text-xs">{log.details}</td>
                            </tr>
                         ))}
                      </tbody>
                   </table>
                </div>
              </div>
            )}

            {/* ─── TAB: PRODUCTS ─── */}
            {currentTab === "products" && (
               <div className="space-y-6">
                 <div className="flex items-center justify-between">
                    <div>
                      <h2 className="text-3xl font-black">Catalogue Elite</h2>
                      <p className="text-xs text-muted-foreground font-black uppercase tracking-widest mt-1">Gérez les pépites de la marketplace</p>
                    </div>
                    <Button onClick={() => setProductEditing(DEFAULT_PRODUCT)} className="rounded-2xl flex items-center gap-2 font-black px-8">
                      <Plus size={18} /> Ajouter une pépite
                    </Button>
                 </div>

                 <div className="relative max-w-md">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={16} />
                    <Input placeholder="Rechercher une pépite..." className="pl-10 h-12 bg-card rounded-2xl" value={productSearch} onChange={(e) => setProductSearch(e.target.value)} />
                 </div>

                {productEditing && (
                  <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="stat-card rounded-3xl p-8 border-glow space-y-8">
                    <div className="flex items-center justify-between border-b border-border pb-6">
                      <h2 className="text-2xl font-black">{productEditing.id ? "Modifier" : "Nouvelle"} Pépite</h2>
                      <button onClick={() => setProductEditing(null)}><X /></button>
                    </div>
                    <div className="grid lg:grid-cols-3 gap-10">
                       <div className="space-y-6">
                          <label className="text-[10px] font-black uppercase tracking-widest">Image de couverture</label>
                          <div onClick={() => fileInputRef.current?.click()} className="aspect-square rounded-3xl border-2 border-dashed border-border bg-muted/20 flex items-center justify-center cursor-pointer hover:border-primary transition-all overflow-hidden relative">
                             {productEditing.image_url ? <img src={productEditing.image_url} className="w-full h-full object-cover" /> : <Upload size={32} className="text-muted-foreground" />}
                             {uploading && <div className="absolute inset-0 bg-background/80 flex items-center justify-center"><Loader2 className="animate-spin text-primary" /></div>}
                             <input ref={fileInputRef} type="file" className="hidden" accept="image/*" onChange={(e) => e.target.files?.[0] && handleImageUpload(e.target.files[0])} />
                          </div>
                       </div>
                       <div className="lg:col-span-2 space-y-6">
                          <div className="grid md:grid-cols-2 gap-6">
                             <div className="space-y-2"><label className="text-[10px] font-black uppercase">Titre</label><Input value={productEditing.title} onChange={e => setProductEditing({...productEditing, title: e.target.value})} /></div>
                             <div className="space-y-2"><label className="text-[10px] font-black uppercase">Catégorie</label><Input value={productEditing.category} onChange={e => setProductEditing({...productEditing, category: e.target.value})} /></div>
                             <div className="space-y-2"><label className="text-[10px] font-black uppercase">Prix</label><Input value={productEditing.price} onChange={e => setProductEditing({...productEditing, price: e.target.value})} /></div>
                             <div className="space-y-2"><label className="text-[10px] font-black uppercase">Lien Paiement</label><Input value={productEditing.payment_link} onChange={e => setProductEditing({...productEditing, payment_link: e.target.value})} /></div>
                          </div>
                          <div className="space-y-2">
                             <label className="text-[10px] font-black uppercase">Description Marketing</label>
                             <RichDescriptionEditor value={productEditing.description} onChange={val => setProductEditing({...productEditing, description: val})} title={productEditing.title} category={productEditing.category} />
                          </div>
                       </div>
                    </div>
                    <div className="flex justify-end gap-3 pt-6 border-t border-border">
                       <Button variant="ghost" onClick={() => setProductEditing(null)}>Annuler</Button>
                       <Button onClick={saveProduct} disabled={saving} className="rounded-xl px-10 font-black">{saving ? <Loader2 className="animate-spin" /> : "Enregistrer"}</Button>
                    </div>
                  </motion.div>
                )}

                <div className="stat-card rounded-2xl overflow-hidden border-glow">
                   <table className="w-full text-sm text-left">
                      <thead className="bg-muted/30 border-b border-border">
                         <tr><th className="p-4 font-black uppercase text-[10px]">Pépite</th><th className="p-4 font-black uppercase text-[10px]">Prix</th><th className="p-4 font-black uppercase text-[10px] text-right">Actions</th></tr>
                      </thead>
                      <tbody>
                        {products.filter(p => p.title.toLowerCase().includes(productSearch.toLowerCase())).map(p => (
                          <tr key={p.id} className="border-b border-border last:border-0 group">
                             <td className="p-4 flex items-center gap-3"><img src={p.image} className="w-12 h-12 rounded-xl object-cover" /><span className="font-black truncate max-w-[200px]">{p.title}</span></td>
                             <td className="p-4 font-black">{p.price}</td>
                             <td className="p-4 text-right">
                                <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                   <button onClick={() => setProductEditing(p as any)} className="p-2 rounded-xl hover:bg-primary/10 text-primary"><Edit size={16} /></button>
                                   <button onClick={() => setDeleteConfirm({ type: "product", id: p.id, label: p.title })} className="p-2 rounded-xl hover:bg-destructive/10 text-destructive"><Trash2 size={16} /></button>
                                </div>
                             </td>
                          </tr>
                        ))}
                      </tbody>
                   </table>
                </div>
              </div>
            )}

            {/* ─── TAB: ORDERS ─── */}
            {currentTab === "orders" && (
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                   <h2 className="text-3xl font-black">Gestion des Ventes</h2>
                   <div className="flex gap-2">
                      <Button variant="outline" onClick={() => exportData('csv')} className="rounded-xl font-black text-xs uppercase tracking-widest"><Download size={14} className="mr-2" /> Export</Button>
                   </div>
                </div>
                <div className="stat-card rounded-2xl overflow-hidden border-glow">
                  <table className="w-full text-sm text-left">
                    <thead className="bg-muted/30 border-b border-border">
                      <tr><th className="p-4 font-black text-[10px] uppercase">Client</th><th className="p-4 font-black text-[10px] uppercase">Montant</th><th className="p-4 font-black text-[10px] uppercase">Statut</th><th className="p-4 font-black text-[10px] uppercase text-right">Détails</th></tr>
                    </thead>
                    <tbody>
                      {orders.map(o => (
                        <tr key={o.id} className="border-b border-border last:border-0 hover:bg-muted/5">
                          <td className="p-4"><p className="font-bold">{o.customer_name}</p><p className="text-[10px] text-muted-foreground">{o.customer_email}</p></td>
                          <td className="p-4 font-black">{o.total_price.toLocaleString()} FCFA</td>
                          <td className="p-4"><Badge className={`${statusConfig[o.status].color} font-black text-[9px] uppercase tracking-widest`}>{statusConfig[o.status].label}</Badge></td>
                          <td className="p-4 text-right"><button onClick={() => setViewingOrder(o)} className="p-2 rounded-xl hover:bg-muted"><Eye size={18} /></button></td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* ─── OTHER TABS: Placeholder logic for brevity but functional structure ─── */}
            {(currentTab === "vendors" || currentTab === "users") && (
               <div className="stat-card rounded-3xl p-20 flex flex-col items-center justify-center text-center space-y-6 border-glow">
                  <div className="h-20 w-20 rounded-full bg-primary/10 flex items-center justify-center text-primary"><Users size={40} /></div>
                  <div>
                     <h3 className="text-2xl font-black uppercase tracking-tighter">Gestion des {currentTab === 'vendors' ? 'Vendeurs' : 'Utilisateurs'}</h3>
                     <p className="text-muted-foreground max-w-sm font-medium">Contrôlez les accès et les privilèges des membres de la communauté.</p>
                  </div>
                  <div className="w-full max-w-4xl pt-10">
                     <div className="p-6 rounded-2xl bg-white/5 border border-white/5 font-black uppercase text-xs tracking-widest opacity-40">
                        {currentTab === 'vendors' ? `${allVendors.length} Vendeurs actifs identifiés` : "Chargement de l'annuaire utilisateurs..."}
                     </div>
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
                   <p className="text-[10px] font-black uppercase text-muted-foreground">Total à régler</p>
                   <p className="text-3xl font-black text-primary">{viewingOrder.total_price.toLocaleString()} FCFA</p>
                </div>
                <Button className="w-full h-14 rounded-2xl font-black uppercase tracking-widest gap-2" onClick={() => setViewingOrder(null)}>Fermer l'aperçu</Button>
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

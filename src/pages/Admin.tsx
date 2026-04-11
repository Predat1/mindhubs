import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Plus, Pencil, Trash2, Save, X, LogOut, ArrowLeft, Loader2, ShieldAlert, Package, MessageSquare, Link2, ExternalLink, ShoppingBag, Clock, CheckCircle2, XCircle, Truck, Eye } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useIsAdmin } from "@/hooks/useAdminRole";
import { useProducts } from "@/hooks/useProducts";
import { useTestimonials } from "@/hooks/useTestimonials";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "@/hooks/use-toast";
import { categories } from "@/data/products";
import Navbar from "@/components/Navbar";
import SEO from "@/components/SEO";

// ─── Types ───
interface ProductForm {
  id: string; title: string; image_url: string; old_price: string; price: string;
  category: string; rating: string; tag: string; description: string;
  featured: boolean; sort_order: string; payment_link: string;
}

interface TestimonialForm {
  id: string; name: string; handle: string; avatar_initials: string;
  content: string; likes: string; retweets: string; replies: string; verified: boolean;
}

const emptyProduct: ProductForm = {
  id: "", title: "", image_url: "", old_price: "", price: "",
  category: "Formations", rating: "", tag: "", description: "",
  featured: false, sort_order: "0", payment_link: "",
};

const emptyTestimonial: TestimonialForm = {
  id: "", name: "", handle: "", avatar_initials: "", content: "",
  likes: "0", retweets: "0", replies: "0", verified: false,
};

type Tab = "products" | "testimonials" | "orders";

interface Order {
  id: string;
  customer_name: string;
  customer_email: string;
  customer_phone: string;
  payment_method: string;
  total_price: number;
  status: "pending" | "confirmed" | "delivered" | "cancelled";
  items: { product_id: string; title: string; price: string; quantity: number; image?: string }[];
  created_at: string;
}

const statusConfig = {
  pending: { label: "En attente", icon: Clock, color: "text-yellow-500 bg-yellow-500/10" },
  confirmed: { label: "Confirmée", icon: CheckCircle2, color: "text-accent bg-accent/10" },
  delivered: { label: "Livrée", icon: Truck, color: "text-primary bg-primary/10" },
  cancelled: { label: "Annulée", icon: XCircle, color: "text-destructive bg-destructive/10" },
};

const Admin = () => {
  const { user, loading: authLoading, signOut } = useAuth();
  const { data: isAdmin, isLoading: roleLoading } = useIsAdmin();
  const navigate = useNavigate();
  const { data: products = [], isLoading: productsLoading } = useProducts();
  const { data: testimonials = [], isLoading: testimonialsLoading } = useTestimonials();
  const { data: orders = [], isLoading: ordersLoading } = useQuery({
    queryKey: ["admin-orders"],
    queryFn: async (): Promise<Order[]> => {
      const { data, error } = await supabase
        .from("orders")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return (data as any) ?? [];
    },
  });
  const queryClient = useQueryClient();

  const [tab, setTab] = useState<Tab>("products");
  const [productEditing, setProductEditing] = useState<ProductForm | null>(null);
  const [testimonialEditing, setTestimonialEditing] = useState<TestimonialForm | null>(null);
  const [isNew, setIsNew] = useState(false);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState<string | null>(null);
  const [viewingOrder, setViewingOrder] = useState<Order | null>(null);
  const [updatingStatus, setUpdatingStatus] = useState<string | null>(null);
  const [orderFilter, setOrderFilter] = useState<"all" | Order["status"]>("all");

  // ─── Auth guards ───
  if (authLoading || roleLoading) {
    return <div className="min-h-screen bg-background flex items-center justify-center"><Loader2 className="animate-spin text-primary" size={32} /></div>;
  }
  if (!user) {
    return (
      <div className="min-h-screen bg-background"><SEO title="Administration" description="Panneau d'administration" path="/admin" /><Navbar />
        <div className="pt-24 text-center space-y-4">
          <h1 className="text-2xl font-bold text-foreground">Accès réservé</h1>
          <p className="text-muted-foreground">Veuillez vous connecter.</p>
          <button onClick={() => navigate("/mon-compte")} className="btn-primary-brand px-6 py-3 rounded-xl font-semibold text-sm">Se connecter</button>
        </div>
      </div>
    );
  }
  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-background"><SEO title="Accès refusé" description="" path="/admin" /><Navbar />
        <div className="pt-24 text-center space-y-4">
          <ShieldAlert className="mx-auto text-destructive" size={48} />
          <h1 className="text-2xl font-bold text-foreground">Accès refusé</h1>
          <button onClick={() => navigate("/")} className="btn-primary-brand px-6 py-3 rounded-xl font-semibold text-sm">Retour</button>
        </div>
      </div>
    );
  }

  // ─── Product CRUD ───
  const openNewProduct = () => { setProductEditing({ ...emptyProduct, sort_order: String(products.length) }); setIsNew(true); };
  const openEditProduct = (p: typeof products[0]) => {
    setProductEditing({
      id: p.id, title: p.title, image_url: p.image, old_price: p.oldPrice, price: p.price,
      category: p.category, rating: p.rating?.toString() ?? "", tag: p.tag ?? "",
      description: p.description ?? "", featured: false, sort_order: "0",
      payment_link: p.paymentLink ?? "",
    });
    setIsNew(false);
  };

  const saveProduct = async () => {
    if (!productEditing) return;
    const e = productEditing;
    if (!e.id.trim() || !e.title.trim() || !e.price.trim() || !e.old_price.trim()) {
      toast({ title: "Champs requis manquants", variant: "destructive" }); return;
    }
    setSaving(true);
    const payload = {
      id: e.id.trim(), title: e.title.trim(), image_url: e.image_url.trim(),
      old_price: e.old_price.trim(), price: e.price.trim(), category: e.category,
      rating: e.rating ? parseFloat(e.rating) : null, tag: e.tag.trim() || null,
      description: e.description.trim() || null, featured: e.featured,
      sort_order: parseInt(e.sort_order) || 0, payment_link: e.payment_link.trim() || null,
    };
    const { error } = isNew
      ? await supabase.from("products").insert(payload)
      : await supabase.from("products").update(payload).eq("id", e.id);
    setSaving(false);
    if (error) { toast({ title: "Erreur", description: error.message, variant: "destructive" }); return; }
    toast({ title: isNew ? "Produit ajouté ✓" : "Produit mis à jour ✓" });
    setProductEditing(null);
    queryClient.invalidateQueries({ queryKey: ["products"] });
  };

  const deleteProduct = async (id: string) => {
    if (!confirm("Supprimer ce produit définitivement ?")) return;
    setDeleting(id);
    const { error } = await supabase.from("products").delete().eq("id", id);
    setDeleting(null);
    if (error) { toast({ title: "Erreur", description: error.message, variant: "destructive" }); return; }
    toast({ title: "Produit supprimé ✓" });
    queryClient.invalidateQueries({ queryKey: ["products"] });
  };

  // ─── Testimonial CRUD ───
  const openNewTestimonial = () => { setTestimonialEditing({ ...emptyTestimonial }); setIsNew(true); };
  const openEditTestimonial = (t: typeof testimonials[0]) => {
    setTestimonialEditing({
      id: t.id, name: t.name, handle: t.handle, avatar_initials: t.avatar_initials,
      content: t.content, likes: String(t.likes), retweets: String(t.retweets),
      replies: String(t.replies), verified: t.verified,
    });
    setIsNew(false);
  };

  const saveTestimonial = async () => {
    if (!testimonialEditing) return;
    const t = testimonialEditing;
    if (!t.name.trim() || !t.content.trim()) {
      toast({ title: "Nom et contenu requis", variant: "destructive" }); return;
    }
    setSaving(true);
    const payload = {
      name: t.name.trim(), handle: t.handle.trim(), avatar_initials: t.avatar_initials.trim(),
      content: t.content.trim(), likes: parseInt(t.likes) || 0, retweets: parseInt(t.retweets) || 0,
      replies: parseInt(t.replies) || 0, verified: t.verified,
    };
    const { error } = isNew
      ? await supabase.from("testimonials").insert(payload)
      : await supabase.from("testimonials").update(payload).eq("id", t.id);
    setSaving(false);
    if (error) { toast({ title: "Erreur", description: error.message, variant: "destructive" }); return; }
    toast({ title: isNew ? "Témoignage ajouté ✓" : "Témoignage mis à jour ✓" });
    setTestimonialEditing(null);
    queryClient.invalidateQueries({ queryKey: ["testimonials"] });
  };

  const deleteTestimonial = async (id: string) => {
    if (!confirm("Supprimer ce témoignage ?")) return;
    setDeleting(id);
    const { error } = await supabase.from("testimonials").delete().eq("id", id);
    setDeleting(null);
    if (error) { toast({ title: "Erreur", description: error.message, variant: "destructive" }); return; }
    toast({ title: "Témoignage supprimé ✓" });
    queryClient.invalidateQueries({ queryKey: ["testimonials"] });
  };

  // ─── Order actions ───
  const updateOrderStatus = async (orderId: string, newStatus: Order["status"]) => {
    setUpdatingStatus(orderId);
    const { error } = await supabase.from("orders").update({ status: newStatus } as any).eq("id", orderId);
    setUpdatingStatus(null);
    if (error) { toast({ title: "Erreur", description: error.message, variant: "destructive" }); return; }
    toast({ title: `Statut mis à jour → ${statusConfig[newStatus].label}` });
    queryClient.invalidateQueries({ queryKey: ["admin-orders"] });
    if (viewingOrder?.id === orderId) setViewingOrder({ ...viewingOrder, status: newStatus });
  };

  const deleteOrder = async (id: string) => {
    if (!confirm("Supprimer cette commande ?")) return;
    setDeleting(id);
    const { error } = await supabase.from("orders").delete().eq("id", id);
    setDeleting(null);
    if (error) { toast({ title: "Erreur", description: error.message, variant: "destructive" }); return; }
    toast({ title: "Commande supprimée ✓" });
    queryClient.invalidateQueries({ queryKey: ["admin-orders"] });
  };

  const InputField = ({ label, value, onChange, disabled, type = "text", placeholder }: {
    label: string; value: string; onChange: (v: string) => void; disabled?: boolean; type?: string; placeholder?: string;
  }) => (
    <div className="space-y-1.5">
      <label className="text-xs font-medium text-muted-foreground">{label}</label>
      <input value={value} onChange={(e) => onChange(e.target.value)} disabled={disabled} type={type} placeholder={placeholder}
        className="w-full px-3 py-2.5 rounded-xl border border-border bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 disabled:opacity-50 transition-all" />
    </div>
  );

  return (
    <div className="min-h-screen bg-background">
      <SEO title="Administration" description="Gérez vos produits et témoignages" path="/admin" />
      <Navbar />

      <div className="pt-20 pb-12 container mx-auto px-4 max-w-6xl">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <button onClick={() => navigate("/")} className="text-muted-foreground hover:text-foreground transition-colors"><ArrowLeft size={20} /></button>
            <h1 className="text-2xl font-bold text-foreground">Administration</h1>
          </div>
          <button onClick={async () => { await signOut(); navigate("/"); }} className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm border border-border text-muted-foreground hover:text-foreground transition-all">
            <LogOut size={16} /> Déconnexion
          </button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
          {[
            { label: "Produits", value: products.length, icon: Package },
            { label: "Témoignages", value: testimonials.length, icon: MessageSquare },
            { label: "Commandes", value: orders.length, icon: ShoppingBag },
            { label: "En attente", value: orders.filter(o => o.status === "pending").length, icon: Clock },
            { label: "Revenu total", value: `${orders.reduce((s, o) => s + o.total_price, 0).toLocaleString()} CFA`, icon: ExternalLink },
          ].map((s, i) => (
            <div key={i} className="stat-card rounded-2xl p-4 border-glow">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center"><s.icon size={18} className="text-primary" /></div>
                <div>
                  <p className="text-xl font-bold text-foreground">{s.value}</p>
                  <p className="text-xs text-muted-foreground">{s.label}</p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Tabs */}
        <div className="flex items-center gap-2 mb-6">
          {([
            { key: "products" as Tab, label: "Produits", icon: Package },
            { key: "testimonials" as Tab, label: "Témoignages", icon: MessageSquare },
            { key: "orders" as Tab, label: "Commandes", icon: ShoppingBag },
          ]).map((t) => (
            <button
              key={t.key}
              onClick={() => { setTab(t.key); setProductEditing(null); setTestimonialEditing(null); }}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-medium transition-all ${
                tab === t.key ? "bg-primary text-primary-foreground shadow-glow" : "bg-secondary text-muted-foreground hover:text-foreground"
              }`}
            >
              <t.icon size={16} /> {t.label}
            </button>
          ))}
          <div className="flex-1" />
          {tab !== "orders" && (
            <button
              onClick={tab === "products" ? openNewProduct : openNewTestimonial}
              className="btn-primary-brand flex items-center gap-2 px-5 py-2.5 rounded-xl font-semibold text-sm"
            >
              <Plus size={16} /> Ajouter
            </button>
          )}
        </div>

        {/* ─── PRODUCTS TAB ─── */}
        {tab === "products" && (
          <>
            {productEditing && (
              <div className="stat-card rounded-2xl p-6 mb-6 space-y-4 border-glow">
                <div className="flex items-center justify-between">
                  <h2 className="font-bold text-foreground text-lg">{isNew ? "Nouveau produit" : "Modifier le produit"}</h2>
                  <button onClick={() => setProductEditing(null)} className="text-muted-foreground hover:text-foreground"><X size={20} /></button>
                </div>
                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  <InputField label="ID (slug unique)" value={productEditing.id} onChange={(v) => setProductEditing({ ...productEditing, id: v })} disabled={!isNew} />
                  <InputField label="Titre" value={productEditing.title} onChange={(v) => setProductEditing({ ...productEditing, title: v })} />
                  <InputField label="Ancien prix" value={productEditing.old_price} onChange={(v) => setProductEditing({ ...productEditing, old_price: v })} placeholder="15.000 CFA" />
                  <InputField label="Prix" value={productEditing.price} onChange={(v) => setProductEditing({ ...productEditing, price: v })} placeholder="5.000 CFA" />
                  <InputField label="Note (ex: 4.5)" value={productEditing.rating} onChange={(v) => setProductEditing({ ...productEditing, rating: v })} />
                  <InputField label="URL de l'image" value={productEditing.image_url} onChange={(v) => setProductEditing({ ...productEditing, image_url: v })} />
                  <InputField label="Ordre d'affichage" value={productEditing.sort_order} onChange={(v) => setProductEditing({ ...productEditing, sort_order: v })} type="number" />
                  <div className="space-y-1.5">
                    <label className="text-xs font-medium text-muted-foreground">Catégorie</label>
                    <select value={productEditing.category} onChange={(e) => setProductEditing({ ...productEditing, category: e.target.value })}
                      className="w-full px-3 py-2.5 rounded-xl border border-border bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/50">
                      {categories.filter(c => c !== "Tous").map(c => <option key={c} value={c}>{c}</option>)}
                    </select>
                  </div>
                  <InputField label="🔗 Lien de paiement" value={productEditing.payment_link} onChange={(v) => setProductEditing({ ...productEditing, payment_link: v })} placeholder="https://pay.example.com/..." />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-muted-foreground">Description</label>
                  <textarea value={productEditing.description} onChange={(e) => setProductEditing({ ...productEditing, description: e.target.value })} rows={3}
                    className="w-full px-3 py-2.5 rounded-xl border border-border bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 resize-none" />
                </div>
                <div className="flex items-center gap-2">
                  <input type="checkbox" id="featured" checked={productEditing.featured} onChange={(e) => setProductEditing({ ...productEditing, featured: e.target.checked })} className="accent-primary" />
                  <label htmlFor="featured" className="text-sm text-foreground">Produit phare (affiché sur l'accueil)</label>
                </div>
                <div className="flex justify-end gap-3 pt-2">
                  <button onClick={() => setProductEditing(null)} className="px-5 py-2.5 rounded-xl text-sm border border-border text-muted-foreground hover:text-foreground transition-all">Annuler</button>
                  <button onClick={saveProduct} disabled={saving} className="btn-primary-brand flex items-center gap-2 px-6 py-2.5 rounded-xl font-semibold text-sm">
                    {saving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />} {isNew ? "Ajouter" : "Enregistrer"}
                  </button>
                </div>
              </div>
            )}

            {productsLoading ? (
              <div className="flex justify-center py-12"><Loader2 className="animate-spin text-primary" size={28} /></div>
            ) : (
              <div className="stat-card rounded-2xl overflow-hidden border-glow">
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-border bg-muted/30">
                        <th className="text-left p-4 font-semibold text-muted-foreground">Image</th>
                        <th className="text-left p-4 font-semibold text-muted-foreground">Titre</th>
                        <th className="text-left p-4 font-semibold text-muted-foreground hidden md:table-cell">Catégorie</th>
                        <th className="text-left p-4 font-semibold text-muted-foreground">Prix</th>
                        <th className="text-center p-4 font-semibold text-muted-foreground hidden sm:table-cell">Paiement</th>
                        <th className="text-right p-4 font-semibold text-muted-foreground">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {products.map((p) => (
                        <tr key={p.id} className="border-b border-border last:border-0 hover:bg-muted/20 transition-colors">
                          <td className="p-4"><img src={p.image} alt={p.title} className="w-10 h-10 rounded-lg object-cover" /></td>
                          <td className="p-4"><p className="font-medium text-foreground truncate max-w-[200px]">{p.title}</p></td>
                          <td className="p-4 hidden md:table-cell"><span className="text-xs px-2.5 py-1 rounded-full bg-primary/10 text-primary font-medium">{p.category}</span></td>
                          <td className="p-4"><span className="text-foreground font-semibold">{p.price}</span></td>
                          <td className="p-4 hidden sm:table-cell text-center">
                            {p.paymentLink ? (
                              <span className="inline-flex items-center gap-1 text-xs text-accent"><Link2 size={12} /> Actif</span>
                            ) : (
                              <span className="text-xs text-muted-foreground">—</span>
                            )}
                          </td>
                          <td className="p-4 text-right">
                            <div className="flex items-center justify-end gap-1">
                              <button onClick={() => openEditProduct(p)} className="p-2 rounded-lg text-muted-foreground hover:text-primary hover:bg-primary/5 transition-all"><Pencil size={16} /></button>
                              <button onClick={() => deleteProduct(p.id)} disabled={deleting === p.id} className="p-2 rounded-lg text-muted-foreground hover:text-destructive hover:bg-destructive/5 transition-all disabled:opacity-50">
                                {deleting === p.id ? <Loader2 size={16} className="animate-spin" /> : <Trash2 size={16} />}
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </>
        )}

        {/* ─── TESTIMONIALS TAB ─── */}
        {tab === "testimonials" && (
          <>
            {testimonialEditing && (
              <div className="stat-card rounded-2xl p-6 mb-6 space-y-4 border-glow">
                <div className="flex items-center justify-between">
                  <h2 className="font-bold text-foreground text-lg">{isNew ? "Nouveau témoignage" : "Modifier le témoignage"}</h2>
                  <button onClick={() => setTestimonialEditing(null)} className="text-muted-foreground hover:text-foreground"><X size={20} /></button>
                </div>
                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  <InputField label="Nom" value={testimonialEditing.name} onChange={(v) => setTestimonialEditing({ ...testimonialEditing, name: v })} />
                  <InputField label="Handle (@pseudo)" value={testimonialEditing.handle} onChange={(v) => setTestimonialEditing({ ...testimonialEditing, handle: v })} placeholder="@nom" />
                  <InputField label="Initiales avatar" value={testimonialEditing.avatar_initials} onChange={(v) => setTestimonialEditing({ ...testimonialEditing, avatar_initials: v })} placeholder="AB" />
                  <InputField label="Likes" value={testimonialEditing.likes} onChange={(v) => setTestimonialEditing({ ...testimonialEditing, likes: v })} type="number" />
                  <InputField label="Retweets" value={testimonialEditing.retweets} onChange={(v) => setTestimonialEditing({ ...testimonialEditing, retweets: v })} type="number" />
                  <InputField label="Réponses" value={testimonialEditing.replies} onChange={(v) => setTestimonialEditing({ ...testimonialEditing, replies: v })} type="number" />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-muted-foreground">Contenu du témoignage</label>
                  <textarea value={testimonialEditing.content} onChange={(e) => setTestimonialEditing({ ...testimonialEditing, content: e.target.value })} rows={3}
                    className="w-full px-3 py-2.5 rounded-xl border border-border bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 resize-none" />
                </div>
                <div className="flex items-center gap-2">
                  <input type="checkbox" id="verified" checked={testimonialEditing.verified} onChange={(e) => setTestimonialEditing({ ...testimonialEditing, verified: e.target.checked })} className="accent-primary" />
                  <label htmlFor="verified" className="text-sm text-foreground">Compte vérifié ✓</label>
                </div>
                <div className="flex justify-end gap-3 pt-2">
                  <button onClick={() => setTestimonialEditing(null)} className="px-5 py-2.5 rounded-xl text-sm border border-border text-muted-foreground hover:text-foreground transition-all">Annuler</button>
                  <button onClick={saveTestimonial} disabled={saving} className="btn-primary-brand flex items-center gap-2 px-6 py-2.5 rounded-xl font-semibold text-sm">
                    {saving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />} {isNew ? "Ajouter" : "Enregistrer"}
                  </button>
                </div>
              </div>
            )}

            {testimonialsLoading ? (
              <div className="flex justify-center py-12"><Loader2 className="animate-spin text-primary" size={28} /></div>
            ) : (
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {testimonials.map((t) => (
                  <div key={t.id} className="stat-card rounded-2xl p-5 border-glow space-y-3">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-2">
                        <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center text-xs font-bold text-primary">{t.avatar_initials}</div>
                        <div>
                          <p className="text-sm font-semibold text-foreground">{t.name}</p>
                          <p className="text-xs text-muted-foreground">{t.handle}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-1">
                        <button onClick={() => openEditTestimonial(t)} className="p-1.5 rounded-lg text-muted-foreground hover:text-primary hover:bg-primary/5 transition-all"><Pencil size={14} /></button>
                        <button onClick={() => deleteTestimonial(t.id)} disabled={deleting === t.id} className="p-1.5 rounded-lg text-muted-foreground hover:text-destructive hover:bg-destructive/5 transition-all disabled:opacity-50">
                          {deleting === t.id ? <Loader2 size={14} className="animate-spin" /> : <Trash2 size={14} />}
                        </button>
                      </div>
                    </div>
                    <p className="text-sm text-foreground/80 leading-relaxed line-clamp-3">{t.content}</p>
                    <div className="flex items-center gap-3 text-xs text-muted-foreground">
                      <span>❤️ {t.likes}</span>
                      <span>🔁 {t.retweets}</span>
                      <span>💬 {t.replies}</span>
                      {t.verified && <span className="text-primary font-medium">✓ Vérifié</span>}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        )}

        {/* ─── ORDERS TAB ─── */}
        {tab === "orders" && (() => {
          const filteredOrders = orderFilter === "all" ? orders : orders.filter(o => o.status === orderFilter);
          return (
          <>
            {/* Status filter */}
            <div className="flex items-center gap-2 mb-4 flex-wrap">
              {[
                { key: "all" as const, label: "Toutes", count: orders.length },
                { key: "pending" as const, label: "En attente", count: orders.filter(o => o.status === "pending").length },
                { key: "confirmed" as const, label: "Confirmées", count: orders.filter(o => o.status === "confirmed").length },
                { key: "delivered" as const, label: "Livrées", count: orders.filter(o => o.status === "delivered").length },
                { key: "cancelled" as const, label: "Annulées", count: orders.filter(o => o.status === "cancelled").length },
              ].map((f) => (
                <button
                  key={f.key}
                  onClick={() => setOrderFilter(f.key)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                    orderFilter === f.key ? "bg-primary text-primary-foreground" : "bg-secondary text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {f.label} ({f.count})
                </button>
              ))}
            </div>
            {/* Order detail modal */}
            {viewingOrder && (
              <div className="fixed inset-0 z-[100] flex items-center justify-center p-4" onClick={() => setViewingOrder(null)}>
                <div className="absolute inset-0 bg-background/90 backdrop-blur-sm" />
                <div className="relative w-full max-w-lg bg-card border border-border rounded-2xl p-6 space-y-5 max-h-[85vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
                  <div className="flex items-center justify-between">
                    <h2 className="font-bold text-foreground text-lg">Détails de la commande</h2>
                    <button onClick={() => setViewingOrder(null)} className="text-muted-foreground hover:text-foreground"><X size={20} /></button>
                  </div>

                  <div className="grid grid-cols-2 gap-3 text-sm">
                    <div><p className="text-xs text-muted-foreground">Client</p><p className="font-medium text-foreground">{viewingOrder.customer_name}</p></div>
                    <div><p className="text-xs text-muted-foreground">Email</p><p className="font-medium text-foreground">{viewingOrder.customer_email}</p></div>
                    <div><p className="text-xs text-muted-foreground">Téléphone</p><p className="font-medium text-foreground">{viewingOrder.customer_phone}</p></div>
                    <div><p className="text-xs text-muted-foreground">Paiement</p><p className="font-medium text-foreground capitalize">{viewingOrder.payment_method.replace("_", " ")}</p></div>
                    <div><p className="text-xs text-muted-foreground">Date</p><p className="font-medium text-foreground">{new Date(viewingOrder.created_at).toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric", hour: "2-digit", minute: "2-digit" })}</p></div>
                    <div><p className="text-xs text-muted-foreground">Total</p><p className="font-bold text-accent text-lg">{viewingOrder.total_price.toLocaleString()} CFA</p></div>
                  </div>

                  <div className="space-y-2">
                    <p className="text-xs font-medium text-muted-foreground">Produits commandés</p>
                    {viewingOrder.items.map((item, idx) => (
                      <div key={idx} className="flex items-center gap-3 p-2 rounded-lg bg-muted/30">
                        {item.image && <img src={item.image} alt={item.title} className="w-10 h-10 rounded-lg object-cover" />}
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-foreground truncate">{item.title}</p>
                          <p className="text-xs text-muted-foreground">Qté: {item.quantity} · {item.price}</p>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="space-y-2">
                    <p className="text-xs font-medium text-muted-foreground">Changer le statut</p>
                    <div className="grid grid-cols-2 gap-2">
                      {(Object.keys(statusConfig) as Order["status"][]).map((s) => {
                        const cfg = statusConfig[s];
                        return (
                          <button
                            key={s}
                            onClick={() => updateOrderStatus(viewingOrder.id, s)}
                            disabled={updatingStatus === viewingOrder.id || viewingOrder.status === s}
                            className={`flex items-center justify-center gap-1.5 py-2 rounded-xl text-xs font-medium transition-all border ${
                              viewingOrder.status === s ? `${cfg.color} border-current` : "border-border text-muted-foreground hover:text-foreground"
                            } disabled:opacity-50`}
                          >
                            <cfg.icon size={13} /> {cfg.label}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {ordersLoading ? (
              <div className="flex justify-center py-12"><Loader2 className="animate-spin text-primary" size={28} /></div>
            ) : filteredOrders.length === 0 ? (
              <div className="stat-card rounded-2xl p-12 text-center border-glow">
                <ShoppingBag size={40} className="mx-auto text-muted-foreground mb-3" />
                <p className="text-foreground font-medium">Aucune commande {orderFilter !== "all" ? "avec ce statut" : "pour le moment"}</p>
                <p className="text-sm text-muted-foreground mt-1">Les commandes apparaîtront ici quand des clients passeront commande.</p>
              </div>
            ) : (
              <div className="stat-card rounded-2xl overflow-hidden border-glow">
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-border bg-muted/30">
                        <th className="text-left p-4 font-semibold text-muted-foreground">Client</th>
                        <th className="text-left p-4 font-semibold text-muted-foreground hidden md:table-cell">Email</th>
                        <th className="text-left p-4 font-semibold text-muted-foreground">Total</th>
                        <th className="text-center p-4 font-semibold text-muted-foreground">Statut</th>
                        <th className="text-left p-4 font-semibold text-muted-foreground hidden sm:table-cell">Date</th>
                        <th className="text-right p-4 font-semibold text-muted-foreground">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredOrders.map((o) => {
                        const cfg = statusConfig[o.status];
                        return (
                          <tr key={o.id} className="border-b border-border last:border-0 hover:bg-muted/20 transition-colors">
                            <td className="p-4">
                              <p className="font-medium text-foreground">{o.customer_name}</p>
                              <p className="text-xs text-muted-foreground">{o.items.length} produit(s)</p>
                            </td>
                            <td className="p-4 hidden md:table-cell text-muted-foreground">{o.customer_email}</td>
                            <td className="p-4"><span className="text-foreground font-semibold">{o.total_price.toLocaleString()} CFA</span></td>
                            <td className="p-4 text-center">
                              <span className={`inline-flex items-center gap-1 text-xs px-2.5 py-1 rounded-full font-medium ${cfg.color}`}>
                                <cfg.icon size={12} /> {cfg.label}
                              </span>
                            </td>
                            <td className="p-4 hidden sm:table-cell text-xs text-muted-foreground">{new Date(o.created_at).toLocaleDateString("fr-FR")}</td>
                            <td className="p-4 text-right">
                              <div className="flex items-center justify-end gap-1">
                                <button onClick={() => setViewingOrder(o)} className="p-2 rounded-lg text-muted-foreground hover:text-primary hover:bg-primary/5 transition-all"><Eye size={16} /></button>
                                <button onClick={() => deleteOrder(o.id)} disabled={deleting === o.id} className="p-2 rounded-lg text-muted-foreground hover:text-destructive hover:bg-destructive/5 transition-all disabled:opacity-50">
                                  {deleting === o.id ? <Loader2 size={16} className="animate-spin" /> : <Trash2 size={16} />}
                                </button>
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default Admin;

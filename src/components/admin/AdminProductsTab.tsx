import { useState, useMemo, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";
import {
  Package, Plus, Pencil, Trash2, Save, X, Eye, Star,
  Search, Upload, Loader2, Filter, ExternalLink,
  Globe, FileEdit, CheckCircle2, Image as ImageIcon
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";
import { formatCurrency } from "@/lib/currency";
import { categories as CATEGORIES, allProducts as STATIC_PRODUCTS } from "@/data/products";
import { RichDescriptionEditor } from "@/components/products/RichDescriptionEditor";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";

interface Props {
  logAction: (action: string, details: string) => Promise<void>;
}

interface ProductRow {
  id: string; title: string; image_url: string; old_price: string; price: string;
  category: string; rating: number; tag: string; description: string;
  payment_link: string; image_urls: string[]; key_features: string[];
  sort_order: number; featured: boolean; status: string; vendor_id: string;
  created_at: string; vendors?: { shop_name: string } | null;
  isStatic?: boolean;
}

const EMPTY: Partial<ProductRow> = {
  id: "", title: "", image_url: "", old_price: "", price: "",
  category: "Business", rating: 5, tag: "", description: "",
  payment_link: "", image_urls: [], key_features: [],
  sort_order: 0, featured: false, status: "published", vendor_id: "",
};

const AdminProductsTab = ({ logAction }: Props) => {
  const [search, setSearch] = useState("");
  const [filterCat, setFilterCat] = useState("Tous");
  const [filterStatus, setFilterStatus] = useState<"all"|"published"|"draft">("all");
  const [editing, setEditing] = useState<Partial<ProductRow> | null>(null);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState<{id:string;label:string}|null>(null);
  const [deleting, setDeleting] = useState(false);
  const [featureDraft, setFeatureDraft] = useState("");
  const fileRef = useRef<HTMLInputElement>(null);

  // ─── Queries ───
  const { data: products = [], isLoading, refetch } = useQuery({
    queryKey: ["admin-all-products"],
    queryFn: async () => {
      const { data, error } = await (supabase as any)
        .from("products")
        .select("*, vendors(shop_name)")
        .order("created_at", { ascending: false });
      if (error) throw error;
      
      const dbProducts = (data || []) as ProductRow[];
      
      // Combine with static products to show EVERYTHING in admin
      const combined = [...dbProducts];
      STATIC_PRODUCTS.forEach(sp => {
        if (!combined.some(p => p.id === sp.id)) {
          combined.push({
            id: sp.id,
            title: sp.title,
            image_url: sp.image,
            old_price: sp.oldPrice,
            price: sp.price,
            category: sp.category,
            rating: sp.rating || 5,
            tag: sp.tag || "",
            description: sp.description || "",
            payment_link: sp.paymentLink || "",
            image_urls: sp.imageUrls || [],
            key_features: sp.keyFeatures || [],
            sort_order: 99,
            featured: false,
            status: "published",
            vendor_id: sp.vendorId || "",
            created_at: new Date().toISOString(),
            vendors: null,
            isStatic: true
          } as any);
        }
      });
      
      return combined;
    },
  });

  const { data: vendors = [] } = useQuery({
    queryKey: ["admin-vendors-list"],
    queryFn: async () => {
      const { data, error } = await supabase.from("vendors").select("id, shop_name");
      if (error) throw error;
      return data || [];
    },
  });

  // ─── Stats ───
  const stats = useMemo(() => {
    const total = products.length;
    const published = products.filter(p => p.status === "published").length;
    const draft = products.filter(p => p.status === "draft").length;
    const featured = products.filter(p => p.featured).length;
    return { total, published, draft, featured };
  }, [products]);

  // ─── Filtered ───
  const filtered = useMemo(() => {
    return products.filter(p => {
      const matchSearch = p.title.toLowerCase().includes(search.toLowerCase());
      const matchCat = filterCat === "Tous" || p.category === filterCat;
      const matchStatus = filterStatus === "all" || p.status === filterStatus;
      return matchSearch && matchCat && matchStatus;
    });
  }, [products, search, filterCat, filterStatus]);

  // ─── Handlers ───
  const handleImageUpload = async (file: File) => {
    if (!editing) return;
    setUploading(true);
    const fileName = `admin/${Date.now()}-${Math.random().toString(36).slice(2)}.${file.name.split('.').pop()}`;
    const { error } = await supabase.storage.from("product-images").upload(fileName, file);
    if (error) { toast.error(error.message); setUploading(false); return; }
    const { data } = supabase.storage.from("product-images").getPublicUrl(fileName);
    setEditing({ ...editing, image_url: data.publicUrl });
    setUploading(false);
    toast.success("Image uploadée");
  };

  const handleSave = async () => {
    if (!editing || !editing.title?.trim()) { toast.error("Titre requis"); return; }
    setSaving(true);
    const isStatic = !!editing.isStatic;
    const isNew = !products.find(p => p.id === editing.id) || isStatic;
    const slug = (editing.title || "").toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g,"").replace(/[^a-z0-9]+/g,"-").replace(/^-+|-+$/g,"").slice(0,50);
    const payload: any = {
      title: editing.title?.trim(),
      description: editing.description?.trim() || null,
      category: editing.category || "Business",
      price: editing.price?.trim() || "0",
      old_price: editing.old_price?.trim() || editing.price?.trim() || "0",
      image_url: editing.image_url || "",
      image_urls: editing.image_urls?.length ? editing.image_urls : null,
      payment_link: editing.payment_link?.trim() || null,
      key_features: editing.key_features || [],
      vendor_id: editing.vendor_id || null,
      status: editing.status || "published",
      featured: editing.featured || false,
      sort_order: editing.sort_order || 0,
      tag: editing.tag || null,
      rating: editing.rating || 5,
    };
    
    // Build ID: static products keep their existing ID, new products get slug+timestamp
    if (isStatic) {
      payload.id = editing.id; // Keep static product ID for upsert override
    } else if (isNew) {
      // products.id is TEXT PRIMARY KEY with no default — use UUID suffix for uniqueness
      payload.id = `${slug}-${crypto.randomUUID().slice(0, 8)}`;
    }

    try {
      const { error } = isStatic
        ? await (supabase as any).from("products").upsert([payload]) // Override static product
        : isNew
          ? await (supabase as any).from("products").insert([payload]) // New product
          : await (supabase as any).from("products").update(payload).eq("id", editing.id);
      if (error) throw error;
      toast.success(isStatic ? "Produit système importé et modifié ✓" : isNew ? "Produit créé ✨" : "Produit mis à jour ✓");
      setEditing(null);
      refetch();
      logAction(isNew ? "PRODUCT_ADD" : "PRODUCT_UPDATE", `${editing.title}`);
    } catch (err: any) {
      toast.error(err.message);
    } finally { setSaving(false); }
  };

  const handleDelete = async () => {
    if (!deleteConfirm) return;
    setDeleting(true);
    const { error } = await (supabase as any).from("products").delete().eq("id", deleteConfirm.id);
    setDeleting(false);
    setDeleteConfirm(null);
    if (error) { toast.error(error.message); return; }
    toast.success("Produit supprimé");
    refetch();
    logAction("PRODUCT_DELETE", deleteConfirm.label);
  };

  const toggleStatus = async (p: ProductRow) => {
    const newStatus = p.status === "published" ? "draft" : "published";
    const { error } = await (supabase as any).from("products").update({ status: newStatus }).eq("id", p.id);
    if (error) { toast.error(error.message); return; }
    toast.success(`${p.title} → ${newStatus === "published" ? "Publié" : "Brouillon"}`);
    refetch();
    logAction("PRODUCT_STATUS", `${p.title} → ${newStatus}`);
  };

  const toggleFeatured = async (p: ProductRow) => {
    const { error } = await (supabase as any).from("products").update({ featured: !p.featured }).eq("id", p.id);
    if (error) { toast.error(error.message); return; }
    toast.success(`${p.title} → ${!p.featured ? "En vedette ⭐" : "Normal"}`);
    refetch();
    logAction("PRODUCT_FEATURED", `${p.title} → ${!p.featured ? "featured" : "normal"}`);
  };

  const addFeature = () => {
    if (!editing || !featureDraft.trim()) return;
    setEditing({ ...editing, key_features: [...(editing.key_features || []), featureDraft.trim()] });
    setFeatureDraft("");
  };

  // ─── RENDER ───
  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: "Total Produits", value: stats.total, icon: Package, color: "text-primary" },
          { label: "Publiés", value: stats.published, icon: Globe, color: "text-emerald-500" },
          { label: "Brouillons", value: stats.draft, icon: FileEdit, color: "text-amber-500" },
          { label: "En vedette", value: stats.featured, icon: Star, color: "text-yellow-500" },
        ].map((s, i) => (
          <div key={i} className="stat-card rounded-2xl p-5 border-glow">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center bg-muted/50 mb-3 ${s.color}`}><s.icon size={18} /></div>
            <p className="text-2xl font-black tracking-tighter">{s.value}</p>
            <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Controls */}
      <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
        <div className="flex flex-wrap gap-3 items-center">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={16} />
            <Input placeholder="Rechercher..." className="pl-10 h-11 bg-card rounded-2xl w-64" value={search} onChange={e => setSearch(e.target.value)} />
          </div>
          <select value={filterCat} onChange={e => setFilterCat(e.target.value)} className="h-11 rounded-2xl bg-card border border-border px-4 text-sm font-bold">
            {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
          <select value={filterStatus} onChange={e => setFilterStatus(e.target.value as any)} className="h-11 rounded-2xl bg-card border border-border px-4 text-sm font-bold">
            <option value="all">Tous statuts</option>
            <option value="published">Publiés</option>
            <option value="draft">Brouillons</option>
          </select>
        </div>
        <Button onClick={() => setEditing({...EMPTY})} className="rounded-2xl gap-2 font-black">
          <Plus size={18} /> Nouveau produit
        </Button>
      </div>

      {/* Table */}
      <div className="stat-card rounded-3xl overflow-hidden border-glow">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead>
              <tr className="bg-muted/30 border-b border-border">
                <th className="p-4 text-[10px] font-black uppercase tracking-widest w-12"></th>
                <th className="p-4 text-[10px] font-black uppercase tracking-widest">Produit</th>
                <th className="p-4 text-[10px] font-black uppercase tracking-widest">Vendeur</th>
                <th className="p-4 text-[10px] font-black uppercase tracking-widest">Catégorie</th>
                <th className="p-4 text-[10px] font-black uppercase tracking-widest">Prix</th>
                <th className="p-4 text-[10px] font-black uppercase tracking-widest text-center">Statut</th>
                <th className="p-4 text-[10px] font-black uppercase tracking-widest text-center">Vedette</th>
                <th className="p-4 text-[10px] font-black uppercase tracking-widest text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {isLoading ? (
                Array(5).fill(0).map((_, i) => <tr key={i}><td colSpan={8} className="p-4"><Skeleton className="h-14 w-full rounded-xl" /></td></tr>)
              ) : filtered.length === 0 ? (
                <tr><td colSpan={8} className="p-12 text-center text-muted-foreground font-bold text-sm">Aucun produit trouvé</td></tr>
              ) : filtered.map(p => (
                <tr key={p.id} className="group hover:bg-muted/30 transition-colors">
                  <td className="p-4">
                    <div className="h-12 w-12 rounded-xl bg-muted overflow-hidden border border-border">
                      {p.image_url ? <img src={p.image_url} className="w-full h-full object-cover" /> : <ImageIcon size={20} className="m-auto mt-3 text-muted-foreground" />}
                    </div>
                  </td>
                  <td className="p-4">
                    <p className="font-bold text-sm truncate max-w-[200px]">{p.title}</p>
                    <p className="text-[10px] text-muted-foreground font-mono">{p.id.slice(0,12)}...</p>
                  </td>
                  <td className="p-4">
                    <span className="text-xs font-bold">
                      {p.isStatic ? (
                        <Badge variant="secondary" className="text-[8px] bg-blue-500/10 text-blue-500 border-blue-500/20">SYSTÈME</Badge>
                      ) : (
                        (p.vendors as any)?.shop_name || <span className="text-muted-foreground italic">Admin</span>
                      )}
                    </span>
                  </td>
                  <td className="p-4"><Badge variant="outline" className="text-[9px] font-black uppercase">{p.category}</Badge></td>
                  <td className="p-4">
                    <p className="font-black text-sm">{formatCurrency(p.price)}</p>
                    {p.old_price && p.old_price !== p.price && <p className="text-[10px] text-muted-foreground line-through">{formatCurrency(p.old_price)}</p>}
                  </td>
                  <td className="p-4 text-center">
                    <button onClick={() => toggleStatus(p)} className={`px-3 py-1.5 rounded-full text-[9px] font-black uppercase transition-all ${p.status === "published" ? "bg-emerald-500/10 text-emerald-500 border border-emerald-500/20" : "bg-amber-500/10 text-amber-600 border border-amber-500/20"}`}>
                      {p.status === "published" ? "PUBLIÉ" : "BROUILLON"}
                    </button>
                  </td>
                  <td className="p-4 text-center">
                    <button onClick={() => toggleFeatured(p)} className={`p-2 rounded-lg transition-all ${p.featured ? "bg-yellow-500/10 text-yellow-500" : "bg-muted/30 text-muted-foreground hover:text-yellow-500"}`}>
                      <Star size={16} fill={p.featured ? "currentColor" : "none"} />
                    </button>
                  </td>
                  <td className="p-4 text-right">
                    <div className="flex items-center justify-end gap-1">
                      <Link to={`/produit/${p.id}`} target="_blank"><Button variant="ghost" size="icon" className="h-8 w-8"><Eye size={14} /></Button></Link>
                      <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setEditing(p)}><Pencil size={14} /></Button>
                      <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive" onClick={() => setDeleteConfirm({ id: p.id, label: p.title })}><Trash2 size={14} /></Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* ─── Edit Sheet ─── */}
      <Sheet open={!!editing} onOpenChange={o => !o && setEditing(null)}>
        <SheetContent className="w-full sm:max-w-2xl border-border p-0 overflow-y-auto hide-scrollbar bg-card">
          {editing && (
            <div className="p-8 space-y-8">
              <SheetHeader>
                <SheetTitle className="text-2xl font-black">{editing.id ? "Modifier le produit" : "Nouveau produit"}</SheetTitle>
              </SheetHeader>

              {/* Image */}
              <div onClick={() => fileRef.current?.click()} className="aspect-video rounded-2xl border-2 border-dashed border-border bg-muted/20 flex items-center justify-center cursor-pointer hover:border-primary overflow-hidden relative max-h-48">
                {editing.image_url ? <img src={editing.image_url} className="w-full h-full object-cover" /> : <Upload size={32} className="text-muted-foreground" />}
                {uploading && <div className="absolute inset-0 bg-background/80 flex items-center justify-center"><Loader2 className="animate-spin" /></div>}
                <input ref={fileRef} type="file" className="hidden" accept="image/*" onChange={e => e.target.files?.[0] && handleImageUpload(e.target.files[0])} />
              </div>

              {/* Fields */}
              <div className="space-y-4">
                <div>
                  <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Titre</label>
                  <Input value={editing.title || ""} onChange={e => setEditing({...editing, title: e.target.value})} className="mt-1 rounded-xl" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Prix</label>
                    <Input value={editing.price || ""} onChange={e => setEditing({...editing, price: e.target.value})} className="mt-1 rounded-xl" />
                  </div>
                  <div>
                    <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Ancien prix</label>
                    <Input value={editing.old_price || ""} onChange={e => setEditing({...editing, old_price: e.target.value})} className="mt-1 rounded-xl" />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Catégorie</label>
                    <select value={editing.category || "Business"} onChange={e => setEditing({...editing, category: e.target.value})} className="mt-1 w-full h-10 rounded-xl bg-muted/20 border border-border px-3 text-sm font-bold">
                      {CATEGORIES.filter(c => c !== "Tous").map(c => <option key={c} value={c}>{c}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Vendeur</label>
                    <select value={editing.vendor_id || ""} onChange={e => setEditing({...editing, vendor_id: e.target.value})} className="mt-1 w-full h-10 rounded-xl bg-muted/20 border border-border px-3 text-sm font-bold">
                      <option value="">— Admin (aucun vendeur) —</option>
                      {vendors.map((v: any) => <option key={v.id} value={v.id}>{v.shop_name}</option>)}
                    </select>
                  </div>
                </div>
                <div>
                  <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Lien de paiement</label>
                  <Input value={editing.payment_link || ""} onChange={e => setEditing({...editing, payment_link: e.target.value})} placeholder="https://..." className="mt-1 rounded-xl" />
                </div>
                <div>
                  <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Description</label>
                  <RichDescriptionEditor value={editing.description || ""} onChange={val => setEditing({...editing, description: val})} title={editing.title || ""} category={editing.category || ""} />
                </div>
                <div>
                  <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-2 block">Caractéristiques clés</label>
                  <div className="flex gap-2 mb-2">
                    <Input value={featureDraft} onChange={e => setFeatureDraft(e.target.value)} onKeyDown={e => e.key === "Enter" && (e.preventDefault(), addFeature())} placeholder="Ajouter..." className="rounded-xl" />
                    <Button type="button" onClick={addFeature} size="sm" className="rounded-xl"><Plus size={14} /></Button>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {(editing.key_features || []).map((f, i) => (
                      <Badge key={i} variant="outline" className="gap-1 pr-1 font-medium">{f}<button onClick={() => setEditing({...editing, key_features: (editing.key_features||[]).filter((_,j)=>j!==i)})} className="ml-1 hover:text-destructive"><X size={10}/></button></Badge>
                    ))}
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Tag</label>
                    <Input value={editing.tag || ""} onChange={e => setEditing({...editing, tag: e.target.value})} placeholder="Promo, Nouveau..." className="mt-1 rounded-xl" />
                  </div>
                  <div>
                    <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Ordre</label>
                    <Input type="number" value={editing.sort_order || 0} onChange={e => setEditing({...editing, sort_order: parseInt(e.target.value)||0})} className="mt-1 rounded-xl" />
                  </div>
                  <div>
                    <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Note</label>
                    <Input type="number" step="0.1" min="0" max="5" value={editing.rating || 5} onChange={e => setEditing({...editing, rating: parseFloat(e.target.value)||5})} className="mt-1 rounded-xl" />
                  </div>
                </div>
                <div className="flex items-center gap-6 pt-2">
                  <div className="flex items-center gap-3">
                    <Switch checked={editing.status === "published"} onCheckedChange={v => setEditing({...editing, status: v ? "published" : "draft"})} />
                    <span className={`text-xs font-black uppercase ${editing.status === "published" ? "text-emerald-500" : "text-amber-500"}`}>
                      {editing.status === "published" ? "Publié" : "Brouillon"}
                    </span>
                  </div>
                  <div className="flex items-center gap-3">
                    <Switch checked={editing.featured || false} onCheckedChange={v => setEditing({...editing, featured: v})} />
                    <span className={`text-xs font-black uppercase ${editing.featured ? "text-yellow-500" : "text-muted-foreground"}`}>
                      {editing.featured ? "En vedette ⭐" : "Normal"}
                    </span>
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="flex justify-end gap-3 pt-6 border-t border-border">
                <Button variant="ghost" onClick={() => setEditing(null)}>Annuler</Button>
                <Button onClick={handleSave} disabled={saving} className="rounded-xl px-8 font-black gap-2">
                  {saving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
                  Enregistrer
                </Button>
              </div>
            </div>
          )}
        </SheetContent>
      </Sheet>

      {/* Delete Dialog */}
      <AlertDialog open={!!deleteConfirm} onOpenChange={o => !o && setDeleteConfirm(null)}>
        <AlertDialogContent className="rounded-3xl border-border bg-card">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-xl font-bold">Confirmer la suppression</AlertDialogTitle>
            <AlertDialogDescription>Supprimer définitivement "{deleteConfirm?.label}" ? Cette action est irréversible.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="rounded-xl">Annuler</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} disabled={deleting} className="rounded-xl bg-destructive text-destructive-foreground hover:bg-destructive/90 font-bold uppercase text-[10px] tracking-widest">
              {deleting ? <Loader2 size={14} className="animate-spin mr-2" /> : null} Supprimer
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default AdminProductsTab;

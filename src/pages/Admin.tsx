import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Plus, Pencil, Trash2, Save, X, LogOut, ArrowLeft, Loader2 } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useProducts } from "@/hooks/useProducts";
import { supabase } from "@/integrations/supabase/client";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "@/hooks/use-toast";
import { categories, type Category } from "@/data/products";
import Navbar from "@/components/Navbar";

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
  featured: boolean;
  sort_order: string;
}

const emptyForm: ProductForm = {
  id: "",
  title: "",
  image_url: "",
  old_price: "",
  price: "",
  category: "Formations",
  rating: "",
  tag: "",
  description: "",
  featured: false,
  sort_order: "0",
};

const Admin = () => {
  const { user, loading: authLoading, signOut } = useAuth();
  const navigate = useNavigate();
  const { data: products = [], isLoading } = useProducts();
  const queryClient = useQueryClient();
  const [editing, setEditing] = useState<ProductForm | null>(null);
  const [isNew, setIsNew] = useState(false);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState<string | null>(null);

  if (authLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="animate-spin text-primary" size={32} />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="pt-24 text-center space-y-4">
          <h1 className="text-2xl font-bold text-foreground">Accès réservé</h1>
          <p className="text-muted-foreground">Veuillez vous connecter pour accéder au panneau d'administration.</p>
          <button
            onClick={() => navigate("/mon-compte")}
            className="btn-primary-brand px-6 py-3 rounded-xl font-semibold text-sm"
          >
            Se connecter
          </button>
        </div>
      </div>
    );
  }

  const openNew = () => {
    setEditing({ ...emptyForm, sort_order: String(products.length) });
    setIsNew(true);
  };

  const openEdit = (p: typeof products[0]) => {
    setEditing({
      id: p.id,
      title: p.title,
      image_url: p.image,
      old_price: p.oldPrice,
      price: p.price,
      category: p.category,
      rating: p.rating?.toString() ?? "",
      tag: p.tag ?? "",
      description: p.description ?? "",
      featured: false,
      sort_order: "0",
    });
    setIsNew(false);
  };

  const handleSave = async () => {
    if (!editing) return;
    if (!editing.id.trim() || !editing.title.trim() || !editing.price.trim() || !editing.old_price.trim()) {
      toast({ title: "Champs requis manquants", description: "ID, titre, ancien prix et prix sont obligatoires.", variant: "destructive" });
      return;
    }

    setSaving(true);
    const payload = {
      id: editing.id.trim(),
      title: editing.title.trim(),
      image_url: editing.image_url.trim(),
      old_price: editing.old_price.trim(),
      price: editing.price.trim(),
      category: editing.category,
      rating: editing.rating ? parseFloat(editing.rating) : null,
      tag: editing.tag.trim() || null,
      description: editing.description.trim() || null,
      featured: editing.featured,
      sort_order: parseInt(editing.sort_order) || 0,
    };

    const { error } = isNew
      ? await supabase.from("products").insert(payload)
      : await supabase.from("products").update(payload).eq("id", editing.id);

    setSaving(false);

    if (error) {
      toast({ title: "Erreur", description: error.message, variant: "destructive" });
      return;
    }

    toast({ title: isNew ? "Produit ajouté ✓" : "Produit mis à jour ✓" });
    setEditing(null);
    queryClient.invalidateQueries({ queryKey: ["products"] });
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Supprimer ce produit définitivement ?")) return;
    setDeleting(id);
    const { error } = await supabase.from("products").delete().eq("id", id);
    setDeleting(null);
    if (error) {
      toast({ title: "Erreur", description: error.message, variant: "destructive" });
      return;
    }
    toast({ title: "Produit supprimé ✓" });
    queryClient.invalidateQueries({ queryKey: ["products"] });
  };

  const handleChange = (field: keyof ProductForm, value: string | boolean) => {
    if (!editing) return;
    setEditing({ ...editing, [field]: value });
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="pt-20 pb-12 container mx-auto px-4 max-w-5xl">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <button onClick={() => navigate("/")} className="text-muted-foreground hover:text-foreground transition-colors">
              <ArrowLeft size={20} />
            </button>
            <h1 className="text-2xl font-bold text-foreground">Administration</h1>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={openNew}
              className="btn-primary-brand flex items-center gap-2 px-5 py-2.5 rounded-xl font-semibold text-sm"
            >
              <Plus size={16} /> Ajouter
            </button>
            <button
              onClick={async () => { await signOut(); navigate("/"); }}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm border border-border text-muted-foreground hover:text-foreground hover:border-primary/30 transition-all"
            >
              <LogOut size={16} /> Déconnexion
            </button>
          </div>
        </div>

        {/* Edit form */}
        {editing && (
          <div className="stat-card rounded-2xl p-6 mb-8 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="font-bold text-foreground">{isNew ? "Nouveau produit" : "Modifier le produit"}</h2>
              <button onClick={() => setEditing(null)} className="text-muted-foreground hover:text-foreground"><X size={20} /></button>
            </div>

            <div className="grid sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-muted-foreground">ID (slug unique)</label>
                <input
                  value={editing.id}
                  onChange={(e) => handleChange("id", e.target.value)}
                  disabled={!isNew}
                  className="w-full px-3 py-2 rounded-lg border border-border bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 disabled:opacity-50"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-muted-foreground">Titre</label>
                <input
                  value={editing.title}
                  onChange={(e) => handleChange("title", e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-border bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-muted-foreground">Ancien prix</label>
                <input
                  value={editing.old_price}
                  onChange={(e) => handleChange("old_price", e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-border bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-muted-foreground">Prix</label>
                <input
                  value={editing.price}
                  onChange={(e) => handleChange("price", e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-border bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-muted-foreground">Catégorie</label>
                <select
                  value={editing.category}
                  onChange={(e) => handleChange("category", e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-border bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
                >
                  {categories.filter(c => c !== "Tous").map(c => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-muted-foreground">Note (ex: 4.5)</label>
                <input
                  value={editing.rating}
                  onChange={(e) => handleChange("rating", e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-border bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-muted-foreground">URL de l'image</label>
                <input
                  value={editing.image_url}
                  onChange={(e) => handleChange("image_url", e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-border bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-muted-foreground">Ordre d'affichage</label>
                <input
                  value={editing.sort_order}
                  onChange={(e) => handleChange("sort_order", e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-border bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-medium text-muted-foreground">Description</label>
              <textarea
                value={editing.description}
                onChange={(e) => handleChange("description", e.target.value)}
                rows={3}
                className="w-full px-3 py-2 rounded-lg border border-border bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 resize-none"
              />
            </div>

            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="featured"
                checked={editing.featured}
                onChange={(e) => handleChange("featured", e.target.checked)}
                className="accent-primary"
              />
              <label htmlFor="featured" className="text-sm text-foreground">Produit phare (affiché sur l'accueil)</label>
            </div>

            <div className="flex justify-end gap-3 pt-2">
              <button onClick={() => setEditing(null)} className="px-5 py-2.5 rounded-xl text-sm border border-border text-muted-foreground hover:text-foreground transition-all">
                Annuler
              </button>
              <button onClick={handleSave} disabled={saving} className="btn-primary-brand flex items-center gap-2 px-6 py-2.5 rounded-xl font-semibold text-sm">
                {saving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
                {isNew ? "Ajouter" : "Enregistrer"}
              </button>
            </div>
          </div>
        )}

        {/* Products list */}
        {isLoading ? (
          <div className="flex justify-center py-12"><Loader2 className="animate-spin text-primary" size={28} /></div>
        ) : (
          <div className="stat-card rounded-2xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left p-4 font-semibold text-muted-foreground">Image</th>
                    <th className="text-left p-4 font-semibold text-muted-foreground">Titre</th>
                    <th className="text-left p-4 font-semibold text-muted-foreground hidden sm:table-cell">Catégorie</th>
                    <th className="text-left p-4 font-semibold text-muted-foreground">Prix</th>
                    <th className="text-right p-4 font-semibold text-muted-foreground">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {products.map((p) => (
                    <tr key={p.id} className="border-b border-border last:border-0 hover:bg-muted/30 transition-colors">
                      <td className="p-4">
                        <img src={p.image} alt={p.title} className="w-10 h-10 rounded-lg object-cover" />
                      </td>
                      <td className="p-4">
                        <p className="font-medium text-foreground truncate max-w-[200px]">{p.title}</p>
                      </td>
                      <td className="p-4 hidden sm:table-cell">
                        <span className="badge-purple text-xs px-2 py-0.5 rounded-full">{p.category}</span>
                      </td>
                      <td className="p-4">
                        <span className="text-foreground font-semibold">{p.price}</span>
                      </td>
                      <td className="p-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => openEdit(p)}
                            className="p-2 rounded-lg text-muted-foreground hover:text-primary hover:bg-primary/5 transition-all"
                          >
                            <Pencil size={16} />
                          </button>
                          <button
                            onClick={() => handleDelete(p.id)}
                            disabled={deleting === p.id}
                            className="p-2 rounded-lg text-muted-foreground hover:text-destructive hover:bg-destructive/5 transition-all disabled:opacity-50"
                          >
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
      </div>
    </div>
  );
};

export default Admin;

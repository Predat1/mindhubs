import { useEffect, useState } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import { useQueryClient } from "@tanstack/react-query";
import Navbar from "@/components/Navbar";
import FooterSection from "@/components/FooterSection";
import SEO from "@/components/SEO";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useAuth } from "@/contexts/AuthContext";
import { useCurrentVendor } from "@/hooks/useVendors";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { ArrowLeft, Upload, Loader2 } from "lucide-react";

const CATEGORIES = ["Business", "Formations", "Kits", "Livres", "Logiciels", "Packs Enfants"];

const VendorProductForm = () => {
  const { id } = useParams<{ id: string }>();
  const isEdit = !!id;
  const navigate = useNavigate();
  const { user, loading } = useAuth();
  const { data: vendor, isLoading: vendorLoading } = useCurrentVendor();
  const queryClient = useQueryClient();

  const [form, setForm] = useState({
    id: "",
    title: "",
    description: "",
    category: "Formations",
    price: "",
    old_price: "",
    image_url: "",
    payment_link: "",
    key_features: "",
  });
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!loading && !user) navigate("/mon-compte");
    if (!loading && !vendorLoading && user && !vendor) navigate("/become-a-seller");
  }, [loading, user, vendor, vendorLoading, navigate]);

  useEffect(() => {
    if (isEdit && id) {
      supabase.from("products").select("*").eq("id", id).maybeSingle().then(({ data }) => {
        if (data) {
          setForm({
            id: data.id,
            title: data.title,
            description: data.description || "",
            category: data.category,
            price: data.price,
            old_price: data.old_price,
            image_url: data.image_url,
            payment_link: data.payment_link || "",
            key_features: (data.key_features || []).join("\n"),
          });
        }
      });
    }
  }, [id, isEdit]);

  const handleUpload = async (file: File) => {
    if (!user) return;
    setUploading(true);
    try {
      const ext = file.name.split(".").pop();
      const path = `${user.id}/${Date.now()}.${ext}`;
      const { error } = await supabase.storage.from("product-images").upload(path, file, { upsert: false });
      if (error) throw error;
      const { data } = supabase.storage.from("product-images").getPublicUrl(path);
      setForm((f) => ({ ...f, image_url: data.publicUrl }));
      toast({ title: "Image uploadée" });
    } catch (e: any) {
      toast({ title: "Erreur upload", description: e.message, variant: "destructive" });
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!vendor) return;
    if (!form.title.trim() || !form.price.trim() || !form.image_url.trim()) {
      toast({ title: "Champs requis", description: "Titre, prix et image sont obligatoires", variant: "destructive" });
      return;
    }
    setSaving(true);
    try {
      const slug = (form.id || form.title).toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "").slice(0, 50);
      const productData = {
        id: isEdit ? form.id : `${slug}-${Date.now().toString(36)}`,
        title: form.title.trim(),
        description: form.description.trim() || null,
        category: form.category,
        price: form.price.trim(),
        old_price: form.old_price.trim() || form.price.trim(),
        image_url: form.image_url,
        payment_link: form.payment_link.trim() || null,
        key_features: form.key_features.split("\n").map((s) => s.trim()).filter(Boolean),
        vendor_id: vendor.id,
      };

      const { error } = isEdit
        ? await supabase.from("products").update(productData).eq("id", form.id)
        : await supabase.from("products").insert(productData);

      if (error) throw error;
      toast({ title: isEdit ? "Produit mis à jour" : "Produit créé 🎉" });
      queryClient.invalidateQueries({ queryKey: ["products"] });
      queryClient.invalidateQueries({ queryKey: ["vendor-products"] });
      navigate("/dashboard");
    } catch (e: any) {
      toast({ title: "Erreur", description: e.message, variant: "destructive" });
    } finally {
      setSaving(false);
    }
  };

  if (loading || vendorLoading || !vendor) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="container mx-auto px-4 pt-32"><div className="stat-card h-48 rounded-2xl animate-pulse" /></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <SEO title={isEdit ? "Modifier produit" : "Nouveau produit"} description="Gérez vos produits." path="/dashboard/new-product" />
      <Navbar />

      <section className="container mx-auto px-4 pt-28 sm:pt-32 pb-12 max-w-3xl">
        <Link to="/dashboard" className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground mb-4">
          <ArrowLeft size={14} /> Retour au dashboard
        </Link>

        <form onSubmit={handleSubmit} className="stat-card rounded-2xl p-5 sm:p-7 space-y-4">
          <h1 className="text-xl font-bold text-foreground">{isEdit ? "Modifier le produit" : "Nouveau produit"}</h1>

          <div className="space-y-1.5">
            <Label htmlFor="title">Titre *</Label>
            <Input id="title" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} required maxLength={150} />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="description">Description</Label>
            <Textarea id="description" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} rows={6} />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="category">Catégorie</Label>
              <select id="category" value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} className="w-full h-10 px-3 rounded-md border border-input bg-background text-sm">
                {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="payment_link">Lien de paiement</Label>
              <Input id="payment_link" type="url" value={form.payment_link} onChange={(e) => setForm({ ...form, payment_link: e.target.value })} placeholder="https://..." />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="price">Prix *</Label>
              <Input id="price" value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} placeholder="5000 FCFA" required />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="old_price">Ancien prix</Label>
              <Input id="old_price" value={form.old_price} onChange={(e) => setForm({ ...form, old_price: e.target.value })} placeholder="10000 FCFA" />
            </div>
          </div>

          <div className="space-y-1.5">
            <Label>Image principale *</Label>
            <div className="flex items-center gap-3">
              {form.image_url && <img src={form.image_url} alt="" className="w-16 h-16 rounded-lg object-cover" />}
              <label className="inline-flex items-center gap-2 px-3 py-2 rounded-md border border-input bg-background hover:bg-accent text-sm cursor-pointer">
                {uploading ? <Loader2 size={14} className="animate-spin" /> : <Upload size={14} />}
                {uploading ? "Upload…" : "Choisir une image"}
                <input type="file" accept="image/*" className="hidden" onChange={(e) => e.target.files?.[0] && handleUpload(e.target.files[0])} />
              </label>
            </div>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="key_features">Caractéristiques clés (une par ligne)</Label>
            <Textarea id="key_features" value={form.key_features} onChange={(e) => setForm({ ...form, key_features: e.target.value })} rows={4} placeholder="Accès à vie&#10;Support inclus&#10;…" />
          </div>

          <Button type="submit" disabled={saving} className="w-full">
            {saving ? "Enregistrement…" : isEdit ? "Enregistrer" : "Créer le produit"}
          </Button>
        </form>
      </section>

      <FooterSection />
    </div>
  );
};

export default VendorProductForm;

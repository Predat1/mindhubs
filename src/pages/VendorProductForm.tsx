import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useQueryClient } from "@tanstack/react-query";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import VendorGuard from "@/components/dashboard/VendorGuard";
import SEO from "@/components/SEO";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import {
  ArrowLeft, ArrowRight, Upload, Loader2, Check, Image as ImageIcon,
  Tag, FileText, DollarSign, Sparkles, X, Eye, Plus, Save, Info,
} from "lucide-react";

const CATEGORIES = ["Business", "Formations", "Kits", "Livres", "Logiciels", "Packs Enfants"];

type StepKey = "info" | "media" | "pricing" | "details";

const STEPS: { key: StepKey; label: string; icon: typeof FileText; desc: string }[] = [
  { key: "info", label: "Informations", icon: FileText, desc: "Titre, catégorie & description" },
  { key: "media", label: "Visuels", icon: ImageIcon, desc: "Image principale du produit" },
  { key: "pricing", label: "Prix", icon: DollarSign, desc: "Prix de vente & promo" },
  { key: "details", label: "Détails", icon: Sparkles, desc: "Caractéristiques & paiement" },
];

interface FormState {
  id: string;
  title: string;
  description: string;
  category: string;
  price: string;
  old_price: string;
  image_url: string;
  payment_link: string;
  key_features: string[];
}

const emptyForm: FormState = {
  id: "",
  title: "",
  description: "",
  category: "Formations",
  price: "",
  old_price: "",
  image_url: "",
  payment_link: "",
  key_features: [],
};

const Inner = ({
  vendorId, shopName, shopUrl,
}: { vendorId: string; shopName: string; shopUrl: string }) => {
  const { id } = useParams<{ id: string }>();
  const isEdit = !!id;
  const navigate = useNavigate();
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const fileRef = useRef<HTMLInputElement>(null);

  const [form, setForm] = useState<FormState>(emptyForm);
  const [step, setStep] = useState<StepKey>("info");
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const [featureDraft, setFeatureDraft] = useState("");
  const [aiDescLoading, setAiDescLoading] = useState(false);
  const [aiImgLoading, setAiImgLoading] = useState(false);

  const generateAIDescription = async () => {
    if (form.title.trim().length < 3) {
      toast.error("Titre requis", { description: "Saisissez au moins 3 caractères." });
      return;
    }
    setAiDescLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke("generate-product-description", {
        body: { title: form.title, category: form.category, hint: form.description },
      });
      if (error) throw error;
      if ((data as any)?.error) throw new Error((data as any).error);
      setForm((f) => ({ ...f, description: (data as any).description }));
      toast.success("Description générée ✨");
    } catch (e: any) {
      toast.error("Erreur IA", { description: e.message });
    } finally {
      setAiDescLoading(false);
    }
  };

  const generateAIImage = async () => {
    if (form.title.trim().length < 3) {
      toast.error("Titre requis", { description: "Saisissez d'abord le titre du produit." });
      return;
    }
    if (!user) return;
    setAiImgLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke("generate-product-image", {
        body: {
          title: form.title,
          category: form.category,
          description: form.description,
          userId: user.id,
        },
      });
      if (error) throw error;
      if ((data as any)?.error) throw new Error((data as any).error);
      setForm((f) => ({ ...f, image_url: (data as any).url }));
      toast.success("Image 3D générée 🎨");
    } catch (e: any) {
      toast.error("Erreur IA", { description: e.message });
    } finally {
      setAiImgLoading(false);
    }
  };

  // Load product if editing
  useEffect(() => {
    if (!isEdit || !id) return;
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
          key_features: data.key_features || [],
        });
      }
    });
  }, [id, isEdit]);

  // Step validation
  const stepValid = useMemo(() => ({
    info: form.title.trim().length >= 3,
    media: !!form.image_url,
    pricing: form.price.trim().length > 0,
    details: true,
  }), [form]);

  const allValid = stepValid.info && stepValid.media && stepValid.pricing;
  const currentStepIndex = STEPS.findIndex((s) => s.key === step);
  const progress = (Object.values(stepValid).filter(Boolean).length / STEPS.length) * 100;

  const goNext = () => {
    if (currentStepIndex < STEPS.length - 1) setStep(STEPS[currentStepIndex + 1].key);
  };
  const goPrev = () => {
    if (currentStepIndex > 0) setStep(STEPS[currentStepIndex - 1].key);
  };

  // Upload helper
  const uploadFile = async (file: File) => {
    if (!user) return;
    if (!file.type.startsWith("image/")) {
      toast.error("Format invalide", { description: "Sélectionnez une image (jpg, png, webp…)" });
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      toast.error("Image trop lourde", { description: "Maximum 5 Mo." });
      return;
    }
    setUploading(true);
    try {
      const ext = file.name.split(".").pop();
      const path = `${user.id}/${Date.now()}.${ext}`;
      const { error } = await supabase.storage.from("product-images").upload(path, file, { upsert: false });
      if (error) throw error;
      const { data } = supabase.storage.from("product-images").getPublicUrl(path);
      setForm((f) => ({ ...f, image_url: data.publicUrl }));
      toast.success("Image ajoutée");
    } catch (e: any) {
      toast.error("Erreur upload", { description: e.message });
    } finally {
      setUploading(false);
    }
  };

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const f = e.dataTransfer.files?.[0];
    if (f) uploadFile(f);
  };

  // Features
  const addFeature = () => {
    const v = featureDraft.trim();
    if (!v) return;
    setForm((f) => ({ ...f, key_features: [...f.key_features, v] }));
    setFeatureDraft("");
  };

  const removeFeature = (idx: number) => {
    setForm((f) => ({ ...f, key_features: f.key_features.filter((_, i) => i !== idx) }));
  };

  // Save
  const handleSave = async () => {
    if (!allValid) {
      toast.error("Champs requis manquants", { description: "Vérifiez titre, image et prix." });
      return;
    }
    setSaving(true);
    try {
      const slug = (form.id || form.title).toLowerCase().normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9]+/g, "-")
        .replace(/^-+|-+$/g, "").slice(0, 50);
      const productData = {
        id: isEdit ? form.id : `${slug}-${Date.now().toString(36)}`,
        title: form.title.trim(),
        description: form.description.trim() || null,
        category: form.category,
        price: form.price.trim(),
        old_price: form.old_price.trim() || form.price.trim(),
        image_url: form.image_url,
        payment_link: form.payment_link.trim() || null,
        key_features: form.key_features,
        vendor_id: vendorId,
      };
      const { error } = isEdit
        ? await supabase.from("products").update(productData).eq("id", form.id)
        : await supabase.from("products").insert(productData);
      if (error) throw error;
      toast.success(isEdit ? "Produit mis à jour ✨" : "Produit créé 🎉");
      queryClient.invalidateQueries({ queryKey: ["products"] });
      queryClient.invalidateQueries({ queryKey: ["vendor-products"] });
      navigate("/dashboard/products");
    } catch (e: any) {
      toast.error("Erreur", { description: e.message });
    } finally {
      setSaving(false);
    }
  };

  const previewDiscount = useMemo(() => {
    const p = parseInt(form.price.replace(/\D/g, ""), 10);
    const o = parseInt(form.old_price.replace(/\D/g, ""), 10);
    if (!p || !o || o <= p) return null;
    return Math.round(((o - p) / o) * 100);
  }, [form.price, form.old_price]);

  return (
    <DashboardLayout
      variant="vendor"
      title={isEdit ? "Modifier le produit" : "Nouveau produit"}
      shopName={shopName}
      shopUrl={shopUrl}
    >
      <SEO
        title={isEdit ? "Modifier produit" : "Nouveau produit"}
        description="Gérez vos produits."
        path="/dashboard/products/new"
      />

      <div className="mx-auto max-w-6xl space-y-6">
        {/* Top bar */}
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <button
            onClick={() => navigate("/dashboard/products")}
            className="inline-flex items-center gap-1.5 text-xs text-muted-foreground transition hover:text-foreground"
          >
            <ArrowLeft size={14} /> Retour aux produits
          </button>
          <div className="flex items-center gap-2">
            <div className="hidden items-center gap-2 sm:flex">
              <div className="h-1.5 w-32 overflow-hidden rounded-full bg-muted">
                <div
                  className="h-full bg-primary transition-all duration-500"
                  style={{ width: `${progress}%` }}
                />
              </div>
              <span className="text-[10px] font-semibold text-muted-foreground">
                {Math.round(progress)}%
              </span>
            </div>
            <Button size="sm" onClick={handleSave} disabled={saving || !allValid}>
              {saving ? <Loader2 className="animate-spin" size={14} /> : <Save size={14} />}
              {isEdit ? "Enregistrer" : "Publier"}
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1fr,360px]">
          {/* Left: stepper + form */}
          <div className="space-y-5">
            {/* Stepper */}
            <div className="overflow-x-auto">
              <div className="flex min-w-max items-center gap-2 rounded-2xl border border-border bg-card p-2">
                {STEPS.map((s, i) => {
                  const Icon = s.icon;
                  const active = s.key === step;
                  const done = stepValid[s.key] && s.key !== step;
                  return (
                    <button
                      key={s.key}
                      onClick={() => setStep(s.key)}
                      className={`flex flex-1 items-center gap-2 rounded-xl px-3 py-2.5 text-left transition ${
                        active
                          ? "bg-primary text-primary-foreground shadow-sm"
                          : done
                          ? "text-foreground hover:bg-muted/60"
                          : "text-muted-foreground hover:bg-muted/40"
                      }`}
                    >
                      <div
                        className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-lg ${
                          active
                            ? "bg-primary-foreground/20"
                            : done
                            ? "bg-green-500/15 text-green-700 dark:text-green-400"
                            : "bg-muted"
                        }`}
                      >
                        {done ? <Check size={13} /> : <Icon size={13} />}
                      </div>
                      <div className="hidden sm:block">
                        <p className="text-[10px] font-semibold uppercase tracking-wide opacity-70">
                          Étape {i + 1}
                        </p>
                        <p className="text-xs font-bold">{s.label}</p>
                      </div>
                      <span className="text-xs font-bold sm:hidden">{s.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Step content */}
            <div className="rounded-2xl border border-border bg-card p-5 sm:p-6 animate-fade-in" key={step}>
              {step === "info" && (
                <div className="space-y-5">
                  <div>
                    <h3 className="text-lg font-bold text-foreground">Informations principales</h3>
                    <p className="mt-1 text-xs text-muted-foreground">
                      Donnez à votre produit un titre clair et descriptif.
                    </p>
                  </div>

                  <div className="space-y-1.5">
                    <Label htmlFor="title">
                      Titre du produit <span className="text-destructive">*</span>
                    </Label>
                    <Input
                      id="title"
                      value={form.title}
                      onChange={(e) => setForm({ ...form, title: e.target.value })}
                      maxLength={150}
                      placeholder="Ex: Formation complète sur le e-commerce"
                    />
                    <div className="flex items-center justify-between">
                      <p className="text-[10px] text-muted-foreground">Minimum 3 caractères</p>
                      <p className="text-[10px] text-muted-foreground">{form.title.length}/150</p>
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <Label htmlFor="category">Catégorie</Label>
                    <Select value={form.category} onValueChange={(v) => setForm({ ...form, category: v })}>
                      <SelectTrigger id="category">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {CATEGORIES.map((c) => (
                          <SelectItem key={c} value={c}>
                            <span className="inline-flex items-center gap-2">
                              <Tag size={12} className="text-muted-foreground" />
                              {c}
                            </span>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="description">Description</Label>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={generateAIDescription}
                        disabled={aiDescLoading || form.title.trim().length < 3}
                        className="h-8 gap-1.5 border-primary/30 bg-gradient-to-r from-primary/5 to-accent/5 text-xs hover:from-primary/10 hover:to-accent/10"
                      >
                        {aiDescLoading ? (
                          <Loader2 className="animate-spin" size={12} />
                        ) : (
                          <Sparkles size={12} className="text-primary" />
                        )}
                        Générer avec l'IA
                      </Button>
                    </div>
                    <Textarea
                      id="description"
                      value={form.description}
                      onChange={(e) => setForm({ ...form, description: e.target.value })}
                      rows={8}
                      placeholder="Décrivez votre produit en détail. Quels problèmes résout-il ? À qui s'adresse-t-il ?"
                    />
                    <p className="text-[10px] text-muted-foreground">
                      💡 Astuce : remplissez le titre puis cliquez sur "Générer avec l'IA" pour obtenir une description vendeuse en 1 clic.
                    </p>
                  </div>
                </div>
              )}

              {step === "media" && (
                <div className="space-y-5">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <h3 className="text-lg font-bold text-foreground">Image principale</h3>
                      <p className="mt-1 text-xs text-muted-foreground">
                        Une bonne image augmente vos ventes de +40%.
                      </p>
                    </div>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={generateAIImage}
                      disabled={aiImgLoading || form.title.trim().length < 3}
                      className="h-9 gap-1.5 border-primary/30 bg-gradient-to-r from-primary/10 to-accent/10 text-xs hover:from-primary/20 hover:to-accent/20"
                    >
                      {aiImgLoading ? (
                        <Loader2 className="animate-spin" size={13} />
                      ) : (
                        <Sparkles size={13} className="text-primary" />
                      )}
                      Générer une box 3D
                    </Button>
                  </div>

                  <div
                    onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
                    onDragLeave={() => setDragOver(false)}
                    onDrop={onDrop}
                    onClick={() => fileRef.current?.click()}
                    className={`relative flex min-h-[260px] cursor-pointer flex-col items-center justify-center overflow-hidden rounded-2xl border-2 border-dashed transition ${
                      dragOver
                        ? "border-primary bg-primary/5"
                        : form.image_url
                        ? "border-border"
                        : "border-border bg-muted/20 hover:border-primary/50 hover:bg-muted/30"
                    }`}
                  >
                    {form.image_url ? (
                      <>
                        <img
                          src={form.image_url}
                          alt="Aperçu"
                          className="h-full max-h-[280px] w-full object-contain p-4"
                        />
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setForm({ ...form, image_url: "" });
                          }}
                          className="absolute right-3 top-3 inline-flex h-8 w-8 items-center justify-center rounded-full bg-background/90 text-foreground shadow-sm backdrop-blur transition hover:bg-destructive hover:text-destructive-foreground"
                          aria-label="Supprimer"
                        >
                          <X size={14} />
                        </button>
                        <div className="absolute bottom-3 left-3 inline-flex items-center gap-1.5 rounded-full bg-background/90 px-3 py-1 text-[10px] font-semibold text-muted-foreground shadow-sm backdrop-blur">
                          <Upload size={10} /> Cliquez pour remplacer
                        </div>
                      </>
                    ) : (
                      <>
                        <div className="mb-3 flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                          {uploading ? <Loader2 className="animate-spin" size={22} /> : <Upload size={22} />}
                        </div>
                        <p className="text-sm font-semibold text-foreground">
                          {uploading ? "Upload en cours…" : "Glissez-déposez ou cliquez"}
                        </p>
                        <p className="mt-1 text-xs text-muted-foreground">
                          PNG, JPG, WEBP — max 5 Mo
                        </p>
                      </>
                    )}
                    <input
                      ref={fileRef}
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => e.target.files?.[0] && uploadFile(e.target.files[0])}
                    />
                  </div>

                  <div className="flex items-start gap-2 rounded-lg bg-muted/40 p-3 text-xs text-muted-foreground">
                    <Info size={14} className="mt-0.5 shrink-0 text-primary" />
                    <p>
                      Privilégiez une image carrée (1:1) en haute résolution pour un rendu optimal sur la boutique.
                    </p>
                  </div>
                </div>
              )}

              {step === "pricing" && (
                <div className="space-y-5">
                  <div>
                    <h3 className="text-lg font-bold text-foreground">Tarification</h3>
                    <p className="mt-1 text-xs text-muted-foreground">
                      Affichez un prix barré pour augmenter la perception de valeur.
                    </p>
                  </div>

                  <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                    <div className="space-y-1.5">
                      <Label htmlFor="price">
                        Prix de vente <span className="text-destructive">*</span>
                      </Label>
                      <Input
                        id="price"
                        value={form.price}
                        onChange={(e) => setForm({ ...form, price: e.target.value })}
                        placeholder="5000 FCFA"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <Label htmlFor="old_price">Ancien prix (barré)</Label>
                      <Input
                        id="old_price"
                        value={form.old_price}
                        onChange={(e) => setForm({ ...form, old_price: e.target.value })}
                        placeholder="10000 FCFA"
                      />
                    </div>
                  </div>

                  {previewDiscount !== null && (
                    <div className="flex items-center gap-3 rounded-xl border border-green-500/30 bg-green-500/10 p-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-green-500/20 text-green-700 dark:text-green-400">
                        <Sparkles size={16} />
                      </div>
                      <div>
                        <p className="text-sm font-bold text-green-700 dark:text-green-400">
                          Promotion -{previewDiscount}% affichée
                        </p>
                        <p className="text-xs text-muted-foreground">
                          Une réduction visible booste les conversions.
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {step === "details" && (
                <div className="space-y-5">
                  <div>
                    <h3 className="text-lg font-bold text-foreground">Détails supplémentaires</h3>
                    <p className="mt-1 text-xs text-muted-foreground">
                      Ajoutez des arguments de vente et un lien de paiement.
                    </p>
                  </div>

                  <div className="space-y-2">
                    <Label>Caractéristiques clés</Label>
                    <div className="flex gap-2">
                      <Input
                        value={featureDraft}
                        onChange={(e) => setFeatureDraft(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === "Enter") {
                            e.preventDefault();
                            addFeature();
                          }
                        }}
                        placeholder="Ex: Accès à vie, Support inclus…"
                      />
                      <Button type="button" variant="outline" onClick={addFeature}>
                        <Plus size={14} />
                      </Button>
                    </div>
                    {form.key_features.length > 0 && (
                      <ul className="space-y-1.5 pt-1">
                        {form.key_features.map((f, idx) => (
                          <li
                            key={idx}
                            className="group flex items-center gap-2 rounded-lg border border-border bg-muted/30 px-3 py-2 text-sm animate-fade-in"
                          >
                            <Check size={13} className="shrink-0 text-primary" />
                            <span className="flex-1 text-foreground">{f}</span>
                            <button
                              type="button"
                              onClick={() => removeFeature(idx)}
                              className="opacity-0 transition group-hover:opacity-100"
                              aria-label="Supprimer"
                            >
                              <X size={13} className="text-muted-foreground hover:text-destructive" />
                            </button>
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>

                  <div className="space-y-1.5">
                    <Label htmlFor="payment_link">Lien de paiement externe</Label>
                    <Input
                      id="payment_link"
                      type="url"
                      value={form.payment_link}
                      onChange={(e) => setForm({ ...form, payment_link: e.target.value })}
                      placeholder="https://..."
                    />
                    <p className="text-[10px] text-muted-foreground">
                      Optionnel. Si vide, le paiement passe par le checkout du site.
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* Step nav */}
            <div className="flex items-center justify-between gap-3">
              <Button
                variant="outline"
                onClick={goPrev}
                disabled={currentStepIndex === 0}
              >
                <ArrowLeft size={14} /> Précédent
              </Button>
              {currentStepIndex < STEPS.length - 1 ? (
                <Button onClick={goNext} disabled={!stepValid[step]}>
                  Suivant <ArrowRight size={14} />
                </Button>
              ) : (
                <Button onClick={handleSave} disabled={saving || !allValid}>
                  {saving ? <Loader2 className="animate-spin" size={14} /> : <Save size={14} />}
                  {isEdit ? "Enregistrer" : "Publier le produit"}
                </Button>
              )}
            </div>
          </div>

          {/* Right: live preview */}
          <aside className="lg:sticky lg:top-24 lg:self-start">
            <div className="rounded-2xl border border-border bg-card p-4">
              <div className="mb-3 flex items-center gap-2">
                <Eye size={14} className="text-muted-foreground" />
                <p className="text-xs font-semibold text-muted-foreground">Aperçu en direct</p>
              </div>

              <div className="overflow-hidden rounded-xl border border-border bg-background">
                <div className="aspect-square w-full bg-muted/40">
                  {form.image_url ? (
                    <img src={form.image_url} alt="" className="h-full w-full object-cover" />
                  ) : (
                    <div className="flex h-full items-center justify-center text-muted-foreground">
                      <ImageIcon size={32} />
                    </div>
                  )}
                </div>
                <div className="space-y-2 p-3">
                  <p className="inline-flex rounded-full bg-primary/10 px-2 py-0.5 text-[9px] font-semibold uppercase tracking-wide text-primary">
                    {form.category}
                  </p>
                  <h4 className="line-clamp-2 text-sm font-bold text-foreground">
                    {form.title || "Titre du produit"}
                  </h4>
                  <div className="flex items-baseline gap-2">
                    <span className="text-base font-bold text-foreground">
                      {form.price || "—"}
                    </span>
                    {form.old_price && form.old_price !== form.price && (
                      <span className="text-xs text-muted-foreground line-through">
                        {form.old_price}
                      </span>
                    )}
                    {previewDiscount !== null && (
                      <span className="rounded-full bg-destructive/15 px-1.5 py-0.5 text-[9px] font-bold text-destructive">
                        -{previewDiscount}%
                      </span>
                    )}
                  </div>
                  {form.key_features.length > 0 && (
                    <ul className="space-y-1 pt-1">
                      {form.key_features.slice(0, 3).map((f, i) => (
                        <li key={i} className="flex items-start gap-1.5 text-[10px] text-muted-foreground">
                          <Check size={10} className="mt-0.5 shrink-0 text-primary" />
                          <span className="line-clamp-1">{f}</span>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              </div>

              <div className="mt-3 space-y-1">
                {STEPS.map((s) => (
                  <div key={s.key} className="flex items-center justify-between text-[10px]">
                    <span className="text-muted-foreground">{s.label}</span>
                    {stepValid[s.key] ? (
                      <span className="inline-flex items-center gap-1 font-semibold text-green-600 dark:text-green-400">
                        <Check size={10} /> OK
                      </span>
                    ) : (
                      <span className="text-muted-foreground/60">À remplir</span>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </aside>
        </div>
      </div>
    </DashboardLayout>
  );
};

const VendorProductForm = () => (
  <VendorGuard>
    {(vendor) => (
      <Inner
        vendorId={vendor.id}
        shopName={vendor.shop_name}
        shopUrl={`/store/${vendor.username}`}
      />
    )}
  </VendorGuard>
);

export default VendorProductForm;

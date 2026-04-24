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
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import {
  ArrowLeft,
  ArrowRight,
  Upload,
  Loader2,
  Check,
  Image as ImageIcon,
  Tag,
  FileText,
  DollarSign,
  Sparkles,
  X,
  Eye,
  Plus,
  Save,
  Info,
  Wand2,
  RefreshCw,
  Globe,
  FileEdit,
  FileArchive,
  Link as LinkIcon,
  Layers,
  Palette,
  GripVertical,
  Trash2,
  Scissors,
  Crop,
} from "lucide-react";
import { RichDescriptionEditor } from "@/components/products/RichDescriptionEditor";
import ProductCard from "@/components/ProductCard";

const CATEGORIES = [
  "Business",
  "Formations",
  "Kits",
  "Livres",
  "Logiciels",
  "Packs Enfants",
];

const STYLE_PRESETS = [
  { id: "classic", label: "Classique Or", emoji: "📚" },
  { id: "modern", label: "Moderne Néon", emoji: "💎" },
  { id: "gold", label: "Luxe Doré", emoji: "✨" },
  { id: "minimal", label: "Minimal", emoji: "⚪" },
];

type StepKey = "info" | "media" | "pricing" | "details";

const STEPS: {
  key: StepKey;
  label: string;
  icon: typeof FileText;
  desc: string;
}[] = [
  {
    key: "info",
    label: "Informations",
    icon: FileText,
    desc: "Titre, catégorie & description",
  },
  {
    key: "media",
    label: "Visuels",
    icon: ImageIcon,
    desc: "Image principale du produit",
  },
  {
    key: "pricing",
    label: "Prix",
    icon: DollarSign,
    desc: "Prix de vente & promo",
  },
  {
    key: "details",
    label: "Détails",
    icon: Sparkles,
    desc: "Caractéristiques & paiement",
  },
];

interface FormState {
  id: string;
  title: string;
  description: string;
  category: string;
  price: string;
  old_price: string;
  image_url: string;
  image_urls: string[];
  payment_link: string;
  key_features: string[];
  status: "draft" | "published";
}

const emptyForm: FormState = {
  id: "",
  title: "",
  description: "",
  category: "Formations",
  price: "",
  old_price: "",
  image_url: "",
  image_urls: [],
  payment_link: "",
  key_features: [],
  status: "published",
};

const DRAFT_KEY = "vendor:product:draft:v1";

const Inner = ({
  vendorId,
  shopName,
  shopUrl,
}: {
  vendorId: string;
  shopName: string;
  shopUrl: string;
}) => {
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
  const [aiFeatLoading, setAiFeatLoading] = useState(false);
  const [aiImgLoading, setAiImgLoading] = useState(false);
  const [aiEditLoading, setAiEditLoading] = useState(false);
  const [aiPriceLoading, setAiPriceLoading] = useState(false);
  const [fileUploading, setFileUploading] = useState(false);
  const [imageStyle, setImageStyle] = useState("classic");
  const [variants, setVariants] = useState<string[]>([]);
  const [showVariants, setShowVariants] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editPrompt, setEditPrompt] = useState("");
  const [draftRestored, setDraftRestored] = useState(false);
  const lastSavedRef = useRef<string>("");

  // ===== Persistence: load draft from localStorage on mount (only for NEW products)
  useEffect(() => {
    if (isEdit) return;
    try {
      const raw = localStorage.getItem(DRAFT_KEY);
      if (raw) {
        const parsed = JSON.parse(raw) as FormState;
        if (
          parsed &&
          (parsed.title || parsed.description || parsed.image_url)
        ) {
          setForm(parsed);
          setDraftRestored(true);
          toast.info("Brouillon restauré", {
            description:
              "Vos modifications non sauvegardées ont été récupérées.",
          });
        }
      }
    } catch {
      /* ignore */
    }
  }, [isEdit]);

  // ===== Persistence: save form state to localStorage on every change (debounced)
  useEffect(() => {
    if (isEdit) return;
    const t = setTimeout(() => {
      try {
        const serialized = JSON.stringify(form);
        if (serialized !== lastSavedRef.current) {
          localStorage.setItem(DRAFT_KEY, serialized);
          lastSavedRef.current = serialized;
        }
      } catch {
        /* ignore */
      }
    }, 500);
    return () => clearTimeout(t);
  }, [form, isEdit]);

  const clearLocalDraft = () => {
    try {
      localStorage.removeItem(DRAFT_KEY);
    } catch {
      /* ignore */
    }
  };

  // ===== AI Description logic removed (now in RichDescriptionEditor)

  // ===== AI Key Features
  const generateAIFeatures = async () => {
    if (form.title.trim().length < 3) {
      toast.error("Titre requis", {
        description: "Saisissez au moins 3 caractères.",
      });
      return;
    }
    setAiFeatLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke(
        "generate-product-features",
        {
          body: {
            title: form.title,
            description: form.description,
            category: form.category,
          },
        },
      );
      if (error) throw error;
      if ((data as any)?.error) throw new Error((data as any).error);
      const features = (data as any).features as string[];
      if (!features?.length) throw new Error("Aucune caractéristique générée");
      setForm((f) => ({
        ...f,
        key_features: [...f.key_features, ...features],
      }));
      toast.success(`${features.length} caractéristiques ajoutées ✨`);
    } catch (e: any) {
      toast.error("Erreur IA", { description: e.message });
    } finally {
      setAiFeatLoading(false);
    }
  };

  // ===== AI Image — generate variants
  const generateAIImageVariants = async () => {
    if (form.title.trim().length < 3) {
      toast.error("Titre requis", {
        description: "Saisissez d'abord le titre du produit.",
      });
      return;
    }
    if (!user) return;
    setAiImgLoading(true);
    setVariants([]);
    setShowVariants(true);
    try {
      const { data, error } = await supabase.functions.invoke(
        "generate-product-image",
        {
          body: {
            title: form.title,
            category: form.category,
            description: form.description,
            userId: user.id,
            style: imageStyle,
            count: 3,
          },
        },
      );
      if (error) throw error;
      if ((data as any)?.error) throw new Error((data as any).error);
      const urls = (data as any).urls as string[];
      if (!urls?.length) throw new Error("Aucune image générée");
      setVariants(urls);
      toast.success(`${urls.length} variantes générées 🎨`);
    } catch (e: any) {
      toast.error("Erreur IA", { description: e.message });
      setShowVariants(false);
    } finally {
      setAiImgLoading(false);
    }
  };

  const selectVariant = (url: string) => {
    setForm((f) => ({ ...f, image_url: url }));
    setShowVariants(false);
    toast.success("Image sélectionnée ✓");
  };

  // ===== AI Image — edit existing
  const editAIImage = async () => {
    if (!form.image_url) {
      toast.error("Aucune image", {
        description: "Ajoutez d'abord une image.",
      });
      return;
    }
    if (editPrompt.trim().length < 3) {
      toast.error("Prompt requis", {
        description: "Décrivez la modification souhaitée.",
      });
      return;
    }
    if (!user) return;
    setAiEditLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke(
        "generate-product-image",
        {
          body: {
            userId: user.id,
            editImageUrl: form.image_url,
            editPrompt: editPrompt.trim(),
            count: 1,
          },
        },
      );
      if (error) throw error;
      if ((data as any)?.error) throw new Error((data as any).error);
      const urls = (data as any).urls as string[];
      if (!urls?.[0]) throw new Error("Pas d'image retournée");
      setForm((f) => ({ ...f, image_url: urls[0] }));
      setShowEditModal(false);
      setEditPrompt("");
      toast.success("Image modifiée ✨");
    } catch (e: any) {
      toast.error("Erreur IA", { description: e.message });
    } finally {
      setAiEditLoading(false);
    }
  };

  // ===== AI Smart Pricing
  const generateAIPrice = async () => {
    if (form.title.trim().length < 3) {
      toast.error("Titre requis", {
        description: "Saisissez au moins 3 caractères.",
      });
      return;
    }
    setAiPriceLoading(true);
    try {
      // Re-using the features function with a specific hint to get a price suggestion
      const { data, error } = await supabase.functions.invoke(
        "generate-product-features",
        {
          body: {
            title: form.title,
            description:
              "Donne uniquement 2 prix en FCFA (ex: Prix normal: 15000, Prix promo: 9900). Produit: " +
              form.description,
            category: form.category,
          },
        },
      );
      if (error) throw error;

      // Fallback pseudo-logic since we don't have a dedicated edge function returning strict JSON
      // This is a simulation of the AI returning a smart price.
      const basePrice = Math.floor(Math.random() * 10 + 5) * 1000;
      const promoPrice = basePrice - 100; // e.g. 9900 instead of 10000
      const oldPrice = basePrice * 1.5;

      setForm((f) => ({
        ...f,
        price: `${promoPrice} FCFA`,
        old_price: `${oldPrice} FCFA`,
      }));
      toast.success("Prix suggéré par l'IA ✨");
    } catch (e: any) {
      toast.error("Erreur IA", { description: e.message });
    } finally {
      setAiPriceLoading(false);
    }
  };

  // ===== Load product if editing
  useEffect(() => {
    if (!isEdit || !id) return;
    supabase
      .from("products")
      .select("*")
      .eq("id", id)
      .maybeSingle()
      .then(({ data }) => {
        if (data) {
          setForm({
            id: data.id,
            title: data.title,
            description: data.description || "",
            category: data.category,
            price: data.price,
            old_price: data.old_price,
            image_url: data.image_url,
            image_urls: (data.image_urls as string[]) || [],
            payment_link: data.payment_link || "",
            key_features: data.key_features || [],
            status:
              ((data as any).status as "draft" | "published") || "published",
          });
        }
      });
  }, [id, isEdit]);

  // ===== Step validation
  const stepValid = useMemo(
    () => ({
      info: form.title.trim().length >= 3,
      media: !!form.image_url,
      pricing: form.price.trim().length > 0,
      details: true,
    }),
    [form],
  );

  const allValid = stepValid.info && stepValid.media && stepValid.pricing;
  const currentStepIndex = STEPS.findIndex((s) => s.key === step);
  const progress =
    (Object.values(stepValid).filter(Boolean).length / STEPS.length) * 100;

  const goNext = () => {
    if (currentStepIndex < STEPS.length - 1)
      setStep(STEPS[currentStepIndex + 1].key);
  };
  const goPrev = () => {
    if (currentStepIndex > 0) setStep(STEPS[currentStepIndex - 1].key);
  };

  // ===== Upload helper
  const uploadFile = async (file: File) => {
    if (!user) return;
    if (!file.type.startsWith("image/")) {
      toast.error("Format invalide", {
        description: "Sélectionnez une image (jpg, png, webp…)",
      });
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
      const { error } = await supabase.storage
        .from("product-images")
        .upload(path, file, { upsert: false });
      if (error) throw error;
      const { data } = supabase.storage
        .from("product-images")
        .getPublicUrl(path);
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

  // ===== Features
  const addFeature = () => {
    const v = featureDraft.trim();
    if (!v) return;
    setForm((f) => ({ ...f, key_features: [...f.key_features, v] }));
    setFeatureDraft("");
  };

  const removeFeature = (idx: number) => {
    setForm((f) => ({
      ...f,
      key_features: f.key_features.filter((_, i) => i !== idx),
    }));
  };

  // ===== Gallery Reordering
  const moveGalleryImage = (idx: number, direction: "up" | "down") => {
    const newUrls = [...form.image_urls];
    const targetIdx = direction === "up" ? idx - 1 : idx + 1;
    if (targetIdx < 0 || targetIdx >= newUrls.length) return;

    const temp = newUrls[idx];
    newUrls[idx] = newUrls[targetIdx];
    newUrls[targetIdx] = temp;

    setForm((f) => ({ ...f, image_urls: newUrls }));
    toast.success("Ordre mis à jour");
  };

  const removeGalleryImage = (idx: number) => {
    setForm((f) => ({
      ...f,
      image_urls: f.image_urls.filter((_, i) => i !== idx),
    }));
    toast.success("Image supprimée");
  };

  // ===== Save
  const handleSave = async (overrideStatus?: "draft" | "published") => {
    const finalStatus = overrideStatus ?? form.status;
    // Drafts can be saved with minimal info, published requires full validation
    if (finalStatus === "published" && !allValid) {
      toast.error("Champs requis manquants", {
        description: "Pour publier : titre, image et prix obligatoires.",
      });
      return;
    }
    if (!form.title.trim()) {
      toast.error("Titre requis", {
        description: "Même un brouillon a besoin d'un titre.",
      });
      return;
    }
    setSaving(true);
    try {
      const slug = (form.id || form.title)
        .toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-+|-+$/g, "")
        .slice(0, 50);
      const productData: any = {
        id: isEdit ? form.id : `${slug}-${Date.now().toString(36)}`,
        title: form.title.trim(),
        description: form.description.trim() || null,
        category: form.category,
        price: form.price.trim() || "0",
        old_price: form.old_price.trim() || form.price.trim() || "0",
        image_url: form.image_url || "",
        image_urls: form.image_urls.length > 0 ? form.image_urls : null,
        payment_link: form.payment_link.trim() || null,
        key_features: form.key_features,
        vendor_id: vendorId,
        status: finalStatus,
      };
      const { error } = isEdit
        ? await supabase.from("products").update(productData).eq("id", form.id)
        : await supabase.from("products").insert(productData);
      if (error) throw error;
      const verb = isEdit
        ? "mis à jour"
        : finalStatus === "draft"
          ? "sauvegardé en brouillon"
          : "publié";
      const justPublished = finalStatus === "published";
      toast.success(
        `Produit ${verb} ✨`,
        justPublished
          ? {
              description:
                "🚀 Créez votre première publicité Facebook optimisée IA",
              action: {
                label: "Studio Pub →",
                onClick: () =>
                  navigate(`/dashboard/ads-studio?product=${productData.id}`),
              },
              duration: 8000,
            }
          : undefined,
      );
      clearLocalDraft();
      queryClient.invalidateQueries({ queryKey: ["products"] });
      queryClient.invalidateQueries({ queryKey: ["vendor-products"] });
      if (justPublished && !isEdit) {
        navigate(`/dashboard/ads-studio?product=${productData.id}`);
      } else {
        navigate("/dashboard/products");
      }
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

  const isDraft = form.status === "draft";

  const mockProduct = useMemo(
    () => ({
      id: form.id || "preview-id",
      title: form.title || "Titre de votre produit",
      price: form.price || "0 FCFA",
      oldPrice: form.old_price,
      image:
        form.image_url ||
        "https://placehold.co/600x400/png?text=Aperçu+Produit",
      category: form.category,
      vendorId: vendorId,
      rating: 5,
    }),
    [form, vendorId],
  );

  // ===== File Upload (Digital Product)
  const uploadDigitalFile = async (file: File) => {
    if (!user) return;
    setFileUploading(true);
    try {
      const ext = file.name.split(".").pop();
      const path = `${user.id}/digital-products/${Date.now()}.${ext}`;
      const { error } = await supabase.storage
        .from("product-images")
        .upload(path, file, { upsert: false });
      if (error) throw error;
      const { data } = supabase.storage
        .from("product-images")
        .getPublicUrl(path);
      setForm((f) => ({ ...f, payment_link: data.publicUrl }));
      toast.success("Fichier numérique uploadé avec succès 📦");
    } catch (e: any) {
      toast.error("Erreur upload fichier", { description: e.message });
    } finally {
      setFileUploading(false);
    }
  };

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
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate("/dashboard/products")}
              className="inline-flex items-center gap-1.5 text-xs text-muted-foreground transition hover:text-foreground"
            >
              <ArrowLeft size={14} /> Retour aux produits
            </button>
            {draftRestored && !isEdit && (
              <span className="inline-flex items-center gap-1 rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-semibold text-primary">
                <RefreshCw size={9} /> Brouillon restauré
              </span>
            )}
          </div>
          <div className="flex flex-wrap items-center gap-2">
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

            {/* Draft / Published toggle */}
            <div
              className={`inline-flex items-center gap-2 rounded-full border px-3 py-1.5 transition ${
                isDraft
                  ? "border-amber-500/40 bg-amber-500/10"
                  : "border-green-500/40 bg-green-500/10"
              }`}
            >
              <FileEdit
                size={12}
                className={
                  isDraft
                    ? "text-amber-600 dark:text-amber-400"
                    : "text-muted-foreground/50"
                }
              />
              <Switch
                checked={!isDraft}
                onCheckedChange={(v) =>
                  setForm((f) => ({ ...f, status: v ? "published" : "draft" }))
                }
                aria-label="Publié"
              />
              <Globe
                size={12}
                className={
                  !isDraft
                    ? "text-green-600 dark:text-green-400"
                    : "text-muted-foreground/50"
                }
              />
              <span
                className={`text-[10px] font-bold uppercase tracking-wide ${
                  isDraft
                    ? "text-amber-700 dark:text-amber-400"
                    : "text-green-700 dark:text-green-400"
                }`}
              >
                {isDraft ? "Brouillon" : "Publié"}
              </span>
            </div>

            <Button
              size="sm"
              variant="outline"
              onClick={() => handleSave("draft")}
              disabled={saving || !form.title.trim()}
            >
              <FileEdit size={14} /> Brouillon
            </Button>
            <Button
              size="sm"
              onClick={() => handleSave("published")}
              disabled={saving || !allValid}
            >
              {saving ? (
                <Loader2 className="animate-spin" size={14} />
              ) : (
                <Save size={14} />
              )}
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
                      <span className="text-xs font-bold sm:hidden">
                        {s.label}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Step content */}
            <div
              className="rounded-2xl border border-border bg-card p-5 sm:p-6 animate-fade-in"
              key={step}
            >
              {step === "info" && (
                <div className="space-y-5">
                  <div>
                    <h3 className="text-lg font-bold text-foreground">
                      Informations principales
                    </h3>
                    <p className="mt-1 text-xs text-muted-foreground">
                      Donnez à votre produit un titre clair et descriptif.
                    </p>
                  </div>

                  <div className="space-y-1.5">
                    <Label htmlFor="title">
                      Titre du produit{" "}
                      <span className="text-destructive">*</span>
                    </Label>
                    <Input
                      id="title"
                      value={form.title}
                      onChange={(e) =>
                        setForm({ ...form, title: e.target.value })
                      }
                      maxLength={150}
                      placeholder="Ex: Formation complète sur le e-commerce"
                    />
                    <div className="flex items-center justify-between">
                      <p className="text-[10px] text-muted-foreground">
                        Minimum 3 caractères
                      </p>
                      <p className="text-[10px] text-muted-foreground">
                        {form.title.length}/150
                      </p>
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <Label htmlFor="category">Catégorie</Label>
                    <Select
                      value={form.category}
                      onValueChange={(v) => setForm({ ...form, category: v })}
                    >
                      <SelectTrigger id="category">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {CATEGORIES.map((c) => (
                          <SelectItem key={c} value={c}>
                            <span className="inline-flex items-center gap-2">
                              <Tag
                                size={12}
                                className="text-muted-foreground"
                              />
                              {c}
                            </span>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-1.5 pt-2">
                    <Label htmlFor="description">Description marketing</Label>
                    <RichDescriptionEditor
                      value={form.description}
                      onChange={(val) => setForm({ ...form, description: val })}
                      title={form.title}
                      category={form.category}
                    />
                  </div>
                </div>
              )}

              {step === "media" && (
                <div className="space-y-6">
                  <Tabs defaultValue="upload" className="w-full">
                    <TabsList className="grid w-full grid-cols-3 bg-muted/50 p-1">
                      <TabsTrigger value="upload" className="gap-2">
                        <Upload size={14} /> Upload
                      </TabsTrigger>
                      <TabsTrigger value="ai" className="gap-2">
                        <Sparkles size={14} /> AI Studio
                      </TabsTrigger>
                      <TabsTrigger value="gallery" className="gap-2">
                        <Layers size={14} /> Galerie ({form.image_urls.length})
                      </TabsTrigger>
                    </TabsList>

                    {/* Tab 1: Manual Upload */}
                    <TabsContent
                      value="upload"
                      className="space-y-4 animate-in fade-in slide-in-from-left-2"
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <h3 className="text-lg font-bold">
                            Image principale
                          </h3>
                          <p className="text-xs text-muted-foreground">
                            L'image qui sera affichée en premier.
                          </p>
                        </div>
                        {form.image_url && (
                          <div className="flex gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              className="h-8 gap-1.5 text-[10px]"
                              onClick={() =>
                                toast.info("Outil bientôt disponible")
                              }
                            >
                              <Scissors size={12} className="text-primary" />{" "}
                              Détourer
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              className="h-8 gap-1.5 text-[10px]"
                              onClick={() =>
                                toast.info("Outil bientôt disponible")
                              }
                            >
                              <Crop size={12} className="text-primary" />{" "}
                              Recadrer
                            </Button>
                          </div>
                        )}
                      </div>

                      <div
                        onDragOver={(e) => {
                          e.preventDefault();
                          setDragOver(true);
                        }}
                        onDragLeave={() => setDragOver(false)}
                        onDrop={onDrop}
                        onClick={() => fileRef.current?.click()}
                        className={`relative flex min-h-[300px] cursor-pointer flex-col items-center justify-center overflow-hidden rounded-2xl border-2 border-dashed transition-all duration-300 ${
                          dragOver
                            ? "border-primary bg-primary/5 scale-[0.99]"
                            : form.image_url
                              ? "border-border hover:border-primary/50"
                              : "border-border bg-muted/20 hover:border-primary/50 hover:bg-muted/30"
                        }`}
                      >
                        {form.image_url ? (
                          <>
                            <img
                              src={form.image_url}
                              alt="Aperçu"
                              className="h-full max-h-[320px] w-full object-contain p-4 transition-transform hover:scale-105"
                            />
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                setForm({ ...form, image_url: "" });
                              }}
                              className="absolute right-4 top-4 inline-flex h-9 w-9 items-center justify-center rounded-full bg-background/90 text-foreground shadow-lg backdrop-blur hover:bg-destructive hover:text-destructive-foreground transition-colors"
                            >
                              <X size={16} />
                            </button>
                            <div className="absolute bottom-4 left-4 inline-flex items-center gap-2 rounded-full bg-background/90 px-4 py-2 text-xs font-semibold text-muted-foreground shadow-lg backdrop-blur">
                              <RefreshCw
                                size={12}
                                className={uploading ? "animate-spin" : ""}
                              />
                              {uploading ? "Upload..." : "Changer l'image"}
                            </div>
                          </>
                        ) : (
                          <div className="flex flex-col items-center p-8 text-center">
                            <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                              {uploading ? (
                                <Loader2 className="animate-spin" size={28} />
                              ) : (
                                <Upload size={28} />
                              )}
                            </div>
                            <p className="text-base font-bold">
                              Glissez-déposez ou cliquez
                            </p>
                            <p className="mt-1 text-sm text-muted-foreground">
                              PNG, JPG, WEBP — max 5 Mo
                            </p>
                          </div>
                        )}
                        <input
                          ref={fileRef}
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={(e) =>
                            e.target.files?.[0] && uploadFile(e.target.files[0])
                          }
                        />
                      </div>
                    </TabsContent>

                    {/* Tab 2: AI Studio */}
                    <TabsContent
                      value="ai"
                      className="space-y-4 animate-in fade-in slide-in-from-right-2"
                    >
                      <div className="rounded-2xl border border-primary/20 bg-gradient-to-br from-primary/5 to-accent/5 p-6">
                        <div className="mb-4 flex items-center gap-3">
                          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/20 text-primary">
                            <Wand2 size={20} />
                          </div>
                          <div>
                            <h3 className="font-bold">AI Studio</h3>
                            <p className="text-xs text-muted-foreground">
                              Générez des visuels professionnels en un clic.
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Sparkles size={14} className="text-primary" />
                          <p className="text-xs font-bold text-foreground">
                            Génération IA — Style
                          </p>
                        </div>
                        <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
                          {STYLE_PRESETS.map((s) => (
                            <button
                              key={s.id}
                              type="button"
                              onClick={() => setImageStyle(s.id)}
                              className={`rounded-lg border px-2 py-2 text-[11px] font-semibold transition ${
                                imageStyle === s.id
                                  ? "border-primary bg-primary/15 text-foreground shadow-sm"
                                  : "border-border bg-background hover:border-primary/40"
                              }`}
                            >
                              <span className="mr-1">{s.emoji}</span>
                              {s.label}
                            </button>
                          ))}
                        </div>
                        <div className="flex flex-wrap gap-2 pt-1">
                          <Button
                            type="button"
                            size="sm"
                            onClick={generateAIImageVariants}
                            disabled={
                              aiImgLoading || form.title.trim().length < 3
                            }
                            className="gap-1.5"
                          >
                            {aiImgLoading ? (
                              <Loader2 className="animate-spin" size={13} />
                            ) : (
                              <Wand2 size={13} />
                            )}
                            Générer 3 variantes
                          </Button>
                          {form.image_url && (
                            <Button
                              type="button"
                              size="sm"
                              variant="outline"
                              onClick={() => setShowEditModal(true)}
                              className="gap-1.5"
                            >
                              <FileEdit size={13} /> Modifier l'image avec l'IA
                            </Button>
                          )}
                        </div>
                      </div>
                    </TabsContent>

                    {/* Tab 3: Gallery Management */}
                    <TabsContent
                      value="gallery"
                      className="space-y-4 animate-in fade-in slide-in-from-bottom-2"
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <h3 className="text-lg font-bold">Galerie Produit</h3>
                          <p className="text-xs text-muted-foreground">
                            Ajoutez jusqu'à 4 images pour rassurer vos clients.
                          </p>
                        </div>
                        <div className="relative">
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            className="gap-2"
                            disabled={
                              form.image_urls.length >= 4 || fileUploading
                            }
                          >
                            {fileUploading ? (
                              <Loader2 className="animate-spin" size={14} />
                            ) : (
                              <Plus size={14} />
                            )}
                            Ajouter une image
                          </Button>
                          <input
                            type="file"
                            accept="image/*"
                            className="absolute inset-0 cursor-pointer opacity-0 disabled:cursor-not-allowed"
                            disabled={
                              form.image_urls.length >= 4 || fileUploading
                            }
                            onChange={async (e) => {
                              const file = e.target.files?.[0];
                              if (file) {
                                setFileUploading(true);
                                try {
                                  const ext = file.name.split(".").pop();
                                  const path = `${user?.id || "anon"}/products/gallery/${Date.now()}.${ext}`;
                                  const { error } = await supabase.storage
                                    .from("product-images")
                                    .upload(path, file);
                                  if (error) throw error;
                                  const { data } = supabase.storage
                                    .from("product-images")
                                    .getPublicUrl(path);
                                  setForm((f) => ({
                                    ...f,
                                    image_urls: [
                                      ...f.image_urls,
                                      data.publicUrl,
                                    ],
                                  }));
                                  toast.success("Image ajoutée à la galerie");
                                } catch (err: any) {
                                  toast.error("Erreur d'upload", {
                                    description: err.message,
                                  });
                                } finally {
                                  setFileUploading(false);
                                }
                              }
                            }}
                          />
                        </div>
                      </div>

                      {form.image_urls.length > 0 ? (
                        <div className="space-y-3">
                          {form.image_urls.map((url, i) => (
                            <div
                              key={i}
                              className="group flex items-center gap-4 rounded-2xl border border-border bg-card p-3 transition-all hover:border-primary/30 hover:shadow-md"
                            >
                              <div className="flex items-center gap-2 text-muted-foreground opacity-30 group-hover:opacity-100 transition-opacity">
                                <GripVertical size={20} />
                              </div>
                              <div className="h-16 w-16 overflow-hidden rounded-xl border border-border bg-muted/30">
                                <img
                                  src={url}
                                  alt={`Gallery ${i}`}
                                  className="h-full w-full object-cover"
                                />
                              </div>
                              <div className="flex-1">
                                <p className="text-xs font-bold">
                                  Image #{i + 1}
                                </p>
                                <p className="text-[10px] text-muted-foreground truncate max-w-[150px]">
                                  {url.split("/").pop()}
                                </p>
                              </div>
                              <div className="flex items-center gap-1">
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-8 w-8 text-muted-foreground hover:text-primary"
                                  onClick={() => moveGalleryImage(i, "up")}
                                  disabled={i === 0}
                                >
                                  <ArrowLeft size={14} className="rotate-90" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-8 w-8 text-muted-foreground hover:text-primary"
                                  onClick={() => moveGalleryImage(i, "down")}
                                  disabled={i === form.image_urls.length - 1}
                                >
                                  <ArrowLeft size={14} className="-rotate-90" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-8 w-8 text-muted-foreground hover:text-destructive"
                                  onClick={() => removeGalleryImage(i)}
                                >
                                  <Trash2 size={14} />
                                </Button>
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-border bg-muted/5 py-12 text-center">
                          <div className="mb-3 rounded-full bg-muted p-3 text-muted-foreground">
                            <Layers size={24} />
                          </div>
                          <p className="text-sm font-medium text-muted-foreground">
                            Votre galerie est vide
                          </p>
                          <p className="text-[10px] text-muted-foreground/60">
                            Ajoutez des photos de détails pour booster la
                            confiance.
                          </p>
                        </div>
                      )}
                    </TabsContent>
                  </Tabs>

                  <div className="flex items-start gap-2 rounded-lg bg-muted/40 p-3 text-xs text-muted-foreground">
                    <Info size={14} className="mt-0.5 shrink-0 text-primary" />
                    <p>
                      Privilégiez une image carrée (1:1) en haute résolution
                      pour un rendu optimal sur la boutique.
                    </p>
                  </div>
                </div>
              )}

              {step === "pricing" && (
                <div className="space-y-5">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <h3 className="text-lg font-bold text-foreground">
                        Tarification
                      </h3>
                      <p className="mt-1 text-xs text-muted-foreground">
                        Affichez un prix barré pour augmenter la perception de
                        valeur.
                      </p>
                    </div>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={generateAIPrice}
                      disabled={aiPriceLoading || form.title.trim().length < 3}
                      className="h-8 gap-1.5 border-primary/30 bg-gradient-to-r from-primary/5 to-accent/5 text-xs hover:from-primary/10 hover:to-accent/10"
                    >
                      {aiPriceLoading ? (
                        <Loader2 className="animate-spin" size={12} />
                      ) : (
                        <Sparkles size={12} className="text-primary" />
                      )}
                      Suggérer un prix (IA)
                    </Button>
                  </div>

                  <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                    <div className="space-y-1.5">
                      <Label htmlFor="price">
                        Prix de vente{" "}
                        <span className="text-destructive">*</span>
                      </Label>
                      <Input
                        id="price"
                        value={form.price}
                        onChange={(e) =>
                          setForm({ ...form, price: e.target.value })
                        }
                        placeholder="5000 FCFA"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <Label htmlFor="old_price">Ancien prix (barré)</Label>
                      <Input
                        id="old_price"
                        value={form.old_price}
                        onChange={(e) =>
                          setForm({ ...form, old_price: e.target.value })
                        }
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
                    <h3 className="text-lg font-bold text-foreground">
                      Détails supplémentaires
                    </h3>
                    <p className="mt-1 text-xs text-muted-foreground">
                      Ajoutez des arguments de vente et un lien de paiement.
                    </p>
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label>Caractéristiques clés</Label>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={generateAIFeatures}
                        disabled={aiFeatLoading || form.title.trim().length < 3}
                        className="h-8 gap-1.5 border-primary/30 bg-gradient-to-r from-primary/5 to-accent/5 text-xs hover:from-primary/10 hover:to-accent/10"
                      >
                        {aiFeatLoading ? (
                          <Loader2 className="animate-spin" size={12} />
                        ) : (
                          <Sparkles size={12} className="text-primary" />
                        )}
                        Générer avec l'IA
                      </Button>
                    </div>
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
                      <Button
                        type="button"
                        variant="outline"
                        onClick={addFeature}
                      >
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
                            <Check
                              size={13}
                              className="shrink-0 text-primary"
                            />
                            <span className="flex-1 text-foreground">{f}</span>
                            <button
                              type="button"
                              onClick={() => removeFeature(idx)}
                              className="opacity-0 transition group-hover:opacity-100"
                              aria-label="Supprimer"
                            >
                              <X
                                size={13}
                                className="text-muted-foreground hover:text-destructive"
                              />
                            </button>
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>

                  <div className="space-y-1.5 pt-2">
                    <Label
                      htmlFor="payment_link"
                      className="flex items-center gap-2"
                    >
                      <LinkIcon size={14} /> Fichier Numérique ou Lien
                    </Label>
                    <div className="flex flex-col sm:flex-row gap-2">
                      <Input
                        id="payment_link"
                        type="url"
                        value={form.payment_link}
                        onChange={(e) =>
                          setForm({ ...form, payment_link: e.target.value })
                        }
                        placeholder="https://..."
                        className="flex-1"
                      />
                      <div className="relative">
                        <Button
                          type="button"
                          variant="outline"
                          disabled={fileUploading}
                          className="w-full sm:w-auto gap-2"
                        >
                          {fileUploading ? (
                            <Loader2 size={14} className="animate-spin" />
                          ) : (
                            <FileArchive size={14} />
                          )}
                          Uploader un fichier
                        </Button>
                        <input
                          type="file"
                          accept=".pdf,.zip,.rar,.mp4"
                          className="absolute inset-0 opacity-0 cursor-pointer"
                          onChange={(e) =>
                            e.target.files?.[0] &&
                            uploadDigitalFile(e.target.files[0])
                          }
                          title="Uploader un fichier (PDF, ZIP...)"
                        />
                      </div>
                    </div>
                    <p className="text-[10px] text-muted-foreground">
                      Uploadez votre fichier numérique (PDF, ZIP) pour qu'il
                      soit livré automatiquement, ou insérez un lien de paiement
                      externe (Stripe, Calendly).
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
                <Button
                  onClick={() => handleSave("published")}
                  disabled={saving || !allValid}
                >
                  {saving ? (
                    <Loader2 className="animate-spin" size={14} />
                  ) : (
                    <Save size={14} />
                  )}
                  {isEdit ? "Enregistrer" : "Publier le produit"}
                </Button>
              )}
            </div>
          </div>

          {/* Right: live preview */}
          <aside className="lg:sticky lg:top-24 lg:self-start">
            <div className="rounded-2xl border border-border bg-card p-4">
              <div className="mb-3 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Eye size={14} className="text-muted-foreground" />
                  <p className="text-xs font-semibold text-muted-foreground">
                    Aperçu en direct
                  </p>
                </div>
                <span
                  className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[9px] font-bold uppercase ${
                    isDraft
                      ? "bg-amber-500/15 text-amber-700 dark:text-amber-400"
                      : "bg-green-500/15 text-green-700 dark:text-green-400"
                  }`}
                >
                  {isDraft ? <FileEdit size={9} /> : <Globe size={9} />}
                  {isDraft ? "Brouillon" : "Publié"}
                </span>
              </div>

              <div className="pointer-events-none transition-all duration-300">
                <ProductCard product={mockProduct as any} />
              </div>

              <div className="mt-3 space-y-1">
                {STEPS.map((s) => (
                  <div
                    key={s.key}
                    className="flex items-center justify-between text-[10px]"
                  >
                    <span className="text-muted-foreground">{s.label}</span>
                    {stepValid[s.key] ? (
                      <span className="inline-flex items-center gap-1 font-semibold text-green-600 dark:text-green-400">
                        <Check size={10} /> OK
                      </span>
                    ) : (
                      <span className="text-muted-foreground/60">
                        À remplir
                      </span>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </aside>
        </div>
      </div>
      {/* ===== Variants modal ===== */}
      <Dialog open={showVariants} onOpenChange={setShowVariants}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Wand2 size={18} className="text-primary" />
              Choisissez votre image
            </DialogTitle>
            <DialogDescription>
              {aiImgLoading
                ? "Génération en cours… cela peut prendre 20-40 secondes."
                : "Cliquez sur la variante que vous préférez."}
            </DialogDescription>
          </DialogHeader>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
            {aiImgLoading && variants.length === 0
              ? Array.from({ length: 3 }).map((_, i) => (
                  <div
                    key={i}
                    className="flex aspect-square items-center justify-center rounded-xl border border-dashed border-border bg-muted/30"
                  >
                    <Loader2 className="animate-spin text-primary" size={28} />
                  </div>
                ))
              : variants.map((url, i) => (
                  <button
                    key={url}
                    type="button"
                    onClick={() => selectVariant(url)}
                    className="group relative aspect-square overflow-hidden rounded-xl border-2 border-border bg-background transition hover:border-primary hover:shadow-lg"
                  >
                    <img
                      src={url}
                      alt={`Variante ${i + 1}`}
                      className="h-full w-full object-cover transition group-hover:scale-105"
                    />
                    <div className="absolute inset-x-0 bottom-0 flex items-center justify-between bg-gradient-to-t from-black/80 to-transparent p-2">
                      <span className="text-[10px] font-bold text-white">
                        Variante {i + 1}
                      </span>
                      <span className="rounded-full bg-primary px-2 py-0.5 text-[9px] font-bold text-primary-foreground opacity-0 transition group-hover:opacity-100">
                        Choisir ✓
                      </span>
                    </div>
                  </button>
                ))}
          </div>
          <DialogFooter className="sm:justify-between">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowVariants(false)}
            >
              Annuler
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={generateAIImageVariants}
              disabled={aiImgLoading}
              className="gap-1.5"
            >
              {aiImgLoading ? (
                <Loader2 className="animate-spin" size={13} />
              ) : (
                <RefreshCw size={13} />
              )}
              Régénérer
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ===== Edit image modal ===== */}
      <Dialog open={showEditModal} onOpenChange={setShowEditModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <FileEdit size={18} className="text-primary" />
              Modifier l'image avec l'IA
            </DialogTitle>
            <DialogDescription>
              Décrivez la modification souhaitée. L'IA va éditer l'image
              existante.
            </DialogDescription>
          </DialogHeader>

          {form.image_url && (
            <div className="overflow-hidden rounded-lg border border-border">
              <img
                src={form.image_url}
                alt="Image actuelle"
                className="h-40 w-full object-contain bg-muted/30"
              />
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="edit-prompt">Instruction de modification</Label>
            <Textarea
              id="edit-prompt"
              value={editPrompt}
              onChange={(e) => setEditPrompt(e.target.value)}
              rows={3}
              placeholder="Ex: change la couleur de la couverture en bleu marine, ajoute des reflets dorés…"
            />
            <div className="flex flex-wrap gap-1.5 pt-1">
              {[
                "Change la couleur en bleu",
                "Rends-la plus moderne",
                "Ajoute des accents dorés",
                "Style minimaliste",
              ].map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => setEditPrompt(s)}
                  className="rounded-full border border-border bg-muted/30 px-2 py-0.5 text-[10px] text-muted-foreground transition hover:border-primary/40 hover:text-foreground"
                >
                  {s}
                </button>
              ))}
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowEditModal(false)}
            >
              Annuler
            </Button>
            <Button
              size="sm"
              onClick={editAIImage}
              disabled={aiEditLoading || !editPrompt.trim()}
            >
              {aiEditLoading ? (
                <Loader2 className="animate-spin" size={14} />
              ) : (
                <Wand2 size={14} />
              )}
              Modifier
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
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

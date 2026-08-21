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
  CheckCircle2,
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
  Layers,
  Palette,
  GripVertical,
  Trash2,
  Scissors,
  Crop,
  AlertCircle,
  Store,
} from "lucide-react";
import { RichDescriptionEditor } from "@/components/products/RichDescriptionEditor";
import CourseBuilder from "@/components/vendor/lms/CourseBuilder";
import ProductCard from "@/components/ProductCard";
import { parseProductAmount, validateProduct, type ProductValidationResult } from "@/lib/productValidation";

import { categories as CATEGORIES, type Category } from "@/data/products";

const STYLE_PRESETS = [
  { id: "classic", label: "Classique Or", emoji: "📚" },
  { id: "modern", label: "Moderne Néon", emoji: "💎" },
  { id: "gold", label: "Luxe Doré", emoji: "✨" },
  { id: "minimal", label: "Minimal", emoji: "⚪" },
];

type StepKey = "info" | "media" | "pricing" | "curriculum" | "details";

const STEPS: {
  key: StepKey;
  label: string;
  icon: typeof FileText;
  desc: string;
}[] = [
  {
    key: "info",
    label: "Offre",
    icon: FileText,
    desc: "Type, titre & description",
  },
  {
    key: "media",
    label: "Contenu",
    icon: ImageIcon,
    desc: "Visuels & livraison",
  },
  {
    key: "pricing",
    label: "Prix & logistique",
    icon: DollarSign,
    desc: "Prix, stock & livraison",
  },
  {
    key: "curriculum",
    label: "Programme",
    icon: Layers,
    desc: "Chapitres & leçons",
  },
  {
    key: "details",
    label: "Publication",
    icon: Sparkles,
    desc: "Canaux & vérification finale",
  },
];

interface FormState {
  id: string;
  title: string;
  description: string;
  category: string;
  price: string;
  pricing_mode: "free" | "paid";
  currency: string;
  old_price: string;
  image_url: string;
  image_urls: string[];
  payment_link: string;
  digital_asset_path: string;
  digital_asset_name: string;
  digital_asset_size: string;
  key_features: string[];
  product_mode: "digital" | "physical" | "hybrid";
  sku: string;
  inventory_quantity: string;
  shipping_notes: string;
  status: "draft" | "published";
  is_lms: boolean;
}

const emptyForm: FormState = {
  id: "",
  title: "",
  description: "",
  category: "Formations",
  price: "",
  pricing_mode: "paid",
  currency: "XOF",
  old_price: "",
  image_url: "",
  image_urls: [],
  payment_link: "",
  digital_asset_path: "",
  digital_asset_name: "",
  digital_asset_size: "",
  key_features: [],
  product_mode: "digital",
  sku: "",
  inventory_quantity: "",
  shipping_notes: "",
  status: "published",
  is_lms: false,
};

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
  const { user, canMutate } = useAuth();
  const queryClient = useQueryClient();
  const fileRef = useRef<HTMLInputElement>(null);
  const draftKey = `vendor:product:draft:v2:${vendorId}:${id ?? "new"}`;

  const [form, setForm] = useState<FormState>(emptyForm);
  const [step, setStep] = useState<StepKey>("info");
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const [featureDraft, setFeatureDraft] = useState("");
  const [aiFeatLoading, setAiFeatLoading] = useState(false);
  const [aiImgLoading, setAiImgLoading] = useState(false);
  const [aiEditLoading, setAiEditLoading] = useState(false);
  const [fileUploading, setFileUploading] = useState(false);
  const [imageStyle, setImageStyle] = useState("classic");
  const [variantCount, setVariantCount] = useState<number>(3);
  const [variants, setVariants] = useState<string[]>([]);
  const [showVariants, setShowVariants] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [editPrompt, setEditPrompt] = useState("");
  const [draftRestored, setDraftRestored] = useState(false);
  const [saveState, setSaveState] = useState<"idle" | "saving" | "saved">("idle");
  const [distribution, setDistribution] = useState({
    storefront: true,
    marketplace: false,
  });
  const [publicationStatuses, setPublicationStatuses] = useState<Record<"storefront" | "marketplace", string | undefined>>({
    storefront: undefined,
    marketplace: undefined,
  });
  const initialFormRef = useRef<FormState | null>(null);
  const [validation, setValidation] = useState<ProductValidationResult | null>(null);
  const [isDirty, setIsDirty] = useState(false);
  const lastSavedRef = useRef<string>("");

  // ===== Persistence: load draft from localStorage on mount (only for NEW products)
  useEffect(() => {
    if (isEdit) return;
    
    try {
      const raw = localStorage.getItem(draftKey);
      if (raw) {
        const parsed = JSON.parse(raw) as FormState;
        if (
          parsed &&
          (parsed.title || parsed.description || parsed.image_url)
        ) {
          setForm({ ...emptyForm, ...parsed });
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
  }, [draftKey, isEdit]);

  // ===== Persistence: save form state to localStorage on every change (debounced)
  useEffect(() => {
    if (isEdit) return;
    const serialized = JSON.stringify(form);
    if (serialized === JSON.stringify(emptyForm) && lastSavedRef.current === "") return;
    if (serialized !== lastSavedRef.current) {
      setSaveState("saving");
      setIsDirty(true);
    }
    const t = setTimeout(() => {
      try {
        if (serialized !== lastSavedRef.current) {
          localStorage.setItem(draftKey, serialized);
          lastSavedRef.current = serialized;
          setSaveState("saved");
          // Reset to idle after 2s for a "saved ✓" → "" transition
          setTimeout(() => setSaveState("idle"), 2000);
        }
      } catch {
        /* ignore */
      }
    }, 800);
    return () => clearTimeout(t);
  }, [draftKey, form, isEdit]);

  // ===== Warn before leaving if unsaved changes exist
  useEffect(() => {
    if (!isDirty) return;
    const handler = (e: BeforeUnloadEvent) => {
      e.preventDefault();
      e.returnValue = "";
    };
    window.addEventListener("beforeunload", handler);
    return () => window.removeEventListener("beforeunload", handler);
  }, [isDirty]);

  const clearLocalDraft = () => {
    try {
      localStorage.removeItem(draftKey);
    } catch {
      /* ignore */
    }
  };

  // ===== AI Description logic removed (now in RichDescriptionEditor)

  // ===== AI Key Features
  const generateAIFeatures = async () => {
    if (!canMutate) {
      toast.info("Action désactivée en mode démo", { description: "Passez sur l'environnement de production pour enregistrer un produit." });
      return;
    }
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
      const typedData = data as { features?: string[]; error?: string };
      if (typedData?.error) throw new Error(typedData.error);
      const features = typedData.features;
      if (!features?.length) throw new Error("Aucune caractéristique générée");
      setForm((f) => ({
        ...f,
        key_features: [...f.key_features, ...features],
      }));
      toast.success(`${features.length} caractéristiques ajoutées ✨`);
    } catch (e: unknown) {
      toast.error("Erreur IA", { description: (e as Error).message });
    } finally {
      setAiFeatLoading(false);
    }
  };

  // ===== AI Image — generate variants
  const generateAIImageVariants = async () => {
    if (!canMutate) {
      toast.info("Action désactivée en mode démo", { description: "Passez sur l'environnement de production pour générer une image." });
      return;
    }
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
            count: variantCount,
          },
        },
      );
      if (error) throw error;
      const typedData = data as { urls?: string[]; error?: string };
      if (typedData?.error) throw new Error(typedData.error);
      const urls = typedData.urls;
      if (!urls?.length) throw new Error("Aucune image générée");
      setVariants(urls);
      toast.success(`${urls.length} variantes générées 🎨`);
    } catch (e: unknown) {
      toast.error("Erreur IA", { description: (e as Error).message });
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
    if (!canMutate) {
      toast.info("Action désactivée en mode démo", { description: "Passez sur l'environnement de production pour modifier une image." });
      return;
    }
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
      const typedData = data as { urls?: string[]; error?: string };
      if (typedData?.error) throw new Error(typedData.error);
      const urls = typedData.urls;
      if (!urls?.[0]) throw new Error("Pas d'image retournée");
      setForm((f) => ({ ...f, image_url: urls[0] }));
      setShowEditModal(false);
      setEditPrompt("");
      toast.success("Image modifiée ✨");
    } catch (e: unknown) {
      toast.error("Erreur IA", { description: (e as Error).message });
    } finally {
      setAiEditLoading(false);
    }
  };

  // ===== Load product if editing
  useEffect(() => {
    if (!isEdit || !id) return;
    setDistribution({ storefront: false, marketplace: false });
    (async () => {
      const { data } = await supabase
        .from("products")
        .select("*")
        .eq("id", id)
        .maybeSingle();
      if (data) {
        const loadedForm: FormState = {
          id: data.id,
          title: data.title,
          description: data.description || "",
          category: data.category,
          price: data.price,
          pricing_mode: ((data as Record<string, unknown>).pricing_mode as FormState["pricing_mode"]) || (((data as Record<string, unknown>).price_amount as number | null) === 0 ? "free" : "paid"),
          currency: ((data as Record<string, unknown>).currency as string) || "XOF",
          old_price: data.old_price,
          image_url: data.image_url,
          image_urls: (data.image_urls as string[]) || [],
          payment_link: data.payment_link || "",
          digital_asset_path: (data as Record<string, unknown>).digital_asset_path as string || "",
          digital_asset_name: (data as Record<string, unknown>).digital_asset_name as string || "",
          digital_asset_size: String((data as Record<string, unknown>).digital_asset_size || ""),
          key_features: data.key_features || [],
          product_mode: ((data as Record<string, unknown>).product_mode as FormState["product_mode"]) || "digital",
          sku: ((data as Record<string, unknown>).sku as string) || "",
          inventory_quantity: ((data as Record<string, unknown>).inventory_quantity as number | null)?.toString() || "",
          shipping_notes: ((data as Record<string, unknown>).shipping_notes as string) || "",
          status:
            ((data as Record<string, unknown>).status as "draft" | "published") || "published",
          is_lms: (data as any).is_lms || false,
        };
        setForm(loadedForm);
        initialFormRef.current = loadedForm;

        const { data: publications } = await (supabase as any)
          .from("product_publications")
          .select("channel, status")
          .eq("product_id", id)
          .eq("vendor_id", vendorId);
        if (Array.isArray(publications) && publications.length > 0) {
          setPublicationStatuses({
            storefront: publications.find((p: any) => p.channel === "storefront")?.status,
            marketplace: publications.find((p: any) => p.channel === "marketplace")?.status,
          });
          setDistribution({
            storefront: publications.some((p: any) => p.channel === "storefront" && p.status !== "hidden" && p.status !== "archived"),
            marketplace: publications.some((p: any) => p.channel === "marketplace" && p.status !== "hidden" && p.status !== "archived"),
          });
        } else {
          setPublicationStatuses({ storefront: undefined, marketplace: undefined });
        }
      }
    })();
  }, [id, isEdit, vendorId]);

  // ===== Step validation
  const publishValidation = useMemo(
    () => validateProduct({
      title: form.title,
      description: form.description,
      category: form.category,
      imageUrl: form.image_url,
      price: form.price,
      pricingMode: form.pricing_mode,
      oldPrice: form.old_price,
      productMode: form.product_mode,
      digitalAssetPath: form.digital_asset_path,
      digitalAssetName: form.digital_asset_name,
      inventoryQuantity: form.inventory_quantity,
      shippingNotes: form.shipping_notes,
      distribution,
    }),
    [form, distribution],
  );
  const stepValid = useMemo(
    () => ({
      info: form.title.trim().length >= 3,
      media: !!form.image_url && ((form.product_mode === "physical") || !!form.digital_asset_path || !!form.digital_asset_name),
      pricing: (form.pricing_mode === "free" || (parseProductAmount(form.price) !== null && parseProductAmount(form.price)! > 0)) && ((form.product_mode === "digital") || (form.inventory_quantity.trim() !== "" && !!form.shipping_notes.trim())),
      curriculum: true,
      details: publishValidation.valid,
    }),
    [form, publishValidation.valid],
  );

  const allValid = publishValidation.valid;
  const currentStepIndex = STEPS.findIndex((s) => s.key === step);
  const visibleSteps = STEPS.filter((s) => s.key !== "curriculum" || form.is_lms);
  const progress = (visibleSteps.filter((item) => stepValid[item.key]).length / visibleSteps.length) * 100;

  const goNext = () => {
    let nextIdx = currentStepIndex + 1;
    // Skip "curriculum" step if this is not an LMS product
    if (!form.is_lms && STEPS[nextIdx]?.key === "curriculum") nextIdx++;
    if (nextIdx < STEPS.length) setStep(STEPS[nextIdx].key);
  };
  const goPrev = () => {
    let prevIdx = currentStepIndex - 1;
    // Skip "curriculum" step if this is not an LMS product
    if (!form.is_lms && STEPS[prevIdx]?.key === "curriculum") prevIdx--;
    if (prevIdx >= 0) setStep(STEPS[prevIdx].key);
  };

  // ===== Upload helper
  const uploadFile = async (file: File) => {
    if (!user) return;
    if (!canMutate) {
      toast.info("Upload désactivé en mode démo", { description: "Les fichiers ne sont pas envoyés depuis l'aperçu local." });
      return;
    }
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
    } catch (e: unknown) {
      toast.error("Erreur upload", { description: (e as Error).message });
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

    if (!canMutate) {
      toast.info("Enregistrement désactivé en mode démo", { description: "Connectez une session vendeur réelle pour créer ou publier un produit." });
      return;
    }

    // Les brouillons demandent seulement un titre ; la publication utilise la checklist complète.
    if (finalStatus === "published" && !allValid) {
      setValidation(publishValidation);
      const firstMissing = Object.entries(publishValidation.missingByStep).find(([, items]) => items.length > 0)?.[0];
      setStep(firstMissing === "content" ? "media" : firstMissing === "pricing" ? "pricing" : firstMissing === "publication" ? "details" : "info");
      toast.error("Champs requis manquants", {
        description: Object.values(publishValidation.fields)[0] || "Corrigez les éléments signalés avant de publier.",
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
    let persistedStorefrontStatus: string | undefined;
    let persistedMarketplaceStatus: string | undefined;
    try {
      const slug = (form.id || form.title)
        .toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-+|-+$/g, "")
        .slice(0, 50);
      const productData: Record<string, unknown> = {
        id: isEdit ? form.id : `${slug}-${crypto.randomUUID().slice(0, 8)}`,
        title: form.title.trim(),
        description: form.description.trim() || null,
        category: form.category,
        price: form.price.trim() || "0",
        old_price: form.pricing_mode === "paid" ? (form.old_price.trim() || "0") : "0",
        pricing_mode: form.pricing_mode,
        currency: form.currency || "XOF",
        price_amount: form.pricing_mode === "free" ? 0 : parseProductAmount(form.price),
        image_url: form.image_url || "",
        image_urls: form.image_urls.length > 0 ? form.image_urls : null,
        payment_link: form.payment_link.trim() || null,
        digital_asset_path: form.digital_asset_path.trim() || null,
        digital_asset_name: form.digital_asset_name.trim() || null,
        digital_asset_size: form.digital_asset_size ? Number(form.digital_asset_size) : null,
        key_features: form.key_features,
        product_mode: form.product_mode,
        sku: form.sku.trim() || null,
        inventory_quantity: form.inventory_quantity ? Number(form.inventory_quantity) : null,
        shipping_notes: form.shipping_notes.trim() || null,
        vendor_id: vendorId,
        status: finalStatus,
        is_lms: form.is_lms,
      };
      const productId = productData.id as string;
      const { error } = isEdit
        ? await (supabase as any).from("products").update(productData).eq("id", form.id).eq("vendor_id", vendorId)
        : await (supabase as any).from("products").insert(productData);
      if (error) throw error;

      if (form.is_lms) {
        const { error: courseSettingsError } = await (supabase as any)
          .from("course_settings")
          .upsert({ product_id: productId, status: finalStatus === "published" ? "published" : "draft" }, { onConflict: "product_id" });
        if (courseSettingsError) throw courseSettingsError;
      }

      // Channel publication is deliberately independent: a seller can keep a product
      // in their own store while hiding it from marketplace discovery.
      try {
        const initial = initialFormRef.current;
        const marketplaceMajorChange = !isEdit || !initial || [
          "title",
          "description",
          "category",
          "price",
          "pricing_mode",
          "old_price",
          "image_url",
          "image_urls",
          "product_mode",
          "digital_asset_path",
          "digital_asset_name",
        ].some((key) => JSON.stringify((form as any)[key]) !== JSON.stringify((initial as any)[key]));
        const publicationStatus = (enabled: boolean, channel: "storefront" | "marketplace") => {
          if (!enabled) return finalStatus === "draft" ? "draft" : "hidden";
          if (finalStatus === "draft") return "draft";
          if (channel === "marketplace" && publicationStatuses.marketplace === "published" && !marketplaceMajorChange) return "published";
          return channel === "marketplace" ? "pending_review" : "published";
        };
        const storefrontStatus = publicationStatus(distribution.storefront, "storefront");
        const marketplaceStatus = publicationStatus(distribution.marketplace, "marketplace");
        persistedStorefrontStatus = storefrontStatus;
        persistedMarketplaceStatus = marketplaceStatus;
        const publishedAt = new Date().toISOString();
        const { error: publicationError } = await (supabase as any)
          .from("product_publications")
          .upsert([
            { product_id: productId, vendor_id: vendorId, channel: "storefront", status: storefrontStatus, published_at: storefrontStatus === "published" ? publishedAt : null },
            { product_id: productId, vendor_id: vendorId, channel: "marketplace", status: marketplaceStatus, published_at: marketplaceStatus === "published" ? publishedAt : null },
          ], { onConflict: "product_id,channel" });
        if (publicationError) {
          throw new Error(`Produit enregistré, mais les canaux n'ont pas pu être configurés : ${publicationError.message}`);
        }
      } catch (publicationError) {
        clearLocalDraft();
        setIsDirty(false);
        queryClient.invalidateQueries({ queryKey: ["products"] });
        queryClient.invalidateQueries({ queryKey: ["vendor-products"] });
        toast.warning("Produit enregistré, publication à finaliser", {
          description: (publicationError as Error).message || "Réessayez depuis la liste de vos produits.",
        });
        navigate("/dashboard/products");
        return;
      }
      const verb = isEdit
        ? "mis à jour"
        : finalStatus === "draft"
          ? "sauvegardé en brouillon"
          : "publié";
      toast.success(`Produit ${verb} ✨`, {
        description: finalStatus === "draft"
          ? "Votre produit reste privé jusqu’à sa publication."
          : persistedMarketplaceStatus === "pending_review" && persistedStorefrontStatus === "published"
            ? "Votre produit est visible dans votre boutique et envoyé en revue pour la marketplace."
            : persistedMarketplaceStatus === "pending_review"
              ? "Votre produit a été envoyé en revue pour la marketplace."
              : persistedStorefrontStatus === "published"
                ? "Votre produit est visible dans votre boutique personnelle."
                : "Votre produit reste masqué jusqu'à sa prochaine publication.",
      });
      clearLocalDraft();
      setIsDirty(false);
      queryClient.invalidateQueries({ queryKey: ["products"] });
      queryClient.invalidateQueries({ queryKey: ["vendor-products"] });
      navigate("/dashboard/products");
    } catch (e: unknown) {
      toast.error("Erreur", { description: (e as Error).message });
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

  const isDraft = !isEdit || form.status === "draft";

  const mockProduct = useMemo(
    () => ({
      id: form.id || "preview-id",
      title: form.title || "Titre de votre produit",
      price: form.price || "0 FCFA",
      oldPrice: form.old_price,
      image:
        form.image_url ||
        "https://placehold.co/600x400/png?text=Aperçu+Produit",
      category: form.category as Category,
      vendorId: vendorId,
      rating: 5,
    } as any),
    [form, vendorId],
  );

  // ===== File Upload (Digital Product)
  const uploadDigitalFile = async (file: File) => {
    if (!user) return;
    if (!canMutate) {
      toast.info("Upload désactivé en mode démo", { description: "Les fichiers ne sont pas envoyés depuis l'aperçu local." });
      return;
    }
    setFileUploading(true);
    try {
      const ext = file.name.split(".").pop()?.toLowerCase();
      const allowed = ["pdf", "zip", "rar", "mp4", "mov", "mp3", "doc", "docx", "xlsx", "pptx"];
      if (!ext || !allowed.includes(ext)) {
        throw new Error("Format non pris en charge. Utilisez PDF, ZIP, MP4, MP3, Word, Excel ou PowerPoint.");
      }
      if (file.size > 250 * 1024 * 1024) {
        throw new Error("Le fichier ne doit pas dépasser 250 Mo.");
      }
      const path = `${user.id}/digital-products/${crypto.randomUUID()}.${ext}`;
      const { error } = await supabase.storage
        .from("digital-products")
        .upload(path, file, { upsert: false, contentType: file.type || undefined });
      if (error) throw error;
      setForm((f) => ({
        ...f,
        digital_asset_path: path,
        digital_asset_name: file.name,
        digital_asset_size: String(file.size),
      }));
      toast.success("Fichier digital sécurisé ajouté");
    } catch (e: unknown) {
      toast.error("Erreur upload fichier", { description: (e as Error).message });
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
            {!isEdit && saveState !== "idle" && (
              <span
                className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-semibold transition-opacity ${
                  saveState === "saving"
                    ? "bg-muted text-muted-foreground"
                    : "bg-success/10 text-success"
                }`}
              >
                {saveState === "saving" ? (
                  <>
                    <Loader2 size={9} className="animate-spin" /> Sauvegarde…
                  </>
                ) : (
                  <>
                    <Check size={9} /> Sauvegardé
                  </>
                )}
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

            <Button
              size="sm"
              variant="outline"
              onClick={() => handleSave("draft")}
              disabled={saving || !form.title.trim() || !canMutate}
            >
              <FileEdit size={14} /> Enregistrer le brouillon
            </Button>
            <Button size="sm" variant="ghost" onClick={() => setShowPreview(true)}>
              <Eye size={14} /> Prévisualiser
            </Button>
            <Button
              size="sm"
              onClick={() => handleSave("published")}
              disabled={saving || !canMutate}
            >
              {saving ? (
                <Loader2 className="animate-spin" size={14} />
              ) : (
                <Save size={14} />
              )}
              Publier selon mes choix
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1fr,360px]">
          {/* Left: stepper + form */}
          <div className="space-y-5">
            {/* Stepper */}
            <div className="overflow-x-auto">
              <div className="flex min-w-max items-center gap-2 rounded-2xl border border-border bg-card p-2">
                {STEPS.filter(s => s.key !== "curriculum" || form.is_lms).map((s, i) => {
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
                              ? "bg-success/15 text-success"
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
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-lg font-bold text-foreground">
                        Informations principales
                      </h3>
                      <p className="mt-1 text-xs text-muted-foreground">
                        Donnez à votre produit un titre clair et descriptif.
                      </p>
                    </div>
                    
                    <div className="flex flex-col items-end gap-1">
                      <div className="flex items-center gap-2">
                        <Label htmlFor="lms-toggle" className="text-[10px] font-black uppercase tracking-widest text-primary">Formation structurée</Label>
                        <Switch 
                          id="lms-toggle" 
                          checked={form.is_lms} 
                          onCheckedChange={(v) => setForm({ ...form, is_lms: v })} 
                        />
                      </div>
                      <p className="text-[9px] text-muted-foreground font-medium italic">Active le mode Chapitres & Leçons</p>
                    </div>
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
                    {validation?.fields.title && <p className="text-xs text-destructive">{validation.fields.title}</p>}
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
                        {CATEGORIES.filter(c => c !== "Tous").map((c) => (
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

                  <div className="space-y-3 rounded-2xl border border-border bg-muted/20 p-4">
                    <div>
                      <Label>Type d’offre</Label>
                      <p className="mt-1 text-[10px] text-muted-foreground">Ce choix adapte la livraison et la gestion du produit.</p>
                    </div>
                    <Select value={form.product_mode} onValueChange={(value: FormState["product_mode"]) => setForm({ ...form, product_mode: value, pricing_mode: (value === "physical" || value === "hybrid") ? "paid" : form.pricing_mode })}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="digital">Produit digital — livraison instantanée</SelectItem>
                        <SelectItem value="physical">Produit physique — stock & livraison</SelectItem>
                        <SelectItem value="hybrid">Offre hybride — physique + digital</SelectItem>
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
                    {validation?.fields.description && <p className="text-xs text-destructive">{validation.fields.description}</p>}
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
                        <div className="pt-3 space-y-2">
                          <p className="text-[11px] font-bold text-foreground">Nombre de variantes à générer</p>
                          <div className="grid grid-cols-4 gap-2">
                            {[1, 2, 3, 4].map((n) => (
                              <button
                                key={n}
                                type="button"
                                onClick={() => setVariantCount(n)}
                                className={`rounded-lg border px-2 py-2 text-xs font-bold transition ${
                                  variantCount === n
                                    ? "border-primary bg-primary text-primary-foreground shadow-sm"
                                    : "border-border bg-background hover:border-primary/40"
                                }`}
                              >
                                {n} {n === 1 ? "boîte" : "boîtes"}
                              </button>
                            ))}
                          </div>
                          <p className="text-[10px] text-muted-foreground">
                            {variantCount === 1
                              ? "Une seule génération personnalisée"
                              : `Choisissez parmi ${variantCount} propositions IA`}
                          </p>
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
                            Générer {variantCount} {variantCount === 1 ? "boîte 3D" : "variantes"}
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
                                } catch (err: unknown) {
                                  toast.error("Erreur d'upload", {
                                    description: (err as Error).message,
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

                  {(form.product_mode === "digital" || form.product_mode === "hybrid") && (
                    <div className={`space-y-4 rounded-2xl border p-4 ${validation?.fields.digitalAsset ? "border-destructive/50 bg-destructive/5" : "border-primary/20 bg-primary/5"}`}>
                      <div className="flex items-start gap-3">
                        <div className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-primary/15 text-primary"><FileArchive size={17} /></div>
                        <div>
                          <h3 className="text-sm font-bold">Fichier livré après l’achat <span className="text-destructive">*</span></h3>
                          <p className="mt-1 text-xs text-muted-foreground">Ajoutez le PDF, ZIP, vidéo ou document que l’acheteur recevra. Il sera séparé de votre image de couverture.</p>
                        </div>
                      </div>
                      {form.digital_asset_name ? (
                        <div className="flex items-center gap-3 rounded-xl border border-success/30 bg-success/10 p-3">
                          <CheckCircle2 size={18} className="shrink-0 text-success" />
                          <div className="min-w-0 flex-1"><p className="truncate text-sm font-semibold">{form.digital_asset_name}</p><p className="text-[11px] text-muted-foreground">{form.digital_asset_size ? `${(Number(form.digital_asset_size) / 1024 / 1024).toFixed(1)} Mo` : "Fichier sécurisé"}</p></div>
                          <Button type="button" variant="ghost" size="sm" onClick={() => setForm((current) => ({ ...current, digital_asset_path: "", digital_asset_name: "", digital_asset_size: "" }))} className="text-destructive hover:text-destructive"><Trash2 size={14} /> Retirer</Button>
                        </div>
                      ) : (
                        <label className="flex min-h-24 cursor-pointer items-center justify-center rounded-xl border border-dashed border-primary/40 bg-background/40 px-4 text-center transition hover:border-primary hover:bg-primary/5">
                          <span className="flex flex-col items-center gap-1 text-xs font-semibold"><Upload size={18} className="text-primary" />{fileUploading ? "Upload en cours…" : "Choisir le fichier à livrer"}<span className="text-[10px] font-normal text-muted-foreground">PDF, ZIP, MP4, MP3, Word, Excel ou PowerPoint — 250 Mo max.</span></span>
                          <input type="file" accept=".pdf,.zip,.rar,.mp4,.mov,.mp3,.doc,.docx,.xlsx,.pptx" className="hidden" disabled={fileUploading} onChange={(event) => { const file = event.target.files?.[0]; if (file) uploadDigitalFile(file); event.currentTarget.value = ""; }} />
                        </label>
                      )}
                      {validation?.fields.digitalAsset && <p className="flex items-center gap-1.5 text-xs font-medium text-destructive"><AlertCircle size={13} /> {validation.fields.digitalAsset}</p>}
                    </div>
                  )}

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
                  </div>

                  <div className="grid gap-3 sm:grid-cols-2" role="radiogroup" aria-label="Mode de tarification">
                    {([
                      ["free", "Gratuit", "Accès sans paiement après inscription", "Obtenir gratuitement"],
                      ["paid", "Payant", "Vente via le checkout MindHubs", "Acheter maintenant"],
                    ] as const).map(([value, label, description]) => {
                      const selected = form.pricing_mode === value;
                      const unavailable = value === "free" && (form.product_mode === "physical" || form.product_mode === "hybrid");
                      return (
                        <button
                          key={value}
                          type="button"
                          role="radio"
                          aria-checked={selected}
                          disabled={unavailable}
                          onClick={() => setForm((current) => ({ ...current, pricing_mode: value, old_price: value === "free" ? "" : current.old_price }))}
                          className={`rounded-2xl border p-4 text-left transition-colors ${selected ? "border-primary bg-primary/10" : "border-border bg-muted/20 hover:border-primary/40"} ${unavailable ? "cursor-not-allowed opacity-50" : ""}`}
                        >
                          <div className="flex items-center justify-between gap-3">
                            <span className="font-bold">{label}</span>
                            <span className={`grid size-5 place-items-center rounded-full border ${selected ? "border-primary bg-primary text-primary-foreground" : "border-border"}`}>
                              {selected ? <Check size={12} /> : null}
                            </span>
                          </div>
                          <span className="mt-1 block text-xs text-muted-foreground">{unavailable ? "Disponible uniquement pour les produits digitaux et formations." : description}</span>
                        </button>
                      );
                    })}
                  </div>

                  {form.pricing_mode === "free" ? (
                    <div className="flex items-start gap-3 rounded-2xl border border-primary/30 bg-primary/10 p-4 text-sm">
                      <CheckCircle2 className="mt-0.5 shrink-0 text-primary" size={18} />
                      <div><p className="font-semibold">Produit gratuit</p><p className="mt-1 text-xs text-muted-foreground">Les utilisateurs devront créer un compte pour obtenir l’accès. Aucun paiement ne sera demandé.</p></div>
                    </div>
                  ) : <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
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
                      {validation?.fields.price && <p className="text-xs text-destructive">{validation.fields.price}</p>}
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
                      {validation?.fields.oldPrice && <p className="text-xs text-destructive">{validation.fields.oldPrice}</p>}
                    </div>
                  </div>}

                  {previewDiscount !== null && (
                    <div className="flex items-center gap-3 rounded-xl border border-success/30 bg-success/10 p-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-success/20 text-success">
                        <Sparkles size={16} />
                      </div>
                      <div>
                        <p className="text-sm font-bold text-success">
                          Promotion -{previewDiscount}% affichée
                        </p>
                        <p className="text-xs text-muted-foreground">
                          Une réduction visible booste les conversions.
                        </p>
                      </div>
                    </div>
                  )}

                  {(form.product_mode === "physical" || form.product_mode === "hybrid") && (
                    <div className="space-y-3 rounded-2xl border border-border bg-muted/20 p-4">
                      <div><h3 className="text-sm font-bold">Logistique</h3><p className="mt-1 text-xs text-muted-foreground">Ces informations permettent de vendre une offre physique sans configuration cachée.</p></div>
                      <div className="grid gap-3 sm:grid-cols-2">
                        <div className="space-y-1.5"><Label htmlFor="inventory_quantity">Stock disponible <span className="text-destructive">*</span></Label><Input id="inventory_quantity" type="number" min="0" step="1" value={form.inventory_quantity} onChange={(event) => setForm({ ...form, inventory_quantity: event.target.value })} placeholder="Ex. 25" />{validation?.fields.inventoryQuantity && <p className="text-xs text-destructive">{validation.fields.inventoryQuantity}</p>}</div>
                        <div className="space-y-1.5"><Label htmlFor="sku">SKU <span className="text-[10px] text-muted-foreground">(facultatif)</span></Label><Input id="sku" value={form.sku} onChange={(event) => setForm({ ...form, sku: event.target.value })} placeholder="Ex. MH-001" /></div>
                        <div className="space-y-1.5 sm:col-span-2"><Label htmlFor="shipping_notes">Zones, délais et conditions de livraison <span className="text-destructive">*</span></Label><Textarea id="shipping_notes" value={form.shipping_notes} onChange={(event) => setForm({ ...form, shipping_notes: event.target.value })} placeholder="Ex. Livraison à Cotonou sous 2 à 4 jours…" />{validation?.fields.shippingNotes && <p className="text-xs text-destructive">{validation.fields.shippingNotes}</p>}</div>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {step === "curriculum" && (
                <CourseBuilder courseId={form.id} />
              )}

              {step === "details" && (
                <div className="space-y-5">
                  <div>
                    <h3 className="text-lg font-bold text-foreground">
                      Vérification et publication
                    </h3>
                    <p className="mt-1 text-xs text-muted-foreground">
                      Vérifiez votre offre, choisissez ses canaux et publiez quand vous êtes prêt.
                    </p>
                  </div>

                  <div className="rounded-2xl border border-border bg-muted/20 p-4" aria-live="polite">
                    <div className="mb-3 flex items-center justify-between gap-3">
                      <div><p className="text-sm font-bold">Checklist de publication</p><p className="text-xs text-muted-foreground">Les éléments en attente vous indiquent exactement quoi corriger.</p></div>
                      <span className={`rounded-full px-2.5 py-1 text-[10px] font-bold ${publishValidation.valid ? "bg-success/15 text-success" : "bg-warning/15 text-warning"}`}>{publishValidation.valid ? "Prêt à publier" : `${Object.keys(publishValidation.fields).length} élément${Object.keys(publishValidation.fields).length > 1 ? "s" : ""} à corriger`}</span>
                    </div>
                    <div className="grid gap-2 sm:grid-cols-2">
                      {[
                        ["Offre", publishValidation.missingByStep.offer, "info" as StepKey],
                        ["Contenu", publishValidation.missingByStep.content, "media" as StepKey],
                        ["Prix et logistique", publishValidation.missingByStep.pricing, "pricing" as StepKey],
                        ["Distribution", publishValidation.missingByStep.publication, "details" as StepKey],
                      ].map(([label, missing, target]) => (
                        <button type="button" key={label as string} onClick={() => (missing as string[]).length > 0 && setStep(target as StepKey)} className="flex items-center gap-2 rounded-xl border border-border bg-background/60 px-3 py-2 text-left text-xs transition hover:border-primary/50">
                          {(missing as string[]).length === 0 ? <CheckCircle2 size={14} className="text-success" /> : <AlertCircle size={14} className="text-warning" />}
                          <span className="min-w-0 flex-1"><span className="font-semibold">{label as string}</span>{(missing as string[]).length > 0 && <span className="mt-0.5 block truncate text-[10px] text-muted-foreground">{(missing as string[]).join(" · ")}</span>}</span>
                        </button>
                      ))}
                    </div>
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

                  <div className="space-y-4 rounded-2xl border border-primary/20 bg-primary/5 p-4">
                    <div>
                      <div className="flex items-center gap-2">
                        <Globe size={16} className="text-primary" />
                        <Label className="text-sm font-black">Canaux de publication</Label>
                      </div>
                      <p className="mt-1 text-xs text-muted-foreground">
                        La boutique est votre canal direct. La marketplace est facultative, soumise à revue et n’offre aucune garantie de trafic.
                      </p>
                    </div>
                    <div className="grid gap-3 sm:grid-cols-2">
                      <label className="flex cursor-pointer items-start gap-3 rounded-xl border border-border bg-card p-3 transition hover:border-primary/40">
                        <Switch
                          checked={distribution.storefront}
                          onCheckedChange={(checked) => setDistribution((current) => ({ ...current, storefront: checked }))}
                          aria-label="Publier dans ma boutique"
                        />
                          <span className="min-w-0">
                            <span className="flex items-center gap-1.5 text-sm font-bold"><Store size={14} className="text-primary" /> Ma boutique</span>
                            <span className="mt-1 block text-[11px] text-muted-foreground">Contrôle total et lien personnel partageable.</span>
                            <span className="mt-1 block text-[10px] font-semibold text-primary">{publicationStatuses.storefront || (distribution.storefront ? "Sera publiée" : "Non sélectionnée")}</span>
                        </span>
                      </label>
                      <label className="flex cursor-pointer items-start gap-3 rounded-xl border border-border bg-card p-3 transition hover:border-primary/40">
                        <Switch
                          checked={distribution.marketplace}
                          onCheckedChange={(checked) => setDistribution((current) => ({ ...current, marketplace: checked }))}
                          aria-label="Proposer dans la marketplace"
                        />
                          <span className="min-w-0">
                            <span className="flex items-center gap-1.5 text-sm font-bold"><Globe size={14} className="text-primary" /> Marketplace MindHubs</span>
                            <span className="mt-1 block text-[11px] text-muted-foreground">Découverte potentielle, soumise aux règles de la plateforme.</span>
                            <span className="mt-1 block text-[10px] font-semibold text-primary">{publicationStatuses.marketplace || (distribution.marketplace ? "Sera envoyée en revue" : "Non sélectionnée")}</span>
                        </span>
                      </label>
                    </div>
                    {(!distribution.storefront && !distribution.marketplace) && (
                      <p className="flex items-center gap-2 text-xs font-semibold text-warning"><AlertCircle size={14} /> Aucun canal sélectionné : le produit restera privé.</p>
                    )}
                    {validation?.fields.distribution && <p className="flex items-center gap-2 text-xs font-semibold text-destructive"><AlertCircle size={14} /> {validation.fields.distribution}</p>}
                  </div>
                </div>
              )}
            </div>

            {/* Step nav */}
            <div className="sticky bottom-2 z-10 flex items-center justify-between gap-3 rounded-2xl border border-border bg-background/95 p-2 shadow-xl backdrop-blur supports-[backdrop-filter]:bg-background/80">
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
                  aria-describedby="publish-help"
                >
                  {saving ? (
                    <Loader2 className="animate-spin" size={14} />
                  ) : (
                    <Save size={14} />
                  )}
                  Publier selon mes choix
                </Button>
              )}
            </div>
            {currentStepIndex >= STEPS.length - 1 && !allValid && <p id="publish-help" className="text-right text-xs text-muted-foreground">Corrigez la checklist avant de publier.</p>}
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
                      ? "bg-warning/15 text-warning"
                      : "bg-success/15 text-success"
                  }`}
                >
                  {isDraft ? <FileEdit size={9} /> : <Globe size={9} />}
                  {isDraft ? "Brouillon" : "Publié"}
                </span>
              </div>

              <div className="pointer-events-none transition-all duration-300">
                <ProductCard product={mockProduct} />
              </div>

              <div className="mt-3 space-y-1">
                {STEPS.filter(s => form.is_lms || s.key !== "curriculum").map((s) => (
                  <div
                    key={s.key}
                    className="flex items-center justify-between text-[10px]"
                  >
                    <span className="text-muted-foreground">{s.label}</span>
                    {stepValid[s.key] ? (
                      <span className="inline-flex items-center gap-1 font-semibold text-success">
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
      <Dialog open={showPreview} onOpenChange={setShowPreview}>
        <DialogContent className="max-h-[90vh] max-w-2xl overflow-y-auto rounded-3xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2"><Eye size={18} className="text-primary" /> Prévisualisation du produit</DialogTitle>
            <DialogDescription>Cette vue reflète vos dernières modifications. Elle ne publie rien.</DialogDescription>
          </DialogHeader>
          <div className="rounded-2xl border border-border bg-muted/20 p-4">
            <ProductCard product={mockProduct} />
          </div>
          <div className="rounded-2xl border border-border bg-background p-4 text-sm">
            <p className="font-semibold">Statut actuel</p>
            <p className="mt-1 text-xs text-muted-foreground">{isDraft ? "Ce produit est encore privé. Enregistrez-le puis publiez les canaux choisis depuis la dernière étape." : "Ce produit est enregistré. Les changements non sauvegardés sont visibles uniquement dans cet aperçu."}</p>
          </div>
          <DialogFooter><Button type="button" onClick={() => setShowPreview(false)}>Continuer l’édition</Button></DialogFooter>
        </DialogContent>
      </Dialog>
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

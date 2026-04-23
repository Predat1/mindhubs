import { useEffect, useMemo, useState } from "react";
import { useSearchParams, Link } from "react-router-dom";
import { Sparkles, Loader2, Wand2, Megaphone, ChevronRight, Image as ImageIcon } from "lucide-react";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import VendorGuard from "@/components/dashboard/VendorGuard";
import SEO from "@/components/SEO";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { useCurrentVendor, useVendorProducts } from "@/hooks/useVendors";
import { useAuth } from "@/contexts/AuthContext";
import {
  ANGLE_OPTIONS, FORMAT_OPTIONS,
  useAdCreatives, useGenerateAdKit,
  type AdAngle, type AdFormat,
} from "@/hooks/useAdCreatives";
import AdKitCard from "@/components/ads/AdKitCard";
import { toast } from "sonner";

const Inner = () => {
  const [searchParams] = useSearchParams();
  const presetProductId = searchParams.get("product");
  const { user } = useAuth();
  const { data: vendor } = useCurrentVendor();
  const { data: products = [], isLoading: productsLoading } = useVendorProducts(vendor?.id);
  const publishedProducts = useMemo(
    () => (products as any[]).filter((p) => p.status === "published" || !p.status),
    [products],
  );

  const [productId, setProductId] = useState<string>("");
  const [angles, setAngles] = useState<AdAngle[]>(["benefit", "social_proof"]);
  const [formats, setFormats] = useState<AdFormat[]>(["1:1", "9:16"]);

  useEffect(() => {
    if (presetProductId && !productId) setProductId(presetProductId);
    else if (!productId && publishedProducts.length > 0) setProductId(publishedProducts[0].id);
  }, [presetProductId, publishedProducts, productId]);

  const selectedProduct = publishedProducts.find((p) => p.id === productId);
  const productLink = selectedProduct
    ? `${window.location.origin}/produit/${selectedProduct.id}`
    : "";

  const { data: creatives = [], isLoading: creativesLoading } = useAdCreatives(vendor?.id);
  const filteredCreatives = useMemo(
    () => creatives.filter((c) => !productId || c.product_id === productId),
    [creatives, productId],
  );

  const generate = useGenerateAdKit();

  const toggleAngle = (a: AdAngle) =>
    setAngles((prev) => (prev.includes(a) ? prev.filter((x) => x !== a) : [...prev, a]));
  const toggleFormat = (f: AdFormat) =>
    setFormats((prev) => (prev.includes(f) ? prev.filter((x) => x !== f) : [...prev, f]));

  const totalToGenerate = angles.length * formats.length;

  const handleGenerate = async () => {
    if (!vendor || !user || !selectedProduct) {
      toast.error("Sélectionnez un produit");
      return;
    }
    if (angles.length === 0 || formats.length === 0) {
      toast.error("Choisissez au moins 1 angle et 1 format");
      return;
    }
    if (totalToGenerate > 8) {
      toast.error("Maximum 8 créatives par génération", { description: "Réduisez le nombre d'angles ou de formats." });
      return;
    }
    const t = toast.loading(`Génération du kit publicitaire en cours… (${totalToGenerate} créative${totalToGenerate > 1 ? "s" : ""})`, {
      description: "Analyse du produit, copywriting, ciblage et création des images.",
    });
    try {
      await generate.mutateAsync({
        vendorId: vendor.id,
        userId: user.id,
        product: selectedProduct as any,
        angles,
        formats,
      });
      toast.success("🎉 Kit publicitaire généré !", { id: t, description: "Vos créatives sont prêtes ci-dessous." });
    } catch (e: any) {
      toast.error("Erreur de génération", { id: t, description: e.message });
    }
  };

  return (
    <DashboardLayout
      variant="vendor"
      title="Studio Pub Facebook"
      shopName={vendor?.shop_name}
      shopUrl={vendor ? `/store/${vendor.username}` : undefined}
    >
      <SEO title="Studio Pub Facebook — Générateur de créatives IA" description="Créez des créatives publicitaires Facebook optimisées conversion en 1 clic." />

      <div className="space-y-6">
        {/* Hero */}
        <Card className="relative overflow-hidden border-primary/30 bg-gradient-to-br from-card via-card to-primary/5 p-6">
          <div className="aurora-glow pointer-events-none absolute inset-0 opacity-50" />
          <div className="relative space-y-2">
            <div className="inline-flex items-center gap-2 rounded-full bg-primary/15 px-3 py-1 text-xs font-bold text-primary">
              <Sparkles size={12} className="animate-pulse" /> Nouveau ✨
            </div>
            <h1 className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-foreground via-primary to-foreground bg-clip-text text-transparent">
              Studio Pub Facebook
            </h1>
            <p className="text-sm text-muted-foreground max-w-2xl">
              Générez en 1 clic des <strong>créatives publicitaires</strong>, des <strong>textes optimisés conversion</strong> et un <strong>ciblage Facebook précis</strong> pour vos produits — par angle marketing et format.
            </p>
          </div>
        </Card>

        {/* Generator */}
        <Card className="p-6 space-y-5 border-border/60">
          <div className="space-y-2">
            <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">1. Produit à promouvoir</label>
            {productsLoading ? (
              <Skeleton className="h-10 w-full" />
            ) : publishedProducts.length === 0 ? (
              <div className="rounded-md border border-dashed border-border p-4 text-sm text-muted-foreground">
                Vous n'avez aucun produit publié. <Link to="/dashboard/new-product" className="text-primary hover:underline">Publier un produit →</Link>
              </div>
            ) : (
              <Select value={productId} onValueChange={setProductId}>
                <SelectTrigger><SelectValue placeholder="Choisir un produit…" /></SelectTrigger>
                <SelectContent>
                  {publishedProducts.map((p: any) => (
                    <SelectItem key={p.id} value={p.id}>
                      <div className="flex items-center gap-2">
                        {p.image_url && <img src={p.image_url} alt="" className="h-6 w-6 rounded object-cover" />}
                        <span>{p.title}</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          </div>

          <div className="space-y-2">
            <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
              2. Angles marketing ({angles.length} sélectionné{angles.length > 1 ? "s" : ""})
            </label>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
              {ANGLE_OPTIONS.map((a) => {
                const active = angles.includes(a.value);
                return (
                  <button
                    key={a.value}
                    onClick={() => toggleAngle(a.value)}
                    className={`group relative flex items-center gap-2 rounded-lg border-2 p-3 text-left transition-all ${
                      active
                        ? `border-primary bg-gradient-to-br ${a.color} text-white shadow-lg scale-[1.02]`
                        : "border-border bg-card hover:border-primary/40 hover:bg-muted/40"
                    }`}
                  >
                    <span className="text-xl">{a.emoji}</span>
                    <span className="text-sm font-bold">{a.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
              3. Formats ({formats.length} sélectionné{formats.length > 1 ? "s" : ""})
            </label>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
              {FORMAT_OPTIONS.map((f) => {
                const active = formats.includes(f.value);
                return (
                  <button
                    key={f.value}
                    onClick={() => toggleFormat(f.value)}
                    className={`flex flex-col items-start gap-1 rounded-lg border-2 p-3 text-left transition-all ${
                      active
                        ? "border-primary bg-primary/10 text-foreground shadow-md"
                        : "border-border bg-card hover:border-primary/40"
                    }`}
                  >
                    <div className="flex items-center gap-1.5">
                      <ImageIcon size={14} className={active ? "text-primary" : "text-muted-foreground"} />
                      <span className="text-sm font-bold">{f.label}</span>
                    </div>
                    <span className="text-[10px] text-muted-foreground">{f.subtitle}</span>
                    <span className="mt-1 rounded-full bg-muted px-2 py-0.5 text-[10px] font-bold">{f.value}</span>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 pt-2 border-t border-border">
            <div className="text-xs text-muted-foreground">
              <strong className="text-foreground">{totalToGenerate}</strong> créative{totalToGenerate > 1 ? "s" : ""} ser{totalToGenerate > 1 ? "ont" : "a"} générée{totalToGenerate > 1 ? "s" : ""}
              {totalToGenerate > 0 && ` • ${angles.length} kit${angles.length > 1 ? "s" : ""} de copywriting + ciblage`}
            </div>
            <Button
              size="lg"
              className="btn-glow gap-2"
              onClick={handleGenerate}
              disabled={generate.isPending || !productId || totalToGenerate === 0 || totalToGenerate > 8}
            >
              {generate.isPending ? (
                <><Loader2 size={16} className="animate-spin" /> Génération en cours…</>
              ) : (
                <><Wand2 size={16} /> Générer mon kit publicitaire <ChevronRight size={16} /></>
              )}
            </Button>
          </div>
        </Card>

        {/* Results */}
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <Megaphone size={18} className="text-primary" />
            <h2 className="text-lg font-bold">
              {selectedProduct ? `Créatives pour "${selectedProduct.title}"` : "Vos créatives"}
            </h2>
            <span className="text-xs text-muted-foreground">({filteredCreatives.length})</span>
          </div>

          {creativesLoading ? (
            <div className="space-y-3">
              <Skeleton className="h-64 w-full" />
              <Skeleton className="h-64 w-full" />
            </div>
          ) : filteredCreatives.length === 0 ? (
            <Card className="p-10 text-center border-dashed">
              <Sparkles size={32} className="mx-auto text-muted-foreground mb-3" />
              <p className="text-sm text-muted-foreground">
                Aucune créative pour ce produit. Lancez une génération ci-dessus 👆
              </p>
            </Card>
          ) : (
            <div className="space-y-4">
              {filteredCreatives.map((c) => (
                <AdKitCard key={c.id} creative={c} productLink={`${window.location.origin}/produit/${c.product_id}`} />
              ))}
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
};

const VendorAdsStudio = () => (
  <VendorGuard>
    {() => <Inner />}
  </VendorGuard>
);

export default VendorAdsStudio;

import { useState } from "react";
import { Copy, Download, Check, Trash2, ExternalLink, Target, Megaphone, RefreshCw, Image as ImageIcon, FileText, Loader2, Sparkles } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { toast } from "sonner";
import {
  ANGLE_OPTIONS, type AdCreative,
  useDeleteAdCreative, useRegenerateImage, useRegenerateCopy, useRegenerateTargeting, useRegenerateVariant,
} from "@/hooks/useAdCreatives";
import { useAuth } from "@/contexts/AuthContext";

const FORMAT_RATIO: Record<string, string> = {
  "1:1": "aspect-square",
  "9:16": "aspect-[9/16]",
  "16:9": "aspect-video",
  "4:5": "aspect-[4/5]",
};

const COUNTRY_FLAGS: Record<string, string> = {
  "Côte d'Ivoire": "🇨🇮", "Cote d'Ivoire": "🇨🇮", "Sénégal": "🇸🇳", "Cameroun": "🇨🇲",
  "Bénin": "🇧🇯", "Togo": "🇹🇬", "Mali": "🇲🇱", "Burkina Faso": "🇧🇫",
  "Gabon": "🇬🇦", "Congo": "🇨🇬", "RDC": "🇨🇩", "Niger": "🇳🇪", "Guinée": "🇬🇳",
};

const copyText = (text: string, label = "Texte") => {
  navigator.clipboard.writeText(text);
  toast.success(`${label} copié ✨`);
};

interface AdKitCardProps {
  creative: AdCreative;
  productLink: string;
}

const AdKitCard = ({ creative, productLink }: AdKitCardProps) => {
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const angle = ANGLE_OPTIONS.find((a) => a.value === creative.angle);
  const { user } = useAuth();
  const del = useDeleteAdCreative();
  const regenImage = useRegenerateImage();
  const regenCopy = useRegenerateCopy();
  const regenTargeting = useRegenerateTargeting();
  const regenVariant = useRegenerateVariant();

  const isRegenerating =
    regenImage.isPending || regenCopy.isPending || regenTargeting.isPending || regenVariant.isPending;

  const runWithToast = async (label: string, fn: () => Promise<unknown>) => {
    const t = toast.loading(`Régénération : ${label}…`);
    try {
      await fn();
      toast.success(`${label} régénéré ✨`, { id: t });
    } catch (e: any) {
      toast.error("Erreur de régénération", { id: t, description: e.message });
    }
  };

  const handleRegenImage = () =>
    user && runWithToast("Image", () => regenImage.mutateAsync({ creative, userId: user.id }));
  const handleRegenCopy = () => runWithToast("Copywriting", () => regenCopy.mutateAsync({ creative }));
  const handleRegenTargeting = () => runWithToast("Ciblage", () => regenTargeting.mutateAsync({ creative }));
  const handleRegenFullAngle = () =>
    user &&
    runWithToast("Nouvelle variante", () =>
      regenVariant.mutateAsync({
        vendorId: creative.vendor_id,
        userId: user.id,
        productId: creative.product_id,
        angle: creative.angle,
        format: creative.format,
      }),
    );

  const handleCopy = (text: string, key: string, label: string) => {
    copyText(text, label);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 1500);
  };

  const handleDownload = async () => {
    if (!creative.image_url) return;
    try {
      const res = await fetch(creative.image_url);
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `pub-${creative.angle}-${creative.format.replace(":", "x")}.png`;
      a.click();
      URL.revokeObjectURL(url);
    } catch {
      window.open(creative.image_url, "_blank");
    }
  };

  const handleDelete = async () => {
    if (!confirm("Supprimer cette créative ?")) return;
    await del.mutateAsync(creative.id);
    toast.success("Créative supprimée");
  };

  const targeting = creative.targeting_data;
  const copy = creative.copy_data;

  const targetingText = `🎯 CIBLAGE FACEBOOK ADS
Âge : ${targeting.age_min}-${targeting.age_max} ans
Genre : ${targeting.gender === "all" ? "Tous" : targeting.gender === "men" ? "Hommes" : "Femmes"}
Pays : ${targeting.countries?.join(", ")}
Intérêts : ${targeting.interests?.join(", ")}
Comportements : ${targeting.behaviors?.join(", ")}
Budget journalier : ${targeting.daily_budget?.amount_xof} XOF (${targeting.daily_budget?.level})
Objectif campagne : ${targeting.campaign_objective}`;

  const fullKitText = `📱 PUB FACEBOOK — ${angle?.label}

${copy.primary_text}

🔗 ${productLink}

${targetingText}`;

  return (
    <Card className="card-premium overflow-hidden border-border/60 bg-card/80 backdrop-blur">
      <div className="flex flex-col md:flex-row">
        {/* Image preview */}
        <div className="relative md:w-[40%] bg-gradient-to-br from-background to-muted p-4 flex items-center justify-center">
          <div className={`relative w-full max-w-[280px] ${FORMAT_RATIO[creative.format]} overflow-hidden rounded-lg border-2 border-primary/30 shadow-[0_8px_32px_hsl(var(--primary)/0.15)]`}>
            {creative.image_url ? (
              <img src={creative.image_url} alt={`Pub ${angle?.label}`} className="h-full w-full object-cover" />
            ) : (
              <div className="h-full w-full flex items-center justify-center text-muted-foreground text-xs">Pas d'image</div>
            )}
            <span className="absolute top-2 left-2 rounded-md bg-background/90 px-2 py-0.5 text-[10px] font-bold text-foreground">
              {creative.format}
            </span>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 p-5 space-y-4">
          <div className="flex items-start justify-between gap-2">
            <div className="space-y-1">
              <div className={`inline-flex items-center gap-1.5 rounded-full bg-gradient-to-r ${angle?.color} px-3 py-1 text-xs font-bold text-white shadow-lg`}>
                <span>{angle?.emoji}</span> {angle?.label}
              </div>
              <p className="text-[10px] text-muted-foreground">
                {new Date(creative.created_at).toLocaleString("fr-FR", { dateStyle: "short", timeStyle: "short" })}
              </p>
            </div>
            <div className="flex gap-1">
              <Button size="sm" variant="ghost" onClick={handleDownload} title="Télécharger l'image" disabled={isRegenerating}>
                <Download size={14} />
              </Button>
              <Button size="sm" variant="ghost" onClick={() => handleCopy(fullKitText, "kit", "Kit complet")} title="Copier tout le kit">
                {copiedKey === "kit" ? <Check size={14} className="text-emerald-500" /> : <Copy size={14} />}
              </Button>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button size="sm" variant="ghost" title="Régénérer" disabled={isRegenerating}>
                    {isRegenerating ? <Loader2 size={14} className="animate-spin text-primary" /> : <RefreshCw size={14} />}
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-60">
                  <DropdownMenuLabel className="text-[10px] uppercase tracking-wider text-muted-foreground">
                    Régénérer uniquement
                  </DropdownMenuLabel>
                  <DropdownMenuItem onClick={handleRegenImage} className="gap-2">
                    <ImageIcon size={14} className="text-primary" />
                    <div className="flex flex-col">
                      <span className="text-xs font-semibold">L'image</span>
                      <span className="text-[10px] text-muted-foreground">Garde texte + ciblage</span>
                    </div>
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={handleRegenCopy} className="gap-2">
                    <FileText size={14} className="text-primary" />
                    <div className="flex flex-col">
                      <span className="text-xs font-semibold">Le copywriting</span>
                      <span className="text-[10px] text-muted-foreground">Nouveaux titres + texte</span>
                    </div>
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={handleRegenTargeting} className="gap-2">
                    <Target size={14} className="text-primary" />
                    <div className="flex flex-col">
                      <span className="text-xs font-semibold">Le ciblage</span>
                      <span className="text-[10px] text-muted-foreground">Audience, intérêts, budget</span>
                    </div>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleRegenFullAngle} className="gap-2">
                    <Sparkles size={14} className="text-primary" />
                    <div className="flex flex-col">
                      <span className="text-xs font-semibold">Variante complète</span>
                      <span className="text-[10px] text-muted-foreground">Crée une nouvelle créative</span>
                    </div>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
              <Button size="sm" variant="ghost" onClick={handleDelete} className="text-destructive hover:text-destructive" title="Supprimer" disabled={isRegenerating}>
                <Trash2 size={14} />
              </Button>
            </div>
          </div>

          {/* Primary text */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Texte principal</span>
              <Button size="sm" variant="ghost" className="h-6 gap-1 text-[10px]" onClick={() => handleCopy(copy.primary_text, "primary", "Texte principal")}>
                {copiedKey === "primary" ? <Check size={11} className="text-emerald-500" /> : <Copy size={11} />} Copier
              </Button>
            </div>
            <p className="rounded-md bg-muted/50 p-3 text-sm leading-relaxed">{copy.primary_text}</p>
          </div>

          {/* Headlines */}
          <div className="space-y-1.5">
            <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Titres ({copy.headlines?.length || 0})</span>
            <div className="space-y-1">
              {copy.headlines?.map((h, i) => (
                <button
                  key={i}
                  onClick={() => handleCopy(h, `h-${i}`, "Titre")}
                  className="flex w-full items-center justify-between rounded-md border border-border/60 bg-background/60 px-2.5 py-1.5 text-left text-xs hover:border-primary/50 hover:bg-primary/5 transition-colors"
                >
                  <span className="truncate">{h}</span>
                  {copiedKey === `h-${i}` ? <Check size={11} className="text-emerald-500 shrink-0" /> : <Copy size={11} className="text-muted-foreground shrink-0" />}
                </button>
              ))}
            </div>
          </div>

          {/* Descriptions */}
          <div className="space-y-1.5">
            <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Descriptions ({copy.descriptions?.length || 0})</span>
            <div className="flex flex-wrap gap-1.5">
              {copy.descriptions?.map((d, i) => (
                <button
                  key={i}
                  onClick={() => handleCopy(d, `d-${i}`, "Description")}
                  className="rounded-full bg-secondary px-2.5 py-1 text-[11px] hover:bg-primary/20 transition-colors"
                >
                  {d}
                </button>
              ))}
            </div>
            <Badge variant="outline" className="mt-1 border-primary/40 text-primary">
              <Megaphone size={10} className="mr-1" /> CTA : {copy.cta}
            </Badge>
          </div>

          {/* Product link */}
          <div className="space-y-1.5">
            <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Lien produit</span>
            <div className="flex items-center gap-1">
              <code className="flex-1 truncate rounded-md bg-muted px-2 py-1.5 text-[11px]">{productLink}</code>
              <Button size="sm" variant="outline" onClick={() => handleCopy(productLink, "link", "Lien")} className="shrink-0">
                {copiedKey === "link" ? <Check size={12} className="text-emerald-500" /> : <Copy size={12} />}
              </Button>
              <Button size="sm" variant="outline" asChild className="shrink-0">
                <a href={productLink} target="_blank" rel="noreferrer"><ExternalLink size={12} /></a>
              </Button>
            </div>
          </div>

          <Separator />

          {/* Targeting */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-primary">
                <Target size={12} /> Ciblage Facebook recommandé
              </span>
              <Button size="sm" variant="ghost" className="h-6 gap-1 text-[10px]" onClick={() => handleCopy(targetingText, "targeting", "Ciblage")}>
                {copiedKey === "targeting" ? <Check size={11} className="text-emerald-500" /> : <Copy size={11} />} Copier
              </Button>
            </div>
            <div className="grid grid-cols-2 gap-2 text-[11px]">
              <div className="rounded-md bg-muted/40 p-2">
                <p className="text-muted-foreground">Âge</p>
                <p className="font-bold">{targeting.age_min}–{targeting.age_max} ans</p>
              </div>
              <div className="rounded-md bg-muted/40 p-2">
                <p className="text-muted-foreground">Genre</p>
                <p className="font-bold">{targeting.gender === "all" ? "Tous" : targeting.gender === "men" ? "Hommes" : "Femmes"}</p>
              </div>
              <div className="col-span-2 rounded-md bg-muted/40 p-2">
                <p className="text-muted-foreground">Pays cibles</p>
                <p className="font-bold">{targeting.countries?.map((c) => `${COUNTRY_FLAGS[c] || "🌍"} ${c}`).join(" • ")}</p>
              </div>
              <div className="col-span-2 rounded-md bg-muted/40 p-2">
                <p className="text-muted-foreground">Centres d'intérêt</p>
                <div className="mt-1 flex flex-wrap gap-1">
                  {targeting.interests?.map((i, k) => <span key={k} className="rounded-full bg-primary/10 px-2 py-0.5 text-[10px] text-primary">{i}</span>)}
                </div>
              </div>
              <div className="col-span-2 rounded-md bg-muted/40 p-2">
                <p className="text-muted-foreground">Comportements</p>
                <div className="mt-1 flex flex-wrap gap-1">
                  {targeting.behaviors?.map((b, k) => <span key={k} className="rounded-full bg-accent/10 px-2 py-0.5 text-[10px] text-accent-foreground">{b}</span>)}
                </div>
              </div>
              <div className="rounded-md bg-gradient-to-br from-primary/10 to-accent/10 p-2">
                <p className="text-muted-foreground">Budget jour</p>
                <p className="font-bold text-primary">{targeting.daily_budget?.amount_xof?.toLocaleString("fr-FR")} XOF</p>
                <p className="text-[9px] text-muted-foreground">({targeting.daily_budget?.level})</p>
              </div>
              <div className="rounded-md bg-gradient-to-br from-primary/10 to-accent/10 p-2">
                <p className="text-muted-foreground">Objectif</p>
                <p className="font-bold text-primary text-[10px]">{targeting.campaign_objective}</p>
              </div>
            </div>
            {targeting.rationale && (
              <p className="rounded-md border border-dashed border-primary/30 bg-primary/5 p-2 text-[10px] italic text-muted-foreground">
                💡 {targeting.rationale}
              </p>
            )}
          </div>
        </div>
      </div>
    </Card>
  );
};

export default AdKitCard;

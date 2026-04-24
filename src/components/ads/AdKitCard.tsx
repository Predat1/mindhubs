import { useState } from "react";
import { Copy, Download, Check, Trash2, ExternalLink, Target, Megaphone, RefreshCw, Image as ImageIcon, FileText, Loader2, Sparkles, Tag, AlertCircle, Percent } from "lucide-react";
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
  
  // Stickers state
  const [showPrice, setShowPrice] = useState(false);
  const [showPromo, setShowPromo] = useState(false);
  const [showUrgency, setShowUrgency] = useState(false);

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
Budget journalier : ${targeting.daily_budget?.amount_xof} FCFA (${targeting.daily_budget?.level})
Objectif campagne : ${targeting.campaign_objective}`;

  const fullKitText = `📱 PUB FACEBOOK — ${angle?.label}

${copy.primary_text}

🔗 ${productLink}

${targetingText}`;

  // -----------------------------------------------------
  // MOCKUPS RENDERING
  // -----------------------------------------------------
  const renderStickers = () => (
    <div className="absolute inset-0 z-10 pointer-events-none overflow-hidden">
      {showPrice && (
        <div className="absolute bottom-4 left-4 bg-red-600 text-white font-black px-4 py-1.5 text-lg rounded-xl shadow-xl transform -rotate-3 border-2 border-white/20">
          PRIX SPÉCIAL
        </div>
      )}
      {showPromo && (
        <div className="absolute top-4 right-4 bg-yellow-400 text-black font-black px-4 py-2 text-xl rounded-full shadow-2xl transform rotate-6 border-2 border-black/10">
          -50%
        </div>
      )}
      {showUrgency && (
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-black/80 backdrop-blur-md border border-white/20 text-white font-bold px-6 py-3 rounded-full text-sm text-center whitespace-nowrap shadow-2xl">
          ⏳ OFFRE LIMITÉE
        </div>
      )}
    </div>
  );

  const renderFBPost = () => (
    <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden text-black font-sans w-full max-w-[340px] mx-auto transform transition-transform hover:scale-[1.01]">
      <div className="p-3 flex items-center gap-2">
        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary/40 to-primary/10 shrink-0 border border-border" />
        <div className="flex flex-col">
          <span className="font-bold text-sm leading-tight">MINDHUB</span>
          <span className="text-[11px] text-gray-500 flex items-center gap-1">Sponsorisé 🌍</span>
        </div>
      </div>
      <div className="px-3 pb-3 text-[13px] leading-relaxed text-gray-800">
        <p className="line-clamp-4">{copy.primary_text}</p>
      </div>
      <div className={`relative w-full ${FORMAT_RATIO[creative.format]} bg-gray-100 flex items-center justify-center`}>
        {creative.image_url ? (
          <img src={creative.image_url} alt="Ad creative" className="w-full h-full object-cover" />
        ) : (
          <div className="text-gray-400 text-sm">Image manquante</div>
        )}
        {renderStickers()}
      </div>
      <div className="bg-[#f0f2f5] p-3 flex justify-between items-center border-t border-gray-200">
        <div className="flex flex-col overflow-hidden pr-2">
          <span className="text-[10px] text-gray-500 uppercase tracking-widest truncate">MINDHUB.COM</span>
          <span className="font-bold text-[13px] truncate">{copy.headlines?.[0] || "Découvrez notre offre"}</span>
        </div>
        <button className="shrink-0 bg-gray-300 hover:bg-gray-400 text-gray-800 font-bold px-3 py-1.5 rounded text-xs transition-colors">
          En savoir plus
        </button>
      </div>
    </div>
  );

  const renderIGStory = () => (
    <div className="relative bg-black rounded-[2.5rem] border-[8px] border-zinc-900 overflow-hidden text-white font-sans w-full max-w-[280px] mx-auto aspect-[9/16] shadow-2xl transform transition-transform hover:scale-[1.02]">
      {/* Background */}
      {creative.image_url ? (
        <img src={creative.image_url} alt="Story bg" className="absolute inset-0 w-full h-full object-cover opacity-90" />
      ) : (
        <div className="absolute inset-0 bg-zinc-800 flex items-center justify-center text-zinc-500 text-sm">Pas d'image</div>
      )}
      
      {/* Top gradient */}
      <div className="absolute top-0 inset-x-0 h-32 bg-gradient-to-b from-black/80 to-transparent pointer-events-none" />
      {/* Bottom gradient */}
      <div className="absolute bottom-0 inset-x-0 h-48 bg-gradient-to-t from-black/90 to-transparent pointer-events-none" />
      
      {/* Header */}
      <div className="absolute top-5 left-4 right-4 flex items-center gap-2 z-10">
        <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-yellow-400 via-pink-500 to-purple-500 p-[2px]">
          <div className="w-full h-full bg-zinc-800 rounded-full border border-black" />
        </div>
        <div className="flex flex-col">
          <span className="font-bold text-[11px] drop-shadow-md">MINDHUB</span>
          <span className="text-[9px] opacity-80 drop-shadow-md">Sponsorisé</span>
        </div>
      </div>

      {renderStickers()}
      
      {/* Bottom Content */}
      <div className="absolute bottom-8 left-4 right-4 flex flex-col items-center z-10">
        <p className="text-sm font-bold text-center mb-5 drop-shadow-lg line-clamp-3 leading-tight">{copy.headlines?.[0]}</p>
        <div className="flex flex-col items-center animate-pulse">
          <span className="text-[10px] uppercase font-black tracking-widest mb-1.5 opacity-90 drop-shadow-md">Swipe Up</span>
          <div className="flex flex-col items-center gap-1">
            <div className="w-4 h-1 rounded-full bg-white shadow-md" />
            <div className="w-3 h-1 rounded-full bg-white/60" />
            <div className="w-2 h-1 rounded-full bg-white/30" />
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <Card className="card-premium overflow-hidden border-border/60 bg-card/40 backdrop-blur-xl">
      <div className="flex flex-col lg:flex-row">
        
        {/* Mockup Preview Area */}
        <div className="relative lg:w-[45%] bg-zinc-950/50 p-6 flex flex-col items-center justify-center border-b lg:border-b-0 lg:border-r border-border/50">
          {creative.format === "9:16" ? renderIGStory() : renderFBPost()}
          
          {/* Quick Image Editor (Stickers) */}
          <div className="mt-6 flex flex-wrap items-center justify-center gap-2 w-full max-w-[340px]">
            <Button
              variant={showPrice ? "default" : "outline"}
              size="sm"
              className={`h-7 text-[10px] rounded-full transition-all ${showPrice ? 'bg-red-600 hover:bg-red-700 text-white border-transparent' : 'border-border'}`}
              onClick={() => setShowPrice(!showPrice)}
            >
              <Tag size={12} className="mr-1" /> Prix
            </Button>
            <Button
              variant={showPromo ? "default" : "outline"}
              size="sm"
              className={`h-7 text-[10px] rounded-full transition-all ${showPromo ? 'bg-yellow-400 hover:bg-yellow-500 text-black border-transparent' : 'border-border'}`}
              onClick={() => setShowPromo(!showPromo)}
            >
              <Percent size={12} className="mr-1" /> Promo
            </Button>
            <Button
              variant={showUrgency ? "default" : "outline"}
              size="sm"
              className={`h-7 text-[10px] rounded-full transition-all ${showUrgency ? 'bg-zinc-100 hover:bg-zinc-200 text-black border-transparent' : 'border-border'}`}
              onClick={() => setShowUrgency(!showUrgency)}
            >
              <AlertCircle size={12} className="mr-1" /> Urgence
            </Button>
          </div>
        </div>

        {/* Content Details */}
        <div className="flex-1 p-5 space-y-5">
          {/* Header actions */}
          <div className="flex items-start justify-between gap-2">
            <div className="space-y-1">
              <div className={`inline-flex items-center gap-1.5 rounded-full bg-gradient-to-r ${angle?.color} px-3 py-1 text-xs font-bold text-white shadow-lg`}>
                <span>{angle?.emoji}</span> {angle?.label}
              </div>
              <p className="text-[10px] text-muted-foreground ml-1">
                Généré le {new Date(creative.created_at).toLocaleString("fr-FR", { dateStyle: "short", timeStyle: "short" })}
              </p>
            </div>
            <div className="flex gap-1 bg-background/50 rounded-lg p-1 border border-border/50">
              <Button size="sm" variant="ghost" className="h-8 w-8 p-0 rounded-md" onClick={handleDownload} title="Télécharger l'image" disabled={isRegenerating}>
                <Download size={14} />
              </Button>
              <Button size="sm" variant="ghost" className="h-8 w-8 p-0 rounded-md" onClick={() => handleCopy(fullKitText, "kit", "Kit complet")} title="Copier tout le kit">
                {copiedKey === "kit" ? <Check size={14} className="text-emerald-500" /> : <Copy size={14} />}
              </Button>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button size="sm" variant="ghost" className="h-8 w-8 p-0 rounded-md" title="Régénérer" disabled={isRegenerating}>
                    {isRegenerating ? <Loader2 size={14} className="animate-spin text-primary" /> : <RefreshCw size={14} />}
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-60">
                  <DropdownMenuLabel className="text-[10px] uppercase tracking-wider text-muted-foreground">
                    Régénérer uniquement
                  </DropdownMenuLabel>
                  <DropdownMenuItem onClick={handleRegenImage} className="gap-2 cursor-pointer">
                    <ImageIcon size={14} className="text-primary" />
                    <div className="flex flex-col">
                      <span className="text-xs font-semibold">L'image</span>
                      <span className="text-[10px] text-muted-foreground">Garde texte + ciblage</span>
                    </div>
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={handleRegenCopy} className="gap-2 cursor-pointer">
                    <FileText size={14} className="text-primary" />
                    <div className="flex flex-col">
                      <span className="text-xs font-semibold">Le copywriting</span>
                      <span className="text-[10px] text-muted-foreground">Nouveaux titres + texte</span>
                    </div>
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={handleRegenTargeting} className="gap-2 cursor-pointer">
                    <Target size={14} className="text-primary" />
                    <div className="flex flex-col">
                      <span className="text-xs font-semibold">Le ciblage</span>
                      <span className="text-[10px] text-muted-foreground">Audience, intérêts, budget</span>
                    </div>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleRegenFullAngle} className="gap-2 cursor-pointer">
                    <Sparkles size={14} className="text-primary" />
                    <div className="flex flex-col">
                      <span className="text-xs font-semibold">Variante complète</span>
                      <span className="text-[10px] text-muted-foreground">Crée une nouvelle créative</span>
                    </div>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
              <Button size="sm" variant="ghost" onClick={handleDelete} className="h-8 w-8 p-0 rounded-md text-destructive hover:text-destructive hover:bg-destructive/10" title="Supprimer" disabled={isRegenerating}>
                <Trash2 size={14} />
              </Button>
            </div>
          </div>

          {/* Primary text */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1"><FileText size={12}/> Texte principal</span>
              <Button size="sm" variant="ghost" className="h-6 gap-1 text-[10px] text-primary hover:text-primary" onClick={() => handleCopy(copy.primary_text, "primary", "Texte principal")}>
                {copiedKey === "primary" ? <Check size={11} /> : <Copy size={11} />} Copier
              </Button>
            </div>
            <p className="rounded-xl bg-background/50 border border-border/40 p-4 text-sm leading-relaxed whitespace-pre-wrap">{copy.primary_text}</p>
          </div>

          {/* Headlines */}
          <div className="space-y-1.5">
            <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Titres ({copy.headlines?.length || 0})</span>
            <div className="space-y-1.5">
              {copy.headlines?.map((h, i) => (
                <button
                  key={i}
                  onClick={() => handleCopy(h, `h-${i}`, "Titre")}
                  className="group flex w-full items-center justify-between rounded-lg border border-border/60 bg-background/40 px-3 py-2 text-left text-xs hover:border-primary/50 hover:bg-primary/5 transition-all"
                >
                  <span className="truncate pr-4 font-medium">{h}</span>
                  {copiedKey === `h-${i}` ? <Check size={12} className="text-emerald-500 shrink-0" /> : <Copy size={12} className="text-muted-foreground shrink-0 opacity-0 group-hover:opacity-100 transition-opacity" />}
                </button>
              ))}
            </div>
          </div>

          {/* Descriptions & CTA */}
          <div className="space-y-2">
            <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Descriptions & Appel à l'action</span>
            <div className="flex flex-wrap gap-1.5">
              <Badge variant="outline" className="border-primary/50 bg-primary/10 text-primary hover:bg-primary/20 transition-colors py-1">
                <Megaphone size={12} className="mr-1.5" /> CTA : {copy.cta}
              </Badge>
              {copy.descriptions?.map((d, i) => (
                <button
                  key={i}
                  onClick={() => handleCopy(d, `d-${i}`, "Description")}
                  className="rounded-full bg-secondary/80 border border-border/50 px-3 py-1 text-[11px] hover:bg-primary/20 transition-colors"
                >
                  {d}
                </button>
              ))}
            </div>
          </div>

          <Separator className="bg-border/50" />

          {/* Targeting */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-primary">
                <Target size={14} /> Ciblage Facebook Recommandé
              </span>
              <Button size="sm" variant="ghost" className="h-6 gap-1 text-[10px] text-primary hover:text-primary" onClick={() => handleCopy(targetingText, "targeting", "Ciblage")}>
                {copiedKey === "targeting" ? <Check size={11} /> : <Copy size={11} />} Copier le ciblage
              </Button>
            </div>
            
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-[11px]">
              <div className="rounded-lg bg-background/60 border border-border/40 p-2.5 shadow-sm">
                <p className="text-muted-foreground text-[10px] mb-0.5">Âge cible</p>
                <p className="font-bold">{targeting.age_min}–{targeting.age_max} ans</p>
              </div>
              <div className="rounded-lg bg-background/60 border border-border/40 p-2.5 shadow-sm">
                <p className="text-muted-foreground text-[10px] mb-0.5">Genre</p>
                <p className="font-bold">{targeting.gender === "all" ? "Tous" : targeting.gender === "men" ? "Hommes" : "Femmes"}</p>
              </div>
              <div className="rounded-lg bg-gradient-to-br from-primary/10 to-transparent border border-primary/20 p-2.5 shadow-sm">
                <p className="text-muted-foreground text-[10px] mb-0.5">Budget quotidien</p>
                <p className="font-bold text-primary">{targeting.daily_budget?.amount_xof?.toLocaleString("fr-FR")} FCFA</p>
              </div>
              <div className="col-span-2 sm:col-span-3 rounded-lg bg-background/60 border border-border/40 p-2.5 shadow-sm">
                <p className="text-muted-foreground text-[10px] mb-1.5">Pays cibles</p>
                <p className="font-medium">{targeting.countries?.map((c) => `${COUNTRY_FLAGS[c] || "🌍"} ${c}`).join(" • ")}</p>
              </div>
              <div className="col-span-2 sm:col-span-3 rounded-lg bg-background/60 border border-border/40 p-2.5 shadow-sm">
                <p className="text-muted-foreground text-[10px] mb-1.5">Centres d'intérêt ({targeting.interests?.length || 0})</p>
                <div className="flex flex-wrap gap-1.5">
                  {targeting.interests?.map((i, k) => <span key={k} className="rounded-md bg-primary/10 border border-primary/20 px-2 py-0.5 text-[10px] font-medium text-primary">{i}</span>)}
                </div>
              </div>
            </div>
            {targeting.rationale && (
              <div className="rounded-lg border border-dashed border-primary/30 bg-primary/5 p-3 flex gap-2 items-start mt-2">
                <Sparkles size={14} className="text-primary shrink-0 mt-0.5" />
                <p className="text-[11px] italic text-muted-foreground leading-relaxed">
                  {targeting.rationale}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </Card>
  );
};

export default AdKitCard;

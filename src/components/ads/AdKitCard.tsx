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
  // MOCKUPS RENDERING (Realistic & Premium)
  // -----------------------------------------------------
  const renderStickers = () => (
    <div className="absolute inset-0 z-10 pointer-events-none overflow-hidden rounded-[inherit]">
      {showPrice && (
        <div className="absolute bottom-4 left-4 bg-red-600/90 backdrop-blur-md text-white font-black px-4 py-1.5 text-lg rounded-xl shadow-2xl transform -rotate-3 border-2 border-white/30 transition-transform duration-300">
          PRIX SPÉCIAL
        </div>
      )}
      {showPromo && (
        <div className="absolute top-4 right-4 bg-yellow-400/90 backdrop-blur-md text-black font-black px-4 py-2 text-xl rounded-full shadow-2xl transform rotate-6 border-2 border-white/30 transition-transform duration-300">
          -50%
        </div>
      )}
      {showUrgency && (
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-black/80 backdrop-blur-xl border border-white/20 text-white font-bold px-6 py-3 rounded-full text-sm text-center whitespace-nowrap shadow-[0_0_30px_rgba(0,0,0,0.5)]">
          ⏳ OFFRE LIMITÉE
        </div>
      )}
    </div>
  );

  const renderFBPost = () => (
    <div className="bg-white rounded-xl shadow-xl overflow-hidden text-black font-sans w-full max-w-[340px] mx-auto transition-all duration-500 hover:shadow-2xl hover:-translate-y-1 border border-zinc-200">
      <div className="p-3.5 flex items-center gap-2.5">
        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-600 to-blue-400 shrink-0 border border-border/10 flex items-center justify-center text-white font-bold text-xs shadow-inner">
          MH
        </div>
        <div className="flex flex-col">
          <span className="font-bold text-[13px] leading-tight text-zinc-900">MindHub</span>
          <span className="text-[11px] text-zinc-500 flex items-center gap-1 font-medium">Sponsorisé • 🌍</span>
        </div>
        <div className="ml-auto text-zinc-400 hover:text-zinc-600 cursor-pointer">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="1"/><circle cx="19" cy="12" r="1"/><circle cx="5" cy="12" r="1"/></svg>
        </div>
      </div>
      <div className="px-3.5 pb-3 text-[14px] leading-relaxed text-zinc-800 font-normal">
        <p className="line-clamp-4">{copy.primary_text}</p>
      </div>
      <div className={`relative w-full ${FORMAT_RATIO[creative.format]} bg-zinc-100 flex items-center justify-center border-y border-zinc-200/50`}>
        {creative.image_url ? (
          <img src={creative.image_url} alt="Ad creative" className="w-full h-full object-cover" />
        ) : (
          <div className="text-zinc-400 text-sm flex flex-col items-center gap-2"><ImageIcon size={24} opacity={0.5}/> Image manquante</div>
        )}
        {renderStickers()}
      </div>
      <div className="bg-zinc-50 p-3.5 flex justify-between items-center group cursor-pointer hover:bg-zinc-100 transition-colors">
        <div className="flex flex-col overflow-hidden pr-3">
          <span className="text-[10px] text-zinc-500 uppercase tracking-widest truncate font-semibold mb-0.5">mindhubs.fun</span>
          <span className="font-bold text-[14px] text-zinc-900 truncate">{copy.headlines?.[0] || "Découvrez notre offre"}</span>
          <span className="text-[12px] text-zinc-500 truncate mt-0.5">{copy.descriptions?.[0]}</span>
        </div>
        <button className="shrink-0 bg-zinc-200/80 hover:bg-zinc-300 text-zinc-900 font-bold px-4 py-2 rounded-lg text-xs transition-colors shadow-sm">
          {copy.cta || "En savoir plus"}
        </button>
      </div>
      <div className="px-4 py-3 flex items-center justify-between border-t border-zinc-200 text-zinc-500">
        <div className="flex gap-4">
           <span className="flex items-center gap-1.5 text-xs font-medium hover:text-zinc-800 cursor-pointer"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 9V5a3 3 0 0 0-3-3l-4 9v11h11.28a2 2 0 0 0 2-1.7l1.38-9a2 2 0 0 0-2-2.3zM7 22H4a2 2 0 0 1-2-2v-7a2 2 0 0 1 2-2h3"/></svg> J'aime</span>
           <span className="flex items-center gap-1.5 text-xs font-medium hover:text-zinc-800 cursor-pointer"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg> Commenter</span>
        </div>
        <span className="flex items-center gap-1.5 text-xs font-medium hover:text-zinc-800 cursor-pointer"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/><line x1="8.59" y1="13.51" x2="15.42" y2="17.49"/><line x1="15.41" y1="6.51" x2="8.59" y2="10.49"/></svg> Partager</span>
      </div>
    </div>
  );

  const renderIGStory = () => (
    <div className="relative bg-zinc-900 rounded-[2.5rem] border-[6px] border-zinc-800 overflow-hidden text-white font-sans w-full max-w-[280px] mx-auto aspect-[9/16] shadow-2xl transition-all duration-500 hover:shadow-primary/20 hover:-translate-y-1">
      {/* Background */}
      {creative.image_url ? (
        <img src={creative.image_url} alt="Story bg" className="absolute inset-0 w-full h-full object-cover scale-[1.01]" />
      ) : (
        <div className="absolute inset-0 bg-zinc-800 flex items-center justify-center text-zinc-500 text-sm">Pas d'image</div>
      )}
      
      {/* Top gradient for readability */}
      <div className="absolute top-0 inset-x-0 h-32 bg-gradient-to-b from-black/60 to-transparent pointer-events-none" />
      {/* Bottom gradient */}
      <div className="absolute bottom-0 inset-x-0 h-48 bg-gradient-to-t from-black/80 via-black/40 to-transparent pointer-events-none" />
      
      {/* Header */}
      <div className="absolute top-5 left-4 right-4 flex items-center gap-2.5 z-10">
        <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-yellow-400 via-pink-500 to-purple-600 p-[2px]">
          <div className="w-full h-full bg-zinc-900 rounded-full border-[1.5px] border-black flex items-center justify-center text-[8px] font-bold">MH</div>
        </div>
        <div className="flex flex-col">
          <span className="font-bold text-[12px] drop-shadow-md leading-tight">MindHub</span>
          <span className="text-[10px] opacity-90 drop-shadow-md font-medium">Sponsorisé</span>
        </div>
        <div className="ml-auto flex gap-1">
          <div className="w-1 h-1 rounded-full bg-white shadow-sm"/>
          <div className="w-1 h-1 rounded-full bg-white shadow-sm"/>
          <div className="w-1 h-1 rounded-full bg-white shadow-sm"/>
        </div>
      </div>

      {renderStickers()}
      
      {/* Bottom Content */}
      <div className="absolute bottom-6 left-4 right-4 flex flex-col items-center z-10">
        <div className="bg-black/40 backdrop-blur-md rounded-xl p-3 mb-4 border border-white/10 w-full">
           <p className="text-[13px] font-bold text-center drop-shadow-lg line-clamp-2 leading-tight">{copy.headlines?.[0]}</p>
        </div>
        <button className="bg-white/10 backdrop-blur-xl border border-white/30 hover:bg-white/20 transition-colors w-full rounded-full py-3 flex items-center justify-center gap-2 group">
          <span className="text-xs uppercase font-black tracking-widest drop-shadow-md">{copy.cta || "En savoir plus"}</span>
          <ChevronRight size={14} className="group-hover:translate-x-1 transition-transform" />
        </button>
      </div>
    </div>
  );

  return (
    <Card className="card-premium overflow-hidden border border-white/5 bg-zinc-950/80 backdrop-blur-2xl shadow-2xl rounded-2xl">
      <div className="flex flex-col lg:flex-row h-full">
        
        {/* Mockup Preview Area */}
        <div className="relative lg:w-[45%] bg-gradient-to-br from-zinc-900 via-zinc-950 to-black p-6 md:p-8 flex flex-col items-center justify-center border-b lg:border-b-0 lg:border-r border-white/5">
          <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 pointer-events-none" />
          
          <div className="relative z-10 w-full flex justify-center">
             {creative.format === "9:16" ? renderIGStory() : renderFBPost()}
          </div>
          
          {/* Quick Image Editor (Stickers) */}
          <div className="relative z-10 mt-8 p-3 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-md flex flex-wrap items-center justify-center gap-2 w-full max-w-[340px]">
            <Button
              variant={showPrice ? "default" : "ghost"}
              size="sm"
              className={`h-8 text-xs rounded-xl transition-all ${showPrice ? 'bg-red-600 hover:bg-red-700 text-white shadow-[0_0_15px_rgba(220,38,38,0.4)]' : 'hover:bg-white/10 text-zinc-300'}`}
              onClick={() => setShowPrice(!showPrice)}
            >
              <Tag size={14} className="mr-1.5" /> Étiquette Prix
            </Button>
            <Button
              variant={showPromo ? "default" : "ghost"}
              size="sm"
              className={`h-8 text-xs rounded-xl transition-all ${showPromo ? 'bg-yellow-400 hover:bg-yellow-500 text-black shadow-[0_0_15px_rgba(250,204,21,0.4)]' : 'hover:bg-white/10 text-zinc-300'}`}
              onClick={() => setShowPromo(!showPromo)}
            >
              <Percent size={14} className="mr-1.5" /> Promo
            </Button>
            <Button
              variant={showUrgency ? "default" : "ghost"}
              size="sm"
              className={`h-8 text-xs rounded-xl transition-all ${showUrgency ? 'bg-white hover:bg-zinc-200 text-black shadow-[0_0_15px_rgba(255,255,255,0.4)]' : 'hover:bg-white/10 text-zinc-300'}`}
              onClick={() => setShowUrgency(!showUrgency)}
            >
              <AlertCircle size={14} className="mr-1.5" /> Urgence
            </Button>
          </div>
        </div>

        {/* Content Details */}
        <div className="flex-1 p-6 md:p-8 flex flex-col gap-6">
          {/* Header actions */}
          <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
            <div className="space-y-2">
              <div className={`inline-flex items-center gap-2 rounded-full border border-white/10 bg-gradient-to-r ${angle?.color} px-4 py-1.5 text-sm font-bold text-white shadow-lg`}>
                <span className="text-lg drop-shadow-sm">{angle?.emoji}</span> {angle?.label}
              </div>
              <p className="text-xs font-medium text-zinc-500 flex items-center gap-1.5">
                <Sparkles size={12} className="text-primary" />
                Généré le {new Date(creative.created_at).toLocaleString("fr-FR", { dateStyle: "long", timeStyle: "short" })}
              </p>
            </div>

            {/* Premium Action Bar */}
            <div className="flex gap-1.5 bg-zinc-900/50 backdrop-blur-md rounded-xl p-1.5 border border-white/10 shadow-inner">
              <Button size="sm" variant="ghost" className="h-9 w-9 p-0 rounded-lg hover:bg-primary/20 hover:text-primary transition-colors" onClick={handleDownload} title="Télécharger l'image" disabled={isRegenerating}>
                <Download size={16} />
              </Button>
              <Button size="sm" variant="ghost" className="h-9 w-9 p-0 rounded-lg hover:bg-primary/20 hover:text-primary transition-colors" onClick={() => handleCopy(fullKitText, "kit", "Kit complet")} title="Copier tout le kit">
                {copiedKey === "kit" ? <Check size={16} className="text-emerald-500" /> : <Copy size={16} />}
              </Button>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button size="sm" variant="ghost" className="h-9 w-9 p-0 rounded-lg hover:bg-primary/20 hover:text-primary transition-colors" title="Régénérer" disabled={isRegenerating}>
                    {isRegenerating ? <Loader2 size={16} className="animate-spin text-primary" /> : <RefreshCw size={16} />}
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-64 rounded-xl border-white/10 bg-zinc-950/95 backdrop-blur-xl p-2">
                  <DropdownMenuLabel className="text-xs uppercase tracking-widest text-zinc-500 mb-1">
                    Régénérer partiellement
                  </DropdownMenuLabel>
                  <DropdownMenuItem onClick={handleRegenImage} className="gap-3 cursor-pointer rounded-lg p-2.5 focus:bg-primary/20">
                    <div className="bg-primary/20 p-1.5 rounded-md"><ImageIcon size={16} className="text-primary" /></div>
                    <div className="flex flex-col">
                      <span className="text-sm font-bold text-white">L'image</span>
                      <span className="text-xs text-zinc-400">Conserver le texte actuel</span>
                    </div>
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={handleRegenCopy} className="gap-3 cursor-pointer rounded-lg p-2.5 focus:bg-primary/20">
                    <div className="bg-primary/20 p-1.5 rounded-md"><FileText size={16} className="text-primary" /></div>
                    <div className="flex flex-col">
                      <span className="text-sm font-bold text-white">Le copywriting</span>
                      <span className="text-xs text-zinc-400">Réécrire les textes</span>
                    </div>
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={handleRegenTargeting} className="gap-3 cursor-pointer rounded-lg p-2.5 focus:bg-primary/20">
                    <div className="bg-primary/20 p-1.5 rounded-md"><Target size={16} className="text-primary" /></div>
                    <div className="flex flex-col">
                      <span className="text-sm font-bold text-white">Le ciblage</span>
                      <span className="text-xs text-zinc-400">Nouvelle audience</span>
                    </div>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator className="bg-white/10 my-1" />
                  <DropdownMenuItem onClick={handleRegenFullAngle} className="gap-3 cursor-pointer rounded-lg p-2.5 focus:bg-primary/20">
                    <div className="bg-primary/20 p-1.5 rounded-md"><Sparkles size={16} className="text-primary" /></div>
                    <div className="flex flex-col">
                      <span className="text-sm font-bold text-white">Variante complète</span>
                      <span className="text-xs text-zinc-400">Tout refaire à neuf</span>
                    </div>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
              <div className="w-px bg-white/10 mx-0.5" />
              <Button size="sm" variant="ghost" onClick={handleDelete} className="h-9 w-9 p-0 rounded-lg text-red-400 hover:text-red-300 hover:bg-red-400/10 transition-colors" title="Supprimer" disabled={isRegenerating}>
                <Trash2 size={16} />
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 h-full">
             {/* Left Column: Copywriting */}
             <div className="space-y-5 flex flex-col">
                {/* Primary text */}
                <div className="space-y-2 flex-grow">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold uppercase tracking-widest text-zinc-400 flex items-center gap-1.5">
                       <FileText size={14} className="text-primary"/> Script Principal
                    </span>
                    <Button size="sm" variant="ghost" className="h-7 gap-1.5 text-[11px] text-primary hover:text-primary hover:bg-primary/10 rounded-md" onClick={() => handleCopy(copy.primary_text, "primary", "Texte principal")}>
                      {copiedKey === "primary" ? <Check size={14} /> : <Copy size={14} />} Copier
                    </Button>
                  </div>
                  <div className="relative group">
                     <div className="absolute inset-0 bg-gradient-to-b from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-2xl pointer-events-none" />
                     <p className="relative rounded-2xl bg-zinc-900/50 border border-white/5 p-4 text-sm leading-relaxed whitespace-pre-wrap text-zinc-300 shadow-inner max-h-[220px] overflow-y-auto custom-scrollbar">
                        {copy.primary_text}
                     </p>
                  </div>
                </div>

                {/* Headlines */}
                <div className="space-y-2">
                  <span className="text-xs font-bold uppercase tracking-widest text-zinc-400">Titres Accrocheurs</span>
                  <div className="space-y-2">
                    {copy.headlines?.map((h, i) => (
                      <button
                        key={i}
                        onClick={() => handleCopy(h, `h-${i}`, "Titre")}
                        className="group flex w-full items-center justify-between rounded-xl border border-white/5 bg-zinc-900/50 px-4 py-3 text-left text-sm hover:border-primary/30 hover:bg-primary/5 transition-all duration-200"
                      >
                        <span className="truncate pr-4 font-semibold text-zinc-200 group-hover:text-white transition-colors">{h}</span>
                        {copiedKey === `h-${i}` ? <Check size={16} className="text-emerald-500 shrink-0" /> : <Copy size={16} className="text-zinc-600 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity" />}
                      </button>
                    ))}
                  </div>
                </div>

                {/* CTA */}
                <div className="pt-2">
                   <div className="inline-flex items-center gap-2 rounded-xl bg-primary/10 border border-primary/20 px-4 py-2">
                     <Megaphone size={16} className="text-primary" />
                     <span className="text-xs font-bold text-primary uppercase tracking-widest">CTA:</span>
                     <span className="text-sm font-bold text-white">{copy.cta}</span>
                   </div>
                </div>
             </div>

             {/* Right Column: Targeting */}
             <div className="space-y-4 bg-zinc-900/30 rounded-3xl border border-white/5 p-5">
                <div className="flex items-center justify-between pb-2 border-b border-white/5">
                  <span className="flex items-center gap-2 text-sm font-bold text-white">
                    <Target size={18} className="text-primary" /> Ciblage Laser
                  </span>
                  <Button size="sm" variant="ghost" className="h-7 gap-1.5 text-[11px] text-primary hover:text-primary hover:bg-primary/10 rounded-md" onClick={() => handleCopy(targetingText, "targeting", "Ciblage")}>
                    {copiedKey === "targeting" ? <Check size={14} /> : <Copy size={14} />} Copier
                  </Button>
                </div>
                
                <div className="grid grid-cols-2 gap-3">
                  <div className="rounded-2xl bg-zinc-900/80 border border-white/5 p-3 flex flex-col justify-center">
                    <p className="text-zinc-500 text-[10px] font-bold uppercase tracking-widest mb-1">Âge</p>
                    <p className="font-bold text-base text-zinc-100">{targeting.age_min}–{targeting.age_max} <span className="text-xs font-normal text-zinc-400">ans</span></p>
                  </div>
                  <div className="rounded-2xl bg-zinc-900/80 border border-white/5 p-3 flex flex-col justify-center">
                    <p className="text-zinc-500 text-[10px] font-bold uppercase tracking-widest mb-1">Genre</p>
                    <p className="font-bold text-base text-zinc-100">{targeting.gender === "all" ? "Tous" : targeting.gender === "men" ? "Hommes" : "Femmes"}</p>
                  </div>
                  <div className="col-span-2 rounded-2xl bg-gradient-to-br from-primary/20 to-primary/5 border border-primary/20 p-4">
                    <p className="text-primary/80 text-[10px] font-bold uppercase tracking-widest mb-1">Budget Recommandé</p>
                    <p className="font-black text-2xl text-primary drop-shadow-md">{targeting.daily_budget?.amount_xof?.toLocaleString("fr-FR")} <span className="text-sm font-bold">FCFA / jour</span></p>
                  </div>
                  <div className="col-span-2 rounded-2xl bg-zinc-900/80 border border-white/5 p-4">
                    <p className="text-zinc-500 text-[10px] font-bold uppercase tracking-widest mb-2">Pays cibles</p>
                    <p className="font-medium text-sm text-zinc-200">{targeting.countries?.map((c) => `${COUNTRY_FLAGS[c] || "🌍"} ${c}`).join(" • ")}</p>
                  </div>
                  <div className="col-span-2 rounded-2xl bg-zinc-900/80 border border-white/5 p-4">
                    <p className="text-zinc-500 text-[10px] font-bold uppercase tracking-widest mb-2">Intérêts ({targeting.interests?.length || 0})</p>
                    <div className="flex flex-wrap gap-2">
                      {targeting.interests?.map((i, k) => <span key={k} className="rounded-lg bg-white/5 border border-white/10 px-2.5 py-1 text-xs font-medium text-zinc-300 hover:bg-white/10 transition-colors cursor-default">{i}</span>)}
                    </div>
                  </div>
                </div>

                {targeting.rationale && (
                  <div className="rounded-2xl border border-primary/20 bg-primary/5 p-4 flex gap-3 items-start">
                    <Sparkles size={16} className="text-primary shrink-0 mt-0.5" />
                    <p className="text-xs text-zinc-400 leading-relaxed font-medium">
                      {targeting.rationale}
                    </p>
                  </div>
                )}
             </div>
          </div>
        </div>
      </div>
    </Card>
  );
};

export default AdKitCard;

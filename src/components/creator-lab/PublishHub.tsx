import { ArrowRight, CheckCircle2, CircleAlert, FileText, Globe2, ImagePlus, PackageCheck, Rocket, ShieldCheck, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useCreatorLab, type ProductMode } from "@/contexts/CreatorLabContext";
import { useNavigate } from "react-router-dom";
import { cn } from "@/lib/utils";

const MODE_LABELS: Record<ProductMode, string> = { digital: "Produit digital", physical: "Produit physique", hybrid: "Offre hybride" };

const PublishHub = () => {
  const navigate = useNavigate();
  const { currentIdea, productTitle, productType, chapters, selectedMarkets, validationScore, productMode, sellerExperience, updatePipelineStatus } = useCreatorLab();
  const title = productTitle || currentIdea;
  const hasProduct = Boolean(title.trim());
  const hasValidation = validationScore !== null;
  const hasContent = chapters.some((chapter) => chapter.content && chapter.content !== "En attente de rédaction...");

  const openProductDraft = () => {
    const description = chapters.filter((chapter) => chapter.content && chapter.content !== "En attente de rédaction...").map((chapter) => `## ${chapter.title}\n\n${chapter.content}`).join("\n\n");
    const prefill = {
      title: title || "Mon nouveau produit",
      description,
      category: productType || (productMode === "physical" ? "Business" : "Formations"),
      key_features: chapters.slice(0, 5).map((chapter) => chapter.title),
      product_mode: productMode,
      status: "draft" as const,
      is_lms: productType.toLowerCase().includes("formation"),
    };
    updatePipelineStatus("publish", "done");
    navigate("/dashboard/new-product", { state: { prefill } });
  };

  const checks = [
    { label: "Une idée ou un produit est défini", done: hasProduct, icon: Sparkles },
    { label: "La demande a été évaluée", done: hasValidation, icon: ShieldCheck },
    { label: "Le contenu est prêt à être repris", done: hasContent, icon: FileText },
  ];

  return (
    <div className="space-y-6">
      <div className="rounded-3xl border border-primary/20 bg-primary/5 p-6 md:p-8">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
          <div className="space-y-3">
            <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-background px-3 py-1 text-[10px] font-black uppercase tracking-widest text-primary"><Rocket size={13} /> Prêt à lancer</div>
            <h2 className="text-3xl font-black tracking-tight text-foreground">Transformez votre travail en brouillon produit.</h2>
            <p className="max-w-2xl text-sm leading-relaxed text-muted-foreground">MindHubs ne publie rien automatiquement. Vous relisez, modifiez et choisissez vous-même quand publier.</p>
          </div>
          <Button type="button" onClick={openProductDraft} className="h-14 shrink-0 gap-2 rounded-2xl px-7 font-black" disabled={!hasProduct}><PackageCheck size={18} /> Ouvrir le brouillon <ArrowRight size={17} /></Button>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1.1fr_.9fr]">
        <div className="rounded-3xl border border-border bg-card p-6">
          <div className="mb-5 flex items-center justify-between"><div><p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Checklist libre</p><h3 className="mt-1 text-xl font-black text-foreground">Votre projet</h3></div><span className="rounded-full bg-muted px-3 py-1 text-[10px] font-bold text-muted-foreground">Mode {sellerExperience === "expert" ? "expert" : "guidé"}</span></div>
          <div className="space-y-3">{checks.map((check) => { const Icon = check.icon; return <div key={check.label} className="flex items-center gap-3 rounded-2xl border border-border bg-background p-4"><div className={cn("flex h-9 w-9 items-center justify-center rounded-xl", check.done ? "bg-emerald-500/10 text-emerald-600" : "bg-muted text-muted-foreground")}>{check.done ? <CheckCircle2 size={18} /> : <Icon size={18} />}</div><span className="text-sm font-semibold text-foreground">{check.label}</span>{!check.done && <CircleAlert size={15} className="ml-auto text-muted-foreground" />}</div>; })}</div>
        </div>

        <div className="rounded-3xl border border-border bg-card p-6">
          <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Configuration actuelle</p>
          <div className="mt-4 space-y-4"><div className="flex items-center gap-3"><div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary"><FileText size={18} /></div><div><p className="text-sm font-black text-foreground">{title || "Aucun titre défini"}</p><p className="text-xs text-muted-foreground">{productType || "Format à choisir"}</p></div></div><div className="flex items-center gap-3"><div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary"><Globe2 size={18} /></div><div><p className="text-sm font-black text-foreground">{selectedMarkets.length ? selectedMarkets.join(", ") : "Tous les marchés"}</p><p className="text-xs text-muted-foreground">Marchés ciblés</p></div></div><div className="flex items-center gap-3"><div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary"><ImagePlus size={18} /></div><div><p className="text-sm font-black text-foreground">{MODE_LABELS[productMode]}</p><p className="text-xs text-muted-foreground">Livraison et champs adaptés au produit</p></div></div></div>
        </div>
      </div>
    </div>
  );
};

export default PublishHub;

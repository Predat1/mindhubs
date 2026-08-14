import { BriefcaseBusiness, Check, Package, Sparkles, Store, Truck, Wand2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { useCreatorLab, type ProductMode, type SellerExperience } from "@/contexts/CreatorLabContext";
import { cn } from "@/lib/utils";

const EXPERIENCE_OPTIONS: Array<{ id: SellerExperience; title: string; description: string; icon: typeof Wand2 }> = [
  { id: "beginner", title: "Je débute", description: "Parcours guidé, recommandations et modèles prêts à adapter.", icon: Wand2 },
  { id: "expert", title: "Je suis expert", description: "Réglages avancés, variantes, ciblage et contrôle détaillé.", icon: BriefcaseBusiness },
];

const PRODUCT_OPTIONS: Array<{ id: ProductMode; title: string; description: string; icon: typeof Package }> = [
  { id: "digital", title: "Produit digital", description: "Ebook, formation, template, logiciel ou fichier.", icon: Sparkles },
  { id: "physical", title: "Produit physique", description: "Stock, variantes, livraison et retours.", icon: Truck },
  { id: "hybrid", title: "Offre hybride", description: "Un produit physique avec un bonus digital.", icon: Package },
];

const CreatorSetupPanel = () => {
  const { sellerExperience, productMode, sessionName, setSellerExperience, setProductMode, setSessionName } = useCreatorLab();

  return (
    <section className="rounded-3xl border border-border bg-card/70 p-5 shadow-sm md:p-6">
      <div className="mb-5 flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
        <div>
          <div className="flex items-center gap-2 text-sm font-black text-foreground"><Store size={17} className="text-primary" /> Configurez votre espace de lancement</div>
          <p className="mt-1 text-xs text-muted-foreground">Ces choix orientent les recommandations. Vous pouvez les changer quand vous voulez.</p>
        </div>
        <Input value={sessionName} onChange={(event) => setSessionName(event.target.value)} className="h-9 w-full md:w-56" aria-label="Nom du projet" placeholder="Nom du projet" />
      </div>

      <div className="grid gap-5 lg:grid-cols-2">
        <div>
          <p className="mb-2 text-[10px] font-black uppercase tracking-widest text-muted-foreground">Votre expérience</p>
          <div className="grid gap-2 sm:grid-cols-2">
            {EXPERIENCE_OPTIONS.map((option) => { const Icon = option.icon; const active = sellerExperience === option.id; return <button type="button" key={option.id} onClick={() => setSellerExperience(option.id)} className={cn("rounded-2xl border p-4 text-left transition", active ? "border-primary bg-primary/10" : "border-border bg-background hover:border-primary/40")}><div className="mb-2 flex items-center justify-between"><Icon size={18} className={active ? "text-primary" : "text-muted-foreground"} />{active && <Check size={16} className="text-primary" />}</div><p className="text-sm font-black text-foreground">{option.title}</p><p className="mt-1 text-[11px] leading-relaxed text-muted-foreground">{option.description}</p></button>; })}
          </div>
        </div>
        <div>
          <p className="mb-2 text-[10px] font-black uppercase tracking-widest text-muted-foreground">Type d’offre</p>
          <div className="grid gap-2 sm:grid-cols-3">
            {PRODUCT_OPTIONS.map((option) => { const Icon = option.icon; const active = productMode === option.id; return <button type="button" key={option.id} onClick={() => setProductMode(option.id)} className={cn("rounded-2xl border p-4 text-left transition", active ? "border-primary bg-primary/10" : "border-border bg-background hover:border-primary/40")}><div className="mb-2 flex items-center justify-between"><Icon size={18} className={active ? "text-primary" : "text-muted-foreground"} />{active && <Check size={16} className="text-primary" />}</div><p className="text-sm font-black text-foreground">{option.title}</p><p className="mt-1 text-[11px] leading-relaxed text-muted-foreground">{option.description}</p></button>; })}
          </div>
        </div>
      </div>
    </section>
  );
};

export default CreatorSetupPanel;

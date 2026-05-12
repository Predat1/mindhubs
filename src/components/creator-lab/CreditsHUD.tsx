import { Link } from "react-router-dom";
import { Zap, Plus } from "lucide-react";
import { useCreatorLab } from "@/contexts/CreatorLabContext";
import { creditsToFCFA } from "@/constants/credits";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";

/**
 * CreditsHUD
 * Affiche le solde de crédits en temps réel avec un mini-badge premium.
 * S'insère en haut à droite du Creator Lab.
 */
const CreditsHUD = () => {
  const { credits } = useCreatorLab();
  const isLow = credits < 20;

  return (
    <div className="flex items-center gap-2">
      <Tooltip>
        <TooltipTrigger asChild>
          <div
            className={`inline-flex items-center gap-2.5 rounded-2xl border px-4 py-2.5 backdrop-blur-xl transition-all ${
              isLow
                ? "border-destructive/30 bg-destructive/10 text-destructive shadow-[0_0_20px_hsl(var(--destructive)/0.15)]"
                : "border-primary/20 bg-primary/5 text-primary shadow-[0_0_20px_hsl(var(--primary)/0.1)]"
            }`}
          >
            <Zap size={14} fill="currentColor" className={isLow ? "animate-pulse" : ""} />
            <div className="flex flex-col leading-none">
              <span className="text-xs font-black tabular-nums">{credits.toLocaleString()}</span>
              <span className="text-[8px] font-bold uppercase tracking-widest opacity-60">
                crédits · {creditsToFCFA(credits).toLocaleString()} FCFA
              </span>
            </div>
          </div>
        </TooltipTrigger>
        <TooltipContent side="bottom">
          {isLow ? "Solde bas — rechargez pour continuer à créer" : "Vos crédits IA disponibles"}
        </TooltipContent>
      </Tooltip>

      <Button
        asChild
        size="icon"
        variant="ghost"
        className="h-9 w-9 rounded-xl border border-primary/20 text-primary hover:bg-primary/10"
      >
        <Link to="/dashboard/abonnement" aria-label="Recharger">
          <Plus size={14} strokeWidth={3} />
        </Link>
      </Button>
    </div>
  );
};

export default CreditsHUD;

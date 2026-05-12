import { Search, Lightbulb, Cpu, Megaphone, Rocket, Check, Lock } from "lucide-react";
import { useCreatorLab, type PipelineStepId, type StepStatus } from "@/contexts/CreatorLabContext";

const STEPS: { id: PipelineStepId; label: string; icon: typeof Search }[] = [
  { id: "spy", label: "Veille", icon: Search },
  { id: "sandbox", label: "Idée", icon: Lightbulb },
  { id: "architect", label: "Produit", icon: Cpu },
  { id: "marketing", label: "Marketing", icon: Megaphone },
  { id: "publish", label: "Publier", icon: Rocket },
];

const statusColor = (s: StepStatus) =>
  s === "done"
    ? "bg-emerald-500 text-white border-emerald-500 shadow-emerald-500/30"
    : s === "active"
    ? "bg-primary text-primary-foreground border-primary shadow-primary/30 ring-4 ring-primary/20"
    : "bg-muted/30 text-muted-foreground border-white/10";

const lineColor = (s: StepStatus) =>
  s === "done" ? "bg-emerald-500" : "bg-white/10";

/**
 * PipelineDock
 * Stepper horizontal/vertical compact qui montre la progression du workflow Creator Lab.
 * Utilise le state centralisé du context.
 */
const PipelineDock = ({ onStepClick }: { onStepClick: (step: PipelineStepId) => void }) => {
  const { pipelineStatus } = useCreatorLab();

  return (
    <div className="flex items-center justify-center gap-0 py-4 overflow-x-auto">
      {STEPS.map((step, idx) => {
        const status = pipelineStatus[step.id];
        const Icon = status === "done" ? Check : status === "locked" ? Lock : step.icon;
        const isClickable = status !== "locked";

        return (
          <div key={step.id} className="flex items-center">
            <button
              disabled={!isClickable}
              onClick={() => isClickable && onStepClick(step.id)}
              className={`group flex flex-col items-center gap-1.5 transition-all ${isClickable ? "cursor-pointer" : "cursor-not-allowed opacity-60"}`}
            >
              <div
                className={`h-10 w-10 rounded-xl border flex items-center justify-center shadow-lg transition-all ${statusColor(status)} ${isClickable ? "group-hover:scale-110" : ""}`}
              >
                <Icon size={16} />
              </div>
              <span className="text-[9px] font-black uppercase tracking-widest">{step.label}</span>
            </button>

            {idx < STEPS.length - 1 && (
              <div className={`h-0.5 w-8 md:w-14 mx-1 rounded-full transition-all ${lineColor(status)}`} />
            )}
          </div>
        );
      })}
    </div>
  );
};

export default PipelineDock;

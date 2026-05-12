import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Bot, ChevronDown, Volume2, Crown, Zap, Coins, Image as ImageIcon } from "lucide-react";
import {
  TEXT_TO_VIDEO_MODELS,
  IMAGE_TO_VIDEO_MODELS,
  type VideoModel,
  type VideoModelMode,
} from "@/constants/videoModels";

interface ModelSelectorProps {
  selectedModel: string; // "auto" or model id
  mode: VideoModelMode;
  onSelect: (modelId: string) => void;
  onModeChange: (mode: VideoModelMode) => void;
}

const TIER_CONFIG = {
  premium: { label: "Premium", icon: Crown, color: "text-amber-400" },
  standard: { label: "Standard", icon: Zap, color: "text-blue-400" },
  budget: { label: "Budget", icon: Coins, color: "text-emerald-400" },
};

const ModelSelector = ({ selectedModel, mode, onSelect, onModeChange }: ModelSelectorProps) => {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  const models = mode === "text-to-video" ? TEXT_TO_VIDEO_MODELS : IMAGE_TO_VIDEO_MODELS;
  const selectedObj = models.find(m => m.id === selectedModel);
  const displayName = selectedModel === "auto" ? "Auto (IA choisit)" : selectedObj?.name || "Sélectionner";

  const grouped = {
    premium: models.filter(m => m.tier === "premium"),
    standard: models.filter(m => m.tier === "standard"),
    budget: models.filter(m => m.tier === "budget"),
  };

  return (
    <div ref={ref} className="relative">
      {/* Trigger chip */}
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-muted/60 border border-white/10 hover:border-violet-500/30 transition-colors text-xs font-medium"
      >
        {selectedModel === "auto" ? (
          <Bot className="w-3.5 h-3.5 text-violet-400" />
        ) : (
          <div className={`w-2 h-2 rounded-full ${
            selectedObj?.tier === "premium" ? "bg-amber-400" :
            selectedObj?.tier === "standard" ? "bg-blue-400" : "bg-emerald-400"
          }`} />
        )}
        <span className="max-w-[120px] truncate">{displayName}</span>
        <ChevronDown className={`w-3 h-3 transition-transform ${open ? "rotate-180" : ""}`} />
      </button>

      {/* Dropdown */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 8, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 8, scale: 0.95 }}
            transition={{ duration: 0.15 }}
            className="absolute bottom-full mb-2 left-0 w-80 max-h-96 overflow-y-auto bg-background/95 backdrop-blur-xl border border-white/10 rounded-xl shadow-2xl z-50"
          >
            {/* Mode toggle */}
            <div className="flex p-2 gap-1 border-b border-white/5">
              <button
                onClick={() => onModeChange("text-to-video")}
                className={`flex-1 flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                  mode === "text-to-video" ? "bg-violet-500/20 text-violet-300" : "text-muted-foreground hover:bg-muted/40"
                }`}
              >
                <Zap className="w-3 h-3" /> Texte → Vidéo
              </button>
              <button
                onClick={() => onModeChange("image-to-video")}
                className={`flex-1 flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                  mode === "image-to-video" ? "bg-violet-500/20 text-violet-300" : "text-muted-foreground hover:bg-muted/40"
                }`}
              >
                <ImageIcon className="w-3 h-3" /> Image → Vidéo
              </button>
            </div>

            {/* Auto option */}
            <button
              onClick={() => { onSelect("auto"); setOpen(false); }}
              className={`w-full flex items-center gap-3 px-3 py-2.5 hover:bg-muted/40 transition-colors ${
                selectedModel === "auto" ? "bg-violet-500/10" : ""
              }`}
            >
              <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-violet-500/20 to-fuchsia-500/20 flex items-center justify-center">
                <Bot className="w-4 h-4 text-violet-400" />
              </div>
              <div className="flex-1 text-left">
                <p className="text-xs font-semibold">Auto (IA choisit)</p>
                <p className="text-[10px] text-muted-foreground">L'IA sélectionne le meilleur modèle</p>
              </div>
            </button>

            <div className="border-t border-white/5" />

            {/* Tier groups */}
            {(["premium", "standard", "budget"] as const).map((tier) => {
              const cfg = TIER_CONFIG[tier];
              const tierModels = grouped[tier];
              if (!tierModels.length) return null;
              const TierIcon = cfg.icon;

              return (
                <div key={tier}>
                  <div className={`flex items-center gap-1.5 px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider ${cfg.color}`}>
                    <TierIcon className="w-3 h-3" />
                    {cfg.label}
                  </div>
                  {tierModels.map((m) => (
                    <button
                      key={m.id}
                      onClick={() => { onSelect(m.id); setOpen(false); }}
                      className={`w-full flex items-center gap-3 px-3 py-2 hover:bg-muted/40 transition-colors ${
                        selectedModel === m.id ? "bg-violet-500/10" : ""
                      }`}
                    >
                      <div className={`w-7 h-7 rounded-lg flex items-center justify-center text-[10px] font-bold ${
                        tier === "premium" ? "bg-amber-500/10 text-amber-400" :
                        tier === "standard" ? "bg-blue-500/10 text-blue-400" :
                        "bg-emerald-500/10 text-emerald-400"
                      }`}>
                        {m.provider.slice(0, 2).toUpperCase()}
                      </div>
                      <div className="flex-1 text-left min-w-0">
                        <div className="flex items-center gap-1.5">
                          <span className="text-xs font-medium truncate">{m.name}</span>
                          {m.hasAudio && <Volume2 className="w-3 h-3 text-violet-400 flex-shrink-0" />}
                          {m.badge && (
                            <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-white/5 text-muted-foreground font-medium">
                              {m.badge}
                            </span>
                          )}
                        </div>
                        <p className="text-[10px] text-muted-foreground truncate">{m.description}</p>
                      </div>
                      <span className="text-[10px] font-bold text-muted-foreground whitespace-nowrap">
                        {m.creditCost} pts
                      </span>
                    </button>
                  ))}
                </div>
              );
            })}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default ModelSelector;

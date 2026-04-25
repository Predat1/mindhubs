import { motion } from "framer-motion";
import { Trophy, Star, Shield, Zap, Award } from "lucide-react";
import { Progress } from "./ui/progress";

export type LevelTier = "Bronze" | "Argent" | "Or" | "Platine" | "Elite";

interface LevelProgressBarProps {
  xp: number;
  level: number;
  tier: LevelTier;
  nextLevelXp: number;
  className?: string;
}

const tierColors: Record<LevelTier, string> = {
  "Bronze": "from-orange-700 to-orange-400",
  "Argent": "from-slate-400 to-slate-200",
  "Or": "from-yellow-600 to-yellow-300",
  "Platine": "from-cyan-400 to-blue-300",
  "Elite": "from-purple-600 via-accent to-primary"
};

const tierIcons: Record<LevelTier, any> = {
  "Bronze": Zap,
  "Argent": Shield,
  "Or": Star,
  "Platine": Award,
  "Elite": Trophy
};

export const LevelProgressBar = ({ xp, level, tier, nextLevelXp, className }: LevelProgressBarProps) => {
  const progress = (xp / nextLevelXp) * 100;
  const Icon = tierIcons[tier];

  return (
    <div className={`space-y-4 ${className}`}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className={`h-12 w-12 rounded-2xl bg-gradient-to-br ${tierColors[tier]} flex items-center justify-center text-white shadow-lg shadow-primary/20 rotate-3`}>
            <Icon size={24} className="-rotate-3" />
          </div>
          <div>
            <h4 className="text-sm font-black uppercase tracking-widest text-muted-foreground">Rang {tier}</h4>
            <p className="text-2xl font-black">Niveau {level}</p>
          </div>
        </div>
        <div className="text-right">
          <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider">XP Total</p>
          <p className="text-xl font-black text-primary">{xp.toLocaleString()}</p>
        </div>
      </div>

      <div className="space-y-2">
        <div className="flex justify-between text-[10px] font-black uppercase tracking-tighter">
          <span>Progression</span>
          <span className="text-primary">{Math.floor(progress)}%</span>
        </div>
        <div className="relative h-3 w-full bg-muted/40 rounded-full overflow-hidden border border-white/5">
          <motion.div 
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 1, ease: "easeOut" }}
            className={`absolute top-0 left-0 h-full bg-gradient-to-r ${tierColors[tier]} shadow-[0_0_15px_rgba(255,255,255,0.2)]`}
          />
        </div>
        <p className="text-[10px] text-center text-muted-foreground font-bold italic">
          Plus que {nextLevelXp - xp} XP pour atteindre le prochain palier !
        </p>
      </div>
    </div>
  );
};

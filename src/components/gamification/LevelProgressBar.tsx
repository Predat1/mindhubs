import React from "react";
import { motion } from "motion/react";
import { Progress } from "../ui/progress";
import { Trophy, Star, Shield, Zap, Award } from "lucide-react";

export type LevelTier = "Bronze" | "Silver" | "Gold" | "Platinum" | "Diamond";

interface LevelProgressBarProps {
  xp: number;
  level: number;
  tier: LevelTier;
  nextLevelXp: number;
}

const tierIcons: Record<LevelTier, any> = {
  Bronze: Zap,
  Silver: Shield,
  Gold: Star,
  Platinum: Award,
  Diamond: Trophy,
};

const tierColors: Record<LevelTier, string> = {
  Bronze: "from-warning/80 to-warning shadow-warning/20",
  Silver: "from-slate-400 to-slate-200 shadow-slate-200/20",
  Gold: "from-primary to-brand-cyan-strong shadow-primary/20",
  Platinum: "from-brand-cyan-strong to-info shadow-info/20",
  Diamond: "from-brand-magenta to-primary shadow-brand-magenta/20",
};

export const LevelProgressBar = ({ xp = 0, level = 1, tier = "Bronze", nextLevelXp = 500 }: LevelProgressBarProps) => {
  const Icon = tierIcons[tier] || Zap;
  const colorClass = tierColors[tier] || tierColors.Bronze;
  
  // Safe calculation
  const safeNextXp = Math.max(nextLevelXp, 1);
  const progress = Math.min(Math.max((xp / safeNextXp) * 100, 0), 100);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className={`flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br ${colorClass} text-white shadow-lg`}>
            <Icon size={24} className="-rotate-3" />
          </div>
          <div>
            <h4 className="text-sm font-black uppercase tracking-widest text-foreground">Rang {tier}</h4>
            <p className="text-[10px] font-bold text-muted-foreground uppercase">Niveau {level}</p>
          </div>
        </div>
        <div className="text-right">
          <p className="text-xs font-black text-foreground">{xp} / {safeNextXp} XP</p>
          <p className="text-[10px] font-bold text-primary uppercase tracking-widest">+{safeNextXp - xp} pour le prochain niveau</p>
        </div>
      </div>
      
      <div className="relative pt-2">
        <Progress value={progress} className="h-3 rounded-full bg-white/5" />
        <div className="absolute top-1/2 left-0 h-1 w-full -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity">
           <div className="h-full bg-white/20 blur-sm rounded-full" style={{ width: `${progress}%` }} />
        </div>
      </div>
    </div>
  );
};

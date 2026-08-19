import { motion } from "motion/react";
import { 
  Zap, 
  ShieldCheck, 
  Star, 
  Trophy, 
  Award, 
  Flame, 
  Rocket, 
  Target, 
  Crown,
  Heart,
  Gem,
  Coffee
} from "lucide-react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "../ui/tooltip";

export interface BadgeType {
  id: string;
  name: string;
  description: string;
  icon: string;
  rarity: "commune" | "rare" | "épique" | "légendaire";
  unlocked: boolean;
}

const iconMap: Record<string, any> = {
  zap: Zap,
  shield: ShieldCheck,
  star: Star,
  trophy: Trophy,
  award: Award,
  flame: Flame,
  rocket: Rocket,
  target: Target,
  crown: Crown,
  heart: Heart,
  gem: Gem,
  coffee: Coffee
};

const rarityStyles = {
  commune: "bg-slate-500/10 text-slate-400 border-slate-500/20",
  rare: "bg-info/10 text-info border-info/20 shadow-[0_0_10px_rgba(126,169,255,0.1)]",
  épique: "bg-brand-magenta/10 text-brand-magenta border-brand-magenta/20 shadow-[0_0_15px_rgba(255,0,91,0.18)]",
  légendaire: "bg-brand-magenta/10 text-brand-magenta border-brand-magenta/30 shadow-[0_0_20px_rgba(255,0,91,0.25)] animate-pulse"
};

export const BadgeCard = ({ badge }: { badge: BadgeType }) => {
  const Icon = iconMap[badge.icon] || Award;

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <motion.div 
            whileHover={{ scale: 1.05, rotate: 2 }}
            className={`relative h-16 w-16 rounded-2xl border flex items-center justify-center transition-all ${
              badge.unlocked ? rarityStyles[badge.rarity] : "grayscale opacity-30 bg-muted/20 border-transparent"
            }`}
          >
            <Icon size={24} />
            {badge.unlocked && badge.rarity === "légendaire" && (
              <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-brand-magenta text-[8px] text-white">✦</span>
            )}
          </motion.div>
        </TooltipTrigger>
        <TooltipContent className="bg-card border-border p-3 rounded-xl shadow-2xl">
          <div className="space-y-1">
            <p className="text-sm font-black">{badge.name}</p>
            <p className="text-[10px] text-muted-foreground leading-tight">{badge.description}</p>
            <div className="flex items-center gap-1.5 pt-1">
               <span className={`text-[8px] font-black uppercase px-1.5 py-0.5 rounded-full border ${rarityStyles[badge.rarity]}`}>
                  {badge.rarity}
               </span>
               {!badge.unlocked && <span className="text-[8px] font-bold text-destructive">Verrouillé</span>}
            </div>
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};

export const BadgeGrid = ({ badges }: { badges: BadgeType[] }) => {
  return (
    <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-4 lg:grid-cols-6 gap-4">
      {badges.map(badge => (
        <BadgeCard key={badge.id} badge={badge} />
      ))}
    </div>
  );
};

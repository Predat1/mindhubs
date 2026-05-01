import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { type LevelTier } from "../components/gamification/LevelProgressBar";
import { type BadgeType } from "../components/gamification/BadgeSystem";

export interface GamificationStats {
  xp: number;
  level: number;
  tier: LevelTier;
  badges: BadgeType[];
}

const DEFAULT_BADGES: BadgeType[] = ["Newcomer", "Fast Seller"];

export const useGamification = () => {
  const [stats, setStats] = useState<GamificationStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
          setLoading(false);
          return;
        }

        const { data, error } = await supabase
          .from("profiles")
          .select("xp, level")
          .eq("id", user.id)
          .single();

        if (error) {
          // If profile doesn't exist yet, we use defaults
          setStats({
            xp: 0,
            level: 1,
            tier: "Bronze",
            badges: DEFAULT_BADGES
          });
        } else {
          const xp = data.xp || 0;
          const level = data.level || 1;
          
          let tier: LevelTier = "Bronze";
          if (level >= 50) tier = "Diamond";
          else if (level >= 20) tier = "Platinum";
          else if (level >= 10) tier = "Gold";
          else if (level >= 5) tier = "Silver";

          setStats({
            xp,
            level,
            tier,
            badges: level > 1 ? [...DEFAULT_BADGES, "Elite Contributor"] : DEFAULT_BADGES
          });
        }
      } catch (err) {
        console.error("Gamification fetch error:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  const nextLevelXp = stats ? (stats.level || 1) * 500 : 500;

  const addXp = async (amount: number) => {
    // Logic to update XP in Supabase
    console.log(`Adding ${amount} XP`);
  };

  return { 
    stats: stats || { xp: 0, level: 1, tier: "Bronze" as LevelTier, badges: DEFAULT_BADGES }, 
    loading, 
    nextLevelXp, 
    addXp 
  };
};

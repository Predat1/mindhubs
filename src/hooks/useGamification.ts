import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { type LevelTier } from "../components/gamification/LevelProgressBar";
import { type BadgeType } from "../components/gamification/BadgeSystem";

interface UserStats {
  xp: number;
  level: number;
  tier: LevelTier;
  points: number;
  badges: BadgeType[];
  referralCode: string;
}

const DEFAULT_BADGES: BadgeType[] = [
  { id: "1", name: "Pionnier", description: "Inscrit lors du lancement de MindHubs", icon: "zap", rarity: "rare", unlocked: true },
  { id: "2", name: "Première Vente", description: "A réalisé sa première vente sur la plateforme", icon: "trophy", rarity: "commune", unlocked: false },
  { id: "3", name: "Acheteur Sérieux", description: "A acheté plus de 5 produits", icon: "star", rarity: "rare", unlocked: false },
  { id: "4", name: "Elite Maker", description: "Utilisation experte de l'IA Factory", icon: "gem", rarity: "légendaire", unlocked: false },
  { id: "5", name: "Support Premium", description: "Réponses rapides aux clients", icon: "shield", rarity: "épique", unlocked: true },
  { id: "6", name: "Caféine", description: "Travaille tard sur ses produits", icon: "coffee", rarity: "commune", unlocked: true },
];

export const useGamification = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState<UserStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      setLoading(false);
      return;
    }

    // Mocking the fetch from DB
    // In a real scenario, this would come from the 'profiles' or 'vendors' table
    const fetchStats = async () => {
      // Simulate API delay
      await new Promise(r => setTimeout(r, 500));

      const mockXp = 1250;
      const mockLevel = Math.floor(mockXp / 500) + 1;
      
      let tier: LevelTier = "Bronze";
      if (mockLevel > 15) tier = "Elite";
      else if (mockLevel > 10) tier = "Platine";
      else if (mockLevel > 5) tier = "Or";
      else if (mockLevel > 2) tier = "Argent";

      setStats({
        xp: mockXp,
        level: mockLevel,
        tier,
        points: 450,
        badges: DEFAULT_BADGES,
        referralCode: `MIND-${user.id.slice(0, 5).toUpperCase()}`
      });
      setLoading(false);
    };

    fetchStats();
  }, [user]);

  const addXp = (amount: number) => {
    if (!stats) return;
    setStats(prev => prev ? { ...prev, xp: prev.xp + amount } : null);
    // Here you would also update the DB via Supabase
  };

  const nextLevelXp = stats ? stats.level * 500 : 500;

  return { stats, loading, nextLevelXp, addXp };
};

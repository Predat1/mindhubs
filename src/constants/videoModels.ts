
export interface VideoModel {
  id: string;
  name: string;
  provider: string;
  description: string;
  creditCost: number;
  badge?: string;
  isPremium: boolean;
  isAvatar?: boolean;
  category: 'Realistic' | 'Cinematic' | 'Avatar' | 'Creative';
}

export const VIDEO_MODELS: VideoModel[] = [
  {
    id: 'sora-2',
    name: 'OpenAI Sora 2',
    provider: 'openai',
    description: 'La référence mondiale pour la cohérence physique et les scènes longues (20s).',
    creditCost: 1500,
    badge: 'Exclusif Elite',
    isPremium: true,
    category: 'Cinematic'
  },
  {
    id: 'veo-3-1',
    name: 'Google Veo 3.1',
    provider: 'google',
    description: 'Cinématographie 4K ultra-détaillée avec audio natif généré par IA.',
    creditCost: 850,
    badge: 'Cinéma 4K',
    isPremium: true,
    category: 'Cinematic'
  },
  {
    id: 'kling-3-0',
    name: 'Kling 3.0 Pro',
    provider: 'kuaishou',
    description: 'Le meilleur pour les mouvements humains complexes et le réalisme extrême.',
    creditCost: 500,
    badge: 'Ultra-Réaliste',
    isPremium: true,
    category: 'Realistic'
  },
  {
    id: 'runway-gen-4',
    name: 'Runway Gen-4',
    provider: 'runway',
    description: 'Contrôle artistique total avec "Director Mode" et physique avancée.',
    creditCost: 400,
    isPremium: false,
    category: 'Creative'
  },
  {
    id: 'hailuo-2-0',
    name: 'Minimax Hailuo 2.0',
    provider: 'minimax',
    description: 'Génération ultra-rapide avec une consistance physique impressionnante.',
    creditCost: 350,
    isPremium: false,
    category: 'Realistic'
  },
  {
    id: 'luma-dream-2',
    name: 'Luma Dream Machine 2.0',
    provider: 'luma',
    description: 'Vidéos stables et paysages magnifiques optimisés pour le web.',
    creditCost: 300,
    isPremium: false,
    category: 'Realistic'
  },
  {
    id: 'pika-2-0',
    name: 'Pika 2.0',
    provider: 'pika',
    description: 'Effets spéciaux créatifs et animations d\'objets ultra-fluides.',
    creditCost: 200,
    isPremium: false,
    category: 'Creative'
  },
  {
    id: 'expert-virtuel-2026',
    name: 'L\'Expert Virtuel 2026',
    provider: 'heygen',
    description: 'Avatar IA parlant avec synchronisation labiale parfaite (30s).',
    creditCost: 1200,
    badge: 'Avatar Pro',
    isPremium: true,
    isAvatar: true,
    category: 'Avatar'
  }
];

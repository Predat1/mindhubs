
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
    id: 'minimax',
    name: 'Minimax (Hailuo)',
    provider: 'fal.ai',
    description: 'Hyper-réalisme humain. Parfait pour les visages et les expressions.',
    creditCost: 500,
    badge: 'Ultra-Réaliste',
    isPremium: true,
    category: 'Realistic'
  },
  {
    id: 'kling-1-5',
    name: 'Kling 1.5',
    provider: 'fal.ai',
    description: 'Physique et mouvements complexes. Idéal pour les démonstrations produits.',
    creditCost: 400,
    isPremium: false,
    category: 'Realistic'
  },
  {
    id: 'sora',
    name: 'Sora (OpenAI)',
    provider: 'openai',
    description: 'La référence mondiale pour la cohérence et les scènes longues.',
    creditCost: 1500,
    badge: 'Exclusif Elite',
    isPremium: true,
    category: 'Cinematic'
  },
  {
    id: 'veo-2',
    name: 'Veo 2.0 (DeepMind)',
    provider: 'google',
    description: 'Cinématographie 4K ultra-détaillée. Qualité studio professionnelle.',
    creditCost: 800,
    badge: 'Cinéma 4K',
    isPremium: true,
    category: 'Cinematic'
  },
  {
    id: 'seedance-2',
    name: 'Seedance 2.0',
    provider: 'fal.ai',
    description: 'Mouvements fluides et harmonieux. Idéal pour le lifestyle.',
    creditCost: 600,
    isPremium: true,
    category: 'Realistic'
  },
  {
    id: 'runway-gen3',
    name: 'Runway Gen-3 Alpha',
    provider: 'runway',
    description: 'Contrôle artistique total et effets visuels de haute qualité.',
    creditCost: 350,
    isPremium: false,
    category: 'Creative'
  },
  {
    id: 'luma-dream',
    name: 'Luma Dream Machine',
    provider: 'luma',
    description: 'Vidéos stables et paysages magnifiques en un clic.',
    creditCost: 300,
    isPremium: false,
    category: 'Realistic'
  },
  {
    id: 'pika-1-5',
    name: 'Pika 1.5',
    provider: 'pika',
    description: 'Effets physiques créatifs (gonflement, écrasement, explosion).',
    creditCost: 200,
    isPremium: false,
    category: 'Creative'
  },
  {
    id: 'expert-virtuel',
    name: 'L\'Expert Virtuel',
    provider: 'heygen',
    description: 'Un avatar IA qui parle pour vous avec une autorité absolue.',
    creditCost: 1000,
    badge: 'Avatar Pro',
    isPremium: true,
    isAvatar: true,
    category: 'Avatar'
  }
];

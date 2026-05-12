
export type VideoModelTier = 'premium' | 'standard' | 'budget';
export type VideoModelMode = 'text-to-video' | 'image-to-video';

export interface VideoModel {
  id: string;
  name: string;
  provider: string;
  description: string;
  creditCost: number;
  badge?: string;
  tier: VideoModelTier;
  mode: VideoModelMode;
  falEndpoint: string;
  hasAudio: boolean;
  maxDuration: number;
  aspectRatios: string[];
}

// ─── Text-to-Video Models ───
export const TEXT_TO_VIDEO_MODELS: VideoModel[] = [
  // Premium Tier
  {
    id: 'sora-2-pro',
    name: 'Sora 2 Pro',
    provider: 'OpenAI',
    description: 'Référence mondiale : cohérence physique, scènes longues 20s, audio natif.',
    creditCost: 1500,
    badge: 'Elite',
    tier: 'premium',
    mode: 'text-to-video',
    falEndpoint: 'fal-ai/sora-2/text-to-video/pro',
    hasAudio: true,
    maxDuration: 20,
    aspectRatios: ['16:9', '9:16', '1:1'],
  },
  {
    id: 'veo-3.1',
    name: 'Veo 3.1',
    provider: 'Google',
    description: 'Cinématographie 4K ultime avec audio natif par Google DeepMind.',
    creditCost: 1000,
    badge: '4K',
    tier: 'premium',
    mode: 'text-to-video',
    falEndpoint: 'fal-ai/veo3.1',
    hasAudio: true,
    maxDuration: 10,
    aspectRatios: ['16:9', '9:16', '1:1'],
  },
  {
    id: 'veo-3.1-fast',
    name: 'Veo 3.1 Fast',
    provider: 'Google',
    description: 'Veo 3.1 accéléré — même qualité, 2x plus rapide, moins cher.',
    creditCost: 600,
    badge: 'Rapide',
    tier: 'premium',
    mode: 'text-to-video',
    falEndpoint: 'fal-ai/veo3.1/fast',
    hasAudio: true,
    maxDuration: 10,
    aspectRatios: ['16:9', '9:16', '1:1'],
  },
  {
    id: 'seedance-2',
    name: 'Seedance 2.0',
    provider: 'ByteDance',
    description: 'Cinématique + audio natif, contrôle caméra avancé, multi-shot.',
    creditCost: 800,
    badge: 'Audio',
    tier: 'premium',
    mode: 'text-to-video',
    falEndpoint: 'bytedance/seedance-2.0/text-to-video',
    hasAudio: true,
    maxDuration: 10,
    aspectRatios: ['16:9', '9:16', '1:1', '4:3'],
  },
  {
    id: 'seedance-2-fast',
    name: 'Seedance 2.0 Fast',
    provider: 'ByteDance',
    description: 'Seedance accéléré — latence réduite, même qualité cinématique.',
    creditCost: 450,
    tier: 'premium',
    mode: 'text-to-video',
    falEndpoint: 'bytedance/seedance-2.0/fast/text-to-video',
    hasAudio: true,
    maxDuration: 10,
    aspectRatios: ['16:9', '9:16', '1:1', '4:3'],
  },
  // Standard Tier
  {
    id: 'kling-v3-pro',
    name: 'Kling 3.0 Pro',
    provider: 'Kuaishou',
    description: 'Mouvements humains complexes, réalisme extrême, audio natif.',
    creditCost: 600,
    badge: 'Réaliste',
    tier: 'standard',
    mode: 'text-to-video',
    falEndpoint: 'fal-ai/kling-video/o3/pro/text-to-video',
    hasAudio: true,
    maxDuration: 10,
    aspectRatios: ['16:9', '9:16', '1:1'],
  },
  {
    id: 'pixverse-v6',
    name: 'PixVerse V6',
    provider: 'PixVerse',
    description: '20+ contrôles caméra, audio natif, styles variés (réaliste → anime).',
    creditCost: 400,
    badge: 'Polyvalent',
    tier: 'standard',
    mode: 'text-to-video',
    falEndpoint: 'fal-ai/pixverse/v6/text-to-video',
    hasAudio: true,
    maxDuration: 10,
    aspectRatios: ['16:9', '9:16', '1:1', '4:3', '3:4'],
  },
  {
    id: 'minimax-hailuo',
    name: 'Minimax Hailuo-02',
    provider: 'Minimax',
    description: 'Génération rapide, consistance physique impressionnante.',
    creditCost: 350,
    tier: 'standard',
    mode: 'text-to-video',
    falEndpoint: 'fal-ai/minimax/hailuo-02/standard/text-to-video',
    hasAudio: false,
    maxDuration: 6,
    aspectRatios: ['16:9', '9:16', '1:1'],
  },
  {
    id: 'luma-ray2',
    name: 'Luma Ray2',
    provider: 'Luma',
    description: 'Vidéos stables et paysages cinématiques optimisés web.',
    creditCost: 300,
    tier: 'standard',
    mode: 'text-to-video',
    falEndpoint: 'fal-ai/luma-dream-machine/ray-2',
    hasAudio: false,
    maxDuration: 5,
    aspectRatios: ['16:9', '9:16', '1:1'],
  },
  // Budget Tier
  {
    id: 'wan-2.2',
    name: 'Wan 2.2',
    provider: 'Alibaba',
    description: 'Open-source performant, 1080p, excellent rapport qualité/prix.',
    creditCost: 200,
    tier: 'budget',
    mode: 'text-to-video',
    falEndpoint: 'fal-ai/wan/v2.2-a14b/text-to-video',
    hasAudio: false,
    maxDuration: 5,
    aspectRatios: ['16:9', '9:16', '1:1'],
  },
  {
    id: 'ltx-video',
    name: 'LTX Video 2',
    provider: 'Lightricks',
    description: 'Ultra-rapide avec audio, idéal prototypage et tests rapides.',
    creditCost: 150,
    tier: 'budget',
    mode: 'text-to-video',
    falEndpoint: 'fal-ai/ltx-2-19b/text-to-video',
    hasAudio: true,
    maxDuration: 5,
    aspectRatios: ['16:9', '9:16', '1:1'],
  },
  {
    id: 'hunyuan',
    name: 'Hunyuan Video',
    provider: 'Tencent',
    description: 'Modèle open-source robuste pour des vidéos variées.',
    creditCost: 250,
    tier: 'budget',
    mode: 'text-to-video',
    falEndpoint: 'fal-ai/hunyuan-video',
    hasAudio: false,
    maxDuration: 5,
    aspectRatios: ['16:9', '9:16', '1:1'],
  },
];

// ─── Image-to-Video Models ───
export const IMAGE_TO_VIDEO_MODELS: VideoModel[] = [
  {
    id: 'kling-v3-pro-i2v',
    name: 'Kling 3.0 Pro',
    provider: 'Kuaishou',
    description: 'Anime une image avec réalisme extrême et audio natif.',
    creditCost: 600,
    badge: 'Réaliste',
    tier: 'premium',
    mode: 'image-to-video',
    falEndpoint: 'fal-ai/kling-video/v3/pro/image-to-video',
    hasAudio: true,
    maxDuration: 10,
    aspectRatios: ['16:9', '9:16', '1:1'],
  },
  {
    id: 'seedance-2-i2v',
    name: 'Seedance 2.0',
    provider: 'ByteDance',
    description: 'Anime une image avec audio natif et contrôle de mouvement.',
    creditCost: 800,
    badge: 'Audio',
    tier: 'premium',
    mode: 'image-to-video',
    falEndpoint: 'bytedance/seedance-2.0/image-to-video',
    hasAudio: true,
    maxDuration: 10,
    aspectRatios: ['16:9', '9:16', '1:1'],
  },
  {
    id: 'pixverse-v6-i2v',
    name: 'PixVerse V6',
    provider: 'PixVerse',
    description: 'Anime une image avec 20+ contrôles caméra et audio.',
    creditCost: 400,
    badge: 'Polyvalent',
    tier: 'standard',
    mode: 'image-to-video',
    falEndpoint: 'fal-ai/pixverse/v6/image-to-video',
    hasAudio: true,
    maxDuration: 10,
    aspectRatios: ['16:9', '9:16', '1:1', '4:3', '3:4'],
  },
  {
    id: 'veo-3.1-i2v',
    name: 'Veo 3.1',
    provider: 'Google',
    description: 'Anime une image en qualité cinématique 4K avec audio.',
    creditCost: 1000,
    badge: '4K',
    tier: 'premium',
    mode: 'image-to-video',
    falEndpoint: 'fal-ai/veo3.1/image-to-video',
    hasAudio: true,
    maxDuration: 10,
    aspectRatios: ['16:9', '9:16', '1:1'],
  },
];

// ─── Combined exports ───
export const ALL_VIDEO_MODELS: VideoModel[] = [...TEXT_TO_VIDEO_MODELS, ...IMAGE_TO_VIDEO_MODELS];

export const getModelById = (id: string): VideoModel | undefined =>
  ALL_VIDEO_MODELS.find(m => m.id === id);

export const getModelsByMode = (mode: VideoModelMode): VideoModel[] =>
  ALL_VIDEO_MODELS.filter(m => m.mode === mode);

export const getModelsByTier = (tier: VideoModelTier): VideoModel[] =>
  ALL_VIDEO_MODELS.filter(m => m.tier === tier);

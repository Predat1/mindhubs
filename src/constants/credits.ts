/**
 * CREDIT_COSTS
 * 
 * WHY: Centralisation des coûts par fonctionnalité pour une gestion cohérente
 * à travers tout l'écosystème MindHubs.
 * 
 * Basé sur une marge cible de >80% par rapport aux coûts OpenRouter/Lovable réels.
 */
export const CREDIT_COSTS: Record<string, number> = {
  // --- Creator Lab ---
  'spy-research':   10,  // Veille marché (Perplexity deep research)
  'validate':        5,  // Validation idée (Gemini 2.5 Pro)
  'plan':           15,  // Plan produit (Claude Sonnet 4.5)
  'chapter-draft':   8,  // Par chapitre (Claude Opus 4)
  'marketing':      10,  // Scripts viraux (Mistral Large)
  'remix':           3,  // Angles différenciation (Gemini Flash)
  'pivots':          3,  // Pivots d'idée (Gemini Flash)

  // --- Product Architect ---
  'image-gen':      20,  // Couverture ebook (Flux 1.1 Pro via OpenRouter)

  // --- Ads Studio ---
  'product-image-3d': 25, // Boîte 3D (Gemini Flash Image) — par image générée
  'ad-creative':    25,   // Visuel pub Facebook — par format généré
  'ad-copy':         5,   // Copywriting Facebook Ads
  'ad-targeting':    3,   // Ciblage audience africain

  // --- Factory (DigitalProductFactory) ---
  'factory-niche':   8,  // Analyse de niche
  'factory-kit':    12,  // Génération kit produit complet
};

/**
 * Helper: Calcule la valeur équivalente en FCFA
 * (Basé sur le prix de vente moyen du crédit: ~15 FCFA)
 */
export const creditsToFCFA = (credits: number) => credits * 15;

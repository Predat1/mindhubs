/**
 * CREDIT_COSTS
 * 
 * WHY: Centralisation des coûts par fonctionnalité pour une gestion cohérente
 * à travers tout l'écosystème MindHubs.
 * 
 * Valeurs calibrées pour refléter la valeur ajoutée et couvrir les coûts d'infrastructure.
 */
export const CREDIT_COSTS: Record<string, number> = {
  // --- Creator Lab ---
  'spy-research':   25,  // Veille marché profonde (Perplexity)
  'validate':       10,  // Validation d'idée (Sandbox)
  'plan':           30,  // Architecture produit (Architect)
  'chapter-draft':  15,  // Rédaction par chapitre
  'marketing':      20,  // Scripts Co-Pilot (Co-Pilot)
  'remix':           5,  // Angles de différenciation
  'pivots':          5,  // Pivots stratégiques
  
  // --- Ads Studio ---
  'product-image-3d': 50, // Mockup 3D Premium (Architect / Ads)
  'ad-creative':      40, // Visuel Pub FB optimisé
  'ad-copy':          10, // Pack Copywriting Ads
  'ad-targeting':     10, // Ciblage Audience Expert
  
  // --- Factory (DigitalProductFactory) ---
  'factory-niche':   15, // Analyse de niche
  'factory-kit':     25, // Génération kit complet
};

/**
 * creditsToFCFA
 * Helper pour l'affichage de la valeur monétaire approximative.
 */
export const creditsToFCFA = (credits: number) => credits * 10;

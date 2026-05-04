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
  'ad-creative':      30, // Visuel Pub FB optimisé (Réduit de 40 à 30)
  'ad-copy':          5,  // Pack Copywriting Ads (Réduit de 10 à 5)
  'ad-targeting':     5,  // Ciblage Audience Expert (Réduit de 10 à 5)
  
  // --- Factory (DigitalProductFactory) ---
  'factory-niche':   10, // Analyse de niche (Réduit de 15 à 10)
  'factory-kit':     20, // Génération kit complet (Réduit de 25 à 20)
};

/**
 * creditsToFCFA
 * Helper pour l'affichage de la valeur monétaire approximative.
 */
export const creditsToFCFA = (credits: number) => credits * 10;

import { useMemo } from "react";
import type { Product } from "@/data/products";
import { useProductStats, type ProductStat } from "@/hooks/useProductTracking";

/**
 * Smart product ranking algorithm v3
 * Now powered by REAL data (views + purchases) from product_events table.
 * Priority: real conversion (purchases) > real demand (views) > recency > category > price > tags
 */

const CATEGORY_BOOST: Record<string, number> = {
  Formations: 1.25,
  Business: 1.2,
  Kits: 1.15,
  Livres: 1.05,
  Logiciels: 1.0,
  "Packs Enfants": 0.9,
};

const TAG_BOOST: Record<string, number> = {
  Nouveau: 1.2,
  Promo: 1.15,
  "Best-seller": 1.1,
  Populaire: 1.08,
};

function getRecencyBoost(createdAt?: string): number {
  if (!createdAt) return 1;
  const days = (Date.now() - new Date(createdAt).getTime()) / (1000 * 60 * 60 * 24);
  if (days < 7) return 1.35;
  if (days < 14) return 1.25;
  if (days < 30) return 1.15;
  if (days < 60) return 1.08;
  if (days < 90) return 1.03;
  if (days > 365) return 0.85;
  if (days > 180) return 0.92;
  return 1;
}

function getPersonalizationBoost(productId: string, viewedIds: string[]): number {
  if (viewedIds.length === 0) return 1;
  const idx = viewedIds.indexOf(productId);
  if (idx === -1) return 1.05;
  if (idx < 3) return 0.7;
  return 0.8;
}

function getPriceBoost(price: string): number {
  const n = parseInt(price.replace(/[^\d]/g, ""), 10);
  if (isNaN(n)) return 1;
  if (n <= 3000) return 1.2;
  if (n <= 5000) return 1.15;
  if (n <= 7500) return 1.05;
  if (n <= 10000) return 1.0;
  return 0.9;
}

function getTagBoost(tag?: string): number {
  return tag ? TAG_BOOST[tag] ?? 1 : 1;
}

/**
 * Conversion boost: purchases / views ratio with logarithmic scale.
 * High-converting products get up to +60% boost.
 */
function getConversionBoost(stat?: ProductStat): number {
  if (!stat || stat.total_views < 5) return 1;
  const rate = stat.total_purchases / Math.max(stat.total_views, 1);
  // 0% conv => 1.0, 5% => ~1.25, 10% => ~1.4, 20%+ => 1.6
  return 1 + Math.min(0.6, rate * 3);
}

/**
 * Demand boost: recent views (7d) on a logarithmic scale.
 * Trending products get up to +40% boost.
 */
function getDemandBoost(stat?: ProductStat): number {
  if (!stat) return 1;
  const recentViews = stat.views_7d;
  if (recentViews <= 0) return 0.95;
  // log10-based: 10 views => +10%, 100 => +20%, 1000 => +30%
  return 1 + Math.min(0.4, Math.log10(recentViews + 1) * 0.1);
}

/**
 * Recent purchase momentum boost (7d purchases).
 */
function getMomentumBoost(stat?: ProductStat): number {
  if (!stat || stat.purchases_7d <= 0) return 1;
  return 1 + Math.min(0.3, stat.purchases_7d * 0.05);
}

export function computeProductScore(
  product: Product,
  viewedIds: string[] = [],
  createdAt?: string,
  stat?: ProductStat
): number {
  const base = 70;
  const categoryMult = CATEGORY_BOOST[product.category] ?? 1;
  const recency = getRecencyBoost(createdAt);
  const personalization = getPersonalizationBoost(product.id, viewedIds);
  const priceBoost = getPriceBoost(product.price);
  const tagBoost = getTagBoost(product.tag);
  const conversion = getConversionBoost(stat);
  const demand = getDemandBoost(stat);
  const momentum = getMomentumBoost(stat);

  return (
    Math.round(
      base *
        categoryMult *
        recency *
        personalization *
        priceBoost *
        tagBoost *
        conversion *
        demand *
        momentum *
        100
    ) / 100
  );
}

export function useSmartRanking(products: Product[]): Product[] {
  const { data: stats = {} } = useProductStats();

  const viewedIds = useMemo(() => {
    try {
      const stored =
        localStorage.getItem("recently-viewed") ||
        localStorage.getItem("mindhub_recently_viewed");
      return stored ? (JSON.parse(stored) as string[]) : [];
    } catch {
      return [];
    }
  }, []);

  return useMemo(() => {
    const scored = products.map((p) => ({
      product: p,
      score: computeProductScore(p, viewedIds, undefined, stats[p.id]),
    }));
    scored.sort((a, b) => b.score - a.score);
    return scored.map((s) => s.product);
  }, [products, viewedIds, stats]);
}


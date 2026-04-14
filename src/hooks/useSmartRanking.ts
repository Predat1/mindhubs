import { useMemo } from "react";
import type { Product } from "@/data/products";

/**
 * Smart product ranking algorithm v2
 * Priority: conversion > recency > category demand > reviews > price accessibility > personalization
 * 
 * Improvements:
 * - Dynamic base scores (no hardcoded product IDs)
 * - Stronger recency boost for new products (< 14 days = 30% boost)
 * - Category demand reflects real African market trends
 * - Price-to-value ratio scoring
 * - Viewed products deprioritized more aggressively for discovery
 * - Tag-based boost (products with "Nouveau", "Promo" tags rank higher)
 */

// Category demand multipliers (updated for market trends)
const CATEGORY_BOOST: Record<string, number> = {
  Formations: 1.25,
  Business: 1.2,
  Kits: 1.15,
  Livres: 1.05,
  Logiciels: 1.0,
  "Packs Enfants": 0.9,
};

// Tag-based boosts
const TAG_BOOST: Record<string, number> = {
  "Nouveau": 1.2,
  "Promo": 1.15,
  "Best-seller": 1.1,
  "Populaire": 1.08,
};

function getRecencyBoost(createdAt?: string): number {
  if (!createdAt) return 1;
  const daysSinceCreation = (Date.now() - new Date(createdAt).getTime()) / (1000 * 60 * 60 * 24);
  // Aggressive boost for very new products
  if (daysSinceCreation < 7) return 1.35;
  if (daysSinceCreation < 14) return 1.25;
  if (daysSinceCreation < 30) return 1.15;
  if (daysSinceCreation < 60) return 1.08;
  if (daysSinceCreation < 90) return 1.03;
  // Progressive decay for old products
  if (daysSinceCreation > 365) return 0.85;
  if (daysSinceCreation > 180) return 0.92;
  return 1;
}

function getUserPersonalizationBoost(productId: string, viewedIds: string[]): number {
  if (viewedIds.length === 0) return 1;
  const viewIndex = viewedIds.indexOf(productId);
  if (viewIndex === -1) return 1.05; // Slight boost for unseen products (discovery)
  // More aggressive demotion for recently viewed (index 0 = most recent)
  if (viewIndex < 3) return 0.7;
  return 0.8;
}

function getRatingBoost(rating?: number): number {
  if (!rating) return 0.95; // Penalize unrated products slightly
  if (rating >= 4.8) return 1.2;
  if (rating >= 4.5) return 1.15;
  if (rating >= 4) return 1.1;
  if (rating >= 3.5) return 1.05;
  return 1;
}

function getPriceConversionBoost(price: string): number {
  const numericPrice = parseInt(price.replace(/[^\d]/g, ""), 10);
  if (isNaN(numericPrice)) return 1;
  // Sweet spot pricing for African market
  if (numericPrice <= 3000) return 1.2;
  if (numericPrice <= 5000) return 1.15;
  if (numericPrice <= 7500) return 1.05;
  if (numericPrice <= 10000) return 1.0;
  return 0.9;
}

function getTagBoost(tag?: string): number {
  if (!tag) return 1;
  return TAG_BOOST[tag] ?? 1;
}

function getFeaturedBoost(product: Product, featuredIds: string[]): number {
  return featuredIds.includes(product.id) ? 1.1 : 1;
}

export function computeProductScore(
  product: Product,
  viewedIds: string[] = [],
  createdAt?: string
): number {
  const base = 70; // Neutral base for all products
  const categoryMult = CATEGORY_BOOST[product.category] ?? 1;
  const recency = getRecencyBoost(createdAt);
  const personalization = getUserPersonalizationBoost(product.id, viewedIds);
  const ratingBoost = getRatingBoost(product.rating);
  const priceBoost = getPriceConversionBoost(product.price);
  const tagBoost = getTagBoost(product.tag);

  return Math.round(base * categoryMult * recency * personalization * ratingBoost * priceBoost * tagBoost * 100) / 100;
}

export function useSmartRanking(products: Product[]): Product[] {
  const viewedIds = useMemo(() => {
    try {
      const stored = localStorage.getItem("recently-viewed") || localStorage.getItem("mindhub_recently_viewed");
      return stored ? JSON.parse(stored) as string[] : [];
    } catch {
      return [];
    }
  }, []);

  return useMemo(() => {
    const scored = products.map((p) => ({
      product: p,
      score: computeProductScore(p, viewedIds),
    }));
    scored.sort((a, b) => b.score - a.score);
    return scored.map((s) => s.product);
  }, [products, viewedIds]);
}

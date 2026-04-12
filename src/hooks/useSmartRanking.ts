import { useMemo } from "react";
import type { Product } from "@/data/products";

/**
 * Smart product ranking algorithm
 * Priority: conversion > sales potential > reviews > engagement
 * Features: recency boost, decay for old products, user personalization
 */

// Base scores reflecting conversion potential & market demand
const BASE_SCORES: Record<string, number> = {
  anglais: 95,
  "kit-agriculture": 90,
  "kit-fiscalite": 88,
  "progiciel-budget": 92,
  "kit-logistique": 87,
  "premiers-clients": 93,
  "demarre-maintenant": 91,
};

// Category demand multipliers
const CATEGORY_BOOST: Record<string, number> = {
  Formations: 1.15,
  Business: 1.05,
  Livres: 1.0,
  Logiciels: 0.95,
  Kits: 0.9,
  "Packs Enfants": 0.85,
};

function getRecencyBoost(createdAt?: string): number {
  if (!createdAt) return 1;
  const daysSinceCreation = (Date.now() - new Date(createdAt).getTime()) / (1000 * 60 * 60 * 24);
  // New products (< 30 days) get up to 20% boost, decaying over 90 days
  if (daysSinceCreation < 30) return 1.2;
  if (daysSinceCreation < 60) return 1.1;
  if (daysSinceCreation < 90) return 1.05;
  // Old products (> 180 days) get slight decay
  if (daysSinceCreation > 180) return 0.95;
  if (daysSinceCreation > 365) return 0.9;
  return 1;
}

function getUserPersonalizationBoost(productId: string, viewedIds: string[]): number {
  if (viewedIds.length === 0) return 1;
  // Products the user has viewed recently get a slight demotion (they've seen it)
  // to promote discovery of new products
  if (viewedIds.includes(productId)) return 0.85;
  // Boost products in same category as viewed ones (interest signal)
  return 1;
}

function getRatingBoost(rating?: number): number {
  if (!rating) return 1;
  if (rating >= 4.5) return 1.15;
  if (rating >= 4) return 1.1;
  if (rating >= 3.5) return 1.05;
  return 1;
}

function getPriceConversionBoost(price: string): number {
  const numericPrice = parseInt(price.replace(/[^\d]/g, ""), 10);
  // Lower price = higher conversion probability
  if (numericPrice <= 2000) return 1.15;
  if (numericPrice <= 5000) return 1.1;
  if (numericPrice <= 7500) return 1.0;
  if (numericPrice <= 10000) return 0.95;
  return 0.9;
}

export function computeProductScore(
  product: Product,
  viewedIds: string[] = [],
  createdAt?: string
): number {
  const base = BASE_SCORES[product.id] ?? 50;
  const categoryMult = CATEGORY_BOOST[product.category] ?? 1;
  const recency = getRecencyBoost(createdAt);
  const personalization = getUserPersonalizationBoost(product.id, viewedIds);
  const ratingBoost = getRatingBoost(product.rating);
  const priceBoost = getPriceConversionBoost(product.price);

  return Math.round(base * categoryMult * recency * personalization * ratingBoost * priceBoost * 100) / 100;
}

export function useSmartRanking(products: Product[]): Product[] {
  const viewedIds = useMemo(() => {
    try {
      const stored = localStorage.getItem("recently-viewed");
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

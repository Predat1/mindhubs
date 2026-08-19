export type VendorPlanId = "free" | "starter" | "pro" | "elite";

export type VendorPlan = {
  id: VendorPlanId;
  name: string;
  badge: string;
  price_monthly: number;
  price_yearly: number;
  tagline: string;
  highlight: boolean;
  highlight_label: string | null;
  features: Array<{ label: string; included: boolean }>;
  cta: string;
  cta_href: string;
};

/** Single public source for the seller plan comparison and onboarding links. */
export const VENDOR_PLANS: VendorPlan[] = [
  {
    id: "free",
    name: "Free",
    badge: "Débutant",
    price_monthly: 0,
    price_yearly: 0,
    tagline: "Pour commencer sans risque",
    highlight: false,
    highlight_label: null,
    features: [
      { label: "5 produits maximum", included: true },
      { label: "50 crédits IA / mois", included: true },
      { label: "Commission 20%", included: true },
      { label: "Boutique publique standard", included: true },
      { label: "Support email", included: true },
      { label: "Assistant de fiche produit", included: false },
      { label: "Accompagnement prioritaire", included: false },
      { label: "Placement prioritaire", included: false },
      { label: "Accompagnement 1:1", included: false },
    ],
    cta: "Commencer gratuitement",
    cta_href: "/become-a-seller/start?plan=free",
  },
  {
    id: "starter",
    name: "Starter",
    badge: "Lancement",
    price_monthly: 4999,
    price_yearly: 49990,
    tagline: "Pour lancer sérieusement",
    highlight: false,
    highlight_label: null,
    features: [
      { label: "20 produits maximum", included: true },
      { label: "200 crédits IA / mois", included: true },
      { label: "Commission 15%", included: true },
      { label: "Boutique publique standard", included: true },
      { label: "Support prioritaire", included: true },
      { label: "Assistant de fiche produit", included: true },
      { label: "Accompagnement prioritaire", included: false },
      { label: "Placement prioritaire", included: false },
      { label: "Accompagnement 1:1", included: false },
    ],
    cta: "Choisir Starter",
    cta_href: "/become-a-seller/start?plan=starter",
  },
  {
    id: "pro",
    name: "Pro",
    badge: "Recommandé",
    price_monthly: 14999,
    price_yearly: 149990,
    tagline: "Pour développer vos ventes",
    highlight: true,
    highlight_label: "Le plus choisi",
    features: [
      { label: "Produits illimités", included: true },
      { label: "1 000 crédits IA / mois", included: true },
      { label: "Commission 10%", included: true },
      { label: "Boutique publique premium", included: true },
      { label: "Support prioritaire", included: true },
      { label: "Assistant de fiche produit", included: true },
      { label: "Accompagnement prioritaire", included: true },
      { label: "Mise en avant de boutique", included: true },
      { label: "Placement prioritaire", included: false },
      { label: "Accompagnement 1:1", included: false },
    ],
    cta: "Passer à Pro",
    cta_href: "/become-a-seller/start?plan=pro",
  },
  {
    id: "elite",
    name: "Elite",
    badge: "Avancé",
    price_monthly: 49999,
    price_yearly: 499990,
    tagline: "Pour une activité à grande échelle",
    highlight: false,
    highlight_label: "Tout inclus",
    features: [
      { label: "Tout illimité", included: true },
      { label: "5 000 crédits IA / mois", included: true },
      { label: "Commission 5%", included: true },
      { label: "Boutique publique premium", included: true },
      { label: "Support WhatsApp dédié", included: true },
      { label: "Assistant de fiche produit", included: true },
      { label: "Mise en avant de boutique", included: true },
      { label: "Placement prioritaire", included: true },
      { label: "Accompagnement 1:1", included: true },
    ],
    cta: "Devenir Elite",
    cta_href: "/become-a-seller/start?plan=elite",
  },
];

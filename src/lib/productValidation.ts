export type ProductMode = "digital" | "physical" | "hybrid";

export type ProductWizardStep = "offer" | "content" | "pricing" | "publication";

export type ProductChannelSelection = {
  storefront: boolean;
  marketplace: boolean;
};

export type ProductValidationInput = {
  title: string;
  description: string;
  category: string;
  imageUrl: string;
  price: string;
  pricingMode?: "free" | "paid";
  oldPrice?: string;
  productMode: ProductMode;
  digitalAssetPath?: string;
  digitalAssetName?: string;
  inventoryQuantity?: string;
  shippingNotes?: string;
  distribution: ProductChannelSelection;
};

export type ProductValidationResult = {
  valid: boolean;
  fields: Record<string, string>;
  missingByStep: Record<ProductWizardStep, string[]>;
};

const stripAmount = (value: string | undefined) => {
  if (!value) return null;
  const normalized = value.replace(/\s/g, "").replace(/,/g, ".").replace(/[^0-9.]/g, "");
  if (!normalized || normalized === ".") return null;
  const amount = Number(normalized);
  return Number.isFinite(amount) ? amount : null;
};

export const parseProductAmount = stripAmount;

export function validateProduct(input: ProductValidationInput): ProductValidationResult {
  const fields: Record<string, string> = {};
  const missingByStep: Record<ProductWizardStep, string[]> = {
    offer: [],
    content: [],
    pricing: [],
    publication: [],
  };

  if (input.title.trim().length < 3) {
    fields.title = "Saisissez au moins 3 caractères.";
    missingByStep.offer.push("Titre du produit");
  }
  if (!input.category.trim()) {
    fields.category = "Choisissez une catégorie.";
    missingByStep.offer.push("Catégorie");
  }
  if (!input.description.trim()) {
    fields.description = "Ajoutez une description pour expliquer la valeur de l’offre.";
    missingByStep.offer.push("Description");
  }
  if (!input.imageUrl.trim()) {
    fields.imageUrl = "Ajoutez une image principale.";
    missingByStep.content.push("Image principale");
  }

  const pricingMode = input.pricingMode ?? "paid";
  const price = stripAmount(input.price);
  if (pricingMode === "free" && (input.productMode === "physical" || input.productMode === "hybrid")) {
    fields.price = "Les produits physiques et hybrides doivent être payants.";
    missingByStep.pricing.push("Prix payant");
  } else if (pricingMode === "paid" && (price === null || price <= 0)) {
    fields.price = "Saisissez un prix supérieur à zéro.";
    missingByStep.pricing.push("Prix");
  }

  const oldPrice = stripAmount(input.oldPrice);
  if (pricingMode === "paid" && oldPrice !== null && price !== null && oldPrice <= price) {
    fields.oldPrice = "L’ancien prix doit être supérieur au prix actuel.";
    missingByStep.pricing.push("Ancien prix cohérent");
  }

  if (input.productMode === "digital" || input.productMode === "hybrid") {
    if (!input.digitalAssetPath && !input.digitalAssetName) {
      fields.digitalAsset = "Ajoutez le fichier qui sera livré après l’achat.";
      missingByStep.content.push("Fichier digital");
    }
  }

  if (input.productMode === "physical" || input.productMode === "hybrid") {
    const stock = input.inventoryQuantity?.trim() ?? "";
    const parsedStock = stock === "" ? null : Number(stock);
    if (parsedStock === null || !Number.isInteger(parsedStock) || parsedStock < 0) {
      fields.inventoryQuantity = "Renseignez un stock entier supérieur ou égal à 0.";
      missingByStep.pricing.push("Stock");
    }
    if (!input.shippingNotes?.trim()) {
      fields.shippingNotes = "Indiquez les zones, délais ou conditions de livraison.";
      missingByStep.pricing.push("Livraison");
    }
  }

  if (!input.distribution.storefront && !input.distribution.marketplace) {
    fields.distribution = "Sélectionnez au moins un canal ou gardez le produit en brouillon.";
    missingByStep.publication.push("Canal de publication");
  }

  return { valid: Object.keys(fields).length === 0, fields, missingByStep };
}

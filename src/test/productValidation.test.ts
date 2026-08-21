import { describe, expect, it } from "vitest";
import { validateProduct } from "@/lib/productValidation";

const base = {
  title: "Pack lancement",
  description: "Une description claire de l'offre.",
  category: "Business",
  imageUrl: "https://cdn.test/cover.jpg",
  price: "5000 FCFA",
  oldPrice: "10000 FCFA",
  productMode: "digital" as const,
  digitalAssetPath: "vendor/digital/file.pdf",
  digitalAssetName: "file.pdf",
  inventoryQuantity: "",
  shippingNotes: "",
  distribution: { storefront: true, marketplace: false },
};

describe("validateProduct", () => {
  it("accepts a complete digital offer for the storefront", () => {
    expect(validateProduct(base).valid).toBe(true);
  });

  it("requires a digital asset for digital and hybrid offers", () => {
    const result = validateProduct({ ...base, digitalAssetPath: "", digitalAssetName: "" });
    expect(result.valid).toBe(false);
    expect(result.fields.digitalAsset).toBeTruthy();
  });

  it("requires stock and delivery for physical offers", () => {
    const result = validateProduct({ ...base, productMode: "physical", digitalAssetPath: "", digitalAssetName: "" });
    expect(result.valid).toBe(false);
    expect(result.fields.inventoryQuantity).toBeTruthy();
    expect(result.fields.shippingNotes).toBeTruthy();
  });

  it("flags a missing channel before publication", () => {
    const result = validateProduct({ ...base, distribution: { storefront: false, marketplace: false } });
    expect(result.fields.distribution).toBeTruthy();
  });

  it("rejects an invalid sale price and an incoherent old price", () => {
    const result = validateProduct({ ...base, price: "abc", oldPrice: "100" });
    expect(result.fields.price).toBeTruthy();
    expect(result.fields.oldPrice).toBeUndefined();
  });

  it("accepts a free digital product without a sale price", () => {
    const result = validateProduct({
      ...base,
      pricingMode: "free",
      price: "0",
      oldPrice: "",
    });
    expect(result.valid).toBe(true);
    expect(result.fields.price).toBeUndefined();
  });

  it("does not allow a physical product to be free", () => {
    const result = validateProduct({
      ...base,
      pricingMode: "free",
      productMode: "physical",
      price: "0",
      oldPrice: "",
      digitalAssetPath: "",
      digitalAssetName: "",
      inventoryQuantity: "2",
      shippingNotes: "Livraison sous 3 jours",
    });
    expect(result.valid).toBe(false);
    expect(result.fields.price).toBeTruthy();
  });

  it("accepts an optional external checkout link", () => {
    const result = validateProduct({ ...base, paymentLink: "https://payments.example.test/checkout" });
    expect(result.valid).toBe(true);
    expect(result.fields.paymentLink).toBeUndefined();
  });

  it("rejects an external link that is not an http(s) URL", () => {
    const result = validateProduct({ ...base, paymentLink: "javascript:alert(1)" });
    expect(result.valid).toBe(false);
    expect(result.fields.paymentLink).toBeTruthy();
  });
});

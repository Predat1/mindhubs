import { supabase } from "@/integrations/supabase/client";

export type ProductAccessSource = "free_claim" | "purchase" | "admin_grant";

export async function claimFreeProduct(productId: string): Promise<string> {
  const { data, error } = await (supabase as any).rpc("claim_free_product", {
    p_product_id: productId,
  });
  if (error) throw error;
  if (!data) throw new Error("L’accès gratuit n’a pas pu être créé.");
  return String(data);
}

export async function hasProductAccess(productId: string, userId?: string | null): Promise<boolean> {
  if (!userId) return false;
  const { data, error } = await (supabase as any)
    .from("product_entitlements")
    .select("id")
    .eq("product_id", productId)
    .eq("user_id", userId)
    .eq("status", "active")
    .maybeSingle();
  if (error) throw error;
  return Boolean(data);
}

export async function createDigitalDownloadUrl(path: string, expiresIn = 300): Promise<string> {
  const { data, error } = await supabase.storage.from("digital-products").createSignedUrl(path, expiresIn);
  if (error || !data?.signedUrl) throw error || new Error("Le téléchargement n’est pas disponible.");
  return data.signedUrl;
}

import { supabase } from "@/integrations/supabase/client";

type DbError = { code?: string; message?: string } | null;
type DbResult<T> = Promise<{ data: T; error: DbError }>;
type DbQuery<T = unknown> = {
  select: (columns?: string) => DbQuery<T>;
  eq: (column: string, value: unknown) => DbQuery<T>;
  insert: (values: Record<string, unknown>) => DbQuery<T>;
  upsert: (values: Record<string, unknown>, options?: { onConflict?: string }) => DbQuery<T>;
  maybeSingle: () => DbResult<T | null>;
  single: () => DbResult<T>;
};
type UntypedDatabase = {
  rpc: (name: string, args: Record<string, unknown>) => DbResult<unknown>;
  from: (table: string) => DbQuery;
};

const db = supabase as unknown as UntypedDatabase;

export type SellerOnboardingInput = {
  userId: string;
  shopName: string;
  username: string;
};

export type SellerOnboardingResult = {
  vendorId: string;
};

export const slugifyShopName = (value: string) =>
  value
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 30);

export const normalizeUsername = (value: string) =>
  value.toLowerCase().trim().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "").replace(/-+/g, "-").replace(/^-+|-+$/g, "").slice(0, 30);

const isMissingOnboardingFunction = (error: { code?: string; message?: string } | null) =>
  error?.code === "42883" || error?.code === "PGRST202" || /function .*initialize_vendor_onboarding.* does not exist|could not find the function .*initialize_vendor_onboarding/i.test(error?.message || "");

const toOnboardingError = (error: { code?: string; message?: string } | null) => {
  if (!error) return new Error("Impossible de créer la boutique.");
  if (error.code === "23505" || /username_taken|duplicate key|already exists/i.test(error.message || "")) {
    return new Error("Cette URL de boutique est déjà utilisée. Choisissez-en une autre.");
  }
  if (error.code === "42501" || /auth_required|JWT|permission|session/i.test(error.message || "")) {
    return new Error("Votre session a expiré. Reconnectez-vous pour continuer.");
  }
  return new Error(error.message || "Impossible de créer la boutique. Réessayez dans quelques instants.");
};

/**
 * Initializes all seller records in one idempotent operation when the RPC is deployed.
 * The checked fallback keeps local/demo environments usable before the migration is applied.
 */
export async function initializeSeller(input: SellerOnboardingInput): Promise<SellerOnboardingResult> {
  const shopName = input.shopName.trim();
  const username = normalizeUsername(input.username);

  if (!input.userId) throw new Error("Votre session a expiré. Reconnectez-vous pour continuer.");
  if (shopName.length < 2 || shopName.length > 60) throw new Error("Le nom de boutique doit contenir entre 2 et 60 caractères.");
  if (!/^[a-z0-9-]{3,30}$/.test(username)) throw new Error("L’URL doit contenir entre 3 et 30 caractères minuscules.");

  const { data: rpcData, error: rpcError } = await db.rpc("initialize_vendor_onboarding", {
    p_shop_name: shopName,
    p_username: username,
  });

  if (!rpcError) {
    const vendorId = typeof rpcData === "string" ? rpcData : rpcData?.vendor_id || rpcData?.id;
    if (vendorId) return { vendorId };
  }

  if (rpcError && !isMissingOnboardingFunction(rpcError)) {
    throw toOnboardingError(rpcError);
  }

  // Compatibility fallback for a local Supabase project before the RPC migration is deployed.
  const { data: existingVendor, error: existingError } = await db
    .from("vendors")
    .select("id")
    .eq("user_id", input.userId)
    .maybeSingle();
  if (existingError) throw toOnboardingError(existingError);
  if (existingVendor?.id) return { vendorId: existingVendor.id };

  const { data: vendor, error: vendorError } = await db
    .from("vendors")
    .insert({ user_id: input.userId, shop_name: shopName, username, description: null, avatar_url: null })
    .select("id")
    .single();
  if (vendorError) throw toOnboardingError(vendorError);

  const vendorId = (vendor as { id: string }).id;
  const { error: roleError } = await db
    .from("user_roles")
    .upsert({ user_id: input.userId, role: "vendor" }, { onConflict: "user_id,role" });
  if (roleError) throw toOnboardingError(roleError);

  const { error: subscriptionError } = await db
    .from("vendor_subscriptions")
    .upsert({ vendor_id: vendorId, plan: "free", status: "active" }, { onConflict: "vendor_id" });
  if (subscriptionError) throw toOnboardingError(subscriptionError);

  const { error: creditsError } = await db
    .from("vendor_credits")
    .upsert({ vendor_id: vendorId, balance: 0 }, { onConflict: "vendor_id" });
  if (creditsError) throw toOnboardingError(creditsError);

  return { vendorId };
}

export async function isUsernameAvailable(username: string, currentUserId?: string) {
  const normalized = normalizeUsername(username);
  if (normalized.length < 3) return false;

  const { data, error } = await db
    .from("vendors")
    .select("id,user_id")
    .eq("username", normalized)
    .maybeSingle();
  if (error) throw toOnboardingError(error);
  return !data || data.user_id === currentUserId;
}

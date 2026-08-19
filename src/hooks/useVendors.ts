import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { allProducts as catalogProducts, type Product } from "@/data/products";
import { DEMO_VENDOR_ID, isDemoMode } from "@/lib/demoMode";
import { DEFAULT_VENDOR_BRAND_COLOR } from "@/lib/design-tokens";

export interface Vendor {
  id: string;
  user_id: string;
  username: string;
  shop_name: string;
  description: string | null;
  avatar_url: string | null;
  banner_url: string | null;
  primary_color: string | null;
  standalone_mode: boolean;
  custom_footer_text: string | null;
  verified: boolean;
  created_at: string;
  plan?: string;
  badge?: string;
}

export const DEMO_VENDOR: Vendor = {
  id: DEMO_VENDOR_ID,
  user_id: "00000000-0000-0000-0000-000000000001",
  username: "vendeur-demo",
  shop_name: "MindHubs Demo Store",
  description: "Boutique de démonstration MindHubs.",
  avatar_url: null,
  banner_url: null,
  primary_color: DEFAULT_VENDOR_BRAND_COLOR,
  standalone_mode: false,
  custom_footer_text: null,
  verified: true,
  created_at: "2026-01-01T00:00:00.000Z",
  plan: "pro",
  badge: "Démo",
};

const mapVendorProduct = (db: any): Product => ({
  id: db.id,
  title: db.title,
  image: db.image_url,
  oldPrice: db.old_price,
  price: db.price,
  category: db.category,
  rating: db.rating ?? undefined,
  tag: db.tag ?? undefined,
  description: db.description ?? undefined,
  paymentLink: db.payment_link ?? undefined,
  imageUrls: Array.isArray(db.image_urls) ? db.image_urls : [],
  keyFeatures: db.key_features ?? [],
  vendorId: db.vendor_id ?? undefined,
  productMode: db.product_mode || "digital",
  sku: db.sku ?? undefined,
  inventoryQuantity: db.inventory_quantity ?? undefined,
  shippingNotes: db.shipping_notes ?? undefined,
  status: db.status ?? undefined,
  created_at: db.created_at,
});

export const useVendor = (username: string | undefined) => {
  return useQuery({
    queryKey: ["vendor", username],
    queryFn: async (): Promise<Vendor | null> => {
      if (!username) return null;
      if (isDemoMode && username === DEMO_VENDOR.username) return DEMO_VENDOR;
      const { data, error } = await (supabase as any)
        .from("vendor_subscription_view")
        .select("*")
        .eq("username", username)
        .maybeSingle();
      if (error) throw error;
      return data as unknown as Vendor | null;
    },
    enabled: !!username,
  });
};

export const useVendorById = (id: string | undefined) => {
  return useQuery({
    queryKey: ["vendor-by-id", id],
    queryFn: async (): Promise<Vendor | null> => {
      if (!id) return null;
      const { data, error } = await (supabase as any)
        .from("vendor_subscription_view")
        .select("*")
        .eq("vendor_id", id)
        .maybeSingle();
      if (error) throw error;
      return data as unknown as Vendor | null;
    },
    enabled: !!id,
  });
};

export const useVendorProducts = (vendorId: string | undefined) => {
  return useQuery({
    queryKey: ["vendor-products", vendorId],
    queryFn: async (): Promise<Product[]> => {
      if (!vendorId) return [];
      if (isDemoMode && vendorId === DEMO_VENDOR_ID) {
        return catalogProducts.slice(0, 8).map((product) => ({ ...product, vendorId: DEMO_VENDOR_ID }));
      }
      const { data, error } = await supabase
        .from("products")
        .select("*")
        .eq("vendor_id", vendorId)
        .order("sort_order");
      if (error) throw error;
      return (data || []).map(mapVendorProduct);
    },
    enabled: !!vendorId,
  });
};

export const usePublishedVendorProducts = (vendorId: string | undefined, channel: "storefront" | "marketplace" = "storefront") => {
  return useQuery({
    queryKey: ["published-vendor-products", vendorId, channel],
    queryFn: async (): Promise<Product[]> => {
      if (!vendorId) return [];
      if (isDemoMode && vendorId === DEMO_VENDOR_ID) {
        return catalogProducts.slice(0, 8).map((product) => ({ ...product, vendorId: DEMO_VENDOR_ID }));
      }

      const { data, error } = await (supabase as any)
        .from("product_publications")
        .select("product:products(*)")
        .eq("vendor_id", vendorId)
        .eq("channel", channel)
        .eq("status", "published")
        .order("sort_order");

      if (!error && Array.isArray(data)) {
        return data.filter((row: any) => row.product).map((row: any) => mapVendorProduct(row.product));
      }

      // Keep existing storefronts readable until the distribution migration is deployed.
      const fallback = await supabase.from("products").select("*").eq("vendor_id", vendorId).eq("status", "published").order("sort_order");
      if (fallback.error) throw fallback.error;
      return (fallback.data || []).map(mapVendorProduct);
    },
    enabled: !!vendorId,
    staleTime: 60_000,
  });
};

export const useCurrentVendor = () => {
  const { user } = useAuth();
  return useQuery({
    queryKey: ["current-vendor", user?.id],
    queryFn: async (): Promise<Vendor | null> => {
      if (!user) return null;
      if (isDemoMode) return DEMO_VENDOR;

      // Try the enriched view first
      try {
        const { data, error } = await (supabase as any)
          .from("vendor_subscription_view")
          .select("*")
          .eq("user_id", user.id)
          .maybeSingle();
        if (!error && data) {
          // vendor_subscription_view uses "vendor_id" — normalize to "id"
          return { ...data, id: data.vendor_id ?? data.id } as unknown as Vendor;
        }
      } catch (_) { /* view may not exist yet */ }

      // Fallback: query vendors table directly
      const { data: fallback, error: fbErr } = await (supabase as any)
        .from("vendors")
        .select("*")
        .eq("user_id", user.id)
        .maybeSingle();
      if (fbErr) throw fbErr;
      return fallback as unknown as Vendor | null;
    },
    enabled: !!user,
    staleTime: 1000 * 60 * 5,
  });
};

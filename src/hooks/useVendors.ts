import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import type { Product } from "@/data/products";

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

export const useVendor = (username: string | undefined) => {
  return useQuery({
    queryKey: ["vendor", username],
    queryFn: async (): Promise<Vendor | null> => {
      if (!username) return null;
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
      const { data, error } = await supabase
        .from("products")
        .select("*")
        .eq("vendor_id", vendorId)
        .order("sort_order");
      if (error) throw error;
      return (data || []).map((db: any) => ({
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
        created_at: db.created_at,
      }));
    },
    enabled: !!vendorId,
  });
};

export const useCurrentVendor = () => {
  const { user } = useAuth();
  return useQuery({
    queryKey: ["current-vendor", user?.id],
    queryFn: async (): Promise<Vendor | null> => {
      if (!user) return null;

      // Try the enriched view first
      try {
        const { data, error } = await (supabase as any)
          .from("vendor_subscription_view")
          .select("*")
          .eq("user_id", user.id)
          .maybeSingle();
        if (!error && data) return data as unknown as Vendor;
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

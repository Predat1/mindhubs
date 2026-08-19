import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { DEMO_VENDOR_ID, isDemoMode } from "@/lib/demoMode";

export type PublicationChannel = "storefront" | "marketplace";
export type PublicationStatus = "draft" | "pending_review" | "published" | "hidden" | "archived";

export interface ProductPublication {
  id?: string;
  product_id: string;
  vendor_id: string;
  channel: PublicationChannel;
  status: PublicationStatus;
  published_at?: string | null;
  sort_order?: number;
}

const demoPublications: ProductPublication[] = [];

export const useVendorProductPublications = (vendorId: string | undefined) => {
  return useQuery({
    queryKey: ["vendor-product-publications", vendorId],
    queryFn: async (): Promise<ProductPublication[]> => {
      if (!vendorId) return [];
      if (isDemoMode && vendorId === DEMO_VENDOR_ID) return demoPublications;
      const { data, error } = await (supabase as any)
        .from("product_publications")
        .select("id, product_id, vendor_id, channel, status, published_at, sort_order")
        .eq("vendor_id", vendorId)
        .order("sort_order");
      if (error) throw error;
      return (data || []) as ProductPublication[];
    },
    enabled: !!vendorId,
    staleTime: 60_000,
  });
};

export const useSaveProductPublication = (vendorId: string | undefined) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (publication: Omit<ProductPublication, "vendor_id">) => {
      if (!vendorId) throw new Error("Vendeur introuvable");
      if (isDemoMode && vendorId === DEMO_VENDOR_ID) return publication;
      const { data, error } = await (supabase as any)
        .from("product_publications")
        .upsert({ ...publication, vendor_id: vendorId }, { onConflict: "product_id,channel" })
        .select()
        .single();
      if (error) throw error;
      return data as ProductPublication;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["vendor-product-publications", vendorId] });
      queryClient.invalidateQueries({ queryKey: ["products"] });
      queryClient.invalidateQueries({ queryKey: ["vendor-products", vendorId] });
    },
  });
};

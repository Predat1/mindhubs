import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { allProducts, featuredProductIds, type Product, type Category } from "@/data/products";

export interface DbProduct {
  id: string;
  title: string;
  image_url: string;
  old_price: string;
  price: string;
  pricing_mode?: "free" | "paid";
  currency?: string;
  price_amount?: number | null;
  category: string;
  rating: number | null;
  tag: string | null;
  description: string | null;
  featured: boolean;
  sort_order: number;
  payment_link: string | null;
  image_urls: string[] | null;
  key_features: string[] | null;
  vendor_id: string | null;
  created_at?: string | null;
  is_lms: boolean;
  product_mode?: "digital" | "physical" | "hybrid";
  sku?: string | null;
  inventory_quantity?: number | null;
  shipping_notes?: string | null;
  vendor?: {
    username?: string;
    shop_name: string;
    avatar_url: string | null;
    verified: boolean;
  };
}

const mapDbToProduct = (db: DbProduct): Product => ({
  id: db.id,
  title: db.title,
  image: db.image_url,
  oldPrice: db.old_price,
  price: db.price,
  pricingMode: db.pricing_mode || (db.price_amount === 0 ? "free" : "paid"),
  currency: db.currency || "XOF",
  priceAmount: db.price_amount ?? undefined,
  category: db.category as Category,
  rating: db.rating ?? undefined,
  tag: db.tag ?? undefined,
  description: db.description ?? undefined,
  paymentLink: db.payment_link ?? undefined,
  imageUrls: Array.isArray(db.image_urls) ? db.image_urls : [],
  keyFeatures: db.key_features ?? [],
  vendorId: db.vendor_id ?? undefined,
  vendor: db.vendor,
  created_at: db.created_at ?? undefined,
  is_lms: db.is_lms || false,
  featured: db.featured || false,
  productMode: db.product_mode || "digital",
  sku: db.sku ?? undefined,
  inventoryQuantity: db.inventory_quantity ?? undefined,
  shippingNotes: db.shipping_notes ?? undefined,
});

const fetchPublishedMarketplaceProducts = async (): Promise<Product[] | null> => {
  // The generated Supabase types predate the marketplace distribution table.
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data, error } = await (supabase as any)
    .from("product_publications")
    .select("product:products(*, vendor:vendors(username, shop_name, avatar_url, verified))")
    .eq("channel", "marketplace")
    .eq("status", "published")
    .order("sort_order");
  if (error) return null;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return (data || []).filter((row: any) => row.product).map((row: any) => mapDbToProduct(row.product as DbProduct));
};

export const useProducts = () => {
  return useQuery({
    queryKey: ["products"],
    queryFn: async (): Promise<Product[]> => {
      const publishedProducts = await fetchPublishedMarketplaceProducts();
      let dbProducts: Product[] = publishedProducts || [];
      if (publishedProducts === null) {
        const { data } = await supabase
          .from("products")
          .select("*, vendor:vendors(username, shop_name, avatar_url, verified)")
          .eq("status", "published")
          .is("vendor_id", null)
          .order("sort_order", { ascending: true });
        dbProducts = (data || []).map(db => mapDbToProduct(db as unknown as DbProduct));
      }
      
      // Combine static products with DB products, avoiding duplicates by ID
      const combined = [...allProducts];
      dbProducts.forEach(dbP => {
        const index = combined.findIndex(p => p.id === dbP.id);
        if (index > -1) {
          combined[index] = dbP;
        } else {
          combined.push(dbP);
        }
      });

      // Smart Ranking Logic:
      return combined.sort((a, b) => {
        // Boost featured products (the ones we explicitly defined)
        const isAFeatured = featuredProductIds?.includes(a.id) ?? false;
        const isBFeatured = featuredProductIds?.includes(b.id) ?? false;
        if (isAFeatured && !isBFeatured) return -1;
        if (!isAFeatured && isBFeatured) return 1;

        // Then by rating
        const ratingA = a.rating || 0;
        const ratingB = b.rating || 0;
        if (ratingB !== ratingA) return ratingB - ratingA;

        return 0; // Maintain order from DB (sort_order)
      });
    },
    staleTime: 5 * 60 * 1000,
  });
};

export const useFeaturedProducts = () => {
  return useQuery({
    queryKey: ["products", "featured"],
    queryFn: async (): Promise<Product[]> => {
      const publishedProducts = await fetchPublishedMarketplaceProducts();
      let dbFeatured: Product[];
      if (publishedProducts !== null) {
        dbFeatured = publishedProducts.filter((product) => (product as Product & { featured?: boolean }).featured);
      } else {
        const { data } = await supabase
          .from("products")
          .select("*, vendor:vendors(username, shop_name, avatar_url, verified)")
          .eq("status", "published")
          .eq("featured", true)
          .order("sort_order");
        dbFeatured = (data || []).map(db => mapDbToProduct(db as unknown as DbProduct));
      }
      const staticFeatured = allProducts.filter((p) => featuredProductIds.includes(p.id));

      // Combine and deduplicate
      const combined = [...staticFeatured];
      dbFeatured.forEach(dbP => {
        if (!combined.some(p => p.id === dbP.id)) {
          combined.push(dbP);
        }
      });

      return combined;
    },
    staleTime: 5 * 60 * 1000,
  });
};



export const useProduct = (id: string, sourceChannel?: "marketplace" | "storefront" | "direct") => {
  const queryClient = useQueryClient();
  
  return useQuery({
    queryKey: ["products", id, sourceChannel],
    queryFn: async (): Promise<Product | null> => {
      const staticProduct = allProducts.find((p) => p.id === id) ?? null;

      if (sourceChannel === "marketplace" || sourceChannel === "storefront") {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const { data: publication, error: publicationError } = await (supabase as any)
          .from("product_publications")
          .select("product:products(*, vendor:vendors(username, shop_name, avatar_url, verified))")
          .eq("product_id", id)
          .eq("channel", sourceChannel)
          .eq("status", "published")
          .maybeSingle();

        if (!publicationError) {
          if (publication?.product) return mapDbToProduct(publication.product as DbProduct);
          // Static catalogue items remain available while database-backed products
          // are governed strictly by their publication status.
          return staticProduct;
        }

        // If the distribution table is unavailable, fail closed for marketplace
        // products. Storefront URLs can use the legacy published flag as a safe
        // compatibility path until the publication migration is available.
        if (sourceChannel === "marketplace") return staticProduct;
      }

      const { data, error } = await supabase
        .from("products")
        .select("*, vendor:vendors(username, shop_name, avatar_url, verified)")
        .eq("id", id)
        .eq("status", "published")
        .maybeSingle();

      if (error || !data) {
        return staticProduct;
      }

      return mapDbToProduct(data as unknown as DbProduct);
    },
    initialData: () => {
      // Look for the product in the 'products' list cache
      const listData = queryClient.getQueryData<Product[]>(["products"]);
      return listData?.find((p) => p.id === id);
    },
    initialDataUpdatedAt: () => {
      return queryClient.getQueryState(["products"])?.dataUpdatedAt;
    },
    enabled: !!id,
    staleTime: 10 * 60 * 1000, // 10 minutes
  });
};

export const useNewProducts = () => {
  return useQuery({
    queryKey: ["products", "new"],
    queryFn: async (): Promise<Product[]> => {
      const publishedProducts = await fetchPublishedMarketplaceProducts();
      let dbProducts: Product[];
      if (publishedProducts !== null) {
        dbProducts = publishedProducts.slice(0, 10);
      } else {
        const { data } = await supabase
          .from("products")
          .select("*, vendor:vendors(username, shop_name, avatar_url, verified)")
          .eq("status", "published")
          .order("created_at", { ascending: false })
          .limit(10);
        dbProducts = (data || []).map(db => mapDbToProduct(db as unknown as DbProduct));
      }
      const combined = [...dbProducts];
      
      // Add static products if we have room
      allProducts.forEach(p => {
        if (!combined.some(cp => cp.id === p.id)) {
          combined.push(p);
        }
      });

      return combined.slice(0, 8);
    },
    staleTime: 5 * 60 * 1000,
  });
};

export const useSearchProducts = (query: string) => {
  return useQuery({
    queryKey: ["products", "search", query],
    queryFn: async (): Promise<Product[]> => {
      if (!query.trim()) return [];

      const q = query.toLowerCase();
      const publishedProducts = await fetchPublishedMarketplaceProducts();
      let dbResults: Product[];
      if (publishedProducts !== null) {
        dbResults = publishedProducts.filter((p) => p.title.toLowerCase().includes(q)).slice(0, 20);
      } else {
        const { data } = await supabase
          .from("products")
          .select("*, vendor:vendors(username, shop_name, avatar_url, verified)")
          .eq("status", "published")
          .ilike("title", `%${query}%`)
          .order("sort_order")
          .limit(20);
        dbResults = (data || []).map(db => mapDbToProduct(db as unknown as DbProduct));
      }
      const staticResults = allProducts.filter((p) => p.title.toLowerCase().includes(q));

      const combined = [...dbResults];
      staticResults.forEach(p => {
        if (!combined.some(cp => cp.id === p.id)) {
          combined.push(p);
        }
      });

      return combined;
    },
    enabled: query.trim().length >= 2,
  });
};

export const usePrefetchProduct = () => {
  const queryClient = useQueryClient();

  return (id: string) => {
    if (!id) return;
    queryClient.prefetchQuery({
      queryKey: ["products", id],
      queryFn: async (): Promise<Product | null> => {
        const { data, error } = await supabase
          .from("products")
          .select("*, vendor:vendors(username, shop_name, avatar_url, verified)")
          .eq("id", id)
          .eq("status", "published")
          .maybeSingle();

        if (error || !data) {
          const fallback = allProducts.find((p) => p.id === id);
          return fallback ?? null;
        }

        return mapDbToProduct(data as unknown as DbProduct);
      },
      staleTime: 10 * 60 * 1000,
    });
  };
};

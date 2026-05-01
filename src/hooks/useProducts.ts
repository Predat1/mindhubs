import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { allProducts, type Product, type Category } from "@/data/products";

export interface DbProduct {
  id: string;
  title: string;
  image_url: string;
  old_price: string;
  price: string;
  category: string;
  rating: number | null;
  tag: string | null;
  description: string | null;
  featured: boolean;
  sort_order: number;
  payment_link: string | null;
  image_urls: any | null;
  key_features: string[] | null;
  vendor_id: string | null;
}

const mapDbToProduct = (db: DbProduct): Product => ({
  id: db.id,
  title: db.title,
  image: db.image_url,
  oldPrice: db.old_price,
  price: db.price,
  category: db.category as Category,
  rating: db.rating ?? undefined,
  tag: db.tag ?? undefined,
  description: db.description ?? undefined,
  paymentLink: db.payment_link ?? undefined,
  imageUrls: Array.isArray(db.image_urls) ? db.image_urls : [],
  keyFeatures: db.key_features ?? [],
  vendorId: db.vendor_id ?? undefined,
});

export const useProducts = () => {
  return useQuery({
    queryKey: ["products"],
    queryFn: async (): Promise<Product[]> => {
      const { data, error } = await supabase
        .from("products")
        .select("*")
        .order("sort_order", { ascending: true }); // Admin priority

      const dbProducts = (data || []).map(db => mapDbToProduct(db as unknown as DbProduct));
      
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
      // 1. Featured tag (if any)
      // 2. High rating (4.5+)
      // 3. Newness (simulated for static, real for DB)
      return combined.sort((a, b) => {
        // Boost featured products (the ones we explicitly defined)
        const isAFeatured = featuredProductIds.includes(a.id);
        const isBFeatured = featuredProductIds.includes(b.id);
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
      const { data, error } = await supabase
        .from("products")
        .select("*")
        .eq("featured", true)
        .order("sort_order");

      const dbFeatured = (data || []).map(db => mapDbToProduct(db as unknown as DbProduct));
      const staticFeatured = allProducts.filter((p) =>
        ["anglais", "kit-agriculture", "kit-fiscalite", "progiciel-budget", "kit-logistique", "premiers-clients", "demarre-maintenant"].includes(p.id)
      );

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



export const useProduct = (id: string) => {
  const queryClient = useQueryClient();
  
  return useQuery({
    queryKey: ["products", id],
    queryFn: async (): Promise<Product | null> => {
      const { data, error } = await supabase
        .from("products")
        .select("*")
        .eq("id", id)
        .maybeSingle();

      if (error || !data) {
        const fallback = allProducts.find((p) => p.id === id);
        return fallback ?? null;
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
      const { data } = await supabase
        .from("products")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(10);

      const dbProducts = (data || []).map(db => mapDbToProduct(db as unknown as DbProduct));
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

      const { data } = await supabase
        .from("products")
        .select("*")
        .ilike("title", `%${query}%`)
        .order("sort_order")
        .limit(20);

      const dbResults = (data || []).map(db => mapDbToProduct(db as unknown as DbProduct));
      const q = query.toLowerCase();
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
          .select("*")
          .eq("id", id)
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

import { useQuery } from "@tanstack/react-query";
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
});

export const useProducts = () => {
  return useQuery({
    queryKey: ["products"],
    queryFn: async (): Promise<Product[]> => {
      const { data, error } = await supabase
        .from("products")
        .select("*")
        .order("sort_order");

      if (error || !data || data.length === 0) {
        // Fallback to static data
        return allProducts;
      }

      return (data as unknown as DbProduct[]).map(mapDbToProduct);
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

      if (error || !data || data.length === 0) {
        return allProducts.filter((p) =>
          ["smma", "blog", "youtube", "affiliation", "livres", "ecommerce", "anglais", "ai"].includes(p.id)
        );
      }

      return (data as unknown as DbProduct[]).map(mapDbToProduct);
    },
    staleTime: 5 * 60 * 1000,
  });
};

export const useProduct = (id: string) => {
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
    enabled: !!id,
  });
};

export const useNewProducts = () => {
  return useQuery({
    queryKey: ["products", "new"],
    queryFn: async (): Promise<Product[]> => {
      const { data, error } = await supabase
        .from("products")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(4);

      if (error || !data || data.length === 0) {
        return allProducts.slice(0, 4);
      }

      return (data as unknown as DbProduct[]).map(mapDbToProduct);
    },
    staleTime: 5 * 60 * 1000,
  });
};

export const useSearchProducts = (query: string) => {
  return useQuery({
    queryKey: ["products", "search", query],
    queryFn: async (): Promise<Product[]> => {
      if (!query.trim()) return [];

      const { data, error } = await supabase
        .from("products")
        .select("*")
        .ilike("title", `%${query}%`)
        .order("sort_order")
        .limit(6);

      if (error || !data) {
        const q = query.toLowerCase();
        return allProducts.filter((p) => p.title.toLowerCase().includes(q)).slice(0, 6);
      }

      return (data as unknown as DbProduct[]).map(mapDbToProduct);
    },
    enabled: query.trim().length >= 2,
  });
};

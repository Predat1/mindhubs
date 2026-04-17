import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface ProductStat {
  product_id: string;
  total_views: number;
  total_purchases: number;
  views_7d: number;
  purchases_7d: number;
  views_30d: number;
  purchases_30d: number;
}

const SESSION_KEY = "mh_session_id";

const getSessionId = (): string => {
  try {
    let id = localStorage.getItem(SESSION_KEY);
    if (!id) {
      id = `${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
      localStorage.setItem(SESSION_KEY, id);
    }
    return id;
  } catch {
    return "anon";
  }
};

const VIEW_DEDUPE_KEY = "mh_viewed_session";
const getViewedThisSession = (): Set<string> => {
  try {
    const raw = sessionStorage.getItem(VIEW_DEDUPE_KEY);
    return new Set(raw ? (JSON.parse(raw) as string[]) : []);
  } catch {
    return new Set();
  }
};
const markViewed = (productId: string) => {
  try {
    const set = getViewedThisSession();
    set.add(productId);
    sessionStorage.setItem(VIEW_DEDUPE_KEY, JSON.stringify([...set]));
  } catch {
    /* ignore */
  }
};

export const trackProductView = async (productId: string) => {
  if (getViewedThisSession().has(productId)) return;
  markViewed(productId);
  const { data: { user } } = await supabase.auth.getUser();
  await supabase.from("product_events").insert({
    product_id: productId,
    event_type: "view",
    user_id: user?.id ?? null,
    session_id: getSessionId(),
  });
};

export const trackProductPurchase = async (productId: string) => {
  const { data: { user } } = await supabase.auth.getUser();
  await supabase.from("product_events").insert({
    product_id: productId,
    event_type: "purchase",
    user_id: user?.id ?? null,
    session_id: getSessionId(),
  });
};

export const useProductStats = () => {
  return useQuery({
    queryKey: ["product-stats"],
    queryFn: async (): Promise<Record<string, ProductStat>> => {
      const { data, error } = await supabase
        .from("product_stats" as never)
        .select("*");
      if (error || !data) return {};
      const map: Record<string, ProductStat> = {};
      (data as unknown as ProductStat[]).forEach((row) => {
        map[row.product_id] = row;
      });
      return map;
    },
    staleTime: 2 * 60 * 1000,
  });
};

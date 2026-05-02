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

const getTrafficSource = (): string => {
  try {
    const params = new URLSearchParams(window.location.search);
    const sourceParam = params.get("ref") || params.get("source") || params.get("utm_source");
    if (sourceParam) {
      if (sourceParam.toLowerCase().includes("fb") || sourceParam.toLowerCase().includes("facebook")) return "Facebook";
      if (sourceParam.toLowerCase().includes("wa") || sourceParam.toLowerCase().includes("whatsapp")) return "WhatsApp";
      if (sourceParam.toLowerCase().includes("ig") || sourceParam.toLowerCase().includes("instagram")) return "Instagram";
      return sourceParam;
    }
    
    const referrer = document.referrer.toLowerCase();
    if (referrer.includes("facebook.com")) return "Facebook";
    if (referrer.includes("instagram.com")) return "Instagram";
    if (referrer.includes("whatsapp.com") || referrer.includes("wa.me")) return "WhatsApp";
    if (referrer.includes("google.com")) return "Google";
    
    return "Direct";
  } catch {
    return "Direct";
  }
};

export const trackProductView = async (productId: string) => {
  if (getViewedThisSession().has(productId)) return;
  markViewed(productId);
  const { data: { user } } = await supabase.auth.getUser();
  await (supabase as any).from("product_events").insert({
    product_id: productId,
    event_type: "view",
    user_id: user?.id ?? null,
    session_id: getSessionId(),
    source: getTrafficSource()
  });
};

export const trackProductPurchase = async (productId: string) => {
  const { data: { user } } = await supabase.auth.getUser();
  await (supabase as any).from("product_events").insert({
    product_id: productId,
    event_type: "purchase",
    user_id: user?.id ?? null,
    session_id: getSessionId(),
    source: getTrafficSource()
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

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export type AdAngle = "benefit" | "urgency" | "social_proof" | "before_after" | "storytelling" | "problem_solution";
export type AdFormat = "1:1" | "9:16" | "16:9" | "4:5";

export interface AdCopyData {
  primary_text: string;
  headlines: string[];
  descriptions: string[];
  cta: string;
}

export interface AdTargetingData {
  age_min: number;
  age_max: number;
  gender: "all" | "men" | "women";
  countries: string[];
  interests: string[];
  behaviors: string[];
  daily_budget: { level: "low" | "mid" | "high"; amount_xof: number; note: string };
  campaign_objective: string;
  rationale: string;
}

export interface AdCreative {
  id: string;
  vendor_id: string;
  product_id: string;
  angle: AdAngle;
  format: AdFormat;
  image_url: string | null;
  copy_data: AdCopyData;
  targeting_data: AdTargetingData;
  created_at: string;
}

export const ANGLE_OPTIONS: { value: AdAngle; label: string; emoji: string; color: string }[] = [
  { value: "benefit", label: "Bénéfice", emoji: "✨", color: "from-emerald-500 to-emerald-700" },
  { value: "urgency", label: "Urgence", emoji: "⏰", color: "from-red-500 to-orange-600" },
  { value: "social_proof", label: "Preuve sociale", emoji: "⭐", color: "from-amber-500 to-yellow-600" },
  { value: "before_after", label: "Avant / Après", emoji: "🔄", color: "from-blue-500 to-indigo-600" },
  { value: "storytelling", label: "Storytelling", emoji: "🎬", color: "from-purple-500 to-pink-600" },
  { value: "problem_solution", label: "Problème / Solution", emoji: "💡", color: "from-cyan-500 to-teal-600" },
];

export const FORMAT_OPTIONS: { value: AdFormat; label: string; subtitle: string }[] = [
  { value: "1:1", label: "Carré", subtitle: "Feed Facebook / Instagram (1080×1080)" },
  { value: "9:16", label: "Story / Reel", subtitle: "Plein écran vertical (1080×1920)" },
  { value: "4:5", label: "Portrait", subtitle: "Mobile feed optimisé (1080×1350)" },
  { value: "16:9", label: "Paysage", subtitle: "Desktop feed (1920×1080)" },
];

export const useAdCreatives = (vendorId: string | undefined) =>
  useQuery({
    queryKey: ["ad-creatives", vendorId],
    enabled: !!vendorId,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("ad_creatives")
        .select("*")
        .eq("vendor_id", vendorId!)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return (data || []) as unknown as AdCreative[];
    },
  });

export const useGenerateAdKit = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (params: {
      vendorId: string;
      userId: string;
      product: {
        id: string;
        title: string;
        description?: string | null;
        category?: string | null;
        price?: string;
        image_url?: string;
        key_features?: string[] | null;
      };
      angles: AdAngle[];
      formats: AdFormat[];
    }) => {
      const { vendorId, userId, product, angles, formats } = params;
      const results: AdCreative[] = [];

      for (const angle of angles) {
        // 1. copy
        const { data: copyData, error: copyErr } = await supabase.functions.invoke("generate-ad-copy", {
          body: {
            productTitle: product.title,
            productDescription: product.description,
            productCategory: product.category,
            productPrice: product.price,
            productFeatures: product.key_features,
            angle,
          },
        });
        if (copyErr) throw new Error(copyErr.message);
        if ((copyData as any)?.error) throw new Error((copyData as any).error);

        // 2. targeting (1 per angle)
        const { data: targetingData, error: targErr } = await supabase.functions.invoke("generate-ad-targeting", {
          body: {
            productTitle: product.title,
            productDescription: product.description,
            productCategory: product.category,
            productPrice: product.price,
          },
        });
        if (targErr) throw new Error(targErr.message);
        if ((targetingData as any)?.error) throw new Error((targetingData as any).error);

        const headline = (copyData as AdCopyData).headlines?.[0] ?? product.title;
        const cta = (copyData as AdCopyData).cta;

        // 3. one image per format for this angle
        for (const format of formats) {
          const { data: imgData, error: imgErr } = await supabase.functions.invoke("generate-ad-creative", {
            body: {
              productTitle: product.title,
              productDescription: product.description,
              productCategory: product.category,
              productImageUrl: product.image_url,
              headline,
              cta,
              angle,
              format,
              userId,
            },
          });
          if (imgErr) throw new Error(imgErr.message);
          if ((imgData as any)?.error) throw new Error((imgData as any).error);

          // persist
          const { data: inserted, error: insErr } = await supabase
            .from("ad_creatives")
            .insert({
              vendor_id: vendorId,
              product_id: product.id,
              angle,
              format,
              image_url: (imgData as any).url,
              copy_data: copyData as any,
              targeting_data: targetingData as any,
            })
            .select()
            .single();
          if (insErr) throw insErr;
          results.push(inserted as unknown as AdCreative);
        }
      }
      return results;
    },
    onSuccess: (_data, vars) => {
      queryClient.invalidateQueries({ queryKey: ["ad-creatives", vars.vendorId] });
    },
  });
};

export const useDeleteAdCreative = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("ad_creatives").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["ad-creatives"] });
    },
  });
};

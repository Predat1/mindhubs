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

// ---- shared helpers ----
const fetchProduct = async (productId: string) => {
  const { data, error } = await supabase.from("products").select("*").eq("id", productId).maybeSingle();
  if (error) throw error;
  if (!data) throw new Error("Produit introuvable");
  return data as any;
};

const generateCopy = async (product: any, angle: AdAngle) => {
  const { data, error } = await supabase.functions.invoke("generate-ad-copy", {
    body: {
      productTitle: product.title,
      productDescription: product.description,
      productCategory: product.category,
      productPrice: product.price,
      productFeatures: product.key_features,
      angle,
    },
  });
  if (error) throw new Error(error.message);
  if ((data as any)?.error) throw new Error((data as any).error);
  return data as AdCopyData;
};

const generateTargeting = async (product: any) => {
  const { data, error } = await supabase.functions.invoke("generate-ad-targeting", {
    body: {
      productTitle: product.title,
      productDescription: product.description,
      productCategory: product.category,
      productPrice: product.price,
    },
  });
  if (error) throw new Error(error.message);
  if ((data as any)?.error) throw new Error((data as any).error);
  return data as AdTargetingData;
};

const generateImage = async (params: {
  product: any;
  copy: AdCopyData;
  angle: AdAngle;
  format: AdFormat;
  userId: string;
}) => {
  const { product, copy, angle, format, userId } = params;
  const headline = copy.headlines?.[0] ?? product.title;
  const { data, error } = await supabase.functions.invoke("generate-ad-creative", {
    body: {
      productTitle: product.title,
      productDescription: product.description,
      productCategory: product.category,
      productImageUrl: product.image_url,
      headline,
      cta: copy.cta,
      angle,
      format,
      userId,
    },
  });
  if (error) throw new Error(error.message);
  if ((data as any)?.error) throw new Error((data as any).error);
  return (data as any).url as string;
};

// ---- main full-kit generation ----
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
        const copy = await generateCopy(product, angle);
        const targeting = await generateTargeting(product);

        for (const format of formats) {
          const image_url = await generateImage({ product, copy, angle, format, userId });

          const { data: inserted, error: insErr } = await supabase
            .from("ad_creatives")
            .insert({
              vendor_id: vendorId,
              product_id: product.id,
              angle,
              format,
              image_url,
              copy_data: copy as any,
              targeting_data: targeting as any,
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

// ---- granular regenerations (operate on an existing creative row) ----

/** Regenerate ONLY the image for an existing creative (keeps copy + targeting) */
export const useRegenerateImage = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (params: { creative: AdCreative; userId: string }) => {
      const { creative, userId } = params;
      const product = await fetchProduct(creative.product_id);
      const image_url = await generateImage({
        product,
        copy: creative.copy_data,
        angle: creative.angle,
        format: creative.format,
        userId,
      });
      const { data, error } = await supabase
        .from("ad_creatives")
        .update({ image_url })
        .eq("id", creative.id)
        .select()
        .single();
      if (error) throw error;
      return data as unknown as AdCreative;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["ad-creatives"] });
    },
  });
};

/** Regenerate ONLY the copywriting for an existing creative (keeps image + targeting) */
export const useRegenerateCopy = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (params: { creative: AdCreative }) => {
      const { creative } = params;
      const product = await fetchProduct(creative.product_id);
      const copy = await generateCopy(product, creative.angle);
      const { data, error } = await supabase
        .from("ad_creatives")
        .update({ copy_data: copy as any })
        .eq("id", creative.id)
        .select()
        .single();
      if (error) throw error;
      return data as unknown as AdCreative;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["ad-creatives"] });
    },
  });
};

/** Regenerate ONLY the targeting for an existing creative */
export const useRegenerateTargeting = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (params: { creative: AdCreative }) => {
      const { creative } = params;
      const product = await fetchProduct(creative.product_id);
      const targeting = await generateTargeting(product);
      const { data, error } = await supabase
        .from("ad_creatives")
        .update({ targeting_data: targeting as any })
        .eq("id", creative.id)
        .select()
        .single();
      if (error) throw error;
      return data as unknown as AdCreative;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["ad-creatives"] });
    },
  });
};

/** Regenerate a full new variant for ONE angle in ONE format (creates a new row) */
export const useRegenerateVariant = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (params: {
      vendorId: string;
      userId: string;
      productId: string;
      angle: AdAngle;
      format: AdFormat;
    }) => {
      const { vendorId, userId, productId, angle, format } = params;
      const product = await fetchProduct(productId);
      const copy = await generateCopy(product, angle);
      const targeting = await generateTargeting(product);
      const image_url = await generateImage({ product, copy, angle, format, userId });
      const { data, error } = await supabase
        .from("ad_creatives")
        .insert({
          vendor_id: vendorId,
          product_id: productId,
          angle,
          format,
          image_url,
          copy_data: copy as any,
          targeting_data: targeting as any,
        })
        .select()
        .single();
      if (error) throw error;
      return data as unknown as AdCreative;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["ad-creatives"] });
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

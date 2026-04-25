import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.4";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const STYLE_PRESETS: Record<string, string> = {
  classic: "Deep brown leather hardcover with embossed gold foil typography, premium luxury aesthetic.",
  modern: "Sleek matte black cover with vibrant neon gradient accents (purple to cyan) and bold sans-serif white title.",
  gold: "Pure midnight black background, glowing 24K gold metallic title, art-deco gold borders, ultra-premium feel.",
  minimal: "Clean off-white cover with single-color thin typography, ultra-minimal Scandinavian aesthetic, no ornaments.",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { title, category, description, userId, style = "classic", editImageUrl, editPrompt, count = 1 } = await req.json();
    if (!userId) {
      return new Response(JSON.stringify({ error: "userId required" }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY missing");

    const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
    const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

    // Build messages depending on mode
    // STRICT MOCKUP SPECIFICATION — identical dimensions across all generations
    const MOCKUP_SPEC = `
STRICT MOCKUP DIMENSIONS (MUST be identical every time):
- 3D software box mockup (rectangular product box, NOT a book), proportions 3:4 (width:height ratio of the front face)
- Box thickness/depth: approximately 25% of the front face width (visible left side panel)
- Camera angle: exact 3/4 perspective view, ~25° rotation to the right, slight 5° tilt down
- Box positioned dead center, occupying ~75% of the canvas height
- Front face fully visible on the right, left side panel (spine) fully visible with vertical title text reading bottom-to-top
- Pure white background (#FFFFFF), soft realistic contact shadow directly underneath the box
- Photorealistic studio lighting from upper-left, subtle reflections
- Square canvas 1:1 (1024x1024), centered composition
- NO people outside the cover artwork, NO watermarks, NO text outside the box surface, NO floor/wall/props`;

    let messages: Array<{ role: string; content: string | Array<Record<string, unknown>> }>;
    if (editImageUrl && editPrompt) {
      messages = [{
        role: "user",
        content: [
          { type: "text", text: `Edit this product box mockup. Instruction: ${editPrompt}.

Preserve EXACTLY the same box dimensions, 3:4 front-face proportions, 25% depth, 3/4 perspective angle, centered composition, pure white background and shadow placement as the original.${MOCKUP_SPEC}` },
          { type: "image_url", image_url: { url: editImageUrl } },
        ],
      }];
    } else {
      if (!title) throw new Error("title required");
      const stylePrompt = STYLE_PRESETS[style] || STYLE_PRESETS.classic;
      const prompt = `Ultra-premium, highly creative 3D product BOX mockup for a digital product titled "${title}".
Category: ${category || "digital product"}.
${description ? `Theme & visual hints: ${description.slice(0, 250)}` : ""}

Cover design style: ${stylePrompt}

Cover artwork requirements (highly creative & stylish):
- Bold impactful typography: large primary title at top, accent-colored secondary line, small subtitle band below
- Rich thematic illustration or photographic scene relevant to the category, integrated cinematically into the lower 60% of the front face
- Elegant decorative arc/curve element separating title block from imagery
- Premium color palette with strong contrast, magazine-cover quality
- Visible spine on left with vertical uppercase title in accent color
${MOCKUP_SPEC}`;
      messages = [{ role: "user", content: prompt }];
    }

    const generateOne = async (): Promise<string> => {
      const resp = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${LOVABLE_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "google/gemini-2.0-flash-exp", // Correcting to available experimental/preview model for images
          messages,
          modalities: ["image", "text"],
        }),
      });

      if (!resp.ok) {
        const t = await resp.text();
        console.error("AI image error:", resp.status, t);
        if (resp.status === 429) throw new Error("RATE_LIMIT");
        if (resp.status === 402) throw new Error("CREDITS_EXHAUSTED");
        throw new Error("AI gateway error");
      }
      const data = await resp.json();
      const dataUrl: string | undefined = data.choices?.[0]?.message?.images?.[0]?.image_url?.url;
      if (!dataUrl) throw new Error("No image returned");

      const match = dataUrl.match(/^data:(image\/\w+);base64,(.+)$/);
      if (!match) throw new Error("Invalid image data");
      const mime = match[1];
      const ext = mime.split("/")[1] || "png";
      const bytes = Uint8Array.from(atob(match[2]), (c) => c.charCodeAt(0));

      const path = `${userId}/ai-${Date.now()}-${Math.random().toString(36).slice(2, 6)}.${ext}`;
      const { error: upErr } = await supabase.storage
        .from("product-images")
        .upload(path, bytes, { contentType: mime, upsert: false });
      if (upErr) throw upErr;
      const { data: pub } = supabase.storage.from("product-images").getPublicUrl(path);
      return pub.publicUrl;
    };

    const wantedCount = Math.min(Math.max(parseInt(String(count), 10) || 1, 1), 4);
    try {
      const urls = await Promise.all(Array.from({ length: wantedCount }, () => generateOne()));
      return new Response(JSON.stringify({ urls }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    } catch (e: unknown) {
      const err = e as Error;
      if (err.message === "RATE_LIMIT") {
        return new Response(JSON.stringify({ error: "Trop de requêtes, réessayez dans un instant." }), {
          status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (err.message === "CREDITS_EXHAUSTED") {
        return new Response(JSON.stringify({ error: "Crédits IA épuisés. Rechargez votre espace." }), {
          status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      throw e;
    }
  } catch (e) {
    console.error("generate-product-image error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown" }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});

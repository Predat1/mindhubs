import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.4";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const FORMAT_SPECS: Record<string, { ratio: string; canvas: string; layout: string }> = {
  "1:1": { ratio: "1:1 square", canvas: "1024x1024", layout: "Facebook feed square ad - product visual centered, headline overlay top or bottom band" },
  "9:16": { ratio: "9:16 vertical", canvas: "1024x1820", layout: "Story / Reel vertical full-screen ad - product hero centered, large headline top, CTA bottom" },
  "16:9": { ratio: "16:9 landscape", canvas: "1820x1024", layout: "Landscape feed ad - product on the right, headline + bullet benefits on the left" },
  "4:5": { ratio: "4:5 portrait", canvas: "1024x1280", layout: "Portrait feed ad (mobile optimized) - product centered, bold headline at top, CTA at bottom" },
};

const ANGLE_DIRECTIONS: Record<string, string> = {
  benefit: "Highlight the main TRANSFORMATION/BENEFIT the customer gets. Aspirational tone, bright golden glow, success vibes.",
  urgency: "Create URGENCY (limited time, scarcity). Bold red/gold accents, countdown vibe, 'Aujourd'hui seulement' style stamp.",
  social_proof: "Show SOCIAL PROOF — visualize 5-star ratings, testimonial badges, '+1000 acheteurs satisfaits' style overlay.",
  before_after: "Split BEFORE/AFTER composition - dim grey 'before' on left, bright golden 'after' on right with arrow.",
  storytelling: "Cinematic STORYTELLING scene - person experiencing the result of the product, emotional and immersive.",
  problem_solution: "PROBLEM/SOLUTION split - top half shows pain point (frustration), bottom half shows the product as the relief.",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { productTitle, productDescription, productCategory, productImageUrl, headline, cta, angle, format, userId } = await req.json();

    if (!userId || !productTitle || !angle || !format) {
      return new Response(JSON.stringify({ error: "userId, productTitle, angle and format required" }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY missing");

    const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
    const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

    const fmt = FORMAT_SPECS[format] || FORMAT_SPECS["1:1"];
    const angleDir = ANGLE_DIRECTIONS[angle] || ANGLE_DIRECTIONS.benefit;

    const AD_SPEC = `
STRICT FACEBOOK AD CREATIVE SPECIFICATION:
- Format: ${fmt.ratio} (${fmt.canvas})
- Layout: ${fmt.layout}
- Brand palette: deep matte black background (#0A0A0A) with bright 24K gold accents (#D4AF37, #FFD700)
- Bold sans-serif typography, ULTRA legible even on mobile
- Headline overlay text: "${(headline || productTitle).slice(0, 60)}" — large, contrast-perfect
- CTA button visible: "${cta || "Acheter maintenant"}" in gold pill button
- Marketing angle direction: ${angleDir}
- Product visual: integrate the actual product (3D box mockup style) prominently
- Conversion-optimized composition: scroll-stopping, premium, high-contrast
- NO Facebook logo, NO watermark, NO blurry text, NO Lorem ipsum
- All text must be in FRENCH and perfectly spelled`;

    const messages: Array<{ role: string; content: string | Array<Record<string, unknown>> }> = productImageUrl
      ? [{
          role: "user",
          content: [
            { type: "text", text: `Create a Facebook ad creative using this product image as the central product visual.${AD_SPEC}` },
            { type: "image_url", image_url: { url: productImageUrl } },
          ],
        }]
      : [{
          role: "user",
          content: `Create a Facebook ad creative for a digital product titled "${productTitle}" (category: ${productCategory || "digital"}). Description: ${(productDescription || "").slice(0, 250)}.${AD_SPEC}`,
        }];

    const resp = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: { Authorization: `Bearer ${LOVABLE_API_KEY}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash-image",
        messages,
        modalities: ["image", "text"],
      }),
    });

    if (!resp.ok) {
      const t = await resp.text();
      console.error("AI ad creative error:", resp.status, t);
      if (resp.status === 429) {
        return new Response(JSON.stringify({ error: "Trop de requêtes, réessayez dans un instant." }), {
          status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (resp.status === 402) {
        return new Response(JSON.stringify({ error: "Crédits IA épuisés. Rechargez votre espace." }), {
          status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
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

    const path = `${userId}/ads/${Date.now()}-${angle}-${format.replace(":", "x")}-${Math.random().toString(36).slice(2, 6)}.${ext}`;
    const { error: upErr } = await supabase.storage.from("product-images").upload(path, bytes, { contentType: mime, upsert: false });
    if (upErr) throw upErr;
    const { data: pub } = supabase.storage.from("product-images").getPublicUrl(path);

    return new Response(JSON.stringify({ url: pub.publicUrl }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("generate-ad-creative error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown" }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});

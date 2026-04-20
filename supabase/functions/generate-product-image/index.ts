import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.4";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { title, category, description, userId } = await req.json();
    if (!title || !userId) {
      return new Response(JSON.stringify({ error: "title and userId required" }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY missing");

    const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
    const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

    const prompt = `Professional 3D product mockup of a premium book/box cover titled "${title}".
Category: ${category || "digital product"}.
${description ? `Theme hints: ${description.slice(0, 200)}` : ""}

Style requirements:
- 3D rendered hardcover book or product box, standing upright at slight 3/4 angle
- Rich gradient cover (deep brown, gold, premium luxury feel) with golden accents
- Bold modern typography centered on cover with the title prominently displayed
- A subtitle band and a bottom band for additional text
- Visible spine on the left side with vertical title text
- Clean pure white background, soft realistic shadow underneath
- Photorealistic lighting with golden glow accents
- Square format 1:1, centered composition, high resolution
- No watermarks, no extra text outside the box, no people unless thematically essential`;

    const resp = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash-image",
        messages: [{ role: "user", content: prompt }],
        modalities: ["image", "text"],
      }),
    });

    if (!resp.ok) {
      const t = await resp.text();
      console.error("AI image error:", resp.status, t);
      if (resp.status === 429)
        return new Response(JSON.stringify({ error: "Trop de requêtes, réessayez dans un instant." }), {
          status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      if (resp.status === 402)
        return new Response(JSON.stringify({ error: "Crédits IA épuisés. Rechargez votre espace." }), {
          status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      throw new Error("AI gateway error");
    }

    const data = await resp.json();
    const dataUrl: string | undefined = data.choices?.[0]?.message?.images?.[0]?.image_url?.url;
    if (!dataUrl) throw new Error("No image returned");

    // Convert data URL to bytes & upload to storage
    const match = dataUrl.match(/^data:(image\/\w+);base64,(.+)$/);
    if (!match) throw new Error("Invalid image data");
    const mime = match[1];
    const ext = mime.split("/")[1] || "png";
    const bytes = Uint8Array.from(atob(match[2]), (c) => c.charCodeAt(0));

    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);
    const path = `${userId}/ai-${Date.now()}.${ext}`;
    const { error: upErr } = await supabase.storage
      .from("product-images")
      .upload(path, bytes, { contentType: mime, upsert: false });
    if (upErr) throw upErr;

    const { data: pub } = supabase.storage.from("product-images").getPublicUrl(path);
    return new Response(JSON.stringify({ url: pub.publicUrl }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("generate-product-image error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown" }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});

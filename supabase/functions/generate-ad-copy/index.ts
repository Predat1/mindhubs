import "https://deno.land/x/xhr@0.1.0/mod.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const ANGLE_LABEL: Record<string, string> = {
  benefit: "Bénéfice / Transformation",
  urgency: "Urgence / Rareté",
  social_proof: "Preuve sociale",
  before_after: "Avant / Après",
  storytelling: "Storytelling émotionnel",
  problem_solution: "Problème / Solution",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { productTitle, productDescription, productCategory, productPrice, productFeatures, angle } = await req.json();
    if (!productTitle || !angle) {
      return new Response(JSON.stringify({ error: "productTitle and angle required" }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const OPENROUTER_API_KEY = Deno.env.get("OPENROUTER_API_KEY");
    if (!OPENROUTER_API_KEY) throw new Error("OPENROUTER_API_KEY missing");

    const angleLabel = ANGLE_LABEL[angle] || angle;
    const features = Array.isArray(productFeatures) ? productFeatures.filter(Boolean).slice(0, 8).join(" • ") : "";

    const systemPrompt = `Tu es un expert copywriter Facebook Ads spécialisé dans la conversion sur les marchés africains francophones. Tu écris en français clair, direct, scroll-stopper, sans jargon. Respecte STRICTEMENT les limites de caractères Facebook Ads.`;

    const userPrompt = `Génère un kit de copywriting Facebook Ads pour ce produit digital, optimisé conversion sous l'angle marketing : "${angleLabel}".
PRODUIT :
- Titre : ${productTitle}
- Catégorie : ${productCategory || "Produit digital"}
- Prix : ${productPrice || "n/a"}
- Description : ${(productDescription || "").slice(0, 600)}
- Caractéristiques clés : ${features || "n/a"}

CONTRAINTES STRICTES :
- Primary text : ≤ 125 caractères, hook puissant qui arrête le scroll, emoji autorisé
- Headlines : exactement 5 propositions, chacune ≤ 40 caractères
- Descriptions : exactement 3 propositions, chacune ≤ 30 caractères
- CTA : 1 valeur parmi : "SHOP_NOW", "LEARN_MORE", "SIGN_UP", "GET_OFFER", "DOWNLOAD", "ORDER_NOW"
- Tout doit refléter l'angle "${angleLabel}".`;

    // WHY: Basculement vers OpenRouter pour une unification de l'infrastructure IA.
    const resp = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: { 
        "Authorization": `Bearer ${OPENROUTER_API_KEY}`, 
        "Content-Type": "application/json",
        "HTTP-Referer": "https://mindhubs.com",
        "X-Title": "MindHubs Ads Studio"
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt },
        ],
        response_format: { type: "json_object" }, // Utilisation du mode JSON natif d'OpenRouter/Gemini
        tools: [{
          type: "function",
          function: {
            name: "submit_ad_copy",
            description: "Submit the structured Facebook Ads copy kit.",
            parameters: {
              type: "object",
              properties: {
                primary_text: { type: "string", description: "≤125 chars, scroll-stopper" },
                headlines: { type: "array", items: { type: "string" }, minItems: 5, maxItems: 5 },
                descriptions: { type: "array", items: { type: "string" }, minItems: 3, maxItems: 3 },
                cta: { type: "string", enum: ["SHOP_NOW", "LEARN_MORE", "SIGN_UP", "GET_OFFER", "DOWNLOAD", "ORDER_NOW"] },
              },
              required: ["primary_text", "headlines", "descriptions", "cta"],
              additionalProperties: false,
            },
          },
        }],
        tool_choice: { type: "function", function: { name: "submit_ad_copy" } },
      }),
    });

    if (!resp.ok) {
      const t = await resp.text();
      console.error("ad-copy error:", resp.status, t);
      throw new Error(`AI gateway error: ${resp.status}`);
    }

    const data = await resp.json();
    const toolCall = data.choices?.[0]?.message?.tool_calls?.[0];
    if (!toolCall) throw new Error("No tool call returned");
    const parsed = JSON.parse(toolCall.function.arguments);

    return new Response(JSON.stringify(parsed), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("generate-ad-copy error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown" }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});

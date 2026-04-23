import "https://deno.land/x/xhr@0.1.0/mod.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { productTitle, productDescription, productCategory, productPrice } = await req.json();
    if (!productTitle) {
      return new Response(JSON.stringify({ error: "productTitle required" }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY missing");

    const systemPrompt = `Tu es un expert Facebook Ads Manager pour le marché africain francophone. Tu recommandes des ciblages précis et réalistes basés sur les options réelles de Facebook Ads. Toujours en français.`;

    const userPrompt = `Analyse ce produit digital et propose un ciblage Facebook Ads optimisé conversion pour les marchés africains francophones.

PRODUIT :
- Titre : ${productTitle}
- Catégorie : ${productCategory || "Produit digital"}
- Prix : ${productPrice || "n/a"}
- Description : ${(productDescription || "").slice(0, 600)}

Recommande un ciblage PRÉCIS basé sur les options Facebook Ads réelles : tranche d'âge, genre, pays africains francophones les plus pertinents pour ce produit (parmi : Côte d'Ivoire, Sénégal, Cameroun, Bénin, Togo, Mali, Burkina Faso, Gabon, Congo, RDC, Niger, Guinée), centres d'intérêts Facebook réels (5 à 8), comportements (acheteurs en ligne, utilisateurs mobile, voyageurs internationaux, etc.), budget journalier suggéré (low/mid/high avec montant XOF), objectif de campagne FB recommandé.`;

    const resp = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: { Authorization: `Bearer ${LOVABLE_API_KEY}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt },
        ],
        tools: [{
          type: "function",
          function: {
            name: "submit_targeting",
            description: "Submit structured Facebook Ads targeting recommendation.",
            parameters: {
              type: "object",
              properties: {
                age_min: { type: "integer", minimum: 13, maximum: 65 },
                age_max: { type: "integer", minimum: 13, maximum: 65 },
                gender: { type: "string", enum: ["all", "men", "women"] },
                countries: { type: "array", items: { type: "string" }, minItems: 1, maxItems: 8 },
                interests: { type: "array", items: { type: "string" }, minItems: 5, maxItems: 8 },
                behaviors: { type: "array", items: { type: "string" }, minItems: 2, maxItems: 6 },
                daily_budget: {
                  type: "object",
                  properties: {
                    level: { type: "string", enum: ["low", "mid", "high"] },
                    amount_xof: { type: "integer", minimum: 500 },
                    note: { type: "string" },
                  },
                  required: ["level", "amount_xof", "note"],
                  additionalProperties: false,
                },
                campaign_objective: { type: "string", enum: ["CONVERSIONS", "TRAFFIC", "ENGAGEMENT", "LEAD_GENERATION", "MESSAGES", "REACH"] },
                rationale: { type: "string", description: "1-2 phrases courtes expliquant pourquoi ce ciblage." },
              },
              required: ["age_min", "age_max", "gender", "countries", "interests", "behaviors", "daily_budget", "campaign_objective", "rationale"],
              additionalProperties: false,
            },
          },
        }],
        tool_choice: { type: "function", function: { name: "submit_targeting" } },
      }),
    });

    if (!resp.ok) {
      const t = await resp.text();
      console.error("ad-targeting error:", resp.status, t);
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
    const toolCall = data.choices?.[0]?.message?.tool_calls?.[0];
    if (!toolCall) throw new Error("No tool call returned");
    const parsed = JSON.parse(toolCall.function.arguments);

    return new Response(JSON.stringify(parsed), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("generate-ad-targeting error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown" }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});

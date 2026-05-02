import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

// ─── 3 Principaux Changements ───
// 1. Migration vers la gateway unifiée OpenRouter pour un billing centralisé.
// 2. Mise à jour vers le modèle de pointe anthropic/claude-sonnet-4-5 (2025).
// 3. Adoption du standard Tool Calling universel pour une extraction JSON garantie.

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { niche } = await req.json();
    if (!niche) throw new Error("niche required");

    const apiKey = Deno.env.get("OPENROUTER_API_KEY");
    if (!apiKey) return new Response(JSON.stringify({ error: "Missing API Key" }), { status: 503, headers: corsHeaders });

    // WHY: Utilisation du pattern Tool Calling standard OpenAI/OpenRouter pour une structure JSON prédictible
    const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${apiKey}`,
        "HTTP-Referer": "https://mindhubs.com",
        "X-Title": "MindHubs Niche Analyst",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "anthropic/claude-sonnet-4-5",
        messages: [
          { role: "system", content: "Tu es un expert en marketing digital et Facebook Ads sur les marchés africains francophones. Tu analyses les niches business et recommandes les meilleurs pays pour lancer des produits digitaux." },
          { role: "user", content: `Analyse la niche "${niche}" et recommande les 3 meilleurs pays africains francophones pour lancer un produit digital dans cette niche via Facebook Ads.\n\nPays possibles : Sénégal (SN 🇸🇳), Côte d'Ivoire (CI 🇨🇮), Cameroun (CM 🇨🇲), Maroc (MA 🇲🇦), Togo (TG 🇹🇬), Bénin (BJ 🇧🇯), Gabon (GA 🇬🇦), RDC (CD 🇨🇩), Guinée (GN 🇬🇳), Burkina Faso (BF 🇧🇫).` }
        ],
        tools: [{
          type: "function",
          function: {
            name: "submit_countries",
            description: "Submit the top 3 recommended countries for this niche.",
            parameters: {
              type: "object",
              properties: {
                countries: {
                  type: "array",
                  items: {
                    type: "object",
                    properties: {
                      code: { type: "string" },
                      name: { type: "string" },
                      flag: { type: "string" },
                      adsPotential: { type: "string", enum: ["high", "medium", "low"] },
                      avgCpc: { type: "string" },
                      paymentEase: { type: "string" },
                      nicheRelevance: { type: "string" },
                    },
                    required: ["code", "name", "flag", "adsPotential", "avgCpc", "paymentEase", "nicheRelevance"],
                  },
                  minItems: 3,
                  maxItems: 3,
                },
              },
              required: ["countries"],
            },
          },
        }],
        tool_choice: { type: "function", function: { name: "submit_countries" } },
      }),
    });

    if (!response.ok) throw new Error(`OpenRouter Error: ${response.status}`);

    const data = await response.json();
    const toolCall = data.choices[0].message.tool_calls?.[0];
    
    if (!toolCall) throw new Error("No tool call in AI response");

    return new Response(toolCall.function.arguments, {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });

  } catch (e) {
    console.error("factory-analyze-niche error:", e);
    return new Response(JSON.stringify({ error: e.message }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});

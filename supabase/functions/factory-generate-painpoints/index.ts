import "https://deno.land/x/xhr@0.1.0/mod.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { niche, countryCode, countryName } = await req.json();
    if (!niche || !countryName) {
      return new Response(JSON.stringify({ error: "niche and countryName required" }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const OPENROUTER_API_KEY = Deno.env.get("OPENROUTER_API_KEY");
    if (!OPENROUTER_API_KEY) throw new Error("OPENROUTER_API_KEY missing");

    const resp = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${OPENROUTER_API_KEY}`,
        "Content-Type": "application/json",
        "HTTP-Referer": "https://mindhubs.com",
        "X-Title": "MindHubs Pain Points Analyzer",
      },
      body: JSON.stringify({
        model: "anthropic/claude-sonnet-4-5",
        messages: [
          { role: "system", content: `Tu es un expert en analyse de marché digital et Facebook Ads pour l'Afrique francophone. Tu identifies les problèmes les plus urgents et vendeurs dans une niche donnée pour un pays spécifique. Chaque problème doit être un vrai pain point que les entrepreneurs de ce pays rencontrent.` },
          { role: "user", content: `Analyse la niche "${niche}" au ${countryName} (${countryCode}) et identifie les 3 problèmes les plus urgents et vendeurs que les entrepreneurs/clients rencontrent dans cette niche.\n\nPour chaque problème :\n- Donne un titre court et percutant\n- Un score d'urgence de 70 à 99 (basé sur la fréquence et l'intensité du problème)\n- Une description de 1-2 phrases expliquant l'impact\n- Un conseil stratégique FB Ads spécifique pour cibler ce problème\n\nOrdonne par urgence décroissante.` }
        ],
        tools: [{
          type: "function",
          function: {
            name: "submit_painpoints",
            description: "Submit the 3 most urgent pain points for this niche in this country.",
            parameters: {
              type: "object",
              properties: {
                painPoints: {
                  type: "array",
                  items: {
                    type: "object",
                    properties: {
                      title: { type: "string", description: "Titre court et percutant du problème" },
                      urgency: { type: "integer", minimum: 70, maximum: 99 },
                      description: { type: "string", description: "1-2 phrases sur l'impact" },
                      fbAdsInsight: { type: "string", description: "Conseil stratégique FB Ads spécifique" },
                    },
                    required: ["title", "urgency", "description", "fbAdsInsight"],
                  },
                  minItems: 3,
                  maxItems: 3,
                },
              },
              required: ["painPoints"],
            },
          },
        }],
        tool_choice: { type: "function", function: { name: "submit_painpoints" } },
      }),
    });

    if (!resp.ok) {
      const t = await resp.text();
      console.error("OpenRouter painpoints error:", resp.status, t);
      if (resp.status === 429) {
        return new Response(JSON.stringify({ error: "Trop de requêtes, réessayez dans un instant." }), {
          status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      throw new Error(`AI gateway error: ${resp.status}`);
    }

    const data = await resp.json();
    const toolCall = data.choices?.[0]?.message?.tool_calls?.[0];
    if (!toolCall) {
      console.error("No tool call found for painpoints. Response:", JSON.stringify(data));
      throw new Error("No tool call in response");
    }

    const parsed = JSON.parse(toolCall.function.arguments);
    return new Response(JSON.stringify(parsed), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("factory-generate-painpoints error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown" }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});

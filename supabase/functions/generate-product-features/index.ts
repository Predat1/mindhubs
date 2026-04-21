import "https://deno.land/x/xhr@0.1.0/mod.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { title, description, category } = await req.json();
    if (!title) {
      return new Response(JSON.stringify({ error: "title required" }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY missing");

    const resp = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [
          {
            role: "system",
            content: "Tu es un copywriter expert en produits digitaux pour le marché africain francophone. Tu génères des bénéfices clés courts, concrets et orientés conversion.",
          },
          {
            role: "user",
            content: `Génère 5 caractéristiques clés (key features) pour ce produit :
Titre : "${title}"
Catégorie : "${category || "Formations"}"
${description ? `Description : "${description.slice(0, 500)}"` : ""}

Règles :
- Chaque feature doit faire entre 3 et 8 mots
- Mettre l'accent sur le bénéfice client, pas la fonctionnalité
- Utiliser des verbes d'action ou des résultats concrets
- Pas d'emoji, pas de prix, pas de bullet points`,
          },
        ],
        tools: [{
          type: "function",
          function: {
            name: "set_features",
            description: "Return product key features",
            parameters: {
              type: "object",
              properties: {
                features: {
                  type: "array",
                  items: { type: "string" },
                  minItems: 4,
                  maxItems: 6,
                },
              },
              required: ["features"],
              additionalProperties: false,
            },
          },
        }],
        tool_choice: { type: "function", function: { name: "set_features" } },
      }),
    });

    if (!resp.ok) {
      const t = await resp.text();
      console.error("AI features error:", resp.status, t);
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
    const args = data.choices?.[0]?.message?.tool_calls?.[0]?.function?.arguments;
    const parsed = args ? JSON.parse(args) : { features: [] };

    return new Response(JSON.stringify({ features: parsed.features || [] }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("generate-product-features error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown" }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});

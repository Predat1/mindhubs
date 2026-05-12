import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

// ─── 3 Principaux Changements ───
// 1. Unification sur OpenRouter pour centraliser les coûts et le monitoring.
// 2. Passage au modèle Claude Sonnet 4.5 pour une rédaction de contenu premium et nuancée.
// 3. Implémentation du Tool Calling standardisé pour garantir l'intégrité du Kit Business généré.

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { niche, countryName, painPointTitle, painPointDescription, productType, chapterTitles } = await req.json();
    if (!niche || !painPointTitle) throw new Error("Missing required parameters");

    const apiKey = Deno.env.get("OPENROUTER_API_KEY");
    if (!apiKey) return new Response(JSON.stringify({ error: "Missing API Key" }), { status: 503, headers: corsHeaders });

    const chaptersSection = Array.isArray(chapterTitles) && chapterTitles.length > 0
      ? `\nChapitres demandés :\n${chapterTitles.map((t: string, i: number) => `${i + 1}. ${t}`).join("\n")}`
      : "";

    // WHY: Basculement vers OpenRouter avec Claude 4.5 pour bénéficier des dernières avancées en raisonnement marketing
    const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${apiKey}`,
        "HTTP-Referer": "https://mindhubs.com",
        "X-Title": "MindHubs Kit Factory",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "anthropic/claude-opus-4",
        messages: [
          { role: "system", content: "Tu es un expert en création de produits digitaux et en copywriting Facebook Ads pour le marché africain francophone. Tu crées du contenu premium, actionnable et orienté résultats. Chaque chapitre doit contenir du contenu riche (150+ mots). Les textes publicitaires doivent être des scroll-stoppers optimisés conversion." },
          { role: "user", content: `Crée un kit business complet pour la niche "${niche}" au ${countryName || "marché africain"}.
            PROBLÈME CIBLÉ : "${painPointTitle}"
            ${painPointDescription ? `Description : ${painPointDescription}` : ""}
            TYPE DE PRODUIT : ${productType || "ebook"}
            ${chaptersSection}` 
          }
        ],
        tools: [{
          type: "function",
          function: {
            name: "submit_kit",
            description: "Submit the complete business kit with chapters, ads, and targeting.",
            parameters: {
              type: "object",
              properties: {
                chapters: {
                  type: "array",
                  items: {
                    type: "object",
                    properties: {
                      title: { type: "string" },
                      content: { type: "string", description: "Contenu riche du chapitre, 150+ mots, avec markdown léger" },
                    },
                    required: ["title", "content"],
                  },
                },
                adsKit: {
                  type: "array",
                  items: {
                    type: "object",
                    properties: {
                      type: { type: "string" },
                      hook: { type: "string" },
                      body: { type: "string" },
                      cta: { type: "string" },
                    },
                    required: ["type", "hook", "body", "cta"],
                  },
                },
                targeting: {
                  type: "object",
                  properties: {
                    country: { type: "string" },
                    ageRange: { type: "string" },
                    interests: { type: "string" },
                    dailyBudget: { type: "string" },
                  },
                  required: ["country", "ageRange", "interests", "dailyBudget"],
                },
              },
              required: ["chapters", "adsKit", "targeting"],
            },
          },
        }],
        tool_choice: { type: "function", function: { name: "submit_kit" } },
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
    console.error("factory-generate-kit error:", e);
    return new Response(JSON.stringify({ error: e.message }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});

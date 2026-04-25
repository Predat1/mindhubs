import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const CLAUDE_MODEL = "claude-sonnet-4-20250514";

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(JSON.stringify({ error: "Unauthorized: Missing Authorization header" }), {
        status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_ANON_KEY") ?? "",
      { global: { headers: { Authorization: authHeader } } }
    );

    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return new Response(JSON.stringify({ error: "Unauthorized: Invalid token" }), {
        status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { niche, countryCode, countryName, painPointTitle, painPointDescription, productType, chapterTitles } = await req.json();
    if (!niche || !painPointTitle) {
      return new Response(JSON.stringify({ error: "niche and painPointTitle required" }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const ANTHROPIC_API_KEY = Deno.env.get("ANTHROPIC_API_KEY");
    if (!ANTHROPIC_API_KEY) throw new Error("ANTHROPIC_API_KEY missing");

    const chaptersSection = Array.isArray(chapterTitles) && chapterTitles.length > 0
      ? `\nChapitres à rédiger :\n${chapterTitles.map((t: string, i: number) => `${i + 1}. ${t}`).join("\n")}`
      : "";

    const resp = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "x-api-key": ANTHROPIC_API_KEY,
        "anthropic-version": "2023-06-01",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: CLAUDE_MODEL,
        max_tokens: 4096,
        system: `Tu es un expert en création de produits digitaux et en copywriting Facebook Ads pour le marché africain francophone. Tu crées du contenu premium, actionnable et orienté résultats. Chaque chapitre doit contenir du contenu riche, structuré et utile (minimum 150 mots par chapitre). Les textes publicitaires doivent être des scroll-stoppers optimisés conversion.`,
        messages: [{ role: "user", content: `Crée un kit business complet pour la niche "${niche}" au ${countryName || "marché africain"} (${countryCode || "AF"}).

PROBLÈME CIBLÉ : "${painPointTitle}"
${painPointDescription ? `Description : ${painPointDescription}` : ""}
TYPE DE PRODUIT : ${productType || "ebook"}
${chaptersSection}

GÉNÈRE :

1. CHAPITRES : ${chapterTitles?.length || 4} chapitres avec du contenu réel, structuré, actionnable (150+ mots chacun). Utilise des sous-titres, des listes, des exemples concrets adaptés au contexte africain.

2. KIT PUBLICITAIRE : 2 textes Facebook Ads avec des angles différents :
   - Type 1 : Story-Telling émotionnel
   - Type 2 : Bénéfice Direct
   Pour chaque pub : hook (accroche scroll-stopper), body (corps du texte), cta (appel à l'action)

3. CIBLAGE FB ADS : recommandation de ciblage précise pour ce produit` }],
        tools: [{
          name: "submit_kit",
          description: "Submit the complete business kit with chapters, ads, and targeting.",
          input_schema: {
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
                minItems: 2,
                maxItems: 8,
              },
              adsKit: {
                type: "array",
                items: {
                  type: "object",
                  properties: {
                    type: { type: "string", description: "Ex: Story-Telling, Bénéfice Direct" },
                    hook: { type: "string", description: "Accroche scroll-stopper" },
                    body: { type: "string", description: "Corps du texte publicitaire" },
                    cta: { type: "string", description: "Appel à l'action" },
                  },
                  required: ["type", "hook", "body", "cta"],
                },
                minItems: 2,
                maxItems: 2,
              },
              targeting: {
                type: "object",
                properties: {
                  country: { type: "string" },
                  ageRange: { type: "string", description: "Ex: 25 - 45 ans" },
                  interests: { type: "string", description: "Ex: Entrepreneur, E-commerce" },
                  dailyBudget: { type: "string", description: "Ex: 5$ / jour" },
                },
                required: ["country", "ageRange", "interests", "dailyBudget"],
              },
            },
            required: ["chapters", "adsKit", "targeting"],
          },
        }],
        tool_choice: { type: "tool", name: "submit_kit" },
      }),
    });

    if (!resp.ok) {
      const t = await resp.text();
      console.error("Claude error:", resp.status, t);
      if (resp.status === 429) {
        return new Response(JSON.stringify({ error: "Trop de requêtes, réessayez dans un instant." }), {
          status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      throw new Error(`Claude API error: ${resp.status}`);
    }

    const data = await resp.json();
    const toolUse = data.content?.find((c: { type: string; input: Record<string, unknown> }) => c.type === "tool_use");
    if (!toolUse) throw new Error("No tool use in response");

    return new Response(JSON.stringify(toolUse.input), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("factory-generate-kit error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown" }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});

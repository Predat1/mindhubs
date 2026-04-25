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

    const { niche, countryCode, countryName } = await req.json();
    if (!niche || !countryName) {
      return new Response(JSON.stringify({ error: "niche and countryName required" }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const ANTHROPIC_API_KEY = Deno.env.get("ANTHROPIC_API_KEY");
    if (!ANTHROPIC_API_KEY) throw new Error("ANTHROPIC_API_KEY missing");

    const resp = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "x-api-key": ANTHROPIC_API_KEY,
        "anthropic-version": "2023-06-01",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: CLAUDE_MODEL,
        max_tokens: 2048,
        system: `Tu es un expert en analyse de marché digital et Facebook Ads pour l'Afrique francophone. Tu identifies les problèmes les plus urgents et vendeurs dans une niche donnée pour un pays spécifique. Chaque problème doit être un vrai pain point que les entrepreneurs de ce pays rencontrent.`,
        messages: [{ role: "user", content: `Analyse la niche "${niche}" au ${countryName} (${countryCode}) et identifie les 3 problèmes les plus urgents et vendeurs que les entrepreneurs/clients rencontrent dans cette niche.\n\nPour chaque problème :\n- Donne un titre court et percutant\n- Un score d'urgence de 70 à 99 (basé sur la fréquence et l'intensité du problème)\n- Une description de 1-2 phrases expliquant l'impact\n- Un conseil stratégique FB Ads spécifique pour cibler ce problème\n\nOrdonne par urgence décroissante.` }],
        tools: [{
          name: "submit_painpoints",
          description: "Submit the 3 most urgent pain points for this niche in this country.",
          input_schema: {
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
        }],
        tool_choice: { type: "tool", name: "submit_painpoints" },
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
    console.error("factory-generate-painpoints error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown" }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});

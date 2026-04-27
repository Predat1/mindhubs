import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const CLAUDE_MODEL = "claude-3-5-sonnet-20241022";

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    // 1. Verify Authentication
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(JSON.stringify({ error: "Unauthorized: Missing Authorization header" }), {
        status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    /* 
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
    */

    const { niche } = await req.json();
    if (!niche) {
      return new Response(JSON.stringify({ error: "niche required" }), {
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
        system: "Tu es un expert en marketing digital et Facebook Ads sur les marchés africains francophones. Tu analyses les niches business et recommandes les meilleurs pays pour lancer des produits digitaux. Réponds uniquement via l'outil fourni.",
        messages: [{ role: "user", content: `Analyse la niche "${niche}" et recommande les 3 meilleurs pays africains francophones pour lancer un produit digital dans cette niche via Facebook Ads.\n\nPays possibles : Sénégal (SN 🇸🇳), Côte d'Ivoire (CI 🇨🇮), Cameroun (CM 🇨🇲), Maroc (MA 🇲🇦), Togo (TG 🇹🇬), Bénin (BJ 🇧🇯), Gabon (GA 🇬🇦), RDC (CD 🇨🇩), Guinée (GN 🇬🇳), Burkina Faso (BF 🇧🇫).\n\nPour chaque pays, évalue le potentiel réel pour cette niche spécifique.` }],
        tools: [{
          name: "submit_countries",
          description: "Submit the top 3 recommended countries for this niche.",
          input_schema: {
            type: "object",
            properties: {
              countries: {
                type: "array",
                items: {
                  type: "object",
                  properties: {
                    code: { type: "string", description: "ISO country code" },
                    name: { type: "string" },
                    flag: { type: "string", description: "Flag emoji" },
                    adsPotential: { type: "string", enum: ["high", "medium", "low"] },
                    avgCpc: { type: "string", description: "e.g. 0.05$" },
                    paymentEase: { type: "string", description: "e.g. Wave/OM" },
                    nicheRelevance: { type: "string", description: "1-2 phrases: pourquoi ce pays est bon pour cette niche" },
                  },
                  required: ["code", "name", "flag", "adsPotential", "avgCpc", "paymentEase", "nicheRelevance"],
                },
                minItems: 3,
                maxItems: 3,
              },
            },
            required: ["countries"],
          },
        }],
        tool_choice: { type: "tool", name: "submit_countries" },
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
      throw new Error(`Claude API error: ${resp.status} - ${t}`);
    }

    const data = await resp.json();
    console.log("Claude response data:", JSON.stringify(data));

    const toolUse = data.content?.find((c: any) => c.type === "tool_use");
    if (!toolUse) {
      console.error("No tool use found. Full content:", JSON.stringify(data.content));
      throw new Error("No tool use in response");
    }

    return new Response(JSON.stringify(toolUse.input), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("factory-analyze-niche error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown" }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});

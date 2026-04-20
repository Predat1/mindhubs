import "https://deno.land/x/xhr@0.1.0/mod.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { title, category, hint } = await req.json();
    if (!title) {
      return new Response(JSON.stringify({ error: "Title required" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY missing");

    const systemPrompt = `Tu es un copywriter expert en vente de produits digitaux en Afrique francophone (Bénin, Côte d'Ivoire, Sénégal, Cameroun…). 
Tu écris des descriptions de produits irrésistibles, orientées conversion, claires et honnêtes. 
Style : direct, chaleureux, avec des emojis pertinents (max 5), structurée en sections courtes.
Devise : FCFA. Évite tout jargon marketing creux.`;

    const userPrompt = `Rédige une description complète et vendeuse pour ce produit :
- Titre : "${title}"
- Catégorie : "${category || "Formations"}"
${hint ? `- Notes du vendeur : "${hint}"` : ""}

Format attendu (markdown léger, sans titre principal) :
1. Une accroche émotionnelle (1-2 phrases)
2. **Ce que vous obtenez** : liste de 4-6 bénéfices concrets avec des puces ✅
3. **Pour qui ?** : 1 paragraphe court
4. **Pourquoi maintenant** : 1 phrase d'urgence
5. Un call-to-action final motivant

Reste sous 220 mots. Pas de prix. Pas de promesse irréaliste.`;

    const resp = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt },
        ],
      }),
    });

    if (!resp.ok) {
      const t = await resp.text();
      console.error("AI error:", resp.status, t);
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
    const description = data.choices?.[0]?.message?.content ?? "";

    return new Response(JSON.stringify({ description }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("generate-product-description error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown" }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});

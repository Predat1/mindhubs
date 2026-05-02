import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2"

// ─── 3 Principaux Changements ───
// 1. Ajout des modes 'validate', 'pivots' et 'remix' pour une validation complète de l'idée.
// 2. Optimisation des prompts pour les marchés africains avec devises locales et notes culturelles.
// 3. Routage intelligent des modèles : Perplexity (veille), Claude 3.5 (architecture), GPT-4o (marketing).

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders })

  try {
    const { idea, format, type, model: userModel, markets } = await req.json()
    const OPENROUTER_API_KEY = Deno.env.get('OPENROUTER_API_KEY')
    if (!OPENROUTER_API_KEY) throw new Error('Missing OPENROUTER_API_KEY')

    let model = userModel;
    let systemPrompt = "Tu es MindHubs AI, l'assistant ultime des créateurs de business digitaux en Afrique. Réponds toujours en Français.";
    let userPrompt = "";

    const marketList = Array.isArray(markets) ? markets.join(", ") : "Afrique Francophone";

    // WHY: Routage par type pour garantir la meilleure performance sur chaque étape du pipeline
    if (type === 'spy-research' || type === 'remix') {
      model = "perplexity/sonar-deep-research";
      if (type === 'spy-research') {
        userPrompt = `Trouve 5 produits digitaux qui cartonnent EN CE MOMENT sur les marchés : [${marketList}]. Niche: ${idea}.
        Pour chaque produit, fournis: title, reason (pourquoi ça marche là-bas), estimatedPrice (en devise locale), peakPlatform (WhatsApp/TikTok/Facebook), hotScore (0-100).
        Réponds UNIQUEMENT en JSON: { "products": [...] }`;
      } else {
        userPrompt = `Génère 3 angles de différenciation (Remix) pour ce produit : "${idea}" sur le marché ${marketList}.
        Chaque angle doit être unique et adapté à la culture locale. Format JSON: { "angles": [{ "title": "...", "description": "..." }] }`;
      }
    } else if (type === 'validate' || type === 'pivots') {
      model = "anthropic/claude-3.5-sonnet";
      if (type === 'validate') {
        userPrompt = `Analyse le potentiel de cette idée pour les marchés [${marketList}] : "${idea}".
        Réponds UNIQUEMENT en JSON valide : {
          "score": <0-100>, "saturation": "Faible|Moyenne|Élevée", "demand": "Faible|Moyenne|Élevée|Très Élevée",
          "competitors": <nombre entier>, "recommendation": "<2-3 phrases>", "pros": ["..."], "cons": ["..."],
          "chartData": [{"name":"Jan","val":50}, {"name":"Fév","val":60}], "suggestedPrice": "<montant local>",
          "bestFormat": "<format recommandé>", "topMarket": "<pays le plus porteur>"
        }`;
      } else {
        userPrompt = `L'idée "${idea}" est peu viable. Propose 3 pivots stratégiques adaptés aux marchés [${marketList}]. JSON: { "pivots": ["...", "...", "..."] }`;
      }
    } else if (type === 'plan' || type === 'chapter-draft') {
      model = "anthropic/claude-3.5-sonnet";
      if (type === 'plan') {
        userPrompt = `Crée le plan complet pour un "${format}" intitulé "${idea}". Structure en chapitres actionnables. JSON: { "chapters": [{ "title": "...", "content": "..." }] }`;
      } else {
        userPrompt = `Rédige le contenu détaillé du chapitre "${idea}" pour le produit "${format}". Style professionnel et pratique.`;
      }
    } else if (type === 'marketing') {
      model = "openai/gpt-4o";
      userPrompt = `Génère un kit marketing (TikTok, WhatsApp, FB) pour "${idea}" sur les marchés [${marketList}].
      Adapte aux codes culturels locaux (Mobile Money, argot local pro, WhatsApp focal).
      JSON: { "scripts": [{ "type": "...", "hook": "...", "script": "...", "duration": "...", "platform": "...", "culturalNote": "..." }] }`;
    }

    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${OPENROUTER_API_KEY}`,
        'HTTP-Referer': 'https://mindhubs.com',
        'X-Title': 'MindHubs Creator Lab',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: model,
        messages: [{ role: 'system', content: systemPrompt }, { role: 'user', content: userPrompt }],
        response_format: { type: "json_object" } // WHY: Force le JSON pour éviter les résidus de texte
      }),
    })

    const data = await response.json()
    const aiContent = data.choices?.[0]?.message?.content || "";
    
    return new Response(JSON.stringify({ result: aiContent, model, raw: data }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    })
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500,
    })
  }
})

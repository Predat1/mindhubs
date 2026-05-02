import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { idea, format, type, model = "perplexity/sonar-deep-research" } = await req.json()
    const OPENROUTER_API_KEY = Deno.env.get('OPENROUTER_API_KEY')

    if (!OPENROUTER_API_KEY) {
      throw new Error('Missing OPENROUTER_API_KEY')
    }

    // Mapping for specific user requests or defaults
    let systemPrompt = "Tu es MindHubs AI, un expert en analyse de données web et création de produits digitaux.";
    let userPrompt = "";

    if (type === 'web-analysis') {
      systemPrompt += " Ta mission est d'analyser les données publicitaires et les tendances web pour identifier la rentabilité.";
      userPrompt = `Analyse ces données de marché pour l'idée : "${idea}". Identifie les points de douleur et le potentiel de vente directe.`;
    } else if (type === 'plan') {
      systemPrompt += " Ta mission est de structurer un plan détaillé pour un produit digital. Sois persuasif, structuré et utilise des termes adaptés au marché local.";
      userPrompt = `Génère un plan de 5 chapitres pour un produit de type "${format}" basé sur cette idée : "${idea}". Pour chaque chapitre, donne un titre accrocheur et un résumé du contenu. Formate la réponse en JSON pour que je puisse l'analyser facilement. Exemple: { "chapters": [{ "title": "...", "content": "..." }] }`;
    } else if (type === 'marketing') {
      systemPrompt += " Ta mission est de générer des scripts publicitaires viraux pour TikTok, WhatsApp et Facebook.";
      userPrompt = `Génère 1 script TikTok (45s) et 1 post WhatsApp pour vendre ce produit : "${idea}". Utilise des emojis et un ton très engageant.`;
    }

    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${OPENROUTER_API_KEY}`,
        'HTTP-Referer': 'https://mindhubs.com', // Optional, for OpenRouter analytics
        'X-Title': 'MindHubs Creator Lab', // Optional
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: model,
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt }
        ],
      }),
    })

    const data = await response.json()
    
    // Extract the content from OpenRouter response
    const aiContent = data.choices?.[0]?.message?.content || "";
    
    return new Response(JSON.stringify({ result: aiContent, raw: data }), {
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

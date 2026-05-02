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
    const { idea, format, type, model: userModel } = await req.json()
    const OPENROUTER_API_KEY = Deno.env.get('OPENROUTER_API_KEY')

    if (!OPENROUTER_API_KEY) {
      throw new Error('Missing OPENROUTER_API_KEY')
    }

    // --- Smart Model Routing ---
    let model = userModel;
    let systemPrompt = "Tu es MindHubs AI, l'assistant ultime des créateurs de business digitaux. Réponds toujours en Français.";
    let userPrompt = "";

    if (type === 'web-analysis') {
      // Perplexity is the king of research
      model = model || "perplexity/sonar-deep-research";
      systemPrompt += " Tu es un expert en analyse de marché temps réel. Utilise tes capacités de recherche web pour trouver des preuves de rentabilité.";
      userPrompt = `Analyse en profondeur le marché pour cette idée de produit digital : "${idea}". Cherche des publicités Facebook concurrentes, des volumes de recherche et identifie l'angle marketing le plus rentable.`;
    } else if (type === 'plan') {
      // Claude 3.5 Sonnet is the king of structure and logic
      model = model || "anthropic/claude-3.5-sonnet";
      systemPrompt += " Tu es un architecte de produits digitaux d'élite. Ton écriture est claire, professionnelle et hautement pédagogique.";
      userPrompt = `Crée le plan complet pour un "${format}" sur le thème : "${idea}". Structure-le en 5 chapitres percutants. Formate en JSON: { "chapters": [{ "title": "...", "content": "..." }] }`;
    } else if (type === 'marketing') {
      // GPT-4o is the king of viral marketing and creative hooks
      model = model || "openai/gpt-4o";
      systemPrompt += " Tu es un copywriter de génie spécialisé dans le marketing viral et les réseaux sociaux.";
      userPrompt = `Génère un kit marketing explosif (TikTok, WhatsApp, Facebook) pour vendre : "${idea}". Utilise des hooks puissants, des emojis et crée un sentiment d'urgence irrésistible.`;
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
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt }
        ],
      }),
    })

    const data = await response.json()
    const aiContent = data.choices?.[0]?.message?.content || "";
    
    return new Response(JSON.stringify({ result: aiContent, model: model, raw: data }), {
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

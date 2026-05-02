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

    if (type === 'web-analysis' || type === 'spy-research') {
      model = model || "perplexity/sonar-deep-research";
      systemPrompt += " Tu es un expert en veille stratégique et en e-commerce. Ta mission est de scanner le web pour trouver des produits digitaux qui cartonnent actuellement.";
      if (type === 'spy-research') {
        userPrompt = `Trouve 5 exemples réels de produits digitaux (ebooks, formations, outils) qui se vendent massivement en ce moment dans la thématique : "${idea}". Réponds uniquement en format JSON: { "products": [{ "title": "...", "reason": "...", "price": "..." }] }`;
      } else {
        userPrompt = `Analyse en profondeur le marché pour cette idée : "${idea}". Cherche des preuves de rentabilité et l'angle marketing idéal.`;
      }
    } else if (type === 'chapter-draft') {
      model = model || "anthropic/claude-3.5-sonnet";
      systemPrompt += " Tu es un écrivain d'élite expert en produits d'information. Ta mission est de rédiger un contenu riche, détaillé et hautement actionnable pour un chapitre spécifique.";
      userPrompt = `Rédige le contenu complet du chapitre "${idea}" pour un ebook intitulé "${format}". Le contenu doit être riche, inclure des conseils pratiques, des exemples et être prêt à la lecture. Réponds en Français.`;
    } else if (type === 'plan') {
      model = model || "anthropic/claude-3.5-sonnet";
      systemPrompt += " Tu es un architecte de produits digitaux d'élite. Ton écriture est claire, professionnelle et hautement pédagogique.";
      userPrompt = `Crée le plan complet pour un "${format}" sur le thème : "${idea}". Structure-le en plusieurs chapitres percutants. Formate en JSON: { "chapters": [{ "title": "...", "content": "..." }] }`;
    } else if (type === 'marketing') {
      model = model || "openai/gpt-4o";
      systemPrompt += " Tu es un copywriter de génie spécialisé dans le marketing viral et les réseaux sociaux.";
      userPrompt = `Génère un kit marketing explosif (TikTok, WhatsApp, Facebook) pour vendre : "${idea}".`;
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

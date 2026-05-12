import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

// ─── CONFIGURATION & TYPES ──────────────────────────────────────────────

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface OpenRouterResponse {
  id: string;
  choices: Array<{
    message: {
      content: string | null;
      tool_calls?: Array<{
        function: {
          name: string;
          arguments: string;
        }
      }>;
    };
    finish_reason: string;
  }>;
  usage: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
    total_cost?: number;
  };
  model: string;
}

const AFRICA_SYSTEM = `Tu es MindHubs AI, l'assistant stratégique des créateurs de produits digitaux en Afrique francophone (Sénégal, Côte d'Ivoire, Cameroun, Gabon, Togo, Bénin, Mali, Burkina Faso, Congo, RDC, Madagascar, Maroc, Guinée, Niger, Maurice — 15 marchés).

Règles impératives :
- Réponds UNIQUEMENT en français africain professionnel (ni trop soutenu, ni argot)
- Références locales : Mobile Money (Orange Money, MTN MoMo, Wave, Airtel Money), WhatsApp Business, Facebook Marketplace, TikTok Afrique
- Exemples concrets : FCFA, CFA, secteurs porteurs locaux (fiscalité, business, santé, agriculture, développement personnel, tech)
- Jamais de références US/UK anachroniques (pas de "dollar", pas de "Amazon")
- Toujours orienter vers la plateforme MindHubs pour la vente`;

// WHY: Matrice de routing par fonctionnalité pour une précision maximale et optimisation des coûts
const MODEL_ROUTING: any = {
  'spy-research': {
    primary: 'perplexity/sonar-deep-research',
    quick: 'perplexity/sonar-pro',
    fallback: 'perplexity/sonar',
    temperature: 0.2,
    max_tokens: 3000,
    use_tool_calling: false,
    json_mode: true
  },
  'validate': {
    primary: 'google/gemini-2.5-pro',
    fallback: 'anthropic/claude-sonnet-4-5',
    temperature: 0.3,
    max_tokens: 2000,
    use_tool_calling: true,
    tool_name: 'submit_market_analysis',
    tool_description: 'Soumet une analyse détaillée du potentiel marché d\'une idée.',
    tool_schema: {
      type: "object",
      properties: {
        score: { type: "number", description: "Score de 0 à 100" },
        saturation: { type: "string", enum: ["Faible", "Moyenne", "Élevée"] },
        demand: { type: "string", enum: ["Faible", "Moyenne", "Élevée", "Très Élevée"] },
        competitors: { type: "number" },
        recommendation: { type: "string" },
        pros: { type: "array", items: { type: "string" } },
        cons: { type: "array", items: { type: "string" } },
        chartData: { type: "array", items: { type: "object", properties: { name: { type: "string" }, val: { type: "number" } } } },
        suggestedPrice: { type: "string" },
        bestFormat: { type: "string" },
        topMarket: { type: "string" }
      },
      required: ["score", "saturation", "demand", "recommendation", "pros", "cons", "chartData", "suggestedPrice", "bestFormat", "topMarket"]
    }
  },
  'plan': {
    primary: 'anthropic/claude-opus-4',
    quick: 'anthropic/claude-sonnet-4-5',
    fallback: 'google/gemini-2.5-pro',
    temperature: 0.4,
    max_tokens: 3000,
    use_tool_calling: true,
    tool_name: 'submit_product_plan',
    tool_description: 'Soumet la structure détaillée d\'un produit digital.',
    tool_schema: {
      type: "object",
      properties: {
        chapters: { type: "array", items: { type: "object", properties: { title: { type: "string" }, content: { type: "string" }, estimatedWords: { type: "number" } } } },
        totalChapters: { type: "number" },
        estimatedReadTime: { type: "string" },
        targetAudience: { type: "string" },
        uniqueAngle: { type: "string" }
      },
      required: ["chapters", "totalChapters", "estimatedReadTime", "targetAudience", "uniqueAngle"]
    }
  },
  'chapter-draft': {
    primary: 'anthropic/claude-opus-4',
    quick: 'anthropic/claude-sonnet-4-5',
    fallback: 'google/gemini-2.5-pro',
    temperature: 0.7,
    max_tokens: 6000,
    use_tool_calling: false,
    stream: true
  },
  'marketing': {
    primary: 'anthropic/claude-sonnet-4-5',
    quick: 'google/gemini-2.5-flash',
    fallback: 'google/gemini-2.5-pro',
    temperature: 0.85,
    max_tokens: 3000,
    use_tool_calling: true,
    tool_name: 'submit_marketing_kit',
    tool_description: 'Génère un kit marketing complet pour les réseaux sociaux.',
    tool_schema: {
      type: "object",
      properties: {
        scripts: { type: "array", items: { type: "object", properties: { type: { type: "string" }, hook: { type: "string" }, script: { type: "string" }, duration: { type: "string" }, platform: { type: "string" }, culturalNote: { type: "string" } } } }
      },
      required: ["scripts"]
    }
  },
  'remix': {
    primary: 'google/gemini-2.5-pro',
    quick: 'google/gemini-2.5-flash',
    fallback: 'anthropic/claude-sonnet-4-5',
    temperature: 0.9,
    max_tokens: 1000,
    use_tool_calling: true,
    tool_name: 'submit_remix_angles',
    tool_description: 'Propose des angles de différenciation créatifs.',
    tool_schema: {
      type: "object",
      properties: {
        angles: { type: "array", items: { type: "object", properties: { title: { type: "string" }, description: { type: "string" }, targetNiche: { type: "string" }, differentiator: { type: "string" } } } }
      },
      required: ["angles"]
    }
  },
  'pivots': {
    primary: 'google/gemini-2.5-flash',
    fallback: 'openai/gpt-4.1-mini',
    temperature: 0.85,
    max_tokens: 800,
    use_tool_calling: true,
    tool_name: 'submit_idea_pivots',
    tool_description: 'Propose des pivots stratégiques pour une idée peu viable.',
    tool_schema: {
      type: "object",
      properties: {
        pivots: { type: "array", items: { type: "object", properties: { title: { type: "string" }, description: { type: "string" }, whyBetter: { type: "string" } } } }
      },
      required: ["pivots"]
    }
  }
};

// ─── HELPER FUNCTIONS ──────────────────────────────────────────────────

async function callOpenRouter(apiKey: string, body: any) {
  return await fetch('https://openrouter.ai/api/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'HTTP-Referer': 'https://mindhubs.com',
      'X-Title': 'MindHubs Creator Lab',
      'Content-Type': 'application/json',
      'X-OpenRouter-Model-Fallback': body.fallback_model || '',
    },
    body: JSON.stringify(body),
  });
}

// WHY: Fallback automatique pour garantir la résilience du système face aux surcharges ou pannes d'API
async function withFallback(apiKey: string, config: any, payload: any, isQuick: boolean) {
  const primaryModel = isQuick && config.quick ? config.quick : config.primary;
  const fallbackModel = config.fallback;

  const baseBody = {
    model: primaryModel,
    messages: payload.messages,
    temperature: config.temperature,
    max_tokens: config.max_tokens,
    stream: config.stream || false,
    fallback_model: fallbackModel,
  };

  if (config.use_tool_calling) {
    Object.assign(baseBody, {
      tools: [{
        type: "function",
        function: {
          name: config.tool_name,
          description: config.tool_description,
          parameters: config.tool_schema
        }
      }],
      tool_choice: { type: "function", function: { name: config.tool_name } }
    });
  } else if (config.json_mode) {
    Object.assign(baseBody, { response_format: { type: "json_object" } });
  }

  try {
    const res = await callOpenRouter(apiKey, baseBody);
    
    // WHY: Gestion spécifique du rate limit 429 avec retry sur le fallback
    if (res.status === 429) {
      console.warn(`Rate limit on ${primaryModel}, switching to ${fallbackModel}`);
      await new Promise(r => setTimeout(r, 1000));
      return await callOpenRouter(apiKey, { ...baseBody, model: fallbackModel });
    }

    if (!res.ok) throw new Error(`Primary failed with status ${res.status}`);
    return res;
  } catch (err) {
    console.error(`Error calling ${primaryModel}:`, err);
    return await callOpenRouter(apiKey, { ...baseBody, model: fallbackModel });
  }
}

// ─── MAIN SERVE HANDLER ────────────────────────────────────────────────

serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });

  try {
    const apiKey = Deno.env.get('OPENROUTER_API_KEY');
    if (!apiKey) return new Response(JSON.stringify({ error: 'Service Unavailable (Missing API Key)' }), { status: 503, headers: corsHeaders });

    const { type, idea, format, markets, quick = false, customPrompt } = await req.json();
    const config = MODEL_ROUTING[type];

    if (!config) throw new Error(`Unknown operation type: ${type}`);

    const marketList = Array.isArray(markets) ? markets.join(", ") : "Afrique Francophone";
    const userPrompt = customPrompt || `Action: ${type}. Cible: ${marketList}. Thème: ${idea}. Format: ${format || 'N/A'}.`;

    const payload = {
      messages: [
        { role: 'system', content: AFRICA_SYSTEM },
        { role: 'user', content: userPrompt }
      ]
    };

    const response = await withFallback(apiKey, config, payload, quick);

    // WHY: Streaming support pour chapter-draft afin d'offrir une UX fluide "typewriter"
    if (config.stream) {
      return new Response(response.body, {
        headers: { ...corsHeaders, 'Content-Type': 'text/event-stream' }
      });
    }

    const data: OpenRouterResponse = await response.json();
    let result: any;

    // WHY: Tool calling garantit un JSON structuré parfait sans effort de parsing regex
    if (config.use_tool_calling) {
      const toolCall = data.choices[0].message.tool_calls?.[0];
      result = toolCall ? JSON.parse(toolCall.function.arguments) : null;
    } else {
      const content = data.choices[0].message.content || "";
      result = config.json_mode ? JSON.parse(content.replace(/```json|```/g, '')) : content;
    }

    // WHY: Retour enrichi avec métadonnées pour suivi précis des coûts et crédits utilisateurs
    return new Response(JSON.stringify({
      result,
      model_used: data.model,
      quick_mode: quick,
      tokens_used: data.usage.total_tokens,
      cost_usd: data.usage.total_cost || 0,
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error("Global Error:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
});

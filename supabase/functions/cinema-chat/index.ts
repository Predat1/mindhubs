import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.4";

// ─── Cinema Studio AI Chat ───
// Conversational AI for video advertising, powered by OpenRouter (Claude Sonnet 4.5).
// Dynamic system prompt built per vendor: products, preferences, generation history.
// Supports auto-model selection and all ad formats/strategies.

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const SYSTEM_PROMPT_BASE = `Tu es un directeur créatif IA expert en vidéo publicitaire et marketing digital.
Tu travailles sur MindHubs, une plateforme SaaS pour les entrepreneurs africains francophones.

🎥 FORMATS PUBLICITAIRES que tu maîtrises :
- UGC (témoignage client, talking head, unboxing, lifestyle)
- Pub cinématique premium (brand film, storytelling émotionnel)
- Before/After transformation (split-screen, résultats visuels)
- Pain Point → Solution (hook négatif, problème/solution)
- Démo produit / showcase / unboxing digital
- Promo flash / urgence / compte à rebours / offre limitée
- Slideshow animé (images produit → vidéo dynamique)
- Motion graphics / explainer vidéo / infographie animée
- Pub comparative (vs concurrent, avantages mis en avant)
- Retargeting vidéo (rappel panier/visite, objection-killer)
- Storytelling narratif (mini-film, parcours client)
- Tutoriel / How-to (éducatif, valeur ajoutée)

📱 PLATEFORMES que tu optimises :
- Facebook Ads (1:1, 4:5, 16:9, carrousel vidéo) — hook 3 premières secondes
- TikTok Ads (9:16, trend-native, hook 1s, musique tendance)
- Instagram Reels & Stories (9:16, loop, stickers, effets natifs)
- YouTube Ads (pre-roll 6s bumper, mid-roll 15s, long-form)
- WhatsApp Status (vertical, 30s max, intimiste)
- Google Ads / Display (16:9, 6-15s, message clair)

🎯 STRATÉGIES FUNNEL :
- TOFU (notoriété) : brand awareness, reach, viralité
- MOFU (considération) : démo, témoignage, FAQ vidéo, éducation
- BOFU (conversion) : urgence, offre limitée, CTA direct, preuve sociale
- Retargeting : rappel, objection-killer, dernière chance
- Séquence vidéo (3-5 vidéos progressives dans un funnel publicitaire)

📐 Quand tu proposes une vidéo, TOUJOURS préciser :
1. Le format recommandé et l'aspect ratio
2. La durée optimale
3. Le hook des 3 premières secondes
4. Le script/storyboard concis
5. Le CTA (call-to-action)
6. Le modèle IA recommandé et pourquoi

MODÈLES VIDÉO DISPONIBLES (via fal.ai) :
Premium : Sora 2 Pro (1500 pts, 20s, audio), Veo 3.1 (1000 pts, 4K, audio), Veo 3.1 Fast (600 pts, rapide, audio), Seedance 2.0 (800 pts, cinématique, audio), Seedance 2.0 Fast (450 pts, rapide, audio)
Standard : Kling 3.0 Pro (600 pts, réaliste, audio), PixVerse V6 (400 pts, polyvalent, audio), Minimax Hailuo-02 (350 pts, rapide), Luma Ray2 (300 pts, paysages)
Budget : Wan 2.2 (200 pts), LTX Video 2 (150 pts, audio), Hunyuan (250 pts)
Image-to-Video : Kling 3.0 i2v (600 pts), Seedance 2.0 i2v (800 pts), PixVerse V6 i2v (400 pts), Veo 3.1 i2v (1000 pts)

Quand le mode est "auto", choisis le meilleur modèle selon :
- Budget de l'utilisateur en crédits
- Durée souhaitée
- Besoin d'audio natif
- Complexité visuelle du prompt
- Plateforme cible (vertical → 9:16, Facebook → 4:5, YouTube → 16:9)

Tu réponds TOUJOURS en français. Tu es chaleureux, professionnel et orienté résultats.
Utilise le vouvoiement ou tutoiement selon le ton préféré du vendeur.`;

// Tool schema for structured video generation
const VIDEO_TOOL = {
  type: "function",
  function: {
    name: "generate_video",
    description: "Génère une vidéo publicitaire avec les paramètres optimaux. Appeler quand l'utilisateur confirme ou que la demande est claire.",
    parameters: {
      type: "object",
      properties: {
        model_id: {
          type: "string",
          description: "ID du modèle vidéo à utiliser",
          enum: [
            "sora-2-pro", "veo-3.1", "veo-3.1-fast", "seedance-2", "seedance-2-fast",
            "kling-v3-pro", "pixverse-v6", "minimax-hailuo", "luma-ray2",
            "wan-2.2", "ltx-video", "hunyuan",
            "kling-v3-pro-i2v", "seedance-2-i2v", "pixverse-v6-i2v", "veo-3.1-i2v"
          ]
        },
        refined_prompt: {
          type: "string",
          description: "Prompt optimisé pour la génération vidéo (en anglais, détaillé, cinématique)"
        },
        duration: { type: "number", description: "Durée en secondes (3-20)" },
        aspect_ratio: {
          type: "string",
          description: "Ratio d'aspect",
          enum: ["16:9", "9:16", "1:1", "4:5", "4:3", "3:4"]
        },
        reasoning: {
          type: "string",
          description: "Explication du choix du modèle et des paramètres (en français)"
        }
      },
      required: ["model_id", "refined_prompt", "duration", "aspect_ratio", "reasoning"]
    }
  }
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  const OPENROUTER_API_KEY = Deno.env.get("OPENROUTER_API_KEY");
  if (!OPENROUTER_API_KEY) {
    return new Response(JSON.stringify({ error: "OPENROUTER_API_KEY not configured" }), {
      status: 503, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
  const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
  const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

  try {
    const { messages, vendorId, selectedModel } = await req.json();

    if (!messages || !vendorId) {
      return new Response(JSON.stringify({ error: "messages and vendorId required" }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // ─── Build dynamic context ───
    let vendorContext = "";

    // 1. Vendor profile
    const { data: vendor } = await supabase
      .from("vendors")
      .select("shop_name, description")
      .eq("id", vendorId)
      .single();

    if (vendor) {
      vendorContext += `\n\n📊 PROFIL VENDEUR :\n- Boutique : ${vendor.shop_name}\n- Description : ${vendor.description || "Non renseignée"}`;
    }

    // 2. Recent products
    const { data: products } = await supabase
      .from("products")
      .select("title, category")
      .eq("vendor_id", vendorId)
      .order("created_at", { ascending: false })
      .limit(5);

    if (products?.length) {
      vendorContext += `\n\n📦 PRODUITS RÉCENTS :\n${products.map((p: any) => `- ${p.title} (${p.category})`).join("\n")}`;
    }

    // 3. Cinema preferences
    const { data: prefs } = await supabase
      .from("cinema_preferences")
      .select("*")
      .eq("vendor_id", vendorId)
      .single();

    if (prefs) {
      vendorContext += `\n\n⚙️ PRÉFÉRENCES CRÉATIVES :`;
      if (prefs.preferred_style) vendorContext += `\n- Style préféré : ${prefs.preferred_style}`;
      if (prefs.target_platforms?.length) vendorContext += `\n- Plateformes : ${prefs.target_platforms.join(", ")}`;
      if (prefs.target_countries?.length) vendorContext += `\n- Pays cibles : ${prefs.target_countries.join(", ")}`;
      if (prefs.brand_colors?.length) vendorContext += `\n- Couleurs marque : ${prefs.brand_colors.join(", ")}`;
      if (prefs.tone) vendorContext += `\n- Ton : ${prefs.tone}`;
      if (prefs.custom_instructions) vendorContext += `\n- Instructions custom : ${prefs.custom_instructions}`;
    }

    // 4. Recent generation history with ratings
    const { data: history } = await supabase
      .from("video_jobs")
      .select("prompt, model_id, rating, status")
      .eq("vendor_id", vendorId)
      .order("created_at", { ascending: false })
      .limit(10);

    if (history?.length) {
      const rated = history.filter((h: any) => h.rating);
      if (rated.length) {
        vendorContext += `\n\n📈 HISTORIQUE (vidéos notées) :`;
        rated.forEach((h: any) => {
          vendorContext += `\n- "${h.prompt.slice(0, 80)}..." → ${h.model_id} → ${"⭐".repeat(h.rating)}/5`;
        });
      }
    }

    // 5. Model selection context
    let modelContext = "";
    if (selectedModel && selectedModel !== "auto") {
      modelContext = `\n\n🎯 MODÈLE SÉLECTIONNÉ : L'utilisateur a choisi "${selectedModel}". Utilise ce modèle dans tes suggestions.`;
    } else {
      modelContext = `\n\n🤖 MODE AUTO : Choisis le meilleur modèle selon le contexte (prompt, durée, plateforme, budget).`;
    }

    // Compose final system prompt
    const systemPrompt = SYSTEM_PROMPT_BASE + vendorContext + modelContext;

    // ─── Call OpenRouter ───
    const chatMessages = [
      { role: "system", content: systemPrompt },
      ...messages
    ];

    const resp = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${OPENROUTER_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "anthropic/claude-sonnet-4-5",
        messages: chatMessages,
        tools: [VIDEO_TOOL],
        tool_choice: "auto",
        max_tokens: 2048,
        temperature: 0.7,
      }),
    });

    if (!resp.ok) {
      const errText = await resp.text();
      console.error("OpenRouter error:", resp.status, errText);
      throw new Error(`OpenRouter ${resp.status}`);
    }

    const data = await resp.json();
    const choice = data.choices?.[0];

    // Extract response
    const result: any = {
      message: choice?.message?.content || "",
      toolCall: null,
    };

    // Check for tool calls (video generation request)
    if (choice?.message?.tool_calls?.length) {
      const tc = choice.message.tool_calls[0];
      if (tc.function?.name === "generate_video") {
        try {
          result.toolCall = JSON.parse(tc.function.arguments);
        } catch {
          console.error("Failed to parse tool call args");
        }
      }
    }

    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });

  } catch (e: any) {
    console.error("cinema-chat error:", e);
    return new Response(JSON.stringify({ error: e.message || "Unknown error" }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});

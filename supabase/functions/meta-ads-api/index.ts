import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { query, country = 'ALL' } = await req.json()
    const FACEBOOK_ACCESS_TOKEN = Deno.env.get('FACEBOOK_ACCESS_TOKEN')

    if (!FACEBOOK_ACCESS_TOKEN) {
      throw new Error('Missing FACEBOOK_ACCESS_TOKEN')
    }

    // Advanced search: targeting digital product keywords
    const digitalKeywords = ['ebook', 'formation', 'cours', 'guide', 'masterclass', 'digital', 'télécharger', 'pdf', 'video', 'coaching'];
    const searchQuery = query || digitalKeywords[Math.floor(Math.random() * digitalKeywords.length)];

    // Meta Ad Library API URL - added more fields for better analysis
    const url = `https://graph.facebook.com/v17.0/ads_archive?access_token=${FACEBOOK_ACCESS_TOKEN}&search_terms=${encodeURIComponent(searchQuery)}&ad_reached_countries=['${country}']&ad_active_status=ACTIVE&fields=ad_creative_bodies,ad_creative_link_captions,ad_creative_link_titles,ad_snapshot_url,page_name,page_id,publisher_platforms,demographic_distribution`;

    const response = await fetch(url);
    const result = await response.json();

    if (result.error) throw new Error(result.error.message);

    // Filter and Score results for "Digital Product Sales" intent
    const scoredAds = (result.data || []).map((ad: any) => {
      const body = (ad.ad_creative_bodies?.[0] || "").toLowerCase();
      const title = (ad.ad_creative_link_titles?.[0] || "").toLowerCase();
      const fullText = `${body} ${title}`;

      let digitalScore = 0;
      
      // Digital markers
      if (['pdf', 'ebook', 'formation', 'cours', 'accéder', 'télécharger', 'vidéo', 'guide', 'programme'].some(k => fullText.includes(k))) digitalScore += 40;
      
      // Sales intent markers
      if (['prix', 'promo', 'offre', 'réduction', 'commander', 'acheter', 'cliquez ici', 'inscription'].some(k => fullText.includes(k))) digitalScore += 40;
      
      // Engagement indicators (proxied by platforms)
      if (ad.publisher_platforms?.includes('INSTAGRAM')) digitalScore += 10;
      if (ad.publisher_platforms?.includes('FACEBOOK')) digitalScore += 10;

      return { ...ad, digitalScore };
    })
    .filter((ad: any) => ad.digitalScore > 20) // Only return ads that likely target sales/digital
    .sort((a: any, b: any) => b.digitalScore - a.digitalScore);

    return new Response(JSON.stringify({ data: scoredAds }), {
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

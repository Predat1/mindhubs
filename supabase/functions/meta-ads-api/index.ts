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

    // Meta Ad Library API URL
    const url = `https://graph.facebook.com/v17.0/ads_archive?access_token=${FACEBOOK_ACCESS_TOKEN}&search_terms=${encodeURIComponent(query)}&ad_reached_countries=['${country}']&ad_active_status=ACTIVE&fields=ad_creative_bodies,ad_creative_link_captions,ad_snapshot_url,page_name,page_id`;

    const response = await fetch(url);
    const data = await response.json();

    return new Response(JSON.stringify(data), {
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

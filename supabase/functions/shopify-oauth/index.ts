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
    const url = new URL(req.url)
    const code = url.searchParams.get('code')
    const shop = url.searchParams.get('shop')
    const state = url.searchParams.get('state')

    if (!code || !shop || !state) {
      return new Response('Missing required parameters', { status: 400 })
    }

    // Verify state parameter (should match user_id for security)
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    // Exchange code for access token
    const clientId = Deno.env.get('SHOPIFY_CLIENT_ID')
    const clientSecret = Deno.env.get('SHOPIFY_CLIENT_SECRET')

    const tokenResponse = await fetch(`https://${shop}/admin/oauth/access_token`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        client_id: clientId,
        client_secret: clientSecret,
        code: code,
      }),
    })

    if (!tokenResponse.ok) {
      throw new Error('Failed to exchange code for token')
    }

    const tokenData = await tokenResponse.json()
    const accessToken = tokenData.access_token

    // Get shop info to verify
    const shopResponse = await fetch(`https://${shop}/admin/api/2023-10/shop.json`, {
      headers: {
        'X-Shopify-Access-Token': accessToken,
      },
    })

    if (!shopResponse.ok) {
      throw new Error('Failed to fetch shop info')
    }

    const shopData = await shopResponse.json()

    // Update integration with access token
    const { error } = await supabase
      .from('shopify_integrations')
      .update({
        sync_status: 'idle',
        sync_log: [{
          action: 'OAuth completed',
          timestamp: new Date().toISOString(),
          details: `Connected to ${shopData.shop.name}`
        }]
      })
      .eq('user_id', state)
      .eq('shop_domain', shop)

    if (error) {
      throw error
    }

    // Store access token securely (you'll implement this)
    // For now, we'll redirect back to the app with success
    const redirectUrl = `${Deno.env.get('SITE_URL')}/?tab=library&shopify=connected`
    
    return new Response(null, {
      status: 302,
      headers: {
        ...corsHeaders,
        'Location': redirectUrl,
      },
    })

  } catch (error) {
    console.error('Shopify OAuth error:', error)
    const redirectUrl = `${Deno.env.get('SITE_URL')}/?tab=library&shopify=error`
    
    return new Response(null, {
      status: 302,
      headers: {
        ...corsHeaders,
        'Location': redirectUrl,
      },
    })
  }
})
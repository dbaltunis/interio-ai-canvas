import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const url = new URL(req.url);
    const code = url.searchParams.get('code');
    const shop = url.searchParams.get('shop');
    const state = url.searchParams.get('state');

    if (!code || !shop) {
      throw new Error('Missing required parameters: code or shop');
    }

    console.log('Shopify OAuth callback received for shop:', shop);

    // Exchange authorization code for access token
    const shopifyClientId = Deno.env.get('SHOPIFY_CLIENT_ID');
    const shopifyClientSecret = Deno.env.get('SHOPIFY_CLIENT_SECRET');

    if (!shopifyClientId || !shopifyClientSecret) {
      throw new Error('Shopify credentials not configured');
    }

    const tokenResponse = await fetch(`https://${shop}/admin/oauth/access_token`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        client_id: shopifyClientId,
        client_secret: shopifyClientSecret,
        code,
      }),
    });

    if (!tokenResponse.ok) {
      const errorText = await tokenResponse.text();
      throw new Error(`Failed to exchange code for token: ${errorText}`);
    }

    const tokenData = await tokenResponse.json();
    const accessToken = tokenData.access_token;

    console.log('Successfully obtained Shopify access token');

    // Get user from state parameter (should be JWT or user_id)
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Parse state to get user_id
    const userId = state;

    // Store integration in database
    const { data: integration, error: dbError } = await supabase
      .from('shopify_integrations')
      .upsert({
        user_id: userId,
        shop_domain: shop,
        access_token: accessToken,
        is_connected: true,
        updated_at: new Date().toISOString(),
      }, {
        onConflict: 'user_id,shop_domain'
      })
      .select()
      .single();

    if (dbError) {
      console.error('Database error:', dbError);
      throw new Error(`Failed to save integration: ${dbError.message}`);
    }

    console.log('Shopify integration saved successfully');

    // Redirect back to app with success message
    const appUrl = Deno.env.get('SITE_URL') || 'https://ldgrcodffsalkevafbkb.supabase.co';
    const redirectUrl = `${appUrl}/?tab=settings&shopify_connected=true&shop=${shop}`;
    
    return new Response(null, {
      status: 302,
      headers: {
        ...corsHeaders,
        'Location': redirectUrl,
      },
    });

  } catch (error) {
    console.error('Shopify OAuth error:', error);
    
    return new Response(
      JSON.stringify({ 
        error: error.message || 'Internal server error',
        details: error.toString()
      }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});

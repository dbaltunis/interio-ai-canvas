import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { userId, shopDomain } = await req.json();
    
    if (!userId) {
      throw new Error('User ID is required');
    }

    if (!shopDomain) {
      throw new Error('Shop domain is required');
    }

    const clientId = Deno.env.get('SHOPIFY_CLIENT_ID');
    if (!clientId) {
      throw new Error('Shopify Client ID not configured');
    }

    // Normalize shop domain
    const normalizedShop = shopDomain.replace(/^https?:\/\//, '').replace(/\/$/, '');
    
    const redirectUri = `https://ldgrcodffsalkevafbkb.supabase.co/functions/v1/shopify-oauth-callback`;
    const scopes = 'read_products,write_products,read_orders,read_inventory,write_inventory';
    
    const shopifyAuthUrl = `https://${normalizedShop}/admin/oauth/authorize?` +
      `client_id=${clientId}&` +
      `scope=${encodeURIComponent(scopes)}&` +
      `redirect_uri=${encodeURIComponent(redirectUri)}&` +
      `state=${userId}`;

    console.log('Generated Shopify OAuth URL for shop:', normalizedShop);

    return new Response(
      JSON.stringify({ authUrl: shopifyAuthUrl }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200 
      }
    );
  } catch (error) {
    console.error('Error generating Shopify OAuth URL:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400 
      }
    );
  }
});

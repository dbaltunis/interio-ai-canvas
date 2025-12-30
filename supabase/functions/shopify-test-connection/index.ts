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
    const { shop_domain, access_token } = await req.json();

    console.log('[Shopify Test] Testing connection to:', shop_domain);

    // Validate inputs
    if (!shop_domain || !access_token) {
      return new Response(JSON.stringify({ 
        success: false, 
        error: 'Missing shop domain or access token' 
      }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Check token format
    if (!access_token.startsWith('shpat_')) {
      let errorMessage = 'Invalid token format. The Admin API access token should start with "shpat_".';
      
      if (access_token.startsWith('shpss_')) {
        errorMessage = 'You entered a Shared Secret (shpss_) instead of the Admin API Access Token (shpat_). The Access Token is found in the "API credentials" tab after installing your app.';
      } else if (access_token.startsWith('shpca_')) {
        errorMessage = 'You entered a Client API Access Token (shpca_) instead of the Admin API Access Token (shpat_). Please use the Admin API Access Token from the "API credentials" tab.';
      } else if (access_token.startsWith('shppa_')) {
        errorMessage = 'You entered a Private App Access Token (shppa_) which is deprecated. Please create a new app in the Dev Dashboard to get a token starting with "shpat_".';
      }

      return new Response(JSON.stringify({ 
        success: false, 
        error: errorMessage,
        error_type: 'invalid_token_format'
      }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Normalize shop domain
    let normalizedDomain = shop_domain.replace(/^https?:\/\//, '').split('/')[0];
    if (!normalizedDomain.includes('.myshopify.com')) {
      if (!normalizedDomain.includes('.')) {
        normalizedDomain = `${normalizedDomain}.myshopify.com`;
      }
    }

    // Test connection with a simple API call
    const response = await fetch(
      `https://${normalizedDomain}/admin/api/2024-01/shop.json`,
      {
        headers: {
          'X-Shopify-Access-Token': access_token,
          'Content-Type': 'application/json',
        },
      }
    );

    if (!response.ok) {
      const status = response.status;
      let errorMessage = 'Failed to connect to Shopify';
      let errorType = 'connection_failed';

      if (status === 401) {
        errorMessage = 'Invalid access token. Please check that you copied the correct Admin API Access Token from Shopify.';
        errorType = 'invalid_token';
      } else if (status === 403) {
        errorMessage = 'Access denied. The app may not have the required permissions. Please ensure you enabled the correct API scopes.';
        errorType = 'insufficient_permissions';
      } else if (status === 404) {
        errorMessage = 'Store not found. Please check that you entered the correct store URL (e.g., your-store.myshopify.com).';
        errorType = 'store_not_found';
      } else if (status === 429) {
        errorMessage = 'Too many requests. Please wait a moment and try again.';
        errorType = 'rate_limited';
      }

      console.error('[Shopify Test] Connection failed:', status, errorMessage);
      
      return new Response(JSON.stringify({ 
        success: false, 
        error: errorMessage,
        error_type: errorType,
        status_code: status
      }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const shopData = await response.json();
    const shop = shopData.shop;

    console.log('[Shopify Test] Connection successful:', shop.name);

    return new Response(JSON.stringify({ 
      success: true, 
      shop: {
        name: shop.name,
        email: shop.email,
        domain: shop.domain,
        myshopify_domain: shop.myshopify_domain,
        plan_name: shop.plan_name,
        currency: shop.currency,
      }
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('[Shopify Test] Error:', error);
    return new Response(JSON.stringify({ 
      success: false, 
      error: error.message || 'An unexpected error occurred',
      error_type: 'unknown'
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});

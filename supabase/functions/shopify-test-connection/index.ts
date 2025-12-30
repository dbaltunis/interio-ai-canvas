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
    const { shop_domain, client_id, client_secret, save_token } = await req.json();

    console.log('[Shopify Test] Testing connection to:', shop_domain);

    // Validate inputs
    if (!shop_domain || !client_id || !client_secret) {
      return new Response(JSON.stringify({ 
        success: false, 
        error: 'Missing shop domain, client ID, or client secret' 
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

    console.log('[Shopify Test] Normalized domain:', normalizedDomain);

    // Exchange client credentials for an access token
    const tokenUrl = `https://${normalizedDomain}/admin/oauth/access_token`;
    
    console.log('[Shopify Test] Requesting access token from:', tokenUrl);

    const tokenResponse = await fetch(tokenUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        client_id: client_id,
        client_secret: client_secret,
        grant_type: 'client_credentials',
      }),
    });

    if (!tokenResponse.ok) {
      const status = tokenResponse.status;
      let errorMessage = 'Failed to authenticate with Shopify';
      let errorType = 'auth_failed';

      if (status === 400) {
        const errorData = await tokenResponse.text();
        console.error('[Shopify Test] Token exchange error:', errorData);
        errorMessage = 'Invalid client credentials. Please check your Client ID and Client Secret are correct.';
        errorType = 'invalid_credentials';
      } else if (status === 401) {
        errorMessage = 'Invalid Client ID or Client Secret. Please double-check your credentials.';
        errorType = 'invalid_credentials';
      } else if (status === 403) {
        errorMessage = 'Access denied. Make sure your app is installed on this store.';
        errorType = 'not_installed';
      } else if (status === 404) {
        errorMessage = 'Store not found. Please check that you entered the correct store URL.';
        errorType = 'store_not_found';
      }

      console.error('[Shopify Test] Token exchange failed:', status, errorMessage);
      
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

    const tokenData = await tokenResponse.json();
    const accessToken = tokenData.access_token;
    
    // Calculate token expiration (24 hours from now for client credentials)
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString();

    console.log('[Shopify Test] Got access token, testing API access...');

    // Test connection with a simple API call using the new token
    const shopResponse = await fetch(
      `https://${normalizedDomain}/admin/api/2024-01/shop.json`,
      {
        headers: {
          'X-Shopify-Access-Token': accessToken,
          'Content-Type': 'application/json',
        },
      }
    );

    if (!shopResponse.ok) {
      const status = shopResponse.status;
      let errorMessage = 'Failed to connect to Shopify API';

      if (status === 401) {
        errorMessage = 'Access token is invalid. Please check your app permissions.';
      } else if (status === 403) {
        errorMessage = 'Access denied. Please ensure you enabled the required API scopes (read_products, read_orders, etc.).';
      }

      console.error('[Shopify Test] API test failed:', status);
      
      return new Response(JSON.stringify({ 
        success: false, 
        error: errorMessage,
        error_type: 'api_test_failed',
        status_code: status
      }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const shopData = await shopResponse.json();
    const shop = shopData.shop;

    console.log('[Shopify Test] Connection successful:', shop.name);

    const response: any = { 
      success: true, 
      shop: {
        name: shop.name,
        email: shop.email,
        domain: shop.domain,
        myshopify_domain: shop.myshopify_domain,
        plan_name: shop.plan_name,
        currency: shop.currency,
      }
    };

    // If save_token is true, include the token data for saving
    if (save_token) {
      response.access_token = accessToken;
      response.token_expires_at = expiresAt;
    }

    return new Response(JSON.stringify(response), {
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

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Get user from auth header
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      throw new Error('Missing authorization header');
    }

    const { data: { user }, error: authError } = await supabase.auth.getUser(
      authHeader.replace('Bearer ', '')
    );

    if (authError || !user) {
      throw new Error('Invalid authorization token');
    }

    console.log('Syncing Shopify products for user:', user.id);

    // Get Shopify integration
    const { data: integration, error: integrationError } = await supabase
      .from('shopify_integrations')
      .select('*')
      .eq('user_id', user.id)
      .eq('is_connected', true)
      .single();

    if (integrationError || !integration) {
      throw new Error('Shopify integration not found or not connected');
    }

    const { shop_domain, access_token } = integration;

    // Fetch products from Shopify
    const productsResponse = await fetch(
      `https://${shop_domain}/admin/api/2024-01/products.json`,
      {
        headers: {
          'X-Shopify-Access-Token': access_token,
          'Content-Type': 'application/json',
        },
      }
    );

    if (!productsResponse.ok) {
      const errorText = await productsResponse.text();
      throw new Error(`Failed to fetch products from Shopify: ${errorText}`);
    }

    const productsData = await productsResponse.json();
    const products = productsData.products || [];

    console.log(`Fetched ${products.length} products from Shopify`);

    // Sync products to inventory
    let syncedCount = 0;
    let errorCount = 0;

    for (const product of products) {
      try {
        // Map Shopify product to inventory item
        const inventoryItem = {
          user_id: user.id,
          name: product.title,
          description: product.body_html,
          sku: product.variants[0]?.sku || `SHOPIFY-${product.id}`,
          quantity: product.variants.reduce((sum: number, v: any) => sum + (v.inventory_quantity || 0), 0),
          cost_price: parseFloat(product.variants[0]?.price || '0'),
          selling_price: parseFloat(product.variants[0]?.price || '0'),
          category: product.product_type || 'Shopify',
          pricing_method: 'per_unit' as const,
          reorder_point: 10,
          reorder_quantity: 50,
          images: product.images?.map((img: any) => img.src) || [],
        };

        const { error: syncError } = await supabase
          .from('inventory')
          .upsert(inventoryItem, {
            onConflict: 'user_id,sku',
          });

        if (syncError) {
          console.error(`Error syncing product ${product.id}:`, syncError);
          errorCount++;
        } else {
          syncedCount++;
        }
      } catch (error) {
        console.error(`Error processing product ${product.id}:`, error);
        errorCount++;
      }
    }

    // Update last sync time
    await supabase
      .from('shopify_integrations')
      .update({ last_sync_at: new Date().toISOString() })
      .eq('id', integration.id);

    console.log(`Sync completed: ${syncedCount} products synced, ${errorCount} errors`);

    return new Response(
      JSON.stringify({
        success: true,
        synced: syncedCount,
        errors: errorCount,
        total: products.length,
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );

  } catch (error) {
    console.error('Shopify sync error:', error);
    
    return new Response(
      JSON.stringify({ 
        success: false,
        error: error.message || 'Internal server error',
      }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});

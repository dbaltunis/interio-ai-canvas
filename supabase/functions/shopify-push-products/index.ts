import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    console.log('[Shopify Push Products] Starting');
    
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Get user from authorization header
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(JSON.stringify({ error: 'Missing authorization' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const { data: { user }, error: authError } = await supabase.auth.getUser(
      authHeader.replace('Bearer ', '')
    );

    if (authError || !user) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Get products from request
    const { products } = await req.json();

    // Get Shopify integration
    const { data: integration, error: integrationError } = await supabase
      .from('shopify_integrations')
      .select('shop_domain, access_token')
      .eq('user_id', user.id)
      .single();

    if (integrationError || !integration) {
      return new Response(JSON.stringify({ error: 'Shopify integration not found' }), {
        status: 404,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const { shop_domain, access_token } = integration;
    let syncedCount = 0;
    let errorCount = 0;

    // Push each product to Shopify
    for (const product of products) {
      try {
        // Validate required fields
        if (!product.name || product.name.trim() === '') {
          errorCount++;
          console.error(`[Shopify Push Products] Skipping product ${product.id}: missing name`);
          continue;
        }

        if (!product.sku || product.sku.trim() === '') {
          errorCount++;
          console.error(`[Shopify Push Products] Skipping product ${product.name}: missing SKU`);
          continue;
        }

        const shopifyProduct = {
          product: {
            title: product.name,
            body_html: product.description || '',
            vendor: 'InterioApp',
            product_type: product.category || 'Curtains & Blinds',
            tags: [product.subcategory, product.category].filter(Boolean).join(', '),
            variants: [{
              option1: 'Default',
              price: product.unit_price?.toString() || '0',
              inventory_quantity: product.stock_quantity || 0,
              inventory_management: 'shopify',
              sku: product.sku,
            }],
            images: product.image_url ? [{
              src: product.image_url,
            }] : [],
          },
        };

        // Check if product exists by SKU
        const searchResponse = await fetch(
          `https://${shop_domain}/admin/api/2024-01/products.json?limit=1&fields=id,variants&vendor=InterioApp`,
          {
            headers: {
              'X-Shopify-Access-Token': access_token,
              'Content-Type': 'application/json',
            },
          }
        );

        if (searchResponse.ok) {
          const searchData = await searchResponse.json();
          const existingProduct = searchData.products?.find((p: any) =>
            p.variants?.some((v: any) => v.sku === (product.sku || product.product_code))
          );

          let response;
          if (existingProduct) {
            // Update existing product
            response = await fetch(
              `https://${shop_domain}/admin/api/2024-01/products/${existingProduct.id}.json`,
              {
                method: 'PUT',
                headers: {
                  'X-Shopify-Access-Token': access_token,
                  'Content-Type': 'application/json',
                },
                body: JSON.stringify(shopifyProduct),
              }
            );
          } else {
            // Create new product
            response = await fetch(
              `https://${shop_domain}/admin/api/2024-01/products.json`,
              {
                method: 'POST',
                headers: {
                  'X-Shopify-Access-Token': access_token,
                  'Content-Type': 'application/json',
                },
                body: JSON.stringify(shopifyProduct),
              }
            );
          }

          if (response.ok) {
            syncedCount++;
            console.log(`[Shopify Push Products] Synced: ${product.name}`);
          } else {
            errorCount++;
            const errorData = await response.json();
            console.error(`[Shopify Push Products] Error syncing ${product.name}:`, errorData);
          }
        }
      } catch (error) {
        errorCount++;
        console.error(`[Shopify Push Products] Error syncing product ${product.name}:`, error);
      }
    }

    console.log(`[Shopify Push Products] Completed. Synced: ${syncedCount}, Errors: ${errorCount}`);

    return new Response(JSON.stringify({
      success: true,
      synced: syncedCount,
      errors: errorCount,
      total: products.length,
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('[Shopify Push Products] Error:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    console.log('[Shopify Pull Products] Starting');
    
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(JSON.stringify({ error: 'Missing authorization' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const { userId, syncSettings } = await req.json();
    console.log('[Shopify Pull Products] User ID:', userId);
    console.log('[Shopify Pull Products] Sync settings:', syncSettings);

    // Get Shopify integration
    const { data: integration, error: integrationError } = await supabase
      .from('shopify_integrations')
      .select('*')
      .eq('user_id', userId)
      .eq('is_connected', true)
      .single();

    if (integrationError || !integration) {
      console.error('[Shopify Pull Products] Integration error:', integrationError);
      return new Response(JSON.stringify({ error: 'Shopify not connected' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    console.log('[Shopify Pull Products] Integration found:', integration.shop_domain);

    const shopifyApiUrl = `https://${integration.shop_domain}/admin/api/2024-01/products.json`;
    let allProducts: any[] = [];
    let nextPageUrl: string | null = shopifyApiUrl;
    let pageCount = 0;

    // Fetch all products with pagination
    while (nextPageUrl && pageCount < 100) { // Limit to 100 pages (25000 products max)
      pageCount++;
      console.log(`[Shopify Pull Products] Fetching page ${pageCount}...`);
      
      const response = await fetch(nextPageUrl + '?limit=250', {
        headers: {
          'X-Shopify-Access-Token': integration.access_token,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('[Shopify Pull Products] Shopify API error:', errorText);
        throw new Error(`Shopify API error: ${response.status}`);
      }

      const data = await response.json();
      allProducts = allProducts.concat(data.products || []);
      
      // Check for pagination link
      const linkHeader = response.headers.get('Link');
      if (linkHeader && linkHeader.includes('rel="next"')) {
        const nextMatch = linkHeader.match(/<([^>]+)>;\s*rel="next"/);
        nextPageUrl = nextMatch ? nextMatch[1] : null;
      } else {
        nextPageUrl = null;
      }
    }

    console.log(`[Shopify Pull Products] Fetched ${allProducts.length} products total`);

    let importedCount = 0;
    let updatedCount = 0;
    let errorCount = 0;

    // Process products in batches
    const batchSize = 50;
    for (let i = 0; i < allProducts.length; i += batchSize) {
      const batch = allProducts.slice(i, i + batchSize);
      
      for (const shopifyProduct of batch) {
        try {
          // Map Shopify product to inventory format
          const inventoryItem: any = {
            user_id: userId,
            name: shopifyProduct.title,
            description: shopifyProduct.body_html || '',
            sku: shopifyProduct.variants?.[0]?.sku || `SHOP-${shopifyProduct.id}`,
            category: shopifyProduct.product_type || 'product',
            subcategory: shopifyProduct.vendor || 'general',
          };

          // Add pricing if sync enabled
          if (syncSettings?.sync_prices) {
            inventoryItem.selling_price = parseFloat(shopifyProduct.variants?.[0]?.price || '0');
            inventoryItem.cost_price = parseFloat(shopifyProduct.variants?.[0]?.compare_at_price || '0') || inventoryItem.selling_price * 0.7;
          }

          // Add inventory if sync enabled
          if (syncSettings?.sync_inventory) {
            inventoryItem.quantity = shopifyProduct.variants?.[0]?.inventory_quantity || 0;
          }

          // Add image if sync enabled
          if (syncSettings?.sync_images && shopifyProduct.images?.[0]) {
            inventoryItem.image_url = shopifyProduct.images[0].src;
          }

          inventoryItem.unit = 'units';
          inventoryItem.active = shopifyProduct.status === 'active';

          // Check if product exists by SKU
          const { data: existing } = await supabase
            .from('inventory')
            .select('id')
            .eq('user_id', userId)
            .eq('sku', inventoryItem.sku)
            .maybeSingle();

          if (existing) {
            // Update existing product
            const { error: updateError } = await supabase
              .from('inventory')
              .update(inventoryItem)
              .eq('id', existing.id);

            if (updateError) {
              console.error(`[Shopify Pull Products] Error updating product:`, updateError);
              errorCount++;
            } else {
              updatedCount++;
            }
          } else {
            // Insert new product
            const { error: insertError } = await supabase
              .from('inventory')
              .insert(inventoryItem);

            if (insertError) {
              console.error(`[Shopify Pull Products] Error inserting product:`, insertError);
              errorCount++;
            } else {
              importedCount++;
            }
          }

        } catch (error) {
          console.error(`[Shopify Pull Products] Error processing product:`, error);
          errorCount++;
        }
      }

      // Log progress
      console.log(`[Shopify Pull Products] Processed ${Math.min(i + batchSize, allProducts.length)} of ${allProducts.length} products`);
    }

    // Update last sync time
    await supabase
      .from('shopify_integrations')
      .update({ last_sync_at: new Date().toISOString() })
      .eq('user_id', userId);

    console.log(`[Shopify Pull Products] Completed. Imported: ${importedCount}, Updated: ${updatedCount}, Errors: ${errorCount}`);

    return new Response(JSON.stringify({
      success: true,
      imported: importedCount,
      updated: updatedCount,
      errors: errorCount,
      total: allProducts.length,
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('[Shopify Pull Products] Error:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const url = new URL(req.url);
    const account_id = url.searchParams.get('account_id');
    const api_key = url.searchParams.get('api_key');
    const category = url.searchParams.get('category');
    const collection = url.searchParams.get('collection');
    const subcategory = url.searchParams.get('subcategory');
    const search = url.searchParams.get('search');
    const limit = parseInt(url.searchParams.get('limit') || '50');
    const offset = parseInt(url.searchParams.get('offset') || '0');

    // Validate required parameters
    if (!account_id) {
      return new Response(
        JSON.stringify({ success: false, error: 'account_id is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (!api_key) {
      return new Response(
        JSON.stringify({ success: false, error: 'api_key is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Create Supabase client with service role for admin access
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    );

    // Validate API key against account settings
    const { data: accountSettings, error: accountError } = await supabase
      .from('account_settings')
      .select('account_owner_id, storefront_api_key, currency')
      .eq('account_owner_id', account_id)
      .single();

    if (accountError || !accountSettings) {
      console.error('Account not found:', accountError);
      return new Response(
        JSON.stringify({ success: false, error: 'Account not found' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (accountSettings.storefront_api_key !== api_key) {
      console.error('Invalid API key for account:', account_id);
      return new Response(
        JSON.stringify({ success: false, error: 'Invalid API key' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`Fetching catalog for account: ${account_id}, category: ${category}, limit: ${limit}, offset: ${offset}`);

    // Build query for inventory items - SECURITY: Only select public-safe fields, exclude cost_price
    let query = supabase
      .from('enhanced_inventory_items')
      .select(`
        id,
        name,
        sku,
        category,
        subcategory,
        collection_name,
        fabric_collection,
        color,
        width,
        fabric_width,
        fabric_composition,
        pattern_repeat_vertical,
        pattern_repeat_horizontal,
        image_url,
        selling_price,
        quantity,
        active
      `, { count: 'exact' })
      .eq('user_id', account_id)
      .eq('active', true);

    // Apply filters
    if (category) {
      query = query.eq('category', category);
    }

    if (subcategory) {
      query = query.eq('subcategory', subcategory);
    }

    if (collection) {
      query = query.or(`collection_name.ilike.%${collection}%,fabric_collection.ilike.%${collection}%`);
    }

    if (search) {
      query = query.or(`name.ilike.%${search}%,sku.ilike.%${search}%,color.ilike.%${search}%`);
    }

    // Apply pagination
    query = query
      .range(offset, offset + limit - 1)
      .order('name', { ascending: true });

    const { data: items, error: itemsError, count } = await query;

    if (itemsError) {
      console.error('Error fetching inventory:', itemsError);
      return new Response(
        JSON.stringify({ success: false, error: 'Failed to fetch catalog' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Transform to storefront-friendly format
    const catalogItems = (items || []).map(item => ({
      id: item.id,
      name: item.name,
      sku: item.sku,
      category: item.category,
      subcategory: item.subcategory,
      collection: item.collection_name || item.fabric_collection,
      color: item.color,
      width_cm: item.width || item.fabric_width,
      composition: item.fabric_composition,
      pattern_repeat: item.pattern_repeat_vertical || item.pattern_repeat_horizontal,
      image_url: item.image_url,
      price_per_meter: item.selling_price,
      currency: accountSettings.currency || 'EUR',
      in_stock: item.quantity === null || item.quantity > 0 // null means not tracking stock
    }));

    const total = count || 0;
    const hasMore = offset + limit < total;

    console.log(`Returning ${catalogItems.length} items out of ${total} total`);

    return new Response(
      JSON.stringify({
        success: true,
        data: catalogItems,
        pagination: {
          total,
          limit,
          offset,
          has_more: hasMore
        }
      }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Storefront catalog error:', error);
    return new Response(
      JSON.stringify({ success: false, error: 'Internal server error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});

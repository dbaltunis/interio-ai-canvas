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
    const treatment_type = url.searchParams.get('treatment_type'); // curtains, blinds, shutters
    const template_id = url.searchParams.get('template_id');

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

    console.log(`Fetching options for account: ${account_id}, treatment_type: ${treatment_type || 'all'}`);

    // Fetch curtain templates
    let templatesQuery = supabase
      .from('curtain_templates')
      .select(`
        id,
        name,
        description,
        treatment_category,
        image_url,
        display_image_url,
        fullness_ratio,
        fabric_direction,
        active
      `)
      .eq('user_id', account_id)
      .eq('active', true);

    if (treatment_type) {
      templatesQuery = templatesQuery.eq('treatment_category', treatment_type);
    }

    if (template_id) {
      templatesQuery = templatesQuery.eq('id', template_id);
    }

    const { data: templates, error: templatesError } = await templatesQuery.order('name');

    if (templatesError) {
      console.error('Error fetching templates:', templatesError);
      // Continue without templates - they might not exist yet
    }

    // Fetch treatment options (headings, linings, etc.)
    const { data: treatmentOptions, error: optionsError } = await supabase
      .from('treatment_options')
      .select(`
        id,
        name,
        option_key,
        display_order,
        is_required,
        treatment_category,
        option_values (
          id,
          name,
          value_key,
          display_order,
          is_default,
          price_modifier,
          description,
          image_url
        )
      `)
      .eq('org_id', account_id)
      .eq('is_active', true)
      .order('display_order');

    if (optionsError) {
      console.error('Error fetching treatment options:', optionsError);
      // Continue without options - they might not exist yet
    }

    // Fetch inventory items that serve as options (headings, linings, accessories)
    const optionCategories = ['heading', 'lining', 'accessory', 'treatment_option'];
    const { data: inventoryOptions, error: invOptionsError } = await supabase
      .from('enhanced_inventory_items')
      .select(`
        id,
        name,
        sku,
        category,
        subcategory,
        image_url,
        selling_price,
        description,
        fullness_ratio
      `)
      .eq('user_id', account_id)
      .eq('active', true)
      .in('category', optionCategories)
      .order('name');

    if (invOptionsError) {
      console.error('Error fetching inventory options:', invOptionsError);
    }

    // Group inventory options by category
    const groupedInventoryOptions: Record<string, any[]> = {};
    (inventoryOptions || []).forEach(item => {
      const category = item.category || 'other';
      if (!groupedInventoryOptions[category]) {
        groupedInventoryOptions[category] = [];
      }
      groupedInventoryOptions[category].push({
        id: item.id,
        name: item.name,
        sku: item.sku,
        subcategory: item.subcategory,
        image_url: item.image_url,
        price: item.selling_price,
        description: item.description,
        fullness_ratio: item.fullness_ratio
      });
    });

    // Transform templates for storefront
    const storefrontTemplates = (templates || []).map(template => ({
      id: template.id,
      name: template.name,
      description: template.description,
      treatment_type: template.treatment_category,
      image_url: template.display_image_url || template.image_url,
      fullness_ratio: template.fullness_ratio,
      fabric_orientation: template.fabric_direction
    }));

    // Transform treatment options for storefront
    const storefrontOptions = (treatmentOptions || []).map(option => ({
      id: option.id,
      key: option.option_key,
      label: option.name,
      required: option.is_required,
      treatment_category: option.treatment_category,
      values: (option.option_values || [])
        .sort((a: any, b: any) => (a.display_order || 0) - (b.display_order || 0))
        .map((value: any) => ({
          id: value.id,
          code: value.value_key,
          label: value.name,
          description: value.description,
          image_url: value.image_url,
          price_modifier: value.price_modifier,
          is_default: value.is_default
        }))
    }));

    console.log(`Returning ${storefrontTemplates.length} templates, ${storefrontOptions.length} options, ${Object.keys(groupedInventoryOptions).length} inventory option categories`);

    return new Response(
      JSON.stringify({
        success: true,
        templates: storefrontTemplates,
        options: storefrontOptions,
        inventory_options: groupedInventoryOptions,
        currency: accountSettings.currency || 'EUR'
      }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Storefront options error:', error);
    return new Response(
      JSON.stringify({ success: false, error: 'Internal server error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});

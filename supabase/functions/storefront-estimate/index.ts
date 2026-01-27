import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface EstimateRequest {
  account_id: string;
  api_key: string;
  fabric_id?: string;
  template_id?: string;
  width_mm: number;
  drop_mm: number;
  quantity?: number;
  options?: Record<string, string>;
}

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  if (req.method !== 'POST') {
    return new Response(
      JSON.stringify({ success: false, error: 'Method not allowed' }),
      { status: 405, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }

  try {
    const body: EstimateRequest = await req.json();
    const { 
      account_id, 
      api_key, 
      fabric_id, 
      template_id, 
      width_mm, 
      drop_mm, 
      quantity = 1,
      options = {}
    } = body;

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

    if (!width_mm || !drop_mm) {
      return new Response(
        JSON.stringify({ success: false, error: 'width_mm and drop_mm are required' }),
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

    console.log(`Calculating estimate for account: ${account_id}, fabric: ${fabric_id}, template: ${template_id}`);
    console.log(`Dimensions: ${width_mm}mm x ${drop_mm}mm, quantity: ${quantity}`);

    // Fetch business settings for pricing configuration
    const { data: businessSettings } = await supabase
      .from('business_settings')
      .select('default_profit_margin_percentage, tax_rate, measurement_units')
      .eq('user_id', account_id)
      .maybeSingle();

    const taxRate = businessSettings?.tax_rate || 0;
    const marginPercent = businessSettings?.default_profit_margin_percentage || 30;

    // Convert mm to meters for calculations
    const widthM = width_mm / 1000;
    const dropM = drop_mm / 1000;

    let fabricCost = 0;
    let fabricMeters = 0;
    let fabricName = '';
    let fabricWidth = 1.4; // Default fabric width in meters

    // Fetch fabric details if provided
    if (fabric_id) {
      const { data: fabric, error: fabricError } = await supabase
        .from('enhanced_inventory_items')
        .select('id, name, selling_price, width, pattern_repeat, fabric_orientation')
        .eq('id', fabric_id)
        .eq('user_id', account_id)
        .single();

      if (fabricError || !fabric) {
        console.error('Fabric not found:', fabricError);
        return new Response(
          JSON.stringify({ success: false, error: 'Fabric not found' }),
          { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      fabricName = fabric.name;
      fabricWidth = (fabric.width || 140) / 100; // Convert cm to meters
      const pricePerMeter = fabric.selling_price || 0;
      const patternRepeat = fabric.pattern_repeat || 0;

      // Fetch template for fullness ratio
      let fullnessRatio = 2.0; // Default fullness for curtains
      if (template_id) {
        const { data: template } = await supabase
          .from('curtain_templates')
          .select('fullness_ratio, fabric_orientation')
          .eq('id', template_id)
          .single();
        
        if (template?.fullness_ratio) {
          fullnessRatio = template.fullness_ratio;
        }
      }

      // Calculate fabric required
      // Total width needed with fullness
      const finishedWidth = widthM * fullnessRatio;
      
      // Number of fabric widths needed (horizontal pieces)
      const widthsNeeded = Math.ceil(finishedWidth / fabricWidth);
      
      // Cut drop (including allowances for header and hem)
      const headerAllowance = 0.15; // 15cm
      const hemAllowance = 0.15; // 15cm
      let cutDrop = dropM + headerAllowance + hemAllowance;
      
      // Add pattern repeat if applicable
      if (patternRepeat > 0) {
        const repeatM = patternRepeat / 100; // Convert cm to m
        cutDrop = Math.ceil(cutDrop / repeatM) * repeatM;
      }
      
      // Total meters of fabric needed
      fabricMeters = widthsNeeded * cutDrop * quantity;
      
      // Round up to nearest 0.1m
      fabricMeters = Math.ceil(fabricMeters * 10) / 10;
      
      fabricCost = fabricMeters * pricePerMeter;

      console.log(`Fabric calculation: ${widthsNeeded} widths x ${cutDrop.toFixed(2)}m cut drop x ${quantity} = ${fabricMeters}m @ ${pricePerMeter}/m = ${fabricCost.toFixed(2)}`);
    }

    // Calculate making/labor cost (simplified estimate)
    // This is a basic estimate - actual pricing would use the account's pricing templates
    let makingCost = 0;
    
    // Base making cost per unit
    const baseMakingCost = 50; // Base making charge per curtain
    const perMeterLabor = 5; // Additional labor per meter of fabric
    
    makingCost = (baseMakingCost + (fabricMeters * perMeterLabor)) * quantity;

    // Calculate option costs
    let optionsCost = 0;
    const optionBreakdown: Record<string, number> = {};

    // Fetch option prices if options provided
    if (Object.keys(options).length > 0) {
      for (const [optionKey, optionValue] of Object.entries(options)) {
        // Check if option value has a price modifier in treatment options
        const { data: optionData } = await supabase
          .from('option_values')
          .select('price_modifier, name')
          .eq('value_key', optionValue)
          .maybeSingle();

        if (optionData?.price_modifier) {
          optionBreakdown[optionKey] = optionData.price_modifier * quantity;
          optionsCost += optionData.price_modifier * quantity;
        }

        // Also check inventory items for option items (like linings, headings)
        const { data: invOption } = await supabase
          .from('enhanced_inventory_items')
          .select('selling_price, name')
          .eq('user_id', account_id)
          .or(`sku.eq.${optionValue},id.eq.${optionValue}`)
          .maybeSingle();

        if (invOption?.selling_price) {
          // For fabric-like options, calculate based on meterage
          const optionCost = invOption.selling_price * fabricMeters;
          optionBreakdown[optionKey] = (optionBreakdown[optionKey] || 0) + optionCost;
          optionsCost += optionCost;
        }
      }
    }

    // Calculate subtotal
    const subtotal = fabricCost + makingCost + optionsCost;
    
    // Add tax if applicable
    const taxAmount = subtotal * (taxRate / 100);
    const total = subtotal + taxAmount;

    // Round to 2 decimal places
    const estimate = {
      fabric_name: fabricName || null,
      fabric_meters: Math.round(fabricMeters * 100) / 100,
      fabric_cost: Math.round(fabricCost * 100) / 100,
      making_cost: Math.round(makingCost * 100) / 100,
      options_cost: Math.round(optionsCost * 100) / 100,
      options_breakdown: optionBreakdown,
      subtotal: Math.round(subtotal * 100) / 100,
      tax_rate: taxRate,
      tax_amount: Math.round(taxAmount * 100) / 100,
      total: Math.round(total * 100) / 100,
      currency: accountSettings.currency || 'EUR',
      quantity,
      dimensions: {
        width_mm,
        drop_mm
      },
      note: 'This is an estimate. Final price may vary based on site measurements and additional requirements.'
    };

    console.log(`Estimate calculated: total ${estimate.total} ${estimate.currency}`);

    return new Response(
      JSON.stringify({
        success: true,
        estimate
      }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Storefront estimate error:', error);
    return new Response(
      JSON.stringify({ success: false, error: 'Internal server error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});

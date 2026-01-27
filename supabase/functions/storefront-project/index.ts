import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface CustomerInfo {
  name: string;
  email: string;
  phone?: string;
}

interface ProjectItem {
  fabric_id?: string;
  template_id?: string;
  width_mm: number;
  drop_mm: number;
  quantity?: number;
  room_name?: string;
  options?: Record<string, string>;
  notes?: string;
}

interface ProjectRequest {
  account_id: string;
  api_key: string;
  customer: CustomerInfo;
  items: ProjectItem[];
  source?: string;
  message?: string;
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
    const body: ProjectRequest = await req.json();
    const { account_id, api_key, customer, items, source = 'storefront', message } = body;

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

    if (!customer?.name || !customer?.email) {
      return new Response(
        JSON.stringify({ success: false, error: 'customer.name and customer.email are required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(customer.email)) {
      return new Response(
        JSON.stringify({ success: false, error: 'Invalid email format' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (!items || !Array.isArray(items) || items.length === 0) {
      return new Response(
        JSON.stringify({ success: false, error: 'items array is required and cannot be empty' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Validate each item has dimensions
    for (let i = 0; i < items.length; i++) {
      if (!items[i].width_mm || !items[i].drop_mm) {
        return new Response(
          JSON.stringify({ success: false, error: `Item ${i + 1}: width_mm and drop_mm are required` }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
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

    console.log(`Creating project for account: ${account_id}, customer: ${customer.email}, items: ${items.length}`);

    // Fetch business settings for pricing configuration
    const { data: businessSettings } = await supabase
      .from('business_settings')
      .select('default_profit_margin_percentage, tax_rate, company_name')
      .eq('user_id', account_id)
      .maybeSingle();

    const taxRate = businessSettings?.tax_rate || 0;
    const currency = accountSettings.currency || 'EUR';

    // ========================================
    // Step 1: Find or create client
    // ========================================
    let clientId: string;
    let isNewClient = false;

    const { data: existingClient } = await supabase
      .from('clients')
      .select('id, name')
      .eq('user_id', account_id)
      .eq('email', customer.email.toLowerCase().trim())
      .maybeSingle();

    if (existingClient) {
      clientId = existingClient.id;
      console.log(`Found existing client: ${clientId}`);
    } else {
      // Create new client
      const { data: newClient, error: clientError } = await supabase
        .from('clients')
        .insert({
          user_id: account_id,
          name: customer.name.trim(),
          email: customer.email.toLowerCase().trim(),
          phone: customer.phone?.trim(),
          lead_source: source,
          notes: message ? `Online quote request: ${message}` : undefined,
          funnel_stage: 'lead',
        })
        .select('id')
        .single();

      if (clientError) {
        console.error('Error creating client:', clientError);
        return new Response(
          JSON.stringify({ success: false, error: 'Failed to create client' }),
          { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      clientId = newClient.id;
      isNewClient = true;
      console.log(`Created new client: ${clientId}`);
    }

    // ========================================
    // Step 2: Create Project
    // ========================================
    const { data: project, error: projectError } = await supabase
      .from('projects')
      .insert({
        user_id: account_id,
        client_id: clientId,
        name: `Online Quote - ${customer.name}`,
        description: message || null,
        source: source,
        status: 'planning',
      })
      .select('id, name')
      .single();

    if (projectError) {
      console.error('Error creating project:', projectError);
      return new Response(
        JSON.stringify({ success: false, error: 'Failed to create project' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`Created project: ${project.id}`);

    // ========================================
    // Step 3: Create Quote
    // ========================================
    const { data: quote, error: quoteError } = await supabase
      .from('quotes')
      .insert({
        user_id: account_id,
        client_id: clientId,
        project_id: project.id,
        status: 'draft',
      })
      .select('id, quote_number')
      .single();

    if (quoteError) {
      console.error('Error creating quote:', quoteError);
      return new Response(
        JSON.stringify({ success: false, error: 'Failed to create quote' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`Created quote: ${quote.id}, number: ${quote.quote_number}`);

    // ========================================
    // Step 4: Process items - Create rooms and treatments
    // ========================================
    const treatmentResults: Array<{
      id: string;
      room_name: string;
      fabric_name: string | null;
      unit_price: number;
      total_price: number;
    }> = [];

    let quoteSubtotal = 0;

    // Group items by room name for room creation
    const roomMap = new Map<string, string>(); // room_name -> room_id

    for (let i = 0; i < items.length; i++) {
      const item = items[i];
      const roomName = item.room_name || `Room ${i + 1}`;
      const quantity = item.quantity || 1;

      // Create room if not exists
      if (!roomMap.has(roomName)) {
        const { data: room, error: roomError } = await supabase
          .from('rooms')
          .insert({
            project_id: project.id,
            quote_id: quote.id,
            name: roomName,
            user_id: account_id,
          })
          .select('id')
          .single();

        if (roomError) {
          console.error(`Error creating room ${roomName}:`, roomError);
          continue;
        }
        roomMap.set(roomName, room.id);
      }

      const roomId = roomMap.get(roomName)!;

      // Calculate pricing (similar to storefront-estimate logic)
      const widthM = item.width_mm / 1000;
      const dropM = item.drop_mm / 1000;

      let fabricCost = 0;
      let fabricMeters = 0;
      let fabricName: string | null = null;
      let fabricWidth = 1.4; // Default fabric width in meters
      let fullnessRatio = 2.0; // Default fullness

      // Fetch fabric details if provided
      if (item.fabric_id) {
        const { data: fabric, error: fabricError } = await supabase
          .from('enhanced_inventory_items')
          .select('id, name, selling_price, width, fabric_width, pattern_repeat_vertical')
          .eq('id', item.fabric_id)
          .eq('user_id', account_id)
          .single();

        if (fabricError || !fabric) {
          console.error(`Fabric not found: ${item.fabric_id}`, fabricError);
          return new Response(
            JSON.stringify({ success: false, error: `Fabric not found: ${item.fabric_id}` }),
            { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }

        fabricName = fabric.name;
        fabricWidth = ((fabric.width || fabric.fabric_width || 140) / 100);
        const pricePerMeter = fabric.selling_price || 0;
        const patternRepeat = fabric.pattern_repeat_vertical || 0;

        // Fetch template for fullness ratio
        if (item.template_id) {
          const { data: template } = await supabase
            .from('curtain_templates')
            .select('fullness_ratio')
            .eq('id', item.template_id)
            .single();
          
          if (template?.fullness_ratio) {
            fullnessRatio = template.fullness_ratio;
          }
        }

        // Calculate fabric required
        const finishedWidth = widthM * fullnessRatio;
        const widthsNeeded = Math.ceil(finishedWidth / fabricWidth);
        
        // Cut drop with allowances
        const headerAllowance = 0.15;
        const hemAllowance = 0.15;
        let cutDrop = dropM + headerAllowance + hemAllowance;
        
        // Pattern repeat
        if (patternRepeat > 0) {
          const repeatM = patternRepeat / 100;
          cutDrop = Math.ceil(cutDrop / repeatM) * repeatM;
        }
        
        fabricMeters = Math.ceil(widthsNeeded * cutDrop * quantity * 10) / 10;
        fabricCost = fabricMeters * pricePerMeter;
      }

      // Base making cost
      const baseMakingCost = 50;
      const perMeterLabor = 5;
      const makingCost = (baseMakingCost + (fabricMeters * perMeterLabor)) * quantity;

      // Options cost (simplified)
      let optionsCost = 0;
      if (item.options) {
        for (const [optionKey, optionValue] of Object.entries(item.options)) {
          const { data: optionData } = await supabase
            .from('option_values')
            .select('price_modifier')
            .eq('value_key', optionValue)
            .maybeSingle();

          if (optionData?.price_modifier) {
            optionsCost += optionData.price_modifier * quantity;
          }
        }
      }

      // Calculate item total
      const itemSubtotal = fabricCost + makingCost + optionsCost;
      const unitPrice = Math.round((itemSubtotal / quantity) * 100) / 100;
      const totalPrice = Math.round(itemSubtotal * 100) / 100;

      quoteSubtotal += totalPrice;

      // Create treatment record
      const { data: treatment, error: treatmentError } = await supabase
        .from('treatments')
        .insert({
          room_id: roomId,
          user_id: account_id,
          type: 'curtains',
          name: fabricName || `Treatment ${i + 1}`,
          measurements: {
            width: item.width_mm,
            height: item.drop_mm,
            unit: 'mm',
          },
          fabric_details: item.fabric_id ? { fabric_id: item.fabric_id, fabric_name: fabricName } : null,
          options: item.options || null,
          quantity: quantity,
          unit_price: unitPrice,
          total: totalPrice,
          notes: item.notes || null,
        })
        .select('id')
        .single();

      if (treatmentError) {
        console.error(`Error creating treatment:`, treatmentError);
        continue;
      }

      treatmentResults.push({
        id: treatment.id,
        room_name: roomName,
        fabric_name: fabricName,
        unit_price: unitPrice,
        total_price: totalPrice,
      });
    }

    // ========================================
    // Step 5: Update quote totals
    // ========================================
    const taxAmount = Math.round(quoteSubtotal * (taxRate / 100) * 100) / 100;
    const quoteTotal = Math.round((quoteSubtotal + taxAmount) * 100) / 100;

    await supabase
      .from('quotes')
      .update({
        subtotal: quoteSubtotal,
        tax_amount: taxAmount,
        total_amount: quoteTotal,
      })
      .eq('id', quote.id);

    // ========================================
    // Step 6: Log activity and notify
    // ========================================
    await supabase
      .from('client_activity_log')
      .insert({
        client_id: clientId,
        user_id: account_id,
        activity_type: 'note',
        title: 'Online Quote Request',
        description: `Quote created via ${source} with ${items.length} item(s). Total: ${currency} ${quoteTotal.toFixed(2)}`,
        metadata: {
          source,
          project_id: project.id,
          quote_id: quote.id,
          items_count: items.length,
          total: quoteTotal,
        },
      });

    await supabase
      .from('user_notifications')
      .insert({
        user_id: account_id,
        title: `New Online Quote: ${customer.name}`,
        message: `${items.length} item(s) - ${currency} ${quoteTotal.toFixed(2)}`,
        type: 'project',
        priority: 'high',
        metadata: {
          project_id: project.id,
          quote_id: quote.id,
          client_id: clientId,
          source,
        },
      });

    console.log(`Project completed: ${project.id}, quote total: ${quoteTotal} ${currency}`);

    return new Response(
      JSON.stringify({
        success: true,
        project: {
          id: project.id,
          title: project.name,
          quote_number: quote.quote_number,
        },
        quote: {
          id: quote.id,
          subtotal: quoteSubtotal,
          tax_rate: taxRate,
          tax_amount: taxAmount,
          total: quoteTotal,
          currency,
        },
        treatments: treatmentResults,
        client_id: clientId,
        is_new_client: isNewClient,
      }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Storefront project error:', error);
    return new Response(
      JSON.stringify({ success: false, error: 'Internal server error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});

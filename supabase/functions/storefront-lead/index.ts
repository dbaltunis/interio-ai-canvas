import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface LeadRequest {
  account_id: string;
  api_key: string;
  name: string;
  email: string;
  phone?: string;
  message?: string;
  product_interest?: string;
  source?: string;
  configuration_data?: Record<string, any>;
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
    const body: LeadRequest = await req.json();
    const { account_id, api_key, name, email, phone, message, product_interest, source, configuration_data } = body;

    // Validate required fields
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

    if (!name || !email) {
      return new Response(
        JSON.stringify({ success: false, error: 'name and email are required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return new Response(
        JSON.stringify({ success: false, error: 'Invalid email format' }),
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
      .select('account_owner_id, storefront_api_key')
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

    console.log(`Creating lead for account: ${account_id}, email: ${email}, source: ${source || 'storefront'}`);

    // Check for existing client with same email
    const { data: existingClient } = await supabase
      .from('clients')
      .select('id, name, email')
      .eq('user_id', account_id)
      .eq('email', email)
      .maybeSingle();

    let clientId: string;
    let isNewClient = false;

    if (existingClient) {
      clientId = existingClient.id;
      console.log(`Found existing client: ${clientId}`);
    } else {
      // Create new client
      const { data: newClient, error: clientError } = await supabase
        .from('clients')
        .insert({
          user_id: account_id,
          name: name.trim(),
          email: email.toLowerCase().trim(),
          phone: phone?.trim(),
          lead_source: source || 'storefront',
          notes: message ? `Initial inquiry: ${message}` : undefined,
          funnel_stage: 'lead',
          tags: product_interest ? [product_interest] : []
        })
        .select('id')
        .single();

      if (clientError) {
        console.error('Error creating client:', clientError);
        return new Response(
          JSON.stringify({ success: false, error: 'Failed to create lead' }),
          { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      clientId = newClient.id;
      isNewClient = true;
      console.log(`Created new client: ${clientId}`);
    }

    // Log the activity
    const activityNote = [
      `Storefront inquiry from ${source || 'external website'}`,
      product_interest ? `Product interest: ${product_interest}` : null,
      message ? `Message: ${message}` : null,
      configuration_data ? `Configuration: ${JSON.stringify(configuration_data)}` : null
    ].filter(Boolean).join('\n');

    await supabase
      .from('client_activity_log')
      .insert({
        client_id: clientId,
        user_id: account_id,
        activity_type: 'note',
        description: activityNote,
        metadata: {
          source: source || 'storefront',
          product_interest,
          configuration_data,
          is_new_client: isNewClient
        }
      });

    // Create notification for account owner
    await supabase
      .from('user_notifications')
      .insert({
        user_id: account_id,
        title: `New ${isNewClient ? 'Lead' : 'Inquiry'}: ${name}`,
        message: `${email}${product_interest ? ` - interested in ${product_interest}` : ''}`,
        type: 'lead',
        priority: 'normal',
        metadata: {
          client_id: clientId,
          source: source || 'storefront',
          product_interest
        }
      });

    console.log(`Lead processed successfully: ${clientId}, new: ${isNewClient}`);

    return new Response(
      JSON.stringify({
        success: true,
        lead_id: clientId,
        is_new_lead: isNewClient,
        message: isNewClient ? 'Lead created successfully' : 'Inquiry added to existing contact'
      }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Storefront lead error:', error);
    return new Response(
      JSON.stringify({ success: false, error: 'Internal server error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});

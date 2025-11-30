import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface GetOptionsRequest {
  itemNumber?: string; // Optional - if not provided, gets all blind options
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      {
        global: {
          headers: { Authorization: req.headers.get('Authorization')! },
        },
      }
    );

    // Get user
    const { data: { user } } = await supabaseClient.auth.getUser();
    if (!user) {
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        { status: 401, headers: { 'Content-Type': 'application/json', ...corsHeaders } }
      );
    }

    // Get TWC integration settings
    const { data: integration, error: integrationError } = await supabaseClient
      .from('integration_settings')
      .select('api_credentials')
      .eq('user_id', user.id)
      .eq('integration_type', 'twc')
      .eq('active', true)
      .single();

    if (integrationError || !integration) {
      return new Response(
        JSON.stringify({ error: 'TWC integration not configured' }),
        { status: 400, headers: { 'Content-Type': 'application/json', ...corsHeaders } }
      );
    }

    const { api_url, api_key } = integration.api_credentials;
    
    // Handle optional request body
    let itemNumber: string | undefined;
    try {
      const body = await req.json() as GetOptionsRequest;
      itemNumber = body.itemNumber;
    } catch (e) {
      // No body provided, fetch all products
      itemNumber = undefined;
    }

    console.log('Fetching TWC order options:', { itemNumber });

    // Build URL with optional itemNumber filter
    let twcUrl = `${api_url}/api/TwcPublic/GetOrderOptions?api_key=${api_key}`;
    if (itemNumber) {
      twcUrl += `&itemNumber=${itemNumber}`;
    }

    const response = await fetch(twcUrl, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('TWC API error:', errorText);
      return new Response(
        JSON.stringify({ 
          error: 'Failed to fetch order options from TWC',
          details: errorText 
        }),
        { status: response.status, headers: { 'Content-Type': 'application/json', ...corsHeaders } }
      );
    }

    const options = await response.json();
    console.log('TWC options retrieved successfully');

    return new Response(
      JSON.stringify({ 
        success: true,
        data: options,
        timestamp: new Date().toISOString()
      }),
      { 
        status: 200, 
        headers: { 'Content-Type': 'application/json', ...corsHeaders } 
      }
    );

  } catch (error: any) {
    console.error('Error in twc-get-order-options:', error);
    return new Response(
      JSON.stringify({ 
        error: 'Internal server error',
        message: error.message 
      }),
      { status: 500, headers: { 'Content-Type': 'application/json', ...corsHeaders } }
    );
  }
};

serve(handler);

import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface TWCOrderItem {
  itemNumber: string;
  itemName: string;
  location: string;
  quantity: number;
  width: number;
  drop: number;
  material: string;
  colour: string;
  customFieldValues: Array<{
    name: string;
    value: string;
  }>;
}

interface SubmitOrderRequest {
  quoteId: string;
  orderDescription: string;
  purchaseOrderNumber: string;
  address1: string;
  address2?: string;
  city: string;
  state: string;
  postcode: string;
  phone: string;
  email: string;
  contactName: string;
  items: TWCOrderItem[];
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
    const orderData = await req.json() as SubmitOrderRequest;

    console.log('Submitting order to TWC:', orderData.purchaseOrderNumber);

    // Format order for TWC API
    const twcOrder = {
      id: 0,
      orderDescription: orderData.orderDescription,
      purchaseOrderNumber: orderData.purchaseOrderNumber,
      orderDate: new Date().toISOString().split('T')[0], // YYYY-MM-DD format
      locationName: null,
      address1: orderData.address1,
      address2: orderData.address2 || null,
      city: orderData.city,
      state: orderData.state,
      postcode: orderData.postcode,
      phone: orderData.phone,
      email: orderData.email,
      contactName: orderData.contactName,
      items: orderData.items,
    };

    const response = await fetch(
      `${api_url}/api/TwcPublic/SubmitOrder?api_key=${api_key}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(twcOrder),
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error('TWC API error:', errorText);
      return new Response(
        JSON.stringify({ 
          success: false,
          error: 'Failed to submit order to TWC',
          details: errorText 
        }),
        { status: response.status, headers: { 'Content-Type': 'application/json', ...corsHeaders } }
      );
    }

    const result = await response.json();
    console.log('TWC order submitted:', result);

    // Store TWC order ID in database for tracking
    if (result.success && result.orderId) {
      await supabaseClient
        .from('quotes')
        .update({ 
          twc_order_id: result.orderId,
          twc_order_status: 'submitted',
          twc_submitted_at: new Date().toISOString()
        })
        .eq('id', orderData.quoteId);
    }

    return new Response(
      JSON.stringify({ 
        success: result.success,
        orderId: result.orderId,
        message: result.message,
        timestamp: new Date().toISOString()
      }),
      { 
        status: 200, 
        headers: { 'Content-Type': 'application/json', ...corsHeaders } 
      }
    );

  } catch (error: any) {
    console.error('Error in twc-submit-order:', error);
    return new Response(
      JSON.stringify({ 
        success: false,
        error: 'Internal server error',
        message: error.message 
      }),
      { status: 500, headers: { 'Content-Type': 'application/json', ...corsHeaders } }
    );
  }
};

serve(handler);

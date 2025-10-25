import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-shopify-topic, x-shopify-hmac-sha256, x-shopify-shop-domain',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    console.log('[Shopify Webhooks] Received webhook request');
    
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const topic = req.headers.get('x-shopify-topic');
    const shopDomain = req.headers.get('x-shopify-shop-domain');
    
    if (!topic || !shopDomain) {
      console.error('[Shopify Webhooks] Missing required headers');
      return new Response(JSON.stringify({ error: 'Missing required headers' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    console.log(`[Shopify Webhooks] Topic: ${topic}, Shop: ${shopDomain}`);

    const payload = await req.json();
    
    // Find user by shop domain
    const { data: integration, error: integrationError } = await supabase
      .from('shopify_integrations')
      .select('user_id')
      .eq('shop_domain', shopDomain)
      .single();

    if (integrationError || !integration) {
      console.error('[Shopify Webhooks] Integration not found:', integrationError);
      return new Response(JSON.stringify({ error: 'Integration not found' }), {
        status: 404,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const userId = integration.user_id;
    console.log(`[Shopify Webhooks] Processing for user: ${userId}`);

    // Handle different webhook topics
    switch (topic) {
      case 'orders/create':
      case 'orders/updated':
        await handleOrderWebhook(supabase, userId, payload, topic);
        break;
      
      case 'customers/create':
      case 'customers/update':
        await handleCustomerWebhook(supabase, userId, payload);
        break;
        
      default:
        console.log(`[Shopify Webhooks] Unhandled topic: ${topic}`);
    }

    return new Response(JSON.stringify({ success: true }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('[Shopify Webhooks] Error:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});

async function handleOrderWebhook(supabase: any, userId: string, order: any, topic: string) {
  console.log(`[Shopify Webhooks] Handling order: ${order.id}`);
  
  try {
    // Determine status based on order and financial status
    let status = 'Online Store Lead';
    if (order.financial_status === 'paid' || order.fulfillment_status === 'fulfilled') {
      status = 'Online Store Sale';
    }

    // Check if customer exists, create if not
    let clientId = null;
    if (order.customer) {
      const customerEmail = order.customer.email;
      
      // Check existing client by email or shopify_customer_id
      const { data: existingClient } = await supabase
        .from('clients')
        .select('id')
        .eq('user_id', userId)
        .or(`email.eq.${customerEmail},shopify_customer_id.eq.${order.customer.id}`)
        .maybeSingle();

      if (existingClient) {
        clientId = existingClient.id;
        
        // Update client with Shopify customer ID if not set
        await supabase
          .from('clients')
          .update({ 
            shopify_customer_id: order.customer.id.toString(),
            source: 'shopify'
          })
          .eq('id', clientId);
      } else {
        // Create new client
        const { data: newClient, error: clientError } = await supabase
          .from('clients')
          .insert({
            user_id: userId,
            name: `${order.customer.first_name || ''} ${order.customer.last_name || ''}`.trim() || order.customer.email,
            email: order.customer.email,
            phone: order.customer.phone,
            address: order.shipping_address?.address1,
            city: order.shipping_address?.city,
            state: order.shipping_address?.province,
            zip_code: order.shipping_address?.zip,
            country: order.shipping_address?.country || 'United States',
            shopify_customer_id: order.customer.id.toString(),
            source: 'shopify',
            funnel_stage: status === 'Online Store Sale' ? 'approved' : 'lead',
          })
          .select('id')
          .single();

        if (clientError) {
          console.error('[Shopify Webhooks] Error creating client:', clientError);
        } else {
          clientId = newClient.id;
        }
      }
    }

    // Check if project/job already exists
    const { data: existingProject } = await supabase
      .from('projects')
      .select('id')
      .eq('user_id', userId)
      .eq('shopify_order_id', order.id.toString())
      .maybeSingle();

    const projectData = {
      user_id: userId,
      client_id: clientId,
      name: `Shopify Order #${order.order_number || order.name}`,
      status: status,
      source: 'shopify',
      shopify_order_id: order.id.toString(),
      shopify_order_number: (order.order_number || order.name).toString(),
      description: `Order from ${order.customer?.first_name || 'Customer'} - ${order.line_items?.length || 0} items`,
      notes: JSON.stringify({
        financial_status: order.financial_status,
        fulfillment_status: order.fulfillment_status,
        total_price: order.total_price,
        currency: order.currency,
        items: order.line_items?.map((item: any) => ({
          title: item.title,
          quantity: item.quantity,
          price: item.price,
        })) || [],
      }),
    };

    if (existingProject) {
      // Update existing project
      await supabase
        .from('projects')
        .update({
          status: status,
          description: projectData.description,
          notes: projectData.notes,
        })
        .eq('id', existingProject.id);
      
      console.log(`[Shopify Webhooks] Updated project: ${existingProject.id}`);
    } else {
      // Create new project
      const { data, error } = await supabase
        .from('projects')
        .insert(projectData)
        .select('id')
        .single();

      if (error) {
        console.error('[Shopify Webhooks] Error creating project:', error);
      } else {
        console.log(`[Shopify Webhooks] Created project: ${data.id}`);
      }
    }

  } catch (error) {
    console.error('[Shopify Webhooks] Error in handleOrderWebhook:', error);
  }
}

async function handleCustomerWebhook(supabase: any, userId: string, customer: any) {
  console.log(`[Shopify Webhooks] Handling customer: ${customer.id}`);
  
  try {
    // Check if client exists
    const { data: existingClient } = await supabase
      .from('clients')
      .select('id')
      .eq('user_id', userId)
      .or(`email.eq.${customer.email},shopify_customer_id.eq.${customer.id}`)
      .maybeSingle();

    const clientData = {
      user_id: userId,
      name: `${customer.first_name || ''} ${customer.last_name || ''}`.trim() || customer.email,
      email: customer.email,
      phone: customer.phone,
      address: customer.default_address?.address1,
      city: customer.default_address?.city,
      state: customer.default_address?.province,
      zip_code: customer.default_address?.zip,
      country: customer.default_address?.country || 'United States',
      shopify_customer_id: customer.id.toString(),
      source: 'shopify',
      funnel_stage: 'lead',
      marketing_consent: customer.accepts_marketing || false,
    };

    if (existingClient) {
      // Update existing client
      await supabase
        .from('clients')
        .update(clientData)
        .eq('id', existingClient.id);
      
      console.log(`[Shopify Webhooks] Updated client: ${existingClient.id}`);
    } else {
      // Create new client
      const { data, error } = await supabase
        .from('clients')
        .insert(clientData)
        .select('id')
        .single();

      if (error) {
        console.error('[Shopify Webhooks] Error creating client:', error);
      } else {
        console.log(`[Shopify Webhooks] Created client: ${data.id}`);
      }
    }

  } catch (error) {
    console.error('[Shopify Webhooks] Error in handleCustomerWebhook:', error);
  }
}

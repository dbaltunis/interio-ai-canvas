import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { crypto } from 'https://deno.land/std@0.177.0/crypto/mod.ts';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-shopify-hmac-sha256, x-shopify-shop-domain, x-shopify-topic',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Get webhook headers
    const hmac = req.headers.get('x-shopify-hmac-sha256');
    const shopDomain = req.headers.get('x-shopify-shop-domain');
    const topic = req.headers.get('x-shopify-topic');

    console.log('Received Shopify webhook:', { topic, shopDomain });

    if (!shopDomain) {
      throw new Error('Missing shop domain header');
    }

    // Get order data
    const orderData = await req.json();
    console.log('Order data:', JSON.stringify(orderData, null, 2));

    // Find user by shop domain
    const { data: integration, error: integrationError } = await supabase
      .from('shopify_integrations')
      .select('user_id, webhook_secret')
      .eq('shop_domain', shopDomain)
      .eq('is_connected', true)
      .single();

    if (integrationError || !integration) {
      console.error('Integration not found:', integrationError);
      return new Response(JSON.stringify({ error: 'Store not found' }), {
        status: 404,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Verify HMAC if webhook secret is configured
    if (integration.webhook_secret && hmac) {
      const body = JSON.stringify(orderData);
      const encoder = new TextEncoder();
      const keyData = encoder.encode(integration.webhook_secret);
      const messageData = encoder.encode(body);
      
      const cryptoKey = await crypto.subtle.importKey(
        'raw',
        keyData,
        { name: 'HMAC', hash: 'SHA-256' },
        false,
        ['sign']
      );
      
      const signature = await crypto.subtle.sign('HMAC', cryptoKey, messageData);
      const expectedHmac = btoa(String.fromCharCode(...new Uint8Array(signature)));
      
      if (hmac !== expectedHmac) {
        console.error('HMAC verification failed');
        return new Response(JSON.stringify({ error: 'Invalid signature' }), {
          status: 401,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
    }

    const userId = integration.user_id;
    const customerEmail = orderData.email || orderData.customer?.email;
    const customerName = orderData.customer?.first_name && orderData.customer?.last_name
      ? `${orderData.customer.first_name} ${orderData.customer.last_name}`
      : orderData.billing_address?.name || 'Unknown Customer';

    // Find or create client
    let clientId = null;
    
    if (customerEmail) {
      const { data: existingClient } = await supabase
        .from('clients')
        .select('id')
        .eq('user_id', userId)
        .eq('email', customerEmail)
        .maybeSingle();

      if (existingClient) {
        clientId = existingClient.id;
        
        // Update client with Shopify data
        await supabase
          .from('clients')
          .update({
            shopify_customer_id: orderData.customer?.id?.toString(),
            last_order_date: new Date().toISOString(),
            total_orders: orderData.customer?.orders_count || 1,
            total_spent: parseFloat(orderData.customer?.total_spent || orderData.total_price || '0'),
          })
          .eq('id', clientId);
      } else {
        // Create new client
        const { data: newClient, error: clientError } = await supabase
          .from('clients')
          .insert({
            user_id: userId,
            name: customerName,
            email: customerEmail,
            phone: orderData.customer?.phone || orderData.billing_address?.phone,
            address: orderData.billing_address?.address1,
            city: orderData.billing_address?.city,
            state: orderData.billing_address?.province,
            zip_code: orderData.billing_address?.zip,
            country: orderData.billing_address?.country,
            lead_source: 'Online Store',
            funnel_stage: 'contacted',
            shopify_customer_id: orderData.customer?.id?.toString(),
            source: 'shopify',
            last_order_date: new Date().toISOString(),
            total_orders: 1,
            total_spent: parseFloat(orderData.total_price || '0'),
          })
          .select('id')
          .single();

        if (clientError) {
          console.error('Failed to create client:', clientError);
        } else {
          clientId = newClient.id;
        }
      }
    }

    // Determine job status based on order financial status
    let jobStatusName = 'Online Store Lead';
    if (orderData.financial_status === 'paid' || orderData.fulfillment_status === 'fulfilled') {
      jobStatusName = 'Online Store Sale';
    }

    // Get the job status ID
    const { data: jobStatus } = await supabase
      .from('job_statuses')
      .select('id')
      .eq('user_id', userId)
      .eq('name', jobStatusName)
      .maybeSingle();

    // Create project/job
    let projectId = null;
    if (clientId) {
      const { data: newProject, error: projectError } = await supabase
        .from('projects')
        .insert({
          user_id: userId,
          client_id: clientId,
          title: `Order #${orderData.order_number || orderData.name}`,
          description: `Shopify order with ${orderData.line_items?.length || 0} items`,
          status: jobStatus?.id || null,
        })
        .select('id')
        .single();

      if (projectError) {
        console.error('Failed to create project:', projectError);
      } else {
        projectId = newProject.id;
      }
    }

    // Store order in shopify_orders table
    const { error: orderError } = await supabase
      .from('shopify_orders')
      .upsert({
        user_id: userId,
        project_id: projectId,
        client_id: clientId,
        shopify_order_id: orderData.id.toString(),
        order_number: orderData.order_number || orderData.name,
        financial_status: orderData.financial_status,
        fulfillment_status: orderData.fulfillment_status,
        total_price: parseFloat(orderData.total_price || '0'),
        currency: orderData.currency,
        customer_email: customerEmail,
        customer_name: customerName,
        order_data: orderData,
      }, {
        onConflict: 'user_id,shopify_order_id',
      });

    if (orderError) {
      console.error('Failed to store order:', orderError);
    }

    // Create notification for user
    if (topic === 'orders/create') {
      await supabase
        .from('notifications')
        .insert({
          user_id: userId,
          title: '🎉 New Shopify Order',
          message: `Order #${orderData.order_number || orderData.name} from ${customerName} ($${orderData.total_price})`,
          type: 'info',
        });
    }

    // Log sync
    await supabase
      .from('shopify_sync_log')
      .insert({
        user_id: userId,
        sync_type: 'orders',
        direction: 'pull',
        status: 'success',
        items_synced: 1,
      });

    console.log('Order processed successfully:', {
      orderId: orderData.id,
      projectId,
      clientId,
    });

    return new Response(JSON.stringify({ 
      success: true,
      projectId,
      clientId,
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error processing order webhook:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});

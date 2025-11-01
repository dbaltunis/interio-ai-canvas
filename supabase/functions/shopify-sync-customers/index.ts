import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Get authenticated user
    const authHeader = req.headers.get('Authorization')!;
    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: userError } = await supabase.auth.getUser(token);

    if (userError || !user) {
      throw new Error('Unauthorized');
    }

    console.log('Syncing Shopify customers for user:', user.id);

    // Get Shopify integration
    const { data: integration, error: integrationError } = await supabase
      .from('shopify_integrations')
      .select('*')
      .eq('user_id', user.id)
      .eq('is_connected', true)
      .single();

    if (integrationError || !integration) {
      throw new Error('Shopify integration not found or not connected');
    }

    const { shop_domain, access_token } = integration;

    if (!shop_domain || !access_token) {
      throw new Error('Missing Shopify credentials');
    }

    // Fetch customers from Shopify
    const customersResponse = await fetch(
      `https://${shop_domain}/admin/api/2024-01/customers.json?limit=250`,
      {
        headers: {
          'X-Shopify-Access-Token': access_token,
          'Content-Type': 'application/json',
        },
      }
    );

    if (!customersResponse.ok) {
      const errorText = await customersResponse.text();
      console.error('Shopify API error:', errorText);
      throw new Error(`Failed to fetch customers from Shopify: ${customersResponse.statusText}`);
    }

    const customersData = await customersResponse.json();
    const customers = customersData.customers || [];

    console.log(`Found ${customers.length} customers to sync`);

    let syncedCount = 0;
    let updatedCount = 0;
    const errors = [];

    // Sync each customer
    for (const customer of customers) {
      try {
        const customerData = {
          user_id: user.id,
          name: customer.first_name && customer.last_name
            ? `${customer.first_name} ${customer.last_name}`
            : customer.first_name || customer.last_name || 'Unknown',
          email: customer.email,
          phone: customer.phone || customer.default_address?.phone,
          address: customer.default_address?.address1,
          city: customer.default_address?.city,
          state: customer.default_address?.province,
          zip_code: customer.default_address?.zip,
          country: customer.default_address?.country || 'United States',
          lead_source: 'Online Store',
          funnel_stage: customer.orders_count > 0 ? 'contacted' : 'lead',
          shopify_customer_id: customer.id.toString(),
          source: 'shopify',
          tags: customer.tags ? customer.tags.split(',').map((t: string) => t.trim()) : [],
          total_orders: customer.orders_count || 0,
          total_spent: parseFloat(customer.total_spent || '0'),
          notes: customer.note,
          marketing_consent: customer.email_marketing_consent?.state === 'subscribed',
        };

        // Check if client already exists
        const { data: existingClient } = await supabase
          .from('clients')
          .select('id')
          .eq('user_id', user.id)
          .eq('shopify_customer_id', customer.id.toString())
          .maybeSingle();

        if (existingClient) {
          // Update existing client
          const { error: updateError } = await supabase
            .from('clients')
            .update(customerData)
            .eq('id', existingClient.id);

          if (updateError) {
            console.error(`Failed to update client ${customer.id}:`, updateError);
            errors.push({ customerId: customer.id, error: updateError.message });
          } else {
            updatedCount++;
          }
        } else {
          // Insert new client
          const { error: insertError } = await supabase
            .from('clients')
            .insert(customerData);

          if (insertError) {
            console.error(`Failed to insert client ${customer.id}:`, insertError);
            errors.push({ customerId: customer.id, error: insertError.message });
          } else {
            syncedCount++;
          }
        }
      } catch (error) {
        console.error(`Error processing customer ${customer.id}:`, error);
        errors.push({ customerId: customer.id, error: error.message });
      }
    }

    // Update integration last sync time
    await supabase
      .from('shopify_integrations')
      .update({ last_sync_at: new Date().toISOString() })
      .eq('user_id', user.id);

    // Log sync
    await supabase
      .from('shopify_sync_log')
      .insert({
        user_id: user.id,
        sync_type: 'customers',
        direction: 'pull',
        status: errors.length === 0 ? 'success' : errors.length < customers.length ? 'partial' : 'error',
        items_synced: syncedCount + updatedCount,
        errors: errors.length > 0 ? errors : null,
      });

    console.log('Customer sync completed:', {
      total: customers.length,
      synced: syncedCount,
      updated: updatedCount,
      errors: errors.length,
    });

    return new Response(JSON.stringify({
      success: true,
      synced: syncedCount,
      updated: updatedCount,
      total: customers.length,
      errors: errors.length > 0 ? errors : undefined,
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error syncing customers:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});

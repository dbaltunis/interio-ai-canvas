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
    const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? '';
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '';
    
    const supabaseClient = createClient(supabaseUrl, supabaseServiceKey);

    // Get user from auth header
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      console.error('Missing authorization header');
      return new Response(
        JSON.stringify({ error: 'Missing authorization header' }),
        { status: 401, headers: { 'Content-Type': 'application/json', ...corsHeaders } }
      );
    }

    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: authError } = await supabaseClient.auth.getUser(token);
    
    if (authError || !user) {
      console.error('Auth error:', authError);
      return new Response(
        JSON.stringify({ error: 'Unauthorized', details: authError?.message }),
        { status: 401, headers: { 'Content-Type': 'application/json', ...corsHeaders } }
      );
    }
    
    console.log('User authenticated:', user.id);

    // Get account owner ID
    const { data: profile } = await supabaseClient
      .from('user_profiles')
      .select('parent_account_id')
      .eq('user_id', user.id)
      .single();
    
    const accountOwnerId = profile?.parent_account_id || user.id;
    console.log('Account owner ID:', accountOwnerId);

    // Get TWC integration settings
    const { data: integration, error: integrationError } = await supabaseClient
      .from('integration_settings')
      .select('api_credentials')
      .eq('user_id', accountOwnerId)
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

    // Normalize the API URL - ensure HTTPS, remove /twcpublic suffix, and trailing slashes
    let normalizedUrl = api_url?.trim() || '';
    
    // Ensure HTTPS
    if (normalizedUrl.startsWith('http://')) {
      normalizedUrl = normalizedUrl.replace('http://', 'https://');
    }
    if (!normalizedUrl.startsWith('https://')) {
      normalizedUrl = 'https://' + normalizedUrl;
    }
    
    // CRITICAL: Remove trailing /twcpublic if present (matches twc-get-order-options pattern)
    normalizedUrl = normalizedUrl.replace(/\/twcpublic\/?$/i, '');
    
    // Remove trailing slashes
    normalizedUrl = normalizedUrl.replace(/\/+$/, '');
    
    console.log('Normalized API URL:', normalizedUrl);

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

    const fullUrl = `${normalizedUrl}/api/TwcPublic/SubmitOrder?api_key=${api_key}`;
    console.log('Full request URL (key hidden):', fullUrl.replace(api_key, '***'));

    const response = await fetch(fullUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify(twcOrder),
      redirect: 'follow', // Explicit redirect handling
    });

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
    // Append to existing order IDs (multiple orders per quote when product types differ)
    if (result.success && result.orderId) {
      const { data: existingQuote } = await supabaseClient
        .from('quotes')
        .select('twc_order_id')
        .eq('id', orderData.quoteId)
        .single();

      const existingOrderId = existingQuote?.twc_order_id;
      const newOrderId = existingOrderId
        ? `${existingOrderId}, ${result.orderId}`
        : String(result.orderId);

      await supabaseClient
        .from('quotes')
        .update({
          twc_order_id: newOrderId,
          twc_order_status: 'submitted',
          twc_submitted_at: new Date().toISOString()
        })
        .eq('id', orderData.quoteId);

      // Send confirmation email to user
      try {
        // Get user's email from auth
        const userEmail = user.email;
        
        // Get user's business info
        const { data: businessSettings } = await supabaseClient
          .from('business_settings')
          .select('company_name')
          .eq('user_id', accountOwnerId)
          .single();

        if (userEmail) {
          // Build order items summary
          const itemsSummary = orderData.items.map((item: TWCOrderItem) => 
            `• ${item.itemName} (${item.width}mm × ${item.drop}mm) - ${item.colour}`
          ).join('<br/>');

          const companyName = businessSettings?.company_name || 'Your Company';

          // Send email via send-email function
          await supabaseClient.functions.invoke('send-email', {
            body: {
              to: userEmail,
              subject: `TWC Order Confirmed - ${orderData.purchaseOrderNumber}`,
              html: `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                  <h2 style="color: #0d9488;">Order Submitted to TWC</h2>
                  <p>Your order has been successfully submitted to TWC (The Wholesale Curtain).</p>
                  
                  <div style="background: #f0fdfa; padding: 16px; border-radius: 8px; margin: 16px 0;">
                    <p style="margin: 4px 0;"><strong>TWC Order ID:</strong> ${result.orderId}</p>
                    <p style="margin: 4px 0;"><strong>Purchase Order:</strong> ${orderData.purchaseOrderNumber}</p>
                    <p style="margin: 4px 0;"><strong>Submitted:</strong> ${new Date().toLocaleString()}</p>
                  </div>
                  
                  <h3 style="color: #0f766e;">Items Ordered (${orderData.items.length})</h3>
                  <div style="background: #f8fafc; padding: 12px; border-radius: 6px;">
                    ${itemsSummary}
                  </div>
                  
                  <h3 style="color: #0f766e;">Delivery Address</h3>
                  <p>
                    ${orderData.address1}<br/>
                    ${orderData.address2 ? orderData.address2 + '<br/>' : ''}
                    ${orderData.city}, ${orderData.state} ${orderData.postcode}
                  </p>
                  
                  <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 24px 0;"/>
                  <p style="color: #64748b; font-size: 14px;">
                    You will receive updates from TWC when your order is in production and shipped.
                  </p>
                  <p style="color: #64748b; font-size: 12px;">
                    Sent from ${companyName}
                  </p>
                </div>
              `,
              user_id: user.id
            }
          });
          console.log('Confirmation email sent to:', userEmail);
        }
      } catch (emailError) {
        console.error('Failed to send confirmation email:', emailError);
        // Don't fail the order if email fails
      }

      // Create in-app notification
      try {
        await supabaseClient.from('notifications').insert({
          user_id: user.id,
          type: 'supplier_order',
          title: 'Order Submitted to TWC',
          message: `Order ${result.orderId} submitted successfully - PO# ${orderData.purchaseOrderNumber}`,
          metadata: {
            supplier: 'twc',
            order_id: result.orderId,
            purchase_order: orderData.purchaseOrderNumber,
            quote_id: orderData.quoteId,
            items_count: orderData.items.length
          },
          read: false
        });
        console.log('In-app notification created');
      } catch (notifError) {
        console.error('Failed to create notification:', notifError);
        // Don't fail the order if notification fails
      }
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

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    console.log('[Shopify Analytics] Starting sync');
    
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Get user from authorization header
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(JSON.stringify({ error: 'Missing authorization' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const { data: { user }, error: authError } = await supabase.auth.getUser(
      authHeader.replace('Bearer ', '')
    );

    if (authError || !user) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Get Shopify integration
    const { data: integration, error: integrationError } = await supabase
      .from('shopify_integrations')
      .select('shop_domain, access_token')
      .eq('user_id', user.id)
      .single();

    if (integrationError || !integration) {
      return new Response(JSON.stringify({ error: 'Shopify integration not found' }), {
        status: 404,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const { shop_domain, access_token } = integration;

    // Fetch analytics from Shopify
    const now = new Date();
    const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    
    // Fetch orders
    const ordersResponse = await fetch(
      `https://${shop_domain}/admin/api/2024-01/orders.json?status=any&limit=250`,
      {
        headers: {
          'X-Shopify-Access-Token': access_token,
          'Content-Type': 'application/json',
        },
      }
    );

    if (!ordersResponse.ok) {
      console.error('[Shopify Analytics] Failed to fetch orders');
      return new Response(JSON.stringify({ error: 'Failed to fetch Shopify data' }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const ordersData = await ordersResponse.json();
    const orders = ordersData.orders || [];

    // Fetch customers
    const customersResponse = await fetch(
      `https://${shop_domain}/admin/api/2024-01/customers/count.json`,
      {
        headers: {
          'X-Shopify-Access-Token': access_token,
          'Content-Type': 'application/json',
        },
      }
    );

    let totalCustomers = 0;
    if (customersResponse.ok) {
      const customersData = await customersResponse.json();
      totalCustomers = customersData.count || 0;
    }

    // Calculate analytics
    const totalOrders = orders.length;
    const totalRevenue = orders.reduce((sum: number, order: any) => {
      return sum + parseFloat(order.total_price || 0);
    }, 0);

    const ordersThisMonth = orders.filter((order: any) => {
      const orderDate = new Date(order.created_at);
      return orderDate >= firstDayOfMonth;
    });

    const ordersThisMonthCount = ordersThisMonth.length;
    const revenueThisMonth = ordersThisMonth.reduce((sum: number, order: any) => {
      return sum + parseFloat(order.total_price || 0);
    }, 0);

    const avgOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;

    // Store analytics
    const analyticsData = {
      user_id: user.id,
      shop_domain: shop_domain,
      total_orders: totalOrders,
      total_revenue: totalRevenue,
      total_customers: totalCustomers,
      orders_this_month: ordersThisMonthCount,
      revenue_this_month: revenueThisMonth,
      avg_order_value: avgOrderValue,
      analytics_data: {
        orders_by_status: orders.reduce((acc: any, order: any) => {
          const status = order.financial_status || 'unknown';
          acc[status] = (acc[status] || 0) + 1;
          return acc;
        }, {}),
        currency: orders[0]?.currency || 'USD',
        last_order_date: orders[0]?.created_at || null,
      },
      last_synced_at: new Date().toISOString(),
    };

    const { error: upsertError } = await supabase
      .from('shopify_analytics')
      .upsert(analyticsData, {
        onConflict: 'user_id,shop_domain',
      });

    if (upsertError) {
      console.error('[Shopify Analytics] Error storing analytics:', upsertError);
      return new Response(JSON.stringify({ error: 'Failed to store analytics' }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    console.log('[Shopify Analytics] Sync completed successfully');

    return new Response(JSON.stringify({
      success: true,
      analytics: {
        totalOrders,
        totalRevenue,
        totalCustomers,
        ordersThisMonth: ordersThisMonthCount,
        revenueThisMonth,
        avgOrderValue,
      },
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('[Shopify Analytics] Error:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});

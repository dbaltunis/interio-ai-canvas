import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@18.5.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const logStep = (step: string, details?: any) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : '';
  console.log(`[CREATE-STORE-CHECKOUT] ${step}${detailsStr}`);
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    logStep("Function started");

    const stripeKey = Deno.env.get("STRIPE_SECRET_KEY");
    if (!stripeKey) throw new Error("STRIPE_SECRET_KEY is not set");

    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
      { auth: { persistSession: false } }
    );

    const { store_id, customer_name, customer_email, customer_phone, message, items, total } = await req.json();
    
    if (!store_id || !customer_email || !items || !total) {
      throw new Error("Missing required fields");
    }
    
    logStep("Request parsed", { store_id, customer_email, itemCount: items.length });

    // Get store details
    const { data: store, error: storeError } = await supabaseClient
      .from("online_stores")
      .select("id, user_id, store_name, store_slug")
      .eq("id", store_id)
      .single();

    if (storeError) throw new Error(`Failed to fetch store: ${storeError.message}`);
    if (!store) throw new Error("Store not found");
    logStep("Store fetched", { storeId: store.id, storeName: store.store_name });

    const stripe = new Stripe(stripeKey, { apiVersion: "2025-08-27.basil" });

    // Find or create Stripe customer
    const customers = await stripe.customers.list({ email: customer_email, limit: 1 });
    let customerId;
    
    if (customers.data.length > 0) {
      customerId = customers.data[0].id;
      logStep("Found existing customer", { customerId });
    } else {
      const customer = await stripe.customers.create({
        email: customer_email,
        name: customer_name,
        phone: customer_phone || undefined,
      });
      customerId = customer.id;
      logStep("Created new customer", { customerId });
    }

    // Create line items for Stripe
    const lineItems = items.map((item: any) => ({
      price_data: {
        currency: 'gbp',
        product_data: {
          name: item.name,
          description: `Category: ${item.category}`,
          images: item.imageUrl ? [item.imageUrl] : undefined,
        },
        unit_amount: Math.round((item.estimatedPrice || 0) * 100),
      },
      quantity: item.quantity,
    }));

    const origin = req.headers.get("origin") || Deno.env.get("SITE_URL") || "http://localhost:5173";
    
    // Create checkout session
    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      line_items: lineItems,
      mode: "payment",
      success_url: `${origin}/store/${store.store_slug}/order-confirmation?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${origin}/store/${store.store_slug}/checkout`,
      metadata: {
        store_id: store.id,
        store_user_id: store.user_id,
        customer_name,
        customer_phone: customer_phone || '',
        message: message || '',
      },
    });

    logStep("Checkout session created", { sessionId: session.id });

    // Create pending order record
    const { data: order, error: orderError } = await supabaseClient
      .from("store_orders")
      .insert({
        store_id: store.id,
        customer_name,
        customer_email,
        customer_phone,
        message,
        order_items: items,
        total_amount: total,
        payment_status: "pending",
        stripe_session_id: session.id,
      })
      .select()
      .single();

    if (orderError) {
      logStep("Failed to create order", { error: orderError.message });
      throw new Error(`Failed to create order: ${orderError.message}`);
    }

    logStep("Order created", { orderId: order.id });

    return new Response(JSON.stringify({ 
      url: session.url,
      session_id: session.id,
      order_id: order.id,
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    logStep("ERROR", { message: errorMessage });
    return new Response(JSON.stringify({ error: errorMessage }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});

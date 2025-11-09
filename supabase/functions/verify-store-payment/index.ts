import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@18.5.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const logStep = (step: string, details?: any) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : '';
  console.log(`[VERIFY-STORE-PAYMENT] ${step}${detailsStr}`);
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

    const { session_id } = await req.json();
    if (!session_id) throw new Error("session_id is required");
    logStep("Request parsed", { session_id });

    const stripe = new Stripe(stripeKey, { apiVersion: "2025-08-27.basil" });

    // Retrieve the checkout session
    const session = await stripe.checkout.sessions.retrieve(session_id);
    logStep("Checkout session retrieved", { 
      sessionId: session.id, 
      paymentStatus: session.payment_status,
      status: session.status 
    });

    // Get order by session ID
    const { data: order, error: orderError } = await supabaseClient
      .from("store_orders")
      .select("*")
      .eq("stripe_session_id", session_id)
      .single();

    if (orderError) throw new Error(`Failed to fetch order: ${orderError.message}`);
    if (!order) throw new Error("Order not found");
    logStep("Order fetched", { orderId: order.id });

    let paymentStatus: string;
    if (session.payment_status === "paid" && session.status === "complete") {
      paymentStatus = "paid";
    } else if (session.payment_status === "unpaid") {
      paymentStatus = "pending";
    } else {
      paymentStatus = "failed";
    }

    // Update order with payment status
    const { error: updateError } = await supabaseClient
      .from("store_orders")
      .update({
        payment_status: paymentStatus,
        stripe_payment_intent_id: session.payment_intent as string,
        updated_at: new Date().toISOString(),
      })
      .eq("id", order.id);

    if (updateError) {
      logStep("Failed to update order", { error: updateError.message });
      throw new Error(`Failed to update order: ${updateError.message}`);
    }

    logStep("Order updated", { paymentStatus });

    // Get store details to find the user_id
    const { data: store, error: storeError } = await supabaseClient
      .from("online_stores")
      .select("user_id, store_name")
      .eq("id", order.store_id)
      .single();

    if (storeError || !store) {
      logStep("Store not found", { storeId: order.store_id });
      throw new Error("Store not found");
    }

    // Check if client exists by email
    const { data: existingClient } = await supabaseClient
      .from("clients")
      .select("id")
      .eq("user_id", store.user_id)
      .eq("email", order.customer_email)
      .maybeSingle();

    let clientId = existingClient?.id;

    // Create client if doesn't exist
    if (!clientId) {
      logStep("Creating new client", { email: order.customer_email });
      const { data: newClient, error: clientError } = await supabaseClient
        .from("clients")
        .insert({
          user_id: store.user_id,
          name: order.customer_name,
          email: order.customer_email,
          phone: order.customer_phone,
          lead_source: "Online Store",
          funnel_stage: paymentStatus === "paid" ? "approved" : "lead",
          source: "online_store",
          notes: order.message ? `Order message: ${order.message}` : "Online store order",
        })
        .select("id")
        .single();

      if (clientError) {
        logStep("Failed to create client", { error: clientError.message });
        throw new Error(`Failed to create client: ${clientError.message}`);
      }
      clientId = newClient.id;
      logStep("Client created", { clientId });
    } else {
      logStep("Using existing client", { clientId });
    }

    // Get appropriate job status
    const statusName = paymentStatus === "paid" ? "Online Store Sale" : "Online Store Lead";
    const { data: jobStatus } = await supabaseClient
      .from("job_statuses")
      .select("id, name")
      .eq("user_id", store.user_id)
      .eq("name", statusName)
      .maybeSingle();

    if (!jobStatus) {
      logStep("Job status not found, creating default statuses");
      // Ensure the statuses exist
      await supabaseClient.rpc("ensure_shopify_statuses", { p_user_id: store.user_id });
      
      // Fetch again
      const { data: newStatus } = await supabaseClient
        .from("job_statuses")
        .select("id, name")
        .eq("user_id", store.user_id)
        .eq("name", statusName)
        .single();
      
      if (!newStatus) {
        throw new Error(`Could not find or create ${statusName} status`);
      }
    }

    // Prepare order items summary
    const orderItems = order.order_items as any[] || [];
    const itemsSummary = orderItems.map((item: any) => 
      `${item.quantity}x ${item.name} (${item.category})`
    ).join(", ");

    // Create job/project
    const jobTitle = `Online Store Order - ${order.customer_name}`;
    const jobDescription = `
🛒 **Online Store Order**
📧 Email: ${order.customer_email}
${order.customer_phone ? `📞 Phone: ${order.customer_phone}` : ""}
💰 Total: £${order.total_amount.toFixed(2)}

**Items Ordered:**
${itemsSummary}

${order.message ? `\n**Customer Message:**\n${order.message}` : ""}

**Payment Status:** ${paymentStatus.toUpperCase()}
**Order ID:** ${order.id}
**Store:** ${store.store_name}
    `.trim();

    logStep("Creating job", { clientId, statusName });

    const { data: job, error: jobError } = await supabaseClient
      .from("projects")
      .insert({
        user_id: store.user_id,
        client_id: clientId,
        title: jobTitle,
        description: jobDescription,
        status: statusName,
        total_value: order.total_amount,
        source: "online_store",
        metadata: {
          order_id: order.id,
          stripe_session_id: session_id,
          stripe_payment_intent: session.payment_intent,
          order_items: orderItems,
          store_id: order.store_id,
          payment_status: paymentStatus,
        },
      })
      .select("id")
      .single();

    if (jobError) {
      logStep("Failed to create job", { error: jobError.message });
      throw new Error(`Failed to create job: ${jobError.message}`);
    }

    logStep("Job created successfully", { jobId: job.id, clientId });

    return new Response(JSON.stringify({ 
      status: paymentStatus,
      order_id: order.id,
      amount: session.amount_total ? session.amount_total / 100 : 0,
      paid_at: session.payment_status === "paid" ? new Date().toISOString() : null,
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

import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@18.5.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const logStep = (step: string, details?: any) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : '';
  console.log(`[VERIFY-QUOTE-PAYMENT] ${step}${detailsStr}`);
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

    const authHeader = req.headers.get("Authorization");
    if (!authHeader) throw new Error("No authorization header provided");
    
    const token = authHeader.replace("Bearer ", "");
    const { data: userData, error: userError } = await supabaseClient.auth.getUser(token);
    if (userError) throw new Error(`Authentication error: ${userError.message}`);
    const user = userData.user;
    if (!user?.id) throw new Error("User not authenticated");
    logStep("User authenticated", { userId: user.id });

    const { quote_id, session_id } = await req.json();
    if (!quote_id) throw new Error("quote_id is required");
    logStep("Request parsed", { quote_id, session_id });

    // Get quote details
    const { data: quote, error: quoteError } = await supabaseClient
      .from("quotes")
      .select("id, user_id, stripe_payment_intent_id, payment_type, payment_amount")
      .eq("id", quote_id)
      .single();

    if (quoteError) throw new Error(`Failed to fetch quote: ${quoteError.message}`);
    if (!quote) throw new Error("Quote not found");
    if (quote.user_id !== user.id) throw new Error("Unauthorized access to quote");
    logStep("Quote fetched", { quoteId: quote.id });

    const stripe = new Stripe(stripeKey, { apiVersion: "2025-08-27.basil" });

    // Use session_id if provided, otherwise use stored payment intent
    const sessionIdToCheck = session_id || quote.stripe_payment_intent_id;
    if (!sessionIdToCheck) {
      throw new Error("No payment session found for this quote");
    }

    // Retrieve the checkout session
    const session = await stripe.checkout.sessions.retrieve(sessionIdToCheck);
    logStep("Checkout session retrieved", { 
      sessionId: session.id, 
      paymentStatus: session.payment_status,
      status: session.status 
    });

    let paymentStatus: string;
    if (session.payment_status === "paid" && session.status === "complete") {
      paymentStatus = quote.payment_type === "deposit" ? "deposit_paid" : "paid";
    } else if (session.payment_status === "unpaid") {
      paymentStatus = "pending";
    } else {
      paymentStatus = "failed";
    }

    // Update quote with payment status
    const { error: updateError } = await supabaseClient
      .from("quotes")
      .update({
        payment_status: paymentStatus,
        stripe_payment_intent_id: session.id,
        updated_at: new Date().toISOString(),
      })
      .eq("id", quote_id);

    if (updateError) {
      logStep("Failed to update quote", { error: updateError.message });
      throw new Error(`Failed to update quote: ${updateError.message}`);
    }

    logStep("Quote updated", { paymentStatus });

    return new Response(JSON.stringify({ 
      status: paymentStatus,
      amount: session.amount_total ? session.amount_total / 100 : 0,
      paid_at: session.payment_status === "paid" ? new Date().toISOString() : null,
      payment_intent: session.payment_intent,
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

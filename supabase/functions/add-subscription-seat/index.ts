import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@18.5.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const logStep = (step: string, details?: Record<string, unknown>) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : '';
  console.log(`[ADD-SUBSCRIPTION-SEAT] ${step}${detailsStr}`);
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const supabaseClient = createClient(
    Deno.env.get("SUPABASE_URL") ?? "",
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
  );

  try {
    logStep("Function started");

    // Verify authenticated user
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) throw new Error("No authorization header");

    const token = authHeader.replace("Bearer ", "");
    const { data: userData, error: userError } = await supabaseClient.auth.getUser(token);
    if (userError || !userData.user) throw new Error("Unauthorized");

    logStep("User authenticated", { userId: userData.user.id });

    // Get user's subscription from database
    const { data: subscription, error: subError } = await supabaseClient
      .from("user_subscriptions")
      .select("stripe_subscription_id, stripe_customer_id")
      .eq("user_id", userData.user.id)
      .eq("status", "active")
      .single();

    if (subError || !subscription?.stripe_subscription_id) {
      throw new Error("No active subscription found. Please subscribe first.");
    }

    logStep("Found subscription", { 
      subscriptionId: subscription.stripe_subscription_id 
    });

    const stripeKey = Deno.env.get("STRIPE_SECRET_KEY");
    if (!stripeKey) throw new Error("STRIPE_SECRET_KEY is not set");

    const stripe = new Stripe(stripeKey, { apiVersion: "2025-08-27.basil" });

    // Retrieve current subscription from Stripe
    const stripeSubscription = await stripe.subscriptions.retrieve(
      subscription.stripe_subscription_id
    );

    if (stripeSubscription.status !== 'active') {
      throw new Error("Subscription is not active in Stripe");
    }

    // Get the subscription item (first item, as we have single-product subscription)
    const subscriptionItem = stripeSubscription.items.data[0];
    if (!subscriptionItem) {
      throw new Error("No subscription items found");
    }

    const currentQuantity = subscriptionItem.quantity || 1;
    const newQuantity = currentQuantity + 1;

    logStep("Updating subscription quantity", { 
      currentQuantity, 
      newQuantity,
      itemId: subscriptionItem.id 
    });

    // Update the subscription quantity in Stripe
    // This will prorate the charge automatically
    const updatedSubscription = await stripe.subscriptions.update(
      subscription.stripe_subscription_id,
      {
        items: [{
          id: subscriptionItem.id,
          quantity: newQuantity,
        }],
        proration_behavior: 'create_prorations', // Charge prorated amount immediately
      }
    );

    logStep("Subscription updated successfully", { 
      newQuantity: updatedSubscription.items.data[0]?.quantity 
    });

    // Calculate prorated amount for informational purposes
    const pricePerSeat = 9900; // £99 in pence
    const daysRemaining = Math.ceil(
      (stripeSubscription.current_period_end - Date.now() / 1000) / (60 * 60 * 24)
    );
    const daysInPeriod = 30; // Approximate
    const proratedAmount = Math.round((pricePerSeat * daysRemaining) / daysInPeriod);

    return new Response(JSON.stringify({ 
      success: true,
      message: "Subscription seat added successfully",
      previousSeats: currentQuantity,
      newSeats: newQuantity,
      proratedCharge: proratedAmount / 100, // Return in pounds
      currency: "GBP",
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

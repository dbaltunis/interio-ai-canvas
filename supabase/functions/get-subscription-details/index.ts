import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@18.5.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.50.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const logStep = (step: string, details?: Record<string, unknown>) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : '';
  console.log(`[GET-SUBSCRIPTION-DETAILS] ${step}${detailsStr}`);
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

    // Get effectiveOwnerId (parent_account_id for team members, else user.id)
    const { data: profile } = await supabaseClient
      .from("user_profiles")
      .select("parent_account_id")
      .eq("user_id", userData.user.id)
      .maybeSingle();

    const effectiveOwnerId = profile?.parent_account_id || userData.user.id;
    const isTeamMember = !!profile?.parent_account_id;
    
    logStep("Resolved effective owner", { 
      userId: userData.user.id, 
      effectiveOwnerId, 
      isTeamMember 
    });

    // Get user's subscription from database using effectiveOwnerId
    const { data: subscription, error: subError } = await supabaseClient
      .from("user_subscriptions")
      .select(`
        id,
        stripe_subscription_id, 
        stripe_customer_id,
        status,
        current_period_start,
        current_period_end,
        subscription_plans (
          id,
          name,
          price_monthly,
          price_yearly
        )
      `)
      .eq("user_id", effectiveOwnerId)
      .in("status", ["active", "trial"])
      .order("created_at", { ascending: false })
      .maybeSingle();

    if (subError) {
      logStep("Error fetching subscription", { error: subError.message });
      throw new Error(`Failed to fetch subscription: ${subError.message}`);
    }

    if (!subscription) {
      logStep("No subscription found");
      return new Response(JSON.stringify({ 
        hasSubscription: false,
        message: "No active subscription found"
      }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      });
    }

    logStep("Found subscription", { 
      subscriptionId: subscription.stripe_subscription_id,
      status: subscription.status
    });

    // If no Stripe subscription (e.g., trial), return basic info
    if (!subscription.stripe_subscription_id) {
      return new Response(JSON.stringify({ 
        hasSubscription: true,
        status: subscription.status,
        plan: subscription.subscription_plans,
        currentSeats: 1,
        pricePerSeat: 99,
        currency: "GBP",
        currentPeriodEnd: subscription.current_period_end,
        nextBillingDate: subscription.current_period_end,
        isStripeManaged: false,
      }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      });
    }

    const stripeKey = Deno.env.get("STRIPE_SECRET_KEY");
    if (!stripeKey) throw new Error("STRIPE_SECRET_KEY is not set");

    const stripe = new Stripe(stripeKey, { apiVersion: "2025-08-27.basil" });

    // Retrieve current subscription from Stripe
    const stripeSubscription = await stripe.subscriptions.retrieve(
      subscription.stripe_subscription_id
    );

    logStep("Retrieved Stripe subscription", { 
      status: stripeSubscription.status,
      quantity: stripeSubscription.items.data[0]?.quantity 
    });

    // Get the subscription item and period dates from it
    const subscriptionItem = stripeSubscription.items.data[0];
    const currentQuantity = subscriptionItem?.quantity || 1;
    const pricePerSeat = 99; // £99 per seat

    // Calculate billing period details - period dates are on the subscription item
    const currentPeriodStart = new Date((subscriptionItem?.current_period_start || stripeSubscription.created) * 1000);
    const currentPeriodEnd = new Date((subscriptionItem?.current_period_end || stripeSubscription.created) * 1000);
    const now = new Date();
    
    logStep("Period dates", { 
      currentPeriodStart: currentPeriodStart.toISOString(), 
      currentPeriodEnd: currentPeriodEnd.toISOString() 
    });
    
    const totalDaysInPeriod = Math.ceil(
      (currentPeriodEnd.getTime() - currentPeriodStart.getTime()) / (1000 * 60 * 60 * 24)
    );
    const daysRemaining = Math.max(0, Math.ceil(
      (currentPeriodEnd.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)
    ));
    const daysUsed = totalDaysInPeriod - daysRemaining;

    // Calculate proration for adding 1 seat
    const proratedAmount = totalDaysInPeriod > 0 
      ? Math.round((pricePerSeat * daysRemaining) / totalDaysInPeriod * 100) / 100
      : 0;

    // Get upcoming invoice preview if possible
    let upcomingInvoiceTotal = null;
    try {
      const upcomingInvoice = await stripe.invoices.upcoming({
        customer: subscription.stripe_customer_id!,
        subscription: subscription.stripe_subscription_id,
      });
      upcomingInvoiceTotal = upcomingInvoice.total / 100;
    } catch (e) {
      logStep("Could not retrieve upcoming invoice", { error: String(e) });
    }

    return new Response(JSON.stringify({ 
      hasSubscription: true,
      status: stripeSubscription.status,
      plan: subscription.subscription_plans,
      currentSeats: currentQuantity,
      pricePerSeat: pricePerSeat,
      monthlyTotal: currentQuantity * pricePerSeat,
      currency: "GBP",
      currentPeriodStart: currentPeriodStart.toISOString(),
      currentPeriodEnd: currentPeriodEnd.toISOString(),
      nextBillingDate: currentPeriodEnd.toISOString(),
      daysRemaining: daysRemaining,
      totalDaysInPeriod: totalDaysInPeriod,
      prorationForNewSeat: proratedAmount,
      newMonthlyTotalAfterAddingSeat: (currentQuantity + 1) * pricePerSeat,
      upcomingInvoiceTotal: upcomingInvoiceTotal,
      isStripeManaged: true,
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

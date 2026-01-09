import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@18.5.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const logStep = (step: string, details?: any) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : '';
  console.log(`[GET-INVOICES] ${step}${detailsStr}`);
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

    const stripeKey = Deno.env.get("STRIPE_SECRET_KEY");
    if (!stripeKey) throw new Error("STRIPE_SECRET_KEY is not set");
    logStep("Stripe key verified");

    const authHeader = req.headers.get("Authorization");
    if (!authHeader) throw new Error("No authorization header provided");
    logStep("Authorization header found");

    const token = authHeader.replace("Bearer ", "");
    const { data: userData, error: userError } = await supabaseClient.auth.getUser(token);
    if (userError) throw new Error(`Authentication error: ${userError.message}`);
    const user = userData.user;
    if (!user?.email) throw new Error("User not authenticated or email not available");
    logStep("User authenticated", { userId: user.id, email: user.email });

    // Get effectiveOwnerId (parent_account_id for team members, else user.id)
    const { data: profile } = await supabaseClient
      .from("user_profiles")
      .select("parent_account_id")
      .eq("user_id", user.id)
      .maybeSingle();

    const effectiveOwnerId = profile?.parent_account_id || user.id;
    const isTeamMember = !!profile?.parent_account_id;
    
    logStep("Resolved effective owner", { 
      userId: user.id, 
      effectiveOwnerId, 
      isTeamMember 
    });

    // Get the effective owner's email for Stripe lookup
    let effectiveEmail = user.email;
    if (isTeamMember) {
      const { data: ownerAuth } = await supabaseClient.auth.admin.getUserById(effectiveOwnerId);
      effectiveEmail = ownerAuth?.user?.email || user.email;
      logStep("Using owner email for Stripe lookup", { effectiveEmail });
    }

    const stripe = new Stripe(stripeKey, { apiVersion: "2025-08-27.basil" });
    const customers = await stripe.customers.list({ email: effectiveEmail, limit: 1 });
    
    if (customers.data.length === 0) {
      logStep("No customer found, returning empty invoices");
      return new Response(JSON.stringify({ 
        invoices: [] 
      }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      });
    }

    const customerId = customers.data[0].id;
    logStep("Found Stripe customer", { customerId });

    const invoices = await stripe.invoices.list({
      customer: customerId,
      limit: 20,
    });
    
    logStep("Retrieved invoices", { count: invoices.data.length });

    return new Response(JSON.stringify({
      invoices: invoices.data
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    logStep("ERROR in get-invoices", { message: errorMessage });
    return new Response(JSON.stringify({ error: errorMessage }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});

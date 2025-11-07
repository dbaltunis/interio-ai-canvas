import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@18.5.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const logStep = (step: string, details?: any) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : '';
  console.log(`[STRIPE-CONNECT-CALLBACK] ${step}${detailsStr}`);
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

    const { code } = await req.json();
    if (!code) throw new Error("Authorization code is required");
    logStep("Authorization code received");

    const stripe = new Stripe(stripeKey, { apiVersion: "2025-08-27.basil" });

    // Exchange authorization code for access token
    const response = await stripe.oauth.token({
      grant_type: 'authorization_code',
      code,
    });

    logStep("OAuth token exchanged", { accountId: response.stripe_user_id });

    // Store the connected account details
    const { error: insertError } = await supabaseClient
      .from("payment_provider_connections")
      .upsert({
        user_id: user.id,
        provider: "stripe",
        stripe_account_id: response.stripe_user_id,
        stripe_access_token: response.access_token,
        stripe_refresh_token: response.refresh_token,
        stripe_scope: response.scope,
        is_active: true,
        updated_at: new Date().toISOString(),
      }, {
        onConflict: "user_id,provider"
      });

    if (insertError) {
      logStep("Failed to store connection", { error: insertError.message });
      throw new Error(`Failed to store connection: ${insertError.message}`);
    }

    logStep("Connection stored successfully");

    return new Response(JSON.stringify({ 
      success: true,
      account_id: response.stripe_user_id 
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

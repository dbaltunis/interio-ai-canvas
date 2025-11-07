import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@18.5.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const logStep = (step: string, details?: any) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : '';
  console.log(`[CREATE-QUOTE-PAYMENT] ${step}${detailsStr}`);
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    logStep("Function started");

    const stripeKey = Deno.env.get("STRIPE_SECRET_KEY");
    if (!stripeKey) throw new Error("STRIPE_SECRET_KEY is not set");
    logStep("Stripe key verified");

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

    const { quote_id } = await req.json();
    if (!quote_id) throw new Error("quote_id is required");
    logStep("Request parsed", { quote_id });

    // Get quote details
    const { data: quote, error: quoteError } = await supabaseClient
      .from("quotes")
      .select(`
        *,
        projects:project_id (
          id,
          name,
          client_id,
          clients:client_id (
            id,
            name,
            email,
            phone
          )
        )
      `)
      .eq("id", quote_id)
      .single();

    if (quoteError) throw new Error(`Failed to fetch quote: ${quoteError.message}`);
    if (!quote) throw new Error("Quote not found");
    if (quote.user_id !== user.id) throw new Error("Unauthorized access to quote");
    logStep("Quote fetched", { quoteId: quote.id, total: quote.total });

    // Get business settings for currency
    const { data: businessSettings } = await supabaseClient
      .from("business_settings")
      .select("currency, company_name")
      .eq("user_id", user.id)
      .single();

    const currency = (businessSettings?.currency || "USD").toLowerCase();
    const companyName = businessSettings?.company_name || "Company";

    const project = quote.projects;
    const client = project?.clients;
    const clientEmail = client?.email || user.email;
    const paymentAmount = quote.payment_amount || quote.total || 0;
    const paymentType = quote.payment_type || 'full';

    logStep("Preparing payment", { 
      paymentAmount, 
      paymentType, 
      currency,
      clientEmail 
    });

    const stripe = new Stripe(stripeKey, { apiVersion: "2025-08-27.basil" });

    // Find or create Stripe customer
    const customers = await stripe.customers.list({ email: clientEmail, limit: 1 });
    let customerId;
    if (customers.data.length > 0) {
      customerId = customers.data[0].id;
      logStep("Existing customer found", { customerId });
    } else {
      const customer = await stripe.customers.create({
        email: clientEmail,
        name: client?.name,
        metadata: {
          user_id: user.id,
          client_id: client?.id,
        },
      });
      customerId = customer.id;
      logStep("New customer created", { customerId });
    }

    // Create checkout session
    const origin = req.headers.get("origin") || "http://localhost:3000";
    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      line_items: [{
        price_data: {
          currency: currency,
          product_data: {
            name: `Quote ${quote.quote_number} - ${project?.name || 'Project'}`,
            description: `${paymentType === 'deposit' ? 'Deposit' : 'Full Payment'} for ${companyName}`,
          },
          unit_amount: Math.round(paymentAmount * 100), // Convert to cents
        },
        quantity: 1,
      }],
      mode: "payment",
      success_url: `${origin}/jobs/${project?.id}?tab=quotation&payment=success&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${origin}/jobs/${project?.id}?tab=quotation&payment=cancelled`,
      metadata: {
        quote_id: quote.id,
        project_id: project?.id,
        payment_type: paymentType,
        user_id: user.id,
      },
    });

    logStep("Checkout session created", { sessionId: session.id });

    // Update quote with payment intent ID
    const { error: updateError } = await supabaseClient
      .from("quotes")
      .update({
        stripe_payment_intent_id: session.id,
        payment_status: 'pending',
        updated_at: new Date().toISOString(),
      })
      .eq("id", quote_id);

    if (updateError) {
      logStep("Warning: Failed to update quote", { error: updateError.message });
    }

    return new Response(JSON.stringify({ url: session.url }), {
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

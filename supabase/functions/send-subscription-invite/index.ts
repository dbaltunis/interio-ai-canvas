import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@18.5.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const logStep = (step: string, details?: Record<string, unknown>) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : '';
  console.log(`[SEND-SUBSCRIPTION-INVITE] ${step}${detailsStr}`);
};

// Stripe Price IDs for each plan (£99/month per seat)
const PLAN_PRICES: Record<string, string> = {
  starter: "price_1SnDgLBgcx5218GhIHSLl1Rr", // £99/month per user
  business: "", // To be configured
  enterprise: "", // To be configured
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
    logStep("Function started v2");

    // Verify user is authenticated
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) throw new Error("No authorization header");

    const token = authHeader.replace("Bearer ", "");
    const { data: userData, error: userError } = await supabaseClient.auth.getUser(token);
    if (userError || !userData.user) throw new Error("Unauthorized");
    
    logStep("User authenticated", { userId: userData.user.id, email: userData.user.email });

    // Parse request body first to get the data we need
    const { email, planKey, seats = 1, clientName } = await req.json();
    
    if (!email || !planKey) {
      throw new Error("Email and plan are required");
    }

    const priceId = PLAN_PRICES[planKey.toLowerCase()];
    if (!priceId || priceId.includes("PLACEHOLDER")) {
      throw new Error(`Price ID not configured for plan: ${planKey}`);
    }

    logStep("Creating checkout for invite", { email, planKey, seats });

    const stripeKey = Deno.env.get("STRIPE_SECRET_KEY");
    if (!stripeKey) throw new Error("STRIPE_SECRET_KEY is not set");

    const stripe = new Stripe(stripeKey, { apiVersion: "2025-08-27.basil" });

    const origin = "https://appinterio.app";

    // Create checkout session for the invited client
    const session = await stripe.checkout.sessions.create({
      customer_email: email,
      line_items: [
        {
          price: priceId,
          quantity: seats,
        },
      ],
      mode: "subscription",
      success_url: `${origin}/subscription-success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${origin}/pricing`,
      allow_promotion_codes: true,
      billing_address_collection: "required",
      metadata: {
        invited_by: userData.user.id,
        client_name: clientName || "",
        seats: seats.toString(),
      },
    });

    logStep("Checkout session created", { sessionId: session.id });

    // Send invite email via SendGrid
    const sendgridApiKey = Deno.env.get("SENDGRID_API_KEY");
    if (sendgridApiKey) {
      const emailResponse = await fetch("https://api.sendgrid.com/v3/mail/send", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${sendgridApiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          personalizations: [{ to: [{ email }] }],
          from: { email: "noreply@interioapp.com", name: "InterioApp" },
          subject: `You're invited to subscribe to InterioApp - ${planKey} plan`,
          content: [
            {
              type: "text/html",
              value: `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                  <h2 style="color: #415e6b;">Welcome${clientName ? `, ${clientName}` : ''} to InterioApp!</h2>
                  <p>You've been invited to subscribe to our <strong>${planKey}</strong> plan.</p>
                  <p>InterioApp is the complete business management solution for interior designers and window treatment professionals.</p>
                  <p>Click the button below to complete your subscription and get started:</p>
                  <a href="${session.url}" style="display:inline-block;padding:14px 28px;background-color:#733341;color:white;text-decoration:none;border-radius:8px;margin:20px 0;font-weight:600;">
                    Subscribe Now
                  </a>
                  <p style="color: #666; font-size: 14px;">This link will expire in 24 hours.</p>
                  <p style="margin-top: 30px; color: #666; font-size: 12px;">If you have any questions, please contact our support team.</p>
                </div>
              `,
            },
          ],
        }),
      });

      if (emailResponse.ok) {
        logStep("Invite email sent", { email });
      } else {
        logStep("Email send failed, but checkout URL created", { status: emailResponse.status });
      }
    } else {
      logStep("SendGrid not configured, returning checkout URL only");
    }

    return new Response(JSON.stringify({ 
      success: true, 
      checkoutUrl: session.url,
      sessionId: session.id,
      message: sendgridApiKey ? "Invite email sent" : "Checkout URL generated (email not sent - SendGrid not configured)"
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

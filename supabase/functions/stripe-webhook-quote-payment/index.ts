import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@18.5.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";

const logStep = (step: string, details?: any) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : '';
  console.log(`[STRIPE-WEBHOOK-QUOTE-PAYMENT] ${step}${detailsStr}`);
};

serve(async (req) => {
  try {
    logStep("Webhook received");

    const stripeKey = Deno.env.get("STRIPE_SECRET_KEY");
    const webhookSecret = Deno.env.get("STRIPE_WEBHOOK_SECRET");
    
    if (!stripeKey) {
      throw new Error("STRIPE_SECRET_KEY is not set");
    }

    const stripe = new Stripe(stripeKey, { apiVersion: "2025-08-27.basil" });
    
    // Get the raw body for signature verification
    const body = await req.text();
    const signature = req.headers.get("stripe-signature");

    let event: Stripe.Event;

    // Verify webhook signature if secret is configured
    if (webhookSecret && signature) {
      try {
        event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
        logStep("Webhook signature verified");
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : String(err);
        logStep("Webhook signature verification failed", { error: errorMessage });
        return new Response(JSON.stringify({ error: "Invalid signature" }), { status: 400 });
      }
    } else {
      // Parse without verification (for development)
      event = JSON.parse(body);
      logStep("Webhook parsed without signature verification (dev mode)");
    }

    logStep("Event type", { type: event.type });

    // Only handle checkout.session.completed events
    if (event.type !== "checkout.session.completed") {
      logStep("Ignoring event type", { type: event.type });
      return new Response(JSON.stringify({ received: true }), { status: 200 });
    }

    const session = event.data.object as Stripe.Checkout.Session;
    logStep("Processing checkout session", { sessionId: session.id });

    // Extract metadata
    const quoteId = session.metadata?.quote_id;
    const paymentType = session.metadata?.payment_type || 'full';
    const userId = session.metadata?.user_id;

    if (!quoteId) {
      logStep("No quote_id in metadata, skipping");
      return new Response(JSON.stringify({ received: true, skipped: true }), { status: 200 });
    }

    logStep("Quote payment detected", { quoteId, paymentType, userId });

    // Initialize Supabase client with service role
    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
      { auth: { persistSession: false } }
    );

    // Get the quote to determine the payment details
    const { data: quote, error: quoteError } = await supabaseClient
      .from("quotes")
      .select("id, total, payment_amount, payment_type, amount_paid")
      .eq("id", quoteId)
      .single();

    if (quoteError) {
      logStep("Failed to fetch quote", { error: quoteError.message });
      throw new Error(`Failed to fetch quote: ${quoteError.message}`);
    }

    if (!quote) {
      logStep("Quote not found", { quoteId });
      throw new Error("Quote not found");
    }

    // Calculate new payment status and amount
    const amountPaidCents = session.amount_total || 0;
    const amountPaid = amountPaidCents / 100; // Convert from cents
    const currentAmountPaid = quote.amount_paid || 0;
    const newAmountPaid = currentAmountPaid + amountPaid;
    const total = quote.total || 0;

    // Determine payment status
    let paymentStatus: string;
    if (newAmountPaid >= total) {
      paymentStatus = 'paid';
    } else if (paymentType === 'deposit') {
      paymentStatus = 'deposit_paid';
    } else if (newAmountPaid > 0) {
      paymentStatus = 'partial';
    } else {
      paymentStatus = 'unpaid';
    }

    logStep("Updating quote payment", {
      quoteId,
      previousAmountPaid: currentAmountPaid,
      newPaymentAmount: amountPaid,
      totalAmountPaid: newAmountPaid,
      total,
      paymentStatus
    });

    // Update the quote with payment information
    const { error: updateError } = await supabaseClient
      .from("quotes")
      .update({
        payment_status: paymentStatus,
        amount_paid: newAmountPaid,
        stripe_payment_intent_id: session.payment_intent as string || session.id,
        updated_at: new Date().toISOString(),
      })
      .eq("id", quoteId);

    if (updateError) {
      logStep("Failed to update quote", { error: updateError.message });
      throw new Error(`Failed to update quote: ${updateError.message}`);
    }

    logStep("Quote payment updated successfully", { quoteId, paymentStatus, amountPaid: newAmountPaid });

    return new Response(JSON.stringify({ 
      received: true, 
      processed: true,
      quoteId,
      paymentStatus,
      amountPaid: newAmountPaid
    }), { 
      status: 200,
      headers: { "Content-Type": "application/json" }
    });

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    logStep("ERROR", { message: errorMessage });
    return new Response(JSON.stringify({ error: errorMessage }), { 
      status: 500,
      headers: { "Content-Type": "application/json" }
    });
  }
});

import Stripe from "npm:stripe@18.5.0";
import { createClient } from "npm:@supabase/supabase-js@2.49.4";

const logStep = (step: string, details?: Record<string, unknown>) => {
  console.log(`[STRIPE-WEBHOOK-QUOTE-PAYMENT] ${step}`, details ? JSON.stringify(details) : "");
};

Deno.serve(async (req) => {
  try {
    logStep("Webhook received");

    const stripeKey = Deno.env.get("STRIPE_SECRET_KEY");
    const webhookSecret = Deno.env.get("STRIPE_WEBHOOK_SECRET");
    
    if (!stripeKey) {
      throw new Error("STRIPE_SECRET_KEY is not set");
    }

    const stripe = new Stripe(stripeKey, { apiVersion: "2025-08-27.basil" });
    
    const body = await req.text();
    const signature = req.headers.get("stripe-signature");

    let event: Stripe.Event;

    if (webhookSecret && signature) {
      try {
        event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
        logStep("Webhook signature verified");
      } catch (err) {
        logStep("Signature verification failed", { error: String(err) });
        return new Response(JSON.stringify({ error: "Invalid signature" }), { status: 400 });
      }
    } else {
      event = JSON.parse(body);
      logStep("Parsed without signature (dev mode)");
    }

    if (event.type !== "checkout.session.completed") {
      return new Response(JSON.stringify({ received: true }), { status: 200 });
    }

    const session = event.data.object as Stripe.Checkout.Session;
    const quoteId = session.metadata?.quote_id;
    const paymentType = session.metadata?.payment_type || "full";

    if (!quoteId) {
      return new Response(JSON.stringify({ received: true, skipped: true }), { status: 200 });
    }

    logStep("Processing payment", { quoteId, paymentType });

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    const { data: quote, error: quoteError } = await supabase
      .from("quotes")
      .select("id, total, amount_paid")
      .eq("id", quoteId)
      .single();

    if (quoteError || !quote) {
      throw new Error(`Quote fetch failed: ${quoteError?.message}`);
    }

    const amountPaid = (session.amount_total || 0) / 100;
    const newAmountPaid = (quote.amount_paid || 0) + amountPaid;
    const total = quote.total || 0;

    const paymentStatus = newAmountPaid >= total 
      ? "paid" 
      : paymentType === "deposit" 
        ? "deposit_paid" 
        : newAmountPaid > 0 
          ? "partial" 
          : "unpaid";

    const { error: updateError } = await supabase
      .from("quotes")
      .update({
        payment_status: paymentStatus,
        amount_paid: newAmountPaid,
        stripe_payment_intent_id: (session.payment_intent as string) || session.id,
        updated_at: new Date().toISOString(),
      })
      .eq("id", quoteId);

    if (updateError) {
      throw new Error(`Update failed: ${updateError.message}`);
    }

    logStep("Payment updated", { quoteId, paymentStatus, amountPaid: newAmountPaid });

    return new Response(JSON.stringify({ received: true, processed: true }), { 
      status: 200,
      headers: { "Content-Type": "application/json" }
    });

  } catch (error) {
    logStep("ERROR", { message: String(error) });
    return new Response(JSON.stringify({ error: String(error) }), { status: 500 });
  }
});

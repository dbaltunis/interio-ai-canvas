import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.4";
import { createHmac, timingSafeEqual } from "node:crypto";

const logStep = (step: string, details?: Record<string, unknown>) => {
  console.log(`[STRIPE-WEBHOOK-QUOTE-PAYMENT] ${step}`, details ? JSON.stringify(details) : "");
};

function verifyStripeSignature(payload: string, signature: string, secret: string): boolean {
  const parts = signature.split(",").reduce((acc, part) => {
    const [key, value] = part.split("=");
    acc[key] = value;
    return acc;
  }, {} as Record<string, string>);

  const timestamp = parts["t"];
  const expectedSig = parts["v1"];

  if (!timestamp || !expectedSig) return false;

  const signedPayload = `${timestamp}.${payload}`;
  const computedSig = createHmac("sha256", secret).update(signedPayload).digest("hex");

  try {
    return timingSafeEqual(Buffer.from(expectedSig), Buffer.from(computedSig));
  } catch {
    return false;
  }
}

Deno.serve(async (req) => {
  try {
    logStep("Webhook received");

    const webhookSecret = Deno.env.get("STRIPE_WEBHOOK_SECRET");
    const body = await req.text();
    const signature = req.headers.get("stripe-signature");

    let event;

    if (webhookSecret && signature) {
      if (!verifyStripeSignature(body, signature, webhookSecret)) {
        logStep("Signature verification failed");
        return new Response(JSON.stringify({ error: "Invalid signature" }), { status: 400 });
      }
      logStep("Signature verified");
    }

    event = JSON.parse(body);

    if (event.type !== "checkout.session.completed") {
      return new Response(JSON.stringify({ received: true }), { status: 200 });
    }

    const session = event.data.object;
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
        stripe_payment_intent_id: session.payment_intent || session.id,
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

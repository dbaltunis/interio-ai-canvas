import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@18.5.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const logStep = (step: string, details?: Record<string, unknown>) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : '';
  console.log(`[GET-PENDING-INVITES] ${step}${detailsStr}`);
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

    // Verify user is authenticated and is System Owner
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) throw new Error("No authorization header");

    const token = authHeader.replace("Bearer ", "");
    const { data: userData, error: userError } = await supabaseClient.auth.getUser(token);
    if (userError || !userData.user) throw new Error("Unauthorized");

    // Check if user is System Owner
    const { data: profile, error: profileError } = await supabaseClient
      .from("user_profiles")
      .select("role")
      .eq("user_id", userData.user.id)
      .single();

    if (profileError || profile?.role !== "System Owner") {
      throw new Error("Unauthorized: System Owner access required");
    }

    logStep("System Owner verified", { userId: userData.user.id });

    const stripeKey = Deno.env.get("STRIPE_SECRET_KEY");
    if (!stripeKey) throw new Error("STRIPE_SECRET_KEY is not set");

    const stripe = new Stripe(stripeKey, { apiVersion: "2025-08-27.basil" });

    // Get checkout sessions from the last 30 days
    const thirtyDaysAgo = Math.floor(Date.now() / 1000) - 30 * 24 * 60 * 60;

    const sessions = await stripe.checkout.sessions.list({
      limit: 100,
      created: { gte: thirtyDaysAgo },
    });

    logStep("Fetched checkout sessions", { count: sessions.data.length });

    // Filter to only subscription sessions and format the response
    const invites = sessions.data
      .filter((session) => session.mode === "subscription")
      .map((session) => {
        // Determine plan from metadata or line items
        const planName = session.metadata?.plan_key || "starter";
        const seats = parseInt(session.metadata?.seats || "1", 10);

        return {
          sessionId: session.id,
          email: session.customer_email || session.customer_details?.email || "Unknown",
          customerName: session.customer_details?.name || session.metadata?.client_name || null,
          amount: session.amount_total || 0,
          currency: session.currency || "gbp",
          status: session.status as "open" | "complete" | "expired",
          paymentStatus: session.payment_status as "unpaid" | "paid" | "no_payment_required",
          createdAt: new Date(session.created * 1000).toISOString(),
          expiresAt: session.expires_at 
            ? new Date(session.expires_at * 1000).toISOString() 
            : new Date((session.created + 24 * 60 * 60) * 1000).toISOString(),
          planName,
          seats,
          checkoutUrl: session.status === "open" ? session.url : null,
        };
      })
      // Sort by created date, newest first
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    logStep("Processed invites", { total: invites.length });

    return new Response(
      JSON.stringify({ invites }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      }
    );
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    logStep("ERROR", { message: errorMessage });
    return new Response(
      JSON.stringify({ error: errorMessage, invites: [] }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      }
    );
  }
});

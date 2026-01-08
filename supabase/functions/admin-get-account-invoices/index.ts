import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import Stripe from "https://esm.sh/stripe@14.21.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const logStep = (step: string, details?: any) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : "";
  console.log(`[ADMIN-GET-INVOICES] ${step}${detailsStr}`);
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { stripeCustomerId, limit = 12 } = await req.json();

    if (!stripeCustomerId) {
      throw new Error("stripeCustomerId is required");
    }

    logStep("Request received", { stripeCustomerId, limit });

    // Verify the requesting user is a System Owner
    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      throw new Error("Authorization required");
    }

    const token = authHeader.replace("Bearer ", "");
    const { data: { user }, error: authError } = await supabaseAdmin.auth.getUser(token);

    if (authError || !user) {
      throw new Error("Invalid authentication");
    }

    // Check if requesting user is System Owner
    const { data: userRole, error: roleError } = await supabaseAdmin.rpc("get_user_role", {
      _user_id: user.id,
    });

    if (roleError || userRole !== "System Owner") {
      logStep("Not authorized", { role: userRole });
      throw new Error("Only System Owners can access account invoices");
    }

    // Initialize Stripe
    const stripeSecretKey = Deno.env.get("STRIPE_SECRET_KEY");
    if (!stripeSecretKey) {
      throw new Error("Stripe secret key not configured");
    }

    const stripe = new Stripe(stripeSecretKey, {
      apiVersion: "2023-10-16",
    });

    // Fetch invoices from Stripe
    logStep("Fetching invoices from Stripe", { customerId: stripeCustomerId });
    
    const invoices = await stripe.invoices.list({
      customer: stripeCustomerId,
      limit: limit,
    });

    logStep("Invoices fetched", { count: invoices.data.length });

    // Format invoice data
    const formattedInvoices = invoices.data.map((invoice) => ({
      id: invoice.id,
      number: invoice.number,
      status: invoice.status,
      amount_due: invoice.amount_due,
      amount_paid: invoice.amount_paid,
      currency: invoice.currency,
      created: invoice.created,
      period_start: invoice.period_start,
      period_end: invoice.period_end,
      hosted_invoice_url: invoice.hosted_invoice_url,
      invoice_pdf: invoice.invoice_pdf,
      description: invoice.description,
      lines: invoice.lines?.data?.map((line) => ({
        description: line.description,
        amount: line.amount,
        quantity: line.quantity,
      })),
    }));

    return new Response(
      JSON.stringify({ invoices: formattedInvoices }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      }
    );
  } catch (error: any) {
    logStep("ERROR", { message: error.message });
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 500,
      }
    );
  }
});

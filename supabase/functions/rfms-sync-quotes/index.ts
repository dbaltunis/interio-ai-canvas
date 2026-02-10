import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

/**
 * RFMS Quote Sync Edge Function
 *
 * Pushes InterioApp projects (quotes/orders) to RFMS as Quote headers.
 * RFMS Standard API supports creating Quote, Order, and Estimate headers.
 * Enterprise tier required for line items.
 */

async function ensureSession(
  supabase: any,
  integration: any
): Promise<{ sessionToken: string; storeQueue: string; apiUrl: string }> {
  const { store_queue, api_key, session_token } = integration.api_credentials || {};
  const apiUrl = integration.api_credentials?.api_url || "https://api.rfms.online/v2";

  if (!store_queue || !api_key) {
    throw new Error("RFMS credentials not configured");
  }

  if (session_token) {
    return { sessionToken: session_token, storeQueue: store_queue, apiUrl };
  }

  const basicAuth = btoa(`${store_queue}:${api_key}`);
  const response = await fetch(`${apiUrl}/session/begin`, {
    method: "POST",
    headers: {
      Authorization: `Basic ${basicAuth}`,
      "Content-Type": "application/json",
    },
  });

  if (!response.ok) {
    throw new Error(`RFMS session begin failed: ${response.status}`);
  }

  const data = await response.json();
  if (data.status !== "success") {
    throw new Error(`RFMS session error: ${data.reason || data.status}`);
  }

  const newToken = data.result?.token || data.result?.session_token;
  if (!newToken) throw new Error("No session token from RFMS");

  await supabase
    .from("integration_settings")
    .update({
      api_credentials: {
        ...integration.api_credentials,
        session_token: newToken,
        session_started_at: new Date().toISOString(),
      },
    })
    .eq("id", integration.id);

  return { sessionToken: newToken, storeQueue: store_queue, apiUrl };
}

async function rfmsRequest(
  method: string,
  endpoint: string,
  storeQueue: string,
  sessionToken: string,
  apiUrl: string,
  body?: any
): Promise<any> {
  const auth = btoa(`${storeQueue}:${sessionToken}`);
  const options: RequestInit = {
    method,
    headers: {
      Authorization: `Basic ${auth}`,
      "Content-Type": "application/json",
    },
  };

  if (body && (method === "POST" || method === "PUT")) {
    options.body = JSON.stringify(body);
  }

  const response = await fetch(`${apiUrl}${endpoint}`, options);
  const data = await response.json();

  if (data.status === "failed") {
    throw new Error(`RFMS API error: ${data.reason || "Request failed"}`);
  }

  return data;
}

serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    const authHeader = req.headers.get("Authorization");
    if (!authHeader) throw new Error("No authorization header");

    const token = authHeader.replace("Bearer ", "");
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser(token);
    if (userError || !user) throw new Error("Unauthorized");

    const { projectId, direction } = await req.json();

    // Get RFMS integration
    const { data: integration, error: intError } = await supabase
      .from("integration_settings")
      .select("*")
      .eq("user_id", user.id)
      .eq("integration_type", "rfms")
      .eq("active", true)
      .single();

    if (intError || !integration) {
      throw new Error("RFMS integration not found");
    }

    const { sessionToken, storeQueue, apiUrl } = await ensureSession(
      supabase,
      integration
    );

    const results = {
      exported: 0,
      updated: 0,
      errors: [] as string[],
    };

    if (direction === "push") {
      // Push specific project or all projects to RFMS
      let projectsQuery = supabase
        .from("projects")
        .select(
          `
          *,
          clients!projects_client_id_fkey (
            id, name, email, phone, address, city, state, zip_code, company_name,
            rfms_customer_id
          )
        `
        )
        .eq("user_id", user.id);

      if (projectId) {
        projectsQuery = projectsQuery.eq("id", projectId);
      }

      const { data: projects, error: projError } = await projectsQuery;

      if (projError) {
        throw new Error(`Failed to fetch projects: ${projError.message}`);
      }

      for (const project of projects || []) {
        try {
          // Get treatments (line items) for this project
          const { data: treatments } = await supabase
            .from("treatments")
            .select("*")
            .eq("project_id", project.id);

          // Calculate totals from treatments
          const totalPrice =
            treatments?.reduce(
              (sum: number, t: any) => sum + (t.total_price || 0),
              0
            ) || 0;
          const totalCost =
            treatments?.reduce(
              (sum: number, t: any) =>
                sum + (t.material_cost || 0) + (t.labor_cost || 0),
              0
            ) || 0;

          // Build treatment summary for notes
          const treatmentSummary =
            treatments
              ?.map(
                (t: any) =>
                  `${t.treatment_name || t.treatment_type}: ${t.product_name || "N/A"} - $${(t.total_price || 0).toFixed(2)}`
              )
              .join("\n") || "No line items";

          // Build RFMS quote header
          const rfmsQuote: any = {
            // Customer reference
            customer_id: (project.clients as any)?.rfms_customer_id || undefined,

            // Quote details
            description: project.name,
            notes: [
              `InterioApp Quote: ${project.quote_number || project.job_number || project.id}`,
              `Status: ${project.status || "Draft"}`,
              project.description ? `Description: ${project.description}` : null,
              `---`,
              `Line Items:`,
              treatmentSummary,
              `---`,
              `Total: $${totalPrice.toFixed(2)}`,
              `Cost: $${totalCost.toFixed(2)}`,
            ]
              .filter(Boolean)
              .join("\n"),

            // Pricing
            total: totalPrice,
            cost: totalCost,

            // Reference
            reference: project.quote_number || project.job_number || project.id,
          };

          // Add customer info if no RFMS customer linked
          if (!rfmsQuote.customer_id && project.clients) {
            const client = project.clients as any;
            rfmsQuote.customer_name =
              client.name || `${client.first_name || ""} ${client.last_name || ""}`.trim();
            rfmsQuote.customer_email = client.email;
            rfmsQuote.customer_phone = client.phone;
          }

          const existingRfmsQuoteId = (project as any).rfms_quote_id;

          if (existingRfmsQuoteId) {
            // Update existing RFMS quote
            await rfmsRequest(
              "PUT",
              `/quotes/${existingRfmsQuoteId}`,
              storeQueue,
              sessionToken,
              apiUrl,
              rfmsQuote
            );
            results.updated++;
          } else {
            // Create new RFMS quote
            const createResult = await rfmsRequest(
              "POST",
              "/quotes",
              storeQueue,
              sessionToken,
              apiUrl,
              rfmsQuote
            );

            if (createResult.status === "success" && createResult.result?.id) {
              // Store RFMS quote ID
              await supabase
                .from("projects")
                .update({ rfms_quote_id: createResult.result.id } as any)
                .eq("id", project.id);

              results.exported++;
            }
          }
        } catch (err: any) {
          results.errors.push(`Project ${project.id}: ${err.message}`);
        }
      }
    }

    // Update last sync
    await supabase
      .from("integration_settings")
      .update({ last_sync: new Date().toISOString() })
      .eq("id", integration.id);

    console.log(
      `RFMS quote sync: ${results.exported} exported, ${results.updated} updated, ${results.errors.length} errors`
    );

    return new Response(JSON.stringify({ success: true, ...results }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error: any) {
    console.error("RFMS quote sync error:", error);
    return new Response(
      JSON.stringify({ error: error.message || "Quote sync failed" }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});

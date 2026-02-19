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
 * 
 * MULTI-TENANT: Resolves account_owner_id so team members can use the owner's integration.
 */

async function ensureSession(
  supabase: any,
  integration: any
): Promise<{ sessionToken: string; storeQueue: string; apiUrl: string }> {
  const { store_queue, api_key, session_token } = integration.api_credentials || {};
  const apiUrl = integration.api_credentials?.api_url || "https://api.rfms.online/v2";

  if (!store_queue || !api_key) {
    throw new Error("RFMS credentials not configured. Please enter your Store Queue and API Key in Settings.");
  }

  if (session_token) {
    return { sessionToken: session_token, storeQueue: store_queue, apiUrl };
  }

  const basicAuth = btoa(`${store_queue}:${api_key}`);
  let response: Response;
  try {
    response = await fetch(`${apiUrl}/session/begin`, {
      method: "POST",
      headers: {
        Authorization: `Basic ${basicAuth}`,
        "Content-Type": "application/json",
      },
    });
  } catch (fetchErr: any) {
    console.error("RFMS network error:", fetchErr.message);
    throw new Error(`Cannot reach RFMS server at ${apiUrl}. Check your internet connection and API URL.`);
  }

  const responseText = await response.text();
  console.log(`RFMS session/begin response [${response.status}]: ${responseText.substring(0, 500)}`);

  if (!response.ok) {
    try {
      const errData = JSON.parse(responseText);
      throw new Error(`RFMS rejected the connection (${response.status}): ${errData.reason || errData.message || errData.error || responseText.substring(0, 200)}`);
    } catch (parseErr) {
      if ((parseErr as Error).message.includes("RFMS rejected")) throw parseErr;
      throw new Error(`RFMS returned HTTP ${response.status}. The API URL or credentials may be incorrect.`);
    }
  }

  let data: any;
  try {
    data = JSON.parse(responseText);
  } catch {
    throw new Error(`RFMS returned an invalid response. Check your API URL is correct: ${apiUrl}`);
  }

  // Handle RFMS v2 response format: {authorized, sessionToken} at top level
  if (data.authorized === true && data.sessionToken) {
    const newToken = data.sessionToken;
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

  // Handle legacy format: {status: "success", result: {token}}
  if (data.status === "failed") {
    throw new Error(`RFMS authentication failed: ${data.reason || "Your Store Queue or API Key was rejected."}`);
  }

  if (data.status === "success") {
    const newToken = data.result?.token || data.result?.session_token;
    if (!newToken) throw new Error("RFMS did not return a session token. Contact RFMS support.");
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

  // Neither format matched
  throw new Error(`Unexpected RFMS response format. Please contact support. Response: ${JSON.stringify(data).substring(0, 150)}`);
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

  let response: Response;
  try {
    response = await fetch(`${apiUrl}${endpoint}`, options);
  } catch (fetchErr: any) {
    throw new Error(`Cannot reach RFMS API at ${apiUrl}${endpoint}. Network error: ${fetchErr.message}`);
  }

  const responseText = await response.text();
  console.log(`RFMS ${method} ${endpoint} [${response.status}]: ${responseText.substring(0, 300)}`);

  let data: any;
  try {
    data = JSON.parse(responseText);
  } catch {
    throw new Error(`RFMS returned invalid data for ${endpoint}. Response: ${responseText.substring(0, 200)}`);
  }

  if (data.status === "failed") {
    throw new Error(`RFMS API error on ${endpoint}: ${data.reason || "Request failed"}`);
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

    // Resolve effective account owner for multi-tenant support
    const { data: userProfile } = await supabase
      .from("user_profiles")
      .select("parent_account_id")
      .eq("user_id", user.id)
      .maybeSingle();
    const accountOwnerId = userProfile?.parent_account_id || user.id;

    // Get RFMS integration using account_owner_id (not user_id)
    const { data: integration, error: intError } = await supabase
      .from("integration_settings")
      .select("*")
      .eq("user_id", accountOwnerId)
      .eq("integration_type", "rfms")
      .eq("active", true)
      .single();

    if (intError || !integration) {
      throw new Error("RFMS integration not found or not active. Please configure RFMS in Settings → Integrations first.");
    }

    const { sessionToken, storeQueue, apiUrl } = await ensureSession(
      supabase,
      integration
    );

    const results = {
      imported: 0,
      exported: 0,
      updated: 0,
      errors: [] as string[],
    };

    if (direction === "pull" || direction === "both") {
      try {
        const rfmsData = await rfmsRequest("GET", "/quotes", storeQueue, sessionToken, apiUrl);

        if (rfmsData.status === "success" && rfmsData.result) {
          const quotes = Array.isArray(rfmsData.result)
            ? rfmsData.result
            : rfmsData.result.quotes || [];

          for (const quote of quotes) {
            try {
              const rfmsQuoteId = quote.id?.toString();
              if (!rfmsQuoteId) continue;

              const { data: existing } = await supabase
                .from("projects")
                .select("id")
                .eq("user_id", user.id)
                .eq("rfms_quote_id" as any, rfmsQuoteId)
                .maybeSingle();

              if (existing) {
                await supabase
                  .from("projects")
                  .update({
                    name: quote.description || existing.id,
                    total_price: quote.total || undefined,
                  } as any)
                  .eq("id", existing.id);
                results.updated++;
                continue;
              }

              let clientId = null;
              if (quote.customer_id) {
                const { data: matchingClient } = await supabase
                  .from("clients")
                  .select("id")
                  .eq("user_id", user.id)
                  .eq("rfms_customer_id" as any, quote.customer_id.toString())
                  .maybeSingle();

                if (matchingClient) clientId = matchingClient.id;
              }

              await supabase
                .from("projects")
                .insert({
                  user_id: user.id,
                  name: quote.description || `RFMS Quote ${rfmsQuoteId}`,
                  status: "quoted",
                  client_id: clientId,
                  rfms_quote_id: rfmsQuoteId,
                  quote_number: quote.reference || undefined,
                } as any);

              results.imported++;
            } catch (err: any) {
              results.errors.push(`RFMS Quote ${quote.id}: ${err.message}`);
            }
          }
        }
      } catch (err: any) {
        results.errors.push(`Pull failed: ${err.message}`);
      }
    }

    if (direction === "push" || direction === "both") {
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
          const { data: treatments } = await supabase
            .from("treatments")
            .select("*")
            .eq("project_id", project.id);

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

          const treatmentSummary =
            treatments
              ?.map(
                (t: any) =>
                  `${t.treatment_name || t.treatment_type}: ${t.product_name || "N/A"} - $${(t.total_price || 0).toFixed(2)}`
              )
              .join("\n") || "No line items";

          const rfmsQuote: any = {
            customer_id: (project.clients as any)?.rfms_customer_id || undefined,
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
            total: totalPrice,
            cost: totalCost,
            reference: project.quote_number || project.job_number || project.id,
          };

          if (!rfmsQuote.customer_id && project.clients) {
            const client = project.clients as any;
            rfmsQuote.customer_name =
              client.name || `${client.first_name || ""} ${client.last_name || ""}`.trim();
            rfmsQuote.customer_email = client.email;
            rfmsQuote.customer_phone = client.phone;
          }

          const existingRfmsQuoteId = (project as any).rfms_quote_id;

          if (existingRfmsQuoteId) {
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
            const createResult = await rfmsRequest(
              "POST",
              "/quotes",
              storeQueue,
              sessionToken,
              apiUrl,
              rfmsQuote
            );

            if (createResult.status === "success" && createResult.result?.id) {
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
    console.error("RFMS quote sync error:", error.message);
    const isUserError = error.message.includes("credentials") ||
                        error.message.includes("rejected") ||
                        error.message.includes("not configured") ||
                        error.message.includes("not found") ||
                        error.message.includes("not active") ||
                        error.message.includes("Check your");
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message || "Quote sync failed",
        user_action_required: isUserError,
      }),
      {
        status: isUserError ? 400 : 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});

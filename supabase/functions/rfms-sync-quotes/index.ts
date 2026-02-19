import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

/**
 * RFMS Quote Sync Edge Function
 *
 * Push: Export InterioApp projects to RFMS as opportunities/quotes.
 * Pull: Import RFMS quotes/opportunities into InterioApp as projects.
 * Auto Job Status: Maps RFMS statuses to InterioApp project statuses.
 * 
 * MULTI-TENANT: Uses account_owner_id for integration lookup.
 */

// RFMS status → InterioApp project status mapping
const RFMS_STATUS_MAP: Record<string, string> = {
  "Open": "quoted",
  "Quoted": "quoted",
  "Sold": "approved",
  "Ordered": "in_progress",
  "Scheduled": "in_progress",
  "In Progress": "in_progress",
  "Installed": "completed",
  "Complete": "completed",
  "Completed": "completed",
  "Closed": "completed",
  "Cancelled": "cancelled",
  "Canceled": "cancelled",
  "Lost": "cancelled",
  "Declined": "cancelled",
};

async function ensureSession(
  supabase: any,
  integration: any,
  forceRefresh = false
): Promise<{ sessionToken: string; storeQueue: string; apiUrl: string }> {
  const { store_queue, api_key, session_token, session_started_at } = integration.api_credentials || {};
  const apiUrl = integration.api_credentials?.api_url || "https://api.rfms.online/v2";

  if (!store_queue || !api_key) {
    throw new Error("RFMS credentials not configured. Please enter your Store Queue and API Key in Settings.");
  }

  if (session_token && !forceRefresh) {
    const sessionAge = Date.now() - new Date(session_started_at || 0).getTime();
    const MAX_SESSION_AGE_MS = 25 * 60 * 1000;
    if (sessionAge < MAX_SESSION_AGE_MS) {
      return { sessionToken: session_token, storeQueue: store_queue, apiUrl };
    }
    console.log("RFMS session token expired (age: " + Math.round(sessionAge / 60000) + "min), refreshing...");
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

  throw new Error(`Unexpected RFMS response format. Response: ${JSON.stringify(data).substring(0, 150)}`);
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
  console.log(`RFMS ${method} ${endpoint} [${response.status}]: ${responseText.substring(0, 500)}`);

  if (response.status === 401) {
    throw new Error("RFMS_SESSION_EXPIRED");
  }

  if (response.status === 405) {
    throw new Error(`RFMS does not support ${method} on ${endpoint}. This feature may require a higher API tier.`);
  }

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
    const { data: { user }, error: userError } = await supabase.auth.getUser(token);
    if (userError || !user) throw new Error("Unauthorized");

    const { projectId, direction, autoUpdateJobStatus } = await req.json();

    // Resolve effective account owner for multi-tenant support
    const { data: userProfile } = await supabase
      .from("user_profiles")
      .select("parent_account_id")
      .eq("user_id", user.id)
      .maybeSingle();
    const accountOwnerId = userProfile?.parent_account_id || user.id;

    // Use account_owner_id for integration lookup
    const { data: integration, error: intError } = await supabase
      .from("integration_settings")
      .select("*")
      .eq("account_owner_id", accountOwnerId)
      .eq("integration_type", "rfms")
      .eq("active", true)
      .maybeSingle();

    // Fallback to user_id if account_owner_id doesn't match
    let activeIntegration = integration;
    if (!activeIntegration) {
      const { data: legacyInt } = await supabase
        .from("integration_settings")
        .select("*")
        .eq("user_id", accountOwnerId)
        .eq("integration_type", "rfms")
        .eq("active", true)
        .maybeSingle();
      activeIntegration = legacyInt;
    }

    if (!activeIntegration) {
      throw new Error("RFMS integration not found or not active. Please configure RFMS in Settings → Integrations first.");
    }

    let { sessionToken, storeQueue, apiUrl } = await ensureSession(supabase, activeIntegration);

    const results = {
      imported: 0,
      exported: 0,
      updated: 0,
      skipped: 0,
      statusUpdates: 0,
      errors: [] as string[],
    };

    const withSessionRetry = async (fn: (st: string) => Promise<void>) => {
      try {
        await fn(sessionToken);
      } catch (err: any) {
        if (err.message === "RFMS_SESSION_EXPIRED") {
          console.log("Session expired, refreshing and retrying...");
          const refreshed = await ensureSession(supabase, activeIntegration, true);
          sessionToken = refreshed.sessionToken;
          await fn(sessionToken);
        } else {
          throw err;
        }
      }
    };

    if (direction === "pull" || direction === "both") {
      await withSessionRetry(async (currentToken: string) => {
        let rfmsData: any;
        let quotes: any[] = [];

        // Try multiple endpoints
        try {
          rfmsData = await rfmsRequest("GET", "/opportunities", storeQueue, currentToken, apiUrl);
        } catch (err: any) {
          if (err.message === "RFMS_SESSION_EXPIRED") throw err;
          try {
            rfmsData = await rfmsRequest("POST", "/quotes", storeQueue, currentToken, apiUrl, { limit: 500 });
          } catch (err2: any) {
            if (err2.message === "RFMS_SESSION_EXPIRED") throw err2;
            rfmsData = await rfmsRequest("GET", "/quotes", storeQueue, currentToken, apiUrl);
          }
        }

        if (rfmsData.status === "success" && rfmsData.result) {
          if (Array.isArray(rfmsData.result)) {
            quotes = rfmsData.result;
          } else if (rfmsData.result.quotes && Array.isArray(rfmsData.result.quotes)) {
            quotes = rfmsData.result.quotes;
          } else if (rfmsData.result.opportunities && Array.isArray(rfmsData.result.opportunities)) {
            quotes = rfmsData.result.opportunities;
          }
        } else if (Array.isArray(rfmsData)) {
          quotes = rfmsData;
        }

        console.log(`RFMS quote pull: found ${quotes.length} records to process`);

        for (const quote of quotes) {
          try {
            const rfmsQuoteId = (quote.id || quote.opportunityId || quote.quoteId || "").toString();
            if (!rfmsQuoteId) { results.skipped++; continue; }

            const rfmsStatus = quote.status || quote.opportunityStatus || quote.quoteStatus || "";

            const { data: existing } = await supabase
              .from("projects")
              .select("id, status")
              .eq("user_id", accountOwnerId)
              .eq("rfms_quote_id", rfmsQuoteId)
              .maybeSingle();

            if (existing) {
              const updateData: any = {
                name: quote.description || quote.name || existing.id,
                total_price: quote.total || undefined,
              };

              // Auto update job status if enabled
              if (autoUpdateJobStatus && rfmsStatus) {
                const mappedStatus = RFMS_STATUS_MAP[rfmsStatus];
                if (mappedStatus && mappedStatus !== existing.status) {
                  updateData.status = mappedStatus;
                  results.statusUpdates++;
                  console.log(`Status update: Project ${existing.id} ${existing.status} → ${mappedStatus} (RFMS: ${rfmsStatus})`);
                }
              }

              await supabase
                .from("projects")
                .update(updateData)
                .eq("id", existing.id);
              results.updated++;
              continue;
            }

            let clientId = null;
            const custId = (quote.customer_id || quote.customerId || "").toString();
            if (custId) {
              const { data: matchingClient } = await supabase
                .from("clients")
                .select("id")
                .eq("user_id", accountOwnerId)
                .eq("rfms_customer_id", custId)
                .maybeSingle();
              if (matchingClient) clientId = matchingClient.id;
            }

            const mappedStatus = rfmsStatus ? (RFMS_STATUS_MAP[rfmsStatus] || "quoted") : "quoted";

            await supabase
              .from("projects")
              .insert({
                user_id: accountOwnerId,
                name: quote.description || quote.name || `RFMS Quote ${rfmsQuoteId}`,
                status: mappedStatus,
                client_id: clientId,
                rfms_quote_id: rfmsQuoteId,
                quote_number: quote.reference || quote.quoteNumber || undefined,
              } as any);
            results.imported++;
          } catch (err: any) {
            results.errors.push(`RFMS Quote ${quote.id || 'unknown'}: ${err.message}`);
          }
        }
      }).catch((err: any) => {
        results.errors.push(`Pull failed: ${err.message}`);
      });
    }

    if (direction === "push" || direction === "both") {
      await withSessionRetry(async (currentToken: string) => {
        let projectsQuery = supabase
          .from("projects")
          .select(`*, clients (id, name, email, phone, address, city, state, zip_code, company_name, rfms_customer_id)`)
          .eq("user_id", accountOwnerId);

        if (projectId) {
          projectsQuery = projectsQuery.eq("id", projectId);
        }

        const { data: projects, error: projError } = await projectsQuery;
        if (projError) throw new Error(`Failed to fetch projects: ${projError.message}`);

        for (const project of projects || []) {
          try {
            const { data: treatments } = await supabase
              .from("treatments")
              .select("*")
              .eq("project_id", project.id);

            const totalPrice = treatments?.reduce((sum: number, t: any) => sum + (t.total_price || 0), 0) || 0;
            const totalCost = treatments?.reduce((sum: number, t: any) => sum + (t.material_cost || 0) + (t.labor_cost || 0), 0) || 0;

            const treatmentSummary = treatments?.map((t: any) =>
              `${t.treatment_name || t.treatment_type}: ${t.product_name || "N/A"} - $${(t.total_price || 0).toFixed(2)}`
            ).join("\n") || "No line items";

            const rfmsQuote: any = {
              customer_id: (project.clients as any)?.rfms_customer_id || undefined,
              description: project.name,
              notes: [
                `InterioApp Quote: ${project.quote_number || project.job_number || project.id}`,
                `Status: ${project.status || "Draft"}`,
                project.description ? `Description: ${project.description}` : null,
                `---`, `Line Items:`, treatmentSummary, `---`,
                `Total: $${totalPrice.toFixed(2)}`, `Cost: $${totalCost.toFixed(2)}`,
              ].filter(Boolean).join("\n"),
              total: totalPrice,
              cost: totalCost,
              reference: project.quote_number || project.job_number || project.id,
            };

            if (!rfmsQuote.customer_id && project.clients) {
              const client = project.clients as any;
              rfmsQuote.customer_name = client.name || `${client.first_name || ""} ${client.last_name || ""}`.trim();
              rfmsQuote.customer_email = client.email;
              rfmsQuote.customer_phone = client.phone;
            }

            const existingRfmsQuoteId = (project as any).rfms_quote_id;

            if (existingRfmsQuoteId) {
              await rfmsRequest("PUT", `/quotes/${existingRfmsQuoteId}`, storeQueue, currentToken, apiUrl, rfmsQuote);
              results.updated++;
            } else {
              const createResult = await rfmsRequest("POST", "/opportunities", storeQueue, currentToken, apiUrl, rfmsQuote);
              const newId = createResult.result?.id || createResult.result?.opportunityId || createResult.id;
              if (newId) {
                await supabase.from("projects").update({ rfms_quote_id: newId.toString() } as any).eq("id", project.id);
                results.exported++;
              } else {
                results.errors.push(`Project ${project.id}: RFMS did not return an ID for the created opportunity`);
              }
            }
          } catch (err: any) {
            if (err.message === "RFMS_SESSION_EXPIRED") throw err;
            results.errors.push(`Project ${project.id}: ${err.message}`);
          }
        }
      }).catch((err: any) => {
        results.errors.push(`Push failed: ${err.message}`);
      });
    }

    // Update last sync
    await supabase
      .from("integration_settings")
      .update({ last_sync: new Date().toISOString() })
      .eq("id", activeIntegration.id);

    const summary = [
      results.imported > 0 ? `${results.imported} imported` : null,
      results.exported > 0 ? `${results.exported} exported` : null,
      results.updated > 0 ? `${results.updated} updated` : null,
      results.statusUpdates > 0 ? `${results.statusUpdates} statuses updated` : null,
      results.skipped > 0 ? `${results.skipped} skipped` : null,
      results.errors.length > 0 ? `${results.errors.length} errors` : null,
    ].filter(Boolean).join(", ");

    console.log(`RFMS quote sync: ${summary || "no changes"}`);

    return new Response(JSON.stringify({ success: true, ...results, summary }), {
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

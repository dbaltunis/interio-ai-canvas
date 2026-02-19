import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

/**
 * RFMS Customer Sync Edge Function
 *
 * Bidirectional customer sync between InterioApp and RFMS.
 * - Push: Export InterioApp clients to RFMS as customers
 * - Pull: Import RFMS customers to InterioApp as clients
 * 
 * MULTI-TENANT: Resolves account_owner_id so team members can use the owner's integration.
 */

interface RFMSCustomer {
  id?: string;
  first_name?: string;
  last_name?: string;
  company_name?: string;
  email?: string;
  phone?: string;
  address?: string;
  city?: string;
  state?: string;
  zip?: string;
  notes?: string;
}

async function ensureSession(
  supabase: any,
  integration: any
): Promise<{ sessionToken: string; storeQueue: string; apiUrl: string }> {
  const { store_queue, api_key, session_token } = integration.api_credentials || {};
  const apiUrl = integration.api_credentials?.api_url || "https://api.rfms.online/v2";

  if (!store_queue || !api_key) {
    throw new Error("RFMS credentials not configured. Please enter your Store Queue and API Key in Settings.");
  }

  // If we have a session token, try to use it
  if (session_token) {
    return { sessionToken: session_token, storeQueue: store_queue, apiUrl };
  }

  // Otherwise, begin a new session
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

  if (data.status === "failed") {
    throw new Error(`RFMS authentication failed: ${data.reason || "Your Store Queue or API Key was rejected."}`);
  }

  if (data.status !== "success") {
    throw new Error(`Unexpected RFMS response: ${JSON.stringify(data).substring(0, 200)}`);
  }

  const newToken = data.result?.token || data.result?.session_token;
  if (!newToken) throw new Error("RFMS did not return a session token. Contact RFMS support.");

  // Store the token
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
    const { data: { user }, error: userError } = await supabase.auth.getUser(token);
    if (userError || !user) throw new Error("Unauthorized");

    const { direction, clientId } = await req.json();

    // Resolve effective account owner for multi-tenant support
    const { data: userProfile } = await supabase
      .from("user_profiles")
      .select("parent_account_id")
      .eq("user_id", user.id)
      .maybeSingle();
    const accountOwnerId = userProfile?.parent_account_id || user.id;

    // Get integration using account_owner_id (not user_id)
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

    const { sessionToken, storeQueue, apiUrl } = await ensureSession(supabase, integration);

    const results = { imported: 0, exported: 0, updated: 0, errors: [] as string[] };

    if (direction === "push" || direction === "both") {
      // Push InterioApp clients to RFMS
      let clientsQuery = supabase
        .from("clients")
        .select("*")
        .eq("user_id", user.id);

      if (clientId) {
        clientsQuery = clientsQuery.eq("id", clientId);
      }

      const { data: clients } = await clientsQuery;

      for (const client of clients || []) {
        try {
          const rfmsCustomer: RFMSCustomer = {
            first_name: client.first_name || client.name?.split(" ")[0] || "",
            last_name: client.last_name || client.name?.split(" ").slice(1).join(" ") || "",
            company_name: client.company || "",
            email: client.email || "",
            phone: client.phone || "",
            address: client.address || "",
            city: client.city || "",
            state: client.state || "",
            zip: client.postcode || client.zip || "",
            notes: `Synced from InterioApp. Client ID: ${client.id}`,
          };

          const existingRfmsId = (client as any).rfms_customer_id;

          if (existingRfmsId) {
            await rfmsRequest("PUT", `/customers/${existingRfmsId}`, storeQueue, sessionToken, apiUrl, rfmsCustomer);
            results.updated++;
          } else {
            const createResult = await rfmsRequest("POST", "/customers", storeQueue, sessionToken, apiUrl, rfmsCustomer);

            if (createResult.status === "success" && createResult.result?.id) {
              await supabase
                .from("clients")
                .update({ rfms_customer_id: createResult.result.id } as any)
                .eq("id", client.id);

              results.exported++;
            }
          }
        } catch (err: any) {
          results.errors.push(`Client ${client.id}: ${err.message}`);
        }
      }
    }

    if (direction === "pull" || direction === "both") {
      try {
        const rfmsData = await rfmsRequest("GET", "/customers", storeQueue, sessionToken, apiUrl);

        if (rfmsData.status === "success" && rfmsData.result) {
          const customers: RFMSCustomer[] = Array.isArray(rfmsData.result)
            ? rfmsData.result
            : rfmsData.result.customers || [];

          for (const customer of customers) {
            try {
              const { data: existing } = await supabase
                .from("clients")
                .select("id")
                .eq("user_id", user.id)
                .eq("rfms_customer_id" as any, customer.id)
                .maybeSingle();

              const clientData = {
                user_id: user.id,
                first_name: customer.first_name || "",
                last_name: customer.last_name || "",
                name: `${customer.first_name || ""} ${customer.last_name || ""}`.trim(),
                company: customer.company_name || "",
                email: customer.email || "",
                phone: customer.phone || "",
                address: customer.address || "",
                city: customer.city || "",
                state: customer.state || "",
                postcode: customer.zip || "",
                rfms_customer_id: customer.id,
              };

              if (existing) {
                await supabase
                  .from("clients")
                  .update(clientData as any)
                  .eq("id", existing.id);
                results.updated++;
              } else {
                await supabase
                  .from("clients")
                  .insert(clientData as any);
                results.imported++;
              }
            } catch (err: any) {
              results.errors.push(`RFMS customer ${customer.id}: ${err.message}`);
            }
          }
        }
      } catch (err: any) {
        results.errors.push(`Pull failed: ${err.message}`);
      }
    }

    // Update last_sync
    await supabase
      .from("integration_settings")
      .update({ last_sync: new Date().toISOString() })
      .eq("id", integration.id);

    console.log(
      `RFMS customer sync complete: ${results.imported} imported, ${results.exported} exported, ${results.updated} updated, ${results.errors.length} errors`
    );

    return new Response(
      JSON.stringify({ success: true, ...results }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error: any) {
    console.error("RFMS customer sync error:", error.message);
    const isUserError = error.message.includes("credentials") ||
                        error.message.includes("rejected") ||
                        error.message.includes("not configured") ||
                        error.message.includes("not found") ||
                        error.message.includes("not active") ||
                        error.message.includes("Check your");
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message || "Sync failed",
        user_action_required: isUserError,
      }),
      {
        status: isUserError ? 400 : 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});

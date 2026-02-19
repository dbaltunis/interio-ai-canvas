import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

/**
 * RFMS Customer Sync Edge Function
 *
 * Pull: Import RFMS customers to InterioApp as clients (via /customers/search)
 * Push: NOT SUPPORTED by RFMS v2 API (POST /customers returns 405)
 * 
 * MULTI-TENANT: Resolves account_owner_id so team members can use the owner's integration.
 */

interface RFMSCustomer {
  id?: string;
  customerId?: string;
  firstName?: string;
  lastName?: string;
  first_name?: string;
  last_name?: string;
  companyName?: string;
  company_name?: string;
  emailAddress?: string;
  email?: string;
  phone?: string;
  phoneNumber?: string;
  address?: string;
  address1?: string;
  city?: string;
  state?: string;
  zip?: string;
  zipCode?: string;
  notes?: string;
  entryType?: string;
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

  // Handle RFMS v2 session response: {authorized, sessionToken}
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

  // Handle legacy format
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

/**
 * Normalize an RFMS customer record to consistent field names.
 * The RFMS API may return camelCase or snake_case fields.
 */
function normalizeCustomer(c: RFMSCustomer): {
  id: string;
  firstName: string;
  lastName: string;
  company: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  state: string;
  zip: string;
} {
  return {
    id: (c.customerId || c.id || "").toString(),
    firstName: c.firstName || c.first_name || "",
    lastName: c.lastName || c.last_name || "",
    company: c.companyName || c.company_name || "",
    email: c.emailAddress || c.email || "",
    phone: c.phoneNumber || c.phone || "",
    address: c.address1 || c.address || "",
    city: c.city || "",
    state: c.state || "",
    zip: c.zipCode || c.zip || "",
  };
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

    const results = { imported: 0, exported: 0, updated: 0, skipped: 0, errors: [] as string[] };

    // PUSH: Not supported by RFMS v2 API (POST /customers returns 405)
    if (direction === "push" || direction === "both") {
      results.errors.push("Export to RFMS is not supported. The RFMS v2 API does not allow creating customers via API. Please create customers directly in RFMS.");
    }

    // PULL: Import customers from RFMS using /customers/search
    if (direction === "pull" || direction === "both") {
      try {
        // RFMS v2: GET /customers returns field metadata, not records.
        // Use POST /customers/search to get actual customer records.
        // Try search with empty criteria to get all customers.
        let rfmsData: any;
        let customers: any[] = [];

        try {
          // Try the search endpoint first (Standard+ tier)
          rfmsData = await rfmsRequest("POST", "/customers/search", storeQueue, sessionToken, apiUrl, {
            entryType: "Customer"
          });
        } catch (searchErr: any) {
          console.log("POST /customers/search failed, trying GET /customers/search:", searchErr.message);
          try {
            // Some RFMS versions use GET with query params
            rfmsData = await rfmsRequest("GET", "/customers/search?entryType=Customer", storeQueue, sessionToken, apiUrl);
          } catch (getErr: any) {
            console.log("GET /customers/search also failed, trying GET /customers with params:", getErr.message);
            // Last resort: GET /customers may return records with certain params
            rfmsData = await rfmsRequest("GET", "/customers?limit=500", storeQueue, sessionToken, apiUrl);
          }
        }

        // Extract customer records from response
        // Standard RFMS v2 format: {status: "success", result: [...]} or {status: "success", result: {customers: [...]}}
        if (rfmsData.status === "success" && rfmsData.result) {
          if (Array.isArray(rfmsData.result)) {
            customers = rfmsData.result;
          } else if (rfmsData.result.customers && Array.isArray(rfmsData.result.customers)) {
            customers = rfmsData.result.customers;
          } else if (typeof rfmsData.result === 'object') {
            // Check if result contains arrays that look like customer records
            const keys = Object.keys(rfmsData.result);
            const possibleList = keys.find(k => Array.isArray(rfmsData.result[k]) && rfmsData.result[k].length > 0 && rfmsData.result[k][0]?.firstName);
            if (possibleList) {
              customers = rfmsData.result[possibleList];
            }
          }
        } else if (Array.isArray(rfmsData)) {
          // Direct array response
          customers = rfmsData;
        }

        // Detect if we got metadata instead of records
        if (customers.length === 0 && rfmsData.result) {
          const resultKeys = Object.keys(rfmsData.result || rfmsData);
          const metadataKeys = ['customerType', 'entryType', 'taxStatus', 'taxMethod'];
          const isMetadata = metadataKeys.some(k => resultKeys.includes(k));
          if (isMetadata) {
            console.log("RFMS returned field metadata instead of customer records. The search endpoint may require different parameters.");
            results.errors.push("RFMS returned field definitions instead of customer records. Your API tier may not support customer search, or the search endpoint needs different parameters.");
          }
        }

        console.log(`RFMS customer pull: found ${customers.length} customer records to process`);

        for (const rawCustomer of customers) {
          try {
            const customer = normalizeCustomer(rawCustomer);
            if (!customer.id) {
              results.skipped++;
              continue;
            }

            const { data: existing } = await supabase
              .from("clients")
              .select("id")
              .eq("user_id", user.id)
              .eq("rfms_customer_id", customer.id)
              .maybeSingle();

            const clientData: any = {
              user_id: user.id,
              first_name: customer.firstName,
              last_name: customer.lastName,
              name: `${customer.firstName} ${customer.lastName}`.trim() || customer.company,
              company: customer.company,
              email: customer.email,
              phone: customer.phone,
              address: customer.address,
              city: customer.city,
              state: customer.state,
              postcode: customer.zip,
              rfms_customer_id: customer.id,
            };

            if (existing) {
              await supabase
                .from("clients")
                .update(clientData)
                .eq("id", existing.id);
              results.updated++;
            } else {
              await supabase
                .from("clients")
                .insert(clientData);
              results.imported++;
            }
          } catch (err: any) {
            results.errors.push(`Customer ${rawCustomer.id || 'unknown'}: ${err.message}`);
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

    const summary = [
      results.imported > 0 ? `${results.imported} imported` : null,
      results.exported > 0 ? `${results.exported} exported` : null,
      results.updated > 0 ? `${results.updated} updated` : null,
      results.skipped > 0 ? `${results.skipped} skipped` : null,
      results.errors.length > 0 ? `${results.errors.length} errors` : null,
    ].filter(Boolean).join(", ");

    console.log(`RFMS customer sync complete: ${summary || "no changes"}`);

    return new Response(
      JSON.stringify({ success: true, ...results, summary }),
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

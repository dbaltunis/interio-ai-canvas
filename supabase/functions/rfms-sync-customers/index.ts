import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

/**
 * RFMS Customer Sync Edge Function
 *
 * Pull-only: Import RFMS customers to InterioApp as clients.
 * RFMS v2 API does not support creating customers (POST returns 405).
 * 
 * Customer search: POST /customers with search body is the correct v2 endpoint.
 * Falls back to GET /customers with query params if POST fails.
 * 
 * MULTI-TENANT: Uses account_owner_id for integration lookup.
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

/**
 * Try multiple RFMS API endpoints to fetch customer records.
 * The v2 API uses POST /customers with a search body as the primary search endpoint.
 */
async function fetchCustomersFromRFMS(
  storeQueue: string,
  sessionToken: string,
  apiUrl: string
): Promise<{ customers: any[]; method: string }> {
  const attempts: { method: string; endpoint: string; body?: any }[] = [
    // Primary: POST /customers with search body (RFMS v2 standard search)
    { method: "POST", endpoint: "/customers", body: { entryType: "Customer", limit: 500 } },
    // Fallback 1: POST with minimal body
    { method: "POST", endpoint: "/customers", body: { limit: 500 } },
    // Fallback 2: GET with entryType query param
    { method: "GET", endpoint: "/customers?entryType=Customer&limit=500" },
    // Fallback 3: GET with just limit
    { method: "GET", endpoint: "/customers?limit=500" },
  ];

  for (const attempt of attempts) {
    try {
      console.log(`Trying RFMS customer fetch: ${attempt.method} ${attempt.endpoint}`);
      const rfmsData = await rfmsRequest(
        attempt.method,
        attempt.endpoint,
        storeQueue,
        sessionToken,
        apiUrl,
        attempt.body
      );

      // Extract customer records from various response formats
      let customers: any[] = [];

      // Format 1: Direct array response
      if (Array.isArray(rfmsData)) {
        customers = rfmsData;
      }
      // Format 2: {status: "success", result: [...]}
      else if (rfmsData.status === "success" && rfmsData.result) {
        if (Array.isArray(rfmsData.result)) {
          customers = rfmsData.result;
        } else if (rfmsData.result.customers && Array.isArray(rfmsData.result.customers)) {
          customers = rfmsData.result.customers;
        } else if (typeof rfmsData.result === 'object') {
          // Look for any array property that looks like customer records
          for (const key of Object.keys(rfmsData.result)) {
            const val = rfmsData.result[key];
            if (Array.isArray(val) && val.length > 0 && (val[0]?.firstName || val[0]?.first_name || val[0]?.customerId)) {
              customers = val;
              break;
            }
          }
        }
      }
      // Format 3: Top-level object with customer arrays
      else if (typeof rfmsData === 'object') {
        for (const key of Object.keys(rfmsData)) {
          const val = rfmsData[key];
          if (Array.isArray(val) && val.length > 0 && (val[0]?.firstName || val[0]?.first_name || val[0]?.customerId)) {
            customers = val;
            break;
          }
        }
      }

      // Check if we got metadata instead of records
      if (customers.length === 0) {
        const checkObj = rfmsData.result || rfmsData;
        const resultKeys = Object.keys(checkObj);
        const metadataKeys = ['customerType', 'entryType', 'taxStatus', 'taxMethod', 'preferredSalesperson1'];
        if (metadataKeys.some(k => resultKeys.includes(k))) {
          console.log(`${attempt.method} ${attempt.endpoint} returned metadata, not records. Trying next approach...`);
          continue; // Try next approach
        }
      }

      if (customers.length > 0) {
        console.log(`Successfully fetched ${customers.length} customers via ${attempt.method} ${attempt.endpoint}`);
        return { customers, method: `${attempt.method} ${attempt.endpoint}` };
      }

      console.log(`${attempt.method} ${attempt.endpoint} returned 0 customer records`);
    } catch (err: any) {
      if (err.message === "RFMS_SESSION_EXPIRED") throw err;
      console.log(`${attempt.method} ${attempt.endpoint} failed: ${err.message}`);
      // Continue to next attempt
    }
  }

  return { customers: [], method: "all attempts exhausted" };
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

    await req.json(); // consume body

    // Resolve effective account owner for multi-tenant support
    const { data: userProfile } = await supabase
      .from("user_profiles")
      .select("parent_account_id")
      .eq("user_id", user.id)
      .maybeSingle();
    const accountOwnerId = userProfile?.parent_account_id || user.id;

    // Use account_owner_id for integration lookup (correct multi-tenant column)
    const { data: integration, error: intError } = await supabase
      .from("integration_settings")
      .select("*")
      .eq("account_owner_id", accountOwnerId)
      .eq("integration_type", "rfms")
      .eq("active", true)
      .maybeSingle();

    // Fallback to user_id if account_owner_id doesn't match (legacy data)
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

    const results = { imported: 0, exported: 0, updated: 0, skipped: 0, errors: [] as string[] };

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

    // PULL ONLY: Import customers from RFMS
    await withSessionRetry(async (currentToken: string) => {
      const { customers, method } = await fetchCustomersFromRFMS(storeQueue, currentToken, apiUrl);

      if (customers.length === 0) {
        results.errors.push("No customer records found in RFMS. Your API tier may not support customer search, or there are no customers in the system.");
        return;
      }

      console.log(`RFMS customer pull via ${method}: processing ${customers.length} records`);

      for (const rawCustomer of customers) {
        try {
          const customer = normalizeCustomer(rawCustomer);
          if (!customer.id) { results.skipped++; continue; }

          // Use accountOwnerId for client lookup (multi-tenant)
          const { data: existing } = await supabase
            .from("clients")
            .select("id")
            .eq("user_id", accountOwnerId)
            .eq("rfms_customer_id", customer.id)
            .maybeSingle();

          const clientData: any = {
            user_id: accountOwnerId,
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
            await supabase.from("clients").update(clientData).eq("id", existing.id);
            results.updated++;
          } else {
            await supabase.from("clients").insert(clientData);
            results.imported++;
          }
        } catch (err: any) {
          results.errors.push(`Customer ${rawCustomer.id || 'unknown'}: ${err.message}`);
        }
      }
    }).catch((err: any) => {
      results.errors.push(`Pull failed: ${err.message}`);
    });

    // Update last_sync
    await supabase
      .from("integration_settings")
      .update({ last_sync: new Date().toISOString() })
      .eq("id", activeIntegration.id);

    const summary = [
      results.imported > 0 ? `${results.imported} imported` : null,
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

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
    throw new Error("RFMS credentials not configured");
  }

  // If we have a session token, try to use it
  if (session_token) {
    return { sessionToken: session_token, storeQueue: store_queue, apiUrl };
  }

  // Otherwise, begin a new session
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
    const { data: { user }, error: userError } = await supabase.auth.getUser(token);
    if (userError || !user) throw new Error("Unauthorized");

    const { direction, clientId } = await req.json();

    // Get integration
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

          // Check if already synced (look for rfms_customer_id in metadata)
          const existingRfmsId = (client as any).rfms_customer_id;

          if (existingRfmsId) {
            // Update existing RFMS customer
            await rfmsRequest("PUT", `/customers/${existingRfmsId}`, storeQueue, sessionToken, apiUrl, rfmsCustomer);
            results.updated++;
          } else {
            // Create new RFMS customer
            const createResult = await rfmsRequest("POST", "/customers", storeQueue, sessionToken, apiUrl, rfmsCustomer);

            if (createResult.status === "success" && createResult.result?.id) {
              // Store RFMS customer ID back in our client record
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
      // Pull RFMS customers to InterioApp
      try {
        const rfmsData = await rfmsRequest("GET", "/customers", storeQueue, sessionToken, apiUrl);

        if (rfmsData.status === "success" && rfmsData.result) {
          const customers: RFMSCustomer[] = Array.isArray(rfmsData.result)
            ? rfmsData.result
            : rfmsData.result.customers || [];

          for (const customer of customers) {
            try {
              // Check if already imported (by rfms_customer_id)
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
                // Update existing client
                await supabase
                  .from("clients")
                  .update(clientData as any)
                  .eq("id", existing.id);
                results.updated++;
              } else {
                // Create new client
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
    console.error("RFMS customer sync error:", error);
    return new Response(
      JSON.stringify({ error: error.message || "Sync failed" }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});

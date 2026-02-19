import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

/**
 * RFMS Measurements Sync Edge Function
 *
 * Pulls measurement data from RFMS quote line items (opportunities)
 * and maps them to InterioApp project rooms/treatments.
 * 
 * Returns clear error when no projects are linked to RFMS quotes.
 * 
 * MULTI-TENANT: Uses account_owner_id for integration lookup.
 */

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
  }

  const basicAuth = btoa(`${store_queue}:${api_key}`);
  const response = await fetch(`${apiUrl}/session/begin`, {
    method: "POST",
    headers: { Authorization: `Basic ${basicAuth}`, "Content-Type": "application/json" },
  });

  const responseText = await response.text();
  if (!response.ok) throw new Error(`RFMS session failed (${response.status})`);

  const data = JSON.parse(responseText);
  if (data.authorized === true && data.sessionToken) {
    await supabase
      .from("integration_settings")
      .update({
        api_credentials: { ...integration.api_credentials, session_token: data.sessionToken, session_started_at: new Date().toISOString() },
      })
      .eq("id", integration.id);
    return { sessionToken: data.sessionToken, storeQueue: store_queue, apiUrl };
  }

  if (data.status === "success") {
    const newToken = data.result?.token || data.result?.session_token;
    if (newToken) {
      await supabase
        .from("integration_settings")
        .update({
          api_credentials: { ...integration.api_credentials, session_token: newToken, session_started_at: new Date().toISOString() },
        })
        .eq("id", integration.id);
      return { sessionToken: newToken, storeQueue: store_queue, apiUrl };
    }
  }

  throw new Error("Could not establish RFMS session");
}

async function rfmsRequest(method: string, endpoint: string, storeQueue: string, sessionToken: string, apiUrl: string, body?: any): Promise<{ data: any; status: number }> {
  const auth = btoa(`${storeQueue}:${sessionToken}`);
  const options: RequestInit = {
    method,
    headers: { Authorization: `Basic ${auth}`, "Content-Type": "application/json" },
  };
  if (body && (method === "POST" || method === "PUT")) options.body = JSON.stringify(body);

  const response = await fetch(`${apiUrl}${endpoint}`, options);
  const responseText = await response.text();
  console.log(`RFMS ${method} ${endpoint} [${response.status}]: ${responseText.substring(0, 300)}`);

  if (response.status === 401) throw new Error("RFMS_SESSION_EXPIRED");

  let data: any;
  try {
    data = JSON.parse(responseText);
  } catch {
    data = null;
  }
  if (data?.status === "failed") throw new Error(`RFMS API error: ${data.reason || "Request failed"}`);
  return { data, status: response.status };
}

serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!);

    const authHeader = req.headers.get("Authorization");
    if (!authHeader) throw new Error("No authorization header");

    const token = authHeader.replace("Bearer ", "");
    const { data: { user }, error: userError } = await supabase.auth.getUser(token);
    if (userError || !user) throw new Error("Unauthorized");

    const { measurementUnits } = await req.json();

    const { data: userProfile } = await supabase
      .from("user_profiles")
      .select("parent_account_id")
      .eq("user_id", user.id)
      .maybeSingle();
    const accountOwnerId = userProfile?.parent_account_id || user.id;

    // Find RFMS integration
    let { data: integration } = await supabase
      .from("integration_settings")
      .select("*")
      .eq("account_owner_id", accountOwnerId)
      .eq("integration_type", "rfms")
      .eq("active", true)
      .maybeSingle();

    if (!integration) {
      const { data: legacyInt } = await supabase
        .from("integration_settings")
        .select("*")
        .eq("user_id", accountOwnerId)
        .eq("integration_type", "rfms")
        .eq("active", true)
        .maybeSingle();
      integration = legacyInt;
    }

    if (!integration) throw new Error("RFMS integration not found or not active.");

    let { sessionToken, storeQueue, apiUrl } = await ensureSession(supabase, integration);
    const results = { imported: 0, updated: 0, skipped: 0, errors: [] as string[] };

    const withRetry = async (fn: (st: string) => Promise<void>) => {
      try { await fn(sessionToken); }
      catch (err: any) {
        if (err.message === "RFMS_SESSION_EXPIRED") {
          const refreshed = await ensureSession(supabase, integration, true);
          sessionToken = refreshed.sessionToken;
          await fn(sessionToken);
        } else throw err;
      }
    };

    await withRetry(async (currentToken: string) => {
      // Get projects that have rfms_quote_id (linked to RFMS)
      const { data: linkedProjects } = await supabase
        .from("projects")
        .select("id, rfms_quote_id, name")
        .eq("user_id", accountOwnerId)
        .not("rfms_quote_id", "is", null);

      if (!linkedProjects?.length) {
        results.errors.push("No projects are linked to RFMS quotes yet. Import quotes first using 'Import Quotes', then import measurements.");
        return;
      }

      console.log(`Found ${linkedProjects.length} RFMS-linked projects to check for measurements`);

      for (const project of linkedProjects) {
        try {
          // Fetch quote details with line items from RFMS
          let quoteData: any;
          let fetchStatus: number;
          try {
            const resp = await rfmsRequest("GET", `/opportunities/${project.rfms_quote_id}`, storeQueue, currentToken, apiUrl);
            quoteData = resp.data;
            fetchStatus = resp.status;
          } catch (err: any) {
            if (err.message === "RFMS_SESSION_EXPIRED") throw err;
            try {
              const resp2 = await rfmsRequest("GET", `/quotes/${project.rfms_quote_id}`, storeQueue, currentToken, apiUrl);
              quoteData = resp2.data;
              fetchStatus = resp2.status;
            } catch (err2: any) {
              if (err2.message === "RFMS_SESSION_EXPIRED") throw err2;
              results.skipped++;
              continue;
            }
          }

          // Extract line items with measurements
          const lineItems = quoteData?.result?.lineItems || quoteData?.result?.lines ||
                            quoteData?.lineItems || quoteData?.lines || [];

          if (!Array.isArray(lineItems) || lineItems.length === 0) {
            results.skipped++;
            continue;
          }

          // Get existing treatments for this project
          const { data: treatments } = await supabase
            .from("treatments")
            .select("id, treatment_name, width, height")
            .eq("project_id", project.id);

          for (const item of lineItems) {
            const width = item.width || item.Width || item.widthFt || item.widthIn || null;
            const height = item.height || item.Height || item.heightFt || item.heightIn || item.length || item.Length || null;
            const area = item.area || item.Area || item.squareFeet || item.sqft || null;
            const roomName = item.room || item.Room || item.roomName || item.location || item.Location || "";

            if (!width && !height && !area) continue;

            // Try to match to an existing treatment by room name
            const matchingTreatment = treatments?.find(t =>
              t.treatment_name && roomName && t.treatment_name.toLowerCase().includes(roomName.toLowerCase())
            );

            if (matchingTreatment) {
              let finalWidth = width;
              let finalHeight = height;
              if (measurementUnits === 'metric' && width) {
                finalWidth = width * 2.54;
              }
              if (measurementUnits === 'metric' && height) {
                finalHeight = height * 2.54;
              }

              await supabase
                .from("treatments")
                .update({
                  width: finalWidth || matchingTreatment.width,
                  height: finalHeight || matchingTreatment.height,
                })
                .eq("id", matchingTreatment.id);
              results.updated++;
            } else {
              results.skipped++;
            }
          }

          results.imported++;
        } catch (err: any) {
          if (err.message === "RFMS_SESSION_EXPIRED") throw err;
          results.errors.push(`Project ${project.name}: ${err.message}`);
        }
      }
    }).catch((err: any) => {
      results.errors.push(`Measurement sync failed: ${err.message}`);
    });

    await supabase
      .from("integration_settings")
      .update({ last_sync: new Date().toISOString() })
      .eq("id", integration.id);

    console.log(`RFMS measurement sync: ${results.imported} projects processed, ${results.updated} treatments updated`);

    return new Response(
      JSON.stringify({ success: true, ...results }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error: any) {
    console.error("RFMS measurement sync error:", error.message);
    return new Response(
      JSON.stringify({ success: false, error: error.message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});

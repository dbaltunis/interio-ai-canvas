import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

/**
 * RFMS Scheduling Sync Edge Function
 *
 * Pulls scheduled jobs from RFMS Schedule Pro and creates/updates
 * calendar appointments in InterioApp.
 * 
 * RFMS Schedule Pro endpoints:
 * - GET /schedule/jobs - List scheduled jobs
 * - GET /schedule/crews - List available crews
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
    throw new Error("RFMS credentials not configured.");
  }

  if (session_token && !forceRefresh) {
    const sessionAge = Date.now() - new Date(session_started_at || 0).getTime();
    if (sessionAge < 25 * 60 * 1000) {
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

async function rfmsRequest(method: string, endpoint: string, storeQueue: string, sessionToken: string, apiUrl: string): Promise<any> {
  const auth = btoa(`${storeQueue}:${sessionToken}`);
  const response = await fetch(`${apiUrl}${endpoint}`, {
    method,
    headers: { Authorization: `Basic ${auth}`, "Content-Type": "application/json" },
  });

  const responseText = await response.text();
  console.log(`RFMS ${method} ${endpoint} [${response.status}]: ${responseText.substring(0, 300)}`);

  if (response.status === 401) throw new Error("RFMS_SESSION_EXPIRED");

  const data = JSON.parse(responseText);
  if (data.status === "failed") throw new Error(`RFMS API error: ${data.reason || "Request failed"}`);
  return data;
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

    await req.json(); // consume body

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
      // Try to fetch scheduled jobs from RFMS Schedule Pro
      let scheduleData: any;
      let jobs: any[] = [];

      // Try multiple endpoints for scheduling data
      const endpoints = [
        "/schedule/jobs",
        "/scheduling/jobs",
        "/jobs",
        "/schedule",
      ];

      for (const endpoint of endpoints) {
        try {
          scheduleData = await rfmsRequest("GET", endpoint, storeQueue, currentToken, apiUrl);

          // Extract job records
          if (Array.isArray(scheduleData)) {
            jobs = scheduleData;
          } else if (scheduleData?.result && Array.isArray(scheduleData.result)) {
            jobs = scheduleData.result;
          } else if (scheduleData?.result?.jobs && Array.isArray(scheduleData.result.jobs)) {
            jobs = scheduleData.result.jobs;
          } else if (scheduleData?.jobs && Array.isArray(scheduleData.jobs)) {
            jobs = scheduleData.jobs;
          }

          if (jobs.length > 0) {
            console.log(`Found ${jobs.length} scheduled jobs via ${endpoint}`);
            break;
          }
        } catch (err: any) {
          if (err.message === "RFMS_SESSION_EXPIRED") throw err;
          console.log(`${endpoint} failed: ${err.message}`);
        }
      }

      if (jobs.length === 0) {
        results.errors.push("No scheduled jobs found in RFMS. Schedule Pro may not be enabled for your RFMS account.");
        return;
      }

      for (const job of jobs) {
        try {
          const jobId = (job.id || job.jobId || job.scheduleId || "").toString();
          if (!jobId) { results.skipped++; continue; }

          const startTime = job.startDate || job.scheduledDate || job.date || null;
          const endTime = job.endDate || job.completionDate || null;
          const title = job.description || job.jobName || job.name || `RFMS Job ${jobId}`;
          const location = job.address || job.location || job.jobAddress || "";
          const crewName = job.crew || job.crewName || job.installer || "";

          if (!startTime) { results.skipped++; continue; }

          // Check if appointment already exists for this RFMS job
          const { data: existingAppointment } = await supabase
            .from("appointments")
            .select("id")
            .eq("user_id", accountOwnerId)
            .eq("description", `RFMS Job ID: ${jobId}`)
            .maybeSingle();

          // Find linked project
          const rfmsQuoteId = (job.opportunityId || job.quoteId || "").toString();
          let projectId = null;
          if (rfmsQuoteId) {
            const { data: project } = await supabase
              .from("projects")
              .select("id")
              .eq("user_id", accountOwnerId)
              .eq("rfms_quote_id", rfmsQuoteId)
              .maybeSingle();
            if (project) projectId = project.id;
          }

          // Find linked client
          const custId = (job.customerId || job.customer_id || "").toString();
          let clientId = null;
          if (custId) {
            const { data: client } = await supabase
              .from("clients")
              .select("id")
              .eq("user_id", accountOwnerId)
              .eq("rfms_customer_id", custId)
              .maybeSingle();
            if (client) clientId = client.id;
          }

          const startDate = new Date(startTime);
          const endDate = endTime ? new Date(endTime) : new Date(startDate.getTime() + 2 * 60 * 60 * 1000); // default 2 hours

          const appointmentData: any = {
            user_id: accountOwnerId,
            title: `${title}${crewName ? ` (${crewName})` : ''}`,
            description: `RFMS Job ID: ${jobId}`,
            start_time: startDate.toISOString(),
            end_time: endDate.toISOString(),
            location: location,
            appointment_type: "installation",
            project_id: projectId,
            client_id: clientId,
          };

          if (existingAppointment) {
            await supabase.from("appointments").update(appointmentData).eq("id", existingAppointment.id);
            results.updated++;
          } else {
            await supabase.from("appointments").insert(appointmentData);
            results.imported++;
          }
        } catch (err: any) {
          if (err.message === "RFMS_SESSION_EXPIRED") throw err;
          results.errors.push(`Job ${job.id || 'unknown'}: ${err.message}`);
        }
      }
    }).catch((err: any) => {
      results.errors.push(`Schedule sync failed: ${err.message}`);
    });

    await supabase
      .from("integration_settings")
      .update({ last_sync: new Date().toISOString() })
      .eq("id", integration.id);

    console.log(`RFMS schedule sync: ${results.imported} imported, ${results.updated} updated`);

    return new Response(
      JSON.stringify({ success: true, ...results }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error: any) {
    console.error("RFMS schedule sync error:", error.message);
    return new Response(
      JSON.stringify({ success: false, error: error.message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});

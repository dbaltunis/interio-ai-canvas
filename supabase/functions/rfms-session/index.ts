import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

/**
 * RFMS Session Management Edge Function
 *
 * Handles session creation and token refresh for the RFMS API v2.
 * Auth flow: POST /v2/session/begin with Basic Auth (store_queue:api_key)
 * Returns a session token that auto-extends on each API call.
 * 
 * MULTI-TENANT: Resolves account_owner_id so team members can use the owner's integration.
 */

async function resolveAccountOwnerId(supabase: any, userId: string): Promise<string> {
  const { data: profile } = await supabase
    .from("user_profiles")
    .select("parent_account_id")
    .eq("user_id", userId)
    .maybeSingle();
  
  return profile?.parent_account_id || userId;
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

    const { action } = await req.json();

    // Resolve effective account owner for multi-tenant support
    const accountOwnerId = await resolveAccountOwnerId(supabase, user.id);

    // Get integration settings using account_owner_id (not user_id)
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

    const { store_queue, api_key } = integration.api_credentials || {};
    const apiUrl = integration.api_credentials?.api_url || "https://api.rfms.online/v2";

    if (!store_queue || !api_key) {
      throw new Error("RFMS credentials not configured. Please enter your Store Queue and API Key in Settings.");
    }

    if (action === "begin" || action === "refresh") {
      // Check if existing session is still valid
      const existingToken = integration.api_credentials?.session_token;
      const sessionStartedAt = integration.api_credentials?.session_started_at;
      if (existingToken && action === "begin" && sessionStartedAt) {
        const sessionAge = Date.now() - new Date(sessionStartedAt).getTime();
        const MAX_SESSION_AGE_MS = 25 * 60 * 1000;
        if (sessionAge < MAX_SESSION_AGE_MS) {
          console.log("RFMS session still valid, reusing existing token");
          return new Response(
            JSON.stringify({ success: true, message: "RFMS session active", session_token: existingToken }),
            { headers: { ...corsHeaders, "Content-Type": "application/json" } }
          );
        }
        console.log("RFMS session expired, creating new session...");
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
      let sessionToken: string | undefined;

      if (data.authorized === true && data.sessionToken) {
        sessionToken = data.sessionToken;
      } else if (data.status === "failed") {
        throw new Error(`RFMS authentication failed: ${data.reason || "Your Store Queue or API Key was rejected."}`);
      } else if (data.status === "success") {
        sessionToken = data.result?.token || data.result?.session_token;
      }

      if (!sessionToken) {
        throw new Error(`Unexpected RFMS response format. Please contact support. Response: ${JSON.stringify(data).substring(0, 150)}`);
      }

      // Store session token
      await supabase
        .from("integration_settings")
        .update({
          api_credentials: {
            ...integration.api_credentials,
            session_token: sessionToken,
            session_started_at: new Date().toISOString(),
          },
          updated_at: new Date().toISOString(),
        })
        .eq("id", integration.id);

      console.log("RFMS session started successfully");

      return new Response(
        JSON.stringify({
          success: true,
          message: "RFMS session started",
          session_token: sessionToken,
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (action === "end") {
      await supabase
        .from("integration_settings")
        .update({
          api_credentials: {
            ...integration.api_credentials,
            session_token: null,
            session_started_at: null,
          },
          updated_at: new Date().toISOString(),
        })
        .eq("id", integration.id);

      return new Response(
        JSON.stringify({ success: true, message: "RFMS session ended" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    throw new Error(`Unknown action: ${action}`);
  } catch (error: any) {
    console.error("RFMS session error:", error.message);
    const isUserError = error.message.includes("credentials") ||
                        error.message.includes("rejected") ||
                        error.message.includes("not configured") ||
                        error.message.includes("not found") ||
                        error.message.includes("not active") ||
                        error.message.includes("Check your");
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message || "RFMS session error",
        user_action_required: isUserError,
      }),
      {
        status: isUserError ? 400 : 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});

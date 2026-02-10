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
 */
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

    // Get integration settings
    const { data: integration, error: intError } = await supabase
      .from("integration_settings")
      .select("*")
      .eq("user_id", user.id)
      .eq("integration_type", "rfms")
      .eq("active", true)
      .single();

    if (intError || !integration) {
      throw new Error("RFMS integration not found or not active");
    }

    const { store_queue, api_key } = integration.api_credentials || {};
    const apiUrl = integration.api_credentials?.api_url || "https://api.rfms.online/v2";

    if (!store_queue || !api_key) {
      throw new Error("RFMS credentials not configured (store_queue and api_key required)");
    }

    if (action === "begin" || action === "refresh") {
      // Begin a new session
      const basicAuth = btoa(`${store_queue}:${api_key}`);

      const response = await fetch(`${apiUrl}/session/begin`, {
        method: "POST",
        headers: {
          Authorization: `Basic ${basicAuth}`,
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error("RFMS session begin failed:", errorText);
        throw new Error(`RFMS session begin failed: ${response.status}`);
      }

      const data = await response.json();

      if (data.status !== "success") {
        throw new Error(`RFMS session error: ${data.status} - ${data.reason || "Unknown"}`);
      }

      const sessionToken = data.result?.token || data.result?.session_token;
      if (!sessionToken) {
        throw new Error("No session token in RFMS response");
      }

      // Store session token in integration settings
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
      // Clear session token
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
    console.error("RFMS session error:", error);
    return new Response(
      JSON.stringify({ error: error.message || "RFMS session error" }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});

import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface EndpointResult {
  endpoint: string;
  method: string;
  label: string;
  status: "working" | "unavailable" | "forbidden" | "error";
  httpStatus: number | null;
  detail: string;
  tierRequired: string;
}

serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Auth: resolve user and get RFMS credentials
    const authHeader = req.headers.get("Authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_ANON_KEY")!,
      { global: { headers: { Authorization: authHeader } } }
    );

    const token = authHeader.replace("Bearer ", "");
    const { data: claimsData, error: claimsError } = await supabase.auth.getClaims(token);
    if (claimsError || !claimsData?.claims) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const userId = claimsData.claims.sub;

    // Resolve account owner
    const { data: profile } = await supabase
      .from("user_profiles")
      .select("parent_account_id")
      .eq("user_id", userId)
      .single();

    const accountOwnerId = profile?.parent_account_id || userId;

    // Get RFMS integration
    const { data: integration } = await supabase
      .from("integrations")
      .select("*")
      .eq("user_id", accountOwnerId)
      .eq("integration_type", "rfms")
      .eq("active", true)
      .single();

    if (!integration?.api_credentials) {
      return new Response(
        JSON.stringify({ error: "No active RFMS integration found. Please configure RFMS first." }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const creds = integration.api_credentials as any;
    const baseUrl = creds.api_url || "https://api.rfms.online/v2";
    const storeQueue = creds.store_queue;
    const apiKey = creds.api_key;

    if (!storeQueue || !apiKey) {
      return new Response(
        JSON.stringify({ error: "RFMS credentials incomplete. Please check your Store Queue and API Key." }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const results: EndpointResult[] = [];

    // Step 1: Authenticate
    const basicAuth = btoa(`${storeQueue}:${apiKey}`);
    let sessionToken: string | null = null;

    try {
      const authResp = await fetch(`${baseUrl}/session/begin`, {
        method: "POST",
        headers: { Authorization: `Basic ${basicAuth}`, "Content-Type": "application/json" },
      });
      const authBody = await authResp.text();
      let authData: any;
      try { authData = JSON.parse(authBody); } catch { authData = {}; }

      if (authResp.ok && authData.authorized && authData.sessionToken) {
        sessionToken = authData.sessionToken;
        results.push({
          endpoint: "/session/begin", method: "POST", label: "Authentication",
          status: "working", httpStatus: authResp.status,
          detail: "Session token obtained", tierRequired: "Standard",
        });
      } else {
        results.push({
          endpoint: "/session/begin", method: "POST", label: "Authentication",
          status: "error", httpStatus: authResp.status,
          detail: authData.reason || "Authentication failed", tierRequired: "Standard",
        });
        // Can't continue without auth
        return new Response(
          JSON.stringify({ success: true, results, estimatedTier: "Unknown", summary: "Authentication failed — cannot test other endpoints." }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
    } catch (e: any) {
      results.push({
        endpoint: "/session/begin", method: "POST", label: "Authentication",
        status: "error", httpStatus: null,
        detail: `Network error: ${e.message}`, tierRequired: "Standard",
      });
      return new Response(
        JSON.stringify({ success: true, results, estimatedTier: "Unknown", summary: "Cannot reach RFMS server." }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Helper to test an endpoint
    const sessionAuth = btoa(`${storeQueue}:${sessionToken}`);
    const testEndpoint = async (
      method: string, path: string, label: string, tierRequired: string,
      body?: any
    ): Promise<EndpointResult> => {
      try {
        const opts: RequestInit = {
          method,
          headers: { Authorization: `Basic ${sessionAuth}`, "Content-Type": "application/json" },
        };
        if (body) opts.body = JSON.stringify(body);

        const resp = await fetch(`${baseUrl}${path}`, opts);
        const respText = await resp.text();

        if (resp.status === 405) {
          return { endpoint: path, method, label, status: "unavailable", httpStatus: 405, detail: "Method Not Allowed — not on your tier", tierRequired };
        }
        if (resp.status === 403) {
          return { endpoint: path, method, label, status: "forbidden", httpStatus: 403, detail: "Forbidden — access denied", tierRequired };
        }
        if (resp.status === 401) {
          return { endpoint: path, method, label, status: "error", httpStatus: 401, detail: "Session expired or unauthorized", tierRequired };
        }

        // For POST tests that we don't want to actually create data,
        // a 400 (bad request / validation) still means the endpoint exists
        if (method === "POST" && resp.status === 400) {
          return { endpoint: path, method, label, status: "working", httpStatus: 400, detail: "Endpoint accessible (validation error expected for test)", tierRequired };
        }

        if (resp.ok) {
          // Check if response is just metadata vs actual records
          let parsed: any;
          try { parsed = JSON.parse(respText); } catch { parsed = null; }
          const isMetadataOnly = parsed && !Array.isArray(parsed) && !parsed.data && !parsed.results && typeof parsed === "object" && Object.keys(parsed).length < 3;
          return {
            endpoint: path, method, label, status: "working", httpStatus: resp.status,
            detail: isMetadataOnly ? "Returns metadata only (no record data)" : "Working",
            tierRequired,
          };
        }

        return { endpoint: path, method, label, status: "error", httpStatus: resp.status, detail: respText.substring(0, 150), tierRequired };
      } catch (e: any) {
        return { endpoint: path, method, label, status: "error", httpStatus: null, detail: `Network error: ${e.message}`, tierRequired };
      }
    };

    // Step 2: Test endpoints in parallel
    const tests = await Promise.all([
      testEndpoint("GET", "/customers?limit=1", "Read Customers", "Standard"),
      testEndpoint("GET", "/customers/search?query=test&limit=1", "Search Customers", "Plus"),
      testEndpoint("GET", "/opportunities?limit=1", "Read Opportunities/Quotes", "Standard"),
      testEndpoint("POST", "/opportunities", "Create Opportunity (New Quote)", "Enterprise"),
      testEndpoint("GET", "/quotes?limit=1", "Read Quotes (alt endpoint)", "Standard"),
      testEndpoint("POST", "/quotes", "Create Quote (alt endpoint)", "Enterprise"),
    ]);

    results.push(...tests);

    // Estimate tier
    const hasCreate = tests.some(t => t.label.startsWith("Create") && t.status === "working");
    const hasSearch = tests.find(t => t.label === "Search Customers")?.status === "working";
    let estimatedTier = "Standard";
    if (hasCreate) estimatedTier = "Enterprise";
    else if (hasSearch) estimatedTier = "Plus";

    const workingCount = results.filter(r => r.status === "working").length;
    const unavailableCount = results.filter(r => r.status === "unavailable").length;

    const summary = `${workingCount} endpoints working, ${unavailableCount} unavailable. Estimated tier: ${estimatedTier}.`;

    return new Response(
      JSON.stringify({ success: true, results, estimatedTier, summary }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error: any) {
    console.error("RFMS diagnose error:", error.message);
    return new Response(
      JSON.stringify({ error: error.message || "Diagnostic failed" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});

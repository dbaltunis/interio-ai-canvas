import { serve } from "https://deno.land/std@0.190.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

/**
 * RFMS Test Connection Edge Function
 *
 * Tests RFMS API connectivity by attempting a session begin.
 * Does NOT require stored integration - accepts credentials directly.
 */
serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { api_url, store_queue, api_key } = await req.json();

    if (!store_queue || !api_key) {
      throw new Error("Please enter both your Store Queue token and API Key before testing.");
    }

    const baseUrl = api_url || "https://api.rfms.online/v2";
    const basicAuth = btoa(`${store_queue}:${api_key}`);

    console.log(`Testing RFMS connection to ${baseUrl}...`);

    let response: Response;
    try {
      response = await fetch(`${baseUrl}/session/begin`, {
        method: "POST",
        headers: {
          Authorization: `Basic ${basicAuth}`,
          "Content-Type": "application/json",
        },
      });
    } catch (fetchErr: any) {
      console.error("RFMS network error:", fetchErr.message);
      throw new Error(`Cannot reach RFMS server at ${baseUrl}. Please check the API URL is correct and your internet connection is working.`);
    }

    const responseText = await response.text();
    console.log(`RFMS test response [${response.status}]: ${responseText.substring(0, 500)}`);

    let data: any;
    try {
      data = JSON.parse(responseText);
    } catch {
      throw new Error(`RFMS returned an unexpected response (not JSON). Check your API URL is correct: ${baseUrl}`);
    }

    if (!response.ok) {
      throw new Error(
        `RFMS rejected the connection (HTTP ${response.status}): ${data.reason || data.message || data.error || responseText.substring(0, 200)}`
      );
    }

    if (data.status === "failed") {
      throw new Error(`RFMS authentication failed: ${data.reason || "Your Store Queue token or API Key was rejected. Please double-check these values in your RFMS account settings."}`);
    }

    if (data.status === "success") {
      const sessionToken = data.result?.token || data.result?.session_token;

      // Try to fetch customers to verify full access
      let customerCount = null;
      if (sessionToken) {
        try {
          const customerAuth = btoa(`${store_queue}:${sessionToken}`);
          const custResponse = await fetch(`${baseUrl}/customers?limit=1`, {
            headers: {
              Authorization: `Basic ${customerAuth}`,
              "Content-Type": "application/json",
            },
          });
          if (custResponse.ok) {
            const custData = await custResponse.json();
            if (custData.status === "success") {
              customerCount = custData.result?.total || custData.result?.length || 0;
            }
          }
        } catch (e) {
          console.log("Customer fetch test skipped:", e);
        }
      }

      return new Response(
        JSON.stringify({
          success: true,
          message: "RFMS connection successful",
          session_token: sessionToken ? "obtained" : "not returned",
          customer_count: customerCount,
          api_version: "v2",
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Status is "waiting" - async response
    return new Response(
      JSON.stringify({
        success: true,
        message: "RFMS connection initiated (async response pending)",
        status: data.status,
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error: any) {
    console.error("RFMS connection test failed:", error.message);
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message || "Connection test failed",
      }),
      {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});

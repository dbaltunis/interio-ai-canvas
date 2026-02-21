import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const CW_API_BASE = "https://cwglobal.online/api";

/**
 * CW Trade HUB Product Catalog Proxy
 *
 * Routes:
 *   action=list-ranges                                      → GET /product-ranges
 *   action=list-types    &rangeId=X                        → GET /product-ranges/{X}/product-types
 *   action=list-materials&rangeId=X&typeId=Y               → GET /product-ranges/{X}/product-types/{Y}/materials
 *   action=request-body  &rangeId=X&typeId=Y&materialId=Z  → GET /product-ranges/{X}/product-types/{Y}/materials/{Z}/request-body
 *   action=verify-ids    &rangeId=X&typeId=Y               → same as list-materials (used to confirm IDs are valid)
 */
serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Auth check
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) throw new Error("No authorization header");
    const token = authHeader.replace("Bearer ", "");
    const { data: { user }, error: userError } = await supabase.auth.getUser(token);
    if (userError || !user) throw new Error("Unauthorized");

    // Get CW token from user's integration settings
    const url = new URL(req.url);
    const action = url.searchParams.get("action");
    const rangeId = url.searchParams.get("rangeId");
    const typeId = url.searchParams.get("typeId");
    const materialId = url.searchParams.get("materialId");

    // For requests that need a token, fetch from integration_settings
    // Or accept it in the request body
    let apiToken: string | null = null;
    if (req.method === "POST") {
      const body = await req.json().catch(() => ({}));
      apiToken = body.apiToken || null;
    } else {
      apiToken = url.searchParams.get("apiToken");
    }

    if (!apiToken) {
      // Try to fetch from integration_settings for this user
      const { data: integrationRow } = await supabase
        .from("integration_settings")
        .select("api_credentials")
        .eq("integration_type", "cw_systems")
        .eq("active", true)
        .maybeSingle();

      apiToken = (integrationRow?.api_credentials as any)?.api_token || null;
    }

    if (!apiToken) {
      throw new Error("No CW Trade Hub API token configured. Add your Bearer token in Settings → Integrations → CW Systems.");
    }

    const cwHeaders = {
      "Authorization": `Bearer ${apiToken}`,
      "Accept": "application/json",
      "Content-Type": "application/json",
    };

    let cwUrl = "";
    switch (action) {
      case "list-ranges":
        cwUrl = `${CW_API_BASE}/product-ranges`;
        break;

      case "list-types":
        if (!rangeId) throw new Error("rangeId is required");
        cwUrl = `${CW_API_BASE}/product-ranges/${rangeId}/product-types`;
        break;

      case "list-materials":
      case "verify-ids":
        if (!rangeId) throw new Error("rangeId is required");
        if (!typeId) throw new Error("typeId is required");
        cwUrl = `${CW_API_BASE}/product-ranges/${rangeId}/product-types/${typeId}/materials`;
        break;

      case "request-body":
        if (!rangeId || !typeId || !materialId) throw new Error("rangeId, typeId, and materialId are required");
        cwUrl = `${CW_API_BASE}/product-ranges/${rangeId}/product-types/${typeId}/materials/${materialId}/request-body`;
        break;

      default:
        throw new Error(`Unknown action: ${action}. Valid: list-ranges, list-types, list-materials, verify-ids, request-body`);
    }

    console.log(`[CW Catalog] Calling: GET ${cwUrl}`);
    const cwResponse = await fetch(cwUrl, { headers: cwHeaders });

    if (!cwResponse.ok) {
      const errText = await cwResponse.text();
      // 404 likely means the IDs don't exist or the endpoint isn't supported
      if (cwResponse.status === 404) {
        if (action === "list-ranges") {
          // list-ranges endpoint may not exist; return empty so UI shows manual entry
          return new Response(
            JSON.stringify({ data: null, manualEntry: true, message: "Product range listing not available via API. Please enter your CW product IDs manually." }),
            { headers: { ...corsHeaders, "Content-Type": "application/json" } }
          );
        }
        throw new Error(`CW product not found (${cwResponse.status}). Check your Range ID and Type ID.`);
      }
      throw new Error(`CW API error (${cwResponse.status}): ${errText}`);
    }

    const cwData = await cwResponse.json();

    // Normalise the materials response: { "Range Name | Type Name": [{id, name}] }
    // into { rangeName, typeName, materials: [{id, name}] }
    let responsePayload: any = { raw: cwData };

    if (action === "list-materials" || action === "verify-ids") {
      const keys = Object.keys(cwData);
      if (keys.length > 0) {
        const label = keys[0]; // e.g. "Roller Blinds | Atlas"
        const parts = label.split(" | ");
        responsePayload = {
          rangeTypeName: label,
          rangeName: parts[0]?.trim() || label,
          typeName: parts[1]?.trim() || "",
          materials: cwData[label] || [],
          raw: cwData,
        };
      }
    }

    return new Response(
      JSON.stringify({ data: responsePayload }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error: any) {
    console.error("[CW Catalog] Error:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});

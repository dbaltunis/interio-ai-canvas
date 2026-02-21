import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { encodeBase64 as base64Encode } from "https://deno.land/std@0.224.0/encoding/base64.ts";

// Web Crypto based HMAC-SHA256 (replaces deno std hash module)
async function hmacSha256(key: string, message: string): Promise<Uint8Array> {
  const encoder = new TextEncoder();
  const cryptoKey = await crypto.subtle.importKey(
    "raw", encoder.encode(key), { name: "HMAC", hash: "SHA-256" }, false, ["sign"]
  );
  const sig = await crypto.subtle.sign("HMAC", cryptoKey, encoder.encode(message));
  return new Uint8Array(sig);
}

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// --- OAuth 1.0 TBA Helpers (shared pattern with netsuite-sync-customers) ---

function percentEncode(str: string): string {
  return encodeURIComponent(str)
    .replace(/!/g, "%21")
    .replace(/\*/g, "%2A")
    .replace(/'/g, "%27")
    .replace(/\(/g, "%28")
    .replace(/\)/g, "%29");
}

function generateNonce(): string {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  let nonce = "";
  for (let i = 0; i < 32; i++) {
    nonce += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return nonce;
}

async function generateOAuthHeader(
  method: string,
  url: string,
  creds: {
    consumerKey: string;
    consumerSecret: string;
    tokenId: string;
    tokenSecret: string;
    accountId: string;
  }
): Promise<string> {
  const timestamp = Math.floor(Date.now() / 1000).toString();
  const nonce = generateNonce();

  const oauthParams: Record<string, string> = {
    oauth_consumer_key: creds.consumerKey,
    oauth_nonce: nonce,
    oauth_signature_method: "HMAC-SHA256",
    oauth_timestamp: timestamp,
    oauth_token: creds.tokenId,
    oauth_version: "1.0",
  };

  const paramString = Object.keys(oauthParams)
    .sort()
    .map((key) => `${percentEncode(key)}=${percentEncode(oauthParams[key])}`)
    .join("&");

  const signatureBase = `${method.toUpperCase()}&${percentEncode(url)}&${percentEncode(paramString)}`;
  const signingKey = `${percentEncode(creds.consumerSecret)}&${percentEncode(creds.tokenSecret)}`;

  const sigBytes = await hmacSha256(signingKey, signatureBase);
  const signature = base64Encode(sigBytes);

  const realm = creds.accountId.replace(/-/g, "_").toUpperCase();
  const headerParts = [
    `realm="${realm}"`,
    ...Object.entries(oauthParams).map(([key, val]) => `${key}="${percentEncode(val)}"`),
    `oauth_signature="${percentEncode(signature)}"`,
  ];

  return `OAuth ${headerParts.join(", ")}`;
}

function getBaseUrl(accountId: string): string {
  const slug = accountId.replace(/_/g, "-").toLowerCase();
  return `https://${slug}.suitetalk.api.netsuite.com/services/rest/record/v1`;
}

async function nsRequest(
  method: string,
  url: string,
  creds: any,
  body?: any
): Promise<any> {
  const authHeader = await generateOAuthHeader(method, url.split("?")[0], creds);
  const options: RequestInit = {
    method,
    headers: {
      Authorization: authHeader,
      "Content-Type": "application/json",
      Accept: "application/json",
    },
  };
  if (body) options.body = JSON.stringify(body);

  const response = await fetch(url, options);

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`NetSuite API ${response.status}: ${errorText.substring(0, 300)}`);
  }

  if (response.status === 204) {
    const location = response.headers.get("Location");
    const id = location?.split("/").pop();
    return { id, location };
  }

  return await response.json();
}

/**
 * NetSuite Invoice Sync Edge Function
 *
 * Pulls invoices from NetSuite and updates project payment status.
 * Links invoices to projects via netsuite_estimate_id or netsuite_sales_order_id.
 */
Deno.serve(async (req: Request) => {
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

    const { projectId } = await req.json();

    // Get NetSuite integration
    const { data: integration, error: intError } = await supabase
      .from("integration_settings")
      .select("*")
      .eq("user_id", user.id)
      .eq("integration_type", "netsuite")
      .eq("active", true)
      .single();

    if (intError || !integration) throw new Error("NetSuite integration not found");

    const { account_id, consumer_key, consumer_secret, token_id, token_secret } =
      integration.api_credentials || {};

    if (!account_id || !consumer_key || !token_id) {
      throw new Error("NetSuite credentials not configured");
    }

    const creds = {
      consumerKey: consumer_key,
      consumerSecret: consumer_secret,
      tokenId: token_id,
      tokenSecret: token_secret,
      accountId: account_id,
    };
    const baseUrl = getBaseUrl(account_id);

    const results = { synced: 0, updated: 0, errors: [] as string[] };

    // Pull invoices from NetSuite
    const listUrl = `${baseUrl}/invoice?limit=100&fields=memo,entity,tranDate,total,status,amountPaid,amountRemaining,createdFrom,externalId`;
    const data = await nsRequest("GET", listUrl, creds);

    const invoices = data.items || [];

    for (const invoice of invoices) {
      try {
        const nsInvoiceId = invoice.id?.toString();
        if (!nsInvoiceId) continue;

        // Skip invoices created from InterioApp (we track via createdFrom)
        const externalId = invoice.externalId;

        // Find matching project by:
        // 1. Direct netsuite_invoice_id match (already linked)
        // 2. Via createdFrom (sales order or estimate that created this invoice)
        let matchedProjectId: string | null = null;

        // Check if already linked
        if (!projectId) {
          const { data: alreadyLinked } = await supabase
            .from("projects")
            .select("id")
            .eq("user_id", user.id)
            .eq("netsuite_invoice_id" as any, nsInvoiceId)
            .maybeSingle();

          if (alreadyLinked) {
            matchedProjectId = alreadyLinked.id;
          }
        } else {
          matchedProjectId = projectId;
        }

        // Try to link via createdFrom (the estimate or sales order)
        if (!matchedProjectId && invoice.createdFrom?.id) {
          const createdFromId = invoice.createdFrom.id.toString();

          // Check sales orders
          const { data: soMatch } = await supabase
            .from("projects")
            .select("id")
            .eq("user_id", user.id)
            .eq("netsuite_sales_order_id" as any, createdFromId)
            .maybeSingle();

          if (soMatch) {
            matchedProjectId = soMatch.id;
          } else {
            // Check estimates
            const { data: estMatch } = await supabase
              .from("projects")
              .select("id")
              .eq("user_id", user.id)
              .eq("netsuite_estimate_id" as any, createdFromId)
              .maybeSingle();

            if (estMatch) matchedProjectId = estMatch.id;
          }
        }

        // Try to match via externalId pattern
        if (!matchedProjectId && externalId && externalId.startsWith("interioapp-")) {
          const appProjectId = externalId.replace("interioapp-", "");
          const { data: extMatch } = await supabase
            .from("projects")
            .select("id")
            .eq("id", appProjectId)
            .eq("user_id", user.id)
            .maybeSingle();

          if (extMatch) matchedProjectId = extMatch.id;
        }

        if (!matchedProjectId) {
          // No matching project — skip this invoice
          continue;
        }

        // Update project with invoice info
        const invoiceStatus = invoice.status?.id || invoice.status || "open";
        const isPaid = invoiceStatus === "paidInFull" || invoiceStatus === "paid";
        const amountPaid = invoice.amountPaid || 0;
        const amountRemaining = invoice.amountRemaining || invoice.total || 0;

        await supabase
          .from("projects")
          .update({
            netsuite_invoice_id: nsInvoiceId,
            payment_status: isPaid ? "paid" : amountPaid > 0 ? "partial" : "unpaid",
          } as any)
          .eq("id", matchedProjectId);

        results.synced++;
      } catch (err: any) {
        results.errors.push(`Invoice ${invoice.id}: ${err.message}`);
      }
    }

    // Update last sync
    await supabase
      .from("integration_settings")
      .update({ last_sync: new Date().toISOString() })
      .eq("id", integration.id);

    console.log(
      `NetSuite invoice sync: ${results.synced} synced, ${results.errors.length} errors`
    );

    return new Response(JSON.stringify({ success: true, ...results }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error: any) {
    console.error("NetSuite invoice sync error:", error);
    return new Response(
      JSON.stringify({ error: error.message || "Invoice sync failed" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});

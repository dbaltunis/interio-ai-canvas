import { encode as base64Encode } from "https://deno.land/std@0.190.0/encoding/base64.ts";

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

/**
 * NetSuite uses Token-Based Authentication (TBA) which is OAuth 1.0 with HMAC-SHA256.
 * Required credentials: account_id, consumer_key, consumer_secret, token_id, token_secret
 *
 * Base URL format: https://{accountId}.suitetalk.api.netsuite.com/services/rest/record/v1/
 */

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
  consumerKey: string,
  consumerSecret: string,
  tokenId: string,
  tokenSecret: string,
  accountId: string
): Promise<string> {
  const timestamp = Math.floor(Date.now() / 1000).toString();
  const nonce = generateNonce();

  // OAuth parameters
  const oauthParams: Record<string, string> = {
    oauth_consumer_key: consumerKey,
    oauth_nonce: nonce,
    oauth_signature_method: "HMAC-SHA256",
    oauth_timestamp: timestamp,
    oauth_token: tokenId,
    oauth_version: "1.0",
  };

  // Build signature base string
  const paramString = Object.keys(oauthParams)
    .sort()
    .map((key) => `${percentEncode(key)}=${percentEncode(oauthParams[key])}`)
    .join("&");

  const signatureBase = `${method.toUpperCase()}&${percentEncode(url)}&${percentEncode(paramString)}`;

  // Create signing key
  const signingKey = `${percentEncode(consumerSecret)}&${percentEncode(tokenSecret)}`;

  // HMAC-SHA256 signature
  const sigBytes = await hmacSha256(signingKey, signatureBase);
  const signature = base64Encode(sigBytes);

  // Build Authorization header
  const realm = accountId.replace(/-/g, "_").toUpperCase();
  const headerParts = [
    `realm="${realm}"`,
    ...Object.entries(oauthParams).map(
      ([key, val]) => `${key}="${percentEncode(val)}"`
    ),
    `oauth_signature="${percentEncode(signature)}"`,
  ];

  return `OAuth ${headerParts.join(", ")}`;
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { account_id, consumer_key, consumer_secret, token_id, token_secret } =
      await req.json();

    if (!account_id || !consumer_key || !consumer_secret || !token_id || !token_secret) {
      throw new Error(
        "Missing required fields: account_id, consumer_key, consumer_secret, token_id, token_secret"
      );
    }

    // Build the NetSuite REST API URL
    // Account ID format: 1234567 or 1234567_SB1 (sandbox)
    const accountSlug = account_id.replace(/_/g, "-").toLowerCase();
    const baseUrl = `https://${accountSlug}.suitetalk.api.netsuite.com/services/rest/record/v1`;

    // Test by fetching a simple metadata endpoint
    const testUrl = `${baseUrl}/customer?limit=1`;

    console.log(`Testing NetSuite connection to account ${account_id}...`);

    const authHeader = await generateOAuthHeader(
      "GET",
      testUrl,
      consumer_key,
      consumer_secret,
      token_id,
      token_secret,
      account_id
    );

    const response = await fetch(testUrl, {
      method: "GET",
      headers: {
        Authorization: authHeader,
        "Content-Type": "application/json",
        Accept: "application/json",
      },
    });

    if (response.status === 401 || response.status === 403) {
      const errorText = await response.text();
      throw new Error(
        `Authentication failed (${response.status}): Check your credentials. ${errorText.substring(0, 200)}`
      );
    }

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`NetSuite API error (${response.status}): ${errorText.substring(0, 300)}`);
    }

    const data = await response.json();
    const totalResults = data.totalResults ?? data.count ?? "unknown";

    return new Response(
      JSON.stringify({
        success: true,
        message: `Connected to NetSuite account ${account_id}`,
        customer_count: totalResults,
        api_version: "REST v1",
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error: any) {
    console.error("NetSuite connection test failed:", error);
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

import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
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

// --- OAuth 1.0 TBA Helpers ---

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

// --- NetSuite API Wrapper ---

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

  // 204 No Content (successful POST/PATCH)
  if (response.status === 204) {
    const location = response.headers.get("Location");
    const id = location?.split("/").pop();
    return { id, location };
  }

  return await response.json();
}

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

    const { direction, clientId } = await req.json();

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

    const results = { imported: 0, exported: 0, updated: 0, errors: [] as string[] };

    if (direction === "push" || direction === "both") {
      // Push InterioApp clients to NetSuite as Customers
      let clientsQuery = supabase
        .from("clients")
        .select("*")
        .eq("user_id", user.id);

      if (clientId) clientsQuery = clientsQuery.eq("id", clientId);

      const { data: clients } = await clientsQuery;

      for (const client of clients || []) {
        try {
          // Map InterioApp client to NetSuite customer
          const nsCustomer: any = {
            companyName: client.company_name || client.name,
            entityId: client.name,
            email: client.email || undefined,
            phone: client.phone || undefined,
            comments: `Synced from InterioApp. Client ID: ${client.id}`,
          };

          // Add address if available
          if (client.address || client.city || client.state) {
            nsCustomer.addressBook = {
              items: [
                {
                  addressBookAddress: {
                    addr1: client.address || "",
                    city: client.city || "",
                    state: client.state || "",
                    zip: client.zip_code || "",
                    country: client.country
                      ? (client.country === "Australia" ? "_australia"
                        : client.country === "New Zealand" ? "_newZealand"
                        : client.country === "United States" ? "_unitedStates"
                        : client.country === "United Kingdom" ? "_unitedKingdom"
                        : client.country === "Canada" ? "_canada"
                        : `_${client.country.toLowerCase().replace(/\s+/g, "")}`)
                      : undefined,
                  },
                  defaultBilling: true,
                  defaultShipping: true,
                  label: "Primary",
                },
              ],
            };
          }

          const existingNsId = (client as any).netsuite_customer_id;

          if (existingNsId) {
            // Update existing NetSuite customer
            const updateUrl = `${baseUrl}/customer/${existingNsId}`;
            await nsRequest("PATCH", updateUrl, creds, nsCustomer);
            results.updated++;
          } else {
            // Create new NetSuite customer
            const createUrl = `${baseUrl}/customer`;
            const result = await nsRequest("POST", createUrl, creds, nsCustomer);

            if (result.id) {
              await supabase
                .from("clients")
                .update({ netsuite_customer_id: result.id } as any)
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
      // Pull NetSuite customers to InterioApp
      try {
        const listUrl = `${baseUrl}/customer?limit=100&fields=companyName,entityId,email,phone,comments`;
        const data = await nsRequest("GET", listUrl, creds);

        const customers = data.items || [];

        for (const customer of customers) {
          try {
            const nsId = customer.id?.toString();
            if (!nsId) continue;

            // Check if already imported
            const { data: existing } = await supabase
              .from("clients")
              .select("id")
              .eq("user_id", user.id)
              .eq("netsuite_customer_id" as any, nsId)
              .maybeSingle();

            const clientData: any = {
              user_id: user.id,
              name: customer.entityId || customer.companyName || `NS Customer ${nsId}`,
              company_name: customer.companyName || "",
              email: customer.email || "",
              phone: customer.phone || "",
              netsuite_customer_id: nsId,
            };

            if (existing) {
              await supabase.from("clients").update(clientData).eq("id", existing.id);
              results.updated++;
            } else {
              await supabase.from("clients").insert(clientData);
              results.imported++;
            }
          } catch (err: any) {
            results.errors.push(`NS Customer ${customer.id}: ${err.message}`);
          }
        }
      } catch (err: any) {
        results.errors.push(`Pull failed: ${err.message}`);
      }
    }

    // Update last sync
    await supabase
      .from("integration_settings")
      .update({ last_sync: new Date().toISOString() })
      .eq("id", integration.id);

    console.log(`NetSuite customer sync: ${results.imported} imported, ${results.exported} exported, ${results.updated} updated`);

    return new Response(JSON.stringify({ success: true, ...results }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error: any) {
    console.error("NetSuite customer sync error:", error);
    return new Response(
      JSON.stringify({ error: error.message || "Customer sync failed" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});

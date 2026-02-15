import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { HmacSha256 } from "https://deno.land/std@0.190.0/hash/sha256.ts";
import { encode as base64Encode } from "https://deno.land/std@0.190.0/encoding/base64.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// --- OAuth 1.0 TBA Helpers (shared with netsuite-sync-customers) ---

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

function generateOAuthHeader(
  method: string,
  url: string,
  creds: {
    consumerKey: string;
    consumerSecret: string;
    tokenId: string;
    tokenSecret: string;
    accountId: string;
  }
): string {
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

  const hmac = new HmacSha256(signingKey);
  hmac.update(signatureBase);
  const signature = base64Encode(new Uint8Array(hmac.digest()));

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
  const authHeader = generateOAuthHeader(method, url.split("?")[0], creds);
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

    const { projectId, direction, recordType } = await req.json();
    // recordType: 'estimate' | 'salesOrder' — defaults to 'estimate'
    const nsRecordType = recordType === "salesOrder" ? "salesOrder" : "estimate";

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
    const defaultSubsidiary = integration.configuration?.default_subsidiary;
    const defaultCurrency = integration.configuration?.default_currency;

    const results = { exported: 0, updated: 0, errors: [] as string[] };

    if (direction === "push" || direction === "both") {
      // Fetch projects to push
      let projectsQuery = supabase
        .from("projects")
        .select(`
          *,
          clients!projects_client_id_fkey (
            id, name, email, phone, company_name,
            netsuite_customer_id
          )
        `)
        .eq("user_id", user.id);

      if (projectId) projectsQuery = projectsQuery.eq("id", projectId);

      const { data: projects, error: projError } = await projectsQuery;
      if (projError) throw new Error(`Failed to fetch projects: ${projError.message}`);

      for (const project of projects || []) {
        try {
          // Fetch treatments (line items)
          const { data: treatments } = await supabase
            .from("treatments")
            .select("*")
            .eq("project_id", project.id);

          const client = project.clients as any;
          const nsCustomerId = client?.netsuite_customer_id;

          // Build line items from treatments
          const lineItems = (treatments || []).map((t: any, idx: number) => {
            const item: any = {
              line: idx + 1,
              description: [
                t.treatment_name || t.treatment_type || "Treatment",
                t.product_name ? `Product: ${t.product_name}` : null,
                t.location ? `Location: ${t.location}` : null,
                t.measurements ? `Measurements: ${JSON.stringify(t.measurements)}` : null,
              ].filter(Boolean).join(" | "),
              quantity: t.quantity || 1,
              rate: t.total_price ? (t.total_price / (t.quantity || 1)) : 0,
              amount: t.total_price || 0,
            };

            // Add cost details in memo
            const costs = [];
            if (t.material_cost) costs.push(`Material: $${t.material_cost.toFixed(2)}`);
            if (t.labor_cost) costs.push(`Labor: $${t.labor_cost.toFixed(2)}`);
            if (t.markup_percentage) costs.push(`Markup: ${t.markup_percentage}%`);
            if (costs.length > 0) item.description += ` [${costs.join(", ")}]`;

            return item;
          });

          // Calculate totals
          const totalPrice = treatments?.reduce(
            (sum: number, t: any) => sum + (t.total_price || 0), 0
          ) || 0;

          // Build the NetSuite estimate or sales order body
          const nsRecord: any = {
            memo: `InterioApp ${nsRecordType === "salesOrder" ? "Order" : "Quote"}: ${
              project.quote_number || project.job_number || project.id
            }`,
            tranDate: project.created_at
              ? new Date(project.created_at).toISOString().split("T")[0]
              : new Date().toISOString().split("T")[0],
          };

          // Entity (customer) reference
          if (nsCustomerId) {
            nsRecord.entity = { id: nsCustomerId };
          } else if (integration.configuration?.auto_create_customers && client) {
            // Auto-create customer in NetSuite first
            try {
              const nsCustomer: any = {
                companyName: client.company_name || client.name,
                entityId: client.name,
                email: client.email || undefined,
                phone: client.phone || undefined,
              };

              const createUrl = `${baseUrl}/customer`;
              const custResult = await nsRequest("POST", createUrl, creds, nsCustomer);

              if (custResult.id) {
                // Store the new NetSuite customer ID
                await supabase
                  .from("clients")
                  .update({ netsuite_customer_id: custResult.id } as any)
                  .eq("id", client.id);

                nsRecord.entity = { id: custResult.id };
              }
            } catch (custErr: any) {
              console.error(`Auto-create customer failed: ${custErr.message}`);
              // Continue without entity — NetSuite may reject it
            }
          }

          // Subsidiary (required for OneWorld accounts)
          if (defaultSubsidiary) {
            nsRecord.subsidiary = { id: defaultSubsidiary };
          }

          // Currency
          if (defaultCurrency) {
            nsRecord.currency = { id: defaultCurrency };
          }

          // Add line items
          if (lineItems.length > 0) {
            nsRecord.item = {
              items: lineItems.map((li: any) => ({
                description: li.description,
                quantity: li.quantity,
                rate: li.rate.toString(),
                amount: li.amount,
              })),
            };
          }

          // Add custom fields for reference
          nsRecord.externalId = `interioapp-${project.id}`;

          // Determine if this is an update or create
          const existingNsId = nsRecordType === "salesOrder"
            ? (project as any).netsuite_sales_order_id
            : (project as any).netsuite_estimate_id;

          if (existingNsId) {
            // Update existing record
            const updateUrl = `${baseUrl}/${nsRecordType}/${existingNsId}`;
            await nsRequest("PATCH", updateUrl, creds, nsRecord);
            results.updated++;
          } else {
            // Create new record
            const createUrl = `${baseUrl}/${nsRecordType}`;
            const result = await nsRequest("POST", createUrl, creds, nsRecord);

            if (result.id) {
              // Store NetSuite record ID on the project
              const updateField = nsRecordType === "salesOrder"
                ? "netsuite_sales_order_id"
                : "netsuite_estimate_id";

              await supabase
                .from("projects")
                .update({ [updateField]: result.id } as any)
                .eq("id", project.id);

              results.exported++;
            }
          }
        } catch (err: any) {
          results.errors.push(`Project ${project.id}: ${err.message}`);
        }
      }
    }

    if (direction === "pull" || direction === "both") {
      // Pull estimates/sales orders from NetSuite (with line items)
      try {
        const listUrl = `${baseUrl}/${nsRecordType}?limit=50&fields=memo,entity,tranDate,total,externalId,status`;
        const data = await nsRequest("GET", listUrl, creds);

        const records = data.items || [];

        for (const record of records) {
          try {
            const nsId = record.id?.toString();
            if (!nsId) continue;

            // Skip records created from InterioApp to avoid duplicates
            const externalId = record.externalId;
            if (externalId && externalId.startsWith("interioapp-")) {
              continue;
            }

            const idField = nsRecordType === "salesOrder"
              ? "netsuite_sales_order_id"
              : "netsuite_estimate_id";

            const { data: existing } = await supabase
              .from("projects")
              .select("id")
              .eq("user_id", user.id)
              .eq(idField as any, nsId)
              .maybeSingle();

            // Fetch full record with line items for both new and existing
            let lineItems: any[] = [];
            try {
              const detailUrl = `${baseUrl}/${nsRecordType}/${nsId}?expandSubResources=true`;
              const detail = await nsRequest("GET", detailUrl, creds);
              lineItems = detail.item?.items || [];
            } catch (detailErr: any) {
              console.log(`Could not fetch line items for ${nsRecordType} ${nsId}: ${detailErr.message}`);
            }

            if (existing) {
              // Update existing project with latest data
              const updateData: any = {
                name: record.memo || existing.id,
              };
              if (record.total != null) updateData.total_price = record.total;

              await supabase.from("projects").update(updateData).eq("id", existing.id);

              // Sync line items as treatments if we got them
              if (lineItems.length > 0) {
                for (const li of lineItems) {
                  const treatmentData: any = {
                    project_id: existing.id,
                    user_id: user.id,
                    treatment_type: "imported",
                    treatment_name: li.description || `Line ${li.line || 1}`,
                    product_name: li.item?.refName || li.description || "NetSuite Item",
                    quantity: li.quantity || 1,
                    total_price: li.amount || 0,
                  };

                  // Upsert by project + line number
                  const { data: existingTreatment } = await supabase
                    .from("treatments")
                    .select("id")
                    .eq("project_id", existing.id)
                    .eq("treatment_name" as any, treatmentData.treatment_name)
                    .maybeSingle();

                  if (existingTreatment) {
                    await supabase.from("treatments").update(treatmentData).eq("id", existingTreatment.id);
                  }
                }
              }

              results.updated++;
              continue;
            }

            // Resolve client from NetSuite entity
            let clientId = null;
            if (record.entity?.id) {
              const { data: matchingClient } = await supabase
                .from("clients")
                .select("id")
                .eq("user_id", user.id)
                .eq("netsuite_customer_id" as any, record.entity.id.toString())
                .maybeSingle();

              if (matchingClient) clientId = matchingClient.id;
            }

            // Create project from NetSuite record
            const projectData: any = {
              user_id: user.id,
              name: record.memo || `NetSuite ${nsRecordType} ${nsId}`,
              status: nsRecordType === "salesOrder" ? "confirmed" : "quoted",
              client_id: clientId,
              [idField]: nsId,
            };

            const { data: newProject } = await supabase
              .from("projects")
              .insert(projectData)
              .select("id")
              .single();

            // Import line items as treatments
            if (newProject && lineItems.length > 0) {
              const treatmentInserts = lineItems.map((li: any) => ({
                project_id: newProject.id,
                user_id: user.id,
                treatment_type: "imported",
                treatment_name: li.description || `Line ${li.line || 1}`,
                product_name: li.item?.refName || li.description || "NetSuite Item",
                quantity: li.quantity || 1,
                total_price: li.amount || 0,
                material_cost: li.amount || 0,
              }));

              await supabase.from("treatments").insert(treatmentInserts);
            }

            results.exported++;
          } catch (err: any) {
            results.errors.push(`NS ${nsRecordType} ${record.id}: ${err.message}`);
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

    console.log(
      `NetSuite ${nsRecordType} sync: ${results.exported} exported, ${results.updated} updated, ${results.errors.length} errors`
    );

    return new Response(JSON.stringify({ success: true, ...results }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error: any) {
    console.error("NetSuite order sync error:", error);
    return new Response(
      JSON.stringify({ error: error.message || "Order sync failed" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});

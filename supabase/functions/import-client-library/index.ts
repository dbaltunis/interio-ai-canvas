import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

const TARGET_USER_ID = "4eebf4ef-bc13-4e57-b120-32a0ca281932";

interface ImportResult {
  created: number;
  updated: number;
  skipped: number;
  errors: string[];
  collections_created: string[];
  vendors_created: string[];
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, serviceKey);

    const body = await req.json();
    const { action, format, csv_data, storage_path } = body;

    // Upload mode: store CSV data to storage for later import
    if (action === "upload") {
      if (!format || !csv_data) {
        return new Response(JSON.stringify({ error: "Missing format or csv_data for upload" }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } });
      }
      const path = `${format}.csv`;
      
      // Check if file exists and append, or create new
      if (body.append) {
        const { data: existing } = await supabase.storage.from("imports").download(path);
        let existingContent = "";
        if (existing) {
          existingContent = await existing.text();
        }
        const combined = existingContent + "\n" + csv_data;
        const { error } = await supabase.storage.from("imports").upload(path, combined, { upsert: true, contentType: "text/csv" });
        if (error) throw new Error(`Upload failed: ${error.message}`);
      } else {
        const { error } = await supabase.storage.from("imports").upload(path, csv_data, { upsert: true, contentType: "text/csv" });
        if (error) throw new Error(`Upload failed: ${error.message}`);
      }

      return new Response(JSON.stringify({ success: true, path }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Import mode: read from storage or inline data
    let csvContent = csv_data;
    if (!csvContent && storage_path) {
      const { data, error } = await supabase.storage.from("imports").download(storage_path);
      if (error) throw new Error(`Storage download failed: ${error.message}`);
      csvContent = await data.text();
    }
    if (!csvContent) {
      // Try default storage path based on format
      const defaultPath = `${format}.csv`;
      const { data, error } = await supabase.storage.from("imports").download(defaultPath);
      if (error) throw new Error(`No CSV data found. Provide csv_data, storage_path, or upload first.`);
      csvContent = await data.text();
    }

    if (!format || !csvContent) {
      return new Response(
        JSON.stringify({ error: "Missing format or csv data" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const lines = csvContent.split("\n").filter((l: string) => l.trim());
    const headers = lines[0].split(",").map((h: string) => h.trim());
    const rows = lines.slice(1).map((line: string) => {
      const values = parseCSVLine(line);
      const row: Record<string, string> = {};
      headers.forEach((h: string, i: number) => { row[h] = (values[i] || "").trim(); });
      return row;
    });

    console.log(`Processing ${rows.length} rows in format: ${format}`);

    // Ensure vendors exist
    const vendorId = await ensureVendor(supabase, format === "cnv_trimmings" ? "CNV" : "DATEKS");

    const result: ImportResult = {
      created: 0, updated: 0, skipped: 0, errors: [],
      collections_created: [], vendors_created: [],
    };

    // Process in batches of 50
    const batchSize = 50;
    for (let i = 0; i < rows.length; i += batchSize) {
      const batch = rows.slice(i, i + batchSize);
      const items = [];

      for (const row of batch) {
        try {
          let item;
          if (format === "dateks_expo_2024") {
            item = await mapExpo2024(supabase, row, vendorId);
          } else if (format === "dateks_pricelist_2023") {
            item = mapPricelist2023(row, vendorId);
          } else if (format === "cnv_trimmings") {
            item = mapCNVTrimmings(row, vendorId);
          } else {
            result.errors.push(`Unknown format: ${format}`);
            continue;
          }

          if (item) items.push(item);
        } catch (e) {
          result.errors.push(`Row error: ${e.message}`);
        }
      }

      if (items.length === 0) continue;

      // Upsert by SKU within this account
      for (const item of items) {
        const { data: existing } = await supabase
          .from("enhanced_inventory_items")
          .select("id")
          .eq("user_id", TARGET_USER_ID)
          .eq("sku", item.sku)
          .maybeSingle();

        if (existing) {
          const { error } = await supabase
            .from("enhanced_inventory_items")
            .update({
              name: item.name,
              cost_price: item.cost_price,
              selling_price: item.selling_price,
              fabric_width: item.fabric_width,
              tags: item.tags,
              collection_name: item.collection_name,
              collection_id: item.collection_id,
            })
            .eq("id", existing.id);
          if (error) result.errors.push(`Update ${item.sku}: ${error.message}`);
          else result.updated++;
        } else {
          const { error } = await supabase
            .from("enhanced_inventory_items")
            .insert(item);
          if (error) result.errors.push(`Insert ${item.sku}: ${error.message}`);
          else result.created++;
        }
      }
    }

    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("Import error:", e);
    return new Response(JSON.stringify({ error: e.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});

// --- Helpers ---

function parseCSVLine(line: string): string[] {
  const result: string[] = [];
  let current = "";
  let inQuotes = false;
  for (const char of line) {
    if (char === '"') { inQuotes = !inQuotes; }
    else if (char === "," && !inQuotes) { result.push(current); current = ""; }
    else { current += char; }
  }
  result.push(current);
  return result;
}

async function ensureVendor(supabase: any, name: string): Promise<string> {
  const { data: existing } = await supabase
    .from("vendors")
    .select("id")
    .eq("user_id", TARGET_USER_ID)
    .eq("name", name)
    .maybeSingle();

  if (existing) return existing.id;

  const { data, error } = await supabase
    .from("vendors")
    .insert({ user_id: TARGET_USER_ID, name, active: true })
    .select("id")
    .single();

  if (error) throw new Error(`Vendor create failed: ${error.message}`);
  return data.id;
}

// Collection cache to avoid repeated lookups
const collectionCache = new Map<string, string>();

async function ensureCollection(supabase: any, name: string): Promise<string> {
  const key = name.toUpperCase().trim();
  if (collectionCache.has(key)) return collectionCache.get(key)!;

  const { data: existing } = await supabase
    .from("collections")
    .select("id")
    .eq("user_id", TARGET_USER_ID)
    .eq("name", key)
    .maybeSingle();

  if (existing) {
    collectionCache.set(key, existing.id);
    return existing.id;
  }

  const { data, error } = await supabase
    .from("collections")
    .insert({ user_id: TARGET_USER_ID, name: key, active: true })
    .select("id")
    .single();

  if (error) throw new Error(`Collection create failed for ${key}: ${error.message}`);
  collectionCache.set(key, data.id);
  return data.id;
}

function extractCollection(fabricName: string): string | null {
  // Pattern: "FABRIC / KNYGA COLLECTION" or "FABRIC / KN. COLLECTION" or "Fabric / Collection"
  const patterns = [
    /\/\s*KNYGA\s+(.+)/i,
    /\/\s*KN\.\s*(.+)/i,
    /\/\s*kn\.\s*(.+)/i,
    /\/\s*(.+)/,
  ];

  for (const pattern of patterns) {
    const match = fabricName.match(pattern);
    if (match) {
      return match[1].trim().toUpperCase();
    }
  }
  return null;
}

function parseWidth(widthStr: string): number | null {
  if (!widthStr) return null;
  // Handle "300 DEPO", "300 ROLL", or just "300"
  const match = widthStr.match(/(\d+)/);
  return match ? parseInt(match[1]) : null;
}

function parsePrice(priceStr: string): number {
  if (!priceStr) return 0;
  const num = parseFloat(priceStr);
  return isNaN(num) ? 0 : Math.round(num * 100) / 100;
}

async function mapExpo2024(supabase: any, row: Record<string, string>, vendorId: string) {
  const name = row.fabric_name;
  if (!name) return null;

  const sku = `DATEKS-${row.nr}`;
  const tags: string[] = [];
  if (row.year) tags.push(`year:${row.year}`);
  if (row.status) {
    const status = row.status.toLowerCase();
    if (status === "išpardavimas" || status === "ispardavimas") tags.push("clearance");
    else if (status === "turime paletes") tags.push("in-stock");
    else if (status) tags.push(status);
  }

  const collectionName = extractCollection(name);
  let collectionId: string | undefined;
  if (collectionName) {
    try {
      collectionId = await ensureCollection(supabase, collectionName);
    } catch (e) {
      console.warn(`Collection error for ${collectionName}:`, e.message);
    }
  }

  return {
    user_id: TARGET_USER_ID,
    name,
    sku,
    category: "fabric",
    subcategory: "curtain_fabric",
    fabric_width: parseWidth(row.width_cm),
    cost_price: parsePrice(row.roll_price_eur),
    selling_price: parsePrice(row.sell_cut_price_eur),
    vendor_id: vendorId,
    pricing_method: "per_meter" as const,
    quantity: 0,
    tags: tags.length > 0 ? tags : undefined,
    collection_name: collectionName || undefined,
    collection_id: collectionId || undefined,
  };
}

function mapPricelist2023(row: Record<string, string>, vendorId: string) {
  const name = row.design;
  if (!name) return null;

  const sku = `DATEKS-${row.catalog_nr}`;

  return {
    user_id: TARGET_USER_ID,
    name,
    sku,
    category: "fabric",
    subcategory: "curtain_fabric",
    fabric_width: parseWidth(row.width_cm),
    cost_price: parsePrice(row.roll_price_eur),
    selling_price: parsePrice(row.sell_price_eur),
    vendor_id: vendorId,
    pricing_method: "per_meter" as const,
    quantity: 0,
  };
}

function mapCNVTrimmings(row: Record<string, string>, vendorId: string) {
  const name = row.product_type;
  if (!name) return null;

  return {
    user_id: TARGET_USER_ID,
    name: `${name} (${row.product_code})`,
    sku: row.product_code,
    category: "hardware",
    subcategory: "accessories",
    cost_price: parsePrice(row.purchase_price_eur),
    selling_price: parsePrice(row.sell_price_eur),
    vendor_id: vendorId,
    pricing_method: row.unit === "M" ? "per_meter" as const : "per_unit" as const,
    unit: row.unit === "M" ? "meters" : "units",
    quantity: 0,
  };
}

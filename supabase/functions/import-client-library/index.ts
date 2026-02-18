import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

// Default fallback for backward compatibility
const DEFAULT_USER_ID = "4eebf4ef-bc13-4e57-b120-32a0ca281932";

interface ImportResult {
  created: number;
  updated: number;
  skipped: number;
  errors: string[];
  collections_created: string[];
  vendors_created: string[];
}

// Collection cache to avoid repeated lookups (reset per request via closure)
let collectionCache = new Map<string, string>();
let activeUserId = DEFAULT_USER_ID;

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

    // Accept user_id from request body, fall back to default
    activeUserId = body.user_id || DEFAULT_USER_ID;
    // Reset collection cache per request
    collectionCache = new Map<string, string>();

    // Upload mode: store CSV data to storage for later import
    if (action === "upload") {
      if (!format || !csv_data) {
        return new Response(JSON.stringify({ error: "Missing format or csv_data for upload" }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } });
      }
      const path = `${format}.csv`;
      
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

    console.log(`Processing ${rows.length} rows in format: ${format} for user: ${activeUserId}`);

    // For spanish_suppliers and maslina, vendor is determined per-row or in mapper
    let vendorId: string | undefined;
    if (format !== "spanish_suppliers" && format !== "maslina" && format !== "mydeco" && format !== "radpol_fabrics" && format !== "radpol_haberdashery" && format !== "laela_selected_samples" && format !== "ridex" && format !== "ifi_tekstile") {
      const vendorName = format === "cnv_trimmings" ? "CNV" 
        : format === "eurofirany" ? "EUROFIRANY" 
        : format === "iks_forma" ? "IKS FORMA"
        : "DATEKS";
      vendorId = await ensureVendor(supabase, vendorName);
    }

    // Cache vendor IDs for spanish_suppliers (per-row lookup)
    const vendorCache = new Map<string, string>();

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
            item = await mapExpo2024(supabase, row, vendorId!);
          } else if (format === "dateks_pricelist_2023") {
            item = await mapPricelist2023(supabase, row, vendorId!);
          } else if (format === "cnv_trimmings") {
            item = mapCNVTrimmings(row, vendorId!);
          } else if (format === "eurofirany") {
            item = await mapEurofirany(supabase, row, vendorId!);
          } else if (format === "iks_forma") {
            item = await mapIksForma(supabase, row, vendorId!);
          } else if (format === "spanish_suppliers") {
            item = await mapSpanishSuppliers(supabase, row, vendorCache);
          } else if (format === "maslina") {
            item = await mapMaslina(supabase, row, vendorCache);
          } else if (format === "mydeco") {
            item = await mapMydeco(supabase, row, vendorCache);
          } else if (format === "radpol_fabrics") {
            item = await mapRadpolFabrics(supabase, row, vendorCache);
          } else if (format === "radpol_haberdashery") {
            item = await mapRadpolHaberdashery(supabase, row, vendorCache);
          } else if (format === "laela_selected_samples") {
            item = await mapLaelaSelectedSamples(supabase, row, vendorCache);
          } else if (format === "ridex") {
            item = await mapRidex(supabase, row, vendorCache);
          } else if (format === "ifi_tekstile") {
            item = await mapIfiTekstile(supabase, row, vendorCache);
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
          .eq("user_id", activeUserId)
          .eq("sku", item.sku)
          .maybeSingle();

        if (existing) {
          // Update ALL mapped fields including fabric-specific ones
          const updateData: Record<string, any> = {
            name: item.name,
            cost_price: item.cost_price,
            selling_price: item.selling_price,
            fabric_width: item.fabric_width,
            tags: item.tags,
            collection_name: item.collection_name,
            collection_id: item.collection_id,
            compatible_treatments: item.compatible_treatments,
            product_category: item.product_category,
            subcategory: item.subcategory,
            pricing_method: item.pricing_method,
            vendor_id: item.vendor_id,
          };
          // Conditionally include optional fields
          if (item.fabric_composition) updateData.fabric_composition = item.fabric_composition;
          if (item.fire_rating) updateData.fire_rating = item.fire_rating;
          if (item.description) updateData.description = item.description;
          if (item.pattern_repeat_vertical) updateData.pattern_repeat_vertical = item.pattern_repeat_vertical;
          if (item.pattern_repeat_horizontal) updateData.pattern_repeat_horizontal = item.pattern_repeat_horizontal;
          if (item.color) updateData.color = item.color;
          if (item.specifications) updateData.specifications = item.specifications;

          const { error } = await supabase
            .from("enhanced_inventory_items")
            .update(updateData)
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
    .eq("user_id", activeUserId)
    .eq("name", name)
    .maybeSingle();

  if (existing) return existing.id;

  const { data, error } = await supabase
    .from("vendors")
    .insert({ user_id: activeUserId, name, active: true })
    .select("id")
    .single();

  if (error) throw new Error(`Vendor create failed: ${error.message}`);
  return data.id;
}

async function ensureCollection(supabase: any, name: string, vendorId?: string): Promise<string> {
  const key = name.toUpperCase().trim();
  if (!key) throw new Error("Empty collection name");
  if (collectionCache.has(key)) return collectionCache.get(key)!;

  const { data: existing } = await supabase
    .from("collections")
    .select("id, vendor_id")
    .eq("user_id", activeUserId)
    .eq("name", key)
    .maybeSingle();

  if (existing) {
    // Backfill vendor_id if missing and we have one
    if (vendorId && !existing.vendor_id) {
      await supabase.from("collections").update({ vendor_id: vendorId }).eq("id", existing.id);
    }
    collectionCache.set(key, existing.id);
    return existing.id;
  }

  const insertData: Record<string, any> = { user_id: activeUserId, name: key, active: true };
  if (vendorId) insertData.vendor_id = vendorId;

  const { data, error } = await supabase
    .from("collections")
    .insert(insertData)
    .select("id")
    .single();

  if (error) throw new Error(`Collection create failed for ${key}: ${error.message}`);
  collectionCache.set(key, data.id);
  return data.id;
}

/**
 * Improved collection extraction with multiple fallback strategies:
 * 1. "FABRIC / KNYGA COLLECTION" pattern
 * 2. "FABRIC / COLLECTION" pattern  
 * 3. For design fields: first word group as collection name
 */
function extractCollection(fabricName: string): string | null {
  if (!fabricName) return null;
  
  // Pattern 1: "FABRIC / KNYGA COLLECTION" or "FABRIC / KN. COLLECTION"
  const knygaMatch = fabricName.match(/\/\s*(?:KNYGA|KN\.?)\s+(.+)/i);
  if (knygaMatch) return knygaMatch[1].trim().toUpperCase();

  // Pattern 2: "FABRIC / COLLECTION" (slash separator)
  const slashMatch = fabricName.match(/\/\s*(.+)/);
  if (slashMatch) return slashMatch[1].trim().toUpperCase();

  return null;
}

/**
 * Extract collection from design/name fields for pricelist items
 * that don't have the KNYGA/slash pattern.
 * Takes the first word or word group before common separators.
 */
function extractCollectionFromDesign(design: string): string | null {
  if (!design) return null;
  
  // If it contains a slash, use existing extraction
  if (design.includes("/")) {
    return extractCollection(design);
  }
  
  // Take the first meaningful word as collection
  // e.g., "AURORA 123" -> "AURORA", "BELLA VISTA 45" -> "BELLA VISTA"
  const cleaned = design.trim().toUpperCase();
  
  // Remove trailing numbers/codes
  const match = cleaned.match(/^([A-ZĄ-Ža-ząčęėįšųūž\s]+?)(?:\s+\d|\s*$)/i);
  if (match && match[1].trim().length >= 3) {
    return match[1].trim();
  }
  
  // Fallback: just use the first word if it's at least 3 chars
  const firstWord = cleaned.split(/[\s\d]/)[0];
  if (firstWord && firstWord.length >= 3) {
    return firstWord;
  }

  return null;
}

function parseWidth(widthStr: string): number | null {
  if (!widthStr) return null;
  const match = widthStr.match(/(\d+)/);
  return match ? parseInt(match[1]) : null;
}

function parsePrice(priceStr: string): number {
  if (!priceStr) return 0;
  const num = parseFloat(priceStr);
  return isNaN(num) ? 0 : Math.round(num * 100) / 100;
}

/** Ensure selling_price falls back to cost_price if zero.
 *  Returns { price, needsPricing } to tag items that need user attention. */
function withPriceFallback(costPrice: number, sellingPrice: number): number {
  return sellingPrice > 0 ? sellingPrice : costPrice;
}

/** Check if an item needs pricing attention (selling = cost, no margin) */
function itemNeedsPricing(costPrice: number, sellingPrice: number): boolean {
  return sellingPrice <= 0 || (costPrice > 0 && Math.abs(sellingPrice - costPrice) < 0.01);
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

  const costPrice = parsePrice(row.roll_price_eur);
  const sellingPrice = withPriceFallback(costPrice, parsePrice(row.sell_cut_price_eur));

  // Try collection extraction with improved fallbacks
  let collectionName = extractCollection(name);
  if (!collectionName) {
    collectionName = extractCollectionFromDesign(name);
  }

  let collectionId: string | undefined;
  if (collectionName) {
    try {
      collectionId = await ensureCollection(supabase, collectionName, vendorId);
    } catch (e) {
      console.warn(`Collection error for ${collectionName}:`, e.message);
    }
  }

  return {
    user_id: activeUserId,
    name,
    sku,
    category: "fabric",
    subcategory: "curtain_fabric",
    fabric_width: parseWidth(row.width_cm),
    cost_price: costPrice,
    selling_price: sellingPrice,
    vendor_id: vendorId,
    pricing_method: "per_meter" as const,
    quantity: 0,
    tags: tags.length > 0 ? tags : undefined,
    collection_name: collectionName || undefined,
    collection_id: collectionId || undefined,
    compatible_treatments: ["curtains"],
    product_category: "curtains",
  };
}

async function mapPricelist2023(supabase: any, row: Record<string, string>, vendorId: string) {
  const name = row.design;
  if (!name) return null;

  const sku = `DATEKS-${row.catalog_nr}`;
  const costPrice = parsePrice(row.roll_price_eur);
  const sellingPrice = withPriceFallback(costPrice, parsePrice(row.sell_price_eur));

  // Extract collection from design field
  let collectionName = extractCollection(name);
  if (!collectionName) {
    collectionName = extractCollectionFromDesign(name);
  }

  let collectionId: string | undefined;
  if (collectionName) {
    try {
      collectionId = await ensureCollection(supabase, collectionName, vendorId);
    } catch (e) {
      console.warn(`Collection error for ${collectionName}:`, e.message);
    }
  }

  return {
    user_id: activeUserId,
    name,
    sku,
    category: "fabric",
    subcategory: "curtain_fabric",
    fabric_width: parseWidth(row.width_cm),
    cost_price: costPrice,
    selling_price: sellingPrice,
    vendor_id: vendorId,
    pricing_method: "per_meter" as const,
    quantity: 0,
    collection_name: collectionName || undefined,
    collection_id: collectionId || undefined,
    compatible_treatments: ["curtains"],
    product_category: "curtains",
  };
}

function mapCNVTrimmings(row: Record<string, string>, vendorId: string) {
  const name = row.product_type;
  if (!name) return null;

  const costPrice = parsePrice(row.purchase_price_eur);
  const sellingPrice = withPriceFallback(costPrice, parsePrice(row.sell_price_eur));

  return {
    user_id: activeUserId,
    name: `${name} (${row.product_code})`,
    sku: row.product_code,
    category: "hardware",
    subcategory: "accessories",
    cost_price: costPrice,
    selling_price: sellingPrice,
    vendor_id: vendorId,
    pricing_method: row.unit === "M" ? "per_meter" as const : "per_unit" as const,
    unit: row.unit === "M" ? "meters" : "units",
    quantity: 0,
    // Hardware items: no curtain-specific metadata
  };
}

async function mapEurofirany(supabase: any, row: Record<string, string>, vendorId: string) {
  const productCode = row.product_code;
  const productName = row.product_name;
  if (!productCode || !productName) return null;

  const sku = `EURO-${productCode}`;
  const costPrice = parsePrice(row.wholesale_price_eur);
  const sellingPrice = withPriceFallback(costPrice, 0); // No retail price in file

  // Parse width from type_size (e.g., "320/1390" -> 320)
  const fabricWidth = parseWidth(row.type_size);

  // Collection from brand_collection field
  const collectionName = row.brand_collection?.trim().toUpperCase() || null;
  let collectionId: string | undefined;
  if (collectionName) {
    try {
      collectionId = await ensureCollection(supabase, collectionName, vendorId);
    } catch (e) {
      console.warn(`Collection error for ${collectionName}:`, e.message);
    }
  }

  const tags: string[] = [];
  if (itemNeedsPricing(costPrice, sellingPrice)) tags.push("needs_pricing");

  return {
    user_id: activeUserId,
    name: productName,
    sku,
    category: "fabric",
    subcategory: "curtain_fabric",
    fabric_width: fabricWidth,
    cost_price: costPrice,
    selling_price: sellingPrice,
    vendor_id: vendorId,
    pricing_method: "per_meter" as const,
    quantity: 0,
    collection_name: collectionName || undefined,
    collection_id: collectionId || undefined,
    compatible_treatments: ["curtains"],
    product_category: "curtains",
    ...(tags.length > 0 ? { tags } : {}),
  };
}

function mapIksFormaSubcategory(subcategory: string): string {
  const s = subcategory.trim().toLowerCase();
  if (s === "lazdos" || s === "rifliuotos lazdos") return "rod";
  if (s === "bėgeliai" || s === "begeliai") return "track";
  if (s === "laikikliai") return "bracket";
  // Everything else: antgaliai, lazdelės, trimmings, tiebacks, tassels
  return "accessory";
}

async function mapIksForma(supabase: any, row: Record<string, string>, vendorId: string) {
  const productCode = row.product_code;
  const productName = row.product_name;
  if (!productCode || !productName) return null;

  const sku = `IKS-${productCode}`;
  const color = row.color?.trim() || "";
  const name = color ? `${productName} - ${color}` : productName;

  const costPrice = parsePrice(row.purchase_price_eur);
  const sellingPrice = withPriceFallback(costPrice, 0);

  const subcategory = mapIksFormaSubcategory(row.subcategory || "");
  const pricingMethod = (row.unit?.trim().toUpperCase() === "M") ? "per_meter" as const : "per_unit" as const;

  // Collection from product_group
  const collectionName = row.product_group?.trim().toUpperCase() || null;
  let collectionId: string | undefined;
  if (collectionName) {
    try {
      collectionId = await ensureCollection(supabase, collectionName, vendorId);
    } catch (e) {
      console.warn(`Collection error for ${collectionName}:`, e.message);
    }
  }

  const tags: string[] = [];
  if (color) tags.push(`color:${color}`);
  if (itemNeedsPricing(costPrice, sellingPrice)) tags.push("needs_pricing");

  return {
    user_id: activeUserId,
    name,
    sku,
    category: "hardware",
    subcategory,
    cost_price: costPrice,
    selling_price: sellingPrice,
    vendor_id: vendorId,
    pricing_method: pricingMethod,
    quantity: 0,
    tags: tags.length > 0 ? tags : undefined,
    collection_name: collectionName || undefined,
    collection_id: collectionId || undefined,
    compatible_treatments: ["curtains"],
    product_category: "curtains",
  };
}

// --- MASLINA (Turkey) ---

async function mapMaslina(
  supabase: any,
  row: Record<string, string>,
  vendorCache: Map<string, string>
) {
  const name = row["name"]?.trim();
  if (!name) return null;

  // Get or create MASLINA vendor
  const vendorKey = "MASLINA";
  let maslinaVendorId = vendorCache.get(vendorKey);
  if (!maslinaVendorId) {
    maslinaVendorId = await ensureVendor(supabase, vendorKey);
    vendorCache.set(vendorKey, maslinaVendorId);
  }

  const sku = `MAS-${normalizeSku(name)}`;
  const costPrice = parsePrice(row["cut_price_eur"]);
  const sellingPrice = costPrice; // Only cut price available

  // Auto-detect type from name for description
  const upperName = name.toUpperCase();
  let description = "";
  if (upperName.includes("BLACKOUT")) description = "Blackout";
  else if (upperName.includes("DIMOUT")) description = "Dimout";
  else if (upperName.includes("GREK")) description = "Greek pattern";

  // Single collection for all MASLINA items
  let collectionId: string | undefined;
  try {
    collectionId = await ensureCollection(supabase, "MASLINA", maslinaVendorId);
  } catch (e) {
    console.warn(`Collection error for MASLINA:`, e.message);
  }

  const tags: string[] = [];
  if (itemNeedsPricing(costPrice, sellingPrice)) tags.push("needs_pricing");

  return {
    user_id: activeUserId,
    name,
    sku,
    category: "fabric",
    subcategory: "curtain_fabric",
    fabric_width: parseWidth(row["width_cm"]),
    cost_price: costPrice,
    selling_price: sellingPrice,
    vendor_id: maslinaVendorId,
    pricing_method: "per_meter" as const,
    quantity: 0,
    description: description || undefined,
    collection_name: "MASLINA",
    collection_id: collectionId || undefined,
    compatible_treatments: ["curtains"],
    product_category: "curtains",
    ...(tags.length > 0 ? { tags } : {}),
  };
}

// --- Spanish Suppliers (DABEDAN, RIOMA, TARIFA STOCK) ---

function getSupplierPrefix(supplier: string): string {
  const s = supplier.trim().toUpperCase();
  if (s.startsWith("DABEDAN")) return "DAB";
  if (s.startsWith("RIOMA")) return "RIO";
  if (s.startsWith("TARIFA")) return "TAR";
  return "ESP";
}

function normalizeSku(name: string): string {
  return name.trim().toUpperCase()
    .replace(/[^A-Z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .substring(0, 40);
}

async function mapSpanishSuppliers(
  supabase: any,
  row: Record<string, string>,
  vendorCache: Map<string, string>
) {
  const supplier = row["Supplier"]?.trim();
  const productName = row["Product Name"]?.trim();
  if (!supplier || !productName) return null;

  // Skip header-like rows (e.g. "CONTRACT COLLECTION")
  const category = row["Category"]?.trim() || "";
  const width = row["Width (cm)"]?.trim() || "";
  if (!width && !category) return null;

  // Get or create vendor
  const supplierKey = supplier.toUpperCase();
  let rowVendorId = vendorCache.get(supplierKey);
  if (!rowVendorId) {
    rowVendorId = await ensureVendor(supabase, supplierKey);
    vendorCache.set(supplierKey, rowVendorId);
  }

  const prefix = getSupplierPrefix(supplier);
  // For TARIFA STOCK items with same name but different finish/width, include category+width in SKU
  const skuSuffix = supplier.startsWith("TARIFA") && category
    ? `${normalizeSku(productName)}-${normalizeSku(category)}-${width}`
    : normalizeSku(productName);
  const sku = `${prefix}-${skuSuffix}`;

  const costPrice = parsePrice(row["Price - Roll (EUR/m)"]);
  const cutPrice = parsePrice(row["Price - Cut Length (EUR/m)"]);
  const sellingPrice = withPriceFallback(costPrice, cutPrice);

  const composition = row["Composition"]?.trim() || "";
  const weight = row["Weight (g/m2)"]?.trim() || "";
  const martindale = row["Martindale"]?.trim() || "";
  const fireRating = row["Fire Rating"]?.trim() || "";
  const remarks = row["Remarks/Finish"]?.trim() || "";

  const tags: string[] = [];
  if (category) tags.push(`category:${category}`);
  if (weight) tags.push(`weight:${weight}`);
  if (martindale) tags.push(`martindale:${martindale}`);

  // Collection: use Category as collection name (vendor is linked separately)
  const collectionName = category
    ? category.toUpperCase()
    : "GENERAL";

  let collectionId: string | undefined;
  try {
    collectionId = await ensureCollection(supabase, collectionName, rowVendorId);
  } catch (e) {
    console.warn(`Collection error for ${collectionName}:`, e.message);
  }

  return {
    user_id: activeUserId,
    name: productName,
    sku,
    category: "fabric",
    subcategory: "curtain_fabric",
    fabric_width: parseWidth(width),
    fabric_composition: composition || undefined,
    fire_rating: fireRating || undefined,
    description: remarks || undefined,
    cost_price: costPrice,
    selling_price: sellingPrice,
    vendor_id: rowVendorId,
    pricing_method: "per_meter" as const,
    quantity: 0,
    tags: tags.length > 0 ? tags : undefined,
    collection_name: collectionName,
    collection_id: collectionId || undefined,
    compatible_treatments: ["curtains"],
    product_category: "curtains",
  };
}

// --- MYDECO (BARGELD) Hardware ---

function mapMydecoSubcategory(category: string): string {
  const c = category.trim().toLowerCase();
  if (c.includes("rod") || c.includes("vamzd")) return "rod";
  if (c.includes("track") || c.includes("bėgel") || c.includes("profil")) return "track";
  if (c.includes("double bracket") || c.includes("dvigub")) return "bracket";
  if (c.includes("bracket") || c.includes("laikik")) return "bracket";
  if (c.includes("ceiling")) return "bracket";
  if (c.includes("side bracket") || c.includes("šonin")) return "bracket";
  if (c.includes("finial") || c.includes("antgal")) return "accessory";
  if (c.includes("glider") || c.includes("hook") || c.includes("segtu") || c.includes("žied")) return "accessory";
  if (c.includes("draw rod") || c.includes("atitrauk")) return "accessory";
  if (c.includes("corner") || c.includes("kamp")) return "accessory";
  if (c.includes("extension") || c.includes("prailg")) return "accessory";
  if (c.includes("fixator")) return "accessory";
  return "accessory";
}

async function mapMydeco(
  supabase: any,
  row: Record<string, string>,
  vendorCache: Map<string, string>
) {
  const artNr = row["art_nr"]?.trim();
  const productName = row["product_name"]?.trim();
  if (!artNr || !productName) return null;

  // Get or create MYDECO vendor
  const vendorKey = "MYDECO";
  let mydecoVendorId = vendorCache.get(vendorKey);
  if (!mydecoVendorId) {
    mydecoVendorId = await ensureVendor(supabase, vendorKey);
    vendorCache.set(vendorKey, mydecoVendorId);
  }

  const sku = `MYD-${artNr}`;
  const costPrice = parsePrice(row["net_price_eur"]);
  const grossPrice = parsePrice(row["gross_price_eur"]);
  const sellingPrice = grossPrice > 0 ? grossPrice : costPrice;

  const category = row["category"]?.trim() || "";
  const colorFinish = row["color_finish"]?.trim() || "";
  const subcategory = mapMydecoSubcategory(category);

  const tags: string[] = [];
  if (colorFinish) tags.push(`color:${colorFinish}`);
  if (category) tags.push(`hw_type:${category}`);

  // Collection based on system size (no vendor prefix — vendor linked via vendor_id)
  let collectionName = "20MM";
  if (productName.startsWith("18x18") || productName.includes("18x18")) {
    collectionName = "18X18MM";
  } else if (productName.startsWith("25mm") || productName.includes("25mm")) {
    collectionName = "25MM";
  }

  let collectionId: string | undefined;
  try {
    collectionId = await ensureCollection(supabase, collectionName, mydecoVendorId);
  } catch (e) {
    console.warn(`Collection error for ${collectionName}:`, e.message);
  }

  return {
    user_id: activeUserId,
    name: productName,
    sku,
    category: "hardware",
    subcategory,
    cost_price: costPrice,
    selling_price: sellingPrice,
    vendor_id: mydecoVendorId,
    pricing_method: "per_unit" as const,
    quantity: 0,
    tags: tags.length > 0 ? tags : undefined,
    collection_name: collectionName,
    collection_id: collectionId || undefined,
    compatible_treatments: ["curtains"],
    product_category: "curtains",
  };
}

// --- RAD-POL Fabrics ---

function mapRadpolSubcategory(category: string): string {
  const c = category.trim().toLowerCase();
  if (c.includes("sheer") || c.includes("voile")) return "sheer_fabric";
  if (c.includes("lining") || c.includes("antislip")) return "lining_fabric";
  if (c.includes("blackout")) return "curtain_fabric";
  if (c.includes("dimout")) return "curtain_fabric";
  if (c.includes("outdoor")) return "curtain_fabric";
  if (c.includes("upholstery")) return "upholstery_fabric";
  if (c.includes("taffeta")) return "curtain_fabric";
  if (c.includes("cafe curtain")) return "curtain_fabric";
  if (c.includes("tablecloth") || c.includes("runner") || c.includes("cushion")) return "curtain_fabric";
  return "curtain_fabric";
}

async function mapRadpolFabrics(
  supabase: any,
  row: Record<string, string>,
  vendorCache: Map<string, string>
) {
  const article = row["article"]?.trim();
  if (!article) return null;

  // Get or create RAD-POL vendor
  const vendorKey = "RAD-POL";
  let radpolVendorId = vendorCache.get(vendorKey);
  if (!radpolVendorId) {
    radpolVendorId = await ensureVendor(supabase, vendorKey);
    vendorCache.set(vendorKey, radpolVendorId);
  }

  // Clean name: strip "(DISCOUNT)" for display
  let displayName = article;
  const tags: string[] = [];
  if (article.toUpperCase().includes("(DISCOUNT)")) {
    displayName = article.replace(/\s*\(DISCOUNT\)\s*/gi, "").trim();
    tags.push("discount");
  }

  const sku = `RAD-${normalizeSku(displayName)}`;
  const category = row["category"]?.trim() || "";
  const notes = row["notes"]?.trim() || "";

  // Parse prices - handle "Roll only"
  const cutPriceStr = row["cut_price_eur"]?.trim() || "";
  const rollPrice = parsePrice(row["roll_price_eur"]);
  const isRollOnly = cutPriceStr.toLowerCase() === "roll only" || cutPriceStr === "";
  const cutPrice = isRollOnly ? rollPrice : parsePrice(cutPriceStr);

  const costPrice = rollPrice;
  const sellingPrice = cutPrice > 0 ? cutPrice : rollPrice;

  // Extract tags from notes
  if (notes.toLowerCase().includes("fire retardant") || notes.toLowerCase().includes("fr")) {
    tags.push("fire-retardant");
  }
  if (notes.toLowerCase().includes("discount")) {
    if (!tags.includes("discount")) tags.push("discount");
  }
  if (isRollOnly) tags.push("roll-only");

  // Category tag
  if (category) tags.push(`type:${category}`);

  const subcategory = mapRadpolSubcategory(category);

  // Collection for RAD-POL fabrics (use subcategory as collection name)
  const rpCollName = category ? category.toUpperCase() : "FABRICS";
  let collectionId: string | undefined;
  try {
    collectionId = await ensureCollection(supabase, rpCollName, radpolVendorId);
  } catch (e) {
    console.warn(`Collection error for ${rpCollName}:`, e.message);
  }

  return {
    user_id: activeUserId,
    name: displayName,
    sku,
    category: "fabric",
    subcategory,
    fabric_width: parseWidth(row["width_cm"]),
    cost_price: costPrice,
    selling_price: sellingPrice,
    vendor_id: radpolVendorId,
    pricing_method: "per_meter" as const,
    quantity: 0,
    description: category || undefined,
    tags: tags.length > 0 ? tags : undefined,
    collection_name: "RAD-POL",
    collection_id: collectionId || undefined,
    compatible_treatments: ["curtains"],
    product_category: "curtains",
    ...(notes.toLowerCase().includes("fire retardant") ? { fire_rating: "FR" } : {}),
  };
}

// --- RAD-POL Haberdashery ---

async function mapRadpolHaberdashery(
  supabase: any,
  row: Record<string, string>,
  vendorCache: Map<string, string>
) {
  const articleName = row["article_name"]?.trim();
  if (!articleName) return null;

  // Get or create RAD-POL vendor
  const vendorKey = "RAD-POL";
  let radpolVendorId = vendorCache.get(vendorKey);
  if (!radpolVendorId) {
    radpolVendorId = await ensureVendor(supabase, vendorKey);
    vendorCache.set(vendorKey, radpolVendorId);
  }

  const sku = `RAD-H-${normalizeSku(articleName)}`;
  const articleType = row["article_type"]?.trim() || "";
  const composition = row["composition"]?.trim() || "";
  const unit = row["unit"]?.trim().toLowerCase() || "";
  const categoryField = row["category"]?.trim() || "";

  // Parse prices
  const couponPrice = parsePrice(row["coupon_price_eur"]);
  const packagePrice = parsePrice(row["package_price_eur"]);
  const costPrice = packagePrice > 0 ? packagePrice : couponPrice;
  const sellingPrice = couponPrice > 0 ? couponPrice : packagePrice;

  // Pricing method from unit
  let pricingMethod: "per_meter" | "per_unit" = "per_unit";
  if (unit === "lm" || unit === "mb") {
    pricingMethod = "per_meter";
  }

  // Collection from Category (no vendor prefix — vendor linked via vendor_id)
  const collectionName = categoryField
    ? categoryField.toUpperCase()
    : "HABERDASHERY";

  let collectionId: string | undefined;
  try {
    collectionId = await ensureCollection(supabase, collectionName, radpolVendorId);
  } catch (e) {
    console.warn(`Collection error for ${collectionName}:`, e.message);
  }

  const tags: string[] = [];
  if (articleType) tags.push(`type:${articleType}`);
  if (categoryField) tags.push(`group:${categoryField}`);

  // Name: combine article name with type for clarity
  const displayName = articleType
    ? `${articleName} (${articleType})`
    : articleName;

  return {
    user_id: activeUserId,
    name: displayName,
    sku,
    category: "hardware",
    subcategory: "accessory",
    cost_price: costPrice,
    selling_price: sellingPrice,
    vendor_id: radpolVendorId,
    pricing_method: pricingMethod,
    quantity: 0,
    description: articleType || undefined,
    fabric_composition: composition || undefined,
    tags: tags.length > 0 ? tags : undefined,
    collection_name: collectionName,
    collection_id: collectionId || undefined,
  };
}

// --- LAELA Selected Samples ---

function parseRepeatCm(repeatStr: string): number {
  if (!repeatStr) return 0;
  // "vert.repeat 0" or "horiz.repeat 0" -> 0
  const zeroMatch = repeatStr.match(/repeat\s+0$/i);
  if (zeroMatch) return 0;
  // "vert.repeat 101cm-39.5"" or "horiz.repeat 64,5cm-25"" -> extract cm number
  const cmMatch = repeatStr.match(/repeat\s+(\d+[.,]?\d*)cm/i);
  if (cmMatch) {
    return Math.round(parseFloat(cmMatch[1].replace(",", ".")));
  }
  // "vert.repeat 4cm-1.5"" 
  const shortMatch = repeatStr.match(/(\d+[.,]?\d*)\s*cm/i);
  if (shortMatch) {
    return Math.round(parseFloat(shortMatch[1].replace(",", ".")));
  }
  return 0;
}

function capitalizeWords(str: string): string {
  return str.split(" ").map(w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()).join(" ");
}

async function mapLaelaSelectedSamples(
  supabase: any,
  row: Record<string, string>,
  vendorCache: Map<string, string>
) {
  const article = row["article"]?.trim();
  const name = row["name"]?.trim();
  if (!article || !name) return null;

  // Get or create LAELA vendor
  const vendorKey = "LAELA";
  let laelaVendorId = vendorCache.get(vendorKey);
  if (!laelaVendorId) {
    laelaVendorId = await ensureVendor(supabase, vendorKey);
    vendorCache.set(vendorKey, laelaVendorId);
  }

  const sku = `LAELA-${article}`;
  const displayName = capitalizeWords(name);
  const cutPrice = parsePrice(row["cut_price_eur"]);
  const widthCm = parseInt(row["width_cm"] || "0") || null;
  const composition = row["composition"]?.trim() || "";
  const direction = row["direction"]?.trim() || "";
  const vertRepeat = parseRepeatCm(row["vert_repeat"] || "");
  const horizRepeat = parseRepeatCm(row["horiz_repeat"] || "");
  const weightKgMt = parseFloat(row["weight_kg_mt"] || "0") || 0;
  const comments = row["comments"]?.trim() || "";

  // Weight-based subcategory
  const subcategory = weightKgMt < 0.30 ? "sheer_fabric" : "curtain_fabric";

  // Collection from hanger description (no vendor prefix — vendor linked via vendor_id)
  const collectionRaw = row["collection"]?.trim() || "";
  const collectionName = collectionRaw ? collectionRaw.toUpperCase() : "GENERAL";

  let collectionId: string | undefined;
  try {
    collectionId = await ensureCollection(supabase, collectionName, laelaVendorId);
  } catch (e) {
    console.warn(`Collection error for ${collectionName}:`, e.message);
  }

  // Build description from direction + weight
  const descParts: string[] = [];
  if (direction) descParts.push(direction);
  if (weightKgMt > 0) descParts.push(`weight: ${weightKgMt} kg/mt`);
  if (comments && comments !== ".") descParts.push(comments);

  const tags: string[] = [];
  if (itemNeedsPricing(cutPrice, cutPrice)) tags.push("needs_pricing");

  return {
    user_id: activeUserId,
    name: displayName,
    sku,
    category: "fabric",
    subcategory,
    fabric_width: widthCm,
    cost_price: cutPrice,
    selling_price: cutPrice,
    vendor_id: laelaVendorId,
    pricing_method: "per_meter" as const,
    quantity: 0,
    fabric_composition: composition || undefined,
    description: descParts.length > 0 ? descParts.join("; ") : undefined,
    pattern_repeat_vertical: vertRepeat || undefined,
    pattern_repeat_horizontal: horizRepeat || undefined,
    collection_name: collectionName,
    collection_id: collectionId || undefined,
    compatible_treatments: ["curtains"],
    product_category: "curtains",
    specifications: weightKgMt > 0 ? { weight_kg_mt: weightKgMt } : undefined,
    ...(tags.length > 0 ? { tags } : {}),
  };
}

// --- RIDEX ---

function detectRidexTags(name: string, csvTags: string): string[] {
  const tags: string[] = [];
  const upper = name.toUpperCase();
  
  // From CSV tags column (semicolon-separated)
  if (csvTags) {
    csvTags.split(";").forEach(t => {
      const tag = t.trim();
      if (tag && !tags.includes(tag)) tags.push(tag);
    });
  }
  
  // Auto-detect from name
  if (upper.includes("BLACKOUT") && !tags.includes("blackout")) tags.push("blackout");
  if (upper.includes("DIMOUT") && !tags.includes("dimout")) tags.push("dimout");
  if (upper.includes("VELVET") && !tags.includes("velvet")) tags.push("velvet");
  if (upper.includes("VELLUTI") && !tags.includes("velvet")) tags.push("velvet");
  if (upper.endsWith(" FR") || upper.includes(" FR ")) {
    if (!tags.includes("fire-retardant")) tags.push("fire-retardant");
  }
  
  return tags;
}

function detectRidexSubcategory(name: string): string {
  const upper = name.toUpperCase();
  if (upper.includes("WOAL") || upper.includes("WHITE")) return "sheer_fabric";
  return "curtain_fabric";
}

async function mapRidex(
  supabase: any,
  row: Record<string, string>,
  vendorCache: Map<string, string>
) {
  const name = row["name"]?.trim();
  if (!name) return null;

  // Get or create RIDEX vendor
  const vendorKey = "RIDEX";
  let ridexVendorId = vendorCache.get(vendorKey);
  if (!ridexVendorId) {
    ridexVendorId = await ensureVendor(supabase, vendorKey);
    vendorCache.set(vendorKey, ridexVendorId);
  }

  const sku = `RDX-${normalizeSku(name)}`;
  const cutPrice = parsePrice(row["cut_price_eur"]);
  const rollPrice = parsePrice(row["roll_price_eur"]);
  const costPrice = rollPrice > 0 ? rollPrice : cutPrice;
  const sellingPrice = cutPrice;
  const widthCm = parseInt(row["width_cm"] || "0") || null;
  const csvTags = row["tags"]?.trim() || "";

  const tags = detectRidexTags(name, csvTags);
  const subcategory = detectRidexSubcategory(name);

  // Single collection for all RIDEX items
  let collectionId: string | undefined;
  try {
    collectionId = await ensureCollection(supabase, "RIDEX 2025", ridexVendorId);
  } catch (e) {
    console.warn("Collection error for RIDEX 2025:", e.message);
  }

  return {
    user_id: activeUserId,
    name,
    sku,
    category: "fabric",
    subcategory,
    fabric_width: widthCm,
    cost_price: costPrice,
    selling_price: sellingPrice,
    vendor_id: ridexVendorId,
    pricing_method: "per_meter" as const,
    quantity: 0,
    tags: tags.length > 0 ? tags : undefined,
    collection_name: "RIDEX 2025",
    collection_id: collectionId || undefined,
    compatible_treatments: ["curtains"],
    product_category: "curtains",
    ...(tags.includes("fire-retardant") ? { fire_rating: "FR" } : {}),
  };
}

// --- IFI TEKSTILE ---

function cleanIfiCollectionName(raw: string): string {
  // Strip prefixes like "HANGER ", "WATERFALL ", "BOOK "
  return raw.replace(/^(HANGER|WATERFALL|BOOK)\s+/i, "").trim();
}

async function mapIfiTekstile(
  supabase: any,
  row: Record<string, string>,
  vendorCache: Map<string, string>
) {
  const article = row["article"]?.trim();
  const name = row["name"]?.trim();
  if (!article || !name) return null;

  // Get or create IFI TEKSTILE vendor
  const vendorKey = "IFI TEKSTILE";
  let vendorId = vendorCache.get(vendorKey);
  if (!vendorId) {
    vendorId = await ensureVendor(supabase, vendorKey);
    vendorCache.set(vendorKey, vendorId);
  }

  const sku = `IFI-${article}`;
  const displayName = capitalizeWords(name);
  const price = parsePrice(row["price_eur"]);
  const widthCm = parseInt(row["width_cm"] || "0") || null;
  const composition = row["composition"]?.trim() || "";
  const direction = row["direction"]?.trim() || "";
  const vertRepeat = parseRepeatCm(row["vert_repeat"] || "");
  const horizRepeat = parseRepeatCm(row["horiz_repeat"] || "");

  // Collection: strip prefix (no vendor prefix — vendor linked via vendor_id)
  const collectionRaw = row["collection"]?.trim() || "";
  const cleanedCollection = cleanIfiCollectionName(collectionRaw);
  const collectionName = cleanedCollection ? cleanedCollection.toUpperCase() : "GENERAL";

  let collectionId: string | undefined;
  try {
    collectionId = await ensureCollection(supabase, collectionName, vendorId);
  } catch (e) {
    console.warn(`Collection error for ${collectionName}:`, e.message);
  }

  // Build description from direction
  const descParts: string[] = [];
  if (direction) descParts.push(direction);

  const tags: string[] = [];
  if (itemNeedsPricing(price, price)) tags.push("needs_pricing");

  return {
    user_id: activeUserId,
    name: displayName,
    sku,
    category: "fabric",
    subcategory: "sheer_fabric",
    fabric_width: widthCm,
    cost_price: price,
    selling_price: price,
    vendor_id: vendorId,
    pricing_method: "per_meter" as const,
    quantity: 0,
    fabric_composition: composition || undefined,
    description: descParts.length > 0 ? descParts.join("; ") : undefined,
    pattern_repeat_vertical: vertRepeat || undefined,
    pattern_repeat_horizontal: horizRepeat || undefined,
    collection_name: collectionName,
    collection_id: collectionId || undefined,
    compatible_treatments: ["curtains"],
    product_category: "curtains",
    ...(tags.length > 0 ? { tags } : {}),
  };
}

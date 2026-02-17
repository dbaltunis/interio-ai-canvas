

## Library Setup for Laela Account (baltunis+laela@curtainscalculator.com)

### What We Have

You've provided 3 data files with fabric and trimming catalogs:

| File | Supplier | Items | Type |
|---|---|---|---|
| CSV_Triming_CNV.csv | CNV | 14 | Trimmings (cords, borders, tassels, rosettes, tie-backs) |
| CSV_DATEKS_Pricelist_2023.csv | DATEKS | ~1,799 | Fabrics - full 2023 catalog (roll + coupon + client price) |
| CSV_DATEKS_Expo_2024.csv | DATEKS | ~2,359 | Fabrics - 2024 showroom expo (roll + cut + client prices, year, status) |

The Excel file is a compiled summary of the same data.

**Note:** The 4th source file (Kainos_DATEKS_VLN.xlsx) was corrupted. You may want to re-share that file later.

### The Challenge

The existing CSV importer in the app expects a standard format (`sku, name, category, subcategory, supplier, cost_price, selling_price...`), but each of your files has a different column structure. We need to build a dedicated import edge function that:

1. Understands each file's unique column layout
2. Maps the data correctly to the inventory system
3. Targets only the Laela account (no other accounts affected)
4. Creates the vendor/brand records (DATEKS, CNV) automatically
5. Organizes fabrics into collections where identifiable (e.g., "BLANQUETTE", "DOLCE VITA", "SUPER SONIC", etc.)

### Plan

#### Step 1: Create the "DATEKS" and "CNV" vendors
Create vendor records for the Laela account so all imported items are properly linked to their supplier/brand.

#### Step 2: Build an edge function `import-client-library`
A dedicated edge function that accepts CSV data and a format identifier, transforms it to the inventory schema, and inserts it for the specified account.

**Data mapping per file:**

**DATEKS Expo 2024:**
- `fabric_name` --> `name`
- `supplier` --> vendor lookup (DATEKS)
- `category: "fabrics"` --> `category: "fabric"`, `subcategory: "curtain_fabric"`
- `width_cm` --> `fabric_width` (parse numeric, handle "300 DEPO", "300 ROLL" etc.)
- `roll_price_eur` --> `cost_price` (wholesale cost)
- `sell_cut_price_eur` --> `selling_price` (client-facing price)
- `nr` --> `sku` (prefixed as "DATEKS-{nr}")
- `year` --> stored in tags
- `status` --> stored in tags (e.g., "clearance" for "ispardavimas")
- Collection extraction from fabric name (e.g., "MINGO / KNYGA BLANQUETTE" --> collection "BLANQUETTE")

**DATEKS Pricelist 2023:**
- `design` --> `name`
- `catalog_nr` --> `sku` (prefixed as "DATEKS-{catalog_nr}")
- `roll_price_eur` --> `cost_price`
- `sell_price_eur` --> `selling_price`
- `width_cm` --> `fabric_width`

**CNV Trimmings:**
- `product_code` --> `sku`
- `product_type` --> `name` (e.g., "KORDON", "BORDUR")
- `category: "trimmings"` --> `category: "hardware"`, `subcategory: "accessories"`
- `unit` --> `unit` (M = meters, VNT = units/pieces)
- `purchase_price_eur` --> `cost_price`
- `sell_price_eur` --> `selling_price`

#### Step 3: Handle duplicates between the two DATEKS files
The Expo 2024 file (~2,359 items) and the Pricelist 2023 file (~1,799 items) have significant overlap. Strategy:
- Import the 2023 Pricelist first (baseline catalog)
- Import the 2024 Expo second, using upsert by name to update prices and add new items
- The 2024 Expo has more recent pricing so it takes priority

#### Step 4: Auto-extract collections from fabric names
Many DATEKS fabrics include collection references in their names like:
- "MINGO / KNYGA BLANQUETTE" --> Collection: "BLANQUETTE"
- "AVIATION / KNYGA SUPER SONIC" --> Collection: "SUPER SONIC"
- "Alassio / Dolce Vita" --> Collection: "DOLCE VITA"
- "KINALI / KN. MARMARA" --> Collection: "MARMARA"

The edge function will parse these patterns (`/ KNYGA`, `/ KN.`, `/ kn.`, `/`) and auto-create collection records, linking fabrics to them.

#### Step 5: Run the import via the admin UI
Trigger the import from the app (or via direct API call) targeting only the Laela account. The function will:
1. Create vendors (DATEKS, CNV)
2. Create collections (extracted from fabric names)
3. Import ~2,500+ unique inventory items
4. Report results (created, updated, skipped, errors)

### What You'll Get

After import, the Laela account Library will show:
- **2 Brands/Vendors**: DATEKS, CNV
- **~30+ Collections**: BLANQUETTE, DOLCE VITA, SUPER SONIC, COSMOPOLITAN, FESTIVAL, ADRIYA, SUN CITY, CANNES, MUSEO, KALAHARI, etc.
- **~2,500+ Fabric items** with proper cost/sell prices, widths, SKUs
- **14 Trimming/Accessory items** from CNV

### Next Steps After This Import
Once this batch is done, you can share additional files (hardware, headings, more suppliers) and we'll import those the same way. We can also:
- Fine-tune collection groupings
- Add color tags to brands/collections for Finder-style navigation
- Set up window treatment templates with the imported products

### Technical Details

- Edge function: `supabase/functions/import-client-library/index.ts`
- Account-scoped: uses the Laela user ID directly in INSERT queries
- Vendor/collection creation: auto-creates if not exists, reuses if already present
- Currency: EUR (all prices in the files are EUR)
- Batch processing: items imported in batches of 50 to avoid timeouts
- Deduplication: by SKU within same account, upsert mode




## Import MASLINA Fabrics (116 items) for Laela Account

### File Summary

| Detail | Value |
|---|---|
| Supplier | MASLINA |
| Location | Turkey |
| Total items | 116 |
| Type | Curtain fabrics (blackout, dimout, sheers, Greek patterns) |
| Prices | Cut price only (EUR per meter) |
| Widths | 285-330 cm |

### Data Structure (Page 6 of the XLSX)

The MASLINA data is very simple -- only 4 columns:

| Column | Example |
|---|---|
| Kumaş Adı (Fabric Name) | AMANDA, GALA BLACKOUT, LORD BLACKOUT |
| EN / Width (cm) | 295, 310, 320 |
| KESİM / Cut Price (EUR) | 11.8, 9.9, 15.3 |
| Currency | EUR |

### Column Mapping

| Source | Maps To | Notes |
|---|---|---|
| Fabric Name | `name` | e.g., "AMANDA" |
| Fabric Name | `sku` | Prefixed: "MAS-AMANDA", "MAS-GALA-BLACKOUT" |
| Width | `fabric_width` | Integer in cm |
| Cut Price | `cost_price` and `selling_price` | Same value (only cut price available) |
| All items | `category: "fabric"` | |
| All items | `subcategory: "curtain_fabric"` | |
| All items | `compatible_treatments: ["curtains"]` | |
| All items | `pricing_method: "per_meter"` | |
| Supplier | vendor: "MASLINA" | Auto-created |

### What Changes

#### 1. Create CSV file
Extract the 116 MASLINA items from Page 6 into `public/import-data/CSV_MASLINA_Catalog.csv` with columns: `name`, `width_cm`, `cut_price_eur`.

#### 2. Add `mapMaslina()` mapper to Edge Function
New mapper in `supabase/functions/import-client-library/index.ts`:
- Very simple mapper (only 3 data columns)
- Auto-creates "MASLINA" vendor
- SKU: "MAS-{NORMALIZED_NAME}" (e.g., "MAS-GALA-BLACKOUT")
- `cost_price` = `selling_price` = cut price
- `fabric_width` from width column
- Items with price 0 (e.g., "SİES") still imported with price 0
- Auto-detect blackout/dimout from name for `description` tag
- Single collection: "MASLINA"

#### 3. Register in `LaelLibraryImport.tsx`
Add entry:
```text
{ format: "maslina", file: "/import-data/CSV_MASLINA_Catalog.csv", label: "MASLINA Curtain Fabrics (116 items)" }
```

#### 4. Add vendor routing in Edge Function
Add `"maslina"` to the vendor name lookup, mapping to "MASLINA".

### After Implementation
1. Navigate to `/admin/import-laela`
2. Click "Start Import" (or "Re-run Import")
3. The 116 MASLINA fabric items will import with proper width, pricing, and vendor assignment

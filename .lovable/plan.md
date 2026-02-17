

## Import Spanish Supplier Price Lists for Laela Account

### File Summary

| Supplier | Items | Categories | Prices |
|---|---|---|---|
| DABEDAN (Tejidos Ignifugos) | ~54 | FR Multipurpose, Blackout/Dimout, Velvets, Sheers | Cut, Roll, 250m+, 500m+ |
| RIOMA | ~120 (A-C subset shown, full catalog 400+) | Upholstery/Curtain, Digital Prints, Jacquards | Cut Length, Roll |
| TARIFA STOCK | ~69 | Cotton, Linen, Polyester, Chenille, FR, Jacquard | Cut, Pieces, volume tiers |

### Approach

The XLSX Page 2 contains a **unified table** with all 3 suppliers in a single format with these columns:

```text
Supplier | Product Name | Category | Width (cm) | Composition | Weight (g/m2) | 
Martindale | Fire Rating | Remarks/Finish | Price - Cut Length (EUR/m) | 
Price - Roll (EUR/m) | Price - 250m+ (EUR/m) | Price - 500m+ (EUR/m) | 
Currency | Price Unit | Price List Date
```

Since the edge function only processes CSV files, I will:
1. Extract the Page 2 data into a CSV file
2. Add a single `mapSpanishSuppliers` mapper that handles all 3 suppliers from this unified format
3. Create separate vendors for each supplier (DABEDAN, RIOMA, TARIFA STOCK)

### Column Mapping

| XLSX Column | Maps To | Notes |
|---|---|---|
| `Supplier` | vendor lookup | Auto-create 3 vendors |
| `Product Name` | `name` | e.g., "BERNIA LONETA" |
| `Product Name` | `sku` | Prefixed by supplier: "DAB-BERNIA-LONETA", "RIO-AARON-140", "TAR-AFRICA-COTTON" |
| `Category` | stored in `tags` | e.g., "category:Multipurpose C1" |
| `Width (cm)` | `fabric_width` | Parse integer |
| `Composition` | `composition` | e.g., "Pes FR", "100%PES" |
| `Weight (g/m2)` | stored in `tags` | e.g., "weight:210" |
| `Martindale` | stored in `tags` | e.g., "martindale:35000" |
| `Fire Rating` | `fire_rating` | e.g., "C1 - Fire Retardant" |
| `Remarks/Finish` | `description` | e.g., "Loneta", "Velvet, New" |
| `Price - Roll (EUR/m)` | `cost_price` | Wholesale/roll price as cost |
| `Price - Cut Length (EUR/m)` | `selling_price` | Cut length as retail price; fallback to roll price |
| All items | `category: "fabric"` | All are fabrics |
| All items | `subcategory: "curtain_fabric"` | Default for curtain fabrics |
| All items | `compatible_treatments: ["curtains"]` | Standard |
| All items | `pricing_method: "per_meter"` | All priced per linear meter |

### What Changes

#### 1. Create CSV from XLSX data
Extract Page 2 data into `public/import-data/CSV_Spanish_Suppliers_Combined.csv` with the unified columns.

#### 2. Add `mapSpanishSuppliers()` handler to Edge Function
New mapper in `supabase/functions/import-client-library/index.ts`:
- Reads the `Supplier` column to determine which vendor to assign
- Auto-creates 3 vendors: "DABEDAN", "RIOMA", "TARIFA STOCK"
- Generates SKU from supplier prefix + product name (e.g., "DAB-BERNIA-LONETA")
- Uses `Price - Roll` as `cost_price`, `Price - Cut Length` as `selling_price`
- Falls back: if no cut length price, uses roll price for both
- Stores composition, weight, martindale, fire rating in appropriate fields and tags
- Creates collections per supplier (e.g., "DABEDAN MULTIPURPOSE C1", "DABEDAN SHEERS C1")
- Sets `category: "fabric"`, `subcategory: "curtain_fabric"`, `compatible_treatments: ["curtains"]`

#### 3. Register in `LaelLibraryImport.tsx`
Add entry to `IMPORT_FILES` array:
```text
{ format: "spanish_suppliers", file: "/import-data/CSV_Spanish_Suppliers_Combined.csv", label: "Spanish Suppliers - DABEDAN, RIOMA, TARIFA STOCK (~500+ fabrics)" }
```

#### 4. Add vendor routing in Edge Function
For `spanish_suppliers` format, skip the single-vendor lookup and instead determine vendor per-row from the `Supplier` column.

### Technical Details

SKU generation:
```text
DABEDAN items     -> "DAB-{PRODUCT_NAME_NORMALIZED}"
RIOMA items       -> "RIO-{PRODUCT_NAME_NORMALIZED}"
TARIFA STOCK items -> "TAR-{PRODUCT_NAME_NORMALIZED}"
```

Collection mapping:
```text
Supplier + Category column -> Collection name
e.g., "DABEDAN" + "Multipurpose C1" -> "DABEDAN MULTIPURPOSE C1"
      "RIOMA" + "Upholstery/Curtain" -> "RIOMA UPHOLSTERY"
      "TARIFA STOCK" + "WASH" -> "TARIFA STOCK"  (finish used as collection)
```

Note: RIOMA data in this file appears to be a partial catalog (letters A-C, ~120 items). The full RIOMA catalog has 400+ items -- if the full list is available later, it can be re-imported and existing items will be updated via SKU matching.

### After This Fix
1. Navigate to `/admin/import-laela`
2. Click "Start Import" for the Spanish Suppliers entry
3. Items will import with proper vendors, collections, pricing, and metadata
4. All fabrics will appear in the Library under curtain fabrics with composition and fire rating info




## Import IKS FORMA Hardware Catalog for Laela Account

### File Summary

| Detail | Value |
|---|---|
| Supplier | IKS FORMA |
| Total items | 181 |
| Type | Hardware (not fabric) |
| Prices | Wholesale only (EUR) |
| Unit types | VNT (piece) and M (meter) |

### Product Groups in the File

| CSV `product_group` | CSV `subcategory` | Inventory Category | Inventory Subcategory | Count |
|---|---|---|---|---|
| 19mm Karnizai | Lazdos | hardware | rod | ~36 |
| 19mm Karnizai | Rifliuotos lazdos | hardware | rod | ~8 |
| 19mm Karnizai | Bėgeliai | hardware | track | ~50 |
| 19mm Karnizai | Laikikliai | hardware | bracket | ~27 |
| 19mm Karnizai | Antgaliai | hardware | accessory | ~18 |
| Lubiniai bėgeliai | Bėgeliai | hardware | track | ~19 |
| Traukimo lazdelės | Lazdelės | hardware | accessory | ~13 |
| Aksesuarai | trimmings/tiebacks/tassels | hardware | accessory | ~10 |

### Column Mapping

| CSV Column | Maps To | Notes |
|---|---|---|
| `product_code` | `sku` | Prefixed as "IKS-{product_code}" |
| `product_name` | `name` | Combined with color: "Lazda 1.60m - Sendinto aukso" |
| `color` | appended to name + stored in `tags` | e.g., tag "color:Sendinto aukso" |
| `purchase_price_eur` | `cost_price` and `selling_price` | Selling = cost (no retail price) |
| `product_group` | `collection_name` | Auto-create collections: "19MM KARNIZAI", "LUBINIAI BEGELIAI", "TRAUKIMO LAZDELES", "AKSESUARAI" |
| `subcategory` | mapped to inventory subcategory | See table above |
| `unit` | `pricing_method` | VNT = per_unit, M = per_meter |
| `supplier` | vendor lookup | Auto-create "IKS FORMA" vendor |

### What Changes

#### 1. Copy CSV to `public/import-data/CSV_IKS_FORMA_Full_Catalog.csv`
Copy the uploaded file so the admin page can fetch it.

#### 2. Add `mapIksForma()` handler to Edge Function
New mapper in `supabase/functions/import-client-library/index.ts`:
- Creates "IKS FORMA" vendor automatically
- Maps `subcategory` to proper inventory subcategories (rod, track, bracket, accessory)
- Sets `category: "hardware"` for all items
- Sets `compatible_treatments: ["curtains"]` since these are curtain hardware
- Creates collections from `product_group` (4 collections)
- Combines `product_name` + `color` into the display name
- Items with empty `purchase_price_eur` (the accessories at the end) import with price 0
- `pricing_method`: "per_meter" for M units, "per_unit" for VNT units

#### 3. Register in `LaelLibraryImport.tsx`
Add a 5th entry to the `IMPORT_FILES` array:
```
{ format: "iks_forma", file: "/import-data/CSV_IKS_FORMA_Full_Catalog.csv", label: "IKS FORMA Hardware (181 items)" }
```

#### 4. Add vendor routing in Edge Function
Update the vendor name lookup to handle "iks_forma" format, mapping it to vendor name "IKS FORMA".

### Technical Details

Subcategory mapping logic in the mapper:
```text
CSV subcategory         ->  Inventory subcategory
Lazdos                  ->  rod
Rifliuotos lazdos       ->  rod
Bėgeliai                ->  track
Laikikliai              ->  bracket
Antgaliai               ->  accessory
Lazdelės                ->  accessory
trimmings               ->  accessory
tiebacks                ->  accessory
tassels                 ->  accessory
```

### After This Fix
1. Navigate to `/admin/import-laela`
2. Click "Re-run Import" (or "Start Import")
3. The 181 IKS FORMA hardware items will import directly (small file, no chunking needed)
4. Items will appear in the Library under the Hardware category with proper subcategories and collections


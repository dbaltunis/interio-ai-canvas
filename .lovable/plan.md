

## Fix: Complete Fabric Metadata for All Imports

### Problems Identified

1. **Edge function mappers** (used for admin/bulk imports like Laela) never set `compatible_treatments` or `product_category` -- these fields are empty for all imported items
2. **Edge function update logic** (line 140-151) only updates 7 fields during upsert, skipping `compatible_treatments`, `product_category`, `subcategory`, and `pricing_method`
3. **Collection extraction** is too narrow -- the regex only catches names with "KNYGA" or "/" patterns, leaving most items without a collection
4. **Selling price fallback** -- items with `cost_price` but no `selling_price` show as 0 instead of falling back to cost price
5. **Hardcoded `TARGET_USER_ID`** -- the edge function only works for one account; needs to accept `user_id` as a parameter for future use

### What Changes

#### 1. Edge Function: `supabase/functions/import-client-library/index.ts`

**a) Accept `user_id` parameter instead of hardcoded constant**
- Keep `TARGET_USER_ID` as fallback for backward compatibility
- Accept `user_id` from the request body so any account can use this function

**b) Add `compatible_treatments` and `product_category` to ALL fabric mappers**
- `mapExpo2024`: add `compatible_treatments: ["curtains"]`, `product_category: "curtains"`
- `mapPricelist2023`: add `compatible_treatments: ["curtains"]`, `product_category: "curtains"`
- `mapCNVTrimmings`: already hardware, no change needed
- New `mapEurofirany`: include these fields from the start

**c) Fix selling price fallback**
- In all mappers: if `selling_price` is 0 but `cost_price` > 0, set `selling_price = cost_price`

**d) Improve collection extraction**
- For Pricelist 2023: extract collection from the `design` field by taking the first word/group before common separators
- For Expo 2024: keep existing regex but add fallback patterns for items without "KNYGA"

**e) Update the upsert logic to include ALL mapped fields**
- The update call (lines 140-151) will include: `compatible_treatments`, `product_category`, `subcategory`, `pricing_method`, `vendor_id` in addition to the existing fields

**f) Add `mapEurofirany` handler**
- Map `product_code` to SKU (prefixed `EURO-`)
- Map `wholesale_price_eur` to `cost_price` and `selling_price`
- Map `brand_collection` to collection
- Parse width from `type_size`
- Set `compatible_treatments: ["curtains"]`, `product_category: "curtains"`

#### 2. Backfill existing data (one-time SQL update)

Fix the 1,221 already-imported items for the Laela account:
```text
- Set product_category = 'curtains' where subcategory = 'curtain_fabric'
- Set compatible_treatments = '["curtains"]' where compatible_treatments is empty
- Set selling_price = cost_price where selling_price = 0 and cost_price > 0
```

#### 3. Add EUROFIRANY file

- Copy uploaded CSV to `public/import-data/CSV_EUROFIRANY_All_Collections.csv`
- Add entry to `IMPORT_FILES` array in `LaelLibraryImport.tsx`

### Why This Fixes It for All Clients

The edge function changes (accepting `user_id`, setting `compatible_treatments`/`product_category`, better collection extraction, complete upsert fields) apply to every future import through this function, not just Laela. The general CSV import (`InventoryImportDialog`) already supports these fields -- the gap was only in the admin bulk import edge function.

### After This Fix

1. Navigate to `/admin/import-laela`
2. Click "Re-run Import" -- existing items get updated with proper metadata, missing DATEKS Pricelist items get added, EUROFIRANY items get imported
3. In the Library UI: fabrics will show pricing, compatible treatments, and organized collections
4. Future imports for any account using this edge function will include complete metadata


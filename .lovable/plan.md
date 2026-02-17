

## Import LAELA Selected Samples (Pricelist 2024) for Laela Account

### File Summary

| Detail | Value |
|---|---|
| Supplier / Vendor | LAELA (own brand) |
| Total items | ~191 |
| Type | Sheer and curtain fabrics (woven railroaded) |
| Collections | 22 (HOME, PROMISE, LOVELY, MONT, IRIS, THEAMA, AUTHENTIC, SIMPLICITY, TROPICANA, VERANDA, EXIST, INDRA, OSLO, CAPITAL, LEOMAR, SINGLE, AGORA, ACROSS, ALONG, APPEAR, LOUNGE, ART) |
| Prices | Cut-length price (EUR per meter), range 12.00 - 30.00 |
| Widths | 295-325 cm |
| Source file | selected_samples_-_Pricelist_2024.XLSX (Page 1) |

Note: The two PDF files (LAELA_Pricelist_2025.pdf and selected_samples_-_Pricelist_2024.pdf) failed to parse. This plan uses the XLSX data which parsed successfully.

### Data Structure

| Column | Example | Notes |
|---|---|---|
| hanger | F-0896F | Hanger/swatch code |
| hanger description | WATERFALL HOME | Collection name |
| article | 6301670-02 | Article number (used as SKU base) |
| article description | home off white | Product name with color |
| width | 305cm - 120" (+/-1%) | Fabric width |
| composition | 100%pol | Fabric composition |
| cutlength price | 13.80 | EUR per meter |
| direction comment | woven railroaded | Fabric direction |
| vertical repeat | vert.repeat 0 | Vertical pattern repeat |
| horiz.repeat | horiz.repeat 0 | Horizontal pattern repeat |
| comments | LB - eurohem | Processing notes |
| weight (kg/mt) | 0.1330 | Weight per meter |
| washing instructions | GKXNQa | Encoded care codes |
| comments 2 | colors may vary from lot to lot | Additional notes |

### Column Mapping

| Source Column | Maps To | Notes |
|---|---|---|
| article | `sku` | Prefixed: "LAELA-6301670-02" |
| article description | `name` | Capitalized: "Home Off White" |
| hanger description | `collection_name` | e.g., "WATERFALL HOME", "HANGER IRIS" |
| width | `fabric_width` | Parse first number: "305cm" -> 305 |
| composition | `composition` | e.g., "100%pol", "60%pol 40%lin" |
| cutlength price | `cost_price` AND `selling_price` | Same value (single price) |
| direction comment | `description` | Included in description |
| vertical repeat | `pattern_repeat_vertical` | Parse number from "vert.repeat 0" |
| horiz.repeat | `pattern_repeat_horizontal` | Parse number from "horiz.repeat 3cm-1\"" -> 3 |
| weight (kg/mt) | stored in `specifications` | Weight data |
| All items | `category: "fabric"` | |
| All items | `subcategory: "sheer_fabric"` | Most are sheers; some heavier ones as "curtain_fabric" |
| All items | `pricing_method: "per_meter"` | |
| All items | `compatible_treatments: ["curtains"]` | |

### What Changes

#### 1. Create CSV file
`public/import-data/CSV_LAELA_Selected_Samples.csv` (~191 rows) with columns:
`article,name,collection,width_cm,composition,cut_price_eur,direction,vert_repeat,horiz_repeat,weight_kg_mt,comments`

#### 2. Add `mapLaelaSelectedSamples()` mapper to Edge Function

- SKU: `LAELA-{ARTICLE_NUMBER}` (e.g., "LAELA-6301670-02", "LAELA-1354611-01")
- `name`: Capitalized article description (e.g., "Home Off White", "Promise Natur")
- `cost_price` = `selling_price` = cutlength price
- `fabric_width`: Parse first number from width string (e.g., "305cm" -> 305)
- `composition`: Stored directly from source
- `pattern_repeat_vertical`: Parse cm value from "vert.repeat Xcm" (0 if "vert.repeat 0")
- `pattern_repeat_horizontal`: Parse cm value from "horiz.repeat Xcm" (0 if "horiz.repeat 0")
- `description`: Includes direction comment and weight info
- Collection: Use "hanger description" cleaned up (e.g., "WATERFALL HOME" -> collection "LAELA WATERFALL HOME")
- Auto-detect subcategory: items with weight < 0.30 kg/mt -> `sheer_fabric`; heavier items -> `curtain_fabric`
- Vendor: "LAELA" (auto-created)
- Deduplication: Some rows appear duplicated (same article number) -- skip duplicates by SKU

#### 3. Register in `LaelLibraryImport.tsx`
Add entry:
```text
{ format: "laela_selected_samples", file: "/import-data/CSV_LAELA_Selected_Samples.csv", label: "LAELA Selected Samples 2024 (191 items)" }
```

#### 4. Add vendor routing in Edge Function
Add `"laela_selected_samples"` to the bypass list for single-vendor lookup, auto-creating vendor "LAELA".

### Collections Created (~22)

| Collection Name | Items |
|---|---|
| LAELA WATERFALL HOME | 7 |
| LAELA WATERFALL PROMISE | 18 |
| LAELA HANGER LOVELY | 9 |
| LAELA WATERFALL MONT | 19 |
| LAELA HANGER IRIS | 10 |
| LAELA HANGER THEAMA | 5 |
| LAELA HANGER AUTHENTIC | 10 |
| LAELA WATERFALL SIMPLICITY | 13 |
| LAELA HANGER TROPICANA | 3 |
| LAELA HANGER VERANDA | 3 |
| LAELA HANGER EXIST | 7 |
| LAELA WATERFALL INDRA | 7 |
| LAELA HANGER OSLO | 6 |
| LAELA HANGER CAPITAL | 14 |
| LAELA HANGER LEOMAR | 9 |
| LAELA HANGER SINGLE | 10 |
| LAELA WATERFALL AGORA | 16 |
| LAELA WATERFALL ACROSS | 7 |
| LAELA WATERFALL ALONG | 6 |
| LAELA HANGER APPEAR | 3 |
| LAELA HANGER LOUNGE | 3 |
| LAELA HANGER ART | 6 |

### Special Cases

- **Duplicate rows**: Some article numbers appear twice (e.g., "mont grey 1561618-01", "indra taupe 4861620-01") -- deduplicated by SKU
- **Pattern repeats**: Most items have "0" repeats (plain fabrics); some have values like "101cm-39.5\"" or "57,5cm-22.5\"" -- parsed as cm integers
- **Weight-based subcategory**: Items under 0.30 kg/mt classified as `sheer_fabric`; heavier ones as `curtain_fabric`
- **Composition parsing**: Left as-is from source (e.g., "100%pol", "60%pol 40%lin", "82pan 6pol 6cot 3li 3cv")

### After Implementation
1. Navigate to `/admin/import-laela`
2. Click "Start Import" for "LAELA Selected Samples 2024" entry (~191 items)
3. All items will import with proper collections, composition, pattern repeats, and vendor




## Import IFI Tekstile Fabrics for Laela Account

### File Summary

| Detail | Value |
|---|---|
| Vendor | IFI TEKSTILE |
| Total items | ~523 |
| Type | Sheer and curtain fabrics (woven railroaded) |
| Collections | ~14 (ORAMA, SWEETNESS, HISTORY, MONTANA, ESTRADA, SMILE & ADMIRE, NATIONAL, GLORY, PUBLIC, LOOK, HOTEL ROOM OFF WHITE, ECO & LINENS, DELICATE VOLUME 1, DELICATE VOLUME 2) |
| Prices | Single price (EUR per meter), range 5.00 - 57.00 |
| Widths | 290-330 cm |
| Source | IFI_Tekstile.xlsx (Page 1) |

### Data Structure

The file has the same column layout as the LAELA Selected Samples import:

| Column | Example | Notes |
|---|---|---|
| Hanger Code | F-1004F | Hanger/swatch code |
| Collection | HANGER ORAMA | Collection name |
| Article Code | 9751661-01 | Article number (SKU base) |
| Description | orama anthracite | Product name with color |
| Width | 300cm - 118" (+/-1%) | Fabric width |
| Composition | 59%cot 41%pol | Fabric composition |
| Price (EUR/m) | 18.00 EUR | Single price per meter |
| Direction | woven railroaded | Fabric direction |
| Vertical Repeat | vert.repeat 0 | Vertical pattern repeat |
| Horizontal Repeat | horiz.repeat 0 | Horizontal pattern repeat |
| Washing Instructions | uKXNQ | Encoded care codes |

### Column Mapping

| Source Column | Maps To | Notes |
|---|---|---|
| Article Code | `sku` | Prefixed: "IFI-9751661-01" |
| Description | `name` | Capitalized: "Orama Anthracite" |
| Collection | `collection_name` | e.g., "HANGER ORAMA" -> "IFI TEKSTILE ORAMA" |
| Width | `fabric_width` | Parse first number: "300cm" -> 300 |
| Composition | `composition` | e.g., "59%cot 41%pol" |
| Price | `cost_price` AND `selling_price` | Same value (single price); parse "18.00 EUR" -> 18.00 |
| Direction | `description` | Included in description |
| Vertical Repeat | `pattern_repeat_vertical` | Parse from "vert.repeat Xcm" |
| Horizontal Repeat | `pattern_repeat_horizontal` | Parse from "horiz.repeat Xcm" |
| All items | `category: "fabric"` | |
| All items | `subcategory: "sheer_fabric"` | All are lightweight sheers |
| All items | `pricing_method: "per_meter"` | |
| All items | `compatible_treatments: ["curtains"]` | |

### What Changes

#### 1. Create CSV file
`public/import-data/CSV_IFI_Tekstile.csv` (~523 rows) with columns:
`article,name,collection,width_cm,composition,price_eur,direction,vert_repeat,horiz_repeat`

Extracted from the parsed XLSX data. Price cleaned from "18.00 EUR" format to numeric "18.00".

#### 2. Add `mapIfiTekstile()` mapper to Edge Function

- SKU: `IFI-{ARTICLE_CODE}` (e.g., "IFI-9751661-01", "IFI-75-1609-02")
- `name`: Capitalized description (e.g., "Orama Anthracite", "Bright Sand")
- `cost_price` = `selling_price` = parsed price
- `fabric_width`: Parse first number from width string
- `composition`: Stored directly from source
- `pattern_repeat_vertical` / `pattern_repeat_horizontal`: Parse cm values (reuse `parseRepeatCm` from LAELA mapper)
- `description`: Includes direction info
- Collection: Clean collection name -- strip "HANGER " / "WATERFALL " / "BOOK " prefixes, then prefix with "IFI TEKSTILE" (e.g., "HANGER ORAMA" -> "IFI TEKSTILE ORAMA", "BOOK ECO & LINENS" -> "IFI TEKSTILE ECO & LINENS")
- Subcategory: `sheer_fabric` for all (these are all lightweight woven railroaded sheers)
- Vendor: "IFI TEKSTILE" (auto-created)
- Deduplication: Some article codes appear in multiple collections (e.g., "orama grey 9751618-01" in both HANGER ORAMA and BOOK DELICATE VOLUME 2) -- first occurrence wins via SKU upsert

#### 3. Register in `LaelLibraryImport.tsx`
Add entry:
```text
{ format: "ifi_tekstile", file: "/import-data/CSV_IFI_Tekstile.csv", label: "IFI Tekstile Fabrics (523 items)" }
```

#### 4. Add vendor routing in Edge Function
Add `"ifi_tekstile"` to the bypass list for single-vendor lookup, auto-creating vendor "IFI TEKSTILE".

### Collections Created (~14)

| Collection Name | Approx Items |
|---|---|
| IFI TEKSTILE ORAMA | 8 |
| IFI TEKSTILE SWEETNESS | 4 |
| IFI TEKSTILE HISTORY | 9 |
| IFI TEKSTILE MONTANA | 7 |
| IFI TEKSTILE ESTRADA | 8 |
| IFI TEKSTILE SMILE & ADMIRE | 30 |
| IFI TEKSTILE NATIONAL | 9 |
| IFI TEKSTILE GLORY | 5 |
| IFI TEKSTILE PUBLIC | 14 |
| IFI TEKSTILE LOOK | 10 |
| IFI TEKSTILE HOTEL ROOM OFF WHITE | 11 |
| IFI TEKSTILE ECO & LINENS | ~130 |
| IFI TEKSTILE DELICATE VOLUME 1 | ~140 |
| IFI TEKSTILE DELICATE VOLUME 2 | ~148 |

### Special Cases

- **Price format**: Contains EUR symbol (e.g., "18.00 EUR") -- stripped to numeric
- **Duplicate article codes across collections**: Same fabric may appear in a HANGER collection and a BOOK collection. SKU-based upsert means first insert wins, subsequent ones update (price should be same).
- **Pattern repeats**: Most are "0"; some have values like "10cm-4\"", "6,5cm-2 1/2\"", "5,5cm-2\"", "8cm-3\"", "3cm-1\"" -- parsed as cm values
- **Composition abbreviations**: pol=polyester, cot=cotton, lin=linen, pan=polyamide/nylon, wo=wool, vis=viscose, acr=acrylic, cv=viscose, pa=polyamide, cly=cellulose -- stored as-is

### After Implementation
1. Navigate to `/admin/import-laela`
2. Click "Start Import" -- the "IFI Tekstile Fabrics (523 items)" entry will be processed
3. All items import with vendor, collections, composition, and pricing


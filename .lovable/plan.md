

## Import RIDEX Fabric Catalog (2025 Prices) for Laela Account

### Source Analysis

Three price lists were provided spanning 2023-2025. The **2025 price list** is the latest and most comprehensive, containing updated prices for the full RIDEX catalog. The 2023 lists are older versions of the same catalog.

The uploaded image shows 10 fabrics with "CENA TKANI" (fabric price) and "CENA OBRAZCA" (sample price) -- these are already included in the 2025 catalog at updated prices.

| Source | Items | Used? |
|---|---|---|
| cennik_export.pdf (2023) | ~170 | No -- superseded by 2025 |
| PRICE_LIST_AUTUMN_2023_eng.pdf | 11 | No -- superseded by 2025 |
| RIDEX_PRICE_LIST_2025_new_collection.pdf | ~170 | Yes -- primary source |
| Image (PAKIET 1) | 10 | Already in 2025 catalog |

### Data Summary

| Detail | Value |
|---|---|
| Vendor | RIDEX |
| Total items | ~170 (deduplicated) |
| Category | Interior fabrics (curtain, sheer, blackout, dimout, velvet, FR) |
| Widths | 138-420 cm |
| Price range | 3.70 - 55.50 EUR per meter |
| Pricing | Cut price (retail) + Roll price (wholesale, where available) |

### Special Item Types

- **"(roll price)" variants**: ~20 items have a discounted bulk/roll price alongside the cut price. Roll price becomes `cost_price`, cut price becomes `selling_price`.
- **Items without roll price**: Single price used for both `cost_price` and `selling_price`.
- **FR items**: Fire retardant fabrics -- tagged "fire-retardant".
- **Blackout/dimout items**: Tagged accordingly and noted in description.
- **Variable widths**: e.g., "300-320" for PRIMO FR -- first number used.

### Column Mapping

| Source Column | Maps To | Notes |
|---|---|---|
| FABRIC | `name` + `sku` | SKU: "RDX-{NAME}" (e.g., "RDX-ALGARVE") |
| WIDTH / HEIGHT (CM) | `fabric_width` | Parse first number from "300-320" |
| PRICE (cut) | `selling_price` | Retail per-meter price |
| PRICE (roll) | `cost_price` | Wholesale; fallback to cut price if no roll variant |
| LEADBAND FINISH | tags | "blackout", "dimout" |
| ADDITIONAL INFORMATION | tags | "100 %" -> "fire-retardant" |
| All items | `category: "fabric"` | |
| All items | `pricing_method: "per_meter"` | |
| All items | `compatible_treatments: ["curtains"]` | |

### Subcategory Auto-Detection

| Pattern in Name | Subcategory |
|---|---|
| BLACKOUT, HOLD BLACKOUT | curtain_fabric + tag "blackout" |
| DIMOUT, MOONLIGHT, NIGHTFALL, NIGHTGUARD, NOCTURNE, ECLIPSE, SOLAR | curtain_fabric + tag "dimout" |
| WOAL, WHITE (sheers) | sheer_fabric |
| VELVET, VELLUTI, CROWN VELVET, CELEBRATION VELVET, JUBILATION VELVET, SOFTY VELVET | curtain_fabric + tag "velvet" |
| FR suffix | add "fire-retardant" tag |
| Everything else | curtain_fabric |

### What Changes

#### 1. Create CSV file
`public/import-data/CSV_RIDEX_2025.csv` (~170 rows) with columns:
`name,width_cm,cut_price_eur,roll_price_eur,tags`

- Items with "(roll price)" variants are merged into one row with both prices
- Deduplication: BLACKOUT FR 150 and BLACKOUT FR 300 become separate rows (different widths)
- Items like "LINCOLN FR 140" and "LINCOLN FR 280" kept as separate entries with width suffix in SKU

#### 2. Add `mapRidex()` mapper to Edge Function

- SKU: `RDX-{NORMALIZED_NAME}` (e.g., "RDX-ALGARVE", "RDX-BASIC-GLAZE", "RDX-BLACKOUT-FR-150")
- For duplicate names with different widths: append width to SKU (e.g., "RDX-LINCOLN-FR-140", "RDX-LINCOLN-FR-280")
- `cost_price` = roll price (if available), otherwise cut price
- `selling_price` = cut price
- `fabric_width` = parsed from width column
- Tags: auto-detect "blackout", "dimout", "fire-retardant", "velvet", "sheer" from name
- Collection: "RIDEX 2025" (single collection for all items)
- Vendor: "RIDEX" (auto-created)

#### 3. Register in `LaelLibraryImport.tsx`
Add entry:
```text
{ format: "ridex", file: "/import-data/CSV_RIDEX_2025.csv", label: "RIDEX Interior Fabrics 2025 (170 items)" }
```

#### 4. Add vendor routing in Edge Function
Add `"ridex"` to the vendor bypass list, auto-creating vendor "RIDEX".

### SKU Examples

```text
RDX-ALGARVE              (single width)
RDX-BASIC-HOLD-BLACKOUT  (roll price merged into same record)
RDX-BLACKOUT-FR-150      (width suffix for disambiguation)
RDX-BLACKOUT-FR-300      (width suffix for disambiguation)
RDX-LINCOLN-FR-140       (width suffix)
RDX-LINCOLN-FR-280       (width suffix)
RDX-WOAL-300             (sheer, width suffix)
RDX-WOAL-420             (sheer, width suffix)
```

### Price Handling

Items with roll price (wholesale discount):
```text
BASIC HOLD BLACKOUT:    cost=13.20, selling=21.30
BASIC KEY:              cost=7.20,  selling=12.30
SOLIDARITY:             cost=6.30,  selling=9.40
```

Items without roll price (single price for both):
```text
ALGARVE:                cost=19.70, selling=19.70
BELLUCI:                cost=54.70, selling=54.70
```

### After Implementation
1. Navigate to `/admin/import-laela`
2. Click "Start Import" for "RIDEX Interior Fabrics 2025" entry (~170 items)
3. All items import with vendor, pricing, tags, and width metadata


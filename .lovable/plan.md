

## Enhance Cost Breakdown to Show Pricing Method Details

### What This Changes

The Cost Breakdown table in the WindowSummaryCard will show richer, method-aware detail for each line item based on how the user configured pricing:

| Pricing Method | Current Display | Enhanced Display |
|---|---|---|
| Per Linear Meter | `21.84 m` / `290.00/m` | `21.84 m (4 widths)` / `290.00/m` |
| Per Square Meter | `2.5 sqm` / `150.00/sqm` | `2.5 sqm` / `150.00/sqm` |
| Pricing Grid | `—` / `—` | `1 unit (W:1200 x D:2100)` / Grid: `350.00` |
| Per Drop | `3 drops` / `—` | `3 drops` / `120.00/drop` |
| Fixed Price | `—` / `—` | `1 unit` / `500.00` |

### Technical Approach

#### 1. Save additional display metadata during the save path

**File: `DynamicWindowWorksheet.tsx` (line 2217-2258)**

Add these fields to the fabric cost_breakdown item (most are already saved but some are missing):

- `widths_required` -- already saved at line 2232
- `pricing_method` -- already saved at line 2231
- `drops_required` -- NEW: number of drops (from fabricCalculation)
- `grid_dimensions` -- NEW: for grid pricing, save the matched width x drop string
- `pricing_method_display` -- NEW: human-readable label like "Per Linear Meter", "Pricing Grid"

These are display-only metadata fields that do not affect calculations.

#### 2. Enhance `CostBreakdownGrid` to render method-aware details

**File: `src/components/shared/CostBreakdownGrid.tsx`**

Update the Qty column rendering to show additional context when available:

- For per-meter items with `widths_required > 1`: show "(X widths)" below the quantity
- For grid-priced items: show the dimensions used for lookup
- For per-drop items: show drop count and price per drop

Update the Unit Price column to show the correct suffix based on `pricing_method`:
- `per_metre` -> `/m`
- `per_sqm` -> `/sqm`  
- `pricing_grid` -> show "Grid Price" label
- `per_drop` -> `/drop`
- `fixed` -> no suffix

#### 3. Add optional subtitle row for enriched items

For items with extra context (widths, grid dimensions), render a small secondary line below the quantity showing the breakdown detail. This keeps the table clean while providing transparency.

### Data Flow

```text
DynamicWindowWorksheet (save)
  -> cost_breakdown[0].pricing_method = "per_metre"
  -> cost_breakdown[0].widths_required = 4
  -> cost_breakdown[0].drops_required = 2
  -> cost_breakdown[0].grid_dimensions = "W:1200 x D:2100"

WindowSummaryCard (display)
  -> CostBreakdownGrid receives items with metadata
  -> Renders method-aware Qty and Unit Price columns
```

### Files to Change

| File | Change |
|---|---|
| `DynamicWindowWorksheet.tsx` | Add `drops_required`, `grid_dimensions`, `pricing_method_display` to fabric cost_breakdown item |
| `CostBreakdownGrid.tsx` | Enhance Qty and Unit Price rendering to use pricing method metadata |
| `CostBreakdownItem` interface | Add optional `pricing_method`, `widths_required`, `drops_required`, `grid_dimensions` fields |

### What Does NOT Change

- No calculation or pricing logic changes
- No markup or cost resolution changes
- SavedCostBreakdownDisplay (the Quote Summary view) already has its own `display_formula` path and is unaffected
- The total prices remain identical


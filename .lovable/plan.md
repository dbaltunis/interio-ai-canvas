

## Fix: Pass Pricing Method Metadata Through to CostBreakdownGrid

### Why Changes Are Not Visible

The metadata fields (`pricing_method`, `widths_required`, `drops_per_width`, `uses_pricing_grid`, `pricing_method_label`, `quantity_display`, `display_formula`) ARE being saved to the database correctly in DynamicWindowWorksheet.

However, `WindowSummaryCard.tsx` at lines 814-824 maps the breakdown items into a new object and only copies 8 basic fields. **All the new metadata fields are stripped out** before reaching the CostBreakdownGrid component.

```text
Saved data: { id, name, pricing_method, widths_required, uses_pricing_grid, ... }
                          |
          WindowSummaryCard maps to: { id, name, quantity, unit, unit_price, total_cost }
                          |
                    All metadata LOST here
                          |
          CostBreakdownGrid receives: { id, name, quantity, unit, unit_price, total_cost }
                          |
                    Enhanced display never triggers
```

### The Fix

**File: `src/components/job-creation/WindowSummaryCard.tsx`, lines 814-824**

Add the missing metadata fields to the map function:

```typescript
items={enrichedBreakdown.filter((item: any) => item.total_cost > 0).map((item: any) => ({
  id: item.id,
  name: item.name,
  description: item.description,
  quantity: item.quantity,
  unit: item.unit,
  unit_price: item.unit_price,
  total_cost: item.total_cost,
  category: item.category,
  isIncluded: item.total_cost === 0 && item.name,
  // Pricing method metadata for enhanced display
  pricing_method: item.pricing_method,
  widths_required: item.widths_required,
  drops_per_width: item.drops_per_width,
  grid_dimensions: item.grid_dimensions,
  uses_pricing_grid: item.uses_pricing_grid,
  pricing_method_label: item.pricing_method_label,
  quantity_display: item.quantity_display,
  display_formula: item.display_formula,
} as CostBreakdownItem))}
```

### Files to Change

| File | Lines | Change |
|---|---|---|
| `WindowSummaryCard.tsx` | 814-824 | Pass through all pricing metadata fields in the map |

### One file, one change. No calculation or pricing logic affected.

### Important Note

Existing saved windows will need to be re-saved to populate the new metadata fields. For windows saved before this change, the grid will continue showing the standard display (no widths/grid info) since the metadata was not captured at save time.


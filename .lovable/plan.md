
# Dynamic Price Display in Library - Fix Plan

## Problem Summary

The Library currently shows **hardcoded price units** (`/m`, `/yd`) regardless of each item's actual `pricing_method`. This is misleading because:

- Grid-priced items show `£0.00/m` when they should show the price group
- Fixed-price items show `£X.XX/m` when there's no per-meter calculation
- Per-panel, per-drop, per-sqm items all incorrectly show `/m`

The system already has the solution (`PRICING_METHOD_LABELS` with suffixes), but the Library views don't use it.

---

## Current State vs Expected

| Item Type | Pricing Method | Current Display | Expected Display |
|-----------|----------------|-----------------|------------------|
| TWC Awning | `pricing_grid` | £0.00/m | **Group 4** (badge) |
| Curtain Fabric | `linear` | £45.00/m | £45.00/m ✓ |
| Wallpaper | `per-roll` | £120.00/m | £120.00/roll |
| Hardware | `fixed` | £30.00/m | £30.00 (no suffix) |
| Blind Material | `per_sqm` | £25.00/m | £25.00/m² |

---

## Solution Architecture

```text
┌─────────────────────────────────────────────────────────────────────────────┐
│                    DYNAMIC PRICE DISPLAY PIPELINE                           │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│   ITEM FROM DATABASE                                                        │
│   ├── pricing_method: 'pricing_grid' | 'linear' | 'per_sqm' | etc.          │
│   ├── price_group: 'Group 4' (for grid-priced items)                        │
│   └── selling_price: 45.00                                                  │
│                                                                             │
│                              │                                              │
│                              ▼                                              │
│   ┌─────────────────────────────────────────────────────────────────────┐   │
│   │  <DynamicPriceCell item={item} />                                   │   │
│   │                                                                     │   │
│   │  IF price_group OR pricing_method='pricing_grid':                   │   │
│   │    → Show <Badge>Group {price_group}</Badge>                        │   │
│   │                                                                     │   │
│   │  ELSE:                                                              │   │
│   │    → Get suffix from getPricingMethodSuffix(pricing_method)         │   │
│   │    → Show {formatCurrency(selling_price)}{suffix}                   │   │
│   │                                                                     │   │
│   └─────────────────────────────────────────────────────────────────────┘   │
│                                                                             │
│   EXAMPLES:                                                                 │
│   ├── pricing_grid + Group 4    → [Group 4] badge                           │
│   ├── linear + £45.00           → £45.00/m                                  │
│   ├── per_sqm + £25.00          → £25.00/m²                                 │
│   ├── per-roll + £120.00        → £120.00/roll                              │
│   └── fixed + £30.00            → £30.00                                    │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## Technical Implementation

### 1. Create Reusable PricingCell Component

**File:** `src/components/inventory/PricingCell.tsx` (new)

```typescript
import { Badge } from "@/components/ui/badge";
import { useFormattedCurrency } from "@/hooks/useFormattedCurrency";
import { useMeasurementUnits } from "@/hooks/useMeasurementUnits";
import { getPricingMethodSuffix, normalizePricingMethod, PRICING_METHODS } from "@/constants/pricingMethods";

interface PricingCellProps {
  item: {
    pricing_method?: string;
    price_group?: string | null;
    pricing_grid_id?: string | null;
    selling_price?: number;
    price_per_meter?: number;
    cost_price?: number;
  };
  showCost?: boolean; // For admin views
  className?: string;
}

export const PricingCell = ({ item, showCost = false, className }: PricingCellProps) => {
  const { formatCurrency } = useFormattedCurrency();
  const { isMetric } = useMeasurementUnits();
  
  // Normalize the pricing method
  const normalizedMethod = normalizePricingMethod(item.pricing_method || '');
  
  // Grid pricing - show price group badge
  const isGrid = item.price_group || 
                 item.pricing_grid_id || 
                 normalizedMethod === PRICING_METHODS.PRICING_GRID;
  
  if (isGrid) {
    return (
      <Badge variant="outline" className={className}>
        {item.price_group ? `Group ${item.price_group}` : 'Grid'}
      </Badge>
    );
  }
  
  // Get appropriate price and suffix
  const price = showCost ? item.cost_price : (item.price_per_meter || item.selling_price || 0);
  const suffix = getPricingMethodSuffix(normalizedMethod, isMetric);
  
  return (
    <span className={className}>
      {formatCurrency(price)}{suffix}
    </span>
  );
};
```

### 2. Update FabricInventoryView.tsx

**Location:** Lines 563-568

Replace the hardcoded logic:

```typescript
// BEFORE:
<TableCell className="text-xs font-medium">
  {item.pricing_grid_id ? (
    <span className="text-primary">Grid</span>
  ) : (
    <>{formatPrice(item.price_per_meter || item.selling_price || 0)}/m</>
  )}
</TableCell>

// AFTER:
<TableCell className="text-xs font-medium">
  <PricingCell item={item} />
</TableCell>
```

### 3. Update MaterialInventoryView.tsx

**Location:** Lines 446-453

The current implementation already shows price group badge - enhance to also show price for non-grid items:

```typescript
// AFTER:
<TableCell>
  <PricingCell item={item} className="text-xs" />
</TableCell>
```

### 4. Normalize Existing Data

Run a migration to standardize `pricing_method` values:

```sql
-- Normalize pricing_method to canonical values
UPDATE enhanced_inventory_items
SET pricing_method = 'pricing_grid'
WHERE pricing_method IN ('grid', 'price_grid', 'pricing-grid')
  AND pricing_method != 'pricing_grid';

UPDATE enhanced_inventory_items
SET pricing_method = 'per-linear-meter'
WHERE pricing_method = 'linear';
```

### 5. Update TWC Sync to Set Correct pricing_method

**File:** `supabase/functions/twc-sync-products/index.ts`

Add helper function:

```typescript
const getPricingMethodForCategory = (subcategory: string): string => {
  // Blinds/materials use grid pricing from TWC
  const gridCategories = [
    'roller_fabric', 'venetian_slats', 'vertical_slats', 'vertical_fabric',
    'cellular', 'shutter_material', 'panel_glide_fabric', 'awning_fabric'
  ];
  
  if (gridCategories.includes(subcategory)) {
    return 'pricing_grid';
  }
  
  // Curtain fabrics use linear meter pricing
  if (['curtain_fabric', 'lining_fabric', 'sheer_fabric'].includes(subcategory)) {
    return 'per-linear-meter';
  }
  
  // Wallpaper uses per roll
  if (subcategory.includes('wallpaper')) {
    return 'per-roll';
  }
  
  return 'pricing_grid'; // Default for TWC items
};
```

Use it when creating inventory items.

---

## Files to Modify

| File | Changes |
|------|---------|
| `src/components/inventory/PricingCell.tsx` | **NEW** - Reusable component |
| `src/components/inventory/FabricInventoryView.tsx` | Import and use `PricingCell` |
| `src/components/inventory/MaterialInventoryView.tsx` | Import and use `PricingCell` |
| `supabase/functions/twc-sync-products/index.ts` | Add `getPricingMethodForCategory` helper |
| Database migration | Normalize existing `pricing_method` values |

---

## Visual Result After Fix

### Library List View

| Item | Before | After |
|------|--------|-------|
| TWC Awning (Grid) | £0.00/m | `[Group 4]` badge |
| Curtain Fabric | £45.00/m | £45.00/m ✓ |
| Wallpaper | £120.00/m | £120.00/roll |
| Hardware (Fixed) | £30.00/m | £30.00 |
| Blind (per sqm) | £25.00/m | £25.00/m² |

---

## Testing Checklist

### Library Price Display
- [ ] Navigate to Library → Fabrics
- [ ] Verify grid-priced items show "Group X" badge (not £0.00/m)
- [ ] Verify linear-priced items show correct suffix (/m or /yd)
- [ ] Verify wallpaper shows /roll suffix
- [ ] Navigate to Library → Materials
- [ ] Verify same dynamic behavior

### Edit Dialog Consistency
- [ ] Edit a grid-priced item → verify "Grid" selected on Pricing tab
- [ ] Edit a linear-priced item → verify "Per m" selected
- [ ] Save changes → verify Library display updates correctly

### TWC Sync
- [ ] Trigger new TWC sync
- [ ] Verify new items have correct `pricing_method` value
- [ ] Verify display in Library matches expected format

---

## Prevention Standards (Memory Note)

```markdown
# Memory: library-dynamic-price-display-standard

The Library MUST display prices using the item's actual `pricing_method` field,
NOT hardcoded units. Use the `<PricingCell>` component for all price displays:

RULES:
1. If item.price_group OR pricing_method='pricing_grid' → Show badge with group
2. Otherwise → Use getPricingMethodSuffix() for correct unit suffix
3. NEVER hardcode '/m', '/yd', '/roll' in display logic

FILES USING THIS:
- FabricInventoryView.tsx - Uses <PricingCell>
- MaterialInventoryView.tsx - Uses <PricingCell>
- VirtualizedInventoryGrid.tsx - Already has dynamic logic
- InventorySelectionPanel.tsx - Already has dynamic logic

IMPORT PATH:
import { PricingCell } from "@/components/inventory/PricingCell";
```

---

## Scope

This fix:
1. Creates a reusable component for consistent price display
2. Updates both Library views (Fabrics + Materials)
3. Normalizes existing database values
4. Ensures future TWC syncs set correct `pricing_method`
5. Documents the standard to prevent regression

**Applies to ALL users, not just one account.**

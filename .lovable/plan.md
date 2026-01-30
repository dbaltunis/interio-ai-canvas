

# Complete PricingCell Standardization & Next Steps

## Current Status

| View | PricingCell Used? | Status |
|------|-------------------|--------|
| `HardwareInventoryView.tsx` | ✅ Yes | Fixed in last edit |
| `FabricInventoryView.tsx` (table) | ✅ Yes | Already uses PricingCell |
| `FabricInventoryView.tsx` (grid) | ❌ No | Still has hardcoded `/m` at line 411 |
| `MaterialInventoryView.tsx` | ✅ Yes | Already uses PricingCell |
| `WallcoveringInventoryView.tsx` | ❌ No | Hardcoded pricing display at lines 301-309 and 450-456 |
| `InventoryMobileCard.tsx` | ❌ No | Partial implementation - still has hardcoded pricing |

---

## Remaining Issues to Fix

### 1. FabricInventoryView Grid View (Line 407-413)

```typescript
// CURRENT (hardcoded /m):
<span className="font-bold text-primary">
  {item.price_group ? (
    pricingGrids.find(...)?.name || item.price_group
  ) : (
    `${formatPrice(item.price_per_meter || item.selling_price || 0)}/m`
  )}
</span>

// FIX:
<PricingCell item={item} className="font-bold text-primary" />
```

### 2. WallcoveringInventoryView Grid View (Lines 298-310)

```typescript
// CURRENT (complex conditional with hardcoded units):
<span className="font-bold text-primary">
  {formatPrice(item.price_per_meter || item.selling_price || 0)}
  {(item as any).wallpaper_sold_by && (
    <span>/{sold_by === 'per_roll' ? 'roll' : ...}</span>
  )}
</span>

// FIX:
<PricingCell item={item} className="font-bold text-primary" />
```

### 3. WallcoveringInventoryView Table View (Lines 448-458)

Same issue - hardcoded pricing display logic.

### 4. InventoryMobileCard (Lines 91-98)

```typescript
// CURRENT:
{showPriceGroup && item.price_group ? (
  <Badge>Group {item.price_group}</Badge>
) : (
  <span>{formatPrice(...)}</span>
)}

// FIX:
<PricingCell item={item} className="text-xs font-medium text-primary" />
```

---

## Technical Implementation

### Step 1: Update FabricInventoryView.tsx Grid View

Replace lines 407-413:
```typescript
<div className="flex justify-between text-sm">
  <span className="text-muted-foreground">
    {item.price_group ? 'Pricing Grid:' : 'Price:'}
  </span>
  <PricingCell item={item} className="font-bold text-primary" />
</div>
```

### Step 2: Update WallcoveringInventoryView.tsx

**Grid view (lines 298-310):**
```typescript
<div className="flex justify-between text-sm">
  <span className="text-muted-foreground">Price:</span>
  <PricingCell item={item} className="font-bold text-primary" />
</div>
```

**Table view (lines 448-458):**
```typescript
<TableCell className="px-2 py-1 text-xs font-medium">
  <PricingCell item={item} />
</TableCell>
```

Add import at top:
```typescript
import { PricingCell } from "./PricingCell";
```

### Step 3: Update InventoryMobileCard.tsx

Replace lines 91-98:
```typescript
<PricingCell item={item} className="text-xs font-medium text-primary" />
```

Add import at top:
```typescript
import { PricingCell } from "./PricingCell";
```

---

## Create Development Standard (Memory)

To ensure this pattern is always followed, I'll create a memory note:

```markdown
# Memory: library-pricing-display-standard

ALL Library inventory views MUST use the <PricingCell> component for price display.
NEVER hardcode price suffixes like '/m', '/yd', '/roll' in display logic.

## Required Pattern:
import { PricingCell } from "@/components/inventory/PricingCell";

// In grid view:
<PricingCell item={item} className="font-bold text-primary" />

// In table view:
<PricingCell item={item} className="text-xs" />

## Files That MUST Use PricingCell:
- FabricInventoryView.tsx ✅
- MaterialInventoryView.tsx ✅
- HardwareInventoryView.tsx ✅
- WallcoveringInventoryView.tsx ⚠️ (needs update)
- InventoryMobileCard.tsx ⚠️ (needs update)

## PricingCell Handles:
1. Grid pricing → Shows "Group X" badge
2. Linear pricing → Shows £X.XX/m or £X.XX/yd
3. Per-roll → Shows £X.XX/roll
4. Per-sqm → Shows £X.XX/m²
5. Fixed → Shows £X.XX (no suffix)
```

---

## Files to Modify

| File | Changes |
|------|---------|
| `src/components/inventory/FabricInventoryView.tsx` | Replace grid view price (line 407-413) with PricingCell |
| `src/components/inventory/WallcoveringInventoryView.tsx` | Add import, replace both grid and table price displays |
| `src/components/inventory/InventoryMobileCard.tsx` | Add import, replace price display |

---

## Verification Testing

After implementation:

1. **Fabrics View**
   - Grid view: Verify grid items show "Group X" badge
   - Table view: Already working ✅

2. **Wallcovering View**
   - Grid view: Verify correct suffix (/roll, /m, /m²)
   - Table view: Same verification

3. **Hardware View**
   - Already fixed ✅

4. **Materials View**
   - Already working ✅

5. **Mobile Cards**
   - Test on mobile viewport
   - Verify consistent pricing display

---

## Next Steps After This Fix

| Priority | Task | Description |
|----------|------|-------------|
| 1 | **Test all Library views** | Verify PricingCell works in all locations |
| 2 | **TWC primary color extraction** | Auto-populate `color` field from first valid TWC color |
| 3 | **Cleaner descriptions** | Use `metadata.twc_description` for cleaner display |
| 4 | **Bulk image upload** | Since TWC doesn't provide images, create a bulk upload feature |
| 5 | **Edit popup UX** | Consider a "Source: TWC" badge to indicate auto-synced data |

---

## Summary

This plan:
1. ✅ Fixes remaining 3 files not using PricingCell
2. ✅ Creates a development standard to prevent future regression
3. ✅ Provides testing checklist
4. ✅ Outlines next steps for continued improvement

**Impact**: All Library views will have consistent, dynamic pricing display that respects each item's actual pricing method.


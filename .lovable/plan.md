

# Keep Hardware Per Window with Visual Separation + Remove P.Rate + Services-Only Bottom Section

## Summary

Instead of extracting hardware into a separate bottom section, hardware items (tracks, rods, finials, motors, etc.) will stay within each window's product details breakdown -- but rendered below a thin separator line for visual clarity. The bottom section becomes "Services" only. The P.Rate column is removed entirely.

## Changes

### 1. Remove P.Rate Column

**File: `LivePreview.tsx`**

- Remove the `content.showPrateColumn` conditional logic throughout the curtain-professional table
- Remove P.Rate `<col>`, `<th>`, and all `<td>` cells referencing P.Rate
- Set `colCount` to a fixed `5` (Room/Window, Product Details, Qty, Unit Price, Total Price)

### 2. Keep Hardware in Window Breakdown with Visual Separator

**File: `LivePreview.tsx` (lines 1133-1150, 1204-1247)**

Replace the current `getBreakdownWithoutHardware` approach (which extracts hardware into a separate bottom section) with a single `getItemizedBreakdown` call that keeps all items together but splits them visually:

- Stop populating the `extractedHardware` array -- remove the `getBreakdownWithoutHardware` function entirely
- Use `getItemizedBreakdown(item)` directly for each product row
- In the breakdown rendering, split items into two groups using `isHardwareItem()`:
  - **Non-hardware items** (fabric, lining, heading, etc.) -- rendered first as they are now
  - **Hardware items** (tracks, rods, finials, motors, brackets, etc.) -- rendered below a thin dashed separator line within the same cell

The visual structure per window becomes:

```text
Window Name        | CURTAIN                              | 1 | $500 | $500
                   |   Fabric: Silk Dupion     $45  $180  |   |      |
                   |   Lining: Blockout        $20  $80   |   |      |
                   |   Heading: Double Pleat   $0   Incl  |   |      |
                   |   ── Hardware ──────────────────────  |   |      |
                   |   Track: Ceiling Track    $35  $35   |   |      |
                   |   Finials: Chrome Ball    $12  $24   |   |      |
                   |   Motor: Somfy RTS        $120 $120  |   |      |
```

### 3. Itemized Prices for Each Breakdown Item

Each breakdown line (both non-hardware and hardware) will show:
- Name + description on the left
- Unit price and total cost on the right (aligned)
- Prices shown even when zero

### 4. Bottom Section: "Services" Only

**File: `LivePreview.tsx` (lines 1274-1361)**

- Remove all `extractedHardware` references from the bottom section
- Remove `isHardwareOnlyItem` from the item splitting -- hardware stays with its window
- Rename the section header from "Services & Hardware" to "Services"
- Only top-level service items (installation, measurement, etc.) appear here

## Files to Modify

| File | Change |
|------|--------|
| `LivePreview.tsx` | Remove P.Rate column; replace `getBreakdownWithoutHardware` with inline split rendering using `isHardwareItem()`; add "Hardware" separator line within each window's breakdown; rename bottom section to "Services"; remove extractedHardware logic |



# Fix Stock Badges & Drop Arrow Visibility

## Issues Identified

### Issue 1: Stock Badges Still Visible
**Screenshot Evidence:** "Out" badges showing on items that shouldn't have tracking

**Root Cause:**
```typescript
// Line 734 - Current condition
{item.track_inventory !== false && item.quantity !== undefined && (
```
This shows badges when `track_inventory` is `null` or `undefined` (default state for most fabrics that don't need stock tracking).

**Fix:**
```typescript
{item.track_inventory === true && item.quantity !== undefined && (
```
Only show stock badges when tracking is **explicitly enabled**.

---

### Issue 2: Drop Arrow Missing & Units Hardcoded
**Screenshot Evidence:** "Drop: 230cm" label appears at bottom instead of on right side with arrow

**Root Causes:**
1. **Clipping:** Container has `overflow-hidden` (line 185), clipping the drop measurement label positioned with `-right-12`
2. **Hardcoded Units:** Line 157 uses `{measurements.drop}cm` instead of dynamic unit formatting

**Fixes:**

1. **Change overflow to visible:**
```typescript
// Line 185: Change overflow-hidden to overflow-visible
<div className={`relative min-h-[400px] ... overflow-visible ${className}`}>
```

2. **Use dynamic unit formatting:**
```typescript
// Line 157: Use formatFromMM for proper unit display
Drop: {formatFromMM(parseFloat(measurements.drop) || 0, units.length)}
```

---

## Files to Modify

| File | Line | Change |
|------|------|--------|
| `src/components/inventory/InventorySelectionPanel.tsx` | 734 | Change `track_inventory !== false` to `track_inventory === true` |
| `src/components/treatment-visualizers/CurtainVisualizer.tsx` | 185 | Change `overflow-hidden` to `overflow-visible` |
| `src/components/treatment-visualizers/CurtainVisualizer.tsx` | 157 | Use `formatFromMM()` for drop measurement |

---

## Expected Results

After these fixes:
1. **Stock badges** only appear on fabrics with `track_inventory: true`
2. **Drop arrow** fully visible on right side of curtain visualizer
3. **Drop measurement** shows correct units (cm/in/mm) based on user preference

---

## Re: Awning & SmartDrape Pricing

The code fixes are implemented. To verify they work for Greg Shave / CCCO:
1. Open an awning or SmartDrape window in the measurement worksheet
2. Select a fabric/material with a price group (e.g., "Auto - DAYSCREEN 95" with "Auto-Budget")
3. Save the window
4. Verify the price appears in the room display and quote

**Note:** Existing windows need to be re-saved to populate the `subcategory` field added in the previous fix.

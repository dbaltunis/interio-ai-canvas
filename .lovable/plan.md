

## Investigation Results and Root Cause Analysis

### WHY the previous changes did NOT work

**Issue 1 (Infinite Decimal 108.49999...):**
The rounding fix (`parseFloat(toFixed(4))`) was applied to lines 898/905 — but that code only runs when the **unit dropdown changes**. The **initial data load** when opening a saved window runs a completely different code path at lines 709-723, which has NO rounding. The rounding code was put in the wrong place.

- Line 709-723: Initial load path — runs `convertLength(storedDrop, 'mm', units.length).toString()` — NO rounding. **This is what the user sees.**
- Line 898-905: Unit change path — has `parseFloat(toFixed(4))` — only runs if user changes the unit dropdown AFTER the window loads. **User never triggers this.**

**Issue 2 (580 instead of 290):**
There are TWO separate "smart price base" calculations in the codebase that contradict each other:

| Location | What it does | Result |
|---|---|---|
| `DynamicWindowWorksheet.tsx` line 3297 | Uses `cost_price` when both cost and selling exist | 145 (correct cost base) |
| `VisualMeasurementSheet.tsx` line 462 | Uses `selling_price` always | 290 (selling price) |

The save path at line 1886 reads `fabricCalculation?.pricePerMeter`, which comes from **VisualMeasurementSheet** (source #2 = 290). So it saves `price_per_meter: 290` and `unit_price: 290`.

Then `WindowSummaryCard.applyMarkupToItem()` (line 186-191) reads `unit_price: 290` and applies `implied_markup: 100%`:
```
applyMarkup(290, 100%) = 290 * (1 + 1.0) = 580
```

The previous "fix" changed line 1886 from a selling-price IIFE to `fabricCalculation?.pricePerMeter || 0`. But `fabricCalculation?.pricePerMeter` IS STILL 290 because it comes from VisualMeasurementSheet line 462 which uses `selling_price`. The fix changed the code structure but the VALUE flowing through it stayed the same.

Additionally, on reload (line 844), `pricePerMeter` is set from `existingWindowSummary.price_per_meter` — the stale DB value (290), creating a self-reinforcing loop.

### Architecture Gap

The "smart price base selection" logic exists at DynamicWindowWorksheet line 3297 inside the JSX render block. It correctly picks `cost_price` when both prices exist. But this variable is scoped inside the render block and is NOT accessible at the save function (line 1878). The save function can only access `fabricCalculation?.pricePerMeter` which comes from VisualMeasurementSheet — a completely different calculation that does NOT use smart price base selection.

### Fix Plan

#### Fix 1: Rounding — Add `parseFloat(toFixed(4))` to the initial load path

**File:** `DynamicWindowWorksheet.tsx`, lines 709-713 and 719-723

```typescript
// Line 709-713: rail_width
restoredMeasurements.rail_width = parseFloat(
  convertLength(storedRailWidth, 'mm', units.length).toFixed(4)
).toString();

// Line 719-723: drop
restoredMeasurements.drop = parseFloat(
  convertLength(storedDrop, 'mm', units.length).toFixed(4)
).toString();
```

#### Fix 2: Price — Apply smart price base in VisualMeasurementSheet (the source)

**File:** `VisualMeasurementSheet.tsx`, line 462

This is the root source. Currently:
```typescript
const pricePerMeter = selectedFabricItem.price_per_meter || selectedFabricItem.selling_price || 0;
```

Change to match the smart base logic from DynamicWindowWorksheet line 3297:
```typescript
const hasBothPrices = (selectedFabricItem?.cost_price || 0) > 0 
  && (selectedFabricItem?.selling_price || 0) > 0;
const pricePerMeter = hasBothPrices
  ? selectedFabricItem.cost_price
  : (selectedFabricItem?.selling_price 
     || selectedFabricItem?.price_per_meter 
     || selectedFabricItem?.cost_price 
     || 0);
```

This ensures `fabricCalculation.pricePerMeter` is ALWAYS cost-based when both prices exist. Then:
- Save path (line 1886): saves 145 (cost)
- `applyMarkupToItem`: applies 100% to 145 = 290 (correct selling)
- No doubling. No stale data cycle.

#### Fix 3: Also fix the DB restore path (line 844)

**File:** `DynamicWindowWorksheet.tsx`, line 844

Currently loads stale selling price from DB. When re-saving, this flows back through the save path. Fix by also applying smart base on the selectedItems at save time as a safety net.

**File:** `DynamicWindowWorksheet.tsx`, line 1886 and line 2224

Replace `fabricCalculation?.pricePerMeter || 0` with a direct lookup from the live selected fabric item:
```typescript
price_per_meter: (() => {
  const item = selectedItems?.fabric || selectedItems?.material;
  if (!item) return fabricCalculation?.pricePerMeter || 0;
  const hasBoth = (item.cost_price || 0) > 0 && (item.selling_price || 0) > 0;
  return hasBoth ? item.cost_price : (item.selling_price || item.price_per_meter || item.cost_price || fabricCalculation?.pricePerMeter || 0);
})(),
```

Same for `unit_price` at line 2224.

This is a belt-and-suspenders approach — even if VisualMeasurementSheet somehow passes the wrong value, the save path will independently resolve the correct cost base from the live selected item.

### Summary of All Changes

| File | Line(s) | What | Why |
|---|---|---|---|
| `DynamicWindowWorksheet.tsx` | 709-713 | Add `parseFloat(toFixed(4))` to rail_width initial load | Fixes infinite decimal on page open |
| `DynamicWindowWorksheet.tsx` | 719-723 | Add `parseFloat(toFixed(4))` to drop initial load | Fixes infinite decimal on page open |
| `VisualMeasurementSheet.tsx` | 462 | Smart price base: use `cost_price` when both exist | ROOT FIX: stops selling price from entering fabricCalculation |
| `DynamicWindowWorksheet.tsx` | 1886 | Direct smart base from `selectedItems` for `price_per_meter` | Belt-and-suspenders: ensures cost-based save even with stale fabricCalculation |
| `DynamicWindowWorksheet.tsx` | 2224 | Direct smart base from `selectedItems` for `unit_price` | Same protection for cost_breakdown |

### After the Fix

| Scenario | Saved Value | Markup | Display |
|---|---|---|---|
| Fabric with cost=145, selling=290 | unit_price=145 | implied_markup=100% | 290 (correct) |
| Fabric with only selling=290 | unit_price=290 | implied_markup=0% | 290 (correct) |
| Drop input 108.5 inches | Stored as 2755.9mm | Converted back | 108.5 (rounded, correct) |


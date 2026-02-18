

## Fix: Three Separate Issues in the Worksheet and Quote Display

### Issue 1: Infinite Decimal in Drop Input (e.g., 108.49999999999999)

**Root Cause**: Floating-point precision loss during unit conversion round-trips.

When the worksheet loads saved data:
1. User enters `108.5` (in inches)
2. Save converts to MM: `108.5 * 25.4 = 2755.9`
3. On reload, the useEffect (line 904) converts back: `2755.9 / 25.4 = 108.49999999999999...`
4. This unrounded string is set as the input value

This only affects Drop (and Rail Width) when the user's unit involves non-integer conversion factors (inches, feet, yards).

**Fix**: Round the converted value in the useEffect at line 904-906 of `DynamicWindowWorksheet.tsx`. Apply `parseFloat(value.toFixed(4))` to truncate floating-point noise while preserving user precision (e.g., `.25`, `.5`).

```
Before:
  convertLength(storedDropMM, 'mm', units.length).toString()

After:
  parseFloat(convertLength(storedDropMM, 'mm', units.length).toFixed(4)).toString()
```

Same fix for `convertedWidth` on line 898.

**Files**: `DynamicWindowWorksheet.tsx` (lines 898 and 905)

---

### Issue 2: Fabric Price Shows unit_price (580) Instead of Selling Price

**Root Cause**: In the WindowSummaryCard, line 237 reads `fabricUnitPrice = Number(summary.price_per_meter)`. The `price_per_meter` saved in the summary (line 1887-1889 of DynamicWindowWorksheet) falls through to `unit_price` when `selling_price` is falsy.

But the real issue is that `price_per_meter` saved to the database at line 1887-1889 uses the smart base selection for the save path, which correctly picks `cost_price` when both exist. However, for display in the WindowSummaryCard, we should show the **selling price**, not the cost-based price.

The fix has two parts:

**Part A**: The save path (line 1887-1889) should save the **display price** (selling price) to `price_per_meter`, since this field is used by WindowSummaryCard for client-facing display:

```
Before:
  price_per_meter: selectedItems.fabric?.selling_price || selectedItems.fabric?.unit_price || ...

After (apply smart display price logic):
  price_per_meter: (() => {
    const item = selectedItems.fabric || selectedItems.material;
    const hasBoth = (item?.cost_price || 0) > 0 && (item?.selling_price || 0) > 0;
    return hasBoth
      ? item.selling_price
      : (item?.selling_price || item?.price_per_meter || item?.cost_price || fabricCalculation?.pricePerMeter || 0);
  })()
```

**Part B**: Same logic for the cost_breakdown's fabric `unit_price` at line 2228:

```
Before:
  unit_price: selectedItems.fabric?.selling_price || selectedItems.material?.selling_price || ...

After:
  unit_price: (() => {
    const item = selectedItems.fabric || selectedItems.material;
    const hasBoth = (item?.cost_price || 0) > 0 && (item?.selling_price || 0) > 0;
    return hasBoth
      ? item.selling_price
      : (item?.selling_price || item?.price_per_meter || item?.cost_price || fabricCalculation?.pricePerMeter || 0);
  })()
```

This ensures the saved display fields always carry the selling price, not the internal cost base.

**Files**: `DynamicWindowWorksheet.tsx` (lines 1887-1889 and 2228)

---

### Issue 3: "Manufacturing" Naming and Cost Price Visibility

**Problem A**: The label still shows "Manufacturing" in several places instead of "Making/Labor (machine)" or "Making/Labor (hand)".

The CostCalculationSummary calculator popup (line 1165) already shows `Making/Labor (machine)` correctly. But these locations still say "Manufacturing":

| Location | File | Line | Current | Should Be |
|---|---|---|---|---|
| Save cost_breakdown | DynamicWindowWorksheet.tsx | 2288 | `name: 'Manufacturing'` | `name: 'Making/Labor'` |
| Save cost_breakdown description | DynamicWindowWorksheet.tsx | 2289 | `'Hand Finished' / 'Machine Finished'` | Keep as description |
| WindowSummaryCard display | WindowSummaryCard.tsx | 356 | `name: 'Manufacturing'` | `name: 'Making/Labor'` |
| WindowSummaryCard description | WindowSummaryCard.tsx | 357 | `summary.manufacturing_type || 'Assembly & Manufacturing'` | `manufacturing_type === 'hand' ? 'Hand Finished' : 'Machine Finished'` |

**Fix**: Update the `name` field to `Making/Labor` and use the `manufacturing_type` value dynamically in the description.

For DynamicWindowWorksheet line 2288-2289:
```
name: 'Making/Labor',
description: measurements.manufacturing_type === 'hand' ? 'Hand Finished' : 'Machine Finished',
```

For WindowSummaryCard line 354-361:
```
name: `Making/Labor (${summary.manufacturing_type === 'hand' ? 'hand' : 'machine'})`,
description: summary.manufacturing_type === 'hand' ? 'Hand Finished' : 'Machine Finished',
```

**Problem B**: WindowSummaryCard (the Cost Breakdown) shows cost price (₹580/m) instead of selling price. This is addressed by Issue 2 fix above -- once the saved `price_per_meter` carries the selling price, the display will be correct.

**Files**: `DynamicWindowWorksheet.tsx` (lines 2286-2292), `WindowSummaryCard.tsx` (lines 354-361)

---

### Summary of All Changes

| File | Change |
|---|---|
| `DynamicWindowWorksheet.tsx` line 898 | Round converted rail_width to 4 decimals |
| `DynamicWindowWorksheet.tsx` line 905 | Round converted drop to 4 decimals |
| `DynamicWindowWorksheet.tsx` lines 1887-1889 | Save selling price (not cost) to `price_per_meter` |
| `DynamicWindowWorksheet.tsx` line 2228 | Save selling price (not cost) to cost_breakdown `unit_price` |
| `DynamicWindowWorksheet.tsx` lines 2286-2292 | Rename "Manufacturing" to "Making/Labor" in cost_breakdown |
| `WindowSummaryCard.tsx` lines 354-361 | Rename "Manufacturing" to "Making/Labor (machine/hand)" with dynamic type |


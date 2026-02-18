

## Fix: Revert unit_price and price_per_meter Back to Cost-Based

### The Bug (crystal clear)

The previous fix changed `unit_price` and `price_per_meter` to save selling_price (290). But `WindowSummaryCard.applyMarkupToItem()` applies markup to EVERY saved value:

```text
Saved: unit_price = 290 (selling), implied_markup = 100%
Display: applyMarkup(290, 100%) = 580  <-- DOUBLED!
```

The correct flow should be:
```text
Saved: unit_price = 145 (cost), implied_markup = 100%
Display: applyMarkup(145, 100%) = 290  <-- CORRECT selling price
```

### The Fix (two reverts in one file)

**File: `DynamicWindowWorksheet.tsx`**

**Change 1 -- line 2234-2240**: Revert `unit_price` back to cost-based `pricePerMeter`

```
Before (broken):
  unit_price: (() => {
    const item = selectedItems.fabric || selectedItems.material;
    const hasBoth = (item?.cost_price || 0) > 0 && (item?.selling_price || 0) > 0;
    return hasBoth
      ? item.selling_price
      : (item?.selling_price || ...);
  })()

After (correct):
  unit_price: pricePerMeter,
```

`pricePerMeter` is already the smart-base-selected cost_price (set at line 3313). Simple, one value.

**Change 2 -- line 1887-1895**: Revert `price_per_meter` back to cost-based

```
Before (broken):
  price_per_meter: (() => {
    const item = ...;
    const hasBoth = ...;
    return hasBoth ? item.selling_price : ...;
  })()

After (correct):
  price_per_meter: pricePerMeter || fabricCalculation?.pricePerMeter || 0,
```

Same reason -- the fallback path in WindowSummaryCard (line 237) reads `price_per_meter` and passes it through `applyMarkupToItem` which applies the implied markup. If the stored value is already selling, it gets doubled.

### Why This Works

| Field | Saved Value | Markup Applied | Display Value |
|---|---|---|---|
| `total_cost` | 3,197 (cost) | 100% | 6,394 (selling) |
| `unit_price` | 145 (cost) | 100% | 290 (selling) |
| `price_per_meter` | 145 (cost) | 100% | 290 (selling) |

All three display as selling prices. No doubling. No cost price leaking.

### What About the displayPricePerMeter?

The `displayPricePerMeter` added to `fabricDisplayData` for the live calculator popup formula strings (CostCalculationSummary) remains as selling_price. That path does NOT go through `applyMarkupToItem` -- it is used directly in a display string. So it correctly shows "22.05m x 290/m".

### Files to Change

| File | Line | Change |
|---|---|---|
| `DynamicWindowWorksheet.tsx` | 2234-2240 | Replace IIFE with simple `pricePerMeter` |
| `DynamicWindowWorksheet.tsx` | 1887-1895 | Replace IIFE with simple `pricePerMeter` fallback |

One file. Two lines. Both reverts to cost-based storage.

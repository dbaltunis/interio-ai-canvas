

## Fix: Third Price Path in DynamicWindowWorksheet Not Updated

### The Problem

We fixed `useFabricCalculator.ts` and `calculateTreatmentPricing.ts` to use the smart price base (cost_price when both exist), but missed a **third path** in `DynamicWindowWorksheet.tsx` that still uses `selling_price` as the base.

### The Chain of the Bug

```text
Line 3301: pricePerMeter = selling_price (290)
Line 3366: fabricCost = 22.05m x 290 = 6394.50
Line 1748-1753: impliedMarkup = (290-145)/145 = 100%
Line 1797: fabricSelling = applyMarkup(6394.50, 100%) = 12,789  <-- DOUBLED!
```

The base is 290 (selling), but the markup system detects 100% implied markup from cost vs selling and applies it again.

### The Fix (one location)

**File: `DynamicWindowWorksheet.tsx`, line 3299-3303**

Apply the same smart conditional used everywhere else:

```
Before:
  const pricePerMeter = selectedFabricItem?.selling_price
    || selectedFabricItem?.price_per_meter
    || selectedFabricItem?.cost_price

After:
  const hasBothPrices = (selectedFabricItem?.cost_price || 0) > 0
    && (selectedFabricItem?.selling_price || 0) > 0;
  const pricePerMeter = hasBothPrices
    ? selectedFabricItem.cost_price
    : (selectedFabricItem?.selling_price
      || selectedFabricItem?.price_per_meter
      || selectedFabricItem?.cost_price || 0);
```

There is also a second occurrence at line 1341 that uses `fabricCalculation?.pricePerMeter` which is already fixed (comes from useFabricCalculator). But the line 3301 occurrence is hardcoded and was never updated.

### Why This Only Breaks Some Accounts

- If a fabric has only `selling_price` (no `cost_price`): `impliedMarkup = 0` (since cost is 0). No double markup. Works fine.
- If a fabric has both prices (cost=145, selling=290): `impliedMarkup = 100%`. The base is already 290 (selling), then 100% markup is applied on top. Price doubles.

### Files to Change

| File | Line | Change |
|---|---|---|
| `DynamicWindowWorksheet.tsx` | 3299-3303 | Apply smart price base conditional (same as useFabricCalculator) |

One file, one location. The root cause of the doubling.


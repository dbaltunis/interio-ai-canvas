

## Fix: Smart Price Base Selection — Handle All Inventory Scenarios

### The Real Problem

The current code has two paths that make opposite assumptions:

| File | What it does | Breaks when... |
|---|---|---|
| `useFabricCalculator.ts` | Uses `selling_price` as base, skips markup | Client only has `cost_price` (no selling) |
| `calculateTreatmentPricing.ts` | Uses `cost_price` as base, applies markup | Client only has `selling_price` (no cost) |

Your point is exactly right: if a client only enters selling_price=290 and leaves cost_price empty, the saving engine would use 0. And if they only enter cost_price=145, the calculator would use 0. Both are wrong.

### The Correct Logic

One smart conditional that works for ALL scenarios:

```text
Scenario A: Has BOTH cost_price AND selling_price (e.g., 145 / 290)
  -> Base = cost_price (145)
  -> Implied markup = (290-145)/145 = 100%
  -> resolveMarkup picks up implied markup
  -> Selling = 145 * (1 + 100%) = 290

Scenario B: Has ONLY selling_price (e.g., 0 / 290)
  -> Base = selling_price (290)
  -> No implied markup (selling IS the base)
  -> No additional markup applied (markup = 0%)
  -> Selling = 290

Scenario C: Has ONLY cost_price (e.g., 145 / 0)
  -> Base = cost_price (145)
  -> No implied markup
  -> Category/default markup applied normally
  -> Selling = 145 * (1 + category%)

Scenario D: Has price_per_meter only (legacy)
  -> Base = price_per_meter
  -> Category/default markup applied
```

### What Changes

#### File 1: `useFabricCalculator.ts` (line 183-185)

Replace the simple fallback with the smart conditional:

```typescript
// Smart price base: use cost_price when both exist (markup handles the rest),
// otherwise fall back to selling_price or price_per_meter
const hasBothPrices = fabric.cost_price > 0 && fabric.selling_price > 0;
const effectivePricePerMeter = hasBothPrices
  ? fabric.cost_price                    // Scenario A: markup system will add implied markup
  : (fabric.selling_price || fabric.price_per_meter || fabric.cost_price || 0);  // Scenario B/C/D

// Flag for downstream: does this price already include markup?
const priceIsAlreadySelling = !hasBothPrices && fabric.selling_price > 0;
```

Also return `priceIsAlreadySelling` and `hasBothPrices` in the result object so `CostCalculationSummary` can display correctly.

#### File 2: `calculateTreatmentPricing.ts` (line 170)

Apply the same smart conditional (currently it already prioritizes cost_price, but needs the same guard):

```typescript
const hasBothPrices = (fabricItem?.cost_price || 0) > 0 && (fabricItem?.selling_price || 0) > 0;
const pricePerMeter = hasBothPrices
  ? fabricItem.cost_price
  : (fabricItem?.selling_price || fabricItem?.price_per_meter || fabricItem?.unit_price || 0);
```

Also save markup metadata in the cost_breakdown item (lines 428-442):

```typescript
{
  id: 'fabric',
  unit_price: pricePerMeter,
  total_cost: fabricCost,
  category: 'fabric',
  cost_price: fabricItem?.cost_price,
  selling_price: fabricItem?.selling_price,
  markup_percentage: fabricItem?.markup_percentage,
  pricing_grid_markup: fabricItem?.pricing_grid_markup,
  price_is_already_selling: !hasBothPrices && (fabricItem?.selling_price || 0) > 0,
}
```

#### File 3: `CostCalculationSummary.tsx` (lines 1094-1132)

Replace the `curtainFabricAlreadyHasMarkup` bypass with proper conditional logic:

```typescript
// Remove old variables (lines 1094-1101)
// Replace with:
const fabricHasBothPrices = (fabricToUse?.cost_price || 0) > 0 && (fabricToUse?.selling_price || 0) > 0;
const fabricPriceIsAlreadySelling = !fabricHasBothPrices && (fabricToUse?.selling_price || 0) > 0;

// Then in the table item (lines 1126-1131):
tableItems.push({
  name: 'Fabric',
  details: fabricDetails,
  price: fabricCost,
  category: 'fabric',
  // If base IS selling price, markup = 0. If base is cost, use resolved markup.
  markupPercentage: fabricPriceIsAlreadySelling ? 0 : fabricMarkupPercent,
  sellingPrice: fabricPriceIsAlreadySelling
    ? fabricCost                                    // Already at selling price
    : applyMarkup(fabricCost, fabricMarkupPercent)   // Apply resolved markup to cost
});
```

This is different from the old code because:
- Old: `curtainFabricAlreadyHasMarkup` was true for ANY library item (even when base was cost_price), wrongly skipping markup
- New: `fabricPriceIsAlreadySelling` is only true when selling_price is the base (Scenario B), correctly skipping markup only when appropriate

#### File 4: `WindowSummaryCard.tsx` (lines 145-183)

Update `applyMarkupToItem` to use the saved metadata:

```typescript
// If the item flagged that its price is already selling, skip markup
if (item.price_is_already_selling) {
  return { ...item, selling_price_calculated: item.total_cost };
}

// Otherwise compute implied markup from saved cost/selling
const itemCost = item.cost_price || 0;
const itemSelling = item.selling_price || 0;
const computedImpliedMarkup = (itemCost > 0 && itemSelling > itemCost)
  ? ((itemSelling - itemCost) / itemCost) * 100
  : undefined;

const markupResult = resolveMarkup({
  impliedMarkup: computedImpliedMarkup,
  productMarkup: item.markup_percentage,
  gridMarkup: item.pricing_grid_markup,
  ...
});
```

### Verification Table

| Scenario | cost_price | selling_price | Base Used | Markup | Final/m |
|---|---|---|---|---|---|
| A: Both prices | 145 | 290 | 145 | 100% (implied) | 290 |
| B: Selling only | 0 | 290 | 290 | 0% (already selling) | 290 |
| C: Cost only | 145 | 0 | 145 | Category % | 145 * (1+cat%) |
| D: Legacy | 0 | 0, ppm=26.50 | 26.50 | Category % | 26.50 * (1+cat%) |

All four scenarios produce consistent results across Calculator, Quote Summary, Saved Breakdown, and Work Orders.

### Files to Change

| File | Change |
|---|---|
| `useFabricCalculator.ts` | Smart price base conditional + return flags |
| `calculateTreatmentPricing.ts` | Same conditional + save markup metadata in breakdown |
| `CostCalculationSummary.tsx` | Replace `curtainFabricAlreadyHasMarkup` with `fabricPriceIsAlreadySelling` |
| `WindowSummaryCard.tsx` | Use saved metadata for consistent markup resolution |



# ROOT CAUSE IDENTIFIED: Missing Fix for Base Price Resolution

## What's Actually Happening

| What Should Display | What's Displaying | Cause |
|---------------------|-------------------|-------|
| **Cost**: 24.08m × ₹440 = ₹10,595 | **Cost**: 24.08m × ₹924 = ₹22,249 | Using `selling_price` instead of `cost_price` |
| **Sell**: ₹10,595 + 110% = ₹22,249 | **Sell**: ₹24,009 (same as cost) or + markup | Cost already inflated |

The COST column is showing the SELLING price value (₹924/m) instead of the COST price value (₹440/m). This is NOT a markup issue - the BASE PRICE is wrong.

---

## The Bug Location

**File**: `src/components/measurements/DynamicWindowWorksheet.tsx`  
**Lines**: 2994-2997

```typescript
// CURRENT CODE (WRONG):
const pricePerMeter = selectedFabricItem?.price_per_meter 
  || selectedFabricItem?.selling_price   // ← Using selling_price (₹924)!
  || fabricCalculation?.pricePerMeter 
  || 0;
```

This `pricePerMeter` is then:
- Used to calculate `fabricCost` (line 3058: `fabricCost = totalMeters * pricePerMeter`)
- Passed to `fabricDisplayData.pricePerMeter` (line 3356)
- Displayed in Cost column as the BASE cost

---

## Why This Wasn't Fixed Earlier

In the approved plan, I stated this should be changed to prioritize `cost_price`. However, I did NOT actually make this edit. The CostCalculationSummary.tsx changes for implied markup were made, but the fundamental pricePerMeter source fix was missed.

---

## The Fix

**File**: `src/components/measurements/DynamicWindowWorksheet.tsx`

Change lines 2994-2997:

```typescript
// BEFORE (current - WRONG):
const pricePerMeter = selectedFabricItem?.price_per_meter 
  || selectedFabricItem?.selling_price 
  || fabricCalculation?.pricePerMeter 
  || 0;

// AFTER (correct):
// ✅ FIX: Use cost_price as base - markup is applied separately in CostCalculationSummary
// This ensures Cost column shows actual cost, and Sell column shows cost + markup
const pricePerMeter = selectedFabricItem?.cost_price
  || selectedFabricItem?.price_per_meter 
  || selectedFabricItem?.selling_price  // Fallback only if no cost_price
  || fabricCalculation?.pricePerMeter 
  || 0;
```

---

## Expected Result After Fix

| Field | Before (Buggy) | After (Fixed) |
|-------|----------------|---------------|
| Price per meter (base) | ₹924 (selling_price) | ₹440 (cost_price) |
| Cost (24.08m × price) | ₹22,249 | ₹10,595 |
| Markup applied | 0% (settings respected now) | 110% (implied from library) |
| Sell | ₹22,249 | ₹22,249 (₹10,595 × 2.1) |
| GP% | 0% | 51% |

---

## Why This Is The Only Change Needed

1. **Markup settings fix (already deployed)**: Defaults are now 0%, nullish coalescing preserves user's 0% values ✓
2. **Implied markup for curtains (already deployed)**: CostCalculationSummary now calculates implied markup from cost_price vs selling_price ✓
3. **Base price resolution (NOT YET DONE)**: pricePerMeter must use cost_price, not selling_price ← **THIS IS THE FIX**

---

## Files to Modify

| File | Line | Change |
|------|------|--------|
| `src/components/measurements/DynamicWindowWorksheet.tsx` | 2994-2997 | Add `cost_price` as first priority in pricePerMeter resolution |

---

## Technical Note: Why Cost vs Selling Price Matters

- **cost_price (₹440)**: What your client PAYS the supplier - this is the BASE for calculations
- **selling_price (₹924)**: What your client CHARGES customers - this includes their 110% markup
- **Cost column**: Should show `meters × cost_price` = actual expense
- **Sell column**: Should show `Cost × (1 + markup%)` = revenue

The current code treats the selling price AS the cost, then potentially applies additional markup, causing double-charging.


## Fix: 5.10m vs 5.08m Linear Meters Discrepancy

### Root Cause

Two different calculators compute fabric linear meters using slightly different rounding:

1. **`calculateTreatmentPricing.ts`** (the "engine") -- computes the **exact** value (e.g., 5.08m) with no rounding
2. **`orientationCalculator.ts`** (used by `fabricCalculation`) -- applies `Math.ceil(totalMeters * 10) / 10` on line 241, which **rounds UP** to the nearest 0.1m, turning 5.08m into 5.10m

The pricing display (`AdaptiveFabricPricingDisplay.tsx`) reads from `fabricCalculation.linearMeters` (rounded = 5.10m), while the Quote Summary (`CostCalculationSummary.tsx`) reads from `engineResult.linear_meters` (exact = 5.08m). This creates the mismatch.

### Why the Rounding Exists (and Why It Should Be Removed)

The `Math.ceil` rounding in `orientationCalculator.ts` was likely intended as a "safe ordering buffer." However:
- It inflates the price (5.10 x 26.50 = 135.15 vs 5.08 x 26.50 = 134.62 -- a 0.53 overcharge)
- It conflicts with the engine's exact calculation, creating user-visible inconsistency
- The engine (`calculateTreatmentPricing.ts`) is the authoritative pricing source and does not round

### Fix

**File: `src/components/job-creation/treatment-pricing/fabric-calculation/orientationCalculator.ts`**

Remove the `Math.ceil` rounding on line 241 so `totalMeters` is returned as the exact value, matching the engine:

```
// Before (line 241):
totalMeters: Math.ceil(totalMeters * 10) / 10,

// After:
totalMeters,
```

Also apply the same fix to `totalYards` on line 240 for consistency:

```
// Before (line 240):
totalYards: Math.ceil(totalYards * 10) / 10,

// After:
totalYards,
```

This is a 2-line change in a single file. Both display locations will now show the same exact value (5.08m), and the price will be mathematically accurate.

This fix applies to **all treatment types** that use the orientation calculator, not just curtains.

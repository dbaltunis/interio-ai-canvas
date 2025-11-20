# Fabric Calculation Architecture

## Critical Principle: Single Source of Truth

**ALL fabric calculations MUST originate from `orientationCalculator.ts` and flow through `useFabricCalculator` hook.**

## Data Flow

```
User Input (Measurements)
  ↓
orientationCalculator.ts
  ├─ Calculates linearMeters (includes ALL allowances)
  ├─ Includes: rail width × fullness
  ├─ Includes: side hems
  ├─ Includes: returns (left + right)
  ├─ Includes: SEAM ALLOWANCES ← CRITICAL
  ├─ Includes: header/bottom hems (vertical)
  ├─ Includes: pattern repeat adjustments
  ↓
useFabricCalculator Hook
  ↓
fabricCalculation Object
  ├─ linearMeters (per piece)
  ├─ horizontalPiecesNeeded
  ├─ pricePerMeter
  ├─ fabricOrientation
  ├─ seamsRequired
  ├─ widthsRequired
  ↓
DynamicWindowWorksheet.tsx (SINGLE CALCULATION POINT)
  ├─ Calculate: totalMeters = linearMeters × horizontalPiecesNeeded
  ├─ Calculate: fabricCost = totalMeters × pricePerMeter
  ├─ Calculate: liningCost, manufacturingCost, headingCost, optionsCost
  ├─ Save to calculatedCosts state
  ↓
Pass calculatedCosts to display components
  ├─ AdaptiveFabricPricingDisplay (DISPLAY ONLY)
  └─ CostCalculationSummary (DISPLAY ONLY)
```

## DO NOT Recalculate

❌ **NEVER** manually recalculate fabric requirements in display components
❌ **NEVER** use formulas like: `(railWidth × fullness) + sideHems + returns`
❌ **NEVER** add waste percentage in display components

✅ **ALWAYS** use `fabricCalculation.linearMeters` from orientationCalculator
✅ **ALWAYS** multiply by `horizontalPiecesNeeded` for total order
✅ **ALWAYS** pass pre-calculated values to display components

## Why This Matters

**Problem:** Manual recalculation misses seam allowances, causing discrepancies:
- Display shows: 8.30m (missing seams)
- Actual need: 8.20m (includes seams)

**Solution:** Use the single source of truth from orientationCalculator.

## Files Involved

1. **src/utils/fabricCalculations/orientationCalculator.ts**
   - Source of truth for ALL fabric calculations
   - Includes ALL allowances (side hems, returns, seams)

2. **src/components/shared/measurement-visual/hooks/useFabricCalculator.ts**
   - Hook that wraps orientationCalculator
   - Returns fabricCalculation object

3. **src/components/measurements/DynamicWindowWorksheet.tsx**
   - SINGLE CALCULATION POINT
   - Calculates all costs once
   - Saves to calculatedCosts state
   - Passes calculated values to children

4. **src/components/measurements/fabric-pricing/AdaptiveFabricPricingDisplay.tsx**
   - DISPLAY ONLY (no calculation)
   - Shows fabric cost using fabricCalculation.linearMeters

5. **src/components/measurements/dynamic-options/CostCalculationSummary.tsx**
   - DISPLAY ONLY (no calculation)
   - Uses fabricDisplayData prop (pre-calculated values)

## Formula Reference

### Horizontal/Railroaded Fabric
```
linearMeters = from orientationCalculator (includes ALL allowances)
totalMetersToOrder = linearMeters × horizontalPiecesNeeded
fabricCost = totalMetersToOrder × pricePerMeter
```

### Vertical Fabric
```
linearMeters = from orientationCalculator (includes ALL allowances)
fabricCost = linearMeters × pricePerMeter
```

## Validation

To verify correct implementation:

1. **Check DynamicWindowWorksheet.tsx:**
   - Uses `fabricCalculation.linearMeters` directly ✅
   - Multiplies by `horizontalPiecesNeeded` ✅
   - Saves to `calculatedCosts` state ✅

2. **Check AdaptiveFabricPricingDisplay.tsx:**
   - NO manual calculation of rail width, fullness, etc. ✅
   - Uses `fabricCalculation.linearMeters` directly ✅

3. **Check CostCalculationSummary.tsx:**
   - Uses `fabricDisplayData` prop (pre-calculated) ✅
   - Fallback to `fabricCalculation` if needed ✅

4. **Verify displays show identical values:**
   - "Fabric Cost" section ✅
   - "Cost Summary" section ✅
   - Both should match exactly ✅

## Common Mistakes to Avoid

❌ Adding calculations in components:
```typescript
// WRONG - This misses seam allowances!
const requiredWidth = (railWidth * fullness) + sideHems + returns;
```

✅ Use the pre-calculated value:
```typescript
// CORRECT - Already includes everything
const linearMeters = fabricCalculation.linearMeters;
```

❌ Different formulas in different places
✅ Single calculation point in DynamicWindowWorksheet

❌ Recalculating for display
✅ Display pre-calculated values only

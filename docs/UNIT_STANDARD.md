# Unit Conversion Standard

## CRITICAL: Internal Unit Standard

**ALL internal measurements are stored in MILLIMETERS (MM)**

This is the single source of truth for the entire application.

### The Rules

1. **Database Storage**: All measurements in the database are stored in MM
   - `rail_width` → MM
   - `drop` → MM
   - `pooling_amount` → MM
   - `return_left`, `return_right` → MM
   - `stackback_left`, `stackback_right` → MM
   - `wall_width`, `wall_height` → MM

2. **Input Boundaries**: Convert TO MM immediately when receiving data
   - User form inputs → convert to MM before saving
   - Database reads → already in MM, use as-is
   - API responses → convert to MM on receipt

3. **Output Boundaries**: Convert FROM MM only at display
   - UI display → convert from MM to user's preferred unit
   - PDF generation → convert from MM to user's preferred unit
   - API requests → convert from MM to required format

4. **Internal Calculations**: Work in MM or CM depending on context
   - General calculations → use MM
   - Fabric calculations → convert to CM (fabric industry standard)
   - Area calculations → convert to appropriate unit (sqm, sqft, etc.)

### Exception: Fabric Calculations

The fabric industry uses **centimeters (CM)** for width and length measurements.

When performing fabric calculations:
1. Convert MM to CM at the start of fabric calculation functions
2. Perform all fabric calculations in CM
3. Store fabric calculation results in CM
4. Convert back to MM for storage if needed

Example:
```typescript
// Input: measurements from database (MM)
const railWidthMM = measurements.rail_width; // MM
const dropMM = measurements.drop; // MM

// Convert to CM for fabric calculation
const railWidthCM = mmToCM(railWidthMM);
const dropCM = mmToCM(dropMM);

// Perform fabric calculations in CM
const fabricCalculation = {
  railWidth: railWidthCM,  // CM
  drop: dropCM,            // CM
  linearMeters: calculateLinearMeters(railWidthCM, dropCM)
};

// When displaying, convert from CM to user's preferred unit
const displayValue = formatMeasurement(cmToMM(fabricCalculation.railWidth), userUnit);
```

### Safe Accessor Pattern

**ALWAYS use `useSafeMeasurements` hook to access measurement data:**

```typescript
import { useSafeMeasurements } from '@/hooks/useSafeMeasurements';

const Component = ({ measurements }) => {
  const safe = useSafeMeasurements(measurements);
  
  // ✅ CORRECT: Get MM values for internal use
  const railWidthMM = safe.getRailWidthMM();
  const dropMM = safe.getDropMM();
  
  // ✅ CORRECT: Get CM values for fabric calculations
  const railWidthCM = safe.getRailWidthCM();
  const dropCM = safe.getDropCM();
  
  // ✅ CORRECT: Get formatted strings for display
  const displayWidth = safe.formatRailWidth();
  const displayDrop = safe.formatDrop();
  
  // ❌ WRONG: Direct access without conversion
  const width = measurements.rail_width; // DON'T DO THIS
};
```

### Type Safety

Use the `TypedMeasurement` interface when values need to carry unit information:

```typescript
import { TypedMeasurement, toMM, fromMM } from '@/types/measurements';

// When receiving from user input
const userInput: TypedMeasurement = {
  value: 100,
  unit: 'cm'
};

// Convert to MM for internal use
const internalValue = toMM(userInput.value, userInput.unit);

// Convert back for display
const displayValue = fromMM(internalValue, userPreferredUnit);
```

### Common Pitfalls to Avoid

❌ **WRONG**: Assuming database values are in CM
```typescript
const width = parseFloat(measurements.rail_width); // Treats MM as CM = 10x error!
```

✅ **CORRECT**: Use safe accessor
```typescript
const safe = useSafeMeasurements(measurements);
const widthMM = safe.getRailWidthMM();
```

---

❌ **WRONG**: Mixing units without conversion
```typescript
const total = measurements.rail_width + fabricWidth; // MM + CM = wrong!
```

✅ **CORRECT**: Convert to same unit first
```typescript
const railWidthCM = safe.getRailWidthCM();
const total = railWidthCM + fabricWidth; // CM + CM = correct
```

---

❌ **WRONG**: Using `formatMeasurement` with CM values
```typescript
formatMeasurement(fabricCalculation.railWidth); // railWidth is in CM, expects MM!
```

✅ **CORRECT**: Convert CM to MM before formatting
```typescript
formatMeasurement(cmToMM(fabricCalculation.railWidth), userUnit);
```

### Files Updated with Safe Pattern

Priority files that use the safe accessor pattern:
1. ✅ `src/components/measurements/VisualMeasurementSheet.tsx`
2. ✅ `src/components/measurements/dynamic-options/CostCalculationSummary.tsx`
3. ✅ `src/components/measurements/fabric-pricing/AdaptiveFabricPricingDisplay.tsx`
4. ✅ `src/components/job-creation/treatment-pricing/fabric-calculation/fabricUsageCalculator.ts`

### Testing

All measurement-related code changes must include tests that verify:
1. 1000mm input produces expected results
2. Same measurement in different units produces identical calculations
3. Fabric calculations correctly use CM internally
4. Display formatting converts to user's preferred unit
5. No 10x or 100x errors in calculations

### Summary

**Remember**: MM is the internal standard. CM is for fabric calculations only. Convert at boundaries, not in the middle of calculations.

When in doubt, use `useSafeMeasurements` hook.

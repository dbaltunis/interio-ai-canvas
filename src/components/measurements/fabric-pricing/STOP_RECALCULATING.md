# ✅ FIXED: Single Source of Truth Architecture

## The Problem (SOLVED)

Previously, `AdaptiveFabricPricingDisplay.tsx` called `useCurtainEngine` locally (lines 62-69), even when `engineResult` was passed from the parent. This caused discrepancies because:

1. **Local call used different parameters**: `selectedOptions: []` (empty array), non-enriched fabric
2. **Parent call used correct parameters**: enriched fabric with pricing grid data, full options list

This caused different values:
- AdaptiveFabricPricingDisplay: 4.60m (local calculation with wrong params)
- CostCalculationSummary: 4.55m (parent's calculation with correct params)

## The Solution (IMPLEMENTED - Feb 2026)

### 1. Removed Local Calculation from AdaptiveFabricPricingDisplay

```typescript
// ❌ OLD CODE - REMOVED
const localEngineResult = useCurtainEngine({
  treatmentCategory,
  measurements,
  selectedTemplate: template,
  selectedFabric: selectedFabricItem,
  selectedOptions: [], // WRONG: Should have full options list
  units,
});
const engineResult = engineResultProp ?? localEngineResult; // Could use wrong result

// ✅ NEW CODE - DISPLAY ONLY
// This component is DISPLAY-ONLY
// engineResult comes from parent (DynamicWindowWorksheet calls useCurtainEngine once)
// fabricCalculation comes from parent (VisualMeasurementSheet calculates once)
// We NEVER recalculate here - only display the provided values
```

### 2. Single Calculation Point
All costs are calculated ONCE in `DynamicWindowWorksheet.tsx`:

```typescript
// Line 254: Single useCurtainEngine call
const engineResult = useCurtainEngine({
  treatmentCategory,
  surfaceId,
  projectId,
  measurements,
  selectedTemplate,
  selectedFabric: enrichedFabric, // ✅ Use enriched fabric with pricing grid data
  selectedOptions,                // ✅ Full options list
  units,
});
```

### 3. Pass Pre-Calculated Values to All Displays
Display components receive calculated values as props:

```typescript
<VisualMeasurementSheet
  engineResult={engineResult}  // ✅ Passes to AdaptiveFabricPricingDisplay
/>

<CostCalculationSummary
  engineResult={engineResult}
  fabricDisplayData={{
    linearMeters: perPieceMeters,
    totalMeters: totalMeters,
    pricePerMeter: pricePerMeter,
    horizontalPieces: piecesToDisplay,
    orientation: isRailroaded ? 'horizontal' : 'vertical'
  }}
/>
```

### 4. Display Components Are DISPLAY-ONLY

Both components now:
- ✅ Use pre-calculated values from parent
- ✅ NO local recalculation
- ✅ Show identical values
- ✅ Single source of truth
- ❌ NEVER call useCurtainEngine, useFabricCalculator, or any calculation functions

## Data Flow Architecture

```
User Input
    ↓
DynamicWindowWorksheet
    ├─→ useCurtainEngine() ────→ engineResult (SINGLE SOURCE)
    │                                  ↓
    └─→ VisualMeasurementSheet ←──────┴─────→ CostCalculationSummary
             ↓                                        ↓
        AdaptiveFabricPricingDisplay            QuoteSummaryTable
             (DISPLAY ONLY)                     (DISPLAY ONLY)
```

## Key Rules

1. **ONE calculation per render**: `DynamicWindowWorksheet` calls `useCurtainEngine` once
2. **Props flow down**: `engineResult` is passed as prop to all display components
3. **Display-only components**: Never call calculation functions directly
4. **Fallback chain**: `engineResult` → `fabricCalculation` → error state (no guessing)

## Related Files

- `src/components/measurements/DynamicWindowWorksheet.tsx` - Single calculation point
- `src/components/measurements/VisualMeasurementSheet.tsx` - Passes engineResult to children
- `src/components/measurements/fabric-pricing/AdaptiveFabricPricingDisplay.tsx` - Display only
- `src/components/measurements/dynamic-options/CostCalculationSummary.tsx` - Display only
- `src/engine/useCurtainEngine.ts` - The calculation hook (called ONCE in parent)

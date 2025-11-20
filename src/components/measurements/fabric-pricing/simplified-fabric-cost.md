# Fabric Cost Calculation Standard

## CRITICAL RULE: Single Source of Truth

**ALWAYS** use `fabricCalculation.linearMeters` from `orientationCalculator.ts`. This value is calculated ONCE and includes:
- Rail width × fullness
- Side hems
- Returns (left + right)
- **Seam allowances** (vertical AND horizontal seams)
- Header and bottom hems (for vertical orientation)
- Pattern repeat adjustments

## Architecture: Calculate Once, Display Many Times

```
orientationCalculator.ts
  ↓
fabricCalculation.linearMeters
  ↓
DynamicWindowWorksheet (calculate costs)
  ↓
calculatedCosts state
  ↓
Display components (NO recalculation)
```

## Formula for Vertical Fabric
```
Total Cost = linearMeters × pricePerMeter
Display: "X.XXm × $XX.XX/m"
```

## Formula for Horizontal/Railroaded Fabric  
```
Total Cost = (linearMeters × horizontalPiecesNeeded) × pricePerMeter
Display: "X.XXm × Y pieces = Z.ZZm × $XX.XX/m"
```

## DO NOT

❌ **NEVER** recalculate dimensions manually in display components
❌ **NEVER** use formulas like: `(railWidth × fullness) + sideHems + returns`
❌ **NEVER** add waste percentage in display logic

The `orientationCalculator` has already done ALL calculations correctly, including seam allowances which are often forgotten in manual calculations.

# Fabric Cost Calculation Standard

## CRITICAL RULE
**ALWAYS** use `fabricCalculation.linearMeters` for cost calculations. This value already includes:
- Rail width × fullness
- Side hems
- Returns (left + right)
- Seam allowances between widths
- Header and bottom hems
- Pattern repeat adjustments

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

## DO NOT recalculate dimensions manually
The orientationCalculator has already done all calculations correctly.

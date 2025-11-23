# CRITICAL: Measurement Unit Standards

**DO NOT MODIFY THIS FILE - IT DOCUMENTS CRITICAL SYSTEM BEHAVIOR**

## Database Storage Units - SOURCE OF TRUTH

All measurements stored in `measurements_details` field use **MILLIMETERS (MM)** as the base unit:

```typescript
measurements_details: {
  rail_width: 1000,    // 1000 MM = 100 CM = 1000mm
  drop: 1000,          // 1000 MM = 100 CM = 1000mm  
  unit: "mm"           // Confirms MM storage
}
```

## Conversion Rules for Calculations

### 1. Pricing Grid Lookups
- **Input**: Measurements in MM from database
- **Required**: Convert to CM for `getPriceFromGrid()`
- **Formula**: `widthCm = widthMm / 10`

```typescript
const widthMm = parseFloat(measurements.rail_width); // 1000mm
const widthCm = widthMm / 10; // 100cm
getPriceFromGrid(gridData, widthCm, dropCm);
```

### 2. Square Meter Calculations  
- **Input**: Measurements in MM from database
- **Required**: Convert to M for area calculation
- **Formula**: `widthM = widthMm / 1000`

```typescript
const widthMm = parseFloat(measurements.rail_width); // 1000mm
const widthM = widthMm / 1000; // 1.0m
const sqm = widthM * dropM; // 1.0 sqm
```

### 3. Per-Meter Pricing
- **Input**: Width in MM
- **Required**: Convert to M
- **Formula**: `widthM = railWidth / 1000`

### 4. Per-Square-Meter Pricing
- **Input**: Width and Drop in MM
- **Required**: Convert both to M
- **Formula**: `sqm = (railWidth / 1000) * (drop / 1000)`

### 5. Per-Panel Pricing
- **Input**: railWidth in MM, fabricWidth in CM
- **Formula**: `panels = Math.ceil((railWidth * fullness) / (fabricWidth * 10))`

## Files Using These Conversions

1. **src/utils/pricing/pricingStrategies.ts** - Core pricing calculations
2. **src/components/measurements/fabric-pricing/AdaptiveFabricPricingDisplay.tsx** - Display calculations
3. **src/components/job-creation/WindowSummaryCard.tsx** - Cost summary breakdown
4. **src/hooks/pricing/useFabricPricing.ts** - Fabric pricing hook
5. **src/components/job-creation/treatment-pricing/fabric-calculation/optionCostCalculator.ts** - Option pricing

## Common Errors to AVOID

❌ **WRONG**: Treating database MM as CM
```typescript
const widthCm = measurements.rail_width; // Treats 1000mm as 1000cm!
const widthM = widthCm / 100; // = 10m instead of 1m
```

✅ **CORRECT**: Convert MM to target unit
```typescript
const widthMm = measurements.rail_width; // 1000mm
const widthM = widthMm / 1000; // = 1m ✓
```

## Testing

When input is **1000mm × 1000mm**:
- Square meters should be: **1.0 sqm** (not 0.01 or 100)
- Grid lookup should use: **100cm** (not 1000cm or 10cm)
- Display should show: User's preferred unit (mm/cm/inches)

## Why This Matters

**CRITICAL FOR CLIENT INVOICING**: Incorrect unit conversions cause:
- 100x errors in square meter calculations  
- Inconsistent pricing for identical products
- Loss of client trust and potential revenue loss

**Last verified:** 2025-11-23
**Issue tickets:** Inconsistent pricing for fascia_type (NZ$65 vs NZ$160), sqm showing 101.60 instead of 1.0

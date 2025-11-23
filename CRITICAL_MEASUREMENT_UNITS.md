# CRITICAL: Measurement Unit Standards

**DO NOT MODIFY THIS FILE - IT DOCUMENTS CRITICAL SYSTEM BEHAVIOR**

## System Settings - Never Hardcode

### Currency Symbol
- **Source**: User settings via `useCurrency()` hook
- **Format**: Uses `getCurrencySymbol(currency)` utility
- **Usage**: All pricing calculations MUST use currency from settings
- **Fallback**: `$` only as emergency fallback

```typescript
// ✅ CORRECT: Get currency from settings
import { useCurrency } from "@/hooks/useCurrency";
import { getCurrencySymbol } from "@/utils/currency";

const currency = useCurrency();
const currencySymbol = getCurrencySymbol(currency);
```

```typescript
// ❌ WRONG: Hardcoded currency
const cost = `£${price.toFixed(2)}`; // Don't hardcode £, $, etc.
```

### Measurement Units
- **Source**: Business settings via `useBusinessSettings()` hook
- **Path**: `measurement_units` JSON field
- **Units**: Length (mm/cm/m/inches/feet), Area (sq_cm/sq_m), Fabric (cm/yards)

### Default Values (Template/Item Specific)
- **Fullness**: Should come from template or 2.5 as fallback
- **Fabric Width**: Should come from inventory item or 137cm as fallback

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

## Files Using These Standards

1. **src/utils/pricing/pricingStrategies.ts** - Core pricing calculations (currency from context)
2. **src/hooks/pricing/useCurrencyAwarePricing.ts** - Provides currency-aware calculation functions
3. **src/components/measurements/fabric-pricing/AdaptiveFabricPricingDisplay.tsx** - Display calculations
4. **src/components/job-creation/WindowSummaryCard.tsx** - Cost summary breakdown
5. **src/hooks/pricing/useFabricPricing.ts** - Fabric pricing hook
6. **src/components/job-creation/treatment-pricing/fabric-calculation/optionCostCalculator.ts** - Option pricing

## Hem Allowances - CRITICAL CONSTRAINTS

### RULE: Hem Allowances ONLY for Curtains and Roman Blinds
- **Roller Blinds:** Hem allowances MUST be 0 (no header/bottom/side hems)
- **Venetian Blinds:** Hem allowances MUST be 0
- **Shutters:** Hem allowances MUST be 0
- **Vertical Blinds:** Hem allowances MUST be 0
- **Curtains:** Hem allowances can be set per template (typically 8-15cm)
- **Roman Blinds:** Hem allowances can be set per template if needed

### Manufacturing Defaults Settings
The Manufacturing Defaults in settings should:
1. Show a WARNING that they apply ONLY to curtain templates
2. Default ALL hem values to 0 (zero) - users opt-in, not opt-out
3. Be hidden/ignored for non-curtain products

### Code Implementation
All calculation functions MUST:
- Use `template?.blind_header_hem_cm || template?.header_allowance || 0` (note the `|| 0` fallback)
- NEVER hardcode non-zero fallbacks like `|| 8` or `|| 15`
- ALL defaults must come from template settings, not code
- Log warnings when non-zero hems are detected for blinds/shutters

## Pricing Grid Display - SIMPLIFIED

### RULE: Grid Pricing Should Be Simple
- Show ONLY the consolidated grid price
- NO detailed breakdowns of fabric quantity × price formulas
- Display format: "Grid Price (150cm × 200cm): $XXX"
- Note: "Pricing grid includes all material and manufacturing costs"

### Why Simplify?
- Clients cannot verify complex grid calculations
- Different pricing grids may use different calculation methods
- Showing formulas creates confusion and support issues
- Grid price IS the final price - no need to show how it was calculated

## No Hardcoded Values Rule

### CRITICAL: All Values Must Come From Settings
**NEVER hardcode** any of the following in calculation functions:
- Currency symbols → Use `useCurrency()` hook
- Measurement units → Use `useBusinessSettings()` or `useMeasurementUnits()`
- Hem allowances → Use `template?.hem_value || 0` (zero fallback only)
- Fullness ratios → Use `template?.fullness_ratio || 1`
- Fabric widths → Use `fabricItem?.fabric_width`
- Waste percentages → Use `template?.waste_percent || 0`
- Default prices → Use template or inventory item prices

### Examples of FORBIDDEN Code:
```typescript
// ❌ WRONG - Hardcoded currency
const price = `£${amount}`;

// ✅ CORRECT - From settings
const currencySymbol = getCurrencySymbol(currency);
const price = `${currencySymbol}${amount}`;

// ❌ WRONG - Hardcoded hem fallback
const hem = template?.header_hem || 8;

// ✅ CORRECT - Zero fallback (opt-in, not opt-out)
const hem = template?.header_hem || 0;

// ❌ WRONG - Hardcoded fullness
const fullness = 2.5;

// ✅ CORRECT - From template
const fullness = template?.fullness_ratio || 1;
```

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

**CRITICAL FOR CLIENT INVOICING**: Incorrect unit conversions or hardcoded values cause:
- 100x errors in square meter calculations  
- Inconsistent pricing for identical products
- Loss of client trust and potential revenue loss

**Last verified:** 2025-11-23
**Issue tickets:** Inconsistent pricing for fascia_type (NZ$65 vs NZ$160), sqm showing 101.60 instead of 1.0

## Usage Example

```typescript
// Use the currency-aware hook for all pricing calculations
import { useCurrencyAwarePricing } from "@/hooks/pricing/useCurrencyAwarePricing";

const { currencySymbol, calculateOptionCost } = useCurrencyAwarePricing();
const result = calculateOptionCost(option, formData);
// result.calculation will have correct currency symbol from settings
```

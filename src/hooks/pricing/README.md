# Pricing Hooks & Utilities

Consolidated pricing logic for the entire application. All pricing calculations should use these hooks and utilities.

## Architecture Overview

```
useCompletePricing (Master Hook)
├── useFabricPricing
│   └── calculateFabricUsage (existing)
├── useOptionPricing
│   └── pricingStrategies (new)
└── laborCalculator (new)
```

## Hooks

### `useCompletePricing` - Master Hook
Complete pricing calculation for a treatment including fabric, options, and labor.

```tsx
import { useCompletePricing } from '@/hooks/pricing/useCompletePricing';

const pricing = useCompletePricing({
  formData,
  treatmentTypesData,
  selectedFabricItem,
  options,
  hierarchicalOptions,
  windowCoveringPricingMethod: 'per-panel',
  laborRate: 25,
  treatmentComplexity: 'moderate'
});

// Access results
pricing.totalCost
pricing.fabricCost
pricing.optionsCost
pricing.laborCost
pricing.optionDetails
pricing.warnings
```

### `useFabricPricing` - Fabric-Only Pricing
Calculate fabric costs and usage.

```tsx
import { useFabricPricing } from '@/hooks/pricing/useFabricPricing';

const fabricPricing = useFabricPricing({
  formData,
  treatmentTypesData,
  selectedFabricItem
});

// Access results
fabricPricing.fabricCost
fabricPricing.fabricUsage
fabricPricing.fabricUsageUnit // 'yards' or 'meters'
fabricPricing.fabricUsageResult // Full calculation details
```

### `useOptionPricing` - Options-Only Pricing
Calculate costs for selected options (traditional and hierarchical).

```tsx
import { useOptionPricing } from '@/hooks/pricing/useOptionPricing';

const optionPricing = useOptionPricing({
  formData,
  options,
  hierarchicalOptions,
  windowCoveringPricingMethod: 'per-panel'
});

// Access results
optionPricing.totalCost
optionPricing.optionDetails // Array of option costs with calculations
```

## Utilities

### Pricing Strategies (`/utils/pricing/pricingStrategies.ts`)
Core pricing calculation engine supporting all pricing methods:
- `fixed` - Fixed cost
- `per-unit` - Per unit pricing
- `per-panel` - Per curtain panel
- `per-drop` - Per drop/treatment
- `per-meter` / `per-linear-meter` - Per linear meter
- `per-yard` / `per-linear-yard` - Per linear yard
- `per-sqm` / `per-square-meter` - Per square meter
- `percentage` - Percentage of fabric cost
- `inherit` - Inherit from parent
- `pricing-grid` - Grid-based pricing

```tsx
import { calculatePrice, resolvePricingMethod } from '@/utils/pricing/pricingStrategies';

const result = calculatePrice('per-panel', {
  baseCost: 50,
  railWidth: 200,
  drop: 220,
  quantity: 1,
  fullness: 2.5,
  fabricWidth: 137
});

// result.cost = calculated cost
// result.calculation = human-readable calculation string
// result.breakdown = detailed breakdown
```

### Labor Calculator (`/utils/pricing/laborCalculator.ts`)
Centralized labor cost calculations.

```tsx
import { calculateLabor } from '@/utils/pricing/laborCalculator';

const laborResult = calculateLabor({
  railWidth: 200,
  drop: 220,
  fullness: 2.5,
  laborRate: 25,
  seamLaborHours: 0.5,
  treatmentComplexity: 'moderate' // 'simple', 'moderate', or 'complex'
});

// laborResult.hours = total labor hours
// laborResult.cost = total labor cost
// laborResult.breakdown = detailed breakdown
```

## Migration Guide

### Old Code
```tsx
const calculateOptionCost = (option: any, formData: any) => {
  // Complex switch statement
  // Duplicated logic
  // Hard to test
};

const fabricCost = fabricAmount * fabricCostPerYard;
const optionsCost = options.reduce(...);
const laborCost = laborRate * totalHours;
const totalCost = fabricCost + optionsCost + laborCost;
```

### New Code
```tsx
const pricing = useCompletePricing({
  formData,
  treatmentTypesData,
  selectedFabricItem,
  options,
  hierarchicalOptions,
  windowCoveringPricingMethod: 'per-panel'
});

// All calculations done, results ready to use
const totalCost = pricing.totalCost;
```

## Benefits

1. **Single Source of Truth** - All pricing logic in one place
2. **Testability** - Pure functions easy to unit test
3. **Maintainability** - Add new pricing methods in one place
4. **Type Safety** - Full TypeScript support
5. **Reusability** - Use hooks anywhere in the app
6. **Consistency** - Same calculations everywhere
7. **Performance** - Memoized calculations with useMemo

## Testing

```tsx
import { calculatePrice } from '@/utils/pricing/pricingStrategies';

describe('Pricing Strategies', () => {
  it('calculates per-panel pricing correctly', () => {
    const result = calculatePrice('per-panel', {
      baseCost: 50,
      railWidth: 200,
      fullness: 2.5,
      fabricWidth: 137,
      quantity: 1
    });
    
    expect(result.cost).toBeCloseTo(200); // 4 panels x £50
    expect(result.calculation).toContain('4 panels');
  });
});
```

## Future Enhancements

- [ ] Add currency conversion support
- [ ] Support for discount codes
- [ ] Bulk pricing tiers
- [ ] Tax calculation
- [ ] Multi-currency support
- [ ] Price history tracking

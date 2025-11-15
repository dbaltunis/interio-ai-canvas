# Unit Conversions & Pricing Guide

## 🎯 Problem We Solved

**Before:** Calculations were scattered throughout the codebase with manual conversions like:
```typescript
const price = length * pricePerMeter; // ❌ Wrong if length is in cm!
// Result: 300cm × €25 = €7500 (WRONG!)
```

**Now:** Centralized utility ensures correct calculations:
```typescript
import { calculateLengthPrice } from '@/utils/unitConversions';
const calc = calculateLengthPrice(300, 'cm', 25, 'meter');
// Result: 300cm → 3m → 3m × €25 = €75 (CORRECT!)
```

## 📦 What's Available

All utilities are in: `src/utils/unitConversions.ts`

### Core Functions

1. **`calculateLengthPrice()`** - Calculate total price with unit conversion
   ```typescript
   const calc = calculateLengthPrice(
     300,        // length value
     'cm',       // length unit
     25,         // price per meter
     'meter'     // pricing unit
   );
   
   console.log(calc.totalPrice);  // 75
   console.log(calc.formula);     // "300cm → 3meter × 25 = 75"
   ```

2. **`convertLength()`** - Convert between any two units
   ```typescript
   const result = convertLength(300, 'cm', 'm');
   console.log(result.value);  // 3
   ```

3. **`safeParseNumber()`** - Safely parse numbers with fallback
   ```typescript
   const value = safeParseNumber(userInput, 0);  // Returns 0 if invalid
   ```

4. **`calculateGridPrice()`** - Calculate from pricing tiers
   ```typescript
   const grid = [
     { length: 100, price: 17 },
     { length: 200, price: 34 }
   ];
   const price = calculateGridPrice(150, 'cm', grid);  // 34 (rounds up)
   ```

## 🚀 How to Use Everywhere

### In React Components

```typescript
import { calculateLengthPrice, LengthUnit } from '@/utils/unitConversions';

function PricingComponent() {
  const [length, setLength] = useState('300');
  const [unit, setUnit] = useState<LengthUnit>('cm');
  const pricePerMeter = 25;
  
  const calc = calculateLengthPrice(
    parseFloat(length),
    unit,
    pricePerMeter,
    'meter'
  );
  
  return (
    <div>
      <p>Total Price: €{calc.totalPrice}</p>
      <p>Formula: {calc.formula}</p>
    </div>
  );
}
```

### In Price Calculations

```typescript
// ❌ OLD WAY (WRONG):
const totalPrice = (drop / 100) * unitPrice;

// ✅ NEW WAY (CORRECT):
import { calculateLengthPrice } from '@/utils/unitConversions';
const calc = calculateLengthPrice(drop, 'cm', unitPrice, 'meter');
const totalPrice = calc.totalPrice;
```

### In Number Parsing

```typescript
// ❌ OLD WAY (UNSAFE):
const value = parseFloat(input) || 0;
const price = Number(cost) * Number(quantity);

// ✅ NEW WAY (SAFE):
import { safeParseNumber } from '@/utils/unitConversions';
const value = safeParseNumber(input, 0);
const price = safeParseNumber(cost) * safeParseNumber(quantity);
```

## ✅ Supported Units

### Length Units
- `'mm'` - Millimeters
- `'cm'` - Centimeters (most common)
- `'m'` - Meters
- `'inches'` - Inches
- `'feet'` - Feet
- `'yards'` - Yards

### Pricing Units
- `'meter'` - Price per meter (used for metric)
- `'foot'` - Price per foot (used for imperial)
- `'yard'` - Price per yard
- `'unit'` - Price per unit (no conversion)
- `'sqm'` - Price per square meter

## 🧪 How to Test Your Code

After updating any file, test with these scenarios:

```typescript
// Test 1: Basic conversion
const test1 = calculateLengthPrice(300, 'cm', 25, 'meter');
console.assert(test1.totalPrice === 75, 'Should be €75');

// Test 2: Edge case - zero
const test2 = calculateLengthPrice(0, 'cm', 25, 'meter');
console.assert(test2.totalPrice === 0, 'Should be €0');

// Test 3: Invalid input
const test3 = calculateLengthPrice(NaN, 'cm', 25, 'meter');
console.assert(test3.totalPrice === 0, 'Should handle NaN');

// Test 4: Different units
const test4 = calculateLengthPrice(100, 'cm', 25, 'meter');
console.assert(test4.totalPrice === 25, 'Should be €25');
```

## 📍 Where It's Used

Currently integrated in:
- ✅ `UnifiedInventoryDialog.tsx` - Simple pricing example calculation
- ✅ Inventory price calculations with metadata

Needs integration in (see `CONVERSION_AUDIT.md` for full list):
- ⏳ `WindowCoveringPriceCalculator.tsx`
- ⏳ `ComprehensiveCalculator.tsx`
- ⏳ `AdaptiveFabricPricingDisplay.tsx`
- ⏳ And 7 more files...

## 🔒 Preventing Future Bugs

### 1. Always Import the Utility
```typescript
// At top of file:
import { calculateLengthPrice, safeParseNumber } from '@/utils/unitConversions';
```

### 2. Never Do Manual Conversions
```typescript
// ❌ DON'T DO THIS:
const meters = cm / 100;
const price = meters * pricePerMeter;

// ✅ DO THIS INSTEAD:
const calc = calculateLengthPrice(cm, 'cm', pricePerMeter, 'meter');
const price = calc.totalPrice;
```

### 3. Validate Important Calculations
```typescript
import { validatePriceCalculation } from '@/utils/unitConversions';

const calc = calculateLengthPrice(...);
const validation = validatePriceCalculation(calc);

if (!validation.valid) {
  console.error('Calculation error:', validation.errors);
  // Show error to user
}
```

## 🐛 Common Mistakes to Avoid

### Mistake 1: Forgetting Unit Conversion
```typescript
// ❌ WRONG: Multiplying cm directly
const price = 300 * 25;  // 7500 - WRONG!

// ✅ RIGHT: Converting cm to meters first
const calc = calculateLengthPrice(300, 'cm', 25, 'meter');
const price = calc.totalPrice;  // 75 - CORRECT!
```

### Mistake 2: Unsafe Number Parsing
```typescript
// ❌ WRONG: Can return NaN
const value = parseFloat(userInput);
const result = value * 2;  // NaN * 2 = NaN

// ✅ RIGHT: Safe with fallback
const value = safeParseNumber(userInput, 0);
const result = value * 2;  // Always a number
```

### Mistake 3: Inconsistent Rounding
```typescript
// ❌ WRONG: Different rounding methods
const price1 = Math.round(value * 100) / 100;
const price2 = value.toFixed(2);

// ✅ RIGHT: Use roundTo everywhere
import { roundTo } from '@/utils/unitConversions';
const price = roundTo(value, 2);
```

## 📞 Need Help?

1. **Check the utility file:** `src/utils/unitConversions.ts` has examples at the bottom
2. **See audit list:** `CONVERSION_AUDIT.md` lists all locations that need updating
3. **View this guide:** You're reading it!
4. **Test it:** Use the browser console to run examples

## 🎓 Example: Complete Migration

**Before (Wrong):**
```typescript
// Old code in WindowCoveringPriceCalculator.tsx
const basePrice = windowCovering.unit_price * (drop / 100);
```

**After (Correct):**
```typescript
// New code using utility
import { calculateLengthPrice } from '@/utils/unitConversions';

const calc = calculateLengthPrice(
  drop,
  'cm',
  windowCovering.unit_price,
  'meter'
);
const basePrice = calc.totalPrice;

// Optional: Show formula for debugging
console.log('Pricing formula:', calc.formula);
```

---

**Remember:** Every calculation matters. Use the utility consistently to ensure your users see the correct prices everywhere in the app! 💰✅

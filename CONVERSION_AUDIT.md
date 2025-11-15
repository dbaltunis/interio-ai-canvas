# Unit Conversion Audit - Action Required

## 🎯 Purpose
This document tracks ALL places in the codebase where unit conversions and price calculations occur.
Each location MUST be updated to use the centralized `unitConversions.ts` utility.

## ⚠️ Critical - Bug We Fixed
**Problem Found:** In inventory pricing, calculation was `300cm × €25 = €7500` (WRONG)
**Should Be:** `300cm → 3m → 3m × €25 = €75` (CORRECT)

## ✅ Already Fixed
- [x] `src/components/inventory/UnifiedInventoryDialog.tsx` - Simple pricing example calculation

## 📋 Locations That NEED Updating

### HIGH PRIORITY (Pricing & Quotes)

1. **`src/components/calculator/WindowCoveringPriceCalculator.tsx`** (Line 148-156)
   ```typescript
   // CURRENT CODE (needs replacement):
   basePrice = windowCovering.unit_price * (drop / 100); // Convert cm to meters
   
   // SHOULD USE:
   import { calculateLengthPrice } from '@/utils/unitConversions';
   const calc = calculateLengthPrice(drop, 'cm', windowCovering.unit_price, 'meter');
   const basePrice = calc.totalPrice;
   ```

2. **`src/components/calculator/ComprehensiveCalculator.tsx`** (Lines 67-70, 121)
   ```typescript
   // CURRENT: Manual calculation
   const fabricCost = totalFabricMeters * selectedFabric.pricePerMeter;
   
   // SHOULD USE: calculateLengthPrice
   ```

3. **`src/components/measurements/fabric-pricing/AdaptiveFabricPricingDisplay.tsx`** (Lines 217, 223)
   ```typescript
   // CURRENT: parseFloat(measurements.drop || 0) / 100
   // SHOULD USE: convertLength or toMeters
   ```

4. **`src/components/settings/tabs/products/CurtainTemplateForm.tsx`** (Line 1512)
   ```typescript
   // CURRENT: (parseFloat(formData.bracket_deduction) * 2).toFixed(1)
   // SHOULD USE: safeParseNumber and roundTo
   ```

### MEDIUM PRIORITY (Product Ordering & Jobs)

5. **`src/components/jobs/ProductsToOrderSection.tsx`** (Lines 94, 98, 128, 187, 248)
   ```typescript
   // CURRENT: Number(order.quantity) * Number(order.unit_price)
   // SHOULD USE: safeParseNumber for safety
   ```

6. **`src/components/jobs/tabs/ProjectDetailsTab.tsx`** (Line 296)
   ```typescript
   // CURRENT: Number(t.unit_price) * Number(t.quantity)
   // SHOULD USE: safeParseNumber
   ```

7. **`src/components/workshop/SupplierOrderManager.tsx`** (Line 213)
   ```typescript
   // CURRENT: parseFloat(e.target.value) || 0
   // SHOULD USE: safeParseNumber
   ```

### LOW PRIORITY (Display & Visualization)

8. **`src/components/measurements/TreatmentVisualizer.tsx`** (Lines 263-264)
   ```typescript
   // Scale calculations - consider using roundTo
   ```

9. **`src/components/measurements/VisualMeasurementSheet.tsx`** (Line 991)
   ```typescript
   // Fabric calculation display
   ```

10. **`src/components/measurements/visualizers/WallpaperVisual.tsx`** (Lines 388, 392)
    ```typescript
    // Total meters calculation
    ```

## 📖 How to Update Each File

### Step-by-Step Process:

1. **Import the utility:**
   ```typescript
   import { 
     calculateLengthPrice, 
     safeParseNumber, 
     roundTo,
     toMeters,
     convertLength 
   } from '@/utils/unitConversions';
   ```

2. **Replace manual calculations:**
   ```typescript
   // BEFORE (WRONG):
   const price = (length * pricePerMeter);
   
   // AFTER (CORRECT):
   const calc = calculateLengthPrice(length, lengthUnit, pricePerMeter, 'meter');
   const price = calc.totalPrice;
   ```

3. **Replace unsafe parsing:**
   ```typescript
   // BEFORE:
   const value = parseFloat(input) || 0;
   
   // AFTER:
   const value = safeParseNumber(input, 0);
   ```

4. **Add validation:**
   ```typescript
   import { validatePriceCalculation } from '@/utils/unitConversions';
   
   const validation = validatePriceCalculation(calc);
   if (!validation.valid) {
     console.error('Invalid calculation:', validation.errors);
   }
   ```

## 🧪 Testing Requirements

Before marking any file as ✅ complete:

1. **Unit tests pass** - Run the conversion tests
2. **Manual testing** - Test with these scenarios:
   - 300cm at €25/meter = €75 ✓
   - 100cm at €25/meter = €25 ✓
   - 1000mm at €25/meter = €25 ✓
   - 0cm at €25/meter = €0 ✓
   - Invalid input at €25/meter = €0 (no crash) ✓

3. **User testing** - Have real user verify:
   - Quotes show correct prices
   - Options show correct prices
   - No €7500 errors!

## 🚀 Implementation Timeline

### Phase 1: Critical Pricing (Complete in 1 day)
- [ ] WindowCoveringPriceCalculator
- [ ] ComprehensiveCalculator
- [ ] AdaptiveFabricPricingDisplay
- [ ] CurtainTemplateForm

### Phase 2: Orders & Products (Complete in 2 days)
- [ ] ProductsToOrderSection
- [ ] ProjectDetailsTab
- [ ] SupplierOrderManager

### Phase 3: Display & Visualization (Complete in 1 day)
- [ ] TreatmentVisualizer
- [ ] VisualMeasurementSheet
- [ ] WallpaperVisual

## 📊 Progress Tracking

- **Total Files to Update:** 10
- **High Priority:** 4 files
- **Medium Priority:** 3 files
- **Low Priority:** 3 files
- **Completed:** 1 file (UnifiedInventoryDialog)
- **Remaining:** 9 files

## 🔒 Prevention Strategy

1. **Code Review Checklist:**
   - [ ] All pricing calculations use `calculateLengthPrice`
   - [ ] All number parsing uses `safeParseNumber`
   - [ ] No manual `/ 100` or `* 100` conversions
   - [ ] Unit conversions use `convertLength` or `toMeters`

2. **ESLint Rule (Future):**
   ```json
   {
     "no-restricted-syntax": [
       "error",
       {
         "selector": "BinaryExpression[operator='/'][right.value=100]",
         "message": "Use convertLength or toMeters from @/utils/unitConversions instead of manual division"
       }
     ]
   }
   ```

3. **Documentation:**
   - Add JSDoc comments referencing unitConversions.ts
   - Update developer onboarding docs
   - Create "Pricing Calculations" guide

## 📞 Questions?

If unsure about how to convert a specific calculation, check:
1. `src/utils/unitConversions.ts` - See the examples at bottom
2. `src/utils/__tests__/unitConversions.test.ts` - Real usage examples
3. Ask team lead for review

---

**Last Updated:** $(date)
**Owner:** Development Team
**Status:** In Progress

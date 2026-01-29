

# Fix: Hardcoded Markup Defaults + Missing Implied Markup for Curtains

## Problem Summary

Your client's screenshots show 40% markup being applied even though their settings show ALL ZEROS. There are TWO issues:

### Issue 1: Hardcoded Default Fallbacks

In `src/hooks/useMarkupSettings.ts`, there are **hardcoded fallback values** that apply even when the user sets everything to 0%:

```typescript
// Lines 32-35 in useMarkupSettings.ts
export const defaultMarkupSettings: MarkupSettings = {
  default_markup_percentage: 50,  // ← Applied when no category found
  labor_markup_percentage: 30,    // ← Applied for installation, making
  material_markup_percentage: 40, // ← 🚨 THIS IS THE 40% YOUR CLIENT SEES
  ...
};
```

When the client sets all category markups to 0%, the system falls through to `material_markup_percentage: 40` because the `resolveMarkup()` function considers fabric/curtains as "materials".

### Issue 2: Missing Implied Markup for Curtains

The blinds section correctly calculates implied markup from library pricing (cost vs selling price), but **curtains do NOT**:

| Section | Calculates impliedMarkup? | Result |
|---------|--------------------------|--------|
| Blinds (lines 420-450) | Yes | Uses library pricing, skips category fallback |
| Curtains (lines 738-743) | No | Falls through to 40% material markup |

---

## Root Cause Flow

```text
Client sets:
  - Default markup: 0%
  - Curtains category: 0%
  - Material markup: 0%
  
System behavior:
  1. Check category 'curtains' → 0% → SKIP
  2. Check material_markup_percentage → READS DEFAULT (40%) instead of user's 0%
  3. Returns 40%
```

The deep merge at line 72-79 in `useMarkupSettings.ts` preserves the hardcoded defaults rather than respecting the user's explicit 0% values.

---

## Solution: Two-Part Fix

### Part 1: Fix useMarkupSettings.ts - Respect User's Zero Values

**File:** `src/hooks/useMarkupSettings.ts`

**Change 1:** Update default values to 0% so they don't override user settings:

```typescript
// Lines 32-35 - BEFORE:
export const defaultMarkupSettings: MarkupSettings = {
  default_markup_percentage: 50,
  labor_markup_percentage: 30,
  material_markup_percentage: 40,
  ...
};

// AFTER:
export const defaultMarkupSettings: MarkupSettings = {
  default_markup_percentage: 0,  // ← User must set intentionally
  labor_markup_percentage: 0,    // ← User must set intentionally
  material_markup_percentage: 0, // ← User must set intentionally
  ...
};
```

**Change 2:** Update the merge logic to preserve explicit zeros from the database (lines 72-79):

```typescript
// BEFORE:
const merged = {
  ...defaultMarkupSettings,
  ...pricingSettings,
  // This doesn't preserve explicit 0 values from DB
};

// AFTER:
// When values are explicitly saved as 0 in DB, use them (don't fallback to defaults)
const merged: MarkupSettings = {
  default_markup_percentage: pricingSettings.default_markup_percentage ?? defaultMarkupSettings.default_markup_percentage,
  labor_markup_percentage: pricingSettings.labor_markup_percentage ?? defaultMarkupSettings.labor_markup_percentage,
  material_markup_percentage: pricingSettings.material_markup_percentage ?? defaultMarkupSettings.material_markup_percentage,
  minimum_markup_percentage: pricingSettings.minimum_markup_percentage ?? defaultMarkupSettings.minimum_markup_percentage,
  dynamic_pricing_enabled: pricingSettings.dynamic_pricing_enabled ?? defaultMarkupSettings.dynamic_pricing_enabled,
  quantity_discounts_enabled: pricingSettings.quantity_discounts_enabled ?? defaultMarkupSettings.quantity_discounts_enabled,
  show_markup_to_staff: pricingSettings.show_markup_to_staff ?? defaultMarkupSettings.show_markup_to_staff,
  category_markups: {
    ...defaultMarkupSettings.category_markups,
    ...(pricingSettings.category_markups || {})
  }
};
```

Using `??` (nullish coalescing) instead of spread ensures that explicit `0` values from the database are preserved, while only `null` or `undefined` values fall back to defaults.

---

### Part 2: Add Implied Markup Detection for Curtains

**File:** `src/components/measurements/dynamic-options/CostCalculationSummary.tsx`

Add the same implied markup logic that blinds have (around lines 738-743):

```typescript
// BEFORE (lines 738-743):
const fabricMarkupResult = resolveMarkup({
  category: treatmentCategory || 'curtains',
  markupSettings
});

// AFTER:
// ✅ FIX: Calculate implied markup from library pricing (same as blinds section)
const fabricCostPrice = fabricToUse?.cost_price || 0;
const fabricSellingPrice = fabricToUse?.selling_price || 0;
const hasLibraryPricing = fabricCostPrice > 0 && fabricSellingPrice > fabricCostPrice;
const impliedMarkup = hasLibraryPricing 
  ? ((fabricSellingPrice - fabricCostPrice) / fabricCostPrice) * 100 
  : undefined;

if (impliedMarkup && impliedMarkup > 0) {
  console.log('💰 [CURTAIN LIBRARY PRICING] Using implied markup:', {
    cost_price: fabricCostPrice,
    selling_price: fabricSellingPrice,
    impliedMarkup: `${impliedMarkup.toFixed(1)}%`,
    note: 'Prevents double-markup on library fabrics'
  });
}

const fabricMarkupResult = resolveMarkup({
  impliedMarkup, // ✅ Pass implied markup to prevent double-markup
  gridMarkup: fabricToUse?.pricing_grid_markup, // ✅ Pass grid markup if exists
  productMarkup: fabricToUse?.markup_percentage, // ✅ Pass product markup if exists
  category: treatmentCategory || 'curtains',
  markupSettings
});
```

---

### Part 3: Fix QuotationTab.tsx Hardcoded Default

**File:** `src/components/jobs/tabs/QuotationTab.tsx`

```typescript
// Line 304 - BEFORE:
const markupPercentage = pricingSettings?.default_markup_percentage || 50;

// AFTER:
const markupPercentage = pricingSettings?.default_markup_percentage ?? 0;
```

---

## Files to Modify

| File | Change |
|------|--------|
| `src/hooks/useMarkupSettings.ts` | Remove hardcoded 40%/30%/50% defaults, fix merge logic |
| `src/components/measurements/dynamic-options/CostCalculationSummary.tsx` | Add implied/grid/product markup detection for curtains |
| `src/components/jobs/tabs/QuotationTab.tsx` | Fix hardcoded 50% fallback |

---

## Result After Fix

| Scenario | Before | After |
|----------|--------|-------|
| User sets all markups to 0% | System uses 40% material fallback | System uses 0% |
| Fabric has library pricing (cost vs selling) | Category markup applied | Implied markup used |
| Grid has markup defined | Category fallback applied | Grid markup used |
| Nothing defined | 40% material default | 0% (cost = selling) |

---

## Technical Notes

- The `??` operator is critical: `0 ?? default = 0` but `undefined ?? default = default`
- The spread operator `...` treats `0` and `undefined` the same, which is why 0% was being overwritten
- This fix respects the documented markup priority: Product → Implied → Grid → Category → Material/Labor → Global → Minimum


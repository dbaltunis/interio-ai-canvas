

# Root Cause Fix: Use Calculated Values for ACTUAL Pricing

## The Problem (Why Your Clients See Broken Math)

**Current code (lines 965-973):**
```typescript
quantity = orderedMeters;  // ← FROM ENGINE (broken: 16.53m)
totalCost = displayFabricCost;  // ← FROM ENGINE (broken: £1653)
```

**But the formula text (lines 1007-1025) shows:**
```typescript
calculatedTotalMeters = (widths × drop + seams) / 100;  // ← CORRECT: 16.38m
formulaCost = calculatedTotalMeters × price;  // ← CORRECT: £1638
```

**Result**: Formula says £1638, quote charges £1653. ALL users see this.

## The Fix (2 Lines)

Move the calculation UP, use it for `quantity`:

**File:** `src/components/measurements/fabric-pricing/AdaptiveFabricPricingDisplay.tsx`

### Before (broken):
```typescript
// Line 970
quantity = orderedMeters;  // Engine value (wrong)
```

### After (fixed):
```typescript
// Calculate from displayed components FIRST
const calculatedTotalCm = (widthsRequired * dropWithAllowances) + totalSeamAllowance;
const calculatedTotalMeters = calculatedTotalCm / 100;

// Use calculated value for actual pricing
quantity = calculatedTotalMeters;  // Correct value
totalCost = quantity * pricePerUnit;  // Correct cost
```

## What This Fixes

| Component | Before | After |
|-----------|--------|-------|
| Formula text | 16.38m (correct display) | 16.38m |
| `quantity` (used for pricing) | 16.53m (wrong) | 16.38m ✅ |
| `totalCost` (on quote) | £1653 (wrong) | £1638 ✅ |
| All users affected | YES | YES (fixed) |

## Technical Details

- The `widthsRequired`, `dropWithAllowances`, and `totalSeamAllowance` variables already exist in the code (lines 979-994)
- Just need to reorder: calculate BEFORE quantity assignment
- This affects every vertical/standard fabric calculation for every user


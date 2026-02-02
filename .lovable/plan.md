
# Deep Code Investigation: Root Causes of Persistent Issues

## Executive Summary

After thorough code investigation, I've identified **5 distinct root causes** affecting calculations, display, and settings across all accounts. These are **NOT configuration issues** - they are **code bugs** that need fixing.

---

## Issue #1: Math Display Error (1.4in Not Added to Total)

### Evidence Found

**File:** `src/components/measurements/fabric-pricing/AdaptiveFabricPricingDisplay.tsx` (Lines 766-777)

```typescript
// UI DISPLAYS this breakdown:
{(fabricCalculation.totalSeamAllowance || 0) > 0 && (
  <div className="flex justify-between">
    <span>Seam Allowance:</span>
    <span>+{formatMeasurement(fabricCalculation.totalSeamAllowance || 0, 'cm')}</span>  // ❌ Shows "+" but NOT added
  </div>
)}
<div className="flex justify-between border-t">
  <span>Total Drop:</span>
  <span>{formatMeasurement(displayTotalDropMm ?? fabricCalculation.totalDrop || 0)}</span>  // ❌ Doesn't include seam
</div>
```

**File:** `src/utils/pricing/calculateTreatmentPricing.ts` (Line 144)

```typescript
// CALCULATION excludes seam from drop:
const totalDropUnrounded = heightCm + headerHem + bottomHem + pooling;  // ❌ No seam here
const totalSeamAllowance = seamsRequired > 0 ? seamsRequired * seamHems * 2 : 0;  // Calculated separately
const linearMeters = ((totalDropPerWidth + totalSeamAllowance) / 100) * widthsRequired;  // Added to linear meters, not drop
```

### Root Cause
The UI lists "Seam Allowance" with a `+` sign in the **Height Breakdown** section, but the actual calculation adds seams to **linear meters** (width calculation), not to **Total Drop**. This creates the illusion that `108.5 + 5 + 5 + 1.4 = 118.5` when seam is NOT part of the vertical sum.

### Fix Required
**Option A (Recommended):** Remove "Seam Allowance" from Height Breakdown UI - it's a width/linear calculation, not height
**Option B:** Change the math to actually add seam to Total Drop (would change pricing)

---

## Issue #2: Hardcoded 8cm Hems Ignoring User Settings

### Evidence Found (3 Locations)

**Location 1:** `src/components/measurements/fabric-pricing/AdaptiveFabricPricingDisplay.tsx` (Lines 840-841)
```typescript
const headerHem = template?.blind_header_hem_cm ?? template?.header_allowance ?? 8;  // ❌ Falls back to 8
const bottomHem = template?.blind_bottom_hem_cm ?? template?.bottom_hem ?? 8;        // ❌ Falls back to 8
```

**Location 2:** `src/components/measurements/dynamic-options/FabricSelectionSection.tsx` (Lines 219-220)
```typescript
<div>• Header hem allowance: {formatFromCM(fabricCalculation.headerHem || 8, units.length)}</div>  // ❌ Displays 8 if 0
<div>• Bottom hem allowance: {formatFromCM(fabricCalculation.bottomHem || 8, units.length)}</div>  // ❌ Displays 8 if 0
```

**Location 3:** `src/components/projects/AddCurtainToProject.tsx` (Lines 97-98)
```typescript
const headerAllowance = template.header_allowance || 8;   // ❌ Overrides user's 0
const bottomHemAllowance = template.bottom_hem || 15;     // ❌ Hardcoded 15 fallback
```

### Root Cause
JavaScript's `||` and `??` operators treat `0` as falsy/null, so when a user intentionally sets hems to `0`, the code falls back to `8cm` (≈3.15in ≈ the "5 inches" you're seeing).

### Fix Required
Replace all `|| 8`, `|| 15`, `?? 8` with `|| 0` or explicit null checks.

---

## Issue #3: Saved Blinds Show $0 in Room Cards

### Evidence Found

**Database Query Results:** 20 records with `total_selling = 0` despite having templates and materials:
- System 2000 Pivot Arm (awning) - $0
- Roller Blinds - $0  
- Verticals - $0
- Auto Awning with fabric - $0
- Zip Screen with fabric - $0

**File:** `src/components/job-creation/RoomCardLogic.tsx` (Lines 56-72)
```typescript
const storedSelling = Number(w.summary.total_selling || 0);
if (storedSelling > 0) {
  totalSelling += storedSelling;  // ✅ Uses stored value
} else {
  // Fallback for old data - NEEDS RE-SAVE  // ❌ But many records ARE being saved with 0!
  const markupResult = resolveMarkup(...);
  const sellingPrice = applyMarkup(costPrice, markupResult.percentage);
  totalSelling += sellingPrice;
}
```

### Root Cause
The Room Card correctly reads `total_selling` from database, but **the worksheet is saving $0** for these products. The problem is in the pricing calculation for:
1. **Awnings** - Pricing grid not matching
2. **Verticals** - Material `compatible_treatments` misconfigured  
3. **Blinds** - Template-based materials failing to resolve price

---

## Issue #4: Admins Cannot Save Business Settings (Multi-Tenant Bug)

### Evidence Found

**File:** `src/hooks/useMarkupSettings.ts` (Lines 108-112)
```typescript
const { data: freshBusinessSettings } = await supabase
  .from('business_settings')
  .select('id, pricing_settings')
  .eq('user_id', user.id)  // ❌ BUG: Should use effectiveOwnerId!
  .maybeSingle();
```

**Comparison - Correct Pattern in `useBusinessSettings.ts` (Lines 153-161):**
```typescript
const { data: accountOwnerId } = await supabase
  .rpc('get_account_owner', { user_id_param: user.id });  // ✅ Gets account owner

if (accountOwnerId && accountOwnerId !== user.id) {
  const { data: ownerSettings } = await supabase
    .from('business_settings')
    .select('*')
    .eq('user_id', accountOwnerId)  // ✅ Uses owner ID
    .maybeSingle();
}
```

### Root Cause
`useMarkupSettings` mutation uses `user.id` directly instead of `effectiveOwnerId`. When an Admin (not the account owner) tries to save:
1. Query finds no record (wrong user_id)
2. Creates a **phantom record** under Admin's ID
3. Other users/queries never see this phantom record
4. Changes appear to save but never persist

---

## Issue #5: Wrong Property Paths in Display Components

### Evidence Found

**File:** `src/components/measurements/fabric-pricing/AdaptiveFabricPricingDisplay.tsx` (Lines 970-973)
```typescript
const headerHem = fabricCalculation.details?.headerHem || template?.header_allowance || 0;  // ❌ Wrong path
const bottomHem = fabricCalculation.details?.bottomHem || template?.bottom_hem || 0;        // ❌ Wrong path
const poolingMm = parseFloat(measurements.pooling) || 0;  // ❌ Wrong property name
```

**Correct properties are:**
- `fabricCalculation.headerHem` (NOT `fabricCalculation.details?.headerHem`)
- `fabricCalculation.bottomHem` (NOT `fabricCalculation.details?.bottomHem`)
- `measurements.pooling_amount` (NOT `measurements.pooling`)

### Root Cause
The code attempts to access nested `.details?.` properties that don't exist, then falls back to template defaults (which may have hardcoded values).

---

## Summary of Code Fixes Required

| File | Issue | Fix |
|------|-------|-----|
| `AdaptiveFabricPricingDisplay.tsx` L766-769 | Seam shown in height list but not added | Remove seam from height breakdown display |
| `AdaptiveFabricPricingDisplay.tsx` L840-841 | `?? 8` hardcoded fallback | Change to `?? 0` |
| `AdaptiveFabricPricingDisplay.tsx` L970-973 | Wrong property paths | Use `fabricCalculation.headerHem` directly |
| `FabricSelectionSection.tsx` L219-220 | `\|\| 8` hardcoded fallback | Change to `\|\| 0` |
| `AddCurtainToProject.tsx` L97-98 | `\|\| 8` and `\|\| 15` hardcoded | Change to `\|\| 0` |
| `useMarkupSettings.ts` L111 | Uses `user.id` instead of owner | Use `effectiveOwnerId` pattern |

---

## Verification Checklist After Fixes

| Test Case | Expected Result |
|-----------|-----------------|
| Set hems to 0 in template, check display | Shows 0, not 5 inches |
| Math breakdown total matches sum of parts | 108.5 + 5 + 5 = 118.5 (no seam in list) |
| Save blind, check room card | Shows calculated price, not $0 |
| Admin saves markup settings | Changes persist for all team members |
| Awnings/Verticals calculate price | Non-zero total saved to database |



# Deep Investigation Report: Hardcoded Values & Display Discrepancies

## Investigation Summary

I've conducted a thorough investigation of Sadath's account (Homekaara) and traced through the codebase to identify **WHY** user settings are not being respected and **WHERE** the display discrepancies originate.

---

## Sadath's Account - Database Analysis

### His Configuration:
| Setting | Value |
|---------|-------|
| **Measurement Unit** | `inches` (imperial user) |
| **Fabric Unit** | `m` (meters) |
| **Currency** | `INR` |

### His Template Settings (From Database):

| Template | header_allowance | bottom_hem | blind_header_hem_cm | blind_bottom_hem_cm |
|----------|------------------|------------|---------------------|---------------------|
| **Curtains** | **0** | **0** | 8 | 8 |
| **Roller Blinds** | 8 | **0** | **8** | **8** |
| **Zebra Blinds** | 8 | **0** | **8** | **8** |
| **Roman Blinds** | 8 | 8 | **8** | **8** |

---

## Root Cause Analysis

### Problem #1: Two Competing Database Columns

The database has **BOTH** `header_allowance`/`bottom_hem` AND `blind_header_hem_cm`/`blind_bottom_hem_cm`.

**Code Priority Chain** (from `blindCalculationDefaults.ts` line 26-27):
```typescript
const headerRaw = template.blind_header_hem_cm ?? template.header_allowance;
const bottomRaw = template.blind_bottom_hem_cm ?? template.bottom_hem;
```

**What This Means:**
- For Sadath's Curtains template where `header_allowance = 0`
- The code checks `blind_header_hem_cm` FIRST (value: 8)
- It uses **8** instead of his configured **0**!

### Problem #2: Blind Hem Settings Are LOCKED (Cannot Be Edited)

**File:** `SimplifiedTemplateFormManufacturing.tsx` lines 18-21:
```typescript
// Only show manufacturing for curtains/romans - not for blinds
if (!isCurtain && !isRoman) {
  return null;  // ❌ HIDES ENTIRE FORM FOR BLINDS!
}
```

**Impact:** Sadath **CANNOT edit** the `blind_header_hem_cm` or `blind_bottom_hem_cm` values through the UI. They're stuck at their default **8cm**.

### Problem #3: Backend Edge Function Has Hardcoded Fallbacks

**File:** `supabase/functions/calc_bom_and_price/index.ts` lines 175-176:
```typescript
header_mm: state.header_allowance || 80,   // Hardcoded 80mm = 8cm
hem_mm: state.hem_allowance || 150,         // Hardcoded 150mm = 15cm
```

**Also lines 164-168:**
```typescript
rail_width_mm: state.rail_width_mm || 1000,       // Hardcoded defaults
drop_mm: state.drop_mm || 2000,
ceiling_to_floor_mm: state.ceiling_to_floor_mm || 2400,
wall_to_wall_mm: state.wall_to_wall_mm || 1200,
```

### Problem #4: Frontend Still Has Hardcoded Fallbacks

Despite previous fixes, I found these **STILL EXIST**:

| File | Line | Code | Impact |
|------|------|------|--------|
| `AdaptiveFabricPricingDisplay.tsx` | 841-842 | `?? 8` | Falls back to 8cm if template value missing |
| `ManufacturingStep.tsx` | 81 | `|| 15` | Shows 15cm in onboarding |
| `ManufacturingStep.tsx` | 97 | `|| 3` | Shows 3cm for side hems |
| `TreatmentSpecificFields.tsx` | 355 | `|| 8` | Shows 8 for fold spacing |
| `AddCurtainToProject.tsx` | 106-109 | Hardcoded `15`/`2` | Puddle always adds 15cm, break always adds 2cm |

### Problem #5: Wrong Property Paths in Display Components

**File:** `AdaptiveFabricPricingDisplay.tsx` lines 971-973:
```typescript
const headerHem = fabricCalculation.details?.headerHem || template?.header_allowance || 0;
const poolingMm = parseFloat(measurements.pooling) || 0;  // ❌ Wrong property!
```

The code tries to access:
- `fabricCalculation.details?.headerHem` - but the value is at `fabricCalculation.headerHem`
- `measurements.pooling` - but the property is `measurements.pooling_amount`

When these paths fail, it falls back to template defaults (which have the 8cm issue).

---

## Complete List of Bugs Found

### Backend (Edge Functions)
| Location | Issue | Fix Needed |
|----------|-------|------------|
| `calc_bom_and_price/index.ts:175` | `|| 80` hardcoded header | Change to `?? 0` |
| `calc_bom_and_price/index.ts:176` | `|| 150` hardcoded hem | Change to `?? 0` |
| `calc_bom_and_price/index.ts:164-168` | Hardcoded dimension defaults | Change `||` to `??` |

### Frontend Components
| Location | Issue | Fix Needed |
|----------|-------|------------|
| `AdaptiveFabricPricingDisplay.tsx:841-842` | `?? 8` hardcoded hems | Change to `?? 0` |
| `AdaptiveFabricPricingDisplay.tsx:971-973` | Wrong property paths | Use correct paths |
| `ManufacturingStep.tsx:81` | `|| 15` hardcoded bottom hem | Change to `?? 0` |
| `ManufacturingStep.tsx:97` | `|| 3` hardcoded side hems | Change to `?? 0` |
| `TreatmentSpecificFields.tsx:355` | `|| 8` hardcoded fold spacing | Change to `?? 0` |
| `AddCurtainToProject.tsx:106-109` | Hardcoded 15cm/2cm puddle/break | Use template or measurements value |
| `SimplifiedTemplateFormManufacturing.tsx:18-21` | Hides hem settings for blinds | Allow editing for all treatments |

### Database/Configuration
| Issue | Impact |
|-------|--------|
| `blind_header_hem_cm` column stuck at 8 | Overrides user-editable `header_allowance` |
| Template form hides blind hems | Users can't fix the stuck values |

---

## Why the Totals Are Correct But Display Is Wrong

Sadath reported: *"totals correct but visually it wasn't"*

**Explanation:**
1. The **calculation engine** may use one set of values (e.g., correctly from `header_allowance = 0`)
2. The **display component** uses a different path that hits the `blind_header_hem_cm = 8` fallback
3. Result: **Total is calculated correctly** but the **breakdown shows wrong values**

This is exactly what you're seeing: the math adds up wrong visually (108.5 + 5 + 5 + 1.4 ≠ 118.5) but the actual stored total is correct.

---

## Proposed Fix Plan

### Phase 1: Remove All Hardcoded Fallbacks

**Files to modify:**
1. `supabase/functions/calc_bom_and_price/index.ts` - Replace `|| 80`, `|| 150`, `|| 1000`, etc. with `?? 0`
2. `AdaptiveFabricPricingDisplay.tsx` (lines 841-842) - Change `?? 8` to `?? 0`
3. `ManufacturingStep.tsx` (lines 81, 97) - Change `|| 15`, `|| 3` to `?? 0`
4. `TreatmentSpecificFields.tsx` (line 355) - Change `|| 8` to `?? 0`
5. `AddCurtainToProject.tsx` (lines 106-109) - Use `measurements.pooling_amount` instead of hardcoded 15/2

### Phase 2: Fix Property Path Mismatches

**File:** `AdaptiveFabricPricingDisplay.tsx` (lines 971-973)
- Change `fabricCalculation.details?.headerHem` to `fabricCalculation.headerHem`
- Change `fabricCalculation.details?.bottomHem` to `fabricCalculation.bottomHem`
- Change `measurements.pooling` to `measurements.pooling_amount`

### Phase 3: Unlock Blind Hem Editing

**File:** `SimplifiedTemplateFormManufacturing.tsx` (lines 18-21)
- Remove the condition that hides the form for blinds
- OR add separate blind hem inputs to the general template form

### Phase 4: Data Migration for Existing Templates

Run a SQL update to sync `blind_*_hem_cm` columns with `header_allowance`/`bottom_hem` for all existing templates, ensuring consistency.

---

## Verification Checklist

After fixes:

| Test | Expected Result |
|------|-----------------|
| Set hems to 0 in template settings | Display shows 0, not 8cm/5in |
| Check fabric calculation breakdown | All visible values add up to the total |
| Save a blind and check room card | Shows correct price, not $0 |
| Check Sadath's account specifically | His 0 values are respected everywhere |
| Check Greg's CCCO account | Same fixes apply |


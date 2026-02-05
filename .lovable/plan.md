

# Comprehensive Fix: Awning Pricing Not Saving

## Investigation Summary

I conducted a thorough code and database investigation to identify why awning pricing shows correctly in the worksheet ($800.70) but saves as $0 to the database.

---

## Root Cause (Code Evidence)

### Bug Location: `DynamicWindowWorksheet.tsx` lines 1085-1091

```typescript
const displayCategory = specificTreatmentType.includes('blind') 
  ? 'blinds' 
  : specificTreatmentType.includes('shutter') 
  ? 'shutters' 
  : specificTreatmentType === 'wallpaper'
  ? 'wallpaper'
  : 'curtains';  // ← AWNING FALLS HERE!
```

**Problem**: When `specificTreatmentType === 'awning'`:
- Does NOT include 'blind' → fails first check
- Does NOT include 'shutter' → fails second check  
- Is NOT 'wallpaper' → fails third check
- **Defaults to 'curtains'** → WRONG PATH!

### Database Evidence

```sql
-- Awning window saves with $0:
window_id: 595dd6db-a8d8-44b0-8b08-e5a8544e755d
treatment_type: awning
total_cost: 0
total_selling: 0
fabric_details.cost_price: 0

-- Roller blind saves correctly:
window_id: 5dc991eb-0fe2-4285-9f36-047ddf50d93e  
treatment_type: roller_blinds
total_cost: 232
total_selling: 394.4
```

### Why This Happens

1. **Detection is correct**: `detectTreatmentType()` returns `'awning'` correctly (line 66-67)
2. **displayCategory is wrong**: The save logic uses its own check that misses awning
3. **Wrong calculation path**: Since `displayCategory === 'curtains'`, it tries to use `liveCurtainCalcResult` which is null for awnings
4. **Fallback to curtain math**: Uses fullness ratios, linear meters calculations - completely wrong for awnings

---

## Inconsistency Identified

**Centralized check (CORRECT)** - `calculateTreatmentPricing.ts` lines 167-180:
```typescript
const isBlindTreatment = treatmentCategory.includes('blind') || 
                         treatmentCategory === 'shutters' ||
                         treatmentCategory.includes('awning') ||  // ✅ Has awning
                         treatmentCategory.includes('drape') ||   // ✅ Has drape
                         ...
```

**Local check (BROKEN)** - `DynamicWindowWorksheet.tsx` line 1085:
```typescript
specificTreatmentType.includes('blind')  // ❌ Missing awning, drape, panel_glide
```

---

## Files to Fix

| File | Lines | Change |
|------|-------|--------|
| `src/components/measurements/DynamicWindowWorksheet.tsx` | 1085-1091 | Add awning, drape, panel_glide to displayCategory check |
| `src/components/job-creation/treatment-pricing/fabric-calculation/fabricUsageCalculator.ts` | 19-20 | Add awning, drape, panel_glide to isBlind helper |
| `src/utils/treatmentTypeDetection.ts` | 75-87 | Add awning to name-based fallback detection |

---

## Implementation Plan

### Fix 1: Update displayCategory Logic

**File:** `src/components/measurements/DynamicWindowWorksheet.tsx` (lines 1085-1091)

Replace the current fragile check with a comprehensive one:

```typescript
// Use a comprehensive check that matches the centralized isBlindTreatment logic
const isBlindLikeType = specificTreatmentType.includes('blind') || 
                        specificTreatmentType === 'awning' ||
                        specificTreatmentType === 'panel_glide' ||
                        specificTreatmentType.includes('drape');

const displayCategory = isBlindLikeType 
  ? 'blinds' 
  : specificTreatmentType.includes('shutter') 
  ? 'shutters' 
  : specificTreatmentType === 'wallpaper'
  ? 'wallpaper'
  : 'curtains';
```

### Fix 2: Update isBlind Helper

**File:** `src/components/job-creation/treatment-pricing/fabric-calculation/fabricUsageCalculator.ts` (lines 19-20)

```typescript
// Current (broken):
export const isBlind = (treatmentCategory?: string) =>
  !!treatmentCategory && /blind/i.test(treatmentCategory);

// Fixed:
export const isBlind = (treatmentCategory?: string) => {
  if (!treatmentCategory) return false;
  const cat = treatmentCategory.toLowerCase();
  return /blind/i.test(cat) || 
         cat === 'awning' || 
         cat === 'panel_glide' ||
         cat.includes('drape');
};
```

### Fix 3: Add Awning to Name-Based Detection Fallback

**File:** `src/utils/treatmentTypeDetection.ts` (around line 84)

Add awning check to the name-based fallback section:

```typescript
if (name.includes('shutter')) return 'shutters';
if (name.includes('awning') || description.includes('awning')) return 'awning';  // ADD THIS
if (name.includes('panel') || name.includes('glide')) return 'panel_glide';       // ADD THIS
if (name.includes('wallpaper') || name.includes('wall covering') || description.includes('wallpaper')) return 'wallpaper';
```

---

## Accounts Affected

| Impact | Who |
|--------|-----|
| **Directly affected** | All accounts using Awning templates (Greg/CCCO, future customers) |
| **Potentially affected** | Accounts using Panel Glide or SmartDrape templates |
| **Not affected** | Accounts using only standard blinds/curtains |

This is a **code bug**, not a data issue - the fix will work for all accounts once deployed.

---

## Prevention Strategy

### Rule to Establish
> **Never duplicate treatment category detection logic.** Use the centralized `isBlindCategory` helper from `blindCostCalculator.ts` or create a shared utility that ALL components reference.

### Add to Memory
Create a memory entry documenting that:
1. Awning, Panel Glide, and SmartDrape treatments must be routed through the "blinds" calculation path
2. Any new treatment types must be added to ALL detection helpers in one commit

---

## Expected Results After Fix

| Before | After |
|--------|-------|
| Worksheet shows $800.70 | Worksheet shows $800.70 |
| Database saves $0 | Database saves $800.70 |
| Room card shows A$0.00 | Room card shows A$800.70 |
| Quote shows $0 | Quote shows $800.70 |

---

## Testing Checklist

After implementation:

1. [ ] Open Greg's account project with awning windows
2. [ ] Open Auto Awning worksheet - verify price displays
3. [ ] Click Save & Close
4. [ ] Verify Room 5 shows correct totals (not A$0.00)
5. [ ] Check database: `windows_summary.total_cost` and `total_selling` have values
6. [ ] Test Straight Drop and Zip Screen templates same way
7. [ ] Verify roller blinds still work correctly (no regression)


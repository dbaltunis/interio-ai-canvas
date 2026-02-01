
# Wall/Wallpaper Investigation & Improvement Plan

## ✅ COMPLETED

All 3 changes have been implemented:

### 1. ✅ Fixed Wallpaper Filtering Bug
**File:** `src/components/measurements/treatment-selection/ImprovedTreatmentSelector.tsx`

Now uses `detectTreatmentType()` for robust wallpaper detection (handles 'wallpaper' vs 'wallpapers' mismatch).

### 2. ✅ Hide "Wall" When No Wallpaper Templates Exist
**File:** `src/components/window-types/WindowTypeSelector.tsx`

- Fetches user's curtain templates via `useCurtainTemplates`
- Checks if ANY template is detected as wallpaper using `detectTreatmentType`
- If no wallpaper templates exist, filters out the "Wall" (`room_wall`) window type

### 3. ✅ Auto-Select Window When Only One Option
**File:** `src/components/window-types/WindowTypeSelector.tsx`

When only one window type is available (Standard Window only after filtering):
- Auto-selects it immediately via useEffect
- Parent component's auto-navigation then skips to "Treatment" tab

---

## Technical Summary

| File | Change |
|------|--------|
| `ImprovedTreatmentSelector.tsx` | Uses `detectTreatmentType()` instead of direct string comparison |
| `WindowTypeSelector.tsx` | Hides "Wall" option when no wallpaper templates exist + auto-selects single option |


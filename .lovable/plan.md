
# Wall/Wallpaper Investigation & Improvement Plan

## Investigation Results

### How Wallpaper Currently Works

The wallpaper flow is designed around these components:

1. **Window Type Selection** (`WindowTypeSelector.tsx`)
   - User chooses between "Standard Window" or "Wall"
   - Wall selection sets `visual_key = 'room_wall'`

2. **Treatment Filtering** (`ImprovedTreatmentSelector.tsx`)
   - When "Wall" is selected → show ONLY wallpaper templates
   - When "Standard Window" → show all treatments EXCEPT wallpapers

3. **Detection Logic** (`treatmentTypeDetection.ts`)
   - Checks `curtain_type` and `treatment_category` fields
   - Returns `'wallpaper'` for wallpaper templates

### Critical Bug Found

There's a filtering mismatch causing wallpapers to potentially not appear:

```text
Code checks for:     treatment_category === 'wallpapers' (plural)
Database contains:   treatment_category = 'wallpaper' (singular)
Detection returns:   'wallpaper' (singular)
```

This means when a user selects "Wall", the treatment list may show empty because the comparison fails.

---

## Proposed Changes

### 1. Fix Wallpaper Filtering Bug

**File:** `src/components/measurements/treatment-selection/ImprovedTreatmentSelector.tsx`

Update the filter to use `detectTreatmentType` function which properly handles all wallpaper variants:

```typescript
// Before
if (visualKey === 'room_wall') {
  return template.treatment_category === 'wallpapers'; // Wrong!
}

// After  
if (visualKey === 'room_wall') {
  return detectTreatmentType(template) === 'wallpaper'; // Correct
}
```

### 2. Hide "Wall" When No Wallpaper Templates Exist

**File:** `src/components/window-types/WindowTypeSelector.tsx`

- Fetch user's curtain templates
- Check if ANY template is detected as wallpaper using `detectTreatmentType`
- If no wallpaper templates exist, filter out the "Wall" (`room_wall`) window type from the display

```typescript
// Filter out room_wall if user has no wallpaper templates
const hasWallpaperTemplates = curtainTemplates.some(
  t => detectTreatmentType(t) === 'wallpaper'
);

const displayedWindowTypes = hasWallpaperTemplates 
  ? windowTypes 
  : windowTypes.filter(wt => wt.visual_key !== 'room_wall');
```

### 3. Auto-Select Window When Only One Option

**File:** `src/components/measurements/DynamicWindowWorksheet.tsx`

When only one window type is available (Standard Window only):
- Auto-select it immediately
- Skip to the "Treatment" tab automatically

```typescript
// After fetching window types, if only one exists:
if (filteredWindowTypes.length === 1 && !selectedWindowType) {
  setSelectedWindowType(filteredWindowTypes[0]);
  setActiveTab('treatment'); // Skip window selection step
}
```

---

## Files to Modify

| File | Change |
|------|--------|
| `src/components/measurements/treatment-selection/ImprovedTreatmentSelector.tsx` | Fix wallpaper filtering to use detection function |
| `src/components/window-types/WindowTypeSelector.tsx` | Hide "Wall" option when no wallpaper templates exist |
| `src/components/measurements/DynamicWindowWorksheet.tsx` | Auto-select single window type and skip to treatments |

---

## Technical Notes

- The `detectTreatmentType()` function handles multiple detection methods:
  - `curtain_type === 'wallpaper'`
  - `treatment_category === 'wallpaper'` 
  - Template name containing "wallpaper"
- This ensures robust detection regardless of how the template was configured
- Existing user data and preferences will not be affected

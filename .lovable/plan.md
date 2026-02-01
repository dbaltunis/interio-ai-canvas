
# Dynamic Window Type Selection & Auto-Skip Enhancement

## Current Behavior
- The first step always shows "Select Type"
- When only one window type is available, it auto-selects but still shows the "Select Type" tab content
- User sees the window type panel before moving to Treatment tab

## Desired Behavior

| Available Templates | First Step Label | Behavior |
|---------------------|------------------|----------|
| Only window treatments (no wallpapers) | "Window Selected" | Auto-select Standard Window, skip to Treatment tab |
| Only wallpapers (no window treatments) | "Wall Selected" | Auto-select Wall, skip to Treatment tab |
| Both window treatments AND wallpapers | "Select Type" | User chooses, then moves to Treatment |

---

## Implementation Approach

### Step 1: Add Template Analysis Hook
Create a helper function in `DynamicWindowWorksheet.tsx` to analyze available templates:

```typescript
// Analyze what treatment types are available
const hasWindowTreatments = curtainTemplates.some(
  t => detectTreatmentType(t) !== 'wallpaper'
);
const hasWallpaperTemplates = curtainTemplates.some(
  t => detectTreatmentType(t) === 'wallpaper'
);
const hasBothTypes = hasWindowTreatments && hasWallpaperTemplates;
```

### Step 2: Dynamic Step Label
Update the step names array to be conditional:

```typescript
const getFirstStepLabel = () => {
  if (hasBothTypes) return "Select Type";
  if (hasWallpaperTemplates && !hasWindowTreatments) return "Wall Selected";
  return "Window Selected"; // Default: only window treatments
};

const stepNames = [getFirstStepLabel(), "Treatment", "Library", "Measurements"];
```

### Step 3: Auto-Skip to Treatment Tab
When only one window type exists, start directly on "treatment" tab instead of "window-type":

```typescript
// Initialize activeTab based on available types
const [activeTab, setActiveTab] = useState(() => {
  // Will be updated after templates load
  return "window-type";
});

// Effect to handle auto-navigation when only one type exists
useEffect(() => {
  if (!templatesLoading && !hasBothTypes && availableWindowTypes.length === 1) {
    // Auto-select the only available window type
    setSelectedWindowType(availableWindowTypes[0]);
    // Skip directly to treatment tab
    setActiveTab('treatment');
  }
}, [templatesLoading, hasBothTypes, availableWindowTypes.length]);
```

### Step 4: Update WindowTypeSelector Communication
Modify `WindowTypeSelector` to communicate whether it auto-selected:

```typescript
interface WindowTypeSelectorProps {
  // ... existing props
  onAutoSelect?: (windowType: SimpleWindowType) => void;
}
```

---

## Files to Modify

| File | Changes |
|------|---------|
| `src/components/measurements/DynamicWindowWorksheet.tsx` | Add template analysis, dynamic step labels, auto-skip logic |
| `src/components/window-types/WindowTypeSelector.tsx` | Add callback for auto-selection scenario |

---

## Technical Details

### DynamicWindowWorksheet.tsx Changes

1. **Import `useCurtainTemplates`** - Already imported (line 20)

2. **Add template analysis** (near line 265):
```typescript
const { data: curtainTemplates = [], isLoading: templatesLoading } = useCurtainTemplates();

const hasWindowTreatments = curtainTemplates.some(
  t => detectTreatmentType(t) !== 'wallpaper'
);
const hasWallpaperTemplates = curtainTemplates.some(
  t => detectTreatmentType(t) === 'wallpaper'
);
const hasBothTypes = hasWindowTreatments && hasWallpaperTemplates;
const onlyOneTypeAvailable = !hasBothTypes && (hasWindowTreatments || hasWallpaperTemplates);
```

3. **Dynamic first step label** (line 2745):
```typescript
const getFirstStepLabel = () => {
  if (selectedWindowType?.visual_key === 'room_wall') return "Wall Selected";
  if (selectedWindowType) return "Window Selected";
  if (hasBothTypes) return "Select Type";
  if (hasWallpaperTemplates) return "Wall Selected";
  return "Window Selected";
};
const stepNames = [getFirstStepLabel(), "Treatment", "Library", "Measurements"];
```

4. **Auto-skip effect** (new effect after line 265):
```typescript
useEffect(() => {
  // Only run for new windows (not editing existing)
  if (hasLoadedInitialData.current) return;
  if (templatesLoading) return;
  
  // If only one type available, auto-select and skip to treatment
  if (onlyOneTypeAvailable && !selectedWindowType) {
    const windowType = hasWallpaperTemplates 
      ? windowTypes.find(wt => wt.visual_key === 'room_wall')
      : windowTypes.find(wt => wt.visual_key === 'standard');
    
    if (windowType) {
      setSelectedWindowType(windowType);
      setActiveTab('treatment');
    }
  }
}, [templatesLoading, onlyOneTypeAvailable, selectedWindowType, windowTypes]);
```

### WindowTypeSelector.tsx Changes

1. **Enhance auto-select to call parent immediately** (line 144-150):
```typescript
useEffect(() => {
  if (!loading && !templatesLoading && availableWindowTypes.length === 1 && !selectedWindowType) {
    console.log('🎯 Only one window type available, auto-selecting:', availableWindowTypes[0].name);
    // Parent will handle navigation - just call the callback
    onWindowTypeChange(availableWindowTypes[0]);
  }
}, [loading, templatesLoading, availableWindowTypes, selectedWindowType, onWindowTypeChange]);
```

---

## User Experience Flow

### Scenario 1: Account with only Window Treatments
1. User opens measurement worksheet
2. System detects: only window treatments exist
3. First step shows: **"Window Selected" ✓**
4. Standard Window auto-selected
5. User lands directly on **Treatment** tab
6. User picks their blind/curtain treatment

### Scenario 2: Account with only Wallpapers  
1. User opens measurement worksheet
2. System detects: only wallpaper templates exist
3. First step shows: **"Wall Selected" ✓**
4. Wall auto-selected
5. User lands directly on **Treatment** tab
6. User picks their wallpaper

### Scenario 3: Account with Both Types
1. User opens measurement worksheet
2. System detects: both types available
3. First step shows: **"Select Type"**
4. User sees Window and Wall options
5. User picks one (e.g., Wall)
6. Step updates to: **"Wall Selected" ✓**
7. User moves to Treatment tab

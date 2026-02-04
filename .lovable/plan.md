
# Minor UI Fixes - 4 Items

## Overview

Four small UI improvements for the measurement popup and curtain visualization:

| # | Issue | Fix |
|---|-------|-----|
| 1 | "Window added successfully" notification is too noisy | Remove the toast |
| 2 | Treatment cards are larger than fabric cards | Match grid layout to inventory panel |
| 3 | "Out" stock badge shows for non-tracked fabrics | Only show stock badge when `track_inventory` is true |
| 4 | Curtain drop arrow is cut off/hidden | Fix CSS positioning to prevent clipping |

---

## 1. Remove "Window Added" Notification

**File:** `src/components/job-creation/JobHandlers.tsx`

**Line 128:** Delete this line:
```tsx
showSuccess("Window added", "Window added successfully");
```

The notification for adding a window is unnecessary - save important notifications for meaningful actions like project status changes, errors, or saved data.

---

## 2. Match Treatment Card Size to Fabric Cards

**File:** `src/components/measurements/treatment-selection/TreatmentTypeGrid.tsx`

**Line 129:** Change grid from:
```tsx
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-2">
```
To match the fabric inventory layout:
```tsx
<div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-3">
```

**Line 46:** Reduce card padding from `p-2` to `p-1.5` for more compact appearance.

---

## 3. Hide Stock Badge for Non-Tracked Fabrics

**File:** `src/components/inventory/InventorySelectionPanel.tsx`

**Lines 734-746:** Wrap the stock badge in a check for `track_inventory`:

Before:
```tsx
{item.quantity !== undefined && (
  <Badge ...>
    {item.quantity <= 0 ? 'Out' : `${item.quantity} ${units.fabric || 'm'}`}
  </Badge>
)}
```

After:
```tsx
{item.track_inventory !== false && item.quantity !== undefined && (
  <Badge ...>
    {item.quantity <= 0 ? 'Out' : `${item.quantity} ${units.fabric || 'm'}`}
  </Badge>
)}
```

This ensures:
- Fabrics with `track_inventory: true` or `undefined` (legacy) show stock
- Fabrics with `track_inventory: false` hide the stock badge entirely
- No confusing "Out" for non-stocked fabrics

---

## 4. Fix Curtain Drop Arrow Visibility

**File:** `src/components/shared/measurement-visual/MeasurementVisualCore.tsx`

**Lines 239-251:** The drop measurement indicator is being clipped because:
- The container uses `right-0` (flush with parent edge)
- The label uses `-right-16` (64px outside container)
- Parent likely has `overflow-hidden`

**Fix:** Adjust positioning to keep the drop label inside the visible area:

Before:
```tsx
<div className={`absolute right-0 ...`}>
  ...
  <span className="absolute top-1/2 -right-16 transform -translate-y-1/2 ...">
    Drop: {displayValue(measurements.drop)}
  </span>
```

After:
```tsx
<div className={`absolute right-4 ...`}>
  ...
  <span className="absolute top-1/2 -right-12 transform -translate-y-1/2 ...">
    Drop: {displayValue(measurements.drop)}
  </span>
```

Also apply the same fix to **CurtainVisualizer.tsx** (lines 150-162) which has identical CSS:
- Change `right-2` to `right-4`
- Change `-right-20` to `-right-12`

---

## Files to Modify

| File | Change |
|------|--------|
| `src/components/job-creation/JobHandlers.tsx` | Remove line 128 (showSuccess toast) |
| `src/components/measurements/treatment-selection/TreatmentTypeGrid.tsx` | Update grid classes and card padding |
| `src/components/inventory/InventorySelectionPanel.tsx` | Add `track_inventory !== false` check |
| `src/components/shared/measurement-visual/MeasurementVisualCore.tsx` | Fix drop arrow positioning |
| `src/components/treatment-visualizers/CurtainVisualizer.tsx` | Fix drop arrow positioning |

---

## Visual Result

**Treatment Cards:** Will match the compact 6-column fabric library layout

**Stock Badge:**
- Tracked fabrics: Shows "Out" or "15m" as before
- Non-tracked fabrics: No badge at all (cleaner)

**Drop Arrow:** The green arrow and "Drop: 230cm" label will be fully visible alongside the curtain, not cut off at the edge

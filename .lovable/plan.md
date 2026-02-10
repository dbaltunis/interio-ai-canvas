

## Fix: False "Unsaved Changes" Dialog on Window Close

### Problem
The "Unsaved Changes" popup appears even when no edits were made. This happens because the dirty-state comparison uses mismatched data shapes between the **initial baseline** and the **current state snapshot**.

Specifically, when a window is opened and data loads from the database:
- The baseline (`lastSavedState`) is set using raw database field values (e.g., `fabricDetails?.fabric_id`, `measurementsDetails`, `selected_heading_id || 'none'`)
- The current state snapshot uses processed React state values (e.g., `selectedItems.fabric?.id`, `measurements`, `selectedHeading`)

These resolve to different strings even though they represent the same data, so the comparison falsely reports changes.

### Solution
Instead of initializing the baseline from raw database values, set `lastSavedState.current` **after** the React state has been hydrated, using the exact same field accessors as the comparison. This ensures the baseline and current state always use the same shape.

### Technical Changes

**File: `src/components/measurements/DynamicWindowWorksheet.tsx`**

1. **Remove the premature baseline initialization** (lines ~812-822) that sets `lastSavedState.current` from raw database fields during data load.

2. **Add a one-time deferred baseline sync** -- after initial data has loaded and React state has settled, capture the baseline using the same fields the comparison uses:
   ```
   useEffect(() => {
     if (hasLoadedInitialData.current && !lastSavedState.current) {
       lastSavedState.current = {
         templateId: selectedTemplate?.id,
         fabricId: selectedItems.fabric?.id,
         hardwareId: selectedItems.hardware?.id,
         materialId: selectedItems.material?.id,
         measurements: JSON.stringify(measurements),
         heading: selectedHeading,
         lining: selectedLining
       };
     }
   }, [hasLoadedInitialData.current, selectedTemplate, selectedItems, measurements, selectedHeading, selectedLining]);
   ```

This guarantees the baseline snapshot is taken from the exact same state accessors used in the comparison, eliminating false positives.

The save path (line ~2690) already uses the correct accessors, so no change is needed there.


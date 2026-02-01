

# Critical Fix: Prevent Automatic Data Deletion + Restore Project Data

## Executive Summary

**ROOT CAUSE IDENTIFIED**: The `useEffect` cleanup logic in `RoomsTab.tsx` (lines 83-136) contains a **race condition** that caused all project surfaces (windows) to be automatically deleted when data loading order varied.

**IMPACT**: Project `113a5360-eb1a-42bc-bff0-909821b9305b` lost all 5 surfaces/windows due to this bug. The rooms still exist, and workshop_items still contain complete data for restoration.

---

## Part 1: Immediate Data Restoration

The deleted data can be reconstructed from `workshop_items` which still contains:

| Room | Surface | Treatment | Cost |
|------|---------|-----------|------|
| Room 1 | Window 1 | venetian_blinds | $70.33 |
| Room 1 | Window 2 | roller_blinds | $70.33 |
| Room 1 | Window 4 | roller_blinds | $220.05 |
| Room 2 | Window 1 | curtains | $469.82 |
| Room 2 | Window 2 | roller_blinds | $83.31 |

### Restoration SQL Script

Run in Supabase SQL Editor to restore the surfaces:

```sql
-- Restore surfaces for project 113a5360-eb1a-42bc-bff0-909821b9305b
-- Using data from workshop_items

INSERT INTO surfaces (id, name, project_id, room_id, surface_type, user_id)
VALUES
  -- Room 1 (ID: 6ba3a29a-e702-4bc0-9a5e-c50a9904733c) - Windows 1, 2, 4
  ('f1487737-0b86-4abf-addf-010b85618a43', 'Window 1', '113a5360-eb1a-42bc-bff0-909821b9305b', '6ba3a29a-e702-4bc0-9a5e-c50a9904733c', 'window', 'b0c727dd-b9bf-4470-840d-1f630e8f2b26'),
  ('60146948-e2a0-41f3-8924-813fb029da15', 'Window 2', '113a5360-eb1a-42bc-bff0-909821b9305b', '6ba3a29a-e702-4bc0-9a5e-c50a9904733c', 'window', 'b0c727dd-b9bf-4470-840d-1f630e8f2b26'),
  ('06bf0dad-0bab-4903-ba14-e545b62165a3', 'Window 4', '113a5360-eb1a-42bc-bff0-909821b9305b', '6ba3a29a-e702-4bc0-9a5e-c50a9904733c', 'window', 'b0c727dd-b9bf-4470-840d-1f630e8f2b26'),
  -- Room 2 (ID: 7ffc152a-1c67-4e7c-b4c7-8900bd2cd144) - Windows 1, 2
  ('bed9ea8d-748d-4843-9a46-ce2b22fc3595', 'Window 1', '113a5360-eb1a-42bc-bff0-909821b9305b', '7ffc152a-1c67-4e7c-b4c7-8900bd2cd144', 'window', 'b0c727dd-b9bf-4470-840d-1f630e8f2b26'),
  ('cc4e1efc-732a-43e1-bedc-22ab191be750', 'Window 2', '113a5360-eb1a-42bc-bff0-909821b9305b', '7ffc152a-1c67-4e7c-b4c7-8900bd2cd144', 'window', 'b0c727dd-b9bf-4470-840d-1f630e8f2b26')
ON CONFLICT (id) DO NOTHING;
```

---

## Part 2: Code Fix - Remove Dangerous Auto-Cleanup

### The Problematic Code (lines 83-136 in RoomsTab.tsx)

```typescript
// Auto-cleanup: Remove orphaned treatments and surfaces
useEffect(() => {
  const cleanupOrphanedData = async () => {
    if (!rooms || !treatments || !surfaces || !projectId) return;  // ← BUG: No loading state check!
    
    const roomIds = new Set(rooms.map(r => r.id));  // ← Empty if rooms still loading
    
    // Find "orphaned" surfaces - but ALL surfaces look orphaned if rooms is empty!
    const orphanedSurfaces = surfaces.filter(s => !s.room_id || !roomIds.has(s.room_id));
    
    if (orphanedSurfaces.length > 0) {
      for (const surface of orphanedSurfaces) {
        await supabase.from('surfaces').delete().eq('id', surface.id);  // ← DELETES EVERYTHING
      }
    }
    // ... similar for treatments
  };
  cleanupOrphanedData();
}, [rooms, treatments, surfaces, projectId, ...]);
```

### The Race Condition

```text
Timeline:
T0: RoomsTab mounts
T1: useRooms starts → rooms = [] (loading)
T2: useSurfaces starts → surfaces = [] (loading)  
T3: useSurfaces completes FIRST → surfaces = [5 items]
T4: useEffect triggers because surfaces changed:
    - rooms = [] (still loading!)
    - roomIds = Set([]) ← EMPTY
    - All surfaces fail roomIds.has() check
    - DELETE all 5 surfaces ← DATA LOSS
T5: useRooms completes → rooms = [2 items] ← TOO LATE
```

### Solution: Remove Auto-Cleanup Entirely

**Automatic data deletion is too dangerous.** The safest fix is to remove this entire useEffect block. Orphaned data cleanup should be:
- User-triggered (explicit action)
- Admin-only function
- Scheduled background job with safety checks

### Alternative: Add Comprehensive Safety Guards

If cleanup must remain, add these protections:

```typescript
// Get loading states from hooks
const { data: rooms = [], isLoading: roomsLoading } = useRooms(projectId);
const { data: surfaces, isLoading: surfacesLoading } = useSurfaces(projectId);
const { data: treatments, isLoading: treatmentsLoading } = useTreatments(projectId);

useEffect(() => {
  const cleanupOrphanedData = async () => {
    // CRITICAL SAFETY CHECK 1: Never run while ANY data is still loading
    if (roomsLoading || surfacesLoading || treatmentsLoading) {
      console.log('[RoomsTab] Skipping cleanup - data still loading');
      return;
    }
    
    // CRITICAL SAFETY CHECK 2: Must have at least one room before cleanup
    if (!rooms || rooms.length === 0) {
      console.log('[RoomsTab] Skipping cleanup - no rooms loaded yet');
      return;
    }
    
    // CRITICAL SAFETY CHECK 3: Never auto-delete more than 1 item
    const orphanedSurfaces = surfaces?.filter(s => !s.room_id || !roomIds.has(s.room_id)) || [];
    if (orphanedSurfaces.length > 1) {
      console.error('[RoomsTab] BLOCKED: Refusing bulk delete - likely race condition', {
        orphanedCount: orphanedSurfaces.length,
        roomsCount: rooms.length
      });
      return;  // ABORT - something is wrong
    }
    
    // Only proceed with single-item cleanup
    // ...
  };
  cleanupOrphanedData();
}, [rooms, treatments, surfaces, projectId, roomsLoading, surfacesLoading, treatmentsLoading, ...]);
```

---

## Part 3: Files to Modify

| File | Change |
|------|--------|
| `src/components/jobs/tabs/RoomsTab.tsx` | Remove lines 83-136 OR add comprehensive safety guards |

---

## Part 4: Documentation Memory (Prevent Recurrence)

Create permanent documentation to prevent this class of bug:

```text
# Memory: architecture/automatic-data-deletion-safety

CRITICAL RULE: NEVER implement automatic data deletion in useEffect hooks.

Any data deletion logic MUST:
1. Check isLoading states of ALL dependent queries before running
2. Require at least one parent record exists before checking for orphans
3. NEVER delete more than 1 record without explicit user confirmation
4. Log all deletions with full context (counts, IDs, timestamps)
5. Prefer explicit user-triggered cleanup over automatic cleanup

FORBIDDEN PATTERNS:
- useEffect with delete operations that run on component mount
- Checking array.length === 0 instead of isLoading state
- Deleting records in a loop without safety thresholds
- Running cleanup when dependent data may still be loading

SAFE ALTERNATIVES:
- User-triggered "Clean up orphaned data" button
- Admin-only maintenance functions
- Scheduled background jobs with extensive logging
- Soft-delete with manual review before permanent removal
```

---

## Testing Checklist

After implementation:

1. **Race Condition Prevention**
   - Open a project with rooms and windows
   - Refresh page multiple times rapidly
   - Verify windows are NOT deleted
   - Throttle network to Slow 3G, refresh, verify windows remain

2. **Data Integrity**
   - Navigate between projects
   - Verify no unexpected deletions
   - Check console for any "cleanup" logs

3. **Restored Project**
   - Navigate to project `113a5360-eb1a-42bc-bff0-909821b9305b`
   - Verify all 5 windows are restored
   - Verify pricing data displays correctly

---

## Implementation Order

1. **FIRST**: Run the SQL restoration script to recover the deleted data
2. **SECOND**: Remove/fix the dangerous cleanup code to prevent future occurrences
3. **THIRD**: Create documentation memory


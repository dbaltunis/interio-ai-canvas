
## Fix Duplicate Tooltips Issue

The "Add Client" tooltip is appearing twice because two different systems are rendering it:

1. **TeachingOverlay** (global) - Renders a portal-based bubble in `document.body` for ANY `activeTeaching`
2. **TeachingTrigger** (local) - Renders an anchored popover for its specific teaching ID

Both listen to the same `activeTeaching` context state, causing duplicate rendering.

---

### Root Cause

When `showTeaching('app-job-add-client')` is called:
1. `TeachingContext` sets `activeTeaching` to this teaching point
2. `ClientCard` → `TeachingTrigger` sees `activeTeaching?.id === 'app-job-add-client'` → renders anchored popover
3. `TeachingOverlay` sees `activeTeaching` is not null → renders floating bubble in portal

Result: **TWO identical tooltips appear simultaneously**

---

### Solution

Modify `TeachingOverlay.tsx` to skip rendering for teaching points that have `skipAutoShow: true` since those are handled by component-level `TeachingTrigger` wrappers.

---

### File Changes

**`src/components/teaching/TeachingOverlay.tsx`**

Add a check at render time to skip teaching points with `skipAutoShow: true`:

```typescript
// Line ~150, update the early return condition
if (!mounted || !activeTeaching || !position || !isTeachingEnabled || !user) {
  return null;
}

// NEW: Skip rendering if this teaching is handled by component-level trigger
if (activeTeaching.skipAutoShow) {
  return null;
}
```

This ensures:
- Teaching points with `skipAutoShow: true` (like `app-job-add-client`) are ONLY rendered by their `TeachingTrigger` wrapper
- Teaching points without `skipAutoShow` continue to be rendered by the global overlay as before

---

### Expected Behavior After Fix

| Scenario | Before | After |
|----------|--------|-------|
| "Add Client" teaching active | 2 tooltips appear | 1 tooltip (anchored to button) |
| Page-level teaching active | 1 overlay tooltip | 1 overlay tooltip (no change) |
| User clicks "Got it" | Both disappear | Single tooltip dismisses cleanly |

---

### Files to Modify

1. `src/components/teaching/TeachingOverlay.tsx` - Add `skipAutoShow` check to prevent duplicate rendering

---

### Technical Note

This is a single-line fix that prevents the race condition between the two rendering systems. The `skipAutoShow` flag was added earlier specifically to mark teachings that should not participate in the global auto-show system - this extends that intent to also exclude them from the global overlay rendering.

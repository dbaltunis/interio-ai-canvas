
# Native SaaS Experience - Phase 3: Timezone Toast + Loading Cleanup

## Overview

This plan addresses two key areas:
1. **Timezone Notification Redesign**: Convert the in-page banner to a top-right toast notification that slides in gracefully
2. **Remaining Loading State Cleanup**: Fix 10+ components still showing "Loading..." text or double-loading patterns

---

## Part 1: Timezone Swap Toast Notification

### Current Behavior
The timezone mismatch is currently shown as an inline Alert banner inside the calendar view (CalendarView.tsx lines 557-575), which takes up space in the calendar layout.

### New Behavior
- Display as a **toast notification** in the top-right corner
- Shows when device timezone differs from saved preference
- Two action buttons: "Keep [Current]" and "Use [New Timezone]"
- Auto-dismisses after user action
- Does NOT show if timezones match (already working this way)

### Files to Modify

| File | Changes |
|------|---------|
| `src/hooks/useAutoTimezone.ts` | Add a `showToast()` function that triggers on mismatch detection |
| `src/components/calendar/CalendarView.tsx` | Remove the inline Alert banner (lines 557-575) |
| Create `src/components/calendar/TimezoneToastNotification.tsx` | New component that renders the toast with action buttons |

### Implementation Details

**New TimezoneToastNotification Component:**
```typescript
// Uses sonner toast with custom JSX for action buttons
toast.custom((id) => (
  <div className="bg-background border rounded-xl shadow-lg p-4">
    <div className="flex items-start gap-3">
      <Clock className="h-5 w-5 text-amber-500 mt-0.5" />
      <div className="flex-1 space-y-2">
        <p className="text-sm font-medium">Timezone Detected</p>
        <p className="text-xs text-muted-foreground">
          Your device is in {browserTz}, but calendar uses {savedTz}
        </p>
        <div className="flex gap-2">
          <Button size="sm" variant="outline" onClick={dismiss}>Keep {savedTz}</Button>
          <Button size="sm" onClick={update}>Use {browserTz}</Button>
        </div>
      </div>
      <X className="h-4 w-4 cursor-pointer" onClick={dismiss} />
    </div>
  </div>
), { duration: Infinity, position: 'top-right' });
```

**Hook Changes:**
- Trigger toast automatically when mismatch is detected
- Only show once per session (use localStorage flag)
- Clear flag when user travels (device timezone changes)

---

## Part 2: Loading State Cleanup

### Components with "Loading..." Text

| File | Line | Current | Fix |
|------|------|---------|-----|
| `src/pages/Billing.tsx` | 18-24 | `<div>Loading...</div>` | Return skeleton with cards layout |
| `src/pages/Purchasing.tsx` | 16-22 | `<div>Loading...</div>` | Return skeleton matching page layout |
| `src/components/settings/LeadSourceManager.tsx` | 117-119 | `<div>Loading...</div>` | Card skeleton with list items |
| `src/components/clients/ClientManagement.tsx` | 244 | `'Loading...'` in table cell | Return `<Skeleton className="h-4 w-20" />` |
| `src/components/inventory/ModernInventoryDashboard.tsx` | 225-226 | `<span className="animate-pulse">Loading...</span>` | Skeleton pill: `<Skeleton className="h-4 w-12" />` |
| `src/components/workroom/DocumentRenderer.tsx` | 150, 156 | Text fallbacks | Proper document skeleton |
| `src/components/collaboration/DirectMessageDialog.tsx` | 343-349 | Spinner with "Loading..." | Message bubble skeletons |
| `src/components/settings/templates/visual-editor/LivePreview.tsx` | 2210 | `"Loading editor..."` | Editor placeholder skeleton |

### Pattern to Apply

**For Suspense Fallbacks (return null inside component):**
```typescript
// Components inside Suspense should return null during permission loading
if (permissionsLoading || permission === undefined) {
  return null; // Lets parent Suspense skeleton persist
}
```

**For Data Loading States:**
```typescript
// Replace text with layout-matched skeletons
if (isLoading) {
  return (
    <div className="space-y-4">
      <Skeleton className="h-8 w-48" />
      <div className="grid grid-cols-3 gap-4">
        {[1,2,3].map(i => <Skeleton key={i} className="h-24" />)}
      </div>
    </div>
  );
}
```

**For Table Cells:**
```typescript
// Replace inline text with skeletons
{formattedDates[client.id] || <Skeleton className="h-4 w-20 inline-block" />}
```

---

## Part 3: Duplicate Case Block Cleanup

### Issue in Index.tsx
Both "quotes" (line 308) and "emails" (line 316) render `EmailManagement` - this is redundant and confusing.

### Fix
Keep only the "emails" case with proper permission checking. Redirect "quotes" to "emails" or remove if deprecated.

---

## Files to Modify (Summary)

| File | Priority | Changes |
|------|----------|---------|
| `src/components/calendar/CalendarView.tsx` | High | Remove inline timezone Alert banner |
| Create `src/components/calendar/TimezoneToastNotification.tsx` | High | New toast component for timezone swap |
| `src/hooks/useAutoTimezone.ts` | High | Add toast trigger logic |
| `src/pages/Billing.tsx` | Medium | Replace "Loading..." with skeleton |
| `src/pages/Purchasing.tsx` | Medium | Replace "Loading..." with skeleton |
| `src/components/settings/LeadSourceManager.tsx` | Medium | Replace "Loading..." with card skeleton |
| `src/components/clients/ClientManagement.tsx` | Medium | Replace text with inline Skeleton |
| `src/components/inventory/ModernInventoryDashboard.tsx` | Medium | Replace badge text with Skeleton |
| `src/components/workroom/DocumentRenderer.tsx` | Low | Replace text fallbacks with skeletons |
| `src/components/collaboration/DirectMessageDialog.tsx` | Low | Replace spinner with message skeletons |
| `src/pages/Index.tsx` | Low | Clean up duplicate "quotes"/"emails" blocks |

---

## Expected Results

| Area | Before | After |
|------|--------|-------|
| Timezone notification | Inline banner taking calendar space | Elegant top-right toast |
| Permission loading | "Loading..." text visible | Single skeleton persists |
| Data loading | Plain text or spinners | Layout-matched skeletons |
| Table cells | "Loading..." flashing | Smooth skeleton → data |
| Overall feel | Fragmented, old-school | Native SaaS (Linear/Notion level) |

---

## Technical Notes

### Sonner Toast with Actions
The Sonner library (already installed) supports custom JSX content with `toast.custom()`, allowing rich interactive notifications:
- Infinite duration until user interacts
- Position can be set to `top-right`
- Smooth slide-in/out animations built-in
- Matches existing app design system

### Session Persistence
Use `sessionStorage.setItem('timezone-mismatch-shown', 'true')` to avoid showing the toast repeatedly on every page navigation within the same session.

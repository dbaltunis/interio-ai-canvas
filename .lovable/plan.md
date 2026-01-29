

# Pause Notifications & Fix Performance Issues

## Summary

Removing the recently added notification infrastructure and focusing on fixing the core performance problems that are causing the app to run slowly.

---

## Part 1: Remove Notification System (Pause)

### Files to Delete
| File | Reason |
|------|--------|
| `src/pages/Notifications.tsx` | New notification page - not needed |
| `src/components/notifications/UnifiedNotificationCenter.tsx` | Complex notification center |
| `src/components/notifications/NotificationFilters.tsx` | New notification filters |
| `src/components/notifications/NotificationItem.tsx` | New notification item |
| `src/components/notifications/NotificationSettingsPanel.tsx` | Notification preferences |
| `src/contexts/NotificationContext.tsx` | Real-time notification context |
| `src/hooks/useUnifiedNotifications.ts` | New unified notifications hook |
| `src/hooks/useNotificationPreferences.ts` | Preferences hook |
| `supabase/functions/unified-notification-service/` | Edge function folder |

### Files to Modify

**`src/App.tsx`**
- Remove the `/notifications` route
- Remove the `Notifications` lazy import

**`src/components/notifications/GeneralNotificationDropdown.tsx`**
- Remove the "View all notifications" link to the notifications page

**`supabase/config.toml`**
- Remove the `unified-notification-service` edge function entry (if added)

---

## Part 2: Performance Issues Identified

### Issue 1: Duplicate Permission Queries (CRITICAL)

**Problem**: The `user_permissions` table is queried **39+ times** on page load from different components, each with slightly different query keys.

**Evidence from code search**:
- `src/pages/Index.tsx` → `['explicit-user-permissions', user?.id]`
- `src/components/layout/ResponsiveHeader.tsx` → `['explicit-user-permissions-nav', user?.id]`  
- `src/components/calendar/CalendarView.tsx` → `['explicit-user-permissions-calendar-view', user?.id]`
- ... and **36 more files** doing the same query

**Impact**: Each component fetches the same `user_permissions` data independently, causing:
- ~30-40 redundant API calls on Dashboard load
- Increased latency as Supabase rate limits kick in
- React re-renders as each query resolves

**Fix**: Centralize permission fetching into a single shared hook with a unified query key.

### Issue 2: Duplicate Team Presence Calls

**Problem**: Network logs show `get_team_presence` called **3 times** simultaneously at 15:35:37.

**Evidence**:
- Line 32-46: First call
- Line 48-62: Second call (duplicate)  
- Line 64-75: Third call (duplicate)

**Cause**: Multiple components calling `useFilteredTeamPresence()`:
- `PresenceContext.tsx` (app-level)
- `TeamMembersWidget.tsx` (dashboard)
- `useDirectMessages.ts` (messaging)
- `TeamPresenceCard.tsx` (if visible)

**Impact**: 3-4x redundant API calls for the same data.

**Fix**: Use PresenceContext data exclusively instead of calling the hook again.

### Issue 3: Window Focus Refetches

**Problem**: Console log shows `[JOBS] Window focus - invalidating queries instead of navigating` - this invalidates ALL job-related queries on every window focus.

**Evidence**: `JobsFocusHandler.tsx` invalidates `quotes`, `projects`, `clients` on every focus event.

**Impact**: Every tab switch triggers 3+ query refetches.

**Fix**: Remove or debounce the focus handler, rely on React Query's built-in `refetchOnWindowFocus`.

### Issue 4: Large Data Payloads

**Problem**: Network shows clients query returning **full client objects** with 30+ fields each.

**Evidence**: Response body shows full client records with notes, tags, metadata, etc.

**Impact**: Large JSON payloads slow parsing and memory usage.

**Fix**: Use `.select()` to only fetch needed columns for list views.

---

## Implementation Plan

### Step 1: Remove Notification Infrastructure
- Delete 8 files (notification components, context, hooks)
- Remove route from App.tsx
- Remove edge function
- Update GeneralNotificationDropdown to remove link

### Step 2: Centralize Permission Queries
Create a single permission provider that all components share:

```typescript
// New: src/contexts/PermissionContext.tsx
// Fetches user_permissions ONCE and provides via context
// All 39 components use this instead of individual queries
```

### Step 3: Fix Team Presence Duplication
Modify components to use `useUserPresence()` from PresenceContext instead of calling `useFilteredTeamPresence()` directly.

### Step 4: Remove Aggressive Focus Handler
Delete or neuter `JobsFocusHandler.tsx` - let React Query handle focus refetches with its built-in behavior.

### Step 5: Optimize Query Selects
Update list queries to only select needed columns:
```typescript
// Before
.select("*")

// After  
.select("id, name, email, status, created_at")
```

---

## Expected Performance Improvement

| Metric | Before | After |
|--------|--------|-------|
| Permission API calls | ~40 | 1 |
| Team presence calls | 3-4 | 1 |
| Focus refetch queries | 3+ | 0 (use staleTime) |
| Payload size | Full objects | Minimal columns |
| Estimated load time | Slow | 50-70% faster |

---

## Files Summary

### Delete (9 files)
1. `src/pages/Notifications.tsx`
2. `src/components/notifications/UnifiedNotificationCenter.tsx`
3. `src/components/notifications/NotificationFilters.tsx`
4. `src/components/notifications/NotificationItem.tsx`
5. `src/components/notifications/NotificationSettingsPanel.tsx`
6. `src/contexts/NotificationContext.tsx`
7. `src/hooks/useUnifiedNotifications.ts`
8. `src/hooks/useNotificationPreferences.ts`
9. `supabase/functions/unified-notification-service/` (entire folder)

### Create (1 file)
1. `src/contexts/PermissionContext.tsx` - Centralized permission provider

### Modify (5+ files)
1. `src/App.tsx` - Remove notification route
2. `src/components/notifications/GeneralNotificationDropdown.tsx` - Remove link
3. `src/components/jobs/JobsFocusHandler.tsx` - Remove or disable
4. `src/components/dashboard/TeamMembersWidget.tsx` - Use context
5. `src/hooks/useDirectMessages.ts` - Use context
6. Multiple components - Use PermissionContext instead of individual queries

---

## Technical Notes

- Database migration added new columns to `notifications` table - these can remain (no harm)
- New tables `notification_preferences` and `notification_mentions` can remain empty
- The RLS policies on new tables are harmless
- Focus on frontend performance first, database optimizations can follow


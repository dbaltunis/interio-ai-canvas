
# Fix: React Hooks Violation in DashboardContent

## The REAL Root Cause Found

The console error message is clear:
```
Error: Rendered fewer hooks than expected. 
This may be caused by an accidental early return statement.
```

**Location**: `DashboardContent@EnhancedHomeDashboard.tsx:208:71`

### What's Happening

In `src/components/dashboard/EnhancedHomeDashboard.tsx`, the hooks are called in an inconsistent order:

```text
Line 69:  useIsDealer()           ✓ Called first
Line 70:  useState()              ✓ Called
...
Line 82-86: useHasPermission() x5 ✓ Called
Line 96:  useMemo()               ✓ Called
Line 110: useHasPermission()      ✓ Called  <-- TWO MORE HOOKS HERE
Line 111: useHasPermission()      ✓ Called

Line 113: if (isDealer) return    ⚠️ EARLY RETURN HERE

Line 118: useMemo()               ❌ SKIPPED when isDealer=true!
```

### The Bug Flow

1. **First render (loading)**: `isDealerLoading = true` → early return skipped → ALL hooks called including `useMemo` on line 118
2. **Second render (loaded)**: `isDealerLoading = false`, `isDealer = true` → early return triggers → `useMemo` on line 118 is NEVER called
3. **React panics**: "I called 15 hooks last time, but only 13 this time!"

This is a fundamental React rule: **Hooks must always be called in the same order, every render.**

---

## Solution

Move the early return AFTER all hooks are called, OR move all hooks BEFORE the early return.

### Fix: Move useMemo Before the Early Return

**File**: `src/components/dashboard/EnhancedHomeDashboard.tsx`

Current structure (broken):
```typescript
const canViewTeamMembers = useHasPermission('view_team_members');  // Line 110
const canViewEmailKPIs = useHasPermission('view_email_kpis');      // Line 111

if (!isDealerLoading && isDealer) {                                // Line 113
  return <DealerDashboard />;                                      // Line 114
}

const enabledWidgets = useMemo(() => { ... });                     // Line 118 - SKIPPED!
```

Fixed structure:
```typescript
const canViewTeamMembers = useHasPermission('view_team_members');
const canViewEmailKPIs = useHasPermission('view_email_kpis');

// MOVE useMemo BEFORE the early return
const enabledWidgets = useMemo(() => { 
  // Same logic as before
  if (hasOnlineStore.isLoading) return [];
  // ... rest of filtering
}, [/* same deps */]);

// Compact metrics also uses hooks indirectly, define before return
const compactMetrics = useMemo(() => [
  { id: "revenue", label: "Revenue", value: stats?.totalRevenue || 0, icon: DollarSign, isCurrency: true },
  // ... rest
], [stats]);

// NOW it's safe to early return - all hooks have been called
if (!isDealerLoading && isDealer) {
  return <DealerDashboard />;
}
```

---

## Changes Required

| File | Change | Lines |
|------|--------|-------|
| `src/components/dashboard/EnhancedHomeDashboard.tsx` | Move `useMemo` for `enabledWidgets` (line 118) before the dealer early return (line 113) | 110-118 |
| `src/components/dashboard/EnhancedHomeDashboard.tsx` | Wrap `compactMetrics` in useMemo and move before early return | 167-172 |

---

## Why This Wasn't the Race Condition

The previous fixes (500ms delay, `.maybeSingle()`, retries) addressed a **different potential issue**. Those fixes are still valuable for edge cases, but they weren't the cause of **this specific error**.

This error happens because:
- The user logging in **is a Dealer** (from the logs: `isTeamMember: true`)
- When `isDealer` becomes `true`, the early return triggers
- React sees fewer hooks and crashes

---

## Verification

After fix, the login flow will be:
1. User logs in
2. `isDealerLoading = true` → all hooks called, loading state shown
3. `isDealerLoading = false`, `isDealer = true` → all hooks still called, then `<DealerDashboard />` returned
4. No crash!

---

## Answer to Your Question

**"Are other companies experiencing this error?"**

No - this is a **code-specific bug** in your application's `EnhancedHomeDashboard.tsx` component. It's not a Lovable platform issue or Supabase issue. It's a React Rules of Hooks violation that was introduced when the dealer dashboard feature was added.

The fix is straightforward: ensure all hooks are called before any conditional returns.

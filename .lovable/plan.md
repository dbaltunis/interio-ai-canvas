
# Fix Double Loading for Email Management and Library/Inventory

## Problem Identified

The "double lazy loading" issue occurs because **Index.tsx renders permission-based skeletons BEFORE the Suspense boundary**, causing:

1. **First skeleton**: Index.tsx shows `<InventorySkeleton />` while checking permissions (lines 337-338)
2. **Second skeleton**: When permissions pass, the Suspense boundary shows `<InventorySkeleton />` AGAIN while the lazy component loads (line 356)

This creates the visual effect of: **Skeleton → Brief flash/transition → Skeleton again**

---

## Root Cause Analysis

### Current Flow (Index.tsx lines 332-361):

```text
case "inventory":
  ┌─ if (permissionsLoading) → return <InventorySkeleton />  ← FIRST SKELETON
  │
  └─ if (canViewInventory) →
       <Suspense fallback={<InventorySkeleton />}>  ← SECOND SKELETON
         <LibraryPage />
       </Suspense>
```

### For Emails (lines 317-331):
```text
case "emails":
  ┌─ if (!canViewEmails) → return "Access denied"
  │
  └─ <Suspense fallback={<EmailManagementSkeleton />}>
       <EmailManagement />  ← Component has its own null checks
     </Suspense>
```

The emails issue is slightly different - the Suspense skeleton shows, then EmailManagement mounts, checks permissions, and transitions to content.

---

## Solution: Single Unified Loading State

**Principle**: Remove pre-Suspense permission skeletons. Let the lazy component handle permission checks internally (by returning `null` to persist Suspense skeleton).

### Changes to Index.tsx

#### 1. Inventory Case (lines 332-361)
**Remove** the pre-Suspense permission check that shows `<InventorySkeleton />` separately.

**Before:**
```typescript
case "inventory":
  if (permissionsLoading || explicitPermissions === undefined) {
    return <InventorySkeleton />;  // ← REMOVE THIS
  }
  if (canViewInventory === false) {
    return <AccessDenied />;
  }
  return (
    <Suspense fallback={<InventorySkeleton />}>
      <LibraryPage />
    </Suspense>
  );
```

**After:**
```typescript
case "inventory":
  // Access denied check stays (this is final state, not loading)
  if (explicitPermissions !== undefined && !permissionsLoading && canViewInventory === false) {
    return <AccessDenied />;
  }
  // Single Suspense - component handles permission loading internally
  return (
    <Suspense fallback={<InventorySkeleton />}>
      <ComponentWrapper>
        <LibraryPage />
      </ComponentWrapper>
    </Suspense>
  );
```

#### 2. Emails Case (lines 317-331)
Same pattern - remove pre-Suspense permission check.

**Before:**
```typescript
case "emails":
  if (explicitPermissions !== undefined && !permissionsLoading && !canViewEmails) {
    return <AccessDenied />;
  }
  return (
    <Suspense fallback={<EmailManagementSkeleton />}>
      <ComponentWrapper>
        <EmailManagement />
      </ComponentWrapper>
    </Suspense>
  );
```

**After:**
```typescript
case "emails":
  // Only show access denied when we KNOW for sure (permissions loaded + denied)
  if (explicitPermissions !== undefined && !permissionsLoading && canViewEmails === false) {
    return <AccessDenied />;
  }
  return (
    <Suspense fallback={<EmailManagementSkeleton />}>
      <ComponentWrapper>
        <EmailManagement />
      </ComponentWrapper>
    </Suspense>
  );
```

---

### Changes to ModernInventoryDashboard.tsx

The component already has `return null` for loading states, but we need to ensure it covers the case when Index.tsx permissions are still loading:

```typescript
// Current (line 198-201):
if (hasAnyInventoryAccess === undefined) {
  return null;
}
```

This is correct! The component returns `null` when access is undefined (still loading), which keeps the Suspense skeleton visible.

---

### Changes to EmailManagement.tsx

The component already handles this correctly:

```typescript
// Lines 41-44:
if (canAccessEmails === undefined) {
  return null;
}

// Lines 68-71:
if (integrationLoading) {
  return null;
}
```

These are correct - returning `null` keeps the Suspense skeleton visible.

---

## Files to Modify

| File | Change |
|------|--------|
| `src/pages/Index.tsx` | Remove pre-Suspense `<InventorySkeleton />` for permission loading (lines 337-339) |
| `src/pages/Index.tsx` | Keep only access-denied checks before Suspense, not loading checks |

---

## Visual Flow After Fix

### Before (Current - Double Loading):
```text
User clicks "Library" tab:
1. Index.tsx: "permissionsLoading" → shows <InventorySkeleton />
2. Permissions load → condition passes → enters Suspense
3. Suspense: shows <InventorySkeleton /> AGAIN while lazy loading
4. LibraryPage loads → shows content
```

### After (Fixed - Single Loading):
```text
User clicks "Library" tab:
1. Index.tsx: enters Suspense immediately → shows <InventorySkeleton />
2. LibraryPage lazy loads, permissions load in parallel
3. LibraryPage checks hasAnyInventoryAccess === undefined → returns null
4. Suspense skeleton PERSISTS (no flash)
5. Permissions resolve → LibraryPage renders content
```

---

## Technical Details

### Why This Works

When a component inside `<Suspense>` returns `null`:
- React treats it as "still mounting/loading"
- The Suspense fallback (skeleton) continues to display
- No visual transition occurs

### Key Insight

The **access denied** check should happen BEFORE Suspense (it's a final state, not a loading state).
The **permission loading** check should happen INSIDE the component (to persist the skeleton).

---

## Expected Results

| Before | After |
|--------|-------|
| Skeleton → flash → Skeleton | Single uninterrupted skeleton |
| Two separate loading phases | One smooth transition to content |
| User sees UI "bounce" | User sees native-feel loading |


# Fix Double Loading for Email Management and Library/Inventory

## Problem Identified

The code at **Index.tsx lines 337-339** shows an `<InventorySkeleton />` BEFORE the Suspense boundary:

```typescript
if (permissionsLoading || explicitPermissions === undefined) {
  return <InventorySkeleton />;  // ← FIRST SKELETON (before Suspense)
}
// ...then later...
return (
  <Suspense fallback={<InventorySkeleton />}>  // ← SECOND SKELETON
    <LibraryPage />
  </Suspense>
);
```

This causes: **Skeleton → flash/transition → Skeleton again**

---

## Solution

Remove the pre-Suspense permission loading check. The lazy component (`LibraryPage`/`EmailManagement`) already returns `null` when permissions are loading, which keeps the Suspense skeleton visible.

---

## Files to Modify

| File | Change |
|------|--------|
| `src/pages/Index.tsx` | Remove lines 337-339 (pre-Suspense skeleton for inventory) |
| `src/pages/Index.tsx` | Modify access-denied check to only trigger when we KNOW permissions are denied |

---

## Technical Changes

### Inventory Case (lines 332-361)

**Current Code (causes double loading):**
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

**Fixed Code (single loading):**
```typescript
case "inventory":
  // Only show access denied when permissions are LOADED and denied
  if (explicitPermissions !== undefined && !permissionsLoading && canViewInventory === false) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center space-y-3">
          <p className="text-lg font-semibold">Access Denied</p>
          <p className="text-sm text-muted-foreground">You don't have permission to view the Library.</p>
          <Button variant="outline" onClick={() => handleTabChange('dashboard')}>
            Go to Dashboard
          </Button>
        </div>
      </div>
    );
  }
  // Single Suspense handles ALL loading - component returns null while loading permissions
  return (
    <Suspense fallback={<InventorySkeleton />}>
      <ComponentWrapper>
        <LibraryPage />
      </ComponentWrapper>
    </Suspense>
  );
```

### Email Case (lines 316-331)

The email case already looks correct - it only checks for access denied after permissions are loaded, then enters Suspense. However, there's a duplicate case block (lines 307-315 AND 316-331 both handle "emails"). This duplicate needs to be removed.

---

## Why This Works

1. User clicks "Library" tab
2. Index.tsx immediately renders `<Suspense fallback={<InventorySkeleton />}>`
3. React shows `<InventorySkeleton />` while lazy-loading `LibraryPage`
4. `LibraryPage` loads, mounts, checks `hasAnyInventoryAccess === undefined` → returns `null`
5. Suspense skeleton **persists** (no visual change)
6. Permissions resolve → `LibraryPage` renders actual content
7. **Single smooth transition from skeleton to content**

---

## Expected Results

| Before | After |
|--------|-------|
| Skeleton → flash → Skeleton | Single uninterrupted skeleton |
| Two separate loading phases | One smooth transition to content |
| User sees UI "bounce" | Native SaaS feel |

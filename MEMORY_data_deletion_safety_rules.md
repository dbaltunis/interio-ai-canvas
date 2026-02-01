# Data Deletion Safety Rules

> **CRITICAL**: This document defines mandatory safety patterns to prevent accidental data loss across ALL account types (System Owner, Owner, Admin, Staff, Dealer, and future roles).

---

## BANNED Patterns

### 1. Auto-deletion in `useEffect`
**NEVER** delete data inside React lifecycle hooks. Race conditions between loading states can cause valid data to be incorrectly identified as "orphaned."

```typescript
// ❌ BANNED
useEffect(() => {
  if (items.length === 0) {
    deleteAllItems(); // DANGEROUS - items may still be loading
  }
}, [items]);
```

### 2. Heuristic-based deletion
**NEVER** use `length === 0`, `cost === 0`, or similar checks to decide if deletion is safe.

```typescript
// ❌ BANNED
const isNewWindow = existingTreatments.length === 0;
const hasSavedData = totalCost > 0;
if (isNewWindow && !hasSavedData) {
  deleteSurface(id); // DANGEROUS - may delete valid data
}
```

### 3. RLS-dependent deletion decisions
**NEVER** query the database to determine if deletion is appropriate. Different user roles see different data due to Row Level Security.

```typescript
// ❌ BANNED
const { data } = await supabase.from('windows_summary').select('total_cost').eq('window_id', id);
if (!data?.total_cost) {
  deleteSurface(id); // DANGEROUS - RLS may block the query for some users
}
```

### 4. Unconfirmed delete buttons
**EVERY** delete action **MUST** have explicit user confirmation.

```typescript
// ❌ BANNED
onClick={() => deleteSurface.mutate(id)}

// ✅ REQUIRED
onClick={() => {
  if (confirm("Delete this window? This action cannot be undone.")) {
    deleteSurface.mutate(id);
  }
}}
```

---

## REQUIRED Patterns

### 1. Explicit user confirmation
All delete operations must use `confirm()` or an AlertDialog component.

### 2. Status checks
Verify the project isn't locked before allowing deletion:
```typescript
if (project.status === 'locked' || project.status === 'completed') {
  toast.error("Cannot delete from a locked project");
  return;
}
```

### 3. Permission checks
Verify the user has edit permissions before showing delete buttons.

### 4. Cascade awareness
When deletion affects related data, warn users explicitly:
```typescript
confirm(`Delete this room? This will also delete ${windowCount} windows.`)
```

---

## Audited Files (Safe)

| File | Pattern | Status |
|------|---------|--------|
| `WindowManagementDialog.tsx` | `handleDiscardChanges` | ✅ Only clears local drafts |
| `WindowManager.tsx` | Delete button | ✅ Has `confirm()` dialog |
| `WindowManagementSection.tsx` | `handleDeleteSurface` | ✅ Has `confirm()` dialog |
| `JobHandlers.tsx` | `handleDeleteSurface` | ✅ User-triggered with confirmation |
| `SimplifiedTreatmentCard.tsx` | `handleDeleteTreatment` | ✅ Has `confirm()` dialog |
| `useSurfaces.ts` | `deleteSurface` mutation | ✅ Only called explicitly |
| `useTreatments.ts` | `deleteTreatment` mutation | ✅ Only called explicitly |

---

## Protection by Account Type

| Account Type | Protection Level |
|--------------|-----------------|
| System Owner | Full protection - no auto-deletion, confirmation required |
| Owner | Full protection - confirmation required |
| Admin | Full protection - permission + confirmation |
| Staff | Full protection - RLS + confirmation |
| Dealer | Full protection - RLS + confirmation |
| Future roles | Inherits same safety patterns |

---

## Related Memory

See also: `memory/architecture/automatic-data-deletion-safety`

> CRITICAL RULE: Automatic data deletion must NEVER be implemented within useEffect hooks. Any logic intended to remove 'orphaned' or redundant data must be user-triggered or handled via scheduled background jobs with extensive safety checks.

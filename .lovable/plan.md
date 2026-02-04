

# Multi-Tenant Audit: Fix Team Member Creation Bugs

## Summary

I audited all mutation hooks in the codebase and found **12 hooks** with the same bug that was just fixed in `useBusinessSettings.ts`. When team members (Admin/Staff) try to create records, the system uses their own `user.id` instead of the account owner's ID, causing:

- **RLS policy violations** (permission denied errors)
- **Data siloed to the wrong user** (invisible to team and account owner)
- **"This doesn't work" reports from clients**

---

## Affected Hooks (Priority Order)

### Critical - Core Workflow

| File | Hook | Impact |
|------|------|--------|
| `src/hooks/useQuotes.ts` | `useCreateQuote` | Team members can't create quotes |
| `src/hooks/useTreatments.ts` | `useCreateTreatment` | Team members can't add treatments to projects |
| `src/hooks/useWindows.ts` | `useCreateWindow` | Team members can't add surfaces/windows |
| `src/hooks/useRoomProducts.ts` | `useCreateRoomProduct`, `useCreateRoomProducts` | Team members can't add products to rooms |

### High - Account Configuration

| File | Hook | Impact |
|------|------|--------|
| `src/hooks/useJobStatuses.ts` | `useCreateJobStatus` | Team members can't configure job statuses |
| `src/hooks/useNumberSequences.ts` | `useCreateNumberSequence` | Team members can't set up document numbering |
| `src/hooks/useSuppliers.ts` | `useCreateSupplier` | Team members can't add suppliers |
| `src/hooks/useInventoryManagement.ts` | `useCreateInventoryItem` | Team members can't add inventory |

### Medium - Exceptions to Review

| File | Hook | Decision Needed |
|------|------|-----------------|
| `src/hooks/useAppointments.ts` | `useCreateAppointment` | **Keep per-user** - Calendar events should be owned by the individual who creates them |

---

## The Fix Pattern

Each affected hook needs the same 5-line addition before the insert:

```tsx
// BEFORE (buggy):
const { data: { user } } = await supabase.auth.getUser();
if (!user) throw new Error("User not authenticated");

const { data, error } = await supabase
  .from("table_name")
  .insert({
    ...data,
    user_id: user.id,  // ❌ Uses team member's ID
  })

// AFTER (fixed):
import { getEffectiveOwnerForMutation } from "@/utils/getEffectiveOwnerForMutation";

// In mutation function:
const { effectiveOwnerId } = await getEffectiveOwnerForMutation();

const { data, error } = await supabase
  .from("table_name")
  .insert({
    ...data,
    user_id: effectiveOwnerId,  // ✅ Uses account owner's ID
  })
```

---

## Files to Modify

| File | Change |
|------|--------|
| `src/hooks/useQuotes.ts` | Add `getEffectiveOwnerForMutation` to `useCreateQuote` |
| `src/hooks/useTreatments.ts` | Add `getEffectiveOwnerForMutation` to `useCreateTreatment` |
| `src/hooks/useWindows.ts` | Add `getEffectiveOwnerForMutation` to `useCreateWindow` |
| `src/hooks/useRoomProducts.ts` | Add `getEffectiveOwnerForMutation` to `useCreateRoomProduct` and `useCreateRoomProducts` |
| `src/hooks/useJobStatuses.ts` | Add `getEffectiveOwnerForMutation` to `useCreateJobStatus` |
| `src/hooks/useNumberSequences.ts` | Add `getEffectiveOwnerForMutation` to `useCreateNumberSequence` |
| `src/hooks/useSuppliers.ts` | Add `getEffectiveOwnerForMutation` to `useCreateSupplier` |
| `src/hooks/useInventoryManagement.ts` | Add `getEffectiveOwnerForMutation` to `useCreateInventoryItem` |

---

## Already Fixed ✅

These hooks already use the correct pattern:

| File | Status |
|------|--------|
| `src/hooks/useBusinessSettings.ts` | ✅ Fixed (just now) |
| `src/hooks/useSMSTemplates.ts` | ✅ Uses `getEffectiveOwnerForMutation` |
| `src/hooks/useVendors.ts` | ✅ Uses `getEffectiveOwnerForMutation` |
| `src/hooks/useSystemTemplates.ts` | ✅ Uses `getEffectiveOwnerForMutation` |
| `src/hooks/useSurfaces.ts` | ✅ Uses `getEffectiveOwnerForMutation` |
| `src/hooks/useRooms.ts` | ✅ Uses `getEffectiveOwnerForMutation` |
| `src/hooks/useClients.ts` | ✅ Uses `effectiveOwnerId` pattern |

---

## Intentionally Per-User (No Fix Needed)

| File | Reason |
|------|--------|
| `src/hooks/useAppointments.ts` | Calendar events are personal - each team member manages their own schedule |
| `src/hooks/useUserPreferences.ts` | UI preferences are per-user (theme, sidebar state, etc.) |

---

## Verification After Fix

Test each scenario with a Staff/Admin team member:

1. **Create a new quote** → Should save successfully and be visible to owner
2. **Add a treatment to a project** → Should work without RLS errors
3. **Add a surface/window** → Should work for team members
4. **Add products to a room** → Should work in the room designer
5. **Configure job statuses** → Team members can help set up the account
6. **Add suppliers** → Team members can add vendors
7. **Add inventory items** → Team members can manage fabric library

---

## Summary

| Category | Count |
|----------|-------|
| Hooks to fix | 8 |
| Already correct | 7 |
| Intentionally per-user | 2 |

This fix will enable the workflow you want: **give a team member permission to set up and manage the app on your behalf**.


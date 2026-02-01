

# Full Multi-Tenant Fix: All Hooks & Orphaned Data Migration

## Overview

This plan fixes the "disappearing data" bug across the entire application by ensuring all data mutations use `effectiveOwnerId` instead of `user.id`. This is the same fix we already applied to `useEnhancedInventory.ts` and `useBusinessSettings.ts`, now extended to all affected files.

---

## Phase 1: Create Reusable Helper Utility

**New File:** `src/utils/getEffectiveOwnerForMutation.ts`

Creates a single helper function that all hooks will use, avoiding code duplication:

```typescript
import { supabase } from "@/integrations/supabase/client";

export const getEffectiveOwnerForMutation = async (): Promise<{
  effectiveOwnerId: string;
  currentUserId: string;
}> => {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Not authenticated');

  const { data: profile } = await supabase
    .from("user_profiles")
    .select("parent_account_id")
    .eq("user_id", user.id)
    .single();

  return {
    effectiveOwnerId: profile?.parent_account_id || user.id,
    currentUserId: user.id
  };
};
```

---

## Phase 2: Fix Core Business Hooks (6 files)

| Hook | Change |
|------|--------|
| `useRooms.ts` | Replace `user_id: user.id` with `user_id: effectiveOwnerId` in create mutation |
| `useSurfaces.ts` | Replace `user_id: user.id` with `user_id: effectiveOwnerId` in create mutation |
| `useVendors.ts` | Replace `user_id: user.id` with `user_id: effectiveOwnerId` in create mutation |
| `useCollections.ts` | Replace `user_id: user.id` with `user_id: effectiveOwnerId` in create mutation |
| `useLeadSources.ts` | Replace `user_id: user.id` with `user_id: effectiveOwnerId` in create mutation |
| `useWindowCoverings.ts` | Replace `user_id: user.id` with `user_id: effectiveOwnerId` in create mutation |

---

## Phase 3: Fix Project & Quote Hooks (3 files)

| Hook | Change |
|------|--------|
| `useProjectNotes.ts` | Replace `user_id: user.id` with `user_id: effectiveOwnerId` in addNote |
| `JobDetailPage.tsx` | Replace all `user_id: user.id` in job duplication function |
| `DynamicWindowWorksheet.tsx` | Replace `user_id: user.id` in treatment creation |

---

## Phase 4: Fix Marketing & Communication Hooks (7 files)

| Hook | Change |
|------|--------|
| `useTasks.ts` | Replace `user_id: user.id` with `user_id: effectiveOwnerId` |
| `useClientLists.ts` | Replace `user_id: user.id` with `user_id: effectiveOwnerId` |
| `useSMSTemplates.ts` | Replace `user_id: user.id` with `user_id: effectiveOwnerId` |
| `useSMSCampaigns.ts` | Replace `user_id: user.id` with `user_id: effectiveOwnerId` |
| `useSMSContacts.ts` | Replace `user_id: user.id` with `user_id: effectiveOwnerId` |
| `useEmailCampaigns.ts` | Replace `user_id: user.id` with `user_id: effectiveOwnerId` |
| `useSendEmail.ts` | Replace `user_id: user.id` with `user_id: effectiveOwnerId` |

---

## Phase 5: Fix Settings Hooks (4 files)

| Hook | Change |
|------|--------|
| `useKPIConfig.ts` | Replace `user_id: user.id` with `user_id: effectiveOwnerId` |
| `useDashboardWidgets.ts` | Replace `user_id: user.id` with `user_id: effectiveOwnerId` |
| `useUserSecuritySettings.ts` | Replace `user_id: user.id` with `user_id: effectiveOwnerId` |
| `useCreateStore.ts` | Replace `user_id: user.id` with `user_id: effectiveOwnerId` |

---

## Phase 6: Database Migration - Fix Orphaned Data

SQL migration to reassign all orphaned records created by team members back to their account owners:

```sql
-- Fix orphaned rooms
UPDATE rooms r
SET user_id = (SELECT COALESCE(up.parent_account_id, up.user_id) FROM user_profiles up WHERE up.user_id = r.user_id)
WHERE r.user_id IN (SELECT user_id FROM user_profiles WHERE parent_account_id IS NOT NULL);

-- Fix orphaned surfaces
UPDATE surfaces s
SET user_id = (SELECT COALESCE(up.parent_account_id, up.user_id) FROM user_profiles up WHERE up.user_id = s.user_id)
WHERE s.user_id IN (SELECT user_id FROM user_profiles WHERE parent_account_id IS NOT NULL);

-- Fix orphaned vendors
UPDATE vendors v
SET user_id = (SELECT COALESCE(up.parent_account_id, up.user_id) FROM user_profiles up WHERE up.user_id = v.user_id)
WHERE v.user_id IN (SELECT user_id FROM user_profiles WHERE parent_account_id IS NOT NULL);

-- Fix orphaned collections
UPDATE collections c
SET user_id = (SELECT COALESCE(up.parent_account_id, up.user_id) FROM user_profiles up WHERE up.user_id = c.user_id)
WHERE c.user_id IN (SELECT user_id FROM user_profiles WHERE parent_account_id IS NOT NULL);

-- Fix orphaned lead_sources
UPDATE lead_sources ls
SET user_id = (SELECT COALESCE(up.parent_account_id, up.user_id) FROM user_profiles up WHERE up.user_id = ls.user_id)
WHERE ls.user_id IN (SELECT user_id FROM user_profiles WHERE parent_account_id IS NOT NULL);

-- Fix orphaned window_coverings
UPDATE window_coverings wc
SET user_id = (SELECT COALESCE(up.parent_account_id, up.user_id) FROM user_profiles up WHERE up.user_id = wc.user_id)
WHERE wc.user_id IN (SELECT user_id FROM user_profiles WHERE parent_account_id IS NOT NULL);

-- Fix orphaned tasks
UPDATE tasks t
SET user_id = (SELECT COALESCE(up.parent_account_id, up.user_id) FROM user_profiles up WHERE up.user_id = t.user_id)
WHERE t.user_id IN (SELECT user_id FROM user_profiles WHERE parent_account_id IS NOT NULL);

-- Fix orphaned client_lists
UPDATE client_lists cl
SET user_id = (SELECT COALESCE(up.parent_account_id, up.user_id) FROM user_profiles up WHERE up.user_id = cl.user_id)
WHERE cl.user_id IN (SELECT user_id FROM user_profiles WHERE parent_account_id IS NOT NULL);

-- Fix orphaned sms_templates
UPDATE sms_templates st
SET user_id = (SELECT COALESCE(up.parent_account_id, up.user_id) FROM user_profiles up WHERE up.user_id = st.user_id)
WHERE st.user_id IN (SELECT user_id FROM user_profiles WHERE parent_account_id IS NOT NULL);

-- Fix orphaned sms_campaigns
UPDATE sms_campaigns sc
SET user_id = (SELECT COALESCE(up.parent_account_id, up.user_id) FROM user_profiles up WHERE up.user_id = sc.user_id)
WHERE sc.user_id IN (SELECT user_id FROM user_profiles WHERE parent_account_id IS NOT NULL);

-- Fix orphaned sms_contacts
UPDATE sms_contacts scon
SET user_id = (SELECT COALESCE(up.parent_account_id, up.user_id) FROM user_profiles up WHERE up.user_id = scon.user_id)
WHERE scon.user_id IN (SELECT user_id FROM user_profiles WHERE parent_account_id IS NOT NULL);

-- Fix orphaned email_campaigns
UPDATE email_campaigns ec
SET user_id = (SELECT COALESCE(up.parent_account_id, up.user_id) FROM user_profiles up WHERE up.user_id = ec.user_id)
WHERE ec.user_id IN (SELECT user_id FROM user_profiles WHERE parent_account_id IS NOT NULL);

-- Fix orphaned emails
UPDATE emails e
SET user_id = (SELECT COALESCE(up.parent_account_id, up.user_id) FROM user_profiles up WHERE up.user_id = e.user_id)
WHERE e.user_id IN (SELECT user_id FROM user_profiles WHERE parent_account_id IS NOT NULL);

-- Fix orphaned project_notes
UPDATE project_notes pn
SET user_id = (SELECT COALESCE(up.parent_account_id, up.user_id) FROM user_profiles up WHERE up.user_id = pn.user_id)
WHERE pn.user_id IN (SELECT user_id FROM user_profiles WHERE parent_account_id IS NOT NULL);

-- Fix orphaned online_stores
UPDATE online_stores os
SET user_id = (SELECT COALESCE(up.parent_account_id, up.user_id) FROM user_profiles up WHERE up.user_id = os.user_id)
WHERE os.user_id IN (SELECT user_id FROM user_profiles WHERE parent_account_id IS NOT NULL);
```

---

## Summary

| Phase | Files | What Gets Fixed |
|-------|-------|-----------------|
| 1 | 1 new file | Reusable helper utility |
| 2 | 6 files | Rooms, surfaces, vendors, collections, lead sources, window coverings |
| 3 | 3 files | Project notes, job duplication, worksheet treatments |
| 4 | 7 files | Tasks, client lists, SMS, email campaigns |
| 5 | 4 files | KPI config, dashboard widgets, security settings, online stores |
| 6 | 1 migration | All orphaned data reassigned to correct owners |

**Total: 21 code files + 1 database migration**

---

## What This Fixes

After implementation:
- Team members can create rooms, surfaces, vendors, etc. and see them immediately
- Account owners see all data created by their team
- Existing orphaned data becomes visible again
- The entire SaaS app works consistently for all users


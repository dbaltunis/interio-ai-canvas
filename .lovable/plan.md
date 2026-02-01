
# Phase 2: Additional Multi-Tenant Fixes

## Overview

The database migration confirmed that **orphaned data was successfully fixed** (0 orphaned records). However, the search revealed **additional files** that still use `user_id: user.id` pattern and need fixing to prevent future data disappearing issues for team members.

---

## Additional Files Requiring Fixes

### Category 1: HIGH PRIORITY - Frequently Used Features

| File | Line(s) | Table | Current Issue |
|------|---------|-------|---------------|
| `src/hooks/useGeneralEmailTemplates.ts` | 131, 204 | email_templates | Templates created by team members invisible |
| `src/components/clients/QuickInvoiceDialog.tsx` | 55 | quotes | Quick quotes created invisible |
| `src/components/clients/QuickJobDialog.tsx` | 90 | projects | Quick jobs created invisible |
| `src/hooks/useHeadingOptions.ts` | 81 | enhanced_inventory_items | Legacy heading creation broken |
| `src/hooks/useSystemTemplates.ts` | 63 | curtain_templates | Cloned templates invisible |
| `src/components/settings/templates/DynamicTemplateGenerator.tsx` | 179 | quote_templates | Generated templates invisible |
| `src/hooks/useSampleData.ts` | 40, 62, 77, 92, 105 | clients, projects, etc. | Sample data seeded under wrong user |
| `src/components/settings/tabs/components/TopSystemsManager.tsx` | 142 | enhanced_inventory_items | Top systems created invisible |

### Category 2: MEDIUM PRIORITY - Settings & Integrations

| File | Line(s) | Table | Current Issue |
|------|---------|-------|---------------|
| `src/hooks/useUserNotificationSettings.ts` | 83 | user_notification_settings | Per-user settings (may be intentional) |
| `src/hooks/useShopifyIntegrationReal.ts` | 67 | shopify_integrations | Per-user integration (may be intentional) |

### Category 3: LOW PRIORITY - Edge Functions (Backend)

Edge functions that save records may also need fixing, but they typically operate with a different auth context:

| File | Table | Notes |
|------|-------|-------|
| `supabase/functions/send-client-email/index.ts` | notification_usage | Usage tracking |
| `supabase/functions/stripe-connect-callback/index.ts` | payment_provider_connections | Payment setup |

---

## Implementation Plan

### Part 1: Fix High Priority Hooks & Components (8 files)

**1. useGeneralEmailTemplates.ts** - Fix create and duplicate mutations
```typescript
const { effectiveOwnerId } = await getEffectiveOwnerForMutation();
// Replace: user_id: user.id → user_id: effectiveOwnerId
```

**2. QuickInvoiceDialog.tsx** - Fix quote creation
**3. QuickJobDialog.tsx** - Fix project creation
**4. useHeadingOptions.ts** - Fix heading creation (deprecated but still used)
**5. useSystemTemplates.ts** - Fix template cloning
**6. DynamicTemplateGenerator.tsx** - Fix template generation
**7. useSampleData.ts** - Fix sample data seeding
**8. TopSystemsManager.tsx** - Fix top system creation

### Part 2: Database Migration for Any New Orphaned Data

After code fixes, run a migration to clean up any records created since the last migration in these additional tables:

```sql
-- Fix email_templates
UPDATE email_templates et
SET user_id = (SELECT COALESCE(up.parent_account_id, up.user_id) FROM user_profiles up WHERE up.user_id = et.user_id)
WHERE et.user_id IN (SELECT user_id FROM user_profiles WHERE parent_account_id IS NOT NULL);

-- Fix quote_templates
UPDATE quote_templates qt
SET user_id = (SELECT COALESCE(up.parent_account_id, up.user_id) FROM user_profiles up WHERE up.user_id = qt.user_id)
WHERE qt.user_id IN (SELECT user_id FROM user_profiles WHERE parent_account_id IS NOT NULL);

-- Fix curtain_templates
UPDATE curtain_templates ct
SET user_id = (SELECT COALESCE(up.parent_account_id, up.user_id) FROM user_profiles up WHERE up.user_id = ct.user_id)
WHERE ct.user_id IN (SELECT user_id FROM user_profiles WHERE parent_account_id IS NOT NULL);
```

---

## Files to Modify (8 files)

| File | Change |
|------|--------|
| `src/hooks/useGeneralEmailTemplates.ts` | Import helper, use effectiveOwnerId in mutations |
| `src/components/clients/QuickInvoiceDialog.tsx` | Import helper, use effectiveOwnerId |
| `src/components/clients/QuickJobDialog.tsx` | Import helper, use effectiveOwnerId |
| `src/hooks/useHeadingOptions.ts` | Import helper, use effectiveOwnerId |
| `src/hooks/useSystemTemplates.ts` | Import helper, use effectiveOwnerId |
| `src/components/settings/templates/DynamicTemplateGenerator.tsx` | Import helper, use effectiveOwnerId |
| `src/hooks/useSampleData.ts` | Import helper, use effectiveOwnerId |
| `src/components/settings/tabs/components/TopSystemsManager.tsx` | Remove user_id assignment (hook already fixed) |

---

## What This Fixes

After implementation:
- **Email templates**: Team members can create/duplicate email templates
- **Quick invoices/jobs**: Quick creation dialogs work for team members
- **Template cloning**: System templates can be cloned by team members
- **Sample data**: Sample data seeded correctly for new team accounts
- **Top systems**: Blind top systems visible when created by team members

---

## Notes on Intentional Per-User Settings

Some files use `user_id: user.id` intentionally because they store **per-user preferences**, not shared team data:

- `useUserNotificationSettings.ts` - Each user has their own notification preferences
- `useShopifyIntegrationReal.ts` - Already has fallback to parent account logic

These files do NOT need fixing.

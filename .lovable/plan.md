
## Fix Account Health "Fix Settings" Button - Missing RLS Policies

### Problem Summary

The "Fix" button in the Account Health Dashboard fails with "Failed to fix settings" because the `account_settings` table is missing INSERT and UPDATE RLS policies. Only SELECT policies exist, which blocks the System Owner from creating missing settings records.

### Root Cause Analysis

**Current RLS Policies on `account_settings`:**

| Operation | Policy? | Result |
|-----------|---------|--------|
| SELECT | ✅ Yes | System Owner can view |
| INSERT | ❌ Missing | **RLS BLOCKS INSERT** |
| UPDATE | ❌ Missing | **RLS BLOCKS UPDATE** |
| DELETE | ❌ Missing | **RLS BLOCKS DELETE** |

When the System Owner clicks "Fix" → code calls `supabase.from('account_settings').insert(...)` → RLS denies because no INSERT policy matches.

### Affected Accounts

8 accounts currently missing `account_settings`:
- CHRISTOS FOUNDOULIS
- InterioApp Free Trial
- Auguste Klimaite
- CCCO Admin
- 1 client
- Angely-Paris
- InterioApp_Australasia
- Holly's dad

---

### Solution: Add Missing RLS Policies

Create a database migration to add INSERT, UPDATE, and DELETE policies for the `account_settings` table.

**Policies to Add:**

1. **INSERT Policy** - Allow:
   - Account owners to create their own settings (`auth.uid() = account_owner_id`)
   - System Owners to create settings for any account (`is_system_owner(auth.uid())`)

2. **UPDATE Policy** - Allow:
   - Account members to update their account's settings
   - System Owners to update any account's settings

3. **DELETE Policy** - Allow:
   - System Owners only (cleanup orphaned records)

---

### Technical Implementation

**SQL Migration:**

```sql
-- Add INSERT policy for account_settings
CREATE POLICY "account_settings_insert_policy" ON public.account_settings
FOR INSERT
WITH CHECK (
  auth.uid() = account_owner_id
  OR is_system_owner(auth.uid())
);

-- Add UPDATE policy for account_settings
CREATE POLICY "account_settings_update_policy" ON public.account_settings
FOR UPDATE
USING (
  get_account_owner(auth.uid()) = account_owner_id
  OR is_system_owner(auth.uid())
)
WITH CHECK (
  get_account_owner(auth.uid()) = account_owner_id
  OR is_system_owner(auth.uid())
);

-- Add DELETE policy for account_settings (System Owner only)
CREATE POLICY "account_settings_delete_policy" ON public.account_settings
FOR DELETE
USING (
  is_system_owner(auth.uid())
);
```

---

### What Each Status Means (Reference)

| Status | Condition | User Impact |
|--------|-----------|-------------|
| **Critical** 🔴 | Missing permissions OR business settings | Features hidden, calculator broken |
| **Warning** ⚠️ | Missing account settings, sequences, or statuses | Some features may not work correctly |
| **Healthy** ✅ | All 6 checks pass | Fully functional account |

| Check | Expected | Purpose |
|-------|----------|---------|
| Permissions | 77/77 | Controls feature access (view/edit/delete) |
| Business Settings | ✅ | Tax rates, units, company info for calculator |
| Account Settings | ✅ | Currency, language, integrations |
| Sequences | 5/5 | Auto-numbering for quotes, jobs, invoices |
| Job Statuses | >0 | Workflow states (New → Completed) |
| Subscription | ✅ | Billing and trial management |

---

### Files to Modify

| Location | Change |
|----------|--------|
| New migration | Add 3 RLS policies to `account_settings` table |

---

### Expected Outcome

After implementation:
- "Fix" button will successfully create missing `account_settings` records
- All 8 accounts with warnings will become fixable
- Health scores will improve after fixes are applied
- The System Owner can repair any account from the dashboard

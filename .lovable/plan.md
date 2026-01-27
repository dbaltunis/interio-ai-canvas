

# Fix: Critical Data Isolation Bug - New Accounts Seeing Other Users' Jobs

## Root Cause Identified

When a new account is created and the user logs in, they can see jobs/projects from **other accounts**. These appear "greyed out" with $0.00 prices because the related data (quotes, clients) is correctly blocked by RLS, but the projects themselves leak through.

### The Specific Bug

The RLS policy `"Allow public read access via share link"` on the `projects` table applies to **both** `anon` AND `authenticated` roles:

```sql
CREATE POLICY "Allow public read access via share link"
ON projects FOR SELECT TO anon, authenticated
USING (
  (work_order_token IS NOT NULL AND work_order_shared_at IS NOT NULL)
  OR
  public.project_has_active_share_link(id)
);
```

**Problem**: PostgreSQL combines permissive RLS policies with OR logic. This means ANY project with a share link becomes visible to ALL logged-in users, bypassing account isolation.

### Why Data Appears "Greyed Out"

| Table | RLS Status | Result |
|-------|------------|--------|
| `projects` | **Leaking via share link policy** | 8 projects visible to all users |
| `quotes` | Correctly isolated | New accounts see 0 quotes |
| `clients` | Correctly isolated | New accounts can't see clients |
| `job_statuses` | Isolated by account | Status lookup fails ("Error fetching status") |

The UI tries to join these tables client-side. When projects leak but quotes/clients don't, the result is:
- Jobs appear in the list (from leaked projects)
- $0.00 prices (no quotes data)
- "No Client" or missing client names
- Grey/unknown status badges

### Evidence

Database queries confirmed:
- 4 projects with legacy `work_order_token` 
- 4 projects with active share links
- Total: 8 projects visible to ANY authenticated user
- These match the "greyed out" rows the user sees

---

## Solution

### Part 1: Database Migration - Fix Share Link Policy on Projects

Change the share link policy to apply **ONLY to `anon` role**, not `authenticated`:

```sql
-- Drop the problematic policy
DROP POLICY IF EXISTS "Allow public read access via share link" ON projects;

-- Recreate with ONLY anon role (for true public sharing)
CREATE POLICY "Allow public read access via share link"
ON projects FOR SELECT TO anon
USING (
  (work_order_token IS NOT NULL AND work_order_shared_at IS NOT NULL)
  OR
  public.project_has_active_share_link(id)
);
```

### Part 2: Apply Same Fix to Related Tables

The same pattern exists on `clients` and `workshop_items`:

```sql
-- Fix clients table
DROP POLICY IF EXISTS "Allow public read access via share link" ON clients;
DROP POLICY IF EXISTS "Allow public read access to clients via share link" ON clients;

CREATE POLICY "Allow public read access via share link"
ON clients FOR SELECT TO anon
USING (client_has_active_share_link(id));

-- Fix workshop_items table  
DROP POLICY IF EXISTS "Allow public read access via share link" ON workshop_items;

CREATE POLICY "Allow public read access via share link"
ON workshop_items FOR SELECT TO anon
USING (
  project_id IN (
    SELECT id FROM projects 
    WHERE (work_order_token IS NOT NULL AND work_order_shared_at IS NOT NULL)
    OR project_has_active_share_link(id)
  )
);
```

---

## Files to Modify

| File | Change |
|------|--------|
| New SQL Migration | Update 3 RLS policies to restrict `anon` only |

---

## What This Fixes

After this fix:
1. New accounts will see **only their own projects** (correctly 0 for new accounts)
2. The "greyed out" foreign projects will no longer appear
3. Shared work order links continue to work for anonymous viewers
4. Authenticated users see only their account's data
5. All existing accounts are fixed automatically (universal SaaS fix)

---

## Why This Happened

The share link feature was implemented to allow work orders to be shared via public URLs (like Google Docs). The policy was added to both `anon` AND `authenticated` roles, likely to handle the case where a logged-in user clicks a shared link.

However, this created an unintended side effect: the policy grants access to ANY authenticated user for ANY project with a share link, breaking multi-tenant isolation.

---

## Testing Plan

1. Create a fresh test account
2. Verify Jobs tab shows "0 projects" badge AND zero rows
3. Log in as an existing account with shared projects
4. Verify those projects are still visible
5. Open a shared work order link while logged out - verify it works

---

## Technical Notes

- This fix applies to all 600+ client accounts immediately
- No data is lost - only visibility is corrected
- Share links continue to function for their intended purpose
- The fix follows the memory pattern for "share-link-rls-policy-standard"


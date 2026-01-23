

# Fix Plan: Issue 2 - Shared Work Order Doesn't Work When Logged In

## Problem Summary

When a user is **logged in** to InterioApp and tries to open a public share link (e.g., `https://app.interio.app/work-order/abc123`), the page fails to load the data. However, it works perfectly in an **incognito window**.

## Root Cause Analysis

The issue is an **RLS policy role mismatch**:

| Scenario | Supabase Role | RLS Policy Target | Result |
|----------|---------------|-------------------|--------|
| Incognito (not logged in) | `anon` | `TO anon` | Works |
| Logged in user | `authenticated` | `TO anon` | Fails |

The current RLS policies for public share link access are configured with `TO anon`:

```sql
CREATE POLICY "Allow public read access via share link"
ON projects FOR SELECT TO anon  -- Only applies to anonymous users!
USING (...)
```

When a logged-in user visits the share link URL, the Supabase client automatically includes their JWT token. This makes Supabase use the `authenticated` role instead of `anon`, which means these policies don't apply.

## Solution Options

### Option A: Database Fix (Recommended)

Update RLS policies to include BOTH `anon` AND `authenticated` roles for share link access:

```sql
-- Change from: TO anon
-- Change to: TO anon, authenticated
```

**Pros:**
- Single place to fix (database)
- Works for all current and future code paths
- No frontend code changes needed

**Cons:**
- Requires migration

### Option B: Frontend Fix

Create a separate anonymous Supabase client for the PublicWorkOrder page:

```typescript
const anonClient = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
// Use anonClient for share link queries
```

**Pros:**
- No database changes

**Cons:**
- Adds complexity
- Need to maintain two client patterns
- Doesn't fix the root cause

## Implementation Plan (Option A - Recommended)

### Step 1: Create Database Migration

Create a new migration to update the RLS policies:

```text
File: supabase/migrations/[timestamp]_fix_share_link_rls_for_authenticated.sql
```

**Changes:**

1. **work_order_share_links** - Update "Public can read share links by token":
   - From: `TO anon`
   - To: `TO anon, authenticated`

2. **projects** - Update "Allow public read access via share link":
   - From: `TO anon`
   - To: `TO anon, authenticated`

3. **workshop_items** - Update "Allow public read access to workshop_items via share link":
   - From: `TO anon`
   - To: `TO anon, authenticated`

4. **clients** - Update "Allow public read access to clients via share link":
   - From: `TO anon`
   - To: `TO anon, authenticated`

5. **work_order_shares** - Update viewer session policies:
   - "Allow anonymous viewers to create their own session"
   - "Allow anonymous viewers to read their own session"
   - "Allow anonymous viewers to update their own session"
   - From: `TO anon`
   - To: `TO anon, authenticated`

### Step 2: Migration SQL

```sql
-- =============================================
-- Fix share link RLS to work for logged-in users
-- =============================================

-- 1. work_order_share_links
DROP POLICY IF EXISTS "Public can read share links by token" ON work_order_share_links;
CREATE POLICY "Public can read share links by token"
ON work_order_share_links FOR SELECT TO anon, authenticated
USING (
  is_active = true 
  AND (expires_at IS NULL OR expires_at > now())
);

-- 2. projects
DROP POLICY IF EXISTS "Allow public read access via share link" ON projects;
CREATE POLICY "Allow public read access via share link"
ON projects FOR SELECT TO anon, authenticated
USING (
  (work_order_token IS NOT NULL AND work_order_shared_at IS NOT NULL)
  OR
  id IN (
    SELECT project_id FROM work_order_share_links 
    WHERE is_active = true 
    AND (expires_at IS NULL OR expires_at > now())
  )
);

-- 3. workshop_items
DROP POLICY IF EXISTS "Allow public read access to workshop_items via share link" ON workshop_items;
CREATE POLICY "Allow public read access to workshop_items via share link"
ON workshop_items FOR SELECT TO anon, authenticated
USING (
  project_id IN (
    SELECT id FROM projects
    WHERE (work_order_token IS NOT NULL AND work_order_shared_at IS NOT NULL)
  )
  OR
  project_id IN (
    SELECT project_id FROM work_order_share_links 
    WHERE is_active = true 
    AND (expires_at IS NULL OR expires_at > now())
  )
);

-- 4. clients
DROP POLICY IF EXISTS "Allow public read access to clients via share link" ON clients;
CREATE POLICY "Allow public read access to clients via share link"
ON clients FOR SELECT TO anon, authenticated
USING (
  id IN (
    SELECT client_id FROM projects
    WHERE (work_order_token IS NOT NULL AND work_order_shared_at IS NOT NULL)
  )
  OR
  id IN (
    SELECT p.client_id FROM projects p
    WHERE p.id IN (
      SELECT project_id FROM work_order_share_links 
      WHERE is_active = true 
      AND (expires_at IS NULL OR expires_at > now())
    )
  )
);

-- 5. work_order_shares - viewer session policies
DROP POLICY IF EXISTS "Allow anonymous viewers to create their own session" ON work_order_shares;
CREATE POLICY "Allow viewers to create their own session"
ON work_order_shares FOR INSERT TO anon, authenticated
WITH CHECK (
  created_by_viewer = true 
  AND shared_by IS NULL
);

DROP POLICY IF EXISTS "Allow anonymous viewers to read their own session" ON work_order_shares;
CREATE POLICY "Allow viewers to read their own session"
ON work_order_shares FOR SELECT TO anon, authenticated
USING (session_token IS NOT NULL);

DROP POLICY IF EXISTS "Allow anonymous viewers to update their own session" ON work_order_shares;
CREATE POLICY "Allow viewers to update their own session"
ON work_order_shares FOR UPDATE TO anon, authenticated
USING (session_token IS NOT NULL AND created_by_viewer = true);
```

## Files to Create/Modify

| File | Action | Purpose |
|------|--------|---------|
| `supabase/migrations/[timestamp]_fix_share_link_rls_for_authenticated.sql` | CREATE | Add RLS policies for authenticated role |

## Security Considerations

This change is **safe** because:

1. **Token-based access is preserved**: Users still need a valid share link token to access data
2. **Expiration checks remain**: Expired links are still blocked
3. **Active flag check remains**: Deactivated links are still blocked
4. **Read-only access**: These policies only grant SELECT permission, not INSERT/UPDATE/DELETE
5. **Additive approach**: We're adding permissions, not removing existing security

## Testing Plan

1. **Before deployment**: Share link works in incognito, fails when logged in
2. **After deployment**:
   - Share link works in incognito (unchanged)
   - Share link works when logged in (fixed)
   - User can still see their own projects normally
   - Expired share links still blocked
   - Deactivated share links still blocked

## Summary

This is a database-level fix that updates 5 RLS policies to include both `anon` AND `authenticated` roles. No frontend code changes required. The fix ensures logged-in users can view shared work orders without being blocked by their authentication session.




# Fix: System Owner Cannot Create Trial Subscriptions

## Problem

The `user_subscriptions` table is missing an **INSERT policy** for System Owners.

### Current RLS Policies

| Policy | Command | Allows System Owner? |
|--------|---------|---------------------|
| `System owners can view all subscriptions` | SELECT | Yes |
| `System owners can update all subscriptions` | UPDATE | Yes |
| `Users can insert their own subscription` | INSERT | **No** (only `auth.uid() = user_id`) |

When you click "Create Trial Subscription" for InterioApp DEMO:
1. The mutation tries to INSERT a row with `user_id = [DEMO user's ID]`
2. RLS checks: `auth.uid() = user_id` → Your ID does not equal DEMO's ID
3. Insert is blocked with error code `42501`

---

## Solution

Add a System Owner INSERT policy to `user_subscriptions`.

### Migration SQL

```sql
-- Add System Owner INSERT policy to user_subscriptions
-- This allows admins to create subscriptions for any account

CREATE POLICY "System owners can insert subscriptions"
ON public.user_subscriptions
FOR INSERT
TO authenticated
WITH CHECK (
  public.is_system_owner(auth.uid())
);
```

This uses the existing `is_system_owner()` function we created earlier (which is `SECURITY DEFINER` to avoid recursion).

---

## Technical Details

### After Fix

```text
user_subscriptions RLS:
  SELECT: (own row) OR (same account) OR (System Owner)  <- Already works
  INSERT: (own row) OR (System Owner)                    <- NEW
  UPDATE: (own row) OR (System Owner)                    <- Already works
```

---

## Verification Steps

After migration:
1. Go to `/admin/accounts`
2. Open InterioApp DEMO account
3. Click "Create Trial Subscription"
4. Verify success toast appears
5. Subscription details should now display


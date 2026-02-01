
# Fix: TWC Admin Backfill - Role Check + Run for You

## Problem
The `twc-admin-backfill` edge function has two issues:
1. **Role mismatch**: Checks for `'super_admin'` but your actual role is `'System Owner'`  
2. **Console syntax error**: The browser console doesn't have `supabase` globally available

## Solution

### Step 1: Fix the Role Check
Update line 44 in `supabase/functions/twc-admin-backfill/index.ts`:

```typescript
// FROM:
if (profile.role !== 'super_admin') {

// TO: 
if (profile.role !== 'System Owner') {
```

### Step 2: Deploy and Test
After fixing the role check, I'll:
1. Deploy the updated edge function
2. Test it using the authenticated edge function tool (which uses your current session)
3. Return the results showing all accounts processed

## Expected Result
```text
{
  "success": true,
  "accounts_processed": 4,
  "total_items_updated": ~1000+,
  "total_primary_colors_set": ~1000+,
  "account_details": [...]
}
```

## Files to Modify

| File | Change |
|------|--------|
| `supabase/functions/twc-admin-backfill/index.ts` | Line 44: Change `'super_admin'` → `'System Owner'` |

This is a 1-line fix that will allow the backfill to run successfully.



## Handle RFMS 405 on Push: Try Alternative Endpoints, Then Graceful Fallback

### Problem

When pushing a quote to RFMS, the function calls `POST /opportunities` which returns `405 Method Not Allowed`. The RFMS v2 API does not support creating opportunities via POST at this tier. The raw error message is shown to the user, which is confusing.

### Solution

Update the push logic in `rfms-sync-quotes` to:

1. **Try multiple create endpoints** in sequence:
   - `POST /opportunities` (current, fails with 405)
   - `POST /quotes` (alternative endpoint)
   - `PUT /opportunities` (some APIs use PUT for create)
2. **If all fail with 405**, return a clear, user-friendly error instead of crashing
3. **Update the UI** to show a friendly message when push is not supported by the API tier

### Technical Changes

**File: `supabase/functions/rfms-sync-quotes/index.ts`**

In the push section (around line 418-434), replace the single `POST /opportunities` call with a multi-endpoint fallback:

```
Try sequence:
1. POST /opportunities
2. POST /quotes  
3. POST /estimates
If all return 405 → add a clear error:
  "Your RFMS API tier does not support creating quotes/opportunities. 
   You can still import quotes from RFMS using Pull."
```

If the endpoint works, proceed as normal. If all fail with 405, add a specific non-crashing error to `results.errors` and continue processing other projects.

**File: `src/components/integrations/IntegrationSyncStatus.tsx`**

Update the push error handling to detect the "does not support" message and show a friendlier toast:
- Use `variant: "warning"` (amber) instead of `variant: "destructive"` (red)
- Message: "RFMS Push Not Available -- Your RFMS plan doesn't support creating quotes. You can still pull/import quotes from RFMS."

### Files to Change

| File | Change |
|---|---|
| `supabase/functions/rfms-sync-quotes/index.ts` | Try POST /quotes and POST /estimates as fallbacks; return clear error when all return 405 |
| `src/components/integrations/IntegrationSyncStatus.tsx` | Detect 405/tier error and show amber warning toast instead of red error |

### After Fix

- Push attempts multiple RFMS endpoints before giving up
- If the API tier genuinely doesn't support quote creation, the user sees a clear amber warning: "Your RFMS plan doesn't support creating quotes. You can still import from RFMS."
- No more raw error messages with UUIDs shown to the user


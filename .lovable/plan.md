

## Fix RFMS Sync Notifications + ERP Sync Status Display

### Root Causes Found

**Why notifications don't appear to work:**
The sync DOES show a toast, but it says things like "Customer Sync Complete / 1 warnings" because the actual sync silently fails. The reason: `ensureSession` caches the session token and reuses it without checking expiry. The RFMS session expires after ~30 minutes (e.g., `"sessionExpires": "Thu, 19 Feb 2026 14:10:33 GMT"`), but subsequent sync calls at 14:38+ reuse the expired token. Every API call then returns 401 Unauthorized, which gets swallowed into "1 errors" in the results. The user sees a toast but it has no meaningful numbers (0 imported, 0 exported, 0 updated), making it feel like nothing happened.

**Why ERP Sync Status always shows "Not synced":**
The `IntegrationSyncStatus` component checks for columns `rfms_quote_id`, `rfms_order_id`, `netsuite_estimate_id`, `netsuite_sales_order_id`, `netsuite_invoice_id` on the `projects` table. **None of these columns exist in the database.** The component was built before the columns were created, so it always shows "Not synced" for every project regardless of actual sync state.

---

### Fix 1: Session Token Expiry Handling in All Edge Functions

**Files:** `rfms-sync-customers/index.ts`, `rfms-sync-quotes/index.ts`, `rfms-session/index.ts`

Update `ensureSession` to:
1. Check `session_started_at` and clear the cached token if older than 25 minutes (RFMS sessions expire at ~30 min)
2. Add a retry mechanism in `rfmsRequest`: if a 401 is returned, clear the cached token, get a fresh session, and retry once

```typescript
// In ensureSession - add expiry check before reusing cached token
if (session_token) {
  const sessionAge = Date.now() - new Date(integration.api_credentials?.session_started_at || 0).getTime();
  const MAX_SESSION_AGE_MS = 25 * 60 * 1000; // 25 minutes (RFMS expires at ~30)
  
  if (sessionAge < MAX_SESSION_AGE_MS) {
    return { sessionToken: session_token, storeQueue: store_queue, apiUrl };
  }
  // Token likely expired, get a fresh one
  console.log("RFMS session token expired, refreshing...");
}
// Continue to create new session...
```

Also update `rfmsRequest` to detect 401 and signal that a session refresh is needed:

```typescript
if (response.status === 401) {
  throw new Error("RFMS_SESSION_EXPIRED");
}
```

And in the main sync handler, wrap the pull/push in a retry that catches `RFMS_SESSION_EXPIRED`, clears the token, creates a new session, and retries.

---

### Fix 2: Add Missing Columns to `projects` Table

**New SQL migration:**

```sql
ALTER TABLE public.projects ADD COLUMN IF NOT EXISTS rfms_quote_id TEXT;
ALTER TABLE public.projects ADD COLUMN IF NOT EXISTS rfms_order_id TEXT;
ALTER TABLE public.projects ADD COLUMN IF NOT EXISTS netsuite_estimate_id TEXT;
ALTER TABLE public.projects ADD COLUMN IF NOT EXISTS netsuite_sales_order_id TEXT;
ALTER TABLE public.projects ADD COLUMN IF NOT EXISTS netsuite_invoice_id TEXT;

CREATE INDEX IF NOT EXISTS idx_projects_rfms_quote_id ON public.projects(rfms_quote_id);

NOTIFY pgrst, 'reload schema';
```

This makes the `IntegrationSyncStatus` component functional. When `rfms-sync-quotes` successfully pushes or pulls a quote, it sets `rfms_quote_id` on the project, and the card will show "Synced" with the RFMS quote ID.

---

### Fix 3: Better Sync Result Notifications

**File:** `RFMSIntegrationTab.tsx`

Update the toast calls after sync to be more informative:

- When sync has 0 results and errors: show `variant: "warning"` with the actual error message (not "No changes needed")
- When sync succeeds with numbers: show a clear summary like "Imported 12 customers from RFMS"
- When sync has partial results + errors: show both the success count and error summary

```typescript
// After sync completes
if (data.errors?.length > 0 && results.imported === 0 && results.updated === 0) {
  // Total failure - show as warning with the actual error
  toast({
    title: "Customer Sync Issue",
    description: data.errors[0], // Show the actual error
    variant: "warning",
  });
} else {
  // Success (possibly partial)
  const parts = [];
  if (data.imported > 0) parts.push(`${data.imported} imported`);
  if (data.updated > 0) parts.push(`${data.updated} updated`);
  if (data.skipped > 0) parts.push(`${data.skipped} skipped`);
  
  toast({
    title: parts.length > 0 ? "Customer Sync Complete" : "No New Customers",
    description: parts.length > 0 
      ? parts.join(', ') + (data.errors?.length ? ` (${data.errors.length} warnings)` : '')
      : "All customers are already up to date.",
    variant: data.errors?.length > 0 ? "warning" : "default",
  });
}
```

Also update `types.ts` to include the new project columns so TypeScript doesn't complain when the component reads them.

---

### Fix 4: Update `IntegrationSyncStatus` to Use Real Data

**File:** `IntegrationSyncStatus.tsx`

The component already has the right logic -- it just needs the database columns to exist (Fix 2). Once the columns are added, the component will correctly show:
- "Synced" with green badge when `rfms_quote_id` is set on a project
- "Not synced" when it's null

No code changes needed in this component -- the Fix 2 migration makes it work.

---

### Files to Change

| File | Change |
|---|---|
| `supabase/functions/rfms-sync-customers/index.ts` | Add session expiry check + 401 retry logic |
| `supabase/functions/rfms-sync-quotes/index.ts` | Add session expiry check + 401 retry logic |
| `supabase/functions/rfms-session/index.ts` | Add session expiry check |
| `src/components/integrations/RFMSIntegrationTab.tsx` | Smarter toast messages based on result content |
| `src/integrations/supabase/types.ts` | Add new project columns to type definitions |
| New SQL migration | Add `rfms_quote_id`, `rfms_order_id`, `netsuite_*` columns to `projects` |

### After the Fix

- Session tokens auto-refresh when expired (no more silent 401 failures)
- Sync notifications clearly report what happened: "Imported 12 customers" or "RFMS session expired, retrying..." or the actual error message
- ERP Sync Status card on each job shows real sync state based on actual database columns
- When a quote is pushed/pulled from RFMS, the project's `rfms_quote_id` is set and the badge turns green


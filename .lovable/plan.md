
## Fix All RFMS Integration Issues: Notifications, Customer Sync, and ERP Status

### Critical Root Cause: ALL Success Notifications Are Silently Suppressed

The `use-toast.ts` file (line 160) defaults **every non-error toast** to `importance: 'silent'`, which means the toast is **never rendered** (line 163 returns early). This affects:

- "Connection Successful" -- suppressed (variant: default)
- "RFMS Configuration Saved" -- suppressed (variant: default)
- "Customer Sync Complete" -- suppressed (variant: default)
- "No New Customers" -- suppressed (variant: default)
- "Quote Sync Complete" -- suppressed (variant: default)
- "Measurements Synced" -- suppressed (variant: default)
- "Schedule Synced" -- suppressed (variant: default)

Only `variant: "warning"` or `variant: "destructive"` toasts appear. This is why the user sees error toasts but never sees success or informational toasts.

**Fix:** Add `importance: 'important'` to ALL toast calls in `RFMSIntegrationTab.tsx` (and all integration tabs). This ensures every user-triggered action produces visible feedback.

---

### Issue 2: Customer Sync Uses Wrong RFMS API Pattern

From the edge function logs:
- `POST /customers` returns 405 (Method Not Allowed)
- `GET /customers` returns field metadata (enum values), not customer records

From the official RFMS API v2 documentation (https://api2docs.rfms.online), the Customers section says "Search for and Get Customer" is a Standard tier feature. The v2 response format wraps everything in `{status: "success", result: {}}`.

The `GET /customers` endpoint without parameters returns **available field values for search filters** (the metadata). To actually search for customers, the RFMS v2 API requires:
- `GET /customers/{customerId}` -- get a specific customer by ID
- `GET /customers?lastName=Smith` -- search by specific field values (the fields shown in the metadata response ARE the search parameters)

The metadata response actually tells us what search parameters are available. The user's RFMS test connection DOES find customers (the test endpoint returns a customer count), so customers exist.

**Fix:** Update `rfms-sync-customers` to:
1. First call `GET /customers` to get the metadata (which lists available salespersons, entry types, etc.)
2. Then search using the salesperson names as search parameters: `GET /customers?preferredSalesperson1=GREG%20TAANE` (iterating through each salesperson from the metadata)
3. Or try `GET /customers?entryType=Customer` with different field combinations
4. Also try `GET /customers?limit=500&offset=0` (pagination params)
5. Log every response clearly for debugging

---

### Issue 3: Quote Export Uses POST /opportunities (Returns 405)

The RFMS docs say "Create opportunities" requires Standard tier, but the v2 API returns 405 on `POST /opportunities`. The `GET /opportunities` works and returns `{status: "success", result: []}` -- the store just has no opportunities yet.

**Fix:** 
- Quote PULL (import) already works -- `GET /opportunities` returns valid data (just empty for now)
- Quote PUSH: Try `POST /opportunities` with a different request body format, or try `POST /quotes` as an alternative
- If POST continues to return 405, disable push and show clear message about API tier requirements
- Log the exact request body being sent for debugging

---

### Issue 4: Schedule Endpoints Return 404

All schedule endpoints (`/schedule/jobs`, `/scheduling/jobs`, `/jobs`, `/schedule`) return 404. This means either:
- Schedule Pro is not enabled for this RFMS account
- The v2 API has different endpoint paths

Per RFMS docs: "Get scheduled jobs by crew or order number" is an Enterprise tier feature. "Schedule New Jobs and Edit Existing Jobs" is also Enterprise.

**Fix:** 
- When all schedule endpoints return 404, show a clear message: "RFMS Schedule Pro is not available. This feature requires the Enterprise API tier or a Schedule Pro subscription."
- Don't silently report "0 imported, 0 updated" -- report the actual 404 error to the user

---

### Issue 5: Measurements Return 0 Because No Projects Are Linked

Measurements depend on `rfms_quote_id` being set on projects. Since no quotes have been imported yet (RFMS has 0 opportunities), there are no linked projects to check.

**Fix:** When no linked projects exist, show "No projects are linked to RFMS quotes yet. Import quotes first using 'Import Quotes', then import measurements."

---

### Issue 6: "Not Synced" Badge on Jobs

The database columns exist (`rfms_quote_id`, `rfms_order_id`, etc.), the types include them, and `useProject` fetches with `select("*")`. The badge correctly shows "Not synced" because no RFMS quote IDs have been written to any projects yet (since the sync hasn't successfully imported any quotes).

This will automatically resolve once quotes are successfully synced and `rfms_quote_id` gets populated on projects.

No code change needed for this -- it's working as designed. The fix is to get the sync working.

---

### Files to Change

| File | Changes |
|---|---|
| `src/components/integrations/RFMSIntegrationTab.tsx` | Add `importance: 'important'` to ALL toast calls (17+ occurrences). Improve error messages for scheduling/measurements when features aren't available. |
| `src/components/integrations/NetSuiteIntegrationTab.tsx` | Add `importance: 'important'` to all toast calls |
| `src/components/integrations/GoogleCalendarIntegrationTab.tsx` | Add `importance: 'important'` to all toast calls |
| `src/components/integrations/MYOBExoIntegrationTab.tsx` | Add `importance: 'important'` to all toast calls |
| `src/components/integrations/CWSystemsIntegrationTab.tsx` | Add `importance: 'important'` to all toast calls |
| `src/components/integrations/NormanIntegrationTab.tsx` | Add `importance: 'important'` to all toast calls |
| `supabase/functions/rfms-sync-customers/index.ts` | Rewrite customer fetching to use metadata-driven search (use salesperson names from GET /customers as search params); log all responses for debugging |
| `supabase/functions/rfms-sync-scheduling/index.ts` | Return clear error message when all endpoints return 404 (Schedule Pro not available) |
| `supabase/functions/rfms-sync-measurements/index.ts` | Return clear error message when no linked projects exist |
| `supabase/functions/rfms-sync-quotes/index.ts` | Improve push error handling; try alternative endpoints for quote creation |

### Technical Detail: Toast Importance Fix

Every toast call in integration tabs needs `importance: 'important'`:

```typescript
// BEFORE (suppressed -- never shown to user):
toast({ title: "Connection Successful", description: "..." });

// AFTER (always shown):
toast({ title: "Connection Successful", description: "...", importance: 'important' });
```

This single change fixes: Test Connection, Save Configuration, Import Customers, Export Quotes, Import Quotes, Import Measurements, Sync Schedule, and all error notifications that use `variant: "default"`.

### Technical Detail: Customer Search Strategy

The RFMS `GET /customers` metadata response reveals the available search dimensions:
```json
{
  "customerType": ["COMMERCIAL", "RESIDENTIAL", ...],
  "entryType": ["Customer", "Prospect"],
  "preferredSalesperson1": ["GREG TAANE", "CHRIS OGDEN", ...]
}
```

New search strategy:
1. `GET /customers` -- get metadata (search parameter options)
2. For each salesperson in metadata, call `GET /customers?preferredSalesperson1={name}`
3. Aggregate all unique customers from all responses
4. If that fails, try `GET /customers?entryType=Customer`
5. If all methods fail, show: "Could not retrieve customers. Your RFMS API tier may require different search parameters."

### After Fix

- Every sync action shows a visible toast notification with clear results
- Customer search uses the correct RFMS v2 API search pattern
- Schedule sync shows clear message when Schedule Pro is unavailable
- Measurement sync shows clear message when no projects are linked to RFMS
- Once quotes are imported, the ERP Sync Status badge will automatically update from "Not synced" to green

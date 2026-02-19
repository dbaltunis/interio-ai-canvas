

## Fix RFMS Sync, Save Button UX, and Loading States Across All Integrations

### Issues Found (5 Critical, 2 Medium)

---

### Issue 1 (CRITICAL): RFMS `/customers` GET Returns Metadata, Not Customer Records

**Root Cause (from edge function logs):** The GET `/customers` endpoint returns field enums/schema metadata:
```json
{"customerType":["COMMERICAL","DECLINED",...], "entryType":["Customer","Prospect"], "taxStatus":[...], ...}
```
This is NOT a list of customer records. The pull logic checks `rfmsData.status === "success"` which is `undefined` on this response, so it silently skips everything and reports "0 imported, 0 exported, 0 updated" -- making it look like nothing works.

The RFMS v2 API likely requires a search/query endpoint (e.g., `/customers/search` or query parameters) to actually list customers, not just GET `/customers`.

**Fix:** Update `rfms-sync-customers` to:
1. Handle the v2 response format (no `{status, result}` wrapper -- data is at the top level or uses pagination)
2. Try `/customers/search` or `/customers?entryType=Customer` to get actual records
3. Log and report clearly when the API returns metadata instead of records

---

### Issue 2 (CRITICAL): RFMS POST `/customers` Returns 405 Method Not Allowed

**From logs:** Every customer push attempt returns `{"Message":"The requested resource does not support http method 'POST'."}` -- RFMS v2 does not support creating customers via POST. Export/push is not possible with this API version.

**Fix:** 
1. Remove or disable the "Export Customers" push button since POST is not supported
2. Show a clear info message: "RFMS v2 API supports importing customers only. Customer creation must be done in RFMS directly."
3. Report this in the notification instead of silently failing

---

### Issue 3 (CRITICAL): PostgREST Schema Cache Stale for `rfms_customer_id`

The column exists in the database but the edge function gets `column clients_1.rfms_customer_id does not exist` because PostgREST's schema cache hasn't been refreshed after the migration.

**Fix:** Run `NOTIFY pgrst, 'reload schema';` via a SQL migration to refresh the cache. This is a one-line fix.

---

### Issue 4 (CRITICAL): RFMS Pull Logic Expects `{status: "success"}` But v2 Returns Raw Data

Both `rfms-sync-customers` (line 271) and `rfms-sync-quotes` (line 215) check:
```typescript
if (rfmsData.status === "success" && rfmsData.result) {
```
But the RFMS v2 API returns data at the top level (arrays or objects), NOT wrapped in `{status, result}`. This means even when the API returns valid data, the pull logic skips it entirely.

**Fix:** Update both functions to handle v2 format:
```typescript
// v2: data is at top level (array or object with items)
const items = Array.isArray(rfmsData) ? rfmsData 
  : rfmsData.result ? (Array.isArray(rfmsData.result) ? rfmsData.result : rfmsData.result.customers || [])
  : [];
```

---

### Issue 5 (MEDIUM): Save Button Always Active on RFMS, NetSuite, Google Calendar, MYOB, CW Systems, Norman

TWC already implements the correct pattern with `hasChanges` + `useMemo` + `useRef` for initial load. All other integration tabs have the Save button always enabled, misleading users into thinking settings aren't saved.

**Fix:** Apply the TWC pattern to all 6 integration tabs:
- Track `savedValues` with `useMemo` from the integration prop
- Compute `hasChanges` by comparing form data to saved values
- Disable button and show "Saved" text when no changes exist
- Use `variant="secondary"` when disabled for visual clarity

**Files affected:**
| File | Current | Fix |
|---|---|---|
| `RFMSIntegrationTab.tsx` | Always enabled | Add `hasChanges` check |
| `NetSuiteIntegrationTab.tsx` | Always enabled | Add `hasChanges` check |
| `GoogleCalendarIntegrationTab.tsx` | Always enabled | Add `hasChanges` check |
| `MYOBExoIntegrationTab.tsx` | Always enabled | Add `hasChanges` check |
| `CWSystemsIntegrationTab.tsx` | Always enabled | Add `hasChanges` check |
| `NormanIntegrationTab.tsx` | Always enabled | Add `hasChanges` check |

---

### Issue 6 (MEDIUM): All Sync Buttons Show Loading When Any Is Clicked

Currently, `isSyncing` is a single boolean. When any sync button is clicked, ALL buttons show loading spinners, making it impossible to tell which operation is running.

**Fix:** Replace single `isSyncing` with per-action loading states:
```typescript
const [syncingAction, setSyncingAction] = useState<string | null>(null);
// Usage: setSyncingAction('import-customers'), setSyncingAction('export-quotes'), etc.
// Each button checks: disabled={syncingAction !== null}, shows spinner only when syncingAction === 'its-action'
```

Apply to both `RFMSIntegrationTab` and `NetSuiteIntegrationTab`.

---

### Issue 7 (MEDIUM): "Active" Badge Misleading on NetSuite, CW Systems, Norman

These tabs show "Active" when `integration.active === true`, but that just means credentials were saved. It doesn't confirm the connection works.

**Fix:** Apply the same badge logic from RFMS (Connected/Configured/Inactive) to:
- `NetSuiteIntegrationTab.tsx`
- `CWSystemsIntegrationTab.tsx` 
- `NormanIntegrationTab.tsx`
- `GoogleCalendarIntegrationTab.tsx`
- `MYOBExoIntegrationTab.tsx`

---

### Files to Change

| File | Changes |
|---|---|
| `supabase/functions/rfms-sync-customers/index.ts` | Fix v2 response parsing for pull; disable push (POST not supported); handle metadata vs customer list response |
| `supabase/functions/rfms-sync-quotes/index.ts` | Fix v2 response parsing for pull (no `{status, result}` wrapper) |
| `src/components/integrations/RFMSIntegrationTab.tsx` | Per-action loading states; `hasChanges` for save button; disable Export Customers button with info |
| `src/components/integrations/NetSuiteIntegrationTab.tsx` | `hasChanges` for save button; per-action loading; status badge fix; `warning` toast variant |
| `src/components/integrations/GoogleCalendarIntegrationTab.tsx` | `hasChanges` for save button; status badge fix |
| `src/components/integrations/MYOBExoIntegrationTab.tsx` | `hasChanges` for save button; status badge fix |
| `src/components/integrations/CWSystemsIntegrationTab.tsx` | `hasChanges` for save button; status badge fix |
| `src/components/integrations/NormanIntegrationTab.tsx` | `hasChanges` for save button; status badge fix |
| SQL Migration | `NOTIFY pgrst, 'reload schema';` to fix stale cache |

### SQL Migration

```sql
-- Refresh PostgREST schema cache after rfms_customer_id column addition
NOTIFY pgrst, 'reload schema';
```

### After All Fixes

- RFMS customer import correctly parses v2 API responses
- Export Customers disabled with explanation (POST not supported by RFMS v2)
- PostgREST cache refreshed so quote sync can access `rfms_customer_id`
- Save button greyed out and shows "Saved" on all integrations when nothing changed
- Each sync button shows its own loading spinner, not all buttons
- Status badges show Connected/Configured/Inactive based on actual connection state
- All integration errors use `warning` (amber) variant, not `destructive` (red)


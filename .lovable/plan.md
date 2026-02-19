

## Fix Three Critical Issues: Quote Totals, RFMS Push Feedback, and ERP Sync Indicators

### Issue 1: Wrong Total in Jobs List (ORDER-007 shows NZ$238.86 instead of NZ$4,936.34)

**Root Cause:** The jobs table displays `quote.total_amount` from the `quotes` table, which is only updated when the quotation sync hook runs inside the job detail page. If you add treatments/rooms and never revisit the quote tab, the stored `total_amount` stays stale at whatever it was when last synced (NZ$238.86). The Project tab shows NZ$4,936.34 because it calculates live from `windows_summary` data.

**Database proof:** The `quotes` table has `total_amount = 238.86` for this project, while the sum of `windows_summary.total_cost` for the same project is `3,290.89` (before tax/markup = ~$4,936 with markup).

**Fix:** In `JobsTableView.tsx`, for the `total` column case, fall back to summing `windows_summary.total_cost` when the quote `total_amount` seems stale or zero. We will create a lightweight hook (`useProjectTotals`) that fetches the computed project total from `windows_summary` for all visible projects in one batch query, and use that as the authoritative total in the jobs list.

### Issue 2: "Nothing to sync" Red Error After Push to RFMS

**Root Cause:** The push returns `exported: 0, updated: 0` because all RFMS create endpoints return 405 (tier restriction), and the project has no existing `rfms_quote_id` to update. The errors array contains the tier restriction message, but the code checks `data?.errors?.length > 0` first, so it should show the tier error message. However, if the error text doesn't contain "does not support" exactly, it falls through to `showErrorToast("RFMS Push Issue", errorMsg)` with a vague message, or if errors is empty but `didSomething` is false, it shows the red "Nothing to sync" toast.

The real problem: the "Nothing to sync" message is misleading. The push actually tried and failed due to tier restrictions, but the error gets lost in the logic flow. The `quote_create_unavailable` flag is being set but the UI no longer checks it.

**Fix:** 
- In `IntegrationSyncStatus.tsx`, when `!didSomething && data?.errors?.length > 0`, always show the error messages (not the generic "Nothing to sync")
- When `!didSomething && no errors`, show an amber warning toast instead of a red error toast
- Check configuration for `quote_create_unavailable` flag and show a clear "Your RFMS tier doesn't support creating new quotes" message upfront, before even attempting the push

### Issue 3: ERP Sync Indicator on the Main Jobs List

**What's needed:** A small visual indicator on each job row in the main jobs table showing whether it has been pushed to RFMS or NetSuite. This should be compact and not take extra space.

**Fix:** Add a tiny ERP indicator column (or append to the existing job number/status column) in `JobsTableView.tsx` that shows small RFMS/NetSuite badges when `rfms_quote_id` or `netsuite_estimate_id` is present on the project. The data is already available since projects are fetched with all columns.

---

### Technical Details

**File: `src/hooks/useProjectTotals.ts` (NEW)**

A hook that fetches accurate project totals by summing `windows_summary.total_cost` grouped by project. This replaces reliance on the often-stale `quotes.total_amount`.

- Accepts an array of project IDs
- Returns a map of `projectId -> calculatedTotal`
- Uses a single efficient query joining rooms -> surfaces -> windows_summary
- Applies markup settings where applicable

**File: `src/components/jobs/JobsTableView.tsx`**

1. Import and use `useProjectTotals` for the `total` column
2. For the `total` case: prefer calculated total from windows_summary; fall back to `quote.total_amount` only if no treatments exist
3. Same logic for the `balance` case
4. Add ERP sync indicators: after the job number or status column, show small RFMS/NetSuite badges using the project's `rfms_quote_id` / `netsuite_estimate_id` fields

**File: `src/components/integrations/IntegrationSyncStatus.tsx`**

1. Check `quote_create_unavailable` from integration configuration before attempting push
2. If the flag is set and project has no `rfms_quote_id`, show "Your RFMS tier doesn't support creating new quotes" in amber (not red) with a link to run diagnostics
3. Change the "Nothing to sync" notification from red `showErrorToast` to an amber `toast` with `variant: "warning"` — it's not an error, it's informational
4. When errors exist in the response, always display them instead of falling through to "Nothing to sync"

### Files to Change

| File | Change |
|---|---|
| `src/hooks/useProjectTotals.ts` | New hook - batch fetch accurate totals from windows_summary |
| `src/components/jobs/JobsTableView.tsx` | Use accurate totals; add ERP sync indicator badges on each row |
| `src/components/integrations/IntegrationSyncStatus.tsx` | Check tier flag before push; fix notification logic (amber for "nothing to sync", show errors when they exist) |

### After This Fix

- Job list shows correct totals calculated from actual treatment data, not stale quote snapshots
- "Push to RFMS" tells you upfront if your tier doesn't support it (amber, not red)
- When genuinely nothing changed, you see an amber info message, not a scary red error
- Each job row shows a small RFMS or NetSuite icon if it's been synced, giving you instant visibility across all jobs


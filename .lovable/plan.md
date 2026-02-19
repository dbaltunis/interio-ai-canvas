

## Stop Showing Buttons That Can't Work — Remember RFMS Tier Limitations

### The Problem (Why You're Seeing Confusing Messages)

Your RFMS API tier has two limitations:
- **Customer records**: The API returns field definitions (metadata) instead of actual customer data. Every attempt to import customers will fail the same way.
- **Creating new quotes**: `POST` requests are rejected (405 error). However, **updating** existing quotes via `PUT` works fine.

This is why you see "Quote synced successfully" when re-syncing an already-linked quote (update = PUT = works), but "RFMS Push Not Available" when pushing a brand new quote (create = POST = blocked).

The app currently keeps showing these buttons even though they will always fail, which is confusing and erodes trust.

### The Fix

**Save the tier limitations** after the first failure, so the app remembers and adapts the UI accordingly:

1. When customer sync fails with the "schema data instead of records" message, store `customer_import_unavailable: true` in the integration's configuration
2. When all quote POST endpoints return 405, store `quote_create_unavailable: true` in the integration's configuration
3. Use these flags to adjust what buttons are shown

### What Changes in the UI

**Job page RFMS badge (IntegrationSyncStatus):**
- If the quote is already synced: show "Re-sync" button (this works, uses PUT)
- If the quote is NOT synced AND `quote_create_unavailable` is true: show a simple info message "Import-only — create new quotes in RFMS, then pull them here" instead of a "Push to RFMS" button that always fails

**Settings > RFMS > Manual Sync (RFMSIntegrationTab):**
- "Import Customers" button: If `customer_import_unavailable` is true, show it disabled with a note: "Not available at your RFMS API tier. Create customers in RFMS directly."
- "Export Quotes" button: If `quote_create_unavailable` is true, show it disabled with a note: "New quote export not available at your RFMS API tier. You can still re-sync existing linked quotes."
- Add a small info banner explaining what works and what doesn't, so you're never surprised
- Add a "Retry" link next to each limitation in case you upgrade your RFMS tier later

### Technical Changes

**File: `supabase/functions/rfms-sync-customers/index.ts`**
- When the "all approaches exhausted" path is reached (line 508-510), also update the integration's configuration to set `customer_import_unavailable: true`
- This prevents repeated failed attempts

**File: `supabase/functions/rfms-sync-quotes/index.ts`**
- When all POST endpoints return 405 (line 455-460), also update the integration's configuration to set `quote_create_unavailable: true`
- Only set this flag for the "create new" path, not for PUT updates (which still work)

**File: `src/components/integrations/IntegrationSyncStatus.tsx`**
- Read the integration's configuration to check for `quote_create_unavailable`
- If true and the quote has no existing `rfms_quote_id`, show info text instead of "Push to RFMS" button
- If the quote already has an `rfms_quote_id`, show "Re-sync" as normal (PUT works)

**File: `src/components/integrations/RFMSIntegrationTab.tsx`**
- Read `customer_import_unavailable` and `quote_create_unavailable` from integration configuration
- Disable "Import Customers" and "Export Quotes" buttons when respective flags are set
- Show clear explanatory text for each disabled feature
- Add a "Clear limitation flags" option (small link) so the user can retry if they upgrade their RFMS plan

### Files to Change

| File | Change |
|---|---|
| `supabase/functions/rfms-sync-customers/index.ts` | Store `customer_import_unavailable` flag after exhausting all approaches |
| `supabase/functions/rfms-sync-quotes/index.ts` | Store `quote_create_unavailable` flag after all POST endpoints return 405 |
| `src/components/integrations/IntegrationSyncStatus.tsx` | Hide "Push to RFMS" for new quotes when flag is set; keep "Re-sync" for existing |
| `src/components/integrations/RFMSIntegrationTab.tsx` | Disable buttons and show explanatory text when flags are set; add retry option |
| `src/hooks/useIntegrations.ts` | No changes needed (already fetches full integration config) |

### After Fix

- No more confusing mixed messages — buttons that can't work are hidden or disabled with clear explanations
- "Re-sync" still works for already-linked quotes (PUT is supported)
- "Import Quotes" (pull) still works
- If you upgrade your RFMS plan, you can clear the flags and try again
- The Settings page shows a clear summary of what your RFMS tier supports


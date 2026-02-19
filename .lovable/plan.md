
## Fix RFMS Integration: Credentials, Customer Sync, and Enable All Features

### Problem Summary

1. **API Key disappears from form** -- The form uses `useState` initialized once; when the integration loads asynchronously after mount, the form doesn't update. Need `useEffect` to sync form state when integration data loads.

2. **"Full Sync" shows export error** -- The "Full Sync" button calls `handleSyncCustomers('both')` which includes `direction: 'push'`, immediately triggering the "Export not supported" error. Full Sync for customers should only PULL (import).

3. **Customer import returns 0 records** -- `GET /customers` returns field schema/metadata, not customer records. `POST /customers/search` returns 404. Based on the RFMS API v2 documentation, the standard response format is `{status: "success", result: {}}`. The GET /customers endpoint returns metadata when called without search parameters. Need to use the correct search pattern -- likely `GET /customers?search=*` or `POST /customers` with search body, or iterate using `GET /customers/{id}`.

4. **"Coming Soon" features disabled** -- Measurements, Scheduling, and Auto Update Job Status need to be implemented using RFMS API endpoints: `/opportunities` for quotes, Schedule Pro endpoints for scheduling, and order/job status endpoints.

---

### Fix 1: Form State Sync with Integration Data

**File:** `src/components/integrations/RFMSIntegrationTab.tsx`

Add a `useEffect` that updates form data when the `integration` prop changes (e.g., after async load):

```typescript
useEffect(() => {
  if (integration?.api_credentials) {
    setFormData(prev => ({
      ...prev,
      api_url: integration.api_credentials?.api_url || 'https://api.rfms.online/v2',
      store_queue: integration.api_credentials?.store_queue || '',
      api_key: integration.api_credentials?.api_key || '',
      sync_customers: integration.configuration?.sync_customers ?? true,
      sync_quotes: integration.configuration?.sync_quotes ?? true,
      // ... etc
    }));
  }
}, [integration]);
```

This ensures credentials display correctly after the integration query resolves.

---

### Fix 2: Full Sync = Import Only for Customers

**File:** `src/components/integrations/RFMSIntegrationTab.tsx`

Change the "Full Sync" button to call `handleSyncCustomers('pull')` instead of `handleSyncCustomers('both')`. Since RFMS v2 does not support POST for customers, "Full Sync" for customers means "Import All".

Also rename it to "Import All Customers" for clarity.

**File:** `supabase/functions/rfms-sync-customers/index.ts`

Remove the push/export code path entirely (lines 277-280) since it will never work with RFMS v2. This eliminates the confusing "Export not supported" error.

---

### Fix 3: Fix Customer Import Using Correct RFMS API Pattern

**File:** `supabase/functions/rfms-sync-customers/index.ts`

The RFMS API v2 docs confirm the standard response format is `{status: "success", result: {}}`. The current code tries:
1. `POST /customers/search` -- 404 (doesn't exist)
2. `GET /customers/search?entryType=Customer` -- 404 (doesn't exist)
3. `GET /customers?limit=500` -- returns metadata schema, not records

The RFMS v2 customer endpoints (from the docs) are:
- `GET /customers` -- returns available field values (enums) for search
- `POST /customers` with search body -- searches customers (Standard tier)
- `GET /customers/{id}` -- gets a single customer

The fix: Use `POST /customers` with a search body (not `/customers/search`). The POST to `/customers` is the search endpoint in RFMS v2 API. Example search body:
```json
{"entryType": "Customer", "limit": 500}
```

If POST /customers also fails (405), try `GET /customers` with query parameters that trigger a search result instead of metadata, such as `?entryType=Customer&limit=500`.

Also implement a discovery approach that logs exactly what each endpoint returns to help debug:
1. Try `POST /customers` with `{"entryType": "Customer"}`
2. Try `GET /customers?entryType=Customer` 
3. Try `GET /customers?limit=100&page=1`
4. Log all responses clearly for debugging

---

### Fix 4: Enable Measurements Sync

**New file:** `supabase/functions/rfms-sync-measurements/index.ts`

Create an edge function that:
- Pulls measurement data from RFMS quotes/opportunities (measurements are typically attached to quote line items in RFMS)
- Maps RFMS measurement fields to InterioApp treatment/room dimensions
- Updates the corresponding project rooms with measurement data

**File:** `src/components/integrations/RFMSIntegrationTab.tsx`
- Remove "Coming Soon" badge from Sync Measurements
- Enable the switch
- Add "Import Measurements" button to Manual Sync section

---

### Fix 5: Enable Scheduling Sync

**New file:** `supabase/functions/rfms-sync-scheduling/index.ts`

Create an edge function that:
- Uses RFMS Schedule Pro API endpoints (`/schedule/jobs`, `/schedule/crews`)
- Pulls scheduled jobs from RFMS and creates/updates calendar appointments in InterioApp
- Pushes InterioApp appointments to RFMS schedule when direction is 'push'

**File:** `src/components/integrations/RFMSIntegrationTab.tsx`
- Remove "Coming Soon" badge from Sync Scheduling
- Enable the switch
- Add "Sync Schedule" button to Manual Sync section

---

### Fix 6: Enable Auto Update Job Status

**File:** `supabase/functions/rfms-sync-quotes/index.ts`

Extend the existing quote sync to also pull job status changes from RFMS:
- When pulling quotes, check for status changes in RFMS (e.g., "Ordered", "Installed", "Complete")
- Map RFMS statuses to InterioApp project statuses
- Update the project status in the database

**File:** `src/components/integrations/RFMSIntegrationTab.tsx`
- Remove "Coming Soon" badge from Auto Update Job Status
- Enable the switch
- The status sync happens automatically during quote sync when this option is enabled

---

### Fix 7: Edge Function Query Fix

**Files:** All RFMS edge functions (`rfms-sync-customers`, `rfms-sync-quotes`, `rfms-session`)

The edge functions query `.eq("user_id", accountOwnerId)` but should also check `.eq("account_owner_id", accountOwnerId)` as a fallback. Currently both columns match for existing records, but this is fragile. Use `account_owner_id` which is the correct column for multi-tenant lookups.

---

### Files to Change

| File | Changes |
|---|---|
| `src/components/integrations/RFMSIntegrationTab.tsx` | Add useEffect for form sync; Full Sync = pull only; enable Measurements, Scheduling, Auto Job Status; add sync buttons |
| `supabase/functions/rfms-sync-customers/index.ts` | Fix customer search endpoint (POST /customers); remove push code; use account_owner_id |
| `supabase/functions/rfms-sync-quotes/index.ts` | Add job status mapping; use account_owner_id |
| `supabase/functions/rfms-session/index.ts` | Use account_owner_id |
| `supabase/functions/rfms-sync-measurements/index.ts` | New -- pull measurements from RFMS |
| `supabase/functions/rfms-sync-scheduling/index.ts` | New -- sync scheduling with RFMS Schedule Pro |

### Expected Results

- Credentials always display correctly when the page loads
- "Full Sync" imports customers without showing export errors  
- Customer import uses the correct RFMS API search endpoint
- Measurements, Scheduling, and Job Status features are functional (not "Coming Soon")
- Clear toast notifications with record counts for every sync action
- Edge functions use the correct `account_owner_id` column for multi-tenant support

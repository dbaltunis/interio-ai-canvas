

## Fix RFMS Customer Sync: Use Correct Search Endpoint

### Problem

The RFMS v2 API's `GET /customers` endpoint (with any query parameters) only returns metadata — field definitions and dropdown values like `customerType`, `entryType`, `preferredSalesperson1`, etc. It never returns actual customer records regardless of what filters are applied.

Evidence from logs — every request returns the same schema:
```
GET /customers → {customerType: [...], entryType: [...], ...}
GET /customers?preferredSalesperson1=CHRIS+OGDEN → same metadata
GET /customers?entryType=Customer → same metadata
GET /customers?limit=500&offset=0 → same metadata
GET /customers?search=* → same metadata
```

### Root Cause

The current code assumes `GET /customers?<filter>=<value>` will return filtered customer records. Instead, RFMS v2 treats `GET /customers` as a metadata/schema endpoint that describes available filter values. Actual customer records likely require a different endpoint or method.

### Solution

Update the customer fetch strategy in `rfms-sync-customers` to try additional RFMS v2 endpoints that are more likely to return actual records:

1. **`GET /customers/search`** — dedicated search endpoint (referenced in project architecture notes)
2. **`POST /customers/search`** — some APIs use POST for search with a body
3. **`GET /customers/list`** — alternative listing endpoint
4. **`GET /customers/{id}`** — if we can enumerate from metadata (store IDs, etc.)

If none return records, provide a clear, specific error message explaining what was tried.

### Technical Changes

**File: `supabase/functions/rfms-sync-customers/index.ts`**

Update the `fetchCustomersFromRFMS` function:

1. Before the current metadata-driven approach, try these endpoints first:
   - `GET /customers/search` (no params, get all)
   - `GET /customers/search?query=*`
   - `POST /customers/search` with empty/wildcard body
   - `GET /customers/list`
2. Keep existing metadata-driven approach as a secondary fallback
3. Update the final "no records found" error message to list what was tried, so log debugging is easier
4. If the API returns 404 on search endpoints, skip gracefully and try the next approach

Updated fallback sequence:
```
1. GET /customers/search          (dedicated search endpoint)
2. POST /customers/search {}      (POST-based search)
3. GET /customers/list            (list endpoint)
4. GET /customers                 (current — gets metadata, then...)
5. GET /customers?preferredSalesperson1=X  (metadata-driven, current approach)
6. GET /customers?entryType=X     (metadata-driven, current approach)
7. GET /customers?limit=500       (current fallback)
```

Also improve the error message:
```
Before: "No customer records found in RFMS. This may be due to your API tier or search configuration."
After:  "Could not retrieve customer records from RFMS. Tried /customers/search, /customers/list, 
         and metadata-driven filters — all returned schema data instead of records. 
         Your RFMS API tier may not support customer record access."
```

**File: `src/components/integrations/IntegrationSyncStatus.tsx`** (minor)

Detect the "API tier" message and show amber warning toast (same pattern already used for quote push).

### Files to Change

| File | Change |
|---|---|
| `supabase/functions/rfms-sync-customers/index.ts` | Add `/customers/search` and `/customers/list` endpoints as priority attempts before metadata-driven fallbacks; improve error message |
| `src/components/integrations/IntegrationSyncStatus.tsx` | Show amber warning for customer sync tier limitation (if not already handled) |

### After Fix

- The sync tries dedicated search/list endpoints before falling back to metadata-driven searches
- If one of the new endpoints works, customers import immediately
- If none work, the user sees a clear message about what was tried, rather than a vague "no records found"
- No breaking changes to existing logic — new attempts are prepended, existing code is kept as fallback


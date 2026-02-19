

## Build an RFMS Diagnostic Tool — Know Exactly What Your Tier Supports

### Why You're Seeing Mixed Messages

The RFMS API has three subscription tiers (Standard, Plus, Enterprise). Based on the 405 errors, your current tier does NOT include "Create Opportunities" — that requires Enterprise. This is confirmed by [RFMS's own documentation](https://www.rfms.com/app/uploads/2020/11/API-slick.pdf).

This explains everything:
- "Pushed to RFMS / Quote synced successfully" = updating an ALREADY-LINKED quote (PUT) — this works on Plus tier
- "RFMS Push Not Available" = creating a NEW quote (POST) — this requires Enterprise tier
- Customer import returning metadata = the search endpoint may also be tier-restricted

**This is not a bug in our integration — it's a real API restriction from RFMS.**

### What We Should Build

Instead of generic error messages, build a **one-click diagnostic** that tests every RFMS endpoint and shows you exactly what your tier supports, so you can take this to the RFMS team and ask for the right tier.

### Changes

**1. New Edge Function: `supabase/functions/rfms-diagnose/index.ts`**

A diagnostic function that tests each RFMS API endpoint and reports what works:

```
Endpoints tested:
- POST /session/begin          (authentication)
- GET /customers               (customer metadata)
- GET /customers/search        (customer records)
- GET /opportunities           (read quotes)
- POST /opportunities          (create quotes - Enterprise only)
- PUT /opportunities/{id}      (update quotes)
- GET /quotes                  (alternative quote read)
- POST /quotes                 (alternative quote create)
```

For each endpoint, it reports: works / 405 (not on your tier) / 403 (forbidden) / error

Returns a clear summary like:
```
Your RFMS API Tier Summary:
- Authentication: Working
- Read Customers: Metadata only (no record access)
- Read Quotes/Opportunities: Working
- Create New Quotes: NOT AVAILABLE (requires Enterprise tier)
- Update Existing Quotes: Working
- Estimated tier: Plus
```

**2. Update `src/components/integrations/RFMSIntegrationTab.tsx`**

Add a "Run Diagnostics" button in the RFMS settings panel that:
- Calls the new `rfms-diagnose` function
- Shows results in a clear table format
- Highlights what works (green) and what doesn't (amber)
- Suggests what to ask RFMS for if features are missing
- Replaces the vague "API tier limitation" messages with specific, actionable info

**3. Update `src/components/integrations/IntegrationSyncStatus.tsx`**

- Remove the `quote_create_unavailable` flag-based hiding (it was confusing)
- Instead, always show the Push button but if the push fails with 405, show a clear one-line message: "Requires RFMS Enterprise tier — run diagnostics in Settings for details"
- Keep the re-sync button for already-linked quotes (this works fine)

**4. Update `supabase/config.toml`**

Add the new `rfms-diagnose` function with `verify_jwt = false`.

### Files to Change

| File | Change |
|---|---|
| `supabase/functions/rfms-diagnose/index.ts` | New — tests all RFMS endpoints and returns tier summary |
| `supabase/config.toml` | Add rfms-diagnose function config |
| `src/components/integrations/RFMSIntegrationTab.tsx` | Add "Run Diagnostics" button and results display |
| `src/components/integrations/IntegrationSyncStatus.tsx` | Simplify — show push button always, show specific error on failure instead of hiding buttons |

### After This Fix

- You get a clear, printable report of what your RFMS API key can and cannot do
- You can share this with the RFMS team and say "I need Enterprise tier for Create Opportunities"
- No more mystery — every button either works or tells you exactly why it doesn't
- The app stops blaming vague "tier limitations" and instead shows you proof

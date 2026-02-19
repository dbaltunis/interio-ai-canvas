

## Fix ERP Sync Status to Reflect Integration Connection State

### Problem

The "ERP Sync Status" card on every job page always shows both RFMS and NetSuite as "Not synced" -- even when the RFMS integration IS connected and active in Settings. This is because the component only checks for per-project sync IDs (`rfms_quote_id`, etc.) and has no awareness of whether the integration itself is configured.

The result is confusing: Settings shows "Connected" for RFMS, but the job page says "Not synced" for RFMS.

### Solution

Make `IntegrationSyncStatus` aware of which integrations are actually configured by querying `integration_settings`. Then display three distinct states:

| State | Condition | Display |
|---|---|---|
| **Hidden** | Integration not configured | Row not shown at all |
| **Connected** | Integration active, but this project has no sync ID yet | Blue "Connected" badge (not the alarming "Not synced") |
| **Synced** | Project has a valid `rfms_quote_id` or similar | Green "Synced" badge with the ID (existing behavior) |

If NO integrations are configured at all, hide the entire card.

### Technical Changes

**File: `src/components/integrations/IntegrationSyncStatus.tsx`**

1. Import `useIntegrations` from `@/hooks/useIntegrations`
2. Inside the component, call `useIntegrations()` to get the list of active integrations
3. Filter `syncItems` to only include systems that have an active integration:
   - Show RFMS row only if there's an active `rfms` integration
   - Show NetSuite row only if there's an active `netsuite` integration
4. For shown-but-not-yet-synced rows, display a blue "Connected" badge instead of the grey "Not synced" badge
5. If no integrations are active, return `null` (hide the card entirely)

```
Before:
  RFMS     [Not synced]     <-- always shown, always grey
  NetSuite [Not synced]     <-- always shown, always grey

After (with RFMS connected, NetSuite not configured):
  RFMS     [Connected]      <-- blue badge, shown because integration exists
  (NetSuite row hidden)     <-- no integration configured, row hidden
```

**Compact mode** (in job header): Same logic -- only show badges for configured integrations, and show a blue "Connected" indicator if integration exists but no project sync ID yet.

### Files to Change

| File | Change |
|---|---|
| `src/components/integrations/IntegrationSyncStatus.tsx` | Add `useIntegrations` hook; filter rows by active integrations; show "Connected" vs "Synced" vs hidden; hide card when no integrations exist |

### No Database or Edge Function Changes

This is purely a UI display fix. The underlying data model is correct -- the columns exist, the integration records exist. The component just needs to read the integration status to determine what to show.

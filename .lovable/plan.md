

## Make RFMS Push Feel Trustworthy — Instant UI Feedback After Sync

### What's Happening Now

After you click "Push to RFMS" and it succeeds, the badge and popover still show "Connected — not yet synced" with the "Push to RFMS" button. The project data (which contains `rfms_quote_id`) isn't refreshed, so the UI doesn't know the quote is now linked. You have to reload the page to see the green checkmark.

This makes it feel broken — "did it actually work?"

### What Should Happen

1. After a successful push, the component should **refetch the project data** so `rfms_quote_id` gets populated immediately
2. The badge should flip from blue (not synced) to green (synced) right away
3. The button should change from "Push to RFMS" to "Re-sync"
4. Re-syncing unlimited times is normal and fine (it updates the quote in RFMS with latest data)

### Changes

**File: `src/components/integrations/IntegrationSyncStatus.tsx`**

- After a successful `handlePushToRFMS` call, **invalidate the query** that provides the project data so it refetches and picks up the new `rfms_quote_id`
- Add a brief success state (e.g., show a checkmark icon on the button for 2 seconds) so the user gets immediate visual confirmation before the data refreshes
- Accept an optional `onSyncComplete` callback prop so parent components can trigger their own refetch if needed

**File: Parent component(s) that render `IntegrationSyncStatus`**

- Pass an `onSyncComplete` callback that invalidates the project/quote query, ensuring the `rfms_quote_id` field is refreshed in the parent's state

### Technical Details

In `handlePushToRFMS`, after the success path (line 103-109):

```
// After successful push:
1. Call onSyncComplete?.() to let the parent refetch project data
2. Invalidate relevant react-query cache keys (e.g., ["project", projectId])
3. Optionally set a local "just synced" state for 2-3 seconds to show a green checkmark on the button
```

The key insight: the component receives `project.rfms_quote_id` as a prop, so the **parent** needs to refetch for the prop to update. The `onSyncComplete` callback handles this cleanly.

### Files to Change

| File | Change |
|---|---|
| `src/components/integrations/IntegrationSyncStatus.tsx` | Add `onSyncComplete` prop; call it after successful push; add brief visual success state on the button |
| Parent components rendering `IntegrationSyncStatus` | Pass `onSyncComplete` that invalidates the project query so `rfms_quote_id` updates |

### After Fix

- Push quote to RFMS -> badge immediately flips to green with checkmark
- Button changes to "Re-sync" without needing a page reload
- Re-syncing (to push updates) remains available and is clearly labelled differently from the initial push
- No more "did it work?" confusion


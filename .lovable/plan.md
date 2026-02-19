

## Make RFMS Badge Clickable — Push Quote to RFMS from Job Page

### What's Happening Now

The RFMS badge (compact mode) in the job header is wrapped in a `TooltipTrigger` but has no `onClick` handler. Clicking it shows a tooltip ("RFMS connected -- not yet synced for this job") but performs no action.

### What It Should Do

When clicked, the badge should open a small popover with contextual actions for this specific job:

- **"Push to RFMS"** button — calls `rfms-sync-quotes` with `direction: 'push'` and this project's ID, so the current job's quote gets exported to RFMS
- **"View in Settings"** link — navigates to Settings > Integrations > RFMS for full configuration
- Once synced, the badge turns green and clicking shows the RFMS Quote/Order ID

### Technical Changes

**File: `src/components/integrations/IntegrationSyncStatus.tsx`**

1. Add imports for `Popover`, `PopoverTrigger`, `PopoverContent`, `Button`, `useNavigate`, and `supabase`
2. Accept an optional `projectId` prop (needed to push a specific project)
3. Replace the `Tooltip` wrapper on each compact badge with a `Popover`
4. Inside the popover content:
   - If not yet synced: show a "Push to RFMS" button that invokes `rfms-sync-quotes` with `{ direction: 'push', projectId }`
   - Show a "Go to Settings" link that navigates to `/settings?tab=integrations`
   - If already synced: show the sync IDs and a "Re-sync" option
5. Add loading state while push is in progress
6. Show success/error toast after push completes (with `importance: 'important'`)

**File: `supabase/functions/rfms-sync-quotes/index.ts`**

- Accept an optional `projectId` parameter in the request body
- When `projectId` is provided, only sync that specific project instead of all projects
- This makes per-job sync fast and targeted

**File: `src/components/jobs/JobDetailPage.tsx`**

- Pass `projectId={project.id}` to `IntegrationSyncStatus`

### Files to Change

| File | Change |
|---|---|
| `src/components/integrations/IntegrationSyncStatus.tsx` | Replace Tooltip with Popover; add "Push to RFMS" button; accept projectId prop |
| `src/components/jobs/JobDetailPage.tsx` | Pass `projectId` to `IntegrationSyncStatus` |
| `src/components/jobs/tabs/ProjectDetailsTab.tsx` | Pass `projectId` to `IntegrationSyncStatus` |
| `supabase/functions/rfms-sync-quotes/index.ts` | Support optional `projectId` for single-project sync |

### User Experience After Fix

1. User sees blue RFMS badge with link icon on job header
2. Clicks badge -- popover opens with "Push to RFMS" button and "Settings" link
3. Clicks "Push to RFMS" -- spinner shows, quote data is sent to RFMS
4. On success: badge turns green, toast shows "Quote pushed to RFMS", popover shows the RFMS Quote ID
5. On error: toast shows clear error message with details


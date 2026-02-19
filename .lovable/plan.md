

## Comprehensive Fix: 7 Bugs on Dealer (Rachel) Account + Mobile/Tablet Parity

### Bug 1: Dealer Cannot Add Measurement Worksheets

**Root Cause:** `useJobEditPermissions.ts` checks if the job was created by the user (`project.user_id === user.id`) or if the client is assigned to the user (`client.assigned_to === user.id`). Dealers typically don't create jobs themselves and may not be the assigned client manager, so `canEditJob` returns `false`, making the Project tab read-only.

**Fix:** Add checks for `project.assigned_to` and `project.assigned_manager` matching the current user. Also check if the user appears in `project_assignments` for this project.

| File | Change |
|---|---|
| `src/hooks/useJobEditPermissions.ts` | Add `project.assigned_to === user.id` and `project.assigned_manager === user.id` to the assignment criteria (around lines 60-67) |

---

### Bug 2: Uneven Mobile Bottom Nav (1 item left, 2 items right of + button)

**Root Cause:** `MobileBottomNav.tsx` line 110 uses `Math.floor(visibleNavItems.length / 2)` to split items. With 3 visible items (if Library permission is missing), this creates a 1|+|2 split. Additionally, dealers may lose the Library tab if `view_inventory` permission is not explicitly set.

**Fix:**
- Change `Math.floor` to `Math.ceil` on lines 110 and 161 so the split favors the left side (2|+|1 with 3 items)
- For dealers, always include Library in the nav regardless of `view_inventory` permission
- Add `pb-[env(safe-area-inset-bottom)]` for iOS safe area
- Set `min-h-[64px]` for proper touch targets

| File | Change |
|---|---|
| `src/components/layout/MobileBottomNav.tsx` | Fix split logic, guarantee Library for dealers, add safe-area padding, increase touch targets |

---

### Bug 3: Mobile "New Job" and "New Client" From + Button Navigates Instead of Creating

**Root Cause:** `CreateActionDialog.tsx` (lines 55-76) uses `document.querySelector('[data-create-client]')` and `document.querySelector('[data-create-project]')` to find and click buttons after switching tabs. But in mobile views:
- `MobileClientView.tsx` places `data-create-client` on a wrapper `div` (lines 70, 164), not a button
- `MobileJobsView.tsx` places `data-create-project` on a wrapper `div` (line 289), not a button
- Neither has a "create" button to click, so the DOM query fails silently, leaving the user on the list page with nothing happening

**Fix:** Replace DOM manipulation with a custom event system. `CreateActionDialog` will dispatch events (`create-new-client`, `create-new-job`), and the mobile views plus their parent pages will listen for these events and trigger the appropriate creation flows.

| File | Change |
|---|---|
| `src/components/layout/CreateActionDialog.tsx` | Dispatch custom events instead of DOM queries |
| `src/components/jobs/MobileJobsView.tsx` | Remove `data-create-project` div attribute; parent `JobsPage` handles creation |
| `src/components/jobs/JobsPage.tsx` | Listen for `create-new-job` custom event, call `handleNewJob()` |
| `src/components/clients/MobileClientView.tsx` | Remove `data-create-client` div attributes |
| `src/components/clients/ClientManagementPage.tsx` | Listen for `create-new-client` custom event, open create form |

**Additional Mobile Client Bug Found:** In `EnhancedClientManagement.tsx` line 54, the mobile client click handler is `(client) => console.log('Client clicked:', client)` -- it does absolutely nothing! Clicking a client on mobile in the Jobs page "Clients" tab has no effect. This will be fixed by passing a proper handler.

| File | Change |
|---|---|
| `src/components/clients/EnhancedClientManagement.tsx` | Pass a real navigation handler to `MobileClientView` instead of `console.log` |

---

### Bug 4: Dealer Can Still See Supplier and Cost Price

**Root Cause:** `InventoryQuickView.tsx` does not check `isDealer` at all. Lines 146-148 show cost price unconditionally, lines 190-199 show supplier unconditionally, and line 65 shows the "Edit Full Details" button.

**Fix:** Import `useIsDealer` and conditionally hide:
- Cost price section (lines 140-161)
- Supplier section (lines 190-199)
- Edit button (line 65)

| File | Change |
|---|---|
| `src/components/inventory/InventoryQuickView.tsx` | Import `useIsDealer`, hide cost price, supplier, and edit button for dealers |

---

### Bug 5: Job Numbers Change With Status Changes

**Root Cause:** In `useProjects.ts` lines 246-274, when a status change causes a `document_type` change (e.g., draft to quote), the code overwrites `job_number` with a new or reused entity-specific number. This means the visible job number in the list changes every time the status crosses a document type boundary.

**Fix:** Never overwrite `job_number` after initial creation. Continue storing entity-specific numbers in `draft_number`, `quote_number`, `order_number`, `invoice_number` columns for internal tracking, but stop writing them to `job_number`. The `job_number` assigned at project creation stays constant forever.

| File | Change |
|---|---|
| `src/hooks/useProjects.ts` | Remove `updates.job_number = existingNumber` (line 253) and `updates.job_number = newNumber` (line 268). Keep storing in entity-specific columns but don't overwrite `job_number`. |

---

### Bug 6: Dealer Can Revert Approved Quote Back to Lead

**Root Cause:** `JobStatusDropdown.tsx` (lines 62-69) filters statuses only by `category` (quote vs project). It does not restrict backward transitions. Any user with edit permission can select any status, including reverting from "Approved" to "Lead".

**Fix:** When `isDealer` is true, filter `availableStatuses` to prevent backward transitions. Specifically:
- Find the current status's `sort_order`
- Only show statuses with `sort_order >= currentStatus.sort_order` (forward only)
- Exception: always show the current status

| File | Change |
|---|---|
| `src/components/jobs/JobStatusDropdown.tsx` | Import `useIsDealer`, filter statuses to forward-only for dealers based on `sort_order` |

---

### Bug 7: Mobile UI Not Responsive / Missing Features

This is addressed by Bugs 2 and 3 above, plus these additional gaps found during investigation:

**Gap A: Mobile client clicks do nothing in EnhancedClientManagement**
- `EnhancedClientManagement.tsx` line 54: `onClientClick` is `console.log` -- clicking a client card does nothing on mobile
- Fix: Pass a real handler that navigates to client profile

**Gap B: No "New Project" button on mobile**
- `JobsPage.tsx` line 458: `!isMobile &&` condition hides the "New Project" button entirely on mobile
- This is intentional (uses + button instead), but the + button's create flow is broken (Bug 3)
- Fix: Bug 3 fix resolves this

**Gap C: MobileJobsView still shows stale quote totals**
- `MobileJobsView.tsx` line 398: displays `primaryQuote.total_amount` (stale)
- Fix: Use the `useProjectTotals` hook (already created in previous session) for accurate totals

| File | Change |
|---|---|
| `src/components/clients/EnhancedClientManagement.tsx` | Add state + navigation for mobile client clicks |
| `src/components/jobs/MobileJobsView.tsx` | Use `useProjectTotals` for accurate totals |

---

### Summary of All Files to Change

| # | File | Changes |
|---|---|---|
| 1 | `src/hooks/useJobEditPermissions.ts` | Add assigned_to/assigned_manager checks |
| 2 | `src/components/layout/MobileBottomNav.tsx` | Fix Math.ceil split, guarantee Library for dealers, safe-area, touch targets |
| 3 | `src/components/layout/CreateActionDialog.tsx` | Replace DOM queries with custom events |
| 4 | `src/components/jobs/MobileJobsView.tsx` | Remove data-create-project, use useProjectTotals |
| 5 | `src/components/jobs/JobsPage.tsx` | Listen for create-new-job event |
| 6 | `src/components/clients/MobileClientView.tsx` | Remove data-create-client attributes |
| 7 | `src/components/clients/ClientManagementPage.tsx` | Listen for create-new-client event |
| 8 | `src/components/clients/EnhancedClientManagement.tsx` | Fix mobile client click handler (currently console.log) |
| 9 | `src/components/inventory/InventoryQuickView.tsx` | Hide cost/supplier/edit for dealers |
| 10 | `src/hooks/useProjects.ts` | Stop overwriting job_number on status change |
| 11 | `src/components/jobs/JobStatusDropdown.tsx` | Restrict dealers to forward-only status transitions |

### After These Fixes

- Dealers can add measurement worksheets on assigned jobs
- Mobile bottom nav is balanced (2|+|2 for 4 items, 2|+|1 for 3 items) with proper iOS safe area
- Mobile + button correctly creates new jobs and clients via event system
- Dealers cannot see cost prices, supplier names, or edit buttons in inventory
- Job numbers stay constant forever regardless of status changes
- Dealers cannot revert approved quotes backward to Lead/Enquiry
- Mobile client clicks actually navigate to client profiles instead of doing nothing
- Mobile job totals show accurate calculated amounts


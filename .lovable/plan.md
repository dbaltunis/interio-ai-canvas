

## Align Dealer Permissions Across Desktop and Mobile/Tablet Views

### Problem
Dealers see different navigation and actions depending on whether they're on desktop vs mobile/tablet. The permission set should be identical across all screen sizes.

### Current State Comparison

| Feature | Desktop (Sidebar) | Mobile (BottomNav + CreateDialog) |
|---|---|---|
| Dashboard | Yes | Yes |
| Jobs | Yes | Yes |
| Clients | **NO (missing)** | Yes |
| Calendar | No | No (hidden) |
| Library | Yes | **NO (missing from bottom nav)** |
| Settings | Yes | Only via CreateDialog |
| Messages | No | No (hidden in header) |
| "New Event" action | N/A | **Yes (should be hidden)** |
| "Team & Messages" action | N/A | **Yes (should be restricted)** |

Dealers DO have `view_assigned_clients` and `create_clients` permissions, so Clients should be visible everywhere.

### Changes

#### 1. Desktop Sidebar -- Add Clients to dealer navigation
**File:** `src/components/layout/Sidebar.tsx`
Add a "Clients" entry to `dealerNavItems` so dealers can access their assigned clients from the desktop sidebar too.

#### 2. Mobile Bottom Nav -- Add Library tab for dealers
**File:** `src/components/layout/MobileBottomNav.tsx`
Currently the bottom nav only has: Home, Jobs, Clients, Calendar (with Calendar hidden for dealers). Update `navItems` to include a Library/Inventory option, or add dealer-specific logic to swap Calendar for Library when `isDealer` is true. This ensures dealers see: Home, Jobs, Clients, Library -- matching desktop.

#### 3. Create Action Dialog -- Hide calendar and restrict team for dealers
**File:** `src/components/layout/CreateActionDialog.tsx`
- Hide "New Event" (calendar) action when `isDealer` is true
- Hide or restrict "Team & Messages" action for dealers (they have limited team visibility)

#### 4. Index.tsx -- Block restricted tabs for dealers
**File:** `src/pages/Index.tsx`
Add dealer checks to the tab restriction logic so dealers cannot navigate to calendar, emails, ordering-hub, analytics, or other restricted tabs via URL manipulation.

### Summary of Final Dealer Navigation (All Screen Sizes)
- **Dashboard** -- always visible
- **Jobs** -- view/create/edit own jobs
- **Clients** -- view/create/edit own clients
- **Library** -- browse products (read-only, no costs/suppliers)
- **Settings** -- personal profile only
- Calendar, Messages, Analytics, Store, Ordering Hub -- all hidden

### Technical Details
- All checks use the existing `useIsDealer` hook
- No database or permission constant changes needed
- Aligns UI visibility with the `Dealer` role permissions already defined in `constants/permissions.ts`


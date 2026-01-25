

# Feature Visibility Comparison: Desktop vs Mobile/Tablet

## Investigation Summary

I analyzed all navigation and action components across the codebase. Here's what I found:

## Current Feature Visibility Matrix

### Desktop Navigation Components

| Component | Features Shown | Permission Checks | Issues Found |
|-----------|---------------|-------------------|--------------|
| **Sidebar.tsx** (Desktop left nav) | Dashboard, Jobs, CRM, Calendar, Inventory, Analytics, Documentation, Settings | Uses `useHasPermission` hooks | Dealers get hardcoded 4-item menu (Dashboard, Jobs, Library, Settings) - NO Purchasing |
| **MainNav.tsx** (Secondary desktop nav) | Dashboard, Projects, Job Editor, Quote Builder, Messages, Work Orders, Product Library, **Ordering Hub**, Calendar, Clients, Calculator, Settings | Uses explicit permission checks | **Ordering Hub uses `view_inventory` permission - WRONG! Should use `view_purchasing`** |
| **QuickActions.tsx** (Dashboard cards) | New Project, Add Client, Calculator, Calendar, Inventory | **NO permission checks at all** | Shows all 5 buttons to everyone including dealers |

### Mobile/Tablet Navigation Components

| Component | Features Shown | Permission Checks | Issues Found |
|-----------|---------------|-------------------|--------------|
| **MobileBottomNav.tsx** (Bottom tabs) | Home, Jobs, Clients, Calendar | Uses `useHasPermission`, hides Calendar for dealers | Correct behavior for tab bar |
| **CreateActionDialog.tsx** (+ button menu) | New Client, New Job (conditional), New Event, Browse Library, **Material Purchasing**, Team & Messages, Settings | **Material Purchasing has NO permission check** | Everyone sees Purchasing including dealers and staff without `view_purchasing` |

---

## Root Cause Analysis

### Problem 1: Material Purchasing (Mobile + Desktop)

**Mobile - CreateActionDialog.tsx:**
- Lines 192-212 show "Material Purchasing" button with **ZERO permission checks**
- ANY user (including Dealers) can see and tap this button
- Only gets blocked when they actually navigate to ordering-hub (but the button shouldn't show)

**Desktop - MainNav.tsx:**
- Line 40 shows "Ordering Hub" with `permission: "view_inventory"`
- This is **WRONG** - it should check `view_purchasing`
- Users with view_inventory but NOT view_purchasing still see it

### Problem 2: Other Menu Items (Mobile CreateActionDialog)

| Menu Item | Current Check | Should Check |
|-----------|--------------|--------------|
| New Client | None | Always visible (OK) |
| New Job | `hasCreateJobsPermission` | Correct |
| New Event | None | `view_calendar` OR `view_own_calendar` |
| Browse Library | None | `view_inventory` |
| Material Purchasing | None | `view_purchasing` AND NOT isDealer |
| Team & Messages | None | Always visible (OK) |
| Settings | `canViewSettings` (disabled only) | Should HIDE, not disable |

### Problem 3: QuickActions Dashboard Widget (Desktop)

- Shows 5 action buttons to ALL users with NO permission checks
- Dealers shouldn't see "New Project" without create_jobs
- Users without `view_calendar` shouldn't see "Calendar" button

---

## Fix Plan

### Phase 1: Fix CreateActionDialog.tsx (Mobile + Menu)

Add permission hooks and conditional rendering:

```typescript
// Add these permission checks
const canViewCalendar = useHasPermission('view_calendar') || useHasPermission('view_own_calendar');
const canViewInventory = useHasPermission('view_inventory');
const canViewPurchasing = useHasPermission('view_purchasing');
const { data: isDealer } = useIsDealer();

// HIDE (not just disable) restricted items:
{/* New Event - only if can view calendar */}
{canViewCalendar !== false && (
  <Button onClick={() => handleAction("event")}>New Event</Button>
)}

{/* Browse Library - only if can view inventory */}
{canViewInventory !== false && (
  <Button onClick={() => handleAction("library")}>Browse Library</Button>
)}

{/* Material Purchasing - only if can view purchasing AND not a dealer */}
{canViewPurchasing !== false && !isDealer && (
  <Button onClick={() => handleAction("purchasing")}>Material Purchasing</Button>
)}

{/* Settings - HIDE entirely if no permission */}
{canViewSettings !== false && (
  <Button onClick={() => handleAction("settings")}>Settings</Button>
)}
```

### Phase 2: Fix MainNav.tsx (Desktop)

Change Ordering Hub permission from `view_inventory` to `view_purchasing`:

```typescript
// Line 40 - Change from:
{ id: "ordering-hub", label: "Ordering Hub", icon: ShoppingCart, badge: true, permission: "view_inventory" },

// To:
{ id: "ordering-hub", label: "Ordering Hub", icon: ShoppingCart, badge: true, permission: "view_purchasing" },
```

Also add visibility check in the filter logic for `view_purchasing`.

### Phase 3: Fix QuickActions.tsx (Dashboard)

Add permission-based filtering:

```typescript
import { useHasPermission } from "@/hooks/usePermissions";

// Inside component:
const canCreateJobs = useHasPermission('create_jobs');
const canViewCalendar = useHasPermission('view_calendar');
const canViewInventory = useHasPermission('view_inventory');

const actions = [
  canCreateJobs !== false && { label: "New Project", icon: Plus, onClick: onNewJob, variant: "brand" },
  { label: "Add Client", icon: Users, onClick: onNewClient, variant: "success" },
  { label: "Calculator", icon: Calculator, onClick: onCalculator, variant: "default" },
  canViewCalendar !== false && { label: "Calendar", icon: Calendar, onClick: onCalendar, variant: "warning" },
  canViewInventory !== false && { label: "Inventory", icon: Package, onClick: onInventory, variant: "secondary" },
].filter(Boolean);
```

---

## Files to Modify

| File | Change |
|------|--------|
| `src/components/layout/CreateActionDialog.tsx` | Add permission checks for Event, Library, Purchasing, Settings - HIDE disabled items |
| `src/components/layout/MainNav.tsx` | Change Ordering Hub permission to `view_purchasing`, add filter logic |
| `src/components/dashboard/QuickActions.tsx` | Add permission checks for New Project, Calendar, Inventory buttons |

---

## Result After Fix

### For Dealers (no `view_purchasing`, no `view_calendar`)

| Feature | Desktop | Mobile (Create Menu) |
|---------|---------|---------------------|
| Material Purchasing | Hidden | Hidden |
| New Event / Calendar | Hidden | Hidden |
| Browse Library | Visible | Visible |
| New Job | Visible (if create_jobs) | Visible (if create_jobs) |

### For Staff without `view_purchasing`

| Feature | Desktop | Mobile |
|---------|---------|--------|
| Material Purchasing / Ordering Hub | Hidden | Hidden |
| Other features | Based on their permissions | Based on their permissions |

---

## Summary

The main issue is that **Material Purchasing / Ordering Hub** has inconsistent or missing permission checks:
1. Mobile CreateActionDialog: No check at all
2. Desktop MainNav: Wrong permission (`view_inventory` instead of `view_purchasing`)
3. QuickActions widget: No permission checks at all

This plan adds proper `view_purchasing` checks and ensures features are **hidden** (not just disabled) when users lack permission.


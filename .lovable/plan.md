
# Improve Status Reasons Widget UX and Permissions

## Current Issues

From your screenshot, the "Rejections & Cancellations" widget currently:

1. **Basic styling**: Uses plain `Card` instead of `Card variant="analytics"` like other widgets
2. **Less polished UI**: The layout doesn't match the premium style of other widgets (like "Recently Created Jobs")
3. **Restrictive permission**: Uses `view_primary_kpis` which may block dealers and regular users from seeing it

## Solution Overview

### Part 1: Enhanced Widget Design

Transform the widget to match the premium styling of `RecentlyCreatedJobsWidget`:

**Current Look:**
```text
+------------------------------------------+
| ⚠ Rejections & Cancellations        (1) |
+------------------------------------------+
| New Job 1/28/2026                        |
| "too expensive"                          |
| Darius B. · less than a minute ago       |
+------------------------------------------+
```

**New Look:**
```text
+------------------------------------------+
| ⚠ Rejections & Cancellations             |
+------------------------------------------+
| +--------------------------------------+ |
| | [🔴] New Job 1/28/2026     Rejected  | |
| |      "too expensive"                 | |
| |      👤 Darius B. · 📅 1 min ago     | |
| +--------------------------------------+ |
| +--------------------------------------+ |
| | [🟡] Johnson Kitchen    On Hold      | |
| |      "Client needs financing"        | |
| |      👤 Jane S. · 📅 2 hours ago     | |
| +--------------------------------------+ |
+------------------------------------------+
```

**Key styling improvements:**
- Use `Card variant="analytics"` for consistent glassmorphism styling
- Use card-style items with `bg-background border border-border/50 hover:bg-muted/50` (like RecentlyCreatedJobsWidget)
- Colored status indicator icon on the left
- Compact text sizing (`text-xs`, `text-[10px]`)
- Hover state for interactivity
- Better visual hierarchy with status badge on the right

### Part 2: Remove Permission Restriction

Change the widget from `requiredPermission: "view_primary_kpis"` to no permission requirement.

**Why**: You mentioned dealers should see this widget too (like revenue widgets), and since the data is already filtered by account owner in `useStatusReasonsKPI`, there's no security concern.

**Change in `useDashboardWidgets.ts`:**
```typescript
// Before
{
  id: "status-reasons",
  ...
  requiredPermission: "view_primary_kpis", // Restrictive
}

// After
{
  id: "status-reasons",
  ...
  // No requiredPermission - visible to all users like the status widget
}
```

### Part 3: Empty State Enhancement

Create a motivational empty state (like `RevenueTrendChart` and `RecentlyCreatedJobsWidget`):

```text
+------------------------------------------+
|       [Pixel icon]                       |
|                                          |
|  No rejections or cancellations 🎉       |
|  Your projects are on track!             |
+------------------------------------------+
```

## Files to Modify

| File | Change |
|------|--------|
| `src/components/dashboard/StatusReasonsWidget.tsx` | Enhanced styling, better card layout, improved empty state |
| `src/hooks/useDashboardWidgets.ts` | Remove `requiredPermission` from status-reasons widget |

## Visual Comparison

The new design will:
- Use the same card item pattern as "Recently Created Jobs"
- Have hover interactions like other widgets
- Show status badges consistently with color coding
- Display the reason in a clean, readable format
- Use relative time ("2 hours ago") instead of full timestamps

## Expected Behavior

### For All Users (including Dealers):
1. Widget appears in dashboard (no permission check)
2. Shows recent rejections/cancellations for their account
3. Hover effects provide visual feedback
4. Clean, scannable list format

### Empty State:
1. Motivational icon and message
2. Indicates tracking is working, just no negative events
3. Matches the positive empty states used elsewhere

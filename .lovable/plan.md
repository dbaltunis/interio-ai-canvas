
# Transform StatusReasonsWidget into Chart Widget with Permission & Date Filtering

## Understanding Your Requirements

1. **Permissions**: Apply the same permission as Revenue widget (`view_revenue_kpis`, `view_analytics`, or `view_primary_kpis`) - if users/dealers can't see revenue, they shouldn't see this widget either

2. **Date Filtering**: ALL widgets should respond to the dashboard date picker - currently `StatusReasonsWidget` ignores it completely

3. **Widget Design**: Transform from a list view into an interactive chart widget matching the style of Revenue Trend and Jobs by Status (Recharts, donut/bar, animations)

---

## Current Problems

| Issue | Current State | Required State |
|-------|---------------|----------------|
| Permission | No permission check | Same as Revenue (`canViewRevenue`) |
| Date Filter | Ignores dashboard date range | Filters by `dateRange.startDate` to `dateRange.endDate` |
| Visual Style | List with scroll | Interactive Recharts visualization (donut or bar) |
| Widget Location | In the dynamic widgets grid | In the main charts row with Revenue & Jobs |

---

## Solution Implementation

### Part 1: Add Date Filtering to Hook

**Update `useStatusReasonsKPI.ts`:**
- Import `useDashboardDate` context
- Filter `status_change_history` by `changed_at` within date range
- Add dateRange to query key for proper cache invalidation

```typescript
// Add date range filtering
const { dateRange } = useDashboardDate();

return useQuery({
  queryKey: ['status-reasons-kpi', effectiveOwnerId, dateRange.startDate, dateRange.endDate],
  queryFn: async () => {
    // ... existing code ...
    .gte('changed_at', dateRange.startDate.toISOString())
    .lte('changed_at', dateRange.endDate.toISOString())
  }
});
```

### Part 2: Transform Widget to Chart Visualization

**Redesign `StatusReasonsWidget.tsx`:**
- Use Recharts `PieChart` (donut) like `JobsStatusChart`
- Show breakdown by status type (Rejected vs Cancelled vs On Hold)
- Include period comparison like `RevenueTrendChart` (vs prev period)
- Add interactive tooltip
- Match same height as other chart widgets (180px chart area)

**New Layout:**

```text
+--------------------------------------------------+
| Rejections & Cancellations    ↓ -50% vs prev     |
+--------------------------------------------------+
|                                                  |
|  [Donut Chart]     • Rejected      5             |
|    showing         • Cancelled     3             |
|    breakdown       • On Hold       2             |
|                                    ───           |
|                    Total:         10             |
+--------------------------------------------------+
```

### Part 3: Move to Charts Row with Permission Gate

**Update `EnhancedHomeDashboard.tsx`:**

1. Remove `status-reasons` from the dynamic widgets grid
2. Add it to the main charts row alongside Revenue and Jobs
3. Apply same permission check as Revenue (`canViewRevenue`)

```typescript
// Charts Row - now 3 columns when all visible
{(canViewRevenue !== false || canViewJobs !== false) && (
  <div className={`grid grid-cols-1 ${getChartsGridCols()} gap-4`}>
    {canViewRevenue !== false && <RevenueTrendChart />}
    {canViewJobs !== false && <JobsStatusChart />}
    {canViewRevenue !== false && <StatusReasonsChart />}  {/* NEW - same permission as revenue */}
  </div>
)}
```

### Part 4: Remove from Widget Registry

**Update `useDashboardWidgets.ts`:**
- Remove or disable the `status-reasons` widget from `DEFAULT_WIDGETS`
- It will now be rendered directly in the charts row (like Revenue)

---

## Files to Modify

| File | Change |
|------|--------|
| `src/hooks/useStatusReasonsKPI.ts` | Add date range filtering using `useDashboardDate()` |
| `src/components/dashboard/StatusReasonsWidget.tsx` | Transform to Recharts donut with comparison, rename to chart style |
| `src/components/dashboard/EnhancedHomeDashboard.tsx` | Move widget to charts row with `canViewRevenue` permission gate |
| `src/hooks/useDashboardWidgets.ts` | Remove `status-reasons` from dynamic widgets (now in charts row) |

---

## Technical Details

### Date Filtering in Hook

```typescript
// useStatusReasonsKPI.ts - add date range
import { useDashboardDate } from "@/contexts/DashboardDateContext";

export const useStatusReasonsKPI = () => {
  const { effectiveOwnerId } = useEffectiveAccountOwner();
  const { dateRange } = useDashboardDate();
  
  return useQuery({
    queryKey: ['status-reasons-kpi', effectiveOwnerId, dateRange.startDate, dateRange.endDate],
    queryFn: async () => {
      // Filter by date range
      const { data } = await supabase
        .from('status_change_history')
        .select(...)
        .in('new_status_name', ['Rejected', 'Cancelled', 'On Hold'])
        .gte('changed_at', dateRange.startDate.toISOString())
        .lte('changed_at', dateRange.endDate.toISOString())
        .order('changed_at', { ascending: false });
      
      return data;
    }
  });
};
```

### Chart Visualization

```typescript
// StatusReasonsWidget.tsx - donut chart like JobsStatusChart
const chartData = useMemo(() => {
  const counts = { Rejected: 0, Cancelled: 0, 'On Hold': 0 };
  statusReasons?.forEach(item => {
    if (item.new_status_name) counts[item.new_status_name]++;
  });
  return [
    { name: 'Rejected', value: counts.Rejected, color: 'hsl(0, 84%, 60%)' },
    { name: 'Cancelled', value: counts.Cancelled, color: 'hsl(38, 92%, 50%)' },
    { name: 'On Hold', value: counts['On Hold'], color: 'hsl(var(--primary))' },
  ].filter(d => d.value > 0);
}, [statusReasons]);

// Render donut chart with legend
```

### Permission Gating in Dashboard

```typescript
// EnhancedHomeDashboard.tsx - charts row
<div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
  {canViewRevenue !== false && <RevenueTrendChart />}
  {canViewJobs !== false && <JobsStatusChart />}
  {canViewRevenue !== false && <StatusReasonsWidget />}
</div>
```

---

## Expected Behavior After Implementation

### Date Filtering
1. User selects "Last 7 days" from dashboard date picker
2. All charts (Revenue, Jobs, Rejections) update to show only that period
3. Rejections widget shows: "2 rejections in last 7 days"

### Permission Gating
1. Admin sees all 3 charts in the row
2. Dealer without revenue permission sees only Jobs chart
3. Widget completely hidden (not disabled) for non-permitted users

### Chart Visualization
1. Donut chart showing breakdown: Rejected (red), Cancelled (yellow), On Hold (blue)
2. Total count displayed in top right
3. Comparison indicator: "↑ +20% vs prev period" or "↓ -50% vs prev period"
4. Interactive tooltip on hover showing count and percentage
5. Motivational empty state when no rejections in period

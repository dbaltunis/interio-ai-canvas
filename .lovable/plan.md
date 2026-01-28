
# Fix StatusReasonsWidget: Layout, Filtering & Drill-down Details

## Issue Analysis

### Issue 1: Layout - 3 Widgets in a Row Looks Bad
**Current:** Charts row uses `lg:grid-cols-3` when all 3 widgets are visible
**Problem:** Three charts crammed in one row on laptop screens looks cramped

### Issue 2: Filtering Shows Wrong Count
**Database shows:** Two "Rejected" entries for today (2026-01-28):
- 08:10:34 - Same project rejected (no reason)
- 18:26:03 - Same project rejected again ("too expensive")

**This is correct behavior** - the widget tracks every status change event, not unique projects. If a project is rejected twice in the same day (e.g., rejected → un-rejected → rejected again), both events are counted.

**The real issue:** The query correctly filters by date but doesn't filter by the effective account owner for the status changes. The status_change_history doesn't have an owner filter applied.

### Issue 3: Need More Details from the Pie Chart
**Current:** Pie shows counts but no way to see actual reasons or project names
**Needed:** Click to expand with a list of rejection reasons, popular reasons, etc.

---

## Solution Implementation

### Part 1: Change Layout to 2 Columns

**Update `EnhancedHomeDashboard.tsx`:**

Change the charts row from 3 columns to 2 columns:
- Row 1: Revenue Trend + Jobs by Status
- Row 2: Rejections & Cancellations (full width or paired with another widget)

```text
BEFORE (cramped):
+----------------+----------------+----------------+
| Revenue Trend  | Jobs Status    | Rejections     |
+----------------+----------------+----------------+

AFTER (cleaner):
+------------------------+------------------------+
| Revenue Trend          | Jobs by Status         |
+------------------------+------------------------+
+------------------------+------------------------+
| Rejections & Cancels   | (Dynamic widget space) |
+------------------------+------------------------+
```

**Code change:**
```typescript
// Charts Row 1: Revenue + Jobs
<div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
  {canViewRevenue !== false && <RevenueTrendChart />}
  {canViewJobs !== false && <JobsStatusChart />}
</div>

// Charts Row 2: Rejections (separate row)
{canViewRevenue !== false && (
  <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
    <StatusReasonsWidget />
  </div>
)}
```

### Part 2: Fix Filtering - Add Project Owner Filter

**Update `useStatusReasonsKPI.ts`:**

The hook needs to filter by projects owned by the effective account owner. Currently it fetches ALL status changes regardless of project ownership.

**Add join to projects table with owner filter:**
```typescript
// Get projects owned by the effective owner first
const { data: ownedProjects } = await supabase
  .from('projects')
  .select('id')
  .eq('user_id', effectiveOwnerId);

const projectIds = ownedProjects?.map(p => p.id) || [];

// Then filter status changes by those projects
const { data: currentChanges } = await supabase
  .from('status_change_history')
  .select(...)
  .in('project_id', projectIds)  // Filter by owned projects
  .in('new_status_name', ['Rejected', 'Cancelled', 'On Hold'])
  .gte('changed_at', dateRange.startDate.toISOString())
  .lte('changed_at', dateRange.endDate.toISOString());
```

### Part 3: Add Drill-down Dialog with Details

**Enhance `StatusReasonsWidget.tsx`:**

Add a clickable dialog/sheet that shows:
1. List of all rejections/cancellations with reasons
2. Top 5 most common reasons (grouped)
3. Project name + who made the change + when

**New UI with click-to-expand:**

```text
+------------------------------------------+
| Rejections & Cancellations    ↓ -50%     |
|            [Click for details]           |
+------------------------------------------+
|                                          |
|  [Donut Chart]     • Rejected      2     |  ← Clicking chart opens dialog
|                    • Cancelled     0     |
|                    • On Hold       0     |
+------------------------------------------+

DIALOG (on click):
+--------------------------------------------------+
| Rejection Details                           [X]  |
+--------------------------------------------------+
| Top Reasons:                                     |
| 1. "too expensive" (50%)                         |
| 2. "client changed mind" (30%)                   |
| 3. "project scope changed" (20%)                 |
+--------------------------------------------------+
| Recent Changes:                                  |
| +----------------------------------------------+ |
| | [🔴] Project Name            Rejected        | |
| |      "too expensive"                         | |
| |      👤 Darius B. · 📅 2 hours ago           | |
| +----------------------------------------------+ |
| | [🔴] Another Project         Rejected        | |
| |      (no reason provided)                    | |
| |      👤 John D. · 📅 10 hours ago            | |
| +----------------------------------------------+ |
+--------------------------------------------------+
```

**Implementation:**
- Add `useState` for dialog open state
- Make chart/card clickable with cursor-pointer
- Use `Dialog` or `Sheet` component for detail view
- Group reasons by frequency and show top 5
- Show full list with project names and metadata

---

## Files to Modify

| File | Change |
|------|--------|
| `src/components/dashboard/EnhancedHomeDashboard.tsx` | Change layout from 3-column to 2x2 grid |
| `src/hooks/useStatusReasonsKPI.ts` | Add project owner filter to query |
| `src/components/dashboard/StatusReasonsWidget.tsx` | Add click-to-expand dialog with detailed list and top reasons |

---

## Technical Details

### Layout Change
```typescript
// EnhancedHomeDashboard.tsx

// Charts Row - 2 per row, not 3
{(canViewRevenue !== false || canViewJobs !== false) && (
  <>
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
      {canViewRevenue !== false && (
        <Suspense fallback={<WidgetSkeleton />}>
          <RevenueTrendChart />
        </Suspense>
      )}
      {canViewJobs !== false && (
        <Suspense fallback={<WidgetSkeleton />}>
          <JobsStatusChart />
        </Suspense>
      )}
    </div>
    {canViewRevenue !== false && (
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Suspense fallback={<WidgetSkeleton />}>
          <StatusReasonsWidget />
        </Suspense>
      </div>
    )}
  </>
)}
```

### Owner Filter in Hook
```typescript
// useStatusReasonsKPI.ts

// First get owned project IDs
const { data: ownedProjects } = await supabase
  .from('projects')
  .select('id')
  .eq('user_id', effectiveOwnerId);

const projectIds = (ownedProjects || []).map(p => p.id);

if (projectIds.length === 0) {
  return { current: [], currentCounts: {...}, total: 0, ... };
}

// Filter status changes by owned projects AND date range
const { data: currentChanges } = await supabase
  .from('status_change_history')
  .select(`id, new_status_name, reason, user_name, user_email, changed_at, project_id`)
  .in('project_id', projectIds)  // Only owned projects
  .in('new_status_name', ['Rejected', 'Cancelled', 'On Hold'])
  .gte('changed_at', dateRange.startDate.toISOString())
  .lte('changed_at', dateRange.endDate.toISOString())
  .order('changed_at', { ascending: false });
```

### Drill-down Dialog Component
```typescript
// StatusReasonsWidget.tsx - add dialog

const [detailsOpen, setDetailsOpen] = useState(false);

// Group reasons by frequency
const topReasons = useMemo(() => {
  const reasonCounts: Record<string, number> = {};
  data?.current?.forEach(item => {
    const reason = item.reason || 'No reason provided';
    reasonCounts[reason] = (reasonCounts[reason] || 0) + 1;
  });
  return Object.entries(reasonCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([reason, count]) => ({
      reason,
      count,
      percentage: ((count / (data?.total || 1)) * 100).toFixed(0)
    }));
}, [data]);

// Make card clickable
<Card 
  variant="analytics" 
  className="cursor-pointer hover:shadow-md transition-shadow"
  onClick={() => setDetailsOpen(true)}
>
  ...
</Card>

// Dialog with details
<Dialog open={detailsOpen} onOpenChange={setDetailsOpen}>
  <DialogContent className="max-w-lg">
    <DialogHeader>
      <DialogTitle>Rejection & Cancellation Details</DialogTitle>
    </DialogHeader>
    
    {/* Top Reasons Section */}
    <div className="space-y-2">
      <h4 className="text-sm font-medium">Top Reasons</h4>
      {topReasons.map((r, i) => (
        <div key={i} className="flex justify-between text-xs">
          <span>"{r.reason}"</span>
          <span className="text-muted-foreground">{r.percentage}%</span>
        </div>
      ))}
    </div>
    
    {/* Recent Changes List */}
    <div className="space-y-2">
      <h4 className="text-sm font-medium">Recent Changes</h4>
      <ScrollArea className="h-[200px]">
        {data?.current?.map(item => (
          <div key={item.id} className="...">
            {/* Similar to RecentlyCreatedJobsWidget item style */}
          </div>
        ))}
      </ScrollArea>
    </div>
  </DialogContent>
</Dialog>
```

---

## Expected Behavior After Implementation

### Layout
- Revenue Trend and Jobs by Status appear side by side (row 1)
- Rejections & Cancellations appears in a second row (2 columns)
- Clean, uncrammed appearance on all screen sizes

### Filtering Accuracy
- Only shows rejections/cancellations for projects owned by the current user
- Date filter correctly applied (today = only today's changes)
- If same project rejected twice today, shows 2 (correct - tracking events)

### Details Drill-down
1. User clicks on the pie chart widget
2. Dialog opens showing:
   - Top 5 most common rejection reasons with percentages
   - Scrollable list of all recent status changes
   - Each item shows: project name, status badge, reason in quotes, who + when
3. User can scan for patterns or click to navigate to specific projects


# Fix: Permission-Based Dashboard Widget Visibility

## Problem Summary

The dashboard currently does NOT properly filter widgets based on user permissions. The role name (Dealer, Admin, Staff) is irrelevant - what matters is the **actual permissions** assigned when inviting someone to the app.

Currently:
- Revenue Chart: Shows to everyone (no permission check)
- Jobs Status Chart: Shows to everyone (no permission check)  
- KPI Row (Revenue, Projects, Quotes, Clients): Shows all 4 to everyone (no permission check)
- Only some dynamic widgets check permissions

## The Correct Approach (Industry Standard)

Every SaaS like Notion, Figma, Linear uses this pattern:
1. Role names (Admin, Staff, Dealer) are just **permission presets**
2. When you invite someone, you can customize their exact permissions
3. The UI shows/hides elements based on the **actual permissions granted**, not the role name
4. Same premium visual quality for everyone - just different data visibility

## Solution

Add permission checks to ALL sensitive dashboard elements:

### 1. KPI Row - Filter Metrics by Permission

Add permission props to `CompactKPIRow` and filter which metrics display:

| Metric | Required Permission |
|--------|---------------------|
| Revenue | `view_revenue_kpis` or `view_analytics` |
| Active Projects | `view_all_jobs` or `view_assigned_jobs` |
| Pending Quotes | `view_all_jobs` or `view_assigned_jobs` |
| Clients | `view_all_clients` or `view_assigned_clients` |

**If user has NO jobs permission**: Hide Projects and Quotes KPI cards
**If user has NO client permission**: Hide Clients KPI card
**If user has NO revenue permission**: Hide Revenue KPI card

### 2. Charts Row - Add Permission Gates

| Chart | Required Permission |
|-------|---------------------|
| Revenue Trend | `view_revenue_kpis` or `view_analytics` |
| Jobs Status | `view_all_jobs` or `view_assigned_jobs` |

**If user lacks permission**: Don't render the chart at all

### 3. Data Hooks Already Filter Correctly

The existing hooks like `useRevenueHistory`, `useBatchedDashboardQueries` already filter by `effectiveOwnerId` - users only see their own data. The issue is the UI elements always render regardless of permissions.

---

## Files to Modify

| File | Changes |
|------|---------|
| `src/components/dashboard/EnhancedHomeDashboard.tsx` | Filter `compactMetrics` array based on permissions, wrap charts in permission checks |
| `src/components/dashboard/CompactKPIRow.tsx` | Add `requiredPermission` to metric type (optional) |

---

## Technical Implementation

### EnhancedHomeDashboard.tsx Changes

1. Add permission checks for charts and KPIs
2. Filter metrics array based on user permissions
3. Conditionally render charts only if user has permission

```typescript
// New permission checks needed
const canViewRevenue = useHasAnyPermission(['view_revenue_kpis', 'view_analytics', 'view_primary_kpis']);
const canViewJobs = useHasAnyPermission(['view_all_jobs', 'view_assigned_jobs']);
const canViewClients = useHasAnyPermission(['view_all_clients', 'view_assigned_clients']);

// Filter KPI metrics based on permissions
const compactMetrics = useMemo(() => {
  const metrics = [];
  
  // Only show revenue if user has permission
  if (canViewRevenue !== false) {
    metrics.push({ id: "revenue", label: "Revenue", value: stats?.totalRevenue || 0, icon: DollarSign, isCurrency: true });
  }
  
  // Only show projects/quotes if user can view jobs
  if (canViewJobs !== false) {
    metrics.push({ id: "projects", label: "Active Projects", value: stats?.activeProjects || 0, icon: FileText });
    metrics.push({ id: "quotes", label: "Pending Quotes", value: stats?.pendingQuotes || 0, icon: FileText });
  }
  
  // Only show clients if user can view clients
  if (canViewClients !== false) {
    metrics.push({ id: "clients", label: "Clients", value: stats?.totalClients || 0, icon: Users });
  }
  
  return metrics;
}, [stats, canViewRevenue, canViewJobs, canViewClients]);

// Charts section with permission gates
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
```

---

## Expected Result After Fix

### User with ALL permissions (Owner/Admin)
- Sees all 4 KPI cards
- Sees both Revenue and Jobs charts
- Sees all widgets they've enabled

### User with LIMITED permissions (Staff with only assigned jobs)
- Sees only Projects, Quotes KPI cards (if view_assigned_jobs)
- Sees Jobs Status Chart only (no Revenue chart)
- Dynamic widgets filtered by their permissions

### Dealer with minimal permissions
- Sees only the KPIs for data they can access (Projects, Quotes)
- No Revenue chart (no view_analytics permission)
- Jobs chart shows only their assigned jobs data
- Dynamic widgets filtered by their permissions

---

## Why This Is The Correct SaaS Pattern

1. **Permission-Driven, Not Role-Driven**: The UI responds to actual permissions, not role names
2. **Custom Permissions Work**: If you grant a Dealer `view_analytics`, they'll see the Revenue chart
3. **Graceful Degradation**: Users see a beautiful dashboard with just fewer items
4. **Same Premium UI**: No "poor quality" simplified views - same glassmorphism, animations for everyone
5. **Maintainable**: One dashboard component, one set of widgets, permission checks at render time

---

## Testing Checklist

After implementation:
- [ ] Owner sees all 4 KPIs and both charts
- [ ] Staff with `view_assigned_jobs` only sees Projects/Quotes KPIs and Jobs chart
- [ ] Dealer sees only KPIs they have permission for
- [ ] Removing `view_analytics` from any user hides Revenue chart
- [ ] Custom permission overrides work correctly
- [ ] No visual quality degradation for limited users

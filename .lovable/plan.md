
# Add Missing Widgets to Dashboard Customizer

## Problem Identified

The "Customize Dashboard Widgets" dialog is missing several key widgets that exist in the dashboard. Currently only 8 widgets appear in the customizer (as shown in your screenshot), but the dashboard actually has many more components.

### What's Missing

| Widget | Component | Current State |
|--------|-----------|---------------|
| **Revenue Trend** | `RevenueTrendChart.tsx` | Hardcoded in charts row - NOT customizable |
| **Jobs by Status** | `JobsStatusChart.tsx` | Hardcoded in charts row - NOT customizable |
| **Rejections & Cancellations** | `StatusReasonsWidget.tsx` | Hardcoded in charts row - NOT customizable |
| **Quick Actions** | `QuickActions.tsx` | Component exists but unused |
| **Sales Pipeline** | `PipelineOverview.tsx` | Component exists but unused |
| **E-Commerce Gateway** | `ECommerceGatewayWidget.tsx` | Conditionally shown - NOT customizable |
| **Online Store Setup** | `OnlineStoreSetupWidget.tsx` | Component exists but unused |

### Why This Matters

Users can only show/hide 8 widgets, but the dashboard has ~15+ visual elements. The main charts (Revenue, Jobs, Rejections) are always visible with no option to disable them.

---

## Solution

### 1. Add Missing Widgets to DEFAULT_WIDGETS

Update `src/hooks/useDashboardWidgets.ts` to include all dashboard components:

```typescript
// New widgets to add:
{
  id: "revenue-trend",
  name: "Revenue Trend",
  description: "Monthly revenue chart with trend analysis",
  enabled: true,
  order: 1,
  category: "finance",
  size: "medium",
  requiredPermission: "view_revenue_kpis",
},
{
  id: "jobs-status",
  name: "Jobs by Status",
  description: "Pie chart showing project status distribution",
  enabled: true,
  order: 2,
  category: "analytics",
  size: "medium",
  requiredPermission: "view_all_jobs",
},
{
  id: "status-reasons",
  name: "Rejections & Cancellations",
  description: "Track project rejections, cancellations, and holds",
  enabled: true,
  order: 3,
  category: "analytics",
  size: "medium",
  requiredPermission: "view_revenue_kpis",
},
{
  id: "quick-actions",
  name: "Quick Actions",
  description: "Shortcuts to create projects, clients, and more",
  enabled: true,
  order: 4,
  category: "analytics",
  size: "small",
},
{
  id: "sales-pipeline",
  name: "Sales Pipeline",
  description: "Visual pipeline of quotes by stage",
  enabled: false, // Disabled by default
  order: 5,
  category: "finance",
  size: "medium",
  requiredPermission: "view_revenue_kpis",
},
{
  id: "ecommerce-gateway",
  name: "E-Commerce Setup",
  description: "Get started with online selling",
  enabled: true,
  order: 6,
  category: "integrations",
  size: "medium",
},
```

### 2. Update EnhancedHomeDashboard.tsx

Modify the dashboard to render charts based on widget configuration instead of hardcoded permission checks:

**Before (hardcoded):**
```tsx
{(canViewRevenue !== false || canViewJobs !== false) && (
  <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
    {canViewRevenue !== false && <RevenueTrendChart />}
    {canViewJobs !== false && <JobsStatusChart />}
  </div>
)}
```

**After (widget-driven):**
```tsx
{/* Charts Row - now controlled by widget configs */}
{enabledWidgets.some(w => ['revenue-trend', 'jobs-status'].includes(w.id)) && (
  <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
    {isWidgetEnabled('revenue-trend') && <RevenueTrendChart />}
    {isWidgetEnabled('jobs-status') && <JobsStatusChart />}
  </div>
)}
```

### 3. Add Icons for New Widgets

Update `DashboardWidgetCustomizer.tsx` to include icons for the new widgets:

```typescript
const icons: Record<string, any> = {
  // Existing...
  "revenue-trend": DollarSign,
  "jobs-status": PieChart,
  "status-reasons": AlertTriangle,
  "quick-actions": Zap,
  "sales-pipeline": GitBranch,
  "ecommerce-gateway": ShoppingCart,
};
```

---

## Result After Implementation

The customizer will show all widgets (15+) organized by category:

| Category | Widgets |
|----------|---------|
| **Finance** | Revenue Trend, Sales Pipeline |
| **Analytics** | Jobs by Status, Rejections & Cancellations, Project Status, Team Performance, Recently Created Jobs |
| **Communication** | Team Members, Upcoming Events, Recent Appointments, Recent Emails |
| **Integrations** | Calendar Connection, E-Commerce Setup, Online Store widgets, Shopify widgets |

Users will be able to:
- Show/hide ANY widget including charts
- Reorder widgets
- Resize widgets
- Enable/disable features they don't use

---

## Files to Modify

| File | Changes |
|------|---------|
| `src/hooks/useDashboardWidgets.ts` | Add 6+ new widget definitions to DEFAULT_WIDGETS |
| `src/components/dashboard/EnhancedHomeDashboard.tsx` | Refactor charts to use widget configs; add QuickActions and PipelineOverview rendering |
| `src/components/dashboard/DashboardWidgetCustomizer.tsx` | Add icons for new widgets |

---

## Technical Notes

- Existing user preferences will be preserved via the merge logic in `useDashboardWidgets.ts`
- New widgets will appear with their default `enabled` state for existing users
- Permission checks remain in place - users still won't see widgets they don't have access to
- The widget order will respect user customizations


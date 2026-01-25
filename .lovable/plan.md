
# Phase 9: Dealer Dashboard Enhancements + Library Supplier Visibility Fixes

## Overview

This phase addresses two categories of issues from the CSV:

1. **Dealer Dashboard Enhancement (Issue #4)** - Add summary widgets (Active Projects, Pending Quotes, Clients count) to the DealerDashboard
2. **Library Supplier Visibility (Issues #46, #47, #50, #52)** - Hide supplier names/filters and cost prices from dealers in the Library/Inventory views

---

## Issues Being Addressed

| Issue # | Location | Problem | Solution |
|---------|----------|---------|----------|
| #4 | DealerDashboard | Only shows "Your Recent Jobs" | Add summary widgets: Active Projects, Pending Quotes, Clients count |
| #46 | Library | Supplier name visible | Hide supplier columns for dealers |
| #47 | Library | Cost price & supplier shown in $ | Hide cost price and supplier for dealers |
| #50 | Library | Supplier names visible | Hide Supplier filter and columns for dealers |
| #52 | Library | Supplier column visible to dealer | Hide supplier column for dealers |

---

## Part 1: Dealer Dashboard Enhancements

### Current State
The `DealerDashboard` component (`src/components/dashboard/EnhancedHomeDashboard.tsx:54-64`) only renders:
- `DealerWelcomeHeader` 
- `DealerRecentJobsWidget`

### Proposed Changes

Add summary stat cards showing dealer-specific metrics:
- Active Projects (their own)
- Pending Quotes (their own)
- Total Clients (assigned to them)

### Implementation

**New Component**: `src/components/dashboard/DealerStatsCards.tsx`
```text
+--------------------+--------------------+--------------------+
|  Active Projects   |   Pending Quotes   |      Clients       |
|        12          |         5          |        28          |
+--------------------+--------------------+--------------------+
```

**Modified File**: `src/components/dashboard/EnhancedHomeDashboard.tsx`
- Add `<DealerStatsCards />` between header and recent jobs widget

### Data Source
- Use existing `useDealerOwnProjects()` hook for projects count
- Create a new `useDealerStats()` hook to fetch:
  - Active projects count (status != completed/cancelled)
  - Pending quotes count (quotes without confirmed status)
  - Assigned clients count

---

## Part 2: Library Supplier Visibility Fixes

### Current State
The `FabricInventoryView.tsx` (and similar views) show:
- Supplier filter dropdown (line 228-233)
- Supplier name in grid cards (lines 373-377)
- Supplier column in list view (lines 505, 543)
- TWC badge based on vendor name (lines 363-367)

### Files Requiring Changes

| File | Changes |
|------|---------|
| `src/components/inventory/FabricInventoryView.tsx` | Hide supplier filter, supplier column/cell, TWC badge for dealers |
| `src/components/inventory/MaterialInventoryView.tsx` | Same changes |
| `src/components/inventory/HardwareInventoryView.tsx` | Same changes |
| `src/components/inventory/WallcoveringInventoryView.tsx` | Same changes |
| `src/components/inventory/InventorySupplierFilter.tsx` | Return null if `isDealer` |

### Implementation Pattern

Each view will:
1. Import `useIsDealer` hook
2. Conditionally render supplier-related UI:
   - `{!isDealer && <InventorySupplierFilter ... />}`
   - Grid cards: `{!isDealer && (item.vendor?.name || item.supplier) && ...}`
   - List header: `{!isDealer && <TableHead>Supplier</TableHead>}`
   - List cell: `{!isDealer && <TableCell>...</TableCell>}`

---

## Files to Create

| File | Purpose |
|------|---------|
| `src/components/dashboard/DealerStatsCards.tsx` | Summary stat cards for dealer dashboard |
| `src/hooks/useDealerStats.ts` | Hook to fetch dealer-specific statistics |

---

## Files to Modify

| File | Change Summary |
|------|----------------|
| `src/components/dashboard/EnhancedHomeDashboard.tsx` | Import and render DealerStatsCards in DealerDashboard |
| `src/components/inventory/FabricInventoryView.tsx` | Add isDealer checks around supplier UI |
| `src/components/inventory/MaterialInventoryView.tsx` | Add isDealer checks around supplier UI |
| `src/components/inventory/HardwareInventoryView.tsx` | Add isDealer checks around supplier UI |
| `src/components/inventory/WallcoveringInventoryView.tsx` | Add isDealer checks around supplier UI |
| `src/components/inventory/InventorySupplierFilter.tsx` | Early return null if isDealer |

---

## Implementation Order

1. **Create DealerStatsCards component** - New component for dealer stats
2. **Create useDealerStats hook** - Fetch dealer-specific metrics
3. **Update EnhancedHomeDashboard** - Add DealerStatsCards to DealerDashboard
4. **Fix InventorySupplierFilter** - Hide entire filter for dealers
5. **Fix FabricInventoryView** - Hide supplier in grid and list views
6. **Fix MaterialInventoryView** - Same pattern
7. **Fix HardwareInventoryView** - Same pattern
8. **Fix WallcoveringInventoryView** - Same pattern

---

## Technical Details

### DealerStatsCards Component Structure

```typescript
export const DealerStatsCards = () => {
  const { data: stats, isLoading } = useDealerStats();
  
  return (
    <div className="grid grid-cols-3 gap-4">
      <StatCard 
        label="Active Projects" 
        value={stats?.activeProjects || 0} 
        icon={FolderOpen} 
      />
      <StatCard 
        label="Pending Quotes" 
        value={stats?.pendingQuotes || 0} 
        icon={FileText} 
      />
      <StatCard 
        label="Clients" 
        value={stats?.totalClients || 0} 
        icon={Users} 
      />
    </div>
  );
};
```

### useDealerStats Hook Logic

```typescript
// Fetches counts for:
// 1. Projects where user_id = current user AND status != completed/cancelled
// 2. Quotes where user_id = current user AND status = pending
// 3. Clients assigned to current user
```

### Supplier Visibility Pattern

```typescript
// In FabricInventoryView.tsx
const { isDealer } = useIsDealer();

// Filter - hide completely
{!isDealer && (
  <InventorySupplierFilter 
    value={selectedVendor} 
    onChange={setLocalSelectedVendor} 
    ... 
  />
)}

// Grid card - hide supplier row
{!isDealer && (item.vendor?.name || item.supplier) && (
  <div className="flex justify-between text-sm">
    <span className="text-muted-foreground">Supplier:</span>
    <span className="font-medium">{item.vendor?.name || item.supplier}</span>
  </div>
)}

// List table header
{!isDealer && <TableHead className="hidden md:table-cell">Supplier</TableHead>}

// List table cell
{!isDealer && <TableCell className="hidden md:table-cell">{...}</TableCell>}
```

---

## Expected Results

| Issue | Before | After |
|-------|--------|-------|
| #4 Dealer Dashboard | Only "Recent Jobs" | Stats + Recent Jobs |
| #46-52 Library Suppliers | Visible to dealers | Hidden from dealers |

---

## Testing Checklist

After implementation:
- [ ] Dealer dashboard shows Active Projects, Pending Quotes, Clients counts
- [ ] Library shows no "Supplier" filter for dealers
- [ ] Library grid view shows no supplier info for dealers
- [ ] Library list view shows no supplier column for dealers
- [ ] TWC badge still visible (it's a category indicator, not supplier name)
- [ ] Non-dealers still see all supplier information

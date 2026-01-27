

# Replace Sidebar with Brand Dropdown + Smart Filters

## Problem Analysis

The current `WorksheetBrandSidebar` (200px width) causes layout issues in the Library selection popup on smaller screens because:

1. **Popup context has constrained width** - The panel is inside a Card within a dialog, leaving limited horizontal space
2. **768px breakpoint is too narrow** - Tablets and smaller desktop windows (800-1200px) still show the sidebar but have insufficient grid space
3. **Sidebar is overkill for popup** - In the main Library, a persistent sidebar makes sense; in a selection popup, users want speed, not navigation

## Solution: Horizontal Filter Chips + Brand Dropdown

Replace the sidebar with a **compact horizontal filter bar** that provides the same functionality without consuming horizontal space:

```text
┌─────────────────────────────────────────────────────────────────┐
│ [🔍 Search...]  [Brand ▼]  [Price ▼]  [+]  [Filters]           │
│ ★ Recent: [ADARA][PRAIA][SUETAS] ← horizontal scroll            │
├─────────────────────────────────────────────────────────────────┤
│ ┌─────────┐ ┌─────────┐ ┌─────────┐ ┌─────────┐                │
│ │ 1234rt  │ │ ADARA   │ │ FLORA   │ │ PRAIA   │                │
│ │  [★]    │ │  [★]    │ │  [★]    │ │  [★]    │                │
│ └─────────┘ └─────────┘ └─────────┘ └─────────┘                │
│                                                                  │
│ ┌─────────┐ ┌─────────┐ ┌─────────┐ ┌─────────┐                │
│ │ SUETAS  │ │ MIR     │ │ KEEP    │ │ NEUTEX  │                │
│ │  [★]    │ │  [★]    │ │  [★]    │ │  [★]    │                │
│ └─────────┘ └─────────┘ └─────────┘ └─────────┘                │
│                                                                  │
│ [Load More...]                                                   │
└─────────────────────────────────────────────────────────────────┘
```

## Implementation Details

### Step 1: Remove Desktop Sidebar from InventorySelectionPanel

**File:** `src/components/inventory/InventorySelectionPanel.tsx`

Remove the desktop sidebar rendering (lines 1104-1119) and keep only the mobile Sheet version which already works well.

### Step 2: Add Brand Dropdown to Filter Bar

Replace the sidebar brand navigation with a `Select` dropdown in the header bar:

```typescript
{/* Brand Filter Dropdown - replaces sidebar */}
{brandGroups.length > 1 && (
  <Select 
    value={selectedVendor || "all"} 
    onValueChange={(val) => setSelectedVendor(val === "all" ? undefined : val)}
  >
    <SelectTrigger className="w-32 h-10">
      <Building2 className="h-3.5 w-3.5 mr-1.5" />
      <SelectValue placeholder="Brand" />
    </SelectTrigger>
    <SelectContent className="max-h-[300px]">
      <SelectItem value="all">All Brands ({totalItems})</SelectItem>
      {brandGroups.map(({ vendorId, vendorName, itemCount }) => (
        <SelectItem key={vendorId || 'unassigned'} value={vendorId || 'unassigned'}>
          {vendorName} ({itemCount})
        </SelectItem>
      ))}
    </SelectContent>
  </Select>
)}
```

### Step 3: Keep Recent & Favorites as Horizontal Rows

The existing `RecentSelectionsRow` component is already well-designed. Keep it at the top of the grid for quick access. Add a similar horizontal row for favorites when "Favorites Only" mode is off but favorites exist:

```typescript
{/* Quick access rows - Recent + Favorites preview */}
{recentItems.length > 0 && !showFavoritesOnly && (
  <RecentSelectionsRow ... />
)}

{/* Optional: Show top 4 favorites as chips when not in favorites-only mode */}
{favorites.length > 0 && !showFavoritesOnly && recentItems.length === 0 && (
  <FavoritesPreviewRow 
    items={displayItems.filter(i => isFavorite(i.id)).slice(0, 4)}
    onSelect={handleItemSelect}
    onShowAll={() => setShowFavoritesOnly(true)}
  />
)}
```

### Step 4: Add Favorites Toggle Button

Add a star toggle to quickly switch between all items and favorites:

```typescript
{/* Favorites toggle */}
{favorites.length > 0 && (
  <Button
    variant={showFavoritesOnly ? "default" : "outline"}
    size="sm"
    className="h-10 gap-1.5"
    onClick={() => setShowFavoritesOnly(!showFavoritesOnly)}
  >
    <Star className={cn("h-4 w-4", showFavoritesOnly && "fill-current")} />
    <span className="hidden sm:inline">{favorites.length}</span>
  </Button>
)}
```

## Files to Modify

| File | Change |
|------|--------|
| `src/components/inventory/InventorySelectionPanel.tsx` | Remove desktop sidebar, add Brand dropdown, add Favorites toggle button |
| `src/components/inventory/WorksheetBrandSidebar.tsx` | Keep for mobile Sheet only (or optionally delete if we inline the mobile button) |

## Visual Comparison

**Before (problematic):**
```text
┌──────────────────────────────────────────────────────────────┐
│ [Search...]                    [Price ▼] [+] [Filters]       │
├──────────┬───────────────────────────────────────────────────┤
│ BRANDS   │ ┌──────┐ ┌──────┐ ┌──────┐  ← only 3 cards fit   │
│ ▸ All    │ │ item │ │ item │ │ item │                       │
│ ▸ MASLINA│ └──────┘ └──────┘ └──────┘                       │
│ ▸ KEEP   │                                                   │
│ ...      │  ← sidebar takes 200px                            │
└──────────┴───────────────────────────────────────────────────┘
```

**After (fixed):**
```text
┌──────────────────────────────────────────────────────────────┐
│ [Search...] [Brand ▼] [Price ▼] [★ 5] [+] [Filters]         │
│ Recent: [ADARA] [PRAIA] [SUETAS] [FLORA] →                   │
├──────────────────────────────────────────────────────────────┤
│ ┌──────┐ ┌──────┐ ┌──────┐ ┌──────┐  ← 4 cards fit now      │
│ │ item │ │ item │ │ item │ │ item │                          │
│ └──────┘ └──────┘ └──────┘ └──────┘                          │
│ ┌──────┐ ┌──────┐ ┌──────┐ ┌──────┐                          │
│ │ item │ │ item │ │ item │ │ item │                          │
│ └──────┘ └──────┘ └──────┘ └──────┘                          │
└──────────────────────────────────────────────────────────────┘
```

## Benefits

1. **Full width for grid** - No sidebar stealing horizontal space
2. **Works on all screen sizes** - Dropdowns and horizontal scrolls adapt naturally
3. **Faster access** - Recent items and favorites visible immediately
4. **Same functionality** - Brand filtering via dropdown, favorites toggle, recent history
5. **Cleaner popup UX** - Matches what users expect in a selection popup (quick, focused)

## Technical Notes

### Layout Changes

The main change is removing the flex container that houses the sidebar:

```typescript
// BEFORE (lines 1103-1119)
<div className="flex-1 flex overflow-hidden mt-2">
  {!isMobile && brandGroups.length > 1 && (
    <WorksheetBrandSidebar ... />
  )}
  <Tabs ...>

// AFTER
<div className="flex-1 flex flex-col overflow-hidden mt-2">
  <Tabs ...>
```

### Filter Bar Restructure

The filter bar will be reorganized to include the Brand dropdown:

```typescript
<div className="flex gap-2 items-center flex-wrap">
  {/* Search */}
  <div className="relative flex-1 min-w-[120px]">
    <Search ... />
    <Input ... />
  </div>
  
  {/* Brand Dropdown (NEW - replaces sidebar) */}
  {brandGroups.length > 1 && (
    <Select value={selectedVendor || "all"} ...>
      ...
    </Select>
  )}
  
  {/* Price Dropdown (existing) */}
  {priceGroupStats.length > 0 && (
    <Select ...>
      ...
    </Select>
  )}
  
  {/* Favorites Toggle (NEW) */}
  {favorites.length > 0 && (
    <Button variant={showFavoritesOnly ? "default" : "outline"} ...>
      <Star ... />
    </Button>
  )}
  
  {/* Actions + Filters (existing) */}
  <DropdownMenu>...</DropdownMenu>
  <FilterButton ... />
</div>
```

### Mobile Behavior

On mobile (< 768px), the Brand dropdown will still render as a compact `Select` instead of the Sheet, making the experience consistent across all screen sizes. The mobile Sheet approach can be removed since the dropdown works well on all devices.


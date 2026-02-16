

# Apple Finder-Style Library Redesign

## Overview

Transform the Library page to match the Calendar section's layout -- a persistent collapsible sidebar with an Apple Finder-inspired brand/collection navigation tree, color tags for visual organization, and inline renaming. Works across ALL product categories (Fabrics, Materials, Hardware, Wallcoverings, Headings).

## Database Changes

Two new nullable columns:

- **`collections.color_tag`** (text) -- stores color key like `"red"`, `"blue"`, `"green"`
- **`vendors.color_tag`** (text) -- same palette

No existing data is affected. Both columns default to NULL (no color).

## Layout Change

Current layout uses a loose `space-y-4` vertical stack. New layout mirrors the Calendar exactly:

```text
+----------------------------------------------------------+
| Library  [search] [filter] [grid/list] [scan] [+add]     |
+-------------+--------------------------------------------+
|             | Fabrics | Materials | Hardware | Wall...    |
| BRANDS      | ------------------------------------------ |
|             |                                            |
| o All Items | [scrollable product grid/list]             |
|             |                                            |
| > TWC  [o]  |                                            |
|   o Adara   |                                            |
|   o Bella   |                                            |
|             |                                            |
| > Somfy [o] |                                            |
|   o Motors  |                                            |
|             |                                            |
| TAGS        |                                            |
| o Red       |                                            |
| o Blue      |                                            |
+-------------+--------------------------------------------+
```

The `[o]` circles represent Finder-style color dots next to brands/collections.

## What Gets Built

### 1. LibrarySidebar.tsx (new file)

Modeled directly after `CalendarSidebar.tsx`:
- Collapsible with `localStorage` persistence (`library.sidebarCollapsed`)
- Collapsed: narrow 12px strip with expand chevron
- Expanded: 280px, scrollable
- Contains:
  - Header: "Library" + collapse chevron
  - Search brands input
  - "All Items" button (clears filters)
  - Brand tree with expandable collections (reuses existing `useVendorsWithCollections` data)
  - Color dot next to each brand/collection name
  - Hover reveals "..." menu with: Rename (inline edit), Color Tag (7-color submenu + "None")
  - "Tags" section at bottom -- quick filter by color tag
- On mobile: hidden, Sheet drawer triggered from header

### 2. Color Tag Palette

```text
Red (#FF3B30), Orange (#FF9500), Yellow (#FFCC00),
Green (#34C759), Blue (#007AFF), Purple (#AF52DE), Gray (#8E8E93)
```

Same 7 colors as macOS Finder tags.

### 3. ModernInventoryDashboard.tsx (modified)

- Outer container changes from `flex-1 space-y-4 p-4` to `h-[calc(100dvh-3.5rem)] flex overflow-hidden`
- LibrarySidebar added on the left (persistent across ALL tabs)
- Header + Tabs + content move into the right `flex-1` column with internal scroll
- Remove the conditional `BrandCollectionsSidebar` block (lines 274-292)
- `selectedBrand` and `selectedCollection` state already exists -- just wired to the new sidebar

### 4. CollectionsView.tsx (simplified)

- Remove internal sidebar, Sheet, and collapse logic (lines 93-169)
- Becomes a simple grid of collection cards with search header
- Receives `selectedBrand` as prop from parent
- Collection cards show color dot if `color_tag` is set

### 5. useCollections.ts (extended)

- Add `useUpdateCollectionColor` mutation -- updates `color_tag` on collections table
- Add `useUpdateVendorColor` mutation -- updates `color_tag` on vendors table  
- Add `useRenameVendor` mutation -- updates vendor name
- Existing `useUpdateCollection` already supports name changes

### 6. BrandCollectionsSidebar.tsx (enhanced)

- Add color dot rendering next to each name
- Add hover "..." DropdownMenu with Rename and Color Tag options
- Color Tag submenu: 7 colored circles + "None" to clear
- Rename: switches to inline Input, Enter/blur to save

## Sidebar Interactions

| Action | Result |
|--------|--------|
| Click brand | Filters ALL tabs by that vendor |
| Click collection under brand | Switches to Fabrics tab filtered by that collection |
| Click "All Items" | Clears brand + collection filters |
| Right-click / hover "..." on brand | Rename or change color tag |
| Right-click / hover "..." on collection | Rename or change color tag |
| Click color in Tags section | Filter to brands/collections with that color |
| Collapse sidebar | Shrinks to 12px with expand chevron |
| Mobile | Sidebar hidden; brand button opens Sheet |

## Files Changed

| File | Action |
|------|--------|
| `collections` table | Add `color_tag` column (migration) |
| `vendors` table | Add `color_tag` column (migration) |
| `src/components/library/LibrarySidebar.tsx` | New file |
| `src/components/inventory/ModernInventoryDashboard.tsx` | Layout restructure |
| `src/components/library/CollectionsView.tsx` | Simplify (remove sidebar) |
| `src/components/library/BrandCollectionsSidebar.tsx` | Add color dots + context menu |
| `src/hooks/useCollections.ts` | Add color/rename mutations |
| `src/constants/finderColors.ts` | New constants file |

## What Stays Untouched

- All inventory hooks (`useEnhancedInventory`, etc.)
- Product category views (FabricInventoryView, HardwareInventoryView, etc.)
- FilterButton component
- RLS policies and multi-tenant logic
- AddInventoryDialog, QR scanner
- Vendors tab and Admin tab content


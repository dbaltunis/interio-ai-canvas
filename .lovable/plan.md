
# Improve Library Selection Step in Worksheet

## Current State Analysis

The Library step in the worksheet (Select Type → Treatment → **Library** → Measurements) currently has:

| Feature | Current Implementation |
|---------|----------------------|
| Search | Full-text search with debouncing |
| Price Group Filter | Horizontal scrolling buttons (1, 2, 3, Budget, etc.) |
| Quick Type Filter | Tags like Wide (300cm+), Blockout, Sheer |
| Filters Dropdown | Supplier, Collection, Tags (via popover) |
| QR Scanner | Opens dialog for barcode scanning |
| Manual Entry | Dialog to add custom item on-the-fly |
| Grid Display | 2-4 columns depending on screen size |
| Pagination | "Load More" button for infinite scroll |

### Pain Points Identified

1. **No Brand/Collection sidebar** - Users must use the Filter dropdown to navigate by supplier, losing context
2. **Recently used fabrics not visible** - Common selections require searching each time
3. **No favorites/pinned items** - High-usage materials aren't prioritized
4. **Flat grid is overwhelming** - 59+ items with no visual hierarchy
5. **Price groups take up space** - Horizontal filter bar consumes vertical space
6. **Mobile experience is cramped** - Limited space for effective browsing

---

## Proposed Improvements

### 1. Mini Brand Sidebar (Collapsible)

Add a compact brand navigation sidebar (similar to Library Collections but optimized for the worksheet context):

```text
┌──────────────────────────────────────────────────────────┐
│ [Search...]                              [Filters ▼]     │
├─────────────┬────────────────────────────────────────────┤
│ BRANDS      │  ┌─────────┐ ┌─────────┐ ┌─────────┐       │
│ ▸ All (59)  │  │ ADARA   │ │ PRAIA   │ │ SUETAS  │       │
│ ▸ MASLINA   │  │ £26.50/m│ │ £34.00/m│ │ Grid    │       │
│ ▸ KEEP      │  └─────────┘ └─────────┘ └─────────┘       │
│ ▸ PIRLANTO  │                                            │
│ ★ Recent    │                                            │
│ ★ Favorites │                                            │
└─────────────┴────────────────────────────────────────────┘
```

**Features:**
- Collapsible on mobile (sheet/drawer)
- Click brand to filter grid instantly
- Special "Recent" section showing last 5 selected items
- "Favorites" section for pinned materials

### 2. Recently Used Materials Section

Add a "Recent Selections" row at the top of the grid:

```text
Recently Used (click to select)
┌─────────┐ ┌─────────┐ ┌─────────┐ ┌─────────┐
│ ADARA   │ │ PRAIA   │ │ 1234rt  │ │ FLORA   │
│ Used 3h │ │ Used 1d │ │ Used 2d │ │ Used 5d │
└─────────┘ └─────────┘ └─────────┘ └─────────┘
```

**Implementation:**
- Store selection history in localStorage keyed by user/project
- Show max 4-6 items horizontally with timestamp
- One-click to instantly select and proceed

### 3. Favorites/Pinned Items

Allow users to star materials that appear in a dedicated section:

```text
★ Favorites
┌─────────┐ ┌─────────┐
│ ADARA   │ │ PRAIA   │
│ [★]     │ │ [★]     │
└─────────┘ └─────────┘
```

**Implementation:**
- Store in localStorage or database (`user_preferences.favorite_materials`)
- Small star button on each card to toggle
- Favorites appear at top of grid or in sidebar

### 4. Compact Filter Bar

Consolidate filters into a cleaner layout:

```text
┌─────────────────────────────────────────────────────────────┐
│ [🔍 Search...]   Brand:[All ▼]   Price:[All ▼]   [Filters]  │
└─────────────────────────────────────────────────────────────┘
```

**Changes:**
- Move Price Group from button row to dropdown
- Remove "Scan QR" and "Manual Entry" to a "+" menu
- Inline brand selector (if no sidebar)

### 5. Smart Defaults Based on Treatment

Automatically pre-filter based on selected treatment:

| Treatment | Auto-Filter |
|-----------|-------------|
| Curtains | Wide fabrics (≥250cm) first, show narrow as secondary |
| Roller Blinds | Sunscreen/Blockout tags prioritized |
| Roman Blinds | Patterned fabrics featured |
| Venetian | Material subcategory only |

---

## Implementation Plan

### Step 1: Create WorksheetBrandSidebar Component

**New file:** `src/components/inventory/WorksheetBrandSidebar.tsx`

A compact, worksheet-optimized version of `BrandCollectionsSidebar`:
- Narrower width (200px vs 280px)
- Includes "Recent" and "Favorites" special sections
- Collapsible to icon-only mode

### Step 2: Add Recent Selections Hook

**New file:** `src/hooks/useRecentMaterialSelections.ts`

```typescript
interface RecentSelection {
  itemId: string;
  name: string;
  imageUrl?: string;
  selectedAt: number;
  projectId?: string;
}

export const useRecentMaterialSelections = (limit = 6) => {
  // Store in localStorage: `recent_materials_${userId}`
  // Auto-prune old entries (>30 days)
  // Returns: items[], addSelection(), clearHistory()
};
```

### Step 3: Add Favorites Hook

**New file:** `src/hooks/useFavoriteMaterials.ts`

```typescript
export const useFavoriteMaterials = () => {
  // Store in localStorage or user_preferences table
  // Returns: favorites[], toggleFavorite(itemId), isFavorite(itemId)
};
```

### Step 4: Update InventorySelectionPanel

**Modified file:** `src/components/inventory/InventorySelectionPanel.tsx`

Changes:
1. Add optional `WorksheetBrandSidebar` on the left
2. Add "Recent Selections" horizontal scroll section at top
3. Add star button to each card for favorites
4. Consolidate Price Group into dropdown
5. Move QR/Manual Entry into a "+" dropdown menu

### Step 5: Add Smart Treatment Defaults

**Modified file:** `src/components/inventory/InventorySelectionPanel.tsx`

Auto-apply filters based on `treatmentCategory`:
- Sort wide fabrics first for curtains
- Pre-filter by relevant tags
- Show "Recommended for [Treatment]" label

---

## Files to Create/Modify

| File | Change |
|------|--------|
| `src/components/inventory/WorksheetBrandSidebar.tsx` | **New** - Compact brand navigation for worksheet |
| `src/hooks/useRecentMaterialSelections.ts` | **New** - Track recently selected materials |
| `src/hooks/useFavoriteMaterials.ts` | **New** - Manage favorite/pinned materials |
| `src/components/inventory/InventorySelectionPanel.tsx` | **Modify** - Add sidebar, recents, favorites |
| `src/components/inventory/RecentSelectionsRow.tsx` | **New** - Horizontal scroll of recent picks |
| `src/components/inventory/FavoriteButton.tsx` | **New** - Star toggle for cards |

---

## Visual Comparison

**Before (Current):**
```text
┌─────────────────────────────────────────────────────────────┐
│ [Search...]                                    [Filters ▼]  │
│ Price: [All (59)] [1 (12)] [2 (18)] [3 (7)] [4 (8)] [...]  │
│ Type: [Wide (300cm+)]                                       │
│ [Scan QR] [Manual Entry]                                    │
├─────────────────────────────────────────────────────────────┤
│ ┌───────┐ ┌───────┐ ┌───────┐ ┌───────┐                    │
│ │ 1234rt│ │ 1234rt│ │ ADARA │ │ ADARA │                    │
│ │       │ │       │ │       │ │       │                    │
│ └───────┘ └───────┘ └───────┘ └───────┘                    │
│ ... 55 more items ...                                       │
└─────────────────────────────────────────────────────────────┘
```

**After (Improved):**
```text
┌─────────────────────────────────────────────────────────────┐
│ [Search...]          [Brand ▼] [Price ▼] [+] [Filters ▼]   │
├───────────┬─────────────────────────────────────────────────┤
│ BRANDS    │ ★ Recently Used                                 │
│           │ ┌───────┐ ┌───────┐ ┌───────┐ ┌───────┐        │
│ ▸ All(59) │ │ ADARA │ │ PRAIA │ │ SUETAS│ │ FLORA │        │
│ ▸ MASLINA │ │ 3h ago│ │ 1d ago│ │ 2d ago│ │ 5d ago│        │
│ ▸ KEEP    │ └───────┘ └───────┘ └───────┘ └───────┘        │
│ ▸ PIRLANT │                                                 │
│ ─────────── │ All Fabrics (filtered by selected brand)       │
│ ★ Recent  │ ┌───────┐ ┌───────┐ ┌───────┐ ┌───────┐        │
│ ★ Favorite│ │ item1 │ │ item2 │ │ item3 │ │ item4 │        │
│           │ │  [★]  │ │  [★]  │ │  [★]  │ │  [★]  │        │
│           │ └───────┘ └───────┘ └───────┘ └───────┘        │
└───────────┴─────────────────────────────────────────────────┘
```

---

## Benefits

1. **Faster navigation** - Sidebar lets users jump between brands instantly
2. **Memory persistence** - Recent selections reduce repeat searching
3. **Personal organization** - Favorites let users curate their go-to materials
4. **Cleaner layout** - Consolidated filters free up vertical space
5. **Smart defaults** - Treatment-aware filtering shows relevant items first
6. **Mobile-friendly** - Sidebar collapses to drawer, recents scroll horizontally

---

## Technical Notes

### Recent Selections Storage

```typescript
// localStorage key: `recent_materials_${userId}`
interface StoredRecents {
  selections: {
    itemId: string;
    name: string;
    imageUrl?: string;
    selectedAt: number;
  }[];
  lastUpdated: number;
}
```

### Favorites Storage Options

**Option A: localStorage** (simpler, no database change)
```typescript
// localStorage key: `favorite_materials_${userId}`
favoriteIds: string[]
```

**Option B: Database** (syncs across devices)
```sql
-- Add to user_preferences JSONB
UPDATE user_preferences SET 
  data = jsonb_set(data, '{favorite_materials}', '["id1", "id2"]')
WHERE user_id = $1;
```

Recommend **Option A** for initial implementation (faster, no migration needed).

---

## Mobile Considerations

1. **Sidebar becomes sheet** - Bottom drawer with brand list
2. **Recent row scrolls horizontally** - Touch-friendly swipe
3. **Favorite stars are larger** - 44px touch targets
4. **Filters collapse to single button** - Opens full-screen filter sheet

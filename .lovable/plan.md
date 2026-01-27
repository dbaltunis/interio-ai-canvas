
# Two-Level Brand/Collection Sidebar for Library

## Overview

Transform the Library's Collections view into a **two-level sidebar navigation** where:
- **Left sidebar**: Shows Brands (vendors) as expandable folders
- **Right panel**: Shows Collections grid when a brand is selected
- **Auto-linking**: Migrate orphan collections to auto-created vendors based on supplier names

This mirrors how professional interior design libraries work (e.g., Romo Group → Kirkby Design, Black Edition, Romo, etc.).

---

## Visual Layout

```text
┌─────────────────────────────────────────────────────────────────────┐
│  Library                                                  [Search]  │
├──────────────┬──────────────────────────────────────────────────────┤
│ BRANDS       │  MASLINA Collections (90)                           │
│              │  ┌─────────────────┐ ┌─────────────────┐             │
│ ▼ MASLINA(90)│  │ LUX SATEN      │ │ PRAIA           │             │
│   ▼ KEEP (64)│  │ 45 items       │ │ 32 items        │             │
│   ▼ PIRLANTO │  │ [Edit] [View]  │ │ [Edit] [View]   │             │
│   ▼ AVSIN    │  └─────────────────┘ └─────────────────┘             │
│   ▼ BRODE    │  ┌─────────────────┐ ┌─────────────────┐             │
│   ▼ MIR      │  │ SUETAS         │ │ TT4F045VELOUR   │             │
│   ▼ NEUTEX   │  │ 28 items       │ │ 15 items        │             │
│   ...        │  └─────────────────┘ └─────────────────┘             │
│              │                                                      │
│ + Add Brand  │  [Load More Collections...]                         │
└──────────────┴──────────────────────────────────────────────────────┘
```

---

## Implementation Steps

### Step 1: Database Migration - Auto-Link Orphan Collections

Create vendors from orphan supplier names and link collections to them:

**SQL Migration:**
```sql
-- 1. Create vendors for each unique orphan supplier (about 25 new vendors)
INSERT INTO vendors (user_id, name, active, company_type)
SELECT DISTINCT 
  c.user_id,
  INITCAP(orphan_supplier.supplier) as name,
  true,
  'supplier'
FROM collections c
CROSS JOIN LATERAL (
  SELECT DISTINCT supplier 
  FROM enhanced_inventory_items 
  WHERE collection_id = c.id 
  AND supplier IS NOT NULL
  LIMIT 1
) orphan_supplier
WHERE c.vendor_id IS NULL
  AND orphan_supplier.supplier IS NOT NULL
  AND NOT EXISTS (
    SELECT 1 FROM vendors v 
    WHERE LOWER(v.name) = LOWER(orphan_supplier.supplier)
    AND v.user_id = c.user_id
  )
ON CONFLICT DO NOTHING;

-- 2. Link orphan collections to their newly created vendors
UPDATE collections c
SET vendor_id = v.id
FROM vendors v
WHERE c.vendor_id IS NULL
  AND c.user_id = v.user_id
  AND LOWER(v.name) = LOWER(
    (SELECT DISTINCT supplier 
     FROM enhanced_inventory_items 
     WHERE collection_id = c.id 
     AND supplier IS NOT NULL 
     LIMIT 1)
  );
```

**Impact**: ~433 orphan collections will be linked to ~25 new vendors (MASLINA, KEEP, PIRLANTO, etc.)

---

### Step 2: Create BrandCollectionsSidebar Component

**New file:** `src/components/library/BrandCollectionsSidebar.tsx`

Features:
- Collapsible sidebar showing all brands (vendors with collections)
- Search filter for brands
- Badge showing collection count per brand
- Click to select brand and show its collections
- "Unassigned" folder for any remaining orphans
- Add Brand button to create new vendors

---

### Step 3: Update CollectionsView with Split Layout

**Modified file:** `src/components/library/CollectionsView.tsx`

Transform from a flat grid to a split-pane layout:
- Left: BrandCollectionsSidebar (280px width, collapsible)
- Right: Collections grid (existing card layout, filtered by selected brand)

```typescript
<div className="flex h-full">
  <BrandCollectionsSidebar 
    selectedBrand={selectedBrand}
    onSelectBrand={setSelectedBrand}
    className="w-72 border-r shrink-0"
  />
  <div className="flex-1 p-4">
    {/* Existing collections grid, filtered by selectedBrand */}
  </div>
</div>
```

---

### Step 4: Add Hooks for Brand-Grouped Collections

**New hook:** `useCollectionsByBrand()` in `src/hooks/useCollections.ts`

Returns collections grouped by vendor with counts:
```typescript
interface BrandWithCollections {
  vendor: Vendor | null; // null = Unassigned
  collections: Collection[];
  totalItems: number;
}
```

---

### Step 5: Move Collections Tab Higher

**Modified file:** `src/components/inventory/ModernInventoryDashboard.tsx`

Reorder tabs to make Collections more prominent:
1. Collections (was 5th, now 1st)
2. Fabrics
3. Materials
4. Hardware
5. Wallcoverings
6. Vendors (admin only)

---

## Files to Create/Modify

| File | Change |
|------|--------|
| `src/components/library/BrandCollectionsSidebar.tsx` | **New** - Sidebar component with expandable brand list |
| `src/components/library/CollectionsView.tsx` | **Modify** - Add split-pane layout with sidebar |
| `src/hooks/useCollections.ts` | **Modify** - Add `useVendorsWithCollections` hook |
| `src/components/inventory/ModernInventoryDashboard.tsx` | **Modify** - Reorder tabs, Collections first |
| Database migration | **New** - Auto-create vendors and link orphan collections |

---

## Technical Details

### Vendor Creation Rules
- Create vendors from `UPPER(supplier)` text in orphan collections
- Use `INITCAP()` for proper capitalization (MASLINA → Maslina)
- Set `company_type = 'supplier'` and `active = true`
- Skip if vendor with same name already exists for that user

### UI Behavior
- Sidebar width: 280px (collapsible on mobile)
- Hover on brand shows collection count
- Selected brand highlighted with primary color
- "All Brands" option to show all collections
- Collections inherit current edit/search functionality

### Mobile Considerations
- Sidebar becomes a sheet/drawer on mobile
- Swipe gesture or hamburger to toggle
- Collections grid becomes single-column

---

## Data Impact

For your account (Gustin Decor collections are separate):

| Metric | Before | After |
|--------|--------|-------|
| Orphan collections | 433 | ~50 (those without supplier) |
| Vendors with collections | 1 | ~26 |
| User experience | Flat list, hard to find | Hierarchical, organized by brand |

---

## Testing Checklist

1. **Library → Collections tab**: First in tab order
2. **Sidebar shows brands**: MASLINA (90), KEEP (64), etc.
3. **Click brand**: Right panel shows only that brand's collections
4. **Edit collection**: Works from collection card
5. **Search**: Filters both brands in sidebar and collections
6. **Mobile**: Sidebar becomes drawer, touch-friendly
7. **Other accounts**: No impact on accounts without TWC/fabric imports

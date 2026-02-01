

# Fix: Sidebar Layout Breaking When Opened

## Problem
When the sidebar is open and brands are expanded, the item counts (numbers) get pushed off the visible area or cut off. This happens because:
1. The buttons use `justify-start` which pushes content to the left
2. The count relies on `ml-auto` without proper flex constraints
3. Long brand/collection names expand and push the count off-screen

## Solution
Apply the same pattern that works for collection items to ALL sidebar buttons:
- Use `justify-between` for proper spacing
- Wrap the name in a flex container with `min-w-0 flex-1` (allows truncation)
- Add `shrink-0 tabular-nums` to counts (prevents compression)

---

## Files to Modify

### `src/components/library/BrandCollectionsSidebar.tsx`

**Change 1: "All Collections" button (lines 128-141)**

```tsx
// BEFORE (line 128-141):
<Button
  variant={selectedBrand === null ? "secondary" : "ghost"}
  className={cn(
    "w-full justify-start h-9 px-3 text-sm font-medium",
    selectedBrand === null && "bg-primary/10 text-primary"
  )}
  onClick={() => onSelectBrand(null)}
>
  <FolderOpen className="h-4 w-4 mr-2 shrink-0" />
  All Collections
  <span className="ml-auto text-xs text-muted-foreground">
    {totalCollections}
  </span>
</Button>

// AFTER:
<Button
  variant={selectedBrand === null ? "secondary" : "ghost"}
  className={cn(
    "w-full justify-between h-9 px-3 text-sm font-medium gap-2",
    selectedBrand === null && "bg-primary/10 text-primary"
  )}
  onClick={() => onSelectBrand(null)}
>
  <span className="flex items-center gap-2 min-w-0 flex-1">
    <FolderOpen className="h-4 w-4 shrink-0" />
    <span className="truncate">All Collections</span>
  </span>
  <span className="text-xs text-muted-foreground shrink-0 tabular-nums">
    {totalCollections}
  </span>
</Button>
```

**Change 2: Brand header button (lines 172-185)**

```tsx
// BEFORE (line 172-185):
<Button
  variant={isSelected ? "secondary" : "ghost"}
  className={cn(
    "flex-1 justify-start h-9 px-2 text-sm font-medium",
    isSelected && "bg-primary/10 text-primary"
  )}
  onClick={() => onSelectBrand(brandId)}
>
  <Building2 className="h-3.5 w-3.5 mr-2 shrink-0 text-muted-foreground" />
  <span className="truncate">{brandName}</span>
  <span className="ml-auto text-xs text-muted-foreground shrink-0">
    {collectionCount}
  </span>
</Button>

// AFTER:
<Button
  variant={isSelected ? "secondary" : "ghost"}
  className={cn(
    "flex-1 justify-between h-9 px-2 text-sm font-medium gap-2 min-w-0",
    isSelected && "bg-primary/10 text-primary"
  )}
  onClick={() => onSelectBrand(brandId)}
>
  <span className="flex items-center gap-2 min-w-0 flex-1">
    <Building2 className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
    <span className="truncate">{brandName}</span>
  </span>
  <span className="text-xs text-muted-foreground shrink-0 tabular-nums">
    {collectionCount}
  </span>
</Button>
```

---

## Key CSS Pattern

The consistent pattern for all sidebar items:

```tsx
<Button className="w-full justify-between gap-2">
  {/* Left side: icon + name (allows truncation) */}
  <span className="flex items-center gap-2 min-w-0 flex-1">
    <Icon className="shrink-0" />
    <span className="truncate">{name}</span>
  </span>
  
  {/* Right side: count (never shrinks) */}
  <span className="shrink-0 tabular-nums">
    {count}
  </span>
</Button>
```

- `justify-between`: Pushes count to right edge
- `min-w-0 flex-1`: Allows name container to shrink below content size
- `truncate`: Shows ellipsis when name is too long
- `shrink-0`: Prevents count from being compressed
- `tabular-nums`: Consistent number width for alignment

---

## Also: TWC Color Backfill

Run this in your browser console (while logged in):

```javascript
const { data, error } = await supabase.functions.invoke('twc-update-existing');
console.log('Result:', data, error);
```

This populates missing color, compatible_treatments, and pricing_method for all TWC items.


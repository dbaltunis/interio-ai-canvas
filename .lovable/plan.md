

# TWC Data Enhancement - Primary Color & Source Badge

## Current State

From my analysis:
- **TWC items store colors in `tags[]`** - e.g., `["BLACK", "WHITE", "ANODISED SILVER"]`
- **The `color` field is empty** for TWC items (not being populated during sync)
- **`SupplierBadge` component already exists** with TWC-specific styling
- **Edit dialog has no "Source" indicator** to distinguish TWC-synced items from manually created ones

---

## Implementation Plan

### 1. Add "Source: TWC" Badge to Edit Popup

**File:** `src/components/inventory/UnifiedInventoryDialog.tsx`

Add a TWC source indicator next to the dialog title for items where `supplier === 'TWC'`:

```tsx
// In DialogHeader (around line 499-504):
<DialogHeader>
  <div className="flex items-center gap-2">
    <DialogTitle>
      {mode === "create" ? "Add New Inventory Item" : "Edit Inventory Item"}
    </DialogTitle>
    {mode === "edit" && item?.supplier === 'TWC' && (
      <SupplierBadge supplier="TWC" className="ml-2" />
    )}
  </div>
  <DialogDescription>
    {mode === "create" 
      ? "Add a new product or service to your inventory" 
      : item?.supplier === 'TWC' 
        ? "This item was imported from TWC. Some fields are auto-populated." 
        : "Update inventory item details"}
  </DialogDescription>
</DialogHeader>
```

Import required at top:
```tsx
import { SupplierBadge } from "@/components/ui/SupplierBadge";
```

### 2. Extract Primary Color During TWC Sync

**File:** `supabase/functions/twc-sync-products/index.ts`

Add a function to extract the first valid color as the primary color:

```typescript
// Add helper function (around line 400):
const extractPrimaryColor = (fabricsAndColours: any): string | null => {
  const excludeValues = ['TO CONFIRM', 'TBC', 'N/A', 'UNKNOWN'];
  
  // Handle array of fabricsAndColours
  if (Array.isArray(fabricsAndColours)) {
    for (const item of fabricsAndColours) {
      if (item.fabricOrColourName && !excludeValues.includes(item.fabricOrColourName.toUpperCase())) {
        return item.fabricOrColourName;
      }
    }
  }
  
  // Handle itemMaterials structure
  if (fabricsAndColours?.itemMaterials && Array.isArray(fabricsAndColours.itemMaterials)) {
    for (const material of fabricsAndColours.itemMaterials) {
      if (material.colours && Array.isArray(material.colours)) {
        for (const colour of material.colours) {
          if (colour.colour && !excludeValues.includes(colour.colour.toUpperCase())) {
            return colour.colour;
          }
        }
      }
    }
  }
  
  return null;
};
```

Then use it in the inventory item creation (around line 629):
```typescript
return {
  user_id: user.id,
  name: productName,
  // ... existing fields ...
  color: extractPrimaryColor(product.fabricsAndColours), // ✅ NEW: Set primary color
  // ... rest of fields ...
};
```

### 3. Update Existing TWC Items with Primary Color

**File:** `supabase/functions/twc-update-existing/index.ts`

Add the same `extractPrimaryColor` function and update items that don't have a color set:

```typescript
// Add extractPrimaryColor function (same as above)

// Modify the update logic to include color (around line 145):
const extractedPrimaryColor = extractPrimaryColor(fabricsAndColours);

// In needsUpdate check:
const needsColorFieldUpdate = !item.color && extractedPrimaryColor;

// In updateData building:
if (needsColorFieldUpdate) {
  updateData.color = extractedPrimaryColor;
}
```

---

## Files to Modify

| File | Changes |
|------|---------|
| `src/components/inventory/UnifiedInventoryDialog.tsx` | Import `SupplierBadge`, add TWC badge to DialogHeader, update description text |
| `supabase/functions/twc-sync-products/index.ts` | Add `extractPrimaryColor()` function, use in inventory item creation |
| `supabase/functions/twc-update-existing/index.ts` | Add `extractPrimaryColor()` function, populate `color` field for existing items |

---

## Testing Checklist

### Edit Dialog Source Badge
- [ ] Open edit dialog for a TWC item
- [ ] Verify "TWC" badge appears next to title
- [ ] Verify description says "This item was imported from TWC..."
- [ ] Open edit dialog for a non-TWC item
- [ ] Verify no badge appears and normal description shows

### Primary Color Field
- [ ] Run `twc-update-existing` endpoint
- [ ] Check database: TWC items should have `color` populated with first valid color
- [ ] Open edit dialog for TWC item
- [ ] Verify Color dropdown shows the auto-selected color

### Future Syncs
- [ ] Import a new TWC product
- [ ] Verify `color` field is populated automatically

---

## Impact

| Feature | Benefit |
|---------|---------|
| **Source Badge** | Users instantly know which items are TWC-synced vs manual |
| **Primary Color** | Color dropdown is pre-populated, reducing manual data entry |
| **Updated Description** | Sets expectation that TWC items have auto-populated fields |

---

## Technical Notes

### Color Extraction Logic

TWC API provides colors in two formats:
1. **Simple array:** `fabricsAndColours: [{ fabricOrColourName: "BLACK" }]`
2. **Nested materials:** `fabricsAndColours: { itemMaterials: [{ colours: [{ colour: "WHITE" }] }] }`

The `extractPrimaryColor` function handles both formats and excludes placeholder values like "TO CONFIRM".

### Why Not Store All Colors in `color` Field?

The `color` field is designed for a single primary color (dropdown selection). All colors remain in `tags[]` for full searchability and display.


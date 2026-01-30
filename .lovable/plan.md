

# Hardware Pricing + Data Quality + TWC Images - Complete Fix

## Issues Identified

| Issue | Location | Root Cause | Solution |
|-------|----------|------------|----------|
| **Hardware shows £0 price** | `HardwareInventoryView.tsx` | Not using `PricingCell` component - uses hardcoded `formatPrice(item.selling_price)` | Replace with `<PricingCell item={item} />` |
| **Tags show as color names** | TWC sync stores colors as tags | This is **correct behavior** - colors ARE the tags for TWC items | No change needed - this is intentional |
| **Description auto-generated** | TWC sync | Format: "Material: X \| Colors: Y, Z" | Can enhance to use TWC's `twc_description` from metadata |
| **Edit popup empty treatments** | Already fixed in previous plan | Hardware shows "Works with all treatments" message | Already implemented ✅ |
| **TWC Images** | TWC API | **TWC API does not provide product images** | ❌ Cannot sync - must be manually uploaded |

---

## Key Findings

### 1. Hardware Price Display (Line 437 in HardwareInventoryView.tsx)

```typescript
// CURRENT CODE - Shows £0.00 for grid-priced items:
<TableCell className="px-2 py-1 text-xs font-medium">
  {formatPrice(item.selling_price || 0)}
</TableCell>

// FIX - Use PricingCell component:
<TableCell className="px-2 py-1 text-xs font-medium">
  <PricingCell item={item} />
</TableCell>
```

Same issue at lines 307-311 (grid view):
```typescript
// CURRENT:
<span className="font-bold text-primary">
  {formatPrice(item.selling_price || 0)}
</span>

// FIX:
<span className="font-bold text-primary">
  <PricingCell item={item} />
</span>
```

### 2. TWC Data is Actually Complete

From database query, TWC hardware items have:
- ✅ `tags`: `["BLACK", "WHITE", "ANODISED SILVER", "TO CONFIRM"]` - **Colors stored as tags**
- ✅ `description`: `"Curtain Tracks - Designer - Imported from TWC"`
- ✅ `price_group`: `"3"` - **Correct for PricingCell to show "Group 3"**
- ✅ `pricing_method`: `"pricing_grid"` - **Already set correctly**
- ✅ `metadata.twc_fabrics_and_colours` - **Full color data preserved**
- ❌ `image_url`: `null` - **TWC API doesn't provide images**

### 3. TWC API Does Not Provide Images

Looking at the TWC API structure:
```typescript
interface TWCProduct {
  itemNumber: string;
  description: string;
  productType?: string;
  questions?: TWCQuestion[];
  fabricsAndColours?: TWCFabricColor[];
  // NO image field!
}
```

The `GetOrderOptions` endpoint only returns product configuration data - **no images are available from TWC**.

### 4. What the Edit Popup Shows

The data IS being loaded correctly in `UnifiedInventoryDialog`:
- `tags` loads from `item.tags` (which contains color names)
- `description` loads from `item.description`
- `color` field is separate and may be empty

The "messy" appearance is because:
1. Colors appear in both tags array AND in description text
2. No primary color selected (dropdown empty)
3. Treatment tab now shows hardware message ✅

---

## Technical Implementation

### Step 1: Fix HardwareInventoryView.tsx

**Import PricingCell:**
```typescript
import { PricingCell } from "./PricingCell";
```

**Replace price display in grid view (around line 307-311):**
```typescript
<div className="flex justify-between text-sm">
  <span className="text-muted-foreground">Price:</span>
  <PricingCell item={item} className="font-bold text-primary" />
</div>
```

**Replace price display in table view (around line 436-438):**
```typescript
<TableCell className="px-2 py-1 text-xs font-medium">
  <PricingCell item={item} />
</TableCell>
```

### Step 2: Clean Up TWC Description (Optional Enhancement)

Currently descriptions are: `"Curtain Tracks - Designer - Imported from TWC"`

Could be enhanced to use: `metadata.twc_description` directly if available:
- "Curtain Tracks - Designer" (cleaner)

### Step 3: Extract Primary Color from TWC Colors

When syncing, we could set the `color` field to the first non-"TO CONFIRM" color:
```typescript
// In twc-sync-products or twc-update-existing:
const colors = material.colours || [];
const primaryColor = colors.find(c => 
  c.colour && c.colour !== 'TO CONFIRM'
)?.colour || null;

// Add to insert/update:
color: primaryColor,
```

---

## Files to Modify

| File | Changes |
|------|---------|
| `src/components/inventory/HardwareInventoryView.tsx` | Import `PricingCell`, replace 2 price displays |

---

## Answer to Your Questions

### 1. Hardware 0 Price
**Fixed by using PricingCell** - will show "Group 3" badge instead of £0.00

### 2. Tags, Descriptions, Colors Setup
- **Tags** = Colors from TWC (correct behavior)
- **Description** = Auto-generated summary (correct behavior)
- **Color dropdown** = Can be auto-populated from first valid TWC color

### 3. TWC Image Sync
**Not possible** - TWC API only provides:
- Product names and item numbers
- Configuration questions (Control Type, Fixing, etc.)
- Fabric/color options with pricing groups

**No image URLs are returned.** Users must manually upload product images.

---

## Testing Checklist

### Hardware Price Display
- [ ] Navigate to Library → Hardware
- [ ] Verify grid-priced items show "Group X" badge (not £0.00)
- [ ] Test both grid view and list view

### Edit Popup Verification
- [ ] Click Edit on a TWC hardware item
- [ ] Tags tab should show color badges (BLACK, WHITE, etc.)
- [ ] Treatments tab should show "Hardware works with all treatments" message
- [ ] Description should show auto-generated summary

---

## Summary

| Issue | Status | Action |
|-------|--------|--------|
| Hardware £0 price | 🔧 To Fix | Use `PricingCell` in HardwareInventoryView |
| Tags display | ✅ Correct | Colors ARE the tags - intentional |
| Description display | ✅ Correct | Auto-generated from TWC data |
| Treatment checkboxes | ✅ Fixed | Shows info message for hardware |
| TWC image sync | ❌ Not Possible | TWC API doesn't provide images |




# Complete TWC Data Quality & UI Fix Plan

## Executive Summary

I've identified the remaining issues with TWC data quality and the edit popup display. Here's the complete fix:

| Issue | Root Cause | Solution |
|-------|------------|----------|
| 8 items still missing treatments | `track` subcategory not in mapping | Add hardware subcategories + run migration |
| Edit popup shows "empty" treatments | Hardware items don't need treatments | Add conditional display for hardware |
| Existing TWC users not updated | No bulk update mechanism | Create `twc-bulk-data-fix` edge function |
| Price display in Library | Already fixed | Just needs preview refresh |

---

## Current State (Verified from Database)

```text
TWC Users & Their Data Quality:
┌───────────────────────────────────────────────────────────────┐
│ User ID                               │ Total │ Missing      │
│ f740ef45-279c-44e8-bf07-1a7eefca8149  │  199  │ 3 treatments │
│ b0c727dd-b9bf-4470-840d-1f630e8f2b26  │  281  │ 3 treatments │
│ ec930f73-ef23-4430-921f-1b401859825d  │  267  │ 1 treatments │
│ 1bbd8c29-f892-417e-ae5c-48d2147cb6fa  │  278  │ 1 treatments │
└───────────────────────────────────────────────────────────────┘

Missing items are ALL subcategory='track' (hardware items)
```

---

## Technical Implementation

### 1. Database Migration - Fix Remaining Track Items

Fix the 8 `track` subcategory items by setting their compatible_treatments to an empty array marker (hardware is treatment-agnostic):

```sql
-- Track/hardware items work with ALL treatment types
-- Set to empty array with explicit marker in metadata
UPDATE enhanced_inventory_items
SET 
  compatible_treatments = ARRAY['curtains', 'roman_blinds', 'roller_blinds', 
    'venetian_blinds', 'vertical_blinds', 'panel_glide'],
  metadata = jsonb_set(
    COALESCE(metadata, '{}'), 
    '{is_hardware}', 
    'true'
  )
WHERE subcategory = 'track' 
  AND supplier = 'TWC'
  AND (compatible_treatments IS NULL OR compatible_treatments = '{}');
```

### 2. Update TWC Sync Function - Add Hardware Subcategory Mappings

**File:** `supabase/functions/twc-sync-products/index.ts`

Add hardware subcategories to `getCompatibleTreatmentsForSubcategory`:

```typescript
const getCompatibleTreatmentsForSubcategory = (subcategory: string): string[] => {
  const SUBCATEGORY_TO_TREATMENTS: Record<string, string[]> = {
    // ... existing mappings ...
    
    // ✅ NEW: Hardware items are treatment-agnostic (work with all)
    'track': ['curtains', 'roman_blinds', 'roller_blinds', 'venetian_blinds', 
              'vertical_blinds', 'panel_glide'],
    'rod': ['curtains'],
    'motor': ['roller_blinds', 'venetian_blinds', 'vertical_blinds', 
              'curtains', 'roman_blinds', 'panel_glide'],
    'bracket': ['curtains', 'roller_blinds', 'venetian_blinds', 'vertical_blinds'],
    'accessory': [], // Generic - no specific treatments
  };
  
  return SUBCATEGORY_TO_TREATMENTS[subcategory] || [];
};
```

### 3. Create Bulk Update Edge Function for ALL Users

**File:** `supabase/functions/twc-bulk-data-fix/index.ts` (NEW)

This function will:
1. Run with service role (admin only)
2. Update ALL TWC items across ALL users
3. Set `compatible_treatments` and `pricing_method` based on subcategory

```typescript
// Key logic:
for (const item of twcItems) {
  const treatments = getCompatibleTreatmentsForSubcategory(item.subcategory);
  const pricingMethod = getPricingMethodForCategory(item.subcategory);
  
  // Only update if missing
  if (!item.compatible_treatments?.length || !item.pricing_method) {
    await supabase.from('enhanced_inventory_items')
      .update({ 
        compatible_treatments: treatments,
        pricing_method: pricingMethod
      })
      .eq('id', item.id);
  }
}
```

### 4. Update Edit Dialog - Smart Hardware Detection

**File:** `src/components/inventory/CompatibleTreatmentsSelector.tsx`

For hardware items (`category === 'hardware'`), show an informational message instead of empty checkboxes:

```tsx
// If hardware category, show informational message
if (productType === 'hardware' || category === 'hardware') {
  return (
    <Card>
      <CardContent className="py-4">
        <Alert className="border-blue-200 bg-blue-50">
          <Info className="h-4 w-4 text-blue-600" />
          <AlertDescription>
            Hardware items work with all treatment types automatically.
            No specific treatment selection is needed.
          </AlertDescription>
        </Alert>
      </CardContent>
    </Card>
  );
}
```

### 5. Update twc-update-existing Function

**File:** `supabase/functions/twc-update-existing/index.ts`

Enhance to also populate `compatible_treatments` and `pricing_method`:

```typescript
// Add to update logic:
const getCompatibleTreatmentsForSubcategory = (subcategory: string): string[] => {
  // Same mapping as twc-sync-products
};

const getPricingMethodForCategory = (subcategory: string): string => {
  // Same logic as twc-sync-products
};

// In update loop:
for (const item of twcItems) {
  const needsUpdate = 
    !item.compatible_treatments?.length || 
    !item.pricing_method ||
    needsColorUpdate;
    
  if (needsUpdate) {
    await supabase.from('enhanced_inventory_items')
      .update({
        tags: mergedTags,
        compatible_treatments: getCompatibleTreatmentsForSubcategory(item.subcategory),
        pricing_method: getPricingMethodForCategory(item.subcategory)
      })
      .eq('id', item.id);
  }
}
```

---

## Files to Modify

| File | Changes |
|------|---------|
| Database migration | Fix 8 remaining `track` items |
| `supabase/functions/twc-sync-products/index.ts` | Add hardware subcategory mappings |
| `supabase/functions/twc-update-existing/index.ts` | Add `compatible_treatments` + `pricing_method` update |
| `src/components/inventory/CompatibleTreatmentsSelector.tsx` | Add hardware-specific UI message |

---

## Testing Checklist

### Library Price Display
- [ ] Navigate to Library → Fabrics
- [ ] Verify grid-priced items show "Group X" badge
- [ ] Verify linear-priced items show correct suffix

### Edit Popup - Treatments Tab
- [ ] Click Edit on a TWC fabric item
- [ ] Go to Treatments tab
- [ ] Verify checkboxes are pre-selected (e.g., "Curtains", "Roman Blinds")
- [ ] Click Edit on a TWC hardware/track item
- [ ] Verify informational message instead of empty checkboxes

### Bulk Update
- [ ] (Admin) Call `twc-update-existing` endpoint
- [ ] Verify response shows items updated
- [ ] Check database for populated fields

---

## Impact for ALL Users

After this fix:

1. **All 4 TWC users** will have complete data (1025 items total)
2. **No re-upload required** - bulk update fixes existing data
3. **Future syncs** will auto-populate all fields correctly
4. **Hardware items** show appropriate UI (not empty checkboxes)
5. **Price display** uses dynamic PricingCell component

---

## Memory Note (Prevention Standard)

```markdown
# Memory: twc-complete-data-quality-standard

TWC sync and updates MUST populate these fields for ALL items:
1. compatible_treatments - Based on SUBCATEGORY_TO_TREATMENTS
2. pricing_method - Based on getPricingMethodForCategory
3. price_group - From TWC material data
4. vendor_id - TWC vendor for grid matching
5. collection_id - From collection grouping

HARDWARE ITEMS (track, motor, bracket, accessory):
- Set compatible_treatments to ALL treatment types they support
- Use 'pricing_grid' as default pricing method
- Show informational UI in edit dialog (not empty checkboxes)

BULK UPDATE PATTERN:
- twc-update-existing function can be called to fix existing data
- Uses service role for cross-account updates
- Preserves existing customizations while filling gaps
```


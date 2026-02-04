
# Fix Pricing for Awnings & Norman SmartDrapes (Greg Shave / CCCO)

## Root Cause Identified

The pricing grid resolution in `useFabricEnrichment.ts` has incomplete subcategory-to-product-type mappings:

```typescript
// CURRENT (lines 48-53) - Only handles venetian and roller
const productTypeForGrid = fabricItem.subcategory?.includes('venetian') 
  ? 'venetian_blinds' 
  : fabricItem.subcategory?.includes('roller')
  ? 'roller_blinds'
  : productCategory;  // ← awning_fabric and vertical_fabric fall through here incorrectly
```

**Missing mappings:**
- `awning_fabric` → should map to `awning`
- `vertical_fabric` / `vertical_slats` → should map to `vertical_blinds`

The grids exist in CCCO's account and materials have correct price groups, but the code doesn't map them properly during enrichment.

---

## Fix #1: Update Fabric Enrichment Mapping

**File:** `src/hooks/pricing/useFabricEnrichment.ts`

Replace lines 48-53 with comprehensive mapping:

```typescript
// Map subcategory to product_type for grid lookup
const subcategory = fabricItem.subcategory?.toLowerCase() || '';
let productTypeForGrid = productCategory;

if (subcategory.includes('venetian')) {
  productTypeForGrid = 'venetian_blinds';
} else if (subcategory.includes('roller')) {
  productTypeForGrid = 'roller_blinds';
} else if (subcategory.includes('vertical') || subcategory.includes('smartdrape')) {
  productTypeForGrid = 'vertical_blinds';
} else if (subcategory.includes('awning')) {
  productTypeForGrid = 'awning';
} else if (subcategory.includes('cellular') || subcategory.includes('honeycomb')) {
  productTypeForGrid = 'cellular_blinds';
} else if (subcategory.includes('roman')) {
  productTypeForGrid = 'roman_blinds';
}
```

---

## Fix #2: Update isBlindTreatment Detection

**File:** `src/utils/pricing/calculateTreatmentPricing.ts`

Add missing categories to `isBlindTreatment` check (lines 167-176):

```typescript
const isBlindTreatment = treatmentCategory.includes('blind') || 
                         treatmentCategory === 'shutters' ||
                         treatmentCategory.includes('awning') ||  // ADD
                         treatmentCategory.includes('drape') ||   // ADD (SmartDrape)
                         templateName.includes('blind') ||
                         templateName.includes('roman') ||
                         templateName.includes('roller') ||
                         templateName.includes('venetian') ||
                         templateName.includes('vertical') ||
                         templateName.includes('cellular') ||
                         templateName.includes('honeycomb') ||
                         templateName.includes('shutter') ||
                         templateName.includes('awning') ||       // ADD
                         templateName.includes('smartdrape');     // ADD
```

---

## Verification Data

CCCO account already has:
- **12 awning pricing grids** (AUTO-1, AUTO-2, STRAIGHT-1, ZIP-1, etc.)
- **4 vertical blinds grids** (including Norman 0_LF_AIR)
- **Awning fabrics with matching price groups** (e.g., "Auto - DAYSCREEN 95" → Auto-Budget)
- **Vertical materials with matching price groups** (e.g., "Lakeshore Stripe LF" → 0_LF_AIR)

The data is correct - only the code mapping is missing.

---

## Files to Modify

| File | Change |
|------|--------|
| `src/hooks/pricing/useFabricEnrichment.ts` | Add awning, vertical, smartdrape subcategory mappings |
| `src/utils/pricing/calculateTreatmentPricing.ts` | Add awning/drape to isBlindTreatment detection |

---

## Expected Result

After these fixes:
- Awning fabrics will resolve to awning pricing grids
- Norman SmartDrape materials will resolve to vertical_blinds pricing grids
- Grid prices will calculate correctly for Greg's quotes

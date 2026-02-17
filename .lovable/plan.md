
## Connect Treatment Photos to Quote Document

### Problem
The window card now shows uploaded treatment photos correctly (screenshot 2), but the quote document still displays the old catalog/template image (screenshot 1). This is because `prepareQuoteData.ts` -- which sets the main item-level image for quote rendering -- never checks the `primary_photo_url` field from `windows_summary`.

### Fix

**File:** `src/utils/quotes/prepareQuoteData.ts`

One change needed at line 72 where the product image is resolved:

**Current:**
```
const productImage = materialDetails.image_url || fabricDetails.image_url;
```

**Updated:**
```
const productImage = summary.primary_photo_url || materialDetails.image_url || fabricDetails.image_url;
```

This ensures the user's designated "main" treatment photo takes highest priority for the quote item image. If no custom photo is set, it falls back to the catalog material/fabric image as before.

### Why This Is Sufficient
- `buildClientBreakdown.ts` was already updated in the previous change to prioritize `primary_photo_url` for breakdown sub-rows (template/treatment category)
- `prepareQuoteData.ts` is the file that sets the top-level `image_url` for each quote line item -- this is what appears in the quote document next to the product name (the image shown in screenshot 1)
- The `primary_photo_url` column on `windows_summary` is already being populated by the camera save logic in both `WindowSummaryCard` and `WindowManagementDialog`

### Files Modified
- `src/utils/quotes/prepareQuoteData.ts` -- one line change to image priority

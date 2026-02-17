
## Fix: Display Discount Scope Clearly in Quotes

### Problem
When a user selects "specific items" for a discount, there's no visual indication anywhere in the quote summary or client-facing quote that the discount applies only to certain items. The discount line just says "Discount (10%)" regardless of scope.

### Changes

#### 1. Update discount label in LivePreview (internal quote preview)
**File:** `src/components/settings/templates/visual-editor/LivePreview.tsx`

Update the discount row (line 1785) to include scope context. When scope is `selected_items`, append "(on selected items)" to the label. When scope is `fabrics_only`, append "(on fabrics)".

Current: `Discount (10%): -$50.00`
New: `Discount (10% on selected items): -$50.00`

#### 2. Add `scope` field to DiscountInfo interface in QuoteTemplateHomekaara
**File:** `src/components/quotes/templates/QuoteTemplateHomekaara.tsx`

- Add `scope?: 'all' | 'fabrics_only' | 'selected_items'` to the `DiscountInfo` interface (line 63-67)
- Update the discount row label (line 707) to show scope when it's not "all":
  - `selected_items` -> "Discount (10% on selected items)"
  - `fabrics_only` -> "Discount (10% on fabrics)"
  - `all` or undefined -> "Discount (10%)" (no change)

#### 3. Pass scope through to QuoteTemplateHomekaara
**File:** `src/components/jobs/tabs/QuotationTab.tsx`

The `discount` object already includes `scope` (line 503). Verify that `discountInfo` passed to `QuoteTemplateHomekaara` includes the scope field. If there's a mapping step that drops it, add it back.

#### 4. Update InlineDiscountPanel live preview to show scope
**File:** `src/components/jobs/quotation/InlineDiscountPanel.tsx`

In the "Live Preview" section (lines 302-332), add a small note showing which items the discount applies to when scope is `selected_items`, e.g. "Applied to X of Y items".

### Summary of Label Changes
| Scope | Current Label | New Label |
|---|---|---|
| all | Discount (10%) | Discount (10%) |
| fabrics_only | Discount (10%) | Discount (10% on fabrics) |
| selected_items | Discount (10%) | Discount (10% on selected items) |

### Testing Note
I was unable to log in to the app to test the discount flow end-to-end (authentication returned 400 errors). After implementing, the user should test by:
1. Opening a job with treatments
2. Applying a discount with "Select Specific Items" scope
3. Checking only selected items and clicking "Apply and Save"
4. Verifying the quote preview shows "on selected items" in the discount label
5. Verifying excluded/unchecked items are NOT affected by the discount amount

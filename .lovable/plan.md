
# Add "Edit Quote" Button to QuotationTab

## Problem
The metadata table and introduction message editing was implemented in `BlockRenderer.tsx` and `LivePreview.tsx`, but:
- The QuotationTab (main quote view) renders `LivePreview` with `isPrintMode={true}`, which hides all pencil/edit buttons
- There is no "Edit Quote" button in the QuotationTab toolbar to toggle editing on
- The editing only works in the full-screen QuoteFullScreenView dialog, not in the inline quote preview

## Solution

### 1. Add "Edit Quote" button to QuotationTab toolbar (`src/components/jobs/tabs/QuotationTab.tsx`)

Add a new `Pencil` button in the action buttons row (near Download PDF, Email, Discount, etc.) that toggles a new `isQuoteEditMode` state. This button should only appear when the selected template is a curtain-quote type (`selectedTemplate?.template_style === 'curtain-quote'` or theme is `curtain-professional`).

### 2. Pass `isPrintMode={false}` when editing (`src/components/jobs/tabs/QuotationTab.tsx`)

Currently line 1178 sets `isPrintMode={!isExclusionEditMode}`. Change this to also account for the new edit mode:
```
isPrintMode={!isExclusionEditMode && !isQuoteEditMode}
```

This allows the pencil buttons on the metadata table and introduction message to become visible and clickable.

### 3. No changes needed to BlockRenderer or LivePreview

The `CurtainSplitHeader` and `EditableTextField` components already have the per-quote editing logic (pencil button on hover, save/cancel, database persistence via `useQuoteCustomData`). They just need `isPrintMode={false}` and a valid `quoteId` to activate -- both of which will now be provided when the edit button is toggled on.

## Files to Modify

**`src/components/jobs/tabs/QuotationTab.tsx`**:
- Add `isQuoteEditMode` state (line ~65 area, near other state declarations)
- Add "Edit Quote" button in the action buttons section (around line 880, after the Markup button)
- Update `isPrintMode` prop on `LivePreview` (line 1178) to be `false` when `isQuoteEditMode` is active

## Expected Behavior
1. User sees an "Edit" (pencil icon) button in the QuotationTab toolbar
2. Clicking it enables edit mode -- pencil buttons appear on hover over the metadata table and introduction message
3. User clicks individual pencil buttons to edit specific sections
4. Saving persists to `quotes.template_custom_data` in the database
5. Clicking the edit button again (now showing "Done") exits edit mode

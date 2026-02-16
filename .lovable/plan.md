

# Make Metadata Table and Introduction Message Editable Per-Quote

## What This Does

Enables two sections of the curtain-professional quote to be edited and saved permanently to the database for each individual quote:

1. **Metadata table** (right side of header): Status, Services Required, Purchase Date, Referral Source values
2. **Introduction Message**: The text block below the header

Both sections will show a pencil/edit button on hover. When clicked, the fields become editable. On save, changes persist to the quote's `template_custom_data` JSONB field in the database.

## Technical Changes

### 1. Pass `quoteId` and `onDataChange` to `BlockRenderer.tsx`

Update the `BlockRendererProps` interface to accept `quoteId` and `onDataChange` props. Then update `DocumentHeaderBlock` to use them.

In `LivePreview.tsx`, pass `quoteId` and `onDataChange` when rendering `DocumentHeaderBlock` (lines ~710 and ~724):
```
isEditable={false}  -->  keep false (template editing stays off)
quoteId={quoteId}        // NEW
onDataChange={onDataChange}  // NEW
```

### 2. Add per-quote editing to the metadata table in `BlockRenderer.tsx`

Inside the `curtain-split` header section (around line 597), add inline editing for the custom field values:

- Add local state (`localEditMode`, `fieldValues`) to track editing
- Load saved values from `onDataChange.customData['header-metadata']` on mount
- Show a pencil button on hover (matching the Introduction Message pattern)
- When editing: render `<input>` elements for Status and each custom field value
- On save: call `onDataChange.saveBlockData({ blockId: 'header-metadata', data: fieldValues })`
- Display saved values (from customData) instead of template defaults when available

### 3. Fix Introduction Message visibility

The existing pencil button on `EditableTextField` uses `opacity: 0` with a Tailwind `group-hover:!opacity-100` class. Verify this is working correctly -- the `group` class is on the parent div. If the hover isn't triggering, ensure the parent wrapper has the `group` class applied properly. The save logic already works via `useQuoteCustomData`.

### 4. Ensure `QuoteFullScreenView.tsx` passes `quoteId`

Verify that `QuoteFullScreenView.tsx` passes the `quoteId` prop to `LivePreview` so that the `useQuoteCustomData` hook initializes. This was done in the previous change but needs confirmation that the prop flows all the way down.

## Data Flow

```
QuoteFullScreenView (quoteId)
  -> LivePreview (quoteId, onDataChange = useQuoteCustomData)
    -> LivePreviewBlock (quoteId, onDataChange)
      -> DocumentHeaderBlock (quoteId, onDataChange)  [metadata table]
      -> EditableTextField (quoteId, onDataChange)     [intro message]
```

Both save to `quotes.template_custom_data` JSONB under different block IDs:
- Metadata: `template_custom_data['header-metadata']`
- Intro message: `template_custom_data[blockId]` (already working)

## Files to Modify

1. **`src/components/settings/templates/visual-editor/shared/BlockRenderer.tsx`**
   - Add `quoteId` and `onDataChange` to `BlockRendererProps`
   - Add local edit state and save logic to the `curtain-split` metadata table
   - Show pencil button, editable inputs, and save/cancel buttons

2. **`src/components/settings/templates/visual-editor/LivePreview.tsx`**
   - Pass `quoteId` and `onDataChange` to `DocumentHeaderBlock` calls (2 locations)

3. **`src/components/jobs/quotation/QuoteFullScreenView.tsx`** (verify only)
   - Confirm `quoteId` prop is being passed to `LivePreview`


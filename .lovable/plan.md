
# Refine Curtain Quote Visual Style

## Summary

Five fixes to make the curtain-professional quote feel native and polished: background color on the page layer, full-width blocks, edit button in the job view, larger images with adjusted column widths, and hardware/services separated to the bottom.

## Changes

### 1. Background Color on Page Layer (not block level)

Currently the `#faf6f1` background is applied on the header block itself, creating a "card on white plate" look. Instead:

**File: `LivePreview.tsx` (Editor mode, lines 2284-2295)**
- The A4 page container already reads `docBgColor` from `document-settings` block and applies it to the outer page div. This is correct.
- The issue is that individual blocks (like the header at `BlockRenderer.tsx` line 597) also set their own `backgroundColor: '#faf6f1'`, creating a double background effect.

**File: `BlockRenderer.tsx` (curtain-split layout, line 597)**
- Remove `backgroundColor: '#faf6f1'` from the header block's inline style. The page-level background handles this.

**File: `LivePreview.tsx` (curtain-professional table, line 1119)**
- Remove any explicit background from the products section wrapper -- let the page background show through.

**File: `LivePreview.tsx` (curtain-professional totals, line 1555)**
- Same: remove explicit background, inherit from page.

**File: `LivePreview.tsx` (curtain-footer, line 1964)**
- Same: no explicit background on the footer wrapper.

### 2. Full-Width Blocks (no padding/margin making them look sandwiched)

Currently blocks have padding and margins that create visual gaps between the content and page edges.

**File: `BlockRenderer.tsx` (DocumentHeaderBlock, line 284-290)**
- When `headerLayout === 'curtain-split'`, remove the outer div's `padding: '24px 20px'` and `margin: '0 0 24px 0'`. Instead set `padding: 0` and `margin: 0 0 16px 0` so the header fills edge-to-edge within the page content area.

**File: `LivePreview.tsx` (curtain-professional products, line 1119)**
- Remove `padding: '8px 0'` from the wrapper. Set `margin: 0 0 0 0` so the table extends full width.

**File: `LivePreview.tsx` (curtain-professional totals, line 1555)**
- Remove extra padding so it flows naturally.

**File: `LivePreview.tsx` (editable-text-field, lines 297-301)**
- When rendered within a curtain-professional context, the intro text field should also span full width without rounded corners or background card styling. Update the `EditableTextField` to check for the curtain theme in content/style and render edge-to-edge.

### 3. Missing Edit Button in QuoteFullScreenView

Currently there's no edit button for fields or images when viewing a curtain-quote in the job.

**File: `QuoteFullScreenView.tsx` (lines 181-220)**
- The "Show Images" toggle and "Edit Images" button already exist (lines 196-219) and work correctly.
- Add a new "Edit Fields" toggle/button next to the existing display options. This sets `isEditMode` state (already declared at line 59) and passes it as `isEditable` to `LivePreview`.

**Changes:**
- Add an "Edit Fields" button in the header bar (similar to "Edit Images")
- Pass `isEditMode` as `isEditable` prop to both the visible `LivePreview` (line 306) and the print version
- When `isEditMode` is true, `LivePreview` enables the `EditableTextField` and editable header fields

### 4. Larger Product Images + Adjusted Column Widths

**File: `LivePreview.tsx` (curtain-professional colgroup, lines 1122-1130)**

Current widths:
- Room/Window: `18%` 
- Image: `100px`
- Product Details: `auto`
- Qty: `50px`
- Unit Price: `90px`
- P.Rate: `80px`
- Total: `100px`

New widths:
- Room/Window: `12%` (less space)
- Image: `120px` (bigger)
- Product Details: `auto` (gets more space from room/window reduction)
- Qty: `50px` (same)
- Unit Price: `90px` (same)
- P.Rate: `80px` (same)
- Total: `100px` (same)

Also increase the image size from `80x80` to `100x100` in the product row (line 1184).

### 5. Hardware & Services Separated to Bottom

Currently hardware items and service items (Installation, Measurement) are mixed in with the regular product items per room. They should be separated out and displayed at the bottom of the table, always.

**File: `LivePreview.tsx` (curtain-professional table body, lines 1142-1240)**

Add logic after the main room-grouped items render:
- After rendering all room groups, filter `projectItems` for items that are services (treatment_type contains 'installation', 'measurement', 'service', or category is 'service').
- Also filter for items that are hardware-only (no treatment, hardware category).
- Render a separator row with "Services & Hardware" label.
- Render these service/hardware items in the same table format but visually separated.

Logic:
```
const isServiceItem = (item) => {
  const type = (item.treatment_type || item.name || '').toLowerCase();
  return type.includes('installation') || type.includes('measurement') || 
         type.includes('service') || item.category === 'service';
};
const isHardwareOnlyItem = (item) => {
  return item.category === 'hardware' && !item.treatment_type;
};

// Split items: regular products vs services/hardware
const regularItems = projectItems.filter(i => !isServiceItem(i) && !isHardwareOnlyItem(i));
const serviceItems = projectItems.filter(i => isServiceItem(i) || isHardwareOnlyItem(i));
```

Group `regularItems` by room as before. Then after all rooms, render a "Services" separator row and list `serviceItems` below.

## Files to Modify

| File | Change |
|------|--------|
| `BlockRenderer.tsx` | Remove bg color from curtain-split header; remove padding to go full-width |
| `LivePreview.tsx` | Remove bg/padding from curtain-professional products, totals, footer; adjust column widths; larger images; separate services/hardware to bottom |
| `QuoteFullScreenView.tsx` | Add "Edit Fields" button that enables `isEditable` on LivePreview |

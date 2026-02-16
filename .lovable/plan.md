

# Give "Curtain Quote" a Distinctive Visual Style

## Overview

Add a `theme: 'curtain-professional'` property to the curtain-quote default blocks. The `LivePreview` renderer and `BlockRenderer` will read this theme flag and conditionally render a warm, professional layout matching your reference images -- while all other template types remain completely unchanged.

## Block Structure for Curtain Quote

The curtain-quote will use these specific blocks with the theme flag:

```text
Block 1: document-header (theme: curtain-professional, layout: curtain-split)
  - LEFT: Logo, company details below, then "Prepared For:" client details
  - RIGHT: Table layout with Quote #, Date, Status (editable), plus 1-3 custom fields
    (custom title + input value, configurable in Settings)

Block 2: editable-text-field (intro message, free text)

Block 3: line-items (theme: curtain-professional)
  - Columns: Room/Window | Product Image | Product Details | Qty | Unit Price/Prate | Total
  - Warm brown header bar (#8b7355), white text
  - Room grouping rows with warm gray background
  - Product images in dedicated column

Block 4: totals (theme: curtain-professional)
  - Payment Summary label on left
  - Advance Paid, Total Order Value, Balance Payable on right

Block 5: curtain-footer (new block type)
  - LEFT: Terms & Conditions (from system settings)
  - RIGHT: "View and Accept Quote" button area + company account details

Block 6: signature
```

## Technical Changes

### File 1: `SimpleTemplateManager.tsx`

Update `getBlankTemplateBlocks('curtain-quote')` to return blocks with `theme: 'curtain-professional'` and the new layout structure. Add a `backgroundColor` field so the background color is selectable per template (stored in a `document-settings` block).

### File 2: `BlockRenderer.tsx` (DocumentHeaderBlock)

Add a new layout branch: `layout === 'curtain-split'`:
- Warm cream background (`#faf6f1`)
- Left column: Logo at top, business name + contact below, then "Prepared For:" with client name/email/phone
- Right column: A 2-column table with rows for Quote #, Date, Status (each with label on left, value on right), plus up to 3 custom fields (title: value pairs stored in block content, editable)
- Warm brown text colors (`#8b7355` for labels, `#3d2e1f` for values)

### File 3: `LivePreview.tsx` (Products/Line-Items block)

When `content.theme === 'curtain-professional'`:
- Table header: warm brown background (`#8b7355`), white text
- Columns rearranged: Room/Window (first), Product Image (dedicated column, ~120px), Product Details (title + breakdown as key-value pairs), Qty, Unit Price, Prate, Price
- Room grouping rows: warm beige background with bold room name
- Product detail cell: Title in bold, below it a 2-column mini layout (label: value) for breakdown items
- Table borders: warm gray (`#d4c5b0`)
- Background color selectable from document-settings block

### File 4: `LivePreview.tsx` (Totals block)

When `content.theme === 'curtain-professional'`:
- Full-width layout: "Payment Summary" label on left, totals on right
- Show: Subtotal, Total Order Value (bold), Advance Paid, Balance Payable
- Warm styling with subtle separator line
- Bottom border in warm brown

### File 5: `LivePreview.tsx` (New `curtain-footer` block type)

Add a new case for `curtain-footer`:
- Two-column layout
- Left: Terms and Conditions heading + numbered list from system settings
- Right top: "View and Accept Quote" button (links to quote acceptance -- uses existing payment button infrastructure)
- Right bottom: Company name, contact person, email, phone

### File 6: `LivePreview.tsx` (Document background)

Read the `document-settings` block's `backgroundColor` field and apply it as the page background. This makes the background color selectable -- users can pick warm cream, white, or any color in the template editor.

## What Stays the Same

- All non-curtain-quote templates render exactly as before (no theme flag = no changes)
- Same block editor for managing/reordering blocks
- Same PDF generation and printing pipeline
- Same image upload system
- Same data sources (treatments, rooms, pricing)
- Editable text blocks work the same way

## Files to Modify

| File | Change |
|------|--------|
| `SimpleTemplateManager.tsx` | Update curtain-quote default blocks with theme flags, new block types, backgroundColor in document-settings |
| `BlockRenderer.tsx` | Add `curtain-split` layout branch in DocumentHeaderBlock |
| `LivePreview.tsx` | Add curtain-professional theme in line-items, totals blocks; add `curtain-footer` block type; read backgroundColor from document-settings |


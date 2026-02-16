

# Fix Curtain-Professional Table: Breakdown Items as Proper Table Rows

## Problem

Currently, all breakdown items (fabric, heading, hardware, etc.) are rendered as nested `<div>` elements inside the Product Details `<td>` cell. This causes unit prices and totals to appear squished inside the product details column instead of aligning with the Qty, Unit Price, and Total Price columns.

## Solution

Each breakdown item becomes its own `<tr>` row in the table, so prices land in the correct columns.

### Visual result per window:

```text
Room/Window    | Product Details                   | Qty   | Unit Price | Total Price
---------------|-----------------------------------|-------|------------|------------
Window 1       | NEW CURTAIN                       | 1     | £1,271.12  | £1,271.12
  [image]      |   Fabric:    ADARA - lunar rock   |10.08m | £26.50     | £267.12
               |   Heading:   Pinch pleat          | 1.00  | -          | £0.00
               |   Manufact.: Machine Finished     | 1.00  | -          | £504.00
               |   Services:  Fitting              | 1.00  | -          | £0.00
               |   ── HARDWARE ──────────────────────────────────────────
               |   Motor:     Somfy 360            | 1     | -          | £500.00
               |   Track:     Motorised track      | 1     | -          | £0.00
```

## Technical Changes

### File: `LivePreview.tsx` (lines ~1190-1287)

**1. Main product row** -- Keep Room/Window cell (with image) and Product Details cell showing only the treatment type name (e.g., "NEW CURTAIN"). Qty, Unit Price, and Total Price cells show the top-level item totals. Same as now.

**2. Non-hardware breakdown items** -- Instead of rendering inside the Product Details `<td>`, each breakdown item becomes a new `<tr>`:
- Column 1 (Room/Window): empty
- Column 2 (Product Details): indented label + description (e.g., "Fabric: ADARA - lunar rock 08")
- Column 3 (Qty): breakdown quantity (e.g., "10.08 m") or item quantity
- Column 4 (Unit Price): `b.unit_price` (show "-" if zero or undefined)
- Column 5 (Total Price): `b.total_cost` (always show, even if zero)

**3. Hardware separator row** -- A single `<tr>` with a cell spanning columns 2-5 containing the "HARDWARE" label with a dashed top border.

**4. Hardware breakdown items** -- Same format as non-hardware breakdown rows, appearing after the separator.

**5. Remove the nested div-based price rendering** from inside the Product Details `<td>` entirely.

### Column widths adjustment

Update `<colgroup>` to give more space to Product Details and proper width to price columns:
- Room/Window: 15%
- Product Details: auto
- Qty: 8%
- Unit Price: 13%
- Total Price: 13%


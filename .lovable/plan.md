

# Fix: Service Category and Pricing Unit Display

## What's Wrong Now

The pricing unit ("Per Window") is being injected as a sub-line inside the Description column cell with italic styling. This is wrong because:
- It mixes two different pieces of info in one cell
- It uses a different font style (italic) that doesn't match the document
- It shows even in simple view (gated by `showDetailedProducts` but still in the same cell)

## What You Want

| View Mode | Description Column | Pricing Unit |
|-----------|-------------------|--------------|
| **Simple** | Category only (e.g. "Installation") | Not shown |
| **Detailed** | Category only (e.g. "Installation") | Shown as a separate breakdown row below the main item row, same style as existing breakdown rows |

## How It Will Work

### Column 2 (Description) -- Always shows Category only

The description cell will display only the service category label. No pricing unit, no italic sub-text, no "Custom" fallback. Just the category.

Example: "Installation", "Consultation", "Delivery"

### Detailed View -- Pricing Unit as a breakdown row

When the user clicks "Detailed View", the pricing unit appears as a **separate table row** below the service item -- using the exact same style as existing breakdown rows (indented text, `fontSize: 12px`, `color: #666`, `padding-left: 20px`).

Example in detailed view:

```text
| Installation | Installation | 6 | $50.00 | $300.00 |
|              |   Per Window |   |        |         |  <-- breakdown row, same style as hardware rows
```

## Technical Changes (2 files)

### 1. `LivePreview.tsx` (line 1293-1301)

**Remove** the pricing unit sub-div from the description cell (lines 1297-1301). The description cell goes back to being clean:

```
<td ...>
  {item.description && item.description !== '-' && 
   item.description !== 'Custom' && item.description !== 'custom'
    ? item.description
    : (item.notes || '-')}
</td>
```

**Add** a new breakdown row for pricing unit, rendered after the main item row but before existing breakdown rows. Only shown when `effectiveShowDetailed` is true. Uses the exact same row styling as existing breakdown rows (lines 1319-1330):

```
{effectiveShowDetailed && item.unit && item.unit !== 'each' && item.isRoomProduct && (
  <tr style={{
    backgroundColor: '#fff',
    borderBottom: '1px solid #e8e8e8'
  }}>
    <td style={{ padding: '3px 6px 3px 20px', fontSize: '12px', color: '#666' }}></td>
    <td style={{ padding: '3px 6px', fontSize: '12px', color: '#666' }}>
      {item.unit.replace('per-', 'Per ').replace(/^\w/, c => c.toUpperCase())}
    </td>
    <td colSpan={3}></td>
  </tr>
)}
```

This matches the exact same font size (12px), color (#666), padding pattern as existing hardware breakdown rows -- no italic, no special styling.

### 2. `useQuotationSync.ts` (lines 747-757)

Add a fallback for when `description` is null in the database (services added before the category-storage fix). Look up the service's category from `service_options` by matching the product name:

```
if (product.description && product.description !== 'Custom' && product.description !== 'custom') {
  displayDescription = product.description;
} else if (isCustom) {
  // Fallback: find matching service option by name, use its category label
  const matchingService = serviceOptions?.find(s => s.name === product.name);
  if (matchingService?.category) {
    const label = SERVICE_CATEGORIES.find(c => c.value === matchingService.category)?.label;
    displayDescription = label || '';
  }
}
```

This requires importing `SERVICE_CATEGORIES` from `useServiceOptions` and passing `serviceOptions` data into the processing function (it may already be available in the hook's scope).

## What Stays the Same

- All other columns (Product/Service, Qty, Unit Price, Total) unchanged
- Font styles throughout the document unchanged
- Hardware breakdown rows unchanged
- Simple view shows no pricing unit at all
- No new columns added

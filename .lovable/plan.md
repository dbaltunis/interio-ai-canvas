

# Fix: Center Document Content in App Preview (Cosmetic Only)

## The Problem

The document looks visually off-center in the app preview -- the left side has less space than the right side. This is because the LivePreview's "print mode" wrapper (used in the QuotationTab and Workroom) sets `width: '90%'` with no centering, so the remaining 10% gap all appears on the right.

## The Fix

A single-line cosmetic change in `LivePreview.tsx` -- add `margin: '0 auto'` to center the 90%-width content wrapper within the A4 container. This only affects the in-app visual rendering.

## Why This is Safe

- The `width: '90%'` wrapper is only the in-app display container
- PDF generation uses `PrintableQuote` / `PrintableWorkshop` components which render separately (hidden div with their own ref)
- The `html2pdf` library captures the element by ID from the **hidden** printable component, not from this visual preview
- Print CSS (`@media print`) has its own rules that override this
- No changes to `PrintableQuote.tsx`, `PrintableWorkshop.tsx`, or `generateQuotePDF.ts`

## Technical Change

### File: `src/components/settings/templates/visual-editor/LivePreview.tsx`

**Line 2341-2348** -- In the print mode render branch, center the content wrapper:

```
// Before:
<div style={{
  backgroundColor: docBgColor || '#ffffff',
  color: '#000000 !important',
  padding: 0,
  margin: 0,
  width: '90%'
}}>

// After:
<div style={{
  backgroundColor: docBgColor || '#ffffff',
  color: '#000000 !important',
  padding: 0,
  margin: '0 auto',
  width: '90%'
}}>
```

That is the only change. One property: `margin: 0` becomes `margin: '0 auto'`. The content stays 90% wide (maintaining the document-settings margins feel), but now sits centered within the A4 container -- equal space on both sides.

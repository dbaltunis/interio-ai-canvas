
# Fix: Restore Document Preview Scaling and Fill Cream Background

## What went wrong
The last change removed the fixed A4 width and scaling, making the document stretch across the full app width. That's not what you want.

## What you actually want
- Restore the original A4-sized, centered, scaled document preview (the white container with shadow)
- The cream/beige background (from the template's document-settings backgroundColor) should fill the entire white document container edge-to-edge, with no white gaps inside it

## Changes

### File: `src/components/jobs/tabs/QuotationTab.tsx` (lines 1161-1171)

**Revert** the last diff — bring back the centered layout with scaling:

```tsx
<div className="w-full flex justify-center items-start bg-gradient-to-br from-muted/30 to-muted/50 dark:from-background dark:to-card/20 px-4 py-2 rounded-lg border border-border/40">
  <div className="transform scale-[0.52] sm:scale-[0.72] md:scale-[0.85] lg:scale-[0.95] xl:scale-[1.0] origin-top shadow-2xl dark:shadow-xl mx-auto">
    <div id="quote-live-preview" className="quote-preview-container bg-document text-document-foreground" style={{
      width: '210mm',
      minHeight: '297mm',
      fontFamily: 'Arial, Helvetica, sans-serif',
      fontSize: '10pt',
      padding: '0',
      boxSizing: 'border-box',
      overflow: 'hidden'
    }}>
```

Key difference from the original: set `padding: '0'` on the outer `#quote-live-preview` div. The padding is already handled by the document-settings block margins inside LivePreview, so removing it here prevents double-padding and lets the cream background fill edge-to-edge within the white A4 container.

This way:
- The **white container** = the outer gradient wrapper (the section background)
- The **cream document** = fills the entire A4-sized `#quote-live-preview` div with no white gaps inside it
- Scaling and centering remain intact for a proper document preview feel

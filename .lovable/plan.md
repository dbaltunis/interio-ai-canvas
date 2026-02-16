

# Fix: Revert Print Impact and Apply Screen-Only Centering

## The Problem

The previous change (`margin: '0 auto'`) was applied inside `LivePreview.tsx`'s print-mode branch, which is shared by both:
1. The in-app visual preview (what you see on screen)
2. The `PrintableQuote` / `PrintableWorkshop` components (used for PDF generation and printing)

This caused the printed/saved document to also shift, which is not what we want.

## The Solution

Revert the `margin: '0 auto'` back to `margin: 0` inside `LivePreview.tsx`, and instead apply centering as a **screen-only CSS wrapper** in the parent components that display the preview on screen. This way:

- **On screen**: the wrapper centers the document visually (the "mask")
- **When printing/saving PDF**: the `PrintableQuote` component renders separately (in a hidden div) and is completely unaffected

## Technical Changes

### 1. Revert `LivePreview.tsx` (line 2346)

Change `margin: '0 auto'` back to `margin: 0`. This restores the original behavior for all consumers of LivePreview, including the printable components.

### 2. Add screen-only centering in `QuotationTab.tsx`

Wrap the visible LivePreview (the one users see in the app) with a div that has a CSS class applying `margin: 0 auto` only under `@media screen`. This wrapper only exists around the **on-screen preview**, not around the hidden `PrintableQuote` used for PDF/print.

### 3. Add CSS rule to `index.css`

```css
@media screen {
  .document-preview-center > div {
    margin: 0 auto !important;
  }
}
```

This ensures the centering is purely cosmetic and only applies when viewing on screen -- never during print or PDF capture.

### 4. Apply the same wrapper in other preview locations

- `QuoteFullScreenView.tsx` (the full-screen quote preview)
- `DocumentRenderer.tsx` (workroom document preview)

These are the components where users see the document in the app. The hidden printable components (`PrintableQuote`, `PrintableWorkshop`, `PrintableWorkOrder`) remain completely untouched.

## Why This is Safe

- The `PrintableQuote` component renders in a hidden div (`position: absolute; left: -9999px`) and is captured by `html2pdf.js` -- it never gets the screen-only CSS
- `@media screen` rules are completely ignored during `window.print()` and PDF generation
- The centering class is only added to the visible preview wrappers, not to any printable component
- Zero risk to PDF output, email attachments, or printed documents


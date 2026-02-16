
# Fix: Remove White Frame Causing Page Break Issues

## Problem
The document has a white border/frame around the cream content because:
1. LivePreview's print mode renders content at `width: 90%` instead of `100%`, leaving white gaps on the sides
2. The document-settings margins (8mm top/right/bottom/left) add additional padding that wastes vertical space, pushing content to overflow onto a second page

## Solution
Reduce/remove the internal frame so content fills the full A4 area edge-to-edge, leaving more vertical space and reducing page breaks.

## Changes

### File: `src/components/settings/templates/visual-editor/LivePreview.tsx`

**Line 2347** -- Change `width: '90%'` to `width: '100%'` in the print mode wrapper. This removes the white side gaps.

### File: `src/components/jobs/quotation/PrintableQuote.tsx`

Reduce the document-settings margins to bare minimum defaults:
- Change default `marginTop` from `8` to `2`
- Change default `marginRight` from `8` to `4`  
- Change default `marginBottom` from `6` to `2`
- Change default `marginLeft` from `8` to `4`

This keeps a tiny margin for visual breathing room but dramatically reduces the white frame, giving more usable space on each page.

### Result
- Cream background fills the A4 container fully (no white side gaps)
- Minimal margins mean more content fits per page
- Less chance of content breaking across pages



# Add "Curtain Quote" as a Template Type + Remove Global Override

## Summary

Convert the Homekaara "Professional Curtains Quote" from a global override into a regular template type called **"Curtain Quote"** that lives alongside Quote, Invoice, Estimate, and Proposal. Everything uses the same block-based `LivePreview` engine -- same editing, same PDF, same printing. The visual style differences are encoded in the template's default blocks, not in a separate component.

## What Changes

### 1. Remove the Global Style Selector (Settings page)

**File:** `src/components/settings/tabs/DocumentTemplatesTab.tsx`

Remove the `QuoteTemplateStyleSelector` component import and rendering, and remove the `<Separator>` below it. The two-card selector ("Default" vs "Professional Curtains Quote") goes away entirely. Template style is now per-template, not global.

### 2. Add "Curtain Quote" as a Document Type

**File:** `src/components/settings/templates/SimpleTemplateManager.tsx`

- Add `<SelectItem value="curtain-quote">Curtain Quote</SelectItem>` to:
  - The **Create Template** dialog dropdown (line 775-779)
  - The **Filter** dropdown (line 680-686)
- Add curtain-quote color in `getCategoryColor`: e.g. `'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400'`
- Update `getBlankTemplateBlocks('curtain-quote')` to return blocks with:
  - `document-header` with `showLogo: true`
  - `client-info`
  - `line-items` (or `products`) block with `showImages: true`, `groupByRoom: true`, `layout: 'detailed'` as defaults
  - `totals`
  - `signature`

This means when a user creates a "Curtain Quote" template, it comes pre-configured with images ON and room grouping ON -- the features that make it special. But it's still the same block-based editor; users can customize everything.

### 3. Remove Homekaara Override in QuotationTab

**File:** `src/components/jobs/tabs/QuotationTab.tsx`

- Remove the `useHomekaaraTemplate` flag (line 353) and all Homekaara-specific logic:
  - Remove `isHomekaaraEditable` state (line 130)
  - Remove `homekaaraTemplateData` useMemo (lines 521-601)
  - Remove `handleHomekaaraSave` function (lines 666-708)
  - Remove `handleHomekaaraImageUpload` function (lines 711-743)
  - Remove the `QuoteTemplateHomekaara` import (line 45)
  - Remove the Homekaara conditional branch in the render (lines 1337-1369) -- all templates now go through the `LivePreview` path
  - Remove Edit Mode toggle for Homekaara in the display options

All templates -- including curtain-quote type -- render through `LivePreview` with existing image upload, editing, and PDF features.

### 4. Remove Homekaara Override in QuoteFullScreenView

**File:** `src/components/jobs/quotation/QuoteFullScreenView.tsx`

- Remove `QuoteTemplateHomekaara` import (line 15)
- Remove `useQuoteTemplateData` import (line 16)
- Remove `useHomekaaraTemplate` flag (line 128) and all Homekaara-specific data transforms (lines 172-250)
- Remove the Homekaara conditional in the visible content area (lines 403-434) -- use `LivePreview` for all
- Remove the Homekaara conditional in the print area (lines 461-474) -- use `LivePreview` for all
- Remove the Homekaara-only "Edit Mode" toggle (lines 303-316)
- Keep: Show Images toggle, Detailed View toggle, Edit Images button -- these already work with `LivePreview` for all template types

### 5. Image Upload Support (Already Built)

The existing `LivePreview` already supports:
- `showImages` toggle in display options
- `isImageEditMode` with `onItemImageChange` callback in `QuoteFullScreenView`
- Image upload to `treatment-images` storage bucket
- Per-item image override via `product_details.image_url_override`

For curtain-quote templates, `showImages` defaults to `true` in the blank template blocks, so images are visible out of the box. Users can still toggle it on/off.

### 6. Editing Support (Already Built)

The block-based editor in `SimpleTemplateManager` already handles all template types. When a user clicks "Edit" on a curtain-quote template, the same `LivePreview` editor opens with `isEditable={true}`. Users can:
- Rearrange blocks
- Change block content
- Toggle settings per block (images, room grouping, detailed breakdown)

No new editing infrastructure needed.

## Files to Modify

| File | Change |
|------|--------|
| `src/components/settings/tabs/DocumentTemplatesTab.tsx` | Remove `QuoteTemplateStyleSelector` + separator |
| `src/components/settings/templates/SimpleTemplateManager.tsx` | Add "Curtain Quote" type to create dialog, filter, colors, default blocks |
| `src/components/jobs/tabs/QuotationTab.tsx` | Remove all Homekaara override logic; all templates use LivePreview |
| `src/components/jobs/quotation/QuoteFullScreenView.tsx` | Remove all Homekaara override logic; all templates use LivePreview |

## Files NOT Modified

- `LivePreview.tsx` -- already handles all block types and features generically
- `QuoteTemplateHomekaara.tsx` -- kept in codebase for reference but no longer rendered
- `PrintableQuote.tsx` -- unchanged, works with any template
- All PDF generation, email, printing -- unchanged
- Storage buckets -- unchanged

## What Makes "Curtain Quote" Special

It's not a different rendering engine -- it's a template with **better defaults**:
- Images enabled by default
- Room grouping enabled by default  
- Detailed layout by default
- Pre-configured blocks optimized for curtain/blind quotes

Users can still customize everything through the same block editor.


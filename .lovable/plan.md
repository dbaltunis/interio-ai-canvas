

# Refine Curtain Quote: Edit Button, Hardware Separation, and Editable Fields Logic

## Summary

Four refinements to perfect the curtain-professional quote: (1) ensure the "Edit Fields" button works and is visible in the job quote view, (2) extract hardware breakdown items from each treatment into the "Services & Hardware" section, (3) make only field **labels/titles** editable in the Settings template editor and only field **values/inputs** editable in the Job quote view, and (4) same logic for the intro message and other text blocks.

## Changes

### 1. Edit Fields Button in Job View

The "Edit Fields" button already exists in `QuoteFullScreenView.tsx` (lines 220-228) and passes `isEditMode` as `isEditable` to `LivePreview`. However, the button is currently always visible for all template types. We need to verify it works correctly and, per the user's request, restrict it to curtain-quote type only.

**File: `QuoteFullScreenView.tsx`**
- Wrap the "Edit Fields" button in a condition: only show when `selectedTemplate?.template_type === 'curtain-quote'` or the template blocks contain `theme: 'curtain-professional'`.
- Ensure `isEditMode` is passed correctly to `LivePreview` as `isEditable`.

### 2. Hardware from Treatment Breakdown -> Services & Hardware Section

Currently, the `isServiceItem` / `isHardwareOnlyItem` filters in `LivePreview.tsx` only check top-level room products by `treatment_type`, `name`, or `category`. But hardware items (tracks, rods, accessories) are often **children/breakdown items within a treatment**, not separate top-level products.

**File: `LivePreview.tsx` (curtain-professional products section)**

Two-part approach:

**Part A: Extract hardware from breakdown**
- In the curtain-professional table rendering, when iterating through each treatment's `children` array (breakdown items), use the existing `isHardwareItem()` utility from `src/utils/quotes/groupHardwareItems.ts` to identify hardware children.
- Collect these hardware children into a separate list (`extractedHardware`) instead of displaying them inline in the product details breakdown.
- Each extracted hardware item gets associated with its parent treatment's room name for display context.

**Part B: Display extracted hardware in Services & Hardware section**
- Combine `serviceHardwareItems` (top-level service/hardware products) with `extractedHardware` (hardware children extracted from treatment breakdowns).
- Display all of them in the "Services & Hardware" section at the bottom of the table.
- For extracted hardware children, show: the room name, no image, hardware name + description, quantity, unit price, and total.

This uses the already-built `isHardwareItem()` function from `groupHardwareItems.ts` which comprehensively checks for tracks, rods, poles, brackets, finials, headrails, motors, cassettes, valances, etc.

### 3. Editable Titles (Settings) vs Editable Values (Job View)

The current `BlockRenderer.tsx` curtain-split header makes both the labels AND values editable when `isEditable` is true. The user wants a clear split:

- **In Settings** (template editor): Only the **labels/titles** of custom fields are editable (e.g., rename "Services Required" to "Project Type"). The values show as placeholder text.
- **In Job View** (quote preview with Edit Fields button): Only the **values/inputs** are editable (e.g., enter "Curtains & Blinds" for "Services Required"). The labels are read-only.

**File: `BlockRenderer.tsx` (curtain-split header, custom fields section)**

Add a new prop or context flag to distinguish between "template editing" (Settings page) and "document editing" (Job view). The simplest approach:
- Add an optional `editMode` prop to BlockRenderer: `'template'` (editing the template structure in Settings) vs `'document'` (editing field values in the Job view).
- When `editMode === 'template'` and `isEditable`: make custom field **labels** editable (click to rename), show values as placeholder text (not editable).
- When `editMode === 'document'` and `isEditable`: make custom field **values** editable (click to type input), labels are read-only.
- The Status field value is always editable in document mode (as it is now).

**File: `LivePreview.tsx`**
- Accept an `editMode` prop and pass it through to `BlockRenderer`.
- In the Settings visual editor, pass `editMode="template"`.
- In the Job view (`QuoteFullScreenView.tsx`), pass `editMode="document"`.

**File: `QuoteFullScreenView.tsx`**
- Pass `editMode="document"` to `LivePreview`.

### 4. Intro Message and Text Blocks: Same Logic

The `editable-text-field` block (intro message) should follow the same pattern:
- **Settings** (`editMode="template"`): The **label/title** is editable (e.g., rename "Introduction Message" to "Welcome Note"). The text area shows placeholder text.
- **Job View** (`editMode="document"`): The **content/value** is editable (e.g., type the actual message to the client). The label is read-only.

**File: `LivePreview.tsx` (editable-text-field case)**
- When `editMode === 'template'`: render label as editable text, value as non-editable placeholder.
- When `editMode === 'document'`: render label as read-only, value as editable text area.

## Files to Modify

| File | Change |
|------|--------|
| `QuoteFullScreenView.tsx` | Restrict "Edit Fields" button to curtain-quote templates; pass `editMode="document"` to LivePreview |
| `LivePreview.tsx` | Accept `editMode` prop, pass to BlockRenderer; extract hardware children from treatment breakdowns into Services & Hardware section; update editable-text-field to respect editMode |
| `BlockRenderer.tsx` | Accept `editMode` prop; split editable behavior for custom field labels (template mode) vs values (document mode) |

## What Stays the Same

- All non-curtain-quote templates are completely unchanged
- PDF generation, printing, email -- unchanged
- Image upload/editing -- unchanged
- The existing `isHardwareItem()` utility is reused as-is
- Block editor structure -- unchanged



# Curtain Quote Refinements — COMPLETED

## Implemented Changes

1. **Edit Fields Button** — Restricted to curtain-quote templates only in QuoteFullScreenView. Passes `editMode="document"` so only field values are editable.

2. **Hardware Extraction from Treatments** — Treatment breakdown children are now checked with `isHardwareItem()` utility. Hardware children are extracted and displayed in the "Services & Hardware" section at the bottom.

3. **Editable Titles vs Values** — `editMode` prop added to BlockRenderer and LivePreview. In `template` mode, field labels are editable. In `document` mode, field values are editable. Status field is always editable in document mode.

4. **Intro Message / Text Blocks** — EditableTextField respects `editMode`: labels editable in template mode, text content editable in document mode.

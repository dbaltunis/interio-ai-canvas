
# Fix Plan: Homekaara Template Not Displaying in Jobs

## Root Cause Identified

The Homekaara template is correctly saved in `business_settings.quote_template = 'homekaara'`, but the conditional logic in `QuotationTab.tsx` has an unnecessary secondary check that prevents it from rendering.

### The Problem

**Current logic (line 347-348):**
```typescript
const useHomekaaraTemplate = quoteTemplateStyle === 'homekaara' && 
  (selectedTemplate?.template_style === 'quote' || !selectedTemplate?.template_style);
```

**Why it fails:**
- `quoteTemplateStyle` = `'homekaara'` (correct)
- `selectedTemplate?.template_style` = `'detailed'` (from the dropdown)
- Since `'detailed'` is not `'quote'` and not `undefined`, the entire condition evaluates to `false`

### The Fix

The Homekaara global style should override the block-based template when selected. The secondary check is unnecessary and should be removed:

**Fixed logic:**
```typescript
const useHomekaaraTemplate = quoteTemplateStyle === 'homekaara';
```

This means when a business selects "Homekaara" in Settings, ALL their quotes will use the Homekaara template, regardless of which block-based template is chosen in the dropdown.

---

## Implementation

### File: `src/components/jobs/tabs/QuotationTab.tsx`

**Change (line 345-348):**

Before:
```typescript
// Check if Homekaara template style should be used
const quoteTemplateStyle = (businessSettings as any)?.quote_template || 'default';
const useHomekaaraTemplate = quoteTemplateStyle === 'homekaara' && 
  (selectedTemplate?.template_style === 'quote' || !selectedTemplate?.template_style);
```

After:
```typescript
// Check if Homekaara template style should be used
// When 'homekaara' is selected in business settings, it overrides the block-based template
const quoteTemplateStyle = (businessSettings as any)?.quote_template || 'default';
const useHomekaaraTemplate = quoteTemplateStyle === 'homekaara';
```

---

## Why This Makes Sense

The quote template style selector in Settings presents two options:
1. **Default** - Use the block-based template editor (LivePreview)
2. **Homekaara** - Use the fixed Homekaara design

These are mutually exclusive global styles. When "Homekaara" is selected, it should completely replace the block-based system, not depend on whether the selected block template happens to have a specific `template_style` value.

---

## Testing Checklist

1. [ ] Ensure `business_settings.quote_template` = `'homekaara'` (already confirmed)
2. [ ] Navigate to any job's Quote tab
3. [ ] Verify the Homekaara template renders (room grouping, tan/beige colors, product images)
4. [ ] Switch back to Default in settings
5. [ ] Verify the block-based template (LivePreview) renders again

---

## Technical Details

| Item | Details |
|------|---------|
| File | `src/components/jobs/tabs/QuotationTab.tsx` |
| Lines | 345-348 |
| Effort | Low (2-line change) |
| Risk | None - the condition simply becomes more permissive |

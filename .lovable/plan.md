
# Fix Plan: Template Options Not Appearing - VERIFIED Root Cause

## Executive Summary

After thorough investigation with database verification, I've confirmed **two distinct root causes** for why options don't appear on manual templates:

---

## Verified Root Causes

### Root Cause #1: TWC Option Isolation Filter (Lines 380-385)

**Location:** `src/components/settings/tabs/products/TemplateOptionsManager.tsx`

```typescript
// Lines 380-385 - The problematic filter
if ((opt as any).source === 'twc') {
  const isLinked = linkedOptionIds.has(opt.id);  // FALSE for new templates
  const keyMatchesTemplate = templateIdPrefix && opt.key?.endsWith(`_${templateIdPrefix}`);  // FALSE - wrong suffix
  return isLinked || keyMatchesTemplate;  // Both FALSE = option hidden
}
```

**Evidence from database:**

| Template | template_option_settings | Key Suffix | Filter Result |
|----------|-------------------------|------------|---------------|
| `af6eed75` (TWC) | 23 entries ✅ | `_af6eed75` ✅ | 23 options shown |
| `76e4d232` (Manual) | 0 entries ❌ | Needs `_76e4d232` but all are `_af6eed75` ❌ | 0 options shown |

### Root Cause #2: No System Options for roller_blinds

**Evidence:**

```text
treatment_category  | source  | option_count | account_count
--------------------|---------|--------------|---------------
roller_blinds       | twc     | 213          | 4 accounts
roller_blinds       | manual  | 20           | 2 accounts
roller_blinds       | system  | 0            | 0 accounts  ← MISSING!
vertical_blinds     | system  | 7            | 1 account   ← EXISTS
```

When the TWC filter fails AND there are no system options, **nothing shows**.

---

## Why This Only Affects Some Templates

The filter on line 387-388 says: "For system/custom options: show all matching category" - but:
- roller_blinds has **NO** system options in the database
- vertical_blinds has 7 system options, so manual verticals show 7 options

---

## Proposed Fix

### Option A: Make TWC Options Shareable Within Category (Recommended)

**File:** `src/components/settings/tabs/products/TemplateOptionsManager.tsx`

**Change lines 380-385:**

```typescript
// BEFORE: Only show TWC options if linked OR key matches this template
if ((opt as any).source === 'twc') {
  const isLinked = linkedOptionIds.has(opt.id);
  const keyMatchesTemplate = templateIdPrefix && opt.key?.endsWith(`_${templateIdPrefix}`);
  return isLinked || keyMatchesTemplate;
}

// AFTER: Show all TWC options for the category - let user toggle them on/off
if ((opt as any).source === 'twc') {
  // Show TWC options for any template in the same category
  // Options start disabled; user enables what they need
  return true;
}
```

**Why this is safe:**
- The filter already checks `treatment_category` on line 378
- TWC options for "roller_blinds" only show on roller blind templates
- Options are disabled by default until user enables them
- This preserves existing `template_option_settings` (nothing breaks for working templates)
- Users can now configure manual templates with the same options

### Option B: Auto-Link Options on Template Creation

Modify `curtain_templates` creation to copy `template_option_settings` from an existing template of the same category.

**Pros:** Automatic setup for new templates
**Cons:** More complex, may copy unwanted options

### Option C: Create System Options for roller_blinds

Add default system options for roller_blinds (Motor, Control Type, etc.) similar to vertical_blinds.

**Pros:** Provides fallback options
**Cons:** Duplicates existing TWC options; doesn't solve the core issue

---

## Recommended Approach: Option A + Database Migration

### Step 1: Update Filter Logic (Code Change)

Change the TWC filter from "exclusive" to "inclusive" - show all category-matching TWC options.

### Step 2: Link Existing Options (SQL Migration)

For accounts with manual templates that have 0 options, create `template_option_settings` entries (disabled by default):

```sql
-- Link TWC options to all templates in the same category
INSERT INTO template_option_settings (template_id, treatment_option_id, is_enabled, order_index)
SELECT DISTINCT
  ct.id as template_id,
  topt.id as treatment_option_id,
  false as is_enabled,  -- Start disabled
  topt.order_index
FROM curtain_templates ct
CROSS JOIN treatment_options topt
WHERE ct.treatment_category = topt.treatment_category
AND ct.user_id = topt.account_id
AND topt.source = 'twc'
AND NOT EXISTS (
  SELECT 1 FROM template_option_settings tos 
  WHERE tos.template_id = ct.id 
  AND tos.treatment_option_id = topt.id
)
ON CONFLICT (template_id, treatment_option_id) DO NOTHING;
```

---

## Impact Analysis

### What Will Improve
- Manual roller blind templates will show all 23 TWC options (disabled by default)
- Users can enable the options they need for each template
- No more "No options configured" for valid categories

### What Won't Break
- Existing TWC templates (`af6eed75`) keep their 23 enabled options
- Existing `template_option_settings` are preserved
- The worksheet flow remains unchanged (only reads enabled options)

### Risk Assessment
- **Low risk:** Filter change only affects Settings page visibility
- **No impact on quotes:** Quote/worksheet uses `useTreatmentOptions` with template query which reads from `template_option_settings.is_enabled`

---

## Files to Modify

| File | Change | Risk |
|------|--------|------|
| `src/components/settings/tabs/products/TemplateOptionsManager.tsx` | Lines 380-385: Remove TWC isolation filter | Low |
| SQL Migration | Link TWC options to all same-category templates | Low |

---

## Alternative: "Enable All Available Options" Button

If you prefer not changing the filter logic, I can add a button "Copy Options from [Working Template]" that copies `template_option_settings` from a working template to the empty one. This is a per-template fix rather than a systemic fix.

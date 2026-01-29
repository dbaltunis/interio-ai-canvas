

# Fix Compose Email Dialog: Scrolling & Template Consistency

## Problem Summary

You've identified two key issues with the "Compose Email" dialog:

1. **Not scrolling/fitting properly** - The dialog content is cut off and doesn't scroll
2. **Different templates** - The dropdown shows 3 hardcoded templates ("Quote Follow-up", "Project Update", "Thank You") while the Templates page shows 6 database templates

---

## Root Cause Analysis

### Issue 1: Compose Dialog Not Scrolling

**Location:** `src/components/jobs/EmailManagement.tsx` (lines 220-231)

The composer modal is rendered as a fixed overlay:
```tsx
<div className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm">
  <div className="fixed inset-4 md:inset-8 lg:inset-16 bg-card border rounded-xl shadow-2xl overflow-hidden flex flex-col">
    <EmailComposer ... />
  </div>
</div>
```

The outer wrapper has `overflow-hidden` but the `EmailComposer` component inside (`src/components/jobs/email/EmailComposer.tsx`) uses a `<Card>` component that doesn't have proper scrolling enabled on its content.

**Fix:** Add `overflow-y-auto` and proper height constraints to the EmailComposer's `CardContent` and the wrapper.

---

### Issue 2: Template Dropdown Shows Wrong Templates

**Location:** `src/components/jobs/email/EmailComposer.tsx` (lines 49-68)

The templates are **hardcoded** directly in the component:
```tsx
const emailTemplates = [
  { id: "quote_follow_up", name: "Quote Follow-up", ... },
  { id: "project_update", name: "Project Update", ... },
  { id: "thank_you", name: "Thank You", ... }
];
```

These are **NOT** the database templates you see in the Templates tab (which come from `useGeneralEmailTemplates`).

**Why there are 2 different template sources:**
| Source | Where Used | Count |
|--------|-----------|-------|
| Hardcoded in `EmailComposer.tsx` | Compose dialog dropdown | 3 templates |
| Database via `useGeneralEmailTemplates` | Templates tab (EmailTemplateLibrary) | 6 templates |

**Fix:** Replace hardcoded templates with the database templates from `useGeneralEmailTemplates`.

---

## Implementation Plan

### Fix 1: Make Compose Dialog Scrollable

**File:** `src/components/jobs/EmailManagement.tsx`

Change the composer wrapper (lines 219-231):
```tsx
// Before
<div className="fixed inset-4 md:inset-8 lg:inset-16 bg-card border rounded-xl shadow-2xl overflow-hidden flex flex-col">

// After  
<div className="fixed inset-4 md:inset-8 lg:inset-16 bg-card border rounded-xl shadow-2xl overflow-auto">
```

**File:** `src/components/jobs/email/EmailComposer.tsx`

Add scrolling to the Card:
```tsx
// Line 179 - Add height constraint and scrolling
<Card className="w-full max-w-4xl mx-auto h-full flex flex-col">
  <CardHeader className="pb-4 flex-shrink-0">
    ...
  </CardHeader>
  <CardContent className="space-y-6 overflow-y-auto flex-1">
    ...
  </CardContent>
</Card>
```

---

### Fix 2: Use Database Templates in Compose Dropdown

**File:** `src/components/jobs/email/EmailComposer.tsx`

1. Add import for `useGeneralEmailTemplates`:
```tsx
import { useGeneralEmailTemplates } from "@/hooks/useGeneralEmailTemplates";
```

2. Replace hardcoded templates with database fetch:
```tsx
// Remove hardcoded emailTemplates array (lines 49-68)

// Add hook call inside component
const { data: emailTemplates = [] } = useGeneralEmailTemplates();
```

3. Update template selection handler:
```tsx
const handleTemplateSelect = (templateId: string) => {
  const template = emailTemplates.find(t => t.id === templateId);
  if (template) {
    setEmailData(prev => ({
      ...prev,
      subject: template.subject,
      content: template.content,
      template: templateId
    }));
  }
};
```

4. Update dropdown to show database templates:
```tsx
<SelectContent>
  {emailTemplates.filter(t => t.active).map((template) => (
    <SelectItem key={template.id} value={template.id}>
      {template.template_type.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase())}
    </SelectItem>
  ))}
</SelectContent>
```

---

## Summary of Changes

| File | Change |
|------|--------|
| `src/components/jobs/EmailManagement.tsx` | Fix wrapper overflow for scrolling |
| `src/components/jobs/email/EmailComposer.tsx` | 1) Add flex/scroll to Card layout<br>2) Replace hardcoded templates with `useGeneralEmailTemplates` hook |

---

## Result

After these changes:
1. The Compose Email dialog will scroll properly when content is long
2. The template dropdown will show the **same 6 templates** you see in the Templates tab
3. One single source of truth for templates (database)


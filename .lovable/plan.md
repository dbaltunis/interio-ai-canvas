

# Plan: Fix Remaining Reported Bugs

## Overview

This plan addresses the verified bugs that are still pending based on code investigation:

| Bug | Status | Priority |
|-----|--------|----------|
| ✅ Deposit display shows % for fixed amount | ALREADY FIXED | - |
| ✅ Measurement fields scroll with mouse wheel | ALREADY FIXED | - |
| ⏳ Sub-tabs close when browser tab switched | NOT FIXED | High |
| ⏳ US date format inconsistent | NOT FIXED | Medium |
| ⏳ Quote PDF page break on text line | NEEDS VERIFICATION | Medium |

---

## Bug #1: Library Sub-Tab Persistence

### Problem

When user is in Library > Hardware, then clicks away to another browser tab, upon returning the Library page resets to the first tab (Collections/Fabrics) instead of staying on Hardware.

### Root Cause

In `src/components/inventory/ModernInventoryDashboard.tsx` (line 38):

```typescript
const [activeTab, setActiveTab] = useState("collections");
```

The sub-tab state is stored only in React's useState - it doesn't persist to sessionStorage like the main navigation tabs do. When the component re-renders (which can happen on tab focus), the state resets.

### Fix

Add sessionStorage persistence for the Library sub-tab, similar to how main tabs work in `Index.tsx`:

```typescript
// Line 38: Initialize from sessionStorage
const [activeTab, setActiveTab] = useState(() => {
  const savedTab = sessionStorage.getItem('library_active_tab');
  return savedTab || "collections";
});

// Add useEffect to persist changes
useEffect(() => {
  sessionStorage.setItem('library_active_tab', activeTab);
}, [activeTab]);
```

### Files to Modify

| File | Change |
|------|--------|
| `src/components/inventory/ModernInventoryDashboard.tsx` | Add sessionStorage persistence for activeTab |

---

## Bug #2: Inconsistent Date Formats

### Problem

Many places use `new Date(...).toLocaleDateString()` which uses browser locale instead of user's configured date format preference. This causes US date format (MM/DD/YYYY) to appear even when users have configured different formats.

### Affected Areas

Found 835 instances across 110 files. Key areas include:

- **Clients page**: `ClientDetailDrawer.tsx`, `ClientFilesManager.tsx`, `ClientQuotesList.tsx`
- **Jobs page**: `EnhancedJobsView.tsx`, `ProjectNotesCard.tsx`
- **Quotes**: `QuoteViewer.tsx`, `QuotePreview.tsx`
- **Workroom**: Various share link timestamps

### Fix Strategy

Replace `toLocaleDateString()` calls with the existing `formatUserDate()` utility from `src/utils/dateFormatUtils.ts` or use the user's date format preference.

**Priority files** (most user-visible):

1. `src/components/clients/ClientDetailDrawer.tsx` - Line 326
2. `src/components/clients/ClientQuotesList.tsx` - Line 102
3. `src/components/jobs/EnhancedJobsView.tsx` - Line 39
4. `src/components/jobs/ProjectNotesCard.tsx` - Lines 71, 114

### Implementation Pattern

The codebase has a utility but it's async. For sync contexts, we can:

1. Use the user preferences from context/hook
2. Apply `date-fns` `format()` with the user's format string

```typescript
// Before
{new Date(client.created_at).toLocaleDateString()}

// After (using existing formatUserDate)
import { formatUserDate } from "@/utils/dateFormatUtils";
// In component, using useEffect + state:
const [formattedDate, setFormattedDate] = useState('');
useEffect(() => {
  formatUserDate(client.created_at).then(setFormattedDate);
}, [client.created_at]);
```

Or simpler: use the sync `formatDateSync` function that already exists but update it to check localStorage for cached preferences.

### Files to Modify (Phase 1 - High Priority)

| File | Lines | Current Issue |
|------|-------|---------------|
| `ClientDetailDrawer.tsx` | 326 | `toLocaleDateString()` |
| `ClientQuotesList.tsx` | 102 | `toLocaleDateString()` |
| `EnhancedJobsView.tsx` | 39 | `formatDate` uses `toLocaleDateString()` |
| `ProjectNotesCard.tsx` | 71, 114 | `toLocaleDateString()`, `toLocaleString()` |
| `ClientFilesManager.tsx` | 545 | `toLocaleDateString()` |

---

## Bug #3: Quote PDF Page Breaks

### Current Implementation

The PDF generation in `src/utils/generateQuotePDF.ts` already has page break configuration:

```typescript
pagebreak: {
  mode: ['css', 'legacy'],
  before: '.page-break-before, .force-page-break',
  after: '.page-break-after',
  avoid: ['.avoid-page-break', '.quote-header', '.client-details-block', 'img']
},
```

### Potential Issue

The page break might be cutting through text because:
1. Table rows aren't marked with `avoid-page-break`
2. Text blocks might be missing the CSS class

### Fix

Add `avoid-page-break` class to quote line items and text blocks in the template:

```typescript
// In LivePreview.tsx - add class to quote item rows
<tr className="avoid-page-break" style={{...}}>
```

### Files to Modify

| File | Change |
|------|--------|
| `src/components/settings/templates/visual-editor/LivePreview.tsx` | Add `avoid-page-break` class to quote item rows |

---

## Implementation Order

1. **Library Sub-Tab Persistence** (Quick fix - 1 file, 2 changes)
2. **Date Format Priority Files** (5 files, highest user visibility)
3. **PDF Page Break** (1 file, add CSS class)

---

## Testing Checklist

### Library Sub-Tab Persistence
1. Go to Library > Hardware tab
2. Click away to another browser tab
3. Return to the app
4. **Verify**: Still on Hardware tab (not reset to Collections/Fabrics)

### Date Format
1. Go to Settings > Personal > Date Format
2. Set to "DD/MM/YYYY" (European format)
3. Go to Clients > View any client
4. **Verify**: "Added" date shows DD/MM/YYYY format

### PDF Page Break
1. Create a quote with many line items (enough for 2+ pages)
2. Export to PDF
3. **Verify**: Text doesn't split across page boundaries


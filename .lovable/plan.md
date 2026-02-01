

# Plan: Fix Remaining Reported Bugs

## Overview

This plan addresses the verified bugs that are still pending based on code investigation:

| Bug | Status | Priority |
|-----|--------|----------|
| ✅ Deposit display shows % for fixed amount | FIXED | - |
| ✅ Measurement fields scroll with mouse wheel | FIXED | - |
| ✅ Sub-tabs close when browser tab switched | FIXED | High |
| ✅ US date format inconsistent | FIXED (Phase 1) | Medium |
| ✅ Quote PDF page break on text line | FIXED | Medium |

---

## Bug #1: Library Sub-Tab Persistence ✅ COMPLETED

### Problem

When user is in Library > Hardware, then clicks away to another browser tab, upon returning the Library page resets to the first tab (Collections/Fabrics) instead of staying on Hardware.

### Solution Applied

Added sessionStorage persistence for the Library sub-tab in `ModernInventoryDashboard.tsx`:

```typescript
const [activeTab, setActiveTab] = useState(() => {
  const savedTab = sessionStorage.getItem('library_active_tab');
  return savedTab || "collections";
});

useEffect(() => {
  sessionStorage.setItem('library_active_tab', activeTab);
}, [activeTab]);
```

---

## Bug #2: Inconsistent Date Formats ✅ COMPLETED (Phase 1)

### Problem

Many places use `new Date(...).toLocaleDateString()` which uses browser locale instead of user's configured date format preference.

### Solution Applied

Replaced `toLocaleDateString()` calls with the `useFormattedDate` and `useFormattedDates` hooks in priority files:

| File | Status |
|------|--------|
| `ClientDetailDrawer.tsx` | ✅ Fixed |
| `ClientQuotesList.tsx` | ✅ Fixed |
| `EnhancedJobsView.tsx` | ✅ Fixed |
| `ProjectNotesCard.tsx` | ✅ Fixed |
| `ClientFilesManager.tsx` | ✅ Fixed |

---

## Bug #3: Quote PDF Page Breaks ✅ COMPLETED

### Problem

PDF page breaks might cut through text lines in quotes.

### Solution Applied

Added `avoid-page-break` class to quote item rows in `LivePreview.tsx`:
- Main product rows
- Hardware group summary rows
- Hardware sub-item rows
- Regular breakdown rows

These classes work with the existing `html2pdf` configuration that already has:
```typescript
avoid: ['.avoid-page-break', '.quote-header', '.client-details-block', 'img']
```

---

## All Bugs Now Complete! 🎉


# Fix Lithuanian Document Language Translation

## The Problem

The Document Language setting is correctly saved to `business_settings.document_language = 'lt'`, but the **DocumentHeaderBlock** is NOT using the translation. It's still reading directly from the English-only `documentTypeConfig.ts`:

```tsx
// Current (broken):
const docConfig = getDocumentTypeConfig(documentType);  // Always English!
// Uses: docConfig.numberLabel = "Quote #"
// Uses: docConfig.primaryDateLabel = "Date" 
// Uses: docConfig.documentTitle = "Quote"
```

Meanwhile, other blocks like `ClientInfoBlock` and `TotalsBlock` correctly translate by doing:
```tsx
const lang = (businessSettings?.document_language as DocumentLanguage) || 'en';
// Then: t('Bill To', lang)  →  Returns "Pirkėjas" in Lithuanian
```

---

## The Fix

Update `DocumentHeaderBlock` in `src/components/settings/templates/visual-editor/shared/BlockRenderer.tsx` to:

1. Get the document language from business settings
2. Use `getLocalizedDocumentLabels()` instead of raw `docConfig` for text labels

---

## Technical Changes

### File: `src/components/settings/templates/visual-editor/shared/BlockRenderer.tsx`

**Change at line ~257-262 (after getting businessSettings):**

```tsx
// BEFORE:
const docConfig = getDocumentTypeConfig(documentType);

// AFTER:
const docConfig = getDocumentTypeConfig(documentType);
const lang = (businessSettings?.document_language as DocumentLanguage) || 'en';
const localizedLabels = getLocalizedDocumentLabels(documentType, lang);
```

**Then replace all hardcoded label usages in all 3 layouts:**

| Location | Before | After |
|----------|--------|-------|
| Line ~341 | `docConfig.documentTitle` | `localizedLabels.title` |
| Line ~402 | `docConfig.numberLabel` | `localizedLabels.numberLabel` |
| Line ~411 | `docConfig.primaryDateLabel` | `localizedLabels.primaryDate` |
| Line ~419 | `docConfig.secondaryDateLabel` | `localizedLabels.secondaryDate` |
| Line ~441 | `'PAID'` / `'UNPAID'` | `getLocalizedPaymentStatus('paid', lang)` |
| Line ~497-500 | `docConfig.documentTitle` (left-right) | `localizedLabels.title` |
| Line ~506 | `docConfig.numberLabel` (left-right) | `localizedLabels.numberLabel` |
| Line ~510 | `docConfig.primaryDateLabel` (left-right) | `localizedLabels.primaryDate` |
| Line ~515 | `docConfig.secondaryDateLabel` (left-right) | `localizedLabels.secondaryDate` |
| Line ~555 | `docConfig.documentTitle` (stacked) | `localizedLabels.title` |
| Line ~583-586 | Labels in stacked layout | Use `localizedLabels.*` |

---

## Before vs After

**Before (English only):**
```text
┌────────────────────────────────────────┐
│              [LOGO]                    │
│           Your Company                 │
│                                        │
│               Quote                    │
│                                        │
│ Sold to             Quote #: QT-001    │
│ Client Name         Date: 04/02/2026   │
│                     Valid Until: ...   │
└────────────────────────────────────────┘
```

**After (Lithuanian when selected):**
```text
┌────────────────────────────────────────┐
│              [LOGO]                    │
│           Your Company                 │
│                                        │
│            Pasiūlymas                  │
│                                        │
│ Pirkėjas       Pasiūlymas Nr.: QT-001  │
│ Client Name    Data: 2026-02-04        │
│                Galioja iki: ...        │
└────────────────────────────────────────┘
```

---

## Files to Modify

| File | Changes |
|------|---------|
| `src/components/settings/templates/visual-editor/shared/BlockRenderer.tsx` | Update `DocumentHeaderBlock` to use `getLocalizedDocumentLabels()` for all 3 header layouts |

---

## Verification Steps

After implementation:
1. Go to Settings → Business Details
2. Set "Document Language" to "Lietuvių (Lithuanian) - Documents only"
3. Save settings
4. Open any quote preview
5. Verify document shows:
   - **Title:** "Pasiūlymas" (not "Quote")
   - **Number label:** "Pasiūlymas Nr." (not "Quote #")
   - **Date label:** "Data" (not "Date")
   - **Valid Until:** "Galioja iki" (not "Valid Until")
   - **Bill To:** "Pirkėjas" (not "Sold to")
   - **Subtotal:** "Tarpinė suma"
   - **Total:** "Iš viso"

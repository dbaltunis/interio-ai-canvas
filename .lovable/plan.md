
# Lithuanian Documents + Fix Hardcoded Category Markups

## Overview

This plan addresses two issues:
1. **Add Lithuanian document language** - A dropdown in Settings that translates customer-facing documents (quotes, invoices) to Lithuanian while keeping the app UI in English
2. **Fix hardcoded category markups** - The markup categories are hardcoded in `PricingRulesTab.tsx` instead of using the dynamic `UNIFIED_CATEGORIES` from `treatmentCategories.ts`

---

## Part 1: Lithuanian Document Language

### What You'll Get
- A new "Document Language" dropdown in Business Settings
- When set to Lithuanian, all generated documents (quotes, invoices, work orders) will use Lithuanian labels
- The app interface stays in English - only the PDF/email documents your clients see will be translated

### Lithuanian Translations for Documents

| English | Lithuanian |
|---------|------------|
| Quote # | Pasiūlymas Nr. |
| Invoice # | Sąskaita-faktūra Nr. |
| Estimate # | Sąmata Nr. |
| Work Order # | Darbo užsakymas Nr. |
| Date | Data |
| Valid Until | Galioja iki |
| Due Date | Mokėjimo terminas |
| Subtotal | Tarpinė suma |
| Tax (VAT) | PVM |
| Total | Iš viso |
| Balance Due | Mokėtina suma |
| Bill To / Sold to | Pirkėjas |
| Description | Aprašymas |
| Quantity | Kiekis |
| Unit Price | Vieneto kaina |
| Amount | Suma |
| Bank | Bankas |
| Account | Sąskaita |
| IBAN | IBAN |
| Payment Terms | Mokėjimo sąlygos |
| Terms & Conditions | Sąlygos |
| Signature | Parašas |
| PAID | APMOKĖTA |
| UNPAID | NEAPMOKĖTA |
| OVERDUE | VĖLUOJAMA |

---

## Part 2: Fix Hardcoded Category Markups

### The Problem
In `PricingRulesTab.tsx`, lines 557-604 have hardcoded arrays:

```text
CURRENT (HARDCODED):
┌────────────────────────────────┐
│ Product Categories             │
│ • Curtains & Drapes            │
│ • Blinds                       │  ← Missing: Roller, Zebra, Venetian, etc.
│ • Shutters                     │
│ • Hardware                     │
│ • Fabrics                      │
│ • Installation                 │
└────────────────────────────────┘
```

### The Fix
Import `UNIFIED_CATEGORIES` from `treatmentCategories.ts` and dynamically generate markup inputs:

```text
AFTER FIX (DYNAMIC):
┌────────────────────────────────────────────┐
│ Treatment Categories                       │
│ • Curtains          • Roman Blinds         │
│ • Roller Blinds     • Zebra Blinds         │
│ • Venetian Blinds   • Vertical Blinds      │
│ • Cellular Shades   • Panel Glides         │
│ • Shutters          • Plantation Shutters  │
│ • Awnings           • Wallpaper            │
├────────────────────────────────────────────┤
│ Other Categories                           │
│ • Hardware          • Fabrics              │
│ • Installation                             │
├────────────────────────────────────────────┤
│ Manufacturing / Sewing                     │
│ • Curtain Making    • Roman Making         │
│ • Blind Making      • Shutter Making       │
└────────────────────────────────────────────┘
```

---

## Technical Implementation

### Files to Create

| File | Purpose |
|------|---------|
| `src/utils/documentTranslations.ts` | Central translation map for document labels (EN + LT) |

### Files to Modify

| File | Changes |
|------|---------|
| `src/hooks/useBusinessSettings.ts` | Add `document_language` to `BusinessSettings` interface |
| `src/components/settings/tabs/BusinessSettingsTab.tsx` | Add "Document Language" dropdown in Company section |
| `src/utils/documentTypeConfig.ts` | Add `getLocalizedConfig()` that returns translated labels |
| `src/components/settings/templates/visual-editor/shared/BlockRenderer.tsx` | Use translation helper for bank details, totals labels, status badges |
| `src/components/settings/tabs/PricingRulesTab.tsx` | Replace hardcoded category arrays with dynamic generation from `UNIFIED_CATEGORIES` |
| `src/hooks/useMarkupSettings.ts` | Ensure `category_markups` supports all treatment types dynamically |

---

## Detailed Changes

### 1. Create Translation Helper

Create `src/utils/documentTranslations.ts`:

```tsx
export type DocumentLanguage = 'en' | 'lt';

export const DOCUMENT_TRANSLATIONS: Record<string, Record<DocumentLanguage, string>> = {
  // Document titles
  'Quote': { en: 'Quote', lt: 'Pasiūlymas' },
  'Invoice': { en: 'Invoice', lt: 'Sąskaita-faktūra' },
  'Estimate': { en: 'Estimate', lt: 'Sąmata' },
  'Work Order': { en: 'Work Order', lt: 'Darbo užsakymas' },
  
  // Labels
  'Quote #': { en: 'Quote #', lt: 'Pasiūlymas Nr.' },
  'Invoice #': { en: 'Invoice #', lt: 'Sąskaita-faktūra Nr.' },
  'Date': { en: 'Date', lt: 'Data' },
  'Valid Until': { en: 'Valid Until', lt: 'Galioja iki' },
  'Due Date': { en: 'Due Date', lt: 'Mokėjimo terminas' },
  
  // Totals
  'Subtotal': { en: 'Subtotal', lt: 'Tarpinė suma' },
  'Tax': { en: 'Tax', lt: 'PVM' },
  'Total': { en: 'Total', lt: 'Iš viso' },
  'Balance Due': { en: 'Balance Due', lt: 'Mokėtina suma' },
  
  // Table headers
  'Description': { en: 'Description', lt: 'Aprašymas' },
  'Quantity': { en: 'Quantity', lt: 'Kiekis' },
  'Unit Price': { en: 'Unit Price', lt: 'Vieneto kaina' },
  'Amount': { en: 'Amount', lt: 'Suma' },
  
  // Client
  'Bill To': { en: 'Bill To', lt: 'Pirkėjas' },
  'Sold to': { en: 'Sold to', lt: 'Pirkėjas' },
  
  // Bank details
  'Bank': { en: 'Bank', lt: 'Bankas' },
  'Account Name': { en: 'Account Name', lt: 'Sąskaitos savininkas' },
  'Account': { en: 'Account', lt: 'Sąskaita' },
  'IBAN': { en: 'IBAN', lt: 'IBAN' },
  'BIC/SWIFT': { en: 'BIC/SWIFT', lt: 'BIC/SWIFT' },
  
  // Status
  'PAID': { en: 'PAID', lt: 'APMOKĖTA' },
  'UNPAID': { en: 'UNPAID', lt: 'NEAPMOKĖTA' },
  'OVERDUE': { en: 'OVERDUE', lt: 'VĖLUOJAMA' },
  
  // Footer
  'Terms & Conditions': { en: 'Terms & Conditions', lt: 'Sąlygos' },
  'Payment Terms': { en: 'Payment Terms', lt: 'Mokėjimo sąlygos' },
  'Signature': { en: 'Signature', lt: 'Parašas' },
};

export function t(key: string, lang: DocumentLanguage = 'en'): string {
  return DOCUMENT_TRANSLATIONS[key]?.[lang] || key;
}
```

### 2. Add Document Language Setting

In `BusinessSettingsTab.tsx`, add a dropdown near the Company section:

```tsx
<Select 
  value={formData.document_language || 'en'} 
  onValueChange={(value) => handleInputChange('document_language', value)}
>
  <SelectTrigger>
    <SelectValue placeholder="Select language" />
  </SelectTrigger>
  <SelectContent>
    <SelectItem value="en">English</SelectItem>
    <SelectItem value="lt">Lietuvių (Lithuanian) - Documents only</SelectItem>
  </SelectContent>
</Select>
```

### 3. Fix PricingRulesTab Categories

Replace the hardcoded arrays in `PricingRulesTab.tsx`:

```tsx
import { UNIFIED_CATEGORIES } from '@/types/treatmentCategories';

// Generate treatment category markups dynamically
const treatmentCategories = Object.entries(UNIFIED_CATEGORIES).map(([key, config]) => ({
  id: `${key}Markup`,
  label: config.display_name,
  key: key  // This is what gets saved to category_markups
}));

// Keep static categories for non-treatments
const otherCategories = [
  { id: 'hardwareMarkup', label: 'Hardware', key: 'hardware' },
  { id: 'fabricMarkup', label: 'Fabrics', key: 'fabric' },
  { id: 'installationMarkup', label: 'Installation', key: 'installation' }
];
```

---

## Settings UI Preview

The Document Language dropdown will appear in Business Settings:

```text
┌─ Company Details ──────────────────────────┐
│ Company Name: [Your Company Name      ]    │
│ ...                                        │
├────────────────────────────────────────────┤
│ Document Language                          │
│ ┌────────────────────────────────────────┐ │
│ │ 🇱🇹 Lietuvių (Lithuanian) - Documents  ▼│ │
│ └────────────────────────────────────────┘ │
│ ℹ️ Only affects quotes & invoices your     │
│   clients see. App interface stays English │
└────────────────────────────────────────────┘
```

---

## Summary

| Task | Complexity | Impact |
|------|------------|--------|
| Create translation helper | Low | Enables all document translation |
| Add language dropdown | Low | User can select Lithuanian |
| Update BlockRenderer labels | Medium | Translates 20+ document labels |
| Update documentTypeConfig | Low | Translates document titles |
| Fix category markups | Medium | Shows all 12+ treatment types in markup settings |

**Estimated Changes:** 6 files, ~300 lines of code

---

## Verification Steps

After implementation:
1. Go to Settings → Business Details
2. Change "Document Language" to Lithuanian
3. Open any quote in preview mode
4. Verify labels show: "Pasiūlymas Nr.", "Tarpinė suma", "Iš viso", etc.
5. Go to Settings → Pricing & Tax → Tax & Markup tab
6. Verify all treatment types (Roller Blinds, Zebra Blinds, etc.) now appear in Category Markup section

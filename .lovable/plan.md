
# Fix Three Issues: Recent Fabrics Cross-Account, Option Pre-Selection, and Pricing Clarification

## Issue 1: Recent Fabrics Showing from Other Accounts

### Root Cause
The "Recently Used" feature stores selections in **localStorage** using a global key `recent_material_selections`. This is browser-specific, NOT account-specific.

**Evidence from database:**
| Item Name | User ID (Account) |
|-----------|-------------------|
| ADARA | ec930f73 (Greg's account) |
| 1234rt | ec930f73 (Greg's account) |

The demo user (`f740ef45`) sees items from Greg's account because they share the same browser.

### Solution
Make localStorage key account-specific by including user ID:

**File:** `src/hooks/useRecentMaterialSelections.ts`

```typescript
// Current (broken):
const STORAGE_KEY = 'recent_material_selections';

// Fixed (account-isolated):
const STORAGE_KEY_PREFIX = 'recent_material_selections';

// Inside the hook, get user ID and use account-specific key
const { data: user } = useQuery(['current-user'], async () => {
  const { data } = await supabase.auth.getUser();
  return data.user;
});

const storageKey = user?.id 
  ? `${STORAGE_KEY_PREFIX}_${user.id}` 
  : STORAGE_KEY_PREFIX;
```

---

## Issue 2: Option Pre-Selection Not Working for New Products

### Root Cause
The code at line 249 explicitly says: `// REMOVED: Auto-select first option logic`. This was intentional to prevent "random" values, but it means TWC products require manual selection for every dropdown.

### Current Behavior
- Options show as empty (no selection)
- Red validation warnings appear for all required fields
- User must manually select each option

### Solution
Add a **per-template setting** for pre-selection behavior, stored in the template or user preferences.

**Option A: Template-level setting**
Add `auto_select_first_option` boolean to `curtain_templates` table:
- When `true`: Auto-select first available option for each dropdown
- When `false`: Require manual selection (current behavior)
- TWC imports can default this to `true`

**Option B: Global user setting**
Add toggle in Settings > Preferences: "Auto-select first option in measurement popup"

### Implementation
**File:** `src/components/measurements/dynamic-options/DynamicCurtainOptions.tsx`

Add conditional auto-selection:
```typescript
useEffect(() => {
  // Only auto-select if template has auto_select_first_option enabled
  if (!template?.auto_select_first_option) return;
  
  treatmentOptions.forEach(option => {
    const currentValue = treatmentOptionSelections[option.key];
    if (!currentValue && option.option_values?.length > 0) {
      handleTreatmentOptionChange(option.key, option.option_values[0].id);
    }
  });
}, [template?.auto_select_first_option, treatmentOptions]);
```

**Database migration:**
```sql
ALTER TABLE curtain_templates 
ADD COLUMN auto_select_first_option boolean DEFAULT false;

-- Enable for all TWC templates
UPDATE curtain_templates 
SET auto_select_first_option = true 
WHERE inventory_item_id IN (
  SELECT id FROM enhanced_inventory_items WHERE supplier = 'TWC'
);
```

---

## Issue 3: Pricing Clarification - What Does Manufacturing Include?

### Current Pricing Breakdown

The pricing summary shows:

| Line Item | What It Includes |
|-----------|------------------|
| **Fabric Cost** | Fabric material only (linear meters × cost per meter) |
| **Manufacturing Cost** | Labor/making cost only (sewing, construction) |
| **Heading Cost** | Heading tape/material cost |
| **Lining Cost** | Lining fabric cost |
| **Options Cost** | Additional accessories (tracks, hardware, etc.) |

### Answer to User's Question
**Manufacturing = Curtain MAKING price only (labor/sewing).**
Fabric is charged separately on the "Fabric Cost" line.

### Verification from Code
```typescript
// Lines 3105-3172 in DynamicWindowWorksheet.tsx
// manufacturingCost is calculated using:
// - pricePerUnit (machine_price_per_metre or hand_price_per_metre)
// - Multiplied by linear meters
// This is ONLY the labor/sewing cost

// Fabric cost is calculated separately:
// fabricCost = pricePerMeter × totalMeters
```

### User's Concern
If the "Fabric Cost" shows $0 or is missing:
1. **No fabric selected** - User needs to select a fabric from the Library
2. **Fabric has no cost_price set** - TWC fabrics default to $0 (dealers set their own prices)
3. **Pricing grid in use** - Grid price may include fabric + making bundled

### Recommendation
Add clearer labels in the cost breakdown to reduce confusion:
- "Fabric Material" instead of "Fabric Cost"
- "Making/Labor" instead of "Manufacturing"

---

## Files to Modify

| File | Change |
|------|--------|
| `src/hooks/useRecentMaterialSelections.ts` | Make storage key account-specific |
| `src/components/measurements/dynamic-options/DynamicCurtainOptions.tsx` | Add conditional auto-select based on template setting |
| `supabase/migrations/xxx.sql` | Add `auto_select_first_option` column to `curtain_templates` |
| `src/components/measurements/dynamic-options/CostCalculationSummary.tsx` | Clarify labels (optional UX improvement) |

---

## Technical Details

### Recent Materials Storage Key Fix

```typescript
// useRecentMaterialSelections.ts - Lines 1-35

import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface RecentSelection {
  itemId: string;
  name: string;
  imageUrl?: string;
  color?: string;
  priceGroup?: string;
  vendorName?: string;
  selectedAt: number;
}

const STORAGE_KEY_PREFIX = 'recent_material_selections';
const MAX_ITEMS = 6;
const MAX_AGE_MS = 30 * 24 * 60 * 60 * 1000; // 30 days

export const useRecentMaterialSelections = (limit = MAX_ITEMS) => {
  const [items, setItems] = useState<RecentSelection[]>([]);
  const [userId, setUserId] = useState<string | null>(null);

  // Get current user ID on mount
  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      setUserId(data.user?.id || null);
    });
  }, []);

  // Account-specific storage key
  const storageKey = userId 
    ? `${STORAGE_KEY_PREFIX}_${userId}` 
    : STORAGE_KEY_PREFIX;
  
  // ... rest of hook uses storageKey instead of STORAGE_KEY
};
```

### Auto-Select Template Setting

```sql
-- Migration: Add auto_select_first_option to templates
ALTER TABLE curtain_templates 
ADD COLUMN IF NOT EXISTS auto_select_first_option boolean DEFAULT false;

-- Enable for TWC templates by default
UPDATE curtain_templates ct
SET auto_select_first_option = true
FROM enhanced_inventory_items eii
WHERE ct.inventory_item_id = eii.id
  AND eii.supplier = 'TWC';
```

---

## Expected Outcomes

| Issue | Before | After |
|-------|--------|-------|
| Recent Fabrics | Shows items from all accounts using same browser | Shows only current account's items |
| Pre-Selection | All dropdowns empty, requires manual selection | TWC templates auto-select first option |
| Pricing Clarity | "Manufacturing Cost" label unclear | Labels clarify fabric vs. labor costs |

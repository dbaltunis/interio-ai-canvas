
# Emergency Fix: Broken Quote Display and Missing Supplier Button

## Problem Identified
The application is completely broken due to my previous change in `useQuotes.ts` that added `quote_items(*)` to the Supabase select query.

### Root Cause
```typescript
// This query is returning HTTP 400 errors:
.select(`
  *,
  quote_items(*),  // <-- THIS IS THE PROBLEM
  clients (id, name, email),
  ...
`)
```

**Error from Supabase:**
```
"Could not find a relationship between 'quotes' and 'quote_items' in the schema cache"
```

The database does NOT have a foreign key relationship that allows nested selection between `quotes` and `quote_items`. This breaks ALL quote-related functionality.

### Impact
| Issue | Cause |
|-------|-------|
| Projects list shows £0.00 for all totals | `useQuotes` returns empty array due to 400 error |
| Quote tab doesn't display | Same - no quote data available |
| Supplier Ordering button missing | Relies on `activeQuote.quote_items` which is now undefined |
| Everything else related to quotes | All broken |

## Solution

### Step 1: Revert useQuotes.ts Query (URGENT)
Remove `quote_items(*)` from the select query - it cannot work without a proper FK relationship.

**File:** `src/hooks/useQuotes.ts` (lines 24-45)

```typescript
// BEFORE (broken):
let query = supabase
  .from("quotes")
  .select(`
    *,
    quote_items(*),  // REMOVE THIS
    clients (id, name, email),
    ...
  `);

// AFTER (fixed):
let query = supabase
  .from("quotes")
  .select(`
    *,
    clients (id, name, email),
    projects (id, name, status, client_id, clients (id, name, email))
  `);
```

### Step 2: Fix SupplierOrderingDropdown Data Source
Since `quote_items` cannot be fetched via nested select, the `SupplierOrderingDropdown` needs to fetch its own quote items.

**Option A (Recommended):** Modify `SupplierOrderingDropdown` to use the existing `useQuoteItems` hook internally

**Option B:** Fetch quote_items in `JobDetailPage` using `useQuoteItems` and pass them as props

### Step 3: Update JobDetailPage to Fetch Quote Items Separately
The `SupplierOrderingDropdown` at lines 905-916 expects `quoteItems` prop. Since the quotes no longer include this data, we need to:

1. Add `useQuoteItems(activeQuoteId)` call in JobDetailPage
2. Pass the fetched items to `SupplierOrderingDropdown`

## Files to Modify

| File | Change |
|------|--------|
| `src/hooks/useQuotes.ts` | Remove `quote_items(*)` from select query |
| `src/components/jobs/JobDetailPage.tsx` | Add `useQuoteItems` hook and pass data to SupplierOrderingDropdown |

## Technical Details

### Change 1: Fix useQuotes.ts (Line 24-45)
```typescript
let query = supabase
  .from("quotes")
  .select(`
    *,
    clients (
      id,
      name,
      email
    ),
    projects (
      id,
      name,
      status,
      client_id,
      clients (
        id,
        name,
        email
      )
    )
  `);
```

### Change 2: Update JobDetailPage.tsx
Add import for useQuoteItems:
```typescript
import { useQuoteItems } from "@/hooks/useQuoteItems";
```

Get the active quote ID and fetch items:
```typescript
const activeQuoteId = currentQuotes?.[0]?.id;
const { items: quoteItems } = useQuoteItems(activeQuoteId);
```

Update SupplierOrderingDropdown call to use fetched items:
```typescript
<SupplierOrderingDropdown
  ...
  quoteItems={quoteItems}  // Use separately fetched items
  ...
/>
```

## Expected Outcome After Fix
1. Projects list shows correct totals (£487.50, etc.)
2. Quote tab displays correctly with all pricing
3. Supplier Ordering button appears and works
4. All quote-related functionality restored

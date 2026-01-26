

# Fix TWC Submit Dialog - Empty Form Fields and 0 Products Bug

## Problems Identified

### Problem 1: Form Fields Not Populated With Client Data
The "Submit Order to TWC" dialog shows empty fields for Contact Name, Email, Phone, and Address even though:
- Client data exists: "John Smith", email: `xeridal650@cameltok.com`, phone: `447367211583`
- The data IS being passed correctly from JobDetailPage via props

### Problem 2: "0 TWC Products" Display
The dialog shows "Items: 0 TWC products" and "Quote Total: AUD 0.00" even though:
- The database now has `quote_items.product_details.twc_item_number = 245` (after my fix to useQuotationSync.ts)
- There are 2 valid TWC items in the quote

## Root Cause

**React `useState` initialization only runs ONCE** when the component first mounts:

```typescript
// TWCSubmitDialog.tsx lines 32-42
const [formData, setFormData] = useState({
  purchaseOrderNumber: `PO-${quoteId.slice(0, 8)}`,
  contactName: clientData?.name || "",        // <-- Captured on first mount ONLY
  email: clientData?.email || "",             // <-- Not updated when props change
  phone: clientData?.phone || "",
  address1: projectData?.address || clientData?.address || "",
  // ...
});
```

When the TWCSubmitDialog is rendered:
1. First mount: `clientData` and `quotationData` might be `undefined` or stale
2. Props get updated later with fresh data
3. But `useState` does NOT re-run - form stays empty

Similarly, the `twcItems` calculation depends on `quotationData.items` which may not be fully loaded when the component first renders.

## Solution

### Add `useEffect` to Update Form When Dialog Opens

**File:** `src/components/integrations/TWCSubmitDialog.tsx`

After line 42, add a `useEffect` to sync form data when the dialog opens:

```typescript
// Re-sync form data when dialog opens or client/project data changes
useEffect(() => {
  if (open) {
    setFormData({
      purchaseOrderNumber: `PO-${quoteId.slice(0, 8)}`,
      contactName: clientData?.name || "",
      email: clientData?.email || "",
      phone: clientData?.phone || "",
      address1: projectData?.address || clientData?.address || "",
      address2: "",
      city: projectData?.city || clientData?.city || "",
      state: projectData?.state || clientData?.state || "",
      postcode: projectData?.postcode || clientData?.postcode || clientData?.zip_code || "",
    });
  }
}, [open, clientData, projectData, quoteId]);
```

### Additional Fix: Client Field Mapping Issue

The client table uses `zip_code` but the form expects `postcode`:

| Client Table Column | Form Field |
|---------------------|------------|
| `name` | `contactName` |
| `email` | `email` |
| `phone` | `phone` |
| `address` | `address1` |
| `city` | `city` |
| `state` | `state` |
| `zip_code` | `postcode` (need to add fallback) |

## Files to Modify

| File | Change |
|------|--------|
| `src/components/integrations/TWCSubmitDialog.tsx` | Add `useEffect` to sync form data when dialog opens; add `zip_code` fallback for postcode |

## Why TWC Products Show as 0

The `twcItems` useMemo at line 99 depends on `quotationData?.items`. If `quotationData` was created from stale quote items (before they were saved with `twc_item_number`), it won't find any TWC products.

The fix above also helps because when the dialog opens, the latest `quotationData` with the saved `twc_item_number` values will be available for the `useMemo` calculation.

## Expected Result After Fix

1. Contact Name: "John Smith"
2. Email: "xeridal650@cameltok.com" 
3. Phone: "447367211583"
4. Items: "2 TWC products"
5. Quote Total: "GBP 487.50"

## Technical Implementation

```typescript
// src/components/integrations/TWCSubmitDialog.tsx

// After line 42, add useEffect:
import { useEffect } from "react"; // Add to existing import

// Inside the component, after useState (line 42):
useEffect(() => {
  if (open) {
    setFormData({
      purchaseOrderNumber: `PO-${quoteId.slice(0, 8)}`,
      contactName: clientData?.name || "",
      email: clientData?.email || "",
      phone: clientData?.phone || "",
      address1: projectData?.address || clientData?.address || "",
      address2: "",
      city: projectData?.city || clientData?.city || "",
      state: projectData?.state || clientData?.state || "",
      postcode: projectData?.postcode || clientData?.postcode || clientData?.zip_code || "",
    });
  }
}, [open, clientData, projectData, quoteId]);
```


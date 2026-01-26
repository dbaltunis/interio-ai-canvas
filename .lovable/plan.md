
# Fix: Collection Creation Requires Vendor

## Problem

When creating a collection, the database requires a `vendor_id` (NOT NULL constraint), but the dialog allows submitting without selecting a vendor - causing the error:

```
null value in column "vendor_id" of relation "collections" violates not-null constraint
```

## Root Cause

In `CreateCollectionFromSelectionDialog.tsx` line 55:
```typescript
vendor_id: vendorId || null,  // This passes NULL when no vendor selected
```

The database schema enforces `vendor_id` as NOT NULL, so this fails.

## Solution Options

### Option A: Make Vendor Required in UI (Recommended)
Since the database requires a vendor, make it a required field in the dialog:

1. Add validation to prevent submission without a vendor
2. Show visual indicator that vendor is required
3. Disable "Create" button until vendor is selected

### Option B: Make vendor_id Nullable in Database
Alter the column to allow NULL values. This would allow collections without a vendor.

**Recommendation**: Option A is better since collections are typically associated with suppliers/vendors (e.g., "TWC Roller Collection", "Warwick Heritage Range").

## Changes Required

**File:** `src/components/inventory/CreateCollectionFromSelectionDialog.tsx`

1. Add validation to `handleCreate` function:
   ```typescript
   if (!vendorId) {
     toast({
       title: "Vendor Required",
       description: "Please select a vendor for this collection",
       variant: "destructive"
     });
     return;
   }
   ```

2. Update the vendor label to show it's required:
   ```tsx
   <Label>Vendor *</Label>
   ```

3. Disable the Create button when no vendor is selected:
   ```tsx
   <Button onClick={handleCreate} disabled={isLoading || !name.trim() || !vendorId}>
   ```

4. Change the mutation call to pass non-null vendor_id:
   ```typescript
   vendor_id: vendorId,  // Now guaranteed to be non-null
   ```

## Also Check

The same issue may exist in:
- `UnifiedInventoryDialog.tsx` quick create collection
- `CategoryManager.tsx` collection creation

All collection creation paths need to require a vendor selection.

## Expected Outcome

- User cannot create a collection without selecting a vendor
- Clear UI feedback shows vendor is required
- No more database constraint errors

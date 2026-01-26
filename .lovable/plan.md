

# Make Collections Work Without Vendor

## Problem
The database currently requires `vendor_id` to be NOT NULL, but there are valid use cases for collections without vendors:
- Custom collections ("Client Favorites", "Sample Room")
- When the user IS the vendor/manufacturer
- Internal organization collections

## Solution
Make `vendor_id` nullable in the database and update the UI accordingly.

## Changes Required

### 1. Database Migration
Alter the `collections` table to allow NULL vendor_id:
```sql
ALTER TABLE collections ALTER COLUMN vendor_id DROP NOT NULL;
```

### 2. Update CreateCollectionFromSelectionDialog.tsx
- Remove the vendor validation check we just added
- Change label back to "Vendor (Optional)"
- Remove the disabled condition for !vendorId
- Keep vendor_id as optional in the mutation

### 3. Update UnifiedInventoryDialog.tsx
- Remove vendor validation in quick create
- Allow creating collection without vendor selected

### 4. Update UI Display (Already Handles Null)
The collection cards and lists already handle `collection.vendor?.name` with optional chaining, so no changes needed there.

## Files to Modify
| File | Change |
|------|--------|
| Database migration | `ALTER COLUMN vendor_id DROP NOT NULL` |
| `CreateCollectionFromSelectionDialog.tsx` | Remove vendor requirement |
| `UnifiedInventoryDialog.tsx` | Remove vendor requirement in quick create |

## Expected Outcome
- Collections can be created with or without a vendor
- "TWC Roller Collection" still works (with vendor)
- "Client Favorites" also works (without vendor)
- No more constraint errors


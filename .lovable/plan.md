

# Hide Supplier Filter for Dealers & Add Permission-Based Visibility

## Investigation Findings

### What the Warning Icon (⚠️) Means

The warning icon indicates **"orphan" suppliers** - inventory items that have a text `supplier` field but are NOT linked to a formal vendor record via `vendor_id`. 

| Supplier Type | Icon | Meaning |
|--------------|------|---------|
| `vendor` | (none) | Properly linked to vendors table |
| `supplier_text` | ⚠️ | Text-only, not in vendors table |

This is a **data quality indicator** - these suppliers should ideally be migrated to proper vendor records for better management.

---

## Proposed Changes

### 1. Hide Supplier Section in FilterButton for Dealers

The `FilterButton.tsx` component (used in Library and Inventory Selection Panel) currently shows the supplier filter to everyone. We need to hide it for dealers.

**File:** `src/components/library/FilterButton.tsx`

```typescript
// Add import
import { useIsDealer } from "@/hooks/useIsDealer";

// Inside FilterButton component
const { data: isDealer } = useIsDealer();

// Wrap the Supplier filter section (lines 305-337) with condition
{!isDealer && (
  <div className="space-y-2">
    <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide flex items-center gap-1">
      <Building2 className="h-3 w-3" />
      Supplier
    </label>
    {/* ... rest of supplier select ... */}
  </div>
)}
```

### 2. Permission-Based Visibility (Optional Enhancement)

For more granular control, we could use the `view_vendors` permission instead of just `isDealer`:

| Role | Has `view_vendors` | Should See Suppliers? |
|------|-------------------|----------------------|
| System Owner | ✅ | Yes |
| Owner | ✅ | Yes |
| Admin | ✅ | Yes |
| Manager | ❌ | No (by default) |
| Staff | ❌ | No |
| User | ❌ | No |
| Dealer | ❌ | No |

**Alternative approach using permission:**
```typescript
import { useHasPermission } from "@/hooks/usePermissions";

const canViewVendors = useHasPermission('view_vendors');

{canViewVendors && (
  // Supplier filter section
)}
```

This gives more flexibility - account owners can grant `view_vendors` to specific staff if needed.

---

## Files to Modify

| File | Change |
|------|--------|
| `src/components/library/FilterButton.tsx` | Add dealer/permission check to hide Supplier section |

---

## Recommendation

I recommend using the **`useIsDealer` approach** for now since:
1. `InventorySupplierFilter.tsx` already uses this pattern
2. It maintains consistency across the codebase
3. Dealers are the primary role needing this restriction

The permission-based approach (`view_vendors`) would be a future enhancement if you want finer control for staff/managers.

---

## About the Warning Icons

No code changes needed for the warning icons - they are **intentional data quality indicators**. To remove them, you would need to:

1. Create proper vendor records for each orphan supplier
2. Update inventory items to use `vendor_id` instead of text `supplier`
3. This is a data migration task, not a code change


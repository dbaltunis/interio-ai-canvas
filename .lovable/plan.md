

# Supplier Ordering Dropdown System

## Overview
Implementing Daniel's mockup-based approach for a **"Supplier Ordering" dropdown button** in the job header, with automatic supplier detection, status-based activation, and order tracking.

This design is simpler and more intuitive than my previous status-trigger proposal while achieving the same goals.

---

## Comparison: Daniel's Approach vs My Previous Plan

| Aspect | Daniel's Mockup | My Previous Plan |
|--------|----------------|------------------|
| **UI Location** | Dropdown between Contact and Status | Separate button + status trigger |
| **Activation** | Active when status = "Approved" | Active when status has `supplier_trigger` |
| **Supplier Detection** | Auto-detect from quote items | Same |
| **Status Configuration** | None needed | Required in Settings |
| **User Complexity** | Low - just change status to Approved | High - configure triggers in Settings |

**Winner: Daniel's approach** - simpler, cleaner, less configuration needed.

---

## Architecture

```text
┌──────────────────────────────────────────────────────────────────────────┐
│                         Job Detail Header                                 │
│  ┌───────┐ ┌─────────────────┐ ┌─────────────────────┐ ┌──────────────┐  │
│  │← Jobs │ │Demo Client      │ │Contact              │ │Supplier      │  │
│  │       │ │08/12/2025       │ │                     │ │Ordering ▼    │  │
│  └───────┘ └─────────────────┘ └─────────────────────┘ │              │  │
│                                                        │ (dropdown)   │  │
│                              ┌─────────────────────────┴──────────────┤  │
│                              │ TWC                                    │  │
│                              │ > Ordered ✓ (greyed out)               │  │
│                              │────────────────────────────────────────│  │
│                              │ Norman                                 │  │
│                              │ > Send Order (clickable)               │  │
│                              │────────────────────────────────────────│  │
│                              │ Capitol                                │  │
│                              │ > Send Order (clickable)               │  │
│                              └────────────────────────────────────────┘  │
└──────────────────────────────────────────────────────────────────────────┘
```

---

## How Supplier Detection Works

Quote items store supplier information in two ways:

1. **TWC Products**: Items have `metadata.twc_item_number` in the `quote_items.product_details` JSON
2. **Inventory Items**: Linked via `quote_items.inventory_item_id` → `inventory.vendor_id` → `vendors.name`

The system will scan all quote items and build a list of unique suppliers used in the job:

```typescript
// Pseudo-code for supplier detection
const detectSuppliers = (quoteItems, inventoryItems, vendors) => {
  const suppliers = new Map();
  
  quoteItems.forEach(item => {
    // Check for TWC item
    if (item.product_details?.twc_item_number || 
        item.product_details?.metadata?.twc_item_number) {
      suppliers.set('twc', { name: 'TWC', items: [...] });
    }
    
    // Check for vendor-linked inventory item
    if (item.inventory_item_id) {
      const inventoryItem = inventoryItems.find(i => i.id === item.inventory_item_id);
      if (inventoryItem?.vendor_id) {
        const vendor = vendors.find(v => v.id === inventoryItem.vendor_id);
        suppliers.set(vendor.id, { name: vendor.name, items: [...] });
      }
    }
  });
  
  return suppliers;
};
```

---

## Implementation Details

### Phase 1: Create SupplierOrderingDropdown Component

**New File: `src/components/jobs/SupplierOrderingDropdown.tsx`**

```typescript
interface SupplierOrderingDropdownProps {
  projectId: string;
  projectStatus: string; // "approved", "draft", etc.
  quoteItems: QuoteItem[];
  activeQuoteId: string;
  clientData?: any;
  projectData?: any;
}

// States:
// 1. Greyed out (disabled) - when status !== approved/accepted
// 2. Active (enabled) - when status = approved/accepted
// 3. Dropdown shows: Each supplier with "Send Order" or "Ordered ✓"
```

**Key Features:**
- Dropdown is **disabled** (greyed out) when project status is NOT "Approved" or "Accepted"
- Dropdown is **enabled** when project status IS "Approved" or "Accepted"
- Lists all detected suppliers from quote items
- Shows "> Send Order" (green, clickable) for suppliers not yet ordered
- Shows "> Ordered" (grey, disabled) for suppliers already ordered
- Clicking "Send Order" opens confirmation dialog, then the supplier-specific submit dialog

---

### Phase 2: Add "supplier_orders" Column to Quotes Table

**Database Migration:**

```sql
-- Add supplier_orders JSONB to track multiple supplier orders per quote
ALTER TABLE quotes ADD COLUMN IF NOT EXISTS supplier_orders JSONB DEFAULT '{}';

-- Structure: { "twc": { status: "ordered", order_id: "123", submitted_at: "..." }, 
--              "vendor_uuid": { status: "ordered", order_id: "456", ... } }
```

This allows tracking orders to multiple suppliers per quote (TWC, Norman, Capitol, etc.).

---

### Phase 3: Integrate into Job Header

**File: `src/components/jobs/JobDetailPage.tsx`**

Add the dropdown between "Contact" button and status dropdown:

```typescript
// Around line 898, after Contact button:

<SupplierOrderingDropdown
  projectId={project.id}
  projectStatus={project.status}
  projectStatusId={project.status_id}
  quoteItems={quotationData?.items || []}
  activeQuoteId={activeQuoteId}
  clientData={client}
  projectData={project}
/>

<JobStatusDropdown ... />
```

---

### Phase 4: Status-Based Activation Logic

The dropdown checks if the current project status name is one of the "approved" statuses:

```typescript
const APPROVED_STATUSES = ['approved', 'accepted', 'order confirmed', 'materials ordered'];

const isApproved = APPROVED_STATUSES.some(s => 
  currentStatusName?.toLowerCase().includes(s.toLowerCase())
);

// Or: Check if status has action = 'locked' or 'progress_only' (implies approved)
const statusDetails = jobStatuses.find(s => s.id === project.status_id);
const isApproved = statusDetails?.action === 'locked' || 
                   statusDetails?.action === 'progress_only';
```

---

### Phase 5: Confirmation Dialog

**New Component: `src/components/jobs/SupplierOrderConfirmDialog.tsx`**

Matches Daniel's mockup (Screenshot 4):

```typescript
<AlertDialog>
  <AlertDialogContent>
    <AlertDialogHeader>
      <AlertDialogTitle>Send Order</AlertDialogTitle>
      <AlertDialogDescription>
        Are you sure you want to order all {supplierName} supplied blinds in this job?
        This action cannot be undone.
      </AlertDialogDescription>
    </AlertDialogHeader>
    <AlertDialogFooter>
      <AlertDialogCancel>Cancel</AlertDialogCancel>
      <AlertDialogAction onClick={handleSendOrder} className="bg-red-600">
        Send Order
      </AlertDialogAction>
    </AlertDialogFooter>
  </AlertDialogContent>
</AlertDialog>
```

---

### Phase 6: Jobs Table Supplier Column (Optional Enhancement)

**File: `src/components/jobs/JobsTableView.tsx`**

Add a "Supplier Status" column showing order status for each job:

| Job | Client | Status | Supplier Orders | Actions |
|-----|--------|--------|-----------------|---------|
| J-001 | Greg | Approved | TWC: Ordered ✓ | ... |
| J-002 | Sarah | Planning | — | ... |

---

## User Flow

1. **Create quote with products** (some from TWC, some from other vendors)
2. **Status = Draft/Quote Sent** → "Supplier Ordering" dropdown is **greyed out**
3. **Status changes to "Approved"** → Dropdown becomes **active**
4. **Click dropdown** → See list of suppliers: TWC, Norman, Capitol
5. **Click "Send Order" on TWC** → Confirmation dialog appears
6. **Confirm** → TWC Submit Dialog opens with delivery details
7. **Submit** → Order sent to TWC API
8. **Dropdown updates** → TWC now shows "> Ordered" (greyed out)
9. **Other suppliers** still show "> Send Order" until ordered

---

## Files to Create/Modify

| File | Action | Description |
|------|--------|-------------|
| `src/components/jobs/SupplierOrderingDropdown.tsx` | **CREATE** | Main dropdown component |
| `src/components/jobs/SupplierOrderConfirmDialog.tsx` | **CREATE** | Confirmation dialog |
| `src/hooks/useProjectSuppliers.ts` | **CREATE** | Hook to detect suppliers from quote items |
| `src/hooks/useActiveSupplierIntegrations.ts` | **CREATE** | Hook to check active production integrations |
| `supabase/migrations/xxx_add_supplier_orders.sql` | **CREATE** | Add supplier_orders column |
| `src/components/jobs/JobDetailPage.tsx` | **MODIFY** | Add dropdown to header |
| `src/components/integrations/TWCSubmitDialog.tsx` | **MODIFY** | Update to store in supplier_orders JSON |
| `src/components/jobs/JobsTableView.tsx` | **MODIFY** | Add supplier status column (optional) |

---

## Future Extensibility

When adding new suppliers (Norman, Capitol, RFMS, etc.):

1. Create `NormanSubmitDialog.tsx`, `CapitolSubmitDialog.tsx`
2. Add integration type to `integration_settings` table
3. The `SupplierOrderingDropdown` automatically detects and displays them

Each supplier has its own:
- Detection logic (vendor_id matching or metadata field)
- Submit dialog (API format differs per supplier)
- Order tracking (stored in `supplier_orders` JSON)

---

## Technical Notes

- **Existing TWC infrastructure**: The `twc-submit-order` edge function and `TWCSubmitDialog` are already implemented
- **Quote tracking fields**: `quotes.twc_order_id`, `twc_order_status`, `twc_submitted_at`, `twc_response` already exist
- **Multi-supplier support**: New `supplier_orders` JSONB column allows tracking orders to multiple suppliers
- **Production mode check**: Only show suppliers with active integration + `environment: 'production'`
- **Multi-account SaaS**: Each account has its own integrations; suppliers are filtered by `account_owner_id`

---

## Confirmation Before Proceeding

This plan follows Daniel's mockups closely. Key decisions to confirm:

1. **Activation logic**: Should dropdown activate on specific status names ("Approved", "Accepted") or on status `action` property (`locked`, `progress_only`)?
   
2. **Multiple quotes**: If a project has multiple quote versions, which one do we order from? (Suggest: the latest/active version)

3. **Jobs table column**: Want the "Supplier Orders" column added to the Jobs list view now, or as a follow-up?


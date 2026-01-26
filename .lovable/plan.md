

# Enhanced Supplier Ordering Dropdown - Always Visible with Test Mode Warnings

## Overview
This update modifies the Supplier Ordering dropdown to:
1. Always show in the header when any supplier integrations exist
2. Show test-mode integrations with a clear warning that they are not for production orders
3. Only enable ordering for production-mode suppliers
4. Match Daniel's mockup visual style (greyed out when disabled)

---

## Current vs. New Behavior

| Scenario | Current Behavior | New Behavior |
|----------|------------------|--------------|
| No integrations | Hidden | Hidden (correct) |
| Only test-mode integrations | Hidden | Visible but shows "Testing Mode" warning |
| Production integrations, no products | Hidden | Visible, greyed out, shows "No products detected" |
| Production integrations with products | Visible | Visible, active when status is Approved |

---

## Implementation Details

### 1. Modify `useActiveSupplierIntegrations` Hook

**File: `src/hooks/useActiveSupplierIntegrations.ts`**

Update to return BOTH production and test-mode integrations, clearly labeled:

```typescript
export interface SupplierIntegration {
  type: 'twc' | 'rfms' | 'tig_pim' | string;
  name: string;
  isProduction: boolean;  // true = production, false = testing
  apiUrl?: string;
}

// New: Also export a hook that returns ALL active integrations (not just production)
export const useAllSupplierIntegrations = () => {
  // Returns both production AND staging integrations
  // Each marked with isProduction: true/false
};
```

Changes:
- Add new function to fetch ALL active integrations (production + staging)
- Mark each with `isProduction: true/false` 
- Keep existing `useActiveSupplierIntegrations` for backward compatibility (returns only production)

### 2. Modify `SupplierOrderingDropdown` Component

**File: `src/components/jobs/SupplierOrderingDropdown.tsx`**

Major changes:

**a) Visibility Logic:**
```typescript
// Show dropdown if ANY integrations exist (production or test)
const { data: allIntegrations = [] } = useAllSupplierIntegrations();
const { data: productionIntegrations = [] } = useActiveSupplierIntegrations();

// Hide completely only if no integrations at all
if (allIntegrations.length === 0) {
  return null;
}
```

**b) Test Mode Warning Banner:**
When integrations exist but all are in test mode:
```typescript
{productionIntegrations.length === 0 && allIntegrations.length > 0 && (
  <div className="px-2 py-1.5 text-xs text-amber-600 bg-amber-50 border-b">
    <AlertTriangle className="h-3 w-3 inline mr-1" />
    All suppliers in Testing Mode - orders won't be processed
  </div>
)}
```

**c) Individual Supplier Status Display:**
Each supplier in dropdown shows:
- Production: "Send Order" (clickable) or "Ordered ✓" (greyed)
- Testing: "Testing Mode" badge (orange, non-clickable)

**d) Enhanced Disabled States:**
- Dropdown greyed out when: status is Draft/Pending OR no production integrations
- Dropdown shows "Testing" badge when all integrations are test mode
- Clear tooltip explaining why disabled

### 3. Button Visual States

Following Daniel's mockup:

| State | Button Appearance | Dropdown Behavior |
|-------|-------------------|-------------------|
| Draft/Pending status | Grey, disabled | Shows "Available when approved" tooltip |
| No products detected | Grey, disabled | Shows "No supplier products in quote" |
| All test mode | Visible but with amber warning | Shows warning, suppliers marked as "Testing" |
| Ready to order | Active, accent color | Lists suppliers with "Send Order" |
| All ordered | Green with checkmark | Shows "Ordered ✓" for each supplier |

---

## Updated Component Structure

```typescript
export function SupplierOrderingDropdown({ ... }) {
  // 1. Fetch ALL integrations (production + test)
  const { data: allIntegrations = [] } = useAllSupplierIntegrations();
  const { data: productionIntegrations = [] } = useActiveSupplierIntegrations();
  
  // 2. Detect suppliers from quote items
  const { suppliers, hasTwcProducts, hasVendorProducts } = useProjectSuppliers(...);
  
  // 3. Determine visibility and state
  const hasAnyIntegration = allIntegrations.length > 0;
  const hasProductionIntegration = productionIntegrations.length > 0;
  const allTestMode = hasAnyIntegration && !hasProductionIntegration;
  const hasProducts = suppliers.length > 0;
  
  // 4. Hide only if no integrations at all
  if (!hasAnyIntegration) return null;
  
  // 5. Determine disabled state
  const isDisabled = !isApprovedStatus || allTestMode || !hasProducts;
  
  // 6. Get appropriate label
  const getButtonLabel = () => {
    if (allTestMode) return "Supplier Ordering (Test)";
    if (!hasProducts) return "Supplier Ordering";
    if (allOrdersSubmitted) return "Ordered";
    return "Supplier Ordering";
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger>
        <Button disabled={isDisabled} ...>
          {/* Button with appropriate styling */}
        </Button>
      </DropdownMenuTrigger>
      
      <DropdownMenuContent>
        {/* Test mode warning banner if applicable */}
        {allTestMode && <TestModeWarning />}
        
        {/* No products message if applicable */}
        {!hasProducts && hasProductionIntegration && <NoProductsMessage />}
        
        {/* List of suppliers */}
        {suppliers.map(supplier => (
          <SupplierMenuItem 
            supplier={supplier}
            isTestMode={!productionIntegrations.some(p => p.type === supplier.type)}
          />
        ))}
        
        {/* If no detected products but integrations exist */}
        {suppliers.length === 0 && (
          <EmptyState message="No supplier products in this quote" />
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
```

---

## Files to Modify

| File | Changes |
|------|---------|
| `src/hooks/useActiveSupplierIntegrations.ts` | Add `useAllSupplierIntegrations` hook that returns both production and test-mode integrations |
| `src/components/jobs/SupplierOrderingDropdown.tsx` | Update visibility logic, add test mode warnings, show when no products with appropriate message |
| `src/hooks/useProjectSuppliers.ts` | Minor: ensure it handles edge cases gracefully |

---

## Dropdown States Visual Reference

```text
┌─────────────────────────────────────────────────┐
│  State 1: All Test Mode                         │
│  ┌─────────────────────────────────────────┐    │
│  │ Supplier Ordering ▼   (amber border)   │    │
│  └─────────────────────────────────────────┘    │
│         │                                       │
│         ▼                                       │
│  ┌─────────────────────────────────────────┐    │
│  │ ⚠️ Testing Mode - orders not processed │    │
│  ├─────────────────────────────────────────┤    │
│  │ TWC Online                              │    │
│  │   ⚠️ Testing Mode                       │    │
│  └─────────────────────────────────────────┘    │
└─────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────┐
│  State 2: Production Mode, No Products          │
│  ┌─────────────────────────────────────────┐    │
│  │ Supplier Ordering ▼   (grey, disabled)  │    │
│  └─────────────────────────────────────────┘    │
│         │                                       │
│         ▼                                       │
│  ┌─────────────────────────────────────────┐    │
│  │ Suppliers in this job                   │    │
│  ├─────────────────────────────────────────┤    │
│  │ ℹ️ No supplier products detected        │    │
│  │    Add TWC products to enable ordering  │    │
│  └─────────────────────────────────────────┘    │
└─────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────┐
│  State 3: Production Mode, Has Products         │
│  ┌─────────────────────────────────────────┐    │
│  │ Supplier Ordering ▼   (active)         │    │
│  └─────────────────────────────────────────┘    │
│         │                                       │
│         ▼                                       │
│  ┌─────────────────────────────────────────┐    │
│  │ Suppliers in this job                   │    │
│  ├─────────────────────────────────────────┤    │
│  │ TWC Online                              │    │
│  │   ▶ Send Order (green badge)            │    │
│  │   3 items                               │    │
│  └─────────────────────────────────────────┘    │
└─────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────┐
│  State 4: Mixed Mode (some test, some prod)     │
│  ┌─────────────────────────────────────────┐    │
│  │ Supplier Ordering ▼   (active)         │    │
│  └─────────────────────────────────────────┘    │
│         │                                       │
│         ▼                                       │
│  ┌─────────────────────────────────────────┐    │
│  │ Suppliers in this job                   │    │
│  ├─────────────────────────────────────────┤    │
│  │ TWC Online                              │    │
│  │   ▶ Send Order                          │    │
│  ├─────────────────────────────────────────┤    │
│  │ RFMS Core                               │    │
│  │   ⚠️ Testing Mode                       │    │
│  └─────────────────────────────────────────┘    │
└─────────────────────────────────────────────────┘
```

---

## Technical Details

### Data Flow for TWC Orders

The existing TWC order submission follows industry-standard patterns:

1. **Quote items detection**: Scans `quote_items.product_details.twc_item_number` or `quote_items.metadata.twc_item_number`
2. **Integration credentials**: Retrieved from `integration_settings` filtered by `environment = 'production'`
3. **Order submission**: Edge function `twc-submit-order` formats data per TWC API spec and posts to their endpoint
4. **Response tracking**: Stores `twc_order_id`, `twc_order_status`, `twc_submitted_at` on the quote record
5. **Multi-supplier tracking**: New `supplier_orders` JSONB column supports tracking orders to multiple suppliers

This matches how competitors (Drape & Blind Software, Curtain Workroom Manager, etc.) integrate with TWC - the industry standard is:
- Automatic product detection from catalog syncs
- Status-gated ordering (must be approved first)
- Order confirmation with tracking ID from supplier
- Status updates (submitted → confirmed → manufacturing → shipped)

---

## Testing Scenarios

1. **Account with TWC in test mode only**: Dropdown visible with amber warning, "Testing Mode" badge
2. **Account with TWC in production mode, no TWC products**: Dropdown visible but greyed out with "No products" message
3. **Account with TWC in production, TWC products, Draft status**: Dropdown visible but greyed out, tooltip shows "Available when approved"
4. **Account with TWC in production, TWC products, Approved status**: Dropdown active, can send orders
5. **Account with multiple suppliers (TWC production, RFMS test)**: Shows both, TWC has "Send Order", RFMS has "Testing Mode"


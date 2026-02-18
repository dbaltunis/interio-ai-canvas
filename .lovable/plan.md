

## Display Selling Prices Everywhere, Cost/Markup Only for Authorized Users

### The Problem

After the smart price base fix, the calculator correctly uses `cost_price` (e.g., 145/m) as the math base. But this cost price now leaks into the **visible formula details** shown to all users:

```
Fabric: 22.05m x 145/m = 3,197   <-- everyone sees cost price!
Quote Price: 6,394               <-- doubled with markup
```

This is a privacy and UX issue:
- **Dealers** should never see cost prices
- **Staff** without cost visibility permission should not see them
- **Admins** feel uncomfortable because a client looking over their shoulder sees the cost price, not the selling price
- The "Quote Price" should match what appears on the client's quote

### The Correct Approach

**Calculation layer**: Keep using `cost_price` as the base (for correct markup math) -- no changes here.

**Display layer**: Always show `selling_price` (or the final marked-up price) in formula details, and only reveal the cost/markup breakdown in the dedicated section for authorized users.

### What Changes

#### 1. CostCalculationSummary.tsx -- Fabric details string (lines 1104-1132)

Currently the details string is built with `fabricDisplayData.pricePerMeter` which is now `cost_price`:
```
"22.05m x 145/m = 3,197"
```

**Fix**: Build TWO versions of the details string:
- **Display details** (shown to everyone): uses selling price per meter
- **Cost details** (shown only to authorized users in markup section): uses cost price

```typescript
// Calculate the display price (what client pays per meter)
const displayPricePerUnit = fabricHasBothPrices
  ? (fabricToUse?.selling_price || pricePerUnit)  // Show selling price
  : pricePerUnit;  // Already at selling price (Scenario B/D)

// Display formula uses selling price
fabricDetails = `${formatFabricLength(meters)} x ${formatPricePerFabricUnit(displayPricePerUnit)} = ${formatPrice(meters * displayPricePerUnit)}`;
```

Then in the table item, the `price` field stays as cost-based (for internal math), but `details` shows selling-price-based formula. The "Price" column already shows `sellingPrice` correctly.

#### 2. CostCalculationSummary.tsx -- Align the sellingPrice with the display

When `hasBothPrices` is true (Scenario A), the table item should show:
- **Details**: `"22.05m x 290/m = 6,394"` (selling price formula)
- **Price column**: 6,394 (the selling price -- same number)
- **Cost Total row** (authorized only): 3,197 (the cost total)

This means the `sellingPrice` for the item should equal `meters x displayPricePerUnit`, and the `price` (cost) should remain `fabricCost` (meters x cost_price).

#### 3. DynamicWindowWorksheet.tsx -- fabricDisplayData (line 3683-3693)

Add a `displayPricePerMeter` field alongside `pricePerMeter`:

```typescript
fabricDisplayData={{
  linearMeters: perPieceMeters,
  totalMeters: totalMeters,
  pricePerMeter: pricePerMeter,           // cost-based (for internal math)
  displayPricePerMeter: hasBothPrices      // selling-based (for UI display)
    ? selectedFabricItem.selling_price
    : pricePerMeter,
  ...
}}
```

#### 4. QuoteSummaryTable.tsx -- Details column already respects canViewCosts

The table already has logic (line 154) to strip price info from details for dealers:
```typescript
const displayDetails = canViewCosts ? item.details : extractQuantityOnly(item.details);
```

With the fix above, even `canViewCosts=true` users (admins) will see selling prices in the formula, which is the desired behavior. The cost breakdown is only in the dedicated "Cost Total" row and markup indicators.

### Summary of Display Behavior After Fix

| Element | Everyone Sees | Authorized Users Also See |
|---|---|---|
| Fabric formula | "22.05m x 290/m = 6,394" | Same |
| Price column | 6,394 (selling) | Same |
| Cost Total row | Hidden | 3,197 (cost total) |
| Markup indicator | Hidden | "(100% markup)" |
| Quote Price | 6,394 | 6,394 |

### Files to Change

| File | Change |
|---|---|
| `CostCalculationSummary.tsx` | Use selling price in fabric details string; keep cost price for internal math only |
| `DynamicWindowWorksheet.tsx` | Add `displayPricePerMeter` to fabricDisplayData |
| `CostCalculationSummary.tsx` interface | Add `displayPricePerMeter` to FabricDisplayData type |

### What Does NOT Change

- The **calculation logic** (smart price base) stays exactly as implemented
- The **save/persist logic** stays the same (cost_price as base, markup metadata saved)
- The **markup resolution** stays the same
- The **QuoteSummaryTable** component itself needs no changes (it already uses `sellingPrice` for the Price column)




# Comprehensive Testing Report: Payment Calculations, Tax Modes & CSV Export

## Executive Summary

After extensive investigation of the codebase and database, I've identified **4 critical bugs** that need to be fixed:

1. **Fixed Amount Deposit - Save Button Not Appearing** (User Reported)
2. **Fixed Amount Not Loading From Saved Config**
3. **CSV Export Ignores Tax-Inclusive Mode**
4. **Payment Summary in InlinePaymentConfig Still Shows Incorrect Discount**

---

## Bug #1: Fixed Amount Deposit - Save Button Issue

### Root Cause
The `hasChanges` logic has TWO issues:

**Issue A - Initial Fixed Amount of 0:**
```typescript
// Line 58 in InlinePaymentConfig.tsx
const hasFixedAmountChanges = useFixedAmount && fixedAmount > 0;
```
When a user clicks "Fixed Amount" button, `useFixedAmount` becomes true, but `fixedAmount` is still 0. Since `fixedAmount > 0` is false, `hasChanges` remains false and the Save button doesn't appear until the user actually enters a value.

**Issue B - Never Restores Fixed Amount Mode:**
```typescript
// Lines 44-51 - Loading saved config
useEffect(() => {
  if (currentPayment) {
    setPaymentType(currentPayment.type);
    if (currentPayment.type === 'deposit' && currentPayment.percentage) {
      setDepositPercentage(currentPayment.percentage);
    }
    // ❌ MISSING: setUseFixedAmount and setFixedAmount when percentage is null!
  }
}, [currentPayment]);
```
When loading a saved fixed amount payment config (where `percentage` is null), the code never sets `useFixedAmount = true` or loads the saved `amount`.

### Fix Required
```typescript
// Update useEffect to properly load fixed amount config
useEffect(() => {
  if (currentPayment) {
    setPaymentType(currentPayment.type);
    if (currentPayment.type === 'deposit') {
      if (currentPayment.percentage) {
        // Saved as percentage
        setUseFixedAmount(false);
        setDepositPercentage(currentPayment.percentage);
      } else if (currentPayment.amount) {
        // Saved as fixed amount
        setUseFixedAmount(true);
        setFixedAmount(currentPayment.amount);
      }
    }
  }
}, [currentPayment]);

// Update hasChanges for initial mode selection
useEffect(() => {
  if (!currentPayment) {
    // Show save button when deposit mode is selected (even before entering amount)
    const isDepositMode = paymentType === 'deposit';
    setHasChanges(isDepositMode);
    return;
  }
  // ... rest of logic
}, [paymentType, depositPercentage, currentPayment, useFixedAmount, fixedAmount]);
```

---

## Bug #2: Payment Summary Shows Incorrect Discount (UI Issue)

### Current Code (Lines 253-264)
```typescript
{discountAmount > 0 && (
  <div className="flex justify-between text-sm text-green-600">
    <span>Discount Applied:</span>
    <span>-{formatCurrency(discountAmount, currency)}</span>
  </div>
)}
```

### Problem
The `InlinePaymentConfig` receives `discountAmount = 0` because it now receives `totalAfterDiscount` directly (as per earlier fix). However, the UI still tries to show the discount line.

Since the total already has the discount applied, but the component doesn't know the original total, it can't accurately display the discount breakdown.

### Fix Required
Either:
1. Pass `originalTotal` and `discountedTotal` separately, OR
2. Remove the discount display section entirely since it's informational only

---

## Bug #3: CSV Export Ignores Tax-Inclusive Mode

### Location: `src/utils/invoiceExport.ts` lines 453-456

### Current Code
```typescript
// Apply discount to get actual subtotal
const subtotalAfterDiscount = Math.max(0, itemsSubtotal - discountAmount);
const taxAmount = subtotalAfterDiscount * (taxRate / 100);
const total = subtotalAfterDiscount + taxAmount;
```

### Problem
This always calculates tax as tax-exclusive, ignoring the `tax_inclusive` setting from `businessSettings.pricing_settings`.

For tax-inclusive businesses (NZ, AU, UK), this produces:
- Wrong subtotal (should be net, not gross)
- Wrong tax amount (calculated on gross instead of extracted from it)
- Potentially wrong total

### Fix Required
```typescript
const pricingSettings = businessSettings?.pricing_settings as any;
const taxInclusive = pricingSettings?.tax_inclusive || false;

let subtotalAfterDiscount: number;
let taxAmount: number;
let total: number;

if (taxInclusive) {
  // Items include tax - extract net value
  const grossSubtotalAfterDiscount = Math.max(0, itemsSubtotal - discountAmount * (1 + taxRate / 100));
  subtotalAfterDiscount = grossSubtotalAfterDiscount / (1 + taxRate / 100);
  total = grossSubtotalAfterDiscount;
  taxAmount = total - subtotalAfterDiscount;
} else {
  // Tax-exclusive (standard)
  subtotalAfterDiscount = Math.max(0, itemsSubtotal - discountAmount);
  taxAmount = subtotalAfterDiscount * (taxRate / 100);
  total = subtotalAfterDiscount + taxAmount;
}
```

---

## Bug #4: Database Evidence of Calculation Inconsistencies

### Sample Data Analysis

| Quote | Subtotal | Discount% | Discount Amt | Tax Rate | Expected Discount | Actual | Issue |
|-------|----------|-----------|--------------|----------|-------------------|--------|-------|
| DRAFT-013 | $296.92 | 10% | $19.85 | 15% | $29.69 | $19.85 | Discount applied to different base? |
| DRAFT-002 | $271.15 | 20% | $54.23 | 15% | $54.23 | $54.23 | ✓ Correct |
| DRAFT-631 | $746.65 | 35% | $261.33 | 0% | $261.33 | $261.33 | ✓ Correct |

The inconsistency in DRAFT-013 suggests the discount was applied to a different subtotal (possibly pre-markup cost instead of selling price). This may be a historical data issue.

---

## Test Scenarios for Verification

### Scenario 1: Tax-Exclusive Mode (Default)
- **Settings**: tax_inclusive = false, tax_rate = 15%
- **Subtotal**: $100.00
- **Discount**: 10% ($10.00)
- **Expected Results**:
  - Discounted Subtotal: $90.00
  - GST: $13.50
  - **Total: $103.50**
  - 50% Deposit: **$51.75**

### Scenario 2: Tax-Inclusive Mode (NZ/AU)
- **Settings**: tax_inclusive = true, tax_rate = 15%
- **Display Total**: $115.00 (= $100 net + $15 GST)
- **Discount**: 10% of net ($10.00)
- **Expected Results**:
  - Discounted Net: $90.00
  - GST: $13.50
  - **Total After Discount: $103.50**
  - 50% Deposit: **$51.75**

### Scenario 3: Fixed Amount Deposit
- **Total After Discount**: $103.50
- **Fixed Deposit**: $50.00
- **Expected**:
  - Payment Required: **$50.00**
  - Balance Due: **$53.50**
  - "Save Configuration" button MUST appear when:
    1. User switches to "Deposit Payment"
    2. User clicks "Fixed Amount"
    3. User enters any amount

### Scenario 4: CSV Export Validation
- Export a quote with discount in both tax modes
- Verify CSV contains:
  - Correct subtotal (pre-tax for tax-exclusive, net for tax-inclusive)
  - Correct discount amount
  - Correct tax calculation
  - Correct total matching UI

---

## Files to Modify

| File | Bug | Change Required |
|------|-----|-----------------|
| `src/components/jobs/quotation/InlinePaymentConfig.tsx` | #1, #2 | Fix loading of fixed amount, update hasChanges logic |
| `src/utils/invoiceExport.ts` | #3 | Add tax_inclusive handling to prepareInvoiceExportData |

---

## Implementation Steps

### Step 1: Fix InlinePaymentConfig Fixed Amount Loading
- Update the `useEffect` that loads `currentPayment` to properly restore fixed amount mode
- Ensure `useFixedAmount` and `fixedAmount` are set when percentage is null but amount exists

### Step 2: Fix hasChanges Logic
- Show Save button when user switches to deposit mode even before entering amount
- Track mode changes separately from value changes

### Step 3: Fix CSV Export Tax-Inclusive Handling
- Add tax_inclusive detection from businessSettings
- Update calculation logic to handle both modes
- Ensure exported totals match UI totals exactly

### Step 4: Verify with Test Cases
- Test all 4 scenarios above
- Verify CSV exports match UI in both tax modes

---

## Expected Outcomes After Fix

1. **Save Button**: Appears immediately when switching to Fixed Amount mode in deposits
2. **Saved Config Loading**: Fixed amount configs properly restore when re-opening payment panel
3. **CSV Export**: Correctly handles tax-inclusive pricing for Xero/QuickBooks imports
4. **Calculation Consistency**: All calculations match between UI, payment processing, and CSV export


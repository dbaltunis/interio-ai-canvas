

# Fix: Client Edit, Date Format, Payment Terms, and Payment Summary Issues

## Summary

This plan addresses 4 distinct bugs found during testing:

1. **Clients > Details: Country = USA, can't edit** - Missing State/Zip fields in edit form
2. **Date format incorrect** - Multiple areas use raw JavaScript `.toLocaleDateString()` instead of user preferences
3. **Payment terms: cannot save fixed deposit amount** - Investigation needed
4. **Configure Payment > Payment summary** - Issue needs clarification

---

## Issue 1: Client Edit Form Missing Fields

### Problem
The client edit form in `ClientProfilePage.tsx` is missing `state` and `zip_code` fields. The grid layout only shows City and Country side-by-side, but state/zip are required for complete address data.

### Root Cause
Lines 332-350 in `ClientProfilePage.tsx` show a 2-column grid with City and Country, but the database schema includes `state` and `zip_code` fields that were never added to the edit form.

### Solution
Add `state` and `zip_code` fields to the client edit form in a logical layout:

**File**: `src/components/clients/ClientProfilePage.tsx`

```text
Current layout (line 332):
  City | Country

New layout:
  City | State
  Zip Code | Country
```

---

## Issue 2: Date Format Not Using User Preferences

### Problem
Multiple areas of the application use raw JavaScript date formatting (`.toLocaleDateString()`) instead of the user's configured date format preference.

### Affected Areas Found

| Location | File | Issue |
|----------|------|-------|
| Jobs Table - Created column | `JobsTable.tsx:131` | `new Date(quote.created_at).toLocaleDateString('en-GB')` |
| Jobs List - Created date | `JobsListWithQuotes.tsx:210` | `new Date(project.created_at).toLocaleDateString()` |
| Jobs List - Quote created | `JobsListWithQuotes.tsx:303` | `new Date(quote.created_at).toLocaleDateString()` |
| Jobs Grid - Date | `JobGridView.tsx:97` | `new Date(job.created_at).toLocaleDateString()` |
| Jobs Dashboard - Project date | `JobsDashboard.tsx:220` | `new Date(project.created_at).toLocaleDateString()` |
| Jobs Dashboard - Quote date | `JobsDashboard.tsx:337` | `new Date(quote.created_at).toLocaleDateString()` |
| Client Projects - Due date | `ClientProjectsList.tsx:365` | `new Date(project.due_date).toLocaleDateString()` |
| Client Notes - Timestamp | `ClientAllNotesSection.tsx:182` | Uses `formatDistanceToNow` (acceptable for relative time) |

### Solution
Replace raw JavaScript date calls with `useFormattedDate` hook or `formatUserDate` utility across all affected files.

**Pattern to follow** (already used in `QuoteViewer.tsx:48-49`):
```typescript
import { useFormattedDate } from "@/hooks/useFormattedDate";

// In component
const { formattedDate: formattedCreatedDate } = useFormattedDate(quote.created_at, false);

// In render
{formattedCreatedDate || new Date(quote.created_at).toLocaleDateString()}
```

---

## Issue 3: Payment Terms - Fixed Deposit Amount Not Saving

### Investigation

Looking at `InlinePaymentConfig.tsx` and `useQuotePayment.ts`:

**Code Flow:**
1. `InlinePaymentConfig.tsx:108` passes `fixedAmount` to mutation:
   ```typescript
   fixedAmount: paymentType === 'deposit' && useFixedAmount ? fixedAmount : undefined,
   ```

2. `useQuotePayment.ts:70-71` calculates payment amount:
   ```typescript
   } else if (fixedAmount !== undefined) {
     paymentAmount = fixedAmount; // User specified exact amount
   }
   ```

3. `useQuotePayment.ts:78-81` saves to database:
   ```typescript
   .update({
     payment_type: paymentType,
     payment_percentage: paymentType === 'deposit' && !fixedAmount ? paymentPercentage : null,
     payment_amount: paymentAmount,
   ```

**Potential Issue:**
The `quotes` table stores `payment_amount` correctly, but the **loading logic** in `InlinePaymentConfig.tsx` (lines 44-58) may not properly restore fixed amount mode:

```typescript
if (currentPayment.percentage) {
  // Saved as percentage
  setUseFixedAmount(false);
  setDepositPercentage(currentPayment.percentage);
} else if (currentPayment.amount && currentPayment.amount > 0) {
  // Saved as fixed amount (percentage is null but amount exists)
  setUseFixedAmount(true);
  setFixedAmount(currentPayment.amount);
}
```

**Problem**: When `payment_percentage` is `null` AND `payment_amount` exists, the code correctly sets `useFixedAmount(true)`. However, if the database returns `0` for percentage instead of `null`, the first condition would evaluate as falsy and work correctly.

### Solution
Add explicit check for fixed amount mode by checking if percentage is specifically `null` (not just falsy):

```typescript
if (currentPayment.percentage !== null && currentPayment.percentage !== undefined && currentPayment.percentage > 0) {
  // Saved as percentage
  setUseFixedAmount(false);
  setDepositPercentage(currentPayment.percentage);
} else if (currentPayment.amount && currentPayment.amount > 0) {
  // Saved as fixed amount
  setUseFixedAmount(true);
  setFixedAmount(currentPayment.amount);
}
```

---

## Issue 4: Configure Payment > Payment Summary

### Clarification Needed
The Payment Summary section in `InlinePaymentConfig.tsx` (lines 257-288) appears to display correctly with:
- Quote Total
- Discount Applied (if any)
- After Discount total
- Payment Required
- Remaining balance

If there's a specific issue with the Payment Summary display, please describe what is incorrect or missing. The current implementation looks complete based on code review.

---

## Files to Modify

| File | Change |
|------|--------|
| `src/components/clients/ClientProfilePage.tsx` | Add state/zip_code fields to edit form |
| `src/components/jobs/JobsTable.tsx` | Use `useFormattedDate` for created_at |
| `src/components/jobs/JobsListWithQuotes.tsx` | Use `useFormattedDate` for created dates |
| `src/components/jobs/JobGridView.tsx` | Use `useFormattedDate` for job dates |
| `src/components/jobs/JobsDashboard.tsx` | Use `useFormattedDate` for project/quote dates |
| `src/components/clients/ClientProjectsList.tsx` | Use `useFormattedDate` for due dates |
| `src/components/jobs/quotation/InlinePaymentConfig.tsx` | Fix fixed amount mode detection |

---

## Testing Checklist

1. **Client Edit**: Edit client → Change country from "USA" to "United States" → Save → Verify saved
2. **State/Zip**: Add state and zip code → Save → Verify persisted
3. **Date Format**: Settings → Change date format → Jobs list shows updated format
4. **Payment Terms**: Set fixed deposit amount ($500) → Save → Refresh → Fixed amount still selected and shows $500
5. **Payment Summary**: Verify displays correctly after configuration


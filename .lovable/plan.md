

# Upload Invoice PDF for Laela Account & Enable Download

## Current Issues

1. **Invoice CC-114 needs PDF attachment** - The custom invoice record needs a `pdf_url` 
2. **Pending invoices can't be downloaded** - The `UpcomingPayments` component doesn't have a download button

## Implementation Steps

### Step 1: Upload PDF to Storage

Upload the invoice PDF to the `business-assets` bucket (public bucket, suitable for invoices):

**File location:** `business-assets/invoices/CC-114.pdf`

**Action:** Copy the uploaded PDF to the project's public storage

### Step 2: Create Storage Path for Invoices

Create a folder structure in the `business-assets` bucket for invoice PDFs:
- Path: `invoices/{invoice-number}.pdf`
- This will be accessible via: `https://ldgrcodffsalkevafbkb.supabase.co/storage/v1/object/public/business-assets/invoices/CC-114.pdf`

### Step 3: Update Custom Invoice with PDF URL

Run SQL to update the invoice record:
```sql
UPDATE public.custom_invoices 
SET pdf_url = 'https://ldgrcodffsalkevafbkb.supabase.co/storage/v1/object/public/business-assets/invoices/CC-114.pdf'
WHERE invoice_number = 'CC-114' 
  AND user_id = '4eebf4ef-bc13-4e57-b120-32a0ca281932';
```

### Step 4: Add Download Button to UpcomingPayments

**File:** `src/components/billing/UpcomingPayments.tsx`

Add a download button to the `PaymentCard` component so users can download pending invoice PDFs:

```typescript
// Add to imports
import { Download } from "lucide-react";
import { Button } from "@/components/ui/button";

// In PaymentCard, after the due date section (line 54)
{payment.pdf_url && (
  <Button
    variant="outline"
    size="sm"
    className="w-full mt-2"
    onClick={() => window.open(payment.pdf_url!, '_blank')}
  >
    <Download className="h-4 w-4 mr-2" />
    Download Invoice
  </Button>
)}
```

---

## Files to Modify

| File | Change |
|------|--------|
| Upload PDF | Copy `CC-114-2.pdf` to `business-assets/invoices/CC-114.pdf` |
| Database | Update `custom_invoices` record with `pdf_url` |
| `src/components/billing/UpcomingPayments.tsx` | Add download button for pending invoices |

---

## Expected Outcome

After implementation:

1. ✅ **Laela account** can see their pending invoice in "Upcoming Payments"
2. ✅ **Download button visible** - They can download the PDF while invoice is pending
3. ✅ **Invoice accessible** - PDF stored in public bucket, directly downloadable

---

## Note on Invoice Creation

The subscription and invoice records for Laela still need to be created (as discussed previously). The SQL commands provided earlier should be run first before updating the `pdf_url`.


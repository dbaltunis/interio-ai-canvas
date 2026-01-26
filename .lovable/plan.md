
# TWC Order Flow Enhancement: Font Fix, Testing Guide & Email Confirmations

## Current State Analysis

### 1. Font Color Issue in Supplier Ordering Button
The button text is using `text-accent-foreground` which may not have sufficient contrast. Looking at the screenshot, the button appears to have low-contrast text that's hard to read against the teal background.

**File:** `src/components/jobs/SupplierOrderingDropdown.tsx` (lines 196-209)
```typescript
className={cn(
  "h-8 px-2 lg:px-3 gap-1",
  isButtonDisabled && "opacity-50 cursor-not-allowed",
  allTestMode && "border-amber-400/50 text-amber-600",
  // Active state uses text-accent-foreground - may need adjustment
  !allOrdersSubmitted &&
    !allTestMode &&
    isApprovedStatus &&
    hasProducts &&
    "border-accent text-accent-foreground hover:bg-accent/10"
)}
```

**Fix:** Change active state to use higher-contrast text colors like `text-primary` or `text-foreground`.

---

### 2. Testing With TWC Credentials

**Current Flow:**
1. You click "Supplier Ordering" dropdown
2. Select TWC (shows "Send Order" badge)
3. Confirmation dialog appears: "Send Order to TWC"
4. Click "Send Order" opens TWCSubmitDialog with delivery form
5. Click "Submit to TWC" calls the `twc-submit-order` edge function
6. Edge function sends order to TWC's API at their endpoint

**Testing Mode vs Production Mode:**
- **Testing credentials** go to TWC's **staging/test environment** (configured in your TWC integration settings)
- Orders sent to test environment do **NOT** create real manufacturing orders
- TWC's test API returns a test order ID but doesn't process anything

**How to Verify Order Was Received:**
Currently, there's **no direct feedback** beyond:
- Toast notification with "TWC Order ID: xxx"
- Database update: `quotes.twc_order_id`, `twc_order_status = 'submitted'`

---

### 3. Industry Standards (BlindMatrix, CabinetryOnline, etc.)

Industry leaders implement:

| Feature | Description | Current State |
|---------|-------------|---------------|
| Order Acknowledgement | Instant confirmation with tracking ID | Partial - toast only |
| Email Confirmation | Sent to retailer when order submitted | Missing |
| Webhook Callbacks | Status updates (In Production, Shipped) | Missing |
| Order Accepted Email | When manufacturer confirms order | Missing |
| Order Details PDF | Attached to confirmation email | Missing |

---

## Implementation Plan

### Step 1: Fix Font Colors on Supplier Ordering Button

**File:** `src/components/jobs/SupplierOrderingDropdown.tsx`

Change the button styling for better readability:
- Active/Ready state: Use `text-emerald-700` instead of `text-accent-foreground`
- Maintain amber for test mode: `text-amber-600` (already good)
- Ordered state: `text-primary` (already good)

### Step 2: Add Email Confirmation After Order Submission

**Files to Modify:**
- `supabase/functions/twc-submit-order/index.ts` - Add email sending after successful submission

**Email Confirmation Logic:**
After successful TWC order submission:
1. Fetch user's email settings (sender email, name)
2. Send confirmation email to the user with:
   - Order ID from TWC
   - Purchase Order Number
   - List of items ordered (product, dimensions, colour)
   - Delivery address
   - Timestamp

**Email Template Structure:**
```text
Subject: TWC Order Confirmed - PO# {purchaseOrderNumber}

Your order has been successfully submitted to TWC.

Order Reference: {twc_order_id}
Purchase Order: {purchaseOrderNumber}
Submitted: {timestamp}

Items Ordered:
- {item.itemName} ({item.width}mm x {item.drop}mm) - {item.colour}
...

Delivery Address:
{address1}
{city}, {state} {postcode}

You will receive updates from TWC when your order is in production and shipped.
```

### Step 3: Store Order Details for Tracking

**Database:** The `supplier_orders` JSONB column already exists on `quotes` table.

Enhance the stored data to include:
```json
{
  "twc": {
    "order_id": "12345",
    "status": "submitted",
    "submitted_at": "2026-01-26T14:00:00Z",
    "items_count": 2,
    "confirmation_email_sent": true,
    "response": { /* full TWC response */ }
  }
}
```

### Step 4: Add In-App Notification

After order submission:
- Create entry in `notifications` table for the user
- Shows in notification bell: "TWC order submitted - Order ID: xxx"

---

## Technical Implementation Details

### Change 1: Font Color Fix (`SupplierOrderingDropdown.tsx`)

**Line 196-209:**
```typescript
// Replace text-accent-foreground with text-emerald-700 for better contrast
className={cn(
  "h-8 px-2 lg:px-3 gap-1",
  isButtonDisabled && "opacity-50 cursor-not-allowed",
  allTestMode && "border-amber-400/50 text-amber-600",
  allOrdersSubmitted &&
    hasProducts &&
    !allTestMode &&
    "border-emerald-300 text-emerald-700",
  !allOrdersSubmitted &&
    !allTestMode &&
    isApprovedStatus &&
    hasProducts &&
    "border-teal-300 text-teal-700 hover:bg-teal-50"
)}
```

### Change 2: Email Confirmation in Edge Function (`twc-submit-order/index.ts`)

**After line 159 (after updating quote):**
```typescript
// Send confirmation email to user
try {
  // Get user's email and business info
  const { data: userProfile } = await supabaseClient
    .from('user_profiles')
    .select('email, business_name')
    .eq('user_id', user.id)
    .single();

  // Get user's email settings
  const { data: emailSettings } = await supabaseClient
    .from('email_settings')
    .select('from_email, from_name')
    .eq('user_id', accountOwnerId)
    .eq('active', true)
    .single();

  if (userProfile?.email) {
    // Build order items summary
    const itemsSummary = orderData.items.map((item: TWCOrderItem) => 
      `• ${item.itemName} (${item.width}mm × ${item.drop}mm) - ${item.colour}`
    ).join('\n');

    // Send email via send-email function
    await supabaseClient.functions.invoke('send-email', {
      body: {
        to: userProfile.email,
        subject: `TWC Order Confirmed - ${orderData.purchaseOrderNumber}`,
        html: `
          <h2>Order Submitted to TWC</h2>
          <p>Your order has been successfully submitted.</p>
          <p><strong>TWC Order ID:</strong> ${result.orderId}</p>
          <p><strong>Purchase Order:</strong> ${orderData.purchaseOrderNumber}</p>
          <p><strong>Submitted:</strong> ${new Date().toLocaleString()}</p>
          <h3>Items Ordered</h3>
          <pre>${itemsSummary}</pre>
          <h3>Delivery Address</h3>
          <p>${orderData.address1}<br/>
          ${orderData.city}, ${orderData.state} ${orderData.postcode}</p>
        `,
        user_id: user.id
      }
    });
    console.log('Confirmation email sent to:', userProfile.email);
  }
} catch (emailError) {
  console.error('Failed to send confirmation email:', emailError);
  // Don't fail the order if email fails
}
```

### Change 3: Create In-App Notification

**After email sending:**
```typescript
// Create in-app notification
await supabaseClient.from('notifications').insert({
  user_id: user.id,
  type: 'supplier_order',
  title: 'Order Submitted to TWC',
  message: `Order ${result.orderId} submitted successfully`,
  metadata: {
    supplier: 'twc',
    order_id: result.orderId,
    purchase_order: orderData.purchaseOrderNumber,
    quote_id: orderData.quoteId
  },
  read: false
});
```

---

## Testing Your Order Flow

### With Test Credentials:
1. Orders go to TWC's **staging environment**
2. You'll get a test order ID back (e.g., "TEST-12345")
3. Order is NOT actually manufactured
4. Use this to verify data format is correct

### With Production Credentials:
1. Orders go to TWC's **production system**
2. You'll get a real order ID
3. TWC receives and processes the order
4. Check TWC's retailer portal to see your order

### Verifying Data Sent to TWC:
Check Edge Function logs at: `https://supabase.com/dashboard/project/ldgrcodffsalkevafbkb/functions/twc-submit-order/logs`

The logs show:
- `Submitting order to TWC: {purchaseOrderNumber}`
- `TWC order submitted: {result}`

---

## Files to Modify

| File | Change |
|------|--------|
| `src/components/jobs/SupplierOrderingDropdown.tsx` | Fix font colors for better contrast |
| `supabase/functions/twc-submit-order/index.ts` | Add email confirmation and in-app notification |

---

## Future Enhancements (Industry Best Practice)

1. **Webhook Endpoint**: Create `twc-order-webhook` to receive status updates from TWC
2. **Order Status Page**: Show order progress (Submitted → Acknowledged → In Production → Shipped)
3. **Shipping Notification**: Email when TWC marks order as shipped
4. **PDF Attachment**: Include order summary PDF with confirmation email

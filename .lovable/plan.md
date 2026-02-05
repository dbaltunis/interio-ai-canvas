

# Fix Plan: Homekaara Quote Template Not Working

## Issues Identified

### Issue 1: Template Selection Fails (CRITICAL)
**Location**: `src/components/settings/templates/QuoteTemplateStyleSelector.tsx` (lines 85-87)

**Root Cause**: The `handleSelectStyle` function calls `updateSettings.mutateAsync` WITHOUT passing the required `id` field:

```typescript
// Current (broken)
await updateSettings.mutateAsync({
  quote_template: styleId,
} as any);
```

**Evidence**: Network request shows:
```
PATCH .../business_settings?id=eq.undefined&user_id=eq...
Response: {"code":"22P02","message":"invalid input syntax for type uuid: \"undefined\""}
```

**Fix Required**: Pass the `businessSettings.id` to the mutation:
```typescript
await updateSettings.mutateAsync({
  id: businessSettings.id,
  quote_template: styleId,
} as any);
```

---

### Issue 2: Homekaara Template Not Used in Project Quotes (CRITICAL)
**Location**: `src/components/jobs/tabs/QuotationTab.tsx`

**Root Cause**: The main `QuotationTab` component that renders quotes in projects uses `LivePreview` directly and does NOT check `businessSettings.quote_template` to switch to the Homekaara template. The Homekaara template logic exists in `QuoteFullScreenView.tsx`, but that component is NOT imported or used anywhere.

**Current Flow**:
```
QuotationTab → LivePreview (always default template)
```

**Required Flow**:
```
QuotationTab → Check businessSettings.quote_template
              → If 'homekaara' → QuoteTemplateHomekaara
              → If 'default' → LivePreview
```

**Fix Required**: Add conditional rendering in `QuotationTab.tsx` to use `QuoteTemplateHomekaara` when the business setting specifies it, similar to what's already implemented in `QuoteFullScreenView.tsx`.

---

### Issue 3: QuoteFullScreenView Never Used (LOW PRIORITY)
**Location**: `src/components/jobs/quotation/QuoteFullScreenView.tsx`

The `QuoteFullScreenView` component has the correct template switching logic, but it's never imported anywhere in the codebase. This is either:
1. An orphaned component that was created but never integrated
2. Was intended to be used but the import was missed

**Note**: The primary fix should be in `QuotationTab.tsx` since that's what users actually see.

---

## Implementation Plan

### Step 1: Fix Template Selector (High Priority)
**File**: `src/components/settings/templates/QuoteTemplateStyleSelector.tsx`

Add the missing `id` field to the mutation call:

```typescript
// Line 79: Get businessSettings data (already exists)
const currentStyle = (businessSettings as any)?.quote_template || 'default';

// Lines 84-88: Fix the mutation call
const handleSelectStyle = async (styleId: string) => {
  if (styleId === currentStyle) return;
  
  // Add check for businessSettings.id
  if (!businessSettings?.id) {
    toast.error('Business settings not found. Please try again.');
    return;
  }
  
  try {
    await updateSettings.mutateAsync({
      id: businessSettings.id,  // ← ADD THIS
      quote_template: styleId,
    } as any);
    
    toast.success(`Quote template changed to "${templateStyles.find(s => s.id === styleId)?.name}"`);
  } catch (error) {
    console.error('Failed to update template style:', error);
    toast.error('Failed to update template style');
  }
};
```

---

### Step 2: Add Homekaara Template to QuotationTab (High Priority)
**File**: `src/components/jobs/tabs/QuotationTab.tsx`

1. **Import the Homekaara template and data preparation utilities**:
```typescript
import QuoteTemplateHomekaara from "@/components/quotes/templates/QuoteTemplateHomekaara";
import { prepareQuoteData } from "@/utils/quotes/prepareQuoteData";
```

2. **Add template style detection** (after businessSettings query):
```typescript
const quoteTemplateStyle = (businessSettings as any)?.quote_template || 'default';
const useHomekaaraTemplate = quoteTemplateStyle === 'homekaara' && 
  (selectedTemplate?.template_style === 'quote' || !selectedTemplate?.template_style);
```

3. **Prepare Homekaara data** (add useMemo hook):
```typescript
const homekaaraTemplateData = useMemo(() => {
  if (!useHomekaaraTemplate) return null;
  
  const preparedData = prepareQuoteData(projectData, templateSettings.showDetailedBreakdown);
  
  return {
    items: preparedData.items.map(item => ({
      id: item.id,
      name: item.name,
      description: item.description,
      quantity: item.quantity,
      unit_price: item.unit_price,
      total: item.total,
      prate: item.quantity,
      image_url: item.image_url,
      breakdown: item.breakdown?.map(b => ({
        label: b.name || b.category || '',
        value: b.description || (b.total_cost ? `${b.total_cost}` : ''),
      })),
      room_name: item.room_name,
      room_id: item.room_id,
      surface_name: item.surface_name,
      treatment_type: item.treatment_type,
    })),
    subtotal: preparedData.subtotal,
    taxAmount: preparedData.taxAmount,
    total: preparedData.total,
    currency: preparedData.currency,
    businessInfo: {
      name: businessSettings?.company_name || 'Your Business',
      logo_url: businessSettings?.company_logo_url,
      email: businessSettings?.business_email,
      phone: businessSettings?.business_phone,
      address: [businessSettings?.address, businessSettings?.city, businessSettings?.state, businessSettings?.zip_code].filter(Boolean).join(', '),
    },
    clientInfo: {
      name: client?.full_name || client?.name || 'Client',
      email: client?.email,
      phone: client?.phone,
      address: client?.address,
    },
    metadata: {
      quote_number: project?.quote_number || project?.id || 'N/A',
      date: project?.created_at ? new Date(project.created_at).toLocaleDateString('en-GB') : new Date().toLocaleDateString('en-GB'),
      status: project?.status || 'Draft',
      validity_days: project?.validity_days || 14,
      services_required: project?.services_required,
      expected_purchase_date: project?.expected_purchase_date,
      referral_source: project?.referral_source,
    },
    paymentInfo: {
      advance_paid: project?.advance_paid || 0,
      deposit_percentage: 50,
    },
    introMessage: project?.intro_message,
  };
}, [useHomekaaraTemplate, projectData, businessSettings, client, project, templateSettings.showDetailedBreakdown]);
```

4. **Update the quote preview section** (around line 1122-1138) to conditionally render the Homekaara template:
```typescript
{/* Quote Preview */}
{isEmptyVersion ? (
  <EmptyQuoteVersionState ... />
) : useHomekaaraTemplate && homekaaraTemplateData ? (
  <section className="mt-2 sm:mt-4">
    <div className="w-full flex justify-center items-start bg-gradient-to-br from-muted/30 to-muted/50 dark:from-background dark:to-card/20 px-4 py-2 rounded-lg border border-border/40">
      <div className="transform scale-[0.52] sm:scale-[0.72] md:scale-[0.85] lg:scale-[0.95] xl:scale-[1.0] origin-top shadow-2xl dark:shadow-xl mx-auto">
        <div id="quote-live-preview" className="quote-preview-container bg-document text-document-foreground" style={{
          width: '210mm',
          minHeight: '297mm',
          fontFamily: 'Arial, Helvetica, sans-serif',
          fontSize: '10pt',
          padding: '8mm',
          boxSizing: 'border-box',
          overflow: 'hidden'
        }}>
          <QuoteTemplateHomekaara
            items={homekaaraTemplateData.items}
            subtotal={homekaaraTemplateData.subtotal}
            taxAmount={homekaaraTemplateData.taxAmount}
            total={homekaaraTemplateData.total}
            currency={homekaaraTemplateData.currency}
            businessInfo={homekaaraTemplateData.businessInfo}
            clientInfo={homekaaraTemplateData.clientInfo}
            metadata={homekaaraTemplateData.metadata}
            paymentInfo={homekaaraTemplateData.paymentInfo}
            introMessage={homekaaraTemplateData.introMessage}
            isEditable={false}
          />
        </div>
      </div>
    </div>
  </section>
) : !selectedTemplate || !templateBlocks || templateBlocks.length === 0 ? (
  <div>No Quote Template Found...</div>
) : (
  <section>
    <LivePreview ... />
  </section>
)}
```

---

## Files to Modify

| File | Change | Priority |
|------|--------|----------|
| `src/components/settings/templates/QuoteTemplateStyleSelector.tsx` | Add `id` to mutation call | HIGH |
| `src/components/jobs/tabs/QuotationTab.tsx` | Add Homekaara template conditional rendering | HIGH |

---

## Testing Checklist

1. [ ] Go to Settings → Document Templates → Quote Template Style
2. [ ] Click "Select Template" on Homekaara card
3. [ ] Verify toast shows success message
4. [ ] Verify Homekaara card now shows "Active" badge
5. [ ] Navigate to any project with a quote
6. [ ] Verify the quote preview shows Homekaara template style (room grouping, product images, etc.)
7. [ ] Switch back to Default template in settings
8. [ ] Verify project quotes now show the default LivePreview style


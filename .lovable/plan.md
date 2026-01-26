
# TWC Order Data Mapping - Complete Industry-Standard Implementation

## Clarifying Your Question

**You asked about CSV/PDF formats** - here's the answer:

**NO CSV or PDF is needed.** TWC uses a **JSON API** (`/api/TwcPublic/SubmitOrder`). This is exactly how BlindMatrix and other competitors work. TWC receives orders electronically via their API and has their own manufacturing system on their end. There's no need to generate files - we submit JSON directly and receive an order confirmation ID back.

The API approach is superior because:
- Instant order confirmation with tracking ID
- Real-time validation of product codes and options
- Automatic status updates (submitted → confirmed → manufacturing → shipped)
- No manual file handling or email attachments

---

## Current Problem Analysis

After auditing the codebase, I found **3 critical gaps** preventing successful TWC order submission:

### Gap 1: Measurement Data Not Reaching Submit Dialog

**Current (Broken):**
```typescript
// TWCSubmitDialog.tsx:54-55
width: item.width || 0,      // ❌ item.width doesn't exist
drop: item.height || item.drop || 0,  // ❌ item.height doesn't exist
```

**Where data actually lives:**
```typescript
// In quote_items.breakdown or product_details
item.breakdown[0].horizontal_pieces_needed  // dimensions
item.product_details.measurements           // actual measurements
```

### Gap 2: Material/Colour Codes Not Mapped

**Current (Broken):**
```typescript
// TWCSubmitDialog.tsx:56-57
material: item.product_name || item.name,  // ❌ Sends "Pure Wood (50mm)" 
colour: item.metadata?.selected_colour || "Standard",  // ❌ May be empty
```

**What TWC needs:**
```typescript
material: "",  // Empty or specific TWC material code from fabricsAndColours
colour: "EBONY",  // Exact TWC colour code, not display name
```

### Gap 3: Manufacturing Questions Not Captured

**TWC Products have required questions like:**
- Control Type: "Cord operated" / "Motor"
- Cont Side: "L" / "R" / "Centre Tilt"
- Control Length: "STD" / "500" / "750" etc.
- Fixing: "Face" / "Recess"

**Currently:** These questions (`twc_questions`) are synced to inventory items but **never captured** when configuring the product in quotes, so `customFieldValues` is always empty.

---

## Solution Architecture

```text
┌─────────────────────────────────────────────────────────────────────────────┐
│                        TWC ORDER DATA FLOW                                   │
└─────────────────────────────────────────────────────────────────────────────┘

┌──────────────────┐   Sync   ┌─────────────────────────────────────────────┐
│   TWC API        │ ────────►│  enhanced_inventory_items.metadata          │
│   GetProducts    │          │  ├── twc_item_number: "245"                 │
└──────────────────┘          │  ├── twc_questions: [{name, options}...]    │
                              │  └── twc_fabrics_and_colours: [...]         │
                              └─────────────────────────────────────────────┘
                                                    │
                                                    ▼ Quote Builder
┌─────────────────────────────────────────────────────────────────────────────┐
│  NEW: TWC Questions Capture Component                                        │
│  ┌─────────────────────────────────────────────────────────────────────────┐│
│  │ Control Type:  [Cord operated ▼]                                        ││
│  │ Cont Side:     [L ▼]                                                    ││
│  │ Control Length:[STD ▼]                                                  ││
│  │ Fixing:        [Face ▼]                                                 ││
│  │ Colour:        [EBONY ▼]  (from twc_fabrics_and_colours)               ││
│  └─────────────────────────────────────────────────────────────────────────┘│
└─────────────────────────────────────────────────────────────────────────────┘
                                                    │
                                                    ▼ Saved to quote_items
┌─────────────────────────────────────────────────────────────────────────────┐
│  quote_items.product_details                                                 │
│  ├── twc_item_number: "245"                                                 │
│  ├── twc_selected_colour: "EBONY"                                           │
│  ├── twc_custom_fields: [                                                   │
│  │      {name: "Control Type", value: "Cord operated"},                     │
│  │      {name: "Cont Side", value: "L"},                                    │
│  │      {name: "Control Length", value: "STD"},                             │
│  │      {name: "Fixing", value: "Face"}                                     │
│  │   ]                                                                       │
│  └── measurements: {rail_width: 1200, drop: 2400}                           │
└─────────────────────────────────────────────────────────────────────────────┘
                                                    │
                                                    ▼ Order Submission
┌─────────────────────────────────────────────────────────────────────────────┐
│  TWC API Payload (Correct Format)                                            │
│  {                                                                           │
│    "itemNumber": "245",                                                      │
│    "itemName": "Pure Wood (50mm)",                                           │
│    "location": "Master Bedroom - Window 1",                                  │
│    "quantity": 1,                                                            │
│    "width": 1200,                                                            │
│    "drop": 2400,                                                             │
│    "material": "",                                                           │
│    "colour": "EBONY",                                                        │
│    "customFieldValues": [                                                    │
│      {"name": "Control Type", "value": "Cord operated"},                     │
│      {"name": "Cont Side", "value": "L"},                                    │
│      {"name": "Control Length", "value": "STD"},                             │
│      {"name": "Fixing", "value": "Face"}                                     │
│    ]                                                                         │
│  }                                                                           │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## Implementation Plan

### Phase 1: TWC Manufacturing Questions Capture Component

**New File: `src/components/measurements/TWCProductOptions.tsx`**

Creates a dynamic form that:
1. Detects when selected template/product is a TWC product (has `twc_item_number` in metadata)
2. Fetches the `twc_questions` from inventory item metadata
3. Renders dropdowns for each required/optional question
4. Handles dependent fields (e.g., "Remote" options depend on "Control Type = Motor")
5. Captures selected colour from `twc_fabrics_and_colours`
6. Stores all selections in the product configuration state

```typescript
interface TWCProductOptionsProps {
  inventoryItem: EnhancedInventoryItem;  // The TWC product
  measurements: Record<string, any>;      // Current measurements (width, drop)
  onTWCFieldsChange: (fields: TWCCustomField[]) => void;
  onColourChange: (colour: string) => void;
}

interface TWCCustomField {
  name: string;   // e.g., "Control Type"
  value: string;  // e.g., "Cord operated"
}
```

### Phase 2: Integrate TWC Options into Quote Builder

**Modify: `src/components/measurements/dynamic-options/DynamicCurtainOptions.tsx`**
**Modify: `src/components/measurements/dynamic-options/DynamicBlindOptions.tsx`**

When a TWC product template is selected:
1. Check if linked inventory item has `metadata.twc_item_number`
2. Render `<TWCProductOptions />` component below standard options
3. Pass captured TWC fields to parent state

### Phase 3: Store TWC Data in Quote Items

**Modify: `src/hooks/useQuoteItems.ts`**

Update the `saveItems` mutation to properly store TWC-specific data:

```typescript
product_details: {
  ...existingDetails,
  // TWC-specific fields
  twc_item_number: item.twc_item_number,
  twc_selected_colour: item.twc_selected_colour,
  twc_custom_fields: item.twc_custom_fields || [],
  // Measurements (already captured)
  measurements: {
    rail_width: item.measurements?.rail_width,
    drop: item.measurements?.drop,
  }
}
```

### Phase 4: Fix Order Submission Mapping

**Modify: `src/components/integrations/TWCSubmitDialog.tsx`**

Complete rewrite of the item mapping logic:

```typescript
const twcItems = quotationData.items
  .filter((item: any) => {
    // Check multiple locations for TWC identifier
    const productDetails = item.product_details || {};
    return productDetails.twc_item_number || 
           item.metadata?.twc_item_number ||
           productDetails.metadata?.twc_item_number;
  })
  .map((item: any) => {
    const productDetails = item.product_details || {};
    const measurements = productDetails.measurements || {};
    const breakdown = item.breakdown?.[0] || {};
    
    // Get TWC item number from various locations
    const twcItemNumber = productDetails.twc_item_number || 
                          item.metadata?.twc_item_number ||
                          productDetails.metadata?.twc_item_number;
    
    // Get measurements (stored in MM, convert if needed)
    const widthMM = measurements.rail_width || breakdown.rail_width || 0;
    const dropMM = measurements.drop || breakdown.drop || 0;
    
    // Get room/location info
    const location = `${productDetails.room_name || 'Main'} - ${productDetails.surface_name || 'Window'}`;
    
    // Get colour from TWC-specific selection
    const colour = productDetails.twc_selected_colour || 
                   breakdown.color || 
                   'TO CONFIRM';
    
    // Get custom field values (TWC manufacturing questions)
    const customFieldValues = (productDetails.twc_custom_fields || [])
      .map((field: any) => ({
        name: field.name,
        value: field.value
      }));
    
    return {
      itemNumber: twcItemNumber,
      itemName: productDetails.treatment_type || item.name,
      location,
      quantity: item.quantity || 1,
      width: widthMM,
      drop: dropMM,
      material: '',  // Usually empty for TWC
      colour,
      customFieldValues
    };
  });
```

### Phase 5: Order Validation Before Submission

**Add to: `src/components/integrations/TWCSubmitDialog.tsx`**

Add a validation step that checks:
1. All required TWC questions are answered
2. Width and drop are valid positive numbers
3. Colour is selected (not "TO CONFIRM")

Display clear error messages if validation fails, preventing incomplete orders.

### Phase 6: Order Preview Section

**Add to: `src/components/integrations/TWCSubmitDialog.tsx`**

Add an expandable "Order Details" section showing:
- Each item with all specifications
- Manufacturing options selected
- Measurements in both MM and inches
- Any validation warnings

This matches BlindMatrix's "Order Review" screen.

---

## Files to Create/Modify

| File | Action | Description |
|------|--------|-------------|
| `src/components/measurements/TWCProductOptions.tsx` | **CREATE** | New component to capture TWC manufacturing questions |
| `src/components/measurements/dynamic-options/DynamicBlindOptions.tsx` | **MODIFY** | Integrate TWCProductOptions for TWC blinds |
| `src/components/measurements/dynamic-options/DynamicCurtainOptions.tsx` | **MODIFY** | Integrate TWCProductOptions for TWC curtain tracks |
| `src/hooks/useQuoteItems.ts` | **MODIFY** | Store TWC-specific data in product_details |
| `src/components/integrations/TWCSubmitDialog.tsx` | **MODIFY** | Complete rewrite of item mapping with validation |
| `supabase/functions/twc-submit-order/index.ts` | **MODIFY** | Add server-side validation and better error messages |

---

## Validation Checklist (Matching BlindMatrix Standard)

After implementation, the system will:

1. **Catalog Sync**: Import TWC products with all questions and colour options
2. **Configuration**: Present TWC-specific questions when quoting TWC products
3. **Data Storage**: Store all TWC selections in quote_items.product_details
4. **Order Mapping**: Correctly extract and format data for TWC API
5. **Validation**: Prevent submission of incomplete orders
6. **Confirmation**: Display order ID from TWC and track status

---

## Technical Notes

### Measurement Units
- TWC expects measurements in **millimeters (MM)**
- Our system stores in MM internally (per `useSafeMeasurements` hook)
- No conversion needed, just correct data path

### Dependent Fields
TWC questions have dependencies (e.g., "Remote" options only show when "Control Type = Motor")
- The `twc_questions[].dependantField` structure already contains this logic
- Component will handle conditional rendering based on parent selections

### Multi-Account (SaaS)
All fixes work universally across 600+ accounts:
- TWC questions are stored per inventory item (account-specific)
- Quote items store account-specific selections
- No cross-account data leakage


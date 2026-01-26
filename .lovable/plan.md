
# TWC Options Integration into Quote Builder - Implementation Plan

## Summary
Integrate the `TWCProductOptions` component into `DynamicCurtainOptions` and `DynamicRollerBlindFields` to capture TWC manufacturing questions during the quoting phase.

## Current State
- `TWCProductOptions.tsx` component is created and ready
- `TWCSubmitDialog.tsx` has been updated to correctly map order data
- `useQuoteItems.ts` stores TWC-specific data in `product_details`
- **Missing**: The integration point - detecting TWC templates and rendering TWCProductOptions in the quote builder

## Data Flow Discovery
1. **Templates** link to inventory via `inventory_item_id`
2. **Inventory items** with `supplier='TWC'` have `metadata.twc_questions` and `metadata.twc_fabrics_and_colours`
3. **Quote builder** needs to detect when a TWC-linked template is selected and render the TWCProductOptions component

## Implementation Steps

### Step 1: Modify DynamicRollerBlindFields.tsx
Add TWC detection and integration:

```typescript
// At top of component:
const [linkedTWCData, setLinkedTWCData] = useState<{
  twc_questions: any[];
  twc_fabrics_and_colours: any;
  twc_item_number: string;
} | null>(null);

// Fetch TWC data when templateId changes:
useEffect(() => {
  if (!templateId) return;
  
  const fetchTWCData = async () => {
    // Get template to find inventory_item_id
    const { data: template } = await supabase
      .from('curtain_templates')
      .select('inventory_item_id')
      .eq('id', templateId)
      .maybeSingle();
    
    if (!template?.inventory_item_id) return;
    
    // Get linked inventory item with TWC metadata
    const { data: item } = await supabase
      .from('enhanced_inventory_items')
      .select('metadata')
      .eq('id', template.inventory_item_id)
      .maybeSingle();
    
    const metadata = item?.metadata as any;
    if (metadata?.twc_item_number) {
      setLinkedTWCData({
        twc_questions: metadata.twc_questions || [],
        twc_fabrics_and_colours: metadata.twc_fabrics_and_colours,
        twc_item_number: metadata.twc_item_number
      });
    }
  };
  
  fetchTWCData();
}, [templateId]);

// Render TWCProductOptions after standard options:
{linkedTWCData && (
  <TWCProductOptions
    twcQuestions={linkedTWCData.twc_questions}
    twcFabricsAndColours={linkedTWCData.twc_fabrics_and_colours}
    selectedFields={/* from measurements */}
    selectedColour={measurements.twc_selected_colour}
    selectedMaterial={measurements.twc_selected_material}
    onFieldsChange={(fields) => {
      onChange('twc_custom_fields', JSON.stringify(fields));
    }}
    onColourChange={(colour) => onChange('twc_selected_colour', colour)}
    onMaterialChange={(material) => onChange('twc_selected_material', material)}
    readOnly={readOnly}
  />
)}
```

### Step 2: Modify DynamicCurtainOptions.tsx
Same pattern - fetch TWC data via template's `inventory_item_id` and render `TWCProductOptions` when detected.

### Step 3: Ensure Data Persistence
Update the measurement change handlers to properly store:
- `twc_item_number` (from linked inventory)
- `twc_selected_colour`
- `twc_selected_material`
- `twc_custom_fields` (serialized array)

These flow through to `useQuoteItems.ts` which already handles them.

## Files to Modify

| File | Changes |
|------|---------|
| `src/components/measurements/roller-blind-fields/DynamicRollerBlindFields.tsx` | Add TWC detection via inventory_item_id, render TWCProductOptions |
| `src/components/measurements/dynamic-options/DynamicCurtainOptions.tsx` | Same TWC detection and integration |

## Testing Verification
1. Select a TWC-linked template (blind or curtain)
2. Verify TWCProductOptions appears with correct questions
3. Select material, colour, and answer required questions
4. Save quote item
5. Check `quote_items.product_details` contains all TWC data
6. Open Supplier Ordering > TWC > verify Order Details shows correct specifications

## Technical Notes
- TWC detection uses `inventory_item_id` → `enhanced_inventory_items.metadata.twc_item_number`
- Questions support dependent fields (e.g., Remote options only when Control Type = Motor)
- All data persists through standard measurements flow to quote_items

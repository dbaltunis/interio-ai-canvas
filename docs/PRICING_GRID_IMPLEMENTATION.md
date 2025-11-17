# Pricing Grid Implementation Guide

## Overview
This document explains how pricing grids work for Venetian Blinds, Vertical Blinds, Cellular Shades, Shutters, and Awnings.

## Architecture

### 1. Database Structure

#### `pricing_grids` Table
Stores the actual pricing grid data:
- `grid_code`: Unique code (e.g., 'VENETIAN_ALU_25')
- `name`: Display name
- `grid_data`: JSONB containing pricing matrix with:
  - `dropRanges`: Array of drop/height values (e.g., ["100", "150", "200"])
  - `widthRanges`: Array of width values (e.g., ["50", "100", "150"])
  - `prices`: 2D array of prices indexed by [dropIndex][widthIndex]

#### `curtain_templates` Table
Templates reference pricing grids:
- `pricing_type`: Set to `'pricing_grid'` for grid-based pricing
- `pricing_grid_data`: Empty initially, enriched at runtime
- `treatment_category`: Category like 'venetian_blinds', 'shutters', etc.

#### `treatment_options` Table
Material options track inventory:
- `key`: 'material', 'cell_material', 'canvas_material'
- `tracks_inventory`: `true` for material options
- `pricing_method`: 'per-sqm' or 'per-panel'
- `treatment_category`: Links to curtain template category

#### `option_values` Table
Individual material choices:
- `inventory_item_id`: Links to `enhanced_inventory_items`
- `extra_data`: Contains pricing info and method

## Data Flow

### Step 1: Template Selection
```typescript
// User selects a template
const template = await supabase
  .from('curtain_templates')
  .select('*')
  .eq('id', templateId)
  .single();

// Template has: pricing_type = 'pricing_grid'
```

### Step 2: Grid Enrichment
```typescript
import { enrichTemplateWithGrid } from '@/utils/pricing/templateEnricher';

// Enriches template with actual grid data
const enrichedTemplate = await enrichTemplateWithGrid(template, fabricItem);

// Now has:
// - pricing_grid_data: { dropRanges, widthRanges, prices }
// - resolved_grid_id: UUID
// - resolved_grid_code: 'VENETIAN_ALU_25'
```

### Step 3: Material Selection
```typescript
// User selects material from treatment options
const materialOptions = await supabase
  .from('treatment_options')
  .select('*, option_values(*)')
  .eq('treatment_category', 'venetian_blinds')
  .eq('key', 'material');

// Each option value can link to inventory:
// option_values.inventory_item_id -> enhanced_inventory_items.id
```

### Step 4: Price Calculation
```typescript
import { getPriceFromGrid } from '@/hooks/usePricingGrids';

// Calculate manufacturing cost from template grid
const manufacturingCost = getPriceFromGrid(
  enrichedTemplate.pricing_grid_data,
  widthCm,
  dropCm
);

// Calculate material cost (if material has its own grid)
const materialCost = getPriceFromGrid(
  materialItem.pricing_grid_data,
  widthCm,
  dropCm
);

const totalCost = manufacturingCost + materialCost + optionsCosts;
```

## Pricing Grid Examples

### Venetian Blinds (25mm Aluminum)
```json
{
  "dropRanges": ["100", "150", "200", "250"],
  "widthRanges": ["50", "100", "150", "200"],
  "prices": [
    [45, 55, 65, 75],    // Drop 100cm
    [50, 60, 70, 80],    // Drop 150cm
    [55, 65, 75, 85],    // Drop 200cm
    [60, 70, 80, 90]     // Drop 250cm
  ]
}
```

### Vertical Blinds (Fabric)
```json
{
  "dropRanges": ["150", "200", "250"],
  "widthRanges": ["100", "150", "200", "250"],
  "prices": [
    [55, 70, 85, 100],   // Drop 150cm
    [65, 80, 95, 110],   // Drop 200cm
    [75, 90, 105, 120]   // Drop 250cm
  ]
}
```

## Material Options Configuration

### Venetian Blinds - Material
- **tracks_inventory**: `true`
- **pricing_method**: `'per-sqm'`
- **Values**: Aluminum, Wood, Faux Wood

### Vertical Blinds - Material
- **tracks_inventory**: `true`
- **pricing_method**: `'per-sqm'`
- **Values**: Fabric, PVC, Blackout Fabric

### Cellular Shades - Cell Material
- **tracks_inventory**: `true`
- **pricing_method**: `'per-sqm'`
- **Values**: Single Cell, Double Cell, Blackout Cell

### Shutters - Material
- **tracks_inventory**: `true`
- **pricing_method**: `'per-panel'`
- **Values**: Basswood, PVC, Aluminum

### Awnings - Canvas Material
- **tracks_inventory**: `true`
- **pricing_method**: `'per-sqm'`
- **Values**: Acrylic Canvas, Polyester Canvas, Vinyl Coated

## Integration Points

### 1. Calculator Components
Files: `src/components/measurements/dynamic-options/utils/blindCostCalculator.ts`

Handles:
- Template-based manufacturing costs using grids
- Material costs from inventory (with optional grids)
- Option costs based on pricing methods

### 2. Pricing Strategies
Files: `src/utils/pricing/pricingStrategies.ts`

Defines:
- All pricing methods (fixed, per-unit, per-sqm, per-panel, pricing-grid)
- Calculation logic for each method
- Fallback behavior

### 3. Grid Resolution
Files: `src/utils/pricing/gridResolver.ts`

Handles:
- Finding correct pricing grid based on:
  - Product type (treatment_category)
  - System type (optional)
  - Price group (fabric grade A, B, C, etc.)
- Fetching grid data from database

### 4. Grid Price Lookup
Files: `src/hooks/usePricingGrids.ts`

Function: `getPriceFromGrid(gridData, width, drop)`
- Finds closest matching dimension in grid
- Interpolates prices if exact match not found
- Returns 0 if no valid match

## Current Implementation Status

✅ **Phase 1 Complete**: Templates updated with `pricing_type: 'pricing_grid'`
✅ **Phase 2 Complete**: Material options created with `tracks_inventory: true`
✅ **Phase 3 Complete**: Integration code already supports grid-based pricing

## Testing the System

### 1. Verify Templates
```sql
SELECT name, treatment_category, pricing_type
FROM curtain_templates
WHERE treatment_category IN ('venetian_blinds', 'vertical_blinds', 'cellular_shades', 'shutters', 'awning')
AND pricing_type = 'pricing_grid';
```

### 2. Verify Pricing Grids
```sql
SELECT grid_code, name, active
FROM pricing_grids
WHERE grid_code IN (
  'VENETIAN_ALU_25', 'VENETIAN_WOOD_50', 
  'VERTICAL_FABRIC', 'VERTICAL_PVC',
  'CELLULAR_SINGLE', 'CELLULAR_DOUBLE',
  'SHUTTER_BASSWOOD', 'SHUTTER_PVC',
  'AWNING_FIXED', 'AWNING_RETRACTABLE'
);
```

### 3. Verify Material Options
```sql
SELECT treatment_category, key, label, tracks_inventory, pricing_method
FROM treatment_options
WHERE key IN ('material', 'cell_material', 'canvas_material')
AND template_id IS NULL;
```

## Adding New Products

To add a new product with pricing grid:

1. **Create Template**:
```sql
INSERT INTO curtain_templates (
  name, treatment_category, pricing_type, ...
) VALUES (
  'New Product', 'venetian_blinds', 'pricing_grid', ...
);
```

2. **Create Pricing Grid**:
```sql
INSERT INTO pricing_grids (
  user_id, grid_code, name, grid_data, active
) VALUES (
  user_id, 'UNIQUE_CODE', 'Display Name',
  '{"dropRanges": [...], "widthRanges": [...], "prices": [[...]]}'::jsonb,
  true
);
```

3. **Create Material Option** (if needed):
```sql
INSERT INTO treatment_options (
  key, label, treatment_category, tracks_inventory, pricing_method, ...
) VALUES (
  'material', 'Material', 'venetian_blinds', true, 'per-sqm', ...
);
```

4. **Add Material Values**:
```sql
INSERT INTO option_values (
  option_id, code, label, extra_data, inventory_item_id
) VALUES (
  option_id, 'aluminum', 'Aluminum',
  '{"pricing_method": "per-sqm"}'::jsonb,
  inventory_item_id
);
```

## Troubleshooting

### No Price Returned
- Check if grid_data has matching dimensions
- Verify dropRanges and widthRanges contain your size
- Check console logs for "getPriceFromGrid" debug output

### Wrong Price
- Verify prices array indexes match dimension order
- Check if interpolation is needed for in-between sizes
- Ensure grid_data structure matches expected format

### Material Not Linked to Inventory
- Verify `tracks_inventory = true` on treatment_option
- Check `inventory_item_id` is set on option_value
- Ensure inventory item exists and is active

## Future Enhancements

- **Grid Templates**: Create grid templates for common size patterns
- **Bulk Import**: CSV import for pricing grids
- **Grid Versioning**: Track pricing changes over time
- **Dynamic Grid Resolution**: Auto-select grid based on material properties
- **Price Rules Engine**: Complex pricing logic beyond simple grids

# System Blind Templates Setup Guide

## Overview
This guide explains how to add system templates for Cellular/Honeycomb, Venetian, and Vertical blinds that work with pricing grids (similar to Roller Blinds).

## Key Differences from Fabric-Based Products
- **No fabric selection required** - pricing comes from pricing grids
- **Uses `pricing_grid` as pricing method**
- **Must have `system_type` defined** for grid resolution
- **Treatment category must match** the predefined categories

## SQL to Insert System Templates

Run this SQL in your Supabase SQL Editor to add the system templates:

```sql
-- Insert Cellular/Honeycomb Blind System Template
INSERT INTO curtain_templates (
  name,
  description,
  treatment_category,
  curtain_type,
  unit_price,
  pricing_type,
  manufacturing_type,
  is_system_default,
  active,
  system_type,
  user_id,
  created_at,
  updated_at
) VALUES (
  'Cellular Shade',
  'Honeycomb cellular shade with pricing grid support',
  'cellular_shades',
  'blind',
  0.00,
  'pricing_grid',
  'cellular',
  true,
  true,
  'cellular_standard',
  '00000000-0000-0000-0000-000000000000', -- System user ID
  NOW(),
  NOW()
);

-- Insert Venetian Blind System Template
INSERT INTO curtain_templates (
  name,
  description,
  treatment_category,
  curtain_type,
  unit_price,
  pricing_type,
  manufacturing_type,
  is_system_default,
  active,
  system_type,
  user_id,
  created_at,
  updated_at
) VALUES (
  'Venetian Blind',
  'Horizontal venetian blind with pricing grid support',
  'venetian_blinds',
  'blind',
  0.00,
  'pricing_grid',
  'venetian',
  true,
  true,
  'venetian_standard',
  '00000000-0000-0000-0000-000000000000', -- System user ID
  NOW(),
  NOW()
);

-- Insert Vertical Blind System Template
INSERT INTO curtain_templates (
  name,
  description,
  treatment_category,
  curtain_type,
  unit_price,
  pricing_type,
  manufacturing_type,
  is_system_default,
  active,
  system_type,
  user_id,
  created_at,
  updated_at
) VALUES (
  'Vertical Blind',
  'Vertical blind with pricing grid support',
  'vertical_blinds',
  'blind',
  0.00,
  'pricing_grid',
  'vertical',
  true,
  true,
  'vertical_standard',
  '00000000-0000-0000-0000-000000000000', -- System user ID
  NOW(),
  NOW()
);
```

## Template Configuration Details

### Cellular Shade
- **Treatment Category**: `cellular_shades`
- **System Type**: `cellular_standard` (or `cellular_single`, `cellular_double` for variants)
- **Pricing Method**: `pricing_grid`
- **Manufacturing Type**: `cellular`

### Venetian Blind
- **Treatment Category**: `venetian_blinds`
- **System Type**: `venetian_standard` (or `venetian_25mm`, `venetian_50mm` for slat sizes)
- **Pricing Method**: `pricing_grid`
- **Manufacturing Type**: `venetian`

### Vertical Blind
- **Treatment Category**: `vertical_blinds`
- **System Type**: `vertical_standard` (or `vertical_89mm`, `vertical_127mm` for louvre sizes)
- **Pricing Method**: `pricing_grid`
- **Manufacturing Type**: `vertical`

## Setting Up Pricing Grids

For each blind type, you'll need to:

1. **Create Pricing Grid** (Settings → Products → Pricing Grids)
   - Upload CSV with Width × Drop pricing matrix
   - Set appropriate price ranges

2. **Create Routing Rules** (Settings → Products → Pricing Grid Rules)
   - Product Type: `blinds` or specific blind type
   - System Type: Match the template's system_type (e.g., `cellular_standard`)
   - Priority: Set appropriately (lower = higher priority)
   - Active: `true`

3. **Clone & Customize Template** (Settings → Products → Window Coverings → Template Library)
   - Clone the system template
   - Set your custom pricing
   - Add any custom options

## Testing

After adding templates:

1. Go to **Settings → Products → Window Coverings → Template Library**
2. You should see sections for:
   - Cellular Shades
   - Venetian Blinds
   - Vertical Blinds
3. Clone any template
4. Create a job and select the blind type
5. Enter measurements (width/drop)
6. Pricing should resolve from the pricing grid

## Troubleshooting

### Template not showing in library
- Check `is_system_default = true`
- Check `active = true`
- Refresh the page

### Pricing not resolving
- Check that `system_type` matches your pricing grid rule
- Check that pricing grid rule is `active = true`
- Check that pricing grid has appropriate width/drop ranges
- Check browser console for resolution logs

### "No fabric selected" error
- This shouldn't happen for grid-based blinds
- If it does, check that `pricing_type = 'pricing_grid'`
- Ensure template doesn't have `requires_fabric = true`

## Advanced: Multiple Variants

You can create multiple system templates for variants:

**Cellular Shades:**
- `cellular_single` - Single cell
- `cellular_double` - Double cell (better insulation)
- `cellular_blackout` - Blackout cellular

**Venetian Blinds:**
- `venetian_25mm` - 25mm slats
- `venetian_50mm` - 50mm slats
- `venetian_wood` - Wooden venetian

**Vertical Blinds:**
- `vertical_89mm` - 89mm louvres
- `vertical_127mm` - 127mm louvres
- `vertical_fabric` - Fabric vertical blinds

Each variant would have its own pricing grid and routing rules.

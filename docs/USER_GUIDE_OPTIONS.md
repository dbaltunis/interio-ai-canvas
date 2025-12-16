# Treatment Options Management Guide

Complete guide for managing treatment options in InterioApp.

---

## Overview

Treatment options are configurable features that can be added to window treatments (e.g., motorization, controls, linings). Each template can have its own set of enabled options with custom ordering.

### Option Types
- **System Options**: Default options available to all accounts
- **TWC Options**: Imported from supplier (identified by blue TWC badge)
- **Custom Options**: Created by your account

---

## Accessing Options Configuration

### Template-Level Options
1. Go to **Settings → Window Coverings → Templates**
2. Select a template (e.g., "Roller Blind TWC")
3. Click the **Options** tab

### Global Options Management
1. Go to **Settings → Products → Options**
2. View, edit, or create options for any treatment category

---

## Enabling & Disabling Options

### Per-Template Control
Each template can enable/disable options independently:

1. Open template → **Options** tab
2. Toggle the switch next to each option:
   - **ON** (green): Option appears in measurement worksheet
   - **OFF** (gray): Option hidden from worksheet

### Effect of Disabling
- Option won't appear when creating new measurements
- Previously saved quotes keep their data
- Other templates using same option unaffected

---

## Arranging Option Display Order

### Drag-and-Drop Reordering
1. Open template → **Options** tab
2. Look for the grip handle (⋮⋮) on each option
3. Click and drag to reorder
4. Order saves automatically

### Order Persistence
- Order is saved per template
- Same option can have different positions in different templates
- Order is preserved in:
  - Measurement worksheet
  - Saved quotes
  - Work orders
  - PDF documents

---

## Hiding Specific Option Values

When a supplier provides 79 option values but you only need 12, you can hide the unwanted values:

### Toggle Individual Values
1. Open template → **Options** tab
2. Expand an option to see its values
3. Click the **Eye** icon on each value to toggle:
   - 👁️ Eye: Value is visible in dropdowns
   - 👁️‍🗨️ Eye-Off: Value is hidden

### Bulk Actions
- **Show All**: Makes all values visible
- **Hide All**: Hides all values

### Per-Template Filtering
- Hidden values only affect the current template
- Other templates using the same option can show all values
- Useful for limiting supplier option sets to relevant choices

---

## Creating Custom Options

### Step-by-Step
1. Go to **Settings → Products → Options**
2. Click **+ Add Option**
3. Fill in required fields:
   - **Name**: Display name (e.g., "Motor Type")
   - **Key**: Unique identifier (e.g., "motor_type")
   - **Treatment Category**: Which treatments use this option
   - **Description**: Optional help text

### Adding Option Values
1. After creating the option, click **Add Value**
2. For each value, enter:
   - **Label**: What user sees (e.g., "Standard Motor")
   - **Price**: Additional cost (can be 0)
   - **Is Default**: Set as pre-selected option

### Pricing Methods
- **Fixed**: Flat price per item
- **Per Linear Meter**: Price × fabric length
- **Per Square Meter**: Price × treatment area
- **Per Unit**: Price × quantity

---

## Managing TWC-Imported Options

### Identification
- TWC options display a blue **"TWC"** badge
- Imported automatically when you sync products from TWC supplier

### Editing TWC Options
TWC options can be edited in **Settings → Products → Options**:
- ✅ Add or remove values
- ✅ Change prices
- ✅ Edit descriptions
- ❌ Cannot delete the TWC source record

### Consolidating Options
If TWC imports duplicate options:
1. Keep one version (edit as needed)
2. Disable duplicates in template settings
3. Or merge values into single option

---

## Linking Options to Inventory

### Auto-Create Color Sub-Options
When you link an inventory item with colors:
1. System automatically creates "Color" sub-option
2. Each color becomes a selectable choice
3. Item price applies to all color choices

### How to Link
1. Edit an option value
2. Select **Inventory Item** dropdown
3. Choose the linked product
4. Colors from that product become available

---

## Best Practices

### Organization
- ✅ Keep option names clear and consistent
- ✅ Use descriptive keys (snake_case recommended)
- ✅ Group related options together via ordering

### Template Configuration
- ✅ Only enable options relevant to each template
- ✅ Hide supplier values you don't offer
- ✅ Set sensible defaults to speed up quoting

### Pricing
- ✅ Review option prices regularly
- ✅ Use per-meter pricing for continuous materials
- ✅ Set high-value options (motors) as non-default

---

## Troubleshooting

### Option Not Showing in Worksheet
1. Check if option is **enabled** on the template
2. Verify option is assigned to correct treatment category
3. Check if all values are hidden (need at least one visible)

### Option Missing from Quote
1. Verify option was selected during measurement
2. Check if option was enabled when quote was saved
3. Review saved cost_breakdown for option data

### TWC Options Not Appearing
1. Run **Sync from TWC** to import latest options
2. Check that options have `option_type_categories` entries
3. Verify `template_option_settings` linkage exists

### Duplicate Options
1. Go to **Settings → Products → Options**
2. Identify duplicates by similar names
3. Disable or merge as needed
4. Keep one canonical version per option type

---

## Quick Reference

| Action | Location |
|--------|----------|
| Enable/disable option | Template → Options tab → Toggle |
| Reorder options | Template → Options tab → Drag grip |
| Hide specific values | Template → Options → Expand → Eye icon |
| Create new option | Settings → Products → Options → + Add |
| Edit TWC option | Settings → Products → Options → Select |
| Link to inventory | Option value → Inventory Item dropdown |

---

*Last Updated: December 2025*

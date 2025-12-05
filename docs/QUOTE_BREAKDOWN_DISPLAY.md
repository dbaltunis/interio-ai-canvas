# Quote Breakdown Display System

## Critical Documentation - DO NOT MODIFY WITHOUT REVIEW

This document describes how treatment options and materials are displayed in client-facing quotes. This is a customer-facing feature that must remain stable and consistent.

## Overview

The quote breakdown system displays detailed line items for each treatment in a project, showing materials, costs, and all selected options to clients.

## Data Source

**Primary File**: `src/utils/quotes/buildClientBreakdown.ts`

This file converts saved window summary data into a client-facing breakdown structure.

## How It Works

### 1. Material Lines
- **Fabric/Material**: Displays fabric or blind material with quantity (sqm), unit price, and total cost
- **Lining**: Shows lining type and cost (if applicable)
- **Heading**: Displays heading type and cost (if applicable)

### 2. Treatment Options Display

**CRITICAL RULE**: Treatment options are ONLY sourced from `summary.selected_options` array.

#### Why Only selected_options?
- `selected_options` contains pre-formatted, client-facing option names
- It includes proper formatting, descriptions, and prices
- It's populated during treatment creation with user-selected choices
- Raw measurement data in `measurements_details` is for internal calculations only

#### Format
Each option in `selected_options` has:
```typescript
{
  name: string,           // Display name (e.g., "Mount Type: Inside Mount")
  description?: string,   // Additional description
  price: number,         // Option cost (0 for included options)
  image_url?: string     // Optional image
}
```

#### Display Behavior
- ALL options are displayed, even if price is $0.00
- $0.00 items show "Included" instead of price
- This ensures clients see complete treatment configuration:
  - Mount Type
  - Control Type
  - Lift System
  - Hardware Type
  - Vane/Slat Width
  - Louvre Width
  - Chain Side
  - Stack Direction
  - Lining Type
  - Heading Type
  - Pattern Match (wallpaper)
  - And any other treatment-specific options

### 3. Manufacturing Cost
- Shows separately unless using pricing grid
- Pricing grid treatments combine fabric + manufacturing into single line

## Treatment Type Support

The system supports ALL treatment types:
- ✅ Curtains
- ✅ Roman Blinds
- ✅ Roller Blinds
- ✅ Vertical Blinds
- ✅ Venetian Blinds
- ✅ Plantation Shutters
- ✅ Wallpaper
- ✅ Any future treatment types

## DO NOT

❌ Extract options from `measurements_details` - this creates duplicates and shows raw data
❌ Filter out zero-price options - clients need to see all configuration details
❌ Modify option names or formatting - they're set during treatment creation
❌ Add custom logic per treatment type - the system is treatment-agnostic

## Testing Requirements

Before any changes to `buildClientBreakdown.ts`:

1. Test with multiple treatment types (curtains, roman blinds, roller blinds, wallpaper)
2. Verify ALL options display correctly with proper names
3. Confirm no duplicates appear
4. Check that $0.00 options show as "Included"
5. Ensure fabric/material/manufacturing lines are correct

## Option Grouping System (Parent-Child Merging)

The system automatically groups related options (e.g., "Lining Types" + "Lining Types - colours") into single rows for cleaner quote display.

### Naming Convention Required

For automatic grouping to work, option names MUST follow this pattern:

- **Parent option**: `"Type Name: Selected Value"` 
  - Example: `"Lining Types: Blockout Lining"`
  - Example: `"Hardware Selection: Standard Track"`

- **Child option**: `"Type Name - suffix: Selected Value"`
  - Example: `"Lining Types - colours: white"`
  - Example: `"Hardware Selection - finish: Chrome"`

### Supported Child Suffixes

The following suffixes are recognized as child indicators:
- Colors: `_colour`, `_colours`, `_color`, `_colors`
- Dimensions: `_size`, `_sizes`, `_width`, `_length`, `_height`
- Appearance: `_style`, `_styles`, `_finish`, `_finishes`
- Materials: `_material`, `_materials`
- Hardware: `_track`, `_tracks`, `_rod`, `_rods`, `_chain`, `_chains`
- Blinds: `_slat`, `_slats`, `_vane`, `_vanes`, `_louvre`, `_louvres`

### What NOT to use as suffixes

These are PARENT category patterns and should NOT be in childSuffixes:
- `_type`, `_types` (e.g., "Lining Types" is a parent)
- `_option`, `_options` (e.g., "Control Options" is a parent)
- `_control`, `_controls` (e.g., "Control Type" is a parent)
- `_mount`, `_mounts` (e.g., "Mount Type" is a parent)

### How Grouping Works

1. Extract type key from name (everything before first colon)
2. Normalize key (lowercase, spaces/dashes → underscores)
3. If normalized key ends with a child suffix → it's a CHILD
4. Find parent by removing suffix from key
5. Merge child into parent row: `"Parent: Value; Suffix: ChildValue"`

### Example Grouping Result

**Input items:**
- `"Lining Types: Blockout Lining"` - $50.00
- `"Lining Types - colours: white"` - $0.00

**Output (single row):**
- `"Lining Types: Blockout Lining; Colours: white"` - $50.00

## Related Files

- `src/utils/quotes/buildClientBreakdown.ts` - Main breakdown builder with groupRelatedOptions()
- `src/components/settings/templates/visual-editor/LivePreview.tsx` - Live preview with same grouping logic
- `src/components/quotes/QuoteItemBreakdown.tsx` - Display component
- `src/components/quotation/QuotePreview.tsx` - Quote preview
- `windows_summary` database view - Source data

## Change History

- 2025-12-05: Fixed parent-child grouping by extracting type key before colon and removing aggressive suffixes (_type, _option, _control, _mount)
- 2025-11-23: Established selected_options as single source of truth for options display
- 2025-11-23: Added comprehensive documentation to prevent future breaks

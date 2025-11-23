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

## Related Files

- `src/utils/quotes/buildClientBreakdown.ts` - Main breakdown builder
- `src/components/quotes/QuoteItemBreakdown.tsx` - Display component
- `src/components/quotation/QuotePreview.tsx` - Quote preview
- `windows_summary` database view - Source data

## Change History

- 2025-11-23: Established selected_options as single source of truth for options display
- 2025-11-23: Added comprehensive documentation to prevent future breaks

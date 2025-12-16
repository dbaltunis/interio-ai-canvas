# Pricing, Markups & Discounts Guide

Complete guide for configuring pricing, markups, and discounts in InterioApp.

---

## Overview

InterioApp uses a flexible pricing system with:
- **Cost Price**: What you pay (from inventory or pricing grids)
- **Selling Price**: Cost + Markup (what you charge)
- **Discounted Price**: Selling price - Discount (final customer price)

---

## Pricing Grid System

### What are Pricing Grids?
Pricing grids are lookup tables that determine product cost based on dimensions (width × drop). Common for blinds, shutters, and manufactured products.

### Accessing Pricing Grids
1. Go to **Settings → Pricing → Grids**
2. View all uploaded grids
3. Filter by product type or supplier

### Uploading a New Grid

#### Step 1: Prepare CSV File
Format your CSV with:
- First row: Width values (e.g., 600, 900, 1200, 1500...)
- First column: Drop values (e.g., 600, 900, 1200...)
- Cells: Prices at each width×drop intersection

Example:
```csv
,600,900,1200,1500,1800
600,120,145,170,195,220
900,135,165,195,225,255
1200,150,185,220,255,290
```

#### Step 2: Upload
1. Click **+ Upload Grid**
2. Select your CSV file
3. Fill in details:
   - **Supplier**: Select or create supplier
   - **Product Type**: e.g., roller_blinds, venetian_blinds
   - **Price Group**: e.g., Group 1, Group A
   - **Grid Code**: Unique identifier
   - **Description**: Optional notes
4. Click **Upload**

#### Step 3: Preview
- Grid displays as width × drop matrix
- Verify prices are correct
- Check units match your settings

### Grid-to-Product Linking
1. Go to **Inventory → Materials**
2. Select a product
3. Assign **Price Group** matching the grid
4. Product now uses grid pricing

---

## Markup Hierarchy

Markups are applied in order of specificity:

```
┌──────────────────────────────────┐
│   Grid Markup % (highest)        │  ← Set per pricing grid
└──────────────┬───────────────────┘
               ↓ if not set
┌──────────────────────────────────┐
│   Category Markup %              │  ← Set per product category
└──────────────┬───────────────────┘
               ↓ if not set
┌──────────────────────────────────┐
│   Subcategory Markup %           │  ← Set per subcategory
└──────────────┬───────────────────┘
               ↓ if not set
┌──────────────────────────────────┐
│   Global Default Markup %        │  ← Settings → Pricing
└──────────────┬───────────────────┘
               ↓ minimum
┌──────────────────────────────────┐
│   Minimum Markup Floor %         │  ← Prevents selling at cost
└──────────────────────────────────┘
```

### Setting Markups

#### Per Pricing Grid
1. Go to **Settings → Pricing → Grids**
2. Find the grid
3. Edit the **Markup %** column inline
4. Changes save automatically

#### Per Category
1. Go to **Settings → Pricing → Markup by Category**
2. Set markup for each category:
   - Fabrics: e.g., 45%
   - Blinds: e.g., 50%
   - Hardware: e.g., 35%
3. Save changes

#### Global Default
1. Go to **Settings → Pricing → Markup & Tax**
2. Set **Default Markup Percentage**
3. Set **Minimum Markup Percentage** (floor)
4. Save changes

---

## Discounts

### How Discounts Work
Discounts are applied to the **retail price** (after markup), not the cost:

```
Formula:
Cost Price × (1 + Markup%) = Selling Price
Selling Price × (1 - Discount%) = Final Price
```

Example:
- Cost: $100
- Markup: 50% → Selling: $150
- Discount: 10% → Final: $135
- GP%: ($135 - $100) / $135 = 26%

### Applying Discounts
1. In measurement worksheet or quote view
2. Find the **Discount** panel
3. Enter percentage (e.g., 10%)
4. GP% updates in real-time

### Project-Level Discounts
- Apply discount to entire project
- Affects all line items equally
- Visible in quote totals

---

## Tax Configuration

### Accessing Tax Settings
1. Go to **Settings → Pricing → Markup & Tax**
2. Configure tax options

### Options
- **Tax Type**: GST, VAT, Sales Tax, or None
- **Tax Rate**: Percentage (e.g., 10% for GST)
- **Display Mode**: 
  - Tax Inclusive: Prices include tax
  - Tax Exclusive: Tax added at checkout

### Tax Calculations
```
Tax Exclusive:
Subtotal: $1,000
GST (10%): $100
Total: $1,100

Tax Inclusive:
Total: $1,100 (includes $100 GST)
```

---

## Viewing Profit Information

### Permission Required
Profit/margin visibility requires `view_markups` permission:
- **Owner**: Always has access
- **Admin**: Has access by default
- **Manager**: Has access by default
- **Staff**: No access by default (configurable)

### What's Visible
With `view_markups` permission:
- Cost price column
- Selling price column
- GP% (Gross Profit Percentage)
- Markup source indicator

### GP% Calculation
```
GP% = (Selling Price - Cost Price) / Selling Price × 100
```

Example:
- Cost: $100, Selling: $150
- GP% = ($150 - $100) / $150 × 100 = 33.3%

---

## Fabric Pricing Methods

### Per Running Meter/Yard
- Standard for curtain and roman fabrics
- Price × length of fabric needed
- Common for narrow-width fabrics

### Per Square Meter/Foot
- For wide-width fabrics
- Price × area (width × drop in m²)
- Used when fabric width exceeds standard

### Fixed Price
- Flat rate regardless of size
- Common for small items or accessories

### Setting Pricing Method
1. Go to **Inventory → Fabrics**
2. Edit the fabric item
3. Select **Pricing Method**
4. Enter appropriate price

---

## Pricing Grid Display

### Original Units Preserved
Grids display in their original uploaded unit (typically cm):
- Even if your preference is mm, grids show cm
- Prevents confusion with 5cm grid intervals showing as 50mm
- Width/drop headers remain in original format

### Unit Conversion
- Calculations automatically convert to your units
- Final prices unaffected by unit display
- Worksheet shows prices in your currency

---

## Best Practices

### Markup Strategy
- ✅ Set minimum markup to prevent selling at cost
- ✅ Use category markups for consistent margins
- ✅ Apply grid markups for supplier-specific pricing
- ✅ Review margins monthly

### Discount Guidelines
- ✅ Use discounts sparingly to protect margins
- ✅ Track discount usage per salesperson
- ✅ Set maximum discount limits per role
- ✅ Document discount reasons

### Grid Management
- ✅ Update grids when suppliers change prices
- ✅ Use consistent price group naming
- ✅ Archive old grids rather than delete
- ✅ Verify uploads with preview

---

## Troubleshooting

### Wrong Price in Quote
1. Check if correct pricing grid is assigned
2. Verify price group matches between grid and product
3. Review markup hierarchy for overrides
4. Check for manual price overrides

### Markup Not Applied
1. Verify markup is set at appropriate level
2. Check hierarchy order (grid > category > global)
3. Ensure markup percentage is > 0
4. Review minimum markup floor

### Grid Not Finding Price
1. Check dimensions are within grid range
2. Verify units match (grid may use cm, input may be mm)
3. Ensure grid is assigned to correct product type
4. Check price group assignment

### GP% Seems Wrong
1. Verify cost price is correct
2. Check discount is applied to selling (not cost)
3. Review markup calculation
4. Ensure no manual overrides

---

## Quick Reference

| Setting | Location |
|---------|----------|
| Upload pricing grid | Settings → Pricing → Grids → + Upload |
| Set grid markup | Settings → Pricing → Grids → Markup column |
| Set category markup | Settings → Pricing → Markup by Category |
| Set global default | Settings → Pricing → Markup & Tax |
| Configure tax | Settings → Pricing → Markup & Tax |
| Apply discount | Measurement worksheet → Discount panel |

---

*Last Updated: December 2025*

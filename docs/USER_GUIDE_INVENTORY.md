# Inventory Management Guide

Complete guide for managing inventory in InterioApp.

---

## Overview

InterioApp inventory is organized by material type:
- **Fabrics**: Curtain fabrics, roman fabrics, linings, sheers
- **Materials**: Roller blind fabrics, venetian slats, cellular materials
- **Hardware**: Tracks, rods, brackets, motors
- **Headings**: Heading styles with fullness ratios

---

## Accessing Inventory

### Main Inventory Dashboard
1. Click **Inventory** in main navigation
2. Select category tab: Fabrics, Materials, Hardware, Headings

### Quick Filters
- **Search**: Type to filter by name, SKU, or description
- **Category/Subcategory**: Filter by product type
- **Supplier**: Filter by vendor
- **Price Group**: Filter by pricing tier
- **Stock Status**: In stock, Low stock, Out of stock

---

## Adding Inventory Items

### Step-by-Step
1. Click **+ Add** button in category
2. Fill in required fields:
   - **Name**: Product name
   - **SKU**: Unique identifier
   - **Subcategory**: Product type
   - **Supplier**: Select vendor

3. Add pricing information:
   - **Pricing Method**: Fixed, Per Meter, Per SQM
   - **Cost Price**: What you pay
   - **Sell Price**: What you charge (or use markup)

4. Add optional details:
   - **Description**: Product description
   - **Colors**: Available color options
   - **Width**: Fabric/material width
   - **Image**: Product photo

5. Click **Save**

### Required Fields by Category

| Category | Required Fields |
|----------|-----------------|
| Fabrics | Name, Subcategory, Supplier, Width, Price |
| Materials | Name, Subcategory, Supplier, Price |
| Hardware | Name, Subcategory, Supplier, Price |
| Headings | Name, Fullness Ratio |

---

## Managing Colors

### Adding Colors to Products
1. Edit an inventory item
2. Find the **Colors** section
3. Click **+ Add Color**
4. Enter color name (e.g., "Navy Blue", "Charcoal")
5. Save the item

### Color Tags
Colors are stored as tags on the item. Multiple colors can be added to represent available options.

### Color Display
- Colors appear as swatches in inventory list
- Users select colors in measurement worksheet
- Selected color shows in quotes and work orders

### Excluded Metadata Tags
The system automatically excludes non-color tags from the color selector:
- wide_width
- blockout
- sunscreen
- sheer
- light_filtering
- dimout
- thermal
- to_confirm
- discontinued
- imported
- twc
- fabric
- material

Only actual color names display in the color picker.

---

## Price Groups

### What are Price Groups?
Price groups link inventory items to pricing grids. Items in the same group use the same pricing grid.

### Assigning Price Groups

#### Single Item
1. Edit the inventory item
2. Select **Price Group** from dropdown
3. Save

#### Bulk Assignment
1. Select multiple items (checkboxes)
2. Click **Set Price Group** in toolbar
3. Choose the price group
4. Confirm

### Filtering by Price Group
1. In inventory view, use **Price Group** filter
2. Select a group to view only those items
3. Select **No Price Group** to find unassigned items

### Price Group Naming
Common conventions:
- **Group 1, 2, 3...**: Numeric tiers
- **Group A, B, C...**: Letter tiers
- **Premium, Standard, Budget**: Descriptive tiers

---

## TWC Material Import

### What is TWC?
TWC (The Window Company) is a supplier integration that imports products directly into your inventory.

### How Import Works
1. Connect TWC supplier in Settings
2. Products sync automatically or via **Sync from TWC**
3. Materials appear in Inventory with TWC badge
4. Colors and pricing included

### Identifying TWC Items
- Blue **"TWC"** badge on item
- Supplier shows as TWC
- `twc_product_id` in metadata

### Managing Imported Items
TWC items can be:
- ✅ Edited (name, description, price group)
- ✅ Assigned to different price groups
- ✅ Linked to pricing grids
- ❌ Not deletable while linked to supplier

### Color Consolidation
TWC imports may create separate items per color variant. These are consolidated:
- Single material entry
- Multiple color tags
- Same pricing regardless of color selected

---

## Stock Tracking

### Enabling Tracking
1. Edit inventory item
2. Toggle **Track Inventory** ON
3. Enter **Quantity on Hand**
4. Optionally set **Reorder Point**

### Stock Indicators
- **In Stock**: Quantity > Reorder Point (green)
- **Low Stock**: Quantity ≤ Reorder Point (yellow)
- **Out of Stock**: Quantity = 0 (red badge)

### When Tracking is Disabled
- Quantity shows as "-" (not 0)
- No stock badges display
- Item always available for selection

### Stock Movements
Stock adjusts when:
- Orders are placed (reduces stock)
- Inventory received (increases stock)
- Manual adjustments made

---

## Inventory Images

### Adding Images
1. Edit inventory item
2. Click **Upload Image** or drag-and-drop
3. Image displays as thumbnail

### Image Display
Images appear in:
- Inventory list (thumbnail)
- Fabric/material selection popup
- Quotes and work orders
- PDF documents

### Supported Formats
- JPG, PNG, WebP
- Recommended size: 800×800px
- Max file size: 5MB

---

## Headings (Special Category)

### What are Headings?
Heading inventory items define curtain heading styles with associated fullness ratios and pricing.

### Creating a Heading
1. Go to **Inventory → Headings**
2. Click **+ Add Heading**
3. Fill in:
   - **Name**: e.g., "Double Pinch Pleat"
   - **Fullness Ratio**: e.g., 2.5
   - **Price**: Labor/material cost
   - **Description**: Optional details

### Multiple Fullness Ratios
Some headings support multiple ratios:
1. Toggle **Use Multiple Ratios** ON
2. Add each ratio with its name
3. Users can select ratio in worksheet

### Import from TWC
1. Click **Import from TWC** button
2. Select headings to import
3. Fullness ratios imported automatically
4. TWC badge identifies imported headings

---

## Bulk Operations

### Selecting Items
- Click checkbox on individual items
- Click header checkbox to select all visible
- Use Shift+Click for range selection

### Available Bulk Actions
- **Set Price Group**: Assign price group
- **Set Supplier**: Change supplier
- **Export**: Download as CSV
- **Delete**: Remove selected items (if allowed)

---

## Best Practices

### Organization
- ✅ Use consistent naming conventions
- ✅ Add SKUs for all items
- ✅ Categorize items correctly
- ✅ Keep descriptions updated

### Pricing
- ✅ Assign price groups for grid items
- ✅ Review cost prices regularly
- ✅ Use bulk assignment for efficiency

### Stock
- ✅ Enable tracking for physical inventory
- ✅ Set realistic reorder points
- ✅ Disable tracking for made-to-order items

### Colors
- ✅ Use actual color names only
- ✅ Be consistent with color naming
- ✅ Add all available colors per item

---

## Troubleshooting

### Item Not Appearing in Worksheet
1. Check item is in correct category
2. Verify item is active (not disabled)
3. Ensure item has required fields
4. Check price group matches template grid

### Colors Not Showing
1. Verify colors are actual color names
2. Check for excluded metadata tags
3. Ensure item has colors assigned
4. Review color selector filters

### Price Group Issues
1. Confirm price group exists in pricing grids
2. Verify spelling matches exactly
3. Check grid is assigned to correct product type

### TWC Import Problems
1. Verify TWC supplier is connected
2. Run manual sync from supplier settings
3. Check for import errors in logs
4. Verify account has TWC access

---

## Quick Reference

| Action | Location |
|--------|----------|
| Add item | Inventory → Category → + Add |
| Add colors | Edit item → Colors section |
| Set price group | Edit item or Bulk action |
| Enable stock tracking | Edit item → Track Inventory toggle |
| Import TWC headings | Inventory → Headings → Import from TWC |
| Bulk select | Checkboxes → Toolbar actions |
| Filter by group | Price Group dropdown filter |

---

*Last Updated: December 2025*

# Fabric Leftover Tracking System

## Overview

The fabric leftover tracking system automatically tracks and manages fabric remnants from projects, making them available for reuse in future treatments **without additional charges**.

## How It Works

### 1. **Leftover Generation**

When you create a treatment that generates leftover fabric (e.g., railroaded curtains requiring multiple pieces, or vertical orientation with multiple widths), the system:

- Calculates the exact leftover amount (in square meters or linear meters)
- Shows you a clear notification explaining:
  - How much leftover will be generated
  - That it's charged to the current project
  - That it will be FREE for future use
  - That it will appear in inventory with a yellow badge

### 2. **Automatic Tracking**

The leftover is automatically saved to the `client_fabric_pool` table with:
- Client ID
- Fabric ID  
- Project ID and window ID (where it originated)
- Leftover dimensions (length × width)
- Orientation (vertical/horizontal)
- Created date

### 3. **Inventory Display**

In the **Inventory → Fabrics** section, any fabric with available leftovers shows:

- Regular stock badge (existing inventory)
- **Yellow/Amber badge** showing total leftover amount (e.g., "+2.45 sqm")
- Tooltip on hover showing number of leftover pieces available

This makes it instantly visible which fabrics have free leftover material available.

### 4. **Reuse in Future Treatments**

When you use the same fabric in a future treatment:

- The system checks if matching leftover exists
- If leftover is sufficient for the new treatment, it's automatically applied
- **The leftover portion is NOT charged** - only new fabric needed is charged
- Cost savings are clearly shown in the calculation breakdown

### 5. **Leftover Depletion**

As leftover pieces are used:
- They're marked as "used" in the pool
- The yellow badge amount decreases
- When fully depleted, the badge disappears
- System tracks which treatment used each leftover piece

## Benefits

### For Your Business
- **Reduce waste** - Track and reuse every scrap of fabric
- **Increase profitability** - Don't pay twice for the same material
- **Better pricing** - Offer competitive quotes using leftover fabric
- **Accurate costing** - Know exactly what's been charged vs. what's free

### For Your Clients
- **Transparent pricing** - Clients see they're charged only once for leftover
- **Cost savings** - Future projects cost less when using leftover fabric
- **Trust building** - Clients appreciate not being double-charged

## User Interface

### During Quote/Measurement

When leftover is generated, you'll see a **blue notification box** with:

```
💡 Leftover Fabric: X.XX sqm

This project will generate X.XX sqm of leftover fabric.

✓ Charged to this project - You're paying for this fabric now
✓ Free for future use - When used in other treatments, this leftover won't be charged again
✓ Visible in inventory - Shows as available leftover with yellow badge
```

### In Inventory

Each fabric card shows:
- **Stock badge** (white/gray): Your regular inventory stock
- **Leftover badge** (yellow/amber): Available leftover from previous projects

Example:
```
Stock: 25m
Leftover: +3.45 sqm (2 pieces from previous projects)
```

## Technical Details

### Database Schema

The system uses the `client_fabric_pool` table:

```sql
- id: UUID (primary key)
- client_id: UUID (who owns this leftover)
- fabric_id: UUID (which fabric)
- project_id: UUID (where it came from)
- window_id: UUID (specific treatment)
- treatment_name: String (e.g., "Living Room Curtains")
- leftover_length_cm: Number (length of leftover)
- fabric_width_cm: Number (width of leftover)
- orientation: 'vertical' | 'horizontal'
- is_available: Boolean (true until used)
- used_in_window_id: UUID (where it was used)
- used_in_treatment_name: String
- used_at: Timestamp
- notes: String (optional)
```

### Aggregation Logic

The `useInventoryLeftovers` hook:
- Queries all available leftover pieces
- Groups by `fabric_id`
- Calculates total sqm across all pieces
- Counts number of pieces
- Returns aggregated totals for display

### Calculation Integration

During treatment calculations:
1. System checks `client_fabric_pool` for matching fabric
2. Finds pieces that match orientation and have sufficient length
3. Applies smallest suitable piece first (to minimize waste)
4. Deducts leftover from total fabric needed
5. Charges only for NEW fabric required
6. Shows cost breakdown with leftover savings

## Best Practices

### For Users

1. **Always check leftover before ordering** - Look for yellow badge in inventory
2. **Use leftovers strategically** - Plan smaller treatments to consume leftovers
3. **Keep notes** - Add notes to leftover pieces about any defects or specific characteristics
4. **Regular review** - Periodically review fabric pool to plan usage

### For Administrators

1. **Client-specific tracking** - Each client has their own fabric pool
2. **Quality control** - Mark leftover as unavailable if damaged
3. **Reporting** - Track leftover generation and usage for waste reduction metrics
4. **Cleanup** - Periodically archive very old unused leftovers

## Frequently Asked Questions

**Q: Can I manually add leftover fabric to the pool?**
A: Not yet - currently only automatically tracked. Manual addition feature coming soon.

**Q: What happens if I delete a project that generated leftover?**
A: The leftover remains in the pool - it's independent once created.

**Q: Can leftover be shared between clients?**
A: No - each client has their own fabric pool for accurate cost tracking.

**Q: What if leftover has a defect?**
A: Mark it as unavailable or delete it from the pool via fabric pool management.

**Q: How do I see all leftover for a specific client?**
A: Go to the client's profile → Fabric Pool tab to see all their leftovers.

**Q: Does this work with pricing grids?**
A: Yes - leftover is tracked regardless of pricing method.

## Future Enhancements

Planned features:
- Manual leftover addition
- Leftover transfer between clients (with cost adjustment)
- Advanced leftover matching (consider pattern matching, dye lot, etc.)
- Leftover usage reports and analytics
- Email notifications when leftover is used
- Leftover expiry/aging management

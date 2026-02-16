

# Smart Service Pricing Units -- Automated Quantity Calculation

## What This Changes

Right now, when you add a service (e.g., "Installation" priced "Per Window"), it always defaults to quantity 1 and you must manually adjust it. This plan makes the **Pricing Unit** field actually functional:

- **Per Window**: Auto-counts all windows/surfaces across the project and sets quantity accordingly. When a new window is added later, a notification badge appears on services prompting you to update.
- **Per Room**: Auto-counts all rooms and sets quantity to that number.
- **Per Metre**: Prompts you to choose which treatment(s) to base the meter calculation on, then sums the linear meters.
- **Per Job / Per Hour / Flat Rate**: Stays manual (user enters quantity).

Additionally:
- The **Category** field will display as a description line in quotes/documents
- The **Pricing Unit** label will appear in itemised detail documents

---

## How It Works (User Perspective)

1. In Settings, you define a service: "Installation -- Per Window -- $50"
2. When adding it to a room, the system queries the project for window count
3. Quantity auto-fills (e.g., 6 windows = qty 6 = $300)
4. If you later add a 7th window, the service card shows an amber indicator: "Window count changed (6 -> 7). Tap to update."
5. Tapping the indicator recalculates quantity to 7

---

## Technical Plan

### 1. Add `unit` column to `room_products` table

Store the pricing unit alongside the room product so we know how to recalculate later.

```sql
ALTER TABLE room_products ADD COLUMN unit text DEFAULT 'each';
```

### 2. Create a utility: `useServiceQuantityResolver`

A new hook that, given a pricing unit and project context, returns the correct quantity:

- `per-window`: Count all surfaces (type = 'window') across all rooms in the project
- `per-room`: Count all rooms in the project
- `per-metre`: Accept a treatment selection, sum `total_meters` from window summaries
- `per-job`, `per-hour`, `flat-rate`: Return null (manual entry)

**File**: `src/hooks/useServiceQuantityResolver.ts`

Inputs: `projectId`, `unit` string
Outputs: `{ autoQuantity: number | null, breakdown: string }`

Uses existing hooks: `useRooms(projectId)` for room count, `useSurfaces(projectId)` for window count, `useProjectWindowSummaries(projectId)` for meter totals.

### 3. Update `ProductServiceDialog` -- Auto-set quantity on service selection

When a service option with `per-window` or `per-room` unit is selected:
- Immediately calculate the auto-quantity using the resolver
- Pre-fill the quantity field with that value
- Show a helper label: "6 windows detected" or "3 rooms detected"

For `per-metre`:
- Show a sub-dialog/dropdown asking which treatments to include
- Calculate total meters from selected treatments' window summaries
- Pre-fill quantity with the total meters

For `per-job` / `per-hour` / `flat-rate`:
- Leave quantity at 1, let user edit manually

### 4. Store `unit` on `room_products` when saving

Update `handleAddProducts` in `RoomCard.tsx` to pass the `unit` field from the service option through to the `room_products` insert. This persists the pricing unit for later recalculation.

### 5. Service staleness detection in `RoomProductsList`

Add a staleness check that compares:
- The stored `quantity` on a `per-window` service vs the current window count
- The stored `quantity` on a `per-room` service vs the current room count

If mismatched, show an amber badge: "Update needed: X windows now" with a tap-to-recalculate action.

**Implementation**: Inside `RoomProductsList`, use `useSurfaces(projectId)` and `useRooms(projectId)` (will need to pass `projectId` as a new prop). Compare counts against product quantity for products with `unit = 'per-window'` or `unit = 'per-room'`.

### 6. Update `ServicesSection` (Settings) -- UI polish

- Add a tooltip/helper text next to the Pricing Unit dropdown explaining each option's automation behavior
- Show the category as "displays as description in quotes" helper text

### 7. Quote/Document display

- Use `service.category` label as the description line in quote line items
- Show the pricing unit label (e.g., "Per Window x 6") in itemised documents

This connects to existing quote rendering in `QuotePreview` and `QuotePDFDocument` -- the `description` field on `room_products` will be enriched with the category label, and the quantity display will include the unit label.

---

## Files to Create/Modify

| File | Action |
|------|--------|
| `src/hooks/useServiceQuantityResolver.ts` | **New** -- auto-quantity logic |
| `src/components/job-creation/ProductServiceDialog.tsx` | Modify -- auto-fill quantity for per-window/per-room/per-metre services |
| `src/components/job-creation/RoomCard.tsx` | Modify -- pass `unit` through to room_products insert |
| `src/components/job-creation/RoomProductsList.tsx` | Modify -- staleness detection + update badge |
| `src/hooks/useRoomProducts.ts` | Modify -- accept `unit` in insert/update types |
| `src/components/settings/tabs/components/ServicesSection.tsx` | Modify -- add helper text for pricing units |
| Database migration | Add `unit` column to `room_products` |

---

## What Does NOT Change

- Core pricing engine / calculation formulas
- Markup logic
- Quote PDF generation structure (just enriched data)
- Calendar/scheduling logic
- Database RLS policies


# INTERIOAPP CALCULATION ALGORITHMS - AUTHORITATIVE SPECIFICATION
## Version 1.0.0 - February 2026

> **CRITICAL: DO NOT MODIFY WITHOUT REVIEW**
> This document defines the authoritative calculation formulas for ALL treatment types.
> Any code that calculates fabric usage, pricing, or measurements MUST follow these specifications.

---

## TABLE OF CONTENTS
1. [Unit Standards](#1-unit-standards)
2. [Curtain Calculations](#2-curtain-calculations)
3. [Roman Blind Calculations](#3-roman-blind-calculations)
4. [Roller Blind Calculations](#4-roller-blind-calculations)
5. [Venetian Blind Calculations](#5-venetian-blind-calculations)
6. [Shutter Calculations](#6-shutter-calculations)
7. [Wallpaper Calculations](#7-wallpaper-calculations)
8. [Known Discrepancies](#8-known-discrepancies-to-fix)
9. [Implementation Files](#9-implementation-files)

---

## 1. UNIT STANDARDS

### Storage (Database)
- **Measurements**: Stored in **MILLIMETERS (MM)**
- **Hem values in templates**: Stored in **CENTIMETERS (CM)**
- **Prices**: Stored in currency units (no conversion needed)

### Calculation Boundary
```
USER INPUT (display unit: inches/cm/mm)
       ↓
CONVERT TO MM (for storage)
       ↓
CONVERT TO CM (for calculations)
       ↓
CALCULATE
       ↓
CONVERT TO USER UNIT (for display)
```

### Conversion Functions
```typescript
mm_to_cm = mm / 10
cm_to_mm = cm * 10
cm_to_m = cm / 100
m_to_cm = m * 100
```

---

## 2. CURTAIN CALCULATIONS

### 2.1 Input Variables
| Variable | Source | Unit |
|----------|--------|------|
| `rail_width` | User measurement | CM |
| `drop` | User measurement | CM |
| `fullness` | User selection or template default | Ratio (e.g., 2.0, 2.5) |
| `header_hem` | Template | CM |
| `bottom_hem` | Template | CM |
| `side_hem` | Template | CM (per side) |
| `seam_hem` | Template | CM (TOTAL per join) |
| `return_left` | User or template | CM |
| `return_right` | User or template | CM |
| `pooling` | User | CM |
| `fabric_width` | Fabric inventory | CM |
| `panel_count` | User selection ('pair' = 2, 'single' = 1) | Count |
| `fabric_rotated` | User selection | Boolean |
| `waste_percent` | Template | Percentage |

### 2.2 Vertical (Standard) Calculation

```
Step 1: Calculate total drop
  total_drop_cm = drop + header_hem + bottom_hem + pooling

Step 2: Calculate finished width (with fullness)
  finished_width_cm = rail_width × fullness

Step 3: Calculate total side hems
  total_side_hems_cm = side_hem × 2 × panel_count
  // 2 sides per curtain × number of curtains

Step 4: Calculate total width with allowances
  total_width_cm = finished_width_cm + return_left + return_right + total_side_hems_cm

Step 5: Calculate widths required
  widths_required = CEIL(total_width_cm / fabric_width)

Step 6: Calculate seam allowance
  seams_count = MAX(0, widths_required - 1)
  seam_allowance_cm = seams_count × seam_hem
  // seam_hem is TOTAL per join, NOT per side

Step 7: Calculate total fabric
  total_fabric_cm = (widths_required × total_drop_cm) + seam_allowance_cm

Step 8: Apply waste percentage
  waste_multiplier = 1 + (waste_percent / 100)
  total_with_waste_cm = total_fabric_cm × waste_multiplier

Step 9: Convert to meters
  linear_meters = total_with_waste_cm / 100
```

### 2.3 Horizontal (Railroaded) Calculation

```
Step 1: Calculate total drop (same as vertical)
  total_drop_cm = drop + header_hem + bottom_hem + pooling

Step 2-4: Calculate total width (same as vertical)

Step 5: Calculate horizontal pieces needed
  horizontal_pieces = CEIL(total_drop_cm / fabric_width)

Step 6: Calculate seam allowance
  seams_count = MAX(0, horizontal_pieces - 1)
  seam_allowance_cm = seams_count × seam_hem

Step 7: Calculate total fabric
  total_fabric_cm = (total_width_cm × horizontal_pieces) + seam_allowance_cm

Step 8-9: Apply waste and convert (same as vertical)
```

### 2.4 Pricing Calculation

```
PRIORITY ORDER:
1. Pricing Grid: Use grid lookup with (effective_width, drop)
2. Per Running Meter: linear_meters × price_per_meter
3. Per SQM: (rail_width_cm / 100) × (drop_cm / 100) × price_per_sqm
4. Fixed: Return fixed price directly
```

---

## 3. ROMAN BLIND CALCULATIONS

Roman blinds use the SAME calculation as curtains but with:
- `fullness` typically = 1.0 (no fullness)
- `panel_count` typically = 1 (single panel)

---

## 4. ROLLER BLIND CALCULATIONS

### 4.1 Area Calculation (SQM)

```
Step 1: Calculate effective width
  effective_width_cm = rail_width + (side_hem × 2)

Step 2: Calculate effective height
  effective_height_cm = drop + header_hem + bottom_hem

Step 3: Calculate square meters
  sqm_raw = (effective_width_cm / 100) × (effective_height_cm / 100)

Step 4: Apply waste
  sqm = sqm_raw × (1 + waste_percent / 100)
```

### 4.2 Pricing Calculation

```
PRIORITY ORDER:
1. Pricing Grid: Use grid lookup with (effective_width, drop)
2. Per SQM: sqm × price_per_sqm
3. Fixed: Return fixed price directly
```

---

## 5. VENETIAN BLIND CALCULATIONS

Same as Roller Blind (area-based calculation)

---

## 6. SHUTTER CALCULATIONS

### 6.1 Area Calculation

```
Step 1: Calculate raw area
  sqm = (rail_width_cm / 100) × (drop_cm / 100)
  // NOTE: Shutters do NOT include hem allowances in SQM
```

### 6.2 Pricing

```
material_cost = sqm × material_price_per_sqm
manufacturing_cost = template.machine_price_per_panel OR (material_cost × 0.6)
total_cost = material_cost + manufacturing_cost + options_cost
```

---

## 7. WALLPAPER CALCULATIONS

### 7.1 Strip-Based Calculation

```
Step 1: Calculate strip length
  strip_length_cm = wall_height_cm + pattern_repeat_cm

Step 2: Calculate strips needed
  strips_needed = CEIL(wall_width_cm / roll_width_cm)

Step 3: Calculate total length
  total_length_cm = strips_needed × strip_length_cm

Step 4: Calculate rolls needed (if sold by roll)
  rolls_needed = CEIL(total_length_cm / roll_length_cm)

Step 5: Apply waste
  final_quantity = quantity × (1 + waste_percent / 100)
```

---

## 8. KNOWN DISCREPANCIES TO FIX

### 8.1 Seam Allowance (×2 vs Direct)

**DISCREPANCY:**
- `useFabricCalculator.ts` line 127: `seamHems × 2` (doubles the value)
- `CalculationEngine.ts` line 279/306: Uses value directly

**CORRECT BEHAVIOR:**
- `seam_hem` in template = TOTAL per join (not per side)
- Do NOT multiply by 2

**FIX REQUIRED:** Update `useFabricCalculator.ts` to NOT multiply seam_hem by 2

### 8.2 Waste Percentage Application - FIXED

**ISSUE:** CalculationEngine was applying waste to COST, useFabricCalculator to METERS
**STATUS:** Fixed - Both now apply waste to LINEAR_METERS

**CORRECT BEHAVIOR:**
- Waste is applied to LINEAR_METERS (affects how much fabric to order)
- `linear_meters` = raw_meters × (1 + waste_percentage / 100)
- `fabric_cost` = linear_meters × price_per_meter (includes waste)

### 8.3 Side Hem for Pairs - FIXED

**ISSUE:** CalculationEngine was not multiplying by panel_count
**STATUS:** Fixed in commit 4266f77

---

## 9. IMPLEMENTATION FILES

### Authoritative Source (USE THIS)
```
/src/engine/CalculationEngine.ts - SINGLE calculation engine
/src/engine/useCurtainEngine.ts - React hook wrapper
/src/contracts/TreatmentContract.ts - Type definitions
```

### To Be Deprecated
```
/src/utils/pricing/calculateTreatmentPricing.ts - LEGACY
/src/utils/blindCostCalculations.ts - LEGACY
/src/components/shared/measurement-visual/hooks/useFabricCalculator.ts - LEGACY (display only)
```

### Display Components (DO NOT CALCULATE)
```
/src/components/measurements/fabric-pricing/AdaptiveFabricPricingDisplay.tsx
/src/components/measurements/dynamic-options/CostCalculationSummary.tsx
```

---

## CHANGE LOG

| Version | Date | Changes |
|---------|------|---------|
| 1.0.0 | 2026-02-05 | Initial specification, fixed panel_count for side hems |
| 1.0.1 | 2026-02-05 | Fixed seam allowance (removed ×2), aligned waste percentage to meters |

---

## APPROVAL

This specification must be approved before any calculation changes:
- [ ] Business Owner
- [ ] Lead Developer
- [ ] QA Lead

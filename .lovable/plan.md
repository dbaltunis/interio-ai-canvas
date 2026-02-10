

## Fix: Missing Sewing/Manufacturing Details in Work Order Views

### Problem

The **portrait** work order view (`WorkshopInformation.tsx`) has **no dedicated "Sewing Details" column**. It uses 4 columns: Item | Fabric & Specs | Measurements | Notes. Hem values are buried in the "Fabric & Specs" column as a compact one-liner (`H:8cm | B:15cm | S:0cm`), and critical manufacturing details like **fullness/heading type, seam allowances, returns, and lining** are either hidden or absent.

The **landscape** view already has a proper "Sewing Details" column, but it conditionally hides details when values are zero, which can suppress valid information like side hems that are stored as `null` in the database.

### What Makers Need to See

For curtains/romans:
- Fullness ratio and heading type (e.g., "2.5x Pinch pleat")
- Hem allowances: Header, Bottom, Side (each)
- Seam allowance (per join x count)
- Returns: Left / Right
- Lining type

For blinds/shutters:
- Mounting type, control side, bracket type
- Slat/louver size
- Manufacturing notes

### Solution

**1. Portrait view (`WorkshopInformation.tsx`) -- Add a "Sewing Details" column**

Restructure the table from 4 columns to 5 columns:
- Item (15%) | Fabric & Details (30%) | Measurements (15%) | **Sewing Details (20%)** | Notes (20%)

The new "Sewing Details" column will mirror the landscape view's logic:
- Show fullness ratio and heading type for curtains/romans
- Show hem allowances (header, bottom, side) with proper unit formatting
- Show seam allowance when seams are present
- Show returns (left/right) when non-zero
- Show lining type
- For blinds: show mounting type, control side, and other relevant manufacturing details

Move hems and fullness OUT of the "Fabric & Specs" column (lines 267-279) into the new column.

**2. Landscape view (`WorkshopInformationLandscape.tsx`) -- Ensure completeness**

Minor fixes:
- Show lining details in the sewing details column (currently only shown in portrait measurements column)
- Ensure side hems display even when stored under alternative keys (`side_hems_cm` vs `side_hem`)

**3. Data layer (`useWorkshopData.ts`) -- Improve side hem resolution**

The `side_hem` field is `null` in the database for some treatments. The fallback chain (line 271) tries `side_hem -> side_hems_cm -> template_details.side_hems`, but the template_details also has no value. Need to also check `measurements_details.side_hems` (plural) as an additional fallback.

### Technical Details

**File: `src/components/workroom/templates/WorkshopInformation.tsx`**

- Change table header from 4 to 5 columns: add "Sewing Details" between "Measurements" and "Notes"
- Add new `<td>` with sewing details logic (matching landscape view pattern):
  - Use `detectTreatmentCategory` and `isManufacturedItem` from `treatmentTypeUtils`
  - Show fullness, hems, returns, seams, lining conditionally
  - For blinds: show manufacturing summary
- Remove duplicate hem/fullness display from "Fabric & Specs" column
- Adjust column widths: Item 15%, Fabric 25%, Measurements 15%, Sewing 25%, Notes 20%

**File: `src/components/workroom/templates/WorkshopInformationLandscape.tsx`**

- Add lining details display in the sewing details column
- Add seam allowance info alongside hem allowances

**File: `src/hooks/useWorkshopData.ts`**

- Expand side hem fallback chain (line 271) to also check `side_hems` (plural form) in measurements_details
- Pass through lining details to the sewing section data


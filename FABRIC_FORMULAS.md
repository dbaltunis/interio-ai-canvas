# Fabric Calculation Formulas

## Source of Truth: orientationCalculator.ts

All values come from user settings - NO HARDCODING.

---

## HORIZONTAL/RAILROADED FABRIC

### Step 1: Calculate Required Width (Curtain Width - becomes fabric LENGTH when railroaded)
```
totalWidthRaw = railWidth × fullness + returnLeft + returnRight
numberOfSideHems = quantity × 2  // from user settings
totalSideHemAllowance = sideHem × numberOfSideHems  // from user settings

// For horizontal: width includes side hems
requiredWidth = totalWidthRaw + totalSideHemAllowance
```

### Step 2: Calculate Seam Allowances
```
verticalSeamsRequired = widthsRequired - 1
horizontalSeamsRequired = horizontalPiecesNeeded - 1
totalSeamAllowance = (verticalSeamsRequired × seamHem × 2) + (horizontalSeamsRequired × seamHem × 2)
```
- `seamHem` comes from user settings (measurements.seam_hems)

### Step 3: Calculate Total Linear Meters
```
totalLengthCm = (widthsRequired × requiredWidth) + totalSeamAllowance
linearMeters = totalLengthCm / 100
```

### Step 4: Multiply by Horizontal Pieces (if drop > fabric width)
```
totalMetersToOrder = linearMeters × horizontalPiecesNeeded
```

### Step 5: Calculate Cost
```
fabricCost = totalMetersToOrder × pricePerMeter
```

**Example (your case):**
```
railWidth = 700cm
fullness = 2.5
sideHems = 20cm (total, for all 4 hems)
returns = 10cm (left + right)
seamHems = 1cm per seam × 2 = 2cm per seam
widthsRequired = 1
seamsRequired = 0

requiredWidth = (700 × 2.5) + 20 + 10 = 1780cm
+ seam allowances = 0cm (no seams)
= 1780cm = 17.80m per piece

horizontalPiecesNeeded = 2
totalMetersToOrder = 17.80m × 2 = 35.60m... wait that doesn't match

Let me check if seams are between horizontal pieces...
horizontalSeamsRequired = 2 - 1 = 1 seam
totalSeamAllowance = 1 × 1cm × 2 = 2cm

Actually: linearMeters = 17.80m includes one piece
But we need seam between the 2 horizontal pieces!

CORRECTED:
linearMeters per piece = 17.80m
seam between pieces = 2cm = 0.02m
BUT seam should be per piece...

Let me re-read orientationCalculator line 142:
totalLengthCm = (widthsRequired × requiredWidth) + totalSeamAllowance

For horizontal with 2 pieces:
widthsRequired = 1 (number of panels)
requiredWidth = 1780cm
horizontalSeamsRequired = 1
totalSeamAllowance = 1 × 1cm × 2 = 2cm

totalLengthCm = (1 × 1780) + 2 = 1782cm = 17.82m
Hmm still doesn't match 15.30m...

Wait, I need to see the actual console logs to understand what's happening.
```

---

## VERTICAL FABRIC

### Step 1: Calculate Required Length (Drop)
```
totalDropRaw = drop + pooling + headerHem + bottomHem
requiredLength = totalDropRaw (or rounded to pattern repeat if applicable)
```

### Step 2: Calculate Panel Width
```
widthPerPanel = (railWidth × fullness + returnLeft + returnRight) / quantity + (sideHem × 2)
```

### Step 3: Calculate Widths Required
```
if (widthPerPanel > fabricWidth):
    widthsRequired = ceil(widthPerPanel / fabricWidth) × quantity
else:
    dropsPerWidth = floor(fabricWidth / widthPerPanel)
    widthsRequired = ceil(quantity / dropsPerWidth)
```

### Step 4: Calculate Seam Allowances
```
verticalSeamsRequired = widthsRequired - 1
totalSeamAllowance = verticalSeamsRequired × seamHem × 2
```

### Step 5: Calculate Total Linear Meters
```
totalLengthCm = (widthsRequired × requiredLength) + totalSeamAllowance
linearMeters = totalLengthCm / 100
```

### Step 6: Calculate Cost
```
fabricCost = linearMeters × pricePerMeter
```

---

## ALL VALUES FROM USER SETTINGS:

- `railWidth`: measurements.rail_width
- `drop`: measurements.drop
- `fullness`: measurements.heading_fullness OR template.fullness_ratio
- `fabricWidth`: fabric_item.fabric_width
- `sideHem`: measurements.side_hems
- `headerHem`: measurements.header_allowance
- `bottomHem`: measurements.bottom_hem
- `seamHem`: measurements.seam_hems
- `returnLeft`: measurements.return_left
- `returnRight`: measurements.return_right
- `pooling`: measurements.pooling
- `quantity`: measurements.quantity (number of panels/curtains)
- `pricePerMeter`: fabric_item.selling_price OR fabric_item.price_per_meter

**NO HARDCODED VALUES - ALL FROM DATABASE/USER INPUT**

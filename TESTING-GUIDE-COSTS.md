# Cost Calculation Testing Guide

## ✅ Recent Fixes Applied

### What Was Fixed:
1. **Options Cost Missing** - Options (£50.00 in your example) were not being saved or displayed
2. **Data Integrity Issues** - Costs changing between measurement dialog and Rooms view
3. **Incomplete Cost Breakdown** - Missing fabric details, options, hardware in quotes

### Fixed Components:
- ✅ `WindowManagementDialog.tsx` - Now saves ALL cost components (fabric, manufacturing, options, hardware, lining, heading)
- ✅ `WindowSummaryCard.tsx` - Now displays options cost in breakdown
- ✅ `useWindowSummary.ts` - Added options_cost, hardware_cost, selected_options to interface
- ✅ `useQuotationSync.ts` - Added options as child item in quotation breakdown

---

## 🧪 Testing Checklist

### Test Each Treatment Type:

#### 1. **CURTAINS** (Standard Curtains)
**What to test:**
- [ ] Fabric cost calculated correctly (linear meters × price per meter)
- [ ] Manufacturing cost shows (per metre or per panel pricing)
- [ ] Lining cost shows if selected (e.g., Standard Lining £X/m)
- [ ] Heading cost shows if applicable (e.g., Pencil Pleat £X)
- [ ] Options cost shows if selected (e.g., Motorized £50)
- [ ] Total in measurement dialog = Total in Rooms view = Total in Quote

**Expected behavior:**
```
Measurement Dialog Shows:
- Fabric Material: £268.80 (5.38m × £50.00/m)
- Assembly: £537.60 (5.38m × £100.00/m sewing)
- Options: £50.00 (Motorized)
Total: £856.40

Rooms View Shows:
- Fabric: £268.80
- Manufacturing: £537.60
- Options: £50.00
Total: £856.40 ← SAME AS MEASUREMENT DIALOG

Quote Shows:
- Window Treatment: £856.40
  - Fabric: £268.80
  - Manufacturing: £537.60
  - Options: £50.00
Total: £856.40 ← SAME AS ABOVE
```

---

#### 2. **ROLLER BLINDS**
**What to test:**
- [ ] Material cost (fabric sold by meter or square meter)
- [ ] Manufacturing cost (machine or hand assembly)
- [ ] Options (fascia, control type, motor, chain position)
- [ ] Hardware cost if applicable
- [ ] Dimensions preserved (width × height)
- [ ] Total matches across all views

**Expected behavior:**
- If pricing grid: Shows single grid price
- If per metre: Material + Manufacturing + Options
- If per sqm: Material (sqm × price) + Manufacturing + Options

---

#### 3. **ROMAN BLINDS**
**What to test:**
- [ ] Fabric cost calculation
- [ ] Manufacturing cost (machine vs hand pricing)
- [ ] Options (lift system, cord type, mount brackets)
- [ ] Lining if applicable
- [ ] Total consistency

**Expected behavior:**
```
Example:
- Material: £75.90 (2.3m × 1 width)
- Manufacturing: £151.80 (machine)
- Options: £50.00 (Motorized, Cord Control)
Total: £277.70
```

---

#### 4. **VENETIAN BLINDS** (Aluminum/Wood/Faux Wood)
**What to test:**
- [ ] Material cost (sold per sqm or per linear meter)
- [ ] Manufacturing/assembly cost
- [ ] Options (slat width, color, tilt mechanism, cord type)
- [ ] Hardware (brackets, wand, cord lock)
- [ ] Total accuracy

**Pricing types supported:**
- `pricing_grid` - Total price from uploaded grid
- `per_sqm` - Square meter pricing
- `per_metre` - Linear meter pricing
- `per_panel` - Fixed panel price

---

#### 5. **VERTICAL BLINDS**
**What to test:**
- [ ] Fabric/PVC material cost
- [ ] Manufacturing cost
- [ ] Options (control type, wand position, chain/cord)
- [ ] Headrail and weights included
- [ ] Total consistency

---

#### 6. **SHUTTERS** (Plantation/Traditional)
**What to test:**
- [ ] Material cost (typically per square meter)
- [ ] Manufacturing cost (usually 60% of material or fixed panel price)
- [ ] Options (louver size, tilt rod, frame type)
- [ ] Hardware (hinges, magnets)
- [ ] Total matches everywhere

**Expected calculation:**
```
Example:
- Material: £450 (sqm × £100/sqm)
- Manufacturing: £270 (60% of material)
- Options: £80 (Custom frame, Hidden tilt rod)
Total: £800
```

---

#### 7. **PANEL GLIDES**
**What to test:**
- [ ] Fabric panels cost
- [ ] Track/rail cost
- [ ] Manufacturing/assembly
- [ ] Options (number of panels, control type)
- [ ] Total consistency

---

#### 8. **CELLULAR/HONEYCOMB SHADES**
**What to test:**
- [ ] Fabric cost (single vs double cell)
- [ ] Manufacturing cost
- [ ] Options (top-down bottom-up, motorization)
- [ ] Total accuracy

---

## 📊 How to Verify Calculations

### Step 1: Open Measurement Dialog
1. Go to Projects → Select Project → Rooms & Treatments
2. Click "Edit" on any window
3. Configure treatment (select template, fabric, options)
4. **Note the Cost Summary totals** (Fabric, Assembly/Manufacturing, Options, Total)

### Step 2: Save Configuration
1. Click "Save Configuration"
2. Close the dialog

### Step 3: Check Rooms View
1. Look at the window card in Rooms view
2. Expand "Details" to see breakdown
3. **Verify ALL costs match measurement dialog:**
   - Fabric cost matches
   - Manufacturing cost matches
   - Options cost shows (if you selected any)
   - Lining/Heading shows (if applicable)
   - **TOTAL MUST MATCH measurement dialog**

### Step 4: Check Quotation
1. Go to "Quotation" tab
2. Look at the line items
3. **Verify:**
   - Window treatment shows correct total
   - Breakdown includes all components (Fabric, Manufacturing, Options)
   - Subtotal = Sum of all windows
   - No duplicate costs
   - No missing costs

---

## 🚨 Common Issues to Watch For

### ❌ WRONG: Total Changes Between Views
```
Measurement Dialog: £478.78
Rooms View: £227.70  ← DIFFERENT!
Quote: £356.20       ← DIFFERENT AGAIN!
```

### ✅ CORRECT: Total Stays Consistent
```
Measurement Dialog: £478.78
Rooms View: £478.78  ← SAME!
Quote: £478.78       ← SAME!
```

---

### ❌ WRONG: Options Cost Missing
```
Measurement Dialog shows:
- Options: £50.00

Rooms View shows:
- Fabric: £268.80
- Manufacturing: £537.60
Total: £806.40  ← £50 MISSING!
```

### ✅ CORRECT: All Costs Present
```
Measurement Dialog shows:
- Options: £50.00

Rooms View shows:
- Fabric: £268.80
- Manufacturing: £537.60
- Options: £50.00  ← PRESENT!
Total: £856.40
```

---

### ❌ WRONG: Dimensions Change
```
Measurement Dialog: 200cm × 230cm
Rooms View: 120cm × 200cm  ← CHANGED!
```

### ✅ CORRECT: Dimensions Preserved
```
Measurement Dialog: 200cm × 230cm
Rooms View: 200cm × 230cm  ← SAME!
```

---

## 🔍 Database Verification (For Developers)

Check `windows_summary` table has all fields populated:

```sql
SELECT 
  window_id,
  treatment_type,
  treatment_category,
  fabric_cost,
  manufacturing_cost,
  options_cost,      -- MUST NOT BE NULL if options selected
  lining_cost,
  heading_cost,
  hardware_cost,
  total_cost,
  rail_width,        -- Dimensions preserved
  drop,              -- Dimensions preserved
  selected_options,  -- Options array preserved
  fabric_details,    -- Fabric data preserved
  cost_summary       -- Complete cost breakdown
FROM windows_summary
WHERE window_id = 'your-window-id';
```

**What to verify:**
- ✅ `options_cost` is NOT zero if you selected options
- ✅ `selected_options` contains your selected options
- ✅ `total_cost` = fabric_cost + manufacturing_cost + options_cost + lining_cost + heading_cost
- ✅ `rail_width` and `drop` match your measurements
- ✅ `cost_summary` contains complete breakdown

---

## 📝 Test Results Template

Copy this template and fill it in as you test:

```
# Test Results - [Date]

## Curtains
- [ ] Costs match across all views
- [ ] Options cost saved and displayed
- [ ] Lining cost shows if applicable
- [ ] Heading cost shows if applicable
- [ ] Total: £_____ (same everywhere)
- Issues: _______________

## Roller Blinds
- [ ] Costs match across all views
- [ ] Options cost saved and displayed
- [ ] Material cost correct
- [ ] Total: £_____ (same everywhere)
- Issues: _______________

## Roman Blinds
- [ ] Costs match across all views
- [ ] Options cost saved and displayed
- [ ] Total: £_____ (same everywhere)
- Issues: _______________

## Venetian Blinds
- [ ] Costs match across all views
- [ ] Options cost saved and displayed
- [ ] Pricing grid working (if using)
- [ ] Total: £_____ (same everywhere)
- Issues: _______________

## Vertical Blinds
- [ ] Costs match across all views
- [ ] Options cost saved and displayed
- [ ] Total: £_____ (same everywhere)
- Issues: _______________

## Shutters
- [ ] Costs match across all views
- [ ] Options cost saved and displayed
- [ ] Manufacturing cost = 60% of material (or per panel)
- [ ] Total: £_____ (same everywhere)
- Issues: _______________

## Overall
- [ ] All treatment types working correctly
- [ ] No data loss when saving
- [ ] No cost discrepancies
- [ ] Quotations accurate
- [ ] Workshop items correct
```

---

## 🎯 Success Criteria

✅ **PASS if:**
1. All treatment types show consistent totals across Measurement Dialog, Rooms View, and Quotation
2. Options cost is ALWAYS included in total (if options selected)
3. Fabric/Material details preserved
4. Dimensions don't change
5. Breakdown shows all components (Fabric, Manufacturing, Options, Lining, Heading)

❌ **FAIL if:**
1. Totals differ between views
2. Options cost missing anywhere
3. Dimensions change after save
4. Cost breakdown incomplete
5. Data lost on save/reload

---

## 💡 Tips for Testing

1. **Test with options** - Always select at least one paid option (e.g., Motorized £50) to verify options cost tracking
2. **Test without options** - Verify totals still work correctly
3. **Test different pricing methods** - Try pricing grid, per metre, per sqm, per panel
4. **Test lining & heading** - For curtains, test with/without lining and different headings
5. **Reload page** - After saving, refresh the browser to verify data persists
6. **Check console** - Open browser console (F12) to see calculation logs

---

## 🐛 If You Find Issues

Report with this information:
1. Treatment type (e.g., "Venetian Blind")
2. What you selected (template, fabric, options)
3. Cost shown in measurement dialog
4. Cost shown in Rooms view
5. Cost shown in quotation
6. Screenshot of each view
7. Console logs (F12 → Console → copy/paste relevant errors)

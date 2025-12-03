# Pre-Launch Testing Checklist

## Overview
This checklist ensures critical functionality works correctly before public launch. Test each item and mark as ✅ passed or ❌ failed.

---

## 1. MEASUREMENT UNITS CONSISTENCY

### Test Setup
1. Go to **Settings → Business Settings**
2. Change length unit to **MM** (millimeters)
3. Save settings

### Verification Points
| Location | What to Check | Pass/Fail |
|----------|---------------|-----------|
| Measurement Worksheet | Rail width/drop inputs show MM label | ☐ |
| Cost Calculation Summary | Fabric dimensions show in MM | ☐ |
| Fabric Selection Panel | Fabric width displays in MM | ☐ |
| Work Order PDF | Measurements display in MM | ☐ |
| Quote PDF | All measurements in MM | ☐ |
| Inventory List | Fabric widths show MM | ☐ |
| Pricing Grid Preview | Grid headers show MM | ☐ |

### Repeat Test
Change to **Inches** and verify same locations show inches.

---

## 2. CURRENCY CONSISTENCY

### Test Setup
1. Go to **Settings → Business Settings**
2. Change currency to **AUD** (or different from current)
3. Save settings

### Verification Points
| Location | What to Check | Pass/Fail |
|----------|---------------|-----------|
| Quote Totals | Shows correct currency symbol | ☐ |
| Cost Calculator | Prices show AUD$ | ☐ |
| Inventory Prices | Product prices show AUD$ | ☐ |
| Invoice Preview | Total shows correct currency | ☐ |
| Work Order | Costs display AUD$ | ☐ |

---

## 3. QUOTE GENERATION FLOW

### Test Steps
1. Create new project with client
2. Add a window/surface
3. Open Measurement Worksheet
4. Select window type
5. Select treatment template (e.g., "Double Pinch Pleat")
6. Enter measurements: Width 2000mm, Drop 2400mm
7. Select fabric from inventory
8. Select heading option
9. Select additional options (motor, controls, etc.)
10. Save treatment
11. Generate quote

### Verification Points
| Check | What to Verify | Pass/Fail |
|-------|----------------|-----------|
| Options Persist | All selected options appear in saved quote | ☐ |
| Prices Correct | Option prices match settings | ☐ |
| No Duplicate Options | Each option appears once only | ☐ |
| Fabric Details | Fabric name, width, cost visible | ☐ |
| Calculations Match | Quote total matches worksheet preview | ☐ |
| PDF Generation | Quote PDF generates without errors | ☐ |

---

## 4. ACCOUNT ISOLATION (Multi-Tenancy)

### Test Setup
1. Log out of current account
2. Log in with a **different test account**

### Verification Points
| Check | What to Verify | Pass/Fail |
|-------|----------------|-----------|
| Inventory | Only see your own products, not other accounts' | ☐ |
| Templates | Only see your own templates | ☐ |
| Treatment Options | Only see your own custom options + system defaults | ☐ |
| Clients | Only see your own clients | ☐ |
| Projects | Only see your own projects | ☐ |
| Quotes | Only see your own quotes | ☐ |

---

## 5. OPTION ENABLE/DISABLE

### Test Steps
1. Go to **Settings → Templates**
2. Select a template (e.g., Roller Blind)
3. Go to **Options** tab
4. **Disable** an option (e.g., "Motor Type")
5. Save template
6. Create new measurement for that template

### Verification Points
| Check | What to Verify | Pass/Fail |
|-------|----------------|-----------|
| Worksheet Display | Disabled option NOT visible in worksheet | ☐ |
| Saved Quote | Disabled option NOT in saved quote | ☐ |
| Re-enable | Enable option → appears in new measurements | ☐ |

---

## 6. IMAGE & COLOR FLOW

### Test Steps
1. Add product to inventory with color (e.g., "Navy Blue")
2. Create measurement using that product
3. Generate quote

### Verification Points
| Check | What to Verify | Pass/Fail |
|-------|----------------|-----------|
| Inventory Display | Color swatch shows in inventory list | ☐ |
| Worksheet Selection | Color visible when selecting fabric | ☐ |
| Quote Line Items | Color/image shows in quote | ☐ |
| Work Order | Color/image shows in work order | ☐ |

---

## 7. PRICING GRID FUNCTIONALITY

### Test Steps
1. Go to **Settings → Products → Pricing Grids**
2. Upload a pricing grid CSV
3. Preview grid - verify it displays correctly
4. Assign grid to inventory product
5. Create quote using that product with specific dimensions

### Verification Points
| Check | What to Verify | Pass/Fail |
|-------|----------------|-----------|
| Grid Upload | CSV imports without errors | ☐ |
| Grid Preview | Displays width/drop matrix correctly | ☐ |
| Price Lookup | Quote uses correct grid price for dimensions | ☐ |
| Edge Cases | Out-of-range dimensions handled gracefully | ☐ |

---

## 8. WORK ORDER GENERATION

### Test Steps
1. Create and save a quote
2. Generate work order from quote

### Verification Points
| Check | What to Verify | Pass/Fail |
|-------|----------------|-----------|
| All Data Present | Measurements, fabric, options all display | ☐ |
| Hem Allowances | Header, bottom, side hems show correctly | ☐ |
| Fabric Usage | Linear meters calculated correctly | ☐ |
| PDF Generation | Work order PDF generates without errors | ☐ |

---

## Critical Issues Log

Record any issues found during testing:

| Issue | Location | Severity | Status |
|-------|----------|----------|--------|
| | | | |
| | | | |
| | | | |

---

## Sign-Off

- [ ] All critical tests passed
- [ ] Known issues documented
- [ ] Ready for soft launch

**Tested by:** ________________  
**Date:** ________________

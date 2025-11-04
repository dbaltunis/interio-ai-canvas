# Pricing Grid System - Test Checklist

## ✅ Completed Setup

### Database Schema
- ✅ `pricing_grids` table created
- ✅ `pricing_grid_rules` table created  
- ✅ RLS policies configured
- ✅ `price_group` field added to `curtain_templates`
- ✅ `system_type` field added to `enhanced_inventory_items`

### Backend Logic
- ✅ Grid resolver (`resolveGridForProduct`)
- ✅ Template enricher (`enrichTemplateWithGrid`)
- ✅ Grid price lookup (`getPriceFromGrid`)
- ✅ Cost calculation integration

### UI Components
- ✅ Pricing Grid Manager (upload CSV grids)
- ✅ Pricing Grid Rules Manager (create routing rules)
- ✅ Sample CSV download helper
- ✅ Settings tabs added

---

## 🧪 Manual Testing Steps

### Test 1: Create a Pricing Grid

1. **Navigate to Settings**
   - Go to Settings → Window Coverings → Pricing Grids tab

2. **Download Sample CSV**
   - Click "Download Sample CSV" button
   - Open the CSV file to verify format

3. **Create a Grid**
   - Fill in Grid Name: "Test Roller Blind Grid"
   - Fill in Grid Code: "RB-TEST-001"
   - Add Description (optional)
   - Upload the sample CSV file
   - Click "Create Pricing Grid"
   - ✅ Verify success toast appears
   - ✅ Verify grid appears in "Existing Pricing Grids" list

4. **Test Grid Data**
   - Open browser console
   - Run: `window.pricingGridTests.testGridPriceLookup()`
   - ✅ Verify prices are returned correctly

---

### Test 2: Create Routing Rules

1. **Navigate to Grid Rules Tab**
   - Go to Settings → Window Coverings → Grid Rules tab

2. **Create a Rule**
   - Select Product Type: "Roller Blinds"
   - Enter System Type: "Cassette"
   - Enter Price Group: "Standard"
   - Set Priority: 100
   - Select the grid created in Test 1
   - Click "Create Rule"
   - ✅ Verify success toast appears
   - ✅ Verify rule appears in "Routing Rules" list

3. **Create Multiple Rules**
   - Create another rule with:
     - Product Type: "Roller Blinds"
     - System Type: "Open Roll"
     - Price Group: "Standard"
     - Priority: 90
   - ✅ Verify both rules show correct priority order

---

### Test 3: Grid Resolution

1. **Test in Browser Console**
   ```javascript
   // Get your user ID
   const { data: { user } } = await supabase.auth.getUser();
   
   // Run grid resolution test
   await window.pricingGridTests.testGridResolution(user.id);
   ```
   - ✅ Verify correct grid is resolved based on rules
   - ✅ Verify matched rule information is correct

---

### Test 4: Template Integration

1. **Create/Edit a Template**
   - Go to Settings → Window Coverings → My Templates
   - Edit an existing roller blind template OR create new one
   - Set the following fields:
     - Pricing Type: "Pricing Grid"
     - System Type: "Cassette" (must match rule)
     - Price Group: "Standard" (must match rule)
   - Save the template
   - ⚠️ NOTE: UI fields for system_type and price_group need to be added

---

### Test 5: Cost Calculation

1. **Create a Job/Quote**
   - Go to Job Management
   - Create a new job
   - Add a window treatment
   - Select the template configured in Test 4
   - Enter dimensions (e.g., 120cm × 180cm)
   - ✅ Verify cost is calculated using pricing grid
   - ✅ Check console logs for "💰 Grid price calculated"

2. **Test Console Calculation**
   ```javascript
   window.pricingGridTests.testEndToEndPricing();
   ```
   - ✅ Verify grid price lookup works
   - ✅ Verify square meter calculation includes hems
   - ✅ Verify total cost is correct

---

## 🐛 Known Issues / TODO

### High Priority
- [ ] Add system_type and price_group fields to template editor UI
- [ ] Add system_type and price_group fields to inventory editor UI
- [ ] Test with real job creation workflow
- [ ] Verify pricing grid data persists correctly

### Medium Priority
- [ ] Add grid preview/visualization in Settings
- [ ] Add validation for CSV format before upload
- [ ] Add ability to edit existing grids
- [ ] Add grid versioning support

### Low Priority
- [ ] Add bulk import for routing rules
- [ ] Add export functionality for grids
- [ ] Add pricing grid history/audit log

---

## 📊 Test Data

### Sample Grid (widths in cm: 50, 100, 150, 200, 250)
| Drop | 50  | 100 | 150 | 200 | 250 |
|------|-----|-----|-----|-----|-----|
| 100  | 45  | 55  | 65  | 75  | 85  |
| 150  | 55  | 65  | 75  | 85  | 95  |
| 200  | 65  | 75  | 85  | 95  | 105 |
| 250  | 75  | 85  | 95  | 105 | 115 |

### Expected Results
- 100cm × 150cm → £65
- 150cm × 200cm → £85
- 200cm × 250cm → £105

---

## 🔍 Debug Tools

### Browser Console Commands

```javascript
// Run all tests
await window.pricingGridTests.runAllTests(userId);

// Test individual components
window.pricingGridTests.testGridPriceLookup();
await window.pricingGridTests.testGridResolution(userId);
await window.pricingGridTests.testTemplateEnrichment();
window.pricingGridTests.testEndToEndPricing();
```

### Database Queries

```sql
-- Check existing grids
SELECT id, name, grid_code, active FROM pricing_grids WHERE active = true;

-- Check routing rules
SELECT id, product_type, system_type, price_group, priority 
FROM pricing_grid_rules WHERE active = true 
ORDER BY priority DESC;

-- Check templates with grid configuration
SELECT name, pricing_type, system_type, price_group 
FROM curtain_templates 
WHERE pricing_type = 'pricing_grid';
```

---

## ✅ Success Criteria

- [ ] Can create pricing grids via CSV upload
- [ ] Can create routing rules with priority
- [ ] Grid resolver returns correct grid based on rules
- [ ] Cost calculations use grid pricing when configured
- [ ] Existing templates without grid configuration still work (backwards compatible)
- [ ] Console logs show clear debugging information
- [ ] No errors in browser console
- [ ] All CRUD operations work (create, read, delete)

---

## 📝 Notes

- Grid pricing is **opt-in** - templates must set `pricing_type = 'pricing_grid'`
- Rules are evaluated by priority (highest first)
- Grid resolution requires: `product_type`, `system_type`, and `price_group`
- Fallback to standard pricing if no grid found
- All changes are backwards compatible with existing workflow

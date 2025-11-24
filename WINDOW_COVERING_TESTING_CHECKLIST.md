# Window Covering Types - Systematic Testing Checklist
**Status as of:** $(date)

## Testing Protocol
For each window covering type, verify:
1. ✅ Template creation works
2. ✅ Heading/Options tab shows correct options
3. ✅ Pricing methods are appropriate (Grid/Per Metre/Per Panel/etc)
4. ✅ Manufacturing section shows correct fields
5. ✅ Inventory selection works in measurement worksheet
6. ✅ All required options are available

---

## 1. CURTAINS ✓
**Status:** VERIFIED
**Pricing Methods:** Per Metre, Per Panel, Per m², Pricing Grid
**Options:** Heading Styles (from inventory)
**Manufacturing Fields:** Header, Bottom, Sides, Seams, Returns (Left/Right), Overlap, Waste%
**Inventory Categories:** Fabric, Hardware
**Hand-Finished:** YES

### Verification Steps:
- [x] Template form opens
- [x] Heading tab shows heading style selector
- [x] Options tab shows link to System → Headings
- [x] Pricing has 4 methods with hand/machine toggle
- [x] Manufacturing shows all hem fields + returns + overlap
- [x] Inventory tabs visible (Fabric/Hardware)

---

## 2. ROMAN BLINDS
**Status:** NEEDS TESTING
**Pricing Methods:** Per Metre, Per m², Pricing Grid
**Options:** Mount Types, Lift Systems, Chain Options, Valance Options
**Manufacturing Fields:** Header, Bottom, Sides, Seams, Returns, Overlap, Waste%
**Inventory Categories:** Fabric, Hardware

### Verification Steps:
- [ ] Template form opens
- [ ] Options tab works
- [ ] Pricing methods correct
- [ ] Manufacturing fields shown
- [ ] Inventory selection works

---

## 3. ROLLER BLINDS
**Status:** NEEDS TESTING
**Pricing Methods:** Pricing Grid, Per m²
**Options:** Control Types, Fascia Types, Mount Types, Tube Sizes, Bottom Rails, Motor Types
**Manufacturing Fields:** Min Width, Max Width (NO hem fields)
**Inventory Categories:** Material (roller fabric), Hardware

### Verification Steps:
- [ ] Template form opens
- [ ] Options tab links to roller blind options
- [ ] Only Grid and Per m² pricing
- [ ] Manufacturing shows ONLY min/max width
- [ ] Inventory shows Material and Hardware tabs
- [ ] Fabric selection for material

---

## 4. VENETIAN BLINDS
**Status:** NEEDS TESTING
**Pricing Methods:** Pricing Grid, Per m²
**Options:** Slat Types, Control Types, Mount Types, Tilt Options
**Manufacturing Fields:** None or Min/Max Width
**Inventory Categories:** Material (slats), Hardware

### Verification Steps:
- [ ] Template form opens
- [ ] Options configured
- [ ] Pricing Grid works
- [ ] Manufacturing appropriate
- [ ] Inventory selection works

---

## 5. VERTICAL BLINDS
**Status:** NEEDS TESTING
**Pricing Methods:** Pricing Grid, Per m²
**Options:** Vane Types, Control Types, Mount Types, Tilt Options
**Manufacturing Fields:** None or Min/Max Width
**Inventory Categories:** Material (vanes), Hardware

### Verification Steps:
- [ ] Template form opens
- [ ] Options configured
- [ ] Pricing Grid works
- [ ] Manufacturing appropriate
- [ ] Inventory selection works

---

## 6. CELLULAR/HONEYCOMB BLINDS
**Status:** PARTIALLY FIXED
**Pricing Methods:** Pricing Grid, Per m²
**Options:** Cell Sizes, Control Types, Mount Types, Lift Systems
**Manufacturing Fields:** None or Min/Max Width
**Inventory Categories:** Material (cellular fabric), Hardware

### Known Issues:
- Naming inconsistency: 'cellular_blinds' vs 'cellular_shades'
- Need to verify both names work in inventory selection

### Verification Steps:
- [x] Naming fix applied (both cellular_blinds and cellular_shades)
- [ ] Template form opens with both names
- [ ] Options configured
- [ ] Pricing Grid works
- [ ] Manufacturing appropriate
- [ ] Inventory shows Material tab
- [ ] Cellular fabric appears in Material category

---

## 7. SHUTTERS / PLANTATION SHUTTERS
**Status:** NEEDS TESTING
**Pricing Methods:** Pricing Grid, Per m²
**Options:** Panel Types, Hinge Types, Frame Types, Louver Sizes
**Manufacturing Fields:** None or Min/Max Width
**Inventory Categories:** Material (shutter panels), Hardware

### Verification Steps:
- [ ] Template form opens
- [ ] Options configured
- [ ] Pricing Grid works
- [ ] Manufacturing appropriate
- [ ] Inventory selection works

---

## 8. PANEL GLIDE
**Status:** NEEDS TESTING
**Pricing Methods:** Per m², Pricing Grid
**Options:** Track Systems, Panel Quantities, Stack Options
**Manufacturing Fields:** TBD
**Inventory Categories:** Fabric (panel fabric), Hardware

### Verification Steps:
- [ ] Template form opens
- [ ] Options configured
- [ ] Pricing works
- [ ] Manufacturing appropriate
- [ ] Inventory selection works

---

## 9. AWNINGS
**Status:** NEEDS TESTING
**Pricing Methods:** Per m², Pricing Grid
**Options:** Awning Types, Frame Types, Control Systems
**Manufacturing Fields:** TBD
**Inventory Categories:** Fabric (awning fabric), Hardware

### Verification Steps:
- [ ] Template form opens
- [ ] Options configured
- [ ] Pricing works
- [ ] Manufacturing appropriate
- [ ] Inventory selection works

---

## 10. WALLPAPER
**Status:** NEEDS TESTING
**Pricing Methods:** Per Roll (per_unit), Per m²
**Options:** None
**Manufacturing Fields:** None
**Inventory Categories:** Fabric (wallcovering)

### Verification Steps:
- [ ] Template form opens
- [ ] Per Roll pricing available
- [ ] No manufacturing section
- [ ] Inventory shows wallcovering items

---

## CRITICAL FIXES COMPLETED:
1. ✅ Restored OPTIONS tab in template form
2. ✅ Restored HEADING tab with inventory-based selection
3. ✅ Fixed inventory tabs (were hidden, now visible)
4. ✅ Restored curtain machine/hand-finished pricing
5. ✅ Restored manufacturing fields (returns, seams, overlap)
6. ✅ Fixed cellular_blinds/cellular_shades naming consistency

---

## NEXT STEPS:
1. Test each window covering type systematically
2. Verify RollerBlindOptionsManager is accessible
3. Check pricing grid uploads work for each type
4. Verify inventory items appear correctly in measurement worksheet
5. Test end-to-end quote creation for each type

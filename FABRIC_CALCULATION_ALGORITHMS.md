# 🔒 FABRIC CALCULATION ALGORITHMS - DO NOT MODIFY WITHOUT APPROVAL

## ⚠️ CRITICAL: FINANCIAL ACCURACY REQUIRED

These algorithms directly affect client invoicing and material ordering. Changes must be:
1. Thoroughly tested with multiple real-world scenarios
2. Verified against manual calculations
3. Approved by business owner before deployment
4. Documented with before/after examples and test results

**Any modification to these calculations without proper approval can result in:**
- ❌ Financial losses due to incorrect fabric ordering
- ❌ Client disputes over pricing discrepancies  
- ❌ Material waste from wrong quantity calculations
- ❌ Loss of business credibility

---

## VERTICAL FABRIC CALCULATION (Standard Orientation)

### Formula (LOCKED):
```
Total Meters = (Widths × Drop with Allowances + Seam Allowances) / 100

Where:
  Drop with Allowances = Raw Drop + Header Hem + Bottom Hem + Pooling + Pattern Repeat
  Seam Allowances = (Widths - 1) × Seam Hem × 2
  Widths = Math.ceil((Rail Width × Fullness + Returns + Side Hems) / Fabric Width)
```

### Implementation Location:
- **Primary:** `src/components/job-creation/treatment-pricing/fabric-calculation/orientationCalculator.ts` (Lines 82-165)
- **Display:** `src/components/measurements/fabric-pricing/AdaptiveFabricPricingDisplay.tsx` (Lines 704-745)

### Test Cases:
- [x] **Single width, no pattern:** 1 × 260cm = 2.60m
- [x] **Multiple widths with seams:** 4 × 260cm + 18cm seams = 10.58m  
- [x] **With pattern repeat:** 4 × 275cm (260 + 15 repeat) + 18cm = 11.18m
- [ ] **User's case:** Rail: 200cm, Drop: 230cm, Fullness: 2.5x, Fabric: 140cm
  - Expected: 4 widths × 260cm (230 + 10 header + 20 bottom) + seams = 10.40-10.60m
  - **Currently showing:** 13.00m ⚠️ UNDER INVESTIGATION

### Known Issues:
- ⚠️ Display formula sometimes shows simplified version that doesn't match final meterage
- ⚠️ Pattern repeat and seam allowances not always visible in breakdown
- ⚠️ Need to verify pooling and pattern repeat are correctly included

---

## HORIZONTAL/RAILROADED FABRIC CALCULATION

### Formula (LOCKED):
```
Horizontal Pieces = Math.ceil((Drop + Header + Bottom + Pooling) / Fabric Width)
Linear Meters per Piece = (Rail Width × Fullness + Returns + Side Hems) / 100
Total Meters = Linear Meters per Piece × Horizontal Pieces + Seam Allowances

Where:
  Seam Allowances = (Horizontal Pieces - 1) × Seam Hem × 2
```

### Implementation Location:
- **Primary:** `src/components/job-creation/treatment-pricing/fabric-calculation/orientationCalculator.ts` (Lines 44-152)
- **Display:** `src/components/measurements/fabric-pricing/AdaptiveFabricPricingDisplay.tsx` (Lines 671-691)
- **Pricing Hook:** `src/hooks/pricing/useFabricPricing.ts` (Lines 82-93)

### Test Cases:
- [x] **Drop < Fabric Width:** 1 piece, 5.15m (200cm × 2.5 + 5 + 10)
- [x] **Drop > Fabric Width:** 2 pieces, 10.30m (5.15m × 2)
- [ ] **User's case:** Rail: 200cm, Drop: 230cm (260cm with hems), Fabric: 140cm
  - Expected: Math.ceil(260 / 140) = 2 pieces, 5.15m × 2 = 10.30m
  - **Currently showing:** 3 pieces, 15.90m ⚠️ BUG CONFIRMED

### Known Issues:
- ⚠️ **CRITICAL BUG:** Showing 3 horizontal pieces when calculation should yield 2
- ⚠️ Need to verify `horizontalPiecesNeeded` calculation in `orientationCalculator.ts`
- ⚠️ Need to verify multiplier in `useFabricPricing.ts` line 84

---

## DEBUGGING STRATEGY

### Step 1: Enable Comprehensive Logging
All calculation files now include extensive console logging:

**Vertical Fabric (AdaptiveFabricPricingDisplay.tsx line ~720):**
```javascript
console.log('🔍 FABRIC CALCULATION BREAKDOWN DEBUG:', {
  widthsRequired, rawDrop, headerHem, bottomHem, pooling, patternRepeat,
  totalAllowances, dropWithAllowances, totalSeamAllowance, finalQuantity
});
```

**Horizontal Pieces (orientationCalculator.ts line ~60):**
```javascript
console.log('🔧 HORIZONTAL PIECES CALCULATION:', {
  dropWithAllowances, fabricWidth, calculation, result, expectedResult, MATCHES
});
```

**Pricing Multiplier (useFabricPricing.ts line ~87):**
```javascript
console.log('🔧 FABRIC PRICING MULTIPLIER:', {
  fabricAmount, horizontalPieces, totalFabricToOrder, calculation
});
```

### Step 2: Verify Calculation Components
1. Check console logs for `🔍 FABRIC CALCULATION BREAKDOWN DEBUG`
2. Verify each component (drop, hems, pooling, pattern repeat)
3. Confirm formula: `widths × (drop + allowances) + seams = final meters`
4. Compare calculated result with displayed result

### Step 3: Identify Discrepancies
- If displayed formula ≠ console log formula → Display bug
- If console log formula ≠ final quantity → Calculation bug  
- If `horizontalPiecesNeeded` ≠ `Math.ceil(drop / width)` → Logic bug

---

## MODIFICATION LOG

| Date | Modified By | Change Description | Approval Status | Test Results |
|------|------------|-------------------|----------------|--------------|
| 2025-11-22 | AI Assistant | Fixed display formula transparency in AdaptiveFabricPricingDisplay.tsx | ⏳ Pending | ⏳ Pending |
| 2025-11-22 | AI Assistant | Added comprehensive debug logging across all calculation files | ⏳ Pending | ⏳ Pending |
| 2025-11-22 | AI Assistant | Identified horizontal pieces bug (showing 3 instead of 2) | 🔍 Under Investigation | ⏳ Pending |

---

## TESTING CHECKLIST

Before deploying any changes to fabric calculations:

### Vertical Fabric Tests:
- [ ] Single panel, no fullness (e.g., blind): 1 × 250cm = 2.50m
- [ ] Single curtain, 2.5x fullness: verify widths calculation
- [ ] Pair of curtains, multiple widths: verify seam allowances
- [ ] With 15cm vertical pattern repeat: verify repeat rounding
- [ ] With pooling (20cm): verify pooling added to drop

### Horizontal Fabric Tests:
- [ ] Drop < fabric width (e.g., 120cm drop, 140cm fabric): 1 piece
- [ ] Drop = fabric width (140cm drop, 140cm fabric): 1 piece
- [ ] Drop > fabric width (260cm drop, 140cm fabric): 2 pieces ⚠️
- [ ] Drop >> fabric width (400cm drop, 140cm fabric): 3 pieces
- [ ] With horizontal pattern repeat: verify repeat rounding

### Edge Cases:
- [ ] Very small measurements (< 50cm)
- [ ] Very large measurements (> 500cm)
- [ ] Fractional fullness (e.g., 1.5x, 2.8x)
- [ ] Zero allowances (no hems, no pooling)
- [ ] Maximum allowances (large hems, pattern repeats)

---

## ROLLBACK PROCEDURE

If calculations produce incorrect results after changes:

1. **Immediate:** Revert to last known-good commit
2. **Verify:** Test with standard cases to confirm rollback successful
3. **Investigate:** Review console logs to identify root cause
4. **Fix:** Address issue in development environment with comprehensive tests
5. **Deploy:** Only after all test cases pass and business owner approves

### Git Tags for Known-Good Versions:
- `fabric-calc-v1.0` - Initial working version (date TBD)
- `fabric-calc-v1.1` - After transparency fixes (2025-11-22) ⏳ Pending verification

---

## CONTACT FOR MODIFICATIONS

**Before modifying these calculations, contact:**
- Business Owner: [Name/Email]
- Technical Lead: [Name/Email]
- Test Environment: [URL for safe testing]

**Emergency Rollback Contact:**
- [On-call developer name/phone]

---

## FUTURE ENHANCEMENTS (Approved Changes Only)

Potential improvements that require business approval:
1. Add fabric wastage percentage (5-10%) for safety margin
2. Support for diagonal/bias cut fabric calculations
3. Pattern matching across seams (additional repeat allowance)
4. Automatic fabric orientation selection based on efficiency
5. Multi-currency support for international fabric suppliers

*Last Updated: 2025-11-22*
*Next Review: After bug fix verification*

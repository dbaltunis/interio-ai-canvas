/**
 * CENTRALIZED CALCULATION FORMULAS
 * This is THE ONLY place formulas are defined - ALL calculation files MUST import from here.
 * 
 * UNIT STANDARD:
 * - All inputs must specify unit suffix: Cm, Mm, M, Percent
 * - All outputs document their units in JSDoc
 * - Internal calculations use CM for fabric, MM for measurements
 */

// ============================================
// BLIND FORMULAS (SQM-based)
// ============================================

export interface BlindFormulaInputs {
  railWidthCm: number;
  dropCm: number;
  headerHemCm: number;  // Default: 8
  bottomHemCm: number;  // Default: 10
  sideHemCm: number;    // Default: 4 per side
  wastePercent: number; // Default: 0
}

export interface BlindFormulaResult {
  sqmRaw: number;       // Raw calculation before rounding
  sqm: number;          // Rounded to 2 decimals for display
  effectiveWidthCm: number;
  effectiveHeightCm: number;
  formula: string;      // Human-readable formula string
  widthCalcNote: string;
  heightCalcNote: string;
}

/**
 * BLIND SQM FORMULA
 * Formula:
 *   effectiveWidth = railWidth + (sideHem × 2)
 *   effectiveHeight = drop + headerHem + bottomHem
 *   sqm = (effectiveWidth × effectiveHeight) / 10000 × (1 + waste%)
 */
export const BLIND_FORMULA = {
  name: 'Blind SQM Calculation',
  description: 'Calculate square meters for blinds with hem allowances',
  
  calculate: (inputs: BlindFormulaInputs): BlindFormulaResult => {
    const effectiveWidthCm = inputs.railWidthCm + (inputs.sideHemCm * 2);
    const effectiveHeightCm = inputs.dropCm + inputs.headerHemCm + inputs.bottomHemCm;
    
    const sqmRaw = (effectiveWidthCm * effectiveHeightCm) / 10000;
    const sqm = sqmRaw * (1 + inputs.wastePercent / 100);
    const sqmRounded = Math.round(sqm * 100) / 100;
    
    return {
      sqmRaw,
      sqm: sqmRounded,
      effectiveWidthCm,
      effectiveHeightCm,
      formula: `${effectiveWidthCm}cm × ${effectiveHeightCm}cm = ${sqmRounded.toFixed(2)} sqm`,
      widthCalcNote: `width: ${inputs.railWidthCm} + ${inputs.sideHemCm} + ${inputs.sideHemCm} = ${effectiveWidthCm} cm`,
      heightCalcNote: `height: ${inputs.dropCm} + ${inputs.headerHemCm} + ${inputs.bottomHemCm} = ${effectiveHeightCm} cm`
    };
  }
};

// ============================================
// CURTAIN FORMULAS (Linear Meter based)
// ============================================

export interface CurtainFormulaInputs {
  railWidthCm: number;
  dropCm: number;
  fullness: number;        // Default: 2.0 (e.g., 2.0 = 200% fullness)
  fabricWidthCm: number;   // From fabric inventory item
  quantity: number;        // Number of panels (e.g., 2 for pair)
  headerHemCm: number;     // Default: 15
  bottomHemCm: number;     // Default: 10
  sideHemCm: number;       // Default: 5 per panel side
  seamHemCm: number;       // Default: 3 (cm taken from EACH width at seam join)
  poolingCm: number;       // Default: 0
  returnLeftCm: number;
  returnRightCm: number;
}

export interface CurtainFormulaResult {
  linearMeters: number;    // Rounded to 2 decimals
  linearMetersCm: number;  // Raw value in cm before conversion
  widthsRequired: number;
  totalDropCm: number;
  seamsCount: number;
  seamAllowanceCm: number;
  formula: string;         // Human-readable formula string
}

/**
 * CURTAIN VERTICAL (Standard) FORMULA
 * Fabric runs TOP to BOTTOM (normal orientation)
 * 
 * Formula:
 *   totalDropCm = drop + headerHem + bottomHem + pooling
 *   returnsCm = returnLeft + returnRight
 *   widthPerPanelCm = ((railWidth × fullness) + returns) / quantity
 *   dropsPerPanel = ceil(widthPerPanelCm / fabricWidth)
 *   widthsRequired = dropsPerPanel × quantity
 *   seamsCount = widthsRequired - 1
 *   seamAllowanceCm = seamsCount × seamHem × 2  (×2 because seam consumes from BOTH sides)
 *   linearMetersCm = (widthsRequired × totalDrop) + seamAllowance
 *   linearMeters = linearMetersCm / 100
 */
export const CURTAIN_VERTICAL_FORMULA = {
  name: 'Curtain Linear Meters (Vertical/Standard)',
  description: 'Standard orientation - fabric runs top to bottom',
  
  calculate: (inputs: CurtainFormulaInputs): CurtainFormulaResult => {
    // Step 1: Total drop with all allowances (in CM)
    const totalDropCm = inputs.dropCm + inputs.headerHemCm + inputs.bottomHemCm + inputs.poolingCm;
    
    // Step 2: Returns - EXPLICITLY DEFINED
    const returnsCm = inputs.returnLeftCm + inputs.returnRightCm;
    
    // Step 3: Width needed per panel (including fullness and returns split across panels)
    const widthPerPanelCm = ((inputs.railWidthCm * inputs.fullness) + returnsCm) / inputs.quantity;
    
    // Step 4: How many fabric widths (drops) needed per panel
    const dropsPerPanel = Math.ceil(widthPerPanelCm / inputs.fabricWidthCm);
    
    // Step 5: Total widths of fabric required
    const widthsRequired = dropsPerPanel * inputs.quantity;
    
    // Step 6: Seams (one less than number of widths joined)
    const seamsCount = Math.max(0, widthsRequired - 1);
    // seamHemCm is taken from EACH width at seam join, so × 2
    const seamAllowanceCm = seamsCount * inputs.seamHemCm * 2;
    
    // Step 7: Total linear length needed (all in CM, divide by 100 at end)
    const linearMetersCm = (widthsRequired * totalDropCm) + seamAllowanceCm;
    const linearMeters = linearMetersCm / 100;
    const linearMetersRounded = Math.round(linearMeters * 100) / 100;
    
    return {
      linearMeters: linearMetersRounded,
      linearMetersCm,
      widthsRequired,
      totalDropCm,
      seamsCount,
      seamAllowanceCm,
      formula: `${widthsRequired} width(s) × ${totalDropCm.toFixed(0)}cm + ${seamAllowanceCm.toFixed(0)}cm seams = ${linearMetersRounded.toFixed(2)}m`
    };
  }
};

/**
 * CURTAIN HORIZONTAL (Railroaded) FORMULA
 * Fabric runs SIDE to SIDE (rotated 90°)
 * 
 * Formula:
 *   totalDropCm = drop + headerHem + bottomHem + pooling
 *   returnsCm = returnLeft + returnRight
 *   totalWidthCm = (railWidth × fullness) + returns + (sideHem × 2)
 *   horizontalPieces = ceil(totalDrop / fabricWidth)  (drop split across fabric widths)
 *   seamsCount = horizontalPieces - 1
 *   seamAllowanceCm = seamsCount × seamHem × 2
 *   linearMetersCm = (horizontalPieces × totalWidth) + seamAllowance
 *   linearMeters = linearMetersCm / 100
 */
export const CURTAIN_HORIZONTAL_FORMULA = {
  name: 'Curtain Linear Meters (Horizontal/Railroaded)',
  description: 'Railroaded orientation - fabric runs side to side',
  
  calculate: (inputs: CurtainFormulaInputs): CurtainFormulaResult => {
    // Step 1: Total drop with allowances (in CM)
    const totalDropCm = inputs.dropCm + inputs.headerHemCm + inputs.bottomHemCm + inputs.poolingCm;
    
    // Step 2: Returns - EXPLICITLY DEFINED
    const returnsCm = inputs.returnLeftCm + inputs.returnRightCm;
    
    // Step 3: Total width needed (including fullness, returns, and side hems)
    const totalWidthCm = (inputs.railWidthCm * inputs.fullness) + returnsCm + (inputs.sideHemCm * 2);
    
    // Step 4: Horizontal pieces needed (fabric runs sideways, so height is split by fabric width)
    const horizontalPieces = Math.ceil(totalDropCm / inputs.fabricWidthCm);
    
    // Step 5: Seams for horizontal joins
    const seamsCount = Math.max(0, horizontalPieces - 1);
    const seamAllowanceCm = seamsCount * inputs.seamHemCm * 2;
    
    // Step 6: Total linear length needed (pieces × width + seams)
    const linearMetersCm = (horizontalPieces * totalWidthCm) + seamAllowanceCm;
    const linearMeters = linearMetersCm / 100;
    const linearMetersRounded = Math.round(linearMeters * 100) / 100;
    
    return {
      linearMeters: linearMetersRounded,
      linearMetersCm,
      widthsRequired: horizontalPieces, // For horizontal, "widths" = horizontal pieces
      totalDropCm,
      seamsCount,
      seamAllowanceCm,
      formula: `${horizontalPieces} piece(s) × ${totalWidthCm.toFixed(0)}cm + ${seamAllowanceCm.toFixed(0)}cm seams = ${linearMetersRounded.toFixed(2)}m`
    };
  }
};

// ============================================
// PRICING FORMULAS
// ============================================

export const PRICING_FORMULAS = {
  /**
   * Per Running Meter/Yard pricing
   * totalCost = linearMeters × pricePerMeter
   */
  per_running_meter: {
    name: 'Per Running Meter/Yard',
    formula: 'totalCost = linearMeters × pricePerMeter',
    calculate: (linearMeters: number, pricePerMeter: number): number => {
      return linearMeters * pricePerMeter;
    }
  },
  
  /**
   * Per Square Meter pricing
   * totalCost = sqm × pricePerSqm
   */
  per_sqm: {
    name: 'Per Square Meter',
    formula: 'totalCost = sqm × pricePerSqm',
    calculate: (sqm: number, pricePerSqm: number): number => {
      return sqm * pricePerSqm;
    }
  },
  
  /**
   * Per Drop Height pricing (uses drop ranges)
   * totalCost = matchingDropRange.price × quantity
   */
  per_drop: {
    name: 'Per Drop Height',
    formula: 'totalCost = matchingDropRange.price × quantity',
    calculate: (dropCm: number, dropRanges: Array<{ minDrop: number; maxDrop: number; price: number }>, quantity: number = 1): number => {
      const matchingRange = dropRanges.find(range => dropCm >= range.minDrop && dropCm <= range.maxDrop);
      return matchingRange ? matchingRange.price * quantity : 0;
    }
  },
  
  /**
   * Pricing Grid (Width × Drop lookup)
   * Grid keys should be in CM, rounded to nearest grid step
   * totalCost = grid[width][drop]
   */
  pricing_grid: {
    name: 'Pricing Grid (Width × Drop)',
    formula: 'totalCost = grid[width][drop]',
    description: 'Grid dimensions should be in CM, lookup finds closest match'
  }
};

// ============================================
// HELPER: Get formula by category
// NO DEFAULTS - all values must come from template/settings
// ============================================

export const getFormulasByCategory = (category: string) => {
  const categoryLower = category.toLowerCase();
  
  if (categoryLower.includes('blind') || categoryLower.includes('shade')) {
    return {
      type: 'sqm' as const,
      formula: BLIND_FORMULA,
    };
  }
  
  if (categoryLower.includes('curtain') || categoryLower.includes('drape') || categoryLower.includes('roman')) {
    return {
      type: 'linear' as const,
      verticalFormula: CURTAIN_VERTICAL_FORMULA,
      horizontalFormula: CURTAIN_HORIZONTAL_FORMULA,
    };
  }
  
  // Unknown categories must be handled explicitly - no silent fallback
  throw new Error(`Unknown treatment category: ${category}. Cannot determine formula type.`);
};

/**
 * Find applicable formula based on treatment category and orientation
 * THROWS if category is unknown - no silent fallbacks
 */
export const findApplicableFormula = (
  treatmentCategory: string,
  orientation: 'vertical' | 'horizontal' = 'vertical'
) => {
  const formulas = getFormulasByCategory(treatmentCategory);
  
  if (formulas.type === 'linear') {
    return orientation === 'horizontal' 
      ? formulas.horizontalFormula 
      : formulas.verticalFormula;
  }
  
  return formulas.formula;
};

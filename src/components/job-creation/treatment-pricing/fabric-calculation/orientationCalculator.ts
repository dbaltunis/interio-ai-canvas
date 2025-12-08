/**
 * Orientation Calculator for Curtain Fabric
 * Uses centralized formulas from calculationFormulas.ts
 * 
 * VERTICAL (Standard): Fabric runs top to bottom
 * HORIZONTAL (Railroaded): Fabric runs side to side
 * 
 * NO HIDDEN DEFAULTS - all values must come from template
 */

import { FabricCalculationParams, OrientationResult } from './types';
import { 
  CURTAIN_VERTICAL_FORMULA, 
  CURTAIN_HORIZONTAL_FORMULA,
  CurtainFormulaInputs,
} from '@/utils/calculationFormulas';

/**
 * Validate that all required parameters are present
 * Throws if any required value is missing - NO SILENT DEFAULTS
 */
function validateParams(params: FabricCalculationParams): void {
  const missing: string[] = [];
  
  if (!params.railWidth || params.railWidth <= 0) missing.push('railWidth');
  if (!params.drop || params.drop <= 0) missing.push('drop');
  if (!params.fullness || params.fullness <= 0) missing.push('fullness');
  if (!params.fabricWidth || params.fabricWidth <= 0) missing.push('fabricWidth');
  if (params.headerHem == null) missing.push('headerHem');
  if (params.bottomHem == null) missing.push('bottomHem');
  if (params.sideHem == null) missing.push('sideHem');
  if (params.seamHem == null) missing.push('seamHem');
  
  if (missing.length > 0) {
    throw new Error(
      `[orientationCalculator] Missing required parameters: ${missing.join(', ')}. ` +
      `All values must come from template - no defaults allowed.`
    );
  }
}

export const calculateOrientation = (
  orientation: 'horizontal' | 'vertical',
  params: FabricCalculationParams,
  fabricCostPerYard: number,
  laborRate: number
): OrientationResult => {
  // Validate all required params - throws if missing
  validateParams(params);
  
  const {
    railWidth,
    drop,
    fullness,
    fabricWidth,
    quantity = 1,
    pooling = 0,
    headerHem,
    bottomHem,
    sideHem,
    seamHem,
    returnLeft = 0,
    returnRight = 0,
    verticalPatternRepeatCm = 0,
    horizontalPatternRepeatCm = 0,
  } = params;

  let effectiveFabricWidth, requiredLength, requiredWidth;
  let warnings: string[] = [];
  let feasible = true;

  // Calculate totals with allowances
  const vRepeat = verticalPatternRepeatCm > 0 ? verticalPatternRepeatCm : 0;
  const hRepeat = horizontalPatternRepeatCm > 0 ? horizontalPatternRepeatCm : 0;

  // Build inputs for centralized formula - ALL values required
  const formulaInputs: CurtainFormulaInputs = {
    railWidthCm: railWidth,
    dropCm: drop,
    fullness: fullness!,
    fabricWidthCm: fabricWidth,
    quantity: quantity,
    headerHemCm: headerHem!,
    bottomHemCm: bottomHem!,
    sideHemCm: sideHem!,
    seamHemCm: seamHem!,
    poolingCm: pooling,
    returnLeftCm: returnLeft,
    returnRightCm: returnRight
  };

  // Use centralized formulas
  const formula = orientation === 'horizontal' 
    ? CURTAIN_HORIZONTAL_FORMULA 
    : CURTAIN_VERTICAL_FORMULA;
  
  const formulaResult = formula.calculate(formulaInputs);

  const totalDropRaw = formulaResult.totalDropCm;
  const numberOfSideHems = quantity * 2;
  const totalSideHemAllowance = sideHem! * numberOfSideHems;
  const totalWidthRaw = railWidth * fullness! + returnLeft + returnRight;

  let horizontalPiecesNeeded: number | undefined;
  let leftoverFromLastPiece: number | undefined;

  if (orientation === 'horizontal') {
    // Railroaded/Wide fabric: fabric runs horizontally (sideways)
    effectiveFabricWidth = fabricWidth;
    horizontalPiecesNeeded = formulaResult.widthsRequired;

    const requiredLengthUnrounded = totalDropRaw;
    requiredLength = vRepeat > 0 ? Math.ceil(requiredLengthUnrounded / vRepeat) * vRepeat : requiredLengthUnrounded;

    // For horizontal: the width we cut is the rail width with fullness + returns + side hems
    const requiredWidthUnrounded = totalWidthRaw + totalSideHemAllowance;
    requiredWidth = hRepeat > 0 ? Math.ceil(requiredWidthUnrounded / hRepeat) * hRepeat : requiredWidthUnrounded;
    
    // Handle multiple horizontal pieces when drop exceeds fabric width
    if (requiredLength > fabricWidth) {
      horizontalPiecesNeeded = Math.ceil(requiredLength / fabricWidth);
      
      // Calculate what's used from the last piece and leftover
      const totalUsedHeight = requiredLength;
      const lastPieceUsage = totalUsedHeight % fabricWidth;
      leftoverFromLastPiece = lastPieceUsage > 0 ? fabricWidth - lastPieceUsage : 0;
      
      warnings.push(
        `⚠️ Second width required: Drop height exceeds fabric width`
      );
      
      if (leftoverFromLastPiece > 0) {
        warnings.push(
          `📏 Leftover from last piece: ${leftoverFromLastPiece.toFixed(1)}cm (${((leftoverFromLastPiece / fabricWidth) * 100).toFixed(1)}% of fabric width)`
        );
      }
      
      feasible = true;
    }
  } else {
    // Vertical/Standard fabric: fabric runs vertically (normal orientation)
    effectiveFabricWidth = fabricWidth;

    const requiredPanelLengthUnrounded = totalDropRaw;
    const requiredPanelLength = vRepeat > 0 ? Math.ceil(requiredPanelLengthUnrounded / vRepeat) * vRepeat : requiredPanelLengthUnrounded;
    requiredLength = requiredPanelLength;

    // Width per panel
    const widthPerPanel = (totalWidthRaw / quantity) + (sideHem! * 2);
    const requiredWidthUnrounded = widthPerPanel;
    requiredWidth = hRepeat > 0 ? Math.ceil(requiredWidthUnrounded / hRepeat) * hRepeat : requiredWidthUnrounded;
    
    // Feasibility check
    if (requiredWidth > fabricWidth) {
      warnings.push(`Required panel width (${requiredWidth.toFixed(0)}cm incl. repeats) exceeds fabric width (${fabricWidth}cm) in vertical/standard orientation.`);
      feasible = false;
    }
  }

  // Calculate how many panels we need
  const panelsNeeded = quantity;
  
  // Calculate widths needed (fabric lengths)
  let widthsRequired, dropsPerWidth;
  
  if (orientation === 'horizontal') {
    widthsRequired = panelsNeeded;
    dropsPerWidth = 1;
  } else {
    const panelWidthWithHems = requiredWidth;
    
    if (panelWidthWithHems > effectiveFabricWidth) {
      const widthsPerPanel = Math.ceil(panelWidthWithHems / effectiveFabricWidth);
      widthsRequired = widthsPerPanel * panelsNeeded;
      dropsPerWidth = 1 / widthsPerPanel;
    } else {
      dropsPerWidth = Math.floor(effectiveFabricWidth / panelWidthWithHems);
      widthsRequired = Math.ceil(panelsNeeded / dropsPerWidth);
    }
  }

  // Calculate seams
  const verticalSeamsRequired = Math.max(0, widthsRequired - 1);
  const horizontalSeamsRequired = horizontalPiecesNeeded ? Math.max(0, horizontalPiecesNeeded - 1) : 0;
  const seamsRequired = verticalSeamsRequired + horizontalSeamsRequired;
  const totalSeamAllowance = (verticalSeamsRequired * seamHem! * 2) + (horizontalSeamsRequired * seamHem! * 2);
  
  // Total fabric length
  let totalLengthCm;
  if (orientation === 'horizontal') {
    totalLengthCm = (widthsRequired * requiredWidth) + totalSeamAllowance;
  } else {
    totalLengthCm = (widthsRequired * requiredLength) + totalSeamAllowance;
  }
  
  // Convert to units
  const totalYards = totalLengthCm / 91.44;
  const totalMeters = totalLengthCm / 100;

  // Calculate costs
  const seamLaborHours = seamsRequired * 0.5;
  const fabricCost = totalYards * fabricCostPerYard;
  
  const baseLaborHours = 2 + (railWidth * drop * fullness!) / 25000;
  const totalLaborHours = baseLaborHours + seamLaborHours;
  const laborCost = totalLaborHours * laborRate;
  
  const totalCost = fabricCost + laborCost;

  return {
    orientation,
    feasible,
    warnings,
    totalYards: Math.ceil(totalYards * 10) / 10,
    totalMeters: Math.ceil(totalMeters * 10) / 10,
    widthsRequired,
    dropsPerWidth,
    seamsRequired,
    seamLaborHours,
    totalLaborHours,
    fabricCost,
    laborCost,
    totalCost,
    horizontalPiecesNeeded,
    leftoverFromLastPiece,
    details: {
      effectiveFabricWidth,
      requiredLength,
      requiredWidth,
      panelsNeeded,
      totalSeamAllowance,
      fabricWidthPerPanel: requiredWidth / quantity,
      lengthPerWidth: requiredLength,
      headerHem: headerHem!,
      bottomHem: bottomHem!,
      sideHem: sideHem!,
      seamHem: seamHem!
    }
  };
};

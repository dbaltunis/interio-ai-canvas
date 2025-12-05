/**
 * Orientation Calculator for Curtain Fabric
 * Uses centralized formulas from calculationFormulas.ts
 * 
 * VERTICAL (Standard): Fabric runs top to bottom
 * HORIZONTAL (Railroaded): Fabric runs side to side
 */

import { FabricCalculationParams, OrientationResult } from './types';
import { 
  CURTAIN_VERTICAL_FORMULA, 
  CURTAIN_HORIZONTAL_FORMULA,
  CurtainFormulaInputs,
  CURTAIN_DEFAULTS 
} from '@/utils/calculationFormulas';

export const calculateOrientation = (
  orientation: 'horizontal' | 'vertical',
  params: FabricCalculationParams,
  fabricCostPerYard: number,
  laborRate: number
): OrientationResult => {
  const {
    railWidth,
    drop,
    fullness,
    fabricWidth,
    quantity,
    pooling,
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

  // Build inputs for centralized formula
  const formulaInputs: CurtainFormulaInputs = {
    railWidthCm: railWidth,
    dropCm: drop,
    fullness: fullness || CURTAIN_DEFAULTS.fullness,
    fabricWidthCm: fabricWidth,
    quantity: quantity || 1,
    headerHemCm: headerHem || CURTAIN_DEFAULTS.headerHemCm,
    bottomHemCm: bottomHem || CURTAIN_DEFAULTS.bottomHemCm,
    sideHemCm: sideHem || CURTAIN_DEFAULTS.sideHemCm,
    seamHemCm: seamHem || CURTAIN_DEFAULTS.seamHemCm,
    poolingCm: pooling || CURTAIN_DEFAULTS.poolingCm,
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
  const totalSideHemAllowance = sideHem * numberOfSideHems;
  const totalWidthRaw = railWidth * fullness + returnLeft + returnRight;

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
    
    // ✅ NEW: Handle multiple horizontal pieces when drop exceeds fabric width
    if (requiredLength > fabricWidth) {
      // Calculate how many horizontal pieces needed to cover the height
      horizontalPiecesNeeded = Math.ceil(requiredLength / fabricWidth);
      
      // 🔍 DEBUG: Verify calculation
      const expectedPieces = Math.ceil(requiredLength / fabricWidth);
      console.log('🔧 HORIZONTAL PIECES CALCULATION:', {
        dropWithAllowances: `${requiredLength.toFixed(0)}cm`,
        fabricWidth: `${fabricWidth}cm`,
        calculation: `Math.ceil(${requiredLength} / ${fabricWidth})`,
        result: horizontalPiecesNeeded,
        expectedResult: expectedPieces,
        MATCHES: horizontalPiecesNeeded === expectedPieces,
        WARNING: horizontalPiecesNeeded !== expectedPieces ? '⚠️ CALCULATION MISMATCH!' : '✓ Correct'
      });
      
      if (horizontalPiecesNeeded !== expectedPieces) {
        console.error('⚠️ CALCULATION MISMATCH!', {
          horizontalPiecesNeeded,
          expected: expectedPieces
        });
      }
      
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
      
      // Still feasible, just needs multiple pieces
      feasible = true;
    }
  } else {
    // Vertical/Standard fabric: fabric runs vertically (normal orientation)
    // - Fabric width determines how many panels can be cut across
    // - Drop determines the length per panel
    effectiveFabricWidth = fabricWidth;

    // Each panel needs: drop + header + bottom hems (side hems are along the edges, not added to width)
    const requiredPanelLengthUnrounded = totalDropRaw;
    const requiredPanelLength = vRepeat > 0 ? Math.ceil(requiredPanelLengthUnrounded / vRepeat) * vRepeat : requiredPanelLengthUnrounded;
    requiredLength = requiredPanelLength;

    // Width per panel: (rail width × fullness + returns) / number of panels + side hems per panel
    const widthPerPanel = (totalWidthRaw / quantity) + (sideHem * 2); // Each panel gets 2 side hems
    const requiredWidthUnrounded = widthPerPanel;
    requiredWidth = hRepeat > 0 ? Math.ceil(requiredWidthUnrounded / hRepeat) * hRepeat : requiredWidthUnrounded;
    
    // Feasibility: panel width must fit within the fabric width
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
    // For horizontal orientation: widthsRequired is just the number of PANELS
    // The horizontal pieces are sections of the SAME fabric run, not separate runs
    widthsRequired = panelsNeeded;
    dropsPerWidth = 1;
  } else {
    // In vertical orientation, check if panel width fits within fabric width
    const panelWidthWithHems = requiredWidth; // already includes side hems and repeat rounding
    
    if (panelWidthWithHems > effectiveFabricWidth) {
      // Panel is too wide - need multiple widths seamed together per panel
      const widthsPerPanel = Math.ceil(panelWidthWithHems / effectiveFabricWidth);
      widthsRequired = widthsPerPanel * panelsNeeded;
      dropsPerWidth = 1 / widthsPerPanel; // Fraction of a drop per width
    } else {
      // Multiple panels can fit across one fabric width
      dropsPerWidth = Math.floor(effectiveFabricWidth / panelWidthWithHems);
      widthsRequired = Math.ceil(panelsNeeded / dropsPerWidth);
    }
  }

  // Calculate seams needed - BOTH vertical and horizontal
  const verticalSeamsRequired = Math.max(0, widthsRequired - 1);
  const horizontalSeamsRequired = horizontalPiecesNeeded ? Math.max(0, horizontalPiecesNeeded - 1) : 0;
  const seamsRequired = verticalSeamsRequired + horizontalSeamsRequired;
  const totalSeamAllowance = (verticalSeamsRequired * seamHem * 2) + (horizontalSeamsRequired * seamHem * 2);
  
  // Total fabric length needed in cm - USE CORRECT DIMENSION BASED ON ORIENTATION
  let totalLengthCm;
  if (orientation === 'horizontal') {
    // ✅ CRITICAL FIX: For railroaded fabric, order length is based on CURTAIN WIDTH (not drop!)
    // The fabric runs sideways, so we need the curtain width × fullness + allowances in LENGTH
    totalLengthCm = (widthsRequired * requiredWidth) + totalSeamAllowance;
    
    console.log('🧮 orientationCalculator [HORIZONTAL]:', {
      widthsRequired,
      requiredWidth: `${requiredWidth.toFixed(0)}cm (CURTAIN WIDTH - used for ordering)`,
      requiredLength: `${requiredLength.toFixed(0)}cm (DROP HEIGHT - NOT used for ordering)`,
      totalSeamAllowance: `${totalSeamAllowance.toFixed(0)}cm`,
      totalLengthCm: `${totalLengthCm.toFixed(0)}cm`,
      totalMeters: `${(totalLengthCm / 100).toFixed(2)}m`,
      horizontalPiecesNeeded
    });
  } else {
    // For vertical fabric, order length is based on DROP
    totalLengthCm = (widthsRequired * requiredLength) + totalSeamAllowance;
    
    console.log('🧮 orientationCalculator [VERTICAL]:', {
      widthsRequired,
      requiredLength: `${requiredLength.toFixed(0)}cm (DROP - used for ordering)`,
      requiredWidth: `${requiredWidth.toFixed(0)}cm (PANEL WIDTH - NOT used for ordering)`,
      totalSeamAllowance: `${totalSeamAllowance.toFixed(0)}cm`,
      totalLengthCm: `${totalLengthCm.toFixed(0)}cm`,
      totalMeters: `${(totalLengthCm / 100).toFixed(2)}m`
    });
  }
  
  // Convert to different units
  const totalYards = totalLengthCm / 91.44; // 1 yard = 91.44 cm
  const totalMeters = totalLengthCm / 100; // 1 meter = 100 cm

  // Calculate additional labor for seams
  const seamLaborHours = seamsRequired * 0.5; // 30 minutes per seam
  const fabricCost = totalYards * fabricCostPerYard;
  
  // Base labor calculation
  const baseLaborHours = 2 + (railWidth * drop * fullness) / 25000;
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
      headerHem,
      bottomHem,
      sideHem,
      seamHem
    }
  };
};

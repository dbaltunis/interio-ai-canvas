
import { FabricCalculationParams, OrientationResult } from './types';

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

  const totalDropRaw = drop + pooling + headerHem + bottomHem; // cm
  // Side hems: pair of curtains = 2 panels × 2 sides = 4 side hems; single = 1 panel × 2 sides = 2 side hems
  const numberOfSideHems = quantity * 2;
  const totalSideHemAllowance = sideHem * numberOfSideHems; // Total cm needed for all side hems
  const totalWidthRaw = railWidth * fullness + returnLeft + returnRight; // cm (side hems handled separately per orientation)

  if (orientation === 'horizontal') {
    // Railroaded/Wide fabric: fabric runs horizontally (sideways)
    // - Drop (height) fits within the fabric WIDTH
    // - Rail width determines fabric LENGTH needed
    effectiveFabricWidth = fabricWidth;

    const requiredLengthUnrounded = totalDropRaw;
    requiredLength = vRepeat > 0 ? Math.ceil(requiredLengthUnrounded / vRepeat) * vRepeat : requiredLengthUnrounded;

    // For horizontal: the width we cut is the rail width with fullness + returns + side hems
    const requiredWidthUnrounded = totalWidthRaw + totalSideHemAllowance;
    requiredWidth = hRepeat > 0 ? Math.ceil(requiredWidthUnrounded / hRepeat) * hRepeat : requiredWidthUnrounded;
    
    // Check feasibility: drop (length cut) must fit within fabric width
    if (requiredLength > fabricWidth) {
      warnings.push(`Curtain drop (${requiredLength.toFixed(0)}cm incl. repeats) exceeds fabric width (${fabricWidth}cm). Not feasible in horizontal/railroaded orientation.`);
      feasible = false;
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
    // Each panel needs its own length of fabric
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

  // Calculate seams needed
  const seamsRequired = Math.max(0, widthsRequired - 1);
  const totalSeamAllowance = seamsRequired * seamHem * 2;
  
  // Total fabric length needed in cm
  const totalLengthCm = (widthsRequired * requiredLength) + totalSeamAllowance;
  
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

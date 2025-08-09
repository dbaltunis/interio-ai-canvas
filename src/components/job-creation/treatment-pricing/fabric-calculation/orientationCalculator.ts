
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
  const totalWidthRaw = railWidth * fullness + returnLeft + returnRight + (sideHem * 2); // cm

  if (orientation === 'horizontal') {
    // Standard orientation: fabric width used across width; lengths run along the bolt
    effectiveFabricWidth = fabricWidth;

    const requiredLengthUnrounded = totalDropRaw;
    requiredLength = vRepeat > 0 ? Math.ceil(requiredLengthUnrounded / vRepeat) * vRepeat : requiredLengthUnrounded;

    const requiredWidthUnrounded = totalWidthRaw;
    requiredWidth = hRepeat > 0 ? Math.ceil(requiredWidthUnrounded / hRepeat) * hRepeat : requiredWidthUnrounded;
    
    // Check feasibility: length must not exceed fabric width in horizontal orientation
    if (requiredLength > fabricWidth) {
      warnings.push(`Curtain drop (${requiredLength.toFixed(0)}cm incl. repeats) exceeds fabric width (${fabricWidth}cm). Not feasible in horizontal orientation.`);
      feasible = false;
    }
  } else {
    // Vertical/Rotated orientation: fabric width used along the drop; panels are cut across width
    effectiveFabricWidth = fabricWidth;

    // Panel width (across the fabric) equals the drop with hems (and repeat rounding)
    const requiredPanelWidthUnrounded = totalDropRaw + (sideHem * 2);
    const requiredPanelWidth = vRepeat > 0 ? Math.ceil(requiredPanelWidthUnrounded / vRepeat) * vRepeat : requiredPanelWidthUnrounded;
    requiredWidth = requiredPanelWidth;

    // The running length along the bolt covers the rail width with returns (and horizontal repeat rounding)
    const requiredLengthUnrounded = railWidth * fullness + returnLeft + returnRight;
    requiredLength = hRepeat > 0 ? Math.ceil(requiredLengthUnrounded / hRepeat) * hRepeat : requiredLengthUnrounded;
    
    // Feasibility: panel width must fit within the fabric width when rotated
    if (requiredPanelWidth > fabricWidth) {
      warnings.push(`Required panel width (${requiredPanelWidth.toFixed(0)}cm incl. repeats) exceeds fabric width (${fabricWidth}cm) in vertical orientation.`);
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
    // In vertical orientation, fit multiple panels across the fabric width
    const panelWidthWithHems = requiredWidth; // already includes side hems and repeat rounding
    dropsPerWidth = Math.max(1, Math.floor(effectiveFabricWidth / panelWidthWithHems));
    widthsRequired = Math.ceil(panelsNeeded / dropsPerWidth);
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

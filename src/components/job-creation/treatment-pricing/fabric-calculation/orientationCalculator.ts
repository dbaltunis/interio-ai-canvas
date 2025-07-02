
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
    seamHem
  } = params;

  let effectiveFabricWidth, requiredLength, requiredWidth;
  let warnings: string[] = [];
  let feasible = true;

  if (orientation === 'horizontal') {
    // Standard orientation: fabric width used for curtain width
    effectiveFabricWidth = fabricWidth;
    requiredLength = drop + pooling + headerHem + bottomHem;
    requiredWidth = railWidth * fullness;
  } else {
    // Rotated orientation: fabric width used for curtain length
    effectiveFabricWidth = fabricWidth;
    requiredLength = railWidth * fullness;
    requiredWidth = drop + pooling + headerHem + bottomHem;
  }

  // Check feasibility
  if (orientation === 'horizontal' && requiredLength > fabricWidth) {
    warnings.push(`Curtain drop (${requiredLength.toFixed(0)}cm) exceeds fabric width (${fabricWidth}cm). Multiple drops required.`);
    feasible = false;
  }

  if (orientation === 'vertical' && requiredWidth > fabricWidth) {
    warnings.push(`Required width (${requiredWidth.toFixed(0)}cm) exceeds fabric width (${fabricWidth}cm) in vertical orientation.`);
    feasible = false;
  }

  // Calculate panels needed
  const panelsNeeded = Math.ceil(requiredWidth / (effectiveFabricWidth - (sideHem * 2)));
  
  // Calculate widths needed (fabric drops)
  let widthsRequired, dropsPerWidth;
  
  if (orientation === 'horizontal') {
    const panelWidthWithHems = (requiredWidth / quantity) + (sideHem * 2);
    dropsPerWidth = Math.floor(effectiveFabricWidth / panelWidthWithHems);
    widthsRequired = Math.ceil(quantity / Math.max(dropsPerWidth, 1));
  } else {
    // In vertical orientation, each panel requires its own width
    widthsRequired = quantity;
    dropsPerWidth = 1;
  }

  // Calculate seams needed
  const seamsRequired = Math.max(0, widthsRequired - 1);
  const totalSeamAllowance = seamsRequired * seamHem * 2;
  
  // Total fabric length needed
  const totalLength = widthsRequired * requiredLength + totalSeamAllowance;
  
  // Convert to yards and meters
  const totalYards = totalLength / 91.44;
  const totalMeters = totalLength / 100;

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

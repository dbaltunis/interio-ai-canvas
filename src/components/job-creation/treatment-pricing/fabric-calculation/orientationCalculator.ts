
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

  // Calculate total drop including hems and pooling
  const totalDrop = drop + pooling + headerHem + bottomHem;
  const totalWidth = railWidth * fullness;

  if (orientation === 'horizontal') {
    // Standard orientation: fabric width used for curtain width
    effectiveFabricWidth = fabricWidth;
    requiredLength = totalDrop;
    requiredWidth = totalWidth;
    
    // Check if curtain drop exceeds fabric width
    if (totalDrop > fabricWidth) {
      warnings.push(`Curtain drop (${totalDrop.toFixed(0)}cm) exceeds fabric width (${fabricWidth}cm). Not feasible in horizontal orientation.`);
      feasible = false;
    }
  } else {
    // Vertical/Rotated orientation: fabric width used for curtain length
    effectiveFabricWidth = fabricWidth;
    requiredLength = totalWidth;
    requiredWidth = totalDrop;
    
    // Check if total width exceeds fabric width when rotated
    if (totalWidth > fabricWidth) {
      warnings.push(`Required width (${totalWidth.toFixed(0)}cm) exceeds fabric width (${fabricWidth}cm) in vertical orientation.`);
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
    // In vertical orientation, we might fit multiple panels across the width
    const panelWidthWithHems = requiredWidth + (sideHem * 2);
    dropsPerWidth = Math.floor(effectiveFabricWidth / panelWidthWithHems);
    widthsRequired = Math.ceil(panelsNeeded / Math.max(dropsPerWidth, 1));
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


import { FabricCalculationParams, FabricUsageResult } from './types';
import { calculateOrientation } from './orientationCalculator';

export const calculateFabricUsage = (
  formData: any,
  treatmentTypesData: any[]
): FabricUsageResult => {
  const railWidth = parseFloat(formData.rail_width) || 0;
  const drop = parseFloat(formData.drop) || 0;
  const fullness = parseFloat(formData.heading_fullness) || 2.5;
  const fabricWidth = parseFloat(formData.fabric_width) || 137;
  const quantity = formData.quantity || 1;
  const pooling = parseFloat(formData.pooling) || 0;

  // Hem allowances
  const headerHem = parseFloat(formData.header_hem) || 15;
  const bottomHem = parseFloat(formData.bottom_hem) || 10;
  const sideHem = parseFloat(formData.side_hem) || 5;
  const seamHem = parseFloat(formData.seam_hem) || 3;

  if (!railWidth || !drop) {
    return { 
      yards: 0, 
      meters: 0, 
      details: {},
      fabricOrientation: 'horizontal',
      costComparison: null,
      warnings: [],
      seamsRequired: 0,
      seamLaborHours: 0,
      widthsRequired: 0
    };
  }

  const params: FabricCalculationParams = {
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
  };

  // Get labor rate
  const currentTreatmentType = treatmentTypesData?.find(tt => tt.name === formData.treatment_type);
  const defaultLaborRate = currentTreatmentType?.labor_rate || 25;
  const customLaborRate = parseFloat(formData.custom_labor_rate) || 0;
  const laborRate = customLaborRate > 0 ? customLaborRate : defaultLaborRate;
  const fabricCostPerYard = parseFloat(formData.fabric_cost_per_yard) || 0;

  // Calculate both orientations
  const horizontalCalc = calculateOrientation('horizontal', params, fabricCostPerYard, laborRate);
  const verticalCalc = calculateOrientation('vertical', params, fabricCostPerYard, laborRate);

  // Determine best orientation based on cost and feasibility
  let bestOrientation = 'horizontal';
  let costComparison = null;

  if (horizontalCalc.feasible && verticalCalc.feasible) {
    if (verticalCalc.totalCost < horizontalCalc.totalCost) {
      bestOrientation = 'vertical';
    }
    costComparison = {
      horizontal: horizontalCalc,
      vertical: verticalCalc,
      savings: Math.abs(horizontalCalc.totalCost - verticalCalc.totalCost),
      recommendation: bestOrientation
    };
  } else if (verticalCalc.feasible && !horizontalCalc.feasible) {
    bestOrientation = 'vertical';
  } else if (!horizontalCalc.feasible && !verticalCalc.feasible) {
    // Both orientations have issues, use horizontal as fallback
    bestOrientation = 'horizontal';
  }

  const selectedCalc = bestOrientation === 'vertical' ? verticalCalc : horizontalCalc;

  return {
    yards: selectedCalc.totalYards,
    meters: selectedCalc.totalMeters,
    details: selectedCalc.details,
    fabricOrientation: bestOrientation,
    costComparison,
    warnings: selectedCalc.warnings,
    seamsRequired: selectedCalc.seamsRequired,
    seamLaborHours: selectedCalc.seamLaborHours,
    widthsRequired: selectedCalc.widthsRequired
  };
};

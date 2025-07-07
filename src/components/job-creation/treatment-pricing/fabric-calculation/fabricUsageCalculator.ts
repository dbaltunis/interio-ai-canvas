
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

  // Enhanced fabric analysis
  const fabricType = formData.fabric_type?.toLowerCase() || '';
  const isPlainFabric = fabricType.includes('plain') || 
                       fabricType.includes('solid') || 
                       fabricType.includes('textured') ||
                       fabricType.includes('linen') ||
                       fabricType.includes('cotton');
  
  const requiresPatternMatching = !isPlainFabric && (
    fabricType.includes('stripe') ||
    fabricType.includes('floral') ||
    fabricType.includes('geometric') ||
    fabricType.includes('pattern') ||
    fabricType.includes('damask') ||
    fabricType.includes('paisley')
  );

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
      fabricOrientation: 'vertical',
      costComparison: null,
      warnings: ['Missing measurements'],
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

  // Smart roll direction selection
  let rollDirection = formData.roll_direction || 'auto';
  if (rollDirection === 'auto') {
    // Auto-suggest based on fabric properties
    const isNarrowFabric = fabricWidth <= 200;
    const canBenefitFromRotation = isPlainFabric && isNarrowFabric && 
                                  drop < fabricWidth && railWidth > fabricWidth;
    
    if (canBenefitFromRotation) {
      rollDirection = 'horizontal'; // Rotate for savings
    } else if (requiresPatternMatching || isNarrowFabric) {
      rollDirection = 'vertical'; // Standard for narrow/patterned
    } else {
      rollDirection = 'horizontal'; // Standard for wide fabrics
    }
  }
  
  // Use the determined or selected orientation
  const currentOrientation = rollDirection === 'vertical' ? 'vertical' : 'horizontal';
  const selectedCalc = currentOrientation === 'vertical' ? verticalCalc : horizontalCalc;

  // Add fabric analysis warnings
  const fabricWarnings = [];
  if (requiresPatternMatching && currentOrientation === 'horizontal') {
    fabricWarnings.push('⚠ Pattern matching may be difficult with horizontal orientation');
  }
  if (isPlainFabric && fabricWidth <= 200 && drop < fabricWidth && currentOrientation === 'vertical') {
    fabricWarnings.push('💡 Consider horizontal orientation for fabric savings');
  }

  // Create cost comparison if both orientations are feasible
  let costComparison = null;
  if (horizontalCalc.feasible && verticalCalc.feasible) {
    const bestOrientation = verticalCalc.totalCost < horizontalCalc.totalCost ? 'vertical' : 'horizontal';
    costComparison = {
      horizontal: horizontalCalc,
      vertical: verticalCalc,
      savings: Math.abs(horizontalCalc.totalCost - verticalCalc.totalCost),
      recommendation: bestOrientation
    };
  }

  return {
    yards: selectedCalc.totalYards,
    meters: selectedCalc.totalMeters,
    details: selectedCalc.details,
    fabricOrientation: currentOrientation,
    costComparison,
    warnings: [...(selectedCalc.warnings || []), ...fabricWarnings],
    seamsRequired: selectedCalc.seamsRequired,
    seamLaborHours: selectedCalc.seamLaborHours,
    widthsRequired: selectedCalc.widthsRequired
  };
};

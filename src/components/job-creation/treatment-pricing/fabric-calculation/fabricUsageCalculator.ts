
import { FabricCalculationParams, FabricUsageResult } from './types';
import { calculateOrientation } from './orientationCalculator';

// Helper to detect if treatment is a blind
export const isBlind = (treatmentCategory?: string) =>
  !!treatmentCategory && /blind/i.test(treatmentCategory);

const round2 = (n: number) => Math.round(n * 100) / 100;

// Blind-specific calculation
function calculateBlindUsage(
  railWidthCm: number,
  dropCm: number,
  wastePct: number,
  blindHeaderHemCm: number,
  blindBottomHemCm: number,
  blindSideHemCm: number
): { sqm: number; display: string; widthCalcNote: string; heightCalcNote: string } {
  const waste = wastePct / 100;
  const head = blindHeaderHemCm;
  const bot = blindBottomHemCm;
  const side = blindSideHemCm;

  const effWidthCm = railWidthCm + side * 2;
  const effDropCm = dropCm + head + bot;

  const sqmRaw = (effWidthCm * effDropCm) / 10000; // m²
  const sqm = sqmRaw * (1 + waste);

  return {
    display: `Material: ${round2(sqm)} sqm (${effWidthCm} × ${effDropCm} cm incl hems, waste ${wastePct}%)`,
    sqm: round2(sqm),
    widthCalcNote: `Width: ${railWidthCm} + ${side} + ${side} = ${effWidthCm} cm`,
    heightCalcNote: `Height: ${dropCm} + ${head} + ${bot} = ${effDropCm} cm`,
  };
}

export const calculateFabricUsage = (
  formData: any,
  treatmentTypesData: any[],
  selectedFabricItem?: any
): FabricUsageResult => {
  const railWidth = parseFloat(formData.rail_width) || 0;
  const drop = parseFloat(formData.drop) || 0;
  const fullness = parseFloat(formData.heading_fullness) || 2.5;
  
  // Get the treatment template
  const selectedTemplate = treatmentTypesData.find(
    (t) => t.id === formData.treatment_type_id
  );
  
  // Check if this is a blind - use square meter calculation
  if (selectedTemplate && isBlind(selectedTemplate.treatment_category)) {
    const wastePct = selectedTemplate.waste_percent || 5;
    const blindHeaderHemCm = selectedTemplate.blind_header_hem_cm || 8;
    const blindBottomHemCm = selectedTemplate.blind_bottom_hem_cm || 8;
    const blindSideHemCm = selectedTemplate.blind_side_hem_cm || 0;

    const blindCalc = calculateBlindUsage(
      railWidth,
      drop,
      wastePct,
      blindHeaderHemCm,
      blindBottomHemCm,
      blindSideHemCm
    );

    return {
      yards: blindCalc.sqm * 1.19599, // sqm to sq yards
      meters: blindCalc.sqm,
      details: {
        display: blindCalc.display,
        widthCalcNote: blindCalc.widthCalcNote,
        heightCalcNote: blindCalc.heightCalcNote,
        sqm: blindCalc.sqm,
      },
      fabricOrientation: 'sqm',
      costComparison: null,
      warnings: [],
      seamsRequired: 0,
      seamLaborHours: 0,
      widthsRequired: 1,
    };
  }
  const fw1 = parseFloat(formData.fabric_width);
  const fw2 = parseFloat(selectedFabricItem?.fabric_width);
  const fw3 = parseFloat(selectedFabricItem?.fabric_width_cm);
  const fabricWidth = Number.isFinite(fw1) && fw1 > 0 ? fw1 : Number.isFinite(fw2) && fw2 > 0 ? fw2 : Number.isFinite(fw3) && fw3 > 0 ? fw3 : 0;
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

  const headerHem = parseFloat(formData.header_hem) || 15;
  const bottomHem = parseFloat(formData.bottom_hem) || 10;
  const sideHem = parseFloat(formData.side_hem) || 5;
  const seamHem = parseFloat(formData.seam_hem) || 3;
  const verticalPatternRepeatCm = parseFloat(
    (formData.vertical_pattern_repeat_cm ?? formData.vertical_pattern_repeat ?? formData.pattern_repeat_vertical_cm ?? formData.pattern_repeat_vertical ?? formData.vertical_repeat_cm ?? formData.vertical_repeat) as any
  ) || 0;
  const horizontalPatternRepeatCm = parseFloat(
    (formData.horizontal_pattern_repeat_cm ?? formData.horizontal_pattern_repeat ?? formData.pattern_repeat_horizontal_cm ?? formData.pattern_repeat_horizontal ?? formData.horizontal_repeat_cm ?? formData.horizontal_repeat) as any
  ) || 0;
  const returnLeft = parseFloat(formData.return_left) || 0;
  const returnRight = parseFloat(formData.return_right) || 0;

  if (!railWidth || !drop || !fabricWidth) {
    const missing: string[] = [];
    if (!railWidth) missing.push('rail width');
    if (!drop) missing.push('drop');
    if (!fabricWidth) missing.push('fabric width');
    return { 
      yards: 0, 
      meters: 0, 
      details: {},
      fabricOrientation: 'vertical',
      costComparison: null,
      warnings: [`Missing ${missing.join(', ')}`],
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
    seamHem,
    verticalPatternRepeatCm,
    horizontalPatternRepeatCm,
    returnLeft,
    returnRight
  };

  // Get labor rate
  const currentTreatmentType = treatmentTypesData?.find(tt => tt.name === formData.treatment_type);
  const defaultLaborRate = currentTreatmentType?.labor_rate || 25;
  const customLaborRate = parseFloat(formData.custom_labor_rate) || 0;
  const laborRate = customLaborRate > 0 ? customLaborRate : defaultLaborRate;
  
  // Get fabric cost from selected fabric item, fallback to form field
  let fabricCostPerYard = parseFloat(formData.fabric_cost_per_yard) || 0;
  if (selectedFabricItem) {
    const pricePerMeter = selectedFabricItem.price_per_meter || 
                         selectedFabricItem.unit_price || 
                         selectedFabricItem.selling_price || 
                         0;
    fabricCostPerYard = pricePerMeter * 1.09361; // Convert meters to yards
  }

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

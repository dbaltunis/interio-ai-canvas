
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
  console.log('🔥 calculateFabricUsage CALLED with:', {
    formData: {
      rail_width: formData.rail_width,
      drop: formData.drop,
      selected_pricing_method: formData.selected_pricing_method,
      manufacturing_type: formData.manufacturing_type,
      fabric_rotated: formData.fabric_rotated,
      heading_fullness: formData.heading_fullness,
      selected_heading: formData.selected_heading
    },
    selectedFabricItem: selectedFabricItem?.name,
    treatmentTemplatesCount: treatmentTypesData?.length
  });
  
  const railWidth = parseFloat(formData.rail_width) || 0;
  const drop = parseFloat(formData.drop) || 0;
  
  // Get the treatment template
  const selectedTemplate = treatmentTypesData.find(
    (t) => t.id === formData.treatment_type_id
  );
  
  // ✅ FIX: Get fullness from selected heading or template, NOT hardcoded
  let fullness = 2.5; // Default fallback only
  
  // Priority 1: Use heading's fullness ratio if selected
  if (formData.selected_heading) {
    // Check if headingOptions are passed via selectedFabricItem (from VisualMeasurementSheet)
    if (selectedFabricItem?.headingOptions) {
      const selectedHeading = selectedFabricItem.headingOptions.find((h: any) => h.id === formData.selected_heading);
      // Check both fullness_ratio and fullness fields
      const headingFullness = selectedHeading?.fullness_ratio || selectedHeading?.fullness;
      if (headingFullness) {
        fullness = parseFloat(headingFullness);
      }
    }
  }
  
  // Priority 2: Use form data if provided
  if (formData.heading_fullness && parseFloat(formData.heading_fullness) !== 2.5) {
    fullness = parseFloat(formData.heading_fullness);
  }
  
  // Priority 3: Use template's default fullness or fullness_ratio
  if (selectedTemplate && fullness === 2.5) {
    const templateFullness = selectedTemplate.default_fullness || selectedTemplate.fullness_ratio;
    if (templateFullness) {
      fullness = parseFloat(templateFullness);
    }
  }
  
  console.log('🎯 Fullness calculation:', {
    formDataFullness: formData.heading_fullness,
    selectedHeading: formData.selected_heading,
    templateFullness: selectedTemplate?.default_fullness || selectedTemplate?.fullness_ratio,
    headingOptionsAvailable: selectedFabricItem?.headingOptions?.length,
    finalFullness: fullness
  });
  
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
  // ✅ FIX: Get fabric width from selected fabric item FIRST, then form data
  const selectedFabricWidth = selectedFabricItem?.fabric_width || selectedFabricItem?.fabric_width_cm || 0;
  const formFabricWidth = parseFloat(formData.fabric_width) || 0;
  const fabricWidth = selectedFabricWidth > 0 ? selectedFabricWidth : formFabricWidth;
  
  console.log('🎯 Fabric width calculation:', {
    selectedFabricWidth,
    formFabricWidth,
    finalFabricWidth: fabricWidth,
    selectedFabricItem: selectedFabricItem?.name
  });
  
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

  // ✅ FIX: Get hems from template FIRST, then form data, then fallback
  const headerHem = parseFloat(formData.header_hem) || 
                   parseFloat(selectedTemplate?.header_allowance) || 
                   parseFloat(selectedTemplate?.header_hem) || 
                   15; // Last resort fallback
  
  const bottomHem = parseFloat(formData.bottom_hem) || 
                   parseFloat(selectedTemplate?.bottom_hem) || 
                   parseFloat(selectedTemplate?.bottom_allowance) || 
                   10; // Last resort fallback
  
  const sideHem = parseFloat(formData.side_hem) || 
                 parseFloat(selectedTemplate?.side_hem) || 
                 5; // Last resort fallback
  
  const seamHem = parseFloat(formData.seam_hem) || 
                 parseFloat(selectedTemplate?.seam_allowance) || 
                 3; // Last resort fallback
  
  console.log('🎯 Hem calculations:', {
    headerHem: { form: formData.header_hem, template: selectedTemplate?.header_allowance, final: headerHem },
    bottomHem: { form: formData.bottom_hem, template: selectedTemplate?.bottom_hem, final: bottomHem },
    sideHem: { form: formData.side_hem, template: selectedTemplate?.side_hem, final: sideHem },
    seamHem: { form: formData.seam_hem, template: selectedTemplate?.seam_allowance, final: seamHem }
  });
  
  // ✅ FIX: Get pattern repeats from selected fabric FIRST, then form data
  const verticalPatternRepeatCm = parseFloat(selectedFabricItem?.pattern_repeat_vertical) ||
    parseFloat(formData.vertical_pattern_repeat_cm) || 
    parseFloat(formData.pattern_repeat_vertical) || 
    0;
  
  const horizontalPatternRepeatCm = parseFloat(selectedFabricItem?.pattern_repeat_horizontal) ||
    parseFloat(formData.horizontal_pattern_repeat_cm) || 
    parseFloat(formData.pattern_repeat_horizontal) || 
    0;
  
  console.log('🎯 Pattern repeat calculations:', {
    selectedFabricVertical: selectedFabricItem?.pattern_repeat_vertical,
    selectedFabricHorizontal: selectedFabricItem?.pattern_repeat_horizontal,
    finalVertical: verticalPatternRepeatCm,
    finalHorizontal: horizontalPatternRepeatCm
  });
  
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

  // Smart roll direction selection based on user selection or auto-detect
  let rollDirection = formData.roll_direction || formData.fabric_rotated || 'auto';
  
  // ✅ FIX: Handle fabric_rotated boolean/string properly
  if (formData.fabric_rotated === true || formData.fabric_rotated === 'true') {
    rollDirection = 'horizontal';
  } else if (formData.fabric_rotated === false || formData.fabric_rotated === 'false') {
    rollDirection = 'vertical';
  }
  
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
  
  console.log('🎯 Fabric rotation/roll direction:', {
    formDataRotated: formData.fabric_rotated,
    formDataRollDirection: formData.roll_direction,
    finalRollDirection: rollDirection,
    fabricWidth,
    drop
  });
  
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

/**
 * Fabric Usage Calculator
 * 
 * UNIT CONTRACT:
 * - This calculator expects ALL measurements in CENTIMETERS (CM)
 * - The caller (VisualMeasurementSheet) is responsible for converting from user's unit to CM
 * - Results are returned in meters (for linear) or sqm (for area)
 * 
 * If you're getting 10x errors, the caller is probably not converting properly.
 * Check that convertLength(userValue, userUnit, 'cm') is called BEFORE passing here.
 */

import { FabricCalculationParams, FabricUsageResult } from './types';
import { calculateOrientation } from './orientationCalculator';
import { getBlindHemDefaults, calculateBlindSqm, logBlindCalculation } from '@/utils/blindCalculationDefaults';
import { validateMeasurement } from '@/utils/measurementBoundary';

// Helper to detect if treatment is a blind-like type (uses sqm calculation)
// ✅ FIX: Include awning, panel_glide, drape to match centralized isBlindTreatment logic
export const isBlind = (treatmentCategory?: string) => {
  if (!treatmentCategory) return false;
  const cat = treatmentCategory.toLowerCase();
  return /blind/i.test(cat) || 
         cat === 'awning' || 
         cat === 'panel_glide' ||
         cat.includes('drape');
};

/**
 * Calculate fabric usage for a treatment
 * 
 * @param formData - Measurements object with values already converted to CM
 * @param treatmentTypesData - Array of treatment templates
 * @param selectedFabricItem - The selected fabric inventory item
 * @returns FabricUsageResult with meters/yards and details
 */
export const calculateFabricUsage = (
  formData: any,
  treatmentTypesData: any[],
  selectedFabricItem?: any
): FabricUsageResult => {
  // ========== INPUT VALIDATION ==========
  // Values should be in CM at this point - validate they're reasonable
  const railWidth = parseFloat(formData.rail_width) || 0;
  let drop = parseFloat(formData.drop) || 0;
  
  // Validate inputs are in CM range (not MM or inches passed by mistake)
  if (railWidth > 0 && !validateMeasurement(railWidth, 'cm', 'fabricUsageCalculator.railWidth')) {
    console.warn('⚠️ [fabricUsageCalculator] railWidth may be in wrong unit:', railWidth);
  }
  if (drop > 0 && !validateMeasurement(drop, 'cm', 'fabricUsageCalculator.drop')) {
    console.warn('⚠️ [fabricUsageCalculator] drop may be in wrong unit:', drop);
  }
  
  console.log('📏 [fabricUsageCalculator] Input values (expected in CM):', {
    railWidthCM: railWidth,
    dropCM: drop,
    note: 'Caller must convert from user unit to CM before calling'
  });
  
  // Get the treatment template
  const selectedTemplate = treatmentTypesData.find(
    (t) => t.id === formData.treatment_type_id
  );
  
  // ✅ FIX: Get fullness from selected heading or user selection ONLY
  // NO template fallback - user must explicitly select heading or fullness
  let fullness: number | null = null; // Start as null - no guessing
  
  // Get extra fabric from selected heading metadata
  let extraFabric = 0;
  
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
      
      // Extract extra_fabric from heading metadata
      const metadata = selectedHeading?.metadata as any;
      if (metadata?.extra_fabric) {
        extraFabric = parseFloat(metadata.extra_fabric) || 0;
      }
    }
  }
  
  // Priority 2: Use form data if provided (user's explicit selection)
  if (formData.heading_fullness && parseFloat(formData.heading_fullness) > 0) {
    fullness = parseFloat(formData.heading_fullness);
  }
  
  // ❌ REMOVED: Priority 3 template fallback - NO MORE GUESSING
  // If fullness is still null, calculation will show "Select heading" error
  
  console.log('🎯 Fullness calculation (NO FALLBACK):', {
    formDataFullness: formData.heading_fullness,
    selectedHeading: formData.selected_heading,
    templateFullnessIgnored: selectedTemplate?.default_fullness || selectedTemplate?.fullness_ratio,
    headingOptionsAvailable: selectedFabricItem?.headingOptions?.length,
    finalFullness: fullness,
    extraFabric,
    note: fullness === null ? 'REQUIRES USER SELECTION - no template fallback' : 'From user selection'
  });
  
  // Add extra fabric to drop if applicable (from heading metadata)
  drop = drop + extraFabric;
  
  console.log('📏 Drop calculation with extra fabric:', {
    originalDrop: parseFloat(formData.drop) || 0,
    extraFabric,
    finalDrop: drop
  });
  
  // Check if this is a blind - use square meter calculation with centralized defaults
  if (selectedTemplate && isBlind(selectedTemplate.treatment_category)) {
    // Get hem defaults from centralized source - template settings take priority
    const hems = getBlindHemDefaults(selectedTemplate);
    
    // Calculate sqm using centralized function
    const blindCalc = calculateBlindSqm(railWidth, drop, hems);
    
    // Log calculation for debugging
    logBlindCalculation('fabricUsageCalculator', railWidth, drop, hems, blindCalc);

    return {
      yards: blindCalc.sqm * 1.19599, // sqm to sq yards
      meters: blindCalc.sqm,
      details: {
        display: `Material: ${blindCalc.sqm} sqm (${blindCalc.effectiveWidthCm} × ${blindCalc.effectiveHeightCm} cm incl hems${hems.wastePercent > 0 ? `, waste ${hems.wastePercent}%` : ''})`,
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
  
  // ✅ FIX: Derive quantity from curtain_type (pair = 2 panels) instead of formData.quantity
  const quantity = formData.curtain_type === 'pair' ? 2 : (formData.quantity || 1);
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

  // ✅ FIX: Get hems from template FIRST, then form data - NO HARDCODED FALLBACKS
  // Use helper to properly handle 0 as valid value (not falsy skip)
  const parseNumeric = (val: any): number | undefined => {
    const parsed = parseFloat(val);
    return !isNaN(parsed) ? parsed : undefined;
  };

  // Use nullish coalescing (??) to allow 0 as valid value
  const headerHemRaw = parseNumeric(formData.header_hem) ??
                   parseNumeric(selectedTemplate?.header_allowance) ??
                   parseNumeric(selectedTemplate?.header_hem) ??
                   parseNumeric(selectedTemplate?.header_hem_cm);

  const bottomHemRaw = parseNumeric(formData.bottom_hem) ??
                   parseNumeric(selectedTemplate?.bottom_hem) ??
                   parseNumeric(selectedTemplate?.bottom_allowance) ??
                   parseNumeric(selectedTemplate?.bottom_hem_cm);

  const sideHemRaw = parseNumeric(formData.side_hem) ??
                 parseNumeric(selectedTemplate?.side_hem) ??
                 parseNumeric(selectedTemplate?.side_hem_cm);

  const seamHemRaw = parseNumeric(formData.seam_hem) ??
                 parseNumeric(selectedTemplate?.seam_allowance) ??
                 parseNumeric(selectedTemplate?.seam_hem_cm);
  
  // CRITICAL: Use 0 as fallback (no hem) instead of arbitrary values
  // Use nullish coalescing since parseNumeric returns undefined for invalid values
  const headerHem = headerHemRaw ?? 0;
  const bottomHem = bottomHemRaw ?? 0;
  const sideHem = sideHemRaw ?? 0;
  const seamHem = seamHemRaw ?? 0;

  // Log warning if hems are missing from template configuration
  if (headerHemRaw === undefined || bottomHemRaw === undefined) {
    console.warn('⚠️ [fabricUsageCalculator] Missing hem values in template:', selectedTemplate?.name,
      '- Using 0 as default. Configure hems in template for accurate calculations.');
  }
  
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
  // ✅ FIX: Read overlap from formData (enriched from template)
  const overlap = parseFloat(formData.overlap) || 0;

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
    returnRight,
    overlap,
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

  // ✅ Manual fabric rotation ONLY - default to vertical (no rotation) unless user explicitly toggles
  // This allows users to choose alternative solutions like borders or using fewer widths
  let rollDirection = formData.roll_direction || 'vertical';
  
  // ✅ FIX: Handle fabric_rotated boolean/string properly
  if (formData.fabric_rotated === true || formData.fabric_rotated === 'true') {
    rollDirection = 'horizontal';
  } else if (formData.fabric_rotated === false || formData.fabric_rotated === 'false' || formData.fabric_rotated === undefined) {
    rollDirection = 'vertical'; // Default to vertical (standard orientation)
  }
  
  console.log('🎯 Fabric rotation/roll direction:', {
    formDataRotated: formData.fabric_rotated,
    formDataRollDirection: formData.roll_direction,
    finalRollDirection: rollDirection,
    fabricWidth,
    drop,
    note: 'Manual rotation only - defaults to vertical'
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
    widthsRequired: selectedCalc.widthsRequired,
    horizontalPiecesNeeded: selectedCalc.horizontalPiecesNeeded,
    leftoverFromLastPiece: selectedCalc.leftoverFromLastPiece
  };
};

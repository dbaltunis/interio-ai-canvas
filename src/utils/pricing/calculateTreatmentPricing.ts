import {
  isManufacturedItem,
  isWallpaperType,
  detectTreatmentCategory,
  isAreaCalculationType
} from '@/utils/treatmentTypeUtils';
import { getPriceFromGrid } from '@/hooks/usePricingGrids';

/**
 * Calculate treatment pricing with fabric costs, lining, manufacturing, and options
 *
 * CRITICAL MEASUREMENT UNIT EXPECTATION:
 * This function expects measurements to already be converted to CENTIMETERS (CM).
 * 
 * Conversion flow:
 * 1. Database stores: MILLIMETERS (MM) - universal standard
 * 2. Form state: User's preferred unit (mm/cm/inches/feet)
 * 3. THIS FUNCTION: Expects CENTIMETERS (CM) for calculations
 * 4. Caller responsibility: Convert measurements to CM before calling
 * 
 * The VisualMeasurementSheet component handles this conversion automatically
 * before passing measurements to fabric calculators and this function.
 * 
 * @param input.measurements - Expected in CM (rail_width, drop, pooling_amount)
 */
export interface TreatmentPricingInput {
  template: any;
  measurements: any; // CRITICAL: expects CM values (rail_width, drop, pooling_amount in CM)
  fabricItem: any; // inventory item or fallback object
  selectedHeading?: string;
  selectedLining?: string;
  unitsCurrency?: string; // e.g., 'GBP'
  selectedOptions?: Array<{ name: string; price: number; description?: string; image_url?: string; pricing_method?: string; extra_data?: any }>; // CRITICAL: Add selected options with pricing method
  inventoryItems?: any[]; // CRITICAL: Add inventory items to look up heading prices
  pricingGridData?: any; // CRITICAL: Pricing grid data for grid-based pricing
}

export interface TreatmentPricingResult {
  linearMeters: number;
  widthsRequired: number;
  pricePerMeter: number;
  fabricCost: number;
  liningCost: number;
  manufacturingCost: number;
  optionsCost: number; // CRITICAL: Add options cost to result
  headingCost: number; // CRITICAL: Add heading cost to result
  totalCost: number;
  currency: string;
  liningDetails: any | null;
  calculation_details: {
    widths_required: number;
    linear_meters: number;
    total_drop_cm: number;
    price_per_meter: number;
    breakdown: Array<{
      id: string;
      name: string;
      total_cost: number;
      category: string;
    }>;
  };
}

export const calculateTreatmentPricing = (input: TreatmentPricingInput): TreatmentPricingResult => {
  const { template, measurements, fabricItem, selectedHeading, selectedLining, unitsCurrency, selectedOptions = [], inventoryItems = [], pricingGridData } = input;

  console.log('🎯 calculateTreatmentPricing called with:', {
    template: template ? { 
      id: template.id, 
      name: template.name, 
      pricing_type: template.pricing_type,
      treatment_category: template.treatment_category,
      category: template.category
    } : null,
    fabricItem: fabricItem ? { 
      id: fabricItem.id, 
      name: fabricItem.name, 
      selling_price: fabricItem.selling_price, 
      unit_price: fabricItem.unit_price, 
      price_per_meter: fabricItem.price_per_meter 
    } : null,
    measurements: measurements ? { 
      rail_width: measurements.rail_width, 
      drop: measurements.drop 
    } : null,
    selectedOptions: selectedOptions.length
  });

  // Measurements (cm)
  // CRITICAL: These values are expected to already be in CM
  // Conversion from database MM to CM happens in VisualMeasurementSheet
  const widthCm = parseFloat(measurements?.rail_width || measurements?.measurement_a || '0');
  const heightCm = parseFloat(measurements?.drop || measurements?.measurement_b || '0');
  const pooling = parseFloat(measurements?.pooling_amount || '0');

  // Manufacturing allowances from template
  const panelConfiguration = template?.panel_configuration || 'pair';
  const curtainCount = (panelConfiguration === 'pair' || panelConfiguration === 'double') ? 2 : 1;
  const sideHems = template?.side_hems || 0;
  const totalSideHems = sideHems * 2 * curtainCount;
  const returnLeft = template?.return_left || 0;
  const returnRight = template?.return_right || 0;
  const seamHems = template?.seam_hems || 0;
  // ✅ FIX: Use proper nullish chain with 0 as final fallback (not arbitrary 8cm)
  const headerHemRaw = template?.header_allowance ?? template?.header_hem ?? template?.header_hem_cm;
  const bottomHemRaw = template?.bottom_hem ?? template?.bottom_allowance ?? template?.bottom_hem_cm;
  
  // Use 0 as fallback (no hem) instead of arbitrary 8cm
  const headerHem = headerHemRaw ?? 0;
  const bottomHem = bottomHemRaw ?? 0;
  
  if (headerHemRaw == null || bottomHemRaw == null) {
    console.warn('⚠️ calculateTreatmentPricing: Missing hem values in template, using 0. Configure hems for accurate calculations.');
  }
  
  // ✅ FIX: Use 1 (no multiplication) as fallback, track if fallback was used
  let fullnessUsedFallback = false;
  const fullnessRatio = template?.fullness_ratio || (() => {
    console.warn('⚠️ calculateTreatmentPricing: No fullness_ratio in template, using 1 (no multiplication)');
    fullnessUsedFallback = true;
    return 1;
  })();

  // Pattern repeats (cm) — ensure they influence the cut lengths and widths
  const vRepeatCm = parseFloat(measurements?.vertical_pattern_repeat_cm ?? measurements?.vertical_pattern_repeat ?? measurements?.pattern_repeat_vertical_cm ?? measurements?.pattern_repeat_vertical ?? measurements?.vertical_repeat_cm ?? measurements?.vertical_repeat ?? '0') || 0;
  const hRepeatCm = parseFloat(measurements?.horizontal_pattern_repeat_cm ?? measurements?.horizontal_pattern_repeat ?? measurements?.pattern_repeat_horizontal_cm ?? measurements?.pattern_repeat_horizontal ?? measurements?.horizontal_repeat_cm ?? measurements?.horizontal_repeat ?? '0') || 0;

  const requiredWidth = widthCm * fullnessRatio;
  const totalWidthWithAllowancesRaw = requiredWidth + returnLeft + returnRight + totalSideHems;

  // Apply horizontal repeat rounding across overall width
  const totalWidthWithAllowances = hRepeatCm > 0
    ? Math.ceil(totalWidthWithAllowancesRaw / hRepeatCm) * hRepeatCm
    : totalWidthWithAllowancesRaw;

  // Fabric width (cm) from measurements or fabric item; no hard-coded default
  const fabricWidthCandidate1 = parseFloat(measurements?.fabric_width_cm ?? measurements?.fabric_width ?? '');
  const fabricWidthCandidate2 = parseFloat(fabricItem?.fabric_width_cm ?? fabricItem?.fabric_width ?? '');
  const fabricWidthCm = Number.isFinite(fabricWidthCandidate1) && fabricWidthCandidate1 > 0
    ? fabricWidthCandidate1
    : (Number.isFinite(fabricWidthCandidate2) && fabricWidthCandidate2 > 0 ? fabricWidthCandidate2 : undefined);
  
  // Determine number of widths required
  const widthsRequired = fabricWidthCm ? Math.max(1, Math.ceil(totalWidthWithAllowances / fabricWidthCm)) : 0;

  // Seams and drop
  const seamsRequired = Math.max(0, widthsRequired - 1);
  const totalSeamAllowance = seamsRequired > 0 ? seamsRequired * seamHems * 2 : 0;

  // Total drop per width (apply vertical repeat rounding)
  const totalDropUnrounded = heightCm + headerHem + bottomHem + pooling;
  const totalDropPerWidth = vRepeatCm > 0
    ? Math.ceil(totalDropUnrounded / vRepeatCm) * vRepeatCm
    : totalDropUnrounded;

  const wasteMultiplier = 1 + ((template?.waste_percent || 0) / 100);

  const linearMeters = ((totalDropPerWidth + totalSeamAllowance) / 100) * widthsRequired * wasteMultiplier; // cm->m
  
  // ✅ CRITICAL FIX: Use cost_price as base when available to prevent double-markup
  // The markup system will calculate implied markup from cost vs selling difference
  // Priority: cost_price > price_per_meter > unit_price > selling_price
  const pricePerMeter = fabricItem?.cost_price || fabricItem?.price_per_meter || fabricItem?.unit_price || fabricItem?.selling_price || 0;
  
  console.log(`💵 Price lookup: cost_price=${fabricItem?.cost_price}, price_per_meter=${fabricItem?.price_per_meter}, unit_price=${fabricItem?.unit_price}, selling_price=${fabricItem?.selling_price} → base: ${pricePerMeter}`);
  
  // Calculate fabric cost based on pricing method
  let fabricCost = 0;
  const pricingType = template?.pricing_type;
  
  // CRITICAL: Use centralized treatment detection - eliminates fragmented string checks
  const detectedCategory = detectTreatmentCategory({
    treatmentCategory: template?.treatment_category || template?.category,
    templateName: template?.name
  });
  const treatmentCategory = detectedCategory || template?.treatment_category || template?.category || '';
  const isBlindTreatment = isManufacturedItem(detectedCategory);
  
  console.log(`🔍 Fabric cost calculation - pricing type: ${pricingType}, isBlind: ${isBlindTreatment}, template: ${template?.name}`);
  
  // For blinds, default to per_sqm if no pricing type specified
  const effectivePricingType = isBlindTreatment && !pricingType ? 'per_sqm' : pricingType;
  
  // CRITICAL: Handle pricing_grid type - use grid lookup for total product price
  if (effectivePricingType === 'pricing_grid') {
    // getPriceFromGrid is imported at the top of the file

    // Check for grid data from multiple sources: input, fabric item, or template
    const gridData = pricingGridData || fabricItem?.pricing_grid_data || template?.pricing_grid_data;
    
    if (gridData) {
      // Grid expects CM, we already have CM
      const gridPrice = getPriceFromGrid(gridData, widthCm, heightCm);
      
      if (gridPrice > 0) {
        // For pricing_grid with includes_fabric_price, grid contains TOTAL price (fabric + manufacturing)
        // Check if template indicates all-inclusive pricing
        const includesFabricPrice = template?.includes_fabric_price === true;
        
        if (includesFabricPrice) {
          // Grid is all-inclusive - entire price is "fabric cost" (really product cost)
          fabricCost = gridPrice;
          console.log(`💰 Fabric cost (pricing_grid ALL-INCLUSIVE): Grid price ${gridPrice.toFixed(2)} contains fabric + manufacturing`);
        } else {
          // Grid is just for fabric, manufacturing calculated separately
          fabricCost = gridPrice;
          console.log(`💰 Fabric cost (pricing_grid): ${gridPrice.toFixed(2)} from grid lookup [${widthCm}cm × ${heightCm}cm]`);
        }
      } else {
        console.warn(`⚠️ pricing_grid returned 0 - falling back to per_sqm calculation`);
        // Fallback to per_sqm for blinds
        if (isBlindTreatment) {
          const squareMetersRaw = (widthCm * heightCm) / 10000;
          const squareMeters = squareMetersRaw * wasteMultiplier;
          fabricCost = squareMeters * pricePerMeter;
          console.log(`💰 Fabric cost (fallback per_sqm): ${pricePerMeter}/sqm × ${squareMeters.toFixed(2)}sqm = ${fabricCost.toFixed(2)}`);
        } else {
          fabricCost = linearMeters * pricePerMeter;
          console.log(`💰 Fabric cost (fallback per_metre): ${pricePerMeter}/m × ${linearMeters.toFixed(2)}m = ${fabricCost.toFixed(2)}`);
        }
      }
    } else {
      console.warn(`⚠️ pricing_grid type but NO grid data found - check template/fabric configuration`);
      // Fallback calculation
      if (isBlindTreatment) {
        const squareMetersRaw = (widthCm * heightCm) / 10000;
        const squareMeters = squareMetersRaw * wasteMultiplier;
        fabricCost = squareMeters * pricePerMeter;
        console.log(`💰 Fabric cost (fallback per_sqm): ${pricePerMeter}/sqm × ${squareMeters.toFixed(2)}sqm = ${fabricCost.toFixed(2)}`);
      } else {
        fabricCost = linearMeters * pricePerMeter;
        console.log(`💰 Fabric cost (fallback per_metre): ${pricePerMeter}/m × ${linearMeters.toFixed(2)}m = ${fabricCost.toFixed(2)}`);
      }
    }
  } else if (effectivePricingType === 'per_sqm' && isBlindTreatment) {
    // Calculate square meters: For blinds, use actual measurements without hems (hems are internal)
    const squareMetersRaw = (widthCm * heightCm) / 10000;
    const squareMeters = squareMetersRaw * wasteMultiplier;
    
    fabricCost = squareMeters * pricePerMeter;
    console.log(`💰 Fabric cost (per_sqm): ${pricePerMeter}/sqm × ${squareMeters.toFixed(2)}sqm = ${fabricCost.toFixed(2)} [${widthCm}cm × ${heightCm}cm with waste ${template?.waste_percent || 0}%]`);
  } else {
    // Default: linear meter pricing
    fabricCost = linearMeters * pricePerMeter;
    console.log(`💰 Fabric cost (per_metre): ${pricePerMeter}/m × ${linearMeters.toFixed(2)}m = ${fabricCost.toFixed(2)}`);
  }

  // Lining
  let liningCost = 0;
  let liningDetails: any = null;
  if (selectedLining && selectedLining !== 'none') {
    liningDetails = (template?.lining_types || []).find((l: any) => l.type === selectedLining) || null;
    if (liningDetails) {
      liningCost = linearMeters * (liningDetails.price_per_metre || 0) + (liningDetails.labour_per_curtain || 0) * curtainCount;
    }
  }

  // Manufacturing - CRITICAL: Respect pricing method (use same isBlindTreatment detection)
  // CRITICAL: Skip manufacturing calculation when pricing_grid with includes_fabric_price=true
  // (manufacturing is already included in the grid price)
  let manufacturingCost = 0;
  const includesFabricPrice = template?.includes_fabric_price === true;
  
  console.log(`🏭 Manufacturing lookup: machine_price_per_metre=${template?.machine_price_per_metre}, machine_price_per_drop=${template?.machine_price_per_drop}, machine_price_per_panel=${template?.machine_price_per_panel}`);
  
  if (effectivePricingType === 'pricing_grid' && includesFabricPrice) {
    // All-inclusive grid pricing - manufacturing is included in the grid price
    manufacturingCost = 0;
    console.log(`💰 Manufacturing cost (pricing_grid ALL-INCLUSIVE): £0 - already included in grid price`);
  } else if (effectivePricingType === 'per_sqm' && isBlindTreatment) {
    // Manufacturing priced per square meter - use same calculation as fabric
    const squareMetersRaw = (widthCm * heightCm) / 10000;
    const squareMeters = squareMetersRaw * wasteMultiplier;
    
    const machinePricePerSqm = template.machine_price_per_metre || 0;
    manufacturingCost = machinePricePerSqm * squareMeters;
    console.log(`💰 Manufacturing cost (per_sqm): ${machinePricePerSqm}/sqm × ${squareMeters.toFixed(2)}sqm = ${manufacturingCost.toFixed(2)}`);
  } else {
    // Standard pricing - per meter, per drop, or per panel
    if (template?.machine_price_per_metre) {
      manufacturingCost += template.machine_price_per_metre * linearMeters;
    }
    if (template?.machine_price_per_drop) {
      manufacturingCost += template.machine_price_per_drop * curtainCount;
    }
    if (template?.machine_price_per_panel) {
      manufacturingCost += template.machine_price_per_panel * curtainCount;
    }
    console.log(`💰 Manufacturing cost (standard): ${manufacturingCost.toFixed(2)}`);
  }

  // Options cost - apply pricing method for each option
  let optionsCost = 0;
  const optionBreakdown: Array<{ name: string; price: number; method: string; calculated: number }> = [];
  
  selectedOptions.forEach(opt => {
    const basePrice = opt.price || 0;
    const pricingMethod = opt.pricing_method || opt.extra_data?.pricing_method || 'per-unit';
    let calculatedPrice = basePrice;
    
    // Apply pricing method calculation
    switch (pricingMethod) {
      case 'per-meter':
      case 'per-metre':
      case 'per-linear-meter':
        // Calculate based on rail width in meters
        calculatedPrice = basePrice * (widthCm / 100);
        break;
      case 'per-sqm':
      case 'per-square-meter':
        // Calculate based on square meters
        calculatedPrice = basePrice * ((widthCm * heightCm) / 10000);
        break;
      case 'per-drop':
        // Calculate based on drop in meters
        calculatedPrice = basePrice * (heightCm / 100);
        break;
      case 'per-panel':
        // Calculate based on number of panels/curtains
        calculatedPrice = basePrice * curtainCount;
        break;
      case 'per-width':
        // Calculate based on number of widths
        calculatedPrice = basePrice * widthsRequired;
        break;
      case 'percentage':
        // Calculate as percentage of fabric cost
        calculatedPrice = fabricCost * (basePrice / 100);
        break;
      case 'fixed':
      case 'per-unit':
      case 'per-item':
      default:
        // Fixed price, no calculation needed
        calculatedPrice = basePrice;
        break;
    }
    
    optionsCost += calculatedPrice;
    optionBreakdown.push({
      name: opt.name || 'Option',
      price: basePrice,
      method: pricingMethod,
      calculated: calculatedPrice
    });
  });
  
  console.log(`🎛️ Options cost: ${selectedOptions.length} options = £${optionsCost.toFixed(2)}`, optionBreakdown);

  // Heading cost - calculate upcharge for heading
  let headingCost = 0;
  if (selectedHeading && selectedHeading !== 'none' && selectedHeading !== 'standard') {
    // First, try to get price from the heading item in inventory
    const headingItem = inventoryItems.find(item => item.id === selectedHeading && item.category === 'heading');
    if (headingItem) {
      const headingPrice = headingItem.price_per_meter || headingItem.selling_price || 0;
      if (headingPrice > 0) {
        // Charge per meter of rail width
        headingCost = headingPrice * (widthCm / 100); // Convert cm to m
        console.log(`💰 Heading cost from inventory: ${headingPrice}/m × ${(widthCm / 100).toFixed(2)}m = ${headingCost.toFixed(2)}`);
      }
    }
    
    // Add template base heading upcharges if any
    if (template?.heading_upcharge_per_metre) {
      headingCost += template.heading_upcharge_per_metre * (widthCm / 100); // Convert cm to m
    }
    if (template?.heading_upcharge_per_curtain) {
      headingCost += template.heading_upcharge_per_curtain * curtainCount;
    }
    
    console.log(`💰 Total heading cost: ${headingCost.toFixed(2)}`);
  }

  const totalCost = fabricCost + liningCost + manufacturingCost + optionsCost + headingCost;

  // Leftovers with repeat-aware width usage
  const returnsTotal = returnLeft + returnRight;
  const fabricCapacityWidthTotal = fabricWidthCm ? widthsRequired * fabricWidthCm : 0;
  const leftoverWidthTotal = Math.max(0, fabricCapacityWidthTotal - totalWidthWithAllowances);
  const leftoverPerPanel = widthsRequired > 0 ? leftoverWidthTotal / widthsRequired : 0;

  const calculation_details = {
    widths_required: widthsRequired,
    linear_meters: linearMeters,
    total_drop_cm: totalDropPerWidth,
    price_per_meter: pricePerMeter,
    required_width_cm: requiredWidth,
    total_width_with_allowances_cm: totalWidthWithAllowances, // repeat-adjusted
    seams_required: seamsRequired,
    seam_allow_total_cm: totalSeamAllowance,
    side_hems_cm: sideHems,
    header_allowance_cm: headerHem,
    bottom_hem_cm: bottomHem,
    return_left_cm: returnLeft,
    return_right_cm: returnRight,
    returns_total_cm: returnsTotal,
    fullness_ratio: fullnessRatio,
    fabric_width_cm: fabricWidthCm ?? 0,
    vertical_pattern_repeat_cm: vRepeatCm || undefined,
    horizontal_pattern_repeat_cm: hRepeatCm || undefined,
    total_drop_per_width_cm: totalDropPerWidth,
    fabric_capacity_width_total_cm: fabricCapacityWidthTotal,
    leftover_width_total_cm: leftoverWidthTotal,
    leftover_per_panel_cm: leftoverPerPanel,
    // ✅ FIX: Add warnings array for UI to display configuration issues
    fullness_used_fallback: fullnessUsedFallback,
    warnings: [
      ...(fullnessUsedFallback ? ['Fullness ratio not set in template - using 1.0 (no fullness multiplication)'] : []),
      ...(headerHemRaw == null ? ['Header hem not configured in template'] : []),
      ...(bottomHemRaw == null ? ['Bottom hem not configured in template'] : []),
    ].filter(Boolean),
    breakdown: [
      // Fabric with detailed quantity and unit price
      ...(fabricCost > 0 ? [{
        id: 'fabric',
        name: fabricItem?.name || (isBlindTreatment ? 'Material' : isWallpaperType(detectedCategory) ? 'Wallpaper' : 'Fabric'),
        description: effectivePricingType === 'per_sqm' && isBlindTreatment 
          ? `${((widthCm * heightCm) / 10000 * wasteMultiplier).toFixed(2)} sqm × ${pricePerMeter.toFixed(2)}/sqm`
          : `${linearMeters.toFixed(2)} m × ${pricePerMeter.toFixed(2)}/m`,
        quantity: effectivePricingType === 'per_sqm' && isBlindTreatment 
          ? (widthCm * heightCm) / 10000 * wasteMultiplier
          : linearMeters,
        unit: effectivePricingType === 'per_sqm' && isBlindTreatment ? 'sqm' : 'm',
        unit_price: pricePerMeter,
        total_cost: fabricCost,
        category: 'fabric',
        image_url: fabricItem?.image_url
      }] : []),
      // Lining
      ...(liningCost > 0 ? [{
        id: 'lining',
        name: 'Lining',
        description: liningDetails?.type,
        quantity: linearMeters,
        unit: 'm',
        unit_price: liningDetails?.price_per_metre || 0,
        total_cost: liningCost,
        category: 'lining'
      }] : []),
      // Manufacturing
      ...(manufacturingCost > 0 ? [{
        id: 'manufacturing',
        name: 'Manufacturing',
        total_cost: manufacturingCost,
        category: 'manufacturing'
      }] : []),
      // Individual options with calculated prices based on pricing method
      ...optionBreakdown.map((opt, idx) => {
        const originalOpt = selectedOptions[idx];
        const pricingMethod = originalOpt?.pricing_method || originalOpt?.extra_data?.pricing_method || 'per-unit';
        let quantityDisplay = 1;
        let unitDisplay = 'unit';
        
        // Determine quantity and unit based on pricing method
        switch (pricingMethod) {
          case 'per-meter':
          case 'per-metre':
          case 'per-linear-meter':
            quantityDisplay = widthCm / 100;
            unitDisplay = 'm';
            break;
          case 'per-sqm':
          case 'per-square-meter':
            quantityDisplay = (widthCm * heightCm) / 10000;
            unitDisplay = 'sqm';
            break;
          case 'per-drop':
            quantityDisplay = heightCm / 100;
            unitDisplay = 'm';
            break;
          case 'per-panel':
            quantityDisplay = curtainCount;
            unitDisplay = 'panel';
            break;
          case 'per-width':
            quantityDisplay = widthsRequired;
            unitDisplay = 'width';
            break;
        }
        
        return {
          id: `option-${idx}`,
          name: opt.name,
          description: originalOpt?.description,
          quantity: quantityDisplay,
          unit: unitDisplay,
          unit_price: opt.price,
          total_cost: opt.calculated,
          category: 'option',
          image_url: originalOpt?.image_url,
          pricing_method: pricingMethod
        };
      }),
      // Heading
      ...(headingCost > 0 ? [{
        id: 'heading',
        name: 'Heading',
        total_cost: headingCost,
        category: 'heading'
      }] : []),
    ],
  };

  return {
    linearMeters,
    widthsRequired,
    pricePerMeter,
    fabricCost,
    liningCost,
    manufacturingCost,
    optionsCost,
    headingCost,
    totalCost,
    currency: unitsCurrency || 'GBP',
    liningDetails,
    calculation_details,
  };
};

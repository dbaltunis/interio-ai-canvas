
export interface TreatmentPricingInput {
  template: any;
  measurements: any; // expects keys: rail_width/measurement_a, drop/measurement_b, pooling_amount
  fabricItem: any; // inventory item or fallback object
  selectedHeading?: string;
  selectedLining?: string;
  unitsCurrency?: string; // e.g., 'GBP'
  selectedOptions?: Array<{ name: string; price: number }>; // CRITICAL: Add selected options
  inventoryItems?: any[]; // CRITICAL: Add inventory items to look up heading prices
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
    breakdown: { label: string; amount: number }[];
  };
}

export const calculateTreatmentPricing = (input: TreatmentPricingInput): TreatmentPricingResult => {
  const { template, measurements, fabricItem, selectedHeading, selectedLining, unitsCurrency, selectedOptions = [], inventoryItems = [] } = input;

  console.log('🎯 calculateTreatmentPricing called with:', {
    template: template ? { id: template.id, name: template.name, pricing_type: template.pricing_type } : null,
    fabricItem: fabricItem ? { id: fabricItem.id, name: fabricItem.name, selling_price: fabricItem.selling_price, unit_price: fabricItem.unit_price, price_per_meter: fabricItem.price_per_meter } : null,
    measurements: measurements ? { rail_width: measurements.rail_width, drop: measurements.drop } : null,
    selectedOptions: selectedOptions.length
  });

  // Measurements (cm)
  const widthCm = parseFloat(measurements?.rail_width || measurements?.measurement_a || '0');
  const heightCm = parseFloat(measurements?.drop || measurements?.measurement_b || '0');
  const pooling = parseFloat(measurements?.pooling_amount || '0');

  // Manufacturing allowances from template
  const curtainCount = template?.curtain_type === 'pair' ? 2 : 1;
  const sideHems = template?.side_hems || 0;
  const totalSideHems = sideHems * 2 * curtainCount;
  const returnLeft = template?.return_left || 0;
  const returnRight = template?.return_right || 0;
  const seamHems = template?.seam_hems || 0;
  const headerHem = template?.header_allowance || 8;
  const bottomHem = template?.bottom_hem || 8;
  const fullnessRatio = template?.fullness_ratio || 2;

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
  const pricePerMeter = fabricItem?.price_per_meter || fabricItem?.unit_price || fabricItem?.selling_price || 0;
  
  console.log(`💵 Price lookup: price_per_meter=${fabricItem?.price_per_meter}, unit_price=${fabricItem?.unit_price}, selling_price=${fabricItem?.selling_price} → final: ${pricePerMeter}`);
  
  // Calculate fabric cost based on pricing method
  let fabricCost = 0;
  const pricingType = template?.pricing_type;
  
  // CRITICAL: Detect blinds from template name OR category - templates might not have treatment_category
  const treatmentCategory = template?.treatment_category || template?.category || '';
  const templateName = (template?.name || '').toLowerCase();
  const isBlindTreatment = treatmentCategory.includes('blind') || 
                           treatmentCategory === 'shutters' ||
                           templateName.includes('blind') ||
                           templateName.includes('roman') ||
                           templateName.includes('roller') ||
                           templateName.includes('venetian') ||
                           templateName.includes('vertical') ||
                           templateName.includes('cellular') ||
                           templateName.includes('shutter');
  
  console.log(`🔍 Fabric cost calculation - pricing type: ${pricingType}, isBlind: ${isBlindTreatment}, template: ${template?.name}`);
  
  if (pricingType === 'per_sqm' && isBlindTreatment) {
    // Calculate square meters: For blinds, include hems in calculation
    const blindHeaderHem = template?.blind_header_hem_cm || headerHem || 8;
    const blindBottomHem = template?.blind_bottom_hem_cm || bottomHem || 8;
    const blindSideHem = template?.blind_side_hem_cm || 0;
    
    const effectiveWidth = widthCm + (blindSideHem * 2);
    const effectiveHeight = heightCm + blindHeaderHem + blindBottomHem;
    const squareMetersRaw = (effectiveWidth * effectiveHeight) / 10000;
    const squareMeters = squareMetersRaw * wasteMultiplier;
    
    fabricCost = squareMeters * pricePerMeter;
    console.log(`💰 Fabric cost (per_sqm): ${pricePerMeter}/sqm × ${squareMeters.toFixed(2)}sqm = ${fabricCost.toFixed(2)} [${effectiveWidth}cm × ${effectiveHeight}cm with waste ${template?.waste_percent || 0}%]`);
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
  let manufacturingCost = 0;
  
  console.log(`🏭 Manufacturing lookup: machine_price_per_metre=${template?.machine_price_per_metre}, machine_price_per_drop=${template?.machine_price_per_drop}, machine_price_per_panel=${template?.machine_price_per_panel}`);
  
  if (pricingType === 'per_sqm' && isBlindTreatment) {
    // Manufacturing priced per square meter - use same calculation as fabric
    const blindHeaderHem = template?.blind_header_hem_cm || headerHem || 8;
    const blindBottomHem = template?.blind_bottom_hem_cm || bottomHem || 8;
    const blindSideHem = template?.blind_side_hem_cm || 0;
    
    const effectiveWidth = widthCm + (blindSideHem * 2);
    const effectiveHeight = heightCm + blindHeaderHem + blindBottomHem;
    const squareMetersRaw = (effectiveWidth * effectiveHeight) / 10000;
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

  // Options cost - sum all selected option prices
  const optionsCost = selectedOptions.reduce((sum, opt) => sum + (opt.price || 0), 0);
  console.log(`🎛️ Options cost: ${selectedOptions.length} options = £${optionsCost}`, selectedOptions);

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
    breakdown: [
      { label: 'Fabric', amount: fabricCost },
      { label: 'Lining', amount: liningCost },
      { label: 'Manufacturing', amount: manufacturingCost },
      { label: 'Options', amount: optionsCost },
      { label: 'Heading', amount: headingCost },
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

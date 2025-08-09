
export interface TreatmentPricingInput {
  template: any;
  measurements: any; // expects keys: rail_width/measurement_a, drop/measurement_b, pooling_amount
  fabricItem: any; // inventory item or fallback object
  selectedHeading?: string;
  selectedLining?: string;
  unitsCurrency?: string; // e.g., 'GBP'
}

export interface TreatmentPricingResult {
  linearMeters: number;
  widthsRequired: number;
  pricePerMeter: number;
  fabricCost: number;
  liningCost: number;
  manufacturingCost: number;
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
  const { template, measurements, fabricItem, selectedHeading, selectedLining, unitsCurrency } = input;

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

  // Fabric width (cm)
  const fabricWidthCm = fabricItem?.fabric_width || fabricItem?.fabric_width_cm || 137;

  // Determine number of widths required
  const widthsRequired = Math.max(1, Math.ceil(totalWidthWithAllowances / fabricWidthCm));

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
  const fabricCost = linearMeters * pricePerMeter;

  // Lining
  let liningCost = 0;
  let liningDetails: any = null;
  if (selectedLining && selectedLining !== 'none') {
    liningDetails = (template?.lining_types || []).find((l: any) => l.type === selectedLining) || null;
    if (liningDetails) {
      liningCost = linearMeters * (liningDetails.price_per_metre || 0) + (liningDetails.labour_per_curtain || 0) * curtainCount;
    }
  }

  // Manufacturing
  let manufacturingCost = 0;
  if (template?.machine_price_per_metre) manufacturingCost += template.machine_price_per_metre * linearMeters;
  if (template?.machine_price_per_drop) manufacturingCost += template.machine_price_per_drop * curtainCount;
  if (template?.machine_price_per_panel) manufacturingCost += template.machine_price_per_panel * curtainCount;

  const totalCost = fabricCost + liningCost + manufacturingCost;

  // Leftovers with repeat-aware width usage
  const returnsTotal = returnLeft + returnRight;
  const fabricCapacityWidthTotal = widthsRequired * fabricWidthCm;
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
    fabric_width_cm: fabricWidthCm,
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
    ],
  };

  return {
    linearMeters,
    widthsRequired,
    pricePerMeter,
    fabricCost,
    liningCost,
    manufacturingCost,
    totalCost,
    currency: unitsCurrency || 'GBP',
    liningDetails,
    calculation_details,
  };
};

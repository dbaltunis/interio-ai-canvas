/**
 * Clean Blind Cost Calculator
 * Calculates costs for blinds with proper sqm calculations including hems and waste
 */

interface BlindCalculationResult {
  squareMeters: number;
  fabricCost: number;
  manufacturingCost: number;
  optionsCost: number;
  totalCost: number;
  displayText: string;
}

export const calculateBlindCosts = (
  widthCm: number,
  heightCm: number,
  template: any,
  fabricItem: any,
  selectedOptions: Array<{ name: string; price?: number }> = []
): BlindCalculationResult => {
  
  // Get hem values
  const headerHem = template?.blind_header_hem_cm || template?.header_allowance || 8;
  const bottomHem = template?.blind_bottom_hem_cm || template?.bottom_hem || 8;
  const sideHem = template?.blind_side_hem_cm || 0;
  const wastePercent = template?.waste_percent || 0;
  
  // Calculate effective dimensions with hems
  const effectiveWidth = widthCm + (sideHem * 2);
  const effectiveHeight = heightCm + headerHem + bottomHem;
  
  // Calculate square meters with waste
  const sqmRaw = (effectiveWidth * effectiveHeight) / 10000;
  const squareMeters = sqmRaw * (1 + wastePercent / 100);
  
  // Get fabric price per sqm
  const fabricPricePerSqm = fabricItem?.selling_price || fabricItem?.price_per_meter || fabricItem?.unit_price || 0;
  
  // Calculate fabric cost
  const fabricCost = squareMeters * fabricPricePerSqm;
  
  // Calculate manufacturing cost (could be from grid or template)
  let manufacturingCost = 0;
  if (template?.pricing_type === 'pricing_grid' && template?.pricing_grid_data) {
    // Grid pricing takes precedence
    const { getPriceFromGrid } = require('@/hooks/usePricingGrids');
    manufacturingCost = getPriceFromGrid(template.pricing_grid_data, widthCm, heightCm);
  } else if (template?.machine_price_per_panel) {
    manufacturingCost = template.machine_price_per_panel;
  } else if (template?.unit_price) {
    manufacturingCost = squareMeters * template.unit_price * 0.5; // 50% for labor
  }
  
  // Calculate options cost (only count options with price > 0)
  const optionsCost = selectedOptions
    .filter(opt => opt.price && opt.price > 0)
    .reduce((sum, opt) => sum + (opt.price || 0), 0);
  
  // Total cost
  const totalCost = fabricCost + manufacturingCost + optionsCost;
  
  // Display text
  const displayText = `${squareMeters.toFixed(2)} sqm × ${fabricPricePerSqm.toFixed(2)}/sqm`;
  
  console.log('🧮 Blind Cost Calculation:', {
    dimensions: `${widthCm}cm × ${heightCm}cm`,
    hems: { header: headerHem, bottom: bottomHem, side: sideHem },
    effectiveDimensions: `${effectiveWidth}cm × ${effectiveHeight}cm`,
    squareMeters: squareMeters.toFixed(2),
    fabricPricePerSqm,
    fabricCost: fabricCost.toFixed(2),
    manufacturingCost: manufacturingCost.toFixed(2),
    optionsCost: optionsCost.toFixed(2),
    totalCost: totalCost.toFixed(2)
  });
  
  return {
    squareMeters,
    fabricCost,
    manufacturingCost,
    optionsCost,
    totalCost,
    displayText
  };
};

export const isBlindCategory = (category: string, templateName?: string): boolean => {
  const categoryLower = category.toLowerCase();
  const nameLower = (templateName || '').toLowerCase();
  return categoryLower.includes('blind') || 
         categoryLower.includes('shade') ||
         nameLower.includes('blind') ||
         nameLower.includes('shade');
};

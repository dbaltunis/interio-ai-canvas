/**
 * Clean Blind Cost Calculator
 * Calculates costs for blinds with proper sqm calculations including hems and waste
 */

import { getPriceFromGrid } from '@/hooks/usePricingGrids';

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
  selectedOptions: Array<{ name: string; price?: number; pricingMethod?: string; optionKey?: string; pricingGridData?: any }> = [],
  measurements?: Record<string, any>
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
  
  // Get fabric price per sqm - check if fabric has a pricing grid first
  let fabricPricePerSqm = 0;
  let fabricCost = 0;
  
  // PRIORITY 1: Check if fabric has pricing grid attached (for fabric cost)
  if (fabricItem?.pricing_grid_data && fabricItem?.resolved_grid_name) {
    // Fabric has a pricing grid - use it to calculate fabric cost
    const gridPrice = getPriceFromGrid(fabricItem.pricing_grid_data, widthCm, heightCm);
    fabricCost = gridPrice; // Grid returns total price for this size
    fabricPricePerSqm = squareMeters > 0 ? gridPrice / squareMeters : 0;
    
    console.log('✅ Using fabric pricing grid:', {
      gridName: fabricItem.resolved_grid_name,
      gridCode: fabricItem.resolved_grid_code,
      dimensions: `${widthCm}cm × ${heightCm}cm`,
      gridPrice,
      fabricCost
    });
  } else {
    // PRIORITY 2: Use per-unit pricing for fabric
    fabricPricePerSqm = fabricItem?.selling_price || fabricItem?.price_per_meter || fabricItem?.unit_price || 0;
    fabricCost = squareMeters * fabricPricePerSqm;
    
    console.log('ℹ️ Using per-unit fabric pricing:', {
      fabricPricePerSqm,
      squareMeters: squareMeters.toFixed(2),
      fabricCost: fabricCost.toFixed(2)
    });
  }
  
  // Calculate manufacturing cost (from template grid or template pricing)
  let manufacturingCost = 0;
  if (template?.pricing_type === 'pricing_grid' && template?.pricing_grid_data) {
    // Template has manufacturing grid
    manufacturingCost = getPriceFromGrid(template.pricing_grid_data, widthCm, heightCm);
    console.log('✅ Using template manufacturing grid:', {
      manufacturingCost
    });
  } else if (template?.machine_price_per_panel) {
    manufacturingCost = template.machine_price_per_panel;
  } else if (template?.unit_price) {
    manufacturingCost = squareMeters * template.unit_price * 0.5; // 50% for labor
  }
  
  // Calculate options cost - consider pricing method for each option
  console.log('💰 Calculating options cost, selectedOptions:', selectedOptions);
  
  const optionsCost = selectedOptions
    .filter(opt => opt.price && opt.price > 0)
    .reduce((sum, opt) => {
      const basePrice = opt.price || 0;
      
      // Check pricing method
      if (opt.pricingMethod === 'per-meter') {
        // Price per meter of width
        const priceForWidth = basePrice * (widthCm / 100);
        console.log(`💰 Option "${opt.name}" pricing:`, {
          method: 'per-meter',
          basePrice,
          widthCm,
          widthMeters: (widthCm / 100).toFixed(2),
          calculatedPrice: priceForWidth.toFixed(2)
        });
        return sum + priceForWidth;
      } else if (opt.pricingMethod === 'per-sqm') {
        // Price per square meter
        const priceForArea = basePrice * squareMeters;
        console.log(`💰 Option "${opt.name}" pricing:`, {
          method: 'per-sqm',
          basePrice,
          squareMeters: squareMeters.toFixed(2),
          calculatedPrice: priceForArea.toFixed(2)
        });
        return sum + priceForArea;
      } else if (opt.pricingMethod === 'pricing-grid' && opt.pricingGridData) {
        // Use pricing grid to calculate cost based on dimensions
        const gridPrice = getPriceFromGrid(opt.pricingGridData, widthCm, heightCm);
        console.log(`💰 Option "${opt.name}" pricing:`, {
          method: 'pricing-grid',
          dimensions: `${widthCm}cm × ${heightCm}cm`,
          gridPrice: gridPrice.toFixed(2)
        });
        return sum + gridPrice;
      } else {
        // Fixed price (default)
        console.log(`💰 Option "${opt.name}" pricing:`, {
          method: opt.pricingMethod || 'fixed (default)',
          price: basePrice
        });
        return sum + basePrice;
      }
    }, 0);
  
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

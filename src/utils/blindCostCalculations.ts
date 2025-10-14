/**
 * Blind Cost Calculation Utilities
 * Handles pricing for roller, venetian, roman, vertical blinds and shutters
 */

export interface BlindCostResult {
  fabricCost: number;
  manufacturingCost: number;
  hardwareCost: number;
  optionsCost: number;
  totalCost: number;
  squareMeters: number;
  linearMeters: number;
}

/**
 * Calculate cost for roller blinds, venetian blinds, roman blinds
 */
export const calculateBlindCost = (
  width: number,  // in cm
  height: number, // in cm
  template: any,
  fabricItem: any,
  selectedOptions: Array<{ name: string; price?: number }> = []
): BlindCostResult => {
  
  console.log('🎯 calculateBlindCost:', {
    width,
    height,
    template: template?.name,
    fabricPrice: fabricItem?.selling_price,
    options: selectedOptions
  });
  
  // Convert to meters for area calculation
  const widthM = width / 100;
  const heightM = height / 100;
  const squareMeters = widthM * heightM;
  const linearMeters = heightM; // For blinds, linear meters typically = height
  
  // Calculate fabric/material cost
  let fabricCost = 0;
  if (fabricItem) {
    const pricePerUnit = fabricItem.selling_price || fabricItem.unit_price || fabricItem.cost_price || 0;
    const soldBy = fabricItem.sold_by_unit || 'per_meter';
    
    if (soldBy === 'per_sqm' || soldBy === 'per_square_meter') {
      fabricCost = squareMeters * pricePerUnit;
    } else {
      // Default to per linear meter (height)
      fabricCost = linearMeters * pricePerUnit;
    }
  } else if (template?.unit_price) {
    // Use template unit price as fallback
    fabricCost = squareMeters * template.unit_price;
  }
  
  // Calculate manufacturing cost from template
  let manufacturingCost = 0;
  if (template?.manufacturing_type === 'hand') {
    manufacturingCost = template.hand_price_per_panel || template.hand_price_per_metre * linearMeters || 0;
  } else {
    manufacturingCost = template.machine_price_per_panel || template.machine_price_per_metre * linearMeters || 0;
  }
  
  // If no panel/metre pricing, use unit_price * area as manufacturing cost
  if (manufacturingCost === 0 && template?.unit_price) {
    manufacturingCost = template.unit_price * squareMeters * 0.5; // 50% of material for labor
  }
  
  // Calculate hardware cost (brackets, rails, controls)
  const hardwareCost = 0; // To be implemented with actual hardware items
  
  // Calculate options cost (fascia, mount brackets, control types, etc.)
  const optionsCost = selectedOptions.reduce((total, option) => {
    return total + (option.price || 0);
  }, 0);
  
  const totalCost = fabricCost + manufacturingCost + hardwareCost + optionsCost;
  
  console.log('💰 Blind cost breakdown:', {
    fabricCost,
    manufacturingCost,
    hardwareCost,
    optionsCost,
    totalCost,
    squareMeters,
    linearMeters
  });
  
  return {
    fabricCost,
    manufacturingCost,
    hardwareCost,
    optionsCost,
    totalCost,
    squareMeters,
    linearMeters
  };
};

/**
 * Calculate cost for shutters/plantation shutters
 */
export const calculateShutterCost = (
  width: number,
  height: number,
  template: any,
  materialItem: any,
  selectedOptions: Array<{ name: string; price?: number }> = []
): BlindCostResult => {
  
  // Shutters are typically priced per square meter
  const widthM = width / 100;
  const heightM = height / 100;
  const squareMeters = widthM * heightM;
  
  let fabricCost = 0;
  if (materialItem?.selling_price) {
    fabricCost = squareMeters * materialItem.selling_price;
  } else if (template?.unit_price) {
    fabricCost = squareMeters * template.unit_price;
  }
  
  // Shutters typically have higher manufacturing costs
  const manufacturingCost = template?.machine_price_per_panel || (fabricCost * 0.6) || 0;
  
  const optionsCost = selectedOptions.reduce((total, option) => total + (option.price || 0), 0);
  
  const totalCost = fabricCost + manufacturingCost + optionsCost;
  
  return {
    fabricCost,
    manufacturingCost,
    hardwareCost: 0,
    optionsCost,
    totalCost,
    squareMeters,
    linearMeters: height / 100
  };
};


export const calculateOptionCost = (option: any, formData: any) => {
  const railWidth = parseFloat(formData.rail_width) || 0;
  const drop = parseFloat(formData.drop) || 0;
  const quantity = formData.quantity || 1;
  const baseCost = option.base_cost || option.base_price || 0;
  
  // Determine which pricing method to use
  let method = option.pricing_method || option.cost_type;
  
  // If option inherits from window covering, use window covering's method
  if (method === 'inherit' && option.window_covering_pricing_method) {
    method = option.window_covering_pricing_method;
  }

  console.log(`Calculating cost for option: ${option.name}, pricing method: ${method}, base cost: ${baseCost}`);

  let cost = 0;
  let calculation = '';

  switch (method) {
    case 'per-unit':
      cost = baseCost * quantity;
      calculation = `${baseCost.toFixed(2)} × ${quantity} units = ${cost.toFixed(2)}`;
      break;
    
    case 'per-panel':
      // For per-panel pricing from window covering
      const fullness = parseFloat(formData.heading_fullness) || 2.5;
      const fabricWidth = parseFloat(formData.fabric_width) || 137;
      const panelsNeeded = Math.ceil((railWidth * fullness) / fabricWidth);
      cost = baseCost * panelsNeeded * quantity;
      calculation = `${baseCost.toFixed(2)} × ${panelsNeeded} panels × ${quantity} = ${cost.toFixed(2)}`;
      break;
      
    case 'per-drop':
      // For per-drop pricing from window covering
      cost = baseCost * quantity;
      calculation = `${baseCost.toFixed(2)} per drop × ${quantity} = ${cost.toFixed(2)}`;
      break;
    
    case 'per-meter':
    case 'per-metre':
    case 'per-linear-meter':
      const widthInMeters = railWidth / 100;
      cost = baseCost * widthInMeters * quantity;
      calculation = `${baseCost.toFixed(2)} × ${widthInMeters.toFixed(2)}m × ${quantity} = ${cost.toFixed(2)}`;
      break;
    
    case 'per-yard':
    case 'per-linear-yard':
      const widthInYards = railWidth / 91.44;
      cost = baseCost * widthInYards * quantity;
      calculation = `${baseCost.toFixed(2)} × ${widthInYards.toFixed(2)} yards × ${quantity} = ${cost.toFixed(2)}`;
      break;
    
    case 'per-sqm':
    case 'per-square-meter':
      const areaInSqm = (railWidth / 100) * (drop / 100);
      cost = baseCost * areaInSqm * quantity;
      calculation = `${baseCost.toFixed(2)} × ${areaInSqm.toFixed(2)}m² × ${quantity} = ${cost.toFixed(2)}`;
      break;
    
    case 'percentage':
      const fabricCost = parseFloat(formData.fabric_cost_per_yard || "0") || 0;
      const fabricUsage = parseFloat(formData.fabric_usage || "0") || 0;
      const totalFabricCost = fabricCost * fabricUsage;
      cost = (baseCost / 100) * totalFabricCost;
      calculation = `${baseCost}% × £${totalFabricCost.toFixed(2)} fabric cost = ${cost.toFixed(2)}`;
      break;
    
    case 'fixed':
    default:
      cost = baseCost * quantity;
      calculation = `Fixed cost: ${baseCost.toFixed(2)} × ${quantity} = ${cost.toFixed(2)}`;
      break;
  }

  return { cost, calculation };
};

export const calculateHierarchicalOptionCost = (option: any, formData: any) => {
  const railWidth = parseFloat(formData.rail_width) || 0;
  const drop = parseFloat(formData.drop) || 0;
  const quantity = formData.quantity || 1;
  const baseCost = option.base_price || 0;
  
  // Determine which pricing method to use
  let method = option.pricing_method;
  
  // If option inherits from window covering or category, use that method
  if (method === 'inherit' && option.window_covering_pricing_method) {
    method = option.window_covering_pricing_method;
  } else if (method === 'inherit' && option.category_calculation_method) {
    method = option.category_calculation_method;
  }

  console.log(`Calculating hierarchical option cost for: ${option.name}, pricing method: ${method}, base cost: ${baseCost}`);

  let cost = 0;
  let calculation = '';

  switch (method) {
    case 'per-unit':
      cost = baseCost * quantity;
      calculation = `${baseCost.toFixed(2)} × ${quantity} units = ${cost.toFixed(2)}`;
      break;
    
    case 'per-panel':
      const fullness = parseFloat(formData.heading_fullness) || 2.5;
      const fabricWidth = parseFloat(formData.fabric_width) || 137;
      const panelsNeeded = Math.ceil((railWidth * fullness) / fabricWidth);
      cost = baseCost * panelsNeeded * quantity;
      calculation = `${baseCost.toFixed(2)} × ${panelsNeeded} panels × ${quantity} = ${cost.toFixed(2)}`;
      break;
      
    case 'per-drop':
      cost = baseCost * quantity;
      calculation = `${baseCost.toFixed(2)} per drop × ${quantity} = ${cost.toFixed(2)}`;
      break;
    
    case 'per-linear-meter':
    case 'per-meter':
      const widthInMeters = railWidth / 100;
      cost = baseCost * widthInMeters * quantity;
      calculation = `${baseCost.toFixed(2)} × ${widthInMeters.toFixed(2)}m × ${quantity} = ${cost.toFixed(2)}`;
      break;
    
    case 'per-linear-yard':
    case 'per-yard':
      const widthInYards = railWidth / 91.44;
      cost = baseCost * widthInYards * quantity;
      calculation = `${baseCost.toFixed(2)} × ${widthInYards.toFixed(2)} yards × ${quantity} = ${cost.toFixed(2)}`;
      break;
    
    case 'per-sqm':
      const areaInSqm = (railWidth / 100) * (drop / 100);
      cost = baseCost * areaInSqm * quantity;
      calculation = `${baseCost.toFixed(2)} × ${areaInSqm.toFixed(2)}m² × ${quantity} = ${cost.toFixed(2)}`;
      break;
    
    case 'percentage':
      const fabricCost = parseFloat(formData.fabric_cost_per_yard || "0") || 0;
      const fabricUsage = parseFloat(formData.fabric_usage || "0") || 0;
      const totalFabricCost = fabricCost * fabricUsage;
      cost = (baseCost / 100) * totalFabricCost;
      calculation = `${baseCost}% × £${totalFabricCost.toFixed(2)} fabric cost = ${cost.toFixed(2)}`;
      break;
    
    case 'fixed':
    default:
      cost = baseCost * quantity;
      calculation = `Fixed cost: ${baseCost.toFixed(2)} × ${quantity} = ${cost.toFixed(2)}`;
      break;
  }

  return { cost, calculation };
};

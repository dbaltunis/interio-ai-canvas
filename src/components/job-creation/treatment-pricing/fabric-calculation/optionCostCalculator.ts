
export const calculateOptionCost = (option: any, formData: any) => {
  const railWidth = parseFloat(formData.rail_width) || 0;
  const drop = parseFloat(formData.drop) || 0;
  const quantity = formData.quantity || 1;
  const baseCost = option.base_cost || option.base_price || 0;
  const method = option.pricing_method || option.cost_type;

  console.log(`Calculating cost for option: ${option.name}, pricing method: ${method}, base cost: ${baseCost}`);

  let cost = 0;
  let calculation = '';

  switch (method) {
    case 'per-unit':
    case 'per-panel':
      cost = baseCost * quantity;
      calculation = `${baseCost.toFixed(2)} × ${quantity} units = ${cost.toFixed(2)}`;
      break;
    
    case 'per-meter':
    case 'per-metre':
      const widthInMeters = railWidth / 100;
      cost = baseCost * widthInMeters * quantity;
      calculation = `${baseCost.toFixed(2)} × ${widthInMeters.toFixed(2)}m × ${quantity} = ${cost.toFixed(2)}`;
      break;
    
    case 'per-yard':
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
    
    case 'per-linear-meter':
      const perimeterInMeters = (railWidth + 2 * drop) / 100;
      cost = baseCost * perimeterInMeters * quantity;
      calculation = `${baseCost.toFixed(2)} × ${perimeterInMeters.toFixed(2)}m perimeter × ${quantity} = ${cost.toFixed(2)}`;
      break;
    
    case 'percentage':
      // This requires fabric usage calculation - we'll need to import that
      const fabricCost = parseFloat(formData.fabric_cost_per_yard || "0") || 0;
      cost = (fabricCost * baseCost) / 100;
      calculation = `${baseCost}% of fabric cost (${fabricCost.toFixed(2)}) = ${cost.toFixed(2)}`;
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
  const method = option.pricing_method;

  console.log(`Calculating hierarchical option cost for: ${option.name}, pricing method: ${method}, base cost: ${baseCost}`);

  let cost = 0;
  let calculation = '';

  switch (method) {
    case 'per-unit':
      cost = baseCost * quantity;
      calculation = `${baseCost.toFixed(2)} × ${quantity} units = ${cost.toFixed(2)}`;
      break;
    
    case 'per-linear-meter':
      const widthInMeters = railWidth / 100;
      cost = baseCost * widthInMeters * quantity;
      calculation = `${baseCost.toFixed(2)} × ${widthInMeters.toFixed(2)}m × ${quantity} = ${cost.toFixed(2)}`;
      break;
    
    case 'per-linear-yard':
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
      cost = (fabricCost * baseCost) / 100;
      calculation = `${baseCost}% of fabric cost (${fabricCost.toFixed(2)}) = ${cost.toFixed(2)}`;
      break;
    
    case 'fixed':
    default:
      cost = baseCost * quantity;
      calculation = `Fixed cost: ${baseCost.toFixed(2)} × ${quantity} = ${cost.toFixed(2)}`;
      break;
  }

  return { cost, calculation };
};


import { useMemo } from "react";
import { useMeasurementUnits } from "@/hooks/useMeasurementUnits";

export const useFabricCalculation = (formData: any, options: any[], treatmentTypesData: any[], treatmentType: string, hierarchicalOptions: any[] = []) => {
  const { units } = useMeasurementUnits();

  const calculateFabricUsage = () => {
    const railWidth = parseFloat(formData.rail_width) || 0;
    const drop = parseFloat(formData.drop) || 0;
    const fullness = parseFloat(formData.heading_fullness) || 2.5;
    const fabricWidth = parseFloat(formData.fabric_width) || 140;

    if (!railWidth || !drop) {
      return { yards: 0, meters: 0 };
    }

    // Calculate fabric requirements
    const widthRequired = railWidth * fullness;
    const lengthRequired = drop + parseFloat(formData.pooling || "0") + 20; // Add allowances

    // Calculate drops per width
    const dropsPerWidth = Math.floor(fabricWidth / widthRequired);
    const widthsRequired = Math.ceil(1 / Math.max(dropsPerWidth, 1));

    // Total fabric needed
    const totalLengthCm = widthsRequired * lengthRequired;
    const totalYards = totalLengthCm / 91.44; // Convert cm to yards
    const totalMeters = totalLengthCm / 100; // Convert cm to meters

    return {
      yards: Math.ceil(totalYards * 10) / 10,
      meters: Math.ceil(totalMeters * 10) / 10
    };
  };

  const calculateOptionCost = (option: any) => {
    const railWidth = parseFloat(formData.rail_width) || 0;
    const drop = parseFloat(formData.drop) || 0;
    const quantity = formData.quantity || 1;
    const baseCost = option.base_cost || option.base_price || 0;
    const method = option.pricing_method || option.cost_type;

    console.log(`Calculating cost for option: ${option.name}, pricing method: ${method}, base cost: ${baseCost}`);
    console.log(`Rail width: ${railWidth}, Drop: ${drop}, Quantity: ${quantity}`);

    let cost = 0;
    let calculation = '';

    // Handle different pricing methods
    switch (method) {
      case 'per-unit':
      case 'per-panel':
        cost = baseCost * quantity;
        calculation = `${baseCost.toFixed(2)} × ${quantity} units = ${cost.toFixed(2)}`;
        break;
      
      case 'per-meter':
      case 'per-metre':
        // Use rail width converted to meters
        const widthInMeters = railWidth / 100;
        cost = baseCost * widthInMeters * quantity;
        calculation = `${baseCost.toFixed(2)} × ${widthInMeters.toFixed(2)}m × ${quantity} = ${cost.toFixed(2)}`;
        break;
      
      case 'per-yard':
        // Use rail width converted to yards
        const widthInYards = railWidth / 91.44;
        cost = baseCost * widthInYards * quantity;
        calculation = `${baseCost.toFixed(2)} × ${widthInYards.toFixed(2)} yards × ${quantity} = ${cost.toFixed(2)}`;
        break;
      
      case 'per-sqm':
      case 'per-square-meter':
        // Calculate area in square meters
        const areaInSqm = (railWidth / 100) * (drop / 100);
        cost = baseCost * areaInSqm * quantity;
        calculation = `${baseCost.toFixed(2)} × ${areaInSqm.toFixed(2)}m² × ${quantity} = ${cost.toFixed(2)}`;
        break;
      
      case 'per-linear-meter':
        // Use the perimeter (rail width + 2 * drop)
        const perimeterInMeters = (railWidth + 2 * drop) / 100;
        cost = baseCost * perimeterInMeters * quantity;
        calculation = `${baseCost.toFixed(2)} × ${perimeterInMeters.toFixed(2)}m perimeter × ${quantity} = ${cost.toFixed(2)}`;
        break;
      
      case 'percentage':
        // Calculate as percentage of fabric cost
        const fabricUsage = calculateFabricUsage();
        const fabricCost = fabricUsage.yards * parseFloat(formData.fabric_cost_per_yard || "0");
        cost = (fabricCost * baseCost) / 100;
        calculation = `${baseCost}% of fabric cost (${fabricCost.toFixed(2)}) = ${cost.toFixed(2)}`;
        break;
      
      case 'fixed':
      default:
        // Fixed cost regardless of measurements
        cost = baseCost * quantity;
        calculation = `Fixed cost: ${baseCost.toFixed(2)} × ${quantity} = ${cost.toFixed(2)}`;
        break;
    }

    return { cost, calculation };
  };

  const calculateHierarchicalOptionCost = (option: any) => {
    const railWidth = parseFloat(formData.rail_width) || 0;
    const drop = parseFloat(formData.drop) || 0;
    const quantity = formData.quantity || 1;
    const baseCost = option.base_price || 0;
    const method = option.pricing_method;

    console.log(`Calculating hierarchical option cost for: ${option.name}, pricing method: ${method}, base cost: ${baseCost}`);
    console.log(`Rail width: ${railWidth}, Drop: ${drop}, Quantity: ${quantity}`);

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
        const fabricUsage = calculateFabricUsage();
        const fabricCost = fabricUsage.yards * parseFloat(formData.fabric_cost_per_yard || "0");
        cost = (fabricCost * baseCost) / 100;
        calculation = `${baseCost}% of fabric cost (${fabricCost.toFixed(2)}) = ${cost.toFixed(2)}`;
        break;
      
      case 'fixed':
      default:
        cost = baseCost * quantity;
        calculation = `Fixed cost: ${baseCost.toFixed(2)} × ${quantity} = ${cost.toFixed(2)}`;
        break;
    }

    console.log(`Final calculation for ${option.name}: ${calculation}, Cost: ${cost}`);
    return { cost, calculation };
  };

  const findHierarchicalOptionById = (optionId: string): any => {
    for (const category of hierarchicalOptions) {
      for (const subcategory of category.subcategories || []) {
        for (const subSubcategory of subcategory.sub_subcategories || []) {
          if (subSubcategory.id === optionId) {
            return {
              ...subSubcategory,
              category_calculation_method: category.calculation_method,
              pricing_method: category.calculation_method || subSubcategory.pricing_method
            };
          }
          for (const extra of subSubcategory.extras || []) {
            if (extra.id === optionId) {
              return {
                ...extra,
                category_calculation_method: category.calculation_method,
                pricing_method: category.calculation_method || extra.pricing_method
              };
            }
          }
        }
      }
    }
    return null;
  };

  const calculateCosts = () => {
    // Fabric calculation
    const fabricUsage = calculateFabricUsage();
    const fabricCostPerYard = parseFloat(formData.fabric_cost_per_yard) || 0;
    const fabricCost = fabricUsage.yards * fabricCostPerYard;

    // Options calculation with proper pricing methods
    let optionsCost = 0;
    const optionDetails: Array<{ name: string; cost: number; method: string; calculation: string }> = [];

    console.log('=== OPTIONS CALCULATION DEBUG ===');
    console.log('Selected options:', formData.selected_options);
    console.log('Available options:', options);
    console.log('Hierarchical options:', hierarchicalOptions);

    // Calculate traditional options
    if (options && options.length > 0) {
      options.forEach(option => {
        if (formData.selected_options.includes(option.id)) {
          const optionCalc = calculateOptionCost(option);
          optionsCost += optionCalc.cost;
          optionDetails.push({
            name: option.name,
            cost: optionCalc.cost,
            method: option.pricing_method || option.cost_type || 'fixed',
            calculation: optionCalc.calculation
          });
          console.log(`Option ${option.name}: £${optionCalc.cost.toFixed(2)} (${option.pricing_method || option.cost_type})`);
        }
      });
    }

    // Calculate hierarchical options
    if (hierarchicalOptions && hierarchicalOptions.length > 0) {
      formData.selected_options.forEach((optionId: string) => {
        const hierarchicalOption = findHierarchicalOptionById(optionId);
        if (hierarchicalOption) {
          const optionCalc = calculateHierarchicalOptionCost(hierarchicalOption);
          optionsCost += optionCalc.cost;
          optionDetails.push({
            name: hierarchicalOption.name,
            cost: optionCalc.cost,
            method: hierarchicalOption.pricing_method || 'fixed',
            calculation: optionCalc.calculation
          });
          console.log(`Hierarchical Option ${hierarchicalOption.name}: £${optionCalc.cost.toFixed(2)} (${hierarchicalOption.pricing_method})`);
        }
      });
    }

    // Labor cost from treatment type
    const currentTreatmentType = treatmentTypesData?.find(tt => tt.name === treatmentType);
    const laborCost = currentTreatmentType?.labor_rate || 0;

    const totalCost = fabricCost + optionsCost + laborCost;

    console.log('=== COST BREAKDOWN ===');
    console.log('Fabric Cost:', fabricCost);
    console.log('Options Cost:', optionsCost);
    console.log('Labor Cost:', laborCost);
    console.log('Total Cost:', totalCost);

    return {
      fabricCost: fabricCost.toFixed(2),
      optionsCost: optionsCost.toFixed(2),
      laborCost: laborCost.toFixed(2),
      totalCost: totalCost.toFixed(2),
      fabricUsage: fabricUsage.yards.toFixed(1),
      optionDetails
    };
  };

  return {
    calculateFabricUsage,
    calculateCosts,
    calculateOptionCost
  };
};

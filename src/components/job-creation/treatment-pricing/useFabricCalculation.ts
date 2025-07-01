
import { useMemo } from "react";
import { useMeasurementUnits } from "@/hooks/useMeasurementUnits";

export const useFabricCalculation = (formData: any, options: any[], treatmentTypesData: any[], treatmentType: string) => {
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
    const baseCost = option.base_cost || 0;

    console.log(`Calculating cost for option: ${option.name}, pricing method: ${option.pricing_method || option.cost_type}, base cost: ${baseCost}`);

    // Handle different pricing methods
    switch (option.pricing_method || option.cost_type) {
      case 'per-unit':
      case 'per-panel':
        return baseCost * quantity;
      
      case 'per-meter':
      case 'per-metre':
        // Use rail width converted to meters
        const widthInMeters = railWidth / 100;
        return baseCost * widthInMeters;
      
      case 'per-yard':
        // Use rail width converted to yards
        const widthInYards = railWidth / 91.44;
        return baseCost * widthInYards;
      
      case 'per-sqm':
      case 'per-square-meter':
        // Calculate area in square meters
        const areaInSqm = (railWidth / 100) * (drop / 100);
        return baseCost * areaInSqm;
      
      case 'per-linear-meter':
        // Use the perimeter (rail width + 2 * drop)
        const perimeterInMeters = (railWidth + 2 * drop) / 100;
        return baseCost * perimeterInMeters;
      
      case 'percentage':
        // Calculate as percentage of fabric cost
        const fabricUsage = calculateFabricUsage();
        const fabricCost = fabricUsage.yards * parseFloat(formData.fabric_cost_per_yard || "0");
        return (fabricCost * baseCost) / 100;
      
      case 'fixed':
      default:
        // Fixed cost regardless of measurements
        return baseCost;
    }
  };

  const calculateCosts = () => {
    // Fabric calculation
    const fabricUsage = calculateFabricUsage();
    const fabricCostPerYard = parseFloat(formData.fabric_cost_per_yard) || 0;
    const fabricCost = fabricUsage.yards * fabricCostPerYard;

    // Options calculation with proper pricing methods
    let optionsCost = 0;
    const optionDetails: Array<{ name: string; cost: number; method: string }> = [];

    // Calculate traditional options
    if (options && options.length > 0) {
      options.forEach(option => {
        if (formData.selected_options.includes(option.id)) {
          const calculatedCost = calculateOptionCost(option);
          optionsCost += calculatedCost;
          optionDetails.push({
            name: option.name,
            cost: calculatedCost,
            method: option.pricing_method || option.cost_type || 'fixed'
          });
          console.log(`Option ${option.name}: £${calculatedCost.toFixed(2)} (${option.pricing_method || option.cost_type})`);
        }
      });
    }

    // Labor cost from treatment type
    const currentTreatmentType = treatmentTypesData?.find(tt => tt.name === treatmentType);
    const laborCost = currentTreatmentType?.labor_cost || 0;

    const totalCost = fabricCost + optionsCost + laborCost;

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

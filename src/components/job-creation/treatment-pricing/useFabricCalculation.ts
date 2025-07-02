
import { useMemo } from "react";
import { useMeasurementUnits } from "@/hooks/useMeasurementUnits";
import { calculateFabricUsage } from "./fabric-calculation/fabricUsageCalculator";
import { calculateOptionCost, calculateHierarchicalOptionCost } from "./fabric-calculation/optionCostCalculator";

export const useFabricCalculation = (formData: any, options: any[], treatmentTypesData: any[], treatmentType: string, hierarchicalOptions: any[] = []) => {
  const { units } = useMeasurementUnits();

  const fabricUsageCalculation = useMemo(() => {
    return calculateFabricUsage(formData, treatmentTypesData);
  }, [formData, treatmentTypesData]);

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
    const fabricUsage = fabricUsageCalculation;
    const fabricCostPerYard = parseFloat(formData.fabric_cost_per_yard) || 0;
    
    // Use the correct fabric amount based on user's unit preference
    const fabricAmount = units.fabric === 'yards' ? fabricUsage.yards : fabricUsage.meters;
    const fabricCost = fabricAmount * fabricCostPerYard;

    // Options calculation
    let optionsCost = 0;
    const optionDetails: Array<{ name: string; cost: number; method: string; calculation: string }> = [];

    // Calculate traditional options
    if (options && options.length > 0) {
      options.forEach(option => {
        if (formData.selected_options.includes(option.id)) {
          const optionCalc = calculateOptionCost(option, formData);
          optionsCost += optionCalc.cost;
          optionDetails.push({
            name: option.name,
            cost: optionCalc.cost,
            method: option.pricing_method || option.cost_type || 'fixed',
            calculation: optionCalc.calculation
          });
        }
      });
    }

    // Calculate hierarchical options
    if (hierarchicalOptions && hierarchicalOptions.length > 0) {
      formData.selected_options.forEach((optionId: string) => {
        const hierarchicalOption = findHierarchicalOptionById(optionId);
        if (hierarchicalOption) {
          const optionCalc = calculateHierarchicalOptionCost(hierarchicalOption, formData);
          optionsCost += optionCalc.cost;
          optionDetails.push({
            name: hierarchicalOption.name,
            cost: optionCalc.cost,
            method: hierarchicalOption.pricing_method || 'fixed',
            calculation: optionCalc.calculation
          });
        }
      });
    }

    // Enhanced labor cost calculation including seam work
    const currentTreatmentType = treatmentTypesData?.find(tt => tt.name === treatmentType);
    const defaultLaborRate = currentTreatmentType?.labor_rate || 25;
    const customLaborRate = parseFloat(formData.custom_labor_rate) || 0;
    const laborRate = customLaborRate > 0 ? customLaborRate : defaultLaborRate;
    
    const railWidth = parseFloat(formData.rail_width) || 0;
    const drop = parseFloat(formData.drop) || 0;
    const fullness = parseFloat(formData.heading_fullness) || 2.5;
    
    const baseHours = 2;
    const sewingComplexity = (railWidth * drop * fullness) / 25000;
    const seamHours = fabricUsage.seamLaborHours || 0;
    const totalHours = Math.max(3, baseHours + sewingComplexity + seamHours);
    
    const laborCost = laborRate * totalHours;
    const totalCost = fabricCost + optionsCost + laborCost;

    // Return fabric usage in the correct unit format
    const displayFabricUsage = units.fabric === 'yards' ? fabricUsage.yards : fabricUsage.meters;

    return {
      fabricCost: fabricCost.toFixed(2),
      optionsCost: optionsCost.toFixed(2),
      laborCost: laborCost.toFixed(2),
      totalCost: totalCost.toFixed(2),
      fabricUsage: displayFabricUsage.toFixed(1),
      fabricOrientation: fabricUsage.fabricOrientation,
      costComparison: fabricUsage.costComparison,
      warnings: fabricUsage.warnings,
      seamsRequired: fabricUsage.seamsRequired,
      seamLaborHours: fabricUsage.seamLaborHours,
      widthsRequired: fabricUsage.widthsRequired,
      optionDetails
    };
  };

  return {
    calculateFabricUsage: () => fabricUsageCalculation,
    calculateCosts,
    calculateOptionCost: (option: any) => calculateOptionCost(option, formData)
  };
};

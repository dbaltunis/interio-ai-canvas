
import { useMemo } from "react";
import { useMeasurementUnits } from "@/hooks/useMeasurementUnits";

export const useFabricCalculation = (formData: any, options: any[], treatmentTypesData: any[], treatmentType: string, hierarchicalOptions: any[] = []) => {
  const { units } = useMeasurementUnits();

  const calculateFabricUsage = () => {
    const railWidth = parseFloat(formData.rail_width) || 0;
    const drop = parseFloat(formData.drop) || 0;
    const fullness = parseFloat(formData.heading_fullness) || 2.5;
    const fabricWidth = parseFloat(formData.fabric_width) || 137;
    const quantity = formData.quantity || 1;
    const pooling = parseFloat(formData.pooling) || 0;

    // Hem allowances
    const headerHem = parseFloat(formData.header_hem) || 15;
    const bottomHem = parseFloat(formData.bottom_hem) || 10;
    const sideHem = parseFloat(formData.side_hem) || 5;
    const seamHem = parseFloat(formData.seam_hem) || 3;

    if (!railWidth || !drop) {
      return { 
        yards: 0, 
        meters: 0, 
        details: {},
        fabricOrientation: 'horizontal',
        costComparison: null,
        warnings: []
      };
    }

    // Calculate both orientations
    const horizontalCalc = calculateOrientation('horizontal');
    const verticalCalc = calculateOrientation('vertical');

    // Determine best orientation based on cost and feasibility
    let bestOrientation = 'horizontal';
    let costComparison = null;

    if (horizontalCalc.feasible && verticalCalc.feasible) {
      if (verticalCalc.totalCost < horizontalCalc.totalCost) {
        bestOrientation = 'vertical';
      }
      costComparison = {
        horizontal: horizontalCalc,
        vertical: verticalCalc,
        savings: Math.abs(horizontalCalc.totalCost - verticalCalc.totalCost),
        recommendation: bestOrientation
      };
    } else if (verticalCalc.feasible && !horizontalCalc.feasible) {
      bestOrientation = 'vertical';
    } else if (!horizontalCalc.feasible && !verticalCalc.feasible) {
      // Both orientations have issues, use horizontal as fallback
      bestOrientation = 'horizontal';
    }

    const selectedCalc = bestOrientation === 'vertical' ? verticalCalc : horizontalCalc;

    function calculateOrientation(orientation: 'horizontal' | 'vertical') {
      let effectiveFabricWidth, requiredLength, requiredWidth;
      let warnings = [];
      let feasible = true;

      if (orientation === 'horizontal') {
        // Standard orientation: fabric width used for curtain width
        effectiveFabricWidth = fabricWidth;
        requiredLength = drop + pooling + headerHem + bottomHem;
        requiredWidth = railWidth * fullness;
      } else {
        // Rotated orientation: fabric width used for curtain length
        effectiveFabricWidth = fabricWidth;
        requiredLength = railWidth * fullness;
        requiredWidth = drop + pooling + headerHem + bottomHem;
      }

      // Check if single drop fits
      if (orientation === 'horizontal' && requiredLength > fabricWidth) {
        warnings.push(`Curtain drop (${requiredLength.toFixed(0)}cm) exceeds fabric width (${fabricWidth}cm). Multiple drops required.`);
        feasible = false;
      }

      if (orientation === 'vertical' && requiredWidth > fabricWidth) {
        warnings.push(`Required width (${requiredWidth.toFixed(0)}cm) exceeds fabric width (${fabricWidth}cm) in vertical orientation.`);
        feasible = false;
      }

      // Calculate panels needed
      const panelsNeeded = Math.ceil(requiredWidth / (effectiveFabricWidth - (sideHem * 2)));
      
      // Calculate widths needed (fabric drops)
      let widthsRequired, dropsPerWidth;
      
      if (orientation === 'horizontal') {
        const panelWidthWithHems = (requiredWidth / quantity) + (sideHem * 2);
        dropsPerWidth = Math.floor(effectiveFabricWidth / panelWidthWithHems);
        widthsRequired = Math.ceil(quantity / Math.max(dropsPerWidth, 1));
      } else {
        // In vertical orientation, each panel requires its own width
        widthsRequired = quantity;
        dropsPerWidth = 1;
      }

      // Calculate seams needed
      const seamsRequired = Math.max(0, widthsRequired - 1);
      const totalSeamAllowance = seamsRequired * seamHem * 2;
      
      // Total fabric length needed
      const totalLength = widthsRequired * requiredLength + totalSeamAllowance;
      
      // Convert to yards and meters
      const totalYards = totalLength / 91.44;
      const totalMeters = totalLength / 100;

      // Calculate additional labor for seams
      const seamLaborHours = seamsRequired * 0.5; // 30 minutes per seam
      const fabricCostPerYard = parseFloat(formData.fabric_cost_per_yard) || 0;
      const fabricCost = totalYards * fabricCostPerYard;
      
      // Base labor calculation
      const currentTreatmentType = treatmentTypesData?.find(tt => tt.name === treatmentType);
      const defaultLaborRate = currentTreatmentType?.labor_rate || 25;
      const customLaborRate = parseFloat(formData.custom_labor_rate) || 0;
      const laborRate = customLaborRate > 0 ? customLaborRate : defaultLaborRate;
      
      const baseLaborHours = 2 + (railWidth * drop * fullness) / 25000;
      const totalLaborHours = baseLaborHours + seamLaborHours;
      const laborCost = totalLaborHours * laborRate;
      
      const totalCost = fabricCost + laborCost;

      return {
        orientation,
        feasible,
        warnings,
        totalYards: Math.ceil(totalYards * 10) / 10,
        totalMeters: Math.ceil(totalMeters * 10) / 10,
        widthsRequired,
        dropsPerWidth,
        seamsRequired,
        seamLaborHours,
        totalLaborHours,
        fabricCost,
        laborCost,
        totalCost,
        details: {
          effectiveFabricWidth,
          requiredLength,
          requiredWidth,
          panelsNeeded,
          totalSeamAllowance,
          fabricWidthPerPanel: requiredWidth / quantity,
          lengthPerWidth: requiredLength,
          headerHem,
          bottomHem,
          sideHem,
          seamHem
        }
      };
    }

    return {
      yards: selectedCalc.totalYards,
      meters: selectedCalc.totalMeters,
      details: selectedCalc.details,
      fabricOrientation: bestOrientation,
      costComparison,
      warnings: selectedCalc.warnings,
      seamsRequired: selectedCalc.seamsRequired,
      seamLaborHours: selectedCalc.seamLaborHours,
      widthsRequired: selectedCalc.widthsRequired
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

    return { cost, calculation };
  };

  const calculateHierarchicalOptionCost = (option: any) => {
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
    const fabricUsage = calculateFabricUsage();
    const fabricCostPerYard = parseFloat(formData.fabric_cost_per_yard) || 0;
    const fabricCost = fabricUsage.yards * fabricCostPerYard;

    // Options calculation
    let optionsCost = 0;
    const optionDetails: Array<{ name: string; cost: number; method: string; calculation: string }> = [];

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

    return {
      fabricCost: fabricCost.toFixed(2),
      optionsCost: optionsCost.toFixed(2),
      laborCost: laborCost.toFixed(2),
      totalCost: totalCost.toFixed(2),
      fabricUsage: fabricUsage.yards.toFixed(1),
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
    calculateFabricUsage,
    calculateCosts,
    calculateOptionCost
  };
};

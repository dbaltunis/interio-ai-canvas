
import { useMemo, useState, useEffect } from "react";
import { useMeasurementUnits } from "@/hooks/useMeasurementUnits";
import { useHeadingOptions } from "@/hooks/useHeadingOptions";
import { calculateFabricUsage } from "./fabric-calculation/fabricUsageCalculator";
import { calculateOptionCost, calculateHierarchicalOptionCost } from "./fabric-calculation/optionCostCalculator";
import { calculateIntegratedFabricUsage, type FabricCalculationParams } from "@/hooks/services/makingCostIntegrationService";

export const useFabricCalculation = (formData: any, options: any[], treatmentTypesData: any[], treatmentType: string, hierarchicalOptions: any[] = [], selectedFabricItem?: any) => {
  const { units } = useMeasurementUnits();
  const { data: headingOptions = [] } = useHeadingOptions();

  // Auto-detect fabric properties for smarter calculations
  const detectFabricProperties = () => {
    const fabricWidth = parseFloat(formData.fabric_width) || 137;
    const fabricType = formData.fabric_type?.toLowerCase() || '';
    
    // Detect if fabric is plain (no pattern matching required)
    const isPlainFabric = fabricType.includes('plain') || 
                         fabricType.includes('solid') || 
                         fabricType.includes('textured') ||
                         fabricType.includes('linen') ||
                         fabricType.includes('cotton');
    
    // Auto-detect pattern matching requirement
    const requiresPatternMatching = !isPlainFabric || 
                                   fabricType.includes('stripe') ||
                                   fabricType.includes('floral') ||
                                   fabricType.includes('geometric') ||
                                   fabricType.includes('pattern');
    
    // Classify fabric width
    const isNarrowFabric = fabricWidth <= 200;
    
    return { 
      isPlainFabric, 
      requiresPatternMatching, 
      isNarrowFabric, 
      fabricWidth 
    };
  };

  // Extract fullness ratio from selected options
  const getActiveFullnessRatio = () => {
    let fullnessRatio = parseFloat(formData.heading_fullness) || 2.5;
    
    // First check if a specific heading option is selected
    if (formData.selected_heading && formData.selected_heading !== "no-heading") {
      const selectedHeading = headingOptions.find(h => h.id === formData.selected_heading);
      if (selectedHeading) {
        fullnessRatio = selectedHeading.fullness;
      }
    }
    
    // Check hierarchical options for fullness that affects fabric calculation
    hierarchicalOptions.forEach(category => {
      if (category.affects_fabric_calculation) {
        category.subcategories?.forEach(sub => {
          sub.sub_subcategories?.forEach(subSub => {
            if (formData.selected_options.includes(subSub.id) && subSub.fullness_ratio) {
              fullnessRatio = subSub.fullness_ratio;
            }
            subSub.extras?.forEach(extra => {
              if (formData.selected_options.includes(extra.id) && extra.fullness_ratio) {
                fullnessRatio = extra.fullness_ratio;
              }
            });
          });
        });
      }
    });

    return fullnessRatio;
  };

  const fabricUsageCalculation = useMemo(() => {
    const activeFullness = getActiveFullnessRatio();
    const fabricProps = detectFabricProperties();
    
    // Auto-suggest roll direction if not explicitly set
    let rollDirection = formData.roll_direction;
    if (!rollDirection || rollDirection === 'auto') {
      // For narrow fabrics, check if we can benefit from horizontal rotation
      const railWidth = parseFloat(formData.rail_width) || 0;
      const drop = parseFloat(formData.drop) || 0;
      
      if (fabricProps.isPlainFabric && fabricProps.isNarrowFabric && 
          drop < fabricProps.fabricWidth && railWidth > fabricProps.fabricWidth) {
        rollDirection = 'horizontal'; // Rotate for fabric savings
      } else if (fabricProps.isNarrowFabric) {
        rollDirection = 'vertical'; // Standard for narrow fabrics
      } else {
        rollDirection = 'horizontal'; // Standard for wide fabrics
      }
    }
    
    const formDataWithEnhancements = {
      ...formData,
      heading_fullness: activeFullness,
      roll_direction: rollDirection,
      // Add fabric properties for calculation context
      fabric_properties: fabricProps
    };
    
    return calculateFabricUsage(formDataWithEnhancements, treatmentTypesData, selectedFabricItem);
  }, [formData, treatmentTypesData, hierarchicalOptions]);

  const findHierarchicalOptionById = (optionId: string): any => {
    for (const category of hierarchicalOptions) {
      for (const subcategory of category.subcategories || []) {
        for (const subSubcategory of subcategory.sub_subcategories || []) {
          if (subSubcategory.id === optionId) {
            return {
              ...subSubcategory,
              category_calculation_method: category.calculation_method,
              pricing_method: subSubcategory.calculation_method === 'inherit' 
                ? (category.calculation_method || subSubcategory.pricing_method)
                : subSubcategory.calculation_method || subSubcategory.pricing_method,
              window_covering_pricing_method: formData.window_covering?.fabrication_pricing_method
            };
          }
          for (const extra of subSubcategory.extras || []) {
            if (extra.id === optionId) {
              return {
                ...extra,
                category_calculation_method: category.calculation_method,
                pricing_method: extra.calculation_method === 'inherit' 
                  ? (category.calculation_method || extra.pricing_method)
                  : extra.calculation_method || extra.pricing_method,
                window_covering_pricing_method: formData.window_covering?.fabrication_pricing_method
              };
            }
          }
        }
      }
    }
    return null;
  };

  const calculateCosts = async () => {
    // Check if window covering has making cost linked
    const windowCovering = formData.window_covering;
    const makingCostId = windowCovering?.making_cost_id;
    
    // If making cost is linked, use integrated calculation
    if (makingCostId && windowCovering?.id) {
      try {
        const params: FabricCalculationParams = {
          windowCoveringId: windowCovering.id,
          makingCostId,
          measurements: {
            railWidth: parseFloat(formData.rail_width) || 0,
            drop: parseFloat(formData.drop) || 0,
            pooling: parseFloat(formData.pooling) || 0
          },
          selectedOptions: formData.selected_options || [],
          fabricDetails: {
            fabricWidth: parseFloat(formData.fabric_width) || 137,
            fabricCostPerYard: parseFloat(formData.fabric_cost_per_yard) || 0,
            rollDirection: formData.roll_direction || 'vertical'
          }
        };
        
        const integratedResult = await calculateIntegratedFabricUsage(params);
        
        // Convert to legacy format for compatibility
        return {
          fabricCost: integratedResult.costs.fabricCost.toFixed(2),
          optionsCost: (integratedResult.costs.makingCost + integratedResult.costs.additionalOptionsCost).toFixed(2),
          laborCost: integratedResult.costs.laborCost.toFixed(2),
          totalCost: integratedResult.costs.totalCost.toFixed(2),
          fabricUsage: units.fabric === 'yards' ? integratedResult.fabricUsage.yards.toFixed(1) : integratedResult.fabricUsage.meters.toFixed(1),
          fabricOrientation: integratedResult.fabricUsage.orientation,
          costComparison: null, // TODO: Implement if needed
          warnings: integratedResult.warnings,
          seamsRequired: integratedResult.fabricUsage.seamsRequired,
          seamLaborHours: integratedResult.fabricUsage.seamLaborHours,
          widthsRequired: integratedResult.fabricUsage.widthsRequired,
          optionDetails: [
            ...integratedResult.breakdown.makingCostOptions.map(option => ({
              name: option.name,
              cost: option.cost,
              method: 'making_cost',
              calculation: option.calculation
            })),
            ...integratedResult.breakdown.additionalOptions.map(option => ({
              name: option.name,
              cost: option.cost,
              method: 'additional',
              calculation: option.calculation
            }))
          ]
        };
      } catch (error) {
        console.error('Integrated calculation failed, falling back to standard calculation:', error);
        // Fall through to standard calculation
      }
    }

    // Standard calculation (existing logic)
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
          const enhancedOption = {
            ...option,
            window_covering_pricing_method: formData.window_covering?.fabrication_pricing_method,
            pricing_method: option.calculation_method === 'inherit' 
              ? formData.window_covering?.fabrication_pricing_method || option.pricing_method
              : option.calculation_method || option.pricing_method
          };
          const optionCalc = calculateOptionCost(enhancedOption, formData);
          optionsCost += optionCalc.cost;
          optionDetails.push({
            name: option.name,
            cost: optionCalc.cost,
            method: enhancedOption.pricing_method || option.cost_type || 'fixed',
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

  // Create integrated calculation hook
  const [integratedCosts, setIntegratedCosts] = useState<any>(null);
  
  useEffect(() => {
    const runIntegratedCalculation = async () => {
      try {
        const result = await calculateCosts();
        setIntegratedCosts(result);
      } catch (error) {
        console.error('Integrated calculation error:', error);
        setIntegratedCosts(null);
      }
    };
    
    runIntegratedCalculation();
  }, [formData, hierarchicalOptions, units]);

  return {
    calculateFabricUsage: () => fabricUsageCalculation,
    calculateCosts: () => integratedCosts || {
      fabricCost: "0.00",
      optionsCost: "0.00", 
      laborCost: "0.00",
      totalCost: "0.00",
      fabricUsage: "0.0",
      fabricOrientation: 'vertical',
      costComparison: null,
      warnings: [],
      seamsRequired: 0,
      seamLaborHours: 0,
      widthsRequired: 0,
      optionDetails: []
    },
    calculateOptionCost: (option: any) => calculateOptionCost(option, formData)
  };
};


import { useMeasurementUnits } from "@/hooks/useMeasurementUnits";
import { TreatmentFormData } from "./useTreatmentFormData";

export const useFabricCalculation = (
  formData: TreatmentFormData, 
  options: any[], 
  treatmentTypesData: any[], 
  treatmentType: string
) => {
  const { units } = useMeasurementUnits();

  const calculateFabricUsage = () => {
    const railWidth = parseFloat(formData.rail_width) || 0;
    const drop = parseFloat(formData.drop) || 0;
    const pooling = parseFloat(formData.pooling) || 0;
    const fabricWidth = parseFloat(formData.fabric_width) || 137;
    const headingFullness = parseFloat(formData.heading_fullness) || 2.5;
    
    if (railWidth && drop) {
      const totalDrop = drop + pooling;
      
      let fabricUsage = 0;
      
      if (formData.roll_direction === "horizontal") {
        // For horizontal cutting, we need multiple drops
        const requiredWidth = railWidth * headingFullness;
        const dropsNeeded = Math.ceil(requiredWidth / fabricWidth);
        
        // Convert to fabric units (meters or yards)
        const fabricUnitsPerDrop = units.system === 'metric' 
          ? totalDrop / 100  // cm to meters
          : totalDrop / 36;  // inches to yards
        
        fabricUsage = dropsNeeded * fabricUnitsPerDrop;
      } else {
        // For vertical cutting, we might need multiple widths
        const requiredWidth = railWidth * headingFullness;
        
        if (fabricWidth >= requiredWidth) {
          // Single width is sufficient
          fabricUsage = units.system === 'metric' 
            ? totalDrop / 100  // cm to meters
            : totalDrop / 36;  // inches to yards
        } else {
          // Multiple widths needed
          const widthsNeeded = Math.ceil(requiredWidth / fabricWidth);
          const fabricUnitsPerWidth = units.system === 'metric' 
            ? totalDrop / 100  // cm to meters
            : totalDrop / 36;  // inches to yards
          
          fabricUsage = widthsNeeded * fabricUnitsPerWidth;
        }
      }
      
      return fabricUsage;
    }
    return 0;
  };

  const calculateCosts = () => {
    const fabricUsage = calculateFabricUsage();
    const fabricCostPerUnit = parseFloat(formData.fabric_cost_per_yard) || 0;
    const fabricCost = fabricUsage * fabricCostPerUnit;
    
    // Calculate window covering options cost
    const windowCoveringOptionsCost = (options || [])
      .filter(option => formData.selected_options.includes(option.id))
      .reduce((total, option) => {
        let optionCost = option.base_cost || 0;
        
        // Apply cost calculation based on cost_type
        if (option.cost_type === 'per-meter' && fabricUsage) {
          optionCost = optionCost * fabricUsage;
        } else if (option.cost_type === 'per-sqm' && formData.rail_width && formData.drop) {
          const area = (parseFloat(formData.rail_width) / 100) * (parseFloat(formData.drop) / 100); // convert cm to m²
          optionCost = optionCost * area;
        } else if (option.cost_type === 'percentage') {
          optionCost = fabricCost * (optionCost / 100);
        }
        
        return total + optionCost;
      }, 0);
    
    // Calculate treatment type options cost
    const currentTreatmentType = treatmentTypesData?.find(tt => tt.name === treatmentType);
    const treatmentOptions = currentTreatmentType?.specifications?.options || [];
    
    const treatmentOptionsCost = treatmentOptions
      .filter((option: any) => {
        const optionId = option.id || option.name;
        return formData.selected_options.includes(optionId);
      })
      .reduce((total: number, option: any) => total + (option.cost || 0), 0);
    
    const totalOptionsCost = windowCoveringOptionsCost + treatmentOptionsCost;
    const laborCost = currentTreatmentType?.labor_rate || 150;
    const totalCost = fabricCost + totalOptionsCost + laborCost;
    
    return {
      fabricUsage: fabricUsage.toFixed(2),
      fabricCost: fabricCost.toFixed(2),
      optionsCost: totalOptionsCost.toFixed(2),
      laborCost: laborCost.toFixed(2),
      totalCost: totalCost.toFixed(2)
    };
  };

  return {
    calculateFabricUsage,
    calculateCosts
  };
};

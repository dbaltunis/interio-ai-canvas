
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
        const requiredWidth = railWidth * headingFullness;
        const dropsNeeded = Math.ceil(requiredWidth / fabricWidth);
        
        const fabricUnitsPerDrop = units.system === 'metric' 
          ? totalDrop / 100
          : totalDrop / 36;
        
        fabricUsage = dropsNeeded * fabricUnitsPerDrop;
      } else {
        const requiredWidth = railWidth * headingFullness;
        
        if (fabricWidth >= requiredWidth) {
          fabricUsage = units.system === 'metric' 
            ? totalDrop / 100
            : totalDrop / 36;
        } else {
          const widthsNeeded = Math.ceil(requiredWidth / fabricWidth);
          const fabricUnitsPerWidth = units.system === 'metric' 
            ? totalDrop / 100
            : totalDrop / 36;
          
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
    
    const windowCoveringOptionsCost = options
      ?.filter(option => formData.selected_options.includes(option.id))
      .reduce((total, option) => total + option.base_cost, 0) || 0;
    
    const currentTreatmentType = treatmentTypesData?.find(tt => tt.name === treatmentType);
    const treatmentOptions = currentTreatmentType?.specifications?.options || [];
    
    const treatmentOptionsCost = treatmentOptions
      .filter((option: any) => formData.selected_options.includes(option.id || option.name))
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

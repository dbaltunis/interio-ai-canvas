
import { supabase } from '@/integrations/supabase/client';

export interface MakingCost {
  id: string;
  name: string;
  pricing_method: string;
  include_fabric_selection: boolean;
  measurement_type: string;
  heading_options: any[];
  hardware_options: any[];
  lining_options: any[];
  drop_ranges: any[];
  description: string;
  active: boolean;
  user_id: string;
  created_at: string;
  updated_at: string;
}

export interface MakingCostWithOptions extends MakingCost {
  bundledOptions: {
    heading: any[];
    hardware: any[];
    lining: any[];
  };
}

export interface FabricCalculationParams {
  windowCoveringId: string;
  makingCostId?: string;
  measurements: {
    railWidth: number;
    drop: number;
    pooling: number;
  };
  selectedOptions: string[];
  fabricDetails: {
    fabricWidth: number;
    fabricCostPerYard: number;
    rollDirection: string;
  };
}

export interface IntegratedCalculationResult {
  fabricUsage: {
    yards: number;
    meters: number;
    orientation: string;
    seamsRequired: number;
    widthsRequired: number;
    seamLaborHours: number;
  };
  costs: {
    fabricCost: number;
    makingCost: number;
    additionalOptionsCost: number;
    laborCost: number;
    totalCost: number;
  };
  breakdown: {
    makingCostOptions: Array<{
      type: string;
      name: string;
      cost: number;
      calculation: string;
    }>;
    additionalOptions: Array<{
      name: string;
      cost: number;
      calculation: string;
    }>;
  };
  warnings: string[];
}

// Mock implementation since making_costs table doesn't exist yet
export const fetchMakingCostWithOptions = async (makingCostId: string): Promise<MakingCostWithOptions | null> => {
  try {
    console.log('Fetching making cost with ID:', makingCostId);
    
    // Return mock data for now
    const mockMakingCost: MakingCostWithOptions = {
      id: makingCostId,
      name: 'Standard Curtains',
      pricing_method: 'drop_range',
      include_fabric_selection: true,
      measurement_type: 'standard',
      heading_options: [
        { name: 'Pencil Pleat', fullness: 2.5, cost: 0 },
        { name: 'Eyelet', fullness: 2.0, cost: 10 }
      ],
      hardware_options: [
        { name: 'Standard Track', cost: 25 },
        { name: 'Curtain Rod', cost: 35 }
      ],
      lining_options: [
        { name: 'No Lining', cost: 0 },
        { name: 'Standard Lining', cost: 15 }
      ],
      drop_ranges: [
        { min: 0, max: 150, price: 50 },
        { min: 151, max: 250, price: 75 },
        { min: 251, max: 350, price: 100 }
      ],
      description: 'Standard curtain making service',
      active: true,
      user_id: 'mock-user',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      bundledOptions: {
        heading: [],
        hardware: [],
        lining: []
      }
    };

    return mockMakingCost;
  } catch (error) {
    console.error('Error in fetchMakingCostWithOptions:', error);
    return null;
  }
};

export const calculateIntegratedFabricUsage = async (params: FabricCalculationParams): Promise<IntegratedCalculationResult> => {
  const { windowCoveringId, makingCostId, measurements, selectedOptions, fabricDetails } = params;
  
  console.log('Calculating integrated fabric usage with params:', params);

  // Initialize calculation result
  let result: IntegratedCalculationResult = {
    fabricUsage: {
      yards: 0,
      meters: 0,
      orientation: fabricDetails.rollDirection || 'vertical',
      seamsRequired: 0,
      widthsRequired: 0,
      seamLaborHours: 0
    },
    costs: {
      fabricCost: 0,
      makingCost: 0,
      additionalOptionsCost: 0,
      laborCost: 0,
      totalCost: 0
    },
    breakdown: {
      makingCostOptions: [],
      additionalOptions: []
    },
    warnings: []
  };

  // Calculate base fabric usage
  const railWidth = measurements.railWidth;
  const drop = measurements.drop;
  const fabricWidth = fabricDetails.fabricWidth;
  const fabricCostPerYard = fabricDetails.fabricCostPerYard;

  // Base calculations
  let fullnessRatio = 2.5; // Default
  let fabricWasteFactor = 0.1; // 10% default waste
  let patternRepeatFactor = 1.0;
  let seamComplexityFactor = 1.0;

  // If making cost is linked, fetch bundled options and their effects
  if (makingCostId) {
    const makingCostWithOptions = await fetchMakingCostWithOptions(makingCostId);
    
    if (makingCostWithOptions) {
      // Calculate making cost base price
      const dropRangePrice = calculateDropRangePrice(makingCostWithOptions.drop_ranges, drop);
      result.costs.makingCost = dropRangePrice;
      
      // Add to breakdown
      result.breakdown.makingCostOptions.push({
        type: 'base_making_cost',
        name: `${makingCostWithOptions.name} (Drop: ${drop}cm)`,
        cost: dropRangePrice,
        calculation: `Drop range pricing for ${drop}cm drop`
      });
    }
  }

  // Calculate fabric requirements with enhancements
  const totalWidthNeeded = railWidth * fullnessRatio;
  const fabricLengthNeeded = drop + measurements.pooling + 25; // 25cm allowances
  
  // Determine orientation and calculate widths needed
  let widthsRequired = 0;
  let totalFabricLength = 0;
  
  if (fabricDetails.rollDirection === 'horizontal') {
    // Horizontal orientation
    widthsRequired = Math.ceil(totalWidthNeeded / fabricWidth);
    totalFabricLength = fabricLengthNeeded * widthsRequired;
    result.fabricUsage.seamsRequired = Math.max(0, widthsRequired - 1);
  } else {
    // Vertical orientation (most common)
    const dropsPerWidth = Math.floor(fabricWidth / (totalWidthNeeded / Math.ceil(totalWidthNeeded / fabricWidth)));
    widthsRequired = Math.ceil(Math.ceil(totalWidthNeeded / fabricWidth) / Math.max(1, dropsPerWidth));
    totalFabricLength = fabricLengthNeeded * widthsRequired;
    result.fabricUsage.seamsRequired = Math.max(0, Math.ceil(totalWidthNeeded / fabricWidth) - 1);
  }

  // Apply pattern repeat and waste factors
  totalFabricLength *= patternRepeatFactor;
  totalFabricLength *= (1 + fabricWasteFactor);
  
  // Convert to yards and meters
  const totalYards = totalFabricLength / 91.44; // cm to yards
  const totalMeters = totalFabricLength / 100; // cm to meters
  
  result.fabricUsage = {
    yards: Math.ceil(totalYards * 10) / 10,
    meters: Math.ceil(totalMeters * 10) / 10,
    orientation: fabricDetails.rollDirection,
    seamsRequired: result.fabricUsage.seamsRequired,
    widthsRequired,
    seamLaborHours: result.fabricUsage.seamsRequired * 0.5 * seamComplexityFactor
  };

  // Calculate fabric cost
  result.costs.fabricCost = totalYards * fabricCostPerYard;

  // Calculate labor cost
  const baseLaborHours = 2;
  const sewingComplexity = (railWidth * drop * fullnessRatio) / 25000;
  const seamHours = result.fabricUsage.seamLaborHours;
  const totalLaborHours = Math.max(3, baseLaborHours + sewingComplexity + seamHours);
  result.costs.laborCost = totalLaborHours * 25; // £25/hour default

  // Calculate total cost
  result.costs.totalCost = result.costs.fabricCost + result.costs.makingCost + 
                          result.costs.additionalOptionsCost + result.costs.laborCost;

  // Add warnings
  if (result.fabricUsage.seamsRequired > 0) {
    result.warnings.push(`${result.fabricUsage.seamsRequired} seam(s) required - consider fabric width vs. rail width`);
  }
  
  if (fabricWasteFactor > 0.15) {
    result.warnings.push('High fabric waste factor due to selected options');
  }

  return result;
};

const calculateDropRangePrice = (dropRanges: any[], drop: number): number => {
  if (!dropRanges || dropRanges.length === 0) return 0;
  
  for (const range of dropRanges) {
    if (drop >= range.min && drop <= range.max) {
      return range.price;
    }
  }
  
  // If no range matches, use the highest range
  const highestRange = dropRanges.sort((a, b) => b.max - a.max)[0];
  return highestRange?.price || 0;
};

const calculateOptionCost = (option: any, params: any) => {
  const { railWidth, drop, quantity, fabricCostPerYard, fabricUsage } = params;
  const baseCost = option.base_cost || 0;
  let cost = 0;
  let calculation = '';

  switch (option.cost_type || 'fixed') {
    case 'per-meter':
      const widthInMeters = railWidth / 100;
      cost = baseCost * widthInMeters * quantity;
      calculation = `${baseCost} × ${widthInMeters.toFixed(2)}m × ${quantity} = £${cost.toFixed(2)}`;
      break;
    
    case 'per-yard':
      const widthInYards = railWidth / 91.44;
      cost = baseCost * widthInYards * quantity;
      calculation = `${baseCost} × ${widthInYards.toFixed(2)} yards × ${quantity} = £${cost.toFixed(2)}`;
      break;
    
    case 'percentage':
      const totalFabricCost = fabricCostPerYard * fabricUsage;
      cost = (baseCost / 100) * totalFabricCost;
      calculation = `${baseCost}% × £${totalFabricCost.toFixed(2)} fabric cost = £${cost.toFixed(2)}`;
      break;
    
    case 'fixed':
    default:
      cost = baseCost * quantity;
      calculation = `Fixed cost: £${baseCost} × ${quantity} = £${cost.toFixed(2)}`;
      break;
  }

  return { cost, calculation };
};

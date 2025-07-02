import { supabase } from '@/integrations/supabase/client';
import type { MakingCost } from '@/hooks/useMakingCosts';

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

export const fetchMakingCostWithOptions = async (makingCostId: string): Promise<MakingCostWithOptions | null> => {
  try {
    // Fetch making cost
    const { data: makingCost, error: makingCostError } = await supabase
      .from('making_costs')
      .select('*')
      .eq('id', makingCostId)
      .single();

    if (makingCostError || !makingCost) {
      console.error('Error fetching making cost:', makingCostError);
      return null;
    }

    // Fetch bundled option mappings
    const { data: mappings, error: mappingsError } = await supabase
      .from('making_cost_option_mappings')
      .select(`
        *,
        window_covering_option_categories (
          id,
          name,
          description,
          calculation_method,
          affects_fabric_calculation,
          affects_labor_calculation,
          fabric_waste_factor,
          pattern_repeat_factor,
          seam_complexity_factor
        )
      `)
      .eq('making_cost_id', makingCostId)
      .eq('is_included', true);

    if (mappingsError) {
      console.error('Error fetching option mappings:', mappingsError);
      return null;
    }

    // Group options by type
    const bundledOptions = {
      heading: (mappings || []).filter(m => m.option_type === 'heading'),
      hardware: (mappings || []).filter(m => m.option_type === 'hardware'),
      lining: (mappings || []).filter(m => m.option_type === 'lining'),
    };

    return {
      id: makingCost.id,
      name: makingCost.name,
      pricing_method: makingCost.pricing_method,
      include_fabric_selection: makingCost.include_fabric_selection || false,
      measurement_type: makingCost.measurement_type,
      heading_options: (makingCost.heading_options as any) || [],
      hardware_options: (makingCost.hardware_options as any) || [],
      lining_options: (makingCost.lining_options as any) || [],
      drop_ranges: (makingCost.drop_ranges as any) || [],
      description: makingCost.description || '',
      active: makingCost.active || false,
      user_id: makingCost.user_id,
      created_at: makingCost.created_at,
      updated_at: makingCost.updated_at,
      bundledOptions
    };
  } catch (error) {
    console.error('Error in fetchMakingCostWithOptions:', error);
    return null;
  }
};

export const calculateIntegratedFabricUsage = async (params: FabricCalculationParams): Promise<IntegratedCalculationResult> => {
  const { windowCoveringId, makingCostId, measurements, selectedOptions, fabricDetails } = params;
  
  // Create calculation hash for caching
  const calculationHash = btoa(JSON.stringify(params)).replace(/[^a-zA-Z0-9]/g, '').substring(0, 32);
  
  // Check cache first
  const { data: cachedResult } = await supabase
    .from('fabric_calculations_cache')
    .select('*')
    .eq('calculation_hash', calculationHash)
    .single();

  if (cachedResult) {
    return {
      fabricUsage: cachedResult.fabric_usage_data as any,
      costs: cachedResult.cost_breakdown as any,
      breakdown: cachedResult.cost_breakdown as any,
      warnings: []
    };
  }

  // Fetch window covering details
  const { data: windowCovering } = await supabase
    .from('window_coverings')
    .select('*')
    .eq('id', windowCoveringId)
    .single();

  if (!windowCovering) {
    throw new Error('Window covering not found');
  }

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
      
      // Apply effects from bundled options (heading options can affect fullness)
      makingCostWithOptions.bundledOptions.heading.forEach(option => {
        if (option.window_covering_option_categories?.affects_fabric_calculation) {
          const category = option.window_covering_option_categories;
          fabricWasteFactor += category.fabric_waste_factor || 0;
          patternRepeatFactor *= category.pattern_repeat_factor || 1;
          seamComplexityFactor *= category.seam_complexity_factor || 1;
        }
      });

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

  // Calculate additional window covering options (not covered by making cost)
  if (selectedOptions.length > 0) {
    const { data: additionalOptions } = await supabase
      .from('window_covering_options')
      .select('*')
      .in('id', selectedOptions)
      .neq('source_type', 'making_cost');

    if (additionalOptions) {
      additionalOptions.forEach(option => {
        const optionCost = calculateOptionCost(option, {
          railWidth,
          drop,
          quantity: 1,
          fabricCostPerYard,
          fabricUsage: result.fabricUsage.yards
        });
        
        result.costs.additionalOptionsCost += optionCost.cost;
        result.breakdown.additionalOptions.push({
          name: option.name,
          cost: optionCost.cost,
          calculation: optionCost.calculation
        });
      });
    }
  }

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

  // Cache the result
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      await supabase
        .from('fabric_calculations_cache')
        .upsert({
          calculation_hash: calculationHash,
          window_covering_id: windowCoveringId,
          making_cost_id: makingCostId || null,
          fabric_usage_data: result.fabricUsage as any,
          cost_breakdown: result.costs as any,
          user_id: user.id
        });
    }
  } catch (error) {
    console.error('Failed to cache calculation result:', error);
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
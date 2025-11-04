// Consolidated Fabric Pricing Hook

import { useMemo } from 'react';
import { useMeasurementUnits } from '@/hooks/useMeasurementUnits';
import { calculateFabricUsage } from '@/components/job-creation/treatment-pricing/fabric-calculation/fabricUsageCalculator';
import type { FabricUsageResult } from '@/components/job-creation/treatment-pricing/fabric-calculation/types';

export interface FabricPricingParams {
  formData: any;
  treatmentTypesData: any[];
  selectedFabricItem?: any;
}

export interface FabricPricingResult {
  fabricCost: number;
  fabricUsage: number;
  fabricUsageUnit: 'yards' | 'meters';
  fabricUsageResult: FabricUsageResult;
  costPerUnit: number;
}

export const useFabricPricing = (params: FabricPricingParams): FabricPricingResult => {
  const { formData, treatmentTypesData, selectedFabricItem } = params;
  const { units } = useMeasurementUnits();

  const result = useMemo(() => {
    // Calculate fabric usage using existing calculator
    const fabricUsageResult = calculateFabricUsage(
      formData,
      treatmentTypesData,
      selectedFabricItem
    );

    // Get fabric cost per yard
    let fabricCostPerYard = parseFloat(formData.fabric_cost_per_yard) || 0;
    
    if (selectedFabricItem) {
      const pricePerMeter = selectedFabricItem.price_per_meter || 
                           selectedFabricItem.unit_price || 
                           selectedFabricItem.selling_price || 
                           0;
      fabricCostPerYard = pricePerMeter * 1.09361; // Convert meters to yards
    }

    // Use the correct fabric amount based on user's unit preference
    const fabricAmount = units.fabric === 'yards' 
      ? fabricUsageResult.yards 
      : fabricUsageResult.meters;
    
    const fabricCost = fabricAmount * fabricCostPerYard;

    return {
      fabricCost,
      fabricUsage: fabricAmount,
      fabricUsageUnit: units.fabric as 'yards' | 'meters',
      fabricUsageResult,
      costPerUnit: fabricCostPerYard
    };
  }, [formData, treatmentTypesData, selectedFabricItem, units.fabric]);

  return result;
};

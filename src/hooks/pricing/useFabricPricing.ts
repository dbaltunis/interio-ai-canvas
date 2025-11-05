// Consolidated Fabric Pricing Hook

import { useMemo } from 'react';
import { useMeasurementUnits } from '@/hooks/useMeasurementUnits';
import { calculateFabricUsage } from '@/components/job-creation/treatment-pricing/fabric-calculation/fabricUsageCalculator';
import type { FabricUsageResult } from '@/components/job-creation/treatment-pricing/fabric-calculation/types';
import { resolveGridForProduct } from '@/utils/pricing/gridResolver';
import { getPriceFromGrid } from '@/hooks/usePricingGrids';

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

    let fabricCostPerYard = parseFloat(formData.fabric_cost_per_yard) || 0;
    let usePricingGrid = false;
    
    if (selectedFabricItem) {
      // PRIORITY 1: Check if fabric has pricing grid data already resolved
      // (Grid should be resolved and attached when fabric is selected)
      if (selectedFabricItem.pricing_grid_data && formData.rail_width && formData.drop) {
        const widthCm = parseFloat(formData.rail_width) || 0;
        const dropCm = parseFloat(formData.drop) || 0;
        
        const gridPrice = getPriceFromGrid(selectedFabricItem.pricing_grid_data, widthCm, dropCm);
        
        if (gridPrice > 0) {
          // Grid returns total manufacturing cost, not fabric cost
          // For fabric pricing, we still use per-unit but log that grid exists
          console.log('ℹ️ Fabric has pricing grid attached:', {
            grid: selectedFabricItem.resolved_grid_name,
            gridCode: selectedFabricItem.resolved_grid_code,
            dimensions: `${widthCm}cm × ${dropCm}cm`,
            gridPrice: `${gridPrice} (manufacturing cost)`
          });
          usePricingGrid = true;
        }
      }
      
      // Use price per unit for fabric (grid is for manufacturing, not fabric material)
      const pricePerMeter = selectedFabricItem.price_per_meter || 
                           selectedFabricItem.unit_price || 
                           selectedFabricItem.selling_price || 
                           0;
      fabricCostPerYard = pricePerMeter * 1.09361; // Convert meters to yards
      
      if (!usePricingGrid) {
        console.log('ℹ️ Using per-unit pricing for fabric:', {
          pricePerMeter,
          fabricCostPerYard,
          hasGridInfo: !!(selectedFabricItem.price_group && selectedFabricItem.product_category)
        });
      }
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

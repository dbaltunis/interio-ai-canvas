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

    let fabricCostPerUnit = parseFloat(formData.fabric_cost_per_yard) || 0;
    let usePricingGrid = false;
    
    // Get pricing method from fabric item (defaults to 'linear')
    const pricingMethod = selectedFabricItem?.pricing_method || 'linear';
    
    if (selectedFabricItem) {
      // PRIORITY 1: Check if fabric has pricing grid data already resolved
      // (Grid should be resolved and attached when fabric is selected)
      // CRITICAL: measurements are in MM, getPriceFromGrid expects CM
      if (selectedFabricItem.pricing_grid_data && formData.rail_width && formData.drop) {
        const widthMm = parseFloat(formData.rail_width) || 0;
        const dropMm = parseFloat(formData.drop) || 0;
        
        // Convert MM to CM for grid lookup
        const widthCm = widthMm / 10;
        const dropCm = dropMm / 10;
        
        const gridPrice = getPriceFromGrid(selectedFabricItem.pricing_grid_data, widthCm, dropCm);
        
        if (gridPrice > 0) {
          // Grid returns total manufacturing cost, not fabric cost
          // For fabric pricing, we still use per-unit but log that grid exists
          console.log('ℹ️ Fabric has pricing grid attached:', {
            grid: selectedFabricItem.resolved_grid_name,
            gridCode: selectedFabricItem.resolved_grid_code,
            dimensions: `${widthMm}mm (${widthCm}cm) × ${dropMm}mm (${dropCm}cm)`,
            gridPrice: `${gridPrice} (manufacturing cost)`
          });
          usePricingGrid = true;
        }
      }
      
      // Use price per unit for fabric (grid is for manufacturing, not fabric material)
      // Price is stored as price per meter/yard based on user's configured unit system
      const pricePerUnit = selectedFabricItem.price_per_meter || 
                          selectedFabricItem.unit_price || 
                          selectedFabricItem.selling_price || 
                          0;
      
      // Use price as-is since it's already in user's configured unit (meter or yard)
      // No hardcoded conversion - user enters price in their preferred unit
      fabricCostPerUnit = pricePerUnit;
      
      if (!usePricingGrid) {
        console.log('ℹ️ Using pricing method for fabric:', {
          pricingMethod,
          pricePerUnit,
          userFabricUnit: units.fabric,
          hasGridInfo: !!(selectedFabricItem.price_group && selectedFabricItem.product_category)
        });
      }
    }

    // Use the correct fabric amount based on user's unit preference
    const fabricAmount = units.fabric === 'yards' 
      ? fabricUsageResult.yards 
      : fabricUsageResult.meters;
    
    let fabricCost = 0;
    
    // STANDARDIZED: Fabric is ALWAYS priced per linear meter/yard
    // per_sqm removed - fabric industry standard is linear pricing
    // CRITICAL FIX: Multiply by horizontal pieces for railroaded fabric
    const horizontalPieces = fabricUsageResult.horizontalPiecesNeeded || 1;
    const totalFabricToOrder = fabricAmount * horizontalPieces;
    fabricCost = totalFabricToOrder * fabricCostPerUnit;
    
    console.log('🔧 FABRIC PRICING (linear - industry standard):', {
      fabricAmount: `${fabricAmount.toFixed(2)}${units.fabric}`,
      horizontalPieces,
      totalFabricToOrder: `${totalFabricToOrder.toFixed(2)}${units.fabric}`,
      calculation: `${fabricAmount.toFixed(2)} × ${horizontalPieces} = ${totalFabricToOrder.toFixed(2)}`,
      costPerUnit: fabricCostPerUnit.toFixed(2),
      fabricCost: fabricCost.toFixed(2)
    });

    return {
      fabricCost,
      fabricUsage: fabricAmount,  // Linear meters per piece
      fabricUsageUnit: units.fabric as 'yards' | 'meters',
      fabricUsageResult,
      costPerUnit: fabricCostPerUnit
    };
  }, [formData, treatmentTypesData, selectedFabricItem, units.fabric]);

  return result;
};

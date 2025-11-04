// Master Pricing Hook - Combines all pricing calculations

import { useMemo } from 'react';
import { useFabricPricing, type FabricPricingParams } from './useFabricPricing';
import { useOptionPricing, type OptionPricingParams } from './useOptionPricing';
import { calculateLabor, type LaborCalculationParams } from '@/utils/pricing/laborCalculator';

export interface CompletePricingParams extends FabricPricingParams, Omit<OptionPricingParams, 'formData'> {
  laborRate?: number;
  treatmentComplexity?: 'simple' | 'moderate' | 'complex';
}

export interface CompletePricingResult {
  // Fabric
  fabricCost: number;
  fabricUsage: number;
  fabricUsageUnit: string;
  fabricOrientation: string;
  
  // Options
  optionsCost: number;
  optionDetails: Array<{
    name: string;
    cost: number;
    method: string;
    calculation: string;
  }>;
  
  // Labor
  laborCost: number;
  laborHours: number;
  laborBreakdown: {
    baseHours: number;
    complexityHours: number;
    seamHours: number;
  };
  
  // Totals
  totalCost: number;
  subtotal: number;
  
  // Additional info
  warnings: string[];
  seamsRequired: number;
  widthsRequired: number;
  costComparison: any;
}

export const useCompletePricing = (params: CompletePricingParams): CompletePricingResult => {
  const {
    formData,
    treatmentTypesData,
    selectedFabricItem,
    options = [],
    hierarchicalOptions = [],
    windowCoveringPricingMethod,
    laborRate,
    treatmentComplexity = 'moderate'
  } = params;

  // Calculate fabric pricing
  const fabricPricing = useFabricPricing({
    formData,
    treatmentTypesData,
    selectedFabricItem
  });

  // Calculate option pricing
  const optionPricing = useOptionPricing({
    formData,
    options,
    hierarchicalOptions,
    windowCoveringPricingMethod
  });

  // Calculate labor
  const result = useMemo(() => {
    // Get labor rate
    const currentTreatmentType = treatmentTypesData?.find(
      tt => tt.name === formData.treatment_type
    );
    const defaultLaborRate = currentTreatmentType?.labor_rate || 25;
    const customLaborRate = parseFloat(formData.custom_labor_rate) || 0;
    const effectiveLaborRate = laborRate || customLaborRate || defaultLaborRate;

    // Calculate labor cost
    const laborParams: LaborCalculationParams = {
      railWidth: parseFloat(formData.rail_width) || 0,
      drop: parseFloat(formData.drop) || 0,
      fullness: parseFloat(formData.heading_fullness) || 2.5,
      laborRate: effectiveLaborRate,
      seamLaborHours: fabricPricing.fabricUsageResult.seamLaborHours || 0,
      treatmentComplexity
    };

    const laborResult = calculateLabor(laborParams);

    // Calculate totals
    const subtotal = fabricPricing.fabricCost + optionPricing.totalCost;
    const totalCost = subtotal + laborResult.cost;

    return {
      // Fabric
      fabricCost: fabricPricing.fabricCost,
      fabricUsage: fabricPricing.fabricUsage,
      fabricUsageUnit: fabricPricing.fabricUsageUnit,
      fabricOrientation: fabricPricing.fabricUsageResult.fabricOrientation,
      
      // Options
      optionsCost: optionPricing.totalCost,
      optionDetails: optionPricing.optionDetails,
      
      // Labor
      laborCost: laborResult.cost,
      laborHours: laborResult.hours,
      laborBreakdown: laborResult.breakdown,
      
      // Totals
      totalCost,
      subtotal,
      
      // Additional info
      warnings: fabricPricing.fabricUsageResult.warnings || [],
      seamsRequired: fabricPricing.fabricUsageResult.seamsRequired || 0,
      widthsRequired: fabricPricing.fabricUsageResult.widthsRequired || 0,
      costComparison: fabricPricing.fabricUsageResult.costComparison
    };
  }, [
    fabricPricing,
    optionPricing,
    formData,
    treatmentTypesData,
    laborRate,
    treatmentComplexity
  ]);

  return result;
};

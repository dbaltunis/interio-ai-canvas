
import { useState, useEffect, useCallback } from 'react';
import { CalculationResult, DetailedCalculation } from '../types';
import { calculateTotalPrice, formatCurrency } from '../calculationUtils';

interface CalculationBreakdown {
  fabricAmount: string;
  curtainWidthTotal: string;
  fabricDropRequirements: string;
  fabricWidthRequirements: string;
  liningPrice: number;
  manufacturingPrice: number;
  fabricPrice: number;
  leftoversVertical: string;
  leftoversHorizontal: string;
}

export const useCalculatorLogic = (
  formData: any,
  hemConfig: any,
  matchingTemplate: any,
  liningOptions: any[],
  businessSettings: any
) => {
  const [calculation, setCalculation] = useState<(CalculationResult & { details: DetailedCalculation }) | null>(null);
  const [calculationBreakdown, setCalculationBreakdown] = useState<CalculationBreakdown | null>(null);

  useEffect(() => {
    if (formData.railWidth && formData.curtainDrop && formData.fabricWidth && formData.fabricPricePerYard) {
      const calc = calculateTotalPrice(formData, matchingTemplate);
      setCalculation(calc);

      // Enhanced calculations with proper logic
      const railWidth = parseFloat(formData.railWidth) || 0;
      const curtainDrop = parseFloat(formData.curtainDrop) || 0;
      const pooling = parseFloat(formData.curtainPooling) || 0;
      const fabricWidth = parseFloat(formData.fabricWidth) || 0;
      
      // Check if template uses pricing grid (no fullness)
      const isPricingGrid = matchingTemplate?.calculation_method === 'pricing_grid';
      const fullness = isPricingGrid ? 1 : (parseFloat(formData.headingFullness) || 2);
      const quantity = formData.quantity || 1;
      
      // Get actual hem values
      const headerHem = parseFloat(hemConfig.header_hem) || 15;
      const bottomHem = parseFloat(hemConfig.bottom_hem) || 10;
      const sideHem = parseFloat(hemConfig.side_hem) || 5;
      const seamHem = parseFloat(hemConfig.seam_hem) || 3;
      
      // Side hems calculation: Single = 2 sides, Pair = 4 sides total
      const totalSideHems = quantity === 1 ? 2 : 4;
      const totalSideHemWidth = totalSideHems * sideHem;
      
      // Width calculations with hems
      const finishedCurtainWidth = railWidth / quantity; // Each curtain's finished width
      const fabricWidthPerCurtain = (finishedCurtainWidth * fullness) + (2 * sideHem); // Include side hems per curtain
      const totalFabricWidthRequired = fabricWidthPerCurtain * quantity; // Total fabric width needed
      
      // Drop calculations - including all hems
      const totalDropRequired = curtainDrop + pooling + headerHem + bottomHem;
      
      // Calculate how many curtain widths fit across fabric width
      const curtainWidthsPerFabricWidth = Math.floor(fabricWidth / fabricWidthPerCurtain);
      
      // Calculate number of fabric lengths needed
      const fabricLengthsNeeded = Math.ceil(quantity / Math.max(curtainWidthsPerFabricWidth, 1));
      
      // Add seam allowances for joined widths
      let totalSeamAllowance = 0;
      if (curtainWidthsPerFabricWidth < quantity) {
        // Calculate seams needed per curtain
        const seamsPerCurtain = Math.ceil(fabricWidthPerCurtain / fabricWidth) - 1;
        totalSeamAllowance = seamsPerCurtain * quantity * seamHem;
      }
      
      // Total fabric amount including seams
      const totalFabricCm = (fabricLengthsNeeded * totalDropRequired) + totalSeamAllowance;
      
      // Manufacturing price - use business settings labor rate
      const laborRate = businessSettings?.labor_rate || 45;
      const railWidthInMeters = railWidth / 100;
      const manufacturingPrice = railWidthInMeters * laborRate; // Labor rate per linear meter
      
      // Fabric pricing
      const fabricPricePerCm = parseFloat(formData.fabricPricePerYard) / 91.44; // Convert yard to cm
      const fabricPrice = totalFabricCm * fabricPricePerCm;
      
      // Lining calculations
      const liningOption = liningOptions.find(l => l.label === formData.lining);
      const liningPrice = liningOption ? liningOption.price * (totalFabricCm / 100) : 0; // Per meter
      
      // Leftovers calculation
      const fabricUsedWidth = fabricWidthPerCurtain * curtainWidthsPerFabricWidth;
      const leftoverHorizontal = fabricWidth - fabricUsedWidth;
      const leftoverVertical = totalDropRequired - curtainDrop - pooling; // Only hem allowances
      
      setCalculationBreakdown({
        fabricAmount: `${totalFabricCm.toFixed(0)} cm`,
        curtainWidthTotal: `${curtainWidthsPerFabricWidth} Drops (${curtainWidthsPerFabricWidth > 0 ? (fabricWidthPerCurtain * curtainWidthsPerFabricWidth / 100).toFixed(2) : '0.00'}m)`,
        fabricDropRequirements: `${totalDropRequired.toFixed(0)} cm`,
        fabricWidthRequirements: `${totalFabricWidthRequired.toFixed(0)} cm`,
        liningPrice: liningPrice,
        manufacturingPrice: manufacturingPrice,
        fabricPrice: fabricPrice,
        leftoversVertical: `${leftoverVertical.toFixed(2)} cm`,
        leftoversHorizontal: `${leftoverHorizontal.toFixed(2)} cm`
      });
    } else {
      // Clear calculations when required fields are empty
      setCalculationBreakdown(null);
    }
  }, [formData, matchingTemplate, liningOptions, hemConfig, businessSettings]);

  return {
    calculation,
    calculationBreakdown
  };
};

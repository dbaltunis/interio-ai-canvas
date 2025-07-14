
import { useMemo } from 'react';
import { usePricingGrid } from '@/hooks/usePricingGrids';
import { getPriceFromGrid } from '@/hooks/usePricingGrids';

export const useCalculatorLogic = (
  formData: any,
  hemConfig: any,
  matchingTemplate: any,
  liningOptions: any[],
  businessSettings: any,
  gridData?: any // Add gridData parameter
) => {
  const { railWidth, curtainDrop, quantity, headingFullness } = formData;

  const calculation = useMemo(() => {
    if (!railWidth || !curtainDrop || !quantity) {
      return null;
    }

    const parsedRailWidth = parseFloat(railWidth);
    const parsedCurtainDrop = parseFloat(curtainDrop);
    const parsedQuantity = parseInt(quantity);
    const parsedHeadingFullness = parseFloat(headingFullness || "1");

    if (isNaN(parsedRailWidth) || isNaN(parsedCurtainDrop) || isNaN(parsedQuantity)) {
      return null;
    }

    console.log("=== CALCULATION DEBUG START ===");
    console.log("Calculator input values (in cm from form):", {
      railWidth: parsedRailWidth,
      curtainDrop: parsedCurtainDrop,
      quantity: parsedQuantity
    });

    const headerHem = hemConfig?.header_hem || 0;
    const bottomHem = hemConfig?.bottom_hem || 0;
    const pooling = parseFloat(formData.curtainPooling || "0");

    // All calculations in centimeters - DO NOT convert to meters
    const fabricDropRequirements = parsedCurtainDrop + pooling + headerHem + bottomHem;
    const fabricWidthRequirements = parsedRailWidth * parsedHeadingFullness;
    
    // Fabric amount in square centimeters
    const fabricAmountCm2 = fabricWidthRequirements * fabricDropRequirements;
    // Convert to square meters for pricing (divide by 10000)
    const fabricAmountM2 = fabricAmountCm2 / 10000;

    console.log("Fabric calculations:", {
      fabricDropRequirements: fabricDropRequirements + "cm",
      fabricWidthRequirements: fabricWidthRequirements + "cm", 
      fabricAmountCm2: fabricAmountCm2 + "cm²",
      fabricAmountM2: fabricAmountM2 + "m²"
    });

    // Calculate lining price (per square meter)
    const liningType = liningOptions.find(l => l.value === formData.lining);
    const liningPricePerMeter = liningType?.price || 0;
    const liningPrice = liningPricePerMeter * fabricAmountM2;

    // Calculate fabric price
    const fabricPricePerYard = parseFloat(formData.fabricPricePerYard || "0");
    // Convert square meters to yards (1 yard = 0.9144 meters)
    const fabricPricePerM2 = fabricPricePerYard / 0.9144;
    const fabricPrice = fabricAmountM2 * fabricPricePerM2;

    console.log("Fabric pricing:", {
      fabricPricePerYard,
      fabricPricePerM2,
      fabricAmountM2,
      fabricPrice
    });

    // Calculate manufacturing/makeup cost based on template method
    let manufacturingPrice = 0;
    
    if (matchingTemplate?.calculation_method === 'pricing_grid') {
      // Use pricing grid for manufacturing cost
      const pricingGridId = matchingTemplate.pricing_grid_id || 
                           matchingTemplate.calculation_rules?.selectedPricingGrid;
      
      if (pricingGridId && gridData) {
        // Pass the values directly as they're already in the correct units (cm)
        manufacturingPrice = getPriceFromGrid(
          gridData.grid_data, 
          parsedRailWidth, 
          parsedCurtainDrop
        );
        console.log("Manufacturing price from pricing grid:", {
          pricingGridId,
          railWidth: parsedRailWidth + "cm",
          curtainDrop: parsedCurtainDrop + "cm",
          manufacturingPrice: "£" + manufacturingPrice
        });
      } else {
        console.log("No pricing grid data available for manufacturing cost");
      }
    } else if (matchingTemplate?.calculation_rules?.baseMakingCost) {
      // Use template-based making cost
      const baseCost = parseFloat(matchingTemplate.calculation_rules.baseMakingCost.toString()) || 0;
      if (matchingTemplate.pricing_unit === 'per-linear-meter') {
        const runningLinearMeters = fabricWidthRequirements / 100; // Convert cm to meters
        manufacturingPrice = baseCost * runningLinearMeters;
      } else {
        manufacturingPrice = baseCost;
      }
    } else {
      // Use business settings labor rate
      const laborRate = parseFloat(businessSettings?.labor_rate?.toString() || "45");
      const runningLinearMeters = fabricWidthRequirements / 100; // Convert cm to meters
      manufacturingPrice = laborRate * runningLinearMeters;
    }

    const fabricWidth = parseFloat(formData.fabricWidth || "0");
    const verticalRepeat = parseFloat(formData.verticalRepeat || "0");
    const horizontalRepeat = parseFloat(formData.horizontalRepeat || "0");

    const leftoversVertical = verticalRepeat > 0 ? fabricDropRequirements % verticalRepeat : 0;
    const leftoversHorizontal = horizontalRepeat > 0 ? fabricWidth % horizontalRepeat : 0;

    const finalCalculation = {
      fabricCost: fabricPrice,
      laborCost: manufacturingPrice,
      featuresCost: liningPrice,
      subtotal: fabricPrice + manufacturingPrice + liningPrice,
      total: (fabricPrice + manufacturingPrice + liningPrice) * parsedQuantity,
      details: {
        railWidth: parsedRailWidth,
        curtainDrop: parsedCurtainDrop,
        fabricDropRequirements: fabricDropRequirements,
        fabricWidthRequirements: fabricWidthRequirements,
        fabricAmount: fabricAmountM2, // Store in square meters for display
        fabricPricePerYard,
        liningPricePerMeter,
        headerHem,
        bottomHem,
        fabricWidth,
        verticalRepeat,
        horizontalRepeat,
        leftoversVertical,
        leftoversHorizontal,
        manufacturingMethod: matchingTemplate?.calculation_method,
        pricingGridUsed: matchingTemplate?.calculation_method === 'pricing_grid'
      }
    };

    console.log("Final calculation result:", finalCalculation);
    console.log("=== CALCULATION DEBUG END ===");

    return finalCalculation;
  }, [
    formData,
    hemConfig,
    matchingTemplate,
    liningOptions,
    businessSettings,
    gridData // Add gridData as dependency
  ]);

  const calculationBreakdown = useMemo(() => {
    if (!calculation) return null;

    // Safely convert to numbers and apply toFixed
    const safeToFixed = (value: any, decimals: number = 2): string => {
      const numValue = parseFloat(value) || 0;
      return numValue.toFixed(decimals);
    };

    return {
      fabricAmount: safeToFixed(calculation.details.fabricAmount), // This is now in m²
      curtainWidthTotal: safeToFixed(calculation.details.fabricWidthRequirements),
      fabricDropRequirements: safeToFixed(calculation.details.fabricDropRequirements),
      fabricWidthRequirements: safeToFixed(calculation.details.fabricWidthRequirements),
      liningPrice: calculation.featuresCost,
      manufacturingPrice: calculation.laborCost,
      fabricPrice: calculation.fabricCost,
      leftoversVertical: calculation.details.leftoversVertical,
      leftoversHorizontal: calculation.details.leftoversHorizontal
    };
  }, [calculation]);

  return { calculation, calculationBreakdown };
};

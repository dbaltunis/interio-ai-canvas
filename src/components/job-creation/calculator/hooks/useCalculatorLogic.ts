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

    const headerHem = hemConfig?.header_hem || 0;
    const bottomHem = hemConfig?.bottom_hem || 0;
    const pooling = parseFloat(formData.curtainPooling || "0");

    const fabricDropRequirements = parsedCurtainDrop + pooling + headerHem + bottomHem;
    const fabricWidthRequirements = parsedRailWidth * parsedHeadingFullness;
    const fabricAmount = fabricWidthRequirements * fabricDropRequirements;

    // Calculate lining price
    const liningType = liningOptions.find(l => l.value === formData.lining);
    const liningPricePerMeter = liningType?.price || 0;
    const liningPrice = liningPricePerMeter * (fabricAmount / 10000);

    // Calculate fabric price
    const fabricPricePerYard = parseFloat(formData.fabricPricePerYard || "0");
    const fabricPrice = (fabricAmount / 10000) * (fabricPricePerYard / 0.9144);

    // Calculate manufacturing/makeup cost based on template method
    let manufacturingPrice = 0;
    
    if (matchingTemplate?.calculation_method === 'pricing_grid') {
      // Use pricing grid for manufacturing cost
      const pricingGridId = matchingTemplate.pricing_grid_id || 
                           matchingTemplate.calculation_rules?.selectedPricingGrid;
      
      if (pricingGridId && gridData) {
        manufacturingPrice = getPriceFromGrid(
          gridData.grid_data, 
          parsedRailWidth, 
          parsedCurtainDrop
        );
        console.log("Manufacturing price from pricing grid:", {
          pricingGridId,
          railWidth,
          curtainDrop,
          manufacturingPrice
        });
      }
    } else if (matchingTemplate?.calculation_rules?.baseMakingCost) {
      // Use template-based making cost
      const baseCost = parseFloat(matchingTemplate.calculation_rules.baseMakingCost.toString()) || 0;
      if (matchingTemplate.pricing_unit === 'per-linear-meter') {
        const runningLinearMeters = fabricWidthRequirements / 100;
        manufacturingPrice = baseCost * runningLinearMeters;
      } else {
        manufacturingPrice = baseCost;
      }
    } else {
      // Use business settings labor rate
      const laborRate = parseFloat(businessSettings?.labor_rate?.toString() || "45");
      const runningLinearMeters = fabricWidthRequirements / 100;
      manufacturingPrice = laborRate * runningLinearMeters;
    }

    const fabricWidth = parseFloat(formData.fabricWidth || "0");
    const verticalRepeat = parseFloat(formData.verticalRepeat || "0");
    const horizontalRepeat = parseFloat(formData.horizontalRepeat || "0");

    const leftoversVertical = fabricDropRequirements % verticalRepeat;
    const leftoversHorizontal = fabricWidth % horizontalRepeat;

    return {
      fabricCost: fabricPrice,
      laborCost: manufacturingPrice, // Use the calculated manufacturing price
      featuresCost: liningPrice,
      subtotal: fabricPrice + manufacturingPrice + liningPrice,
      total: (fabricPrice + manufacturingPrice + liningPrice) * parsedQuantity,
      details: {
        railWidth: parsedRailWidth,
        curtainDrop: parsedCurtainDrop,
        fabricDropRequirements,
        fabricWidthRequirements,
        fabricAmount,
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

    return {
      fabricAmount: calculation.details.fabricAmount.toFixed(2),
      curtainWidthTotal: calculation.details.fabricWidthRequirements.toFixed(2),
      fabricDropRequirements: calculation.details.fabricDropRequirements.toFixed(2),
      fabricWidthRequirements: calculation.details.fabricWidthRequirements.toFixed(2),
      liningPrice: calculation.featuresCost,
      manufacturingPrice: calculation.laborCost,
      fabricPrice: calculation.fabricCost,
      leftoversVertical: calculation.details.leftoversVertical,
      leftoversHorizontal: calculation.details.leftoversHorizontal
    };
  }, [calculation]);

  return { calculation, calculationBreakdown };
};

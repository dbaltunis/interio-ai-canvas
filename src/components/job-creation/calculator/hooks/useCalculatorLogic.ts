
import { useMemo } from 'react';
import { usePricingGrid } from '@/hooks/usePricingGrids';
import { getPriceFromGrid } from '@/hooks/usePricingGrids';

export const useCalculatorLogic = (
  formData: any,
  hemConfig: any,
  matchingTemplate: any,
  liningOptions: any[],
  businessSettings: any,
  gridData?: any
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
    console.log("🔢 Input values from form (all in CM):", {
      railWidth: parsedRailWidth + "cm",
      curtainDrop: parsedCurtainDrop + "cm", 
      quantity: parsedQuantity,
      headingFullness: parsedHeadingFullness
    });

    const headerHem = hemConfig?.header_hem || 15;
    const bottomHem = hemConfig?.bottom_hem || 10;
    const pooling = parseFloat(formData.curtainPooling || "0");

    // Calculate fabric requirements (all in CM)
    const fabricDropCm = parsedCurtainDrop + pooling + headerHem + bottomHem;
    const fabricWidthCm = parsedRailWidth * parsedHeadingFullness;
    
    console.log("📏 Fabric requirements calculation:", {
      curtainDrop: parsedCurtainDrop + "cm",
      pooling: pooling + "cm", 
      headerHem: headerHem + "cm",
      bottomHem: bottomHem + "cm",
      totalFabricDrop: fabricDropCm + "cm",
      railWidth: parsedRailWidth + "cm",
      headingFullness: parsedHeadingFullness,
      totalFabricWidth: fabricWidthCm + "cm"
    });

    // Convert to square meters for fabric pricing
    const fabricDropM = fabricDropCm / 100;
    const fabricWidthM = fabricWidthCm / 100;
    const fabricAmountM2 = fabricDropM * fabricWidthM;

    console.log("📐 Fabric amount in square meters:", {
      fabricDropM: fabricDropM + "m",
      fabricWidthM: fabricWidthM + "m", 
      fabricAmountM2: fabricAmountM2 + "m²"
    });

    // Calculate lining price (per square meter)
    const liningType = liningOptions.find(l => l.value === formData.lining);
    const liningPricePerM2 = liningType?.price || 0;
    const liningPrice = liningPricePerM2 * fabricAmountM2;

    console.log("🧵 Lining calculation:", {
      liningType: liningType?.label || "None",
      liningPricePerM2: "£" + liningPricePerM2 + "/m²",
      fabricAmountM2: fabricAmountM2 + "m²",
      totalLiningPrice: "£" + liningPrice
    });

    // Calculate fabric price
    const fabricPricePerYard = parseFloat(formData.fabricPricePerYard || "0");
    // Convert price per yard to price per square meter
    // 1 yard = 0.9144 meters, so 1 square yard = 0.836 square meters
    const fabricPricePerM2 = fabricPricePerYard / 0.836;
    const fabricPrice = fabricAmountM2 * fabricPricePerM2;

    console.log("🧶 Fabric price calculation:", {
      fabricPricePerYard: "£" + fabricPricePerYard + "/yard",
      fabricPricePerM2: "£" + fabricPricePerM2.toFixed(2) + "/m²",
      fabricAmountM2: fabricAmountM2 + "m²",
      totalFabricPrice: "£" + fabricPrice.toFixed(2)
    });

    // Calculate manufacturing/makeup cost
    let manufacturingPrice = 0;
    
    if (matchingTemplate?.calculation_method === 'pricing_grid') {
      const pricingGridId = matchingTemplate.pricing_grid_id || 
                           matchingTemplate.calculation_rules?.selectedPricingGrid;
      
      if (pricingGridId && gridData) {
        // Use the CM values directly for grid lookup
        manufacturingPrice = getPriceFromGrid(
          gridData.grid_data, 
          parsedRailWidth, 
          parsedCurtainDrop
        );
        console.log("🏭 Manufacturing price from pricing grid:", {
          pricingGridId,
          railWidthCm: parsedRailWidth + "cm",
          curtainDropCm: parsedCurtainDrop + "cm", 
          manufacturingPrice: "£" + manufacturingPrice
        });
      } else {
        console.log("❌ No pricing grid data available");
      }
    } else if (matchingTemplate?.calculation_rules?.baseMakingCost) {
      const baseCost = parseFloat(matchingTemplate.calculation_rules.baseMakingCost.toString()) || 0;
      if (matchingTemplate.pricing_unit === 'per-linear-meter') {
        manufacturingPrice = baseCost * fabricWidthM;
      } else {
        manufacturingPrice = baseCost;
      }
      console.log("🏭 Manufacturing price from template:", {
        baseCost: "£" + baseCost,
        method: matchingTemplate.pricing_unit,
        manufacturingPrice: "£" + manufacturingPrice
      });
    } else {
      const laborRate = parseFloat(businessSettings?.labor_rate?.toString() || "45");
      manufacturingPrice = laborRate * fabricWidthM;
      console.log("🏭 Manufacturing price from labor rate:", {
        laborRate: "£" + laborRate + "/m",
        fabricWidthM: fabricWidthM + "m",
        manufacturingPrice: "£" + manufacturingPrice
      });
    }

    // Pattern repeat calculations
    const fabricWidth = parseFloat(formData.fabricWidth || "137");
    const verticalRepeat = parseFloat(formData.verticalRepeat || "0");
    const horizontalRepeat = parseFloat(formData.horizontalRepeat || "0");

    const leftoversVertical = verticalRepeat > 0 ? fabricDropCm % verticalRepeat : 0;
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
        fabricDropRequirements: fabricDropCm,
        fabricWidthRequirements: fabricWidthCm,
        fabricAmount: fabricAmountM2,
        fabricPricePerYard,
        liningPricePerMeter: liningPricePerM2,
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

    console.log("✅ FINAL CALCULATION RESULT:", {
      fabricCost: "£" + fabricPrice.toFixed(2),
      laborCost: "£" + manufacturingPrice.toFixed(2),
      featuresCost: "£" + liningPrice.toFixed(2),
      subtotal: "£" + finalCalculation.subtotal.toFixed(2),
      total: "£" + finalCalculation.total.toFixed(2)
    });
    console.log("=== CALCULATION DEBUG END ===");

    return finalCalculation;
  }, [
    formData,
    hemConfig,
    matchingTemplate,
    liningOptions,
    businessSettings,
    gridData
  ]);

  const calculationBreakdown = useMemo(() => {
    if (!calculation) return null;

    const safeToFixed = (value: any, decimals: number = 2): string => {
      const numValue = parseFloat(value) || 0;
      return numValue.toFixed(decimals);
    };

    return {
      fabricAmount: safeToFixed(calculation.details.fabricAmount, 2),
      curtainWidthTotal: safeToFixed(calculation.details.fabricWidthRequirements / 100, 2), // Convert to meters for display
      fabricDropRequirements: safeToFixed(calculation.details.fabricDropRequirements, 0), // Keep in cm
      fabricWidthRequirements: safeToFixed(calculation.details.fabricWidthRequirements, 0), // Keep in cm
      liningPrice: calculation.featuresCost,
      manufacturingPrice: calculation.laborCost,
      fabricPrice: calculation.fabricCost,
      leftoversVertical: calculation.details.leftoversVertical,
      leftoversHorizontal: calculation.details.leftoversHorizontal
    };
  }, [calculation]);

  return { calculation, calculationBreakdown };
};


import { useMemo } from 'react';
import { getPriceFromGrid } from '@/hooks/usePricingGrids';

export const useCalculatorLogic = (
  formData: any,
  hemConfig: any,
  matchingTemplate: any,
  liningOptions: any[],
  businessSettings: any,
  gridData?: any
) => {
  const { railWidth, curtainDrop, quantity, headingFullness, fabricWidth, fabricPricePerYard } = formData;

  const calculation = useMemo(() => {
    if (!railWidth || !curtainDrop || !quantity) {
      return null;
    }

    const parsedRailWidth = parseFloat(railWidth);
    const parsedCurtainDrop = parseFloat(curtainDrop);
    const parsedQuantity = parseInt(quantity);
    const parsedHeadingFullness = parseFloat(headingFullness || "2.5");
    const parsedFabricWidth = parseFloat(fabricWidth || "137");
    const parsedFabricPricePerYard = parseFloat(fabricPricePerYard || "0");

    if (isNaN(parsedRailWidth) || isNaN(parsedCurtainDrop) || isNaN(parsedQuantity)) {
      return null;
    }

    console.log("=== CALCULATION DEBUG START ===");
    console.log("🔢 Input values:", {
      railWidth: parsedRailWidth + "cm",
      curtainDrop: parsedCurtainDrop + "cm", 
      quantity: parsedQuantity,
      headingFullness: parsedHeadingFullness,
      fabricWidth: parsedFabricWidth + "cm",
      fabricPricePerYard: "£" + parsedFabricPricePerYard
    });

    // Calculate hem allowances
    const headerHem = hemConfig?.header_hem || 15;
    const bottomHem = hemConfig?.bottom_hem || 10;
    const pooling = parseFloat(formData.curtainPooling || "0");

    // Calculate fabric requirements
    const totalFabricDrop = parsedCurtainDrop + pooling + headerHem + bottomHem;
    const totalFabricWidth = parsedRailWidth * parsedHeadingFullness;
    
    console.log("📏 Fabric requirements:", {
      curtainDrop: parsedCurtainDrop + "cm",
      pooling: pooling + "cm",
      headerHem: headerHem + "cm",
      bottomHem: bottomHem + "cm",
      totalFabricDrop: totalFabricDrop + "cm",
      railWidth: parsedRailWidth + "cm",
      headingFullness: parsedHeadingFullness,
      totalFabricWidth: totalFabricWidth + "cm"
    });

    // Calculate how many fabric widths are needed
    const dropsPerWidth = Math.floor(parsedFabricWidth / (parsedRailWidth / parsedQuantity));
    const widthsRequired = Math.ceil(parsedQuantity / Math.max(dropsPerWidth, 1));
    
    // Total fabric length needed in cm
    const totalFabricLengthCm = widthsRequired * totalFabricDrop;
    
    // Convert to yards (1 yard = 91.44 cm)
    const totalFabricYards = totalFabricLengthCm / 91.44;
    
    console.log("🧮 Fabric calculation:", {
      dropsPerWidth: dropsPerWidth,
      widthsRequired: widthsRequired,
      totalFabricLengthCm: totalFabricLengthCm + "cm",
      totalFabricYards: totalFabricYards.toFixed(2) + " yards"
    });

    // Calculate fabric cost
    const fabricCost = totalFabricYards * parsedFabricPricePerYard;

    // Calculate lining cost
    const liningType = liningOptions.find(l => l.value === formData.lining);
    const liningPricePerYard = liningType?.price || 0;
    const liningCost = liningPricePerYard * totalFabricYards;

    console.log("🧵 Lining calculation:", {
      liningType: liningType?.label || "None",
      liningPricePerYard: "£" + liningPricePerYard + "/yard",
      totalFabricYards: totalFabricYards.toFixed(2) + " yards",
      totalLiningCost: "£" + liningCost.toFixed(2)
    });

    // Calculate manufacturing/makeup cost
    let manufacturingCost = 0;
    
    if (matchingTemplate?.calculation_method === 'pricing_grid') {
      const pricingGridId = matchingTemplate.pricing_grid_id || 
                           matchingTemplate.calculation_rules?.selectedPricingGrid;
      
      if (pricingGridId && gridData) {
        manufacturingCost = getPriceFromGrid(
          gridData.grid_data, 
          parsedRailWidth, 
          parsedCurtainDrop
        );
        console.log("🏭 Manufacturing cost from pricing grid:", {
          pricingGridId,
          railWidth: parsedRailWidth + "cm",
          curtainDrop: parsedCurtainDrop + "cm",
          manufacturingCost: "£" + manufacturingCost
        });
      }
    } else if (matchingTemplate?.calculation_rules?.baseMakingCost) {
      const baseCost = parseFloat(matchingTemplate.calculation_rules.baseMakingCost.toString()) || 0;
      
      if (matchingTemplate.pricing_unit === 'per-linear-meter') {
        // Cost per linear meter of rail width
        manufacturingCost = baseCost * (parsedRailWidth / 100) * parsedQuantity;
      } else {
        // Fixed cost per unit
        manufacturingCost = baseCost * parsedQuantity;
      }
      
      // Apply height surcharges if configured
      if (matchingTemplate.calculation_rules?.useHeightSurcharges) {
        const baseHeightLimit = parseFloat(matchingTemplate.calculation_rules.baseHeightLimit) || 240;
        if (parsedCurtainDrop > baseHeightLimit) {
          const heightSurcharge = parseFloat(matchingTemplate.calculation_rules.heightSurcharge1) || 0;
          manufacturingCost += heightSurcharge * parsedQuantity;
        }
      }
      
      console.log("🏭 Manufacturing cost from template:", {
        baseCost: "£" + baseCost,
        pricingUnit: matchingTemplate.pricing_unit,
        railWidth: parsedRailWidth + "cm",
        quantity: parsedQuantity,
        manufacturingCost: "£" + manufacturingCost
      });
    } else {
      // Fallback to labor rate calculation
      const laborRate = parseFloat(businessSettings?.labor_rate?.toString() || "45");
      const baseHours = 2;
      const sewingHours = (parsedRailWidth * parsedCurtainDrop * parsedHeadingFullness) / 25000;
      const totalHours = baseHours + sewingHours;
      manufacturingCost = totalHours * laborRate * parsedQuantity;
      
      console.log("🏭 Manufacturing cost from labor calculation:", {
        laborRate: "£" + laborRate + "/hour",
        baseHours: baseHours,
        sewingHours: sewingHours.toFixed(2),
        totalHours: totalHours.toFixed(2),
        quantity: parsedQuantity,
        manufacturingCost: "£" + manufacturingCost
      });
    }

    const subtotal = fabricCost + manufacturingCost + liningCost;
    const total = subtotal;

    const finalCalculation = {
      fabricCost: fabricCost,
      laborCost: manufacturingCost,
      featuresCost: liningCost,
      subtotal: subtotal,
      total: total,
      details: {
        railWidth: parsedRailWidth,
        curtainDrop: parsedCurtainDrop,
        fabricDropRequirements: totalFabricDrop,
        fabricWidthRequirements: totalFabricWidth,
        fabricYards: totalFabricYards,
        widthsRequired: widthsRequired,
        dropsPerWidth: dropsPerWidth,
        fabricPricePerYard: parsedFabricPricePerYard,
        liningPricePerYard: liningPricePerYard,
        headerHem,
        bottomHem,
        pooling,
        fabricWidth: parsedFabricWidth,
        manufacturingMethod: matchingTemplate?.calculation_method,
        pricingGridUsed: matchingTemplate?.calculation_method === 'pricing_grid'
      }
    };

    console.log("✅ FINAL CALCULATION RESULT:", {
      fabricCost: "£" + fabricCost.toFixed(2),
      manufacturingCost: "£" + manufacturingCost.toFixed(2),
      liningCost: "£" + liningCost.toFixed(2),
      subtotal: "£" + subtotal.toFixed(2),
      total: "£" + total.toFixed(2),
      fabricYards: totalFabricYards.toFixed(2) + " yards"
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
      fabricAmount: safeToFixed(calculation.details.fabricYards, 2),
      curtainWidthTotal: safeToFixed(calculation.details.fabricWidthRequirements, 0),
      fabricDropRequirements: safeToFixed(calculation.details.fabricDropRequirements, 0),
      fabricWidthRequirements: safeToFixed(calculation.details.fabricWidthRequirements, 0),
      liningPrice: calculation.featuresCost,
      manufacturingPrice: calculation.laborCost,
      fabricPrice: calculation.fabricCost,
      widthsRequired: calculation.details.widthsRequired,
      dropsPerWidth: calculation.details.dropsPerWidth,
      fabricYards: calculation.details.fabricYards
    };
  }, [calculation]);

  return { calculation, calculationBreakdown };
};

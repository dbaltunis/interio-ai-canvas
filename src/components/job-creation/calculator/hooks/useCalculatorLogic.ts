
import { useMemo } from 'react';
import { getPriceFromGrid } from '@/hooks/usePricingGrids';
import { useMeasurementUnits } from '@/hooks/useMeasurementUnits';
import { useCalculationFormulas } from '@/hooks/useCalculationFormulas';
import { CalculationService } from '@/services/calculationService';

export const useCalculatorLogic = (
  formData: any,
  hemConfig: any,
  matchingTemplate: any,
  liningOptions: any[],
  businessSettings: any,
  gridData?: any
) => {
  const { railWidth, curtainDrop, quantity, headingFullness, fabricWidth, fabricPricePerYard } = formData;
  const { units, convertToUserUnit, formatLength, formatFabric } = useMeasurementUnits();
  const { data: formulas = [] } = useCalculationFormulas();

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
    console.log("🔢 Input values from form:", {
      railWidth: parsedRailWidth + "cm",
      curtainDrop: parsedCurtainDrop + "cm", 
      quantity: parsedQuantity,
      headingFullness: parsedHeadingFullness,
      fabricWidth: parsedFabricWidth + "cm",
      fabricPricePerYard: "£" + parsedFabricPricePerYard,
      templateName: matchingTemplate?.name,
      productType: matchingTemplate?.product_type,
      formulasAvailable: formulas.length
    });

    // Use formula-based calculation if formulas are available
    if (formulas.length > 0) {
      const calculationService = new CalculationService();
      
      const input = {
        railWidth: parsedRailWidth,
        curtainDrop: parsedCurtainDrop,
        quantity: parsedQuantity,
        headingFullness: parsedHeadingFullness,
        fabricWidth: parsedFabricWidth,
        fabricPricePerYard: parsedFabricPricePerYard,
        curtainPooling: parseFloat(formData.curtainPooling || "0"),
        treatmentType: matchingTemplate?.name?.toLowerCase() || 'curtain',
        labor_rate: businessSettings?.labor_rate || 85,
        // Add hem configuration
        header_hem: hemConfig?.header_hem || 15,
        bottom_hem: hemConfig?.bottom_hem || 10,
        // Add track pricing
        track_price_per_meter: 25,
        bracket_price: 5,
        glider_price: 0.15
      };

      const result = calculationService.calculateTreatmentCost(input, formulas);
      
      console.log("🧮 Formula-based calculation result:", {
        fabricCost: "£" + result.fabricCost.toFixed(2),
        laborCost: "£" + result.laborCost.toFixed(2),
        hardwareCost: "£" + result.hardwareCost.toFixed(2),
        totalCost: "£" + result.totalCost.toFixed(2),
        fabricYards: result.details.fabricYards?.toFixed(2) + " yards"
      });

      return {
        fabricCost: result.fabricCost,
        laborCost: result.laborCost,
        featuresCost: result.hardwareCost,
        subtotal: result.totalCost,
        total: result.totalCost,
        details: {
          railWidth: parsedRailWidth,
          curtainDrop: parsedCurtainDrop,
          fabricDropRequirements: parsedCurtainDrop + (hemConfig?.header_hem || 15) + (hemConfig?.bottom_hem || 10),
          fabricWidthRequirements: parsedRailWidth * parsedHeadingFullness,
          fabricYards: result.details.fabricYards || 0,
          widthsRequired: Math.ceil((parsedRailWidth * parsedHeadingFullness) / parsedFabricWidth),
          dropsPerWidth: 1,
          fabricPricePerYard: parsedFabricPricePerYard,
          liningPricePerYard: liningOptions.find(l => l.value === formData.lining)?.price || 0,
          headerHem: hemConfig?.header_hem || 0,
          bottomHem: hemConfig?.bottom_hem || 0,
          pooling: parseFloat(formData.curtainPooling || "0"),
          fabricWidth: parsedFabricWidth,
          manufacturingMethod: 'formula-based',
          pricingGridUsed: false,
          isBlind: matchingTemplate?.name?.toLowerCase().includes('blind'),
          treatmentType: matchingTemplate?.name?.toLowerCase().includes('blind') ? 'blind' : 'curtain',
          formulaBreakdown: {
            fabric: result.breakdown.fabric.breakdown,
            labor: result.breakdown.labor.breakdown,
            hardware: result.breakdown.hardware.breakdown
          }
        }
      };
    }

    // Fall back to original calculation logic if no formulas available
    console.log("⚠️ No formulas available, using original calculation logic");
    
    const treatmentName = matchingTemplate?.name?.toLowerCase() || '';
    const isBlind = treatmentName.includes('blind') || matchingTemplate?.product_type?.toLowerCase().includes('blind');
    
    console.log("🎯 Treatment type detection:", {
      treatmentName,
      productType: matchingTemplate?.product_type,
      isBlind
    });

    // Calculate fabric requirements based on treatment type
    let totalFabricYards = 0;
    let fabricCalculationDetails = "";

    if (isBlind) {
      // For blinds: fabric area = width × drop (no fullness, minimal waste)
      const fabricAreaCm = parsedRailWidth * parsedCurtainDrop;
      const fabricAreaYards = fabricAreaCm / (91.44 * 91.44); // Convert cm² to yards²
      totalFabricYards = fabricAreaYards * parsedQuantity;
      
      fabricCalculationDetails = `Blind: ${parsedRailWidth}cm × ${parsedCurtainDrop}cm = ${fabricAreaCm}cm² per blind × ${parsedQuantity} = ${totalFabricYards.toFixed(2)} yards`;
    } else {
      // For curtains: use traditional curtain calculation
      const headerHem = hemConfig?.header_hem || 15;
      const bottomHem = hemConfig?.bottom_hem || 10;
      const pooling = parseFloat(formData.curtainPooling || "0");
      
      const fabricDropWithAllowances = parsedCurtainDrop + pooling + headerHem + bottomHem;
      const curtainWidthPerPanel = parsedRailWidth / parsedQuantity;
      const fabricWidthRequiredPerPanel = curtainWidthPerPanel * parsedHeadingFullness;
      
      const fabricWidthsNeededPerPanel = Math.ceil(fabricWidthRequiredPerPanel / parsedFabricWidth);
      const totalFabricLengthCm = fabricDropWithAllowances * fabricWidthsNeededPerPanel * parsedQuantity;
      totalFabricYards = totalFabricLengthCm / 91.44;
      
      fabricCalculationDetails = `Curtains: ${parsedRailWidth}cm ÷ ${parsedQuantity} panels × ${parsedHeadingFullness} fullness = ${fabricWidthRequiredPerPanel.toFixed(0)}cm width needed. Drop: ${parsedCurtainDrop}cm + allowances = ${fabricDropWithAllowances}cm. Total: ${totalFabricYards.toFixed(2)} yards`;
    }

    console.log("📏 Fabric calculation:", {
      isBlind,
      totalFabricYards: totalFabricYards.toFixed(2),
      fabricCalculationDetails
    });

    // Calculate fabric cost using user's preferred fabric units
    const fabricCost = totalFabricYards * parsedFabricPricePerYard;

    // Calculate lining cost (only for curtains, not blinds)
    let liningCost = 0;
    if (!isBlind) {
      const liningType = liningOptions.find(l => l.value === formData.lining);
      const liningPricePerYard = liningType?.price || 0;
      liningCost = liningPricePerYard * totalFabricYards;
    }

    console.log("🧵 Lining calculation:", {
      isBlind,
      liningCost: "£" + liningCost.toFixed(2)
    });

    // Calculate manufacturing/makeup cost - RESPECT TEMPLATE SETTINGS ONLY
    let manufacturingCost = 0;
    
    if (matchingTemplate?.calculation_method === 'pricing_grid') {
      const pricingGridId = matchingTemplate.pricing_grid_id || 
                           matchingTemplate.calculation_rules?.selectedPricingGrid;
      
      if (pricingGridId && gridData) {
        console.log("🎯 Using pricing grid with exact measurements:");
        console.log("  Width:", parsedRailWidth + "cm");
        console.log("  Drop:", parsedCurtainDrop + "cm");
        
        const gridPrice = getPriceFromGrid(
          gridData.grid_data, 
          parsedRailWidth,
          parsedCurtainDrop
        );
        
        manufacturingCost = gridPrice * parsedQuantity;
        
        console.log("🏭 Manufacturing cost from pricing grid:", {
          gridPrice: "£" + gridPrice,
          quantity: parsedQuantity,
          totalManufacturingCost: "£" + manufacturingCost.toFixed(2)
        });
      }
    } else if (matchingTemplate?.calculation_rules?.baseMakingCost) {
      const baseCost = parseFloat(matchingTemplate.calculation_rules.baseMakingCost.toString()) || 0;
      
      if (matchingTemplate.pricing_unit === 'per-linear-meter') {
        manufacturingCost = baseCost * (parsedRailWidth / 100) * parsedQuantity;
      } else {
        manufacturingCost = baseCost * parsedQuantity;
      }
      
      console.log("🏭 Manufacturing cost from template rules:", {
        baseCost: "£" + baseCost,
        manufacturingCost: "£" + manufacturingCost.toFixed(2)
      });
    } else {
      // Only use fallback if no template settings exist
      const laborRate = parseFloat(businessSettings?.labor_rate?.toString() || "45");
      const estimatedHours = isBlind ? 1.5 : 3; // Blinds take less time than curtains
      manufacturingCost = estimatedHours * laborRate * parsedQuantity;
      
      console.log("🏭 Fallback manufacturing cost:", {
        laborRate: "£" + laborRate + "/hour",
        estimatedHours,
        manufacturingCost: "£" + manufacturingCost.toFixed(2)
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
        fabricDropRequirements: isBlind ? parsedCurtainDrop : parsedCurtainDrop + (hemConfig?.header_hem || 15) + (hemConfig?.bottom_hem || 10),
        fabricWidthRequirements: isBlind ? parsedRailWidth : parsedRailWidth * parsedHeadingFullness,
        fabricYards: totalFabricYards,
        widthsRequired: isBlind ? 1 : Math.ceil((parsedRailWidth * parsedHeadingFullness) / parsedFabricWidth),
        dropsPerWidth: 1,
        fabricPricePerYard: parsedFabricPricePerYard,
        liningPricePerYard: liningOptions.find(l => l.value === formData.lining)?.price || 0,
        headerHem: hemConfig?.header_hem || 0,
        bottomHem: hemConfig?.bottom_hem || 0,
        pooling: parseFloat(formData.curtainPooling || "0"),
        fabricWidth: parsedFabricWidth,
        manufacturingMethod: matchingTemplate?.calculation_method || 'legacy',
        pricingGridUsed: matchingTemplate?.calculation_method === 'pricing_grid',
        isBlind,
        treatmentType: isBlind ? 'blind' : 'curtain',
        formulaBreakdown: {
          fabric: `Legacy calculation: ${fabricCalculationDetails}`,
          labor: `Legacy labor: £${manufacturingCost.toFixed(2)} for ${parsedQuantity} ${isBlind ? 'blind(s)' : 'panel(s)'}`,
          hardware: `Legacy lining: £${liningCost.toFixed(2)}`
        }
      }
    };

    console.log("✅ FINAL CALCULATION RESULT:", {
      fabricCost: "£" + fabricCost.toFixed(2),
      manufacturingCost: "£" + manufacturingCost.toFixed(2),
      liningCost: "£" + liningCost.toFixed(2),
      total: "£" + total.toFixed(2),
      fabricYards: totalFabricYards.toFixed(2) + " yards",
      treatmentType: isBlind ? 'blind' : 'curtain'
    });
    console.log("=== CALCULATION DEBUG END ===");

    return finalCalculation;
  }, [
    formData,
    hemConfig,
    matchingTemplate,
    liningOptions,
    businessSettings,
    gridData,
    units,
    formulas
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
      fabricYards: calculation.details.fabricYards,
      treatmentType: calculation.details.treatmentType,
      formulaBreakdown: calculation.details.formulaBreakdown
    };
  }, [calculation]);

  return { calculation, calculationBreakdown };
};

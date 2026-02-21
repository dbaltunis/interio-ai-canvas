/**
 * Clean Blind Cost Calculator
 * Calculates costs for blinds with proper sqm calculations including hems and waste
 * Uses centralized defaults from blindCalculationDefaults.ts
 */

import { getPriceFromGrid } from '@/hooks/usePricingGrids';
import { getBlindHemDefaults, calculateBlindSqm, logBlindCalculation } from '@/utils/blindCalculationDefaults';
import { isManufacturedItem, inferCategoryFromName } from '@/utils/treatmentTypeUtils';
import { hasValidPricingGrid, getGridMarkup } from '@/utils/pricing/gridValidation';

interface OptionDetail {
  name: string;
  value?: string; // Extracted value from "Key: Value" format for quote display
  label?: string; // CRITICAL: Explicit label for description extraction in quotes
  cost: number;
  pricingMethod: string;
  orderIndex?: number; // CRITICAL: Per-template ordering from template_option_settings
}

interface BlindCalculationResult {
  squareMeters: number;
  fabricCost: number;
  manufacturingCost: number;
  optionsCost: number;
  optionDetails: OptionDetail[]; // Individual option costs for consistent save
  totalCost: number;
  displayText: string;
  widthCalcNote?: string;
  heightCalcNote?: string;
}

export const calculateBlindCosts = (
  widthCm: number,
  heightCm: number,
  template: any,
  fabricItem: any,
  selectedOptions: Array<{ name: string; price?: number; pricingMethod?: string; optionKey?: string; pricingGridData?: any; label?: string; orderIndex?: number }> = [],
  measurements?: Record<string, any>,
  fabricItem2?: any  // Optional second fabric for double roller/blind configurations
): BlindCalculationResult => {

  // Check for double configuration (Roman blinds - two blinds on one headrail)
  const isDoubleConfig = measurements?.curtain_type === 'double';
  // When two different fabrics are provided, each covers one blind (no multiplier for fabric)
  const hasDualFabrics = isDoubleConfig && !!fabricItem2;
  const blindMultiplier = isDoubleConfig ? 2 : 1;
  
  // Get hem defaults from centralized source - template settings take priority
  const hems = getBlindHemDefaults(template);
  
  // Calculate sqm using centralized function
  const blindCalc = calculateBlindSqm(widthCm, heightCm, hems);
  const squareMetersPerBlind = blindCalc.sqm;
  // Total square meters (doubled if double configuration)
  const squareMeters = squareMetersPerBlind * blindMultiplier;
  
  // Log calculation for debugging
  logBlindCalculation('blindCostCalculator', widthCm, heightCm, hems, blindCalc);
  
  console.log('📐 Blind Configuration:', {
    isDoubleConfig,
    blindMultiplier,
    hems,
    effectiveDimensions: `${blindCalc.effectiveWidthCm}cm × ${blindCalc.effectiveHeightCm}cm`,
    squareMetersPerBlind: squareMetersPerBlind.toFixed(2),
    totalSquareMeters: squareMeters.toFixed(2)
  });
  
  // Get fabric price per sqm - FABRIC GRIDS ARE FOR FABRIC COST ONLY, NOT MANUFACTURING
  let fabricPricePerSqm = 0;
  let fabricCost = 0;
  let gridMarkupPercentage = 0;  // ✅ FIX #2: Track grid markup for application
  
  // UNIVERSAL RULE FOR ALL SAAS CLIENTS: Fabric pricing grids = TOTAL PRODUCT PRICE
  // This applies to ALL blind types (Roller, Venetian, Vertical, Cellular, etc.) across ALL accounts
  // CRITICAL: Fabric pricing grids contain the COMPLETE price (fabric + manufacturing combined)
  // ✅ CRITICAL FIX: Use shared hasValidPricingGrid utility for consistent validation across codebase
  const fabricHasPricingGrid = hasValidPricingGrid(fabricItem?.pricing_grid_data);
  
  if (fabricHasPricingGrid) {
    // ✅ FIX: Capture grid markup for pass-through (NOT applied here - applied in display/save layer)
    gridMarkupPercentage = fabricItem?.pricing_grid_markup ?? 0;

    // UNIVERSAL: Fabric pricing grid = TOTAL PRODUCT PRICE (not just fabric cost)
    // Works for ALL blind types and ALL SaaS client accounts automatically
    const totalGridPrice = getPriceFromGrid(fabricItem.pricing_grid_data, widthCm, heightCm);

    // Apply trade/supplier discount if set on the grid
    const gridDiscountPercent = fabricItem?.pricing_grid_discount || 0;
    const discountedGridPrice = gridDiscountPercent > 0
      ? totalGridPrice * (1 - gridDiscountPercent / 100)
      : totalGridPrice;

    // ✅ CRITICAL FIX: Do NOT apply grid markup here!
    // Markup should be applied consistently in ONE place: the display/save layer

    if (hasDualFabrics) {
      // DUAL FABRIC: Each fabric covers one blind. Fabric 1 grid price + Fabric 2 grid/unit price.
      const fabric2HasGrid = hasValidPricingGrid(fabricItem2?.pricing_grid_data);
      let fabric2Cost = 0;
      if (fabric2HasGrid) {
        const grid2Total = getPriceFromGrid(fabricItem2.pricing_grid_data, widthCm, heightCm);
        const discount2 = fabricItem2?.pricing_grid_discount || 0;
        fabric2Cost = discount2 > 0 ? grid2Total * (1 - discount2 / 100) : grid2Total;
      } else {
        const f2Price = fabricItem2?.cost_price || fabricItem2?.price_per_sqm || fabricItem2?.selling_price || 0;
        fabric2Cost = squareMetersPerBlind * f2Price;
      }
      fabricCost = discountedGridPrice + fabric2Cost; // one blind each
    } else {
      // Single fabric (or same fabric for both blinds): multiply by blindMultiplier
      fabricCost = discountedGridPrice * blindMultiplier;
    }

    fabricPricePerSqm = squareMeters > 0 ? fabricCost / squareMeters : 0;

    console.log('✅ UNIVERSAL FABRIC GRID (ALL CLIENTS, ALL BLIND TYPES):', {
      blindType: template?.treatment_category || 'unknown',
      gridName: fabricItem.resolved_grid_name,
      gridCode: fabricItem.resolved_grid_code,
      dimensions: `${widthCm}cm × ${heightCm}cm`,
      hasDualFabrics,
      blindMultiplier,
      totalFabricCost: fabricCost,
    });
  } else {
    // No grid - use per-unit pricing for fabric only
    // ✅ CRITICAL FIX: Use cost_price as BASE when available to prevent double-markup
    const hasCostPrice = fabricItem?.cost_price && fabricItem?.cost_price > 0;
    const hasSellingPrice = fabricItem?.selling_price && fabricItem?.selling_price > 0;

    // Use cost_price as base when available (markup will be applied later)
    fabricPricePerSqm = hasCostPrice
      ? fabricItem.cost_price
      : (fabricItem?.price_per_sqm ||
         fabricItem?.price ||
         fabricItem?.price_per_meter ||
         fabricItem?.unit_price ||
         fabricItem?.selling_price ||
         0);

    if (fabricPricePerSqm === 0) {
      console.error('⚠️ PRICE IS ZERO! No valid price found on material:', {
        materialName: fabricItem?.name,
        materialId: fabricItem?.id,
        cost_price: fabricItem?.cost_price,
        selling_price: fabricItem?.selling_price,
        hint: 'Please set cost_price and selling_price on this inventory item'
      });
    }

    if (hasDualFabrics) {
      // DUAL FABRIC: Each fabric covers one blind
      const f2Price = fabricItem2?.cost_price || fabricItem2?.price_per_sqm ||
                      fabricItem2?.price || fabricItem2?.price_per_meter ||
                      fabricItem2?.unit_price || fabricItem2?.selling_price || 0;
      fabricCost = (squareMetersPerBlind * fabricPricePerSqm) + (squareMetersPerBlind * f2Price);
    } else {
      fabricCost = squareMeters * fabricPricePerSqm; // squareMeters already includes blindMultiplier
    }

    if (hasCostPrice && hasSellingPrice) {
      const impliedMarkup = ((fabricItem.selling_price - fabricItem.cost_price) / fabricItem.cost_price) * 100;
      console.log('💰 [LIBRARY PRICING] Using cost_price as base:', {
        cost_price: fabricItem.cost_price,
        selling_price: fabricItem.selling_price,
        impliedMarkup: `${impliedMarkup.toFixed(1)}%`,
        hasDualFabrics,
      });
    }

    console.log('ℹ️ Per-unit fabric pricing (no grid):', {
      blindType: template?.treatment_category || 'unknown',
      fabricPricePerSqm,
      squareMeters: squareMeters.toFixed(2),
      hasDualFabrics,
      blindMultiplier,
      fabricCost: fabricCost.toFixed(2)
    });
  }
  
  // UNIVERSAL RULE: Manufacturing cost calculation for ALL SaaS clients
  // If fabric has pricing grid → manufacturing = 0 (already included)
  // If no fabric grid → use template manufacturing pricing (fallback)
  let manufacturingCost = 0;
  
  if (fabricHasPricingGrid) {
    // UNIVERSAL: Fabric grid includes manufacturing - DON'T double-count
    manufacturingCost = 0;
    console.log('✅ Manufacturing = 0 (included in fabric grid) - ALL CLIENTS, ALL BLIND TYPES');
  } else if (template?.pricing_type === 'pricing_grid' && template?.pricing_grid_data) {
    // Fallback: Template manufacturing grid (when fabric has no grid)
    // Apply multiplier for double configuration
    const singleManufacturingCost = getPriceFromGrid(template.pricing_grid_data, widthCm, heightCm);
    manufacturingCost = singleManufacturingCost * blindMultiplier;
    console.log('✅ Template manufacturing grid (fallback):', {
      blindType: template?.treatment_category || 'unknown',
      singleManufacturingCost,
      blindMultiplier,
      totalManufacturingCost: manufacturingCost
    });
  } else if (template?.machine_price_per_panel) {
    manufacturingCost = template.machine_price_per_panel * blindMultiplier;
  } else if (template?.unit_price) {
    manufacturingCost = squareMeters * template.unit_price * 0.5; // 50% for labor (squareMeters already includes multiplier)
  }
  
  // Calculate options cost - consider pricing method for each option
  // CRITICAL: Filter out lining options for blinds - they don't use lining
  // ✅ Also track individual option costs for consistent saving
  console.log('💰 Calculating options cost, selectedOptions:', selectedOptions);
  
  const optionDetails: OptionDetail[] = [];
  
  const optionsCost = selectedOptions
    .filter(opt => {
      // Filter out lining options for blind treatments
      const isLiningOption = opt.name?.toLowerCase().includes('lining');
      if (isLiningOption) {
        console.log(`⚠️ Skipping lining option for blind: ${opt.name}`);
        return false;
      }
      // Include options with price > 0 OR pricing-grid method (grid price calculated separately)
      return (opt.price && opt.price > 0) || (opt.pricingMethod === 'pricing-grid' && opt.pricingGridData);
    })
    .reduce((sum, opt) => {
      const basePrice = opt.price || 0;
      let calculatedCost = 0;
      let usedMethod = opt.pricingMethod || 'fixed';
      
      // Check pricing method
      if (opt.pricingMethod === 'per-meter') {
        // Price per meter of width
        calculatedCost = basePrice * (widthCm / 100);
        console.log(`💰 Option "${opt.name}" pricing:`, {
          method: 'per-meter',
          basePrice,
          widthCm,
          widthMeters: (widthCm / 100).toFixed(2),
          calculatedPrice: calculatedCost.toFixed(2)
        });
      } else if (opt.pricingMethod === 'per-sqm') {
        // Price per square meter
        calculatedCost = basePrice * squareMeters;
        console.log(`💰 Option "${opt.name}" pricing:`, {
          method: 'per-sqm',
          basePrice,
          squareMeters: squareMeters.toFixed(2),
          calculatedPrice: calculatedCost.toFixed(2)
        });
      } else if (opt.pricingMethod === 'pricing-grid' && opt.pricingGridData) {
        usedMethod = 'pricing-grid';
        // Check if it's a simple width-only array format
        if (Array.isArray(opt.pricingGridData) && opt.pricingGridData.length > 0 && 'width' in opt.pricingGridData[0]) {
          // Simple width-based pricing: [{ width: 60, price: 300 }, ...]
          const widthValues = opt.pricingGridData.map((entry: any) => parseInt(entry.width));
          const closestWidth = widthValues.reduce((prev: number, curr: number) => {
            return Math.abs(curr - widthCm) < Math.abs(prev - widthCm) ? curr : prev;
          });
          const matchingEntry = opt.pricingGridData.find((entry: any) => parseInt(entry.width) === closestWidth);
          calculatedCost = matchingEntry ? parseFloat(matchingEntry.price) : 0;
          
          console.log(`💰 Option "${opt.name}" pricing:`, {
            method: 'pricing-grid (width-based)',
            requestedWidth: widthCm + 'cm',
            closestWidth: closestWidth + 'cm',
            gridPrice: calculatedCost.toFixed(2)
          });
        } else {
          // Full 2D pricing grid with width and drop
          calculatedCost = getPriceFromGrid(opt.pricingGridData, widthCm, heightCm);
          console.log(`💰 Option "${opt.name}" pricing:`, {
            method: 'pricing-grid (2D)',
            dimensions: `${widthCm}cm × ${heightCm}cm`,
            gridPrice: calculatedCost.toFixed(2)
          });
        }
      } else if (opt.pricingMethod === 'per-panel') {
        // Per-panel pricing for blinds - multiplied by blind count
        calculatedCost = basePrice * blindMultiplier;
        console.log(`💰 Option "${opt.name}" pricing:`, {
          method: 'per-panel',
          basePrice,
          blindMultiplier,
          calculatedPrice: calculatedCost.toFixed(2)
        });
      } else {
        // Fixed price (default)
        calculatedCost = basePrice;
        console.log(`💰 Option "${opt.name}" pricing:`, {
          method: opt.pricingMethod || 'fixed (default)',
          price: basePrice
        });
      }
      
      // ✅ Store calculated cost for each option with extracted value for quote display
      // UNIVERSAL: Extract value from "Key: Value" format (e.g., "Control Type: Centre tilt only")
      const optionName = opt.name || 'Unknown Option';
      let extractedName = optionName;
      let extractedValue = '';
      
      if (optionName.includes(':')) {
        const colonIndex = optionName.indexOf(':');
        extractedName = optionName.substring(0, colonIndex).trim();
        extractedValue = optionName.substring(colonIndex + 1).trim();
      }
      
      optionDetails.push({
        name: extractedName,
        value: extractedValue || opt.optionKey || undefined,
        label: opt.label || extractedValue || undefined, // CRITICAL: Pass through explicit label
        cost: calculatedCost,
        pricingMethod: usedMethod,
        orderIndex: opt.orderIndex // CRITICAL: Pass through order_index for sorting
      });
      
      return sum + calculatedCost;
    }, 0);
  
  // Total cost
  const totalCost = fabricCost + manufacturingCost + optionsCost;
  
  // Display text (show multiplier if double)
  const displayText = hasDualFabrics
    ? `${squareMetersPerBlind.toFixed(2)} sqm × 2 fabrics (dual roller)`
    : isDoubleConfig
      ? `${squareMeters.toFixed(2)} sqm (2 blinds) × ${fabricPricePerSqm.toFixed(2)}/sqm`
      : `${squareMeters.toFixed(2)} sqm × ${fabricPricePerSqm.toFixed(2)}/sqm`;
  
  console.log('🧮 Blind Cost Calculation:', {
    dimensions: `${widthCm}cm × ${heightCm}cm`,
    configuration: isDoubleConfig ? 'Double (2 blinds)' : 'Single',
    blindMultiplier,
    hems,
    effectiveDimensions: `${blindCalc.effectiveWidthCm}cm × ${blindCalc.effectiveHeightCm}cm`,
    squareMeters: squareMeters.toFixed(2),
    fabricPricePerSqm,
    fabricCost: fabricCost.toFixed(2),
    manufacturingCost: manufacturingCost.toFixed(2),
    optionsCost: optionsCost.toFixed(2),
    totalCost: totalCost.toFixed(2)
  });
  
  return {
    squareMeters,
    fabricCost,
    manufacturingCost,
    optionsCost,
    optionDetails, // ✅ Include individual option costs for consistent save
    totalCost,
    displayText,
    widthCalcNote: blindCalc.widthCalcNote,
    heightCalcNote: blindCalc.heightCalcNote
  };
};

/**
 * Check if category is a blind/shutter (manufactured item)
 * Uses centralized treatmentTypeUtils for consistent detection across codebase
 */
export const isBlindCategory = (category: string, templateName?: string): boolean => {
  // Check category first using centralized utility
  if (isManufacturedItem(category)) return true;

  // Fallback: infer from template name if category check fails
  if (templateName) {
    const inferredCategory = inferCategoryFromName(templateName);
    if (inferredCategory && isManufacturedItem(inferredCategory)) return true;
  }

  return false;
};

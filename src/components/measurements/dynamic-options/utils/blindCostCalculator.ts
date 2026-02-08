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
  measurements?: Record<string, any>
): BlindCalculationResult => {
  
  // Check for double configuration (Roman blinds - two blinds on one headrail)
  const isDoubleConfig = measurements?.curtain_type === 'double';
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
    // ✅ FIX #2: Capture grid markup from enriched fabric
    gridMarkupPercentage = fabricItem?.pricing_grid_markup || 0;
    
    // UNIVERSAL: Fabric pricing grid = TOTAL PRODUCT PRICE (not just fabric cost)
    // Works for ALL blind types and ALL SaaS client accounts automatically
    const totalGridPrice = getPriceFromGrid(fabricItem.pricing_grid_data, widthCm, heightCm);
    
    // ✅ FIX #2: Apply grid markup percentage if set
    const markupMultiplier = gridMarkupPercentage > 0 ? (1 + gridMarkupPercentage / 100) : 1;
    const priceWithMarkup = totalGridPrice * markupMultiplier;
    
    // For double configuration, multiply the grid price by 2 (two blinds)
    fabricCost = priceWithMarkup * blindMultiplier;
    fabricPricePerSqm = squareMeters > 0 ? fabricCost / squareMeters : 0;
    
    console.log('✅ UNIVERSAL FABRIC GRID (ALL CLIENTS, ALL BLIND TYPES):', {
      blindType: template?.treatment_category || 'unknown',
      gridName: fabricItem.resolved_grid_name,
      gridCode: fabricItem.resolved_grid_code,
      dimensions: `${widthCm}cm × ${heightCm}cm`,
      baseGridPrice: totalGridPrice,
      gridMarkupPercentage,
      markupMultiplier,
      priceWithMarkup,
      blindMultiplier,
      totalFabricCost: fabricCost,
      note: 'Grid price = TOTAL product price (fabric + manufacturing) - applies to ALL SaaS clients'
    });
  } else {
    // No grid - use per-unit pricing for fabric only (already uses total squareMeters which includes multiplier)
    // ✅ CRITICAL FIX: Use cost_price as BASE when available to prevent double-markup
    // The markup system will apply the correct markup (implied from cost vs selling difference)
    // Priority: cost_price > price_per_sqm > price > price_per_meter > unit_price > selling_price
    const hasCostPrice = fabricItem?.cost_price && fabricItem?.cost_price > 0;
    const hasSellingPrice = fabricItem?.selling_price && fabricItem?.selling_price > 0;
    
    // Use cost_price as base when available (markup will be applied later)
    fabricPricePerSqm = hasCostPrice 
      ? fabricItem.cost_price
      : (fabricItem?.price_per_sqm ||      // For sqm-based pricing
         fabricItem?.price ||              // Base inventory_items field
         fabricItem?.price_per_meter || 
         fabricItem?.unit_price || 
         fabricItem?.selling_price ||
         0);
    
    // If price is still 0, log error for debugging
    if (fabricPricePerSqm === 0) {
      console.error('⚠️ PRICE IS ZERO! No valid price found on material:', {
        materialName: fabricItem?.name,
        materialId: fabricItem?.id,
        cost_price: fabricItem?.cost_price,
        selling_price: fabricItem?.selling_price,
        price: fabricItem?.price,
        price_per_sqm: fabricItem?.price_per_sqm,
        price_per_meter: fabricItem?.price_per_meter,
        unit_price: fabricItem?.unit_price,
        hint: 'Please set cost_price and selling_price on this inventory item'
      });
    }
    
    fabricCost = squareMeters * fabricPricePerSqm;
    
    // ✅ Log when using cost_price as base (markup will be applied in CostCalculationSummary)
    if (hasCostPrice && hasSellingPrice) {
      const impliedMarkup = ((fabricItem.selling_price - fabricItem.cost_price) / fabricItem.cost_price) * 100;
      console.log('💰 [LIBRARY PRICING] Using cost_price as base:', {
        cost_price: fabricItem.cost_price,
        selling_price: fabricItem.selling_price,
        impliedMarkup: `${impliedMarkup.toFixed(1)}%`,
        note: 'Markup will be applied in display layer'
      });
    }
    
    console.log('ℹ️ Per-unit fabric pricing (no grid):', {
      blindType: template?.treatment_category || 'unknown',
      fabricPricePerSqm,
      priceSource: hasCostPrice ? 'cost_price' :
                   fabricItem?.price_per_sqm ? 'price_per_sqm' :
                   fabricItem?.price ? 'price' :
                   fabricItem?.price_per_meter ? 'price_per_meter' :
                   fabricItem?.unit_price ? 'unit_price' : 
                   fabricItem?.selling_price ? 'selling_price' : 'none',
      squareMeters: squareMeters.toFixed(2),
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
  const displayText = isDoubleConfig 
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

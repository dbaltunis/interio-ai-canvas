/**
 * Clean Blind Cost Calculator
 * Calculates costs for blinds with proper sqm calculations including hems and waste
 * Uses centralized defaults from blindCalculationDefaults.ts
 */

import { getPriceFromGrid } from '@/hooks/usePricingGrids';
import { getBlindHemDefaults, calculateBlindSqm, logBlindCalculation } from '@/utils/blindCalculationDefaults';

interface BlindCalculationResult {
  squareMeters: number;
  fabricCost: number;
  manufacturingCost: number;
  optionsCost: number;
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
  selectedOptions: Array<{ name: string; price?: number; pricingMethod?: string; optionKey?: string; pricingGridData?: any }> = [],
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
  
  // UNIVERSAL RULE FOR ALL SAAS CLIENTS: Fabric pricing grids = TOTAL PRODUCT PRICE
  // This applies to ALL blind types (Roller, Venetian, Vertical, Cellular, etc.) across ALL accounts
  // CRITICAL: Fabric pricing grids contain the COMPLETE price (fabric + manufacturing combined)
  const fabricHasPricingGrid = fabricItem?.pricing_grid_data && fabricItem?.resolved_grid_name;
  
  if (fabricHasPricingGrid) {
    // UNIVERSAL: Fabric pricing grid = TOTAL PRODUCT PRICE (not just fabric cost)
    // Works for ALL blind types and ALL SaaS client accounts automatically
    const totalGridPrice = getPriceFromGrid(fabricItem.pricing_grid_data, widthCm, heightCm);
    // For double configuration, multiply the grid price by 2 (two blinds)
    fabricCost = totalGridPrice * blindMultiplier;
    fabricPricePerSqm = squareMeters > 0 ? fabricCost / squareMeters : 0;
    
    console.log('✅ UNIVERSAL FABRIC GRID (ALL CLIENTS, ALL BLIND TYPES):', {
      blindType: template?.treatment_category || 'unknown',
      gridName: fabricItem.resolved_grid_name,
      gridCode: fabricItem.resolved_grid_code,
      dimensions: `${widthCm}cm × ${heightCm}cm`,
      singleBlindGridPrice: totalGridPrice,
      blindMultiplier,
      totalFabricCost: fabricCost,
      note: 'Grid price = TOTAL product price (fabric + manufacturing) - applies to ALL SaaS clients'
    });
  } else {
    // No grid - use per-unit pricing for fabric only (already uses total squareMeters which includes multiplier)
    fabricPricePerSqm = fabricItem?.selling_price || fabricItem?.price_per_meter || fabricItem?.unit_price || 0;
    fabricCost = squareMeters * fabricPricePerSqm;
    
    console.log('ℹ️ Per-unit fabric pricing (no grid):', {
      blindType: template?.treatment_category || 'unknown',
      fabricPricePerSqm,
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
  console.log('💰 Calculating options cost, selectedOptions:', selectedOptions);
  
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
      
      // Check pricing method
      if (opt.pricingMethod === 'per-meter') {
        // Price per meter of width
        const priceForWidth = basePrice * (widthCm / 100);
        console.log(`💰 Option "${opt.name}" pricing:`, {
          method: 'per-meter',
          basePrice,
          widthCm,
          widthMeters: (widthCm / 100).toFixed(2),
          calculatedPrice: priceForWidth.toFixed(2)
        });
        return sum + priceForWidth;
      } else if (opt.pricingMethod === 'per-sqm') {
        // Price per square meter
        const priceForArea = basePrice * squareMeters;
        console.log(`💰 Option "${opt.name}" pricing:`, {
          method: 'per-sqm',
          basePrice,
          squareMeters: squareMeters.toFixed(2),
          calculatedPrice: priceForArea.toFixed(2)
        });
        return sum + priceForArea;
      } else if (opt.pricingMethod === 'pricing-grid' && opt.pricingGridData) {
        // Check if it's a simple width-only array format
        if (Array.isArray(opt.pricingGridData) && opt.pricingGridData.length > 0 && 'width' in opt.pricingGridData[0]) {
          // Simple width-based pricing: [{ width: 60, price: 300 }, ...]
          const widthValues = opt.pricingGridData.map((entry: any) => parseInt(entry.width));
          const closestWidth = widthValues.reduce((prev: number, curr: number) => {
            return Math.abs(curr - widthCm) < Math.abs(prev - widthCm) ? curr : prev;
          });
          const matchingEntry = opt.pricingGridData.find((entry: any) => parseInt(entry.width) === closestWidth);
          const gridPrice = matchingEntry ? parseFloat(matchingEntry.price) : 0;
          
          console.log(`💰 Option "${opt.name}" pricing:`, {
            method: 'pricing-grid (width-based)',
            requestedWidth: widthCm + 'cm',
            closestWidth: closestWidth + 'cm',
            gridPrice: gridPrice.toFixed(2)
          });
          return sum + gridPrice;
        } else {
          // Full 2D pricing grid with width and drop
          const gridPrice = getPriceFromGrid(opt.pricingGridData, widthCm, heightCm);
          console.log(`💰 Option "${opt.name}" pricing:`, {
            method: 'pricing-grid (2D)',
            dimensions: `${widthCm}cm × ${heightCm}cm`,
            gridPrice: gridPrice.toFixed(2)
          });
          return sum + gridPrice;
        }
      } else {
        // Fixed price (default)
        console.log(`💰 Option "${opt.name}" pricing:`, {
          method: opt.pricingMethod || 'fixed (default)',
          price: basePrice
        });
        return sum + basePrice;
      }
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
    totalCost,
    displayText,
    widthCalcNote: blindCalc.widthCalcNote,
    heightCalcNote: blindCalc.heightCalcNote
  };
};

export const isBlindCategory = (category: string, templateName?: string): boolean => {
  const categoryLower = category.toLowerCase();
  const nameLower = (templateName || '').toLowerCase();
  return categoryLower.includes('blind') || 
         categoryLower.includes('shade') ||
         nameLower.includes('blind') ||
         nameLower.includes('shade');
};

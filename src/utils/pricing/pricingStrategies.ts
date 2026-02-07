// Pricing Strategy Pattern - All pricing methods in one place

import { getPriceFromGrid } from '@/hooks/usePricingGrids';

export type PricingMethod = 
  | 'fixed'
  | 'per-unit'
  | 'per-panel'
  | 'per-drop'
  | 'per-meter'
  | 'per-metre'
  | 'per-linear-meter'
  | 'per-yard'
  | 'per-linear-yard'
  | 'per-sqm'
  | 'per-square-meter'
  | 'percentage'
  | 'inherit'
  | 'pricing-grid';

export interface PricingContext {
  baseCost: number;
  railWidth: number; // CRITICAL: in MM (database storage unit)
  drop: number; // CRITICAL: in MM (database storage unit)
  quantity: number;
  /** REQUIRED for panel calculations - must come from template, no fallback */
  fullness: number | null;
  /** REQUIRED for panel calculations - must come from fabric inventory, no fallback */
  fabricWidth: number | null;
  fabricCost?: number;
  fabricUsage?: number;
  pricingGridData?: any; // CRITICAL: For pricing-grid method
  windowCoveringPricingMethod?: PricingMethod;
  currencySymbol?: string; // CRITICAL: From user settings, not hardcoded
}

export interface PricingResult {
  cost: number;
  calculation: string;
  breakdown?: {
    units?: number;
    unitCost?: number;
    multiplier?: number;
  };
  /** Error if required configuration is missing */
  error?: string;
}

// Core pricing calculator - single source of truth
export const calculatePrice = (
  method: PricingMethod,
  context: PricingContext
): PricingResult => {
  const {
    baseCost,
    railWidth,
    drop,
    quantity,
    fullness, // NO DEFAULT - must be provided or calculation fails for methods that need it
    fabricWidth, // NO DEFAULT - must be provided or calculation fails for methods that need it
    fabricCost = 0,
    fabricUsage = 0,
    currencySymbol = '$' // Fallback currency symbol - acceptable for display
  } = context;

  switch (method) {
    case 'fixed':
      return {
        cost: baseCost * quantity,
        calculation: `Fixed: ${currencySymbol}${baseCost.toFixed(2)} × ${quantity} = ${currencySymbol}${(baseCost * quantity).toFixed(2)}`
      };

    case 'per-unit':
      return {
        cost: baseCost * quantity,
        calculation: `${currencySymbol}${baseCost.toFixed(2)} × ${quantity} units = ${currencySymbol}${(baseCost * quantity).toFixed(2)}`,
        breakdown: { units: quantity, unitCost: baseCost, multiplier: 1 }
      };

    case 'per-panel': {
      // CRITICAL: Validate required fields - fail loud if missing
      if (fullness == null) {
        console.error('[PRICING] per-panel calculation requires fullness ratio - not configured in template');
        return {
          cost: 0,
          calculation: 'ERROR: Fullness ratio not configured in template',
          error: 'fullness_required'
        };
      }
      if (fabricWidth == null) {
        console.error('[PRICING] per-panel calculation requires fabric width - not configured in inventory');
        return {
          cost: 0,
          calculation: 'ERROR: Fabric width not configured in inventory',
          error: 'fabric_width_required'
        };
      }
      const panelsNeeded = Math.ceil((railWidth * fullness) / (fabricWidth * 10)); // CRITICAL: railWidth in MM, fabricWidth in CM
      const cost = baseCost * panelsNeeded * quantity;
      return {
        cost,
        calculation: `${currencySymbol}${baseCost.toFixed(2)} × ${panelsNeeded} panels × ${quantity} = ${currencySymbol}${cost.toFixed(2)}`,
        breakdown: { units: panelsNeeded, unitCost: baseCost, multiplier: quantity }
      };
    }

    case 'per-drop':
      return {
        cost: baseCost * quantity,
        calculation: `${currencySymbol}${baseCost.toFixed(2)} per drop × ${quantity} = ${currencySymbol}${(baseCost * quantity).toFixed(2)}`,
        breakdown: { units: quantity, unitCost: baseCost, multiplier: 1 }
      };

    case 'per-meter':
    case 'per-metre':
    case 'per-linear-meter': {
      const widthInMeters = railWidth / 1000; // CRITICAL: Convert MM to M
      const cost = baseCost * widthInMeters * quantity;
      return {
        cost,
        calculation: `${currencySymbol}${baseCost.toFixed(2)} × ${widthInMeters.toFixed(2)}m × ${quantity} = ${currencySymbol}${cost.toFixed(2)}`,
        breakdown: { units: widthInMeters, unitCost: baseCost, multiplier: quantity }
      };
    }

    case 'per-yard':
    case 'per-linear-yard': {
      const widthInYards = railWidth / 914.4; // CRITICAL: Convert MM to yards
      const cost = baseCost * widthInYards * quantity;
      return {
        cost,
        calculation: `${currencySymbol}${baseCost.toFixed(2)} × ${widthInYards.toFixed(2)} yards × ${quantity} = ${currencySymbol}${cost.toFixed(2)}`,
        breakdown: { units: widthInYards, unitCost: baseCost, multiplier: quantity }
      };
    }

    case 'per-sqm':
    case 'per-square-meter': {
      const areaInSqm = (railWidth / 1000) * (drop / 1000); // CRITICAL: Convert MM to M
      const cost = baseCost * areaInSqm * quantity;
      return {
        cost,
        calculation: `${currencySymbol}${baseCost.toFixed(2)} × ${areaInSqm.toFixed(2)}m² × ${quantity} = ${currencySymbol}${cost.toFixed(2)}`,
        breakdown: { units: areaInSqm, unitCost: baseCost, multiplier: quantity }
      };
    }

    case 'percentage': {
      const totalFabricCost = fabricCost * fabricUsage;
      const cost = (baseCost / 100) * totalFabricCost;
      return {
        cost,
        calculation: `${baseCost}% × ${currencySymbol}${totalFabricCost.toFixed(2)} fabric = ${currencySymbol}${cost.toFixed(2)}`,
        breakdown: { units: totalFabricCost, unitCost: baseCost / 100, multiplier: 1 }
      };
    }

    case 'inherit':
      // Recursively call with parent method
      if (context.windowCoveringPricingMethod && context.windowCoveringPricingMethod !== 'inherit') {
        return calculatePrice(context.windowCoveringPricingMethod, context);
      }
      // Fallback to fixed if no parent method
      return calculatePrice('fixed', context);

    case 'pricing-grid': {
      // CRITICAL FIX: Actually calculate price from grid based on dimensions
      if (!context.pricingGridData) {
        console.warn('⚠️ pricing-grid method used but no grid data provided');
        return {
          cost: baseCost * quantity,
          calculation: `No grid data - using base: ${currencySymbol}${baseCost.toFixed(2)} × ${quantity}`
        };
      }
      
      try {
        // getPriceFromGrid is imported at the top of the file
        // CRITICAL: railWidth and drop in context are in MM, getPriceFromGrid expects CM
        const widthCm = railWidth / 10; // Convert mm to cm
        const dropCm = drop / 10; // Convert mm to cm
        
        const gridPrice = getPriceFromGrid(context.pricingGridData, widthCm, dropCm);
        
        console.log('📊 OPTION PRICING GRID:', {
          widthMm: railWidth,
          dropMm: drop,
          widthCm,
          dropCm,
          gridPrice,
          quantity
        });
        
        return {
          cost: gridPrice * quantity,
          calculation: `Grid: ${widthCm}cm → ${currencySymbol}${gridPrice.toFixed(2)} × ${quantity}`,
          breakdown: { units: 1, unitCost: gridPrice, multiplier: quantity }
        };
      } catch (error) {
        console.error('❌ Error calculating grid price for option:', error);
        return {
          cost: baseCost * quantity,
          calculation: `Grid error - using base: ${currencySymbol}${baseCost.toFixed(2)} × ${quantity}`
        };
      }
    }

    default:
      return {
        cost: baseCost * quantity,
        calculation: `Default: ${currencySymbol}${baseCost.toFixed(2)} × ${quantity} = ${currencySymbol}${(baseCost * quantity).toFixed(2)}`
      };
  }
};

// Helper to resolve inherited pricing methods
export const resolvePricingMethod = (
  method: PricingMethod,
  parentMethod?: PricingMethod
): PricingMethod => {
  if (method === 'inherit' && parentMethod) {
    return parentMethod === 'inherit' ? 'fixed' : parentMethod;
  }
  return method === 'inherit' ? 'fixed' : method;
};

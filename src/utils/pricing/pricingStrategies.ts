// Pricing Strategy Pattern - All pricing methods in one place

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
  railWidth: number; // in cm
  drop: number; // in cm
  quantity: number;
  fullness?: number;
  fabricWidth?: number;
  fabricCost?: number;
  fabricUsage?: number;
  pricingGridData?: string;
  windowCoveringPricingMethod?: PricingMethod;
}

export interface PricingResult {
  cost: number;
  calculation: string;
  breakdown?: {
    units?: number;
    unitCost?: number;
    multiplier?: number;
  };
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
    fullness = 2.5,
    fabricWidth = 137,
    fabricCost = 0,
    fabricUsage = 0
  } = context;

  switch (method) {
    case 'fixed':
      return {
        cost: baseCost * quantity,
        calculation: `Fixed: £${baseCost.toFixed(2)} × ${quantity} = £${(baseCost * quantity).toFixed(2)}`
      };

    case 'per-unit':
      return {
        cost: baseCost * quantity,
        calculation: `£${baseCost.toFixed(2)} × ${quantity} units = £${(baseCost * quantity).toFixed(2)}`,
        breakdown: { units: quantity, unitCost: baseCost, multiplier: 1 }
      };

    case 'per-panel': {
      const panelsNeeded = Math.ceil((railWidth * fullness) / fabricWidth);
      const cost = baseCost * panelsNeeded * quantity;
      return {
        cost,
        calculation: `£${baseCost.toFixed(2)} × ${panelsNeeded} panels × ${quantity} = £${cost.toFixed(2)}`,
        breakdown: { units: panelsNeeded, unitCost: baseCost, multiplier: quantity }
      };
    }

    case 'per-drop':
      return {
        cost: baseCost * quantity,
        calculation: `£${baseCost.toFixed(2)} per drop × ${quantity} = £${(baseCost * quantity).toFixed(2)}`,
        breakdown: { units: quantity, unitCost: baseCost, multiplier: 1 }
      };

    case 'per-meter':
    case 'per-metre':
    case 'per-linear-meter': {
      const widthInMeters = railWidth / 100;
      const cost = baseCost * widthInMeters * quantity;
      return {
        cost,
        calculation: `£${baseCost.toFixed(2)} × ${widthInMeters.toFixed(2)}m × ${quantity} = £${cost.toFixed(2)}`,
        breakdown: { units: widthInMeters, unitCost: baseCost, multiplier: quantity }
      };
    }

    case 'per-yard':
    case 'per-linear-yard': {
      const widthInYards = railWidth / 91.44;
      const cost = baseCost * widthInYards * quantity;
      return {
        cost,
        calculation: `£${baseCost.toFixed(2)} × ${widthInYards.toFixed(2)} yards × ${quantity} = £${cost.toFixed(2)}`,
        breakdown: { units: widthInYards, unitCost: baseCost, multiplier: quantity }
      };
    }

    case 'per-sqm':
    case 'per-square-meter': {
      const areaInSqm = (railWidth / 100) * (drop / 100);
      const cost = baseCost * areaInSqm * quantity;
      return {
        cost,
        calculation: `£${baseCost.toFixed(2)} × ${areaInSqm.toFixed(2)}m² × ${quantity} = £${cost.toFixed(2)}`,
        breakdown: { units: areaInSqm, unitCost: baseCost, multiplier: quantity }
      };
    }

    case 'percentage': {
      const totalFabricCost = fabricCost * fabricUsage;
      const cost = (baseCost / 100) * totalFabricCost;
      return {
        cost,
        calculation: `${baseCost}% × £${totalFabricCost.toFixed(2)} fabric = £${cost.toFixed(2)}`,
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

    case 'pricing-grid':
      // Pricing grid needs special handling - see pricingGridCalculator
      return {
        cost: 0,
        calculation: 'Use pricing grid calculator for this method'
      };

    default:
      return {
        cost: baseCost * quantity,
        calculation: `Default: £${baseCost.toFixed(2)} × ${quantity} = £${(baseCost * quantity).toFixed(2)}`
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

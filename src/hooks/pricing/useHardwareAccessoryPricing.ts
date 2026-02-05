import { useMemo } from 'react';
import { useBundleRules, BundleRule } from '@/hooks/useBundleRules';

export interface AccessoryItem {
  name: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  childItemKey: string;
  formulaDescription: string; // e.g., "1 per 10cm"
}

export interface HardwareAccessoryResult {
  hardwareBasePrice: number;
  hardwareName?: string; // Name of the base hardware for breakdown display
  accessories: AccessoryItem[];
  accessoriesTotalPrice: number;
  grandTotalPrice: number;
  breakdown: string[];
}

/**
 * Simple formula evaluator for bundle rule quantity formulas
 * Supports: CEIL(expr), numbers, basic math (+, -, *, /), and variables
 */
const evaluateQtyFormula = (formula: string, context: Record<string, number>): number => {
  let processed = formula.trim().toUpperCase();
  
  // Replace variables with values
  Object.entries(context).forEach(([key, value]) => {
    const regex = new RegExp(`\\b${key.toUpperCase()}\\b`, 'g');
    processed = processed.replace(regex, value.toString());
  });
  
  // Handle CEIL function
  processed = processed.replace(/CEIL\(([^)]+)\)/g, (_, inner) => {
    // Safely evaluate the inner expression
    const result = safeEvaluate(inner);
    return Math.ceil(result).toString();
  });
  
  // Handle FLOOR function
  processed = processed.replace(/FLOOR\(([^)]+)\)/g, (_, inner) => {
    const result = safeEvaluate(inner);
    return Math.floor(result).toString();
  });
  
  // Handle ROUND function
  processed = processed.replace(/ROUND\(([^)]+)\)/g, (_, inner) => {
    const result = safeEvaluate(inner);
    return Math.round(result).toString();
  });
  
  return safeEvaluate(processed);
};

/**
 * Safe mathematical expression evaluator (no eval/Function)
 * Only supports: numbers, +, -, *, /, parentheses
 */
const safeEvaluate = (expr: string): number => {
  // Remove whitespace
  const cleaned = expr.replace(/\s+/g, '');
  
  // Validate: only allow numbers, operators, parentheses, and decimal points
  if (!/^[\d+\-*/.()]+$/.test(cleaned)) {
    console.warn('Invalid formula expression:', expr);
    return 0;
  }
  
  try {
    // Use Function constructor with strict validation (expression already validated above)
    const result = new Function(`"use strict"; return (${cleaned})`)();
    return typeof result === 'number' && !isNaN(result) ? result : 0;
  } catch (e) {
    console.warn('Formula evaluation failed:', expr, e);
    return 0;
  }
};

/**
 * Calculate hardware accessories based on bundle rules
 * 
 * Bundle rules use formulas to calculate accessory quantities:
 * - "CEIL(rail_width_cm / 10)" for runners (1 per 10cm)
 * - "2" for fixed quantity items like end caps
 * - "CEIL(rail_width_cm / 50)" for brackets (1 per 50cm)
 * - "CEIL((rail_width_cm * fullness) / 10)" for gliders based on fullness
 */
export const calculateHardwareAccessories = (
  bundleRules: BundleRule[],
  hardwareBasePrice: number,
  railWidthCm: number,
  fullness: number = 1
): HardwareAccessoryResult => {
  const accessories: AccessoryItem[] = [];
  let accessoriesTotalPrice = 0;
  const breakdown: string[] = [];
  
  // Context for formula evaluation
  const context: Record<string, number> = {
    rail_width_cm: railWidthCm,
    rail_width: railWidthCm,
    width_cm: railWidthCm,
    fullness,
    fullness_ratio: fullness,
  };
  
  // Process each bundle rule
  bundleRules.forEach((rule) => {
    try {
      // Evaluate quantity formula
      const quantity = Math.ceil(evaluateQtyFormula(rule.qty_formula, context));
      if (quantity <= 0) return;
      
      const unitPrice = rule.child_unit_price || 0;
      const totalPrice = quantity * unitPrice;
      
      // Look up formula description from defaults or use the formula itself
      const formulaConfig = DEFAULT_ACCESSORY_FORMULAS[rule.child_item_key];
      const formulaDescription = formulaConfig?.description || rule.qty_formula;
      
      accessories.push({
        name: formatAccessoryName(rule.child_item_key),
        quantity,
        unitPrice,
        totalPrice,
        childItemKey: rule.child_item_key,
        formulaDescription,
      });
      
      accessoriesTotalPrice += totalPrice;
      
      // Build breakdown string for display
      if (unitPrice > 0) {
        breakdown.push(`${formatAccessoryName(rule.child_item_key)}: ${quantity} × ${unitPrice.toFixed(2)} = ${totalPrice.toFixed(2)}`);
      } else {
        breakdown.push(`${formatAccessoryName(rule.child_item_key)}: ${quantity} (included)`);
      }
    } catch (error) {
      console.error(`Error processing bundle rule for ${rule.child_item_key}:`, error);
    }
  });
  
  const grandTotalPrice = hardwareBasePrice + accessoriesTotalPrice;
  
  return {
    hardwareBasePrice,
    accessories,
    accessoriesTotalPrice,
    grandTotalPrice,
    breakdown,
  };
};

/**
 * Format accessory key to human-readable name
 */
const formatAccessoryName = (key: string): string => {
  return key
    .replace(/_/g, ' ')
    .replace(/\b\w/g, (c) => c.toUpperCase());
};

/**
 * Default accessory quantity formulas for common accessories
 * These are used when bundle_rules table doesn't have specific rules
 */
const DEFAULT_ACCESSORY_FORMULAS: Record<string, { formula: string; description: string }> = {
  // Tracks
  runner: { formula: 'CEIL(rail_width_cm / 10)', description: '1 per 10cm' },
  end_cap: { formula: '2', description: '2 per track' },
  ceiling_bracket: { formula: 'CEIL(rail_width_cm / 50)', description: '1 per 50cm' },
  wall_single_bracket: { formula: 'CEIL(rail_width_cm / 50)', description: '1 per 50cm' },
  wall_double_bracket: { formula: 'CEIL(rail_width_cm / 100)', description: '1 per 100cm' },
  jointer: { formula: 'CEIL(rail_width_cm / 240) - 1', description: '1 per join (tracks 240cm each)' },
  overlap: { formula: '0', description: 'Optional' },
  wand: { formula: '0', description: 'Optional' },
  magnet: { formula: '0', description: 'Optional' },
  // Rods
  finial: { formula: '2', description: '2 per rod' },
  ring: { formula: 'CEIL((rail_width_cm * fullness) / 10)', description: '1 per 10cm of fabric' },
  support_bracket: { formula: 'CEIL(rail_width_cm / 100)', description: '1 per 100cm' },
  wall_bracket: { formula: 'CEIL(rail_width_cm / 50)', description: '1 per 50cm (end supports)' },
};

/**
 * Calculate accessories from option value's extra_data.accessory_prices
 * This uses the accessory prices stored directly on the track/rod option
 */
export const calculateAccessoriesFromOptionData = (
  accessoryPrices: Record<string, number>,
  hardwareBasePrice: number,
  railWidthCm: number,
  fullness: number = 1,
  mountType: 'ceiling' | 'wall' | 'both' = 'wall',
  currencySymbol: string = '$'
): HardwareAccessoryResult => {
  const accessories: AccessoryItem[] = [];
  let accessoriesTotalPrice = 0;
  const breakdown: string[] = [];
  
  // Context for formula evaluation
  const context: Record<string, number> = {
    rail_width_cm: railWidthCm,
    rail_width: railWidthCm,
    width_cm: railWidthCm,
    fullness,
    fullness_ratio: fullness,
  };
  
  // Filter accessories based on mount type
  const skipAccessories: string[] = [];
  if (mountType === 'ceiling') {
    skipAccessories.push('wall_bracket', 'wall_single_bracket', 'wall_double_bracket');
  } else if (mountType === 'wall') {
    skipAccessories.push('ceiling_bracket');
  }
  // 'both' keeps all accessories
  
  // Process each accessory price
  Object.entries(accessoryPrices).forEach(([key, unitPrice]) => {
    // Skip accessories not applicable to mount type
    if (skipAccessories.includes(key)) return;
    
    // Get formula for this accessory type
    const formulaConfig = DEFAULT_ACCESSORY_FORMULAS[key];
    if (!formulaConfig) {
      console.log(`No formula for accessory: ${key}, using quantity 0`);
      return;
    }
    
    try {
      const quantity = Math.max(0, Math.ceil(evaluateQtyFormula(formulaConfig.formula, context)));
      if (quantity <= 0) return;
      
      const totalPrice = quantity * unitPrice;
      
      accessories.push({
        name: formatAccessoryName(key),
        quantity,
        unitPrice,
        totalPrice,
        childItemKey: key,
        formulaDescription: formulaConfig.description, // e.g., "1 per 10cm"
      });
      
      accessoriesTotalPrice += totalPrice;
      
      // Build breakdown string with formula description
      breakdown.push(`${formatAccessoryName(key)}: ${quantity} × ${currencySymbol}${unitPrice.toFixed(0)} = ${currencySymbol}${totalPrice.toFixed(0)} (${formulaConfig.description})`);
    } catch (error) {
      console.error(`Error calculating accessory ${key}:`, error);
    }
  });
  
  const grandTotalPrice = hardwareBasePrice + accessoriesTotalPrice;
  
  return {
    hardwareBasePrice,
    accessories,
    accessoriesTotalPrice,
    grandTotalPrice,
    breakdown,
  };
};

/**
 * Hook to fetch bundle rules and calculate hardware accessory pricing
 */
export const useHardwareAccessoryPricing = (
  hardwareItemId?: string,
  hardwareBasePrice: number = 0,
  railWidthCm: number = 0,
  fullness: number = 1
): {
  result: HardwareAccessoryResult | null;
  isLoading: boolean;
  error: Error | null;
} => {
  // Fetch bundle rules for this hardware item
  const { data: bundleRules = [], isLoading, error } = useBundleRules(hardwareItemId);
  
  const result = useMemo(() => {
    if (!hardwareItemId || bundleRules.length === 0 || railWidthCm <= 0) {
      return null;
    }
    
    return calculateHardwareAccessories(
      bundleRules,
      hardwareBasePrice,
      railWidthCm,
      fullness
    );
  }, [bundleRules, hardwareBasePrice, railWidthCm, fullness, hardwareItemId]);
  
  return {
    result,
    isLoading,
    error: error as Error | null,
  };
};

/**
 * Build breakdown items for cost display
 */
export const buildHardwareBreakdownItems = (
  hardwareName: string,
  result: HardwareAccessoryResult,
  imageUrl?: string
): Array<{
  id: string;
  name: string;
  description: string;
  quantity: number;
  unit_price: number;
  total_cost: number;
  category: string;
  image_url?: string;
  pricingDetails?: string;
}> => {
  const items = [];
  
  // Main hardware item
  items.push({
    id: 'hardware-main',
    name: hardwareName,
    description: `Base price`,
    quantity: 1,
    unit_price: result.hardwareBasePrice,
    total_cost: result.hardwareBasePrice,
    category: 'hardware',
    image_url: imageUrl,
  });
  
  // Accessories - now using 'hardware_accessory' category for proper indentation
  result.accessories.forEach((acc, idx) => {
    items.push({
      id: `hardware-acc-${idx}`,
      name: acc.name,
      description: '-',
      quantity: acc.quantity,
      unit_price: acc.unitPrice,
      total_cost: acc.totalPrice,
      category: 'hardware_accessory',
      pricingDetails: acc.formulaDescription, // e.g., "1 per 10cm"
    });
  });
  
  return items;
};

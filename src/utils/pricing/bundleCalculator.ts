// Bundle Calculator - Auto-calculates hardware accessories based on rules

export interface BundleRule {
  id: string;
  parentItemId?: string;
  parentItemKey?: string;
  childItemKey: string;
  childItemId?: string;
  childUnitPrice?: number;
  qtyFormula: string;
  condition?: Record<string, any>;
  orderIndex?: number;
}

export interface BundleContext {
  widthFt: number;
  heightFt: number;
  isDouble: boolean;
  mountType: 'ceiling' | 'wall';
  itemMetadata?: Record<string, any>;
}

export interface BundleLineItem {
  key: string;
  name: string;
  quantity: number;
  unitPrice: number;
  total: number;
  formula: string;
}

export interface BundleCalculationResult {
  parentItem: string;
  lineItems: BundleLineItem[];
  subtotal: number;
}

// Default bundle rules for tracks (when no DB rules exist)
export const DEFAULT_TRACK_BUNDLE_RULES: Omit<BundleRule, 'id'>[] = [
  {
    parentItemKey: 'track',
    childItemKey: 'runners',
    qtyFormula: 'widthFt * 6 * (isDouble ? 2 : 1)',
    orderIndex: 1,
  },
  {
    parentItemKey: 'track',
    childItemKey: 'end_caps',
    qtyFormula: '2',
    orderIndex: 2,
  },
  {
    parentItemKey: 'track',
    childItemKey: 'brackets',
    qtyFormula: 'Math.ceil(widthFt / 2)',
    condition: { mountType: 'ceiling' },
    orderIndex: 3,
  },
  {
    parentItemKey: 'track',
    childItemKey: 'brackets',
    qtyFormula: 'Math.ceil(widthFt / 2)',
    condition: { mountType: 'wall' },
    orderIndex: 3,
  },
  {
    parentItemKey: 'track',
    childItemKey: 'jointers',
    qtyFormula: 'Math.ceil(widthFt / 5)',
    orderIndex: 4,
  },
  {
    parentItemKey: 'track',
    childItemKey: 'overlap',
    qtyFormula: 'isDouble ? 1 : 0',
    orderIndex: 5,
  },
];

// Default bundle rules for rods
export const DEFAULT_ROD_BUNDLE_RULES: Omit<BundleRule, 'id'>[] = [
  {
    parentItemKey: 'rod',
    childItemKey: 'rings',
    qtyFormula: 'widthFt * 6 * (isDouble ? 2 : 1)',
    orderIndex: 1,
  },
  {
    parentItemKey: 'rod',
    childItemKey: 'finials',
    qtyFormula: '2',
    orderIndex: 2,
  },
  {
    parentItemKey: 'rod',
    childItemKey: 'brackets',
    qtyFormula: 'Math.ceil(widthFt / 2.5) * (isDouble ? 2 : 1)',
    orderIndex: 3,
  },
  {
    parentItemKey: 'rod',
    childItemKey: 'end_caps',
    qtyFormula: 'isDouble ? 4 : 2',
    orderIndex: 4,
  },
];

// Safely evaluate a formula with given context
export function evaluateFormula(formula: string, context: BundleContext): number {
  try {
    // Create a safe evaluation context
    const { widthFt, heightFt, isDouble, mountType } = context;
    
    // Replace variables in formula
    let evalFormula = formula
      .replace(/widthFt/g, String(widthFt))
      .replace(/heightFt/g, String(heightFt))
      .replace(/isDouble/g, String(isDouble))
      .replace(/mountType/g, `"${mountType}"`)
      .replace(/width_ft/g, String(widthFt))
      .replace(/height_ft/g, String(heightFt))
      .replace(/is_double/g, String(isDouble))
      .replace(/mount_type/g, `"${mountType}"`);
    
    // Allow only safe math operations
    const safePattern = /^[0-9+\-*/().?\s:Math.ceil\(\)Math.floor\(\)Math.round\(\)true false"ceiling""wall"]+$/;
    
    // Simplified evaluation for common patterns
    if (evalFormula.includes('Math.ceil')) {
      const match = evalFormula.match(/Math\.ceil\(([^)]+)\)/);
      if (match) {
        const inner = eval(match[1]);
        evalFormula = evalFormula.replace(match[0], String(Math.ceil(inner)));
      }
    }
    
    if (evalFormula.includes('Math.floor')) {
      const match = evalFormula.match(/Math\.floor\(([^)]+)\)/);
      if (match) {
        const inner = eval(match[1]);
        evalFormula = evalFormula.replace(match[0], String(Math.floor(inner)));
      }
    }
    
    // Evaluate the formula
    const result = eval(evalFormula);
    return typeof result === 'number' ? Math.max(0, Math.round(result)) : 0;
  } catch (error) {
    console.warn('Bundle formula evaluation failed:', formula, error);
    return 0;
  }
}

// Check if a rule's condition matches the context
export function matchesCondition(
  condition: Record<string, any> | undefined,
  context: BundleContext
): boolean {
  if (!condition || Object.keys(condition).length === 0) {
    return true;
  }
  
  for (const [key, value] of Object.entries(condition)) {
    switch (key) {
      case 'mountType':
      case 'mount_type':
        if (context.mountType !== value) return false;
        break;
      case 'isDouble':
      case 'is_double':
        if (context.isDouble !== value) return false;
        break;
      default:
        // Check in itemMetadata
        if (context.itemMetadata && context.itemMetadata[key] !== value) {
          return false;
        }
    }
  }
  
  return true;
}

// Get accessory price from item metadata
export function getAccessoryPrice(
  childKey: string,
  context: BundleContext
): number {
  const accessories = context.itemMetadata?.accessories;
  if (!accessories) return 0;
  
  // Map common child keys to metadata keys
  const keyMap: Record<string, string[]> = {
    runners: ['runner', 'runner_price'],
    end_caps: ['endCap', 'end_cap', 'end_cap_price'],
    brackets: [
      context.mountType === 'ceiling' ? 'ceilingBracket' : 
      context.isDouble ? 'wallDoubleBracket' : 'wallSingleBracket',
      'ceiling_bracket', 'wall_single_bracket', 'wall_double_bracket'
    ],
    jointers: ['jointer', 'jointer_price'],
    overlap: ['overlap', 'overlap_price'],
    rings: ['rings', 'ring_price'],
    finials: ['roundBallFinial', 'round_ball_finial', 'finial_price'],
    magnet: ['magnet', 'magnet_price'],
    wand: ['wand', 'wand_price'],
  };
  
  const possibleKeys = keyMap[childKey] || [childKey];
  
  for (const key of possibleKeys) {
    if (accessories[key] !== undefined) {
      return Number(accessories[key]) || 0;
    }
  }
  
  return 0;
}

// Format child key to display name
export function formatChildKeyName(key: string): string {
  return key
    .replace(/_/g, ' ')
    .replace(/([A-Z])/g, ' $1')
    .replace(/^\w/, c => c.toUpperCase())
    .trim();
}

// Calculate bundle for a hardware item
export function calculateBundle(
  rules: BundleRule[],
  context: BundleContext,
  overridePrices?: Record<string, number>
): BundleCalculationResult {
  const lineItems: BundleLineItem[] = [];
  
  // Sort rules by order index
  const sortedRules = [...rules].sort((a, b) => 
    (a.orderIndex || 0) - (b.orderIndex || 0)
  );
  
  for (const rule of sortedRules) {
    // Check condition
    if (!matchesCondition(rule.condition, context)) {
      continue;
    }
    
    // Calculate quantity
    const quantity = evaluateFormula(rule.qtyFormula, context);
    if (quantity <= 0) continue;
    
    // Get unit price
    const unitPrice = overridePrices?.[rule.childItemKey] 
      ?? rule.childUnitPrice 
      ?? getAccessoryPrice(rule.childItemKey, context);
    
    if (unitPrice <= 0) continue;
    
    lineItems.push({
      key: rule.childItemKey,
      name: formatChildKeyName(rule.childItemKey),
      quantity,
      unitPrice,
      total: quantity * unitPrice,
      formula: rule.qtyFormula,
    });
  }
  
  const subtotal = lineItems.reduce((sum, item) => sum + item.total, 0);
  
  return {
    parentItem: context.itemMetadata?.name || 'Hardware',
    lineItems,
    subtotal,
  };
}

// Calculate bundle using default rules for tracks
export function calculateTrackBundle(
  widthFt: number,
  isDouble: boolean,
  mountType: 'ceiling' | 'wall',
  trackMetadata?: Record<string, any>
): BundleCalculationResult {
  const context: BundleContext = {
    widthFt,
    heightFt: 0,
    isDouble,
    mountType,
    itemMetadata: trackMetadata,
  };
  
  const rules = DEFAULT_TRACK_BUNDLE_RULES.map((r, i) => ({
    ...r,
    id: `track-${i}`,
  }));
  
  return calculateBundle(rules, context);
}

// Calculate bundle using default rules for rods
export function calculateRodBundle(
  widthFt: number,
  isDouble: boolean,
  rodMetadata?: Record<string, any>
): BundleCalculationResult {
  const context: BundleContext = {
    widthFt,
    heightFt: 0,
    isDouble,
    mountType: 'wall', // Rods are typically wall-mounted
    itemMetadata: rodMetadata,
  };
  
  const rules = DEFAULT_ROD_BUNDLE_RULES.map((r, i) => ({
    ...r,
    id: `rod-${i}`,
  }));
  
  return calculateBundle(rules, context);
}

/**
 * Markup Resolution Utility
 * Resolves the correct markup percentage based on hierarchy:
 * Product → Grid → Subcategory → Category → Global
 */

import { MarkupSettings, defaultMarkupSettings } from '@/hooks/useMarkupSettings';

export interface MarkupContext {
  // Quote-level override (per-job custom markup - highest priority)
  quoteMarkupOverride?: number | null;
  // Product-level (from inventory item's markup_percentage)
  productMarkup?: number;
  // Implied markup (calculated from cost_price vs selling_price in library)
  // When fabric has both prices defined, implied = (selling - cost) / cost * 100
  impliedMarkup?: number;
  // Grid-level (from pricing_grids.markup_percentage)
  gridMarkup?: number;
  // Whether the product uses pricing_grid pricing method
  // When true, grid markup takes precedence even if 0 (meaning grid price includes margin)
  usesPricingGrid?: boolean;
  // Category/Subcategory
  category?: string;
  subcategory?: string;
  // Global settings
  markupSettings?: MarkupSettings;
}

export interface ResolvedMarkup {
  percentage: number;
  source: 'product' | 'grid' | 'subcategory' | 'category' | 'global' | 'minimum';
  sourceName: string;
}

/**
 * Resolves the markup percentage following hierarchy:
 * Product → Grid → Subcategory → Category → Global → Minimum
 */
export function resolveMarkup(context: MarkupContext): ResolvedMarkup {
  const settings = context.markupSettings || defaultMarkupSettings;

  // 0. Quote-level override (per-job custom markup - highest priority)
  if (context.quoteMarkupOverride != null) {
    return {
      percentage: context.quoteMarkupOverride,
      source: 'global',
      sourceName: 'Job Custom Markup'
    };
  }

  // 1. Check product-level markup (explicit markup_percentage on inventory item)
  if (context.productMarkup && context.productMarkup > 0) {
    return {
      percentage: context.productMarkup,
      source: 'product',
      sourceName: 'Product'
    };
  }
  
  // 2. Check implied markup (calculated from cost_price vs selling_price in library)
  // This prevents double-markup when fabric library has pre-defined retail pricing
  if (context.impliedMarkup && context.impliedMarkup > 0) {
    return {
      percentage: context.impliedMarkup,
      source: 'product',
      sourceName: 'Library Pricing (implied from cost vs selling)'
    };
  }
  
  // 3. Check grid-level markup
  // When usesPricingGrid is true, the grid markup takes precedence even if 0
  // (because grid price already includes the supplier's margin)
  if (context.gridMarkup != null && context.gridMarkup > 0) {
    return {
      percentage: context.gridMarkup,
      source: 'grid',
      sourceName: 'Pricing Grid'
    };
  }
  // If product uses pricing grid and gridMarkup is explicitly 0, respect that (no additional markup)
  if (context.usesPricingGrid && context.gridMarkup != null) {
    return {
      percentage: context.gridMarkup,
      source: 'grid',
      sourceName: 'Pricing Grid (price list)'
    };
  }
  
  // 3. Check subcategory markup (normalize key)
  if (context.subcategory) {
    const subKey = context.subcategory.toLowerCase().replace(/[\s-]/g, '_');
    const subMarkup = settings.category_markups?.[subKey];
    if (subMarkup && subMarkup > 0) {
      return {
        percentage: subMarkup,
        source: 'subcategory',
        sourceName: `Subcategory: ${context.subcategory}`
      };
    }
  }
  
  // 4. Check category markup
  if (context.category) {
    const catKey = context.category.toLowerCase().replace(/[\s-]/g, '_');
    
    // First try exact key match (e.g., 'curtain_making')
    const catMarkup = settings.category_markups?.[catKey];
    if (catMarkup !== undefined && catMarkup > 0) {
      return {
        percentage: catMarkup,
        source: 'category',
        sourceName: `Category: ${context.category}`
      };
    }
    
    // For manufacturing keys, fall back to parent category if specific markup not set
    // e.g., curtain_making → curtains if curtain_making is 0 or undefined
    if (catKey.endsWith('_making')) {
      // CRITICAL FIX: Handle plural variations correctly
      // roman_making → romans OR roman, roller_making → blinds, etc.
      const parentMappings: Record<string, string[]> = {
        'curtain_making': ['curtains', 'curtain'],
        'blind_making': ['blinds', 'blind'],
        'roman_making': ['romans', 'roman', 'blinds'], // Romans are a type of blind
        'roller_making': ['blinds', 'roller'],
        'shutter_making': ['shutters', 'shutter'],
        'venetian_making': ['blinds', 'venetian'],
      };
      
      const possibleParents = parentMappings[catKey] || [catKey.replace('_making', 's'), catKey.replace('_making', '')];
      
      for (const parentCategory of possibleParents) {
        const parentMarkup = settings.category_markups?.[parentCategory];
        if (parentMarkup !== undefined && parentMarkup > 0) {
          return {
            percentage: parentMarkup,
            source: 'category',
            sourceName: `Category: ${parentCategory} (manufacturing fallback)`
          };
        }
      }
    }
    
    // Try common category mappings
    const categoryMappings: Record<string, string[]> = {
      fabric: ['curtain', 'roman', 'drape', 'sheer'],
      blinds: ['roller', 'venetian', 'cellular', 'vertical', 'honeycomb'],
      shutters: ['shutter', 'plantation'],
      hardware: ['track', 'rod', 'pole', 'rail'],
      installation: ['install', 'fitting', 'service']
    };
    
    for (const [key, patterns] of Object.entries(categoryMappings)) {
      if (patterns.some(p => catKey.includes(p))) {
        const mappedMarkup = settings.category_markups?.[key];
        if (mappedMarkup && mappedMarkup > 0) {
          return {
            percentage: mappedMarkup,
            source: 'category',
            sourceName: `Category: ${key}`
          };
        }
      }
    }
  }
  
  // 5. Check material vs labor markup (including manufacturing/sewing)
  // CRITICAL FIX: Explicitly categorize fabric/curtain/blind as "material" categories
  if (context.category) {
    const catLower = context.category.toLowerCase();
    
    // Labor categories: installation, manufacturing, sewing
    const isLabor = ['installation', 'service', 'fitting', 'labor', 'labour', 
                     'manufacturing', 'sewing', 'stitching', 'making'].some(
      t => catLower.includes(t)
    );
    
    // Material categories: fabrics, curtains, blinds, hardware, drapes, etc.
    const isMaterial = ['fabric', 'curtain', 'blind', 'drape', 'roman', 'roller', 
                        'venetian', 'vertical', 'shutter', 'hardware', 'lining', 
                        'heading', 'track', 'rod', 'pole', 'sheer', 'cellular',
                        'honeycomb', 'awning', 'material'].some(t => catLower.includes(t));
    
    if (isLabor && settings.labor_markup_percentage > 0) {
      return {
        percentage: settings.labor_markup_percentage,
        source: 'category',
        sourceName: 'Labor'
      };
    }
    // CRITICAL: Use isMaterial explicitly rather than just !isLabor
    // This ensures fabric/curtain/blind categories get material markup
    if (isMaterial && settings.material_markup_percentage > 0) {
      return {
        percentage: settings.material_markup_percentage,
        source: 'category',
        sourceName: 'Material'
      };
    }
    // If neither, but we have material markup, default to material (most things are materials)
    if (!isLabor && settings.material_markup_percentage > 0) {
      return {
        percentage: settings.material_markup_percentage,
        source: 'category',
        sourceName: 'Material'
      };
    }
  }
  
  // 6. Use global default
  if (settings.default_markup_percentage > 0) {
    return {
      percentage: settings.default_markup_percentage,
      source: 'global',
      sourceName: 'Global Default'
    };
  }
  
  // 7. Fall back to minimum
  return {
    percentage: settings.minimum_markup_percentage || 0,
    source: 'minimum',
    sourceName: 'Minimum'
  };
}

/**
 * Apply markup to a cost price
 */
export function applyMarkup(costPrice: number, markupPercentage: number): number {
  if (costPrice <= 0) return costPrice;
  return costPrice * (1 + markupPercentage / 100);
}

/**
 * Calculate selling price from cost with resolved markup
 */
export function calculateSellingPrice(
  costPrice: number, 
  context: MarkupContext
): { sellingPrice: number; markup: ResolvedMarkup } {
  const markup = resolveMarkup(context);
  const sellingPrice = applyMarkup(costPrice, markup.percentage);
  return { sellingPrice, markup };
}

/**
 * Calculate gross profit margin percentage
 * GP% = (Selling - Cost) / Selling × 100
 */
export function calculateGrossMargin(costPrice: number, sellingPrice: number): number {
  if (sellingPrice <= 0) return 0;
  return ((sellingPrice - costPrice) / sellingPrice) * 100;
}

/** @deprecated Use ResolvedMarkup instead */
export type MarkupResult = ResolvedMarkup;

/**
 * Get profit status based on margin percentage
 */
export function getProfitStatus(marginPercentage: number): {
  status: 'loss' | 'low' | 'normal' | 'good';
  color: string;
  label: string;
} {
  if (marginPercentage < 0) {
    return { status: 'loss', color: 'text-destructive', label: 'Loss' };
  }
  if (marginPercentage < 20) {
    return { status: 'low', color: 'text-amber-500', label: 'Low' };
  }
  if (marginPercentage < 40) {
    return { status: 'normal', color: 'text-foreground', label: 'Normal' };
  }
  return { status: 'good', color: 'text-emerald-500', label: 'Good' };
}

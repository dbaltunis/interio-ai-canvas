/**
 * Markup Resolution Utility
 * Resolves the correct markup percentage based on hierarchy:
 * Product → Grid → Subcategory → Category → Global
 */

import { MarkupSettings, defaultMarkupSettings } from '@/hooks/useMarkupSettings';

export interface MarkupContext {
  // Product-level
  productMarkup?: number;
  // Grid-level (from pricing_grids.markup_percentage)
  gridMarkup?: number;
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
  
  // 1. Check product-level markup
  if (context.productMarkup && context.productMarkup > 0) {
    return {
      percentage: context.productMarkup,
      source: 'product',
      sourceName: 'Product'
    };
  }
  
  // 2. Check grid-level markup
  if (context.gridMarkup && context.gridMarkup > 0) {
    return {
      percentage: context.gridMarkup,
      source: 'grid',
      sourceName: 'Pricing Grid'
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
      const parentCategory = catKey.replace('_making', 's'); // curtain_making → curtains
      const parentMarkup = settings.category_markups?.[parentCategory];
      if (parentMarkup !== undefined && parentMarkup > 0) {
        return {
          percentage: parentMarkup,
          source: 'category',
          sourceName: `Category: ${parentCategory} (manufacturing fallback)`
        };
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
  if (context.category) {
    const isLabor = ['installation', 'service', 'fitting', 'labor', 'labour', 'manufacturing', 'sewing', 'stitching', 'making'].some(
      t => context.category!.toLowerCase().includes(t)
    );
    if (isLabor && settings.labor_markup_percentage > 0) {
      return {
        percentage: settings.labor_markup_percentage,
        source: 'category',
        sourceName: 'Labor'
      };
    }
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
  if (costPrice <= 0 || markupPercentage < 0) return costPrice;
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

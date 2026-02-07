/**
 * Template Enricher
 * Enriches templates with pricing grid data based on routing rules
 */

import { resolveGridForProduct } from './gridResolver';

/**
 * Check if pricing grid data is valid and contains actual pricing information
 */
const hasValidPricingGridData = (gridData: any): boolean => {
  if (!gridData || typeof gridData !== 'object') return false;

  // Check for standard format
  if (gridData.widthColumns && Array.isArray(gridData.widthColumns) && gridData.widthColumns.length > 0) {
    return true;
  }
  // Check for legacy formats
  if (gridData.widths && Array.isArray(gridData.widths) && gridData.widths.length > 0) {
    return true;
  }
  if (gridData.dropRanges && Array.isArray(gridData.dropRanges) && gridData.dropRanges.length > 0) {
    return true;
  }
  if (gridData.prices && Array.isArray(gridData.prices) && gridData.prices.length > 0) {
    return true;
  }

  return false;
};

/**
 * Enriches a single template with pricing grid data if applicable
 */
export const enrichTemplateWithGrid = async (
  template: any,
  fabricItem?: any
): Promise<any> => {
  // Skip if not a pricing_grid type
  if (template?.pricing_type !== 'pricing_grid') {
    return template;
  }

  // Skip if template already has valid pricing grid data
  if (hasValidPricingGridData(template?.pricing_grid_data)) {
    return template;
  }

  // Need system_type and price_group to resolve grid
  const systemType = template.system_type || fabricItem?.system_type;
  const priceGroup = template.price_group || fabricItem?.price_group;
  
  if (!systemType || !priceGroup) {
    console.warn('Cannot resolve pricing grid: missing system_type or price_group', {
      templateName: template.name,
      systemType,
      priceGroup
    });
    return template;
  }

  try {
    const gridResult = await resolveGridForProduct({
      productType: template.treatment_category || template.curtain_type,
      systemType,
      fabricPriceGroup: priceGroup,
      userId: template.user_id
    });

    if (gridResult) {
      console.log('✅ Enriched template with pricing grid:', {
        template: template.name,
        grid: gridResult.gridName,
        gridCode: gridResult.gridCode
      });

      return {
        ...template,
        pricing_grid_data: gridResult.gridData,
        resolved_grid_id: gridResult.gridId,
        resolved_grid_code: gridResult.gridCode,
        resolved_grid_name: gridResult.gridName
      };
    }
  } catch (error) {
    console.warn('Failed to enrich template with pricing grid:', error);
  }

  return template;
};

/**
 * Enriches multiple templates with pricing grid data
 */
export const enrichTemplatesWithGrids = async (
  templates: any[],
  fabricItem?: any
): Promise<any[]> => {
  const enrichedTemplates = await Promise.all(
    templates.map(template => enrichTemplateWithGrid(template, fabricItem))
  );
  
  return enrichedTemplates;
};

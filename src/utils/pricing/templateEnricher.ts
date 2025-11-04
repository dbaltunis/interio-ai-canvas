/**
 * Template Enricher
 * Enriches templates with pricing grid data based on routing rules
 */

import { resolveGridForProduct } from './gridResolver';

/**
 * Enriches a single template with pricing grid data if applicable
 */
export const enrichTemplateWithGrid = async (
  template: any,
  fabricItem?: any
): Promise<any> => {
  // Only enrich if pricing_type is 'pricing_grid' and no grid data exists
  if (template?.pricing_type !== 'pricing_grid' || template?.pricing_grid_data) {
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

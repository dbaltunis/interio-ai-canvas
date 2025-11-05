/**
 * Fabric Enrichment Hook
 * Enriches fabric items with pricing grid data based on product configuration
 */

import { useState, useEffect } from 'react';
import { resolveGridForProduct } from '@/utils/pricing/gridResolver';

export interface FabricEnrichmentParams {
  fabricItem: any;
  formData: any;
}

/**
 * Enriches a fabric item with pricing grid data if applicable
 * Returns the enriched fabric item with grid data attached
 */
export const useFabricEnrichment = ({ fabricItem, formData }: FabricEnrichmentParams) => {
  const [enrichedFabric, setEnrichedFabric] = useState(fabricItem);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const enrichFabric = async () => {
      if (!fabricItem) {
        setEnrichedFabric(null);
        return;
      }

      // If fabric already has grid data, use it as-is
      if (fabricItem.pricing_grid_data) {
        setEnrichedFabric(fabricItem);
        return;
      }

      // Check if fabric has grid routing info
      const hasPriceGroup = fabricItem.price_group;
      const hasProductCategory = fabricItem.product_category;
      const hasSystemType = formData?.system_type;

      if (!hasPriceGroup || !hasProductCategory || !hasSystemType) {
        // No grid info, use fabric as-is
        setEnrichedFabric(fabricItem);
        return;
      }

      // Resolve pricing grid
      setIsLoading(true);
      try {
        const gridResult = await resolveGridForProduct({
          productType: fabricItem.product_category,
          systemType: formData.system_type,
          fabricPriceGroup: fabricItem.price_group,
          userId: fabricItem.user_id
        });

        if (gridResult) {
          console.log('✅ Enriched fabric with pricing grid:', {
            fabric: fabricItem.name,
            grid: gridResult.gridName,
            gridCode: gridResult.gridCode,
            priceGroup: fabricItem.price_group,
            productCategory: fabricItem.product_category
          });

          setEnrichedFabric({
            ...fabricItem,
            pricing_grid_data: gridResult.gridData,
            resolved_grid_id: gridResult.gridId,
            resolved_grid_code: gridResult.gridCode,
            resolved_grid_name: gridResult.gridName
          });
        } else {
          console.log('ℹ️ No pricing grid found for fabric:', {
            fabric: fabricItem.name,
            priceGroup: fabricItem.price_group,
            productCategory: fabricItem.product_category,
            systemType: formData.system_type
          });
          setEnrichedFabric(fabricItem);
        }
      } catch (error) {
        console.warn('Failed to enrich fabric with pricing grid:', error);
        setEnrichedFabric(fabricItem);
      } finally {
        setIsLoading(false);
      }
    };

    enrichFabric();
  }, [fabricItem, formData?.system_type]);

  return {
    enrichedFabric,
    isLoading,
    hasGrid: !!(enrichedFabric?.pricing_grid_data)
  };
};

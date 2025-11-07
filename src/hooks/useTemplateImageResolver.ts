import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

interface TemplateImageResolverProps {
  templateId?: string;
  treatmentCategory?: string;
  templateImageUrl?: string;
  displayImageUrl?: string;
}

/**
 * Comprehensive image resolver that pulls from multiple sources:
 * 1. Template display_image_url
 * 2. Template image_url
 * 3. First active inventory item image for this category
 * 4. Fallback placeholder
 */
export const useTemplateImageResolver = ({
  templateId,
  treatmentCategory,
  templateImageUrl,
  displayImageUrl
}: TemplateImageResolverProps) => {
  
  const { data: inventoryImage } = useQuery({
    queryKey: ['inventory-category-image', treatmentCategory],
    queryFn: async () => {
      if (!treatmentCategory) return null;
      
      // Map treatment categories to inventory subcategories
      const subcategoryMap: Record<string, string[]> = {
        'wallpaper': ['wallcovering'],
        'curtains': ['curtain_fabric', 'sheer_fabric', 'lining'],
        'roller_blinds': ['roller_blind_fabric', 'blind_fabric'],
        'roman_blinds': ['roman_blind_fabric', 'blind_fabric'],
        'venetian_blinds': ['venetian_blind', 'blind_material'],
        'vertical_blinds': ['vertical_blind_fabric', 'blind_fabric'],
        'cellular_blinds': ['cellular_blind_fabric', 'blind_fabric'],
        'shutters': ['shutter_material'],
        'plantation_shutters': ['shutter_material']
      };
      
      const subcategories = subcategoryMap[treatmentCategory] || [];
      
      if (subcategories.length === 0) return null;
      
      // Try to get first inventory item with image for this category
      const { data, error } = await supabase
        .from('enhanced_inventory_items')
        .select('image_url')
        .in('subcategory', subcategories)
        .eq('active', true)
        .not('image_url', 'is', null)
        .limit(1)
        .maybeSingle();
      
      if (error) {
        console.warn('Error fetching inventory image:', error);
        return null;
      }
      
      return data?.image_url || null;
    },
    enabled: !displayImageUrl && !templateImageUrl && !!treatmentCategory,
    staleTime: 5 * 60 * 1000, // Cache for 5 minutes
  });
  
  // Priority order for image resolution
  const resolvedImage = displayImageUrl || templateImageUrl || inventoryImage;
  
  return {
    imageUrl: resolvedImage,
    hasImage: !!resolvedImage,
    source: displayImageUrl 
      ? 'display' 
      : templateImageUrl 
      ? 'template' 
      : inventoryImage 
      ? 'inventory' 
      : 'none'
  };
};

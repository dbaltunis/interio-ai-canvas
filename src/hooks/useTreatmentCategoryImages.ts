import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export type TreatmentCategory = 
  | 'curtains' 
  | 'roller_blinds' 
  | 'roman_blinds' 
  | 'venetian_blinds' 
  | 'vertical_blinds' 
  | 'cellular_shades' 
  | 'cellular_blinds'
  | 'plantation_shutters' 
  | 'shutters' 
  | 'panel_glide' 
  | 'awning';

interface CategoryImage {
  category: TreatmentCategory;
  image_url?: string;
}

/**
 * Hook to get the category-level default image for a treatment type
 * Returns the first treatment_template image_url for that category
 */
export const useTreatmentCategoryImage = (category?: TreatmentCategory) => {
  return useQuery({
    queryKey: ['treatment-category-image', category],
    queryFn: async () => {
      if (!category) return null;
      
      const { data, error } = await supabase
        .from('treatment_templates')
        .select('image_url')
        .eq('category', mapCategoryToTemplateCategory(category))
        .not('image_url', 'is', null)
        .limit(1)
        .maybeSingle();
      
      if (error) throw error;
      return data?.image_url || null;
    },
    enabled: !!category,
  });
};

/**
 * Hook to update the category default image
 * Updates the first treatment_template for that category
 */
export const useUpdateCategoryImage = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ category, imageUrl }: { category: TreatmentCategory; imageUrl: string }) => {
      // Get the first template for this category
      const { data: template, error: fetchError } = await supabase
        .from('treatment_templates')
        .select('id')
        .eq('category', mapCategoryToTemplateCategory(category))
        .limit(1)
        .maybeSingle();
      
      if (fetchError) throw fetchError;
      
      if (!template) {
        throw new Error(`No template found for category: ${category}`);
      }
      
      // Update its image_url
      const { data, error } = await supabase
        .from('treatment_templates')
        .update({ image_url: imageUrl })
        .eq('id', template.id)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['treatment-category-image', variables.category] });
      toast.success('Category image updated successfully');
    },
    onError: (error) => {
      toast.error('Failed to update category image: ' + error.message);
    },
  });
};

/**
 * Maps specific treatment categories to the treatment_templates.category enum
 */
function mapCategoryToTemplateCategory(category: TreatmentCategory): 'blinds' | 'curtains' | 'shutters' | 'shades' | 'awnings' | 'other' {
  if (category === 'curtains') return 'curtains';
  if (category === 'roller_blinds' || category === 'roman_blinds' || category === 'venetian_blinds' || category === 'vertical_blinds' || category === 'cellular_blinds') return 'blinds';
  if (category === 'shutters' || category === 'plantation_shutters') return 'shutters';
  if (category === 'cellular_shades') return 'shades';
  if (category === 'awning') return 'awnings';
  return 'other';
}

/**
 * Hook to get display image for a template
 * Priority: template.display_image_url > template.image_url > category default image
 */
export const useTemplateDisplayImage = (template?: { 
  display_image_url?: string; 
  image_url?: string; 
  treatment_category?: TreatmentCategory;
}) => {
  const { data: categoryImage } = useTreatmentCategoryImage(template?.treatment_category);
  
  return template?.display_image_url || template?.image_url || categoryImage || null;
};

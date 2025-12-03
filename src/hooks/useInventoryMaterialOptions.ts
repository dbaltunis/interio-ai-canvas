import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface MaterialOption {
  code: string;
  label: string;
}

export interface InventoryMaterialOptions {
  slatWidths: MaterialOption[];
  vaneWidths: MaterialOption[];
  venetianMaterials: MaterialOption[];
  verticalMaterials: MaterialOption[];
}

/**
 * Fetches dynamic material options for inventory items from treatment_options table
 * These are used in the inventory dialog for venetian/vertical blind materials
 */
export const useInventoryMaterialOptions = () => {
  return useQuery({
    queryKey: ['inventory-material-options'],
    queryFn: async (): Promise<InventoryMaterialOptions> => {
      // Get current user's account_id for data isolation
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        return { slatWidths: [], vaneWidths: [], venetianMaterials: [], verticalMaterials: [] };
      }

      const { data: profile } = await supabase
        .from('user_profiles')
        .select('user_id, parent_account_id')
        .eq('user_id', user.id)
        .single();

      const accountId = profile?.parent_account_id || user.id;

      // Fetch all relevant treatment options with their values
      const { data: options, error } = await supabase
        .from('treatment_options')
        .select(`
          id,
          key,
          label,
          treatment_category,
          option_values (
            id,
            code,
            label,
            order_index
          )
        `)
        .eq('account_id', accountId)
        .in('key', ['slat_size', 'slat_width', 'vane_width', 'louvre_width', 'material'])
        .in('treatment_category', ['venetian_blinds', 'vertical_blinds'])
        .eq('visible', true);

      if (error) {
        console.error('Error fetching material options:', error);
        throw error;
      }

      // Parse and deduplicate the options
      const slatWidths: MaterialOption[] = [];
      const vaneWidths: MaterialOption[] = [];
      const venetianMaterials: MaterialOption[] = [];
      const verticalMaterials: MaterialOption[] = [];

      const seenSlats = new Set<string>();
      const seenVanes = new Set<string>();
      const seenVenetianMaterials = new Set<string>();
      const seenVerticalMaterials = new Set<string>();

      for (const option of options || []) {
        const values = option.option_values || [];
        
        if (option.treatment_category === 'venetian_blinds') {
          if (option.key === 'slat_size' || option.key === 'slat_width') {
            for (const val of values) {
              if (!seenSlats.has(val.code)) {
                seenSlats.add(val.code);
                slatWidths.push({ code: val.code, label: val.label });
              }
            }
          } else if (option.key === 'material') {
            for (const val of values) {
              if (!seenVenetianMaterials.has(val.code)) {
                seenVenetianMaterials.add(val.code);
                venetianMaterials.push({ code: val.code, label: val.label });
              }
            }
          }
        } else if (option.treatment_category === 'vertical_blinds') {
          if (option.key === 'vane_width' || option.key === 'louvre_width' || option.key === 'slat_width') {
            for (const val of values) {
              if (!seenVanes.has(val.code)) {
                seenVanes.add(val.code);
                vaneWidths.push({ code: val.code, label: val.label });
              }
            }
          } else if (option.key === 'material') {
            for (const val of values) {
              if (!seenVerticalMaterials.has(val.code)) {
                seenVerticalMaterials.add(val.code);
                verticalMaterials.push({ code: val.code, label: val.label });
              }
            }
          }
        }
      }

      // Sort by extracting numeric values from codes
      const sortByNumeric = (a: MaterialOption, b: MaterialOption) => {
        const numA = parseInt(a.code) || 0;
        const numB = parseInt(b.code) || 0;
        return numA - numB;
      };

      slatWidths.sort(sortByNumeric);
      vaneWidths.sort(sortByNumeric);

      // Add fallback defaults if database is empty
      if (slatWidths.length === 0) {
        slatWidths.push(
          { code: '25', label: '25mm (1")' },
          { code: '50', label: '50mm (2")' },
          { code: '63', label: '63mm (2.5")' }
        );
      }

      if (vaneWidths.length === 0) {
        vaneWidths.push(
          { code: '89', label: '89mm (3.5")' },
          { code: '127', label: '127mm (5")' }
        );
      }

      if (venetianMaterials.length === 0) {
        venetianMaterials.push(
          { code: 'aluminum', label: 'Aluminum' },
          { code: 'wood', label: 'Wood' },
          { code: 'faux_wood', label: 'Faux Wood' }
        );
      }

      if (verticalMaterials.length === 0) {
        verticalMaterials.push(
          { code: 'fabric', label: 'Fabric' },
          { code: 'pvc', label: 'PVC' }
        );
      }

      return {
        slatWidths,
        vaneWidths,
        venetianMaterials,
        verticalMaterials
      };
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

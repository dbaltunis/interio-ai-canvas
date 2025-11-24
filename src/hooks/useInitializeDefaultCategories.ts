import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

// Industry-standard category structure based on treatment types and pricing methods
const DEFAULT_CATEGORY_STRUCTURE = [
  {
    name: 'Fabrics',
    description: 'Soft window covering fabrics for various treatment types',
    category_type: 'fabric',
    sort_order: 1,
    subcategories: [
      { name: 'Curtain & Roman Fabrics', description: 'Linear meter/width pricing', sort_order: 1 },
      { name: 'Roller - Blockout', description: 'Roller blind blockout fabrics (grid pricing)', sort_order: 2 },
      { name: 'Roller - Light Filtering', description: 'Roller blind light filtering fabrics (grid pricing)', sort_order: 3 },
      { name: 'Roller - Sunscreen', description: 'Roller blind sunscreen fabrics (grid pricing)', sort_order: 4 },
      { name: 'Roller - Translucent', description: 'Roller blind translucent fabrics (grid pricing)', sort_order: 5 },
      { name: 'Cellular/Honeycomb', description: 'Cellular shade fabrics (grid pricing)', sort_order: 6 },
      { name: 'Vertical Blind Fabrics', description: 'Vertical blind fabric vanes (grid pricing)', sort_order: 7 },
      { name: 'Panel Glide Fabrics', description: 'Panel track system fabrics (grid pricing)', sort_order: 8 },
      { name: 'Sheer & Voile', description: 'Sheer curtain fabrics (linear pricing)', sort_order: 9 },
      { name: 'Lining Fabrics', description: 'Curtain lining materials (linear pricing)', sort_order: 10 },
    ]
  },
  {
    name: 'Hard Coverings',
    description: 'Hard window covering materials and slats',
    category_type: 'hard_material',
    sort_order: 2,
    subcategories: [
      { name: 'Venetian - 25mm Aluminium', description: '25mm aluminium venetian slats (grid pricing)', sort_order: 1 },
      { name: 'Venetian - 50mm Aluminium', description: '50mm aluminium venetian slats (grid pricing)', sort_order: 2 },
      { name: 'Venetian - 50mm Wood', description: '50mm timber venetian slats (grid pricing)', sort_order: 3 },
      { name: 'Vertical - 89mm Vanes', description: '89mm vertical blind vanes (grid pricing)', sort_order: 4 },
      { name: 'Vertical - 127mm Vanes', description: '127mm vertical blind vanes (grid pricing)', sort_order: 5 },
      { name: 'Shutters - Timber', description: 'Timber plantation shutters (grid pricing)', sort_order: 6 },
      { name: 'Shutters - PVC', description: 'PVC plantation shutters (grid pricing)', sort_order: 7 },
      { name: 'Shutters - Aluminium', description: 'Aluminium shutters (grid pricing)', sort_order: 8 },
    ]
  },
  {
    name: 'Hardware',
    description: 'Tracks, rods, brackets, and accessories',
    category_type: 'hardware',
    sort_order: 3,
    subcategories: [
      { name: 'Tracks & Rails', description: 'Curtain tracks and blind rails', sort_order: 1 },
      { name: 'Rods & Poles', description: 'Curtain rods and decorative poles', sort_order: 2 },
      { name: 'Brackets & Accessories', description: 'Mounting brackets and hardware', sort_order: 3 },
      { name: 'Motors & Controls', description: 'Motorization and smart controls', sort_order: 4 },
    ]
  },
  {
    name: 'Wallcoverings',
    description: 'Wallpaper and wall covering materials',
    category_type: 'wallcovering',
    sort_order: 4,
    subcategories: [
      { name: 'Vinyl Wallcoverings', description: 'Vinyl-based wallpapers', sort_order: 1 },
      { name: 'Fabric Wallcoverings', description: 'Textile wallcoverings', sort_order: 2 },
      { name: 'Grasscloth & Natural', description: 'Natural fiber wallcoverings', sort_order: 3 },
    ]
  }
];

export const useInitializeDefaultCategories = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  
  return useMutation({
    mutationFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const createdCategories = [];
      
      // Create each parent category with its subcategories
      for (const category of DEFAULT_CATEGORY_STRUCTURE) {
        const { name, description, category_type, sort_order, subcategories } = category;
        
        // Create parent category
        const { data: parentCategory, error: parentError } = await supabase
          .from('inventory_categories')
          .insert({
            user_id: user.id,
            name,
            description,
            category_type,
            sort_order,
            parent_id: null,
          })
          .select()
          .single();
        
        if (parentError) throw parentError;
        createdCategories.push(parentCategory);
        
        // Create subcategories
        for (const subcategory of subcategories) {
          const { data: childCategory, error: childError } = await supabase
            .from('inventory_categories')
            .insert({
              user_id: user.id,
              name: subcategory.name,
              description: subcategory.description,
              category_type,
              sort_order: subcategory.sort_order,
              parent_id: parentCategory.id,
            })
            .select()
            .single();
          
          if (childError) throw childError;
          createdCategories.push(childCategory);
        }
      }
      
      return createdCategories;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['inventory-categories'] });
      toast({
        title: "Categories initialized successfully",
        description: `Created ${DEFAULT_CATEGORY_STRUCTURE.length} main categories with subcategories. You can now start uploading products!`,
      });
    },
    onError: (error) => {
      toast({
        title: "Failed to initialize categories",
        description: error.message,
        variant: "destructive",
      });
    },
  });
};

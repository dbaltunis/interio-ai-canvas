import { useMutation } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface RollerBlindOptionCategory {
  name: string;
  description: string;
  category_type: string;
  is_required: boolean;
  sort_order: number;
  subcategories: {
    name: string;
    description?: string;
    pricing_method: string;
    base_price: number;
    sort_order: number;
  }[];
}

const rollerBlindOptions: RollerBlindOptionCategory[] = [
  {
    name: "Treatment Configuration",
    description: "Single or double roller configuration",
    category_type: "roller_blind",
    is_required: true,
    sort_order: 1,
    subcategories: [
      { name: "Single", description: "Single roller blind", pricing_method: "fixed", base_price: 0, sort_order: 1 },
      { name: "Double", description: "Double roller blind configuration", pricing_method: "fixed", base_price: 150, sort_order: 2 }
    ]
  },
  {
    name: "Operation System",
    description: "Manual or motorized operation",
    category_type: "roller_blind",
    is_required: true,
    sort_order: 2,
    subcategories: [
      { name: "Manual", description: "Manual chain operation", pricing_method: "fixed", base_price: 0, sort_order: 1 },
      { name: "Battery Motorised", description: "Battery powered motor", pricing_method: "fixed", base_price: 250, sort_order: 2 },
      { name: "Wired Motorised", description: "Hardwired motor system", pricing_method: "fixed", base_price: 320, sort_order: 3 }
    ]
  },
  {
    name: "Roll Direction",
    description: "Fabric roll direction preference",
    category_type: "roller_blind",
    is_required: true,
    sort_order: 3,
    subcategories: [
      { name: "Back Roll (Normal)", description: "Fabric rolls at the back", pricing_method: "fixed", base_price: 0, sort_order: 1 },
      { name: "Front Roll (Reverse)", description: "Fabric rolls at the front", pricing_method: "fixed", base_price: 0, sort_order: 2 }
    ]
  },
  {
    name: "Fascia Box",
    description: "Optional decorative cover",
    category_type: "roller_blind",
    is_required: false,
    sort_order: 4,
    subcategories: [
      { name: "No Fascia", description: "Standard roller without fascia", pricing_method: "fixed", base_price: 0, sort_order: 1 },
      { name: "White Fascia", description: "White powder coat finish", pricing_method: "fixed", base_price: 45, sort_order: 2 },
      { name: "Anodised Fascia", description: "Natural anodised finish", pricing_method: "fixed", base_price: 55, sort_order: 3 },
      { name: "Black Fascia", description: "Black powder coat finish", pricing_method: "fixed", base_price: 45, sort_order: 4 }
    ]
  },
  {
    name: "Chain Side",
    description: "Chain control position",
    category_type: "roller_blind",
    is_required: true,
    sort_order: 5,
    subcategories: [
      { name: "Left", description: "Chain on left side", pricing_method: "fixed", base_price: 0, sort_order: 1 },
      { name: "Right", description: "Chain on right side", pricing_method: "fixed", base_price: 0, sort_order: 2 }
    ]
  },
  {
    name: "Chain Material",
    description: "Chain construction material",
    category_type: "roller_blind",
    is_required: true,
    sort_order: 6,
    subcategories: [
      { name: "Plastic", description: "Standard plastic chain", pricing_method: "fixed", base_price: 0, sort_order: 1 },
      { name: "Metal", description: "Metal ball chain", pricing_method: "fixed", base_price: 15, sort_order: 2 },
      { name: "Stainless Steel", description: "Premium stainless steel", pricing_method: "fixed", base_price: 35, sort_order: 3 }
    ]
  },
  {
    name: "Chain Colour",
    description: "Chain color selection",
    category_type: "roller_blind",
    is_required: true,
    sort_order: 7,
    subcategories: [
      { name: "White", description: "White chain", pricing_method: "fixed", base_price: 0, sort_order: 1 },
      { name: "Black", description: "Black chain", pricing_method: "fixed", base_price: 0, sort_order: 2 },
      { name: "Grey", description: "Grey chain", pricing_method: "fixed", base_price: 0, sort_order: 3 }
    ]
  },
  {
    name: "Chain Length",
    description: "Chain length in millimeters",
    category_type: "roller_blind",
    is_required: true,
    sort_order: 8,
    subcategories: [
      { name: "500mm", pricing_method: "fixed", base_price: 0, sort_order: 1 },
      { name: "750mm", pricing_method: "fixed", base_price: 0, sort_order: 2 },
      { name: "1000mm", pricing_method: "fixed", base_price: 0, sort_order: 3 },
      { name: "1250mm", pricing_method: "fixed", base_price: 5, sort_order: 4 },
      { name: "1500mm", pricing_method: "fixed", base_price: 8, sort_order: 5 },
      { name: "1750mm", pricing_method: "fixed", base_price: 12, sort_order: 6 },
      { name: "2000mm", pricing_method: "fixed", base_price: 15, sort_order: 7 },
      { name: "2500mm", pricing_method: "fixed", base_price: 20, sort_order: 8 },
      { name: "3000mm", pricing_method: "fixed", base_price: 25, sort_order: 9 }
    ]
  },
  {
    name: "Chain Tidy",
    description: "Chain control organization",
    category_type: "roller_blind",
    is_required: false,
    sort_order: 9,
    subcategories: [
      { name: "Free Hanging", description: "Standard hanging chain", pricing_method: "fixed", base_price: 0, sort_order: 1 },
      { name: "Wall Mounted", description: "Wall mounted chain tidy", pricing_method: "fixed", base_price: 25, sort_order: 2 }
    ]
  },
  {
    name: "Component Colour",
    description: "Roller mechanism color",
    category_type: "roller_blind",
    is_required: true,
    sort_order: 10,
    subcategories: [
      { name: "White", description: "White components", pricing_method: "fixed", base_price: 0, sort_order: 1 },
      { name: "Black", description: "Black components", pricing_method: "fixed", base_price: 0, sort_order: 2 }
    ]
  },
  {
    name: "Bottom Rail Style",
    description: "Bottom rail profile style",
    category_type: "roller_blind",
    is_required: true,
    sort_order: 11,
    subcategories: [
      { name: "Flat", description: "Flat profile bottom rail", pricing_method: "fixed", base_price: 0, sort_order: 1 },
      { name: "Round", description: "Round profile bottom rail", pricing_method: "fixed", base_price: 15, sort_order: 2 },
      { name: "Elliptical", description: "Elliptical profile bottom rail", pricing_method: "fixed", base_price: 20, sort_order: 3 },
      { name: "Fabric Wrap", description: "Fabric wrapped bottom rail", pricing_method: "fixed", base_price: 35, sort_order: 4 }
    ]
  },
  {
    name: "Bottom Rail Colour",
    description: "Bottom rail finish color",
    category_type: "roller_blind",
    is_required: true,
    sort_order: 12,
    subcategories: [
      { name: "White", description: "White powder coat", pricing_method: "fixed", base_price: 0, sort_order: 1 },
      { name: "Ivory", description: "Ivory powder coat", pricing_method: "fixed", base_price: 0, sort_order: 2 },
      { name: "Silver Pearl", description: "Silver pearl finish", pricing_method: "fixed", base_price: 5, sort_order: 3 },
      { name: "Anodised", description: "Natural anodised finish", pricing_method: "fixed", base_price: 8, sort_order: 4 },
      { name: "Anthracite", description: "Anthracite powder coat", pricing_method: "fixed", base_price: 5, sort_order: 5 },
      { name: "Black", description: "Black powder coat", pricing_method: "fixed", base_price: 0, sort_order: 6 }
    ]
  }
];

export const useCreateRollerBlindOptions = () => {
  return useMutation({
    mutationFn: async () => {
      const user = await supabase.auth.getUser();
      if (!user.data.user) throw new Error("User not authenticated");

      const userId = user.data.user.id;
      
      for (const category of rollerBlindOptions) {
        // Create the main category
        const { data: categoryData, error: categoryError } = await supabase
          .from('option_categories')
          .insert([{
            name: category.name,
            description: category.description,
            category_type: category.category_type,
            is_required: category.is_required,
            sort_order: category.sort_order,
            user_id: userId,
            active: true
          }])
          .select()
          .single();

        if (categoryError) {
          console.error('Error creating category:', categoryError);
          throw categoryError;
        }

        // Create subcategories
        for (const subcategory of category.subcategories) {
          const { error: subcategoryError } = await supabase
            .from('option_subcategories')
            .insert([{
              category_id: categoryData.id,
              name: subcategory.name,
              description: subcategory.description,
              pricing_method: subcategory.pricing_method,
              base_price: subcategory.base_price,
              sort_order: subcategory.sort_order,
              active: true
            }]);

          if (subcategoryError) {
            console.error('Error creating subcategory:', subcategoryError);
            throw subcategoryError;
          }
        }
      }
    },
    onSuccess: () => {
      toast.success("Roller blind options created successfully!");
    },
    onError: (error) => {
      console.error('Error creating roller blind options:', error);
      toast.error("Failed to create roller blind options");
    }
  });
};